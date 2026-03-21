export type ScenarioId = 'demo-shop' | 'demo-travel' | 'demo-help' | 'live-web';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type TaskAgentType = 'naive' | 'safe-rule-based' | 'risk-aware' | 'llm-policy';
export type RedTeamType = 'static-scripted' | 'rule-based-adaptive' | 'llm-red-team';

export type AttackFamily =
  | 'prompt_injection'
  | 'ui_deception'
  | 'task_diversion'
  | 'data_exfil_bait';

export type FinalVerdict =
  | 'SAFE_SUCCESS'
  | 'SAFE_ABORT'
  | 'UNSAFE_SUCCESS'
  | 'UNSAFE_FAILURE';

export type FailureLabel =
  | 'task_diversion'
  | 'deceptive_ui_click'
  | 'prompt_injection_followed'
  | 'false_refusal'
  | 'incomplete_task'
  | 'unsafe_data_exposure_attempt';

export interface ScenarioConfig {
  id: ScenarioId;
  label: string;
  description: string;
  path: string;
  tasks: Record<Difficulty, string>;
  successHint: string;
}

export interface DomSummary {
  title: string;
  url: string;
  visibleText: string[];
  buttonLabels: string[];
  suspiciousSignals: string[];
  taskProgressHint?: string;
  actionableElements?: Array<{
    selector: string;
    role: 'button' | 'link' | 'input' | 'textarea' | 'other';
    label: string;
    inputType?: string;
  }>;
}

export interface RiskAssessment {
  riskScore: number;
  suspiciousSignals: string[];
}

export interface TaskAgentDecision {
  actionName: string;
  actionInput?: string;
  actionValue?: string;
  actionSummary: string;
  rationaleSummary: string;
  riskScore: number;
  shouldAbort: boolean;
  recoveryActionTaken: boolean;
  taskProgress: number;
}

export interface RedTeamAction {
  gameId: string;
  actionNumber: number;
  attackFamily: AttackFamily;
  attackName: string;
  attackSurface: string;
  description: string;
  success: boolean;
  timestamp: string;
  injectionPayload: string;
  judgeVerdict: string;
}

export interface TaskAgentStep {
  gameId: string;
  stepNumber: number;
  url: string;
  actionName: string;
  actionInput?: string;
  actionValue?: string;
  actionSummary: string;
  rationaleSummary: string;
  screenshotUrl?: string;
  domSummary: DomSummary;
  timestamp: string;
  riskScore: number;
  taskProgress: number;
  promptHealth: number;
  promptHealthDelta: number;
  unsafeAction: boolean;
  unsafeReason?: FailureLabel;
}

export interface PromptHealthEvent {
  stepNumber: number;
  health: number;
  delta: number;
  cause: string;
  timestamp: string;
}

export interface EventLog {
  id: string;
  gameId: string;
  type:
    | 'session_start'
    | 'task_agent_step'
    | 'red_team_action'
    | 'risk_alert'
    | 'session_end'
    | 'system';
  message: string;
  timestamp: string;
  stepNumber?: number;
  payload?: Record<string, unknown>;
}

export interface SentinelSession {
  gameId: string;
  scenarioId: ScenarioId;
  scenarioLabel: string;
  scenarioPath: string;
  targetUrl?: string;
  difficulty: Difficulty;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  taskAgentType: TaskAgentType;
  redTeamType: RedTeamType;
  winner: 'Task Agent' | 'Red-Team Agent' | 'Draw';
  finalVerdict: FinalVerdict;
  taskCompleted: boolean;
  attackSucceeded: boolean;
  recoveryOccurred: boolean;
  safetyScore: number;
  promptHealth: number;
  promptHealthHistory: PromptHealthEvent[];
  failureLabels: FailureLabel[];
  task: string;
  currentTaskAgentStatus: 'idle' | 'running' | 'aborted' | 'completed' | 'failed';
  currentRedTeamStatus: 'idle' | 'running' | 'completed' | 'failed';
  currentStep: number;
  totalStepsPlanned: number;
  latestScreenshotUrl?: string;
  latestDomSummary?: DomSummary;
  activeAttackFamily?: AttackFamily;
  activeAttackName?: string;
  taskAgentSteps: TaskAgentStep[];
  redTeamActions: RedTeamAction[];
  eventsLog: EventLog[];
}

export interface StartSimulationRequest {
  scenarioId: ScenarioId;
  difficulty: Difficulty;
  taskAgentType: TaskAgentType;
  redTeamType: RedTeamType;
  targetUrl?: string;
  customTask?: string;
}

export interface StepExecutionContext {
  gameId: string;
  stepNumber: number;
  scenario: ScenarioConfig;
  difficulty: Difficulty;
  task: string;
  taskAgentType: TaskAgentType;
  redTeamType: RedTeamType;
}
