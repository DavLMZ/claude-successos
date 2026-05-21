import { ACCOUNTS } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type Product = "ElevenAgents" | "ElevenCreative" | "ElevenAPI";
const PRODUCTS: Product[] = ["ElevenAgents", "ElevenCreative", "ElevenAPI"];

const PRODUCT_TONE = {
  ElevenAgents: "eleven-agents",
  ElevenCreative: "eleven-creative",
  ElevenAPI: "eleven-api",
} as const;

function cellState(account: (typeof ACCOUNTS)[0], product: Product) {
  if (account.products.adopted.includes(product)) return "live";
  if (account.products.trialling.includes(product)) return "trial";
  return "gap";
}

export default function AdoptionMatrix() {
  const liveCount = (product: Product) =>
    ACCOUNTS.filter((a) => a.products.adopted.includes(product)).length;
  const trialCount = (product: Product) =>
    ACCOUNTS.filter((a) => a.products.trialling.includes(product)).length;

  const totalExpansion = ACCOUNTS.reduce((sum, a) => {
    const expansionAcv = a.products.whitespace.length * a.contractValue * 0.4;
    const trialAcv = a.products.trialling.length * a.contractValue * 0.25;
    return sum + expansionAcv + trialAcv;
  }, 0);

  const multiProduct = ACCOUNTS.filter((a) => a.products.adopted.length >= 2).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Adoption Matrix</h1>
          <span className="text-sm text-[var(--text-dim)]">New Product Expansion view</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] max-w-3xl">
          The whitespace map across your portfolio. Green = contracted and live. Amber = trialling
          outside contract (hot expansion signal per Vanessa&apos;s framework). Grey = not yet
          accessed. Every grey cell is a conversation.
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Multi-product accounts</div>
            <div className="text-2xl font-semibold text-[var(--green)]">
              {multiProduct}/{ACCOUNTS.length}
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">2+ products adopted</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="text-xs text-[var(--text-dim)] mb-1">Expansion pipeline est.</div>
            <div className="text-2xl font-semibold text-[var(--accent-soft)]">
              {formatCurrency(totalExpansion)}
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mt-1">Trials + whitespace potential</div>
          </div>
        </Card>
        {PRODUCTS.map((p) => (
          <Card key={p}>
            <div className="p-5">
              <div className="text-xs text-[var(--text-dim)] mb-1">{p}</div>
              <div className="text-2xl font-semibold">
                {liveCount(p)}
                <span className="text-sm text-[var(--text-dim)] font-normal">/{ACCOUNTS.length}</span>
              </div>
              <div className="text-[10px] text-[var(--text-dim)] mt-1">
                live · {trialCount(p)} trialling
              </div>
            </div>
          </Card>
        )).slice(0, 2)}
      </div>

      {/* Product column summaries */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {PRODUCTS.map((product) => {
          const live = ACCOUNTS.filter((a) => a.products.adopted.includes(product));
          const trial = ACCOUNTS.filter((a) => a.products.trialling.includes(product));
          const gap = ACCOUNTS.filter((a) => a.products.whitespace.includes(product));
          return (
            <Card key={product}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge tone={PRODUCT_TONE[product]}>{product}</Badge>
                  <span className="text-xs text-[var(--text-dim)]">{live.length} live · {trial.length} trial · {gap.length} gap</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden mb-3">
                  <div
                    className="h-full bg-[var(--green)] rounded-full"
                    style={{ width: `${(live.length / ACCOUNTS.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {gap.length > 0 && (
                    <span className="text-[var(--text-dim)]">
                      Gap accounts: {gap.map((a) => a.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Whitespace matrix */}
      <Card>
        <div className="p-5">
          <h2 className="font-semibold mb-1">Full portfolio whitespace map</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Click any account to open its full operating system. Amber cells are trialling —
            the highest-value expansion conversations to prioritise.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 pr-4 font-medium text-[var(--text-dim)]">Account</th>
                  <th className="text-left py-2 pr-4 font-medium text-[var(--text-dim)]">
                    Country
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-[var(--text-dim)]">Stage</th>
                  <th className="text-left py-2 pr-4 font-medium text-[var(--text-dim)]">ACV</th>
                  {PRODUCTS.map((p) => (
                    <th key={p} className="text-center py-2 px-3 font-medium text-[var(--text-dim)]">
                      {p.replace("Eleven", "")}
                    </th>
                  ))}
                  <th className="text-left py-2 pl-4 font-medium text-[var(--text-dim)]">
                    NRR
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNTS.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elev)] transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/account/${account.id}`}
                        className="font-medium hover:text-[var(--accent-soft)] transition-colors"
                      >
                        {account.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-[var(--text-muted)]">{account.country}</td>
                    <td className="py-3 pr-4">
                      <Badge tone="muted">{account.stage}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-[var(--text-muted)]">
                      {formatCurrency(account.contractValue)}
                    </td>
                    {PRODUCTS.map((product) => {
                      const state = cellState(account, product);
                      return (
                        <td key={product} className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                              state === "live"
                                ? "bg-[var(--green)]/15 text-[var(--green)] border border-[var(--green)]/30"
                                : state === "trial"
                                  ? "bg-[var(--amber)]/15 text-[var(--amber)] border border-[var(--amber)]/30"
                                  : "bg-[var(--bg-elev)] text-[var(--text-dim)] border border-[var(--border)]"
                            }`}
                          >
                            {state === "live" ? "Live" : state === "trial" ? "Trial" : "Gap"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 pl-4">
                      <span
                        className={
                          account.nrr >= 1.2
                            ? "text-[var(--green)] font-semibold"
                            : account.nrr >= 1.0
                              ? "text-[var(--amber)]"
                              : "text-[var(--red)]"
                        }
                      >
                        {(account.nrr * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="inline-block px-2 py-0.5 rounded bg-[var(--green)]/15 text-[var(--green)] border border-[var(--green)]/30">Live</span>
              Contracted and in production
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block px-2 py-0.5 rounded bg-[var(--amber)]/15 text-[var(--amber)] border border-[var(--amber)]/30">Trial</span>
              Accessing outside contract (hot expansion signal)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block px-2 py-0.5 rounded bg-[var(--bg-elev)] text-[var(--text-dim)] border border-[var(--border)]">Gap</span>
              Not yet accessed
            </span>
          </div>
        </div>
      </Card>

      {/* Hot trial signals */}
      {ACCOUNTS.some((a) => a.products.trialling.length > 0) && (
        <Card className="mt-4">
          <div className="p-5">
            <h2 className="font-semibold mb-1">Hot trial signals — prioritise this week</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              These accounts are accessing a product outside their contract. Per Vanessa&apos;s
              framework: ElevenLabs gives customers access to new products to surface cross-sell
              signals. Workspace adoption of a trial product is the leading indicator for expansion.
            </p>
            <div className="space-y-2">
              {ACCOUNTS.filter((a) => a.products.trialling.length > 0).map((account) => (
                <Link
                  key={account.id}
                  href={`/account/${account.id}`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-[var(--bg-elev)] transition-colors"
                >
                  <span className="font-medium text-sm">{account.name}</span>
                  <span className="text-[var(--text-dim)] text-xs">{account.country}</span>
                  <div className="flex gap-1">
                    {account.products.trialling.map((p) => (
                      <Badge key={p} tone="amber">{p} trial</Badge>
                    ))}
                  </div>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">
                    ACV {formatCurrency(account.contractValue)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
