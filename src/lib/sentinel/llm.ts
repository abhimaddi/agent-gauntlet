import { clamp } from './utils';

export type LlmProvider = 'openai' | 'anthropic';

export interface LlmRuntimeConfig {
  provider: LlmProvider;
  model: string;
  temperature: number;
  apiKey: string;
}

const DEFAULT_TIMEOUT_MS = 12_000;

function parseProvider(value: string | undefined, fallback: LlmProvider): LlmProvider {
  if (value === 'openai' || value === 'anthropic') {
    return value;
  }
  return fallback;
}

function parseTemperature(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return clamp(parsed, 0, 1.5);
  }
  return fallback;
}

function normalizeJsonText(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  return fenced.trim();
}

function getKeyForProvider(provider: LlmProvider): string | null {
  if (provider === 'openai') {
    return process.env.OPENAI_API_KEY?.trim() || null;
  }
  return process.env.ANTHROPIC_API_KEY?.trim() || null;
}

function buildConfig(params: {
  providerEnv: string | undefined;
  modelEnv: string | undefined;
  temperatureEnv: string | undefined;
  fallbackProvider: LlmProvider;
  fallbackModel: string;
  fallbackTemp: number;
}): LlmRuntimeConfig | null {
  const provider = parseProvider(params.providerEnv, params.fallbackProvider);
  const model = (params.modelEnv?.trim() || params.fallbackModel).trim();
  const temperature = parseTemperature(params.temperatureEnv, params.fallbackTemp);

  const apiKey = getKeyForProvider(provider);
  if (!apiKey) {
    return null;
  }

  return {
    provider,
    model,
    temperature,
    apiKey,
  };
}

export function getTaskAgentLlmConfig(): LlmRuntimeConfig | null {
  return buildConfig({
    providerEnv: process.env.SENTINEL_TASK_AGENT_PROVIDER,
    modelEnv: process.env.SENTINEL_TASK_AGENT_MODEL,
    temperatureEnv: process.env.SENTINEL_TASK_AGENT_TEMPERATURE,
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-5-mini',
    fallbackTemp: 0.3,
  });
}

export function getRedTeamLlmConfig(): LlmRuntimeConfig | null {
  return buildConfig({
    providerEnv: process.env.SENTINEL_RED_TEAM_PROVIDER,
    modelEnv: process.env.SENTINEL_RED_TEAM_MODEL,
    temperatureEnv: process.env.SENTINEL_RED_TEAM_TEMPERATURE,
    fallbackProvider: 'anthropic',
    fallbackModel: 'claude-sonnet-4-6',
    fallbackTemp: 0.7,
  });
}

async function callOpenAiJson<T>(
  config: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
): Promise<T | null> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      response_format: { type: 'json_object' },
      max_completion_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(normalizeJsonText(content)) as T;
  } catch {
    return null;
  }
}

async function callAnthropicJson<T>(
  config: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
): Promise<T | null> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      max_tokens: 400,
      system: `${systemPrompt}\nReturn JSON only.`,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    signal,
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const textBlock = data.content?.find((block) => block.type === 'text' && typeof block.text === 'string');
  if (!textBlock?.text) {
    return null;
  }

  try {
    return JSON.parse(normalizeJsonText(textBlock.text)) as T;
  } catch {
    return null;
  }
}

export async function callLlmJson<T>(params: {
  config: LlmRuntimeConfig;
  systemPrompt: string;
  userPrompt: string;
  timeoutMs?: number;
}): Promise<T | null> {
  const timeoutMs = params.timeoutMs ?? Number(process.env.SENTINEL_LLM_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    if (params.config.provider === 'openai') {
      return await callOpenAiJson<T>(params.config, params.systemPrompt, params.userPrompt, controller.signal);
    }

    return await callAnthropicJson<T>(params.config, params.systemPrompt, params.userPrompt, controller.signal);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
