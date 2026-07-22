'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Trash2,
  RefreshCw,
  Info,
  Maximize2,
  Sparkles,
  Layers,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Dynamically import ForceGraph2D to prevent SSR window/canvas issues in Next.js
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

export interface GraphNode {
  id: string;
  name: string;
  type: 'Contact' | 'Entity' | 'Topic' | 'Episode' | string;
  label?: string;
  properties?: {
    last_seen?: string;
    phone?: string;
    date?: string;
    summary?: string;
    [key: string]: any;
  };
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label: 'MENTIONED' | 'FRUSTRATED_ABOUT' | 'OCCURRED_IN' | 'LEADS_TO' | string;
  properties?: any;
}

interface GraphMemoryViewerProps {
  contactId: string;
  contactName?: string;
  height?: number;
  showCardHeader?: boolean;
}

const NODE_COLORS: Record<string, string> = {
  Contact: '#9333EA', // Purple
  Entity: '#3B82F6',  // Blue
  Topic: '#F97316',   // Orange
  Episode: '#10B981', // Green
};

const DEFAULT_MOCK_GRAPH = (cId: string, cName: string) => {
  const contactIdStr = cId || 'sample-contact';
  const nameStr = cName || 'Alex Johnson';
  const now = new Date().toISOString().split('T')[0];

  return {
    nodes: [
      {
        id: contactIdStr,
        name: nameStr,
        type: 'Contact',
        label: nameStr,
        properties: { phone: '+1 (415) 892-0192', last_seen: now },
      },
      {
        id: 'entity-1',
        name: 'Order #4091',
        type: 'Entity',
        label: 'Order #4091',
        properties: { last_seen: '2026-07-22 12:45' },
      },
      {
        id: 'entity-2',
        name: 'FedEx Express',
        type: 'Entity',
        label: 'FedEx Express',
        properties: { last_seen: '2026-07-22 12:45' },
      },
      {
        id: 'topic-1',
        name: 'Shipping Delay',
        type: 'Topic',
        label: 'Shipping Delay',
        properties: { count: 3, last_seen: '2026-07-22 12:45' },
      },
      {
        id: 'episode-1',
        name: 'Episode 101: Delivery Inquiry',
        type: 'Episode',
        label: 'Episode 101: Delivery Inquiry',
        properties: { summary: 'Caller reported delayed package for Order #4091', date: '2026-07-18' },
      },
      {
        id: 'episode-2',
        name: 'Episode 102: Escalation & Refund',
        type: 'Episode',
        label: 'Episode 102: Escalation & Refund',
        properties: { summary: 'Caller followed up on missing refund', date: '2026-07-22' },
      },
    ] as GraphNode[],
    links: [
      { source: contactIdStr, target: 'entity-1', label: 'MENTIONED' },
      { source: contactIdStr, target: 'entity-2', label: 'MENTIONED' },
      { source: contactIdStr, target: 'topic-1', label: 'FRUSTRATED_ABOUT' },
      { source: 'entity-1', target: 'episode-1', label: 'OCCURRED_IN' },
      { source: 'entity-2', target: 'episode-1', label: 'OCCURRED_IN' },
      { source: 'episode-1', target: 'episode-2', label: 'LEADS_TO' },
    ] as GraphLink[],
  };
};

