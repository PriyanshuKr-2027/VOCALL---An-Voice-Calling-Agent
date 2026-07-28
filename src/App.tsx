import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Mail,
  Zap,
  Plus
} from 'lucide-react';
import Navbar from './components/Navbar';
import DashboardPreview from './components/DashboardPreview';
import FeaturesGrid from './components/FeaturesGrid';
import AnalyticsShowcase from './components/AnalyticsShowcase';
import FAQ from './components/FAQ';
import AuthPages from './components/AuthPages';
import OnboardingFlow from './components/OnboardingFlow';
import DashboardShell from './components/DashboardShell';
import DashboardHome from './components/DashboardHome';
import AgentBuilder from './components/AgentBuilder';
import ContactsManager from './components/ContactsManager';
import CallsManager from './components/CallsManager';
import AnalyticsPanel from './components/AnalyticsPanel';
import SettingsManager from './components/SettingsManager';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'reset-password' | 'onboarding' | 'dashboard'>('landing');
  const [section, setSection] = useState<'home' | 'agents' | 'spaces' | 'contacts' | 'calls' | 'analytics' | 'connectors' | 'settings' | 'api-keys' | 'telephony'>('home');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // MOCK CORE STATE STORE
  const [orgName, setOrgName] = useState('VoCall Demo');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [apiKeys, setApiKeys] = useState<any>({
    groq: 'gsk_demo_key_771x',
    sarvam: 'sarvam_hi_882',
    cartesia: 'cartesia_voice_secret_991',
    hume: '',
    twilio: 'tw_auth_secret_token_112'
  });

  const [telephonyNumbers, setTelephonyNumbers] = useState<any[]>([
    { id: 'n1', number: '+1 (555) 019-2849', provider: 'Twilio', agentName: 'Support Agent' },
    { id: 'n2', number: '+91 99999 88888', provider: 'Exotel', agentName: null }
  ]);

  const [agents, setAgents] = useState<any[]>([
    {
      id: 'a1',
      name: 'Support Agent',
      status: 'active',
      voice: 'Aria',
      prompt: 'You are a professional assistant for our organization. Answer client questions politely and collect contact details. Verify Exotel DLT document uploads if requested.',
      description: 'Handles basic client support and DLT document compliance FAQ routing.',
      telephony: { provider: 'Twilio' },
      memory: { enabled: true },
      emotion: { enabled: true, signals: { text: true, audio: false } },
      analysis: {
        properties: [
          { name: 'client_issue', prompt: 'Summarize the primary concern or query raised by the caller.' },
          { name: 'callback_preferred', prompt: 'Boolean indicating if user requested a scheduled callback.' }
        ]
      }
    },
    {
      id: 'a2',
      name: 'Lead Qualifier',
      status: 'active',
      voice: 'Callum',
      prompt: 'You are a warm sales screening assistant. Ask about company size, budget, and project urgency.',
      description: 'Qualifies and logs enterprise leads.',
      telephony: { provider: 'Twilio' },
      memory: { enabled: false },
      emotion: { enabled: false }
    }
  ]);

  const [contacts, setContacts] = useState<any[]>([
    {
      id: 'c1',
      name: 'Abhi Singh',
      phone: '+91 99999 88888',
      email: 'abhi@vocall.ai',
      tags: ['Enterprise', 'Core Team'],
      notes: 'Primary contact on billing. Prefers evening callbacks after 5:00 PM IST.',
      memory: {
        facts: [
          'Confirmed billing email: abhi@vocall.ai',
          'Wants to test Exotel India SIP routing',
          'Prefers calling hours: IST evening'
        ]
      }
    },
    {
      id: 'c2',
      name: 'Rahul Roy',
      phone: '+1 (555) 019-2849',
      email: 'rahul@acme.com',
      tags: ['Sandbox Test'],
      notes: 'Twilio sandbox integration tester.',
      memory: {
        facts: [
          'Using Twilio sandbox trial numbers',
          'Testing stop speaking interval settings'
        ]
      }
    }
  ]);

  const [calls, setCalls] = useState<any[]>([
    { id: 'cal1', direction: 'inbound', contactName: 'Abhi Singh', agentName: 'Support Agent', date: '2026-07-23T11:20:00Z', duration: '1:08', status: 'completed', emotionScore: 0.85, provider: 'Exotel SIP' },
    { id: 'cal2', direction: 'outbound', contactName: 'Rahul Roy', agentName: 'Lead Qualifier', date: '2026-07-23T09:15:00Z', duration: '2:14', status: 'completed', emotionScore: 0.72, provider: 'Twilio Sandbox' },
    { id: 'cal3', direction: 'inbound', contactName: 'Abhi Singh', agentName: 'Support Agent', date: '2026-07-22T14:40:00Z', duration: '0:45', status: 'failed', emotionScore: 0.50, provider: 'Exotel SIP' }
  ]);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('a1');
  const [selectedContactId, setSelectedContactId] = useState<string | null>('c1');
  const [selectedCallId, setSelectedCallId] = useState<string | null>('cal1');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && emailInput.includes('@')) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmailInput('');
      }, 3000);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  if (view === 'login' || view === 'signup' || view === 'reset-password') {
    return (
      <AuthPages
        initialView={view === 'login' ? 'login' : view === 'signup' ? 'signup' : 'reset-password'}
        onBackToHome={() => setView('landing')}
        onLoginSuccess={() => setView('onboarding')}
      />
    );
  }

  if (view === 'onboarding') {
    return (
      <OnboardingFlow
        theme={theme}
        onComplete={(data) => {
          setOrgName(data.orgName);
          setLogoUrl(data.logoPreview);
          if (data.agent) {
            const newAgent = {
              id: 'a3',
              name: data.agent.name,
              status: 'active',
              voice: data.agent.voice,
              prompt: data.agent.prompt,
              description: `Agent created during onboarding. Objectives: ${data.agent.chips.join(', ')}`,
              telephony: { provider: data.telephony.provider },
              memory: data.memory,
              emotion: data.emotion,
              analysis: {
                properties: [
                  { name: 'client_issue', prompt: 'Summarize the primary concern or query raised by the caller.' }
                ]
              }
            };
            setAgents((prev) => [newAgent, ...prev]);
            setSelectedAgentId('a3');
          }
          setView('dashboard');
          setSection('home');
        }}
      />
    );
  }

  if (view === 'dashboard') {
    const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
    const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
    const selectedCall = calls.find((c) => c.id === selectedCallId) || calls[0];

    const handleSectionChange = (sec: string) => {
      setSection(sec as any);
    };

    const handleCallNow = (contactId: string) => {
      const targetContact = contacts.find(c => c.id === contactId);
      if (targetContact) {
        const newCall = {
          id: `cal_${Math.random().toString(36).substr(2, 9)}`,
          direction: 'outbound' as const,
          contactName: targetContact.name,
          agentName: agents[0]?.name || 'Support Agent',
          date: new Date().toISOString(),
          duration: '1:12',
          status: 'completed' as const,
          emotionScore: 0.82,
          provider: 'Twilio Trunk'
        };
        setCalls((prev) => [newCall, ...prev]);
        setSelectedCallId(newCall.id);
        setSection('calls');
      }
    };

    return (
      <DashboardShell
        activeSection={section}
        onSectionChange={handleSectionChange}
        orgName={orgName}
        logoUrl={logoUrl}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={() => setView('landing')}
        agentsList={agents}
        onSelectAgent={setSelectedAgentId}
        selectedAgentId={selectedAgentId}
        onNewAgentClick={() => {
          const newId = `a_${Math.random().toString(36).substr(2, 9)}`;
          const brandNew = {
            id: newId,
            name: 'New Custom Agent',
            status: 'active',
            voice: 'Aria',
            prompt: 'You are a warm custom voice agent. Answer user questions politely.',
            description: 'Custom configured agent.',
            telephony: { provider: 'Twilio' },
            memory: { enabled: true },
            emotion: { enabled: false }
          };
          setAgents((prev) => [...prev, brandNew]);
          setSelectedAgentId(newId);
          setSection('agents');
        }}
        contactsList={contacts}
        onSelectContact={setSelectedContactId}
        selectedContactId={selectedContactId}
        onNewContactClick={() => {
          const newId = `c_${Math.random().toString(36).substr(2, 9)}`;
          const brandNew = {
            id: newId,
            name: 'New Corporate Contact',
            phone: '+91 99999 55555',
            email: 'new-contact@acme.com',
            tags: ['Enterprise'],
            notes: 'Newly added client details.',
            memory: { facts: [] }
          };
          setContacts((prev) => [...prev, brandNew]);
          setSelectedContactId(newId);
          setSection('contacts');
        }}
        callsList={calls}
        onSelectCall={setSelectedCallId}
        selectedCallId={selectedCallId}
      >
        {section === 'home' && (
          <DashboardHome
            userName="Admin"
            onNavigateToSection={handleSectionChange}
            callsList={calls}
            agentsList={agents}
          />
        )}
        {(section === 'agents' && selectedAgent) && (
          <AgentBuilder
            agent={selectedAgent}
            onUpdateAgent={(id, fields) => {
              setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...fields } : a)));
            }}
            callsList={calls}
            onSelectCall={(id) => {
              setSelectedCallId(id);
              setSection('calls');
            }}
            onNavigateToSection={handleSectionChange}
            telephonyNumbers={telephonyNumbers}
          />
        )}
        {(section === 'contacts' && selectedContact) && (
          <ContactsManager
            contact={selectedContact}
            callsList={calls}
            onCallNow={handleCallNow}
            onSelectCall={(id) => {
              setSelectedCallId(id);
              setSection('calls');
            }}
          />
        )}
        {(section === 'calls' && selectedCall) && (
          <CallsManager
            call={selectedCall}
          />
        )}
        {section === 'analytics' && (
          <AnalyticsPanel
            callsList={calls}
          />
        )}
        {(section === 'settings' || section === 'api-keys' || section === 'telephony' || section === 'connectors') && (
          <SettingsManager
            section={section}
            orgName={orgName}
            onUpdateOrgName={setOrgName}
            apiKeys={apiKeys}
            onUpdateApiKeys={setApiKeys}
            telephonyNumbers={telephonyNumbers}
            onAddTelephonyNumber={(num) => setTelephonyNumbers((prev) => [...prev, num])}
            onRemoveTelephonyNumber={(id) => setTelephonyNumbers((prev) => prev.filter((n) => n.id !== id))}
          />
        )}
      </DashboardShell>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Navbar */}
      <Navbar
        onNavClick={scrollToSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignInClick={() => setView('login')}
      />

      {/* 2. Hero Section */}
      <header id="hero" style={{ padding: '80px 0 120px 0', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '16px' }}
          >
            <span className="badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>
              <Zap size={12} style={{ marginRight: '4px' }} />
              VoCall v1.0 is now live
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ maxWidth: '850px', lineHeight: '1.15', marginBottom: '24px' }}
          >
            The Voice Interface for <br />
            <span style={{ color: 'var(--accent-color)' }}>Enterprise AI Agents</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ maxWidth: '650px', fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '40px' }}
          >
            Power human-grade customer calls. VoCall combines sub-110ms audio streams, 4-tier cognitive memory, and real-time voice emotion adaptation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: 'flex', gap: '16px', marginBottom: '80px' }}
          >
            <button className="btn btn-primary" onClick={() => scrollToSection('contact')}>
              Request Enterprise Demo
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('features')}>
              Explore Features
            </button>
          </motion.div>

          {/* Interactive Dashboard Preview container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" as const }}
            style={{ width: '100%', maxWidth: '1050px', boxShadow: 'var(--shadow-premium)', borderRadius: 'var(--radius-lg)' }}
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </header>

      {/* 3. Problem Statement */}
      <section
        id="problem"
        style={{
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-color)',
        }}
        className="section-padding"
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', alignItems: 'center' }} className="problem-grid">
            <motion.div {...fadeInUp}>
              <span className="badge" style={{ marginBottom: '16px' }}>The Latency &amp; Memory Deficit</span>
              <h2 style={{ marginBottom: '20px' }}>Why standard AI voice bots fail in the enterprise</h2>
              <p style={{ fontSize: '1.05rem' }}>
                Most voice implementations are stitched together using legacy components. The result is laggy speech patterns, lack of context between calls, robotic tones, and numbers flagged as spam by carriers.
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
              }}
              className="problem-cards-grid"
            >
              {[
                { title: 'Excessive Latency', desc: 'Average voice-loop latency exceeds 1.5 seconds, causing speakers to talk over each other.' },
                { title: 'Zero Session Memory', desc: 'Bots forget caller information as soon as the socket closes, repeating questions on callback.' },
                { title: 'Robotic inflections', desc: 'TTS engines sound monotone, failing to identify or adapt to consumer frustration tags.' },
                { title: 'Carrier Blockades', desc: 'Unregistered business lines trigger telecom spam filters, resulting in call drops.' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '24px',
                    backgroundColor: 'var(--card-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{item.title}</strong>
                  <p style={{ fontSize: '0.85rem' }}>{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Solution Overview with product screenshots */}
      <section id="overview" className="section-padding">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div {...fadeInUp} style={{ maxWidth: '800px', margin: '0 auto 80px auto' }}>
            <span className="badge" style={{ marginBottom: '16px' }}>The VoCall Advantage</span>
            <h2 style={{ marginBottom: '20px' }}>The ultimate platform for conversational voice</h2>
            <p style={{ fontSize: '1.1rem' }}>
              We solved the infrastructure bottlenecks. VoCall provides a unified, zero-latency orchestration layer that connects your business logic to human-grade voice sockets.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="solution-cards">
            {[
              {
                title: 'WebRTC WebSocket Trunks',
                desc: 'Direct carrier routing loops and regional network hubs reduce voice-to-voice response delay under 110ms.',
                badge: '65ms average'
              },
              {
                title: 'Cognitive Memory Graph',
                desc: 'An integrated multi-tier database automatically updates contacts, transcripts, entity graphs, and past summaries.',
                badge: '4-Tier System'
              },
              {
                title: 'Tone Inflection Adapter',
                desc: 'Identifies pitch markers and micro-stressors. The TTS modifies its speed and emotion-conditioned output instantly.',
                badge: 'Real-time NLP'
              }
            ].map((sol, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="premium-card"
                style={{
                  padding: '32px',
                  backgroundColor: 'var(--card-color)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-color)', textTransform: 'uppercase' }}>
                    {sol.badge}
                  </span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sol.title}</h3>
                <p style={{ fontSize: '0.9rem' }}>{sol.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Feature Deep-Dive Sections */}
      <section id="features" className="section-padding" style={{ backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <motion.div {...fadeInUp} style={{ maxWidth: '800px', margin: '0 auto 60px auto', textAlign: 'center' }}>
            <span className="badge" style={{ marginBottom: '16px' }}>Core Capabilities</span>
            <h2 style={{ marginBottom: '20px' }}>Features built for enterprise reliability</h2>
            <p>
              VoCall is packed with specialized voice pipelines that enable you to deploy secure agents capable of complex tasks.
            </p>
          </motion.div>

          <FeaturesGrid />
        </div>
      </section>

      {/* 6. Analytics Showcase */}
      <section id="analytics" className="section-padding">
        <div className="container">
          <motion.div {...fadeInUp} style={{ maxWidth: '800px', margin: '0 auto 60px auto', textAlign: 'center' }}>
            <span className="badge" style={{ marginBottom: '16px' }}>Insights &amp; Rubrics</span>
            <h2 style={{ marginBottom: '20px' }}>Understand every caller interaction</h2>
            <p>
              Monitor success rates and emotional arcs. VoCall extracts structured properties automatically, giving you granular metrics.
            </p>
          </motion.div>

          <motion.div {...fadeInUp}>
            <AnalyticsShowcase />
          </motion.div>
        </div>
      </section>

      {/* 7. Integrations Grid */}
      <section id="integrations" className="section-padding" style={{ backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '60px', alignItems: 'center' }} className="integrations-grid">
            <motion.div {...fadeInUp}>
              <span className="badge" style={{ marginBottom: '16px' }}>CRM &amp; Pipelines</span>
              <h2 style={{ marginBottom: '20px' }}>Integrate seamlessly with your stack</h2>
              <p style={{ marginBottom: '24px' }}>
                VoCall functions during and after calls. Trigger CRM pipeline creations, calendar event scheduling, and database updates instantly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Live HubSpot deal stage automation',
                  'Google Calendar booking with availability check',
                  'Post-call WhatsApp confirmation campaigns',
                  'Custom HTTP Webhook payload pipelines'
                ].map((txt) => (
                  <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <Check size={16} style={{ color: 'var(--accent-color)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{txt}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual Grid of logos */}
            <motion.div
              {...fadeInUp}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
              className="logo-integration-grid"
            >
              {[
                { name: 'HubSpot', status: 'Connected', desc: 'CRM Pipeline sync' },
                { name: 'Google Cal', status: 'Connected', desc: 'Meeting booking' },
                { name: 'WhatsApp', status: 'Post-Call', desc: 'Outbound alerts' },
                { name: 'Supabase', status: 'Connected', desc: 'Data archiving' },
                { name: 'Groq', status: 'Core API', desc: 'NLP Extraction' },
                { name: 'Hume AI', status: 'Optional', desc: 'Voice metrics' },
                { name: 'Cartesia', status: 'Connected', desc: 'Speech models' },
                { name: 'Sarvam AI', status: 'Connected', desc: 'Hinglish audio' },
                { name: 'Webhooks', status: 'Active', desc: 'Custom payloads' },
              ].map((logo) => (
                <div
                  key={logo.name}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--card-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {logo.name}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    {logo.status}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{logo.desc}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="pricing" className="section-padding">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div {...fadeInUp} style={{ maxWidth: '800px', margin: '0 auto 48px auto' }}>
            <span className="badge" style={{ marginBottom: '16px' }}>Transparent Plans</span>
            <h2 style={{ marginBottom: '20px' }}>Scale-ready pricing plans</h2>
            <p>
              Start prototyping for free or bring your own API keys for dedicated high-volume production.
            </p>

            {/* Toggle monthly/annual */}
            <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: 'var(--surface-color)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '24px' }}>
              <button
                onClick={() => setBillingPeriod('monthly')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: billingPeriod === 'monthly' ? 'var(--card-color)' : 'transparent',
                  color: billingPeriod === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: billingPeriod === 'monthly' ? 'var(--shadow-subtle)' : 'none',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: billingPeriod === 'annual' ? 'var(--card-color)' : 'transparent',
                  color: billingPeriod === 'annual' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: billingPeriod === 'annual' ? 'var(--shadow-subtle)' : 'none',
                }}
              >
                Yearly (20% off)
              </button>
            </div>
          </motion.div>

          {/* Pricing cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="pricing-grid">
            {[
              {
                title: 'Developer',
                price: '$0',
                note: 'For testing & sandboxing',
                features: [
                  '1 Active voice agent',
                  'Upstash Redis short-term cache',
                  'Standard Groq NLP text signals',
                  'VoCall default Twilio numbers',
                  '2,000 Free call minutes'
                ],
                cta: 'Start Prototyping',
                popular: false
              },
              {
                title: 'Growth',
                price: billingPeriod === 'annual' ? '$79' : '$99',
                note: 'For production scale',
                features: [
                  'Unlimited active voice agents',
                  'BYOK (Cartesia, Hume AI, Sarvam AI)',
                  '4-Tier Cognitive Memory Engine',
                  'Full Emotion adaptive tones',
                  'During/Post-call Connector grids',
                  'Priority voice socket queue'
                ],
                cta: 'Start 14-day Trial',
                popular: true
              },
              {
                title: 'Enterprise',
                price: 'Custom',
                note: 'For high volume routing',
                features: [
                  'Dedicated regional carrier trunks',
                  'Carrier compliance & KYC wizard',
                  'HIPAA/GDPR data-sovereignty',
                  'Dedicated Spaces roles',
                  '99.99% Voice socket uptime SLA',
                  '24/7 Dedicated account manager'
                ],
                cta: 'Request Custom Proposal',
                popular: false
              }
            ].map((plan) => (
              <motion.div
                key={plan.title}
                {...fadeInUp}
                className="premium-card"
                style={{
                  padding: '40px 32px',
                  backgroundColor: 'var(--card-color)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                }}
              >
                {plan.popular && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent-color)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Most Popular
                  </span>
                )}
                
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{plan.title}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {plan.price}
                  </strong>
                  {plan.price !== 'Custom' && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ month</span>
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>{plan.note}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px', flex: 1 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                      <Check size={14} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', fontSize: '0.9rem' }}
                  onClick={() => {
                    if (plan.cta.includes('Start')) {
                      setView('signup');
                    } else {
                      scrollToSection('contact');
                    }
                  }}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ Accordion */}
      <section id="faq" className="section-padding" style={{ backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <motion.div {...fadeInUp} style={{ maxWidth: '800px', margin: '0 auto 60px auto', textAlign: 'center' }}>
            <span className="badge" style={{ marginBottom: '16px' }}>Documentation</span>
            <h2 style={{ marginBottom: '20px' }}>Frequently Asked Questions</h2>
            <p>
              Find answers to technical and regulatory queries about the VoCall platform.
            </p>
          </motion.div>

          <motion.div {...fadeInUp}>
            <FAQ />
          </motion.div>
        </div>
      </section>

      {/* 10. Final CTA Banner */}
      <section id="contact" className="section-padding">
        <div className="container">
          <motion.div
            {...fadeInUp}
            className="premium-card"
            style={{
              padding: '60px 40px',
              backgroundColor: 'var(--card-color)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            <span className="badge" style={{ marginBottom: '16px' }}>Deploy Today</span>
            <h2 style={{ fontSize: '2rem', maxWidth: '600px', marginBottom: '16px' }}>
              Build human-grade voice experiences with VoCall
            </h2>
            <p style={{ maxWidth: '500px', marginBottom: '32px', fontSize: '0.95rem' }}>
              Request a custom enterprise demo to see how our low-latency memory pipeline fits into your existing CRM networks.
            </p>

            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '16px 24px',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent-color)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                Thank you! Our enterprise solution architects will be in touch shortly.
              </motion.div>
            ) : (
              <form
                onSubmit={handleDemoSubmit}
                style={{
                  display: 'flex',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '450px',
                }}
                className="cta-form"
              >
                <input
                  type="email"
                  placeholder="Enter your work email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="btn btn-primary">
                  Request Demo
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-color)',
          padding: '60px 0 40px 0',
          marginTop: 'auto',
        }}
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }} className="footer-columns">
            <div>
              <a
                href="#"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Plus size={14} />
                </div>
                VoCall
              </a>
              <p style={{ fontSize: '0.85rem', maxWidth: '280px', marginBottom: '24px' }}>
                Enterprise AI voice agents powered by sub-110ms sockets and 4-tier conversational memory engines.
              </p>

              {/* Status bullet */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span className="pulsing-green-dot"></span>
                All systems fully operational
              </div>
            </div>

            {[
              {
                title: 'Product',
                links: ['Dashboard', 'Agents Builder', 'Memory Tiers', 'Emotion NLP', 'Integrations']
              },
              {
                title: 'Resources',
                links: ['Documentation', 'Guides & FAQs', 'API References', 'System Status', 'Developer Forum']
              },
              {
                title: 'Company',
                links: ['About Us', 'Contact Sales', 'Terms of Service', 'Privacy Policy', 'GDPR / KYC']
              }
            ].map((col) => (
              <div key={col.title}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  {col.title}
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (link === 'Memory Tiers') scrollToSection('features');
                        else if (link === 'Integrations') scrollToSection('integrations');
                        else if (link === 'Guides & FAQs') scrollToSection('faq');
                      }}
                      style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom copyright and social */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <span>&copy; {new Date().getFullYear()} VoCall AI Technologies, Inc. All rights reserved.</span>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                GitHub
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} />
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Embedded CSS for responsive elements */}
      <style>{`
        .pulsing-green-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--green-accent);
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(45, 157, 120, 0.4);
          animation: pulse 1.6s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(45, 157, 120, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(45, 157, 120, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(45, 157, 120, 0);
          }
        }

        @media (max-width: 1024px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            max-width: 500px;
            margin: 0 auto;
          }
          .solution-cards {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            max-width: 500px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .problem-grid, .integrations-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .footer-columns {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          .cta-form {
            flex-direction: column !important;
            width: 100% !important;
          }
          .logo-integration-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .footer-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
