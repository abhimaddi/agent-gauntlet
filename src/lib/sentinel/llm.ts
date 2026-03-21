import { clamp } from './utils';

export type LlmProvider = 'openai' | 'anthropic';

export interface LlmRuntimeConfig {
  provider: LlmProvider;
  model: string;
  temperature: number;
  apiKey: string;
}

const DEFAULT_TIMEOUT_MS = 12_000;
const OPENAI_DEFAULT_MAX_COMPLETION_TOKENS = 400;
const OPENAI_REASONING_MAX_COMPLETION_TOKENS = 900;

function isFixedTemperatureOpenAiModel(model: string): boolean {
  return /^gpt-5/i.test(model.trim());
}

function openAiReasoningEffort(model: string): 'minimal' | null {
  if (!isFixedTemperatureOpenAiModel(model)) {
    return null;
  }
  return 'minimal';
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))];
}

function getOpenAiModelCandidates(primary: string): string[] {
  return uniqueStrings([primary, 'gpt-4.1-mini', 'gpt-4o-mini']);
}

function getAnthropicModelCandidates(primary: string): string[] {
  return uniqueStrings([primary, 'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest']);
}

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
  let temperature = parseTemperature(params.temperatureEnv, params.fallbackTemp);
  if (provider === 'openai' && isFixedTemperatureOpenAiModel(model)) {
    temperature = 1;
  }

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
  const preferred = buildConfig({
    providerEnv: process.env.SENTINEL_RED_TEAM_PROVIDER,
    modelEnv: process.env.SENTINEL_RED_TEAM_MODEL,
    temperatureEnv: process.env.SENTINEL_RED_TEAM_TEMPERATURE,
    fallbackProvider: 'anthropic',
    fallbackModel: 'claude-sonnet-4-6',
    fallbackTemp: 0.7,
  });
  if (preferred) {
    return preferred;
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    return null;
  }

  return {
    provider: 'openai',
    model: (process.env.SENTINEL_RED_TEAM_OPENAI_MODEL?.trim() || 'gpt-5-mini').trim(),
    temperature: parseTemperature(process.env.SENTINEL_RED_TEAM_TEMPERATURE, 0.7),
    apiKey: openAiKey,
  };
}

async function callOpenAiJson<T>(
  config: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
): Promise<T | null> {
  const modelCandidates = getOpenAiModelCandidates(config.model);
  let lastError = '';
  for (const model of modelCandidates) {
    const reasoningEffort = openAiReasoningEffort(model);
    const attempts: Array<Record<string, unknown>> = [];
    if (reasoningEffort) {
      attempts.push({
        model,
        response_format: { type: 'json_object' },
        max_completion_tokens: OPENAI_REASONING_MAX_COMPLETION_TOKENS,
        reasoning_effort: reasoningEffort,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
    }
    attempts.push({
      model,
      temperature: config.temperature,
      response_format: { type: 'json_object' },
      max_completion_tokens: OPENAI_DEFAULT_MAX_COMPLETION_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    for (const payload of attempts) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        lastError = await response.text().catch(() => '');
        continue;
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        continue;
      }

      try {
        return JSON.parse(normalizeJsonText(content)) as T;
      } catch {
        // Try next payload format.
      }
    }
  }

  if (process.env.SENTINEL_LLM_DEBUG === '1' && lastError) {
    console.warn(`[sentinel][llm][openai] model=${config.model} body=${lastError.slice(0, 400)}`);
  }
  return null;
}

async function callAnthropicJson<T>(
  config: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
): Promise<T | null> {
  const modelCandidates = getAnthropicModelCandidates(config.model);
  let lastError = '';

  for (const model of modelCandidates) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        temperature: config.temperature,
        max_tokens: 400,
        system: `${systemPrompt}\nReturn JSON only.`,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal,
    });

    if (!response.ok) {
      lastError = await response.text().catch(() => '');
      continue;
    }

    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };

    const textBlock = data.content?.find((block) => block.type === 'text' && typeof block.text === 'string');
    if (!textBlock?.text) {
      continue;
    }

    try {
      return JSON.parse(normalizeJsonText(textBlock.text)) as T;
    } catch {
      // Try next model.
    }
  }

  if (process.env.SENTINEL_LLM_DEBUG === '1' && lastError) {
    console.warn(`[sentinel][llm][anthropic] model=${config.model} body=${lastError.slice(0, 400)}`);
  }
  return null;
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
