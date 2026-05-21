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
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let thinkingAcc = "";
      let briefAcc = "";
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
            const msg = JSON.parse(line) as { type: "thinking" | "text"; content: string };
            if (msg.type === "thinking") thinkingAcc += msg.content;
            else if (msg.type === "text") briefAcc += msg.content;
          } catch {
            // skip malformed line
          }
        }
        setThinking(thinkingAcc);
        setBrief(briefAcc);
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
              <h2 className="font-semibold mb-1">Account Brief</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl">
                Claude Sonnet reasons through the full ElevenLabs account state — product adoption
                health across Agents/Creative/API, stakeholder sentiment, GDPR/EU AI Act risks,
                expansion signals — using extended thinking, then streams the brief. A VP could
                read this in 90 seconds before a customer meeting.
              </p>
            </div>
            <Badge tone="accent">Extended thinking + Streaming · Sonnet 4.6</Badge>
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading
              ? brief
                ? "Streaming…"
                : "Claude is thinking…"
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
            {loading && brief && (
              <span className="inline-block w-2 h-4 bg-[var(--accent)] animate-pulse ml-1" />
            )}
          </div>
        </Card>
      )}

      {loading && !brief && !thinking && (
        <Card>
          <div className="p-6 text-sm text-[var(--text-muted)] italic">
            Claude is reasoning through 90 days of ElevenLabs product consumption data, stakeholder
            relationships, GDPR/compliance risks, and expansion signals. Thinking takes 5-10
            seconds, then the brief streams in.
          </div>
        </Card>
      )}
    </div>
  );
}
