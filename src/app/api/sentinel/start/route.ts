import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { registerRun } from '@/lib/sentinel/runtime';
import { runSimulation } from '@/lib/sentinel/runner';
import { DIFFICULTY_STEP_LIMIT, getScenario, getTaskForDifficulty } from '@/lib/sentinel/scenarios';
import { saveSession } from '@/lib/sentinel/store';
import type { SentinelSession, StartSimulationRequest } from '@/lib/sentinel/types';

function normalizeLiveUrl(rawUrl: string | undefined): string | null {
  if (!rawUrl) {
    return null;
  }
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<StartSimulationRequest>;
    const scenarioId = body.scenarioId ?? 'live-web';
    const difficulty = body.difficulty ?? 'easy';
    const taskAgentType = body.taskAgentType ?? 'llm-policy';
    const redTeamType = body.redTeamType ?? 'llm-red-team';

    const scenario = getScenario(scenarioId);
    const targetUrl = scenarioId === 'live-web' ? normalizeLiveUrl(body.targetUrl) : null;
    if (scenarioId === 'live-web' && !targetUrl) {
      return NextResponse.json({ ok: false, error: 'A valid http(s) targetUrl is required for Live Web mode.' }, { status: 400 });
    }

    const task =
      (body.customTask?.trim() && body.customTask.trim().length > 0)
        ? body.customTask.trim()
        : getTaskForDifficulty(scenarioId, difficulty);
    const gameId = nanoid(12);
    const startedAt = new Date().toISOString();

    const session: SentinelSession = {
      gameId,
      scenarioId,
      scenarioLabel: scenario.label,
      scenarioPath: targetUrl ?? scenario.path,
      targetUrl: targetUrl ?? undefined,
      difficulty,
      startedAt,
      taskAgentType,
      redTeamType,
      winner: 'Draw',
      finalVerdict: 'UNSAFE_FAILURE',
      taskCompleted: false,
      attackSucceeded: false,
      recoveryOccurred: false,
      safetyScore: 0,
      promptHealth: 100,
      promptHealthHistory: [
        {
          stepNumber: 0,
          health: 100,
          delta: 0,
          cause: 'session_start',
          timestamp: startedAt,
        },
      ],
      failureLabels: [],
      task,
      currentTaskAgentStatus: 'idle',
      currentRedTeamStatus: 'idle',
      currentStep: 0,
      totalStepsPlanned: DIFFICULTY_STEP_LIMIT[difficulty],
      taskAgentSteps: [],
      redTeamActions: [],
      eventsLog: [],
    };

    await saveSession(session);

    const origin = new URL(request.url).origin;

    registerRun(
      gameId,
      runSimulation({
        gameId,
        scenario,
        scenarioId,
        difficulty,
        taskAgentType,
        redTeamType,
        task,
        origin,
        targetUrl: targetUrl ?? undefined,
      }),
    );

    return NextResponse.json({
      ok: true,
      gameId,
      redirectTo: `/arena/${gameId}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
