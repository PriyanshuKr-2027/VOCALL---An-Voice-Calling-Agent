import { useState } from 'react';
import {
  Globe,
  Sparkles,
  Volume2,
  Phone,
  PhoneCall,
  Brain,
  Smile,
  Sliders,
  Database,
  Share2,
  Table,
  Play,
  Plus,
  Loader2,
  Clock,
  Code,
  Eye,
  Trash2,
  Bot
} from 'lucide-react';
import WebCallModal from './WebCallModal';
import { agentsApi } from '../services/api';

interface AgentBuilderProps {
  agent: any;
  onUpdateAgent: (id: string, updatedFields: any) => void;
  callsList: any[];
  onSelectCall: (id: string) => void;
  onNavigateToSection: (section: string) => void;
  telephonyNumbers: any[];
  onSaveCall?: (callData: any) => void;
}

export default function AgentBuilder({
  agent,
  onUpdateAgent,
  callsList,
  onSelectCall,
  onNavigateToSection,
  telephonyNumbers,
  onSaveCall
}: AgentBuilderProps) {
  const [activeTab, setActiveTab] = useState<string>('identity');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isWebCallOpen, setIsWebCallOpen] = useState(false);
  
  // Modal configurations
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);

  const tabs = [
    { id: 'identity', label: 'Identity', icon: Globe },
    { id: 'persona', label: 'Persona', icon: Sparkles },
    { id: 'voice', label: 'Voice Profile', icon: Volume2 },
    { id: 'telephony', label: 'Telephony', icon: Phone },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'emotion', label: 'Emotion', icon: Smile },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
    { id: 'analysis', label: 'Analysis', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'recent', label: 'Recent Calls', icon: Table }
  ];

  // AI prompt enhancer connected to FastAPI backend
  const handleEnhancePrompt = async () => {
    setIsEnhancing(true);
    try {
      if (agent.id) {
        const res = await agentsApi.enhancePrompt(agent.id, agent.prompt || '');
        if (res && res.enhanced_prompt) {
          onUpdateAgent(agent.id, { prompt: res.enhanced_prompt });
          setIsEnhancing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend prompt enhancer offline, using fallback enhancement rules:', err);
    }
    setTimeout(() => {
      onUpdateAgent(agent.id, {
        prompt: (agent.prompt || '') + '\n\n[Enhanced Instructions]\n- Conversation Guardrails: Keep responses short and conversational (under 2 sentences). Avoid reading long lists over the voice channel. Keep the language natural and use active listening tags (e.g., "right", "sure", "I see").\n- Frustration Escalation: If the caller is detected as frustrated twice, seamlessly offer to route to the main helpdesk.'
      });
      setIsEnhancing(false);
    }, 1000);
  };

  // Add custom property for structured extraction
  const handleAddProperty = () => {
    const propName = prompt('Enter property name:');
    if (propName) {
      const propPrompt = prompt('Enter extraction instructions:');
      const updatedProps = [...(agent.analysis?.properties || []), { name: propName, prompt: propPrompt || '' }];
      onUpdateAgent(agent.id, {
        analysis: {
          ...agent.analysis,
          properties: updatedProps
        }
      });
    }
  };

  // Remove property
  const handleRemoveProperty = (name: string) => {
    const updatedProps = agent.analysis?.properties?.filter((p: any) => p.name !== name) || [];
    onUpdateAgent(agent.id, {
      analysis: {
        ...agent.analysis,
        properties: updatedProps
      }
    });
  };

  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const handlePlayVoice = (voiceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying === voiceName) {
      setIsPlaying(null);
    } else {
      setIsPlaying(voiceName);
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  const handleOpenConnector = (connector: any) => {
    setSelectedConnector(connector);
    setActiveModal('connector');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header bar */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface-color)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            value={agent.name}
            onChange={(e) => onUpdateAgent(agent.id, { name: e.target.value })}
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              width: '240px',
              padding: '2px 6px',
              borderBottom: '1px solid transparent',
            }}
            onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-color)')}
            onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
          />
          <span style={{ fontSize: '0.725rem', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
            {agent.status.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            Chat Sandbox
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsWebCallOpen(true)}
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              borderColor: 'rgba(124, 58, 237, 0.5)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PhoneCall size={14} />
            <span>Talk To Agent</span>
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            Publish
          </button>
        </div>
      </div>

      {/* Tabs list (Horizontal 10 tabs scrollable) */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-color)',
          overflowX: 'auto',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 20px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'var(--transition-fast)',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels content area */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        
        {isCodeMode ? (
          /* JSON CODE VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Raw Config JSON</span>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setIsCodeMode(false)}>
                Switch to UI Editor
              </button>
            </div>
            <pre
              style={{
                flex: 1,
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}
            >
              {JSON.stringify(agent, null, 2)}
            </pre>
          </div>
        ) : (
          /* STANDARD TABS UI */
          <div style={{ maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* TAB 1: IDENTITY */}
            {activeTab === 'identity' && (
              <>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed var(--accent-color)',
                    }}
                  >
                    <Bot size={28} style={{ color: 'var(--accent-color)' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Agent Name</label>
                    <input
                      type="text"
                      className="btn-secondary"
                      value={agent.name}
                      onChange={(e) => onUpdateAgent(agent.id, { name: e.target.value })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        width: '100%',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: 'text'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                  <textarea
                    value={agent.description || ''}
                    onChange={(e) => onUpdateAgent(agent.id, { description: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>Quick Import context</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Type a domain URL. We will crawl it to extract site FAQs and inject them directly into your agent persona memory.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="https://docs.mycompany.com"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-color)',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                    <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                      Import
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: PERSONA */}
            {activeTab === 'persona' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>System Prompt Instructions</label>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }}
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          Enhance Prompt
                        </>
                      )}
                    </button>
                    
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setIsCodeMode(true)}>
                      <Code size={12} style={{ marginRight: '4px' }} />
                      Code Mode
                    </button>
                  </div>
                </div>

                <textarea
                  value={agent.prompt}
                  onChange={(e) => onUpdateAgent(agent.id, { prompt: e.target.value })}
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    lineHeight: '1.45',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />

                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Objective presets</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      'Customer Support', 'Sales Inquiry', 'Appointment Booking', 'HR Recruiter',
                      'Debt Recovery', 'Healthcare Helpdesk', 'Lead Gen Qualify'
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => onUpdateAgent(agent.id, { prompt: agent.prompt + `\n- Objective: Handle ${chip} queries.` })}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: VOICE PROFILE */}
            {activeTab === 'voice' && (
              <>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Select TTS Synthesizer voice</label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { name: 'Aria', provider: 'Cartesia', lang: 'English (US)', gender: 'Female', cost: 'Free', latency: '65ms' },
                    { name: 'Sara', provider: 'Sarvam AI', lang: 'Hinglish', gender: 'Female', cost: 'Paid', latency: '85ms' },
                    { name: 'Callum', provider: 'Cartesia', lang: 'English (UK)', gender: 'Male', cost: 'Free', latency: '70ms' },
                    { name: 'Hume Octave', provider: 'Hume AI', lang: 'Adaptive EVI', gender: 'Unisex', cost: 'Paid', latency: '120ms' },
                  ].map((voice) => {
                    const isSelected = agent.voice === voice.name;
                    const isPlayingVoice = isPlaying === voice.name;
                    return (
                      <div
                        key={voice.name}
                        onClick={() => onUpdateAgent(agent.id, { voice: voice.name })}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-lg)',
                          border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--card-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            onClick={(e) => handlePlayVoice(voice.name, e)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isPlayingVoice ? 'var(--accent-color)' : 'rgba(79, 122, 101, 0.1)',
                              color: isPlayingVoice ? '#FFFFFF' : 'var(--accent-color)',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Play size={12} fill={isPlayingVoice ? '#FFFFFF' : 'var(--accent-color)'} />
                          </button>
                          <div>
                            <div style={{ fontWeight: 600 }}>{voice.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {voice.provider} • {voice.lang} • {voice.gender}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.7rem' }}>
                          <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{voice.latency}</div>
                          <span style={{ color: voice.cost === 'Free' ? 'var(--green-accent)' : 'var(--yellow-accent)', fontWeight: 500 }}>
                            {voice.cost}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block' }}>Emotion-Conditioned Synthesizer</span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Dynamically adapt voice tone based on caller frustration triggers (Hume EVI model).</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={agent.emotion?.enabled && agent.emotion?.signals?.audio}
                    disabled={!(agent.emotion?.enabled && agent.emotion?.signals?.audio)}
                    style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
                  />
                </div>
              </>
            )}

            {/* TAB 4: TELEPHONY */}
            {activeTab === 'telephony' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Trunk Provider</label>
                    <select
                      value={agent.telephony?.provider || 'Twilio'}
                      onChange={(e) => onUpdateAgent(agent.id, { telephony: { ...agent.telephony, provider: e.target.value } })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="Twilio">Twilio (US/Global)</option>
                      <option value="Plivo">Plivo (India/Int)</option>
                      <option value="Exotel">Exotel (India Corporate)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Assigned Phone Number</label>
                    <select
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {telephonyNumbers
                        .filter(n => n.provider === (agent.telephony?.provider || 'Twilio'))
                        .map(n => (
                          <option key={n.id} value={n.number}>{n.number} ({n.agentName || 'Unassigned'})</option>
                        ))}
                      {telephonyNumbers.filter(n => n.provider === (agent.telephony?.provider || 'Twilio')).length === 0 && (
                        <option>No registered numbers. Go to settings.</option>
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', backgroundColor: 'var(--surface-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Inbound Routing Enabled</span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Allow clients to call this number directly to trigger this agent.</span>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} />
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Outbound Caller ID Masking</span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Show verified corporate name header on outbound calls.</span>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}
                  onClick={() => onNavigateToSection('settings')}
                >
                  Configure Telephony settings
                </button>
              </>
            )}

            {/* TAB 5: MEMORY */}
            {activeTab === 'memory' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Cognitive Memory Engine</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allow agent to query historical facts and nodes.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateAgent(agent.id, { memory: { ...agent.memory, enabled: !agent.memory?.enabled } })}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: agent.memory?.enabled ? 'var(--accent-color)' : 'var(--border-color)',
                      color: agent.memory?.enabled ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {agent.memory?.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {agent.memory?.enabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { id: 'short', title: 'Short-term', db: 'Upstash Redis', desc: 'Hold live transcripts during active voice socket' },
                        { id: 'long', title: 'Long-term', db: 'Supabase Vector', desc: 'Query vector details from pgvector database', slider: true, max: 10, defaultVal: 5 },
                        { id: 'episodic', title: 'Episodic', db: 'Supabase Postgres', desc: 'Recall chronological logs from database', slider: true, max: 5, defaultVal: 3 },
                        { id: 'graph', title: 'Knowledge Graph', db: 'FalkorDB Graph', desc: 'Tracks entity relationships and frustration patterns across calls' }
                      ].map((tier) => (
                        <div
                          key={tier.id}
                          style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--surface-color)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{tier.title}</span>
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>
                              {tier.db}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{tier.desc}</p>
                          
                          {tier.slider && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.725rem', borderTop: '1px solid rgba(0,0,0,0.02)', paddingTop: '6px' }}>
                              <span>Max facts retrieved:</span>
                              <input type="range" min="1" max={tier.max} defaultValue={tier.defaultVal} style={{ flex: 1, accentColor: 'var(--accent-color)' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Right preview node SVG graph */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--surface-color)' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>FalkorDB Context Preview</span>
                      
                      <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100px', margin: '12px 0' }}>
                        <line x1="100" y1="20" x2="50" y2="70" stroke="var(--border-color)" strokeWidth="1.5" />
                        <line x1="100" y1="20" x2="150" y2="70" stroke="var(--border-color)" strokeWidth="1.5" />
                        <line x1="50" y1="70" x2="100" y2="100" stroke="var(--border-color)" strokeWidth="1.5" />
                        <line x1="150" y1="70" x2="100" y2="100" stroke="var(--border-color)" strokeWidth="1.5" />
                        
                        <circle cx="100" cy="20" r="8" fill="var(--accent-color)" />
                        <circle cx="50" cy="70" r="8" fill="var(--accent-color)" />
                        <circle cx="150" cy="70" r="8" fill="var(--accent-color)" />
                        <circle cx="100" cy="100" r="8" fill="#E6E4DF" />
                        
                        <text x="100" y="45" fontSize="6" textAnchor="middle" fill="var(--text-secondary)">CALLS</text>
                        <text x="125" y="85" fontSize="6" textAnchor="middle" fill="var(--text-secondary)">HAS_PLAN</text>
                      </svg>

                      <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px', backgroundColor: 'var(--card-color)', fontSize: '0.725rem', fontFamily: 'var(--font-mono)' }}>
                        {"/* Prompt Injection preview */\nUser maps -> Abhi (Frustrated: Pricing)"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 6: EMOTION */}
            {activeTab === 'emotion' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Real-time Emotion Engine</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Track and adapt vocal pitch relative to stress spikes.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateAgent(agent.id, { emotion: { ...agent.emotion, enabled: !agent.emotion?.enabled } })}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: agent.emotion?.enabled ? 'var(--accent-color)' : 'var(--border-color)',
                      color: agent.emotion?.enabled ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {agent.emotion?.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {agent.emotion?.enabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600 }}>Text Signal (Groq NLP)</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: 600 }}>FREE DEFAULT</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Always active when emotion enabled. Parses transcripts in real-time.</p>
                      </div>

                      <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600 }}>Audio Signal (Hume AI)</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>BYOK OPTIONAL</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requires Hume API configured in settings. Performs raw audio stress audits.</p>
                      </div>
                    </div>

                    <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 600, display: 'block', fontSize: '0.85rem' }}>Tone Adaptation</span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Slow down or increase pitch to console stressed callers.</span>
                        </div>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                          <span>Frustration Threshold</span>
                          <span style={{ color: 'var(--accent-color)' }}>0.70</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" style={{ width: '100%', accentColor: 'var(--accent-color)' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>On Frustration Trigger</label>
                        <select style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                          <option>Trigger Webhook Connector</option>
                          <option>Escalate to Support Team</option>
                          <option>Schedule Outbound Redial</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 7: ADVANCED */}
            {activeTab === 'advanced' && (
              <>
                {/* Stop speaking plan */}
                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Stop Speaking (Barge-In) Plan</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Number of words spoken by user</label>
                      <input type="range" min="1" max="10" defaultValue="4" style={{ width: '100%', accentColor: 'var(--accent-color)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Voice silence duration (seconds)</label>
                      <input type="range" min="0.1" max="1.0" step="0.1" defaultValue="0.2" style={{ width: '100%', accentColor: 'var(--accent-color)' }} />
                    </div>
                  </div>
                </div>

                {/* Auto reachout */}
                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Auto Reachout Policies</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Follow-up Scheduler</span>
                      <input type="checkbox" style={{ accentColor: 'var(--accent-color)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <span>Instant Redial on drops</span>
                      <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} />
                    </div>
                  </div>
                </div>

                {/* Calling Hours */}
                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Calling Hours Restriction</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button
                        key={day}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: day !== 'Sun' ? 'var(--accent-color)' : 'var(--border-color)',
                          color: day !== 'Sun' ? '#FFFFFF' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                    <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span>Active window: <strong>08:00 AM – 08:00 PM</strong></span>
                  </div>
                </div>
              </>
            )}

            {/* TAB 8: ANALYSIS */}
            {activeTab === 'analysis' && (
              <>
                {/* Summary Evaluation */}
                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Post-Call Summary Prompt</h4>
                  <textarea
                    defaultValue="Summarize the core client issues and note down any scheduled callback details."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--card-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Rubrics */}
                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Success Evaluation Rubrics</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                    <textarea
                      defaultValue="Mark as successful if caller booked a calendar appointment or confirmed their email address for follow-up details."
                      rows={2}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                    <select
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-color)',
                        color: 'var(--text-primary)',
                        height: 'fit-content'
                      }}
                    >
                      <option>Appointment Booked</option>
                      <option>Goal Achieved</option>
                      <option>Lead Qualified</option>
                      <option>Issue Resolved</option>
                      <option>Custom Rubric</option>
                    </select>
                  </div>
                </div>

                {/* Structured JSON extraction */}
                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Structured Property Extractions</h4>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Extract JSON variables directly from the transcript logs.</span>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }} onClick={handleAddProperty}>
                      <Plus size={12} />
                      Add Property
                    </button>
                  </div>

                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--card-color)', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '10px 12px' }}>Property Name</th>
                          <th style={{ padding: '10px 12px' }}>Extraction Instruction Prompt</th>
                          <th style={{ padding: '10px 12px', width: '60px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>emotion_state</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Auto-included sentiment index.</td>
                          <td style={{ padding: '10px 12px' }}></td>
                        </tr>
                        {(agent.analysis?.properties || []).map((prop: any) => (
                          <tr key={prop.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{prop.name}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{prop.prompt}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleRemoveProperty(prop.name)}
                                style={{ border: 'none', background: 'none', color: 'var(--red-accent)', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* TAB 9: INTEGRATIONS */}
            {activeTab === 'integrations' && (
              <>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Active Connector Pipelines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { id: 'hubspot', name: 'HubSpot', type: 'During Call', desc: 'Sync customer pipeline deals as we speak.', status: 'configured' },
                    { id: 'google-calendar', name: 'Google Calendar', type: 'During Call', desc: 'Book meetings directly into agent calendars.', status: 'configured' },
                    { id: 'supabase', name: 'Supabase/Postgres', type: 'Post Call', desc: 'Archive transcript outcomes to org tables.', status: 'not configured' },
                    { id: 'whatsapp', name: 'WhatsApp', type: 'Post Call', desc: 'Send summary message followups to callers.', status: 'not configured' },
                  ].map((connector) => (
                    <div
                      key={connector.id}
                      className="premium-card"
                      style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--card-color)' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600 }}>{connector.name}</span>
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: connector.type === 'During Call' ? 'var(--accent-light)' : 'var(--border-color)', color: connector.type === 'During Call' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: 600 }}>
                            {connector.type}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>{connector.desc}</p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '0.725rem', color: connector.status === 'configured' ? 'var(--green-accent)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                          {connector.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleOpenConnector(connector)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.725rem' }}
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB 10: RECENT CALLS */}
            {activeTab === 'recent' && (
              <>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Call history logs for this agent</h3>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px' }}>Direction</th>
                        <th style={{ padding: '12px' }}>Caller</th>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Duration</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Valence</th>
                        <th style={{ padding: '12px', width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {callsList
                        .filter(c => c.agentName === agent.name)
                        .map((call) => {
                          const dateObj = new Date(call.date);
                          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                          return (
                            <tr key={call.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '12px' }}>
                                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, backgroundColor: call.direction === 'inbound' ? 'var(--green-soft)' : 'var(--blue-soft)', color: call.direction === 'inbound' ? 'var(--green-accent)' : 'var(--blue-accent)' }}>
                                  {call.direction.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '12px', fontWeight: 500 }}>{call.contactName}</td>
                              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{formattedDate}</td>
                              <td style={{ padding: '12px' }}>{call.duration}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ color: call.status === 'completed' ? 'var(--green-accent)' : 'var(--red-accent)', fontWeight: 600 }}>
                                  {call.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px', fontWeight: 600 }}>{call.emotionScore}</td>
                              <td style={{ padding: '12px' }}>
                                <button
                                  onClick={() => onSelectCall(call.id)}
                                  style={{ border: 'none', background: 'none', color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                  title="View Call Details"
                                >
                                  <Eye size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {callsList.filter(c => c.agentName === agent.name).length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No calls routed through this agent yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {/* DYNAMIC CONNECTOR MODAL */}
      {activeModal === 'connector' && selectedConnector && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="premium-card" style={{ padding: '32px', backgroundColor: 'var(--card-color)', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Configure {selectedConnector.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enter credentials to enable the during/post call pipeline hook.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>Developer API Token / Secret</label>
                <input type="password" placeholder="••••••••••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>Redirect Webhook / Workspace ID</label>
                <input type="text" placeholder="e.g. org_hubspot_721x" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                onClick={() => {
                  alert(`${selectedConnector.name} pipeline configuration saved successfully!`);
                  setActiveModal(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEB CALL TESTING MODAL */}
      <WebCallModal
        isOpen={isWebCallOpen}
        onClose={() => setIsWebCallOpen(false)}
        agent={agent}
        onSaveCall={onSaveCall}
      />

    </div>
  );
}
