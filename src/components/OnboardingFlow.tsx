import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  FolderOpen,
  Bot,
  Volume2,
  PhoneCall,
  Brain,
  Smile,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Upload,
  Play,
  CheckCircle,
  MessageSquare,
  Globe
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
  theme: 'light' | 'dark';
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Form States
  const [orgName, setOrgName] = useState('');
  const [domainUrl, setDomainUrl] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [spaceName, setSpaceName] = useState('General');
  
  const [agentPrompt, setAgentPrompt] = useState('You are a professional assistant for our organization. Answer client questions politely and collect contact details.');
  const [selectedChips, setSelectedChips] = useState<string[]>(['Customer Support']);
  
  const [selectedVoice, setSelectedVoice] = useState('Aria');
  
  const [selectedProvider, setSelectedProvider] = useState<'Twilio' | 'Plivo' | 'Exotel'>('Twilio');
  const [callingHoursEnabled, setCallingHoursEnabled] = useState(false);
  
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [memoryTiers, setMemoryTiers] = useState({
    short: true,
    long: true,
    episodic: true,
    graph: true
  });
  
  const [emotionEnabled, setEmotionEnabled] = useState(true);
  const [emotionSignals, setEmotionSignals] = useState({
    text: true,
    audio: false
  });

  const [testMode, setTestMode] = useState<'chat' | 'web' | 'phone' | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handlePlayVoice = (voiceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingVoice === voiceName) {
      setIsPlayingVoice(null);
    } else {
      setIsPlayingVoice(voiceName);
      setTimeout(() => setIsPlayingVoice(null), 3000);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const onboardingData = {
      orgName: orgName || 'Default Org',
      domainUrl,
      orgDesc,
      logoPreview,
      spaceName,
      agent: {
        name: `${orgName || 'VoCall'} Support Agent`,
        prompt: agentPrompt,
        chips: selectedChips,
        voice: selectedVoice,
      },
      telephony: {
        provider: selectedProvider,
        callingHours: callingHoursEnabled ? '09:00 AM - 06:00 PM' : '24/7'
      },
      memory: {
        enabled: memoryEnabled,
        tiers: memoryTiers
      },
      emotion: {
        enabled: emotionEnabled,
        signals: emotionSignals
      }
    };
    onComplete(onboardingData);
  };

  // Step Information
  const stepMeta = [
    { title: 'Create Organization', icon: Building2, desc: 'Set up your company profile' },
    { title: 'Create First Space', icon: FolderOpen, desc: 'Organize your voice workflows' },
    { title: 'Create First Agent', icon: Bot, desc: 'Define your agent persona and goal' },
    { title: 'Select Voice Profile', icon: Volume2, desc: 'Choose a synthesizer voice' },
    { title: 'Setup Telephony', icon: PhoneCall, desc: 'Configure carrier phone trunks' },
    { title: 'Configure Memory', icon: Brain, desc: 'Enable multi-tier context engines' },
    { title: 'Configure Emotion', icon: Smile, desc: 'Activate real-time NLP sentiment analysis' },
    { title: 'Deploy & Test', icon: Rocket, desc: 'Try out your live socket' }
  ];

  const CurrentIcon = stepMeta[step - 1].icon;

  const fadeVariant = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div style={{ width: '100%', maxWidth: '620px' }}>
        
        {/* Progress Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
              <CurrentIcon size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step {step} of {totalSteps}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {stepMeta[step - 1].title}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(step / totalSteps) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--accent-color)',
                transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
        </div>

        {/* Card Container */}
        <div
          className="premium-card"
          style={{
            padding: '40px',
            backgroundColor: 'var(--card-color)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-premium)',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={step} {...fadeVariant} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
              {/* STEP 1: CREATE ORG */}
              {step === 1 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Let's set up your Organization</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Every agent, contact, and call is scoped inside your organization shell.</p>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--surface-color)',
                          border: '2px dashed var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('logo-upload-input')?.click()}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Upload size={20} style={{ color: 'var(--text-secondary)' }} />
                        )}
                      </div>
                      <input
                        type="file"
                        id="logo-upload-input"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Organization Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Corp"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--surface-color)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Domain URL (Optional)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="https://acme.com"
                        value={domainUrl}
                        onChange={(e) => setDomainUrl(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--surface-color)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '10px 16px' }}
                        onClick={() => {
                          if (domainUrl) {
                            setOrgName(domainUrl.replace(/https?:\/\/(www\.)?/, '').split('.')[0].toUpperCase());
                            setOrgDesc(`Crawled context from ${domainUrl}. Automated support agent for routing inquiries and ticket resolutions.`);
                          }
                        }}
                      >
                        Import
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                    <textarea
                      placeholder="Describe what your organization does..."
                      value={orgDesc}
                      onChange={(e) => setOrgDesc(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </>
              )}

              {/* STEP 2: CREATE FIRST SPACE */}
              {step === 2 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Create your first Space</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Spaces are partitioned directories used to segment teams, departments, or test sandboxes.</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Space Name</label>
                    <input
                      type="text"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                      Default space will hold contacts and call history logs for your initial sandbox testing.
                    </span>
                  </div>
                </>
              )}

              {/* STEP 3: CREATE FIRST AGENT */}
              {step === 3 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Configure your first Agent</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Specify the prompt persona instructions and objectives for your AI caller.</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>System Persona Prompt</label>
                    <textarea
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        lineHeight: '1.4'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Objective Chips Presets</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        'Customer Support',
                        'Sales & Qualification',
                        'Appointment Booking',
                        'Debt Collections Help',
                        'HR Recruitment Screen'
                      ].map((chip) => {
                        const isSelected = selectedChips.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => toggleChip(chip)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.725rem',
                              border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                              backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                              color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                              fontWeight: isSelected ? 600 : 500,
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)'
                            }}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 4: VOICE PROFILE */}
              {step === 4 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Choose Voice Profile</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select the TTS voice synthesizer model for your agent.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { name: 'Aria', provider: 'Cartesia', lang: 'EN (US)', gender: 'Female', latency: '65ms' },
                      { name: 'Sara', provider: 'Sarvam AI', lang: 'HI / hinged', gender: 'Female', latency: '85ms' },
                      { name: 'Callum', provider: 'Cartesia', lang: 'EN (UK)', gender: 'Male', latency: '70ms' },
                      { name: 'Hume Octave', provider: 'Hume AI', lang: 'Adaptive', gender: 'Unisex', latency: '120ms' },
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
                            backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--card-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={(e) => handlePlayVoice(voice.name, e)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isPlaying ? 'var(--accent-color)' : 'rgba(79, 122, 101, 0.1)',
                                color: isPlaying ? '#FFFFFF' : 'var(--accent-color)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Play size={12} fill={isPlaying ? '#FFFFFF' : 'var(--accent-color)'} />
                            </button>
                            <div>
                              <div style={{ fontWeight: 600 }}>{voice.name}</div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                {voice.lang} • {voice.gender}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                            {voice.latency}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* STEP 5: SETUP TELEPHONY */}
              {step === 5 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Setup Telephony Trunks</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Connect a voice provider to route phone calls to and from users.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { id: 'Twilio', name: 'Twilio (Global Sandbox)', note: 'Includes free test credits, best for initial sandbox testing.' },
                      { id: 'Plivo', name: 'Plivo (India / International)', note: 'Recommended for low-cost international routing.' },
                      { id: 'Exotel', name: 'Exotel (India Enterprise)', note: 'Required for corporate SIP registration & India telecom laws.' }
                    ].map((prov) => (
                      <div
                        key={prov.id}
                        onClick={() => setSelectedProvider(prov.id as any)}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: selectedProvider === prov.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                          backgroundColor: selectedProvider === prov.id ? 'var(--accent-light)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>{prov.name}</span>
                          <input
                            type="radio"
                            name="telephony-provider"
                            checked={selectedProvider === prov.id}
                            onChange={() => setSelectedProvider(prov.id as any)}
                            style={{ accentColor: 'var(--accent-color)' }}
                          />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{prov.note}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block', fontSize: '0.8rem' }}>Set Standard Calling Hours</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Limit outbound redialing to Mon-Fri 09:00 AM - 06:00 PM.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={callingHoursEnabled}
                      onChange={(e) => setCallingHoursEnabled(e.target.checked)}
                      style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
                    />
                  </div>
                </>
              )}

              {/* STEP 6: CONFIGURE MEMORY */}
              {step === 6 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Configure Memory Tiers</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Equip your agent with dynamic context layers to remember client conversations.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Master Memory Switch</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enable cross-session memory retention.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMemoryEnabled(!memoryEnabled)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        backgroundColor: memoryEnabled ? 'var(--accent-color)' : 'var(--border-color)',
                        color: memoryEnabled ? '#FFFFFF' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {memoryEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {memoryEnabled && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { id: 'short', title: 'Short-term', note: 'Redis socket transcripts', db: 'Upstash Redis' },
                        { id: 'long', title: 'Long-term', note: 'Semantic vector facts', db: 'Supabase Vector' },
                        { id: 'episodic', title: 'Episodic', note: 'Chronological summary tags', db: 'Supabase DB' },
                        { id: 'graph', title: 'Knowledge Graph', note: 'FalkorDB entities relationship', db: 'FalkorDB' }
                      ].map((tier) => (
                        <div
                          key={tier.id}
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--surface-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{tier.title}</span>
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--card-color)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)', margin: '4px 0', display: 'inline-block' }}>
                              {tier.db}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>{tier.note}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={(memoryTiers as any)[tier.id]}
                            onChange={(e) => setMemoryTiers(prev => ({ ...prev, [tier.id]: e.target.checked }))}
                            style={{ accentColor: 'var(--accent-color)' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STEP 7: CONFIGURE EMOTION */}
              {step === 7 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Configure Emotion Engine</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enable real-time vocal stress tracking and frustration detection.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Enable Emotion Adaptive Tone</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Slow down or adapt voice pitch based on user responses.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmotionEnabled(!emotionEnabled)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        backgroundColor: emotionEnabled ? 'var(--accent-color)' : 'var(--border-color)',
                        color: emotionEnabled ? '#FFFFFF' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {emotionEnabled ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </div>

                  {emotionEnabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--surface-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, display: 'block', fontSize: '0.85rem' }}>Text Signal Tracker (Groq NLP)</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Extracts frustration indices from text transcripts. (Free default)</span>
                        </div>
                        <input type="checkbox" checked={emotionSignals.text} readOnly style={{ accentColor: 'var(--accent-color)' }} />
                      </div>

                      <div
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: emotionSignals.audio ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                          backgroundColor: emotionSignals.audio ? 'var(--accent-light)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => setEmotionSignals(prev => ({ ...prev, audio: !prev.audio }))}
                      >
                        <div>
                          <span style={{ fontWeight: 600, display: 'block', fontSize: '0.85rem' }}>Audio Acoustic stress (Hume AI Octave)</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Analyzes raw audio logs for micro-frustration markers. (Requires Hume key)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={emotionSignals.audio}
                          onChange={(e) => setEmotionSignals(prev => ({ ...prev, audio: e.target.checked }))}
                          style={{ accentColor: 'var(--accent-color)' }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP 8: DEPLOY + TEST */}
              {step === 8 && (
                <>
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <CheckCircle size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Ready for Deployment</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                      Your organization `{orgName || 'VoCall'}` and support agent are fully configured. Perform a quick test before launching.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'chat', label: 'Try Chat UI', icon: MessageSquare },
                      { id: 'web', label: 'Try Web Call', icon: Globe },
                      { id: 'phone', label: 'Try Phone Call', icon: PhoneCall },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isTesting = testMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setTestMode(isTesting ? null : mode.id as any)}
                          style={{
                            padding: '16px 8px',
                            borderRadius: 'var(--radius-md)',
                            border: isTesting ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                            backgroundColor: isTesting ? 'var(--accent-light)' : 'var(--card-color)',
                            color: isTesting ? 'var(--accent-color)' : 'var(--text-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          <Icon size={18} />
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>

                  {testMode && (
                    <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-color)', fontSize: '0.8rem', textAlign: 'center' }}>
                      {testMode === 'chat' && '💬 Chat socket connected. Type a message to support agent.'}
                      {testMode === 'web' && '🌐 WebRTC audio socket open. Speak into microphone.'}
                      {testMode === 'phone' && `📞 Direct dial trunk active. Call: +1 (555) 019-2849.`}
                    </div>
                  )}
                </>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Card Action Footer */}
          <div
            style={{
              marginTop: '32px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="btn btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.85rem',
                opacity: step === 1 ? 0.3 : 1,
                cursor: step === 1 ? 'not-allowed' : 'pointer',
                gap: '6px'
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.85rem', gap: '6px' }}
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontSize: '0.85rem', gap: '6px', backgroundColor: 'var(--accent-color)' }}
              >
                Go to Dashboard
                <Rocket size={14} />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
