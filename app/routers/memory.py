from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from uuid import UUID
from app.models.schemas import MemoryLongTermCreate, MemoryLongTermResponse, MemoryEpisodicResponse
from app.services.memory import long_term, episodic

router = APIRouter(prefix="/memory", tags=["Memory (VoCall Original)"])


@router.get("/long-term")
async def get_long_term_memory(
    contact_id: UUID,
    org_id: UUID,
    query_text: Optional[str] = Query(None, description="Semantic search query text"),
    limit: int = Query(5, ge=1, le=50),
):
    """
    Retrieves long-term memory facts for a contact using pgvector semantic search or recency.
    """
    facts = await long_term.retrieve_relevant_facts(
        contact_id=str(contact_id),
        org_id=str(org_id),
        query_text=query_text or "",
        limit=limit,
    )
    return {"contact_id": str(contact_id), "org_id": str(org_id), "facts": facts}


@router.post("/long-term", status_code=status.HTTP_201_CREATED)
async def store_long_term_memory(payload: MemoryLongTermCreate):
    """
    Generates embedding vector and stores a new persistent long-term fact.
    """
    if not payload.contact_id:
        raise HTTPException(status_code=400, detail="contact_id is required")

    result = await long_term.store_fact(
        contact_id=str(payload.contact_id),
        org_id=str(payload.org_id),
        agent_id=str(payload.agent_id) if payload.agent_id else None,
        content=payload.content,
        emotion_state=payload.emotion_state,
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to store long-term memory fact")

    return result


@router.get("/episodic")
async def get_episodic_memory(
    contact_id: UUID,
    org_id: UUID,
    limit: int = Query(5, ge=1, le=50),
):
    """
    Retrieves recent call episode summaries for a contact.
    """
    episodes = await episodic.get_recent_episodes(
        contact_id=str(contact_id),
        org_id=str(org_id),
        limit=limit,
    )
    return {"contact_id": str(contact_id), "org_id": str(org_id), "episodes": episodes}
