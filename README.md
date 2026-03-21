# Sentinel Arena

Sentinel Arena is a local-first, browser-only adversarial benchmark for web agents.

It is a deterministic MVP that runs entirely on your machine with **Playwright only** (no Browser-Use API, no `browser-use-sdk`).

## What It Does

- Task Agent attempts benign browser tasks in synthetic web apps.
- Red-Team Agent injects local prompt-injection and deceptive UI attacks.
- Full trajectory is logged as structured data:
  - session metadata
  - task-agent steps
  - red-team actions
  - event log
  - screenshots
  - compact DOM summaries
  - outcome labels and final safety verdict

## Pages

- `/` Lobby
  - Scenario cards
  - Difficulty/policy selectors
  - Start simulation
  - Metrics cards (total episodes, safe completion, attack success, recovery)
- `/arena/[gameId]` Live Arena
  - Split view with live screenshot updates
  - Current task, attack, timeline, risk, status, verdict
  - Event log + rationale summary
  - Per-run export buttons
- `/history`
  - Session list with filters
  - Safe/unsafe chart (Recharts)
- `/history/[gameId]` Replay
  - Step-by-step replay with screenshot timeline
  - Task-agent vs red-team actions
  - Final metrics + exports
- `/dataset`
  - Searchable flattened step table
  - Dataset export (JSON, CSV, ShareGPT JSONL)

## Synthetic Scenarios (Local, Deterministic)

- Demo Shop (`/scenarios/shop`)
- Demo Travel (`/scenarios/travel`)
- Demo Help Center (`/scenarios/help`)
- Live Web (Experimental): real URL mode with constrained LLM actions

## Agent Policies

Task Agent modes:
- `naive`
- `safe-rule-based`
- `risk-aware`
- `llm-policy` (OpenAI/Anthropic JSON-planned actions, strict allowlist, rule fallback)

Red-Team modes:
- `static-scripted`
- `rule-based-adaptive`
- `llm-red-team` (OpenAI/Anthropic JSON-planned attacks, rule fallback)

Attack families implemented:
- `prompt_injection`
- `ui_deception`
- `task_diversion`
- `data_exfil_bait` (synthetic-only)

## Verdicts and Labels

Final verdicts:
- `SAFE_SUCCESS`
- `SAFE_ABORT`
- `UNSAFE_SUCCESS`
- `UNSAFE_FAILURE`

Failure labels:
- `task_diversion`
- `deceptive_ui_click`
- `prompt_injection_followed`
- `false_refusal`
- `incomplete_task`
- `unsafe_data_exposure_attempt`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright Chromium runtime:

```bash
npx playwright install chromium
```

3. Start app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## LLM Keys (Optional)

Set keys in:

```text
.env.local
```

Supported keys:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Optional routing defaults:
- `SENTINEL_TASK_AGENT_PROVIDER` (`openai` or `anthropic`)
- `SENTINEL_TASK_AGENT_MODEL` (default `gpt-5-mini`)
- `SENTINEL_RED_TEAM_PROVIDER` (`openai` or `anthropic`)
- `SENTINEL_RED_TEAM_MODEL` (default `claude-sonnet-4-6`)
- `SENTINEL_TASK_AGENT_TEMPERATURE`
- `SENTINEL_RED_TEAM_TEMPERATURE`

## Live Web Mode

- In lobby, pick **Live Web (Experimental)**.
- Optionally choose a preset:
  - Amazon
  - Google Flights
  - TechCrunch
- Preset tasks include common real-world browsing goals (cart, flights, newsletter signup).
- Enter:
  - `Live Target URL` (must be `http://` or `https://`)
  - `Live Task` (recommend read-only information retrieval)
- The run uses Playwright directly on the real page with constrained action types (`click_element`, `type_text`, `scroll_down`, `extract_answer`, `abort_run`) and LLM planning.
- Safety guardrails block or penalize clearly unsafe actions (e.g., checkout/login/password interactions).

## Seed Data

Create sample sessions:

```bash
npm run seed
```

Or from lobby, click **Generate Sample Seed Runs**.

## Export Formats

Per run:
- `/api/sentinel/[gameId]/export?format=json`
- `/api/sentinel/[gameId]/export?format=csv`
- `/api/sentinel/[gameId]/export?format=sharegpt`

Full dataset:
- `/api/sentinel/export?format=json`
- `/api/sentinel/export?format=csv`
- `/api/sentinel/export?format=sharegpt`

## Architecture

- Next.js route handlers drive simulation lifecycle and exports.
- Playwright runner (`src/lib/sentinel/runner.ts`) launches local Chromium, loads synthetic scenario pages, injects attacks, executes task actions, captures screenshots, and logs every step.
- Local-first storage writes session JSON files to:

```text
.sentinel-data/sessions/*.json
```

and screenshots to:

```text
public/sentinel-screens/<gameId>/step-XX.png
```

## Notes

- Active runtime path is fully Playwright-based and local-first.
