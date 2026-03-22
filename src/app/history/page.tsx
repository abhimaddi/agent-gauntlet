'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SentinelHeader } from '@/components/sentinel-header';
import { formatDateTime, formatDuration, formatPercent } from '@/lib/sentinel/format';
import { SCENARIOS } from '@/lib/sentinel/scenarios';
import type { AttackFamily, Difficulty, FinalVerdict, SentinelSession } from '@/lib/sentinel/types';

const verdictOptions: Array<{ value: '' | FinalVerdict; label: string }> = [
  { value: '', label: 'All verdicts' },
  { value: 'SAFE_SUCCESS', label: 'SAFE_SUCCESS' },
  { value: 'SAFE_ABORT', label: 'SAFE_ABORT' },
  { value: 'UNSAFE_SUCCESS', label: 'UNSAFE_SUCCESS' },
  { value: 'UNSAFE_FAILURE', label: 'UNSAFE_FAILURE' },
];

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SentinelSession[]>([]);
  const [scenarioFilter, setScenarioFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'' | FinalVerdict>('');
  const [attackFamilyFilter, setAttackFamilyFilter] = useState<'' | AttackFamily>('');

  useEffect(() => {
    void fetch('/api/sentinel/sessions', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload: { sessions: SentinelSession[] }) => setSessions(payload.sessions))
      .catch(() => setSessions([]));
  }, []);

  const filtered = useMemo(() => {
    return sessions.filter((session) => {
      if (scenarioFilter && session.scenarioId !== scenarioFilter) {
        return false;
      }
      if (difficultyFilter && session.difficulty !== difficultyFilter) {
        return false;
      }
      if (verdictFilter && session.finalVerdict !== verdictFilter) {
        return false;
      }
      if (attackFamilyFilter) {
        const families = new Set(session.redTeamActions.map((action) => action.attackFamily));
        if (!families.has(attackFamilyFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [sessions, scenarioFilter, difficultyFilter, verdictFilter, attackFamilyFilter]);

  const chartData = useMemo(() => {
    const byScenario = new Map<string, { safe: number; unsafe: number }>();

    for (const session of filtered) {
      const current = byScenario.get(session.scenarioLabel) ?? { safe: 0, unsafe: 0 };
      if (session.finalVerdict === 'SAFE_SUCCESS' || session.finalVerdict === 'SAFE_ABORT') {
        current.safe += 1;
      } else {
        current.unsafe += 1;
      }
      byScenario.set(session.scenarioLabel, current);
    }

    return Array.from(byScenario.entries()).map(([scenario, counts]) => ({
      scenario,
      safe: counts.safe,
      unsafe: counts.unsafe,
    }));
  }, [filtered]);

  const overview = useMemo(() => {
    const totalEpisodes = filtered.length;
    const safeCompletionRate = totalEpisodes
      ? filtered.filter((session) => session.finalVerdict === 'SAFE_SUCCESS').length / totalEpisodes
      : 0;
    const attackSuccessRate = totalEpisodes
      ? filtered.filter((session) => session.attackSucceeded).length / totalEpisodes
      : 0;
    const recoveryRate = totalEpisodes
      ? filtered.filter((session) => session.recoveryOccurred).length / totalEpisodes
      : 0;

    return {
      totalEpisodes,
      safeCompletionRate,
      attackSuccessRate,
      recoveryRate,
    };
  }, [filtered]);

  return (
    <main className="sentinel-shell no-halo">
      <SentinelHeader />

      <section className="card mb-4 p-4 md:p-5 fade-in">
        <h2 className="mb-2 text-2xl font-semibold">Session History</h2>
        <p className="text-sm text-[var(--text-muted)]">Filter and replay previous Agent Gauntlet sessions.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={scenarioFilter}
            onChange={(event) => setScenarioFilter(event.target.value)}
            className="rounded-lg border bg-[var(--panel)] px-3 py-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <option value="">All scenarios</option>
            {SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value as Difficulty | '')}
            className="rounded-lg border bg-[var(--panel)] px-3 py-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={verdictFilter}
            onChange={(event) => setVerdictFilter(event.target.value as '' | FinalVerdict)}
            className="rounded-lg border bg-[var(--panel)] px-3 py-2"
            style={{ borderColor: 'var(--border)' }}
          >
            {verdictOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={attackFamilyFilter}
            onChange={(event) => setAttackFamilyFilter(event.target.value as '' | AttackFamily)}
            className="rounded-lg border bg-[var(--panel)] px-3 py-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <option value="">All attack families</option>
            <option value="prompt_injection">prompt_injection</option>
            <option value="ui_deception">ui_deception</option>
            <option value="task_diversion">task_diversion</option>
            <option value="data_exfil_bait">data_exfil_bait</option>
          </select>
        </div>
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4 fade-in">
        <HistoryMetricCard label="Filtered Episodes" value={String(overview.totalEpisodes)} accent="var(--accent)" />
        <HistoryMetricCard label="Safe Completion Rate" value={formatPercent(overview.safeCompletionRate)} accent="var(--ok)" />
        <HistoryMetricCard label="Attack Success Rate" value={formatPercent(overview.attackSuccessRate)} accent="var(--red)" />
        <HistoryMetricCard label="Recovery Rate" value={formatPercent(overview.recoveryRate)} accent="var(--warning)" />
      </section>

      <section className="card mb-4 p-4 fade-in">
        <h3 className="mb-3 text-sm uppercase tracking-widest text-[var(--text-muted)]">Safe vs unsafe outcomes by scenario</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 160, 32, 0.2)" />
              <XAxis dataKey="scenario" stroke="#b89252" />
              <YAxis stroke="#b89252" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '0px',
                }}
              />
              <Bar dataKey="safe" fill="#e8a020" radius={[0, 0, 0, 0]} />
              <Bar dataKey="unsafe" fill="#c0392b" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-4 fade-in">
        <h3 className="mb-3 text-lg font-semibold">Episodes ({filtered.length})</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Scenario</th>
                <th className="px-3 py-2">Task Result</th>
                <th className="px-3 py-2">Attack Result</th>
                <th className="px-3 py-2">Final Verdict</th>
                <th className="px-3 py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((session) => (
                <tr key={session.gameId} className="border-t border-[var(--border)]/50 hover:bg-[var(--panel)]/60">
                  <td className="px-3 py-3">{formatDateTime(session.startedAt)}</td>
                  <td className="px-3 py-3">
                    <Link href={`/history/${session.gameId}`} className="underline decoration-dotted">
                      {session.scenarioLabel}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{session.taskCompleted ? 'Completed' : 'Incomplete'}</td>
                  <td className="px-3 py-3">{session.attackSucceeded ? 'Succeeded' : 'Blocked'}</td>
                  <td className="px-3 py-3 text-mono">{session.finalVerdict}</td>
                  <td className="px-3 py-3">{formatDuration(session.durationSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function HistoryMetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="card metric-card px-4 py-4">
      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">{label}</p>
      <p className="metric-value" style={{ color: accent }}>
        {value}
      </p>
    </article>
  );
}
