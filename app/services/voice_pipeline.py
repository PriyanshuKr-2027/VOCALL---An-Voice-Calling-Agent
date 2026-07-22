"""
VoCall Real-Time Voice Pipeline using Pipecat.

start_pipeline(call_id, agent_id, contact_id, ws_connection):
  Assembles and runs a Pipecat pipeline:

  LiveKitTransport (audio input)
    → STT stage
    → LLMUserResponseAggregator
    → LLM stage  (Groq → Cerebras fallback via llm.py with tools support)
    → TTS stage
    → LiveKitTransport (audio output)

  Each completed turn is written to Redis via short_term.append_turn()
"""

import asyncio
import json
import logging
import time
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.services.emotion import (
    analyze_audio_emotion,
    analyze_text_emotion,
    fire_frustration_connector,
    fire_threshold_connectors,
    fuse_emotion_signals,
    get_tone_instruction,
)
from app.services.livekit_service import livekit_service
from app.services.llm import llm_service
from app.services.memory import short_term
from app.services.redis_client import redis_client
from app.services.stt import transcribe_audio
from app.services.supabase_client import supabase
from app.services.tts import synthesize_speech

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Connector & Active Tools Loader
# ---------------------------------------------------------------------------

async def get_active_tools(org_id: str, agent_id: str) -> List[Dict[str, Any]]:
    """
    1. Fetches all connector_configs for org/agent where is_enabled = True and connector_type
       IN ("google_calendar", "supabase", "postgres", "custom_webhook").
    2. Imports corresponding TOOL_SCHEMA from connector services.
    3. Returns the list of tool schemas.
    """
    if not supabase or not org_id:
        return []

    try:
        res = (
            supabase.table("connector_configs")
            .select("connector_type, config, agent_id, is_enabled")
            .eq("org_id", str(org_id))
            .eq("is_enabled", True)
            .in_("connector_type", ["google_calendar", "supabase", "postgres", "custom_webhook"])
            .execute()
        )

        rows = res.data or []
        enabled_types = set()
        for row in rows:
            row_agent = row.get("agent_id")
            if not row_agent or str(row_agent) == str(agent_id):
                enabled_types.add(row.get("connector_type"))

        tools = []
        if "google_calendar" in enabled_types:
            try:
                from app.services.connectors.google_cal import TOOL_SCHEMA as cal_tools
                tools.extend(cal_tools)
            except Exception as e:
                logger.warning("Failed to load google_calendar TOOL_SCHEMA: %s", e)

        if "supabase" in enabled_types or "postgres" in enabled_types:
            try:
                from app.services.connectors.supabase_conn import TOOL_SCHEMA as db_tools
                for t in db_tools:
                    fname = t.get("function", {}).get("name")
                    if fname == "query_supabase" and "supabase" in enabled_types:
                        tools.append(t)
                    elif fname == "query_postgres" and "postgres" in enabled_types:
                        tools.append(t)
            except Exception as e:
                logger.warning("Failed to load supabase/postgres TOOL_SCHEMA: %s", e)

        if "custom_webhook" in enabled_types:
            try:
                from app.services.connectors.webhook import DURING_CALL_TOOL_SCHEMA as wh_tools
                tools.extend(wh_tools)
            except Exception as e:
                logger.warning("Failed to load webhook TOOL_SCHEMA: %s", e)

        return tools

    except Exception as exc:
        logger.error("Error fetching active tools for org %s: %s", org_id, exc)
        return []


