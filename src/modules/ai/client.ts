import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

export interface AiRequest {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface AiResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Provider-agnostic chat. Supports OpenAI-compatible (openai/deepseek),
 * Anthropic, and Google Gemini. Always returns text + token usage.
 */
export async function chat(r: AiRequest, systemPrompt: string, userPrompt: string, maxTokens = 4000): Promise<AiResult> {
  if (r.provider === 'anthropic') return chatAnthropic(r, systemPrompt, userPrompt, maxTokens);
  if (r.provider === 'google') return chatGoogle(r, systemPrompt, userPrompt, maxTokens);
  return chatOpenAiCompatible(r, systemPrompt, userPrompt, maxTokens);
}

async function chatOpenAiCompatible(r: AiRequest, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<AiResult> {
  const client = new OpenAI({
    apiKey: r.apiKey,
    baseURL: r.baseUrl || undefined,
  });
  const res = await client.chat.completions.create({
    model: r.model,
    max_tokens: maxTokens,
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  const text = res.choices[0]?.message?.content || '';
  return {
    text,
    inputTokens: res.usage?.prompt_tokens ?? Math.ceil((systemPrompt.length + userPrompt.length) / 4),
    outputTokens: res.usage?.completion_tokens ?? Math.ceil(text.length / 4),
  };
}

async function chatAnthropic(r: AiRequest, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<AiResult> {
  const client = new Anthropic({ apiKey: r.apiKey, baseURL: r.baseUrl || undefined });
  const res = await client.messages.create({
    model: r.model,
    max_tokens: maxTokens,
    temperature: 0.2,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const text = res.content
    .map((b) => (b.type === 'text' ? (b as { text?: string }).text || '' : ''))
    .join('');
  return {
    text,
    inputTokens: res.usage?.input_tokens ?? Math.ceil((systemPrompt.length + userPrompt.length) / 4),
    outputTokens: res.usage?.output_tokens ?? Math.ceil(text.length / 4),
  };
}

async function chatGoogle(r: AiRequest, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<AiResult> {
  const client = new GoogleGenAI({ apiKey: r.apiKey });
  const res = await client.models.generateContent({
    model: r.model,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: maxTokens,
      temperature: 0.2,
    },
    contents: userPrompt,
  });
  const text = res.text ?? '';
  const usage = res.usageMetadata;
  return {
    text,
    inputTokens: usage?.promptTokenCount ?? Math.ceil((systemPrompt.length + userPrompt.length) / 4),
    outputTokens: usage?.candidatesTokenCount ?? Math.ceil(text.length / 4),
  };
}
