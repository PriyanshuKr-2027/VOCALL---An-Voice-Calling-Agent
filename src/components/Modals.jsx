import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, Play, Sparkles, Lock, Bot } from 'lucide-react';
import { LogoIcon } from './UIPrimitives';

export function DemoModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    minutes: '10k - 50k mins/mo',
    useCase: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)] transition"
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2">
              <LogoIcon />
              <span className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">VoCall Enterprise</span>
            </div>
            <h3 className="mt-4 font-display text-[22px] font-semibold text-[color:var(--foreground)] tracking-tight">
              Book a 1-on-1 Product Demo
            </h3>
            <p className="mt-1.5 text-[13.5px] text-[color:var(--muted-foreground)]">
              See how VoCall's 4-tier memory & emotion detection works on your telephony volume.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-[13px]">
              <div>
                <label className="block text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-mono">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nora Aris"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-mono">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nora@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-mono">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Northwind Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 outline-none focus:border-[color:var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-mono">
                    Expected Volume
                  </label>
                  <select
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                    className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2.5 outline-none focus:border-[color:var(--accent)]"
                  >
                    <option>&lt; 10k mins/mo</option>
                    <option>10k - 50k mins/mo</option>
                    <option>50k - 250k mins/mo</option>
                    <option>250k+ mins/mo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--foreground)] text-white text-[14px] font-medium hover:opacity-90 transition shadow-md"
              >
                Confirm Demo Reservation
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[11px] text-[color:var(--muted-foreground)] font-mono mt-2">
                🔒 SOC 2 Type II Certified · Instant VPC Sandbox
              </p>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)] mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-[22px] font-semibold text-[color:var(--foreground)]">
              Demo Confirmed!
            </h3>
            <p className="mt-2 text-[14px] text-[color:var(--muted-foreground)] leading-relaxed">
              We've dispatched a calendar invitation and API Sandbox keys to <span className="font-semibold text-[color:var(--foreground)]">{formData.email}</span>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--foreground)] px-6 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto inline-flex items-center justify-center mb-3">
            <LogoIcon className="h-9 w-9" />
          </div>
          <h3 className="font-display text-[22px] font-semibold text-[color:var(--foreground)]">
            Sign in to VoCall Console
          </h3>
          <p className="mt-1 text-[13px] text-[color:var(--muted-foreground)]">
            First 100 free minutes included with every account.
          </p>

          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="mt-6 space-y-4 text-left"
            >
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-mono">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--foreground)] text-white text-[14px] font-medium hover:opacity-90 transition"
              >
                Continue with Email
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative my-4 text-center text-[11px] text-[color:var(--muted-foreground)]">
                <span className="bg-[color:var(--surface)] px-2">OR SINGLE SIGN-ON</span>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-white text-[13px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)] transition"
              >
                <Lock className="h-3.5 w-3.5" /> Continue with Google / SAML SSO
              </button>
            </form>
          ) : (
            <div className="mt-6 py-4">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)] mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-display text-[18px] font-semibold">Verification link sent!</h4>
              <p className="mt-2 text-[13px] text-[color:var(--muted-foreground)]">
                We sent a magic login link to <span className="font-medium text-[color:var(--foreground)]">{email || 'your email'}</span>. Click it to enter your workspace console.
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  onClose();
                }}
                className="mt-5 inline-flex h-9 items-center justify-center rounded-full border border-[color:var(--border)] px-5 text-[12px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TourModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: '1. Scrape Brand Tone from Any URL',
      desc: 'Drop a URL and VoCall instantly extracts your product positioning, FAQ knowledge base, and brand tone guidelines.',
      badge: 'Brand Scraper'
    },
    {
      title: '2. 4-Tier Memory & Knowledge Graph',
      desc: 'Short-term context, long-term caller preferences, episodic memory, and FalkorDB knowledge graph prevent customer amnesia.',
      badge: 'Memory System'
    },
    {
      title: '3. Acoustic Emotion & Carrier Failover',
      desc: 'Groq & Hume AI detect customer frustration turns and automatically condition vocal pitch while Twilio/Plivo failovers run seamlessly.',
      badge: 'Telephony & Emotion'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-full bg-[color:var(--accent)]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[color:var(--accent)]">
            {tourSteps[activeStep].badge}
          </span>
          <span className="text-[12px] text-[color:var(--muted-foreground)] font-mono">
            Step {activeStep + 1} of 3
          </span>
        </div>

        <h3 className="font-display text-[24px] font-semibold text-[color:var(--foreground)] tracking-tight">
          {tourSteps[activeStep].title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
          {tourSteps[activeStep].desc}
        </p>

        {/* Video / Interactive Visual Mockup */}
        <div className="mt-6 relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--accent)]/5 to-transparent" />
          <Bot className="h-12 w-12 text-[color:var(--accent)] mb-3 animate-bounce" />
          <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">
            VoCall Interactive Voice Engine Simulation
          </div>
          <div className="mt-1 text-[12px] text-[color:var(--muted-foreground)] font-mono">
            Latency: 180ms · Telephony: Exotel/Twilio · Carrier: Active
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border)] pt-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeStep ? 'w-6 bg-[color:var(--accent)]' : 'w-2 bg-[color:var(--border)]'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="rounded-full border border-[color:var(--border)] px-4 py-1.5 text-[12.5px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
              >
                Previous
              </button>
            )}
            {activeStep < 2 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="rounded-full bg-[color:var(--foreground)] px-5 py-1.5 text-[12.5px] font-medium text-white hover:opacity-90"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-full bg-[color:var(--accent)] px-5 py-1.5 text-[12.5px] font-medium text-white hover:opacity-90"
              >
                Close Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
