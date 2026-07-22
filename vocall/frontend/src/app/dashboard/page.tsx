'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Bot,
  Brain,
  Phone,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const supabase = createClient();

  const [userName, setUserName] = useState('VoCall Admin');
  const [loading, setLoading] = useState(true);

  const [avgEmotionNum, setAvgEmotionNum] = useState<number | null>(null);

  const [stats, setStats] = useState({
    totalCalls: 128,
    avgDuration: '2m 14s',
    successfulCalls: 114,
    failedCalls: 14,
    avgEmotionScore: '—',
    activeAgents: 4,
  });

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        let userOrgId: string | null = null;
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: profile } = await (supabase.from('profiles') as any)
            .select('name, org_id')
            .eq('id', authData.user.id)
            .single();

          const profileData = profile as any;
          if (profileData?.name) setUserName(profileData.name);
          else if (authData.user.email) setUserName(authData.user.email.split('@')[0]);

          if (profileData?.org_id) {
            userOrgId = profileData.org_id;
          }
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let callsQuery = (supabase.from('calls') as any)
          .select('id, status, duration_seconds, emotion_score, created_at, org_id');

        if (userOrgId) {
          callsQuery = callsQuery.eq('org_id', userOrgId);
        }

        const { data: calls } = await callsQuery;
        const { data: agents } = await (supabase.from('agents') as any).select('id, published');

        const callsList = (calls as any[]) || [];

        // Filter calls for last 30 days with valid emotion scores
        const recentEmotionCalls = callsList.filter((c) => {
          if (c.emotion_score === null || c.emotion_score === undefined) return false;
          if (c.created_at && new Date(c.created_at) < thirtyDaysAgo) return false;
          return true;
        });

        let avgEmotionStr = '—';
        let emotionVal: number | null = null;

        if (recentEmotionCalls.length > 0) {
          const sum = recentEmotionCalls.reduce((acc, c) => acc + Number(c.emotion_score), 0);
          emotionVal = sum / recentEmotionCalls.length;
          avgEmotionStr = (emotionVal > 0 ? '+' : '') + emotionVal.toFixed(2);
        }

        setAvgEmotionNum(emotionVal);

        if (callsList && callsList.length > 0) {
          const total = callsList.length;
          const successful = callsList.filter((c) => c.status === 'completed').length;
          const failed = callsList.filter((c) => c.status === 'failed').length;
          const totalSecs = callsList.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
          const avgSecs = Math.round(totalSecs / total);
          const m = Math.floor(avgSecs / 60);
          const s = avgSecs % 60;

          setStats({
            totalCalls: total,
            avgDuration: `${m}m ${s}s`,
            successfulCalls: successful,
            failedCalls: failed,
            avgEmotionScore: avgEmotionStr,
            activeAgents: agents ? agents.length : 4,
          });
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Heading */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Welcome back,</span>
          <span className="text-[#A78BFA]">{userName}</span>
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse ml-1" />
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Here is an overview of your voice agent platform activity and core metrics.
        </p>
      </div>

      {/* QUICK ACTION CARDS (3, Horizontal) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Create Agent */}
        <Link href="/dashboard/agents">
          <Card className="border-slate-800 bg-slate-900/80 hover:border-[#7C3AED] hover:bg-slate-900/90 transition-all cursor-pointer group shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#A78BFA] transition-colors">
                    Create Agent
                  </h3>
                  <p className="text-xs text-slate-400">Build & publish new voice AI agent</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        {/* Card 2: Setup Memory */}
        <Link href="/dashboard/settings/memory">
          <Card className="border-slate-800 bg-slate-900/80 hover:border-[#7C3AED] hover:bg-slate-900/90 transition-all cursor-pointer group shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#A78BFA] transition-colors">
                    Setup Memory
                  </h3>
                  <p className="text-xs text-slate-400">Configure 4-tier memory engine</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        {/* Card 3: Setup Telephony */}
        <Link href="/dashboard/settings/telephony">
          <Card className="border-slate-800 bg-slate-900/80 hover:border-[#7C3AED] hover:bg-slate-900/90 transition-all cursor-pointer group shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#A78BFA] transition-colors">
                    Setup Telephony
                  </h3>
                  <p className="text-xs text-slate-400">Manage phone numbers & trunks</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* STATS (6 cards, 2 rows) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Platform Performance Stats</h2>

        {loading ? (
          /* Skeleton Loader for Stat Cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-slate-800 bg-slate-900/60 p-6 h-28 animate-pulse flex flex-col justify-between">
                <div className="w-24 h-4 bg-slate-800 rounded" />
                <div className="w-16 h-8 bg-slate-700 rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Row 1, Card 1: Total Calls */}
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Total Calls</span>
                  <PhoneCall className="w-4 h-4 text-[#A78BFA]" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{stats.totalCalls}</div>
                <p className="text-[11px] text-slate-500">Across all active agents</p>
              </CardContent>
            </Card>

            {/* Row 1, Card 2: Avg Duration */}
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Avg Duration</span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{stats.avgDuration}</div>
                <p className="text-[11px] text-slate-500">Average call length</p>
              </CardContent>
            </Card>

            {/* Row 1, Card 3: Successful Calls */}
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Successful Calls</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">{stats.successfulCalls}</div>
                <p className="text-[11px] text-slate-500">Goal completion rate: 89%</p>
              </CardContent>
            </Card>

            {/* Row 2, Card 1: Failed Calls */}
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Failed Calls</span>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-3xl font-extrabold text-red-400 font-mono">{stats.failedCalls}</div>
                <p className="text-[11px] text-slate-500">Dropped or disconnected</p>
              </CardContent>
            </Card>

            {/* Row 2, Card 2: Avg Emotion Score */}
            <Card className="border-slate-800 bg-slate-900/60 relative group">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Avg Emotion Score</span>
                  <Smile className="w-4 h-4 text-purple-400" />
                </div>
                <div
                  className={`text-3xl font-extrabold font-mono ${
                    avgEmotionNum !== null
                      ? avgEmotionNum > 0.3
                        ? 'text-emerald-400'
                        : avgEmotionNum >= -0.3
                        ? 'text-amber-400'
                        : 'text-red-400'
                      : 'text-slate-500'
                  }`}
                >
                  {stats.avgEmotionScore}
                </div>
                <p className="text-[11px] text-slate-500">Average caller emotion over last 30 days.</p>
                <div className="absolute right-3 top-3 hidden group-hover:block bg-slate-950 text-slate-200 text-[11px] px-2.5 py-1 rounded shadow-xl border border-slate-800 pointer-events-none z-20 whitespace-nowrap">
                  Average caller emotion over last 30 days.
                </div>
              </CardContent>
            </Card>

            {/* Row 2, Card 3: Active Agents */}
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Active Agents</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{stats.activeAgents}</div>
                <p className="text-[11px] text-slate-500">Published voice agents</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
