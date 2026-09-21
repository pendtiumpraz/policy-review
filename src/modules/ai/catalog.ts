export type ProviderCode = 'openai' | 'anthropic' | 'google' | 'deepseek' | string;

export interface ProviderConfig {
  code: string;
  name: string;
  baseUrl: string;
}

export const PROVIDERS: ProviderConfig[] = [
  { code: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { code: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com' },
  { code: 'google', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com' },
  { code: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com' },
];

export function providerByCode(code: string) {
  return PROVIDERS.find((p) => p.code === code);
}
