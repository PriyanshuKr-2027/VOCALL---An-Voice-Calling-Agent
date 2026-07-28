"""
Intent Detector Service (M37)
Per-turn intent classification via Groq JSON mode with SWI-style intent articulation.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from app.services.llm import llm_service

logger = logging.getLogger(__name__)

SYSTEM_INTENTS = [
    "book_appointment",
    "request_refund",
    "check_status",
    "get_invoice",
    "update_details",
    "cancel_service",
    "speak_to_human",
    "lead_qualification",
    "general_inquiry",
    "complaint",
    "unknown",
]


async def detect(
    transcript_turn: str,
    emotion_state: Dict[str, Any],
    conversation_history: Optional[List[Dict[str, str]]] = None,
    agent_intents: Optional[List[Dict[str, Any]]] = None,
    filled_slots: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Detect caller intent from transcript turn.
    Uses emotion_state (caller_need, issue_category) for richer context.
    Implements SWI-inspired intent articulation.

    Returns:
        Dict with intent, confidence, intent_articulation, entities, slot_data,
        secondary_intent, is_terminal.
    """
    if not transcript_turn or not transcript_turn.strip():
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "intent_articulation": "No speech provided.",
            "entities": [],
            "slot_data": {},
            "secondary_intent": None,
            "is_terminal": False,
        }

    custom_slugs = [
        i.get("slug") or i.get("name", "").lower().replace(" ", "_")
        for i in (agent_intents or [])
        if isinstance(i, dict)
    ]
    all_intents = SYSTEM_INTENTS + [s for s in custom_slugs if s and s not in SYSTEM_INTENTS]

    caller_need = emotion_state.get("caller_need", "") if emotion_state else ""
    issue_category = emotion_state.get("issue_category", "") if emotion_state else ""

    prompt = f"""You are an intent detection AI analyzing a voice call transcript turn.
The caller just said: "{transcript_turn}"

Context:
- Caller's apparent need: {caller_need}
- Issue category: {issue_category}
- Previously filled slots: {json.dumps(filled_slots or {})}

Available intents: {json.dumps(all_intents)}

Return ONLY valid JSON with no extra markdown formatting:
{{
  "intent": "one of the available intents",
  "confidence": 0.85,
  "intent_articulation": "To [verb] [what] — a concise sentence stating what the caller wants to accomplish",
  "entities": ["entity1", "entity2"],
  "slot_data": {{"key": "value"}},
  "secondary_intent": null,
  "is_terminal": false
}}"""

    try:
        raw_response = await llm_service.generate(
            prompt="You are a strict JSON-only intent extraction model.",
            messages=[{"role": "user", "content": prompt}],
        )
        cleaned = str(raw_response).strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned.removeprefix("```json").removesuffix("```").strip()
        elif cleaned.startswith("```"):
            cleaned = cleaned.removeprefix("```").removesuffix("```").strip()

        parsed = json.loads(cleaned)
        intent = parsed.get("intent", "general_inquiry")
        if intent not in all_intents:
            intent = "general_inquiry"

        return {
            "intent": intent,
            "confidence": float(parsed.get("confidence", 0.75)),
            "intent_articulation": parsed.get(
                "intent_articulation", f"To handle {intent.replace('_', ' ')}."
            ),
            "entities": parsed.get("entities", []),
            "slot_data": parsed.get("slot_data", {}),
            "secondary_intent": parsed.get("secondary_intent"),
            "is_terminal": bool(parsed.get("is_terminal", False)),
        }
    except Exception as exc:
        logger.error("Intent detection error: %s", exc)
        return {
            "intent": "general_inquiry",
            "confidence": 0.5,
            "intent_articulation": "To convey an inquiry.",
            "entities": [],
            "slot_data": {},
            "secondary_intent": None,
            "is_terminal": False,
        }
