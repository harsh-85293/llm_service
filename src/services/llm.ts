interface LLMAnalysisResult {
  category: 'password_reset' | 'access_request' | 'hardware' | 'software' | 'network' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  complexity_score: number;
  can_automate: boolean;
  suggested_action?: string;
  reasoning: string;
}

export class LLMService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeRequest(requestText: string): Promise<LLMAnalysisResult> {
    const startTime = Date.now();

    const prompt = `You are an IT support analyst. Analyze the following IT support request and provide a structured response.

Request: "${requestText}"

Analyze and respond with:
1. Category (password_reset, access_request, hardware, software, network, other)
2. Priority (low, medium, high, urgent)
3. Complexity Score (1-10, where 1 is simplest)
4. Can this be automated? (yes/no)
5. Suggested automated action if applicable
6. Brief reasoning

Respond in JSON format only:
{
  "category": "...",
  "priority": "...",
  "complexity_score": number,
  "can_automate": boolean,
  "suggested_action": "...",
  "reasoning": "..."
}`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert IT support analyst. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      const content = data.choices[0].message.content;
      const result = JSON.parse(content);

      return {
        category: result.category,
        priority: result.priority,
        complexity_score: result.complexity_score,
        can_automate: result.can_automate,
        suggested_action: result.suggested_action,
        reasoning: result.reasoning,
      };
    } catch (error) {
      console.error('LLM analysis error:', error);

      return {
        category: 'other',
        priority: 'medium',
        complexity_score: 5,
        can_automate: false,
        reasoning: 'Failed to analyze request with LLM, using default values',
      };
    }
  }

  async generateResponse(context: string, question: string): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful IT support assistant. Provide clear, concise, and professional responses.',
            },
            {
              role: 'user',
              content: `Context: ${context}\n\nQuestion: ${question}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('LLM response generation error:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again or contact an administrator.';
    }
  }
}
