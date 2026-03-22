'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentDuel } from '@/components/agent-duel';
import { SentinelHeader } from '@/components/sentinel-header';
import { DIFFICULTY_OPTIONS, RED_TEAM_OPTIONS, TASK_AGENT_OPTIONS } from '@/lib/sentinel/constants';
import { LIVE_WEB_PRESETS } from '@/lib/sentinel/live-web-presets';
import type { Difficulty, RedTeamType, TaskAgentType } from '@/lib/sentinel/types';

const ATTACK_FAMILIES = [
  {
    label: 'Prompt Injection',
    detail: 'Override attempts aimed at bending the task contract.',
    baseStrength: 78,
    tone: 'red' as const,
  },
  {
    label: 'UI Deception',
    detail: 'Fake trust signals, misleading labels, and deceptive calls-to-action.',
    baseStrength: 56,
    tone: 'gold' as const,
  },
  {
    label: 'Task Diversion',
    detail: 'Detours that waste steps or lure the agent off the requested path.',
    baseStrength: 44,
    tone: 'gold' as const,
  },
  {
    label: 'Data Exfil Bait',
    detail: 'Irrelevant prompts for sensitive or unnecessary content.',
    baseStrength: 33,
    tone: 'red' as const,
  },
];

export default function LobbyPage() {
  const router = useRouter();
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

  useEffect(() => {
    const preset = LIVE_WEB_PRESETS.find((entry) => entry.id === livePresetId);
    if (!preset) {
      return;
    }
    setTargetUrl(preset.url);
    setCustomTask(preset.task);
  }, [livePresetId]);

  async function startSimulation() {
    setStartError(null);
    setStarting(true);
    try {
      if (!/^https?:\/\//i.test(targetUrl.trim())) {
        setStartError('Live Web mode requires a valid http(s) URL.');
        return;
      }

      const response = await fetch('/api/sentinel/start', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: 'live-web',
          difficulty,
          taskAgentType,
          redTeamType,
          targetUrl: targetUrl.trim(),
          customTask: customTask.trim(),
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

  const selectedPreset = LIVE_WEB_PRESETS.find((entry) => entry.id === livePresetId);
  const difficultyOption = DIFFICULTY_OPTIONS.find((option) => option.value === difficulty);
  const taskAgentOption = TASK_AGENT_OPTIONS.find((option) => option.value === taskAgentType);
  const redTeamOption = RED_TEAM_OPTIONS.find((option) => option.value === redTeamType);

  return (
    <main className="sentinel-shell lobby-shell">
      <SentinelHeader />

      <section className="ag-hero lobby-hero fade-in">
        <div className="hero-glow" />

        <div className="lobby-hero-copy">
          <p className="hero-kicker">Frontier Browser Agent Showdown</p>
          <h1 className="hero-title">
            AGENT <span>GAUNTLET</span>
          </h1>
          <p className="hero-sub">Adversarial evaluation harness for live browser agents.</p>
          <p className="hero-deck">
            Stress-test a sheriff-style browser agent against an outlaw red team on real websites. Set the contract, draw the
            matchup, and launch straight into the arena.
          </p>

          <div className="hero-cta-row">
            <a href="#duel-setup" className="hero-cta">
              Prepare the Duel
            </a>
            <Link href="/history" className="hero-secondary-link">
              Review Match History
            </Link>
          </div>
        </div>

        <div className="lobby-hero-stage">
          <AgentDuel taskAgentType={taskAgentType} redTeamType={redTeamType} />
        </div>
      </section>

      <section id="duel-setup" className="card lobby-setup-board fade-in">
        <div className="lobby-setup-head">
          <p className="setup-kicker">Duel Setup Board</p>
          <h2 className="setup-title">One contract. One sheriff. One outlaw.</h2>
          <p className="setup-copy">Everything needed to launch the live web duel sits in this board. Advanced settings can land here later.</p>
        </div>

        <div className="lobby-setup-grid">
          <section className="card lobby-panel lobby-panel-contract">
            <PanelHeader
              title="Scenario / Contract"
              description="Pick the target site and define the exact objective the sheriff has to complete."
            />

            <div className="lobby-field-grid">
              <div className="lobby-field">
                <label className="lobby-field-label" htmlFor="live-preset">
                  Live Site Preset
                </label>
                <select
                  id="live-preset"
                  value={livePresetId}
                  onChange={(event) => setLivePresetId(event.target.value)}
                  className="lobby-field-control"
                >
                  {LIVE_WEB_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                  <option value="custom">Custom URL + Task</option>
                </select>
                <p className="lobby-field-copy">
                  {selectedPreset ? 'Loads a ready-made target and contract that you can edit before launch.' : 'Point the duel at any read-only site and write the contract yourself.'}
                </p>
              </div>

              <div className="lobby-field">
                <label className="lobby-field-label" htmlFor="target-url">
                  Live Target URL
                </label>
                <input
                  id="target-url"
                  type="url"
                  value={targetUrl}
                  onChange={(event) => {
                    setLivePresetId('custom');
                    setTargetUrl(event.target.value);
                  }}
                  className="lobby-field-control"
                  placeholder="https://example.com"
                />
                <p className="lobby-field-copy">Use read-only targets and avoid auth, account, or checkout flows.</p>
              </div>
            </div>

            <div className="lobby-field">
              <label className="lobby-field-label" htmlFor="task-instructions">
                Task Instructions
              </label>
              <textarea
                id="task-instructions"
                value={customTask}
                onChange={(event) => {
                  setLivePresetId('custom');
                  setCustomTask(event.target.value);
                }}
                rows={4}
                className="lobby-field-control lobby-field-textarea"
              />
              <p className="lobby-field-copy">This contract is sent directly to the task agent when the duel starts.</p>
            </div>
          </section>

          <section className="card lobby-panel">
            <PanelHeader
              title="Policies"
              description="Choose how the sheriff reasons about risk and how the outlaw applies pressure."
            />

            <SelectField<TaskAgentType>
              id="task-agent-policy"
              label="Task Agent Policy"
              value={taskAgentType}
              onChange={setTaskAgentType}
              options={TASK_AGENT_OPTIONS}
            />

            <SelectField<RedTeamType>
              id="red-team-policy"
              label="Red-Team Policy"
              value={redTeamType}
              onChange={setRedTeamType}
              options={RED_TEAM_OPTIONS}
            />

            <div className="lobby-panel-note">
              <span className="lobby-panel-note-label">Matchup</span>
              <p className="lobby-panel-note-copy">
                {taskAgentOption?.label ?? 'Task Agent'} stays on-contract while {redTeamOption?.label ?? 'Red-Team'} hunts for
                openings to divert, deceive, or override intent.
              </p>
            </div>
          </section>

          <section className="card lobby-panel">
            <PanelHeader
              title="Attack Profile / Difficulty"
              description="Set the pressure level and inspect the attack families likely to define the match."
            />

            <SelectField<Difficulty>
              id="difficulty"
              label="Difficulty"
              value={difficulty}
              onChange={setDifficulty}
              options={DIFFICULTY_OPTIONS}
            />

            <div className="attack-family-grid">
              {ATTACK_FAMILIES.map((family) => (
                <AttackFamilyCard
                  key={family.label}
                  label={family.label}
                  detail={family.detail}
                  strength={scaleAttackStrength(family.baseStrength, difficulty)}
                  tone={family.tone}
                />
              ))}
            </div>

            <div className="lobby-panel-note">
              <span className="lobby-panel-note-label">Pressure</span>
              <p className="lobby-panel-note-copy">{difficultyOption?.detail ?? 'Balanced pressure with deceptive UI variants.'}</p>
            </div>
          </section>
        </div>

        <div className="lobby-launch-strip">
          <div className="lobby-launch-action">
            <p className="launch-kicker">Ready to draw</p>
            <button
              type="button"
              disabled={starting}
              onClick={startSimulation}
              className="startbtn lobby-startbtn"
              style={{ opacity: starting ? 0.72 : 1 }}
            >
              {starting ? '▶ Launching Simulation...' : '▶ Start Simulation'}
            </button>
            <p className="launch-copy">
              Launches the live web duel for {formatTargetLabel(targetUrl)} with {taskAgentOption?.label ?? taskAgentType} versus{' '}
              {redTeamOption?.label ?? redTeamType}.
            </p>
            {startError ? <p className="lobby-start-error">{startError}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="lobby-panel-header">
      <h3 className="lobby-panel-title">{title}</h3>
      <p className="lobby-panel-copy">{description}</p>
    </div>
  );
}

function AttackFamilyCard({
  label,
  detail,
  strength,
  tone,
}: {
  label: string;
  detail: string;
  strength: number;
  tone: 'gold' | 'red';
}) {
  return (
    <article className={`attack-family-card ${tone === 'red' ? 'is-red' : 'is-gold'}`}>
      <div className="attack-family-head">
        <p className="attack-family-title">{label}</p>
        <span className="attack-family-strength">{strength}%</span>
      </div>
      <p className="attack-family-copy">{detail}</p>
      <div className="attack-family-bar">
        <div className="attack-family-fill" style={{ width: `${strength}%` }} />
      </div>
    </article>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; detail: string }>;
}) {
  const active = options.find((option) => option.value === value);

  return (
    <div className="lobby-field">
      <label className="lobby-field-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)} className="lobby-field-control">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="lobby-field-copy">{active?.detail}</p>
    </div>
  );
}

function formatTargetLabel(targetUrl: string) {
  try {
    const url = new URL(targetUrl);
    return url.host.replace(/^www\./i, '');
  } catch {
    return targetUrl.trim() || 'Custom URL';
  }
}

function scaleAttackStrength(baseStrength: number, difficulty: Difficulty) {
  const multiplier = difficulty === 'easy' ? 0.82 : difficulty === 'hard' ? 1.18 : 1;
  return Math.max(18, Math.min(96, Math.round(baseStrength * multiplier)));
}
