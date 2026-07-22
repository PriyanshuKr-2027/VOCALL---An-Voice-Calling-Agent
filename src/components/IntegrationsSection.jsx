import React, { useState } from 'react';
import { SectionBadge, FadeIn } from './UIPrimitives';
import { Search, Zap } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Google Calendar', cat: 'CRM & Calendar', desc: 'Real-time appointment booking and conflict checking.' },
  { name: 'HubSpot', cat: 'CRM', desc: 'Sync post-call summaries, disposition tags, and contacts.' },
  { name: 'Salesforce', cat: 'CRM', desc: 'Automate task creation and pipeline updates.' },
  { name: 'Supabase', cat: 'Database', desc: 'Direct vector store and customer database sync.' },
  { name: 'Postgres', cat: 'Database', desc: 'Export raw call analytics and telemetry.' },
  { name: 'Slack', cat: 'Alerts', desc: 'Instant alerts on high-frustration calls or supervisor escalations.' },
  { name: 'WhatsApp', cat: 'Messaging', desc: 'Send during-call links or post-call WhatsApp confirmations.' },
  { name: 'Zapier', cat: 'Automation', desc: 'Connect to 5,000+ business tools without code.' },
  { name: 'Twilio', cat: 'Telephony', desc: 'Native BYOK sip trunking with auto failover.' },
  { name: 'Plivo', cat: 'Telephony', desc: 'Low-cost international carrier connectivity.' },
  { name: 'Exotel', cat: 'Telephony', desc: 'Indian carrier routing with local number verification.' },
  { name: 'Cartesia', cat: 'Voice Model', desc: 'Ultra-low latency sub-200ms natural voice generation.' },
  { name: 'Sarvam AI', cat: 'Voice Model', desc: 'First-class Hindi, Hinglish, Marathi STT & TTS models.' },
  { name: 'Hume AI', cat: 'Emotion AI', desc: 'Real-time acoustic emotion detection and vocal tone adaptation.' },
  { name: 'Groq', cat: 'LLM Engine', desc: 'Sub-second Llama 3 inference on LPU chips.' },
  { name: 'Cerebras', cat: 'LLM Engine', desc: 'Ultra-fast LLM fallback pipeline.' },
  { name: 'Resend', cat: 'Email', desc: 'Instant transactional email dispatch during calls.' },
  { name: 'Webhook', cat: 'Developer', desc: 'Custom HTTP hooks for turn-by-turn logic.' }
];

export function IntegrationsSection() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Telephony', 'Voice Model', 'CRM', 'Database', 'Alerts'];

  const filteredIntegrations = INTEGRATIONS.filter(item => {
    const matchesCat = filter === 'All' || item.cat.includes(filter);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="integrations" className="border-y border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-28 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <SectionBadge>Integrations</SectionBadge>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="mt-5 max-w-3xl font-display text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[52px] text-[color:var(--foreground)]">
            Every model, carrier, and CRM wired into one platform.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    filter === cat
                      ? 'bg-[color:var(--foreground)] text-[color:var(--surface)] shadow-xs'
                      : 'border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--muted-foreground)] hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-[color:var(--border)] bg-[color:var(--card)] py-2 pl-9 pr-4 text-[13px] text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] outline-none focus:border-[color:var(--accent)]"
              />
            </div>
          </div>
        </FadeIn>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredIntegrations.map((item, idx) => (
            <FadeIn key={item.name} delay={idx * 0.03}>
              <div className="group h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-0.5 font-mono text-[10px] uppercase text-[color:var(--muted-foreground)]">
                    {item.cat}
                  </span>
                  <Zap className="h-3.5 w-3.5 text-[color:var(--muted-foreground)] opacity-40 group-hover:text-[color:var(--accent)] group-hover:opacity-100 transition" />
                </div>
                <div className="mt-4 font-display text-[16px] font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition">
                  {item.name}
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--muted-foreground)]">
                  {item.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
