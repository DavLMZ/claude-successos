"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClaudeOutput } from "@/components/ClaudeOutput";

const PRESETS = [
  {
    label: "I already pay for Claude — why a separate API bill?",
    text: "I'm a developer at a 200-person SaaS company. I personally subscribe to Claude Max. My company just got an API invoice for $1,400. Finance is asking why we're paying for Claude twice. What's going on?",
  },
  {
    label: "100k-person enterprise with all three surfaces",
    text: "We're rolling out Claude across our 100,000-person company: 1,200 Claude Code seats for the platform team, 8,000 Claude for Enterprise seats for knowledge workers, and our product team is building an internal IDE assistant on the API expecting ~3B tokens/month. CFO wants a single page explaining what we're committed to and where the optimization opportunities are.",
  },
  {
    label: "Moved from Lovable to a real deployment",
    text: "We prototyped an AI feature in Lovable for months — felt free. Now we're deploying our own production version and suddenly we have a $4k/month Anthropic bill. Why didn't this show up before, and how do I think about cost going forward?",
  },
  {
    label: "Over-utilized API contract",
    text: "We committed to 2B tokens/year on the API. Six months in, we've used 2.4B. Sales is pushing us to expand. How do I model this honestly for my exec sponsor?",
  },
];

export default function PricingTranslatorPage() {
  const [situation, setSituation] = useState(PRESETS[0].text);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function translate() {
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await fetch("/api/pricing-translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Pricing Translator</h1>
          <Badge tone="accent">Streaming · Sonnet</Badge>
        </div>
        <p className="text-sm text-[var(--text-muted)] max-w-3xl">
          Anthropic&apos;s customers field one question more than any other: <em>&quot;I already
          pay for Claude — why am I getting a separate API bill?&quot;</em> Claude.ai subscriptions,
          API consumption, Claude for Enterprise seats, and Claude Code seats are four different
          meters. This module takes a plain-English customer situation and produces a clear
          explainer with optimization recommendations.
        </p>
        <p className="text-xs text-[var(--text-dim)] mt-3 max-w-3xl">
          Built into Claude SuccessOS after a CSM-empathy moment during the application process —
          I felt this exact friction when starting this project, which is the kind of insight that
          makes a CSM useful to a 100k-person customer at scale.
        </p>
      </div>

      <Card className="mb-4">
        <div className="p-5 space-y-3">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={5}
            className="w-full bg-[var(--bg-elev)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-sans focus:outline-none focus:border-[var(--accent)]"
          />
          <div className="flex items-center gap-2 flex-wrap">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setSituation(p.text)}
                title={p.label}
                className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elev)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-muted)] max-w-[200px] truncate"
              >
                {p.label}
              </button>
            ))}
            <div className="flex-1" />
            <Button onClick={translate} disabled={loading || !situation.trim()}>
              {loading ? "Translating…" : "Translate"}
            </Button>
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

      {output && (
        <Card>
          <div className="p-6">
            <ClaudeOutput text={output} />
            {loading && (
              <span className="inline-block w-2 h-4 bg-[var(--accent)] animate-pulse ml-1" />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
