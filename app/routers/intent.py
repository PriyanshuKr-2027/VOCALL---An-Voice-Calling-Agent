"""
Intent API Router
Endpoints for querying call intent events, slot status, and testing intent classification.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.intent import detector, slot_manager
from app.services.supabase_client import supabase

router = APIRouter(prefix="/intent", tags=["Intent Engine"])


class IntentDetectRequest(BaseModel):
    transcript_turn: str
    emotion_state: Optional[Dict[str, Any]] = None
    agent_intents: Optional[List[Dict[str, Any]]] = None
    filled_slots: Optional[Dict[str, Any]] = None


@router.post("/detect")
async def test_detect_intent(request: IntentDetectRequest):
    """Test endpoint to classify intent and articulate caller goal from a transcript turn."""
    return await detector.detect(
        transcript_turn=request.transcript_turn,
        emotion_state=request.emotion_state or {},
        agent_intents=request.agent_intents or [],
        filled_slots=request.filled_slots or {},
    )


@router.get("/calls/{call_id}/events")
async def get_call_intent_events(call_id: UUID):
    """Fetch all intent events logged for a call."""
    if not supabase:
        return []
    try:
        res = (
            supabase.table("intent_events")
            .select("*")
            .eq("call_id", str(call_id))
            .order("created_at", desc=False)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch intent events: {exc}",
        )


@router.get("/calls/{call_id}/slots")
async def get_call_slots(call_id: UUID, intent_slug: Optional[str] = None):
    """Fetch Redis-backed slot carry-forward data for a call."""
    if intent_slug:
        slots = await slot_manager.get_slots(str(call_id), intent_slug)
        status_info = slot_manager.get_slot_status(intent_slug, slots)
        return {"intent": intent_slug, "slots": slots, "status": status_info}

    # Fetch all slots across intents from Redis short-term memory
    from app.services.memory import short_term
    all_slots = await short_term.get_all_slots(str(call_id))
    return {"call_id": str(call_id), "all_slots": all_slots}
