import React from 'react';

const TRANSCRIPT = [
  { s: 'Caller', t: "I've been trying to reset my password all morning." },
  { s: 'Agent', t: "I hear you — I'm on it. Pulling your account up now." },
  { s: 'Caller', t: "It keeps looping back to the login screen." },
  { s: 'Agent', t: "Sending a magic link to nora@studio.co, arriving in 5 seconds." },
  { s: 'Caller', t: "Got it, thank you." }
];

export function AnalyticsConsole() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3">
        <div className="flex items-center gap-3 text-[12px]">
          <span className="rounded-full bg-[color:var(--accent)]/12 px-2 py-0.5 text-[10.5px] font-semibold text-[color:var(--accent)]">
            IN
          </span>
          <span className="font-medium text-[color:var(--foreground)]">+1 415 555 0142 → Support Lead</span>
        </div>
        <div className="text-[11px] text-[color:var(--muted-foreground)] font-mono">
          Apr 18 · 04:12 duration
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-[color:var(--border)] p-5 md:border-b-0 md:border-r">
          <div className="text-[10.5px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
            Transcript
          </div>
          <div className="mt-3 space-y-3 text-[12.5px] leading-relaxed">
            {TRANSCRIPT.map((msg, i) => (
              <div key={i} className={msg.s === 'Agent' ? '' : 'text-right'}>
                <div
                  className={`inline-block max-w-[92%] rounded-2xl px-3 py-2 ${
                    msg.s === 'Agent'
                      ? 'bg-[color:var(--accent)]/10 text-[color:var(--foreground)]'
                      : 'bg-[color:var(--muted)] text-[color:var(--foreground)]'
                  }`}
                >
                  {msg.t}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="text-[10.5px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
            Summary
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--foreground)]">
            Caller reported a stuck password reset loop. Agent verified account, dispatched magic link, confirmed receipt. Frustration resolved by turn 4.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
                Success
              </div>
              <div className="mt-1 text-[13px] font-medium text-[color:var(--accent)]">
                Resolved
              </div>
            </div>
            <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
                Emotion Δ
              </div>
              <div className="mt-1 text-[13px] font-medium text-[color:var(--foreground)]">
                −0.32 → +0.55
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
            <div className="text-[10.5px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
              Structured data
            </div>
            <pre className="mt-1 font-mono text-[11px] leading-relaxed text-[color:var(--foreground)]">
{`{ "issue": "password_reset",
  "channel": "email",
  "resolved": true,
  "emotion_state": "recovered" }`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
