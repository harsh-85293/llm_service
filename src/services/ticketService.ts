import { api } from '../lib/api';
import { LLMService } from './llm';
import { AutomationService } from './automation';

export interface Ticket {
  _id?: string;
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

export class TicketService {
  private llmService: LLMService;
  private automationService: AutomationService;

  constructor() {
    this.llmService = new LLMService();
    this.automationService = new AutomationService();
  }

  async createTicket(requestText: string): Promise<{ ticket: Ticket | null; error: string | null }> {
    try {
      const analysis = await this.llmService.analyzeRequest(requestText);
      const analysisFailed = (analysis.reasoning || '').toLowerCase().includes('failed to analyze request with llm');

      const ticket = await api.createTicket({
        request_text: requestText,
        category: analysis.category,
        priority: analysis.priority,
      });

      const ticketData: Ticket = {
        ...ticket,
        id: ticket._id,
      };

      await api.updateTicket(ticket._id, {
        status: analysisFailed ? 'pending' : 'processing',
        complexity_score: analysis.complexity_score,
      });

      if (!analysisFailed) {
        await api.createLLMInteraction(ticket._id, {
          model: 'gpt-4o-mini',
          prompt: `Analyze: ${requestText}`,
          response: JSON.stringify(analysis),
          tokens_used: 0,
          latency_ms: 0,
        });
      } else {
        await api.updateTicket(ticket._id, {
          resolution_notes: 'LLM analysis temporarily unavailable. Ticket queued for manual triage.',
        });
      }

      const shouldEscalate = !analysisFailed && (await this.automationService.checkEscalationCriteria(
        analysis.complexity_score,
        analysis.category,
        analysis.can_automate
      ));

      if (shouldEscalate) {
        await this.escalateTicket(ticket._id, analysis.reasoning);
        return { ticket: ticketData, error: null };
      }

      if (analysis.can_automate) {
        const automationResult = await this.automationService.executeAutomation(
          ticket._id,
          analysis.category,
          analysis.suggested_action
        );

        if (automationResult.success) {
          await api.updateTicket(ticket._id, {
            status: 'automated',
            auto_resolved: true,
            resolution_notes: automationResult.message,
            completed_at: new Date().toISOString(),
          });

          ticketData.status = 'automated';
          ticketData.auto_resolved = true;
          ticketData.resolution_notes = automationResult.message;
        } else {
          await this.escalateTicket(ticket._id, 'Automation failed');
        }
      } else {
        await this.escalateTicket(ticket._id, analysis.reasoning);
      }

      return { ticket: ticketData, error: null };
    } catch (error: unknown) {
      console.error('Error creating ticket:', error);
      const message = error instanceof Error ? error.message : 'Failed to create ticket';
      return { ticket: null, error: message };
    }
  }

  async escalateTicket(ticketId: string, reason: string): Promise<void> {
    try {
      await api.updateTicket(ticketId, {
        status: 'escalated',
        resolution_notes: `Escalated: ${reason}`,
      });
    } catch (error) {
      console.error('Error escalating ticket:', error);
    }
  }

  async getUserTickets(): Promise<Ticket[]> {
    try {
      type ServerTicket = Omit<Ticket, 'id'> & { _id: string };
      const tickets = (await api.getTickets()) as unknown as ServerTicket[];
      return tickets.map((t) => ({ ...t, id: t._id }));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  async getAllTickets(): Promise<Ticket[]> {
    try {
      type ServerTicket = Omit<Ticket, 'id'> & { _id: string };
      const tickets = (await api.getTickets()) as unknown as ServerTicket[];
      return tickets.map((t) => ({ ...t, id: t._id }));
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      return [];
    }
  }

  async updateTicketStatus(ticketId: string, status: string, notes?: string): Promise<void> {
    try {
      const updateData: Partial<{ status: string; resolution_notes: string; completed_at: string }> = { status };

      if (notes) {
        updateData.resolution_notes = notes;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      await api.updateTicket(ticketId, updateData as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async getTicketLogs(ticketId: string): Promise<Array<{
    id: string;
    ticket_id: string;
    user_id?: string;
    action_type: 'request_created' | 'ai_analysis' | 'automation_executed' | 'escalated' | 'admin_action' | 'completed';
    action_details: Record<string, unknown>;
    success: boolean;
    error_message?: string;
    created_at: string;
  }>> {
    try {
      type ActionType = 'request_created' | 'ai_analysis' | 'automation_executed' | 'escalated' | 'admin_action' | 'completed';
      const ACTION_TYPES: ActionType[] = ['request_created', 'ai_analysis', 'automation_executed', 'escalated', 'admin_action', 'completed'];
      const logs = await api.getTicketLogs(ticketId);
      return (logs as Array<Record<string, unknown>>).map((l) => {
        const anyLog = l as Record<string, unknown> & { _id?: string };
        const candidate = String(anyLog.action_type ?? '');
        const normalized: ActionType = ACTION_TYPES.includes(candidate as ActionType)
          ? (candidate as ActionType)
          : 'admin_action';
        return {
          id: String(anyLog._id ?? ''),
          ticket_id: String(anyLog.ticket_id ?? ''),
          user_id: anyLog.user_id ? String(anyLog.user_id) : undefined,
          action_type: normalized,
          action_details: (anyLog.action_details as Record<string, unknown>) ?? {},
          success: Boolean(anyLog.success ?? true),
          error_message: anyLog.error_message ? String(anyLog.error_message) : undefined,
          created_at: String(anyLog.created_at ?? new Date().toISOString()),
        };
      });
    } catch (error) {
      console.error('Error fetching ticket logs:', error);
      return [];
    }
  }
}
