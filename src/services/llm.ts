interface LLMAnalysisResult {
  category: 'password_reset' | 'access_request' | 'hardware' | 'software' | 'network' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  complexity_score: number;
  can_automate: boolean;
  suggested_action?: string;
  reasoning: string;
}

export class LLMService {
  private proxyUrl = (import.meta.env.VITE_API_URL || '') + '/llm/analyze';

  constructor() {
    // constructor kept for compatibility; API key is handled server-side via proxy
  }

  async analyzeRequest(requestText: string): Promise<LLMAnalysisResult> {
    try {
      const res = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestText }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`LLM proxy error: ${res.status} ${txt}`);
      }

      const data = await res.json();

      return {
        category: data.category,
        priority: data.priority,
        complexity_score: data.complexity_score,
        can_automate: data.can_automate,
        suggested_action: data.suggested_action,
        reasoning: data.reasoning,
      };
    } catch (error) {
      console.error('LLM analysis error via proxy:', error);
      return {
        category: 'other',
        priority: 'medium',
        complexity_score: 5,
        can_automate: false,
        reasoning: 'Failed to analyze request with LLM (proxy)',
      };
    }
  }

  async generateResponse(context: string, question: string): Promise<string> {
    try {
      const proxy = (import.meta.env.VITE_API_URL || '') + '/llm/respond';
      const res = await fetch(proxy, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, question }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`LLM proxy respond error: ${res.status} ${txt}`);
      }

      const data = await res.json();
      return data.content || '';
    } catch (error) {
      console.error('LLM response generation error via proxy:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again or contact an administrator.';
    }
  }
}
