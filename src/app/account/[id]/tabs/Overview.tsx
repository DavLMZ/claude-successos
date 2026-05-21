"use client";

import type { Account } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AgentVolumeChart, ApiAndCreativeChart } from "@/components/ConsumptionChart";
import { formatCurrency, formatNumber } from "@/lib/utils";

const PRODUCT_TONE = {
  ElevenAgents: "eleven-agents",
  ElevenCreative: "eleven-creative",
  ElevenAPI: "eleven-api",
} as const;

export function OverviewTab({ account }: { account: Account }) {
  const agentCallsMonth = account.consumption.slice(-30).reduce((s, p) => s + p.agentCallVolume, 0);
  const agentCallsPrev = account.consumption.slice(-60, -30).reduce((s, p) => s + p.agentCallVolume, 0);
  const agentTrend = agentCallsPrev > 0 ? Math.round(((agentCallsMonth - agentCallsPrev) / agentCallsPrev) * 100) : null;

  const apiMonth = account.consumption.slice(-30).reduce((s, p) => s + p.apiCharacters, 0);
  const apiPrev = account.consumption.slice(-60, -30).reduce((s, p) => s + p.apiCharacters, 0);
  const apiTrend = apiPrev > 0 ? Math.round(((apiMonth - apiPrev) / apiPrev) * 100) : null;

  const showAgentChart = agentCallsMonth > 0 || account.metrics.agents.callVolumeMonthly > 0;
  const showApiChart = apiMonth > 0 || account.metrics.api.consumedCharsMonthly > 0;

  return (
    <div className="space-y-6">
      {/* Product adoption mini-matrix */}
      <div className="grid grid-cols-3 gap-4">
        {(["ElevenAgents", "ElevenCreative", "ElevenAPI"] as const).map((product) => {
          const isAdopted = account.products.adopted.includes(product);
          const isTrialling = account.products.trialling.includes(product);
          const isWhitespace = account.products.whitespace.includes(product);
          return (
            <Card key={product}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{product}</span>
                  <Badge
                    tone={
                      isAdopted ? PRODUCT_TONE[product] : isTrialling ? "amber" : "muted"
                    }
                  >
                    {isAdopted ? "Live" : isTrialling ? "Trialling" : "Whitespace"}
                  </Badge>
                </div>
                {product === "ElevenAgents" && isAdopted && (
                  <div className="space-y-1 text-xs text-[var(--text-muted)]">
                    <div>
                      {account.metrics.agents.deployed} agents deployed
                    </div>
                    <div>
                      {formatNumber(account.metrics.agents.callVolumeMonthly)} calls/month
                    </div>
                    <div>
                      {(account.metrics.agents.automationRate * 100).toFixed(0)}% automation
                    </div>
                    {agentTrend !== null && (
                      <div className={agentTrend > 0 ? "text-[var(--green)]" : "text-[var(--red)]"}>
                        {agentTrend > 0 ? "+" : ""}{agentTrend}% vs last month
                      </div>
                    )}
                  </div>
                )}
                {product === "ElevenAPI" && (isAdopted || isTrialling) && account.metrics.api.contractedCharsMonthly > 0 && (
                  <div className="space-y-1 text-xs text-[var(--text-muted)]">
                    <div>
                      {(account.metrics.api.consumedCharsMonthly / 1e9).toFixed(1)}B /{" "}
                      {(account.metrics.api.contractedCharsMonthly / 1e9).toFixed(1)}B chars
                    </div>
                    <div>
                      {Math.round(
                        (account.metrics.api.consumedCharsMonthly /
                          account.metrics.api.contractedCharsMonthly) *
                          100,
                      )}% of commitment
                    </div>
                    {apiTrend !== null && (
                      <div className={apiTrend > 0 ? "text-[var(--green)]" : "text-[var(--red)]"}>
                        {apiTrend > 0 ? "+" : ""}{apiTrend}% vs last month
                      </div>
                    )}
                  </div>
                )}
                {product === "ElevenCreative" && (isAdopted || isTrialling) && account.metrics.creative.outputsMonthly > 0 && (
                  <div className="space-y-1 text-xs text-[var(--text-muted)]">
                    <div>
                      {formatNumber(account.metrics.creative.outputsMonthly)} outputs/month
                    </div>
                    <div>{account.metrics.creative.languages} languages</div>
                  </div>
                )}
                {isWhitespace && (
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    Expansion opportunity — not yet accessed
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {showAgentChart && (
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">ElevenAgents — call volume (90 days)</h3>
                <Badge tone="accent">Agents</Badge>
              </div>
              <AgentVolumeChart data={account.consumption} />
            </div>
          </Card>
        )}
        {showApiChart && (
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">API chars + Creative outputs (90 days)</h3>
                <Badge tone="blue">API / Creative</Badge>
              </div>
              <ApiAndCreativeChart data={account.consumption} />
            </div>
          </Card>
        )}
      </div>

      {/* Stakeholders + Risks + Expansion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Stakeholder map</h3>
            <div className="space-y-2.5">
              {account.stakeholders.map((s) => (
                <div key={s.name} className="text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-[var(--text)]">{s.name}</span>
                    <Badge
                      tone={
                        s.sentiment === "positive"
                          ? "green"
                          : s.sentiment === "negative"
                            ? "red"
                            : "muted"
                      }
                    >
                      {s.role}
                    </Badge>
                  </div>
                  <div className="text-[var(--text-muted)]">{s.title}</div>
                  <div className="text-[var(--text-dim)] text-[10px] mt-0.5">
                    {s.org} · last touch {s.lastTouch}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Risk signals</h3>
            <div className="space-y-3">
              {account.risks.length > 0 ? (
                account.risks.map((r, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        tone={
                          r.level === "high" ? "red" : r.level === "medium" ? "amber" : "muted"
                        }
                      >
                        {r.level}
                      </Badge>
                      <span className="font-medium">{r.label}</span>
                    </div>
                    <div className="text-[var(--text-muted)] pl-1">{r.detail}</div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--green)]">No active risk signals.</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Expansion levers</h3>
            <ul className="space-y-2 text-xs">
              {account.expansionLevers.map((lever, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--accent)]">→</span>
                  <span className="text-[var(--text-muted)]">{lever}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Use case portfolio */}
      <Card>
        <div className="p-5">
          <h3 className="font-semibold text-sm mb-3">Use case portfolio</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[var(--text-dim)] border-b border-[var(--border)]">
                <tr>
                  <th className="py-2 font-medium">Use case</th>
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Department</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Monthly value</th>
                </tr>
              </thead>
              <tbody>
                {account.useCases.map((uc) => (
                  <tr key={uc.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3">
                      <div className="font-medium text-[var(--text)]">{uc.name}</div>
                      <div className="text-[var(--text-dim)] text-[11px] mt-0.5 max-w-md">
                        {uc.description}
                      </div>
                    </td>
                    <td className="py-3 align-top">
                      <Badge tone={PRODUCT_TONE[uc.product]}>{uc.product}</Badge>
                    </td>
                    <td className="py-3 text-[var(--text-muted)] align-top">{uc.department}</td>
                    <td className="py-3 align-top">
                      <Badge
                        tone={
                          uc.status === "Production"
                            ? "green"
                            : uc.status === "Pilot"
                              ? "amber"
                              : uc.status === "Stalled"
                                ? "red"
                                : "muted"
                        }
                      >
                        {uc.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium align-top">
                      {uc.monthlyValue > 0 ? formatCurrency(uc.monthlyValue) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Activity */}
      <Card>
        <div className="p-5">
          <h3 className="font-semibold text-sm mb-3">Recent activity</h3>
          <div className="space-y-2 text-xs">
            {account.recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3 items-baseline">
                <span className="text-[var(--text-dim)] w-20 shrink-0">{a.date}</span>
                <Badge tone="muted">{a.type}</Badge>
                <span className="text-[var(--text-muted)]">{a.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
