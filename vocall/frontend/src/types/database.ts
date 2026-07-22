export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string | null
          logo_url: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          logo_url?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          logo_url?: string | null
          description?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          org_id: string | null
          role: string | null
          name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          org_id?: string | null
          role?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          role?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      spaces: {
        Row: {
          id: string
          org_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          created_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          space_id: string | null
          org_id: string
          name: string
          system_prompt: string | null
          voice_id: string | null
          voice_provider: string | null
          language: string
          config: Json
          published: boolean
          enable_memory: boolean
          enable_emotion: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          space_id?: string | null
          org_id: string
          name: string
          system_prompt?: string | null
          voice_id?: string | null
          voice_provider?: string | null
          language?: string
          config?: Json
          published?: boolean
          enable_memory?: boolean
          enable_emotion?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          space_id?: string | null
          org_id?: string
          name?: string
          system_prompt?: string | null
          voice_id?: string | null
          voice_provider?: string | null
          language?: string
          config?: Json
          published?: boolean
          enable_memory?: boolean
          enable_emotion?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          org_id: string
          provider: string
          encrypted_key: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          provider: string
          encrypted_key: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          provider?: string
          encrypted_key?: string
          created_at?: string
        }
      }
      phone_numbers: {
        Row: {
          id: string
          org_id: string
          agent_id: string | null
          number: string
          provider: string | null
          kyc_status: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          agent_id?: string | null
          number: string
          provider?: string | null
          kyc_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          agent_id?: string | null
          number?: string
          provider?: string | null
          kyc_status?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          org_id: string
          name: string | null
          phone: string | null
          email: string | null
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name?: string | null
          phone?: string | null
          email?: string | null
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string | null
          phone?: string | null
          email?: string | null
          tags?: string[]
          created_at?: string
        }
      }
      connectors: {
        Row: {
          id: string
          agent_id: string | null
          org_id: string
          type: string
          trigger_type: string | null
          config: Json
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          org_id: string
          type: string
          trigger_type?: string | null
          config?: Json
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          org_id?: string
          type?: string
          trigger_type?: string | null
          config?: Json
          enabled?: boolean
          created_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          agent_id: string | null
          contact_id: string | null
          org_id: string
          direction: string | null
          from_number: string | null
          to_number: string | null
          status: string | null
          duration_seconds: number | null
          transcript: string | null
          is_test: boolean
          emotion_score: number | null
          analysis: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          contact_id?: string | null
          org_id: string
          direction?: string | null
          from_number?: string | null
          to_number?: string | null
          status?: string | null
          duration_seconds?: number | null
          transcript?: string | null
          is_test?: boolean
          emotion_score?: number | null
          analysis?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          contact_id?: string | null
          org_id?: string
          direction?: string | null
          from_number?: string | null
          to_number?: string | null
          status?: string | null
          duration_seconds?: number | null
          transcript?: string | null
          is_test?: boolean
          emotion_score?: number | null
          analysis?: Json
          created_at?: string
          updated_at?: string
        }
      }
      memory_long_term: {
        Row: {
          id: string
          contact_id: string | null
          org_id: string
          agent_id: string | null
          content: string
          embedding: number[] | null
          emotion_state: Json
          created_at: string
        }
        Insert: {
          id?: string
          contact_id?: string | null
          org_id: string
          agent_id?: string | null
          content: string
          embedding?: number[] | null
          emotion_state?: Json
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string | null
          org_id?: string
          agent_id?: string | null
          content?: string
          embedding?: number[] | null
          emotion_state?: Json
          created_at?: string
        }
      }
      memory_episodic: {
        Row: {
          id: string
          contact_id: string | null
          call_id: string | null
          org_id: string
          summary: string | null
          key_facts: Json
          emotion_arc: Json
          entities: Json
          topics: Json
          created_at: string
        }
        Insert: {
          id?: string
          contact_id?: string | null
          call_id?: string | null
          org_id: string
          summary?: string | null
          key_facts?: Json
          emotion_arc?: Json
          entities?: Json
          topics?: Json
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string | null
          call_id?: string | null
          org_id?: string
          summary?: string | null
          key_facts?: Json
          emotion_arc?: Json
          entities?: Json
          topics?: Json
          created_at?: string
        }
      }
      emotion_events: {
        Row: {
          id: string
          call_id: string
          timestamp_ms: number | null
          valence: number | null
          arousal: number | null
          dominant: string | null
          confidence: number | null
          signal_source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          timestamp_ms?: number | null
          valence?: number | null
          arousal?: number | null
          dominant?: string | null
          confidence?: number | null
          signal_source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          timestamp_ms?: number | null
          valence?: number | null
          arousal?: number | null
          dominant?: string | null
          confidence?: number | null
          signal_source?: string | null
          created_at?: string
        }
      }
    }
  }
}