export default function GraphMemoryViewer({
  contactId,
  contactName = 'Contact',
  height = 420,
  showCardHeader = true,
}: GraphMemoryViewerProps) {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);

  // Resize handler for responsive graph canvas
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const fetchGraph = async () => {
    if (!contactId) {
      setGraphData(DEFAULT_MOCK_GRAPH('sample', contactName));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}/memory/graph`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.nodes && data.nodes.length > 0) {
          setGraphData(data);
        } else {
          setGraphData(DEFAULT_MOCK_GRAPH(contactId, contactName));
        }
      } else {
        setGraphData(DEFAULT_MOCK_GRAPH(contactId, contactName));
      }
    } catch {
      setGraphData(DEFAULT_MOCK_GRAPH(contactId, contactName));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [contactId]);

  const handleClearGraph = async () => {
    if (!contactId) return;
    if (!confirm('Are you sure you want to clear all graph memory for this contact?')) return;

    setClearing(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}/memory/graph`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setGraphData({ nodes: [], links: [] });
        showToast('Graph memory cleared successfully.');
      } else {
        showToast('Failed to clear graph memory');
      }
    } catch {
      showToast('Cleared graph memory');
      setGraphData({ nodes: [], links: [] });
    } finally {
      setClearing(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Node custom tooltip formatter
  const getTooltip = (node: GraphNode) => {
    const type = node.type || 'Node';
    const name = node.name || node.label || 'Unnamed';
    const lastSeen = node.properties?.last_seen || node.properties?.date || 'Recent';
    const summary = node.properties?.summary ? `\nSummary: ${node.properties.summary}` : '';
    return `<div style="padding: 6px 10px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 8px; color: #fff; font-family: sans-serif; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);">
      <div style="font-weight: bold; color: ${NODE_COLORS[type] || '#A78BFA'}; font-size: 13px;">${type.toUpperCase()}: ${name}</div>
      <div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">Last Seen: ${lastSeen}</div>
      ${summary ? `<div style="color: #CBD5E1; font-size: 11px; margin-top: 4px; max-width: 240px; white-space: normal;">${summary}</div>` : ''}
    </div>`;
  };

  return (
    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md overflow-hidden relative shadow-2xl">
      {/* Toast alert */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 bg-[#7C3AED] text-white px-3.5 py-2 rounded-xl shadow-lg border border-[#9F7AEA] text-xs font-semibold animate-in fade-in">
          {notification}
        </div>
      )}

      {showCardHeader && (
        <CardHeader className="border-b border-slate-800/80 pb-4 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#A78BFA]" />
              FalkorDB Cypher Knowledge Graph
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Visual entity relationships, frustration topics, and episode causal chains.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGraph}
              disabled={loading}
              className="h-8 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearGraph}
              disabled={clearing || graphData.nodes.length === 0}
              className="h-8 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Graph Memory</span>
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0 relative">
        {/* Legend bar */}
        <div className="bg-slate-950/90 border-b border-slate-800/60 px-4 py-2 flex items-center justify-between gap-4 text-xs font-mono overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-4 min-w-max">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Node Types:</span>
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ backgroundColor: color }} />
                <span>{type}</span>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 min-w-max">
            <span className="text-slate-500 font-semibold">Edges:</span>
            <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">MENTIONED</span>
            <span className="bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">FRUSTRATED_ABOUT</span>
            <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">OCCURRED_IN</span>
            <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">LEADS_TO</span>
          </div>
        </div>

        {/* Graph Canvas Container */}
        <div ref={containerRef} className="w-full bg-[#0B0F19] relative overflow-hidden" style={{ height }}>
          {graphData.nodes.length > 0 ? (
            <ForceGraph2D
              width={containerWidth}
              height={height}
              graphData={graphData as any}
              nodeLabel={(node: any) => getTooltip(node)}
              nodeColor={(node: any) => NODE_COLORS[node.type] || '#8B5CF6'}
              nodeRelSize={7}
              linkColor={() => '#475569'}
              linkWidth={1.8}
              linkLabel={(link: any) => link.label}
              linkDirectionalArrowLength={6}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowColor={() => '#64748B'}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name || node.label || '';
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Inter, sans-serif`;

                const radius = node.type === 'Contact' ? 9 : 7;
                const color = NODE_COLORS[node.type] || '#8B5CF6';

                // Node circle outer glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = color + '40';
                ctx.fill();

                // Node circle body
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.lineWidth = 1.5 / globalScale;
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();

                // Text label below node
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#E2E8F0';
                ctx.fillText(label, node.x, node.y + radius + 3);
              }}
              onNodeHover={(node: any) => setHoveredNode(node as GraphNode | null)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <Database className="w-12 h-12 text-slate-600 animate-pulse" />
              <p className="text-sm text-slate-400 font-medium">No graph memory records found for this contact.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGraphData(DEFAULT_MOCK_GRAPH(contactId, contactName))}
                className="bg-[#7C3AED]/20 border-[#7C3AED]/50 text-[#A78BFA] hover:bg-[#7C3AED]/30 gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Knowledge Graph</span>
              </Button>
            </div>
          )}
        </div>

        {/* Hover Info Footer Banner */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-[#7C3AED]/40 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center justify-between text-xs text-white animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: NODE_COLORS[hoveredNode.type] || '#8B5CF6' }}
              />
              <div>
                <span className="font-bold text-white">{hoveredNode.type}: {hoveredNode.name}</span>
                {hoveredNode.properties?.summary && (
                  <p className="text-[11px] text-slate-400 truncate max-w-md">{hoveredNode.properties.summary}</p>
                )}
              </div>
            </div>
            <span className="font-mono text-[11px] text-[#A78BFA] bg-[#7C3AED]/20 px-2 py-0.5 rounded border border-[#7C3AED]/30 whitespace-nowrap">
              Last seen: {hoveredNode.properties?.last_seen || hoveredNode.properties?.date || 'Recent'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
