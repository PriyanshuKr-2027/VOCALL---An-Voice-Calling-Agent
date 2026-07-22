import React from 'react';
import { FadeIn } from './UIPrimitives';
import { HeroConsole } from './HeroConsole';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection({ onOpenDemo, onOpenLogin, onOpenTour }) {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-36 md:pb-14 md:pt-44">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-[color:var(--surface)] to-transparent" />

      <div className="mx-auto max-w-5xl text-center">
        <FadeIn>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-[12px] text-[color:var(--muted-foreground)] shadow-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--accent)] opacity-60"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"></span>
            </span>
            <span>New — Emotion-conditioned voice, now GA</span>
            <ArrowRight className="h-3 w-3 text-[color:var(--muted-foreground)]" />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-[color:var(--foreground)] md:text-[68px]">
            Voice agents that remember,{' '}
            <span className="italic text-[color:var(--accent)] font-serif font-normal">feel</span>, and close.
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-[color:var(--muted-foreground)] md:text-[17px]">
            VoCall is the enterprise voice platform for teams building AI agents that actually perform in production — with long-term memory, real emotion detection, and telephony that scales.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onOpenDemo}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-[14px] font-medium text-[color:var(--surface)] transition hover:opacity-90 shadow-md"
            >
              Start building
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenTour}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 text-[14px] font-medium text-[color:var(--foreground)] transition hover:bg-white shadow-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Watch product tour
            </button>
          </div>
          <p className="mt-4 text-[12px] text-[color:var(--muted-foreground)] font-mono">
            SOC 2 Type II · HIPAA-ready · GDPR
          </p>
        </FadeIn>
      </div>

      <div className="relative mx-auto mt-16 max-w-6xl md:mt-20">
        <FadeIn delay={0.2} y={24}>
          <HeroConsole />
        </FadeIn>
      </div>
    </section>
  );
}
