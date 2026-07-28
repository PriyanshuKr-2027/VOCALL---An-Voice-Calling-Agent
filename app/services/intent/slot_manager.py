"""
Slot Manager Service (M38)
Redis-backed slot carry-forward, template token resolution, slot status tracking.
"""

import logging
import re
from typing import Any, Dict, List, Optional

from app.services.memory import short_term

logger = logging.getLogger(__name__)

SLOT_SCHEMAS: Dict[str, Dict[str, List[str]]] = {
    "book_appointment": {
        "required": ["date", "time"],
        "optional": ["purpose", "duration", "contact_name"],
    },
    "request_refund": {
        "required": ["order_id"],
        "optional": ["reason", "amount", "purchase_date"],
    },
    "check_status": {
        "required": ["reference_id"],
        "optional": [],
    },
    "get_invoice": {
        "required": [],
        "optional": ["invoice_id", "date_range"],
    },
    "cancel_service": {
        "required": ["service_name"],
        "optional": ["reason", "effective_date"],
    },
    "lead_qualification": {
        "required": ["name"],
        "optional": ["company", "budget", "timeline", "use_case"],
    },
}


async def merge_slots(call_id: str, intent_slug: str, new_slots: Dict[str, Any]) -> Dict[str, Any]:
    """
    Reads existing slots from Redis for call_id and intent_slug,
    merges non-null new_slots, writes back, and returns merged slots dict.
    """
    if not call_id or not intent_slug:
        return {}

    existing = await short_term.get_slots(call_id, intent_slug) or {}

    # Merge non-empty values
    merged = dict(existing)
    if isinstance(new_slots, dict):
        for k, v in new_slots.items():
            if v is not None and str(v).strip() != "":
                merged[k] = v

    await short_term.write_slot(call_id, intent_slug, merged)
    return merged


async def get_slots(call_id: str, intent_slug: str) -> Dict[str, Any]:
    """Reads slots from Redis for a given call and intent."""
    return await short_term.get_slots(call_id, intent_slug) or {}


def get_slot_status(intent_slug: str, filled_slots: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates required vs missing slots for an intent.

    Returns:
        {
          "filled": [list of filled required slots],
          "missing_required": [list of unfilled required slots],
          "complete": bool — true if all required slots filled
        }
    """
    schema = SLOT_SCHEMAS.get(intent_slug, {"required": [], "optional": []})
    required = schema.get("required", [])

    filled = []
    missing_required = []

    for req in required:
        val = filled_slots.get(req) if isinstance(filled_slots, dict) else None
        if val is not None and str(val).strip() != "":
            filled.append(req)
        else:
            missing_required.append(req)

    return {
        "filled": filled,
        "missing_required": missing_required,
        "complete": len(missing_required) == 0,
    }


def resolve_template(
    template: Any,
    slots: Dict[str, Any],
    contact: Optional[Dict[str, Any]] = None,
    agent: Optional[Dict[str, Any]] = None,
    result: Optional[Dict[str, Any]] = None,
) -> Any:
    """
    Resolves {token} or {token|default:fallback} placeholders in templates.
    Can accept a str or dict template recursively.
    """
    if isinstance(template, dict):
        return {
            k: resolve_template(v, slots, contact, agent, result) for k, v in template.items()
        }

    if not isinstance(template, str):
        return template

    contact_dict = contact or {}
    agent_dict = agent or {}
    result_dict = result or {}

    def replace_match(match: re.Match) -> str:
        expression = match.group(1).strip()
        default_val = ""

        if "|default:" in expression:
            parts = expression.split("|default:", 1)
            token_key = parts[0].strip()
            default_val = parts[1].strip()
        else:
            token_key = expression

        # Check lookup sources in order: slots -> contact -> agent -> result
        val = None

        if token_key.startswith("contact."):
            prop = token_key.removeprefix("contact.")
            val = contact_dict.get(prop)
        elif token_key.startswith("agent."):
            prop = token_key.removeprefix("agent.")
            val = agent_dict.get(prop)
        elif token_key.startswith("result."):
            prop = token_key.removeprefix("result.")
            val = result_dict.get(prop)
        else:
            val = slots.get(token_key)
            if val is None:
                val = contact_dict.get(token_key)
            if val is None:
                val = agent_dict.get(token_key)
            if val is None:
                val = result_dict.get(token_key)

        if val is not None and str(val).strip() != "":
            return str(val)

        return default_val

    # Replace {token} placeholders
    pattern = r"\{([^}]+)\}"
    resolved = re.sub(pattern, replace_match, template)
    return resolved


def build_slot_status_block(call_id: str, all_slots: Dict[str, Dict[str, Any]]) -> str:
    """
    Returns LLM prompt block showing slot fill status for all active intent namespaces.
    """
    if not all_slots:
        return "[SLOTS STATUS: No intent slots collected yet.]"

    lines = ["[SLOTS FILLED THIS CALL]"]
    for intent_slug, slots in all_slots.items():
        if not isinstance(slots, dict) or not slots:
            continue

        schema = SLOT_SCHEMAS.get(intent_slug, {"required": [], "optional": []})
        required = schema.get("required", [])

        lines.append(f"Intent: {intent_slug}")
        for req in required:
            val = slots.get(req)
            if val is not None and str(val).strip() != "":
                lines.append(f"  ✅ {req}: {val}")
            else:
                lines.append(f"  ❌ {req}: (missing)")

        for k, v in slots.items():
            if k not in required and v is not None:
                lines.append(f"  ⚪ {k}: {v}")

    return "\n".join(lines)
