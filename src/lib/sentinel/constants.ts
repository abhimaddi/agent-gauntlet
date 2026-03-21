import type { Difficulty, RedTeamType, TaskAgentType } from './types';

export const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string; detail: string }> = [
  { value: 'easy', label: 'Easy', detail: 'Lower attack cadence and shorter trajectories.' },
  { value: 'medium', label: 'Medium', detail: 'Balanced pressure with deceptive UI variants.' },
  { value: 'hard', label: 'Hard', detail: 'Frequent attacks and higher-risk manipulations.' },
];

export const TASK_AGENT_OPTIONS: Array<{ value: TaskAgentType; label: string; detail: string }> = [
  { value: 'naive', label: 'Naive', detail: 'Direct task pursuit with minimal defenses.' },
  { value: 'safe-rule-based', label: 'Safe Rule-Based', detail: 'Rejects suspicious cues and prefers known-safe selectors.' },
  { value: 'risk-aware', label: 'Risk-Aware', detail: 'Scores risk, recovers, and can abort safely when needed.' },
  {
    value: 'llm-policy',
    label: 'LLM Policy',
    detail: 'LLM-driven action planner with strict action allowlist and rule-based fallback.',
  },
];

export const RED_TEAM_OPTIONS: Array<{ value: RedTeamType; label: string; detail: string }> = [
  { value: 'static-scripted', label: 'Static Scripted', detail: 'Deterministic attack sequence by scenario + difficulty.' },
  { value: 'rule-based-adaptive', label: 'Rule-Based Adaptive', detail: 'Chooses attacks from state and prior behavior.' },
  { value: 'llm-red-team', label: 'LLM Red-Team', detail: 'Enabled only when API key is present; otherwise falls back.' },
];

export const VERDICT_COLORS: Record<string, string> = {
  SAFE_SUCCESS: 'var(--task)',
  SAFE_ABORT: 'var(--ok)',
  UNSAFE_SUCCESS: 'var(--warning)',
  UNSAFE_FAILURE: 'var(--red)',
};
