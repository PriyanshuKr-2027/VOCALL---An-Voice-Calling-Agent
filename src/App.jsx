import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { PlatformSection } from './components/PlatformSection';
import { HowItWorks } from './components/HowItWorks';
import { ObservabilitySection } from './components/ObservabilitySection';
import { IntegrationsSection } from './components/IntegrationsSection';
import { FAQSection } from './components/FAQSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { DemoModal, LoginModal, TourModal, AddContactModal } from './components/Modals';

// Dashboard Components
import { AppShell } from './components/dashboard/AppShell';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { AuthPages } from './components/auth/AuthPages';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { AgentBuilder } from './components/agents/AgentBuilder';
import { ContactsList } from './components/contacts/ContactsList';
import { ContactDetail } from './components/contacts/ContactDetail';
import { CallsList } from './components/calls/CallsList';
import { CallDetail } from './components/calls/CallDetail';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ConnectorsManager } from './components/connectors/ConnectorsManager';
import { SettingsPages } from './components/settings/SettingsPages';

// Mock Central Data
import { 
  INITIAL_AGENTS, 
  INITIAL_CONTACTS, 
  INITIAL_CALLS, 
  INITIAL_API_KEYS, 
  INITIAL_NUMBERS 
} from './data/mockData';

export default function App() {
  // Navigation Route State
  const [currentRoute, setCurrentRoute] = useState('landing'); // 'landing' | 'login' | 'signup' | 'onboarding' | 'dashboard' | 'agents' | 'agent-builder' | 'contacts' | 'contact-detail' | 'calls' | 'call-detail' | 'analytics' | 'connectors' | 'settings' | 'api-keys' | 'settings-telephony' | 'spaces'
  const [selectedAgentId, setSelectedAgentId] = useState('agent-1');
  const [selectedContactId, setSelectedContactId] = useState('c-1');
  const [selectedCallId, setSelectedCallId] = useState('call-101');
  const [activeSpace, setActiveSpace] = useState('General Space');

  // Modals
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // App Data State
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [calls, setCalls] = useState(INITIAL_CALLS);
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [numbers, setNumbers] = useState(INITIAL_NUMBERS);

  const handleNavigate = (route, params = {}) => {
    if (params.agentId) setSelectedAgentId(params.agentId);
    if (params.contactId) setSelectedContactId(params.contactId);
    if (params.callId) setSelectedCallId(params.callId);
    if (params.openAddModal) setIsAddContactOpen(true);
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  const handleAddContact = (newContact) => {
    setContacts([newContact, ...contacts]);
  };

  const handleInitiateCall = (contact) => {
    const newCall = {
      id: `call-${Date.now()}`,
      direction: 'OUT',
      from: 'Support Lead',
      to: contact.phone,
      date: 'Just now',
      duration: '01:15',
      status: 'Completed',
      emotionScore: 0.85,
      testTag: true,
      agentName: 'Support Lead',
      contactName: contact.name,
      transcript: [
        { speaker: 'Agent', text: `Hello ${contact.name}, this is Nora following up from Northwind.`, time: '00:02' },
        { speaker: 'Caller', text: "Thanks for checking in! Everything looks great.", time: '00:08' }
      ],
      analysis: {
        summary: `Outbound follow up call to ${contact.name}. Verified setup success.`,
        success: 'Resolved',
        emotionDelta: '+0.40 → +0.85',
        structuredData: { resolved: true },
        memoryRecalled: ['Long-term: Prefers email over SMS'],
        graphContextUsed: [`${contact.name} -[SUBSCRIBED_TO]-> Enterprise Plan`]
      }
    };
    setCalls([newCall, ...calls]);
    setSelectedCallId(newCall.id);
    setCurrentRoute('call-detail');
  };

  // 1. LANDING PAGE ROUTE
  if (currentRoute === 'landing') {
    return (
      <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--accent)]/20 selection:text-[color:var(--foreground)]">
        <Navbar
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenLogin={() => handleNavigate('login')}
        />
        <main>
          <HeroSection
            onOpenDemo={() => setIsDemoOpen(true)}
            onOpenLogin={() => handleNavigate('onboarding')}
            onOpenTour={() => setIsTourOpen(true)}
          />
          <ProblemSection />
          <PlatformSection />
          <HowItWorks />
          <ObservabilitySection />
          <IntegrationsSection />
          <FAQSection onOpenContact={() => setIsDemoOpen(true)} />
          <CTASection
            onOpenDemo={() => setIsDemoOpen(true)}
            onOpenLogin={() => handleNavigate('onboarding')}
          />
        </main>
        <Footer onOpenContact={() => setIsDemoOpen(true)} />

        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <TourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      </div>
    );
  }

  // 2. AUTH ROUTE
  if (currentRoute === 'login' || currentRoute === 'signup' || currentRoute === 'reset-password') {
    return (
      <AuthPages
        mode={currentRoute}
        onNavigate={handleNavigate}
      />
    );
  }

  // 3. ONBOARDING ROUTE
  if (currentRoute === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={() => handleNavigate('dashboard')}
      />
    );
  }

  // 4. DASHBOARD APP SHELL ROUTES
  return (
    <AppShell
      activeRoute={currentRoute}
      onNavigate={handleNavigate}
      spaces={['General Space', 'Production Support', 'Sales Pipeline']}
      activeSpace={activeSpace}
      onSelectSpace={setActiveSpace}
      agents={agents}
      contacts={contacts}
      calls={calls}
    >
      {currentRoute === 'dashboard' && (
        <DashboardHome
          onNavigate={handleNavigate}
          agents={agents}
          calls={calls}
        />
      )}

      {(currentRoute === 'agents' || currentRoute === 'agent-builder') && (
        <AgentBuilder
          agentId={selectedAgentId}
          agents={agents}
          onSaveAgent={(updated) => setAgents(agents.map(a => a.id === updated.id ? updated : a))}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === 'contacts' && (
        <ContactsList
          contacts={contacts}
          onSelectContact={(id) => handleNavigate('contact-detail', { contactId: id })}
          onOpenAddContact={() => setIsAddContactOpen(true)}
        />
      )}

      {currentRoute === 'contact-detail' && (
        <ContactDetail
          contactId={selectedContactId}
          contacts={contacts}
          onBack={() => handleNavigate('contacts')}
          onInitiateCall={handleInitiateCall}
        />
      )}

      {currentRoute === 'calls' && (
        <CallsList
          calls={calls}
          onSelectCall={(id) => handleNavigate('call-detail', { callId: id })}
        />
      )}

      {currentRoute === 'call-detail' && (
        <CallDetail
          callId={selectedCallId}
          calls={calls}
          onBack={() => handleNavigate('calls')}
        />
      )}

      {currentRoute === 'analytics' && (
        <AnalyticsDashboard
          agents={agents}
        />
      )}

      {currentRoute === 'connectors' && (
        <ConnectorsManager />
      )}

      {(currentRoute === 'settings' || currentRoute === 'api-keys' || currentRoute === 'settings-telephony' || currentRoute === 'spaces') && (
        <SettingsPages
          subroute={currentRoute === 'settings' ? 'org' : currentRoute === 'settings-telephony' ? 'telephony' : currentRoute}
          apiKeys={apiKeys}
          numbers={numbers}
          spaces={['General Space', 'Production Support', 'Sales Pipeline']}
          onNavigate={handleNavigate}
        />
      )}

      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onAdd={handleAddContact}
      />
    </AppShell>
  );
}
