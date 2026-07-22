from typing import Dict, Any
from app.services.connectors.google_cal import fire_google_calendar
from app.services.connectors.hubspot import fire_hubspot
from app.services.connectors.webhook import fire_webhook
from app.services.connectors.whatsapp import fire_whatsapp
from app.services.connectors.supabase_conn import fire_supabase_postgres

async def fire_connector(connector_type: str, config: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Central Dispatcher routing execution to specific connector service.
    """
    ctype = connector_type.lower()

    if "google" in ctype or "calendar" in ctype:
        return await fire_google_calendar(config, payload)
    elif "hubspot" in ctype:
        return await fire_hubspot(config, payload)
    elif "webhook" in ctype:
        return await fire_webhook(config, payload)
    elif "whatsapp" in ctype:
        return await fire_whatsapp(config, payload)
    elif "supabase" in ctype or "postgres" in ctype:
        return await fire_supabase_postgres(config, payload)
    else:
        return {
            "status": "error",
            "message": f"Unknown connector type '{connector_type}'",
            "payload": payload
        }
