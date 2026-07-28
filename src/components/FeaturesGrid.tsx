import { useState } from 'react';
import { Brain, Smile, Database, ShieldCheck, Share2, ChevronRight } from 'lucide-react';

export default function FeaturesGrid() {
  const [selectedTier, setSelectedTier] = useState<number>(0);

  const memoryTiers = [
    {
      title: 'Short-Term Socket Memory',
      badge: 'Upstash Redis',
      desc: 'Injects live transcription context during the active WebRTC voice connection, enabling immediate conversational turns.',
      latency: '<10ms'
    },
    {
      title: 'Long-Term Semantic Memory',
      badge: 'Supabase pgvector',
      desc: 'Retrieves historical user summaries and key facts across past calls using cosine similarity matching.',
      latency: '30ms'
    },
    {
      title: 'Episodic Event Records',
      badge: 'Supabase Postgres',
      desc: 'Stores exact chronological summaries of past call events and structures them into referenceable records.',
      latency: '15ms'
    },
    {
      title: 'Cognitive Knowledge Graph',
      badge: 'FalkorDB Graph',
      desc: 'Maps entity relationships (e.g. Abhi is frustrated about pricing issues) to prevent repeating details.',
      latency: '25ms'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      
      {/* 1. Large Feature: 4-Tier Memory System */}
      <div
        className="premium-card"
        style={{
          padding: '48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '40px',
          alignItems: 'center',
          backgroundColor: 'var(--card-color)',
        }}
        id="memory-deep-dive"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span className="badge" style={{ alignSelf: 'flex-start' }}>
            <Brain size={12} />
            VoCall Cognitive Engine
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            The first voice platform with 4-tier cognitive memory
          </h3>
          <p>
            Standard AI voice bots forget who you are the second the call drops. VoCall maps every user conversation into four specialized memory tiers for instant recall on redial.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {memoryTiers.map((tier, idx) => (
              <button
                key={tier.title}
                onClick={() => setSelectedTier(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: selectedTier === idx ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  backgroundColor: selectedTier === idx ? 'rgba(79, 122, 101, 0.02)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <span style={{ fontWeight: 600, color: selectedTier === idx ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                  {tier.title}
                </span>
                <ChevronRight size={14} style={{ color: selectedTier === idx ? 'var(--accent-color)' : 'var(--text-tertiary)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Memory Tier Info */}
        <div
          style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minHeight: '260px',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-inset)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-color)', textTransform: 'uppercase' }}>
              Selected memory tier
            </span>
            <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', fontWeight: 600 }}>
              {memoryTiers[selectedTier].badge}
            </span>
          </div>

          <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {memoryTiers[selectedTier].title}
          </h4>

          <p style={{ fontSize: '0.925rem', lineHeight: '1.6' }}>
            {memoryTiers[selectedTier].desc}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              marginTop: '10px',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Search Latency</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--accent-color)' }}>{memoryTiers[selectedTier].latency}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Status</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--green-accent)' }}>Live in production</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid of Secondary Features */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="features-sub-grid">
        
        {/* Emotion Feature Card */}
        <div
          className="premium-card"
          style={{
            padding: '36px',
            backgroundColor: 'var(--card-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Smile size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Emotional Intelligence &amp; Adaptivity</h3>
          <p style={{ fontSize: '0.925rem' }}>
            VoCall monitors user mood metrics in real-time. If the system detects caller anger or frustration spikes, it automatically adapts its vocal pitch, backs off speaking, or triggers escalations.
          </p>
          <div
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Frustration Level: 0.82</span>
            <span style={{ color: 'var(--red-accent)', fontWeight: 600 }}>Action: Switch to Empathetic Tone</span>
          </div>
        </div>

        {/* Telephony KYC Card */}
        <div
          className="premium-card"
          style={{
            padding: '36px',
            backgroundColor: 'var(--card-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Carrier KYC Compliance Flow</h3>
          <p style={{ fontSize: '0.925rem' }}>
            Avoid carrier blocks and spam filters. Upload identity docs (GST, PAN, Aadhaar) directly to register your enterprise numbers on Twilio, Plivo, or Exotel from our unified console.
          </p>
          <div
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 500 }}>telephony_kyc_approved.pdf</span>
            <span style={{ color: 'var(--green-accent)', fontWeight: 600 }}>KYC VERIFIED</span>
          </div>
        </div>

        {/* Structured Analytics Card */}
        <div
          className="premium-card"
          style={{
            padding: '36px',
            backgroundColor: 'var(--card-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Post-Call Rubric Extractions</h3>
          <p style={{ fontSize: '0.925rem' }}>
            Automatically extract structured JSON data from completed transcripts. Set custom rubrics for evaluation (e.g. was a meetings booked, what model was requested, sentiment rating).
          </p>
          <div
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              fontSize: '0.725rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {"{ \"success\": true, \"appointment_booked\": \"2026-07-28\" }"}
          </div>
        </div>

        {/* Pipelines Connectors Card */}
        <div
          className="premium-card"
          style={{
            padding: '36px',
            backgroundColor: 'var(--card-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Share2 size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>During &amp; Post-Call Connectors</h3>
          <p style={{ fontSize: '0.925rem' }}>
            Trigger HubSpot CRM pipelines, book Google Calendar events, send custom API Webhooks during the live call audio stream, or dispatch automated WhatsApp follow-ups post-call.
          </p>
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              gap: '6px',
            }}
          >
            {['HubSpot', 'Google Calendar', 'WhatsApp', 'Webhooks'].map((conn) => (
              <span
                key={conn}
                style={{
                  fontSize: '0.65rem',
                  padding: '4px 8px',
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontWeight: 500,
                }}
              >
                {conn}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #memory-deep-dive {
            grid-template-columns: 1fr !important;
            padding: 32px !important;
          }
        }
        @media (max-width: 768px) {
          .features-sub-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
