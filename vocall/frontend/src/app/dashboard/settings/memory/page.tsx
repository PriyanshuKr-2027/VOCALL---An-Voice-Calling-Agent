'use client';

import React from 'react';
import { Brain, Sparkles, Database, Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function MemorySettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#A78BFA]" />
            4-Tier Memory System Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure Redis short-term cache, pgvector long-term embeddings, Postgres episodic logs, and FalkorDB knowledge graphs.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      <Card className="border-[#7C3AED]/30 bg-slate-900/40 p-12 text-center space-y-4">
        <Brain className="w-16 h-16 text-[#A78BFA] mx-auto animate-pulse" />
        <h2 className="text-2xl font-bold text-white">4-Tier Memory Engine</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Memory configuration & vector index tuning — coming in Phase 2 Module 5 (P2-M5). Includes short-term Redis state, pgvector IVFFlat embeddings, Postgres episodic caller history, and FalkorDB graph retrieval.
        </p>
      </Card>
    </div>
  );
}
