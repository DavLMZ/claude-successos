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
import { VoiceBriefingTab } from "./tabs/VoiceBriefing";

type TabId = "overview" | "brief" | "qbr" | "use-cases" | "value" | "playbook" | "voice";

const TABS: { id: TabId; label: string; feature?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "brief", label: "Account Brief", feature: "Extended thinking · Sonnet" },
  { id: "qbr", label: "QBR Composer", feature: "Streaming · Sonnet" },
  { id: "use-cases", label: "Expansion Signals", feature: "Tool use · Sonnet" },
  { id: "value", label: "Value Ledger" },
  { id: "playbook", label: "Adoption Playbook", feature: "Self-review · Haiku" },
  { id: "voice", label: "Voice Briefing", feature: "ElevenLabs API" },
];

export function AccountDetailClient({ account }: { account: Account }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const apiPct =
    account.metrics.api.contractedCharsMonthly > 0
      ? Math.round(
          (account.metrics.api.consumedCharsMonthly / account.metrics.api.contractedCharsMonthly) *
            100,
        )
      : null;

  const agentVolume = account.metrics.agents.callVolumeMonthly;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm">
        <Link href="/" className="text-[var(--text-dim)] hover:text-[var(--text)]">
          ← Portfolio
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {account.country} · {account.industry} · {formatNumber(account.employees)} employees
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <Badge tone="accent">{account.stage}</Badge>
            <Badge tone="muted">ACV {formatCurrency(account.contractValue)}</Badge>
            <Badge
              tone={
                account.nrr >= 1.2 ? "green" : account.nrr >= 1.0 ? "amber" : "red"
              }
            >
              NRR {(account.nrr * 100).toFixed(0)}%
            </Badge>
            <Badge tone="muted">Renewal {account.renewalDate}</Badge>
          </div>
        </div>
        <div className="max-w-2xl">
          <AdoptionStageIndicator stage={account.stage} />
        </div>
      </div>

      {/* Product surface meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SurfaceMeter
          label="ElevenAgents"
          value={
            agentVolume > 0
              ? `${formatNumber(agentVolume)} calls/mo`
              : account.products.trialling.includes("ElevenAgents")
                ? "Trialling"
                : "—"
          }
          sub={
            agentVolume > 0
              ? `${account.metrics.agents.deployed} agents · ${(account.metrics.agents.automationRate * 100).toFixed(0)}% automation`
              : account.products.whitespace.includes("ElevenAgents")
                ? "Whitespace — expansion opportunity"
                : "Pilot underway"
          }
          tone={
            agentVolume > 0
              ? account.metrics.agents.automationRate > 0.6
                ? "green"
                : "amber"
              : account.products.whitespace.includes("ElevenAgents")
                ? "muted"
                : "amber"
          }
        />
        <SurfaceMeter
          label="ElevenAPI"
          value={
            apiPct !== null
              ? `${apiPct}% of commit`
              : account.products.trialling.includes("ElevenAPI")
                ? "Trialling"
                : "—"
          }
          sub={
            apiPct !== null
              ? `${(account.metrics.api.consumedCharsMonthly / 1e9).toFixed(1)}B of ${(account.metrics.api.contractedCharsMonthly / 1e9).toFixed(1)}B chars/mo`
              : account.products.whitespace.includes("ElevenAPI")
                ? "Whitespace — expansion opportunity"
                : "Trial in progress"
          }
          tone={
            apiPct === null
              ? account.products.whitespace.includes("ElevenAPI")
                ? "muted"
                : "amber"
              : apiPct > 100
                ? "amber"
                : apiPct > 75
                  ? "green"
                  : "default"
          }
        />
        <SurfaceMeter
          label="ElevenCreative"
          value={
            account.metrics.creative.outputsMonthly > 0
              ? `${formatNumber(account.metrics.creative.outputsMonthly)} outputs/mo`
              : account.products.trialling.includes("ElevenCreative")
                ? "Trialling"
                : "—"
          }
          sub={
            account.metrics.creative.outputsMonthly > 0
              ? `${account.metrics.creative.languages} languages`
              : account.products.whitespace.includes("ElevenCreative")
                ? "Whitespace — expansion opportunity"
                : "Pilot underway"
          }
          tone={
            account.metrics.creative.outputsMonthly > 0
              ? "green"
              : account.products.whitespace.includes("ElevenCreative")
                ? "muted"
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
              {tab.feature && (
                <span className="ml-2 text-[10px] text-[var(--text-dim)] font-normal">
                  · {tab.feature}
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
        {activeTab === "voice" && <VoiceBriefingTab account={account} />}
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
      <div className={cn("text-xl font-semibold", valueColor)}>{value}</div>
      <div className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</div>
    </div>
  );
}
