# Claude SuccessOS

A working Customer Success command centre for teams adopting Claude, built as part of an application for the [Customer Success Manager, Strategics](https://job-boards.greenhouse.io/anthropic/jobs/5082455008) role at Anthropic.

It mirrors the role's requirements: driving AI adoption across all three Claude surfaces (API, Claude for Enterprise, Claude Code), managing both consumption- and seat-based business models, quantifying value, and operating change management at 100,000-employee scale.

## What it does

Every screen is operating software for a Strategic CSM:

- **Account Cockpit** — portfolio view of 3 synthetic Digital Native Business accounts
- **Account Detail** — adoption stage, consumption & seat dashboards, stakeholder map, risk signals, expansion levers, full use case portfolio
- **Account Brief** — Claude Opus with **extended thinking** produces a VP-ready brief, reasoning trace visible
- **QBR Composer** — Claude Sonnet **streams** a full Quarterly Business Review
- **Use Case Discovery Agent** — Claude with **tool use** queries a simulated use case library, estimates ROI, returns prioritized recommendations
- **Value Realization Ledger** — every realized outcome with baseline, current, $ value, validation source
- **Change Management Playbook Generator** — **multi-step agent** (plan → critique → revise) producing Train-the-Trainer, Center of Excellence, executive briefing, and seat activation playbooks
- **Pricing Translator** — turns the most-common customer confusion ("I already pay for Claude — why a separate API bill?") into a clear explainer

See `/about` in the running app for a JD-line-to-app-feature mapping.

## How Claude is used

| Capability | Where | Why |
|---|---|---|
| Extended thinking | Account Brief | Ambiguous signal interpretation — reviewers see Claude reason through trade-offs |
| Streaming | QBR Composer, Pricing Translator | Long-form structured output — perceived latency matters |
| Tool use | Use Case Discovery | Simulates agentic integration with internal systems |
| Multi-step agent | Playbook Generator | Plan → critique → revise produces enterprise-grade artifacts |
| Model selection | Throughout | Opus for ambiguity, Sonnet everywhere else, documented per prompt |

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind 4
- `@anthropic-ai/sdk` · Claude Opus 4.5 + Sonnet 4.5
- Recharts · react-markdown
- Hosted on Vercel

## Run locally

```bash
git clone https://github.com/DavLMZ/claude-successos.git
cd claude-successos
npm install

cp .env.example .env.local
# Edit .env.local and set ANTHROPIC_API_KEY

npm run dev
```

Open http://localhost:3000.

## Architecture

```
src/
├── app/
│   ├── page.tsx                          Account Cockpit (landing)
│   ├── account/[id]/                     Account detail with 6 tabs
│   ├── pricing-translator/page.tsx       Standalone pricing translator
│   ├── about/page.tsx                    JD mapping
│   └── api/
│       ├── analyze-account/              Extended thinking
│       ├── generate-qbr/                 Streaming
│       ├── discover-use-cases/           Tool use loop
│       ├── build-playbook/               Multi-step agent
│       └── pricing-translator/           Streaming
├── components/
│   ├── ui/                               Card, Button, Badge
│   ├── AccountCard.tsx
│   ├── AdoptionStageIndicator.tsx
│   ├── ConsumptionChart.tsx
│   └── ClaudeOutput.tsx                  Markdown + thinking blocks
├── lib/
│   ├── anthropic.ts                      SDK client + model constants
│   ├── adoption-model.ts                 Explore → First Build → Scale → Embed → Expand
│   ├── utils.ts
│   └── prompts/                          All system prompts, versioned
└── data/accounts.ts                      Helix, Northwind, Skyforge — synthetic
```

See `docs/PROMPT_LIBRARY.md`, `docs/ARCHITECTURE.md`, and `docs/EVALS.md` for more.

## Notes for reviewers

- All customer data is **synthetic**. "Helix Systems" is invented to match the role's profile (100k-person global tech leader, all three Claude surfaces).
- The Pricing Translator module was added after I personally hit the API-vs-subscription confusion while building this. It's a small but real example of CSM-empathy → product-thinking.
- The app uses real Anthropic API calls. Each interactive module costs roughly $0.01–$0.10 per run.

Built by David Le Maistre · david.lemaistrez@gmail.com
