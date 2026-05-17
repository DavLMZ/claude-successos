"use client";

import { useState } from "react";
import type { Account } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClaudeOutput } from "@/components/ClaudeOutput";
import { formatCurrency } from "@/lib/utils";

interface DiscoveredUseCase {
  name: string;
  department: string;
  surface: string;
  complexity: number;
  estimated_monthly_value_usd: number;
  time_to_first_value_days: number;
  suggested_champion_persona: string;
  first_30_days_plan: string[];
  risks: string[];
}

interface DiscoveryResult {
  use_cases: DiscoveredUseCase[];
  narrative: string;
  tool_calls: { name: string; input: Record<string, unknown> }[];
}

const PRESETS = [
  "The CFO just signaled interest in finance automation. Find use cases.",
  "Engineering reorg compressed the platform team by 30%. They need force multipliers.",
  "HR has been asking how Claude can help. Map their highest-ROI opportunities.",
  "Legal is blocking expansion. Find use cases that win Legal over.",
];

export function UseCaseDiscoveryTab({ account }: { account: Account }) {
  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState(PRESETS[0]);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [liveCalls, setLiveCalls] = useState<
    { name: string; input: Record<string, unknown> }[]
  >([]);

  async function discover() {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress([]);
    setLiveCalls([]);
    try {
      const res = await fetch("/api/discover-use-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id, signal }),
      });
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === "status") {
              setProgress((p) => [...p, msg.message]);
            } else if (msg.type === "tool_call") {
              setLiveCalls((c) => [...c, { name: msg.name, input: msg.input }]);
            } else if (msg.type === "final") {
              setResult({
                use_cases: msg.use_cases ?? [],
                narrative: msg.narrative ?? "",
                tool_calls: msg.tool_calls ?? [],
              });
            } else if (msg.type === "error") {
              throw new Error(msg.message);
            }
          } catch (parseErr) {
            // skip malformed lines but propagate explicit error events
            if (parseErr instanceof Error && parseErr.message && !parseErr.message.includes("JSON")) {
              throw parseErr;
            }
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold mb-1">Use Case Discovery Agent</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl">
                You describe a customer signal. Claude calls tools — in parallel where possible — to
                search Anthropic&apos;s use case library, estimate ROI for this company size, and
                pull starter playbooks. Returns 5-8 prioritized use cases.
              </p>
            </div>
            <Badge tone="accent">Tool use · Sonnet</Badge>
          </div>
          <div className="space-y-3">
            <textarea
              value={signal}
              onChange={(e) => setSignal(e.target.value)}
              rows={3}
              className="w-full bg-[var(--bg-elev)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-sans focus:outline-none focus:border-[var(--accent)]"
              placeholder="Describe a customer signal — a new exec, a reorg, a budget freeze, a strategic priority..."
            />
            <div className="flex items-center gap-2 flex-wrap">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSignal(p)}
                  className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elev)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-muted)]"
                >
                  Preset {i + 1}
                </button>
              ))}
              <div className="flex-1" />
              <Button onClick={discover} disabled={loading || !signal.trim()}>
                {loading ? "Agent running…" : "Discover use cases"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-[var(--red)]/40">
          <div className="p-5 text-sm text-[var(--red)]">
            <strong>Error:</strong> {error}
          </div>
        </Card>
      )}

      {/* Live progress while agent runs */}
      {(loading || liveCalls.length > 0) && !result && (
        <Card>
          <div className="p-5 space-y-3">
            <h3 className="font-semibold text-sm">Agent activity (live)</h3>
            {progress.length > 0 && (
              <div className="space-y-1">
                {progress.map((p, i) => (
                  <div key={i} className="text-xs text-[var(--text-muted)]">
                    <span className="text-[var(--accent)]">▸</span> {p}
                  </div>
                ))}
              </div>
            )}
            {liveCalls.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider">
                  Tool calls made
                </div>
                {liveCalls.map((tc, i) => (
                  <div key={i} className="text-xs font-mono text-[var(--text-muted)]">
                    <span className="text-[var(--accent)]">{tc.name}</span>
                    <span className="text-[var(--text-dim)]">
                      ({JSON.stringify(tc.input)})
                    </span>
                  </div>
                ))}
              </div>
            )}
            {loading && (
              <div className="text-xs text-[var(--text-dim)] italic pt-2">
                Streaming events from the agent — connection stays alive.
              </div>
            )}
          </div>
        </Card>
      )}

      {result && (
        <>
          {result.tool_calls.length > 0 && (
            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-sm mb-3">
                  Tool calls Claude made ({result.tool_calls.length})
                </h3>
                <div className="space-y-1.5">
                  {result.tool_calls.map((tc, i) => (
                    <div key={i} className="text-xs font-mono text-[var(--text-muted)]">
                      <span className="text-[var(--accent)]">{tc.name}</span>
                      <span className="text-[var(--text-dim)]">
                        ({JSON.stringify(tc.input)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {result.use_cases.length > 0 && (
            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-sm mb-4">
                  Discovered use cases ({result.use_cases.length})
                </h3>
                <div className="space-y-4">
                  {result.use_cases.map((uc, i) => (
                    <div
                      key={i}
                      className="border border-[var(--border)] rounded-md p-4 bg-[var(--bg-elev)]/40"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="font-semibold text-sm">{uc.name}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">
                            {uc.department} · {uc.suggested_champion_persona}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs">
                          <Badge
                            tone={
                              uc.surface === "API"
                                ? "accent"
                                : uc.surface.includes("Enterprise")
                                  ? "blue"
                                  : "green"
                            }
                          >
                            {uc.surface}
                          </Badge>
                          <span className="text-[var(--green)] font-semibold">
                            {formatCurrency(uc.estimated_monthly_value_usd)}/mo
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-dim)] mb-2">
                        <span>
                          Complexity: {"●".repeat(uc.complexity)}
                          {"○".repeat(5 - uc.complexity)}
                        </span>
                        <span>Time to value: {uc.time_to_first_value_days}d</span>
                      </div>
                      {uc.first_30_days_plan && uc.first_30_days_plan.length > 0 && (
                        <div className="text-xs">
                          <div className="text-[var(--text-dim)] mb-1">First 30 days:</div>
                          <ul className="space-y-0.5 ml-3">
                            {uc.first_30_days_plan.map((p, j) => (
                              <li key={j} className="list-disc text-[var(--text-muted)]">
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {uc.risks && uc.risks.length > 0 && (
                        <div className="text-xs mt-2">
                          <div className="text-[var(--text-dim)] mb-1">Risks:</div>
                          <ul className="space-y-0.5 ml-3">
                            {uc.risks.map((r, j) => (
                              <li key={j} className="list-disc text-[var(--amber)]">
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {result.narrative && (
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-sm mb-3 text-[var(--accent-soft)]">
                  Claude&apos;s recommendation
                </h3>
                <ClaudeOutput text={result.narrative} />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
