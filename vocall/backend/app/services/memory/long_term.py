"""
VoCall Long-Term Memory Service (pgvector + Supabase).

Manages persistent facts and user preferences attached to contact records:
  - Vector embedding generation (Groq / OpenAI API compatible)
  - pgvector cosine similarity retrieval
  - Contact memory deletion

Database Table: memory_long_term
Vector Dimension: 1536
"""

import logging
from typing import Optional, Dict, Any, List
import httpx

from app.core.config import settings
from app.services.supabase_client import supabase

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 1536


async def generate_embedding(text: str, api_key: Optional[str] = None) -> List[float]:
    """
    Generates a 1536-dimensional vector embedding for the input text using Groq/OpenAI compatible API.
    Falls back to a zero-vector if key is missing or endpoint fails, preventing pipeline crashes.
    """
    key = api_key or settings.GROQ_API_KEY
    if not key or not text.strip():
        return [0.0] * EMBEDDING_DIM

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "input": text,
                    "model": "nomic-embed-text-v1_5",
                },
            )
            if res.status_code == 200:
                data = res.json()
                emb = data.get("data", [{}])[0].get("embedding", [])
                if len(emb) == EMBEDDING_DIM:
                    return emb
    except Exception as exc:
        logger.warning("Embedding API request failed (falling back to dummy vector): %s", exc)

    return [0.0] * EMBEDDING_DIM


async def store_fact(
    contact_id: str,
    org_id: str,
    agent_id: Optional[str],
    content: str,
    emotion_state: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    """
    Embeds content and inserts a new fact into memory_long_term.

    Returns the created record dict or None on failure.
    """
    if not supabase or not content.strip():
        return None

    try:
        embedding = await generate_embedding(content)
        payload = {
            "contact_id": contact_id,
            "org_id": org_id,
            "agent_id": agent_id,
            "content": content.strip(),
            "embedding": embedding,
            "emotion_state": emotion_state or {},
        }
        res = supabase.table("memory_long_term").insert(payload).execute()
        if res.data:
            logger.info("Stored long-term fact for contact %s in org %s", contact_id, org_id)
            return res.data[0]
    except Exception as exc:
        logger.error("Failed to store_fact for contact %s: %s", contact_id, exc)

    return None


async def retrieve_relevant_facts(
    contact_id: str,
    org_id: str,
    query_text: str,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    """
    Embeds query_text and retrieves top-k relevant facts using cosine similarity or exact filtering.

    Query:
      SELECT content, emotion_state, 1 - (embedding <=> $query_embedding) AS similarity
      FROM memory_long_term
      WHERE contact_id = $contact_id AND org_id = $org_id
      ORDER BY similarity DESC LIMIT $limit

    Returns list of facts: [{"content": str, "emotion_state": dict, "similarity": float}]
    """
    if not supabase or not contact_id or not org_id:
        return []

    try:
        query_vector = await generate_embedding(query_text) if query_text else [0.0] * EMBEDDING_DIM

        # Try RPC call if defined in DB schema
        try:
            rpc_res = supabase.rpc(
                "match_long_term_memories",
                {
                    "query_embedding": query_vector,
                    "match_threshold": 0.0,
                    "match_count": limit,
                    "p_contact_id": contact_id,
                    "p_org_id": org_id,
                },
            ).execute()
            if rpc_res.data:
                return rpc_res.data
        except Exception:
            pass  # RPC not created yet — fall back to standard table query

        # Direct table query fallback
        res = (
            supabase.table("memory_long_term")
            .select("id, content, emotion_state, created_at")
            .eq("contact_id", contact_id)
            .eq("org_id", org_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        facts = []
        for row in res.data or []:
            facts.append(
                {
                    "content": row.get("content", ""),
                    "emotion_state": row.get("emotion_state", {}),
                    "similarity": 1.0,
                    "created_at": row.get("created_at"),
                }
            )
        return facts

    except Exception as exc:
        logger.error("Failed to retrieve_relevant_facts for contact %s: %s", contact_id, exc)
        return []


async def delete_contact_memory(contact_id: str, org_id: str) -> bool:
    """
    Deletes all long-term memory facts for the specified contact.
    """
    if not supabase or not contact_id or not org_id:
        return False

    try:
        res = (
            supabase.table("memory_long_term")
            .delete()
            .eq("contact_id", contact_id)
            .eq("org_id", org_id)
            .execute()
        )
        logger.info("Deleted long-term memory for contact %s in org %s", contact_id, org_id)
        return True
    except Exception as exc:
        logger.error("Failed to delete_contact_memory for contact %s: %s", contact_id, exc)
        return False
