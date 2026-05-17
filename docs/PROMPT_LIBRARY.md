# Prompt Library

Every system prompt is its own file under `src/lib/prompts/`. Each file leads with a header comment documenting the model chosen, the reasoning, and the expected output shape.

| Module | File | Model | Pattern |
|---|---|---|---|
| Account Brief | `account-brief.ts` | Sonnet 4.5 | Extended thinking + streaming |
| QBR Composer | `qbr.ts` | Sonnet 4.5 | Streaming |
| Use Case Discovery | `use-case-discovery.ts` | Sonnet 4.5 | Tool use (server-orchestrated) + streaming |
| Playbook Generator | `playbook.ts` | Haiku 4.5 | Single-pass with self-review |
| Pricing Translator | `pricing-translator.ts` | Sonnet 4.5 | Streaming |

## Model selection rationale

**Sonnet 4.5** is the default for tasks requiring nuanced reasoning or long-form prose:

- Account Brief: weighing consumption signals against stakeholder sentiment against expansion theses (with extended thinking enabled)
- QBR Composer: fixed section order, mostly drafting from provided data
- Use Case Discovery: synthesizing pre-fetched tool results into a prioritized recommendation
- Pricing Translator: explanatory writing against a known commercial model

**Haiku 4.5** is used where speed and structured output dominate:

- Playbook Generator: produces a ~2000-token nested JSON structure (playbook + self-review). Haiku 4.5 generates this in ~10-15s vs. Sonnet's 25-40s, while preserving quality for structured generation.

## Architecture trade-offs (V1)

Two modules made pragmatic V1 trade-offs to ship reliably under Vercel's 60s serverless timeout:

**Use Case Discovery** — the agent loop is server-orchestrated rather than model-orchestrated. The server infers the target function from the signal, executes the tool calls, then makes a single streaming Claude call to synthesize the recommendation. Tool use is real and visible in the UI; the only difference vs production is who holds the loop. This is documented inline in the Use Case Discovery tab.

**Playbook Generator** — collapsed from a 3-step (plan → critique → revise) multi-Claude-call architecture into a single Haiku call producing a playbook + VP self-review. Same agentic intent (Claude critiques its own work) in a single round-trip.

Both trade-offs are reversible. With Pro tier (300s timeout) or background jobs, both modules can be promoted to full model-orchestrated loops.
