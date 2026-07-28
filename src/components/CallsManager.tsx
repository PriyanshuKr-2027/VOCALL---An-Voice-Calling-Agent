import { useState } from 'react';
import {
  Phone,
  Calendar,
  Clock,
  User,
  Bot,
  Activity,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Database,
  FileJson
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';
import type { Call } from '../types';

interface CallsManagerProps {
  call: Call;
  onBackToList?: () => void;
}

export default function CallsManager({ call }: CallsManagerProps) {
  const [jsonExpanded, setJsonExpanded] = useState(false);

  if (!call) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '40px' }}>
        <Phone size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
        <h3>Select a call record</h3>
        <p style={{ fontSize: '0.8rem' }}>Choose a call from the panel list to view active transcripts and emotional timelines.</p>
      </div>
    );
  }

  const dateObj = new Date(call.date || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }} className="calls-inspector-layout">
      
      {/* COLUMN 1: Metadata Card (25%) */}
      <div
        style={{
          width: '260px',
          backgroundColor: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          flexShrink: 0,
          overflowY: 'auto'
        }}
        className="calls-left-meta"
      >
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          Call Metadata
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>Call ID</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{call.id}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>Direction</span>
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-block', backgroundColor: call.direction === 'inbound' ? 'var(--green-soft)' : 'var(--blue-soft)', color: call.direction === 'inbound' ? 'var(--green-accent)' : 'var(--blue-accent)' }}>
              {call.direction.toUpperCase()}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>Assigned Agent</span>
            <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot size={12} style={{ color: 'var(--accent-color)' }} />
              {call.agentName}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>Caller / Contact</span>
            <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={12} style={{ color: 'var(--accent-color)' }} />
              {call.contactName}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>Timestamp</span>
            <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
              {formattedDate}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>Duration</span>
            <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
              {call.duration}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>SIP Trunk Provider</span>
            <span style={{ fontWeight: 500 }}>{call.provider || 'Twilio Trunk'}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.725rem' }}>Session status</span>
            <strong style={{ color: call.status === 'completed' ? 'var(--green-accent)' : 'var(--red-accent)', fontWeight: 600 }}>
              {call.status.toUpperCase()}
            </strong>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Transcript Bubbles (50%) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dialogue Transcript Logs</span>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Audio-synthesized realtime socket</span>
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(Array.isArray(call.transcript) ? call.transcript : [
            { sender: 'agent', text: typeof call.transcript === 'string' ? call.transcript : 'Hello, thank you for calling VoCall support. How can I help you today?', time: '0:02' },
            { sender: 'user', text: 'Yes, hi. I configured an Exotel number yesterday but DLT verification is showing pending.', time: '0:14' },
            { sender: 'agent', text: 'I see. Telephony regulations in India require standard Aadhaar or corporate PAN validation. Did you upload your registration document in settings?', time: '0:28' },
            { sender: 'user', text: 'Oh, I forgot that. Let me check the settings panel now. Thanks.', time: '0:42' },
            { sender: 'agent', text: 'Perfect. Once uploaded, Exotel links usually verify within 10 minutes. Is there anything else I can assist you with?', time: '0:54' },
            { sender: 'user', text: 'No, that should do it. Goodbye.', time: '1:02' },
            { sender: 'agent', text: 'Thank you for choosing VoCall. Have a great day!', time: '1:06' }
          ]).map((chat: any, idx: number) => {
            const isAgent = chat.sender === 'agent';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: isAgent ? 'flex-start' : 'flex-end',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '75%' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.68rem',
                      color: 'var(--text-secondary)',
                      alignSelf: isAgent ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <span>{isAgent ? call.agentName : call.contactName}</span>
                    <span>•</span>
                    <span>{chat.time}</span>
                  </div>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '16px',
                      borderTopLeftRadius: isAgent ? '4px' : '16px',
                      borderTopRightRadius: isAgent ? '16px' : '4px',
                      backgroundColor: isAgent ? 'var(--accent-light)' : 'var(--surface-color)',
                      color: 'var(--text-primary)',
                      border: isAgent ? '1px solid var(--accent-light)' : '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      lineHeight: '1.45'
                    }}
                  >
                    {chat.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 3: AI Analysis (25%) */}
      <div
        style={{
          width: '320px',
          backgroundColor: 'var(--surface-color)',
          borderLeft: '1px solid var(--border-color)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          flexShrink: 0,
          overflowY: 'auto'
        }}
        className="calls-right-analysis"
      >
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          AI Session Analysis
        </h3>

        {/* Emotion Arc Timeline */}
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={14} style={{ color: 'var(--accent-color)' }} />
            Real-time Emotion Arc
          </span>
          <div style={{ width: '100%', height: '110px', backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 4px 0 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { s: '0:02', v: 0.8 },
                { s: '0:14', v: 0.5 },
                { s: '0:28', v: 0.7 },
                { s: '0:42', v: 0.85 },
                { s: '0:54', v: 0.9 },
                { s: '1:02', v: 0.9 },
              ]}>
                <XAxis dataKey="s" stroke="var(--text-tertiary)" fontSize={8} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={8} domain={[0, 1.0]} tickLine={false} />
                <ChartTooltip contentStyle={{ fontSize: '8px', backgroundColor: 'var(--card-color)' }} />
                <Area type="monotone" dataKey="v" stroke="var(--accent-color)" strokeWidth={1.5} fill="var(--accent-light)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', textAlign: 'center' }}>
            Average Sentiment Valence: <strong>{call.emotionScore}</strong>
          </span>
        </div>

        {/* Summary text */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>AI Call Summary</span>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', backgroundColor: 'var(--card-color)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {call.summary || 'Caller asked about India KYC verification for Exotel numbers. Agent provided validation checklists and verified that the client forgot to upload docs.'}
          </p>
        </div>

        {/* Rubric evaluation success badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Rubric Success</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: call.status === 'completed' ? 'var(--green-accent)' : 'var(--red-accent)', backgroundColor: call.status === 'completed' ? 'var(--green-soft)' : 'var(--red-soft)', padding: '4px 10px', borderRadius: '4px' }}>
            <ShieldCheck size={14} />
            {call.status === 'completed' ? 'VERIFIED' : 'FAILED'}
          </div>
        </div>

        {/* Memory recalled */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Database size={14} style={{ color: 'var(--accent-color)' }} />
            Memory Injection Details
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <div>• Vector context match: <strong>pgvector (dist: 0.12)</strong></div>
            <div>• Relational nodes traced: <strong>FalkorDB ("Exotel")</strong></div>
          </div>
        </div>

        {/* Collapsible JSON Structured variables */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            onClick={() => setJsonExpanded(!jsonExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileJson size={14} style={{ color: 'var(--accent-color)' }} />
              Structured variables (JSON)
            </span>
            {jsonExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {jsonExpanded && (
            <pre
              style={{
                marginTop: '8px',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: 'var(--card-color)',
                border: '1px solid var(--border-color)',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}
            >
              {JSON.stringify({
                extracted_variables: {
                  client_issue: "India KYC pending",
                  provider: call.provider || "Twilio",
                  dlt_docs_missing: true,
                  callback_preferred: false
                },
                sentiment_analysis: {
                  anger: 0.12,
                  sadness: 0.05,
                  surprise: 0.08,
                  calm: 0.75
                }
              }, null, 2)}
            </pre>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .calls-inspector-layout {
            flex-direction: column !important;
          }
          .calls-left-meta {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-color) !important;
            padding: 16px !important;
          }
          .calls-right-analysis {
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid var(--border-color) !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
