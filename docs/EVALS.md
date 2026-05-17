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

**Test cases run:** Helix "CFO wants finance automation", Helix "Engineering reorg", Northwind "HR exploration".

**Tuned:**
- Added "include at least one Claude Code use case" rule after early runs only returned API + CfE suggestions.
- Added explicit "time-to-first-value < 60 days beats 6-month bets" priority.
- Tool result schemas were initially too sparse — added `assumptions` block to `estimate_roi` so the narrative can cite the math.

**Gap:** Tool library only covers 6 functions. Real product would query a much larger taxonomy.

## Playbook Generator

**Test cases run:** Helix Train-the-Trainer, Helix Center of Excellence, Northwind CfE Seat Activation Campaign.

**Tuned:**
- Critic was originally too gentle — added "be tough. The CSM would rather hear it from you than the customer."
- Reviser was wrapping output in commentary — switched to "Return the revised playbook as JSON only — no commentary."
- Planner was producing generic owners ("the team") — explicit rule: "Owners must be roles, not names" with example.

**Gap:** Doesn't yet preserve the original draft's intent during revision — sometimes critic feedback prompts wholesale rewrites. Would benefit from a structured diff.

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
