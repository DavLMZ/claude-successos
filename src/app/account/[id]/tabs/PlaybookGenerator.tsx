"use client";

import { useState } from "react";
import type { Account } from "@/data/accounts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Motion =
  | "Train the Trainer"
  | "Center of Excellence"
  | "Executive Briefing"
  | "Developer Onboarding (Claude Code)"
  | "CfE Seat Activation Campaign";

interface PlaybookData {
  motion: string;
  executive_summary: string;
  success_metrics: { metric: string; target: string; measurement_method: string }[];
  day_30: { milestone: string; owner_role: string; artifacts: string[] }[];
  day_60: { milestone: string; owner_role: string; artifacts: string[] }[];
  day_90: { milestone: string; owner_role: string; artifacts: string[] }[];
  templates_needed: { name: string; purpose: string; audience: string }[];
  risks: { risk: string; mitigation: string }[];
}

interface CritiqueData {
  scores: {
    clarity: number;
    measurability: number;
    executive_readiness: number;
    realism: number;
    specificity: number;
  };
  average: number;
  top_fixes: { section: string; issue: string; fix: string }[];
}

interface PlaybookResult {
  initial: PlaybookData;
  critique: CritiqueData;
  revised: PlaybookData;
}

const MOTIONS: Motion[] = [
  "Train the Trainer",
  "Center of Excellence",
  "Executive Briefing",
  "Developer Onboarding (Claude Code)",
  "CfE Seat Activation Campaign",
];

export function PlaybookGeneratorTab({ account }: { account: Account }) {
  const [motion, setMotion] = useState<Motion>("Train the Trainer");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<PlaybookResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"revised" | "initial" | "critique">("revised");

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress([]);
    try {
      const res = await fetch("/api/build-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id, motion }),
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
            } else if (msg.type === "final") {
              setResult({
                initial: msg.initial,
                critique: msg.critique,
                revised: msg.revised,
              });
            } else if (msg.type === "error") {
              throw new Error(msg.message);
            }
          } catch (parseErr) {
            if (
              parseErr instanceof Error &&
              parseErr.message &&
              !parseErr.message.includes("JSON")
            ) {
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

  const shown = result
    ? view === "initial"
      ? result.initial
      : view === "revised"
        ? result.revised
        : null
    : null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold mb-1">Change Management Playbook Generator</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl">
                A three-step agent: <strong>plan</strong> the 30/60/90 playbook,{" "}
                <strong>critique</strong> it as a skeptical VP would, <strong>revise</strong> based
                on the critique. You see all three outputs.
              </p>
            </div>
            <Badge tone="accent">Multi-step agent · Haiku</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs text-[var(--text-muted)]">Motion:</label>
            <select
              value={motion}
              onChange={(e) => setMotion(e.target.value as Motion)}
              className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm"
            >
              {MOTIONS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <Button onClick={generate} disabled={loading}>
              {loading ? "Agent running…" : "Generate playbook"}
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

      {(loading || progress.length > 0) && !result && (
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Agent activity (live)</h3>
            <div className="space-y-1">
              {progress.map((p, i) => (
                <div key={i} className="text-xs text-[var(--text-muted)]">
                  <span className="text-[var(--accent)]">▸</span> {p}
                </div>
              ))}
            </div>
            {loading && (
              <div className="text-xs text-[var(--text-dim)] italic pt-3">
                Streaming progress — each step takes ~10 seconds.
              </div>
            )}
          </div>
        </Card>
      )}

      {result && (
        <>
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Critic scorecard (VP perspective)</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-dim)]">Average:</span>
                  <span className="text-lg font-semibold text-[var(--accent-soft)]">
                    {result.critique.average.toFixed(1)}/5
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {Object.entries(result.critique.scores).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[var(--text-dim)] capitalize">{k.replace("_", " ")}</div>
                    <div className="font-semibold">{v}/5</div>
                  </div>
                ))}
              </div>
              {result.critique.top_fixes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="text-xs text-[var(--text-dim)] mb-2">
                    Top fixes the critic applied:
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {result.critique.top_fixes.map((f, i) => (
                      <li key={i}>
                        <span className="text-[var(--accent-soft)] font-medium">{f.section}:</span>{" "}
                        <span className="text-[var(--text-muted)]">{f.issue}</span> →{" "}
                        <span className="text-[var(--text)]">{f.fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center gap-1 border-b border-[var(--border)]">
            {(["revised", "initial"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 ${
                  view === v
                    ? "border-[var(--accent)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)]"
                }`}
              >
                {v === "revised" ? "Final (post-critique)" : "Initial draft"}
              </button>
            ))}
          </div>

          {shown && <PlaybookView data={shown} />}
        </>
      )}
    </div>
  );
}

function PlaybookView({ data }: { data: PlaybookData }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-5">
          <div className="text-xs text-[var(--text-dim)] mb-1">Motion</div>
          <h2 className="font-semibold text-lg mb-3">{data.motion}</h2>
          <p className="text-sm text-[var(--text-muted)]">{data.executive_summary}</p>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h3 className="font-semibold text-sm mb-3">Success metrics</h3>
          <div className="space-y-2">
            {data.success_metrics.map((m, i) => (
              <div key={i} className="text-xs flex items-baseline gap-3">
                <span className="font-medium min-w-[180px]">{m.metric}</span>
                <Badge tone="green">{m.target}</Badge>
                <span className="text-[var(--text-muted)]">via {m.measurement_method}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(["day_30", "day_60", "day_90"] as const).map((key, idx) => (
          <Card key={key}>
            <div className="p-5">
              <h3 className="font-semibold text-sm mb-3 text-[var(--accent-soft)]">
                Day {[30, 60, 90][idx]}
              </h3>
              <div className="space-y-3">
                {data[key].map((m, i) => (
                  <div key={i} className="text-xs">
                    <div className="font-medium">{m.milestone}</div>
                    <div className="text-[var(--text-dim)] mt-0.5">Owner: {m.owner_role}</div>
                    {m.artifacts.length > 0 && (
                      <div className="text-[var(--text-muted)] mt-1">
                        Artifacts: {m.artifacts.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Templates to produce</h3>
            <div className="space-y-2 text-xs">
              {data.templates_needed.map((t, i) => (
                <div key={i}>
                  <span className="font-medium">{t.name}</span>{" "}
                  <span className="text-[var(--text-dim)]">→ {t.audience}</span>
                  <div className="text-[var(--text-muted)]">{t.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Risks &amp; mitigations</h3>
            <div className="space-y-2 text-xs">
              {data.risks.map((r, i) => (
                <div key={i}>
                  <div className="text-[var(--amber)] font-medium">{r.risk}</div>
                  <div className="text-[var(--text-muted)]">→ {r.mitigation}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
