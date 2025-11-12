import express from 'express';

const router = express.Router();

// POST /api/llm/analyze
// Body: { requestText: string }
router.post('/analyze', async (req, res) => {
  try {
    const { requestText } = req.body;

    if (!requestText) {
      return res.status(400).json({ error: 'requestText is required' });
    }
    const OPENAI_KEY =
      process.env.OPENAI_API_KEY ||
      process.env.OPENAI_KEY ||
      process.env.OPENAI_SECRET ||
      process.env.VITE_OPENAI_API_KEY;
    if (!OPENAI_KEY) {
      return res.status(500).json({ error: 'OpenAI key not configured on server' });
    }

    const prompt = `You are an IT support analyst. Analyze the following IT support request and provide a structured JSON response only.\n\nRequest: "${requestText}"\n\nRespond with JSON exactly in this shape: {"category":"password_reset|access_request|hardware|software|network|other","priority":"low|medium|high|urgent","complexity_score":number,"can_automate":boolean,"suggested_action":"...","reasoning":"..."}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert IT support analyst. Return ONLY valid JSON matching the requested shape.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI error', response.status, text);
      return res.status(502).json({ error: 'OpenAI API error', detail: text });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // sanitize response: remove code fences and surrounding text
    let sanitized = content.trim();
    // remove triple backticks and optional language hints
    sanitized = sanitized.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/,'').trim();

    // try to extract first JSON object in the text
    let parsed = null;
    try {
      parsed = JSON.parse(sanitized);
    } catch (e) {
      // fallback: find first { ... } block
      const m = sanitized.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch (e2) { parsed = null; }
      }
    }

    if (!parsed) {
      // return fallback defaults
      return res.json({
        category: 'other',
        priority: 'medium',
        complexity_score: 5,
        can_automate: false,
        suggested_action: '',
        reasoning: 'Could not parse LLM response',
        raw: content,
      });
    }

    return res.json({ ...parsed, raw: content });
  } catch (error) {
    console.error('LLM analyze error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// POST /api/llm/respond
// Body: { context: string, question: string }
router.post('/respond', async (req, res) => {
  try {
    const { context, question } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const OPENAI_KEY =
      process.env.OPENAI_API_KEY ||
      process.env.OPENAI_KEY ||
      process.env.OPENAI_SECRET ||
      process.env.VITE_OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: 'OpenAI key not configured on server' });

    const messages = [
      { role: 'system', content: 'You are a helpful IT support assistant.' },
      { role: 'user', content: `Context: ${context || ''}\n\nQuestion: ${question}` },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 400, temperature: 0.7 }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI respond error', response.status, text);
      return res.status(502).json({ error: 'OpenAI API error', detail: text });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return res.json({ content });
  } catch (err) {
    console.error('LLM respond error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

