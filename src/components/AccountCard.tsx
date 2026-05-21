import Link from "next/link";
import type { Account } from "@/data/accounts";
import { AdoptionStageIndicator } from "./AdoptionStageIndicator";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { formatCurrency } from "@/lib/utils";

const PRODUCT_ADOPTED_CLASSES = {
  ElevenAgents:  "bg-[var(--eleven-agents)]/15 text-[var(--eleven-agents)] border-[var(--eleven-agents)]/30",
  ElevenCreative:"bg-[var(--eleven-creative)]/15 text-[var(--eleven-creative)] border-[var(--eleven-creative)]/30",
  ElevenAPI:     "bg-[var(--eleven-api)]/15 text-[var(--eleven-api)] border-[var(--eleven-api)]/30",
} as const;

export function AccountCard({ account }: { account: Account }) {
  const topRisk = account.risks[0];
  const allProducts = ["ElevenAgents", "ElevenCreative", "ElevenAPI"] as const;

  const lastMonth = account.consumption.slice(-30);
  const prevMonth = account.consumption.slice(-60, -30);
  const lastAgents = lastMonth.reduce((s, p) => s + p.agentCallVolume, 0);
  const prevAgents = prevMonth.reduce((s, p) => s + p.agentCallVolume, 0);
  const lastApi = lastMonth.reduce((s, p) => s + p.apiCharacters, 0);
  const prevApi = prevMonth.reduce((s, p) => s + p.apiCharacters, 0);

  const dominantTrend = lastAgents > 0
    ? (prevAgents > 0 ? Math.round(((lastAgents - prevAgents) / prevAgents) * 100) : null)
    : lastApi > 0
      ? (prevApi > 0 ? Math.round(((lastApi - prevApi) / prevApi) * 100) : null)
      : null;

  return (
    <Link href={`/account/${account.id}`} className="block group">
      <Card className="hover:border-[var(--border-strong)] transition-colors h-full">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-[var(--accent-soft)] transition-colors">
                {account.name}
              </h3>
              <p className="text-xs text-[var(--text-dim)] mt-0.5">
                {account.country} · {account.industry}
              </p>
            </div>
            <Badge tone="accent">{account.stage}</Badge>
          </div>

          {/* Adoption stage bar */}
          <AdoptionStageIndicator stage={account.stage} size="sm" />

          {/* Product adoption matrix (mini) */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {allProducts.map((p) => {
              const isAdopted = account.products.adopted.includes(p);
              const isTrialling = account.products.trialling.includes(p);
              return (
                <div key={p} className="text-center">
                  <div
                    className={`rounded px-1 py-1 text-[10px] font-medium border ${
                      isAdopted
                        ? PRODUCT_ADOPTED_CLASSES[p]
                        : isTrialling
                          ? "bg-[var(--amber)]/15 text-[var(--amber)] border-[var(--amber)]/30"
                          : "bg-[var(--bg-elev)] text-[var(--text-dim)] border-[var(--border)]"
                    }`}
                  >
                    {p.replace("Eleven", "")}
                  </div>
                  <div className="text-[9px] text-[var(--text-dim)] mt-0.5">
                    {isAdopted ? "live" : isTrialling ? "trial" : "gap"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metrics row */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
            <div className="text-[var(--text-dim)]">
              NRR{" "}
              <span
                className={
                  account.nrr >= 1.2
                    ? "text-[var(--green)]"
                    : account.nrr >= 1.0
                      ? "text-[var(--amber)]"
                      : "text-[var(--red)]"
                }
              >
                {(account.nrr * 100).toFixed(0)}%
              </span>
            </div>
            {dominantTrend !== null && (
              <div className="text-[var(--text-dim)]">
                30d{" "}
                <span className={dominantTrend > 0 ? "text-[var(--green)]" : "text-[var(--red)]"}>
                  {dominantTrend > 0 ? "+" : ""}
                  {dominantTrend}%
                </span>
              </div>
            )}
            <div className="text-[var(--text-dim)]">ACV {formatCurrency(account.contractValue)}</div>
          </div>

          {/* Risk signal */}
          {topRisk && (
            <div className="flex items-start gap-2 text-xs pt-2 border-t border-[var(--border)]">
              <Badge
                tone={
                  topRisk.level === "high" ? "red" : topRisk.level === "medium" ? "amber" : "muted"
                }
              >
                {topRisk.level}
              </Badge>
              <span className="text-[var(--text-muted)] line-clamp-2">{topRisk.label}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
