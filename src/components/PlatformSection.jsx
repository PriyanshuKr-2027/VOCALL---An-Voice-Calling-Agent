import React from 'react';
import { SectionBadge, FadeIn } from './UIPrimitives';
import { PlatformConsole } from './PlatformConsole';
import { Check } from 'lucide-react';

const FEATURES = [
  '4-tier memory: short, long, episodic, graph',
  'Text + audio emotion signals (Groq / Hume)',
  'Twilio · Plivo · Exotel routed under one API',
  'SOC 2, HIPAA-ready, GDPR by default'
];

export function PlatformSection() {
  return (
    <section className="border-y border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-28 md:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-12">
        {/* Left Info Column */}
        <div className="md:col-span-5">
          <FadeIn>
            <SectionBadge>The platform</SectionBadge>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h2 className="mt-5 font-display text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[48px] text-[color:var(--foreground)]">
              One platform. Every layer of voice.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-6 text-[16px] leading-relaxed text-[color:var(--muted-foreground)]">
              Build, deploy, and observe production-grade voice agents from a single console — with memory, emotion, telephony, analytics, and integrations wired in from day one.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <ul className="mt-8 space-y-3 text-[14.5px]">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-[color:var(--foreground)]">
                  <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[color:var(--accent)]/12 text-[color:var(--accent)]">
                    <Check className="h-3 w-3" />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        {/* Right Platform Console Demo */}
        <div className="md:col-span-7">
          <FadeIn delay={0.15} y={24}>
            <PlatformConsole />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
