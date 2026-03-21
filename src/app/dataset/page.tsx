'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SentinelHeader } from '@/components/sentinel-header';
import type { SentinelSession, TaskAgentStep } from '@/lib/sentinel/types';

interface StepRow {
  gameId: string;
  scenario: string;
  difficulty: string;
  verdict: string;
  stepNumber: number;
  actionName: string;
  actionSummary: string;
  riskScore: number;
  attackFamily: string;
  timestamp: string;
}

export default function DatasetPage() {
  const [sessions, setSessions] = useState<SentinelSession[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void fetch('/api/sentinel/sessions', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload: { sessions: SentinelSession[] }) => setSessions(payload.sessions))
      .catch(() => setSessions([]));
  }, []);

  const rows = useMemo(() => {
    const flattened: StepRow[] = [];

    for (const session of sessions) {
      const dominantFamily = session.redTeamActions[0]?.attackFamily ?? 'none';
      for (const step of session.taskAgentSteps) {
        flattened.push(toRow(session, step, dominantFamily));
      }
    }

    if (!query.trim()) {
      return flattened;
    }

    const needle = query.trim().toLowerCase();
    return flattened.filter((row) => {
      const haystack = [
        row.gameId,
        row.scenario,
        row.difficulty,
        row.verdict,
        row.actionName,
        row.actionSummary,
        row.attackFamily,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [sessions, query]);

  return (
    <main className="sentinel-shell">
      <SentinelHeader />

      <section className="card mb-4 p-4 fade-in">
        <h2 className="mb-2 text-2xl font-semibold">Dataset Explorer</h2>
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          Search all logged episodes and step trajectories. Export to JSON, CSV, or ShareGPT JSONL for downstream training.
        </p>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by scenario, verdict, action, attack family..."
            className="w-full rounded-lg border bg-[var(--panel)] px-3 py-2 md:max-w-lg"
            style={{ borderColor: 'var(--border)' }}
          />

          <div className="flex flex-wrap gap-2">
            <Link href="/api/sentinel/export?format=json" className="chip chip-accent">
              Export JSON
            </Link>
            <Link href="/api/sentinel/export?format=csv" className="chip chip-accent">
              Export CSV
            </Link>
            <Link href="/api/sentinel/export?format=sharegpt" className="chip chip-accent">
              Export ShareGPT JSONL
            </Link>
          </div>
        </div>
      </section>

      <section className="card p-4 fade-in">
        <p className="mb-3 text-xs uppercase tracking-widest text-[var(--text-muted)]">Rows: {rows.length}</p>
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-[var(--panel)] text-xs uppercase tracking-widest text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2">Game</th>
                <th className="px-3 py-2">Scenario</th>
                <th className="px-3 py-2">Verdict</th>
                <th className="px-3 py-2">Step</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Risk</th>
                <th className="px-3 py-2">Attack Family</th>
                <th className="px-3 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.gameId}-${row.stepNumber}`} className="border-t border-[var(--border)]/50">
                  <td className="px-3 py-2 text-mono text-xs">{row.gameId}</td>
                  <td className="px-3 py-2">{row.scenario}</td>
                  <td className="px-3 py-2 text-mono">{row.verdict}</td>
                  <td className="px-3 py-2">{row.stepNumber}</td>
                  <td className="px-3 py-2">{row.actionSummary}</td>
                  <td className="px-3 py-2">{row.riskScore}</td>
                  <td className="px-3 py-2">{row.attackFamily}</td>
                  <td className="px-3 py-2">{new Date(row.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function toRow(session: SentinelSession, step: TaskAgentStep, family: string): StepRow {
  return {
    gameId: session.gameId,
    scenario: session.scenarioLabel,
    difficulty: session.difficulty,
    verdict: session.finalVerdict,
    stepNumber: step.stepNumber,
    actionName: step.actionName,
    actionSummary: step.actionSummary,
    riskScore: step.riskScore,
    attackFamily: family,
    timestamp: step.timestamp,
  };
}
