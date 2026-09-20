export type ProviderCode = 'openai' | 'anthropic' | 'google' | 'deepseek' | string;

export interface ProviderConfig {
  code: string;
  name: string;
  baseUrl: string;
  envKey: string; // process.env key for platform fallback key
}

export const PROVIDERS: ProviderConfig[] = [
  { code: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', envKey: 'OPENAI_API_KEY' },
  { code: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com', envKey: 'ANTHROPIC_API_KEY' },
  { code: 'google', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com', envKey: 'GOOGLE_GENAI_API_KEY' },
  { code: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', envKey: 'DEEPSEEK_API_KEY' },
];

export function providerByCode(code: string) {
  return PROVIDERS.find((p) => p.code === code);
}
