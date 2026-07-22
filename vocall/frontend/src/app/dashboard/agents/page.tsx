'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Bot,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface AgentItem {
  id: string;
  name: string;
  system_prompt?: string;
  voice_provider?: string;
  language?: string;
  published?: boolean;
  enable_memory?: boolean;
  enable_emotion?: boolean;
  created_at?: string;
}

export default function AgentsPage() {
  const supabase = createClient();

  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      try {
        const { data } = await (supabase.from('agents') as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setAgents(data);
        } else {
          setAgents([]);
        }
      } catch (err: any) {
        showNotification(`Error: /api/agents — ${err?.message || 'Failed to fetch agents'}. Try again.`);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  const handleDeleteAgent = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      const { error } = await (supabase.from('agents') as any)
        .delete()
        .eq('id', deleteTargetId);

      if (error) throw error;

      setAgents((prev) => prev.filter((a) => a.id !== deleteTargetId));
      showNotification('Agent deleted successfully');
    } catch (err: any) {
      showNotification(`Error: /api/agents/${deleteTargetId} — ${err?.message || 'Failed to delete agent'}. Try again.`);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-[#9F7AEA] text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Heading & Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-[#A78BFA]" />
            <span>Voice Agents</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Orchestrate real-time STT, LLM, TTS, memory, and emotion pipelines.
          </p>
        </div>

        <Link href="/dashboard/agents/new">
          <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]">
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </Button>
        </Link>
      </div>

      {/* AGENT LIST / SKELETON / EMPTY STATE */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-3/4 h-6 rounded" />
              <Skeleton className="w-full h-12 rounded" />
              <div className="flex justify-between pt-2">
                <Skeleton className="w-20 h-8 rounded" />
                <Skeleton className="w-20 h-8 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        /* Empty State */
        <Card className="border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <Bot className="w-16 h-16 text-slate-600 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No agents yet.</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Create your first voice AI agent to start handling inbound or outbound calls.
            </p>
          </div>
          <Link href="/dashboard/agents/new">
            <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 mt-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]">
              <Plus className="w-4 h-4" />
              <span>Create Agent</span>
            </Button>
          </Link>
        </Card>
      ) : (
        /* Agents Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="border-slate-800 bg-slate-900/60 hover:border-[#7C3AED]/60 transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      agent.published
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {agent.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors truncate">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {agent.system_prompt || 'No system prompt defined.'}
                  </p>
                </div>

                {/* Features Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                    {agent.voice_provider || 'Cartesia'}
                  </span>
                  {agent.enable_memory && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">
                      Memory
                    </span>
                  )}
                  {agent.enable_emotion && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">
                      Emotion
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800/80">
                  <Link href={`/dashboard/agents/${agent.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 gap-1.5 text-xs">
                      <Edit className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Edit Studio</span>
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTargetId(agent.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9 px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Destructive Action Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Are you sure?"
        description="This action cannot be undone. The voice agent and its configuration will be deleted permanently."
        confirmText="Delete Agent"
        isLoading={isDeleting}
        onConfirm={handleDeleteAgent}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
