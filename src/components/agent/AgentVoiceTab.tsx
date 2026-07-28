import { Volume2, Globe } from 'lucide-react';
import type { Agent } from '../../types';

export interface AgentVoiceTabProps {
  agent: Agent;
  onUpdateAgent: (id: string, updatedFields: Partial<Agent>) => void;
}

const VOICE_OPTIONS = [
  { id: 'Aria', name: 'Aria', provider: 'Cartesia', trait: 'Warm & Professional Female' },
  { id: 'Roger', name: 'Roger', provider: 'Twilio', trait: 'Direct Corporate Male' },
  { id: 'Sarah', name: 'Sarah', provider: 'ElevenLabs', trait: 'Empathetic Support Female' },
  { id: 'Sarvam_Hinglish', name: 'Sarvam Hinglish', provider: 'Sarvam AI', trait: 'Bilingual Hinglish Voice' },
  { id: 'Hume_Emotive', name: 'Hume Emotive', provider: 'Hume AI', trait: 'Adaptive Prosody Engine' },
] as const;

export default function AgentVoiceTab({ agent, onUpdateAgent }: AgentVoiceTabProps) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Voice Engine &amp; Synthesis Model
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Configure text-to-speech providers, natural voice inflections, and prosody parameters.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Voice Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Selected Voice</label>
          <select
            value={agent.voice || 'Aria'}
            onChange={(e) => onUpdateAgent(agent.id, { voice: e.target.value })}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.provider}) — {v.trait}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Language */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Primary Language &amp; Dialect</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--accent-color)' }} />
            <select
              value={agent.language || 'en'}
              onChange={(e) => onUpdateAgent(agent.id, { language: e.target.value })}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="en">English (US / Global)</option>
              <option value="hi">Hinglish / Hindi (India)</option>
              <option value="es">Spanish (ES)</option>
              <option value="fr">French (FR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voice Provider Badge Preview */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Volume2 size={20} style={{ color: 'var(--accent-color)' }} />
          <div>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
              {agent.voice || 'Aria'} Synthesis Active
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Provider: {agent.telephony?.provider || 'Twilio / Cartesia'} • Response Latency &lt; 90ms
            </span>
          </div>
        </div>
        <span className="badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>
          Ultra-Low Latency
        </span>
      </div>
    </div>
  );
}
