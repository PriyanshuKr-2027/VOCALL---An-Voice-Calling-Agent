import { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Tag,
  FileText,
  Brain,
  History,
  TrendingUp,
  Database,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';
import type { Contact, Call } from '../types';

interface ContactsManagerProps {
  contact: Contact;
  callsList: Call[];
  onCallNow: (contactId: string) => void;
  onSelectCall: (id: string) => void;
}

export default function ContactsManager({ contact, callsList, onCallNow, onSelectCall }: ContactsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'memory' | 'history' | 'emotion'>('memory');
  const [isTriggeringCall, setIsTriggeringCall] = useState(false);

  if (!contact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '40px' }}>
        <User size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
        <h3>Select a contact</h3>
        <p style={{ fontSize: '0.8rem' }}>Choose a contact from the list folders to inspect pgvector memory graph logs.</p>
      </div>
    );
  }

  // Filter calls for this contact
  const contactCalls = callsList.filter(c => c.contactName === contact.name);

  // Generate emotion timeline for chart
  const emotionChartData = contactCalls
    .slice()
    .reverse()
    .map((c, i) => {
      const dateObj = new Date(c.date || Date.now());
      return {
        name: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        valence: c.emotionScore,
        index: i + 1
      };
    });

  const handleTriggerCall = () => {
    setIsTriggeringCall(true);
    onCallNow(contact.id);
    setTimeout(() => {
      setIsTriggeringCall(false);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }} className="contacts-split-layout">
      
      {/* LEFT COLUMN: Contact Details (30%) */}
      <div
        style={{
          width: '320px',
          backgroundColor: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          overflowY: 'auto'
        }}
        className="contacts-left-col"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Avatar and Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                border: '1px solid var(--border-color)',
              }}
            >
              {contact.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{contact.name}</h2>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                Client ID: {contact.id}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.825rem' }}>
              <Phone size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>{contact.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.825rem' }}>
              <Mail size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contact.email || 'no-email@corporate.com'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.825rem' }}>
              <Tag size={14} style={{ color: 'var(--text-tertiary)', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(contact.tags || ['Enterprise', 'Lead']).map((tag: string) => (
                  <span key={tag} style={{ fontSize: '0.68rem', backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.825rem' }}>
              <FileText size={14} style={{ color: 'var(--text-tertiary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Admin Notes</span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {contact.notes || 'No administrative file notes recorded. Add notes in settings.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Outbound Caller Dial */}
        <button
          onClick={handleTriggerCall}
          disabled={isTriggeringCall}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '24px', gap: '8px', backgroundColor: 'var(--accent-color)' }}
        >
          {isTriggeringCall ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Dialing Trunk...
            </>
          ) : (
            <>
              <Phone size={16} />
              Call Now (SIP)
            </>
          )}
        </button>
      </div>

      {/* RIGHT COLUMN: Interactive Tabs (70%) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Tab Selection Row */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', flexShrink: 0 }}>
          {[
            { id: 'memory', label: 'Cognitive Memory', icon: Brain },
            { id: 'history', label: 'Call History', icon: History },
            { id: 'emotion', label: 'Emotion Trends', icon: TrendingUp }
          ].map((subTab) => {
            const Icon = subTab.icon;
            const isActive = activeSubTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <Icon size={14} />
                {subTab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          {/* TAB 1: COGNITIVE MEMORY */}
          {activeSubTab === 'memory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Database engines header status */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--green-soft)', color: 'var(--green-accent)', border: '1px solid var(--green-accent)', fontWeight: 600 }}>
                  Redis: active
                </div>
                <div style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--green-soft)', color: 'var(--green-accent)', border: '1px solid var(--green-accent)', fontWeight: 600 }}>
                  pgvector: {contact.memory?.facts?.length || 3} facts
                </div>
                <div style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--green-soft)', color: 'var(--green-accent)', border: '1px solid var(--green-accent)', fontWeight: 600 }}>
                  FalkorDB: 4 node links
                </div>
              </div>

              {/* pgvector Facts */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Database size={14} style={{ color: 'var(--accent-color)' }} />
                  Long-term pgvector facts (Semantic memory)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(contact.memory?.facts || [
                    'Caller confirmed billing contact email: support@acme.com',
                    'Wants to cancel subscription if India pricing exceeds ₹15,000/mo.',
                    'Prefers callbacks after 05:00 PM IST due to team shifting.'
                  ]).map((fact: string, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        lineHeight: '1.4',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      • {fact}
                    </div>
                  ))}
                </div>
              </div>

              {/* FalkorDB graph relationships */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }} className="memory-graph-row">
                {/* Ep summaries */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Calendar size={14} style={{ color: 'var(--accent-color)' }} />
                    Episodic memory logs
                  </h4>
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-color)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.78rem',
                      lineHeight: '1.45',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-primary)' }}>EPISODE 1 — July 10, 2026</strong>
                      <span>Caller expressed severe frustration regarding pricing plans. Confirmed India telephony DLT regulations with Admin.</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-primary)' }}>EPISODE 2 — June 28, 2026</strong>
                      <span>Initial sandbox setup call. Agent demonstrated standard support prompts and gathered basic email context.</span>
                    </div>
                  </div>
                </div>

                {/* Graph preview */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>FalkorDB Node Graph</h4>
                  <div
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      backgroundColor: 'var(--surface-color)',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg viewBox="0 0 200 120" style={{ width: '100%', maxHeight: '120px' }}>
                      <line x1="40" y1="60" x2="100" y2="20" stroke="var(--border-color)" strokeWidth="1.5" />
                      <line x1="40" y1="60" x2="100" y2="100" stroke="var(--border-color)" strokeWidth="1.5" />
                      <line x1="100" y1="20" x2="160" y2="60" stroke="var(--border-color)" strokeWidth="1.5" />
                      <line x1="100" y1="100" x2="160" y2="60" stroke="var(--border-color)" strokeWidth="1.5" />

                      <circle cx="40" cy="60" r="10" fill="var(--accent-color)" />
                      <circle cx="100" cy="20" r="10" fill="var(--accent-color)" />
                      <circle cx="100" cy="100" r="10" fill="var(--accent-color)" />
                      <circle cx="160" cy="60" r="10" fill="#E6E4DF" />

                      <text x="40" y="63" fontSize="7" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">{contact.name.charAt(0)}</text>
                      <text x="100" y="23" fontSize="6" textAnchor="middle" fill="#FFFFFF">CALLS</text>
                      <text x="100" y="103" fontSize="6" textAnchor="middle" fill="#FFFFFF">WANTS</text>
                      <text x="160" y="63" fontSize="6" textAnchor="middle" fill="var(--text-primary)">INFO</text>
                      
                      <text x="70" y="34" fontSize="5" textAnchor="middle" fill="var(--text-secondary)">routes</text>
                      <text x="70" y="87" fontSize="5" textAnchor="middle" fill="var(--text-secondary)">prefers</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALL HISTORY */}
          {activeSubTab === 'history' && (
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Agent Name</th>
                    <th style={{ padding: '12px' }}>Duration</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Emotion Score</th>
                    <th style={{ padding: '12px', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {contactCalls.map((call) => {
                    const dateObj = new Date(call.date || Date.now());
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return (
                      <tr key={call.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 500 }}>{formattedDate}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{call.agentName}</td>
                        <td style={{ padding: '12px' }}>{call.duration}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: call.status === 'completed' ? 'var(--green-accent)' : 'var(--red-accent)', fontWeight: 600 }}>
                            {call.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{call.emotionScore}</td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => onSelectCall(call.id)}
                            style={{ border: 'none', background: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {contactCalls.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No calls recorded for this contact.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: EMOTION HISTORY */}
          {activeSubTab === 'emotion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--surface-color)' }}>
                <AlertCircle size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  This chart monitors caller valence spikes over chronological call segments. Lower scores signify increased frustration levels.
                </span>
              </div>

              {emotionChartData.length > 0 ? (
                <div style={{ width: '100%', height: '240px', backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emotionChartData}>
                      <defs>
                        <linearGradient id="colorValence" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text-tertiary)" fontSize={10} domain={[0, 1.0]} tickLine={false} />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'var(--card-color)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Area type="monotone" dataKey="valence" stroke="var(--accent-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorValence)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  Not enough historical call records to graph emotion trends.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      <style>{`
        @media (max-width: 800px) {
          .contacts-split-layout {
            flex-direction: column !important;
          }
          .contacts-left-col {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-color) !important;
            padding: 20px !important;
          }
          .memory-graph-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
