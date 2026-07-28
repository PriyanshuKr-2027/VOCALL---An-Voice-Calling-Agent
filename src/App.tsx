import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LandingPage from './components/LandingPage';
import DashboardShell from './components/DashboardShell';
import DashboardHome from './components/DashboardHome';
import { agentsApi, callsApi, contactsApi, apiKeysApi, phoneNumbersApi } from './services/api';
import type { Agent, Call, Contact, PhoneNumber, APIKeys } from './types';

// Lazy loaded components for code-splitting and bundle size optimization
const AuthPages = lazy(() => import('./components/AuthPages'));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow'));
const AgentBuilder = lazy(() => import('./components/AgentBuilder'));
const ContactsManager = lazy(() => import('./components/ContactsManager'));
const CallsManager = lazy(() => import('./components/CallsManager'));
const AnalyticsPanel = lazy(() => import('./components/AnalyticsPanel'));
const SettingsManager = lazy(() => import('./components/SettingsManager'));

function formatDuration(totalSeconds: number = 0): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

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

  // MOCK CORE STATE STORE WITH BACKEND HYDRATION
  const [orgName, setOrgName] = useState('VoCall Demo');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    groq: 'gsk_demo_key_771x',
    hume: '',
    cartesia: '',
    sarvam: '',
    twilioSid: '',
    twilioToken: '',
    exotelSid: '',
    exotelToken: '',
    hubspot: '',
  });

  const [telephonyNumbers, setTelephonyNumbers] = useState<PhoneNumber[]>([]);
  const [agentsList, setAgentsList] = useState<Agent[]>([
    {
      id: 'a1',
      name: 'Support Agent',
      status: 'active',
      voice: 'Aria',
      language: 'en',
      prompt: 'You are a professional assistant for our organization. Answer client questions politely and collect contact details.',
      description: 'Handles basic client support and compliance routing.',
      telephony: { provider: 'Twilio' },
      memory: { enabled: true },
      emotion: { enabled: true }
    }
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('a1');
  const [callsList, setCallsList] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [contactsList, setContactsList] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Hydrate from FastAPI Backend when available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [remoteAgents, remoteCalls, remoteContacts, remoteNumbers, remoteKeys] = await Promise.allSettled([
          agentsApi.list(),
          callsApi.list(),
          contactsApi.list(),
          phoneNumbersApi.list(),
          apiKeysApi.list()
        ]);

        if (remoteAgents.status === 'fulfilled' && remoteAgents.value.length > 0) {
          const loadedAgents = remoteAgents.value.map((a, idx) => ({
            id: a.id || `a_remote_${idx}`,
            name: a.name,
            status: a.published ? 'active' : 'draft',
            voice: a.voice_id || 'Aria',
            prompt: a.system_prompt || '',
            description: a.system_prompt ? a.system_prompt.substring(0, 90) + '...' : 'Voice AI Agent',
            telephony: { provider: a.voice_provider || 'Twilio' },
            memory: { enabled: a.enable_memory ?? true },
            emotion: { enabled: a.enable_emotion ?? true },
            analysis: a.config?.analysis || { properties: [] }
          }));
          setAgentsList(loadedAgents);
          if (loadedAgents.length > 0) setSelectedAgentId(loadedAgents[0].id);
        }

        if (remoteCalls.status === 'fulfilled' && remoteCalls.value.length > 0) {
          setCallsList(remoteCalls.value.map((c, idx) => ({
            id: c.id || `call_remote_${idx}`,
            direction: c.direction || 'inbound',
            contactName: c.contact_id || 'Client Caller',
            agentName: c.agent_id || 'Voice Agent',
            date: c.created_at || new Date().toISOString(),
            duration: formatDuration(c.duration_seconds),
            status: c.status || 'completed',
            emotionScore: c.emotion_score || 0.8,
            provider: 'LiveKit / Twilio'
          })));
        }

        if (remoteContacts.status === 'fulfilled' && remoteContacts.value.length > 0) {
          const loadedContacts = remoteContacts.value.map((c, idx) => ({
            id: c.id || `c_remote_${idx}`,
            name: c.name || 'Unnamed Contact',
            phone: c.phone || '',
            email: c.email || '',
            tags: c.tags || ['Customer'],
            notes: 'Stored in Supabase database'
          }));
          setContactsList(loadedContacts);
          if (loadedContacts.length > 0) setSelectedContactId(loadedContacts[0].id);
        }

        if (remoteNumbers.status === 'fulfilled' && remoteNumbers.value.length > 0) {
          setTelephonyNumbers(remoteNumbers.value.map((n, idx) => ({
            id: n.id || `num_remote_${idx}`,
            number: n.number,
            provider: n.provider || 'Twilio',
            agentName: null
          })));
        }

        if (remoteKeys.status === 'fulfilled' && remoteKeys.value.length > 0) {
          const keyMap: Record<string, string> = {};
          remoteKeys.value.forEach(k => {
            keyMap[k.provider] = '••••••••••••••••';
          });
          setApiKeys((prev: any) => ({ ...prev, ...keyMap }));
        }
      } catch (err) {
        console.warn('Backend API hydration warning:', err);
      }
    }

    loadBackendData();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (view === 'login' || view === 'signup' || view === 'reset-password') {
    return (
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}><Loader2 className="animate-spin" size={32} /></div>}>
        <AuthPages
          initialView={view === 'login' ? 'login' : view === 'signup' ? 'signup' : 'reset-password'}
          onBackToHome={() => setView('landing')}
          onLoginSuccess={() => setView('onboarding')}
        />
      </Suspense>
    );
  }

  if (view === 'onboarding') {
    return (
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}><Loader2 className="animate-spin" size={32} /></div>}>
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
              setAgentsList((prev) => [newAgent, ...prev]);
              setSelectedAgentId('a3');
            }
            setView('dashboard');
            setSection('home');
          }}
        />
      </Suspense>
    );
  }

  if (view === 'dashboard') {
    const selectedAgent = agentsList.find((a) => a.id === selectedAgentId) || agentsList[0];
    const selectedContact = contactsList.find((c) => c.id === selectedContactId) || contactsList[0];
    const selectedCall = callsList.find((c) => c.id === selectedCallId) || callsList[0];

    const handleSectionChange = (sec: string) => {
      setSection(sec as any);
    };

    const handleCallNow = (contactId: string) => {
      const targetContact = contactsList.find(c => c.id === contactId);
      if (targetContact) {
        const newCall = {
          id: `cal_${Math.random().toString(36).substr(2, 9)}`,
          direction: 'outbound' as const,
          contactName: targetContact.name,
          agentName: agentsList[0]?.name || 'Support Agent',
          date: new Date().toISOString(),
          duration: '1:12',
          status: 'completed' as const,
          emotionScore: 0.82,
          provider: 'Twilio Trunk'
        };
        setCallsList((prev) => [newCall, ...prev]);
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
        agentsList={agentsList}
        onSelectAgent={setSelectedAgentId}
        selectedAgentId={selectedAgentId}
        onNewAgentClick={() => {
          const newId = `a_${Math.random().toString(36).substr(2, 9)}`;
          const brandNew = {
            id: newId,
            name: 'New Custom Agent',
            status: 'active' as const,
            voice: 'Aria',
            prompt: 'You are a warm custom voice agent. Answer user questions politely.',
            description: 'Custom configured agent.',
            telephony: { provider: 'Twilio' },
            memory: { enabled: true },
            emotion: { enabled: false }
          };
          setAgentsList((prev) => [...prev, brandNew]);
          setSelectedAgentId(newId);
          setSection('agents');
        }}
        contactsList={contactsList}
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
          setContactsList((prev) => [...prev, brandNew]);
          setSelectedContactId(newId);
          setSection('contacts');
        }}
        callsList={callsList}
        onSelectCall={setSelectedCallId}
        selectedCallId={selectedCallId}
      >
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%' }}><Loader2 className="animate-spin" size={28} /></div>}>
          {section === 'home' && (
            <DashboardHome
              userName="Admin"
              onNavigateToSection={handleSectionChange}
              callsList={callsList}
              agentsList={agentsList}
            />
          )}
          {(section === 'agents' && selectedAgent) && (
            <AgentBuilder
              agent={selectedAgent}
              onUpdateAgent={(id, fields) => {
                setAgentsList((prev) => prev.map((a) => (a.id === id ? { ...a, ...fields } : a)));
              }}
              callsList={callsList}
              onSelectCall={(id) => {
                setSelectedCallId(id);
                setSection('calls');
              }}
              onNavigateToSection={handleSectionChange}
              telephonyNumbers={telephonyNumbers}
              onSaveCall={(newCall) => {
                setCallsList((prev) => [newCall, ...prev]);
                setSelectedCallId(newCall.id);
                setSection('calls');
              }}
            />
          )}
          {(section === 'contacts' && selectedContact) && (
            <ContactsManager
              contact={selectedContact}
              callsList={callsList}
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
              callsList={callsList}
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
        </Suspense>
      </DashboardShell>
    );
  }

  return (
    <LandingPage
      theme={theme}
      toggleTheme={toggleTheme}
      scrollToSection={scrollToSection}
      onSignInClick={() => setView('login')}
      onSignUpClick={() => setView('signup')}
    />
  );
}
