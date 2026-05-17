import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const JD_MAP: { jdQuote: string; appProof: string; where: string }[] = [
  {
    jdQuote: "Become an expert in Anthropic's products across API, Claude Code and Claude for Enterprise",
    appProof: "Three-surface adoption model. Every account screen breaks out API (consumption meter), CfE (seats), and Claude Code (seats) separately.",
    where: "Account detail · Overview",
  },
  {
    jdQuote: "Monitor usage patterns and identify optimization opportunities, proactively addressing underutilization",
    appProof: "Unified consumption + seat dashboards with 90-day trends. Risk signals flag under-utilization automatically.",
    where: "Account detail · Overview + Cockpit",
  },
  {
    jdQuote: "Document and quantify customer value realized through business outcomes, ROI, and impact metrics",
    appProof: "Value Realization Ledger — every outcome with baseline, current, $ value, validation source. CFO-ready.",
    where: "Account detail · Value Ledger",
  },
  {
    jdQuote: "Identify potential use cases and lines of business not currently onboarded",
    appProof: "Use Case Discovery Agent — Claude with tool use searches the use case library, estimates ROI, returns prioritized list.",
    where: "Account detail · Use Case Discovery",
  },
  {
    jdQuote: "Develop and execute change management strategies... Train the Trainer programs, Center of Excellence development",
    appProof: "Change Management Playbook Generator with 5 motion types. Multi-step agent: plan → critique → revise.",
    where: "Account detail · Change Mgmt Playbook",
  },
  {
    jdQuote: "Conducting Quarterly Business Reviews, and serving as the primary conduit between the customer and Anthropic",
    appProof: "QBR Composer streams a full QBR draft with sections for both 'asks of customer' and 'asks of Anthropic'.",
    where: "Account detail · QBR Composer",
  },
  {
    jdQuote: "Strategic mindset to identify growth opportunities and translate them into actionable expansion plans",
    appProof: "Account Brief uses Claude Opus extended thinking to reason through expansion theses with explicit risks.",
    where: "Account detail · Account Brief",
  },
  {
    jdQuote: "Technical fluency with ability to understand and articulate AI/ML concepts",
    appProof: "Pricing Translator turns the most-confused-about commercial reality into a clear customer-facing explainer.",
    where: "/pricing-translator",
  },
  {
    jdQuote: "Develop scalable engagement strategies and playbooks for your customer that can be utilized across other high-touch strategic DNB accounts",
    appProof: "Cockpit handles a portfolio of DNB accounts (Helix, Northwind, Skyforge), not just one — playbook outputs are templated for reuse.",
    where: "Cockpit",
  },
];

const CLAUDE_CAPABILITIES = [
  { name: "Extended thinking", where: "Account Brief", why: "Multi-dimensional account analysis benefits from visible chain-of-reasoning. Reviewers can audit the trace." },
  { name: "Streaming", where: "QBR Composer, Pricing Translator", why: "Long-form structured documents — perceived latency matters when CSMs draft 10+ QBRs per quarter." },
  { name: "Tool use (function calling)", where: "Use Case Discovery", why: "Simulates the agentic pattern that production CS apps need — Claude querying internal systems then reasoning over results." },
  { name: "Multi-step agent (plan → critique → revise)", where: "Playbook Generator", why: "The pattern that produces enterprise-grade artifacts. Critic is Opus for sharpness; planner + reviser are Sonnet for cost." },
  { name: "Model selection (Opus vs Sonnet)", where: "Throughout", why: "Opus for ambiguous reasoning (Account Brief, Playbook Critic); Sonnet everywhere else. Documented in each prompt file header." },
  { name: "Structured outputs (JSON)", where: "Playbook Generator", why: "Enables rich, typed UI rendering downstream. Schema in the system prompt; extraction in the route handler." },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">About Claude SuccessOS</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Built as part of the application process for the{" "}
          <a
            href="https://job-boards.greenhouse.io/anthropic/jobs/5082455008"
            target="_blank"
            rel="noopener"
            className="text-[var(--accent-soft)] hover:underline"
          >
            Customer Success Manager, Strategics
          </a>{" "}
          role at Anthropic.
        </p>
      </div>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">Why I built this</h2>
          <div className="space-y-3 text-sm text-[var(--text-muted)]">
            <p>
              A great Strategic CSM doesn&apos;t just <em>describe</em> what Claude can do — they
              build a system around it. This app is that system, scoped down to a portfolio I could
              ship in days.
            </p>
            <p>
              Every module maps to a line in the JD. Every interactive feature uses a different
              Claude capability so reviewers can see I understand the product surface, not just the
              brand. The synthetic account &quot;Helix Systems&quot; is what the JD describes —
              a global tech leader with 100k employees using API + CfE + Claude Code.
            </p>
            <p>
              The codebase, the prompts, and the design choices are all artifacts of how I&apos;d
              operate as the CSM for one of these accounts: opinionated, evidence-based, allergic
              to fluff.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">JD requirements → app proof</h2>
          <div className="space-y-3">
            {JD_MAP.map((item, i) => (
              <div key={i} className="text-sm border-l-2 border-[var(--accent)]/40 pl-3">
                <div className="text-[var(--text-muted)] italic mb-1 text-xs">
                  &ldquo;{item.jdQuote}&rdquo;
                </div>
                <div className="text-[var(--text)] mb-0.5">{item.appProof}</div>
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
              JD focuses on a single global tech leader, but a CSM&apos;s real job is portfolio
              thinking. The cockpit shows you scale, even when most of the depth lives in one
              account (Helix).
            </li>
            <li>
              <strong className="text-[var(--text)]">Prompts live in their own files,
              versioned.</strong> Each prompt is annotated with the model chosen and why. Treating
              prompts as artifacts is how a serious CS team operates internally at Anthropic.
            </li>
            <li>
              <strong className="text-[var(--text)]">Risk signals lead with leading
              indicators.</strong> Seat under-utilization, stalled pilots, stakeholder sentiment
              shifts — not churn or NPS, which arrive too late to act on.
            </li>
            <li>
              <strong className="text-[var(--text)]">The Pricing Translator is here on
              purpose.</strong> Most candidates won&apos;t name commercial confusion as a problem.
              I built a module for it because I lived it during this application.
            </li>
          </ul>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-3">Stack</h2>
          <div className="text-sm text-[var(--text-muted)] space-y-1">
            <div>Next.js 16 (App Router) · TypeScript · Tailwind 4 · Recharts</div>
            <div>Anthropic SDK · Claude Opus 4.5 + Claude Sonnet 4.5</div>
            <div>Hosted on Vercel · Source on GitHub</div>
          </div>
        </div>
      </Card>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="text-[var(--accent-soft)] hover:underline text-sm"
        >
          ← Back to cockpit
        </Link>
      </div>
    </div>
  );
}
