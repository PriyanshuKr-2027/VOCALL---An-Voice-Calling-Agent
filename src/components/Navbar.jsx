import React, { useState, useEffect } from 'react';
import { LogoIcon } from './UIPrimitives';
import { ArrowRight } from 'lucide-react';

export function Navbar({ onOpenDemo, onOpenLogin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <header
        className={`flex w-full max-w-6xl items-center justify-between rounded-2xl border px-4 py-2.5 transition-all duration-300 ${
          scrolled
            ? 'border-[color:var(--border)] bg-[color:var(--surface)]/90 backdrop-blur-md shadow-sm'
            : 'border-transparent bg-transparent'
        }`}
      >
        <a href="#" className="flex items-center gap-2.5 group">
          <LogoIcon />
          <span className="font-display text-[16px] font-semibold tracking-tight text-[color:var(--foreground)]">
            VoCall
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-[13.5px] font-medium text-[color:var(--muted-foreground)] md:flex">
          <a href="#product" className="transition hover:text-[color:var(--foreground)]">
            Product
          </a>
          <a href="#integrations" className="transition hover:text-[color:var(--foreground)]">
            Integrations
          </a>
          <a href="#faq" className="transition hover:text-[color:var(--foreground)]">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="text-[13.5px] font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent)] px-2 py-1"
          >
            Sign in
          </button>
          <button
            onClick={onOpenDemo}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[color:var(--foreground)] px-4 text-[13px] font-medium text-[color:var(--surface)] transition hover:opacity-90 shadow-sm"
          >
            Book a demo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>
    </div>
  );
}
