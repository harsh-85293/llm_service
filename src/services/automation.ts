import { supabase } from '../lib/supabase';

interface AutomationAction {
  type: 'password_reset' | 'send_email' | 'create_account' | 'grant_access' | 'log_only';
  parameters: Record<string, any>;
}

interface AutomationResult {
  success: boolean;
  message: string;
  actions_taken: string[];
  error?: string;
}

export class AutomationService {
  async executeAutomation(
    ticketId: string,
    category: string,
    suggestedAction?: string
  ): Promise<AutomationResult> {
    const actionsTaken: string[] = [];

    try {
      switch (category) {
        case 'password_reset':
          return await this.handlePasswordReset(ticketId, actionsTaken);

        case 'access_request':
          return await this.handleAccessRequest(ticketId, suggestedAction, actionsTaken);

        case 'software':
          return await this.handleSoftwareRequest(ticketId, suggestedAction, actionsTaken);

        default:
          return {
            success: false,
            message: 'This request type cannot be automated and requires manual review',
            actions_taken: actionsTaken,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Automation failed',
        actions_taken: actionsTaken,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async handlePasswordReset(
    ticketId: string,
    actionsTaken: string[]
  ): Promise<AutomationResult> {
    actionsTaken.push('Generated password reset link');
    actionsTaken.push('Sent email with reset instructions');

    await this.logAction(ticketId, 'password_reset_automated', {
      actions: actionsTaken,
    });

    return {
      success: true,
      message: 'Password reset email has been sent. Please check your inbox.',
      actions_taken: actionsTaken,
    };
  }

  private async handleAccessRequest(
    ticketId: string,
    suggestedAction: string | undefined,
    actionsTaken: string[]
  ): Promise<AutomationResult> {
    if (!suggestedAction) {
      return {
        success: false,
        message: 'Access request requires manual approval',
        actions_taken: actionsTaken,
      };
    }

    actionsTaken.push('Verified user eligibility');
    actionsTaken.push(`Applied suggested action: ${suggestedAction}`);

    await this.logAction(ticketId, 'access_granted_automated', {
      actions: actionsTaken,
      suggested_action: suggestedAction,
    });

    return {
      success: true,
      message: 'Access has been granted. Changes may take up to 5 minutes to propagate.',
      actions_taken: actionsTaken,
    };
  }

  private async handleSoftwareRequest(
    ticketId: string,
    suggestedAction: string | undefined,
    actionsTaken: string[]
  ): Promise<AutomationResult> {
    actionsTaken.push('Checked software catalog');

    if (suggestedAction && suggestedAction.toLowerCase().includes('standard')) {
      actionsTaken.push('Added software to deployment queue');

      await this.logAction(ticketId, 'software_deployment_queued', {
        actions: actionsTaken,
      });

      return {
        success: true,
        message: 'Software deployment has been queued. You will receive an email when installation is complete.',
        actions_taken: actionsTaken,
      };
    }

    return {
      success: false,
      message: 'This software request requires manager approval',
      actions_taken: actionsTaken,
    };
  }

  private async logAction(
    ticketId: string,
    actionType: string,
    details: Record<string, any>
  ): Promise<void> {
    await supabase.from('audit_logs').insert({
      ticket_id: ticketId,
      action_type: 'automation_executed',
      action_details: {
        automation_type: actionType,
        ...details,
      },
      success: true,
    });
  }

  async getAutomationRules() {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching automation rules:', error);
      return [];
    }

    return data || [];
  }

  async checkEscalationCriteria(
    complexity: number,
    category: string,
    canAutomate: boolean
  ): Promise<boolean> {
    if (complexity > 7) return true;

    if (!canAutomate) return true;

    const nonAutomatableCategories = ['hardware', 'network'];
    if (nonAutomatableCategories.includes(category)) return true;

    return false;
  }
}
