import React from 'react';
import { Bot, BrainCircuit, Phone, PhoneCall, Clock, CheckCircle2, XCircle, HeartHandshake, Zap, DollarSign } from 'lucide-react';

export function DashboardHome({ onNavigate, agents, calls }) {
  const totalCalls = agents.reduce((acc, a) => acc + (a.stats?.calls || 0), 0);
  const activeAgents = agents.filter(a => a.status === 'Live').length;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div>
        <h1 className="font-display text-[32px] font-semibold text-[color:var(--foreground)] tracking-tight">
          Welcome back, Priyanshu
        </h1>
        <p className="mt-1 text-[14px] text-[color:var(--muted-foreground)]">
          Here is your enterprise voice operations summary for Northwind Studio.
        </p>
      </div>

      {/* 3 Quick-Action Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => onNavigate('agent-builder', { agentId: 'new' })}
          className="group flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--accent)]/12 text-[color:var(--accent)]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition">
                Create Agent
              </div>
              <div className="text-[12px] text-[color:var(--muted-foreground)]">Configure brand prompt & voice</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="group flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--accent)]/12 text-[color:var(--accent)]">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition">
                Setup Memory
              </div>
              <div className="text-[12px] text-[color:var(--muted-foreground)]">Configure 4-tier FalkorDB graph</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('settings-telephony')}
          className="group flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--accent)]/12 text-[color:var(--accent)]">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition">
                Setup Telephony
              </div>
              <div className="text-[12px] text-[color:var(--muted-foreground)]">Exotel / Twilio SIP Trunking</div>
            </div>
          </div>
        </button>
      </div>

      {/* Agents Overview Stats Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[20px] font-semibold text-[color:var(--foreground)]">Agents Overview</h2>
          <span className="font-mono text-[11.5px] text-[color:var(--muted-foreground)]">Live Real-time Telemetry</span>
        </div>

        {/* 6 Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* Row 1 */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between text-[12px] text-[color:var(--muted-foreground)]">
              <span>Total Calls</span>
              <PhoneCall className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">
              {totalCalls.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--accent)] font-medium">+14.2% from last week</div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between text-[12px] text-[color:var(--muted-foreground)]">
              <span>Avg Duration</span>
              <Clock className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">
              3m 42s
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--accent)] font-medium">+8s optimization</div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between text-[12px] text-[color:var(--muted-foreground)]">
              <span>Successful Calls</span>
              <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">
              84.6%
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--accent)] font-medium">Goal achieved</div>
          </div>

          {/* Row 2 */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between text-[12px] text-[color:var(--muted-foreground)]">
              <span>Failed Calls</span>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">
              1.4%
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--muted-foreground)] font-mono">Auto carrier failover active</div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between text-[12px] text-[color:var(--muted-foreground)]">
              <span>Avg Emotion Score</span>
              <HeartHandshake className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[26px] font-semibold text-[color:var(--foreground)]">0.71</span>
              <span className="rounded-full bg-[color:var(--accent)]/15 px-2 py-0.5 text-[10.5px] font-semibold text-[color:var(--accent)]">
                Positive Valence
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--muted-foreground)]">Audio acoustic tone adaptation</div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between text-[12px] text-[color:var(--muted-foreground)]">
              <span>Active Agents</span>
              <Bot className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">
              {activeAgents} / {agents.length}
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--accent)] font-medium">All systems green</div>
          </div>
        </div>
      </div>

      {/* Total Cost Card (Dual Currency INR & USD) */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-[color:var(--muted-foreground)]">
            <DollarSign className="h-4 w-4 text-[color:var(--accent)]" />
            Total Monthly Telephony & AI Cost
          </div>
          <div className="mt-2 flex items-baseline gap-4">
            <span className="font-display text-[32px] font-bold text-[color:var(--foreground)]">
              ₹ 27,150
            </span>
            <span className="font-display text-[20px] font-medium text-[color:var(--muted-foreground)]">
              / $ 328.50 USD
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-[color:var(--muted-foreground)]">
            Groq, Cartesia, Sarvam AI & Exotel billed at zero markup (BYOK Keys).
          </p>
        </div>

        <button
          onClick={() => onNavigate('api-keys')}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 shadow-xs"
        >
          Manage Key Billing
        </button>
      </div>
    </div>
  );
}
