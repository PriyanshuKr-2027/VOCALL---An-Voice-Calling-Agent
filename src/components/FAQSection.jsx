import React, { useState } from 'react';
import { SectionBadge, FadeIn } from './UIPrimitives';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'How is VoCall different from Vapi or Bland AI?',
    a: 'Both are excellent at low-latency TTS and orchestration. VoCall adds four-tier memory (including a FalkorDB knowledge graph), real emotion detection with tone adaptation, and native support for Indian carriers like Plivo and Exotel — with enterprise controls out of the box.'
  },
  {
    q: 'Do you support multi-lingual agents for regional markets?',
    a: 'Yes. Sarvam AI is a first-class TTS/STT provider for Hindi, Hinglish, and Marathi. You can mix and match voices per agent, and the platform handles code-switching automatically.'
  },
  {
    q: 'How do you handle enterprise data privacy and SOC 2?',
    a: 'All memory tiers run in your VPC or a dedicated regional deployment on Enterprise. PII is redacted before storage by default, and every tier can be cleared per contact with a single API call. SOC 2 Type II and HIPAA-ready.'
  },
  {
    q: 'Can we bring our own model (BYOK) and telephony keys?',
    a: 'Yes. Groq, Cartesia, Sarvam, Hume, Cerebras, Twilio, Plivo, Exotel, Resend — all BYOK. Usage stays on your bill; VoCall never marks up model or telephony costs.'
  },
  {
    q: 'What happens on an outage?',
    a: 'Carrier failover is automatic between configured providers. LLM fallback (Groq → Cerebras) is enabled by default. Status is public at status.vocall.io.'
  }
];

export function FAQSection({ onOpenContact }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="border-y border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-28 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
        {/* Left Headline Sidebar */}
        <div className="md:col-span-4">
          <FadeIn>
            <SectionBadge>FAQ</SectionBadge>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h2 className="mt-5 font-display text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[44px] text-[color:var(--foreground)]">
              Answers to the questions we hear most.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
              Still stuck?{' '}
              <button
                onClick={onOpenContact}
                className="inline-flex items-center gap-0.5 underline underline-offset-4 text-[color:var(--foreground)] hover:text-[color:var(--accent)] font-medium transition"
              >
                Ping the team →
              </button>
            </p>
          </FadeIn>
        </div>

        {/* Right Accordion List */}
        <div className="md:col-span-8">
          <div className="divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-xs">
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.q} className="block w-full">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left transition hover:bg-[color:var(--surface)]/50"
                  >
                    <div className="font-display text-[16px] font-medium tracking-tight text-[color:var(--foreground)]">
                      {item.q}
                    </div>
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[color:var(--border)] text-[color:var(--muted-foreground)]">
                      {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden px-6 pb-5"
                      >
                        <p className="mt-1 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
