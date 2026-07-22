import React from 'react';
import { LogoIcon } from './UIPrimitives';

const FOOTER_COLUMNS = [
  {
    h: 'Product',
    l: ['Overview', 'Memory', 'Emotion', 'Analytics', 'Telephony', 'Integrations', 'Changelog']
  },
  {
    h: 'Company',
    l: ['About', 'Customers', 'Careers', 'Press', 'Contact']
  },
  {
    h: 'Developers',
    l: ['Docs', 'API reference', 'Status', 'System design', 'Security']
  },
  {
    h: 'Legal',
    l: ['Privacy', 'Terms', 'DPA', 'Sub-processors']
  }
];

export function Footer({ onOpenContact }) {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)] px-4 pb-10 pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <LogoIcon />
              <span className="font-display text-[15px] font-semibold tracking-tight text-[color:var(--foreground)]">
                VoCall
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-[color:var(--muted-foreground)]">
              The enterprise voice AI platform. Memory, emotion, telephony, analytics — built for teams that ship voice into production.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" />
              <span className="text-[11.5px] text-[color:var(--muted-foreground)] font-mono">
                All systems operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.h}>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--muted-foreground)] font-mono">
                  {col.h}
                </div>
                <ul className="mt-4 space-y-2.5 text-[13px]">
                  {col.l.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(e) => {
                          if (item === 'Contact') {
                            e.preventDefault();
                            onOpenContact();
                          }
                        }}
                        className="text-[color:var(--foreground)] transition hover:text-[color:var(--accent)]"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--border)] pt-6 text-[12px] text-[color:var(--muted-foreground)] md:flex-row md:items-center">
          <span>© 2026 VoCall, Inc. Made for teams who dial thoughtfully.</span>
          <span className="font-mono text-[11.5px]">SOC 2 Type II · HIPAA-ready · GDPR</span>
        </div>
      </div>
    </footer>
  );
}
