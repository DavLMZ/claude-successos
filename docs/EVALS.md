# Eval notes

Quick eval log — what I tested, what I tuned, what gaps remain. Not a full evaluation harness, but enough to show I think about prompt regression.

## Account Brief

**Test cases run:** Helix (Scale stage, complex), Northwind (First Build, simple), Skyforge (Embed, overrun on commit).

**Tuned:**
- Original prompt let Claude hedge with "potentially" / "may" — tightened with explicit "no hedging" rule.
- Added "leading vs lagging indicator" guidance after initial outputs flagged churn instead of utilization trends.
- Added the "name the stakeholders" rule after Skyforge run referred to "the executive sponsor" generically.

**Gap:** Doesn't yet reason about the data residency / compliance dimension — would matter for regulated industries.

## QBR Composer

**Test cases run:** Helix Q2 2026 (full), Skyforge Q2 2026 (overrun-focused).

**Tuned:**
- Added "asks of Anthropic" section after a first draft was too one-sided (only asks of customer).
- Specified "no emoji, no 'leverage' as a verb, no 'synergy'" after Sonnet produced corporate-speak.
- Capped paragraph length at 3 sentences for skimmability.

**Gap:** Currently doesn't auto-include historical QBR comparison — could be added by passing prior QBR summary in context.

## Use Case Discovery

**Test cases run:** Helix "CFO wants finance automation", Helix "Engineering reorg", Helix "HR exploration", Helix "Legal blocking expansion".

**Architecture evolution (shipped in V1):**
- v1: Multi-turn agent loop where Claude held the loop and made tool calls across multiple turns. Hit Vercel 60s timeout reliably — Claude was making 18+ sequential tool calls.
- v2: Tightened prompt to enforce parallel tool calls + max turns. Reduced calls but still hit timeout when Claude's final synthesis turn was slow.
- v3 (shipped): Server-orchestrated tool execution. Server infers the target function from the signal, executes search + ROI + playbook tools synchronously, then makes one streaming Claude call to synthesize. ~15-20s reliably. Tool use pattern preserved, only loop ownership changed. Documented inline in the UI.

**Tuned:**
- Added "include at least one Claude Code use case" rule after early runs only returned API + CfE suggestions.
- Added explicit "time-to-first-value < 60 days beats 6-month bets" priority.
- Tool result schemas were initially too sparse — added `assumptions` block to `estimate_roi` so the narrative can cite the math.

**Gap:** Function extraction uses keyword matching. A real product would use a Haiku call to extract function + secondary signals from the signal text.

## Playbook Generator

**Test cases run:** Helix Train-the-Trainer, Helix Center of Excellence, Helix Executive Briefing.

**Architecture evolution (shipped in V1):**
- v1: 3 separate Claude calls (planner Sonnet → critic Opus → reviser Sonnet). Hit Vercel 60s timeout in ~40% of runs.
- v2: Same 3 calls but all Sonnet. Still timed out occasionally on the planner step alone.
- v3 (shipped): Single Haiku call producing playbook + built-in VP self-review. ~10-15s reliably. Same agentic intent in one round-trip.

**Tuned in current single-pass version:**
- Originally returned long-winded reviews — added "name 3 specific weaknesses" to force concrete pushback.
- Planner was producing generic owners ("the team") — explicit rule: "Owners must be roles, not names" with example.
- JSON schema reduced to 3-4 items per section after initial outputs were exhaustive but not skimmable.

**Gap:** Self-critique is less sharp than a separate Opus critic call would be. With longer timeout budget (Pro tier or background jobs), would revert to 3-call architecture.

## Pricing Translator

**Test cases run:** All 4 presets on the page.

**Tuned:**
- First version blamed the customer for confusion. Reframed: "If the pricing is confusing, say so."
- Added the resellers (Lovable, Replit, v0) context after my own confusion during this project — Sonnet didn't know to make the connection without the prompt hint.

**Gap:** Doesn't handle multi-currency or regional pricing differences.

## What's missing (would build with more time)

1. Automated eval harness with golden outputs per module, run in CI.
2. Prompt caching on the use case library and value evidence — currently re-sent each call.
3. A `/voc` page synthesizing customer feedback into structured Anthropic product input.
4. Per-account QBR history — letting Claude diff Q1 vs Q2 progress instead of starting cold.
