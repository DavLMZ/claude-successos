import Link from "next/link";
import type { Account } from "@/data/accounts";
import { AdoptionStageIndicator } from "./AdoptionStageIndicator";
import { Badge } from "./ui/Badge";
import { formatCurrency } from "@/lib/utils";

// Product dot colours
const PRODUCT_COLOR: Record<"ElevenAgents" | "ElevenCreative" | "ElevenAPI", string> = {
  ElevenAgents:  "var(--eleven-agents)",
  ElevenCreative:"var(--eleven-creative)",
  ElevenAPI:     "var(--eleven-api)",
};

const ALL_PRODUCTS = ["ElevenAgents", "ElevenCreative", "ElevenAPI"] as const;

export function AccountCard({ account }: { account: Account }) {
  const topRisk = account.risks[0];

  // Left accent colour — instant triage at a glance
  const accentColor =
    topRisk?.level === "high"   ? "var(--red)"          :
    topRisk?.level === "medium" ? "var(--amber)"        :
    account.nrr >= 1.2          ? "var(--green)"        :
                                  "var(--border-strong)";

  // 30-day consumption trend
  const lastMonth = account.consumption.slice(-30);
  const prevMonth = account.consumption.slice(-60, -30);
  const lastAgents = lastMonth.reduce((s, p) => s + p.agentCallVolume, 0);
  const prevAgents = prevMonth.reduce((s, p) => s + p.agentCallVolume, 0);
  const lastApi    = lastMonth.reduce((s, p) => s + p.apiCharacters, 0);
  const prevApi    = prevMonth.reduce((s, p) => s + p.apiCharacters, 0);

  const dominantTrend =
    lastAgents > 0
      ? prevAgents > 0 ? Math.round(((lastAgents - prevAgents) / prevAgents) * 100) : null
      : lastApi > 0
        ? prevApi > 0 ? Math.round(((lastApi - prevApi) / prevApi) * 100) : null
        : null;

  return (
    <Link href={`/account/${account.id}`} className="block group">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-strong)] transition-colors h-full relative overflow-hidden">

        {/* Left triage accent stripe */}
        <div className="absolute left-0 inset-y-0 w-[3px]" style={{ background: accentColor }} />

        <div className="p-5 space-y-3 pl-[22px]">

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-snug group-hover:text-[var(--accent-soft)] transition-colors truncate">
                {account.name}
              </h3>
              <p className="text-xs text-[var(--text-dim)] mt-0.5">
                {account.country} · {account.industry}
              </p>
            </div>
            <Badge tone="accent" className="shrink-0">{account.stage}</Badge>
          </div>

          {/* Adoption stage bar */}
          <AdoptionStageIndicator stage={account.stage} size="sm" />

          {/* Compact product dots */}
          <div className="flex items-center gap-4">
            {ALL_PRODUCTS.map((p) => {
              const isLive     = account.products.adopted.includes(p);
              const isTrial    = account.products.trialling.includes(p);
              const dotColor   = isLive ? PRODUCT_COLOR[p] : isTrial ? "var(--amber)" : "var(--border-strong)";
              const short      = p.replace("Eleven", "");
              return (
                <div key={p} className="flex items-center gap-1.5">
                  {/* Dot: filled = live, ring = trial, dim ring = gap */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0 transition-colors"
                    style={{
                      background:   isLive || isTrial ? dotColor : "transparent",
                      border:       `1.5px solid ${dotColor}`,
                      opacity:      !isLive && !isTrial ? 0.35 : 1,
                    }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: isLive ? dotColor : isTrial ? "var(--amber)" : "var(--text-dim)" }}
                  >
                    {short}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Metrics row */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
            <div className="text-[var(--text-dim)]">
              NRR{" "}
              <span
                className="font-semibold"
                style={{
                  color:
                    account.nrr >= 1.2 ? "var(--green)" :
                    account.nrr >= 1.0 ? "var(--amber)" :
                                         "var(--red)",
                }}
              >
                {(account.nrr * 100).toFixed(0)}%
              </span>
            </div>
            {dominantTrend !== null && (
              <div className="text-[var(--text-dim)]">
                30d{" "}
                <span style={{ color: dominantTrend > 0 ? "var(--green)" : "var(--red)" }}>
                  {dominantTrend > 0 ? "+" : ""}{dominantTrend}%
                </span>
              </div>
            )}
            <div className="text-[var(--text-dim)]">ACV {formatCurrency(account.contractValue)}</div>
          </div>

          {/* Top risk */}
          {topRisk && (
            <div className="flex items-start gap-2 text-xs pt-1 border-t border-[var(--border)]">
              <Badge
                tone={topRisk.level === "high" ? "red" : topRisk.level === "medium" ? "amber" : "muted"}
              >
                {topRisk.level}
              </Badge>
              <span className="text-[var(--text-muted)] line-clamp-2">{topRisk.label}</span>
            </div>
          )}

        </div>
      </div>
    </Link>
  );
}
