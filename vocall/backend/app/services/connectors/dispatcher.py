from typing import Any, Dict


async def fire_connector(
    connector_type: str, config: Dict[str, Any], payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Central Dispatcher routing execution to specific connector service.
    """
    ctype = connector_type.lower()

    if "google" in ctype or "calendar" in ctype:
        from app.services.connectors.google_cal import book_appointment

        return await book_appointment(
            credentials_json=config.get("credentials_json", "{}"),
            calendar_id=config.get("calendar_id", "primary"),
            start_time=payload.get("start_time", ""),
            end_time=payload.get("end_time", ""),
            summary=payload.get("summary", "Call Appointment"),
            attendee_email=payload.get("attendee_email"),
            timezone=config.get("timezone", "Asia/Kolkata"),
        )
    elif "hubspot" in ctype:
        from app.services.connectors.hubspot import log_lead

        return await log_lead(
            access_token=config.get("access_token", ""),
            pipeline_id=config.get("pipeline_id", ""),
            deal_stage_id=config.get("deal_stage_id", ""),
            contact_name=payload.get("contact_name", "Lead Caller"),
            contact_phone=payload.get("contact_phone", ""),
            contact_email=payload.get("contact_email"),
            notes=payload.get("notes", ""),
        )
    elif "salesforce" in ctype:
        from app.services.connectors.salesforce import sync_call_result

        return await sync_call_result(
            client_id=config.get("client_id", ""),
            client_secret=config.get("client_secret", ""),
            refresh_token=config.get("refresh_token", ""),
            instance_url=config.get("instance_url", ""),
            contact_phone=payload.get("contact_phone", ""),
            call_summary=payload.get("call_summary", ""),
            disposition=payload.get("disposition", "Completed"),
            emotion_score=float(payload.get("emotion_score", 0.0)),
        )
    elif "webhook" in ctype or "zapier" in ctype:
        from app.services.connectors.webhook import fire_post_call_webhook

        url = config.get("webhook_url") or config.get("url", "")
        return await fire_post_call_webhook(
            url=url,
            method=config.get("method", "POST"),
            headers=config.get("headers"),
            payload_template=config.get("payload_template"),
            call_data=payload,
        )
    elif "whatsapp" in ctype:
        from app.services.connectors.whatsapp import send_summary

        return await send_summary(
            provider=config.get("provider", "twilio"),
            from_number=config.get("from_number", ""),
            to_number=payload.get("contact_phone", ""),
            message_template=config.get("message_template", "Summary: {call_summary}"),
            call_summary=payload.get("call_summary", ""),
            agent_name=payload.get("agent_name", "Agent"),
            contact_name=payload.get("contact_name", "Caller"),
            emotion_score=float(payload.get("emotion_score", 0.0)),
            org_id=config.get("org_id", payload.get("org_id", "")),
        )
    elif "supabase" in ctype or "postgres" in ctype:
        from app.services.connectors.supabase_conn import query_postgres, query_supabase

        if "connection_string" in config:
            return await query_postgres(
                connection_string=config.get("connection_string", ""),
                query_template=config.get(
                    "query_template", "SELECT * FROM contacts WHERE phone = {contact_phone}"
                ),
                contact_phone=payload.get("contact_phone", ""),
            )
        else:
            return await query_supabase(
                url=config.get("url", ""),
                anon_key=config.get("anon_key", ""),
                table_name=config.get("table_name", ""),
                query_column=config.get("query_column", "phone"),
                query_value=payload.get("contact_phone", ""),
            )
    else:
        return {
            "success": False,
            "error": f"Unknown connector type '{connector_type}'",
        }
