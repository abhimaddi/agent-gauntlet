'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { DuelActivityFeed } from '@/components/duel-activity-feed';
import { SentinelHeader } from '@/components/sentinel-header';
import { VERDICT_COLORS } from '@/lib/sentinel/constants';
import { buildRedTeamFeedItems, buildTaskAgentFeedItems } from '@/lib/sentinel/duel-feed';
import { formatDateTime, formatDuration } from '@/lib/sentinel/format';
import type { SentinelSession } from '@/lib/sentinel/types';

type Html2CanvasFn = (
  element: HTMLElement,
  options: {
    scale?: number;
    backgroundColor?: string | null;
    useCORS?: boolean;
    logging?: boolean;
  },
) => Promise<HTMLCanvasElement>;

declare global {
  interface Window {
    html2canvas?: Html2CanvasFn;
    __html2canvasPromise?: Promise<Html2CanvasFn>;
  }
}

const savePosterButtonBase: CSSProperties = {
  marginTop: '10px',
  fontFamily: "'Rye',cursive",
  fontSize: '12px',
  letterSpacing: '3px',
  padding: '8px 22px',
  background: 'transparent',
  border: '2px solid #7a4e14',
  color: '#5a3010',
  cursor: 'pointer',
  transition: 'all 0.2s',
  width: '100%',
};

