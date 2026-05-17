# Architecture

## Request shapes

```
Browser  ──(POST /api/{module})──▶  Next.js Route Handler
                                          │
                                          ├─ load synthetic account from src/data/accounts.ts
                                          ├─ load system prompt from src/lib/prompts/
                                          ├─ call anthropic SDK
                                          │     ├─ Account Brief: messages.create + thinking
                                          │     ├─ QBR / Pricing: messages.stream
                                          │     ├─ Use Cases: messages.create + tools (loop)
                                          │     └─ Playbook: 3x messages.create (plan/critique/revise)
                                          │
                                          ▼
                                  JSON or stream response
                                          │
                                          ▼
                              React client renders with
                              ClaudeOutput (markdown) or
                              custom structured UI
```

## Adoption stage model

The state machine `Explore → First Build → Scale → Embed → Expand` runs through every screen. Defined once in `src/lib/adoption-model.ts` and referenced from:

- Account cards (stage badge + progress indicator)
- Account brief system prompt (asks Claude to locate the customer on this arc)
- About page (explains the model)

## Why three accounts not one

The JD focuses on a single 100,000-employee tech customer. Helix Systems is the depth case. Northwind (12k-person SaaS at "First Build") and Skyforge (850-person AI-native at "Embed") exist to show portfolio thinking and the spread of motions a Strategic CSM runs across different stages.

## Why everything streams (where possible)

CSMs run dozens of QBRs and account briefs per quarter. Wait time compounds. The streaming UX is a tiny investment that signals respect for the user's time — a habit worth carrying into customer-facing tooling.

## What's intentionally not built

- Authentication — single-tenant demo, no need
- Persistence — all data lives in `src/data/accounts.ts`. State for in-progress generations lives in the client component
- Multi-user collaboration — out of scope for a portfolio piece
- Real-time consumption data ingestion — the consumption series is synthetically generated with realistic shape (trend + noise)

These omissions are deliberate. Building them would dilute the signal: the value is in the prompt engineering, the JD mapping, and the CS-first product design — not in re-implementing Salesforce.
