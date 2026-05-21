import { ACCOUNTS } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function RevenueEngine() {
  const startingArr = ACCOUNTS.reduce((s, a) => s + a.contractValue, 0);
  const churn = 0;
  const expansion = ACCOUNTS.reduce((s, a) => s + Math.max(0, a.nrr - 1) * a.contractValue, 0);
  const endingArr = startingArr + expansion - churn;
  const portfolioNrr = endingArr / startingArr;
  const portfolioGrr = (startingArr - churn) / startingArr;

  const renewalsNext90 = ACCOUNTS.filter((a) => {
    const renewalDate = new Date(a.renewalDate);
    const now = new Date();
    const in90 = new Date(now);
    in90.setDate(in90.getDate() + 90);
    return renewalDate <= in90;
  });

  const expansionOpps = ACCOUNTS.filter((a) => a.products.trialling.length > 0 || a.expansionLevers.length > 0)
    .sort((a, b) => b.contractValue - a.contractValue)
    .slice(0, 5);

  const byNrr = [...ACCOUNTS].sort((a, b) => b.nrr - a.nrr);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Revenue Engine</h1>
          <span className="text-sm text-[var(--text-dim)]">NRR · GRR · Expansion pipeline</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] max-w-3xl">
          ElevenLabs CS owns two metrics: Net Revenue Retention and New Product Expansion. This
          view is the revenue operating system — waterfall, renewal pipeline, expansion signals,
          forecast confidence.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Portfolio NRR</div>
            <div
              className={`text-3xl font-semibold ${
                portfolioNrr >= 1.2 ? "text-[var(--green)]" : "text-[var(--amber)]"
              }`}
            >
              {(portfolioNrr * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">Target: ≥120%</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Portfolio GRR</div>
            <div className="text-3xl font-semibold text-[var(--green)]">
              {(portfolioGrr * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">No churn · all retained</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Starting ARR</div>
            <div className="text-3xl font-semibold">{formatCurrency(startingArr)}</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">Contracted ACV</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">In-year expansion</div>
            <div className="text-3xl font-semibold text-[var(--accent-soft)]">
              {formatCurrency(expansion)}
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">Realised or in-flight</div>
          </div>
        </Card>
      </div>

      {/* NRR waterfall */}
      <Card className="mb-6">
        <div className="p-5">
          <h2 className="font-semibold mb-4">NRR waterfall — portfolio view</h2>
          <div className="flex items-end gap-3 h-32">
            {/* Starting ARR */}
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-full rounded-t bg-[var(--border-strong)]"
                style={{ height: "100%" }}
              />
              <div className="text-xs text-[var(--text-dim)] mt-1">Starting</div>
              <div className="text-xs font-semibold">{formatCurrency(startingArr)}</div>
            </div>
            {/* Churn */}
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-full rounded-t bg-[var(--green)]/20 border border-dashed border-[var(--green)]/30"
                style={{ height: "10%" }}
              />
              <div className="text-xs text-[var(--text-dim)] mt-1">Churn</div>
              <div className="text-xs font-semibold text-[var(--green)]">
                {formatCurrency(churn)}
              </div>
            </div>
            {/* Expansion */}
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-full rounded-t bg-[var(--accent-soft)]/30 border border-[var(--accent-soft)]/50"
                style={{ height: `${Math.min(100, (expansion / startingArr) * 100 * 3)}%` }}
              />
              <div className="text-xs text-[var(--text-dim)] mt-1">Expansion</div>
              <div className="text-xs font-semibold text-[var(--accent-soft)]">
                +{formatCurrency(expansion)}
              </div>
            </div>
            {/* Ending ARR */}
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-full rounded-t bg-[var(--green)]"
                style={{
                  height: `${Math.min(100, (endingArr / startingArr) * 80)}%`,
                }}
              />
              <div className="text-xs text-[var(--text-dim)] mt-1">Ending</div>
              <div className="text-xs font-semibold text-[var(--green)]">
                {formatCurrency(endingArr)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Renewals next 90 days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Renewals in next 90 days</h2>
              <Badge tone={renewalsNext90.length > 0 ? "amber" : "green"}>
                {renewalsNext90.length} upcoming
              </Badge>
            </div>
            {renewalsNext90.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No renewals in the next 90 days.</p>
            ) : (
              <div className="space-y-2">
                {renewalsNext90.map((account) => (
                  <Link
                    key={account.id}
                    href={`/account/${account.id}`}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--bg-elev)] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{account.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Renews {account.renewalDate} · {account.country}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatCurrency(account.contractValue)}
                      </div>
                      <Badge
                        tone={account.nrr >= 1.2 ? "green" : account.nrr >= 1.0 ? "amber" : "red"}
                      >
                        NRR {(account.nrr * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Top expansion accounts */}
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Top expansion plays</h2>
              <Badge tone="accent">New Product Expansion</Badge>
            </div>
            <div className="space-y-2">
              {expansionOpps.map((account) => (
                <Link
                  key={account.id}
                  href={`/account/${account.id}`}
                  className="block p-3 rounded-md hover:bg-[var(--bg-elev)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{account.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{account.country}</span>
                  </div>
                  {account.products.trialling.length > 0 && (
                    <div className="flex gap-1 mb-1">
                      {account.products.trialling.map((p) => (
                        <Badge key={p} tone="amber">{p} trial</Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {account.expansionLevers[0]}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* NRR by account */}
      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-4">NRR by account — portfolio breakdown</h2>
          <div className="space-y-2">
            {byNrr.map((account) => {
              const nrrPct = account.nrr * 100;
              const barWidth = Math.min(100, nrrPct - 80);
              return (
                <Link
                  key={account.id}
                  href={`/account/${account.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-32 shrink-0 text-xs font-medium group-hover:text-[var(--accent-soft)] transition-colors truncate">
                    {account.name}
                  </div>
                  <div className="flex-1 h-4 bg-[var(--bg-elev)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(5, barWidth * 5)}%`,
                        background:
                          nrrPct >= 120
                            ? "var(--green)"
                            : nrrPct >= 100
                              ? "var(--amber)"
                              : "var(--red)",
                      }}
                    />
                  </div>
                  <div
                    className={`text-sm font-semibold w-12 text-right ${
                      nrrPct >= 120
                        ? "text-[var(--green)]"
                        : nrrPct >= 100
                          ? "text-[var(--amber)]"
                          : "text-[var(--red)]"
                    }`}
                  >
                    {nrrPct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-[var(--text-dim)] w-20 text-right">
                    {formatCurrency(account.contractValue)}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Portfolio NRR: <strong className="text-[var(--green)]">{(portfolioNrr * 100).toFixed(0)}%</strong></span>
            <span>ElevenLabs target: <strong>≥120%</strong></span>
          </div>
        </div>
      </Card>
    </div>
  );
}
