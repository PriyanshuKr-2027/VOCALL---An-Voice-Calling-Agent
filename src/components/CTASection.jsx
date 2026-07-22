import React from 'react';
import { FadeIn } from './UIPrimitives';
import { ArrowRight, Radio } from 'lucide-react';

export function CTASection({ onOpenDemo, onOpenLogin }) {
  return (
    <section id="cta" className="px-4 py-28 md:py-36">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--foreground)] p-10 text-center text-[color:var(--surface)] shadow-[var(--shadow-elevated)] md:p-20 relative">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[color:var(--accent)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[color:var(--accent)]/15 blur-3xl" />

        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1 text-[11.5px] text-white/80">
            <Radio className="h-3.5 w-3.5 text-[color:var(--accent)] animate-pulse" />
            <span>Live at Northwind, Helix, Meridian</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[62px]">
            Ship a voice agent your customers{' '}
            <span className="italic text-[color:var(--accent)] font-serif font-normal">actually</span>{' '}
            want to keep on the line.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/70">
            15-minute setup. First 100 minutes on us. No credit card required.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onOpenLogin}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--surface)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:opacity-90 shadow-md"
            >
              Start building
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenDemo}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-medium text-[color:var(--surface)] transition hover:bg-white/10"
            >
              Book a demo
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
