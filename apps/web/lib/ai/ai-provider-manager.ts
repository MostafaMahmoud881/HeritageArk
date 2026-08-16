import { generateLocally } from './local-generator';
import type { AIProvider, LLMMessage, LLMResponse } from '../types';

export type { AIProvider };

const AI_TIMEOUT_MS = 20_000;

function log(level: string, label: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[AI_PROVIDER ${timestamp}] [${level}]`;
  if (typeof data === 'string') {
    console.log(`${prefix} ${label}: ${data}`);
  } else {
    console.log(`${prefix} ${label}:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export class AIProviderManager {
  private available: AIProvider[] = [];

  constructor() {
    const openaiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const ollamaKey = process.env.OLLAMA_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (groqKey) this.available.push('groq');
    if (ollamaKey) this.available.push('ollama');
    if (openrouterKey) this.available.push('openrouter' as any);
    if (openaiKey) this.available.push('openai');
    if (geminiKey) this.available.push('gemini');
    this.available.push('local');

    log('INFO', 'Available providers', { providers: this.available, groqKeySet: !!groqKey, openaiKeySet: !!openaiKey });
  }

  get availableProviders(): AIProvider[] {
    return [...this.available];
  }

  async generate(messages: LLMMessage[]): Promise<LLMResponse> {
    for (const provider of this.available) {
      try {
        const content = await this.tryProvider(provider, messages);
        if (content) return { content, provider };
      } catch {
        continue;
      }
    }
    const lastMsg = messages[messages.length - 1];
    return { content: this.fallbackResponse(lastMsg?.content ?? ''), provider: 'local' };
  }

  private async tryProvider(provider: AIProvider | 'openrouter', messages: LLMMessage[]): Promise<string | null> {
    switch (provider) {
      case 'ollama':
        return this.callOllama(messages);
      case 'openrouter':
        return this.callOpenRouter(messages);
      case 'openai':
        return this.callOpenAI(messages);
      case 'groq':
        return this.callGroq(messages);
      case 'gemini':
        return this.callGemini(messages);
      case 'local':
        return null;
    }
  }

  private async callOllama(messages: LLMMessage[]): Promise<string | null> {
    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) return null;
    const model = process.env.OLLAMA_MODEL || 'gemma4:31b';
    const res = await fetchWithTimeout('https://ollama.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, stream: false }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { message?: { content?: string } };
    return data.message?.content ?? null;
  }

  private async callOpenRouter(messages: LLMMessage[]): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;
    const model = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free';
    const res = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
        'X-Title': 'HeritageArk',
      },
      body: JSON.stringify({ model, messages, max_tokens: 1000, temperature: 0.7 }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  }

  private async callOpenAI(messages: LLMMessage[]): Promise<string | null> {
    const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    const endpoint = process.env.LLM_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: 500, temperature: 0.7 }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  }

  private async callGroq(messages: LLMMessage[]): Promise<string | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    const endpoint = process.env.GROQ_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.7 }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  }

  private async callGemini(messages: LLMMessage[]): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs = messages.filter(m => m.role !== 'system');
    const contents = systemMsg
      ? [{ role: 'user', parts: [{ text: `${systemMsg.content}\n\n${userMsgs.map(m => m.content).join('\n')}` }] }]
      : userMsgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  }

  private fallbackResponse(topic: string): string {
    return generateLocally(topic, 'informative');
  }
}

export const aiProviderManager = new AIProviderManager();
