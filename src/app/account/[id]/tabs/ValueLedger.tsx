"use client";

import type { Account } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export function ValueLedgerTab({ account }: { account: Account }) {
  const total = account.valueRealized.reduce((s, v) => s + v.dollarValue, 0);
  const acvMultiple = total / account.contractValue;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Total realized value (LTM)</div>
            <div className="text-2xl font-semibold text-[var(--green)]">
              {formatCurrency(total)}
            </div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">
              Across {account.valueRealized.length} validated outcomes
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Annual contract value</div>
            <div className="text-2xl font-semibold">{formatCurrency(account.contractValue)}</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">Current commitment</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Value / ACV multiple</div>
            <div className="text-2xl font-semibold text-[var(--accent-soft)]">
              {acvMultiple.toFixed(1)}x
            </div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">
              Use in CFO business case
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-1">Value Realization Ledger</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4 max-w-2xl">
            Every validated outcome with evidence. No outcome without a named source. CFO-ready —
            export the table when building an internal business case for renewal or expansion.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[var(--text-dim)] border-b border-[var(--border)]">
                <tr>
                  <th className="py-2 font-medium">Outcome</th>
                  <th className="py-2 font-medium">Baseline</th>
                  <th className="py-2 font-medium">Current</th>
                  <th className="py-2 font-medium">Method</th>
                  <th className="py-2 font-medium">Validated by</th>
                  <th className="py-2 font-medium text-right">$ Value</th>
                </tr>
              </thead>
              <tbody>
                {account.valueRealized.map((v, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 align-top">
                      <div className="font-medium">{v.outcome}</div>
                      <div className="text-[var(--text-dim)] text-[11px] mt-0.5">
                        Source: {v.source}
                      </div>
                    </td>
                    <td className="py-3 text-[var(--text-muted)] align-top">{v.baseline}</td>
                    <td className="py-3 text-[var(--green)] align-top">{v.current}</td>
                    <td className="py-3 align-top">
                      <Badge tone="muted">{v.method}</Badge>
                    </td>
                    <td className="py-3 text-[var(--text-muted)] align-top">{v.validatedBy}</td>
                    <td className="py-3 text-right font-semibold align-top">
                      {formatCurrency(v.dollarValue)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[var(--border-strong)]">
                  <td colSpan={5} className="py-3 font-semibold text-right">
                    Total realized
                  </td>
                  <td className="py-3 text-right font-bold text-[var(--green)]">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
