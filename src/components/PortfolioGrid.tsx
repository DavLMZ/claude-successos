"use client";

import { useState } from "react";
import { AccountCard } from "./AccountCard";
import type { Account } from "@/data/accounts";

type SortKey = "nrr" | "acv" | "renewal" | "stage";
type SortDir = "asc" | "desc";
type Filter = "all" | "at-risk" | "expansion";

const STAGE_ORDER = ["Strategic", "Champion", "Expanding", "Production", "First Build"] as const;

const SORT_LABELS: Record<SortKey, string> = {
  nrr: "NRR",
  acv: "ACV",
  renewal: "Renewal",
  stage: "Stage",
};

export function PortfolioGrid({ accounts }: { accounts: Account[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("nrr");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<Filter>("all");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = accounts.filter((a) => {
    if (filter === "at-risk") return a.risks.some((r) => r.level === "high");
    if (filter === "expansion") return a.products.trialling.length > 0;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "nrr") cmp = a.nrr - b.nrr;
    else if (sortKey === "acv") cmp = a.contractValue - b.contractValue;
    else if (sortKey === "renewal") cmp = a.renewalDate.localeCompare(b.renewalDate);
    else if (sortKey === "stage")
      cmp = STAGE_ORDER.indexOf(a.stage as (typeof STAGE_ORDER)[number]) -
            STAGE_ORDER.indexOf(b.stage as (typeof STAGE_ORDER)[number]);
    return sortDir === "desc" ? -cmp : cmp;
  });

  const atRiskCount = accounts.filter((a) => a.risks.some((r) => r.level === "high")).length;
  const expansionCount = accounts.filter((a) => a.products.trialling.length > 0).length;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 py-2 border-b border-[var(--border)]">
        {/* Sort */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[var(--text-dim)] mr-1.5">Sort</span>
          {(["nrr", "acv", "renewal", "stage"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortKey === key
                  ? "bg-[var(--accent)]/15 text-[var(--accent-soft)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
              }`}
            >
              {SORT_LABELS[key]}
              {sortKey === key && (
                <span className="ml-0.5 opacity-70">{sortDir === "desc" ? " ↓" : " ↑"}</span>
              )}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === "all"
                ? "bg-[var(--accent)]/15 text-[var(--accent-soft)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
            }`}
          >
            All ({accounts.length})
          </button>
          <button
            onClick={() => setFilter("at-risk")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === "at-risk"
                ? "bg-[var(--red)]/15 text-[var(--red)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
            }`}
          >
            ⚠ At risk ({atRiskCount})
          </button>
          <button
            onClick={() => setFilter("expansion")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === "expansion"
                ? "bg-[var(--green)]/15 text-[var(--green)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
            }`}
          >
            ↑ Trialling ({expansionCount})
          </button>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--text-dim)]">
          No accounts match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </>
  );
}
