/**
 * VoCall Domain Types & Interface Contracts
 * Provides unified domain models for frontend UI components and backend API services.
 */

export interface AnalysisProperty {
  name: string;
  prompt: string;
}

export interface AgentAnalysis {
  properties?: AnalysisProperty[];
  [key: string]: any;
}

export interface AgentTelephonyConfig {
  provider?: 'Twilio' | 'Plivo' | 'Exotel' | string;
  phoneNumber?: string;
  sipTrunkUrl?: string;
  inboundRouting?: boolean;
  outboundCallerIdMasking?: boolean;
}

export interface AgentMemoryConfig {
  enabled?: boolean;
  tiers?: {
    shortTermRedis?: boolean;
    episodicPostCall?: boolean;
    semanticPgVector?: boolean;
    falkorGraph?: boolean;
  };
}

export interface AgentEmotionConfig {
  enabled?: boolean;
  signals?: {
    text: boolean;
    audio: boolean;
  };
}

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'archived' | string;
  voice?: string;
  prompt?: string;
  description?: string;
  language?: string;
  telephony?: AgentTelephonyConfig;
  memory?: AgentMemoryConfig;
  emotion?: AgentEmotionConfig;
  analysis?: AgentAnalysis;
  published?: boolean;
  config?: Record<string, any>;
  space_id?: string;
  org_id?: string;
  created_at?: string;
}

export interface TranscriptMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

export interface Call {
  id: string;
  direction: 'inbound' | 'outbound' | 'webcall' | string;
  contactName?: string;
  agentName?: string;
  agent_id?: string;
  contact_id?: string;
  date?: string;
  created_at?: string;
  duration?: string;
  durationSeconds?: number;
  duration_seconds?: number;
  status: 'completed' | 'failed' | 'in-progress' | 'initiated' | string;
  emotionScore?: number;
  emotion_score?: number;
  sentiment?: string;
  sentimentScore?: number;
  summary?: string;
  provider?: string;
  transcript?: string | TranscriptMessage[] | any[];
  analysis?: Record<string, any>;
  is_test?: boolean;
}

export interface ContactMemory {
  facts?: string[];
  lastInteraction?: string;
  [key: string]: any;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  tags?: string[];
  notes?: string;
  memory?: ContactMemory;
  org_id?: string;
  created_at?: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  provider?: 'Twilio' | 'Plivo' | 'Exotel' | string;
  agentName?: string | null;
  agent_id?: string | null;
  kyc_status?: 'none' | 'uploading' | 'review' | 'verified' | string;
  org_id?: string;
  created_at?: string;
}

export interface Connector {
  id: string;
  type: string;
  name?: string;
  trigger_type?: string;
  config?: Record<string, any>;
  enabled?: boolean;
  active?: boolean;
  desc?: string;
  agent_id?: string | null;
  org_id?: string;
  created_at?: string;
}

export interface APIKeys {
  groq?: string;
  cerebras?: string;
  sarvam?: string;
  cartesia?: string;
  hume?: string;
  twilio?: string;
  resend?: string;
  [key: string]: string | undefined;
}

export interface AuthUser {
  id: string;
  email: string;
  org_id: string;
  role?: string;
}