async def handle_tool_call(tool_name: str, tool_args: dict, org_id: str, agent_id: str) -> str:
    """
    Dispatches tool call to correct connector service using stored config.
    Returns string result to be read back into conversation.
    """
    if not supabase or not org_id:
        return json.dumps({"success": False, "error": "Database unavailable"})

    connector_type = None
    if tool_name in ("check_availability", "book_appointment"):
        connector_type = "google_calendar"
    elif tool_name == "query_supabase":
        connector_type = "supabase"
    elif tool_name == "query_postgres":
        connector_type = "postgres"
    elif tool_name == "fire_webhook":
        connector_type = "custom_webhook"

    if not connector_type:
        return json.dumps({"success": False, "error": f"Unknown tool name '{tool_name}'"})

    config = {}
    try:
        res = (
            supabase.table("connector_configs")
            .select("*")
            .eq("org_id", str(org_id))
            .eq("connector_type", connector_type)
            .execute()
        )
        rows = res.data or []
        if rows:
            agent_rows = [r for r in rows if r.get("agent_id") and str(r.get("agent_id")) == str(agent_id)]
            target_row = agent_rows[0] if agent_rows else rows[0]
            from app.utils.encryption import decrypt_dict
            config = decrypt_dict(target_row.get("config", {}))
    except Exception as e:
        logger.warning("Error fetching connector config for tool %s: %s", tool_name, e)

    try:
        if tool_name == "check_availability":
            from app.services.connectors.google_cal import check_availability
            creds_json = tool_args.get("credentials_json") or config.get("credentials_json", "{}")
            cal_id = tool_args.get("calendar_id") or config.get("calendar_id", "primary")
            tz = tool_args.get("timezone") or config.get("timezone", "Asia/Kolkata")
            slots = await check_availability(creds_json, cal_id, tool_args.get("date_str", ""), tz)
            return json.dumps({"success": True, "free_slots": slots})

        elif tool_name == "book_appointment":
            from app.services.connectors.google_cal import book_appointment
            creds_json = tool_args.get("credentials_json") or config.get("credentials_json", "{}")
            cal_id = tool_args.get("calendar_id") or config.get("calendar_id", "primary")
            tz = tool_args.get("timezone") or config.get("timezone", "Asia/Kolkata")
            res_dict = await book_appointment(
                creds_json,
                cal_id,
                tool_args.get("start_time", ""),
                tool_args.get("end_time", ""),
                tool_args.get("summary", "Appointment"),
                tool_args.get("attendee_email"),
                tz,
            )
            return json.dumps(res_dict)

        elif tool_name == "query_supabase":
            from app.services.connectors.supabase_conn import query_supabase
            url = tool_args.get("url") or config.get("url", "")
            anon_key = tool_args.get("anon_key") or config.get("anon_key", "")
            res_dict = await query_supabase(
                url,
                anon_key,
                tool_args.get("table_name", ""),
                tool_args.get("query_column", ""),
                tool_args.get("query_value", ""),
            )
            return json.dumps(res_dict)

        elif tool_name == "query_postgres":
            from app.services.connectors.supabase_conn import query_postgres
            conn_str = tool_args.get("connection_string") or config.get("connection_string", "")
            q_tmpl = tool_args.get("query_template") or config.get("query_template", "")
            res_dict = await query_postgres(conn_str, q_tmpl, tool_args.get("contact_phone", ""))
            return json.dumps(res_dict)

        elif tool_name == "fire_webhook":
            from app.services.connectors.webhook import fire_webhook
            url = tool_args.get("url") or config.get("webhook_url") or config.get("url", "")
            payload = tool_args.get("payload") or {}
            headers = config.get("headers", {})
            res_dict = await fire_webhook(url=url, method="POST", headers=headers, payload=payload)
            return json.dumps(res_dict)

        else:
            return json.dumps({"success": False, "error": f"Unhandled tool '{tool_name}'"})

    except Exception as exc:
        return json.dumps({"success": False, "error": str(exc)})


# ---------------------------------------------------------------------------
# STT & TTS Routing Wrappers
# ---------------------------------------------------------------------------

async def _stt_transcribe(
    audio_bytes: bytes,
    language: str,
    api_keys: Dict[str, str],
) -> str:
    return await transcribe_audio(audio_bytes, language, api_keys)


async def _tts_synthesize(
    text: str,
    voice_config: Dict[str, Any],
    api_keys: Dict[str, str],
    emotion_state: Optional[Dict[str, Any]] = None,
) -> bytes:
    return await synthesize_speech(text, voice_config, api_keys, emotion_state)


async def _append_turn_to_redis(
    call_id: str,
    role: str,
    content: str,
    timestamp_ms: int,
    emotion_state: Optional[Dict[str, Any]] = None,
) -> None:
    await short_term.append_turn(
        call_id=call_id,
        role=role,
        content=content,
        emotion_state=emotion_state,
    )


async def _load_agent_config(agent_id: str) -> Dict[str, Any]:
    if not supabase or not agent_id:
        return {}
    try:
        res = supabase.table("agents").select("*").eq("id", agent_id).single().execute()
        return res.data or {}
    except Exception as exc:
        logger.error("Failed to load agent config for %s: %s", agent_id, exc)
        return {}


