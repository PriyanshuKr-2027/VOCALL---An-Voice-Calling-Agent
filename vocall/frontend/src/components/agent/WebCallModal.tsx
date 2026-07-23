'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
  Bot,
  Save,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CallPhase = 'idle' | 'requesting_mic' | 'connecting' | 'active' | 'ending' | 'ended';

interface TranscriptTurn {
  speaker: 'user' | 'agent';
  text: string;
  timestamp: number;
}

interface WebCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  orgId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ---------------------------------------------------------------------------
// Animated Orb component
// ---------------------------------------------------------------------------

function VoiceOrb({
  phase,
  isSpeaking,
}: {
  phase: CallPhase;
  isSpeaking: 'agent' | 'user' | 'idle';
}) {
  const isActive = phase === 'active';
  const agentSpeaking = isSpeaking === 'agent';
  const userSpeaking = isSpeaking === 'user';

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* Outer pulse ring */}
      {isActive && (
        <>
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              agentSpeaking
                ? 'bg-[#7C3AED]/20 animate-ping'
                : 'bg-[#7C3AED]/10'
            }`}
            style={{ animationDuration: '1.2s' }}
          />
          <div
            className={`absolute inset-3 rounded-full transition-all duration-300 ${
              userSpeaking
                ? 'bg-emerald-500/20 animate-ping'
                : 'bg-transparent'
            }`}
            style={{ animationDuration: '0.9s' }}
          />
        </>
      )}

      {/* Core orb */}
      <div
        className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-500 ${
          phase === 'idle' || phase === 'requesting_mic'
            ? 'w-24 h-24 bg-slate-800 border-2 border-slate-600'
            : phase === 'connecting'
            ? 'w-24 h-24 bg-[#7C3AED]/30 border-2 border-[#7C3AED]/60 animate-pulse'
            : agentSpeaking
            ? 'w-28 h-28 bg-[#7C3AED] border-2 border-[#7C3AED] shadow-2xl shadow-[#7C3AED]/50'
            : userSpeaking
            ? 'w-26 h-26 bg-emerald-600 border-2 border-emerald-400 shadow-xl shadow-emerald-500/40'
            : 'w-24 h-24 bg-[#7C3AED]/40 border-2 border-[#7C3AED]/60'
        }`}
      >
        {phase === 'idle' || phase === 'requesting_mic' ? (
          <PhoneCall className="w-10 h-10 text-slate-400" />
        ) : phase === 'connecting' ? (
          <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
        ) : agentSpeaking ? (
          <Bot className="w-10 h-10 text-white" />
        ) : userSpeaking ? (
          <Mic className="w-10 h-10 text-white" />
        ) : (
          <Bot className="w-8 h-8 text-[#A78BFA]" />
        )}
      </div>

      {/* Speaking label */}
      {isActive && (
        <div className="absolute -bottom-8 text-xs font-mono text-center">
          {agentSpeaking ? (
            <span className="text-[#A78BFA]">Agent speaking…</span>
          ) : userSpeaking ? (
            <span className="text-emerald-400">You are speaking…</span>
          ) : (
            <span className="text-slate-500">Listening…</span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main WebCallModal
// ---------------------------------------------------------------------------

export default function WebCallModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  orgId,
}: WebCallModalProps) {
  const router = useRouter();

  // Call state
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<'agent' | 'user' | 'idle'>('idle');
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [finalDuration, setFinalDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Contact name — used to look up / create a contact so memory tiers activate
  const [contactName, setContactName] = useState('');

  // Refs
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const roomRef = useRef<any>(null); // livekit Room instance
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      _cleanup(false);
      setPhase('idle');
      setTranscript([]);
      setElapsed(0);
      setErrorMsg(null);
      setCallId(null);
      setFinalDuration(0);
      setMicOk(null);
      setContactName('');
    }
  }, [isOpen]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Elapsed timer
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  const _cleanup = useCallback((closeRoom = true) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    if (roomRef.current && closeRoom) {
      try {
        roomRef.current.disconnect();
      } catch (_) {}
      roomRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.remove();
      audioRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Step 1 — Check mic permission
  // ---------------------------------------------------------------------------

  const checkMic = async () => {
    setPhase('requesting_mic');
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicOk(true);
      startCall();
    } catch (err) {
      setMicOk(false);
      setErrorMsg('Microphone access denied. Please allow mic in your browser settings and retry.');
      setPhase('idle');
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2 — Start the call
  // ---------------------------------------------------------------------------

  const startCall = async () => {
    setPhase('connecting');
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/calls/webcall/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          org_id: orgId,
          participant_name: contactName.trim() || 'tester',
          contact_name: contactName.trim() || 'Test User',
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      const { call_id, room_name, token, livekit_url } = data;
      setCallId(call_id);

      // Connect to LiveKit
      await _connectLiveKit(livekit_url, token, room_name, call_id);

      // Subscribe to SSE transcript stream
      _subscribeSSE(call_id);

      setPhase('active');
      setElapsed(0);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start call. Check backend connection.');
      setPhase('idle');
    }
  };

  // ---------------------------------------------------------------------------
  // LiveKit connection
  // ---------------------------------------------------------------------------

  const _connectLiveKit = async (
    livekitUrl: string,
    token: string,
    roomName: string,
    call_id: string,
  ) => {
    try {
      const { Room, RoomEvent, createLocalAudioTrack } = await import('livekit-client');

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Play agent audio when track is subscribed
      room.on(RoomEvent.TrackSubscribed, (track: any) => {
        if (track.kind === 'audio') {
          const el = track.attach() as HTMLAudioElement;
          el.autoplay = true;
          document.body.appendChild(el);
          audioRef.current = el;
          setIsSpeaking('agent');
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, () => {
        setIsSpeaking('idle');
      });

      room.on(RoomEvent.Disconnected, () => {
        if (phase === 'active') {
          setPhase('ending');
          handleEndCall();
        }
      });

      // Data messages from agent (transcript, audio chunks)
      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload));
          if (msg.type === 'transcript') {
            setTranscript((prev) => [
              ...prev,
              { speaker: msg.speaker, text: msg.text, timestamp: msg.timestamp },
            ]);
            setIsSpeaking(msg.speaker as 'agent' | 'user');
            setTimeout(() => setIsSpeaking('idle'), 2000);
          }
        } catch (_) {}
      });

      await room.connect(livekitUrl, token);
      roomRef.current = room;

      // Publish mic
      const audioTrack = await createLocalAudioTrack({ echoCancellation: true, noiseSuppression: true });
      await room.localParticipant.publishTrack(audioTrack);

      // Detect when user is speaking via audio track level
      setIsSpeaking('idle');
    } catch (err: any) {
      console.error('LiveKit connection error:', err);
      // Non-fatal — call still works via SSE transcript; audio may not play
    }
  };

  // ---------------------------------------------------------------------------
  // SSE transcript subscription
  // ---------------------------------------------------------------------------

  const _subscribeSSE = (call_id: string) => {
    const es = new EventSource(`${API_BASE}/calls/webcall/${call_id}/events`);

    es.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data);

        if (ev.type === 'transcript') {
          setTranscript((prev) => {
            // Deduplicate: skip if same speaker+text in last 500ms
            const last = prev[prev.length - 1];
            if (last && last.speaker === ev.speaker && last.text === ev.text) return prev;
            return [
              ...prev,
              { speaker: ev.speaker, text: ev.text, timestamp: ev.ts || Date.now() },
            ];
          });
          setIsSpeaking(ev.speaker);
          setTimeout(() => setIsSpeaking('idle'), 2500);
        }

        if (ev.type === 'status' && ev.state === 'ended') {
          es.close();
        }
      } catch (_) {}
    };

    es.onerror = () => {
      console.warn('SSE connection error — transcript may be delayed');
    };

    sseRef.current = es;
  };

  // ---------------------------------------------------------------------------
  // End call
  // ---------------------------------------------------------------------------

  const handleEndCall = useCallback(async () => {
    if (phase === 'ending' || phase === 'ended') return;
    setPhase('ending');

    _cleanup(true);

    if (!callId) {
      setPhase('ended');
      setFinalDuration(elapsed);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/calls/webcall/${callId}/end?org_id=${encodeURIComponent(orgId)}`,
        { method: 'DELETE' },
      );
      if (res.ok) {
        const data = await res.json();
        setFinalDuration(data.duration_seconds || elapsed);
      } else {
        setFinalDuration(elapsed);
      }
    } catch (_) {
      setFinalDuration(elapsed);
    }

    setPhase('ended');
  }, [callId, elapsed, orgId, phase, _cleanup]);

  // ---------------------------------------------------------------------------
  // Save / Discard
  // ---------------------------------------------------------------------------

  const handleDiscard = async () => {
    if (callId) {
      try {
        await fetch(`${API_BASE}/calls/${callId}`, { method: 'DELETE' });
      } catch (_) {}
    }
    onClose();
  };

  const handleSaveAndView = async () => {
    if (!callId) return onClose();
    setIsSaving(true);
    try {
      // Mark as saved (update is_test flag or just navigate)
      await fetch(`${API_BASE}/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      }).catch(() => {});
      router.push(`/dashboard/calls/${callId}`);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {phase === 'active' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono text-red-400 font-semibold">LIVE</span>
              </span>
            )}
            <span className="text-sm font-semibold text-white">
              {phase === 'idle' || phase === 'requesting_mic'
                ? 'Talk To Agent'
                : phase === 'connecting'
                ? 'Connecting…'
                : phase === 'active'
                ? agentName
                : phase === 'ending'
                ? 'Ending call…'
                : 'Call Ended'}
            </span>
            {phase === 'active' && (
              <span className="font-mono text-sm text-slate-400">
                {formatTime(elapsed)}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (phase === 'active') handleEndCall();
              else onClose();
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── PHASE: IDLE ── */}
        {(phase === 'idle' || phase === 'requesting_mic') && (
          <div className="flex flex-col items-center justify-center gap-6 py-12 px-8">
            <VoiceOrb phase={phase} isSpeaking="idle" />

            <div className="text-center mt-10">
              <h2 className="text-lg font-semibold text-white mb-1">
                Talk to <span className="text-[#A78BFA]">{agentName}</span>
              </h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Start a live browser voice call to test your agent's responses, integrations, and emotion handling in real time.
              </p>
            </div>

            {/* Contact name input — enables contact-level memory */}
            <div className="w-full max-w-xs">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && contactName.trim() && checkMic()}
                  placeholder="e.g. Priya Sharma"
                  maxLength={60}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-600 font-mono">
                Used to load your contact memory for this agent
              </p>
            </div>

            {/* Mic status */}
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${
              micOk === false
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
              {micOk === false ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Microphone access denied
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#A78BFA]" />
                  Browser microphone required
                </>
              )}
            </div>

            {errorMsg && (
              <p className="text-sm text-red-400 text-center max-w-sm">{errorMsg}</p>
            )}

            <Button
              onClick={checkMic}
              disabled={phase === 'requesting_mic' || !contactName.trim()}
              className="gap-2 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold px-8 h-11 rounded-full shadow-lg shadow-[#7C3AED]/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {phase === 'requesting_mic' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Requesting mic…</>
              ) : (
                <><PhoneCall className="w-4 h-4" /> Start Web Call</>
              )}
            </Button>
          </div>
        )}

        {/* ── PHASE: CONNECTING ── */}
        {phase === 'connecting' && (
          <div className="flex flex-col items-center justify-center gap-6 py-16 px-8">
            <VoiceOrb phase="connecting" isSpeaking="idle" />
            <p className="mt-10 text-sm text-slate-400 font-mono animate-pulse">
              Connecting to {agentName}…
            </p>
          </div>
        )}

        {/* ── PHASE: ACTIVE ── */}
        {phase === 'active' && (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left — orb */}
            <div className="flex flex-col items-center justify-center gap-8 px-8 py-10 w-64 flex-shrink-0 border-r border-slate-800">
              <VoiceOrb phase="active" isSpeaking={isSpeaking} />

              <button
                onClick={handleEndCall}
                className="mt-10 flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition px-5 py-2.5 text-sm font-semibold"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </div>

            {/* Right — transcript */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Live Transcript
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
                {transcript.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm font-mono gap-2">
                    <Mic className="w-6 h-6" />
                    <span>Transcript will appear here…</span>
                  </div>
                ) : (
                  transcript.map((turn, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${turn.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        turn.speaker === 'agent'
                          ? 'bg-[#7C3AED]/30 text-[#A78BFA]'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {turn.speaker === 'agent' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        turn.speaker === 'agent'
                          ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                          : 'bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-slate-200 rounded-tr-sm'
                      }`}>
                        {turn.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* ── PHASE: ENDING ── */}
        {phase === 'ending' && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
            <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
            <p className="text-sm text-slate-400 font-mono">Ending call…</p>
          </div>
        )}

        {/* ── PHASE: ENDED — Save / Discard ── */}
        {phase === 'ended' && (
          <div className="flex flex-col items-center justify-center gap-6 py-12 px-8">
            <div className="w-16 h-16 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#A78BFA]" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">
                Call Ended
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-mono">
                Duration: {formatTime(finalDuration || elapsed)}
              </p>
            </div>

            {/* Transcript summary preview */}
            {transcript.length > 0 && (
              <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800/50 divide-y divide-slate-700/50 max-h-40 overflow-y-auto">
                {transcript.slice(-4).map((t, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 text-xs">
                    <span className={`font-semibold flex-shrink-0 ${t.speaker === 'agent' ? 'text-[#A78BFA]' : 'text-emerald-400'}`}>
                      {t.speaker === 'agent' ? 'Agent' : 'You'}:
                    </span>
                    <span className="text-slate-300 line-clamp-2">{t.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Save prompt */}
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800/60 p-5 text-center">
              <p className="text-sm font-semibold text-white mb-1">
                Save this test call for review?
              </p>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Saved calls include the full transcript, emotion arc, and post-call analysis — viewable from your calls dashboard.
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-full px-5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Discard
                </Button>

                <Button
                  onClick={handleSaveAndView}
                  disabled={isSaving}
                  className="gap-2 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold rounded-full px-5 shadow-lg shadow-[#7C3AED]/30"
                >
                  {isSaving ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                  ) : (
                    <><ExternalLink className="w-3.5 h-3.5" /> Save &amp; View</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
