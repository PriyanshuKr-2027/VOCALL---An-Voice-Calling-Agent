"""
VoCall Short-Term Memory Service (Upstash Redis REST API via httpx).

Manages ephemeral in-call state for active voice calls:
  - Dialogue turns (role, content, emotion_state, timestamp_ms)
  - Continuous emotion events (emotion_state, timestamp_ms)

Redis Key Format: stm:{call_id}
TTL: 3600 seconds (1 hour)

CRITICAL: Never crashes the voice pipeline on Redis failure.
All operations wrap network and JSON calls in try/except blocks, log errors, and return gracefully.
"""

import json
import logging
import time
from typing import Optional, Dict, Any, List

from app.services.redis_client import redis_client

logger = logging.getLogger(__name__)

KEY_PREFIX = "stm:"
DEFAULT_TTL_SECONDS = 3600


async def init_call_memory(call_id: str) -> bool:
    """
    Initializes short-term memory structure for a new call:
      SET stm:{call_id} JSON.stringify({turns: [], emotion_events: []}) EX 3600
    """
    try:
        key = f"{KEY_PREFIX}{call_id}"
        initial_data = {
            "call_id": call_id,
            "turns": [],
            "emotion_events": [],
            "initialized_at": int(time.time() * 1000),
        }
        success = await redis_client.set(
            key=key,
            value=json.dumps(initial_data),
            ex_seconds=DEFAULT_TTL_SECONDS,
        )
        logger.debug("Initialized short-term memory for call %s (success=%s)", call_id, success)
        return success
    except Exception as exc:
        logger.error("Failed to init_call_memory for call %s: %s", call_id, exc)
        return False


async def append_turn(
    call_id: str,
    role: str,
    content: str,
    emotion_state: Optional[Dict[str, Any]] = None,
) -> bool:
    """
    Appends a dialogue turn to stm:{call_id}.
    Turn structure: {"role": role, "content": content, "emotion_state": emotion_state, "timestamp_ms": ts}

    Never raises on Redis failure — logs and returns silently.
    """
    try:
        key = f"{KEY_PREFIX}{call_id}"
        data = await get_call_memory(call_id)
        if data is None:
            data = {
                "call_id": call_id,
                "turns": [],
                "emotion_events": [],
                "initialized_at": int(time.time() * 1000),
            }

        if "turns" not in data or not isinstance(data.get("turns"), list):
            data["turns"] = []

        turn_entry = {
            "role": role,
            "content": content,
            "emotion_state": emotion_state,
            "timestamp_ms": int(time.time() * 1000),
        }
        data["turns"].append(turn_entry)

        success = await redis_client.set(
            key=key,
            value=json.dumps(data),
            ex_seconds=DEFAULT_TTL_SECONDS,
        )
        logger.debug("Appended %s turn to short-term memory for call %s", role, call_id)
        return success
    except Exception as exc:
        logger.error("Failed to append_turn for call %s: %s", call_id, exc)
        return False


async def append_emotion_event(
    call_id: str,
    emotion_state: Dict[str, Any],
) -> bool:
    """
    Appends an emotion event to stm:{call_id}.
    Event structure: {"emotion_state": emotion_state, "timestamp_ms": ts}

    Never raises on Redis failure — logs and returns silently.
    """
    try:
        key = f"{KEY_PREFIX}{call_id}"
        data = await get_call_memory(call_id)
        if data is None:
            data = {
                "call_id": call_id,
                "turns": [],
                "emotion_events": [],
                "initialized_at": int(time.time() * 1000),
            }

        if "emotion_events" not in data or not isinstance(data.get("emotion_events"), list):
            data["emotion_events"] = []

        event_entry = {
            "emotion_state": emotion_state,
            "timestamp_ms": emotion_state.get("timestamp_ms") or int(time.time() * 1000),
        }
        data["emotion_events"].append(event_entry)

        success = await redis_client.set(
            key=key,
            value=json.dumps(data),
            ex_seconds=DEFAULT_TTL_SECONDS,
        )
        logger.debug("Appended emotion event to short-term memory for call %s", call_id)
        return success
    except Exception as exc:
        logger.error("Failed to append_emotion_event for call %s: %s", call_id, exc)
        return False


async def get_call_memory(call_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves short-term memory JSON object from stm:{call_id}.
    Returns parsed dict or None if missing or on error.
    """
    try:
        key = f"{KEY_PREFIX}{call_id}"
        raw_val = await redis_client.get(key)
        if not raw_val:
            return None
        if isinstance(raw_val, dict):
            return raw_val
        return json.loads(raw_val)
    except Exception as exc:
        logger.error("Failed to get_call_memory for call %s: %s", call_id, exc)
        return None


async def clear_call_memory(call_id: str) -> bool:
    """
    Deletes stm:{call_id} from Redis.
    """
    try:
        key = f"{KEY_PREFIX}{call_id}"
        success = await redis_client.delete(key)
        logger.debug("Cleared short-term memory for call %s", call_id)
        return success
    except Exception as exc:
        logger.error("Failed to clear_call_memory for call %s: %s", call_id, exc)
        return False
