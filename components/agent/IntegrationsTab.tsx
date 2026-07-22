"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Database,
  Webhook,
  Building2,
  Cloud,
  Server,
  MessageSquare,
  Send,
  Zap,
  CheckCircle,
  Loader2,
  Settings2,
} from "lucide-react";
import ConnectorConfigModal from "../connectors/ConnectorConfigModal";

export interface IntegrationsTabProps {
  agent_id: string;
  org_id: string;
}

interface ConnectorMeta {
  type: string;
  name: string;
  description: string;
  category: "During Call" | "Post Call";
  icon: React.ComponentType<{ className?: string }>;
}

const CONNECTORS: ConnectorMeta[] = [
  // During Call
  {
    type: "google_calendar",
    name: "Google Calendar",
    description: "Check availability and book appointments live during call turns.",
    category: "During Call",
    icon: Calendar,
  },
  {
    type: "supabase",
    name: "Supabase",
    description: "Query your Supabase database in real-time during customer calls.",
    category: "During Call",
    icon: Database,
  },
  {
    type: "custom_webhook",
    name: "Custom Webhook",
    description: "Trigger custom HTTP endpoints during active live calls.",
    category: "During Call",
    icon: Webhook,
  },
  // Post Call
  {
    type: "hubspot",
    name: "HubSpot",
    description: "Sync call summaries, create contacts, and log deal activities in HubSpot.",
    category: "Post Call",
    icon: Building2,
  },
  {
    type: "salesforce",
    name: "Salesforce",
    description: "Log call tasks and update Salesforce leads/contacts automatically.",
    category: "Post Call",
    icon: Cloud,
  },
  {
    type: "postgres",
    name: "PostgreSQL",
    description: "Execute parameterized queries against your Postgres database post-call.",
    category: "Post Call",
    icon: Server,
  },
  {
    type: "slack",
    name: "Slack",
    description: "Post call summary reports and high-frustration alerts to Slack channels.",
    category: "Post Call",
    icon: MessageSquare,
  },
  {
    type: "whatsapp",
    name: "WhatsApp",
    description: "Send automated WhatsApp follow-up summaries via Twilio or Plivo.",
    category: "Post Call",
    icon: Send,
  },
  {
    type: "zapier",
    name: "Zapier",
    description: "Send structured call payloads to Zapier webhooks for 5,000+ app workflows.",
    category: "Post Call",
    icon: Zap,
  },
];

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  agent_id,
  org_id,
}) => {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalType, setActiveModalType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [togglingType, setTogglingType] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/connectors?agent_id=${agent_id}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Record<string, any> = {};
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            mapped[item.connector_type] = item;
          });
        }
        setConfigs(mapped);
      }
    } catch (err) {
      console.error("Failed to load connector configs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (agent_id) {
      fetchConfigs();
    }
  }, [agent_id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveModal = async (configPayload: Record<string, any>) => {
    if (!activeModalType) return;
    const body = {
      agent_id: agent_id || null,
      is_enabled: true,
      config: configPayload,
    };

    const res = await fetch(`/api/connectors/${activeModalType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Failed to save connector configuration");
    }

    showToast("Connector saved");
    await fetchConfigs();
  };

  const handleToggle = async (connectorType: string, currentEnabled: boolean) => {
    setTogglingType(connectorType);
    try {
      const existing = configs[connectorType] || {};
      const currentConfig = existing.config || {};

      if (currentEnabled) {
        await fetch(`/api/connectors/${connectorType}?agent_id=${agent_id}`, {
          method: "DELETE",
        });
        showToast("Connector disabled");
      } else {
        await fetch(`/api/connectors/${connectorType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_id: agent_id || null,
            is_enabled: true,
            config: currentConfig,
          }),
        });
        showToast("Connector enabled");
      }
      await fetchConfigs();
    } catch (err) {
      console.error("Failed to toggle connector:", err);
    } finally {
      setTogglingType(null);
    }
  };

  const renderConnectorCard = (connector: ConnectorMeta) => {
    const IconComp = connector.icon;
    const itemConfig = configs[connector.type];
    const isConfigured = !!(
      itemConfig &&
      itemConfig.config &&
      Object.keys(itemConfig.config).length > 0
    );
    const isEnabled = !!(itemConfig && itemConfig.is_enabled);
    const isToggling = togglingType === connector.type;

    return (
      <div
        key={connector.type}
        className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-md hover:border-slate-700 hover:bg-slate-900 transition-all duration-200"
      >
        {/* Card Header & Content */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/80 text-purple-400 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition">
                <IconComp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">
                  {connector.name}
                </h4>
                {/* Category Chip */}
                <span
                  className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                    connector.category === "During Call"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}
                >
                  {connector.category}
                </span>
              </div>
            </div>

            {/* Status Dot + Toggle Switch */}
            <div className="flex items-center space-x-2">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  isEnabled && isConfigured
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-slate-600"
                }`}
                title={
                  isEnabled && isConfigured
                    ? "Active & Configured"
                    : "Not Configured"
                }
              />
              <button
                type="button"
                onClick={() => handleToggle(connector.type, isEnabled)}
                disabled={isToggling}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabled ? "bg-purple-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
            {connector.description}
          </p>
        </div>

        {/* Card Footer Action */}
        <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isConfigured ? "Configured" : "Unconfigured"}
          </span>
          <button
            type="button"
            onClick={() => setActiveModalType(connector.type)}
            className="inline-flex items-center space-x-1.5 rounded-md border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Settings2 className="h-3.5 w-3.5 text-purple-400" />
            <span>Configure</span>
          </button>
        </div>
      </div>
    );
  };

  const duringCallConnectors = CONNECTORS.filter(
    (c) => c.category === "During Call"
  );
  const postCallConnectors = CONNECTORS.filter(
    (c) => c.category === "Post Call"
  );

  return (
    <div className="space-y-8 p-1">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-slate-900 px-4 py-3 text-sm font-medium text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-100">
          Agent Connectors & Integrations
        </h3>
        <p className="text-xs text-slate-400">
          Connect your voice agent to external tools, databases, CRMs, and webhooks for live during-call queries and post-call workflows.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center space-x-2 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          <span className="text-sm">Loading integration configurations...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: During Call */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <h4 className="text-sm font-semibold text-slate-200">
                During Call Connectors
              </h4>
              <span className="text-xs text-slate-500">
                (LLM tool calling during active conversation)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {duringCallConnectors.map(renderConnectorCard)}
            </div>
          </div>

          {/* Section 2: Post Call */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
              <h4 className="text-sm font-semibold text-slate-200">
                Post Call Connectors
              </h4>
              <span className="text-xs text-slate-500">
                (Triggered after call finalization &amp; analysis)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {postCallConnectors.map(renderConnectorCard)}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {activeModalType && (
        <ConnectorConfigModal
          connector_type={activeModalType}
          initial_config={configs[activeModalType]?.config || null}
          is_open={!!activeModalType}
          on_close={() => setActiveModalType(null)}
          on_save={handleSaveModal}
        />
      )}
    </div>
  );
};

export default IntegrationsTab;
