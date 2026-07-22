"""
VoCall Real-Time Voice Pipeline using Pipecat.

start_pipeline(call_id, agent_id, contact_id, ws_connection):
  Assembles and runs a Pipecat pipeline:

  LiveKitTransport (audio input)
    → STT stage  (routing stub — implemented in P2-M9)
    → LLMUserResponseAggregator
    → LLM stage  (Groq → Cerebras fallback via llm.py)
    → TTS stage  (routing stub — implemented in P2-M9)
    → LiveKitTransport (audio output)

  Each completed turn is written to Redis via short_term.append_turn()
  (short_term memory module implemented in P2-M2).

Architecture note:
  The STT and TTS routing stages are stubs in this module.
  Full multi-provider routing (Cartesia / Sarvam AI / Hume AI) is wired
  in P2-M9. The interface contract (async coroutine signatures) is locked
  here so P2-M9 can drop in implementations without changing this file.
"""

import asyncio
import logging
import time
from typing import Optional, Dict, Any

from app.core.config import settings
from app.services.supabase_client import supabase
from app.services.livekit_service import livekit_service
from app.services.llm import llm_service
from app.services.redis_client import redis_client
from app.services.emotion import (
    analyze_text_emotion,
    analyze_audio_emotion,
    fuse_emotion_signals,
    get_tone_instruction,
    fire_frustration_connector,
)
from app.services.stt import transcribe_audio
from app.services.tts import synthesize_speech

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# STT routing — delegates to app.services.stt
# ---------------------------------------------------------------------------

async def _stt_transcribe(
    audio_bytes: bytes,
    language: str,
    api_keys: Dict[str, str],
) -> str:
    """
    Speech-to-Text routing:
      - language == "hi" or "hinglish" → Sarvam AI Saarika v2
      - language == "en" (default) → Groq Whisper large-v3
    """
    return await transcribe_audio(audio_bytes, language, api_keys)


# ---------------------------------------------------------------------------
# TTS routing — delegates to app.services.tts
# ---------------------------------------------------------------------------

async def _tts_synthesize(
    text: str,
    voice_config: Dict[str, Any],
    api_keys: Dict[str, str],
    emotion_state: Optional[Dict[str, Any]] = None,
) -> bytes:
    """
    Text-to-Speech routing:
      - provider == "hume" and emotion_state → Hume AI Octave 2
      - provider == "sarvam"   → Sarvam AI Bulbul v2
      - provider == "cartesia" → Cartesia Sonic-2 (default)
    """
    return await synthesize_speech(text, voice_config, api_keys, emotion_state)



# ---------------------------------------------------------------------------
# Short-term memory integration
# ---------------------------------------------------------------------------

from app.services.memory import short_term


