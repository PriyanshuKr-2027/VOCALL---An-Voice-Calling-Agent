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
import { DemoModal, LoginModal, TourModal } from './components/Modals';

export default function App() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--accent)]/20 selection:text-[color:var(--foreground)]">
      {/* Sticky Header Nav */}
      <Navbar
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Page Content */}
      <main>
        <HeroSection
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
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
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer onOpenContact={() => setIsDemoOpen(true)} />

      {/* Interactive Dialog Modals */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <TourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}
