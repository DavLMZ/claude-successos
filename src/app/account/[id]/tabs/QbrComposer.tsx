"use client";

import { useState } from "react";
import type { Account } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClaudeOutput } from "@/components/ClaudeOutput";

export function QbrComposerTab({ account }: { account: Account }) {
  const [loading, setLoading] = useState(false);
  const [qbr, setQbr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState("Q2 2026");

  async function generate() {
    setLoading(true);
    setError(null);
    setQbr("");
    try {
      const res = await fetch("/api/generate-qbr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id, quarter }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setQbr(acc);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(qbr);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold mb-1">QBR Composer</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl">
                Drafts a full Quarterly Business Review from the account state. Streamed live from
                Claude Sonnet for fast turnaround. Sections in fixed order: exec summary, adoption,
                consumption & seats, value realized, risks, expansion bets, asks both ways.
              </p>
            </div>
            <Badge tone="accent">Streaming · Sonnet</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs text-[var(--text-muted)]">Quarter:</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm"
            >
              <option>Q1 2026</option>
              <option>Q2 2026</option>
              <option>Q3 2026</option>
              <option>Q4 2026</option>
            </select>
            <Button onClick={generate} disabled={loading}>
              {loading ? "Streaming…" : qbr ? "Regenerate" : "Compose QBR"}
            </Button>
            {qbr && !loading && (
              <Button variant="secondary" size="sm" onClick={copy}>
                Copy markdown
              </Button>
            )}
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

      {qbr && (
        <Card>
          <div className="p-6">
            <ClaudeOutput text={qbr} />
            {loading && (
              <span className="inline-block w-2 h-4 bg-[var(--accent)] animate-pulse ml-1" />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