export function FinisherClient({ gameId }: { gameId: string }) {
  const [session, setSession] = useState<SentinelSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringSave, setIsHoveringSave] = useState(false);
  const [isSavingPoster, setIsSavingPoster] = useState(false);

  useEffect(() => {
    void fetch(`/api/sentinel/${gameId}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load finished match');
        }
        return response.json();
      })
      .then((payload: { session: SentinelSession }) => {
        setSession(payload.session);
        setError(null);
      })
      .catch((loadError) => {
        setSession(null);
        setError((loadError as Error).message);
      });
  }, [gameId]);

  const outcomeTone = useMemo(() => {
    if (!session) {
      return 'standoff';
    }

    if (session.winner === 'Task Agent') {
      return 'victory';
    }

    if (session.winner === 'Red-Team Agent') {
      return 'defeat';
    }

    return 'standoff';
  }, [session]);
  const taskFeedItems = useMemo(() => buildTaskAgentFeedItems(session?.taskAgentSteps ?? []), [session?.taskAgentSteps]);
  const redFeedItems = useMemo(
    () =>
      buildRedTeamFeedItems(session?.redTeamActions ?? [], {
        revealPayloads: Boolean(session?.endedAt),
      }),
    [session?.endedAt, session?.redTeamActions],
  );

  async function exportPoster() {
    const paper = document.getElementById('lobby-bounty-paper');
    if (!paper) {
      return;
    }

    setIsSavingPoster(true);

    try {
      const html2canvas = await ensureHtml2Canvas();
      const canvas = await html2canvas(paper, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      const outcome = document
        .getElementById('verdict-stamp')
        ?.textContent?.trim()
        .toLowerCase()
        .replace(/\s+/g, '-') ?? 'result';
      link.download = `agent-gauntlet-${outcome}-poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsSavingPoster(false);
    }
  }

  if (error) {
    return (
      <main className="sentinel-shell">
        <SentinelHeader />
        <section className="card p-6">
          <p className="text-sm text-[var(--red)]">{error}</p>
          <div className="mt-4">
            <Link href="/" className="startbtn block w-full text-center">
              DRAW AGAIN
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="sentinel-shell">
        <SentinelHeader />
        <section className="card p-6 text-sm text-[var(--text-muted)]">Loading finisher...</section>
      </main>
    );
  }

  const verdictColor = VERDICT_COLORS[session.finalVerdict] ?? 'var(--gold)';
  const recentEvents = session.eventsLog.slice(-4);
  const failureSummary = session.failureLabels.length > 0 ? session.failureLabels.join(', ') : 'none';

  return (
    <main className="sentinel-shell">
      <SentinelHeader />

      <section className="card mb-4 p-4 md:p-5 fade-in">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Post-Battle Finisher</p>
        <h1 className="mt-1 text-3xl font-semibold">Match Complete</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Game {session.gameId} • Completed {formatDateTime(session.endedAt ?? session.startedAt)}
        </p>
      </section>

      <section className="finisher-layout fade-in">
        <article id="lobby-bounty-paper" className="bounty-paper">
          <p className="bounty-brand">SENTINEL ARENA // AGENT GAUNTLET</p>
          <h2 className="bounty-title">BATTLE RESULTS</h2>

          <div
            className={`bounty-outcome ${
              outcomeTone === 'victory' ? 'victory' : outcomeTone === 'defeat' ? 'defeat' : 'standoff'
            }`}
          >
            {outcomeTone === 'victory' ? 'VICTORY' : outcomeTone === 'defeat' ? 'DEFEAT' : 'STANDOFF'}
          </div>

          <div id="verdict-stamp" className="verdict-stamp" style={{ borderColor: verdictColor, color: verdictColor }}>
            {session.finalVerdict}
          </div>

          <div className="bounty-grid">
            <KeyValue label="Winner" value={session.winner} />
            <KeyValue label="Scenario" value={session.scenarioLabel} />
            <KeyValue label="Difficulty" value={session.difficulty} />
            <KeyValue label="Task Agent" value={session.taskAgentType} />
            <KeyValue label="Red-Team Agent" value={session.redTeamType} />
            <KeyValue label="Duration" value={formatDuration(session.durationSeconds)} />
            <KeyValue label="Safety Score" value={String(session.safetyScore)} />
            <KeyValue label="Recovery" value={session.recoveryOccurred ? 'true' : 'false'} />
          </div>

          <div className="bounty-summary">
            <p className="bounty-summary-label">Outcome Summary</p>
            <p>
              taskCompleted={String(session.taskCompleted)} • attackSucceeded={String(session.attackSucceeded)} •
              failureLabels={failureSummary}
            </p>
          </div>

          <div className="bounty-events">
            <p className="bounty-summary-label">Compact Event Summary</p>
            <ul>
              {recentEvents.length === 0 ? (
                <li>No events captured.</li>
              ) : (
                recentEvents.map((event) => <li key={event.id}>{event.message}</li>)
              )}
            </ul>
          </div>
        </article>

        <aside className="card p-4 md:p-5 finisher-side">
          <h3 className="text-lg font-semibold">Final Match Data</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            A cinematic bounty poster for judges and exports. Save this card as a clean PNG.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Final Verdict</span>
              <span style={{ color: verdictColor }}>{session.finalVerdict}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Winner</span>
              <span>{session.winner}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Scenario</span>
              <span>{session.scenarioLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Difficulty</span>
              <span>{session.difficulty}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Task Agent</span>
              <span>{session.taskAgentType}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Red-Team Agent</span>
              <span>{session.redTeamType}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Duration</span>
              <span>{formatDuration(session.durationSeconds)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
              <span className="text-[var(--text-muted)]">Safety Score</span>
              <span>{session.safetyScore}</span>
            </div>
          </div>

          <button
            onClick={exportPoster}
            style={{
              ...savePosterButtonBase,
              background: isHoveringSave ? 'rgba(122,78,20,0.12)' : 'transparent',
              opacity: isSavingPoster ? 0.78 : 1,
            }}
            onMouseEnter={() => setIsHoveringSave(true)}
            onMouseLeave={() => setIsHoveringSave(false)}
            disabled={isSavingPoster}
          >
            {isSavingPoster ? '↓ SAVING POSTER...' : '↓ SAVE POSTER'}
          </button>

          <Link href="/" className="startbtn mt-3 block w-full text-center">
            DRAW AGAIN
          </Link>

          <Link href={`/history/${session.gameId}`} className="chip chip-accent mt-3 inline-flex">
            Open Replay
          </Link>
        </aside>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 fade-in">
        <article className="card p-4">
          <DuelActivityFeed
            title="Task Agent Feed"
            subtitle="Post-match ledger. Open a row for rationale, action input, and progress impact."
            tone="task"
            items={taskFeedItems}
            emptyMessage="No task-agent step recorded."
          />
        </article>

        <article className="card p-4">
          <DuelActivityFeed
            title="Red-Team Feed"
            subtitle="Match complete. Open a row to inspect the injected payload, family, and verdict."
            tone="red"
            items={redFeedItems}
            emptyMessage="No red-team action recorded."
          />
        </article>
      </section>
    </main>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="bounty-kv">
      <span>{label}</span>
      <strong>{value || 'n/a'}</strong>
    </div>
  );
}

async function ensureHtml2Canvas(): Promise<Html2CanvasFn> {
  if (window.html2canvas) {
    return window.html2canvas;
  }

  if (window.__html2canvasPromise) {
    return window.__html2canvasPromise;
  }

  window.__html2canvasPromise = new Promise<Html2CanvasFn>((resolve, reject) => {
    const onReady = () => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
      } else {
        reject(new Error('html2canvas was not available after load.'));
      }
    };

    const existing = document.querySelector('script[data-html2canvas="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', onReady, { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load html2canvas script.')), {
        once: true,
      });
      if (window.html2canvas) {
        onReady();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.dataset.html2canvas = 'true';
    script.async = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error('Failed to load html2canvas script.'));
    document.head.appendChild(script);
  });

  return window.__html2canvasPromise;
}
