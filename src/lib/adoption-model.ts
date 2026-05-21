export type AdoptionStage =
  | "First Build"
  | "Production"
  | "Expanding"
  | "Champion"
  | "Strategic";

export const ADOPTION_STAGES: AdoptionStage[] = [
  "First Build",
  "Production",
  "Expanding",
  "Champion",
  "Strategic",
];

export const STAGE_DESCRIPTIONS: Record<AdoptionStage, string> = {
  "First Build":
    "0-30 days. First voice or agent deployed in a sandbox. Goal: prove value, find a champion, establish baseline.",
  Production:
    "31-60 days. Live use case in production on one product. Goal: stabilise, measure, document wins.",
  Expanding:
    "61-90 days. Second product access granted, workspace adoption spreading. Goal: deepen integration, cross-sell signals emerging.",
  Champion:
    "90+ days. Multi-product adoption, internal evangelists driving use. Goal: executive alignment, renewal confidence, co-marketing.",
  Strategic:
    "ElevenLabs embedded in core business workflows. Removing ElevenLabs would degrade business outcomes. Goal: multi-year, multi-product expansion.",
};

export const STAGE_INDEX: Record<AdoptionStage, number> = {
  "First Build": 0,
  Production: 1,
  Expanding: 2,
  Champion: 3,
  Strategic: 4,
};

export type RiskLevel = "low" | "medium" | "high";

export interface RiskSignal {
  label: string;
  level: RiskLevel;
  detail: string;
}
