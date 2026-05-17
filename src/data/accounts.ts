import type { AdoptionStage, RiskSignal } from "@/lib/adoption-model";

export interface Stakeholder {
  name: string;
  title: string;
  org: string;
  role: "Economic Buyer" | "Champion" | "Technical Lead" | "End User" | "Detractor";
  sentiment: "positive" | "neutral" | "negative";
  lastTouch: string;
}

export interface UseCase {
  id: string;
  name: string;
  department: string;
  surface: "API" | "Claude for Enterprise" | "Claude Code";
  status: "Production" | "Pilot" | "Proposed" | "Stalled";
  monthlyValue: number;
  description: string;
}

export interface ConsumptionPoint {
  date: string;
  apiSpend: number;
  cfeSeatsActive: number;
  codeSeatsActive: number;
}

export interface ValueRealization {
  outcome: string;
  baseline: string;
  current: string;
  dollarValue: number;
  method: "Hours saved" | "Revenue lifted" | "Cost avoided";
  validatedBy: string;
  source: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  employees: number;
  arr: number;
  contractValue: number;
  csm: string;
  stage: AdoptionStage;
  startDate: string;
  lastQbr: string;
  nextQbr: string;
  surfaces: {
    api: { contracted: number; consumed: number; unit: "tokens" };
    cfe: { seats: number; activated: number };
    code: { seats: number; activated: number };
  };
  stakeholders: Stakeholder[];
  useCases: UseCase[];
  consumption: ConsumptionPoint[];
  valueRealized: ValueRealization[];
  risks: RiskSignal[];
  expansionLevers: string[];
  recentActivity: { date: string; type: string; detail: string }[];
}

function generateConsumption(
  days: number,
  apiStart: number,
  apiTrend: number,
  cfeSeats: number,
  codeSeats: number,
  volatility: number = 0.15,
): ConsumptionPoint[] {
  const points: ConsumptionPoint[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const t = (days - i) / days;
    const apiBase = apiStart + apiTrend * t;
    const noise = 1 + (Math.sin(i * 0.7) + Math.cos(i * 0.3)) * volatility;
    points.push({
      date: date.toISOString().slice(0, 10),
      apiSpend: Math.round(apiBase * noise),
      cfeSeatsActive: Math.round(cfeSeats * (0.6 + 0.3 * t + Math.sin(i * 0.4) * 0.05)),
      codeSeatsActive: Math.round(codeSeats * (0.5 + 0.4 * t + Math.cos(i * 0.5) * 0.05)),
    });
  }
  return points;
}

