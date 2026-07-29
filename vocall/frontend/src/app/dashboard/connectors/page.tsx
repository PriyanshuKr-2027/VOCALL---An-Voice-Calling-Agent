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
  Loader2,
  Settings2,
  CheckCircle,
} from "lucide-react";
import ConnectorConfigModal from "@/components/connectors/ConnectorConfigModal";

interface ConnectorItem {
  type: string;
  name: string;
  description: string;
  category: "During Call" | "Post Call";
  icon: React.ComponentType<{ className?: string }>;
}

const CONNECTOR_LIST: ConnectorItem[] = [
  {
    type: "google_calendar",
    name: "Google Calendar",
    description: "Checks slot availability and books calendar events live.",
    category: "During Call",
    icon: Calendar,
  },
  {
    type: "hubspot",
    name: "HubSpot",
    description: "Syncs call summaries, tags, and contacts to CRM.",
    category: "Post Call",
    icon: Building2,
  },
  {
    type: "salesforce",
    name: "Salesforce",
    description: "Creates pipeline tasks and logs call disposition.",
    category: "Post Call",
    icon: Cloud,
  },
  {
    type: "supabase",
    name: "Supabase",
    description: "Vector database lookup for live customer memory.",
    category: "During Call",
    icon: Database,
  },
  {
    type: "postgres",
    name: "Postgres",
    description: "Exports structured JSON telemetry logs.",
    category: "Post Call",
    icon: Server,
  },
  {
    type: "slack",
    name: "Slack",
    description: "Instant alerts on high-frustration call escalations.",
    category: "During Call",
    icon: MessageSquare,
  },
  {
    type: "whatsapp",
    name: "WhatsApp",
    description: "Dispatches instant booking confirmations.",
    category: "Post Call",
    icon: Send,
  },
  {
    type: "zapier",
    name: "Zapier",
    description: "Triggers 5,000+ business workflow automations.",
    category: "Post Call",
    icon: Zap,
  },
  {
    type: "custom_webhook",
    name: "Custom Webhook",
    description: "Executes custom HTTP callbacks during conversation turns.",
    category: "During Call",
    icon: Webhook,
  },
];

type FilterTab = "All" | "During Call" | "Post Call";

export default function ConnectorsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalType, setActiveModalType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrgConnectors = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/connectors");
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
      console.error("Failed to fetch org connectors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgConnectors();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveModal = async (configPayload: Record<string, any>) => {
    if (!activeModalType) return;
    const body = {
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

    showToast("Connector configuration updated");
    await fetchOrgConnectors();
  };

  const filteredConnectors = CONNECTOR_LIST.filter((item) => {
    if (activeTab === "All") return true;
    return item.category === activeTab;
  });

  return (
    <div className="space-y-8 p-1 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-slate-900 px-4 py-3 text-sm font-medium text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-1 border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Organization Connectors &amp; Integrations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage during-call tools and post-call automation webhooks org-wide.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-8 border-b border-slate-800 text-sm font-medium">
        {(["All", "During Call", "Post Call"] as FilterTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors relative ${
                isActive
                  ? "text-purple-400 font-semibold border-b-2 border-[#7C3AED]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="text-sm">Loading connector configurations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnectors.map((item) => {
            const IconComp = item.icon;
            const itemConfig = configs[item.type];
            const isConnected = !!(
              itemConfig &&
              itemConfig.is_enabled &&
              itemConfig.config &&
              Object.keys(itemConfig.config).length > 0
            );

            return (
              <div
                key={item.type}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl hover:border-slate-700 hover:bg-slate-900 transition-all duration-200"
              >
                {/* Top Section */}
                <div className="space-y-4">
                  {/* Top-left badge & Top-right status dot */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
                        item.category === "During Call"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {item.category}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isConnected
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : "bg-slate-600"
                        }`}
                      />
                      <span className="text-xs text-slate-400">
                        {isConnected ? "Connected" : "Not Configured"}
                      </span>
                    </div>
                  </div>

                  {/* Icon & Name */}
                  <div className="flex items-center space-x-3 pt-1">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/80 text-purple-400 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h2 className="text-[18px] font-bold text-slate-100 tracking-tight">
                      {item.name}
                    </h2>
                  </div>

                  {/* One-line Description */}
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[38px]">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModalType(item.type)}
                    className="w-full flex items-center justify-center space-x-2 rounded-lg border border-purple-500/40 bg-purple-500/5 px-4 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-600/10 hover:border-purple-500 focus:outline-none transition-all duration-200"
                  >
                    <Settings2 className="h-4 w-4 text-purple-400" />
                    <span>Configure Webhook Settings</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connector Modal */}
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
}
