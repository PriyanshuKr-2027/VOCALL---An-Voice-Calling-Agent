import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, PhoneCall, TrendingUp, HeartHandshake } from 'lucide-react';

const mockDailyData = [
  { date: 'Jul 10', calls: 120, successRate: 72, emotion: 0.65 },
  { date: 'Jul 11', calls: 145, successRate: 74, emotion: 0.68 },
  { date: 'Jul 12', calls: 180, successRate: 78, emotion: 0.72 },
  { date: 'Jul 13', calls: 160, successRate: 75, emotion: 0.70 },
  { date: 'Jul 14', calls: 210, successRate: 82, emotion: 0.76 },
  { date: 'Jul 15', calls: 245, successRate: 85, emotion: 0.82 },
  { date: 'Jul 16', calls: 230, successRate: 84, emotion: 0.80 },
];

const mockStatusData = [
  { status: 'Goal Achieved', count: 640 },
  { status: 'Lead Qualified', count: 480 },
  { status: 'Handoff Triggered', count: 180 },
  { status: 'Callback Booked', count: 240 },
  { status: 'Unsuccessful', count: 90 },
];

export default function AnalyticsShowcase() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');

  return (
    <div
      className="premium-card"
      style={{
        padding: '36px',
        backgroundColor: 'var(--card-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Enterprise Call Analytics</h3>
          <p style={{ fontSize: '0.875rem' }}>Track performance quality, success rubrics, and emotional sentiment arcs.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTimeframe('7d')}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: timeframe === '7d' ? 'var(--accent-light)' : 'transparent',
              color: timeframe === '7d' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: timeframe === '30d' ? 'var(--accent-light)' : 'transparent',
              color: timeframe === '30d' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Total Calls Routed', val: '12,482', change: '+18.4%', icon: PhoneCall },
          { label: 'Success Score', val: '84.2%', change: '+4.2%', icon: TrendingUp },
          { label: 'Avg. Emotion Rating', val: '0.78 / 1.0', change: 'Calm/Friendly', icon: HeartHandshake },
          { label: 'Carrier Approvals', val: '100%', change: 'Active KYC', icon: Calendar },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--card-color)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-color)',
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{stat.label}</span>
                <strong style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{stat.val}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 500, display: 'block', marginTop: '2px' }}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Visuals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '32px' }} className="analytics-charts-grid">
        
        {/* Call Volume & Success Chart */}
        <div
          style={{
            padding: '24px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--surface-color)',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '20px' }}>
            Daily Call Volume &amp; Engagement Trends
          </span>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                  }}
                />
                <Area type="monotone" dataKey="calls" stroke="var(--accent-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" name="CallsRouted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Bar Chart */}
        <div
          style={{
            padding: '24px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--surface-color)',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '20px' }}>
            Outcomes &amp; Success Rubrics
          </span>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                  }}
                  cursor={{ fill: 'rgba(79, 122, 101, 0.05)' }}
                />
                <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} name="Completed Calls" maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .analytics-charts-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
