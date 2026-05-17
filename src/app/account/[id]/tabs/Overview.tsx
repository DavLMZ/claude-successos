"use client";

import type { Account } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConsumptionChart, SeatsChart } from "@/components/ConsumptionChart";
import { formatCurrency } from "@/lib/utils";

export function OverviewTab({ account }: { account: Account }) {
  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">API spend (90 days)</h3>
              <Badge tone="accent">Consumption meter</Badge>
            </div>
            <ConsumptionChart data={account.consumption} />
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Active seats (90 days)</h3>
              <Badge tone="blue">Seat meter</Badge>
            </div>
            <SeatsChart data={account.consumption} />
          </div>
        </Card>
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
              {account.risks.map((r, i) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={r.level === "high" ? "red" : r.level === "medium" ? "amber" : "muted"}>
                      {r.level}
                    </Badge>
                    <span className="font-medium">{r.label}</span>
                  </div>
                  <div className="text-[var(--text-muted)] pl-1">{r.detail}</div>
                </div>
              ))}
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

      {/* Use cases table */}
      <Card>
        <div className="p-5">
          <h3 className="font-semibold text-sm mb-3">Use case portfolio</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[var(--text-dim)] border-b border-[var(--border)]">
                <tr>
                  <th className="py-2 font-medium">Use case</th>
                  <th className="py-2 font-medium">Surface</th>
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
                      <Badge
                        tone={
                          uc.surface === "API"
                            ? "accent"
                            : uc.surface === "Claude for Enterprise"
                              ? "blue"
                              : "green"
                        }
                      >
                        {uc.surface}
                      </Badge>
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
                <span className="text-[var(--text-dim)] w-20">{a.date}</span>
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
