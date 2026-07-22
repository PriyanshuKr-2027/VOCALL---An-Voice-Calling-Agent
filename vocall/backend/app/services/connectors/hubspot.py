from typing import Dict, Any

async def fire_hubspot(config: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    HubSpot CRM connector execution (Stubbed).
    Fields: api_key, pipeline_id
    """
    api_key = config.get("api_key", "")
    pipeline_id = config.get("pipeline_id", "default")

    return {
        "status": "success",
        "connector": "hubspot",
        "message": f"Stub: Updated HubSpot pipeline '{pipeline_id}' for caller",
        "data": payload
    }
