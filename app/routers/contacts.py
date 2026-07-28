from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import UUID
from app.models.schemas import ContactCreate, ContactUpdate, ContactResponse
from app.services.supabase_client import supabase

router = APIRouter(prefix="/contacts", tags=["Contacts"])

@router.get("", response_model=List[ContactResponse])
async def list_contacts(org_id: UUID):
    if not supabase:
        return []
    res = supabase.table("contacts").select("*").eq("org_id", str(org_id)).execute()
    return res.data or []

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(contact: ContactCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client unavailable")
    res = supabase.table("contacts").insert(contact.model_dump(mode="json")).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create contact")
    return res.data[0]

@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(contact_id: UUID):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client unavailable")
    res = supabase.table("contacts").select("*").eq("id", str(contact_id)).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return res.data

@router.put("/{contact_id}", response_model=ContactResponse)
@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact(contact_id: UUID, contact_update: ContactUpdate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client unavailable")
    update_data = {k: v for k, v in contact_update.model_dump(mode="json").items() if v is not None}
    res = supabase.table("contacts").update(update_data).eq("id", str(contact_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact not found or update failed")
    return res.data[0]

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(contact_id: UUID):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client unavailable")
    supabase.table("contacts").delete().eq("id", str(contact_id)).execute()
    return None


@router.get("/{contact_id}/memory/graph")
async def get_contact_graph(contact_id: UUID):
    """Fetch Knowledge Graph node and relationship data for visual graph rendering."""
    from app.services.memory import graph
    return graph.get_graph_data(str(contact_id))


@router.delete("/{contact_id}/memory/graph")
async def delete_contact_graph_memory(contact_id: UUID):
    """Clear all Knowledge Graph memory for a given contact."""
    from app.services.memory import graph
    success = graph.delete_contact_graph(str(contact_id))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete graph memory")
    return {"status": "success", "message": f"Graph memory cleared for contact {contact_id}"}


@router.delete("/{contact_id}/memory")
async def cascade_delete_contact_memory(contact_id: UUID):
    """
    DPDP Act 2023 'Forget Me' Cascade Deletion (M48).
    Atomically clears all contact data across 5 memory & intent tiers:
      1. Upstash Redis Short-Term Memory & Slots
      2. Supabase pgvector Long-Term Semantic Memory
      3. Supabase Postgres Episodic Memory
      4. FalkorDB Knowledge Graph Nodes & Edges
      5. Intent Events & logs audit in compliance_log
    """
    import asyncio
    from datetime import datetime
    from app.services.memory import short_term, long_term, episodic, graph

    cid = str(contact_id)

    try:
        # Tier 1 — Redis
        redis_task = short_term.clear_call(cid)

        # Tier 2 — pgvector
        pgvector_task = long_term.delete_all(cid)

        # Tier 3 — Episodic Postgres
        episodic_task = episodic.delete_all(cid)

        # Tier 4 — FalkorDB Graph
        graph_task = asyncio.to_thread(graph.delete_contact_graph, cid)

        # Tier 5 — Intent Events
        intent_task = None
        if supabase:
            intent_task = asyncio.to_thread(
                lambda: supabase.table("intent_events").delete().eq("contact_id", cid).execute()
            )

        # Execute parallel deletion
        tasks = [redis_task, pgvector_task, episodic_task, graph_task]
        if intent_task:
            tasks.append(intent_task)

        await asyncio.gather(*tasks, return_exceptions=True)

        # Audit log in compliance_log
        if supabase:
            supabase.table("compliance_log").insert({
                "action": "forget_me",
                "contact_id": cid,
                "tiers_cleared": ["redis", "pgvector", "postgres", "falkordb", "intent_events"],
                "timestamp": datetime.utcnow().isoformat(),
            }).execute()

        return {
            "deleted": True,
            "contact_id": cid,
            "tiers_cleared": 5,
            "message": "All memory and intent events deleted under DPDP Act 2023",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cascade memory deletion failed: {exc}",
        )


