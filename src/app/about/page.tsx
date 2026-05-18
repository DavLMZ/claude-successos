import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const CSM_REQUIREMENTS: { responsibility: string; delivery: string; where: string }[] = [
  {
    responsibility:
      "Be fluent across all three Claude surfaces — knowing which to recommend for which use case",
    delivery:
      "Three-surface adoption model. Every account screen breaks out API (consumption meter), Claude for Enterprise (seats), and Claude Code (seats) separately.",
    where: "Account detail · Overview",
  },
  {
    responsibility:
      "Monitor consumption and seat utilization, proactively address under-utilization across both meters",
    delivery:
      "Unified consumption + seat dashboards with 90-day trends. Risk signals flag under-utilization automatically.",
    where: "Account detail · Overview + Cockpit",
  },
  {
    responsibility: "Quantify business outcomes, ROI, and impact metrics with CFO-ready evidence",
    delivery:
      "Value Realization Ledger — every outcome with baseline, current, $ value, validation source. CFO-ready.",
    where: "Account detail · Value Ledger",
  },
  {
    responsibility:
      "Identify net-new use cases and lines of business across the customer's org",
    delivery:
      "Use Case Discovery Agent — Claude with tool use searches the use case library, estimates ROI, returns prioritized recommendations.",
    where: "Account detail · Use Case Discovery",
  },
  {
    responsibility:
      "Execute change management at enterprise scale — Train the Trainer, Center of Excellence, exec briefings, developer onboarding",
    delivery:
      "Change Management Playbook Generator with 5 motion types. Single-pass agent that drafts and self-reviews in one Claude call.",
    where: "Account detail · Change Mgmt Playbook",
  },
  {
    responsibility:
      "Run QBRs and serve as the two-way conduit between customer and Anthropic",
    delivery:
      "QBR Composer streams a full QBR draft with sections for both 'asks of customer' and 'asks of Anthropic'.",
    where: "Account detail · QBR Composer",
  },
  {
    responsibility:
      "Identify growth opportunities and translate them into actionable expansion plans",
    delivery:
      "Account Brief uses Claude Sonnet with extended thinking to reason through expansion theses with explicit risks. Streamed live.",
    where: "Account detail · Account Brief",
  },
  {
    responsibility:
      "Technical fluency across AI/ML concepts, API integrations, and commercial models — across stakeholders from devs to execs",
    delivery:
      "Pricing Translator turns the most-confused-about commercial reality (API vs subscription vs seats) into a clear customer-facing explainer.",
    where: "/pricing-translator",
  },
  {
    responsibility:
      "Build scalable engagement playbooks reusable across a portfolio of strategic accounts",
    delivery:
      "Cockpit handles a portfolio of strategic accounts (Helix, Northwind, Skyforge), not just one — playbook outputs are templated for reuse.",
    where: "Cockpit",
  },
];

