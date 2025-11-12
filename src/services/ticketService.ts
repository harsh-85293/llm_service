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
        status: 'processing',
        complexity_score: analysis.complexity_score,
      });

      await api.createLLMInteraction(ticket._id, {
        model: 'gpt-4o-mini',
        prompt: `Analyze: ${requestText}`,
        response: JSON.stringify(analysis),
        tokens_used: 0,
        latency_ms: 0,
      });

      const shouldEscalate = await this.automationService.checkEscalationCriteria(
        analysis.complexity_score,
        analysis.category,
        analysis.can_automate
      );

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
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      return { ticket: null, error: error.message || 'Failed to create ticket' };
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
      const tickets = await api.getTickets();
      return tickets.map((t: any) => ({ ...t, id: t._id }));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  async getAllTickets(): Promise<Ticket[]> {
    try {
      const tickets = await api.getTickets();
      return tickets.map((t: any) => ({ ...t, id: t._id }));
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      return [];
    }
  }

  async updateTicketStatus(ticketId: string, status: string, notes?: string): Promise<void> {
    try {
      const updateData: any = { status };

      if (notes) {
        updateData.resolution_notes = notes;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      await api.updateTicket(ticketId, updateData);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async getTicketLogs(ticketId: string): Promise<any[]> {
    try {
      return await api.getTicketLogs(ticketId);
    } catch (error) {
      console.error('Error fetching ticket logs:', error);
      return [];
    }
  }
}