async def _load_org_api_keys(org_id: str) -> Dict[str, str]:
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
    ws_connection,
) -> None:
    """
    Builds and runs the VoCall real-time voice pipeline for a single call.
    """
    logger.info("Starting voice pipeline: call_id=%s agent_id=%s", call_id, agent_id)

    agent = await _load_agent_config(agent_id)
    org_id: str = agent.get("org_id", "")
    system_prompt: str = agent.get("system_prompt") or "You are a helpful AI voice assistant."
    language: str = agent.get("language") or "en"
    final_prompt: str = system_prompt
    if language in ["hi", "hinglish"]:
        final_prompt += (
            "\n\nLANGUAGE INSTRUCTION: Respond in the same language mix the "
            "caller uses — Hindi, English, or Hinglish code-switching."
        )
    voice_config: Dict[str, Any] = {
        "voice_id": agent.get("voice_id"),
        "voice_provider": agent.get("voice_provider", "cartesia"),
    }

    api_keys = await _load_org_api_keys(org_id)
    await short_term.init_call_memory(call_id)

    if livekit_service.is_configured():
        try:
            await livekit_service.create_room(call_id)
        except Exception as exc:
            logger.warning("LiveKit room pre-creation skipped: %s", exc)

    if supabase:
        try:
            supabase.table("calls").update({"status": "in_progress"}).eq("id", call_id).execute()
        except Exception as exc:
            logger.warning("Failed to update call status to in_progress: %s", exc)

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

        transport = WebsocketServerTransport(
            params=WebsocketServerParams(
                audio_out_enabled=True,
                add_wav_header=False,
                vad_enabled=True,
                vad_audio_passthrough=True,
            )
        )

        groq_key = api_keys.get("groq") or settings.GROQ_API_KEY
        llm = OpenAILLMService(
            api_key=groq_key or "placeholder",
            base_url="https://api.groq.com/openai/v1",
            model="llama-3.3-70b-versatile",
        )

        user_aggregator = LLMUserResponseAggregator(
            messages=[{"role": "system", "content": final_prompt}]
        )
        assistant_aggregator = LLMAssistantResponseAggregator(
            messages=[{"role": "system", "content": final_prompt}]
        )

        pipeline = Pipeline(
            [
                transport.input(),
                user_aggregator,
                llm,
                assistant_aggregator,
                transport.output(),
            ]
        )

        task = PipelineTask(pipeline)
        runner = PipelineRunner()
        await runner.run(task)

    except ImportError as exc:
        logger.warning(
            "Pipecat not available (%s) — running minimal echo loop with tools support", exc
        )
        await _minimal_echo_loop(
            ws_connection, call_id, agent_id, org_id, final_prompt, api_keys, language, voice_config, agent
        )

    except Exception as exc:
        logger.error("Pipeline error for call %s: %s", call_id, exc)

    finally:
        await _finalize_call(call_id)


# ---------------------------------------------------------------------------
# Minimal fallback loop (with tool execution support)
# ---------------------------------------------------------------------------

