"""
Connector Resolution Chain Service (M39)
Ordered connector execution for each intent, smart defaults, fallback chain (C6).
"""

import logging
from typing import Any, Dict, List, Optional

from app.services.connectors import google_cal, hubspot, webhook, whatsapp
from app.services.intent import slot_manager
from app.services.supabase_client import supabase

logger = logging.getLogger(__name__)

DEFAULT_CHAIN_PRIORITY: Dict[str, List[str]] = {
    "book_appointment": ["google_calendar", "supabase", "hubspot", "webhook"],
    "request_refund": ["hubspot", "supabase", "webhook"],
    "check_status": ["supabase", "hubspot", "webhook"],
    "get_invoice": ["supabase", "hubspot", "webhook"],
    "cancel_service": ["hubspot", "supabase", "webhook"],
    "lead_qualification": ["hubspot", "supabase", "webhook"],
    "speak_to_human": ["human_handoff"],
    "complaint": ["hubspot", "webhook"],
}

DEFAULT_SLOT_MAPPINGS: Dict[str, Dict[str, Any]] = {
    "google_calendar:book_appointment": {
        "summary": "{purpose|default:Appointment}",
        "start": "{date}T{time}:00",
        "duration_minutes": "{duration|default:30}",
    },
    "hubspot:book_appointment": {
        "type": "MEETING",
        "timestamp": "{date}T{time}:00Z",
        "title": "{purpose|default:Call Appointment}",
    },
    "supabase:book_appointment": {
        "table": "appointments",
        "data": {
            "contact_id": "{contact.id}",
            "scheduled_at": "{date}T{time}:00",
            "purpose": "{purpose}",
            "agent_id": "{agent.id}",
            "status": "confirmed",
        },
    },
}


async def resolve(
    intent_state: Dict[str, Any],
    filled_slots: Dict[str, Any],
    agent_config: Dict[str, Any],
    configured_connectors: List[str],
    contact: Dict[str, Any],
    agent: Dict[str, Any],
    call_id: str,
) -> Dict[str, Any]:
    """
    Execute the resolution chain for a detected intent.
    Returns result of first successful connector in chain.
    """
    intent_slug = intent_state.get("intent", "unknown")

    # Get resolution chain: agent-defined chain -> default priority -> fallback
    chain = get_chain(intent_slug, agent_config, configured_connectors)
    if not chain:
        return {"success": False, "error": "no_configured_connector_in_chain"}

    for connector_entry in chain:
        connector_type = (
            connector_entry.get("connector")
            if isinstance(connector_entry, dict)
            else str(connector_entry)
        )

        if connector_type not in configured_connectors and connector_type != "human_handoff":
            continue

        mapping = get_mapping(connector_type, intent_slug, connector_entry, agent_config)
        resolved_payload = slot_manager.resolve_template(
            mapping, filled_slots, contact, agent
        )

        try:
            result = await execute_connector(
                connector_type, resolved_payload, agent_config, contact, call_id
            )
            success_msg_template = (
                connector_entry.get("on_success", f"Action completed via {connector_type}")
                if isinstance(connector_entry, dict)
                else f"Action completed via {connector_type}"
            )
            resolved_success_msg = slot_manager.resolve_template(
                success_msg_template, filled_slots, contact, agent, result
            )

            return {
                "success": True,
                "connector_used": connector_type,
                "result": result,
                "success_message": resolved_success_msg,
            }

        except Exception as exc:
            logger.error(
                "Connector %s failed for intent %s: %s", connector_type, intent_slug, exc
            )
            on_failure = (
                connector_entry.get("on_failure", "next")
                if isinstance(connector_entry, dict)
                else "next"
            )
            if on_failure == "next":
                continue
            else:
                return {
                    "success": False,
                    "error": str(exc),
                    "failure_message": on_failure,
                }

    return {"success": False, "error": "all_connectors_failed"}


def get_chain(
    intent_slug: str, agent_config: Dict[str, Any], configured_connectors: List[str]
) -> List[Dict[str, Any]]:
    """Retrieves agent-defined resolution chain or builds smart default priority list."""
    custom_intents = agent_config.get("intents", []) if isinstance(agent_config, dict) else []
    for ci in custom_intents:
        if isinstance(ci, dict) and ci.get("slug") == intent_slug and ci.get("resolution_chain"):
            return ci.get("resolution_chain")

    default_types = DEFAULT_CHAIN_PRIORITY.get(intent_slug, ["webhook"])
    chain = []
    for ctype in default_types:
        if ctype in configured_connectors or ctype == "human_handoff":
            chain.append({"connector": ctype, "on_success": f"Resolved via {ctype}", "on_failure": "next"})
    return chain


def get_mapping(
    connector_type: str,
    intent_slug: str,
    connector_entry: Any,
    agent_config: Dict[str, Any],
) -> Dict[str, Any]:
    """Retrieves template slot mapping for connector and intent."""
    if isinstance(connector_entry, dict) and connector_entry.get("slot_mapping"):
        return connector_entry.get("slot_mapping")

    key = f"{connector_type}:{intent_slug}"
    return DEFAULT_SLOT_MAPPINGS.get(key, {"data": "{slot_data}"})


async def execute_connector(
    connector: str,
    payload: Dict[str, Any],
    agent_config: Dict[str, Any],
    contact: Dict[str, Any],
    call_id: str,
) -> Dict[str, Any]:
    """Routes execution to specific connector service implementation."""
    if connector == "google_calendar":
        return await google_cal.create_event(
            refresh_token=payload.get("refresh_token", ""),
            client_id=payload.get("client_id", ""),
            client_secret=payload.get("client_secret", ""),
            calendar_id=payload.get("calendar_id", "primary"),
            summary=payload.get("summary", "Appointment"),
            start_time=payload.get("start", ""),
            duration_minutes=int(payload.get("duration_minutes", 30)),
        )

    elif connector == "hubspot":
        contact_phone = contact.get("phone") or contact.get("number", "")
        return await hubspot.sync_call_summary(
            access_token=payload.get("access_token", ""),
            contact_phone=contact_phone,
            call_summary=payload.get("title", "HubSpot Intent Action"),
            success_eval="Intent resolved",
        )

    elif connector == "supabase":
        if supabase:
            table_name = payload.get("table", "intent_actions")
            data = payload.get("data", {})
            res = supabase.table(table_name).insert(data).execute()
            return {"inserted_rows": len(res.data or []), "data": res.data}
        return {"status": "mock_inserted", "payload": payload}

    elif connector == "webhook":
        url = payload.get("url") or payload.get("webhook_url", "")
        if not url:
            return {"status": "skipped", "reason": "No webhook URL configured"}
        return await webhook.fire_post_call_webhook(
            url=url,
            method=payload.get("method", "POST"),
            headers=payload.get("headers", {}),
            payload_template=None,
            call_data={"call_id": call_id, "payload": payload},
        )

    elif connector == "human_handoff":
        return {
            "status": "handoff_initiated",
            "handover_number": agent_config.get("handover_number", "+18005550199"),
            "reason": "Caller requested human operator or rule triggered escalation",
        }

    return {"status": "executed", "connector": connector, "payload": payload}
