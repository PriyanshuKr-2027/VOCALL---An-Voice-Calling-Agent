import React from 'react';
import { SectionBadge, FadeIn } from './UIPrimitives';
import { AnalyticsConsole } from './AnalyticsConsole';
import { Clock, Tag, ShieldCheck } from 'lucide-react';

const METRICS = [
  { k: 'Median time-to-insight', v: '3.4s', i: Clock },
  { k: 'Auto-tagged calls', v: '98%', i: Tag },
  { k: 'PII redacted', v: '100%', i: ShieldCheck }
];

export function ObservabilitySection() {
  return (
    <section className="px-4 py-28 md:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <FadeIn>
            <SectionBadge>Observability</SectionBadge>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h2 className="mt-5 font-display text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[48px] text-[color:var(--foreground)]">
              The analytics your voice ops team wishes Zendesk had.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-6 text-[15.5px] leading-relaxed text-[color:var(--muted-foreground)]">
              Every call gets a structured summary, a success verdict against your rubric, and a full emotion arc. Filter by agent, contact, or intent — export to Snowflake, BigQuery, or Postgres.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {METRICS.map((m) => (
                <div key={m.k} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
                  <m.i className="h-4 w-4 text-[color:var(--accent)]" />
                  <div className="mt-3 font-display text-[20px] font-semibold tracking-tight text-[color:var(--foreground)]">
                    {m.v}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-[color:var(--muted-foreground)]">
                    {m.k}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <div className="md:col-span-7">
          <FadeIn delay={0.15} y={24}>
            <AnalyticsConsole />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
