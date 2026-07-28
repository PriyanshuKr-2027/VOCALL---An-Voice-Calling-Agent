/**
 * VoCall Unified API Service Client
 * Provides typed frontend wrappers for all FastAPI backend endpoints (/api/v1).
 */

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1';
const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000000';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('vocall_access_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==========================================
// 🔐 Auth API
// ==========================================
export const authApi = {
  login: async (email: string, password: string) => {
    return request<{
      access_token: string;
      token_type: string;
      user: { id: string; email: string; org_id: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return request<{ status: string; user: { id: string; email: string; org_id: string; role: string } }>('/auth/me');
  },
};

// ==========================================
// 🤖 Agents API
// ==========================================
export interface AgentPayload {
  id?: string;
  name: string;
  space_id?: string;
  org_id?: string;
  system_prompt?: string;
  voice_id?: string;
  voice_provider?: string;
  language?: string;
  config?: Record<string, any>;
  published?: boolean;
  enable_memory?: boolean;
  enable_emotion?: boolean;
}

export const agentsApi = {
  list: async (orgId: string = MOCK_ORG_ID) => {
    return request<AgentPayload[]>(`/agents?org_id=${orgId}`);
  },

  get: async (agentId: string) => {
    return request<AgentPayload>(`/agents/${agentId}`);
  },

  create: async (agent: AgentPayload) => {
    const body = {
      org_id: MOCK_ORG_ID,
      language: 'en',
      config: {},
      published: false,
      enable_memory: true,
      enable_emotion: true,
      ...agent,
    };
    return request<AgentPayload>('/agents', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update: async (agentId: string, updates: Partial<AgentPayload>) => {
    return request<AgentPayload>(`/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (agentId: string) => {
    return request<void>(`/agents/${agentId}`, {
      method: 'DELETE',
    });
  },

  publish: async (agentId: string) => {
    return request<{ message: string; agent: AgentPayload }>(`/agents/${agentId}/publish`, {
      method: 'POST',
    });
  },

  enhancePrompt: async (agentId: string, systemPrompt: string) => {
    return request<{ enhanced_prompt: string }>(`/agents/${agentId}/enhance-prompt`, {
      method: 'POST',
      body: JSON.stringify({ system_prompt: systemPrompt }),
    });
  },
};

// ==========================================
// 📞 Calls API
// ==========================================
export interface CallPayload {
  id?: string;
  org_id?: string;
  agent_id?: string;
  contact_id?: string;
  direction?: 'inbound' | 'outbound' | 'webcall';
  from_number?: string;
  to_number?: string;
  status?: string;
  duration_seconds?: number;
  transcript?: string;
  is_test?: boolean;
  emotion_score?: number;
  analysis?: Record<string, any>;
  created_at?: string;
}

export interface LiveKitTokenResponse {
  token: string;
  room_name: string;
  livekit_url: string;
}

export const callsApi = {
  list: async (orgId: string = MOCK_ORG_ID, agentId?: string, direction?: string) => {
    let query = `?org_id=${orgId}`;
    if (agentId) query += `&agent_id=${agentId}`;
    if (direction) query += `&direction=${direction}`;
    return request<CallPayload[]>(`/calls${query}`);
  },

  get: async (callId: string) => {
    return request<CallPayload>(`/calls/${callId}`);
  },

  create: async (call: CallPayload) => {
    return request<CallPayload>('/calls', {
      method: 'POST',
      body: JSON.stringify({ org_id: MOCK_ORG_ID, ...call }),
    });
  },

  getWebCallToken: async (roomName: string, participantName: string, agentId?: string) => {
    return request<LiveKitTokenResponse>('/calls/token', {
      method: 'POST',
      body: JSON.stringify({
        room_name: roomName,
        participant_name: participantName,
        agent_id: agentId || null,
      }),
    });
  },

  getCallMemory: async (callId: string) => {
    return request<any>(`/calls/${callId}/memory?org_id=${MOCK_ORG_ID}`);
  },
};

// ==========================================
// 📇 Contacts API
// ==========================================
export interface ContactPayload {
  id?: string;
  org_id?: string;
  name?: string;
  phone?: string;
  email?: string;
  tags?: string[];
  created_at?: string;
}

export const contactsApi = {
  list: async (orgId: string = MOCK_ORG_ID) => {
    return request<ContactPayload[]>(`/contacts?org_id=${orgId}`);
  },

  create: async (contact: ContactPayload) => {
    return request<ContactPayload>('/contacts', {
      method: 'POST',
      body: JSON.stringify({ org_id: MOCK_ORG_ID, ...contact }),
    });
  },

  update: async (contactId: string, updates: Partial<ContactPayload>) => {
    return request<ContactPayload>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (contactId: string) => {
    return request<void>(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  importBulk: async (contacts: ContactPayload[]) => {
    const formatted = contacts.map((c) => ({ org_id: MOCK_ORG_ID, ...c }));
    return request<{ inserted_count: number; contacts: ContactPayload[] }>('/contacts/import', {
      method: 'POST',
      body: JSON.stringify(formatted),
    });
  },
};

// ==========================================
// 🔌 Connectors API
// ==========================================
export interface ConnectorPayload {
  id?: string;
  org_id?: string;
  agent_id?: string;
  type: string;
  trigger_type?: string;
  config?: Record<string, any>;
  enabled?: boolean;
}

export const connectorsApi = {
  list: async (orgId: string = MOCK_ORG_ID) => {
    return request<ConnectorPayload[]>(`/connectors?org_id=${orgId}`);
  },

  create: async (connector: ConnectorPayload) => {
    return request<ConnectorPayload>('/connectors', {
      method: 'POST',
      body: JSON.stringify({ org_id: MOCK_ORG_ID, ...connector }),
    });
  },

  update: async (connectorId: string, updates: Partial<ConnectorPayload>) => {
    return request<ConnectorPayload>(`/connectors/${connectorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (connectorId: string) => {
    return request<void>(`/connectors/${connectorId}`, {
      method: 'DELETE',
    });
  },

  connect: async (type: string, agentId?: string, config?: Record<string, any>) => {
    return request<ConnectorPayload>('/connectors/connect', {
      method: 'POST',
      body: JSON.stringify({
        org_id: MOCK_ORG_ID,
        type,
        agent_id: agentId || null,
        config: config || {},
      }),
    });
  },
};

// ==========================================
// 🔑 API Keys API
// ==========================================
export interface APIKeyPayload {
  id?: string;
  org_id?: string;
  provider: string;
  encrypted_key?: string;
  created_at?: string;
}

export const apiKeysApi = {
  list: async (orgId: string = MOCK_ORG_ID) => {
    return request<APIKeyPayload[]>(`/api-keys?org_id=${orgId}`);
  },

  create: async (provider: string, apiKey: string) => {
    return request<APIKeyPayload>('/api-keys', {
      method: 'POST',
      body: JSON.stringify({
        org_id: MOCK_ORG_ID,
        provider,
        api_key: apiKey,
      }),
    });
  },

  delete: async (keyId: string) => {
    return request<void>(`/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// 📱 Phone Numbers API
// ==========================================
export interface PhoneNumberPayload {
  id?: string;
  org_id?: string;
  agent_id?: string;
  number: string;
  provider?: string;
  kyc_status?: string;
  created_at?: string;
}

export const phoneNumbersApi = {
  list: async (orgId: string = MOCK_ORG_ID) => {
    return request<PhoneNumberPayload[]>(`/phone-numbers?org_id=${orgId}`);
  },

  buy: async (number: string, agentId?: string) => {
    return request<PhoneNumberPayload>('/phone-numbers/buy', {
      method: 'POST',
      body: JSON.stringify({
        org_id: MOCK_ORG_ID,
        number,
        agent_id: agentId || null,
      }),
    });
  },

  delete: async (numberId: string) => {
    return request<void>(`/phone-numbers/${numberId}`, {
      method: 'DELETE',
    });
  },
};
