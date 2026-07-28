import { useState } from 'react';
import {
  LayoutGrid,
  Bot,
  Columns3,
  Users,
  Phone,
  BarChart3,
  Plug,
  Settings,
  Key,
  Search,
  Plus,
  Play,
  Volume2,
  Sparkles,
  Brain,
  Smile,
  Globe,
  Loader2
} from 'lucide-react';

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<'identity' | 'persona' | 'voice' | 'memory' | 'emotion'>('memory');
  
  // Interactive States
  const [agentName, setAgentName] = useState('Support Agent');
  const [agentDesc, setAgentDesc] = useState('Handles incoming customer support queries, resolves order issues, and escalates frustration spikes.');
  const [promptText, setPromptText] = useState('You are an empathetic, highly efficient support agent for VoCall. Clarify caller details, answer product FAQs using our docs, and transfer to a manager if frustration exceeds 0.7.');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Aria');
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [emotionEnabled, setEmotionEnabled] = useState(true);
  const [audioSignalEnabled, setAudioSignalEnabled] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);

  // Enhance prompt simulator
  const handleEnhancePrompt = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setPromptText((prev) => prev + '\n\n[AI Enhanced] Tone constraints applied: Keep responses under 2 sentences during high-latency voice windows. Automatically summarize sentiment tags and save key episodic details upon call termination.');
      setIsEnhancing(false);
    }, 1200);
  };

  const handlePlayVoice = (voiceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingVoice === voiceName) {
      setIsPlayingVoice(null);
    } else {
      setIsPlayingVoice(voiceName);
      setTimeout(() => {
        setIsPlayingVoice(null);
      }, 3000);
    }
  };

  return (
    <div
      className="premium-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '620px',
        overflow: 'hidden',
        fontSize: '0.85rem',
        textAlign: 'left',
        background: 'var(--card-color)',
      }}
    >
      {/* Top Window Bar */}
      <div
        style={{
          height: '40px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          backgroundColor: 'var(--surface-color)',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E6E4DF' }}></span>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E6E4DF' }}></span>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E6E4DF' }}></span>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
          api.vocall.ai/v1/agents/{agentName.toLowerCase().replace(' ', '-')}
        </div>
        <div style={{ width: '48px' }}></div>
      </div>

      {/* Main 3-Panel Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* PANEL 1: Left Sidebar (60px) */}
        <div
          style={{
            width: '60px',
            backgroundColor: 'var(--surface-color)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Phone size={16} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <LayoutGrid size={18} style={{ cursor: 'pointer' }} />
              <Bot size={18} style={{ color: 'var(--accent-color)', cursor: 'pointer' }} />
              <Columns3 size={18} style={{ cursor: 'pointer' }} />
              <Users size={18} style={{ cursor: 'pointer' }} />
              <BarChart3 size={18} style={{ cursor: 'pointer' }} />
              <Plug size={18} style={{ cursor: 'pointer' }} />
              <Settings size={18} style={{ cursor: 'pointer' }} />
              <Key size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.75rem',
            }}
          >
            A
          </div>
        </div>

        {/* PANEL 2: Context List (220px) */}
        <div
          className="sidebar-list"
          style={{
            width: '220px',
            backgroundColor: 'var(--surface-color)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Main Space</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 500 }}>Switch</span>
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--card-color)',
                border: '1px solid var(--border-color)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search agents..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.75rem',
                }}
                disabled
              />
            </div>
          </div>

          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--card-color)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
                <span style={{ fontWeight: 500 }}>{agentName}</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Live</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--green-accent)' }}></span>
                <span>Lead Qualifier</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-tertiary)' }}></span>
                <span>Collections bot</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '16px' }}>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '8px', fontSize: '0.75rem', gap: '6px' }}
            >
              <Plus size={14} />
              New Agent
            </button>
          </div>
        </div>

        {/* PANEL 3: Main Working Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          
          {/* Header */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--surface-color)',
            }}
          >
            <div>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  width: '150px',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Config ID: <span style={{ fontFamily: 'var(--font-mono)' }}>ag_01jg24x</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
              >
                Test Call
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
              >
                Publish Changes
              </button>
            </div>
          </div>

          {/* Interactive Navigation Tab bar */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              padding: '0 16px',
            }}
          >
            {[
              { id: 'identity', label: 'Identity', icon: Globe },
              { id: 'persona', label: 'Persona', icon: Sparkles },
              { id: 'voice', label: 'Voice Profile', icon: Volume2 },
              { id: 'memory', label: 'Memory Tiers', icon: Brain },
              { id: 'emotion', label: 'Emotion Engine', icon: Smile },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
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

          {/* Dynamic Tab Contents */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            
            {/* 1. IDENTITY TAB */}
            {activeTab === 'identity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed var(--accent-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <Globe size={24} style={{ color: 'var(--accent-color)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Agent Avatar &amp; Name</label>
                    <input
                      type="text"
                      className="btn-secondary"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        width: '100%',
                        fontSize: '0.8rem',
                        cursor: 'text',
                        textAlign: 'left',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                  <textarea
                    value={agentDesc}
                    onChange={(e) => setAgentDesc(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--surface-color)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Web Import Integration</label>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Provide a domain URL to crawl your knowledgebase and auto-configure this agent's memory.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="https://docs.mycompany.com"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        outline: 'none',
                      }}
                      disabled
                    />
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PERSONA TAB */}
            {activeTab === 'persona' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontWeight: 600 }}>System Prompt Instructions</label>
                    <button
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing}
                      className="btn btn-primary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        gap: '6px',
                      }}
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          Enhance Prompt
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      lineHeight: '1.4',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Use Case Presets</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      'Customer Support',
                      'Appointment Booking',
                      'Debt Recovery',
                      'Lead Gen Qualification',
                      'Healthcare Helpdesk',
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setPromptText((prev) => prev + `\n- Role Objective: Resolve ${chip} interactions.`)}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'var(--surface-color)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                          transition: 'var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text-tertiary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. VOICE PROFILE TAB */}
            {activeTab === 'voice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontWeight: 600 }}>Select System Voice Model</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { name: 'Aria', provider: 'Cartesia', lang: 'English (US)', gender: 'Female', latency: '65ms' },
                    { name: 'Sara', provider: 'Sarvam AI', lang: 'Hinglish', gender: 'Female', latency: '85ms' },
                    { name: 'Callum', provider: 'Cartesia', lang: 'English (UK)', gender: 'Male', latency: '70ms' },
                    { name: 'Hume EVI', provider: 'Hume AI', lang: 'Emotional Adaptive', gender: 'Unisex', latency: '120ms' },
                  ].map((voice) => {
                    const isSelected = selectedVoice === voice.name;
                    const isPlaying = isPlayingVoice === voice.name;
                    return (
                      <div
                        key={voice.name}
                        onClick={() => setSelectedVoice(voice.name)}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(79, 122, 101, 0.02)' : 'var(--card-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={(e) => handlePlayVoice(voice.name, e)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: isPlaying ? 'var(--accent-color)' : 'var(--accent-light)',
                              color: isPlaying ? '#FFFFFF' : 'var(--accent-color)',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            {isPlaying ? (
                              <div className="wave-icon" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                <span style={{ width: '2px', height: '10px', backgroundColor: '#FFF', display: 'inline-block', animation: 'bounce 0.6s infinite alternate' }}></span>
                                <span style={{ width: '2px', height: '14px', backgroundColor: '#FFF', display: 'inline-block', animation: 'bounce 0.6s infinite alternate 0.2s' }}></span>
                                <span style={{ width: '2px', height: '8px', backgroundColor: '#FFF', display: 'inline-block', animation: 'bounce 0.6s infinite alternate 0.4s' }}></span>
                              </div>
                            ) : (
                              <Play size={12} fill="var(--accent-color)" />
                            )}
                          </button>
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {voice.name}
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({voice.gender})</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {voice.provider} • {voice.lang}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right', fontSize: '0.68rem' }}>
                          <div style={{ fontWeight: 500, color: 'var(--accent-color)' }}>{voice.latency}</div>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>avg latency</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, display: 'block' }}>Emotion-Conditioned Synthesizer</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Dynamically adjust pitch and response speed to matches user mood states.</span>
                  </div>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }} />
                </div>
              </div>
            )}

            {/* 4. MEMORY TAB */}
            {activeTab === 'memory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block' }}>VoCall Cognitive Memory Engine</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Allows agents to remember context across conversations and channels.</span>
                  </div>
                  <button
                    onClick={() => setMemoryEnabled(!memoryEnabled)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: memoryEnabled ? 'var(--accent-light)' : 'var(--border-color)',
                      color: memoryEnabled ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {memoryEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {memoryEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { title: 'Short-term', provider: 'Upstash Redis', note: 'Holds live transcripts during voice socket' },
                        { title: 'Long-term', provider: 'Supabase pgvector', note: 'Queries past user details and summaries' },
                        { title: 'Episodic', provider: 'Supabase Postgres', note: 'Recalls exact event summaries by dates' },
                        { title: 'Knowledge Graph', provider: 'FalkorDB', note: 'Maps user entities, entities & frustration triggers' },
                      ].map((tier) => (
                        <div
                          key={tier.title}
                          style={{
                            padding: '10px 12px',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--card-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 600 }}>{tier.title}</span>
                              <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                {tier.provider}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                              {tier.note}
                            </span>
                          </div>
                          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} />
                        </div>
                      ))}
                    </div>

                    {/* Mini Knowledge Graph Preview */}
                    <div
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        backgroundColor: 'var(--surface-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.725rem', color: 'var(--text-primary)', display: 'block' }}>
                        FalkorDB Entity Graph Preview
                      </span>
                      
                      {/* SVG Node Graph */}
                      <svg viewBox="0 0 200 120" style={{ width: '100%', height: '90px', margin: '8px 0' }}>
                        {/* Edges */}
                        <line x1="100" y1="20" x2="50" y2="70" stroke="var(--border-color)" strokeWidth="1.5" />
                        <line x1="100" y1="20" x2="150" y2="70" stroke="var(--border-color)" strokeWidth="1.5" />
                        <line x1="50" y1="70" x2="100" y2="100" stroke="var(--border-color)" strokeWidth="1.5" />
                        <line x1="150" y1="70" x2="100" y2="100" stroke="var(--border-color)" strokeWidth="1.5" />
                        <line x1="50" y1="70" x2="150" y2="70" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="3" />

                        {/* Nodes */}
                        <circle cx="100" cy="20" r="10" fill="var(--accent-color)" />
                        <text x="100" y="23" fontSize="8" fill="#FFF" textAnchor="middle" fontWeight="bold">U</text>
                        <text x="100" y="8" fontSize="7" fill="var(--text-secondary)" textAnchor="middle">User: Abhi</text>

                        <circle cx="50" cy="70" r="10" fill="var(--accent-color)" />
                        <text x="50" y="73" fontSize="8" fill="#FFF" textAnchor="middle" fontWeight="bold">E</text>
                        <text x="32" y="84" fontSize="7" fill="var(--text-secondary)" textAnchor="middle">Sub: Pricing</text>

                        <circle cx="150" cy="70" r="10" fill="var(--accent-color)" />
                        <text x="150" y="73" fontSize="8" fill="#FFF" textAnchor="middle" fontWeight="bold">P</text>
                        <text x="168" y="84" fontSize="7" fill="var(--text-secondary)" textAnchor="middle">Plan: Growth</text>

                        <circle cx="100" cy="100" r="10" fill="#E6E4DF" />
                        <text x="100" y="103" fontSize="8" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">C</text>
                        <text x="100" y="115" fontSize="7" fill="var(--text-secondary)" textAnchor="middle">Status: Pending</text>
                      </svg>
                      
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Graph context is automatically injected during live calls.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. EMOTION TAB */}
            {activeTab === 'emotion' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block' }}>Real-time Emotion Tracker</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Analyze caller tone fluctuations to detect anger, frustration, and engagement.</span>
                  </div>
                  <button
                    onClick={() => setEmotionEnabled(!emotionEnabled)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: emotionEnabled ? 'var(--accent-light)' : 'var(--border-color)',
                      color: emotionEnabled ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {emotionEnabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                {emotionEnabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--card-color)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600 }}>Groq NLP (Text)</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: 600 }}>FREE • DEFAULT</span>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Extracts sentiment tags from transcripts in real-time.
                        </p>
                      </div>

                      <div
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: audioSignalEnabled ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                          backgroundColor: audioSignalEnabled ? 'rgba(79, 122, 101, 0.02)' : 'var(--card-color)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600 }}>Hume AI (Audio)</span>
                          <button
                            onClick={() => setAudioSignalEnabled(!audioSignalEnabled)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--accent-color)',
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {audioSignalEnabled ? 'CONNECTED' : 'CONNECT'}
                          </button>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Analyzes raw audio files for pitch and micro-stressors.
                        </p>
                      </div>
                    </div>

                    {/* Emotion Arc Preview chart */}
                    <div
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        backgroundColor: 'var(--surface-color)',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.725rem', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                        Live Call Emotion Arc Timeline (Preview)
                      </span>
                      
                      {/* SVG line chart */}
                      <svg viewBox="0 0 400 60" style={{ width: '100%', height: '50px' }}>
                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="400" y2="30" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                        
                        {/* Line chart path representing valence levels */}
                        <path
                          d="M 0 35 Q 50 15 100 28 T 200 45 T 300 15 T 400 25"
                          fill="none"
                          stroke="var(--accent-color)"
                          strokeWidth="2.5"
                        />
                        
                        {/* Dot indicator */}
                        <circle cx="300" cy="15" r="4" fill="var(--red-accent)" />
                        <text x="300" y="10" fontSize="7" fill="var(--red-accent)" fontWeight="bold" textAnchor="middle">
                          Frustration Spike
                        </text>
                      </svg>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <span>Start of Call</span>
                        <span>0:45s</span>
                        <span>1:30s</span>
                        <span>End of Call</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Bar: Action logs */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--surface-color)',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              Status: <span style={{ color: 'var(--green-accent)', fontWeight: 600 }}>Active</span> • Latency: <span style={{ fontFamily: 'var(--font-mono)' }}>65ms</span>
            </div>
            <div>
              Memory Synced: <span style={{ fontWeight: 600 }}>12,852 facts mapped</span>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes bounce {
          from { height: 4px; }
          to { height: 16px; }
        }
      `}</style>
    </div>
  );
}
