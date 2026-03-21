'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { SentinelHeader } from '@/components/sentinel-header';
import { formatDateTime, formatDuration } from '@/lib/sentinel/format';
import type { SentinelSession } from '@/lib/sentinel/types';

export function ReplayClient({ gameId }: { gameId: string }) {
  const [session, setSession] = useState<SentinelSession | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    void fetch(`/api/sentinel/${gameId}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload: { session: SentinelSession }) => {
        setSession(payload.session);
        setStepIndex(Math.max(0, payload.session.taskAgentSteps.length - 1));
      })
      .catch(() => setSession(null));
  }, [gameId]);

  const step = useMemo(() => {
    if (!session || session.taskAgentSteps.length === 0) {
      return null;
    }
    return session.taskAgentSteps[Math.min(stepIndex, session.taskAgentSteps.length - 1)];
  }, [session, stepIndex]);

  if (!session) {
    return (
      <main className="sentinel-shell">
        <SentinelHeader />
        <section className="card p-6">Loading replay...</section>
      </main>
    );
  }

  return (
    <main className="sentinel-shell">
      <SentinelHeader />

      <section className="card mb-4 p-4 fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Replay: {session.scenarioLabel}</h2>
            <p className="text-sm text-[var(--text-muted)]">
              {formatDateTime(session.startedAt)} • {formatDuration(session.durationSeconds)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/sentinel/${gameId}/export?format=json`} className="chip chip-accent">
              JSON
            </a>
            <a href={`/api/sentinel/${gameId}/export?format=csv`} className="chip chip-accent">
              CSV
            </a>
            <a href={`/api/sentinel/${gameId}/export?format=sharegpt`} className="chip chip-accent">
              ShareGPT JSONL
            </a>
            <Link href="/history" className="chip chip-accent">
              Back to history
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr] fade-in">
        <article className="card p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Screenshot timeline</p>
          {step?.screenshotUrl ? (
            <Image
              src={step.screenshotUrl}
              alt={`Step ${step.stepNumber} screenshot`}
              width={1360}
              height={900}
              unoptimized
              className="w-full rounded-lg border border-[var(--border)]"
            />
          ) : (
            <div className="grid h-80 place-items-center rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)]">
              No screenshot captured
            </div>
          )}

          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={Math.max(0, session.taskAgentSteps.length - 1)}
              value={Math.min(stepIndex, Math.max(0, session.taskAgentSteps.length - 1))}
              onChange={(event) => setStepIndex(Number(event.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Step {step?.stepNumber ?? 0}</span>
              <span>{session.taskAgentSteps.length} total steps</span>
            </div>
          </div>
        </article>

        <article className="card p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Step details</p>
          {step ? (
            <div className="space-y-2 text-sm">
              <InfoRow label="Action" value={step.actionName} />
              <InfoRow label="Summary" value={step.actionSummary} />
              <InfoRow label="Rationale" value={step.rationaleSummary} />
              <InfoRow label="Risk" value={String(step.riskScore)} />
              <InfoRow label="Progress" value={`${step.taskProgress}%`} />
              <InfoRow label="Unsafe action" value={String(step.unsafeAction)} />
              <InfoRow label="Unsafe reason" value={step.unsafeReason ?? 'None'} />
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No step data available.</p>
          )}

          <hr className="my-3 border-[var(--border)]" />
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Final metrics</p>
          <div className="space-y-1 text-sm">
            <InfoRow label="Verdict" value={session.finalVerdict} />
            <InfoRow label="Winner" value={session.winner} />
            <InfoRow label="Task completed" value={String(session.taskCompleted)} />
            <InfoRow label="Attack succeeded" value={String(session.attackSucceeded)} />
            <InfoRow label="Recovery" value={String(session.recoveryOccurred)} />
            <InfoRow label="Safety score" value={String(session.safetyScore)} />
          </div>
        </article>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 fade-in">
        <article className="card p-4">
          <h3 className="mb-2 text-lg font-semibold">Task-Agent steps</h3>
          <ul className="log-list space-y-2 text-sm">
            {session.taskAgentSteps.map((entry) => (
              <li key={entry.stepNumber} className="rounded-lg border border-[var(--border)]/70 bg-[var(--panel)]/70 p-2">
                <p className="text-xs text-[var(--text-muted)]">Step {entry.stepNumber}</p>
                <p>{entry.actionSummary}</p>
                <p className="text-xs text-[var(--text-muted)]">{entry.rationaleSummary}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="card p-4">
          <h3 className="mb-2 text-lg font-semibold">Red-Team actions</h3>
          <ul className="log-list space-y-2 text-sm">
            {session.redTeamActions.map((action) => (
              <li key={`${action.actionNumber}-${action.timestamp}`} className="rounded-lg border border-[var(--border)]/70 bg-[var(--panel)]/70 p-2">
                <p className="text-xs text-[var(--text-muted)]">Action {action.actionNumber}</p>
                <p>
                  {action.attackFamily} • {action.attackName}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{action.description}</p>
                <p className="text-xs text-[var(--text-muted)]">Judge: {action.judgeVerdict}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="min-w-[120px] text-[var(--text-muted)]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
