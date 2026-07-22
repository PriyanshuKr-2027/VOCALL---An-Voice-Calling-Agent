'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Workflow,
  Plus,
  CheckCircle2,
  Loader2,
  Calendar,
  Database,
  Send,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ConnectorCard {
  id: string;
  name: string;
  type: string;
  iconName: string;
  triggerType: 'During Call' | 'Post Call' | 'During & Post Call';
  configured: boolean;
  fields: { key: string; label: string; placeholder: string; isTextarea?: boolean }[];
  configValues: Record<string, string>;
}

export default function ConnectorsPage() {
  const supabase = createClient();

  const [connectors, setConnectors] = useState<ConnectorCard[]>([
    {
      id: 'gcal',
      name: 'Google Calendar',
      type: 'gcal',
      iconName: 'Calendar',
      triggerType: 'During Call',
      configured: true,
      fields: [
        { key: 'oauth_token', label: 'OAuth Access Token', placeholder: 'ya29.a0A...' },
        { key: 'calendar_id', label: 'Calendar ID', placeholder: 'primary or support@company.com' },
        { key: 'event_title_template', label: 'Event Title Template', placeholder: 'VoCall Booking - {caller_name}' },
      ],
      configValues: {
        oauth_token: 'ya29.a0A_mock_token_38921',
        calendar_id: 'primary',
        event_title_template: 'VoCall Support Call - {caller_name}',
      },
    },
    {
      id: 'postgres',
      name: 'Supabase / Postgres DB',
      type: 'postgres',
      iconName: 'Database',
      triggerType: 'During Call',
      configured: true,
      fields: [
        { key: 'connection_string', label: 'Postgres Connection String', placeholder: 'postgresql://user:pass@ep-host.supabase.co:5432/postgres' },
        { key: 'query', label: 'SQL Query / Stored Proc', placeholder: 'SELECT * FROM users WHERE phone = $1', isTextarea: true },
      ],
      configValues: {
        connection_string: 'postgresql://postgres.vocall:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
        query: 'INSERT INTO call_logs (call_id, summary) VALUES ($1, $2)',
      },
    },
    {
      id: 'webhook',
      name: 'Custom Webhook',
      type: 'webhook',
      iconName: 'Send',
      triggerType: 'During & Post Call',
      configured: true,
      fields: [
        { key: 'url', label: 'Target Webhook Endpoint URL', placeholder: 'https://api.yourdomain.com/webhooks/vocall' },
        { key: 'method', label: 'HTTP Method (POST/GET)', placeholder: 'POST' },
        { key: 'headers', label: 'Custom HTTP Headers (JSON)', placeholder: '{"Authorization": "Bearer token123"}', isTextarea: true },
      ],
      configValues: {
        url: 'https://webhook.site/demo-vocall-endpoint',
        method: 'POST',
        headers: '{"Content-Type": "application/json"}',
      },
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [modalFormValues, setModalFormValues] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    if (iconName === 'Calendar') return Calendar;
    if (iconName === 'Database') return Database;
    return Send;
  };

  const handleOpenConfig = (conn: ConnectorCard) => {
    setActiveModalId(conn.id);
    setModalFormValues(conn.configValues || {});
  };

  const handleSaveConfig = async (connId: string) => {
    setConfiguringId(connId);
    try {
      // Simulate API configure request
      await new Promise((r) => setTimeout(r, 600));

      setConnectors((prev) =>
        prev.map((c) =>
          c.id === connId
            ? { ...c, configured: true, configValues: { ...modalFormValues } }
            : c
        )
      );

      showNotification('Connector configured successfully');
      setActiveModalId(null);
    } catch (err: any) {
      showNotification(`Error: /api/connectors/${connId} — ${err?.message || 'Failed to configure'}. Try again.`);
    } finally {
      setConfiguringId(null);
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

      {/* Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-7 h-7 text-[#A78BFA]" />
            <span>Integrations & Connectors</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Trigger external webhooks, DB queries, and calendar events during or post call.
          </p>
        </div>

        <Button
          onClick={() => {
            const newId = `custom-${Date.now()}`;
            setConnectors((prev) => [
              ...prev,
              {
                id: newId,
                name: 'Custom Webhook Integration',
                type: 'webhook',
                iconName: 'Send',
                triggerType: 'Post Call',
                configured: false,
                fields: [
                  { key: 'url', label: 'Webhook Endpoint', placeholder: 'https://api.example.com' },
                ],
                configValues: {},
              },
            ]);
            showNotification('New connector template added');
          }}
          className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Connector</span>
        </Button>
      </div>

      {/* CONNECTORS GRID / EMPTY STATE */}
      {connectors.length === 0 ? (
        /* Empty State */
        <Card className="border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <Workflow className="w-16 h-16 text-slate-600 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No connectors configured.</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Configure connectors to connect your voice agents with CRM databases, Google Calendar, or API webhooks.
            </p>
          </div>
          <Button
            onClick={() => {
              setConnectors([
                {
                  id: 'gcal-1',
                  name: 'Google Calendar',
                  type: 'gcal',
                  iconName: 'Calendar',
                  triggerType: 'During Call',
                  configured: false,
                  fields: [
                    { key: 'calendar_id', label: 'Calendar ID', placeholder: 'primary' },
                  ],
                  configValues: {},
                },
              ]);
            }}
            className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 mt-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Connector</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectors.map((conn) => {
            const Icon = getIcon(conn.iconName);
            const isConfiguring = configuringId === conn.id;

            return (
              <Card key={conn.id} className="border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-[#7C3AED]/60 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        conn.configured
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {conn.configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{conn.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">Trigger: {conn.triggerType}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <Button
                      onClick={() => handleOpenConfig(conn)}
                      disabled={isConfiguring}
                      className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white text-xs font-semibold gap-1.5 focus:ring-2 focus:ring-[#7C3AED]"
                    >
                      {isConfiguring ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sliders className="w-3.5 h-3.5" />
                      )}
                      <span>Configure Connector</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Configure Connector Modal */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          {(() => {
            const activeConn = connectors.find((c) => c.id === activeModalId);
            if (!activeConn) return null;
            const Icon = getIcon(activeConn.iconName);

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon className="w-5 h-5 text-[#A78BFA]" />
                  <span>Configure {activeConn.name}</span>
                </h3>

                <div className="space-y-4 text-left">
                  {activeConn.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">{field.label}</Label>
                      {field.isTextarea ? (
                        <textarea
                          rows={3}
                          value={modalFormValues[field.key] || ''}
                          onChange={(e) =>
                            setModalFormValues({ ...modalFormValues, [field.key]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#7C3AED]"
                        />
                      ) : (
                        <Input
                          value={modalFormValues[field.key] || ''}
                          onChange={(e) =>
                            setModalFormValues({ ...modalFormValues, [field.key]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          className="bg-slate-950 border-slate-800 text-xs font-mono"
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModalId(null)}
                      className="flex-1 text-xs border-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSaveConfig(activeConn.id)}
                      disabled={configuringId === activeConn.id}
                      size="sm"
                      className="flex-1 text-xs bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-1.5 focus:ring-2 focus:ring-[#7C3AED]"
                    >
                      {configuringId === activeConn.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Save Configuration'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
