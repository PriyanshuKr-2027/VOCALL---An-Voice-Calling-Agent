import { useState } from 'react';
import { BarChart3, Calendar, Download, RefreshCw, PhoneCall, Smile, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface AnalyticsPanelProps {
  callsList: any[];
}

export default function AnalyticsPanel({ callsList }: AnalyticsPanelProps) {
  const [range, setRange] = useState('7d');

  // Static mock charts data
  const volumeData = [
    { date: 'Jul 17', inbound: 12, outbound: 8, total: 20 },
    { date: 'Jul 18', inbound: 18, outbound: 14, total: 32 },
    { date: 'Jul 19', inbound: 15, outbound: 19, total: 34 },
    { date: 'Jul 20', inbound: 22, outbound: 26, total: 48 },
    { date: 'Jul 21', inbound: 31, outbound: 22, total: 53 },
    { date: 'Jul 22', inbound: 25, outbound: 35, total: 60 },
    { date: 'Jul 23', inbound: 28, outbound: 32, total: 60 }
  ];

  const emotionData = [
    { date: 'Jul 17', score: 0.72 },
    { date: 'Jul 18', score: 0.68 },
    { date: 'Jul 19', score: 0.75 },
    { date: 'Jul 20', score: 0.81 },
    { date: 'Jul 21', score: 0.79 },
    { date: 'Jul 22', score: 0.84 },
    { date: 'Jul 23', score: 0.83 }
  ];

  const statusData = [
    { name: 'Completed', count: callsList.filter(c => c.status === 'completed').length || 6, color: 'var(--green-accent)' },
    { name: 'Failed', count: callsList.filter(c => c.status === 'failed').length || 1, color: 'var(--red-accent)' },
    { name: 'Busy Trunk', count: 2, color: 'var(--yellow-accent)' },
    { name: 'No Answer', count: 3, color: 'var(--text-tertiary)' }
  ];

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Filter and Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', gap: '6px' }}>
            <Calendar size={14} />
            Custom Range
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '6px' }}>
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px' }}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Weekly Call Volume', value: '307 calls', icon: PhoneCall, change: '+12.4% vs last week' },
          { label: 'Avg Voice Response Latency', value: '72ms', icon: Clock, change: '-8ms improvement' },
          { label: 'Sentiment Index Score', value: '0.78 / 1.0', icon: Smile, change: 'Stable neutral/friendly' },
          { label: 'Carrier Connection Rate', value: '98.2%', icon: BarChart3, change: '1.2% Twilio trunk lift' }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                <Icon size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'block' }}>{stat.label}</span>
                <strong style={{ fontSize: '1.25rem', fontWeight: 600 }}>{stat.value}</strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--green-accent)', display: 'block', marginTop: '2px', fontWeight: 500 }}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }} className="analytics-grid-row">
        
        {/* Daily Call Volume Line/Area Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Daily Call Volumes</h3>
          <div style={{ width: '100%', height: '280px', backgroundColor: 'var(--surface-color)', padding: '24px 16px 12px 10px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C08457" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C08457" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} />
                <ChartTooltip contentStyle={{ fontSize: '11px', backgroundColor: 'var(--card-color)' }} />
                <Area type="monotone" name="Inbound Calls" dataKey="inbound" stroke="var(--accent-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorInbound)" />
                <Area type="monotone" name="Outbound Calls" dataKey="outbound" stroke="#C08457" strokeWidth={2} fillOpacity={1} fill="url(#colorOutbound)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Trend Line/Area Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Emotion Index Timeline</h3>
          <div style={{ width: '100%', height: '280px', backgroundColor: 'var(--surface-color)', padding: '24px 16px 12px 10px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emotionData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={10} domain={[0, 1.0]} tickLine={false} />
                <ChartTooltip contentStyle={{ fontSize: '11px', backgroundColor: 'var(--card-color)' }} />
                <Area type="monotone" name="Valence Score" dataKey="score" stroke="var(--accent-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Outcome breakdown chart row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Call Outcome Status Breakdown</h3>
        <div style={{ width: '100%', height: '220px', backgroundColor: 'var(--surface-color)', padding: '24px 20px 10px 10px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.03)" />
              <XAxis type="number" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} />
              <ChartTooltip contentStyle={{ fontSize: '11px', backgroundColor: 'var(--card-color)' }} />
              <Bar dataKey="count" fill="var(--accent-color)" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .analytics-grid-row {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
