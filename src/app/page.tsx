import { AccountCard } from "@/components/AccountCard";
import { ACCOUNTS } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  const totalACV = ACCOUNTS.reduce((s, a) => s + a.contractValue, 0);
  const totalRealizedValue = ACCOUNTS.reduce(
    (s, a) => s + a.valueRealized.reduce((sum, v) => sum + v.dollarValue, 0),
    0,
  );
  const highRisks = ACCOUNTS.flatMap((a) =>
    a.risks.filter((r) => r.level === "high").map((r) => ({ ...r, account: a.name, id: a.id })),
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Account Cockpit</h1>
          <span className="text-sm text-[var(--text-dim)]">3 strategic DNB accounts</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] max-w-3xl">
          The COO desk for your Claude customers. Every signal from{" "}
          <span className="text-[var(--accent-soft)]">API consumption</span>,{" "}
          <span className="text-[var(--accent-soft)]">Claude for Enterprise</span> seats, and{" "}
          <span className="text-[var(--accent-soft)]">Claude Code</span> activation rolls up here.
          Click into an account for the full operating system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Portfolio ACV</div>
            <div className="text-2xl font-semibold">{formatCurrency(totalACV)}</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">
              Across {ACCOUNTS.length} accounts
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Value realized (LTM)</div>
            <div className="text-2xl font-semibold text-[var(--green)]">
              {formatCurrency(totalRealizedValue)}
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">
              Validated, evidence-backed
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">High-severity risks</div>
            <div className="text-2xl font-semibold text-[var(--red)]">{highRisks.length}</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">
              Requiring CSM attention this week
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {ACCOUNTS.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

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

      <Card>
        <div className="p-5 text-sm text-[var(--text-muted)]">
          <div className="font-semibold text-[var(--text)] mb-2">About this app</div>
          <p className="mb-2">
            Claude SuccessOS is a working prototype built for the{" "}
            <a
              href="https://job-boards.greenhouse.io/anthropic/jobs/5082455008"
              target="_blank"
              rel="noopener"
              className="text-[var(--accent-soft)] hover:underline"
            >
              Customer Success Manager, Strategics
            </a>{" "}
            application at Anthropic. It maps to the role&apos;s requirements: driving adoption across
            the three Claude surfaces (API, Claude for Enterprise, Claude Code), running both
            consumption- and seat-based motions, quantifying value, and operating change management
            at 100k-employee scale.
          </p>
          <p>
            Every interactive module uses Claude — extended thinking for account briefs, streaming
            for QBR generation, tool use for use case discovery, multi-step agent patterns for
            playbook generation. See <Link href="/about" className="underline">/about</Link> for the
            mapping.
          </p>
        </div>
      </Card>
    </div>
  );
}
