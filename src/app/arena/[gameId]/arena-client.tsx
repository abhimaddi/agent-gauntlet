'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { SentinelHeader } from '@/components/sentinel-header';
import { formatDateTime, formatDuration } from '@/lib/sentinel/format';
import { VERDICT_COLORS } from '@/lib/sentinel/constants';
import type { SentinelSession } from '@/lib/sentinel/types';

export function ArenaClient({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<SentinelSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const didRouteToFinish = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const response = await fetch(`/api/sentinel/${gameId}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load session');
        }

        const payload = (await response.json()) as { session: SentinelSession };
        if (cancelled) {
          return;
        }

        setSession(payload.session);
        setError(null);

        const finished = Boolean(payload.session.endedAt);
        if (!finished) {
          timer = setTimeout(poll, 1_000);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError((fetchError as Error).message);
          timer = setTimeout(poll, 1_500);
        }
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [gameId]);

  const latestStep = useMemo(() => {
    if (!session || session.taskAgentSteps.length === 0) {
      return null;
    }
    return session.taskAgentSteps[session.taskAgentSteps.length - 1];
  }, [session]);

  const promptHealth = useMemo(() => {
    if (!session || typeof session.promptHealth !== 'number') {
      return 100;
    }
    return Math.max(0, Math.min(100, session.promptHealth));
  }, [session]);
  const { ghostHealth, healthPalette, healthColor, isLow, isCritical, shaking, damagePulseKey } =
    usePromptHealthBar(promptHealth);
  const healthBarStyle = {
    '--health-fill-start': healthPalette.fillStart,
    '--health-fill-mid': healthPalette.fillMid,
    '--health-fill-end': healthPalette.fillEnd,
    '--health-glow': healthPalette.glow,
    '--health-trail-start': healthPalette.trailStart,
    '--health-trail-end': healthPalette.trailEnd,
    '--health-trail-glow': healthPalette.trailGlow,
    '--health-pulse': healthPalette.pulse,
    '--health-pulse-soft': healthPalette.pulseSoft,
  } as CSSProperties;

  useEffect(() => {
    if (!session?.endedAt || didRouteToFinish.current) {
      return;
    }

    didRouteToFinish.current = true;
    const timer = setTimeout(() => {
      router.push(`/finish/${gameId}`);
    }, 1_100);

    return () => {
      clearTimeout(timer);
    };
  }, [session?.endedAt, gameId, router]);

  if (error) {
    return (
      <main className="sentinel-shell">
        <SentinelHeader />
        <section className="card p-6">
          <p className="text-sm text-[var(--red)]">{error}</p>
          <Link href="/" className="mt-3 inline-block text-sm text-[var(--accent)]">
            Return to lobby
          </Link>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="sentinel-shell">
        <SentinelHeader />
        <section className="card p-6 text-sm text-[var(--text-muted)]">Loading arena...</section>
      </main>
    );
  }

  return (
    <main className="sentinel-shell">
      <SentinelHeader />

      <section className="card mb-4 p-3 md:p-4 fade-in">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Task Prompt Health</p>
          <div className="text-right">
            <p
              className={`arena-health-value text-mono text-xs font-semibold ${
                isLow ? 'is-low' : ''
              } ${isCritical ? 'is-critical' : ''}`}
              style={{ color: healthColor }}
            >
              {Math.round(promptHealth)}%
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              Last change{' '}
              {latestStep && typeof latestStep.promptHealthDelta === 'number'
                ? formatDeltaPercent(latestStep.promptHealthDelta)
                : '0%'}
            </p>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Task prompt health"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(promptHealth)}
          className={`arena-health-bar ${shaking ? 'is-hit' : ''} ${isLow ? 'is-low' : ''} ${
            isCritical ? 'is-critical' : ''
          }`}
          style={healthBarStyle}
        >
          {[25, 50, 75].map((mark) => (
            <span
              key={mark}
              className="arena-health-mark"
              style={{ left: `${mark}%` }}
            />
          ))}

          {ghostHealth > promptHealth ? (
            <span
              className="arena-health-ghost"
              style={{ width: `${ghostHealth}%` }}
            />
          ) : null}

          <span
            className="arena-health-fill"
            style={{ width: `${promptHealth}%` }}
          />
          {damagePulseKey > 0 ? <span key={damagePulseKey} className="arena-health-hit" /> : null}
          <span className="arena-health-frame" />
        </div>
      </section>

      <section className="card mb-4 p-4 md:p-5 fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Game {session.gameId}</p>
            <h2 className="text-2xl font-semibold">{session.scenarioLabel}</h2>
            <p className="text-sm text-[var(--text-muted)]">
              {session.task} • Started {formatDateTime(session.startedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="chip chip-task">Task Agent: {session.taskAgentType}</span>
            <span className="chip chip-red">Red-Team Agent: {session.redTeamType}</span>
            <span className="chip chip-accent">Step {session.currentStep}</span>
            <span
              className="chip"
              style={{
                color: VERDICT_COLORS[session.finalVerdict] ?? 'var(--accent)',
                borderColor: `${VERDICT_COLORS[session.finalVerdict] ?? 'var(--accent)'}66`,
                background: `${VERDICT_COLORS[session.finalVerdict] ?? 'var(--accent)'}20`,
              }}
            >
              {session.endedAt ? session.finalVerdict : 'RUNNING'}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr] fade-in">
        <article className="card p-3 md:p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Live Browser Viewport</p>
          {session.latestScreenshotUrl ? (
            <Image
              key={session.latestScreenshotUrl}
              src={session.latestScreenshotUrl}
              alt="Latest arena screenshot"
              width={1360}
              height={900}
              unoptimized
              className="w-full rounded-lg border border-[var(--border)] object-cover transition duration-300"
            />
          ) : (
            <div className="grid h-[360px] place-items-center rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)]">
              Waiting for first screenshot...
            </div>
          )}
        </article>

        <article className="card p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Live Match State</p>
          <div className="mb-4 space-y-2 text-sm">
            <StateRow label="Current task" value={session.task} />
            <StateRow label="Current red-team attack" value={session.activeAttackName ?? 'None'} />
            <StateRow label="Risk score" value={latestStep ? String(latestStep.riskScore) : 'N/A'} />
            <StateRow label="Task progress" value={latestStep ? `${latestStep.taskProgress}%` : '0%'} />
            <StateRow label="Safety score" value={`${session.safetyScore}`} />
            <StateRow label="Duration" value={formatDuration(session.durationSeconds)} />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
            <StatusBox label="Task Agent" value={session.currentTaskAgentStatus} color="var(--task)" />
            <StatusBox label="Red-Team" value={session.currentRedTeamStatus} color="var(--red)" />
            <StatusBox label="Task Completed" value={String(session.taskCompleted)} color="var(--ok)" />
            <StatusBox label="Attack Succeeded" value={String(session.attackSucceeded)} color="var(--warning)" />
          </div>

          <h3 className="mb-2 text-sm font-semibold">Step Timeline</h3>
          <ol className="max-h-[260px] space-y-2 overflow-auto pr-1 text-sm">
            {session.taskAgentSteps.map((step) => (
              <li key={step.stepNumber} className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/70 p-2">
                <p className="text-xs text-[var(--text-muted)]">Step {step.stepNumber}</p>
                <p className="font-medium">{step.actionSummary}</p>
                <p className="text-xs text-[var(--text-muted)]">{step.rationaleSummary}</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Prompt Health {typeof step.promptHealth === 'number' ? step.promptHealth : promptHealth}% (
                  {typeof step.promptHealthDelta === 'number' ? formatDeltaPercent(step.promptHealthDelta) : '0%'})
                </p>
              </li>
            ))}
          </ol>

          <h3 className="mb-2 mt-4 text-sm font-semibold">Red-Team Timeline</h3>
          <ol className="max-h-[220px] space-y-2 overflow-auto pr-1 text-sm">
            {session.redTeamActions.length === 0 ? (
              <li className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/70 p-2 text-xs text-[var(--text-muted)]">
                No red-team action recorded yet.
              </li>
            ) : (
              session.redTeamActions.map((action) => (
                <li
                  key={`${action.actionNumber}-${action.timestamp}`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/70 p-2"
                >
                  <p className="text-xs text-[var(--text-muted)]">Attack {action.actionNumber}</p>
                  <p className="font-medium">
                    {action.attackFamily} • {action.attackName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{action.description}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    success={String(action.success)} judge={action.judgeVerdict}
                  </p>
                </li>
              ))
            )}
          </ol>
        </article>
      </section>

      <section className="card mt-4 p-4 fade-in">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold">Event Log & Structured Rationale</h3>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/sentinel/${gameId}/export?format=json`} className="chip chip-accent">
              Export JSON
            </a>
            <a href={`/api/sentinel/${gameId}/export?format=csv`} className="chip chip-accent">
              Export CSV
            </a>
            <a href={`/api/sentinel/${gameId}/export?format=sharegpt`} className="chip chip-accent">
              Export ShareGPT JSONL
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/70 p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Events</p>
            <ul className="log-list space-y-2 text-sm">
              {session.eventsLog.map((event) => (
                <li key={event.id} className="rounded-md border border-[var(--border)]/60 p-2">
                  <p className="text-xs text-[var(--text-muted)]">{formatDateTime(event.timestamp)}</p>
                  <p>{event.message}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/70 p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Task-Agent rationale summary</p>
            <ul className="log-list space-y-2 text-sm">
              {session.taskAgentSteps.map((step) => (
                <li key={`rationale-${step.stepNumber}`} className="rounded-md border border-[var(--border)]/60 p-2">
                  <p className="text-xs text-[var(--text-muted)]">Step {step.stepNumber}</p>
                  <p>{step.rationaleSummary}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function StatusBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border p-2" style={{ borderColor: `${color}66`, background: `${color}15` }}>
      <p className="text-[10px] uppercase tracking-widest" style={{ color }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

type PromptHealthPalette = {
  label: string;
  fillStart: string;
  fillMid: string;
  fillEnd: string;
  glow: string;
  trailStart: string;
  trailEnd: string;
  trailGlow: string;
  pulse: string;
  pulseSoft: string;
};

function usePromptHealthBar(health: number) {
  const [ghostHealth, setGhostHealth] = useState(health);
  const [shaking, setShaking] = useState(false);
  const [damagePulseKey, setDamagePulseKey] = useState(0);
  const previous = useRef(health);
  const ghostTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (ghostTimer.current) {
      clearTimeout(ghostTimer.current);
      ghostTimer.current = null;
    }

    if (health >= previous.current) {
      previous.current = health;
      const syncFrame = requestAnimationFrame(() => {
        if (!cancelled) {
          setGhostHealth(health);
        }
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(syncFrame);
      };
    }

    previous.current = health;
    const shakeFrame = requestAnimationFrame(() => {
      if (!cancelled) {
        setDamagePulseKey((value) => value + 1);
        setShaking(true);
      }
    });
    const shakeTimer = setTimeout(() => {
      if (!cancelled) {
        setShaking(false);
      }
    }, 240);
    ghostTimer.current = setTimeout(() => {
      if (!cancelled) {
        setGhostHealth(health);
      }
      ghostTimer.current = null;
    }, 180);

    return () => {
      cancelled = true;
      cancelAnimationFrame(shakeFrame);
      clearTimeout(shakeTimer);
      if (ghostTimer.current) {
        clearTimeout(ghostTimer.current);
        ghostTimer.current = null;
      }
    };
  }, [health]);

  const healthPalette = getPromptHealthPalette(health);
  const healthColor = healthPalette.label;
  const isLow = health <= 40;
  const isCritical = health <= 25;

  return { ghostHealth, healthPalette, healthColor, isLow, isCritical, shaking, damagePulseKey };
}

function getPromptHealthPalette(health: number): PromptHealthPalette {
  if (health >= 100) {
    return {
      label: '#72ff7f',
      fillStart: '#baff9a',
      fillMid: '#72ff7f',
      fillEnd: '#20d95a',
      glow: 'rgba(114, 255, 127, 0.34)',
      trailStart: 'rgba(154, 255, 164, 0.32)',
      trailEnd: 'rgba(114, 255, 127, 0.68)',
      trailGlow: 'rgba(114, 255, 127, 0.22)',
      pulse: 'rgba(191, 255, 154, 0.72)',
      pulseSoft: 'rgba(236, 255, 227, 0.34)',
    };
  }

  if (health > 60) {
    return {
      label: '#58f06d',
      fillStart: '#9dff81',
      fillMid: '#58f06d',
      fillEnd: '#1cb851',
      glow: 'rgba(88, 240, 109, 0.32)',
      trailStart: 'rgba(140, 255, 154, 0.34)',
      trailEnd: 'rgba(88, 240, 109, 0.68)',
      trailGlow: 'rgba(88, 240, 109, 0.22)',
      pulse: 'rgba(178, 255, 161, 0.7)',
      pulseSoft: 'rgba(233, 255, 228, 0.32)',
    };
  }

  if (health > 30) {
    return {
      label: '#ffe600',
      fillStart: '#fff8a8',
      fillMid: '#ffe600',
      fillEnd: '#ffb300',
      glow: 'rgba(255, 230, 0, 0.32)',
      trailStart: 'rgba(255, 241, 107, 0.34)',
      trailEnd: 'rgba(255, 230, 0, 0.7)',
      trailGlow: 'rgba(255, 230, 0, 0.22)',
      pulse: 'rgba(255, 243, 140, 0.74)',
      pulseSoft: 'rgba(255, 250, 214, 0.34)',
    };
  }

  return {
    label: '#ff3366',
    fillStart: '#ff8ba7',
    fillMid: '#ff3366',
    fillEnd: '#c2003f',
    glow: 'rgba(255, 51, 102, 0.36)',
    trailStart: 'rgba(255, 142, 170, 0.36)',
    trailEnd: 'rgba(255, 51, 102, 0.74)',
    trailGlow: 'rgba(255, 51, 102, 0.26)',
    pulse: 'rgba(255, 158, 185, 0.78)',
    pulseSoft: 'rgba(255, 224, 233, 0.36)',
  };
}

function formatDeltaPercent(value: number): string {
  return `${Math.trunc(value)}%`;
}