export const ACCOUNTS: Account[] = [
  {
    id: "helix",
    name: "Helix Systems",
    industry: "Developer tools / Cloud infrastructure",
    employees: 100000,
    arr: 1_200_000_000,
    contractValue: 4_800_000,
    csm: "You",
    stage: "Scale",
    startDate: "2024-09-01",
    lastQbr: "2026-02-12",
    nextQbr: "2026-05-21",
    surfaces: {
      api: { contracted: 5_000_000_000, consumed: 3_200_000_000, unit: "tokens" },
      cfe: { seats: 8000, activated: 5240 },
      code: { seats: 1200, activated: 1080 },
    },
    stakeholders: [
      {
        name: "Priya Raman",
        title: "SVP Engineering Platform",
        org: "Platform Org",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-08",
      },
      {
        name: "Marcus Hill",
        title: "Director, Developer Productivity",
        org: "Platform Org",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-14",
      },
      {
        name: "Yuki Tanaka",
        title: "Principal Engineer, AI Platform",
        org: "Platform Org",
        role: "Technical Lead",
        sentiment: "positive",
        lastTouch: "2026-05-12",
      },
      {
        name: "Diane Whitfield",
        title: "VP IT, Knowledge Worker Productivity",
        org: "IT",
        role: "Champion",
        sentiment: "neutral",
        lastTouch: "2026-04-29",
      },
      {
        name: "Raj Patel",
        title: "Director, Security Engineering",
        org: "Security",
        role: "Detractor",
        sentiment: "negative",
        lastTouch: "2026-05-02",
      },
      {
        name: "Sofia Alvarez",
        title: "Chief Data Officer",
        org: "Data Org",
        role: "Economic Buyer",
        sentiment: "neutral",
        lastTouch: "2026-04-21",
      },
    ],
    useCases: [
      {
        id: "uc-1",
        name: "IDE-embedded coding copilot",
        department: "Platform Engineering",
        surface: "API",
        status: "Production",
        monthlyValue: 180_000,
        description:
          "Claude-powered code completions and PR review summaries inside Helix's internal IDE fork. 12k weekly active engineers.",
      },
      {
        id: "uc-2",
        name: "Customer support deflection",
        department: "Support",
        surface: "API",
        status: "Production",
        monthlyValue: 95_000,
        description:
          "First-line response drafting and ticket triage. Currently 38% of tier-1 tickets fully deflected.",
      },
      {
        id: "uc-3",
        name: "Knowledge base assistant (CfE)",
        department: "All knowledge workers",
        surface: "Claude for Enterprise",
        status: "Production",
        monthlyValue: 65_000,
        description:
          "Org-wide Claude with connectors to Confluence, Jira, Slack. Activation lagging at 65%.",
      },
      {
        id: "uc-4",
        name: "Platform team agent (Claude Code)",
        department: "Platform Engineering",
        surface: "Claude Code",
        status: "Production",
        monthlyValue: 140_000,
        description:
          "Migrations, codemods, dependency upgrades. 1080 of 1200 seats active. Strong word-of-mouth.",
      },
      {
        id: "uc-5",
        name: "Legal contract review",
        department: "Legal",
        surface: "Claude for Enterprise",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "30-person pilot reviewing vendor contracts. Awaiting security sign-off from Raj Patel's team.",
      },
      {
        id: "uc-6",
        name: "Finance close automation",
        department: "Finance",
        surface: "API",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "CFO has expressed interest in accelerating month-end close. Discovery call scheduled.",
      },
      {
        id: "uc-7",
        name: "Sales deal desk",
        department: "Sales Ops",
        surface: "Claude for Enterprise",
        status: "Stalled",
        monthlyValue: 0,
        description:
          "Pilot stalled after Q1 reorg. Original sponsor left the company. Needs re-energizing.",
      },
    ],
    consumption: generateConsumption(90, 32_000, 28_000, 8000, 1200, 0.18),
    valueRealized: [
      {
        outcome: "Engineering velocity uplift",
        baseline: "112 PRs/week avg",
        current: "168 PRs/week avg",
        dollarValue: 4_200_000,
        method: "Hours saved",
        validatedBy: "Marcus Hill, Director Dev Productivity",
        source: "Q1 2026 Productivity Report",
      },
      {
        outcome: "Tier-1 support cost reduction",
        baseline: "$2.40/ticket",
        current: "$1.48/ticket",
        dollarValue: 1_850_000,
        method: "Cost avoided",
        validatedBy: "Support FinOps team",
        source: "March 2026 Support P&L",
      },
      {
        outcome: "Platform migration acceleration",
        baseline: "Java 11→17 est. 9 months",
        current: "Completed in 11 weeks",
        dollarValue: 2_100_000,
        method: "Hours saved",
        validatedBy: "Yuki Tanaka, Principal Eng",
        source: "Internal migration retro",
      },
    ],
    risks: [
      {
        label: "Security review blocking Legal expansion",
        level: "high",
        detail:
          "Raj Patel's team has held the Legal CfE expansion for 6 weeks pending DLP review. Risk: $400k expansion at stake.",
      },
      {
        label: "CfE seat utilization at 65%",
        level: "medium",
        detail:
          "5240 of 8000 seats activated. 30-day trend flat. Risk of non-renewal of unused seats at next true-up.",
      },
      {
        label: "Sales Ops pilot stalled",
        level: "medium",
        detail:
          "Lost champion in Q1 reorg. No new owner identified. Pilot will lapse if not re-sponsored by Q3.",
      },
    ],
    expansionLevers: [
      "Unblock Legal pilot → $400k ARR within 90 days",
      "CFO interest in Finance close automation → $600k ARR opportunity",
      "Train-the-Trainer for CfE to lift seat utilization 65% → 85%",
      "Center of Excellence stand-up sponsored by Priya Raman",
    ],
    recentActivity: [
      { date: "2026-05-14", type: "Meeting", detail: "Working session with Marcus Hill on Claude Code adoption metrics" },
      { date: "2026-05-12", type: "Technical", detail: "Yuki Tanaka requested deep dive on prompt caching for IDE copilot" },
      { date: "2026-05-08", type: "Executive", detail: "Quarterly check-in with Priya Raman — discussed CoE proposal" },
      { date: "2026-05-02", type: "Risk", detail: "Raj Patel raised concerns about Claude data residency for Legal use case" },
      { date: "2026-04-29", type: "Meeting", detail: "Diane Whitfield walkthrough of CfE seat utilization dashboard" },
    ],
  },
  {
    id: "northwind",
    name: "Northwind Cloud",
    industry: "B2B SaaS / Data infrastructure",
    employees: 12000,
    arr: 380_000_000,
    contractValue: 950_000,
    csm: "You",
    stage: "First Build",
    startDate: "2025-11-15",
    lastQbr: "2026-03-04",
    nextQbr: "2026-06-04",
    surfaces: {
      api: { contracted: 800_000_000, consumed: 240_000_000, unit: "tokens" },
      cfe: { seats: 500, activated: 180 },
      code: { seats: 0, activated: 0 },
    },
    stakeholders: [
      {
        name: "Elena Brooks",
        title: "VP Engineering",
        org: "Engineering",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-10",
      },
      {
        name: "Tom Iversen",
        title: "Staff Engineer, AI Infrastructure",
        org: "Engineering",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-15",
      },
    ],
    useCases: [
      {
        id: "nw-1",
        name: "Internal docs search assistant",
        department: "Engineering",
        surface: "API",
        status: "Production",
        monthlyValue: 28_000,
        description: "Q&A over engineering documentation, deployed to all 4k engineers.",
      },
      {
        id: "nw-2",
        name: "Enterprise rollout pilot",
        department: "Knowledge workers",
        surface: "Claude for Enterprise",
        status: "Pilot",
        monthlyValue: 0,
        description: "180 of 500 seats activated. Need enablement push.",
      },
    ],
    consumption: generateConsumption(90, 6_000, 9_000, 500, 0, 0.22),
    valueRealized: [
      {
        outcome: "Engineer docs lookup time",
        baseline: "14 min avg",
        current: "3 min avg",
        dollarValue: 380_000,
        method: "Hours saved",
        validatedBy: "Tom Iversen",
        source: "Engineering survey, April 2026",
      },
    ],
    risks: [
      {
        label: "CfE seat utilization critically low (36%)",
        level: "high",
        detail: "180 of 500 seats active 60 days in. No formal enablement program. High churn risk at renewal.",
      },
      {
        label: "Single champion dependency",
        level: "medium",
        detail: "Tom Iversen is sole technical advocate. If he leaves, momentum stalls.",
      },
    ],
    expansionLevers: [
      "Claude Code pilot for platform team (warm intro from Tom)",
      "Stand up enablement program to lift CfE utilization",
    ],
    recentActivity: [
      { date: "2026-05-15", type: "Technical", detail: "Tom requested help benchmarking Sonnet vs Opus for docs use case" },
      { date: "2026-05-10", type: "Executive", detail: "Elena Brooks check-in — interest in Claude Code" },
    ],
  },
  {
    id: "skyforge",
    name: "Skyforge AI",
    industry: "AI-native B2B / Vertical SaaS",
    employees: 850,
    arr: 95_000_000,
    contractValue: 320_000,
    csm: "You",
    stage: "Embed",
    startDate: "2024-04-01",
    lastQbr: "2026-02-28",
    nextQbr: "2026-05-28",
    surfaces: {
      api: { contracted: 2_000_000_000, consumed: 2_400_000_000, unit: "tokens" },
      cfe: { seats: 850, activated: 820 },
      code: { seats: 220, activated: 215 },
    },
    stakeholders: [
      {
        name: "Aisha Mensah",
        title: "Co-Founder & CTO",
        org: "Executive",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-13",
      },
      {
        name: "Hiroshi Yamamoto",
        title: "Head of AI Engineering",
        org: "Engineering",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-16",
      },
    ],
    useCases: [
      {
        id: "sf-1",
        name: "Core product inference (customer-facing)",
        department: "Product",
        surface: "API",
        status: "Production",
        monthlyValue: 720_000,
        description: "Claude powers Skyforge's core agent product used by 14k end customers.",
      },
      {
        id: "sf-2",
        name: "All-hands Claude Code adoption",
        department: "Engineering",
        surface: "Claude Code",
        status: "Production",
        monthlyValue: 88_000,
        description: "98% of eng team uses Claude Code daily. Industry-leading adoption.",
      },
    ],
    consumption: generateConsumption(90, 22_000, 12_000, 850, 220, 0.12),
    valueRealized: [
      {
        outcome: "Product gross margin",
        baseline: "62%",
        current: "71%",
        dollarValue: 8_400_000,
        method: "Cost avoided",
        validatedBy: "Aisha Mensah",
        source: "Q1 board deck",
      },
    ],
    risks: [
      {
        label: "API consumption 120% of contracted volume",
        level: "medium",
        detail: "Burning through commitment 5 weeks early. Overage billing kicks in unless we expand.",
      },
    ],
    expansionLevers: [
      "Renewal & expansion conversation now — recommend 2x token commitment",
      "Multi-year prepay discussion (Aisha receptive)",
      "Co-marketing case study opportunity",
    ],
    recentActivity: [
      { date: "2026-05-16", type: "Technical", detail: "Hiroshi shared internal benchmark — Claude vs alternatives" },
      { date: "2026-05-13", type: "Executive", detail: "Aisha confirmed interest in 3-year expansion discussion" },
    ],
  },
];

export function getAccount(id: string): Account | undefined {
  return ACCOUNTS.find((a) => a.id === id);
}
