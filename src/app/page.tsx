import { AccountCard } from "@/components/AccountCard";
import { ACCOUNTS } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  const totalACV = ACCOUNTS.reduce((s, a) => s + a.contractValue, 0);
  const avgNrr = ACCOUNTS.reduce((s, a) => s + a.nrr, 0) / ACCOUNTS.length;
  const highRisks = ACCOUNTS.flatMap((a) =>
    a.risks.filter((r) => r.level === "high").map((r) => ({ ...r, account: a.name, id: a.id })),
  );
  const expansionPipeline = ACCOUNTS.reduce((s, a) => s + (a.nrr - 1) * a.contractValue, 0);

  const byStage = {
    "First Build": ACCOUNTS.filter((a) => a.stage === "First Build").length,
    Production: ACCOUNTS.filter((a) => a.stage === "Production").length,
    Expanding: ACCOUNTS.filter((a) => a.stage === "Expanding").length,
    Champion: ACCOUNTS.filter((a) => a.stage === "Champion").length,
    Strategic: ACCOUNTS.filter((a) => a.stage === "Strategic").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio Command Centre</h1>
          <span className="text-sm text-[var(--text-dim)]">
            {ACCOUNTS.length} strategic accounts · Western Europe
          </span>
        </div>
        <p className="text-sm text-[var(--text-muted)] max-w-3xl">
          ElevenLabs SuccessOS — the operating system for enterprise adoption across{" "}
          <span className="text-[var(--accent-soft)]">ElevenAgents</span>,{" "}
          <span className="text-[var(--accent-soft)]">ElevenCreative</span>, and{" "}
          <span className="text-[var(--accent-soft)]">ElevenAPI</span>. Every account brief,
          QBR, expansion signal and playbook is AI-generated using Claude.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Portfolio ACV</div>
            <div className="text-2xl font-semibold">{formatCurrency(totalACV)}</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">
              {ACCOUNTS.length} strategic accounts
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Portfolio NRR</div>
            <div className="text-2xl font-semibold text-[var(--green)]">
              {(avgNrr * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">
              Target: ≥120%
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Expansion pipeline</div>
            <div className="text-2xl font-semibold text-[var(--accent-soft)]">
              {formatCurrency(expansionPipeline)}
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">In-year expansion value</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">High-severity risks</div>
            <div className="text-2xl font-semibold text-[var(--red)]">{highRisks.length}</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">
              Requiring attention this week
            </div>
          </div>
        </Card>
      </div>

      {/* Adoption funnel */}
      <Card className="mb-8">
        <div className="p-5">
          <div className="text-xs text-[var(--text-dim)] mb-3 font-medium uppercase tracking-wider">
            Adoption pipeline
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(byStage).map(([stage, count]) => (
              <div key={stage} className="text-center">
                <div className="text-xl font-semibold">{count}</div>
                <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{stage}</div>
                <div
                  className="mt-2 h-1 rounded-full mx-auto"
                  style={{
                    width: "100%",
                    background:
                      stage === "Strategic"
                        ? "var(--green)"
                        : stage === "Champion"
                          ? "var(--accent-soft)"
                          : stage === "Expanding"
                            ? "var(--accent)"
                            : stage === "Production"
                              ? "var(--amber)"
                              : "var(--border-strong)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Account grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {ACCOUNTS.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      {/* Risk watchlist */}
      {highRisks.length > 0 && (
        <Card className="mb-8">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">This week&apos;s risk watchlist</h2>
              <Badge tone="red">{highRisks.length} high</Badge>
            </div>
            <div className="space-y-2">
              {highRisks.map((r, i) => (
                <Link
                  key={i}
                  href={`/account/${r.id}`}
                  className="flex items-start gap-3 p-3 rounded-md hover:bg-[var(--bg-elev)] transition-colors"
                >
                  <Badge tone="red">{r.account}</Badge>
                  <div className="text-sm">
                    <div className="font-medium">{r.label}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{r.detail}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* About the app */}
      <Card>
        <div className="p-5 text-sm text-[var(--text-muted)]">
          <div className="font-semibold text-[var(--text)] mb-2">About ElevenLabs SuccessOS</div>
          <p className="mb-2">
            Built as part of the Customer Success — Strategic — Western Europe application at
            ElevenLabs. This app mirrors the operating reality of a Strategic CSM owning 20-30
            enterprise accounts across DACH, France, and the Nordics — driving NRR, new product
            expansion across ElevenAgents, ElevenCreative, and ElevenAPI, and navigating the
            journey from first build to durable adoption.
          </p>
          <p className="mb-2">
            Every interactive module uses Claude (Anthropic) — extended thinking for account
            briefs, streaming for QBR generation, tool use for expansion signal discovery, and
            self-reviewing single-pass generation for adoption playbooks. The Voice Briefing
            feature uses ElevenLabs&apos; own API — because an AI CSM tool for ElevenLabs
            should speak.
          </p>
          <p>
            See <Link href="/about" className="underline">/about</Link> for the full
            AI feature map, or explore the{" "}
            <Link href="/adoption-matrix" className="underline">Adoption Matrix</Link> and{" "}
            <Link href="/revenue-engine" className="underline">Revenue Engine</Link>.
          </p>
        </div>
      </Card>
    </div>
  );
}
