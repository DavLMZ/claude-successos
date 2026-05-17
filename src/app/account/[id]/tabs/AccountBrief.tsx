"use client";

import { useState } from "react";
import type { Account } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClaudeOutput, ThinkingBlock } from "@/components/ClaudeOutput";

export function AccountBriefTab({ account }: { account: Account }) {
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState("");
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setThinking("");
    setBrief("");
    try {
      const res = await fetch("/api/analyze-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setThinking(data.thinking ?? "");
      setBrief(data.brief ?? "");
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
              <h2 className="font-semibold mb-1">Account Brief</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl">
                Claude Opus reasons through the full account state — consumption health, stakeholder
                sentiment, risk signals, expansion levers — and produces a brief a VP would read
                before a customer meeting. The extended thinking trace is shown so you can audit the
                reasoning.
              </p>
            </div>
            <Badge tone="accent">Extended thinking · Opus</Badge>
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading
              ? "Claude is thinking…"
              : brief
                ? "Regenerate brief"
                : "Generate account brief"}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="border-[var(--red)]/40">
          <div className="p-5 text-sm text-[var(--red)]">
            <strong>Error:</strong> {error}
          </div>
        </Card>
      )}

      {(thinking || brief) && (
        <Card>
          <div className="p-6">
            <ThinkingBlock text={thinking} />
            <ClaudeOutput text={brief} />
          </div>
        </Card>
      )}

      {loading && !brief && (
        <Card>
          <div className="p-6 text-sm text-[var(--text-muted)] italic">
            Claude is analyzing 90 days of consumption data, 6 stakeholder relationships, and 7 use
            cases. Extended thinking takes 15-30 seconds.
          </div>
        </Card>
      )}
    </div>
  );
}
