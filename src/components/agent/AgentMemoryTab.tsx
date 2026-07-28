import { Brain, Smile, Check } from 'lucide-react';
import type { Agent } from '../../types';

export interface AgentMemoryTabProps {
  agent: Agent;
  onUpdateAgent: (id: string, updatedFields: Partial<Agent>) => void;
}

export default function AgentMemoryTab({ agent, onUpdateAgent }: AgentMemoryTabProps) {
  const memoryConfig = agent.memory || { enabled: true };
  const emotionConfig = agent.emotion || { enabled: true };

  const toggleMemoryTier = (tierKey: string) => {
    const currentTiers = memoryConfig.tiers || {
      shortTermRedis: true,
      episodicPostCall: true,
      semanticPgVector: true,
      falkorGraph: true,
    };
    onUpdateAgent(agent.id, {
      memory: {
        ...memoryConfig,
        tiers: {
          ...currentTiers,
          [tierKey]: !currentTiers[tierKey as keyof typeof currentTiers],
        },
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 4-Tier Memory Header */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          4-Tier Cognitive Memory Engine
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Persist session data, extract entity graphs, and remember caller preferences across conversations.
        </p>
      </div>

      {/* Main Memory Toggle */}
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
          <Brain size={20} style={{ color: 'var(--accent-color)' }} />
          <div>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
              Enable Conversational Memory
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Automatically query past caller facts and call summaries during live audio sessions.
            </span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={memoryConfig.enabled ?? true}
          onChange={(e) =>
            onUpdateAgent(agent.id, {
              memory: { ...memoryConfig, enabled: e.target.checked },
            })
          }
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
        />
      </div>

      {/* Memory Tiers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { key: 'shortTermRedis', name: 'Short-Term Socket Cache (Upstash Redis)', desc: 'Stores turn-by-turn audio context and current conversation state.' },
          { key: 'episodicPostCall', name: 'Episodic Post-Call Summarizer', desc: 'Trigger.dev background worker extracts summaries & key facts upon call hangup.' },
          { key: 'semanticPgVector', name: 'Semantic Memory (Supabase pgvector)', desc: 'Vector embeddings store long-term facts and topic preferences.' },
          { key: 'falkorGraph', name: 'Graph Entity Memory (FalkorDB)', desc: 'Tracks relationships between callers, accounts, and order IDs.' },
        ].map((tier) => {
          const isTierActive = memoryConfig.tiers?.[tier.key as keyof typeof memoryConfig.tiers] ?? true;
          return (
            <div
              key={tier.key}
              onClick={() => toggleMemoryTier(tier.key)}
              style={{
                padding: '16px',
                backgroundColor: 'var(--card-color)',
                border: isTierActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: isTierActive ? 'var(--accent-color)' : 'transparent',
                  border: isTierActive ? 'none' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {isTierActive && <Check size={12} />}
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  {tier.name}
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{tier.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emotion NLP Section */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
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
            <Smile size={20} style={{ color: 'var(--accent-color)' }} />
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                Real-Time Voice Emotion Adaptation
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Detect caller frustration or enthusiasm and adapt TTS tone inflection dynamically.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={emotionConfig.enabled ?? true}
            onChange={(e) =>
              onUpdateAgent(agent.id, {
                emotion: { ...emotionConfig, enabled: e.target.checked },
              })
            }
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
          />
        </div>
      </div>
    </div>
  );
}
