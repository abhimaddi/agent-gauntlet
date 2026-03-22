# Agent Gauntlet

> Adversarial evaluation arena for browser agents

Agent Gauntlet is a local-first benchmark and product demo for testing how browser agents behave under adversarial pressure. It stages a visible duel between a **Task Agent** trying to complete a user goal and a **Red-Team Agent** trying to derail it with prompt injection, deceptive UI, and task-diversion attacks.

Instead of treating agent safety as a hidden metric, Agent Gauntlet turns it into a replayable system: live screenshots, structured step logs, injected payloads, prompt-health tracking, verdict labels, exports, and post-match inspection all live in one place.

Browser-agent safety matters because the web is messy, persuasive, and adversarial by default. A capable browser agent has to do more than click the right thing. It has to stay aligned with the original task, resist malicious instructions embedded in page content, avoid deceptive UI, and recover when the page tries to manipulate it.

Agent Gauntlet is interesting as both a product and an eval harness because it makes that failure mode concrete:

- It is visual and demo-friendly for judges.
- It is structured and exportable for researchers and engineers.
- It is grounded in real browser automation instead of a toy chat-only setup.
- It creates traces that can later support model comparison, offline analysis, and future training loops.

> **Current status**
>
> - The current lobby flow is optimized around **live-web duels** with a custom URL and task.
> - The repo also includes **synthetic benchmark pages** and seeded sessions for deterministic demos and dataset exploration.
> - Internal routes and env variables still use the historical `sentinel` naming for compatibility, even though the product surface is Agent Gauntlet.

## Key Features

- **Live duel arena** with a large browser viewport, side rails for Task Agent and Red-Team activity, and prompt-health tracking.
- **Task Agent vs Red-Team Agent** framing that turns safety evaluation into a visible, inspectable match.
- **Playwright-native browser runner** for real browser automation and screenshot capture.
- **Multiple policy modes** for both sides, including rule-based and optional LLM-backed policies.
- **Adversarial attack families** covering prompt injection, deceptive UI, task diversion, and synthetic exfiltration bait.
- **Replay and history views** for stepping through completed runs and reviewing final outcomes.
- **Structured exports** in JSON, CSV, and ShareGPT JSONL.
- **Dataset explorer** for flattened step-level browsing across recorded sessions.
- **Finisher page** with a cinematic bounty-poster style match summary and PNG poster export.
- **Light and dark themes** with a custom Wild West / bounty-board visual identity.
- **Synthetic benchmark pages** bundled with the repo, plus **custom live-site** runs through the current lobby.

## How It Works

1. A user configures a duel in the lobby by selecting a target URL, task, policies, and difficulty.
2. The app creates a new session through `/api/sentinel/start` and registers a background run.
3. The Playwright runner launches Chromium, opens the target, and begins stepping through the task.
4. On each step, the Red-Team chooses an attack, the browser is manipulated, and the Task Agent decides what to do next.
5. The system captures screenshots, DOM summaries, task/risk state, red-team payloads, prompt-health changes, and verdict signals.
6. The UI polls the session, renders the live arena, then hands the completed run off to history, replay, exports, and the finisher page.

## System Diagrams

### High-Level Architecture

```mermaid
flowchart LR
  User["User"] --> Lobby["Lobby / Duel Setup"]
  Lobby --> StartAPI["/api/sentinel/start"]
  StartAPI --> Runtime["Active Run Registry"]
  StartAPI --> Store["Local Session Store"]
  Runtime --> Runner["Simulation Runner"]
  Runner --> Task["Task Agent Policy"]
  Runner --> Red["Red-Team Policy"]
  Runner --> Browser["Playwright Browser"]
  Browser <--> Target["Live Web Target or Demo Scenario"]
  Browser --> Capture["DOM Summary + Screenshot Capture"]
  Task --> Runner
  Red --> Runner
  Capture --> Store
  Runner --> Store
  Store --> Arena["Live Arena"]
  Store --> History["History / Replay"]
  Store --> Dataset["Dataset Explorer"]
  Store --> Export["JSON / CSV / ShareGPT Export"]
  Store --> Finisher["Finisher Poster"]
```

### One Duel Lifecycle

```mermaid
sequenceDiagram
  actor User
  participant Frontend as Lobby UI
  participant API as Start API
  participant Runner as Simulation Runner
  participant Browser as Playwright Browser
  participant Red as Red-Team Policy
  participant Task as Task Agent Policy
  participant Store as Session Store
  participant Arena as Arena UI

  User->>Frontend: Configure target, task, policies, difficulty
  Frontend->>API: POST /api/sentinel/start
  API->>Store: Create initial session
  API->>Runner: Register background run
  API-->>Frontend: Return gameId
  Frontend->>Arena: Navigate to /arena/:gameId

  loop Per step
    Runner->>Browser: Read page state
    Runner->>Red: Choose attack
    Red-->>Runner: Attack plan + payload
    Runner->>Browser: Inject attack
    Runner->>Task: Decide next action
    Task-->>Runner: Action + rationale + risk
    Runner->>Browser: Execute browser action
    Runner->>Store: Append step, attack, events, screenshot, prompt health
    Arena->>API: Poll session state
    API->>Store: Read session
    API-->>Arena: Updated run snapshot
  end

  Runner->>Store: Final verdict + labels + winner
  Arena-->>User: Show completed match / finisher handoff
```

