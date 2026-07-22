import React, { useState } from 'react';
import { LogoIcon } from '../UIPrimitives';
import { ArrowRight, Check, Sparkles, Globe, Bot, Phone, BrainCircuit, Activity, Play } from 'lucide-react';

export function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isImporting, setIsImporting] = useState(false);

  // Form State
  const [orgData, setOrgData] = useState({
    name: 'Northwind Studio',
    domain: 'https://northwind.studio',
    description: 'Enterprise workflow automation and support systems.',
    logo: 'N'
  });
  const [spaceName, setSpaceName] = useState('General');
  const [agentPrompt, setAgentPrompt] = useState('You are Nora, the Support Lead at Northwind. Speak in warm, plain English.');
  const [selectedVoice, setSelectedVoice] = useState('Nora — Warm EN');
  const [telephonyProvider, setTelephonyProvider] = useState('Twilio');
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [emotionEnabled, setEmotionEnabled] = useState(true);
  const [audioSignalEnabled, setAudioSignalEnabled] = useState(true);

  const handleImportDomain = () => {
    setIsImporting(true);
    setTimeout(() => {
      setOrgData({
        ...orgData,
        name: 'Northwind Global',
        description: 'Automating high-scale enterprise customer operations with memory & low latency voice AI.'
      });
      setIsImporting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex flex-col items-center justify-center p-4">
      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-7 w-7 shadow-xs" />
          <span className="font-display text-[16px] font-semibold text-[color:var(--foreground)]">VoCall Onboarding</span>
        </div>
        <div className="font-mono text-[11.5px] text-[color:var(--muted-foreground)]">
          Step {step} of 8
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full max-w-2xl h-1.5 rounded-full bg-[color:var(--border)] overflow-hidden mb-6">
        <div
          className="h-full bg-[color:var(--accent)] transition-all duration-300"
          style={{ width: `${(step / 8) * 100}%` }}
        />
      </div>

      {/* Card Content */}
      <div className="w-full max-w-2xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-xl">
        {/* STEP 1: Create Organization */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[color:var(--foreground)]">Step 1 — Create Organization</h2>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">Enter your organization details or scrape context from your URL.</p>

            <div className="mt-6 space-y-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Company Domain URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={orgData.domain}
                    onChange={(e) => setOrgData({ ...orgData, domain: e.target.value })}
                    className="flex-1 rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleImportDomain}
                    disabled={isImporting}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] px-4 text-[12.5px] font-medium text-[color:var(--foreground)] hover:bg-white transition"
                  >
                    {isImporting ? <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" /> : <Globe className="h-3.5 w-3.5" />}
                    Import URL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgData.name}
                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={orgData.description}
                  onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Create First Space */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[color:var(--foreground)]">Step 2 — Create First Space</h2>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">Spaces organize your agents, contacts, and telemetry into logical groups.</p>
            <div className="mt-6">
              <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Space Name</label>
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[color:var(--accent)]"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Create First Agent */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[color:var(--foreground)]">Step 3 — Create First Agent</h2>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">Define your AI voice agent's core system persona and prompt instructions.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">System Prompt</label>
                <textarea
                  rows={4}
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white p-3 font-mono text-[12.5px] outline-none focus:border-[color:var(--accent)]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['Customer Support', 'Sales Qualifier', 'Appointment Booking', 'Healthcare Intake'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAgentPrompt(`You are an expert ${chip} AI agent. ` + agentPrompt)}
                    className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-[11.5px] text-[color:var(--muted-foreground)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Voice Profile */}
        {step === 4 && (
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[color:var(--foreground)]">Step 4 — Voice Profile</h2>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">Select a low-latency voice model for your agent.</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { name: 'Nora — Warm EN', provider: 'Cartesia', tag: 'EN' },
                { name: 'Aditi — Hinglish', provider: 'Sarvam AI', tag: 'HI / EN' },
                { name: 'Octave — Emotive', provider: 'Hume AI', tag: 'Emotive' }
              ].map((v) => (
                <div
                  key={v.name}
                  onClick={() => setSelectedVoice(v.name)}
                  className={`rounded-xl border p-4 cursor-pointer transition ${
                    selectedVoice === v.name ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10' : 'border-[color:var(--border)] bg-white'
                  }`}
                >
                  <div className="font-medium text-[13px]">{v.name}</div>
                  <div className="mt-1 text-[11px] text-[color:var(--muted-foreground)]">{v.provider} · {v.tag}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Setup Telephony */}
        {step === 5 && (
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[color:var(--foreground)]">Step 5 — Setup Telephony</h2>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">Select your primary carrier provider for SIP trunking and phone routing.</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['Twilio', 'Plivo', 'Exotel'].map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setTelephonyProvider(prov)}
                  className={`rounded-xl border p-4 text-center font-display text-[14px] font-semibold transition ${
                    telephonyProvider === prov ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]' : 'border-[color:var(--border)] bg-white'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Configure Memory */}
        {step === 6 && (
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[color:var(--foreground)]">Step 6 — Configure Memory</h2>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">VoCall's 4-tier memory system prevents customer amnesia across calls.</p>
            <div className="mt-6 space-y-3">
              {[
                { t: 'Short-term', d: 'Upstash Redis · Real-time conversation window' },
                { t: 'Long-term', d: 'Supabase pgvector · Semantic preference retrieval' },
                { t: 'Episodic', d: 'Supabase Postgres · Past call episode summaries' },
                { t: 'Knowledge Graph', d: 'FalkorDB · Entity relationships and frustration links' }
              ].map((tier) => (
                <div key={tier.t} className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-white p-3.5">
                  <div>
                    <div className="font-medium text-[13px]">{tier.t}</div>
                    <div className="text-[11.5px] text-[color:var(--muted-foreground)]">{tier.d}</div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Configure Emotion */}
        {step === 7 && (
          <div>
            <h2 className="font-display text-[24px] font-semibold text-[color:var(--foreground)]">Step 7 — Configure Emotion</h2>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">Detect frustration and adapt agent vocal tone dynamically.</p>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-[color:var(--border)] bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[13px]">Text Emotion Signal</div>
                  <div className="text-[11.5px] text-[color:var(--muted-foreground)]">Groq NLP · Analyzes turn sentiment</div>
                </div>
                <Check className="h-5 w-5 text-[color:var(--accent)]" />
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[13px]">Audio Emotion Signal (Hume AI)</div>
                  <div className="text-[11.5px] text-[color:var(--muted-foreground)]">Vocal acoustic pitch analysis</div>
                </div>
                <input
                  type="checkbox"
                  checked={audioSignalEnabled}
                  onChange={(e) => setAudioSignalEnabled(e.target.checked)}
                  className="h-4 w-4 accent-[color:var(--accent)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Deploy & Test */}
        {step === 8 && (
          <div className="text-center py-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)] mb-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="font-display text-[26px] font-semibold text-[color:var(--foreground)]">Your Voice Agent is Ready!</h2>
            <p className="mt-1 text-[14px] text-[color:var(--muted-foreground)]">
              {orgData.name} · Agent: Nora (Support Lead) · Telephony: {telephonyProvider}
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <button className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2 text-[13px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]">
                Chat Demo
              </button>
              <button className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2 text-[13px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]">
                Web Call Demo
              </button>
            </div>
          </div>
        )}

        {/* Next / Prev Controls */}
        <div className="mt-8 flex items-center justify-between border-t border-[color:var(--border)] pt-5">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-full border border-[color:var(--border)] px-5 py-2 text-[13px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
            >
              Back
            </button>
          ) : <div />}

          {step < 8 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-6 py-2 text-[13px] font-medium text-white hover:opacity-90 shadow-md"
            >
              Continue Step {step + 1}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-8 py-2.5 text-[14px] font-medium text-white hover:opacity-90 shadow-md"
            >
              Go to Dashboard Studio
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
