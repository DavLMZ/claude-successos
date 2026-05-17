"use client";

import { useState } from "react";
import Link from "next/link";
import type { Account } from "@/data/accounts";
import { AdoptionStageIndicator } from "@/components/AdoptionStageIndicator";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { OverviewTab } from "./tabs/Overview";
import { AccountBriefTab } from "./tabs/AccountBrief";
import { QbrComposerTab } from "./tabs/QbrComposer";
import { UseCaseDiscoveryTab } from "./tabs/UseCaseDiscovery";
import { ValueLedgerTab } from "./tabs/ValueLedger";
import { PlaybookGeneratorTab } from "./tabs/PlaybookGenerator";

type TabId = "overview" | "brief" | "qbr" | "use-cases" | "value" | "playbook";

const TABS: { id: TabId; label: string; claudeFeature?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "brief", label: "Account Brief", claudeFeature: "Extended thinking" },
  { id: "qbr", label: "QBR Composer", claudeFeature: "Streaming" },
  { id: "use-cases", label: "Use Case Discovery", claudeFeature: "Tool use" },
  { id: "value", label: "Value Ledger" },
  { id: "playbook", label: "Change Mgmt Playbook", claudeFeature: "Self-reviewing draft" },
];

export function AccountDetailClient({ account }: { account: Account }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const apiPct = Math.round(
    (account.surfaces.api.consumed / account.surfaces.api.contracted) * 100,
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm">
        <Link href="/" className="text-[var(--text-dim)] hover:text-[var(--text)]">
          ← Cockpit
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {account.industry} · {formatNumber(account.employees)} employees ·{" "}
              {formatCurrency(account.arr)} ARR
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge tone="accent">{account.stage}</Badge>
            <Badge tone="muted">ACV {formatCurrency(account.contractValue)}</Badge>
            <Badge tone="muted">Next QBR {account.nextQbr}</Badge>
          </div>
        </div>
        <div className="max-w-2xl">
          <AdoptionStageIndicator stage={account.stage} />
        </div>
      </div>

      {/* Surface meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SurfaceMeter
          label="API (consumption)"
          value={`${apiPct}%`}
          sub={`${(account.surfaces.api.consumed / 1e9).toFixed(2)}B of ${(account.surfaces.api.contracted / 1e9).toFixed(1)}B tokens`}
          tone={apiPct > 100 ? "amber" : apiPct > 80 ? "green" : "default"}
        />
        <SurfaceMeter
          label="Claude for Enterprise (seats)"
          value={`${Math.round((account.surfaces.cfe.activated / Math.max(account.surfaces.cfe.seats, 1)) * 100)}%`}
          sub={`${account.surfaces.cfe.activated} of ${account.surfaces.cfe.seats} activated`}
          tone={
            account.surfaces.cfe.activated / account.surfaces.cfe.seats < 0.5
              ? "red"
              : account.surfaces.cfe.activated / account.surfaces.cfe.seats < 0.75
                ? "amber"
                : "green"
          }
        />
        <SurfaceMeter
          label="Claude Code (seats)"
          value={
            account.surfaces.code.seats > 0
              ? `${Math.round((account.surfaces.code.activated / account.surfaces.code.seats) * 100)}%`
              : "—"
          }
          sub={
            account.surfaces.code.seats > 0
              ? `${account.surfaces.code.activated} of ${account.surfaces.code.seats} activated`
              : "Not yet deployed"
          }
          tone={
            account.surfaces.code.seats === 0
              ? "muted"
              : account.surfaces.code.activated / account.surfaces.code.seats > 0.85
                ? "green"
                : "amber"
          }
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-[var(--accent)] text-[var(--text)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
            >
              {tab.label}
              {tab.claudeFeature && (
                <span className="ml-2 text-[10px] text-[var(--text-dim)] font-normal">
                  · {tab.claudeFeature}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && <OverviewTab account={account} />}
        {activeTab === "brief" && <AccountBriefTab account={account} />}
        {activeTab === "qbr" && <QbrComposerTab account={account} />}
        {activeTab === "use-cases" && <UseCaseDiscoveryTab account={account} />}
        {activeTab === "value" && <ValueLedgerTab account={account} />}
        {activeTab === "playbook" && <PlaybookGeneratorTab account={account} />}
      </div>
    </div>
  );
}

function SurfaceMeter({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "default" | "green" | "amber" | "red" | "muted";
}) {
  const valueColor = {
    default: "text-[var(--text)]",
    green: "text-[var(--green)]",
    amber: "text-[var(--amber)]",
    red: "text-[var(--red)]",
    muted: "text-[var(--text-dim)]",
  }[tone];
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
      <div className="text-xs text-[var(--text-dim)] mb-1">{label}</div>
      <div className={cn("text-2xl font-semibold", valueColor)}>{value}</div>
      <div className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</div>
    </div>
  );
}
