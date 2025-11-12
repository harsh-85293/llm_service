// Type definitions only - using MongoDB backend via API

export interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  last_login: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  request_text: string;
  category: 'password_reset' | 'access_request' | 'hardware' | 'software' | 'network' | 'other';
  status: 'pending' | 'processing' | 'automated' | 'escalated' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  complexity_score: number;
  auto_resolved: boolean;
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface AuditLog {
  id: string;
  ticket_id: string;
  user_id?: string;
  action_type: 'request_created' | 'ai_analysis' | 'automation_executed' | 'escalated' | 'admin_action' | 'completed';
  action_details: Record<string, unknown>;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  enabled: boolean;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface LLMInteraction {
  id: string;
  ticket_id: string;
  model: string;
  prompt: string;
  response: string;
  tokens_used: number;
  latency_ms: number;
  created_at: string;
}
