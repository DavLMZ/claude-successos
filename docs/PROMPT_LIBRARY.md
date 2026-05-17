# Prompt Library

Every system prompt is its own file under `src/lib/prompts/`. Each file leads with a header comment documenting the model chosen, the reasoning, and the expected output shape.

| Module | File | Model | Pattern |
|---|---|---|---|
| Account Brief | `account-brief.ts` | Opus 4.5 | Extended thinking |
| QBR Composer | `qbr.ts` | Sonnet 4.5 | Streaming |
| Use Case Discovery | `use-case-discovery.ts` | Sonnet 4.5 | Tool use loop |
| Playbook Planner | `playbook.ts` (PLANNER) | Sonnet 4.5 | Structured JSON |
| Playbook Critic | `playbook.ts` (CRITIC) | Opus 4.5 | Structured JSON |
| Playbook Reviser | `playbook.ts` (REVISER) | Sonnet 4.5 | Structured JSON |
| Pricing Translator | `pricing-translator.ts` | Sonnet 4.5 | Streaming |

## Model selection rationale

**Opus 4.5** is reserved for tasks where ambiguity-resolution dominates:

- Account Brief: weighing consumption signals against stakeholder sentiment against expansion theses
- Playbook Critic: needs to be the sharpest, most skeptical voice in the multi-step chain

**Sonnet 4.5** is the default for tasks with a clear structure or a known output shape:

- QBR Composer: fixed section order, mostly drafting from provided data
- Use Case Discovery: tool-call loop where reasoning is mostly delegated to tool results
- Pricing Translator: explanatory writing against a known commercial model
- Playbook Planner / Reviser: producing JSON against a fixed schema

This split is documented in each prompt header so future maintainers (and reviewers) can audit the choice.
