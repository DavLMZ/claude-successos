import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">About ElevenLabs SuccessOS</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Built for the Customer Success — Strategic — Western Europe application at ElevenLabs.
        </p>
      </div>

      {/* Why this app */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="font-semibold mb-3">What this app demonstrates</h2>
          <div className="space-y-3 text-sm text-[var(--text-muted)]">
            <p>
              This app is designed to show three things simultaneously: deep understanding of
              ElevenLabs&apos; product suite, a working model of how enterprise CS operates at
              ElevenLabs, and genuine AI-native operating style — not just in the job but in how
              the application itself was built and presented.
            </p>
            <p>
              Vanessa Piacente said it directly: &ldquo;The people who have impressed me the most
              as we&apos;re hiring are people who are going above and beyond — they&apos;ve taken
              the time to learn ElevenLabs, even if they don&apos;t use ElevenLabs day-to-day,
              then put a demo together and sent it.&rdquo;
            </p>
            <p>
              This app does exactly that — and goes one step further by using ElevenLabs&apos; own
              API to generate voice briefings. The AI CSM that speaks is not a gimmick: it mirrors
              precisely what Vanessa described building internally.
            </p>
          </div>
        </div>
      </Card>

      {/* AI feature map */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="font-semibold mb-4">AI feature map</h2>
          <div className="space-y-4">
            {[
              {
                feature: "Account Brief",
                model: "claude-sonnet-4-6",
                technique: "Extended thinking + Streaming",
                why: "Extended thinking shows the reasoning chain — not just conclusions. Streaming means a CSM sees the brief word-by-word rather than waiting. Together they mirror how a senior CSM would actually think through an account before a meeting.",
              },
              {
                feature: "QBR Composer",
                model: "claude-sonnet-4-6",
                technique: "Streaming",
                why: "QBRs have a fixed structure that Sonnet executes well. Streaming gives the CSM instant feedback and makes the generation feel alive rather than a black-box wait.",
              },
              {
                feature: "Expansion Signal Discovery",
                model: "claude-haiku-4-5",
                technique: "Tool use (server-orchestrated)",
                why: "The agent queries a mock ElevenLabs use case library, ROI engine, and expansion signal database — then synthesises. Tool use is server-orchestrated for Vercel's 60s timeout reliability; in production it would be a full agent loop.",
              },
              {
                feature: "Adoption Playbook",
                model: "claude-haiku-4-5",
                technique: "Self-reviewing single-pass JSON",
                why: "Haiku generates the full 30/60/90 playbook AND a VP-level self-review critique in one call. The self-review is the guard rail — it surfaces what a skeptical VP would push back on before the CSM sends it to a customer exec.",
              },
              {
                feature: "Voice Briefing",
                model: "ElevenLabs Eleven Multilingual v2",
                technique: "ElevenLabs API + Claude script generation",
                why: "Claude writes the script. ElevenLabs speaks it. This is the meta feature — a Customer Success tool for ElevenLabs that uses ElevenLabs' own voice technology. It mirrors the AI CSM motion Vanessa described: pulling account context and surfacing insights proactively, now narrated.",
              },
            ].map((item) => (
              <div key={item.feature} className="border border-[var(--border)] rounded-md p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-semibold text-sm">{item.feature}</div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <Badge tone="muted">{item.model}</Badge>
                    <Badge tone="accent">{item.technique}</Badge>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ElevenLabs CS model */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="font-semibold mb-3">How this maps to the ElevenLabs CS model</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: "Two core metrics",
                value: "NRR and New Product Expansion — both tracked in the Revenue Engine and per-account.",
              },
              {
                label: "Three product surfaces",
                value: "ElevenAgents, ElevenCreative, ElevenAPI — all modelled with distinct metrics and use cases.",
              },
              {
                label: "Adoption journey",
                value: "First Build → Production → Expanding → Champion → Strategic. Critical 30-60 day window modelled.",
              },
              {
                label: "AI CSM motion",
                value: "Pulling context, surfacing proactive ideas, expansion signals from trialling data — mirroring Vanessa's internal build.",
              },
              {
                label: "DACH / WE market nuance",
                value: "GDPR, EU AI Act, German procurement cycles, French compliance culture — all flagged in prompts and data.",
              },
              {
                label: "Whitespace expansion",
                value: "Accounts given product access before contract (ElevenLabs' model) — trialling signals drive the expansion matrix.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-[var(--bg-elev)] rounded-md p-3">
                <div className="text-xs font-medium text-[var(--text)] mb-1">{item.label}</div>
                <div className="text-xs text-[var(--text-muted)]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Data note */}
      <Card>
        <div className="p-5 text-xs text-[var(--text-muted)]">
          <strong className="text-[var(--text)]">Data note:</strong> All account data is synthetic.
          Company names are real but all metrics, stakeholder names, and use cases are fictional.
          No confidential data was used. The consumption time series is procedurally generated.
          See{" "}
          <Link href="/" className="underline">
            the portfolio
          </Link>{" "}
          to explore the accounts, or start with{" "}
          <Link href="/account/telekom" className="underline">
            Deutsche Telekom
          </Link>{" "}
          for the most complete example.
        </div>
      </Card>
    </div>
  );
}
