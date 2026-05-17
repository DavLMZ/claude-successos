export type AdoptionStage = "Explore" | "First Build" | "Scale" | "Embed" | "Expand";

export const ADOPTION_STAGES: AdoptionStage[] = [
  "Explore",
  "First Build",
  "Scale",
  "Embed",
  "Expand",
];

export const STAGE_DESCRIPTIONS: Record<AdoptionStage, string> = {
  Explore:
    "POC phase. Small group testing Claude on bounded problems. Goal: prove value, find a champion.",
  "First Build":
    "First production use case shipped. One team, one workflow. Goal: stabilize, measure, document wins.",
  Scale:
    "Multiple teams using Claude in production. Goal: drive consistency, reduce prompt sprawl, optimize cost.",
  Embed:
    "Claude integrated into core workflows. Removing Claude would degrade business outcomes. Goal: deepen, harden.",
  Expand:
    "Net-new lines of business adopting Claude. Goal: replicate playbook across the org.",
};

export const STAGE_INDEX: Record<AdoptionStage, number> = {
  Explore: 0,
  "First Build": 1,
  Scale: 2,
  Embed: 3,
  Expand: 4,
};

export type RiskLevel = "low" | "medium" | "high";

export interface RiskSignal {
  label: string;
  level: RiskLevel;
  detail: string;
}