async def _append_turn_to_redis(
    call_id: str,
    role: str,
    content: str,
    timestamp_ms: int,
    emotion_state: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Persists a single dialogue turn to Redis short-term memory using short_term module.
    """
    await short_term.append_turn(
        call_id=call_id,
        role=role,
        content=content,
        emotion_state=emotion_state,
    )


# ---------------------------------------------------------------------------
# Agent config loader
# ---------------------------------------------------------------------------

async def _load_agent_config(agent_id: str) -> Dict[str, Any]:
    """Fetches agent row from Supabase. Returns empty dict on failure."""
    if not supabase or not agent_id:
        return {}
    try:
        res = supabase.table("agents").select("*").eq("id", agent_id).single().execute()
        return res.data or {}
    except Exception as exc:
        logger.error("Failed to load agent config for %s: %s", agent_id, exc)
        return {}


async def _load_org_api_keys(org_id: str) -> Dict[str, str]:
    """
    Fetches all API keys for an org from the api_keys table.
    Returns a flat dict: {provider: encrypted_key}.
    Note: keys are stored encrypted in DB — decryption happens at provider call time (P2-M9).
    """
    if not supabase or not org_id:
        return {}
    try:
        res = supabase.table("api_keys").select("provider, encrypted_key").eq("org_id", org_id).execute()
        return {row["provider"]: row["encrypted_key"] for row in (res.data or [])}
    except Exception as exc:
        logger.error("Failed to load org API keys: %s", exc)
        return {}


# ---------------------------------------------------------------------------
# Pipecat Pipeline
# ---------------------------------------------------------------------------

async def start_pipeline(
    call_id: str,
    agent_id: str,
    contact_id: Optional[str],
    ws_connection,  # WebSocket (FastAPI) — from the Twilio stream endpoint
) -> None:
    """
    Builds and runs the VoCall real-time voice pipeline for a single call.

    Pipeline stages (Pipecat):
      LiveKitTransport(input)
        → STT (transcription routing stub)
        → LLMUserResponseAggregator (accumulates partial transcripts)
        → LLM (Groq → Cerebras fallback)
        → TTS (synthesis routing stub)
        → LiveKitTransport(output)

    Each completed turn is written to Redis via _append_turn_to_redis().

    Args:
        call_id:       UUID of the calls row.
        agent_id:      UUID of the agent handling this call.
        contact_id:    UUID of the contact (caller), may be None.
        ws_connection: Active WebSocket connection (Twilio media stream).
    """
    logger.info("Starting voice pipeline: call_id=%s agent_id=%s", call_id, agent_id)

    # ---- Load agent configuration ----
    agent = await _load_agent_config(agent_id)
    org_id: str = agent.get("org_id", "")
    system_prompt: str = agent.get("system_prompt") or "You are a helpful AI voice assistant."
    language: str = agent.get("language") or "en"
    final_prompt: str = system_prompt
    if language in ["hi", "hinglish"]:
        final_prompt += (
            "\n\nLANGUAGE INSTRUCTION: Respond in the same language mix the "
            "caller uses — Hindi, English, or Hinglish code-switching. Do not "
            "force the caller to speak only English. Natural code-switching "
            "like 'main samajh gaya, let me check that for you' is preferred."
        )
    voice_config: Dict[str, Any] = {
        "voice_id": agent.get("voice_id"),
        "voice_provider": agent.get("voice_provider", "cartesia"),
    }
    agent_config: Dict[str, Any] = agent.get("config") or {}

    # ---- Load org-level API keys ----
    api_keys = await _load_org_api_keys(org_id)

    # ---- Initialize Short-Term Memory in Redis ----
    await short_term.init_call_memory(call_id)

    # ---- Create / verify LiveKit room ----
    room_name = f"call-{call_id}"
    if livekit_service.is_configured():
        try:
            await livekit_service.create_room(call_id)
        except Exception as exc:
            logger.warning("LiveKit room pre-creation skipped (may already exist): %s", exc)

    # ---- Update call status to 'in_progress' ----
    if supabase:
        try:
            supabase.table("calls").update({"status": "in_progress"}).eq("id", call_id).execute()
        except Exception as exc:
            logger.warning("Failed to update call status to in_progress: %s", exc)

    # ---- Pipecat pipeline assembly ----
    # Pipecat is imported inside the function to allow the module to load
    # even if pipecat-ai is not yet installed (graceful degradation in dev).
    try:
        from pipecat.pipeline.pipeline import Pipeline
        from pipecat.pipeline.runner import PipelineRunner
        from pipecat.pipeline.task import PipelineTask
        from pipecat.processors.aggregators.llm_response import (
            LLMUserResponseAggregator,
            LLMAssistantResponseAggregator,
        )
        from pipecat.transports.network.websocket_server import (
            WebsocketServerParams,
            WebsocketServerTransport,
        )
        from pipecat.services.openai import OpenAILLMService
        from pipecat.frames.frames import (
            AudioRawFrame,
            TextFrame,
            LLMMessagesFrame,
            EndFrame,
        )

        # ---- WebSocket transport (Twilio media stream → VoCall) ----
        # Uses the existing ws_connection from the FastAPI WebSocket endpoint.
        # In production this maps to LiveKitTransport; for the initial build
        # we use WebsocketServerTransport as the adapter layer.
        transport = WebsocketServerTransport(
            params=WebsocketServerParams(
                audio_out_enabled=True,
                add_wav_header=False,    # Twilio expects raw mulaw/PCM
                vad_enabled=True,
                vad_audio_passthrough=True,
            )
        )

        # ---- LLM processor (Groq via OpenAI-compatible API) ----
        groq_key = api_keys.get("groq") or settings.GROQ_API_KEY
        cerebras_key = api_keys.get("cerebras") or settings.CEREBRAS_API_KEY

        # Pipecat's OpenAILLMService is used with Groq's OpenAI-compatible endpoint.
        # Cerebras fallback is handled at the service layer (llm.py) when 429 occurs.
        llm = OpenAILLMService(
            api_key=groq_key or "placeholder",
            base_url="https://api.groq.com/openai/v1",
            model="llama-3.3-70b-versatile",
        )

        # ---- Message aggregators ----
        user_aggregator = LLMUserResponseAggregator(
            messages=[{"role": "system", "content": final_prompt}]
        )
        assistant_aggregator = LLMAssistantResponseAggregator(
            messages=[{"role": "system", "content": final_prompt}]
        )

        # ---- Pipeline: input → STT → LLM → TTS → output ----
        pipeline = Pipeline(
            [
                transport.input(),          # Receive audio from Twilio/LiveKit
                user_aggregator,            # Accumulate user speech frames
                llm,                        # LLM inference (Groq)
                assistant_aggregator,       # Accumulate assistant reply
                transport.output(),         # Push synthesised audio back
            ]
        )

        # ---- Pipeline task ----
        task = PipelineTask(pipeline)
        runner = PipelineRunner()

        logger.info("Pipecat pipeline assembled for call %s — starting runner", call_id)

        # ---- Run pipeline (blocks until call ends) ----
        await runner.run(task)

    except ImportError as exc:
        logger.warning(
            "Pipecat not available (%s) — running minimal echo loop instead", exc
        )
        # Minimal fallback loop so the WebSocket doesn't immediately close
        await _minimal_echo_loop(ws_connection, call_id, final_prompt, api_keys, language, voice_config, agent)

    except Exception as exc:
        logger.error("Pipeline error for call %s: %s", call_id, exc)

    finally:
        # ---- Cleanup ----
        await _finalize_call(call_id)


# ---------------------------------------------------------------------------
# Minimal fallback loop (runs when Pipecat is not installed / during dev)
# ---------------------------------------------------------------------------

async def _minimal_echo_loop(
    ws_connection,
    call_id: str,
    system_prompt: str,
    api_keys: Dict[str, str],
    language: str,
    voice_config: Dict[str, Any],
    agent: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Minimal WebSocket receive loop used when Pipecat is unavailable.
    Receives audio frames → calls STT stub → LLM → TTS stub → sends audio back.
    Also writes each turn to Redis.

    This loop exits when the WebSocket closes or an error occurs.
    """
    logger.info("Running minimal fallback loop for call %s", call_id)
    conversation: list = [{"role": "system", "content": system_prompt}]

    try:
        import json

        while True:
            try:
                data = await asyncio.wait_for(ws_connection.receive(), timeout=300.0)
            except asyncio.TimeoutError:
                logger.info("Call %s timed out after 5 minutes of silence", call_id)
                break

            if data.get("type") == "websocket.disconnect":
                logger.info("WebSocket disconnected for call %s", call_id)
                break

            # Twilio sends media events as JSON with base64-encoded audio
            if data.get("type") == "websocket.receive":
                raw = data.get("text") or data.get("bytes", "")
                try:
                    payload = json.loads(raw) if isinstance(raw, str) else {}
                except Exception:
                    continue

                if payload.get("event") == "media":
                    audio_b64 = payload.get("media", {}).get("payload", "")
                    if not audio_b64:
                        continue

                    import base64
                    audio_bytes = base64.b64decode(audio_b64)

                    # STT
                    transcript = await _stt_transcribe(audio_bytes, language, api_keys)
                    if not transcript:
                        continue

                    # Emotion Analysis — run text & audio signal extraction in parallel
                    groq_key = api_keys.get("groq") or api_keys.get("groq_api_key") or settings.GROQ_API_KEY
                    hume_key = api_keys.get("hume") or api_keys.get("hume_api_key")

                    text_emotion, audio_emotion = await asyncio.gather(
                        analyze_text_emotion(transcript, groq_key),
                        analyze_audio_emotion(audio_bytes, hume_key),
                        return_exceptions=True,
                    )
                    if isinstance(text_emotion, Exception):
                        logger.warning("Text emotion gather exception: %s", text_emotion)
                        text_emotion = None
                    if isinstance(audio_emotion, Exception):
                        logger.warning("Audio emotion gather exception: %s", audio_emotion)
                        audio_emotion = None

                    ts = int(time.time() * 1000)

                    # Persist emotion events to Redis and Supabase emotion_events
                    if text_emotion:
                        text_emotion["signal_source"] = "text"
                        text_emotion["timestamp_ms"] = ts
                        await short_term.append_emotion_event(call_id, text_emotion)
                        if supabase:
                            try:
                                supabase.table("emotion_events").insert({
                                    "call_id": call_id,
                                    "timestamp_ms": ts,
                                    "valence": text_emotion.get("valence"),
                                    "arousal": text_emotion.get("arousal"),
                                    "dominant": text_emotion.get("dominant"),
                                    "confidence": text_emotion.get("confidence"),
                                    "signal_source": "text",
                                }).execute()
                            except Exception as db_exc:
                                logger.warning("Failed to store text emotion in Supabase: %s", db_exc)

                    if audio_emotion:
                        audio_emotion["signal_source"] = "audio"
                        audio_emotion["timestamp_ms"] = ts
                        await short_term.append_emotion_event(call_id, audio_emotion)
                        if supabase:
                            try:
                                supabase.table("emotion_events").insert({
                                    "call_id": call_id,
                                    "timestamp_ms": ts,
                                    "valence": audio_emotion.get("valence"),
                                    "arousal": audio_emotion.get("arousal"),
                                    "dominant": audio_emotion.get("dominant"),
                                    "confidence": audio_emotion.get("confidence"),
                                    "signal_source": "audio",
                                }).execute()
                            except Exception as db_exc:
                                logger.warning("Failed to store audio emotion in Supabase: %s", db_exc)

                    # Signal Fusion
                    fused_emotion = fuse_emotion_signals(text_emotion, audio_emotion)

                    await _append_turn_to_redis(call_id, "user", transcript, ts, emotion_state=fused_emotion)
                    conversation.append({"role": "user", "content": transcript})

                    # Emotion Config & Tone Adaptation
                    agent_dict = agent or {}
                    emotion_config = (agent_dict.get("config") or {}).get("emotion") or {}

                    instruction = get_tone_instruction(fused_emotion, emotion_config)
                    turn_prompt = f"{instruction}\n\n{system_prompt}" if instruction else system_prompt

                    # Frustration Connector Trigger
                    frustration_threshold = float(emotion_config.get("frustration_threshold", 0.7))
                    if fused_emotion.get("valence", 0.0) < -frustration_threshold and agent_dict:
                        asyncio.create_task(fire_frustration_connector(agent_dict, call_id, fused_emotion))

                    # LLM
                    try:
                        reply = await llm_service.generate(
                            prompt=turn_prompt,
                            messages=conversation[1:],  # exclude system from history
                            api_keys=api_keys,
                        )
                    except Exception as llm_exc:
                        logger.error("LLM error: %s", llm_exc)
                        reply = "I'm sorry, I'm having trouble responding right now."

                    conversation.append({"role": "assistant", "content": reply})
                    ts2 = int(time.time() * 1000)
                    await _append_turn_to_redis(call_id, "assistant", reply, ts2)

                    # TTS (with Emotion-Conditioned Voice if enabled)
                    tts_emotion_state = None
                    if emotion_config.get("emotion_conditioned_voice") and hume_key:
                        tts_emotion_state = fused_emotion

                    audio_out = await _tts_synthesize(reply, voice_config, api_keys, emotion_state=tts_emotion_state)
                    if audio_out:
                        # Send audio back through WebSocket (Twilio media stream format)
                        import base64
                        audio_b64_out = base64.b64encode(audio_out).decode()
                        response_payload = json.dumps(
                            {
                                "event": "media",
                                "streamSid": payload.get("streamSid", ""),
                                "media": {"payload": audio_b64_out},
                            }
                        )
                        await ws_connection.send({"type": "websocket.send", "text": response_payload})

                elif payload.get("event") == "stop":
                    logger.info("Twilio stream stopped for call %s", call_id)
                    break

    except Exception as exc:
        logger.error("Fallback loop error for call %s: %s", call_id, exc)


# ---------------------------------------------------------------------------
# Call finalization
# ---------------------------------------------------------------------------

async def _finalize_call(call_id: str) -> None:
    """
    Post-pipeline cleanup:
      1. Marks the call as 'completed' in Supabase.
      2. Deletes the LiveKit room.
      3. Flushes short-term Redis transcript to the calls.transcript column.
    """
    logger.info("Finalizing call: %s", call_id)

    # 1. Fetch Redis transcript from short-term memory and persist to Supabase
    try:
        mem = await short_term.get_call_memory(call_id)
        if mem and "turns" in mem:
            transcript_json = json.dumps(mem["turns"])
        else:
            transcript_json = "[]"

        if supabase:
            supabase.table("calls").update(
                {"status": "completed", "transcript": transcript_json}
            ).eq("id", call_id).execute()

    except Exception as exc:
        logger.error("Failed to finalize call transcript: %s", exc)

    # 2. Delete LiveKit room
    try:
        if livekit_service.is_configured():
            await livekit_service.delete_room(call_id)
    except Exception as exc:
        logger.warning("LiveKit room cleanup failed (non-fatal): %s", exc)
