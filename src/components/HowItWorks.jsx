import React from 'react';
import { SectionBadge, FadeIn } from './UIPrimitives';

const STEPS = [
  {
    n: '01',
    t: 'Import your brand',
    d: 'Drop a URL — we pull tone, use cases, and product context in seconds.'
  },
  {
    n: '02',
    t: 'Compose the agent',
    d: 'Prompt, persona, voice, telephony, memory, and emotion in one console.'
  },
  {
    n: '03',
    t: 'Wire integrations',
    d: 'Google Calendar, HubSpot, webhooks, WhatsApp — during-call or post-call.'
  },
  {
    n: '04',
    t: 'Publish & observe',
    d: 'Route real calls, watch emotion arcs, ship prompt fixes from the analysis tab.'
  }
];

export function HowItWorks() {
  return (
    <section className="border-y border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-28 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <SectionBadge>How it works</SectionBadge>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="mt-5 max-w-3xl font-display text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[52px] text-[color:var(--foreground)]">
            From URL to live voice agent in under fifteen minutes.
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-[color:var(--border)] md:grid-cols-4">
          {STEPS.map((step, idx) => (
            <FadeIn key={step.n} delay={idx * 0.05}>
              <div className="relative h-full bg-[color:var(--card)] p-6 transition hover:bg-[color:var(--surface)]">
                <div className="font-mono text-[11px] text-[color:var(--accent)] font-semibold">
                  {step.n}
                </div>
                <div className="mt-6 font-display text-[18px] font-semibold tracking-tight text-[color:var(--foreground)]">
                  {step.t}
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[color:var(--muted-foreground)]">
                  {step.d}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
