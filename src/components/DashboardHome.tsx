import { Bot, Brain, PhoneCall, CheckCircle, ShieldAlert, Smile, TrendingUp, DollarSign } from 'lucide-react';

interface DashboardHomeProps {
  userName: string;
  onNavigateToSection: (section: string) => void;
  callsList: any[];
  agentsList: any[];
}

export default function DashboardHome({ userName, onNavigateToSection, callsList, agentsList }: DashboardHomeProps) {
  
  // Calculate real metrics from our mock lists
  const totalCalls = callsList.length;
  const activeAgents = agentsList.filter(a => a.status === 'active').length;
  const completedCalls = callsList.filter(c => c.status === 'completed').length;
  const failedCalls = callsList.filter(c => c.status === 'failed').length;
  
  // Avg duration calculation
  const totalDurationSeconds = callsList.reduce((acc, c) => {
    const parts = c.duration.split(':');
    const min = parseInt(parts[0], 10);
    const sec = parseInt(parts[1], 10);
    return acc + (min * 60 + sec);
  }, 0);
  const avgDurationSec = totalCalls > 0 ? Math.round(totalDurationSeconds / totalCalls) : 0;
  const formattedAvgDuration = `${Math.floor(avgDurationSec / 60)}m ${avgDurationSec % 60}s`;

  // Emotion score calculations
  const totalEmotionScore = callsList.reduce((acc, c) => acc + c.emotionScore, 0);
  const avgEmotionScore = totalCalls > 0 ? parseFloat((totalEmotionScore / totalCalls).toFixed(2)) : 0;
  
  // Get emotion color
  const getEmotionLabel = (score: number) => {
    if (score >= 0.75) return { text: 'Calm & Friendly', color: 'var(--green-accent)' };
    if (score >= 0.6) return { text: 'Neutral & Polite', color: 'var(--yellow-accent)' };
    return { text: 'Frustrated / Stressed', color: 'var(--red-accent)' };
  };
  const emotionMeta = getEmotionLabel(avgEmotionScore);

  // Cost calculation: $0.15 per completed call minute
  const totalDurationMinutes = totalDurationSeconds / 60;
  const totalCostUSD = totalDurationMinutes * 0.15;
  const totalCostINR = totalCostUSD * 83.5; // conversion rate 83.5

  const stats = [
    { label: 'Total Calls Routed', value: totalCalls, icon: PhoneCall, desc: 'Across all Spaces' },
    { label: 'Avg Duration', value: formattedAvgDuration, icon: TrendingUp, desc: 'Voice session loop' },
    { label: 'Successful Calls', value: completedCalls, icon: CheckCircle, desc: 'Rubric goal achieved', color: 'var(--green-accent)' },
    { label: 'Failed Calls', value: failedCalls, icon: ShieldAlert, desc: 'Trunks drop / error', color: 'var(--red-accent)' },
    { label: 'Avg Emotion Score', value: avgEmotionScore, icon: Smile, desc: emotionMeta.text, color: emotionMeta.color },
    { label: 'Active Agents', value: activeAgents, icon: Bot, desc: 'Currently listening' }
  ];

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Banner */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '4px' }}>
          Welcome, {userName || 'Abhi'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          VoCall enterprise dashboard is live. Monitor carrier channels, cognitive graphs, and emotion triggers.
        </p>
      </div>

      {/* Quick-Action Cards (3 cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Create Agent */}
        <div
          className="premium-card"
          onClick={() => onNavigateToSection('agents')}
          style={{
            padding: '24px',
            backgroundColor: 'var(--card-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Configure Agents</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Train prompts, enhance objectives, and select voice profiles.
            </p>
          </div>
        </div>

        {/* Setup Memory */}
        <div
          className="premium-card"
          onClick={() => onNavigateToSection('settings')}
          style={{
            padding: '24px',
            backgroundColor: 'var(--card-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Setup Memory Tiers</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Enable vectors, episodic, and FalkorDB knowledge graph mappings.
            </p>
          </div>
        </div>

        {/* Setup Telephony */}
        <div
          className="premium-card"
          onClick={() => onNavigateToSection('telephony')}
          style={{
            padding: '24px',
            backgroundColor: 'var(--card-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Carrier Telephony</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Register Exotel/Twilio numbers and upload compliance KYC documents.
            </p>
          </div>
        </div>

      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '32px' }} className="home-dashboard-grid">
        
        {/* Stats Cards Section */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Agents Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="stats-subgrid">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color || 'var(--text-secondary)' }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{item.label}</span>
                    <strong style={{ fontSize: '1.35rem', fontWeight: 600 }}>{item.value}</strong>
                    <span style={{ fontSize: '0.68rem', color: item.color || 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing / Cost Card */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Compute Costs</h3>
          <div
            className="premium-card"
            style={{
              padding: '24px',
              backgroundColor: 'var(--card-color)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', marginBottom: '12px' }}>
                <DollarSign size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Routing Charges</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Calculated at $0.15/min flat orchestration fee.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'block' }}>Total Cost (USD)</span>
                <strong style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ${totalCostUSD.toFixed(2)}
                </strong>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'block' }}>Converted Cost (INR)</span>
                <strong style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                  ₹{totalCostINR.toFixed(2)}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.68rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-color)', padding: '8px 10px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              Billing cycles reset on the 1st of every month.
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .home-dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .stats-subgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
