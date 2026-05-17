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
  vp_self_review: {
    scores: {
      clarity: number;
      measurability: number;
      executive_readiness: number;
      realism: number;
      specificity: number;
    };
    average: number;
    what_would_a_skeptical_vp_push_back_on: string[];
  };
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
  const [playbook, setPlaybook] = useState<PlaybookData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setPlaybook(null);
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
              setPlaybook(msg.playbook);
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

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold mb-1">Change Management Playbook Generator</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl">
                Claude drafts a 30/60/90 playbook AND a VP self-review of its own work in a single
                pass. The self-review surfaces what a skeptical Director would push back on — the
                kind of guard rail a CSM wants before forwarding the playbook to a customer exec.
              </p>
            </div>
            <Badge tone="accent">Self-reviewing draft · Haiku</Badge>
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
              {loading ? "Generating…" : "Generate playbook"}
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

      {(loading || progress.length > 0) && !playbook && (
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Status</h3>
            <div className="space-y-1">
              {progress.map((p, i) => (
                <div key={i} className="text-xs text-[var(--text-muted)]">
                  <span className="text-[var(--accent)]">▸</span> {p}
                </div>
              ))}
            </div>
            {loading && (
              <div className="text-xs text-[var(--text-dim)] italic pt-3">
                Single Claude call — usually completes in 10-15 seconds.
              </div>
            )}
          </div>
        </Card>
      )}

      {playbook && (
        <>
          {/* VP self-review scorecard */}
          {playbook.vp_self_review && (
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">VP self-review</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-dim)]">Average:</span>
                    <span className="text-lg font-semibold text-[var(--accent-soft)]">
                      {playbook.vp_self_review.average.toFixed(1)}/5
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs mb-4">
                  {Object.entries(playbook.vp_self_review.scores).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[var(--text-dim)] capitalize">
                        {k.replace(/_/g, " ")}
                      </div>
                      <div className="font-semibold">{v}/5</div>
                    </div>
                  ))}
                </div>
                {playbook.vp_self_review.what_would_a_skeptical_vp_push_back_on?.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border)]">
                    <div className="text-xs text-[var(--text-dim)] mb-2">
                      What a skeptical VP would push back on:
                    </div>
                    <ul className="space-y-1 text-xs">
                      {playbook.vp_self_review.what_would_a_skeptical_vp_push_back_on.map(
                        (c, i) => (
                          <li key={i} className="text-[var(--text-muted)]">
                            <span className="text-[var(--amber)] mr-1">⚠</span>
                            {c}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card>
            <div className="p-5">
              <div className="text-xs text-[var(--text-dim)] mb-1">Motion</div>
              <h2 className="font-semibold text-lg mb-3">{playbook.motion}</h2>
              <p className="text-sm text-[var(--text-muted)]">{playbook.executive_summary}</p>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <h3 className="font-semibold text-sm mb-3">Success metrics</h3>
              <div className="space-y-2">
                {playbook.success_metrics.map((m, i) => (
                  <div key={i} className="text-xs flex items-baseline gap-3 flex-wrap">
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
                    {playbook[key].map((m, i) => (
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
                  {playbook.templates_needed.map((t, i) => (
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
                  {playbook.risks.map((r, i) => (
                    <div key={i}>
                      <div className="text-[var(--amber)] font-medium">{r.risk}</div>
                      <div className="text-[var(--text-muted)]">→ {r.mitigation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
