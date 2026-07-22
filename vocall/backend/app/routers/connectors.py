from fastapi import APIRouter, HTTPException, status
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel
from app.models.schemas import ConnectorCreate, ConnectorResponse
from app.services.supabase_client import supabase
from app.services.connectors.dispatcher import fire_connector

router = APIRouter(prefix="/connectors", tags=["Connectors"])

class TestConnectorRequest(BaseModel):
    test_payload: Optional[Dict[str, Any]] = None

@router.get("", response_model=List[ConnectorResponse])
async def list_connectors(org_id: UUID):
    if not supabase:
        return []
    res = supabase.table("connectors").select("*").eq("org_id", str(org_id)).execute()
    return res.data or []

@router.post("", response_model=ConnectorResponse, status_code=status.HTTP_201_CREATED)
async def create_connector(connector: ConnectorCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client unavailable")
    res = supabase.table("connectors").insert(connector.model_dump(mode="json")).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create connector")
    return res.data[0]

@router.get("/{connector_id}", response_model=ConnectorResponse)
async def get_connector(connector_id: UUID):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client unavailable")
    res = supabase.table("connectors").select("*").eq("id", str(connector_id)).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Connector not found")
    return res.data

@router.post("/test/{connector_id}")
async def test_connector_fire(connector_id: UUID, req: Optional[TestConnectorRequest] = None):
    """
    Test endpoint for firing a connector by ID.
    Calls fire_connector() dispatcher.
    """
    connector_type = "webhook"
    config = {}

    if supabase:
        res = supabase.table("connectors").select("*").eq("id", str(connector_id)).execute()
        if res.data and len(res.data) > 0:
            cdata = res.data[0]
            connector_type = cdata.get("name") or cdata.get("provider") or "webhook"
            config = cdata.get("config") or {}

    payload = (req.test_payload if req else None) or {
        "event": "call.completed",
        "call_id": "test_call_10293",
        "summary": "Caller inquired about appointment booking.",
        "duration_seconds": 124,
    }

    result = await fire_connector(connector_type, config, payload)
    return result

@router.delete("/{connector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connector(connector_id: UUID):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client unavailable")
    supabase.table("connectors").delete().eq("id", str(connector_id)).execute()
    return None