async def _minimal_echo_loop(
    ws_connection,
    call_id: str,
    agent_id: str,
    org_id: str,
    system_prompt: str,
    api_keys: Dict[str, str],
    language: str,
    voice_config: Dict[str, Any],
    agent: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Minimal WebSocket receive loop with active tools & tool_call handling.
    """
    logger.info("Running minimal fallback loop for call %s (org_id=%s, agent_id=%s)", call_id, org_id, agent_id)
    conversation: list = [{"role": "system", "content": system_prompt}]

    try:
        while True:
            try:
                data = await asyncio.wait_for(ws_connection.receive(), timeout=300.0)
            except asyncio.TimeoutError:
                logger.info("Call %s timed out after 5 minutes of silence", call_id)
                break

            if data.get("type") == "websocket.disconnect":
                logger.info("WebSocket disconnected for call %s", call_id)
                break

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

                    # 1. STT Transcription
                    transcript = await _stt_transcribe(audio_bytes, language, api_keys)
                    if not transcript:
                        continue

                    # 2. Emotion Analysis
                    groq_key = api_keys.get("groq") or api_keys.get("groq_api_key") or settings.GROQ_API_KEY
                    hume_key = api_keys.get("hume") or api_keys.get("hume_api_key")

                    text_emotion, audio_emotion = await asyncio.gather(
                        analyze_text_emotion(transcript, groq_key),
                        analyze_audio_emotion(audio_bytes, hume_key),
                        return_exceptions=True,
                    )
                    if isinstance(text_emotion, Exception):
                        text_emotion = None
                    if isinstance(audio_emotion, Exception):
                        audio_emotion = None

                    ts = int(time.time() * 1000)

                    # Persist emotion events
                    if text_emotion:
                        text_emotion["signal_source"] = "text"
                        text_emotion["timestamp_ms"] = ts
                        await short_term.append_emotion_event(call_id, text_emotion)

                    if audio_emotion:
                        audio_emotion["signal_source"] = "audio"
                        audio_emotion["timestamp_ms"] = ts
                        await short_term.append_emotion_event(call_id, audio_emotion)

                    fused_emotion = fuse_emotion_signals(text_emotion, audio_emotion)

                    await _append_turn_to_redis(call_id, "user", transcript, ts, emotion_state=fused_emotion)
                    conversation.append({"role": "user", "content": transcript})

                    # Emotion Config & Tone Adaptation
                    agent_dict = agent or {}
                    emotion_config = (agent_dict.get("config") or {}).get("emotion") or {}
                    instruction = get_tone_instruction(fused_emotion, emotion_config)
                    turn_prompt = f"{instruction}\n\n{system_prompt}" if instruction else system_prompt

                    # Frustration Threshold Connectors Trigger (Slack & Webhook)
                    asyncio.create_task(
                        fire_threshold_connectors(
                            org_id=org_id,
                            agent_id=agent_id,
                            call_id=call_id,
                            emotion_state=fused_emotion,
                            contact={"name": "Caller", "phone": "Unknown"},
                            agent=agent_dict,
                            last_transcript_line=transcript,
                        )
                    )

                    # 3. LLM Call turn with active tools
                    active_tools = await get_active_tools(org_id, agent_id)
                    llm_kwargs = {}
                    if active_tools:
                        llm_kwargs["tools"] = active_tools

                    try:
                        llm_res = await llm_service.generate(
                            prompt=turn_prompt,
                            messages=conversation[1:],
                            api_keys=api_keys,
                            **llm_kwargs,
                        )
                    except Exception as llm_exc:
                        logger.error("LLM error: %s", llm_exc)
                        llm_res = "I'm sorry, I'm having trouble responding right now."

                    reply = ""
                    tool_calls = None
                    if isinstance(llm_res, dict):
                        reply = llm_res.get("content") or ""
                        tool_calls = llm_res.get("tool_calls")
                    else:
                        reply = str(llm_res or "")

                    # 4. Handle Tool Calls if generated by LLM
                    if tool_calls:
                        for tc in tool_calls:
                            func = tc.get("function", {})
                            t_name = func.get("name", "")
                            t_args_raw = func.get("arguments", {})
                            if isinstance(t_args_raw, str):
                                try:
                                    t_args = json.loads(t_args_raw)
                                except Exception:
                                    t_args = {}
                            else:
                                t_args = t_args_raw or {}

                            conversation.append({
                                "role": "assistant",
                                "content": reply,
                                "tool_calls": [tc],
                            })

                            # Execute tool call
                            tool_result_str = await handle_tool_call(t_name, t_args, org_id, agent_id)

                            conversation.append({
                                "role": "tool",
                                "tool_call_id": tc.get("id", "call_1"),
                                "name": t_name,
                                "content": tool_result_str,
                            })

                            # Make one more LLM call to get final spoken response
                            try:
                                final_llm_res = await llm_service.generate(
                                    prompt=turn_prompt,
                                    messages=conversation[1:],
                                    api_keys=api_keys,
                                )
                                if isinstance(final_llm_res, dict):
                                    reply = final_llm_res.get("content") or ""
                                else:
                                    reply = str(final_llm_res or "")
                            except Exception as exc2:
                                logger.error("Error in post-tool LLM response: %s", exc2)
                                reply = reply or "I completed the action."

                    conversation.append({"role": "assistant", "content": reply})
                    ts2 = int(time.time() * 1000)
                    await _append_turn_to_redis(call_id, "assistant", reply, ts2)

                    # 5. TTS Speech Synthesis
                    tts_emotion_state = fused_emotion if emotion_config.get("emotion_conditioned_voice") and hume_key else None
                    audio_out = await _tts_synthesize(reply, voice_config, api_keys, emotion_state=tts_emotion_state)

                    if audio_out:
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
    logger.info("Finalizing call: %s", call_id)

    try:
        mem = await short_term.get_call_memory(call_id)
        transcript_json = json.dumps(mem["turns"]) if mem and "turns" in mem else "[]"

        if supabase:
            supabase.table("calls").update(
                {"status": "completed", "transcript": transcript_json}
            ).eq("id", call_id).execute()

    except Exception as exc:
        logger.error("Failed to finalize call transcript: %s", exc)

    try:
        if livekit_service.is_configured():
            await livekit_service.delete_room(call_id)
    except Exception as exc:
        logger.warning("LiveKit room cleanup failed: %s", exc)
