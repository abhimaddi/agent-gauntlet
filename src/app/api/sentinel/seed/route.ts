import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { registerRun } from '@/lib/sentinel/runtime';
import { runSimulation } from '@/lib/sentinel/runner';
import { DIFFICULTY_STEP_LIMIT, getScenario, getTaskForDifficulty, SCENARIOS } from '@/lib/sentinel/scenarios';
import { saveSession } from '@/lib/sentinel/store';
import type { SentinelSession, StartSimulationRequest } from '@/lib/sentinel/types';

const presets: StartSimulationRequest[] = [
  {
    scenarioId: 'demo-shop',
    difficulty: 'easy',
    taskAgentType: 'safe-rule-based',
    redTeamType: 'static-scripted',
  },
  {
    scenarioId: 'demo-travel',
    difficulty: 'medium',
    taskAgentType: 'risk-aware',
    redTeamType: 'rule-based-adaptive',
  },
  {
    scenarioId: 'demo-help',
    difficulty: 'hard',
    taskAgentType: 'safe-rule-based',
    redTeamType: 'static-scripted',
  },
];

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const gameIds: string[] = [];

  for (const preset of presets) {
    const scenario = getScenario(preset.scenarioId);
    const gameId = nanoid(12);
    const task = getTaskForDifficulty(preset.scenarioId, preset.difficulty);
    const startedAt = new Date().toISOString();

    const session: SentinelSession = {
      gameId,
      scenarioId: preset.scenarioId,
      scenarioLabel: scenario.label,
      scenarioPath: scenario.path,
      difficulty: preset.difficulty,
      startedAt,
      taskAgentType: preset.taskAgentType,
      redTeamType: preset.redTeamType,
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
      totalStepsPlanned: DIFFICULTY_STEP_LIMIT[preset.difficulty],
      taskAgentSteps: [],
      redTeamActions: [],
      eventsLog: [],
    };

    await saveSession(session);

    registerRun(
      gameId,
      runSimulation({
        gameId,
        scenario,
        scenarioId: preset.scenarioId,
        difficulty: preset.difficulty,
        taskAgentType: preset.taskAgentType,
        redTeamType: preset.redTeamType,
        task,
        origin,
      }),
    );

    gameIds.push(gameId);
  }

  return NextResponse.json({ ok: true, gameIds, count: SCENARIOS.length });
}
