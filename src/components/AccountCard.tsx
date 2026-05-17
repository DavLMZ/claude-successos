import Link from "next/link";
import type { Account } from "@/data/accounts";
import { AdoptionStageIndicator } from "./AdoptionStageIndicator";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function AccountCard({ account }: { account: Account }) {
  const topRisk = account.risks[0];
  const apiPct = Math.round(
    (account.surfaces.api.consumed / account.surfaces.api.contracted) * 100,
  );
  const cfePct = Math.round(
    (account.surfaces.cfe.activated / Math.max(account.surfaces.cfe.seats, 1)) * 100,
  );
  const codePct = account.surfaces.code.seats > 0
    ? Math.round((account.surfaces.code.activated / account.surfaces.code.seats) * 100)
    : null;

  const lastMonth = account.consumption.slice(-30);
  const prevMonth = account.consumption.slice(-60, -30);
  const lastSpend = lastMonth.reduce((s, p) => s + p.apiSpend, 0);
  const prevSpend = prevMonth.reduce((s, p) => s + p.apiSpend, 0);
  const trend = prevSpend > 0 ? Math.round(((lastSpend - prevSpend) / prevSpend) * 100) : 0;

  return (
    <Link href={`/account/${account.id}`} className="block group">
      <Card className="hover:border-[var(--border-strong)] transition-colors h-full">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-[var(--accent-soft)] transition-colors">
                {account.name}
              </h3>
              <p className="text-xs text-[var(--text-dim)] mt-0.5">
                {account.industry} · {formatNumber(account.employees)} employees
              </p>
            </div>
            <Badge tone="accent">{account.stage}</Badge>
          </div>

          <AdoptionStageIndicator stage={account.stage} />

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-[var(--text-dim)] mb-1">API</div>
              <div className="font-semibold">{apiPct}%</div>
              <div className="text-[10px] text-[var(--text-dim)]">of commit</div>
            </div>
            <div>
              <div className="text-[var(--text-dim)] mb-1">CfE seats</div>
              <div className="font-semibold">{cfePct}%</div>
              <div className="text-[10px] text-[var(--text-dim)]">
                {account.surfaces.cfe.activated}/{account.surfaces.cfe.seats}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-dim)] mb-1">Claude Code</div>
              <div className="font-semibold">{codePct !== null ? `${codePct}%` : "—"}</div>
              <div className="text-[10px] text-[var(--text-dim)]">
                {account.surfaces.code.seats > 0
                  ? `${account.surfaces.code.activated}/${account.surfaces.code.seats}`
                  : "not yet"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
            <div className="text-[var(--text-dim)]">
              30d spend trend{" "}
              <span
                className={
                  trend > 0 ? "text-[var(--green)]" : trend < 0 ? "text-[var(--red)]" : ""
                }
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
            <div className="text-[var(--text-dim)]">
              ACV {formatCurrency(account.contractValue)}
            </div>
          </div>

          {topRisk && (
            <div className="flex items-start gap-2 text-xs pt-2 border-t border-[var(--border)]">
              <Badge tone={topRisk.level === "high" ? "red" : topRisk.level === "medium" ? "amber" : "muted"}>
                {topRisk.level} risk
              </Badge>
              <span className="text-[var(--text-muted)] line-clamp-2">{topRisk.label}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
