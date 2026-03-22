import { formatDateTime } from './format';
import type { RedTeamAction, TaskAgentStep } from './types';

export type DuelFeedTone = 'task' | 'red';

export type DuelFeedBadge = {
  label: string;
  tone?: 'neutral' | 'task' | 'red' | 'ok' | 'warning';
};

export type DuelFeedDetail = {
  label: string;
  value: string;
};

export type DuelFeedItem = {
  id: string;
  summary: string;
  description: string;
  badges?: DuelFeedBadge[];
  details?: DuelFeedDetail[];
  payload?: string;
  payloadLabel?: string;
};

export function buildTaskAgentFeedItems(steps: TaskAgentStep[]): DuelFeedItem[] {
  return steps.map((step) => {
    const details: DuelFeedDetail[] = [
      { label: 'Step', value: String(step.stepNumber) },
      { label: 'Timestamp', value: formatDateTime(step.timestamp) },
      { label: 'Action', value: prettifyActionName(step.actionName) },
      { label: 'Task Progress', value: `${step.taskProgress}%` },
      { label: 'Risk Score', value: String(step.riskScore) },
      { label: 'Prompt Health', value: `${step.promptHealth}% (${formatDelta(step.promptHealthDelta)})` },
    ];

    if (step.actionInput) {
      details.splice(3, 0, { label: 'Action Input', value: step.actionInput });
    }

    if (step.actionValue) {
      details.splice(4, 0, { label: 'Typed Value', value: step.actionValue });
    }

    if (step.unsafeAction) {
      details.push({ label: 'Result', value: `Unsafe action${step.unsafeReason ? `: ${formatFailureLabel(step.unsafeReason)}` : ''}` });
    }

    return {
      id: `task-step-${step.stepNumber}`,
      summary: compactLine(step.actionSummary, 86),
      description: compactLine(step.rationaleSummary || step.actionSummary, 220),
      badges: [
        { label: `Step ${step.stepNumber}` },
        { label: `Progress ${step.taskProgress}%`, tone: 'task' },
        { label: `Risk ${step.riskScore}`, tone: step.riskScore >= 70 ? 'warning' : 'neutral' },
        ...(step.unsafeAction ? [{ label: 'Unsafe', tone: 'red' as const }] : []),
      ],
      details,
    };
  });
}

export function buildRedTeamFeedItems(
  actions: RedTeamAction[],
  options: { revealPayloads: boolean },
): DuelFeedItem[] {
  return actions.map((action) => {
    const statusBadge = getRedStatusBadge(action);
    const details: DuelFeedDetail[] = [
      { label: 'Attack', value: String(action.actionNumber) },
      { label: 'Timestamp', value: formatDateTime(action.timestamp) },
      { label: 'Attack Family', value: formatAttackFamily(action.attackFamily) },
      { label: 'Surface', value: action.attackSurface.toUpperCase() },
      { label: 'Result', value: statusBadge.label },
      { label: 'Judge', value: action.judgeVerdict },
    ];

    return {
      id: `red-action-${action.actionNumber}-${action.timestamp}`,
      summary: compactLine(action.attackName, 86),
      description: compactLine(action.description, 220),
      badges: [
        { label: `Attack ${action.actionNumber}` },
        { label: formatAttackFamily(action.attackFamily), tone: 'red' },
        statusBadge,
      ],
      details,
      payload: options.revealPayloads ? action.injectionPayload : undefined,
      payloadLabel: options.revealPayloads ? 'Injection Payload' : undefined,
    };
  });
}

function compactLine(value: string, limit: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function formatDelta(value: number): string {
  return `${value > 0 ? '+' : ''}${Math.trunc(value)}%`;
}

function formatAttackFamily(value: RedTeamAction['attackFamily']): string {
  return value.replace(/_/g, ' ');
}

function prettifyActionName(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatFailureLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

function getRedStatusBadge(action: RedTeamAction): DuelFeedBadge {
  if (action.success) {
    return { label: 'Landed', tone: 'red' };
  }

  if (/pending/i.test(action.judgeVerdict)) {
    return { label: 'Pending', tone: 'warning' };
  }

  return { label: 'Blocked', tone: 'ok' };
}
