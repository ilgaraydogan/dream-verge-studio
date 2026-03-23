const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const PLAYGROUND_SYSTEM_PROMPT = `You are a professional dream interpreter assistant.
Analyze the dream the user describes and provide:
1. Key symbols and their psychological meaning
2. Overall emotional tone
3. Possible themes or messages
4. A brief, thoughtful summary

Be warm, professional, and insightful. 
Do not make medical diagnoses.
Respond in the same language the user writes in.
Keep response under 400 words.`;

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export async function interpretDreamWithOpenRouter(dreamText: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://dreamverge.ilgaraydogan.com.tr',
      'X-Title': 'Dream Verge Studio',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        { role: 'system', content: PLAYGROUND_SYSTEM_PROMPT },
        { role: 'user', content: dreamText },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data: OpenRouterResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from OpenRouter');
  }

  return data.choices[0].message.content;
}
