'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SentinelHeader } from '@/components/sentinel-header';
import { DIFFICULTY_OPTIONS, RED_TEAM_OPTIONS, TASK_AGENT_OPTIONS } from '@/lib/sentinel/constants';
import { formatPercent } from '@/lib/sentinel/format';
import { LIVE_WEB_PRESETS } from '@/lib/sentinel/live-web-presets';
import { SCENARIOS } from '@/lib/sentinel/scenarios';
import type { Difficulty, RedTeamType, ScenarioId, TaskAgentType } from '@/lib/sentinel/types';

interface Metrics {
  totalEpisodes: number;
  safeCompletionRate: number;
  attackSuccessRate: number;
  recoveryRate: number;
}

const defaultMetrics: Metrics = {
  totalEpisodes: 0,
  safeCompletionRate: 0,
  attackSuccessRate: 0,
  recoveryRate: 0,
};

export default function LobbyPage() {
  const router = useRouter();
  const [scenarioId, setScenarioId] = useState<ScenarioId>('live-web');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [taskAgentType, setTaskAgentType] = useState<TaskAgentType>('llm-policy');
  const [redTeamType, setRedTeamType] = useState<RedTeamType>('llm-red-team');
  const [livePresetId, setLivePresetId] = useState<string>(LIVE_WEB_PRESETS[0]?.id ?? 'custom');
  const [targetUrl, setTargetUrl] = useState(LIVE_WEB_PRESETS[0]?.url ?? 'https://example.com');
  const [customTask, setCustomTask] = useState(
    LIVE_WEB_PRESETS[0]?.task ?? 'Find the main topic of this page and summarize it safely.',
  );
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>(defaultMetrics);

  useEffect(() => {
    void fetch('/api/sentinel/metrics')
      .then((response) => response.json())
      .then((payload: Metrics) => setMetrics(payload))
      .catch(() => setMetrics(defaultMetrics));
  }, []);

  useEffect(() => {
    if (scenarioId !== 'live-web') {
      return;
    }
    const preset = LIVE_WEB_PRESETS.find((entry) => entry.id === livePresetId);
    if (!preset) {
      return;
    }
    setTargetUrl(preset.url);
    setCustomTask(preset.task);
  }, [livePresetId, scenarioId]);

  async function startSimulation() {
    setStartError(null);
    setStarting(true);
    try {
      if (scenarioId === 'live-web' && !/^https?:\/\//i.test(targetUrl.trim())) {
        setStartError('Live Web mode requires a valid http(s) URL.');
        return;
      }

      const response = await fetch('/api/sentinel/start', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId,
          difficulty,
          taskAgentType,
          redTeamType,
          ...(scenarioId === 'live-web'
            ? {
              targetUrl: targetUrl.trim(),
              customTask: customTask.trim(),
            }
            : {}),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: 'Failed to start simulation' }))) as { error?: string };
        throw new Error(payload.error || 'Failed to start simulation');
      }

      const payload = (await response.json()) as { gameId: string };
      router.push(`/arena/${payload.gameId}`);
    } catch (error) {
      setStartError((error as Error).message);
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="sentinel-shell">
      <SentinelHeader />

      <section className="card mb-6 px-5 py-5 md:px-6 md:py-6 fade-in">
        <p className="chip chip-accent mb-3">Sentinel Arena</p>
        <h2 className="mb-2 text-4xl font-semibold tracking-tight title-glow">Adversarial evaluation harness for browser agents</h2>
        <p className="max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
          Local-first benchmark where a Task Agent navigates synthetic web tasks while a Red-Team Agent launches prompt injection and deceptive UI attacks.
          Every run produces structured benchmark and training data.
        </p>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4 fade-in">
        <MetricCard label="Total Episodes" value={String(metrics.totalEpisodes)} accent="var(--accent)" />
        <MetricCard label="Safe Completion Rate" value={formatPercent(metrics.safeCompletionRate)} accent="var(--task)" />
        <MetricCard label="Attack Success Rate" value={formatPercent(metrics.attackSuccessRate)} accent="var(--red)" />
        <MetricCard label="Recovery Rate" value={formatPercent(metrics.recoveryRate)} accent="var(--ok)" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3 fade-in">
        {SCENARIOS.map((scenario) => {
          const selected = scenario.id === scenarioId;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setScenarioId(scenario.id)}
              className="card text-left p-4 transition duration-300"
              style={{
                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                background: selected ? 'rgba(103, 181, 255, 0.1)' : 'var(--card)',
              }}
            >
              <p className="mb-2 text-sm text-[var(--accent)]">{scenario.label}</p>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">{scenario.description}</h3>
              <p className="text-sm text-[var(--text-muted)]">{scenario.successHint}</p>
            </button>
          );
        })}
      </section>

      <section className="card mb-6 px-5 py-5 md:px-6 md:py-6 fade-in">
        <h3 className="mb-4 text-xl font-semibold">Simulation Controls</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectCard<Difficulty>
            label="Difficulty"
            value={difficulty}
            onChange={setDifficulty}
            options={DIFFICULTY_OPTIONS}
          />
          <SelectCard<TaskAgentType>
            label="Task-Agent Policy"
            value={taskAgentType}
            onChange={setTaskAgentType}
            options={TASK_AGENT_OPTIONS}
          />
          <SelectCard<RedTeamType>
            label="Red-Team Policy"
            value={redTeamType}
            onChange={setRedTeamType}
            options={RED_TEAM_OPTIONS}
          />
        </div>

        {scenarioId === 'live-web' ? (
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="card p-4">
              <label className="mb-2 block text-xs uppercase tracking-widest text-[var(--text-muted)]">Live Site Preset</label>
              <select
                value={livePresetId}
                onChange={(event) => setLivePresetId(event.target.value)}
                className="w-full rounded-lg border bg-[var(--panel)] px-3 py-2"
                style={{ borderColor: 'var(--border)' }}
              >
                {LIVE_WEB_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
                <option value="custom">Custom URL + Task</option>
              </select>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Preset family: Amazon, Google Flights, and TechCrunch.
              </p>
            </div>

            <div className="card p-4">
              <label className="mb-2 block text-xs uppercase tracking-widest text-[var(--text-muted)]">Live Target URL</label>
              <input
                type="url"
                value={targetUrl}
                onChange={(event) => {
                  setLivePresetId('custom');
                  setTargetUrl(event.target.value);
                }}
                className="w-full rounded-lg border bg-[var(--panel)] px-3 py-2"
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://example.com"
              />
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Experimental mode. Prefer read-only sites and avoid auth/checkout flows.
              </p>
            </div>

            <div className="card p-4">
              <label className="mb-2 block text-xs uppercase tracking-widest text-[var(--text-muted)]">Live Task</label>
              <textarea
                value={customTask}
                onChange={(event) => {
                  setLivePresetId('custom');
                  setCustomTask(event.target.value);
                }}
                rows={3}
                className="w-full rounded-lg border bg-[var(--panel)] px-3 py-2"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={starting}
            onClick={startSimulation}
            className="rounded-xl border px-4 py-2 font-medium transition"
            style={{
              borderColor: 'var(--accent)',
              background: 'linear-gradient(120deg, rgba(103, 181, 255, 0.28), rgba(77, 217, 172, 0.22))',
              color: '#ecf7ff',
              opacity: starting ? 0.7 : 1,
            }}
          >
            {starting ? 'Launching simulation...' : 'Start Simulation'}
          </button>

          <button
            type="button"
            onClick={async () => {
              setStarting(true);
              await fetch('/api/sentinel/seed', { method: 'POST' }).catch(() => undefined);
              setStarting(false);
            }}
            className="rounded-xl border px-4 py-2 font-medium text-sm transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Generate Sample Seed Runs
          </button>
        </div>

        {startError ? (
          <p className="mt-3 text-sm text-[var(--red)]">{startError}</p>
        ) : null}
      </section>
    </main>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="card p-4">
      <p className="mb-1 text-sm text-[var(--text-muted)]">{label}</p>
      <p className="metric-value" style={{ color: accent }}>
        {value}
      </p>
    </article>
  );
}

function SelectCard<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; detail: string }>;
}) {
  const active = options.find((option) => option.value === value);

  return (
    <div className="card p-4">
      <label className="mb-2 block text-xs uppercase tracking-widest text-[var(--text-muted)]">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-lg border bg-[var(--panel)] px-3 py-2"
        style={{ borderColor: 'var(--border)' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{active?.detail}</p>
    </div>
  );
}
