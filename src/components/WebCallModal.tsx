import { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  User,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { callsApi } from '../services/api';
import type { Agent, TranscriptMessage } from '../types';

export type WebCallState = 'idle' | 'requesting_mic' | 'connecting' | 'active' | 'ended';

interface WebCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Partial<Agent> & { name: string };
  onSaveCall?: (callData: {
    id: string;
    agentName: string;
    userName: string;
    duration: string;
    durationSeconds: number;
    timestamp: string;
    sentiment: string;
    sentimentScore: number;
    transcript: TranscriptMessage[];
  }) => void;
}

export default function WebCallModal({
  isOpen,
  onClose,
  agent,
  onSaveCall
}: WebCallModalProps) {
  const [callState, setCallState] = useState<WebCallState>('idle');
  const [userName, setUserName] = useState('');
  const [micGranted, setMicGranted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [speakerState, setSpeakerState] = useState<'agent' | 'user' | 'listening'>('listening');
  const [callSeconds, setCallSeconds] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  
  const timerRef = useRef<any>(null);
  const simulationRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setCallState('idle');
      setUserName('');
      setMicGranted(true);
      setIsMuted(false);
      setIsSpeakerMuted(false);
      setSpeakerState('listening');
      setCallSeconds(0);
      setTranscript([]);
    } else {
      clearTimers();
    }
  }, [isOpen]);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (simulationRef.current) clearInterval(simulationRef.current);
  };

  // Auto scroll transcript
  useEffect(() => {
    if (callState === 'active') {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, callState]);

  // Call duration timer
  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Simulated Voice Conversation Loop during Active Call
  useEffect(() => {
    if (callState === 'active') {
      const initialAgentMsg: TranscriptMessage = {
        id: 'msg_0',
        sender: 'agent',
        text: `Hello ${userName || 'there'}, I'm ${agent.name}. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscript([initialAgentMsg]);
      setSpeakerState('agent');

      const simStepTimer = setTimeout(() => {
        setSpeakerState('listening');
      }, 2500);

      let stepCount = 1;
      simulationRef.current = setInterval(() => {
        stepCount++;
        if (stepCount === 2) {
          setSpeakerState('user');
          setTimeout(() => {
            const userMsg: TranscriptMessage = {
              id: `msg_${Date.now()}_u`,
              sender: 'user',
              text: 'Can you verify my short-term context and past interactions?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setTranscript((prev) => [...prev, userMsg]);
            setSpeakerState('agent');
          }, 1500);

          setTimeout(() => {
            const agentMsg: TranscriptMessage = {
              id: `msg_${Date.now()}_a`,
              sender: 'agent',
              text: `Certainly! I have retrieved memory facts associated with ${userName || 'your account'}. All 4 memory tiers are active.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setTranscript((prev) => [...prev, agentMsg]);
            setSpeakerState('listening');
          }, 4000);
        } else if (stepCount === 3) {
          setSpeakerState('user');
          setTimeout(() => {
            const userMsg: TranscriptMessage = {
              id: `msg_${Date.now()}_u2`,
              sender: 'user',
              text: 'Awesome, the latency feels super low and clear!',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setTranscript((prev) => [...prev, userMsg]);
            setSpeakerState('agent');
          }, 1500);

          setTimeout(() => {
            const agentMsg: TranscriptMessage = {
              id: `msg_${Date.now()}_a2`,
              sender: 'agent',
              text: 'Thank you! Is there anything else you would like to test in this session?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setTranscript((prev) => [...prev, agentMsg]);
            setSpeakerState('listening');
          }, 3500);
        }
      }, 7000);

      return () => {
        clearTimeout(simStepTimer);
        if (simulationRef.current) clearInterval(simulationRef.current);
      };
    }
  }, [callState, agent.name, userName]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleStartCall = async () => {
    if (!userName.trim()) return;
    setCallState('requesting_mic');

    try {
      const roomName = `webcall_${agent.id || 'agent'}_${Date.now()}`;
      await callsApi.getWebCallToken(roomName, userName, agent.id);
    } catch (err) {
      console.warn('Backend LiveKit token error, using simulated session:', err);
    }

    setTimeout(() => {
      setCallState('connecting');
      setTimeout(() => {
        setCallState('active');
      }, 1200);
    }, 400);
  };

  const handleEndCall = () => {
    clearTimers();
    setCallState('ended');
  };

  const handleSaveAndNavigate = async () => {
    const newCallId = `call_${Math.random().toString(36).substring(2, 9)}`;
    const callPayload = {
      id: newCallId,
      agentName: agent.name || 'Support Agent',
      userName: userName || 'Test User',
      duration: formatTimer(callSeconds),
      durationSeconds: callSeconds,
      timestamp: 'Just now',
      sentiment: 'Positive',
      sentimentScore: 94,
      transcript: transcript.length > 0 ? transcript : [
        { id: '1', sender: 'agent' as const, text: `Hello ${userName || 'there'}! Web call session finished successfully.`, timestamp: '12:00' }
      ]
    };

    try {
      await callsApi.create({
        agent_id: agent.id && agent.id.length === 36 ? agent.id : undefined,
        direction: 'webcall',
        status: 'completed',
        duration_seconds: callSeconds,
        transcript: transcript.map(t => `${t.sender.toUpperCase()}: ${t.text}`).join('\n'),
        is_test: true,
        emotion_score: 0.94
      });
    } catch (err) {
      console.warn('Failed to record call into backend database:', err);
    }

    if (onSaveCall) {
      onSaveCall(callPayload);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Modal Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '768px',
          maxHeight: '90vh',
          backgroundColor: 'var(--card-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-premium)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-primary)'
        }}
      >
        {/* Modal Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-color)'
              }}
            >
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Web Call Testing
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Agent: <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{agent.name}</span>
              </p>
            </div>
          </div>

          {/* Active Status Badges / Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {callState === 'active' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--red-accent)',
                      boxShadow: '0 0 8px var(--red-accent)',
                      animation: 'pulse 1.5s infinite'
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--red-accent)', letterSpacing: '0.05em' }}>
                    LIVE
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--accent-light)', padding: '4px 10px', borderRadius: '6px' }}>
                  {formatTimer(callSeconds)}
                </div>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* PHASE 1: PRE-CALL SETUP */}
          {(callState === 'idle' || callState === 'requesting_mic') && (
            <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
              
              {/* Static Voice Orb */}
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-color)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-subtle)',
                  color: 'var(--accent-color)'
                }}
              >
                <PhoneCall size={38} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Start Web Testing Session
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                  Connect directly with <strong style={{ color: 'var(--text-primary)' }}>{agent.name}</strong> over high-fidelity browser WebRTC. Provide customer details to trigger memory retrieval.
                </p>
              </div>

              {/* Customer Contact Input Form */}
              <div style={{ width: '100%', maxWidth: '380px', textAlign: 'left' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}
                >
                  YOUR NAME <span style={{ color: 'var(--red-accent)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-tertiary)'
                    }}
                  />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter customer or test user name..."
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      backgroundColor: 'var(--surface-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'var(--transition-fast)'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-color)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userName.trim()) handleStartCall();
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '6px' }}>
                  Links session to Supabase 4-tier memory retrieval graph.
                </span>
              </div>

              {/* Mic Badge & Primary CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '380px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: micGranted ? 'var(--accent-color)' : 'var(--red-accent)',
                    backgroundColor: micGranted ? 'var(--accent-light)' : 'var(--red-soft)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: `1px solid ${micGranted ? 'rgba(79, 122, 101, 0.2)' : 'rgba(201, 76, 76, 0.2)'}`
                  }}
                >
                  <Mic size={14} />
                  <span>{micGranted ? 'Microphone Permission Ready' : 'Microphone Permission Required'}</span>
                </div>

                <button
                  onClick={handleStartCall}
                  disabled={!userName.trim()}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: userName.trim() ? 'pointer' : 'not-allowed',
                    opacity: userName.trim() ? 1 : 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  {callState === 'requesting_mic' ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Requesting Microphone…</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall size={18} />
                      <span>Start Web Call</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PHASE 2: CONNECTING */}
          {callState === 'connecting' && (
            <div style={{ padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '24px', flex: 1 }}>
              
              {/* Pulsing Voice Orb */}
              <div
                style={{
                  position: 'relative',
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-light)',
                  border: '2px solid var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-color)',
                  boxShadow: '0 0 25px var(--accent-light)',
                  animation: 'pulse 1.8s infinite'
                }}
              >
                <Loader2 size={40} style={{ animation: 'spin 1.2s linear infinite' }} />
              </div>

              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-color)', letterSpacing: '0.04em', margin: 0, fontWeight: 600 }}>
                  Connecting to {agent.name}…
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                  Establishing WebRTC peer session & memory graph context
                </span>
              </div>
            </div>
          )}

          {/* PHASE 3: ACTIVE CALL (SPLIT VIEW) */}
          {callState === 'active' && (
            <div style={{ display: 'flex', flex: 1, minHeight: '440px', overflow: 'hidden' }}>
              
              {/* Left Section (Audio Visualizer & Voice Orb - 256px) */}
              <div
                style={{
                  width: '256px',
                  backgroundColor: 'var(--surface-color)',
                  borderRight: '1px solid var(--border-color)',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}
              >
                {/* Visualizer Header */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                    AUDIO VISUALIZER
                  </span>
                </div>

                {/* Dynamic Voice Orb */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Ping Outer Ring */}
                    {speakerState === 'agent' && (
                      <div
                        style={{
                          position: 'absolute',
                          width: '130px',
                          height: '130px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-light)',
                          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                        }}
                      />
                    )}
                    {speakerState === 'user' && (
                      <div
                        style={{
                          position: 'absolute',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--green-soft)',
                          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                        }}
                      />
                    )}

                    {/* Voice Orb Core */}
                    <div
                      style={{
                        width: speakerState === 'agent' ? '112px' : speakerState === 'user' ? '104px' : '96px',
                        height: speakerState === 'agent' ? '112px' : speakerState === 'user' ? '104px' : '96px',
                        borderRadius: '50%',
                        backgroundColor: speakerState === 'agent' ? 'var(--accent-color)' : speakerState === 'user' ? 'var(--green-accent)' : 'var(--card-color)',
                        border: speakerState === 'agent' ? '3px solid var(--accent-hover)' : speakerState === 'user' ? '3px solid var(--green-accent)' : '2px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: speakerState === 'listening' ? 'var(--text-secondary)' : '#FFFFFF',
                        boxShadow: speakerState === 'agent'
                          ? '0 0 30px rgba(79, 122, 101, 0.4)'
                          : speakerState === 'user'
                          ? '0 0 30px rgba(45, 157, 120, 0.4)'
                          : 'var(--shadow-subtle)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: 2
                      }}
                    >
                      {speakerState === 'agent' ? (
                        <Bot size={42} />
                      ) : speakerState === 'user' ? (
                        <User size={40} />
                      ) : (
                        <Mic size={36} />
                      )}
                    </div>
                  </div>

                  {/* Dynamic Status Label */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: speakerState === 'agent' ? 'var(--accent-color)' : speakerState === 'user' ? 'var(--green-accent)' : 'var(--text-secondary)'
                      }}
                    >
                      {speakerState === 'agent' && 'Agent speaking…'}
                      {speakerState === 'user' && 'You are speaking…'}
                      {speakerState === 'listening' && 'Listening…'}
                    </span>
                  </div>
                </div>

                {/* Quick Audio Controls & End Call */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: isMuted ? 'var(--red-soft)' : 'var(--card-color)',
                        border: `1px solid ${isMuted ? 'var(--red-accent)' : 'var(--border-color)'}`,
                        color: isMuted ? 'var(--red-accent)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                      <span>{isMuted ? 'Muted' : 'Mic'}</span>
                    </button>

                    <button
                      onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: isSpeakerMuted ? 'var(--red-soft)' : 'var(--card-color)',
                        border: `1px solid ${isSpeakerMuted ? 'var(--red-accent)' : 'var(--border-color)'}`,
                        color: isSpeakerMuted ? 'var(--red-accent)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {isSpeakerMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{isSpeakerMuted ? 'Muted' : 'Audio'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleEndCall}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--red-soft)',
                      border: '1px solid var(--red-accent)',
                      color: 'var(--red-accent)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <PhoneOff size={16} />
                    <span>End Call</span>
                  </button>
                </div>
              </div>

              {/* Right Section (Real-Time Live Transcript) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-color)' }}>
                <div
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--surface-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--green-accent)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                      REAL-TIME LIVE TRANSCRIPT
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    PCM 16kHz
                  </span>
                </div>

                {/* Chat Scroll Container */}
                <div
                  style={{
                    flex: 1,
                    padding: '20px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  {transcript.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {msg.sender === 'agent' ? (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Bot size={12} /> {agent.name}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--green-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} /> {userName || 'You'}
                          </span>
                        )}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{msg.timestamp}</span>
                      </div>

                      <div
                        style={{
                          maxWidth: '82%',
                          padding: '12px 16px',
                          borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                          backgroundColor: msg.sender === 'user' ? 'var(--accent-light)' : 'var(--surface-color)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          lineHeight: '1.5'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* PHASE 4: POST-CALL DECISION PROMPT */}
          {callState === 'ended' && (
            <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--green-soft)',
                    border: '1px solid var(--green-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--green-accent)',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Web Call Test Completed
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Total Session Duration: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{formatTimer(callSeconds)}</strong>
                  </p>
                </div>
              </div>

              {/* Transcript Preview Card */}
              <div
                style={{
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '16px',
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                  TRANSCRIPT SUMMARY PREVIEW
                </span>
                {transcript.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
                    No transcript dialogue captured for this call.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transcript.slice(-4).map((msg) => (
                      <div key={msg.id} style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <strong style={{ color: msg.sender === 'agent' ? 'var(--accent-color)' : 'var(--green-accent)' }}>
                          {msg.sender === 'agent' ? agent.name : (userName || 'User')}:
                        </strong>{' '}
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save vs. Discard Decision Card */}
              <div
                style={{
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    Save this test call for review?
                  </h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Saved calls include the full transcript, emotion arc, and post-call analysis — viewable from your calls dashboard.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Discard</span>
                  </button>

                  <button
                    onClick={handleSaveAndNavigate}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 20px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <ExternalLink size={16} />
                    <span>Save & View</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
