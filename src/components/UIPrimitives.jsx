import React from 'react';
import { motion } from 'framer-motion';

// VoCall Brand Logo Icon
export function LogoIcon({ className = "" }) {
  return (
    <span className={`grid h-7 w-7 place-items-center rounded-lg bg-[color:var(--foreground)] text-[color:var(--surface)] ${className}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4v6M5 2v10M8 5v4M11 3v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

// Section Header Component
export function SectionBadge({ children }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[color:var(--accent)] font-mono">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"></span>
      {children}
    </div>
  );
}

// Fade in animation wrapper
export function FadeIn({ children, delay = 0, y = 16, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
