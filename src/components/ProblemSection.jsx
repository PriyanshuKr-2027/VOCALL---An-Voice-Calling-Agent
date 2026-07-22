import React from 'react';
import { SectionBadge, FadeIn } from './UIPrimitives';

const PROBLEMS = [
  {
    key: 'Amnesia',
    num: '01',
    val: "Every call starts from zero. Your voice agent doesn't know your customer already called twice this week."
  },
  {
    key: 'Tone-deaf',
    num: '02',
    val: "Scripts don't hear frustration. By the time a human takes over, the customer is already gone."
  },
  {
    key: 'Fragile telephony',
    num: '03',
    val: "Twilio, Plivo, Exotel — glued together with webhooks and prayer. One outage and volume drops."
  }
];

export function ProblemSection() {
  return (
    <section className="px-4 pt-8 pb-20 md:pt-12 md:pb-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <SectionBadge>The problem</SectionBadge>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="mt-5 max-w-3xl font-display text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[52px]">
            Most voice agents{' '}
            <span className="text-[color:var(--muted-foreground)]">
              forget the caller, miss the moment, and drop the line.
            </span>
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-[color:var(--border)] md:grid-cols-3">
          {PROBLEMS.map((prob, idx) => (
            <FadeIn key={prob.key} delay={0.05 * idx}>
              <div className="h-full bg-[color:var(--surface)] p-7 transition hover:bg-white/80">
                <div className="font-display text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)] font-semibold">
                  {prob.num} · {prob.key}
                </div>
                <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--foreground)]">
                  {prob.val}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