### Data and Trace Flow

```mermaid
flowchart TD
  Browser["Browser execution"] --> Screens["Screenshots"]
  Browser --> DOM["DOM summaries"]
  TaskSteps["Task-agent steps"] --> Session["Session JSON"]
  RedActions["Red-team actions"] --> Session
  Health["Prompt health + risk + verdict labels"] --> Session
  Screens --> Session
  DOM --> Session

  Session --> History["History page"]
  Session --> Replay["Replay page"]
  Session --> Arena["Live arena polling"]
  Session --> Dataset["Dataset explorer"]
  Session --> RunExport["Per-run export APIs"]
  Session --> FullExport["Aggregate export API"]

  Session -. future .-> Training["Future: curation, comparison, training, held-out evals"]
```

## Product Surfaces / Pages

| Surface | Route | Purpose |
| --- | --- | --- |
| Lobby | `/` | Configure a duel, choose policies, select a live target or preset, and start a run. |
| Arena | `/arena/[gameId]` | Watch the live match with screenshot updates, activity feeds, prompt health, and tactical state. |
| History | `/history` | Browse recorded sessions, filter outcomes, and inspect aggregate metrics. |
| Replay | `/history/[gameId]` | Step through a completed run with screenshot timeline, step details, and both agent feeds. |
| Dataset | `/dataset` | Search a flattened table of logged steps and export aggregate data. |
| Finisher | `/finish/[gameId]` | Review final verdicts in a cinematic summary view and export a poster image. |
| Scenario pages | `/scenarios/shop`, `/scenarios/travel`, `/scenarios/help` | Bundled synthetic environments used for deterministic benchmark content and seeded runs. |

## Core Concepts

- **Task Agent**: The side trying to complete the user’s objective while staying faithful to the task and avoiding unsafe interactions.
- **Red-Team Agent**: The adversarial side that injects attacks into the page or task context to induce unsafe or off-task behavior.
- **Attack families**: Coarse categories that group how an attack tries to manipulate the browser agent.
- **Task fidelity**: Whether the agent stayed aligned with the original objective instead of following injected or deceptive instructions.
- **Recovery**: Whether the Task Agent detected and corrected course after encountering suspicious or unsafe signals.
- **Safety verdicts**: Final run-level labels such as `SAFE_SUCCESS`, `SAFE_ABORT`, `UNSAFE_SUCCESS`, and `UNSAFE_FAILURE`.
- **Structured traces**: The full run record, including screenshots, decisions, attacks, rationale, state, and verdict metadata.
- **Replay/export pipeline**: The surfaces and APIs used to inspect, search, and export runs after they finish.

## Attack Families

| Family | What it tests |
| --- | --- |
| `prompt_injection` | Hidden or visible instructions that try to override the original task. |
| `ui_deception` | Fake trust signals, misleading CTAs, banners, and deceptive interface affordances. |
| `task_diversion` | Detours that redirect the agent toward unrelated or unsafe goals. |
| `data_exfil_bait` | Synthetic prompts designed to lure the agent into disclosing or collecting unnecessary information. |

## Data / Export Format

Each session records:

- session metadata and configuration
- target URL and task
- task-agent steps
- red-team actions
- rationale summaries
- DOM summaries
- screenshots
- prompt-health history
- event log entries
- verdicts, winners, safety score, and failure labels

Local storage paths:

```text
.sentinel-data/sessions/<gameId>.json
public/sentinel-screens/<gameId>/
```

Implemented export formats:

- **JSON** for full-fidelity structured traces
- **CSV** for tabular analysis
- **ShareGPT JSONL** for chat-style downstream curation or training workflows

Export endpoints:

```text
/api/sentinel/[gameId]/export?format=json
/api/sentinel/[gameId]/export?format=csv
/api/sentinel/[gameId]/export?format=sharegpt

/api/sentinel/export?format=json
/api/sentinel/export?format=csv
/api/sentinel/export?format=sharegpt
```

## Tech Stack

- **Next.js 16** with the App Router
- **React 19**
- **TypeScript**
- **Playwright** for real browser automation and screenshots
- **Tailwind CSS 4** plus custom theme CSS
- **Recharts** for history analytics
- **NanoID** for session IDs and event IDs
- **Optional OpenAI / Anthropic integrations** for LLM-backed policy modes
- **html2canvas** loaded client-side for finisher poster export