const CLAUDE_CAPABILITIES = [
  {
    name: "Extended thinking",
    where: "Account Brief",
    why: "Multi-dimensional account analysis benefits from visible chain-of-reasoning. Sonnet 4.5 with thinking enabled, streamed live so the reasoning trace appears in real time.",
  },
  {
    name: "Streaming",
    where: "Account Brief, QBR Composer, Pricing Translator, Use Case Discovery",
    why: "Long-form structured documents — perceived latency matters when CSMs draft 10+ QBRs per quarter. Every long-form module streams.",
  },
  {
    name: "Tool use (function calling)",
    where: "Use Case Discovery",
    why: "Simulates the agentic pattern that production CS apps need — querying internal systems then reasoning over results. V1 ships with server-orchestrated tool execution (documented inline) for reliability under Vercel's 60s timeout.",
  },
  {
    name: "Self-reviewing single-pass generation",
    where: "Playbook Generator",
    why: "Claude drafts AND self-critiques in a single Haiku call (~10-15s). The self-review surfaces what a skeptical VP would push back on — agentic pattern without multi-call timeout fragility.",
  },
  {
    name: "Model selection (Sonnet vs Haiku)",
    where: "Throughout",
    why: "Sonnet 4.5 for nuanced reasoning (Account Brief, QBR, Use Case synthesis, Pricing); Haiku 4.5 for fast structured generation (Playbook). Each prompt file documents the choice.",
  },
  {
    name: "Structured outputs (JSON)",
    where: "Playbook Generator, Use Case Discovery",
    why: "Enables rich, typed UI rendering downstream. Schema in the system prompt; extraction in the route handler with fenced-block + fallback parsing.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">About Claude SuccessOS</h1>
        <p className="text-sm text-[var(--text-muted)]">
          A working Customer Success command centre for teams adopting Claude — built around the
          operating realities of a Strategic CSM.
        </p>
      </div>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">Why this exists</h2>
          <div className="space-y-3 text-sm text-[var(--text-muted)]">
            <p>
              A great Strategic CSM doesn&apos;t just <em>describe</em> what Claude can do — they
              build a system around it. Claude SuccessOS is that system, scoped down to a portfolio
              that fits on one screen.
            </p>
            <p>
              Every module mirrors a real Strategic CSM responsibility. Every interactive feature
              uses a different Claude capability so the product surface is on display, not just the
              brand. The flagship synthetic account, <strong>Helix Systems</strong>, is the
              canonical strategic profile: a 100,000-employee global tech leader running API +
              Claude for Enterprise + Claude Code in parallel.
            </p>
            <p>
              The codebase, the prompts, and the design choices are all artifacts of how a Strategic
              CSM should operate: opinionated, evidence-based, allergic to fluff.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">Strategic CSM requirements → how the app delivers</h2>
          <div className="space-y-3">
            {CSM_REQUIREMENTS.map((item, i) => (
              <div key={i} className="text-sm border-l-2 border-[var(--accent)]/40 pl-3">
                <div className="text-[var(--text-muted)] mb-1 text-xs">
                  <span className="text-[var(--accent-soft)] font-medium">Responsibility:</span>{" "}
                  {item.responsibility}
                </div>
                <div className="text-[var(--text)] mb-0.5">{item.delivery}</div>
                <div className="text-[var(--text-dim)] text-xs">→ {item.where}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">Claude capabilities demonstrated</h2>
          <div className="space-y-3">
            {CLAUDE_CAPABILITIES.map((c, i) => (
              <div key={i} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone="accent">{c.name}</Badge>
                  <span className="text-xs text-[var(--text-dim)]">in {c.where}</span>
                </div>
                <div className="text-[var(--text-muted)] text-xs">{c.why}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">A few intentional design choices</h2>
          <ul className="space-y-2 text-sm text-[var(--text-muted)] list-disc pl-5">
            <li>
              <strong className="text-[var(--text)]">Three synthetic accounts, not one.</strong> The
              deep case lives in Helix, but real Strategic CSM work is portfolio thinking — the
              cockpit reflects that.
            </li>
            <li>
              <strong className="text-[var(--text)]">
                Prompts live in their own files, versioned.
              </strong>{" "}
              Each prompt is annotated with the model chosen and why. Treating prompts as artifacts
              is how a serious CS team operates at scale.
            </li>
            <li>
              <strong className="text-[var(--text)]">
                Risk signals lead with leading indicators.
              </strong>{" "}
              Seat under-utilization, stalled pilots, stakeholder sentiment shifts — not churn or
              NPS, which arrive too late to act on.
            </li>
            <li>
              <strong className="text-[var(--text)]">
                The Pricing Translator is here on purpose.
              </strong>{" "}
              Commercial confusion (API vs subscription vs seats) is the single most common question
              any Anthropic CSM fields. Building a module for it is what CSM-empathy-to-product
              looks like.
            </li>
          </ul>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">Stack</h2>
          <div className="text-sm text-[var(--text-muted)] space-y-1">
            <div>Next.js 16 (App Router) · TypeScript · Tailwind 4 · Recharts</div>
            <div>Anthropic SDK · Claude Sonnet 4.5 + Claude Haiku 4.5</div>
            <div>Hosted on Vercel · Source on GitHub</div>
          </div>
        </div>
      </Card>

      <div className="text-center pt-4">
        <Link href="/" className="text-[var(--accent-soft)] hover:underline text-sm">
          ← Back to cockpit
        </Link>
      </div>
    </div>
  );
}
