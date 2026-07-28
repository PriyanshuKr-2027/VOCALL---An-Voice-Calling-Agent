import { Sparkles, Loader2, Code, Eye } from 'lucide-react';
import type { Agent } from '../../types';

export interface AgentPromptTabProps {
  agent: Agent;
  onUpdateAgent: (id: string, updatedFields: Partial<Agent>) => void;
  isCodeMode: boolean;
  setIsCodeMode: (val: boolean) => void;
  isEnhancing: boolean;
  handleEnhancePrompt: () => void;
}

export default function AgentPromptTab({
  agent,
  onUpdateAgent,
  isCodeMode,
  setIsCodeMode,
  isEnhancing,
  handleEnhancePrompt,
}: AgentPromptTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Prompt &amp; Instructions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Define the agent's core instructions, guardrails, and conversation objectives.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleEnhancePrompt}
            disabled={isEnhancing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            {isEnhancing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} style={{ color: 'var(--accent-color)' }} />}
            AI Enhance Prompt
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => setIsCodeMode(!isCodeMode)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            {isCodeMode ? <Eye size={14} /> : <Code size={14} />}
            {isCodeMode ? 'Visual Editor' : 'Code Mode'}
          </button>
        </div>
      </div>

      {isCodeMode ? (
        <textarea
          value={JSON.stringify(agent, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onUpdateAgent(agent.id, parsed);
            } catch {
              // Ignore invalid JSON while typing
            }
          }}
          style={{
            width: '100%',
            height: '350px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            padding: '16px',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      ) : (
        <textarea
          value={agent.prompt || ''}
          onChange={(e) => onUpdateAgent(agent.id, { prompt: e.target.value })}
          placeholder="You are a helpful customer support agent for VoCall. Answer caller questions politely..."
          style={{
            width: '100%',
            height: '320px',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            padding: '16px',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
            lineHeight: '1.5',
          }}
        />
      )}

      {/* Variables helper */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inject Variables:</span>
        {['{{caller.name}}', '{{caller.phone}}', '{{company.name}}', '{{call.date}}', '{{memory.last_summary}}'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              const currentPrompt = agent.prompt || '';
              const separator = currentPrompt.endsWith(' ') || !currentPrompt ? '' : ' ';
              onUpdateAgent(agent.id, { prompt: `${currentPrompt}${separator}${v}` });
            }}
            style={{
              padding: '2px 8px',
              fontSize: '0.72rem',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-color)',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