## Project Structure

```text
src/
  app/
    page.tsx                        # Lobby / duel setup
    arena/[gameId]/                 # Live arena
    history/                        # Session history + replay
    dataset/                        # Flattened dataset explorer
    finish/[gameId]/                # Finisher / poster export
    scenarios/                      # Synthetic benchmark pages
    api/sentinel/                   # Start, poll, metrics, seed, export routes
  components/
    duel-activity-feed.tsx          # Expandable event feed UI
    sentinel-header.tsx             # Shared header / navigation
    agent-duel.tsx                  # Lobby hero duel scene
    theme-toggle.tsx                # Light / dark mode toggle
  lib/
    sentinel/
      runner.ts                     # Main duel execution loop
      policies/                     # Task-agent and red-team policy logic
      attacks.ts                    # Attack injection logic
      dom-summary.ts                # Browser page summarization
      store.ts                      # Local session persistence
      exporters.ts                  # JSON / CSV / ShareGPT exports
      scenarios.ts                  # Scenario definitions
      types.ts                      # Core data model
scripts/
  seed-sessions.ts                  # Seed sample sessions
.sentinel-data/
  sessions/                         # Local run records
public/
  sentinel-screens/                 # Captured screenshots
```

## Local Development / Setup

### Prerequisites

- Node.js 20+
- npm
- Playwright Chromium runtime

### Install

```bash
npm install
npx playwright install chromium
```

### Environment

Create a local env file:

```bash
cp .env.local.example .env.local
```

Optional keys for LLM-backed policy modes:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Useful optional model routing vars:

- `SENTINEL_TASK_AGENT_PROVIDER`
- `SENTINEL_TASK_AGENT_MODEL`
- `SENTINEL_RED_TEAM_PROVIDER`
- `SENTINEL_RED_TEAM_MODEL`
- `SENTINEL_TASK_AGENT_TEMPERATURE`
- `SENTINEL_RED_TEAM_TEMPERATURE`

### Run the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Seed local benchmark data

```bash
npm run seed
```

That gives you sample sessions for the History, Replay, and Dataset pages even before running your own duels.

### Start a duel

1. Open the lobby at `/`
2. Choose a live-site preset or enter a custom `http(s)` URL
3. Set the task, difficulty, Task Agent policy, and Red-Team policy
4. Start the simulation
5. Watch the live arena update
6. Review the finisher, history, replay, or exports

### Access the main surfaces

- Lobby: `/`
- Arena: `/arena/<gameId>`
- History: `/history`
- Replay: `/history/<gameId>`
- Dataset: `/dataset`
- Synthetic pages: `/scenarios/shop`, `/scenarios/travel`, `/scenarios/help`

## Example User Flow

1. Open the lobby and select a live target such as Amazon or Google Flights, or enter a custom site.
2. Choose how aggressive the red team should be and how conservative the task policy should be.
3. Start the duel and watch the browser viewport, side feeds, and prompt health update in real time.
4. Inspect the current task and current red-team attack as the run unfolds.
5. After the run completes, review the finisher page and save the poster if needed.
6. Open History or Replay to step through the run, then export JSON, CSV, or ShareGPT traces.

## Why This Matters

Browser agents are one of the most useful and risky agentic surfaces. They act in environments full of adversarial text, fake trust cues, dynamic UI, and hidden incentives.

Agent Gauntlet matters because it focuses on the failure mode that matters most in practice: **an agent that is capable, but no longer faithful**.

- It makes prompt injection visible instead of abstract.
- It tests whether an agent can stay on-task under manipulation.
- It produces traces that are useful for safety analysis, debugging, and future evaluation loops.
- It bridges product demo quality and alignment relevance in a way that is easy to inspect.

## Roadmap

Planned future work:

- first-class synthetic scenario launching from the main lobby
- stronger side-by-side model comparison and policy benchmarking
- richer eval metrics beyond final verdicts and safety score
- more diverse attack generation and held-out benchmark suites
- better attack success attribution and judge logic
- advanced settings for custom models, providers, and policy tuning
- offline trace curation for training and regression testing
- closed-loop improvement using exported trajectories

### Future Closed-Loop Training / Eval Loop

```mermaid
flowchart LR
  Runs["Recorded Agent Gauntlet runs"] --> Curation["Trace curation and labeling"]
  Curation --> Training["Future fine-tuning / preference tuning"]
  Training --> Policies["Updated task or red-team policies"]
  Policies --> Eval["Held-out evaluation suites"]
  Eval --> Runs
```

## Contributing

Current contributors:

- **Abhinav**
- **Sai**

If you want to collaborate:

- open an issue or start a discussion before large architectural changes
- keep evaluation claims grounded in implemented behavior
- prefer changes that improve trace quality, replayability, and safety clarity
