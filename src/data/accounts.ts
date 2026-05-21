import type { AdoptionStage, RiskSignal } from "@/lib/adoption-model";

export type ElevenLabsProduct = "ElevenAgents" | "ElevenCreative" | "ElevenAPI";

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
  product: ElevenLabsProduct;
  status: "Production" | "Pilot" | "Proposed" | "Stalled";
  monthlyValue: number;
  description: string;
}

export interface ConsumptionPoint {
  date: string;
  agentCallVolume: number;
  apiCharacters: number;
  creativeOutputs: number;
}

export interface ValueRealization {
  outcome: string;
  baseline: string;
  current: string;
  dollarValue: number;
  method: "Hours saved" | "Revenue lifted" | "Cost avoided" | "CSAT improvement";
  validatedBy: string;
  source: string;
}

export interface ProductAdoption {
  adopted: ElevenLabsProduct[];
  trialling: ElevenLabsProduct[];
  whitespace: ElevenLabsProduct[];
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  arr: number;
  contractValue: number;
  csm: string;
  stage: AdoptionStage;
  startDate: string;
  lastQbr: string;
  nextQbr: string;
  renewalDate: string;
  products: ProductAdoption;
  metrics: {
    agents: { deployed: number; callVolumeMonthly: number; automationRate: number };
    api: { contractedCharsMonthly: number; consumedCharsMonthly: number };
    creative: { outputsMonthly: number; languages: number };
  };
  stakeholders: Stakeholder[];
  useCases: UseCase[];
  consumption: ConsumptionPoint[];
  valueRealized: ValueRealization[];
  risks: RiskSignal[];
  expansionLevers: string[];
  recentActivity: { date: string; type: string; detail: string }[];
  nrr: number;
  grr: number;
}

function generateConsumption(
  days: number,
  agentStart: number,
  agentTrend: number,
  apiStart: number,
  apiTrend: number,
  creativeStart: number,
  creativeTrend: number,
  volatility = 0.15,
): ConsumptionPoint[] {
  const points: ConsumptionPoint[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const t = (days - i) / days;
    const noise = 1 + (Math.sin(i * 0.7) + Math.cos(i * 0.3)) * volatility;
    points.push({
      date: date.toISOString().slice(0, 10),
      agentCallVolume: Math.round(Math.max(0, (agentStart + agentTrend * t) * noise)),
      apiCharacters: Math.round(Math.max(0, (apiStart + apiTrend * t) * noise)),
      creativeOutputs: Math.round(Math.max(0, (creativeStart + creativeTrend * t) * noise)),
    });
  }
  return points;
}

export const ACCOUNTS: Account[] = [
  // ─── Deutsche Telekom ───────────────────────────────────────────────────────
  {
    id: "telekom",
    name: "Deutsche Telekom",
    industry: "Telecommunications",
    country: "Germany",
    employees: 200_000,
    arr: 89_000_000_000,
    contractValue: 3_200_000,
    csm: "You",
    stage: "Strategic",
    startDate: "2024-06-01",
    lastQbr: "2026-02-18",
    nextQbr: "2026-05-21",
    renewalDate: "2026-11-30",
    products: {
      adopted: ["ElevenAgents", "ElevenAPI"],
      trialling: ["ElevenCreative"],
      whitespace: [],
    },
    metrics: {
      agents: { deployed: 24, callVolumeMonthly: 1_800_000, automationRate: 0.71 },
      api: { contractedCharsMonthly: 12_000_000_000, consumedCharsMonthly: 10_400_000_000 },
      creative: { outputsMonthly: 3_200, languages: 4 },
    },
    stakeholders: [
      {
        name: "Birgit Schäfer",
        title: "SVP Customer Operations",
        org: "Customer Ops",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-12",
      },
      {
        name: "Marcus Lindner",
        title: "Head of Conversational AI",
        org: "Customer Ops",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-16",
      },
      {
        name: "Thomas Reiter",
        title: "Director, AI Infrastructure",
        org: "Technology",
        role: "Technical Lead",
        sentiment: "positive",
        lastTouch: "2026-05-14",
      },
      {
        name: "Anke Vogel",
        title: "Data Protection Officer",
        org: "Legal / Compliance",
        role: "Detractor",
        sentiment: "negative",
        lastTouch: "2026-04-30",
      },
      {
        name: "Stefan Bauer",
        title: "VP Marketing Technology",
        org: "Marketing",
        role: "End User",
        sentiment: "neutral",
        lastTouch: "2026-04-22",
      },
    ],
    useCases: [
      {
        id: "dt-1",
        name: "Tier-1 voice support agent (DE/EN)",
        department: "Customer Operations",
        product: "ElevenAgents",
        status: "Production",
        monthlyValue: 680_000,
        description:
          "24 voice agents handling 1.8M calls/month across 10 product lines. 71% automation rate. €0.38 cost per deflected call vs €2.10 human cost.",
      },
      {
        id: "dt-2",
        name: "Real-time voice API for IVR modernisation",
        department: "Technology",
        product: "ElevenAPI",
        status: "Production",
        monthlyValue: 220_000,
        description:
          "Custom voice model trained on Telekom brand voice. Deployed in 8 IVR flows. 10.4B chars/month consumed.",
      },
      {
        id: "dt-3",
        name: "Multilingual creative content (ElevenCreative)",
        department: "Marketing",
        product: "ElevenCreative",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "30-person pilot dubbing campaign videos into Turkish, Polish, Greek. DPO sign-off pending on voice cloning data residency.",
      },
      {
        id: "dt-4",
        name: "Network operations alert narration",
        department: "Network Operations",
        product: "ElevenAPI",
        status: "Proposed",
        monthlyValue: 0,
        description: "NOC team wants spoken incident summaries for on-call. TAM engaged, scoping call booked.",
      },
    ],
    consumption: generateConsumption(90, 55_000, 15_000, 320_000_000, 45_000_000, 80, 40, 0.12),
    valueRealized: [
      {
        outcome: "Tier-1 call deflection savings",
        baseline: "€2.10 per contact",
        current: "€0.38 per automated contact",
        dollarValue: 9_800_000,
        method: "Cost avoided",
        validatedBy: "Birgit Schäfer — SVP Customer Ops",
        source: "Q4 2025 Operations P&L review",
      },
      {
        outcome: "Average handle time reduction",
        baseline: "8.2 min avg handle time",
        current: "5.1 min (38% reduction)",
        dollarValue: 2_100_000,
        method: "Hours saved",
        validatedBy: "Marcus Lindner — Head of Conversational AI",
        source: "Quarterly ops review, March 2026",
      },
      {
        outcome: "CSAT uplift on voice interactions",
        baseline: "3.4/5 CSAT",
        current: "4.1/5 CSAT",
        dollarValue: 1_400_000,
        method: "CSAT improvement",
        validatedBy: "Internal NPS team",
        source: "Telekom CX benchmark, Q1 2026",
      },
    ],
    risks: [
      {
        label: "DPO blocking ElevenCreative expansion",
        level: "high",
        detail:
          "Anke Vogel (DPO) has stalled the voice cloning pilot citing GDPR data residency uncertainty. €800k expansion at risk. Needs ElevenLabs legal + EU data processing addendum.",
      },
      {
        label: "API consumption at 87% — headroom shrinking",
        level: "medium",
        detail:
          "At current growth rate, committed volume exhausted by October. Either expand commitment now or overage billing kicks in. Recommend proactive renewal discussion.",
      },
    ],
    expansionLevers: [
      "Unblock DPO with EU DPA addendum → ElevenCreative expansion €800k",
      "API volume expansion before overage threshold (October risk)",
      "NOC alert narration pilot → new ElevenAPI use case €180k",
      "Multilingual agent rollout: FR/ES/IT markets",
    ],
    recentActivity: [
      { date: "2026-05-16", type: "Technical", detail: "Thomas Reiter: capacity planning discussion, API volume forecast for H2" },
      { date: "2026-05-14", type: "Risk", detail: "Anke Vogel raised GDPR concerns on ElevenCreative voice cloning data residency" },
      { date: "2026-05-12", type: "Executive", detail: "Birgit Schäfer QBR prep — confirmed €3.2M renewal intent" },
      { date: "2026-05-08", type: "Expansion", detail: "Marcus Lindner requested agent expansion roadmap for FR market" },
      { date: "2026-04-30", type: "Risk", detail: "DPO formally blocked creative pilot pending data residency review" },
    ],
    nrr: 1.34,
    grr: 1.0,
  },

  // ─── BMW Group ──────────────────────────────────────────────────────────────
  {
    id: "bmw",
    name: "BMW Group",
    industry: "Automotive",
    country: "Germany",
    employees: 150_000,
    arr: 142_000_000_000,
    contractValue: 1_800_000,
    csm: "You",
    stage: "Champion",
    startDate: "2024-10-01",
    lastQbr: "2026-03-05",
    nextQbr: "2026-06-04",
    renewalDate: "2026-09-30",
    products: {
      adopted: ["ElevenCreative", "ElevenAPI"],
      trialling: ["ElevenAgents"],
      whitespace: [],
    },
    metrics: {
      agents: { deployed: 3, callVolumeMonthly: 28_000, automationRate: 0.45 },
      api: { contractedCharsMonthly: 5_000_000_000, consumedCharsMonthly: 4_600_000_000 },
      creative: { outputsMonthly: 12_400, languages: 12 },
    },
    stakeholders: [
      {
        name: "Klaus Weidemann",
        title: "VP Digital Brand Experience",
        org: "Brand / Marketing",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-09",
      },
      {
        name: "Lena Fischer",
        title: "Head of Multilingual Content",
        org: "Marketing",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-17",
      },
      {
        name: "David Chen",
        title: "Director, Connected Vehicle UX",
        org: "Product",
        role: "Technical Lead",
        sentiment: "positive",
        lastTouch: "2026-05-13",
      },
      {
        name: "Ingrid Müller",
        title: "Chief Procurement Officer",
        org: "Procurement",
        role: "Economic Buyer",
        sentiment: "neutral",
        lastTouch: "2026-04-18",
      },
    ],
    useCases: [
      {
        id: "bmw-1",
        name: "Global campaign audio localisation",
        department: "Marketing",
        product: "ElevenCreative",
        status: "Production",
        monthlyValue: 480_000,
        description:
          "12 language markets. 12,400 audio assets/month for ads, social, dealer kits. Replaced agency dubbing cost of €1.8M/year.",
      },
      {
        id: "bmw-2",
        name: "BMW iDrive voice persona (in-car)",
        department: "Product / Connected Vehicle",
        product: "ElevenAPI",
        status: "Production",
        monthlyValue: 290_000,
        description:
          "Custom voice trained on BMW's brand persona. Deployed in iDrive 9.0 across 340k vehicles. 4.6B chars/month.",
      },
      {
        id: "bmw-3",
        name: "Dealer support chat + voice agent",
        department: "Sales / Dealer Network",
        product: "ElevenAgents",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "3-agent pilot for 50 dealers (DE). Handles parts availability, test drive booking. Klaus receptive to full rollout if KPIs confirmed.",
      },
      {
        id: "bmw-4",
        name: "Employee learning content narration",
        department: "HR / Training",
        product: "ElevenCreative",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "HR team wants to automate narration of 200+ LMS modules. Lena Fischer introduced contact. Scoping session TBD.",
      },
    ],
    consumption: generateConsumption(90, 800, 600, 130_000_000, 30_000_000, 380, 85, 0.14),
    valueRealized: [
      {
        outcome: "Agency dubbing cost elimination",
        baseline: "€1.8M/year external dubbing agency",
        current: "€0 — fully automated with ElevenCreative",
        dollarValue: 1_800_000,
        method: "Cost avoided",
        validatedBy: "Lena Fischer — Head of Multilingual Content",
        source: "Marketing OPEX review, Q1 2026",
      },
      {
        outcome: "Time-to-market for campaign assets",
        baseline: "18 days per campaign localisation",
        current: "2 days (89% reduction)",
        dollarValue: 640_000,
        method: "Hours saved",
        validatedBy: "Klaus Weidemann — VP Digital Brand",
        source: "Campaign ops workflow analysis, Feb 2026",
      },
    ],
    risks: [
      {
        label: "Procurement re-tender risk at renewal",
        level: "high",
        detail:
          "Ingrid Müller (CPO) is requiring a formal RFP for contracts >€1M. Renewal Sep 2026. Need to build executive sponsorship above procurement and demonstrate locked-in ROI before RFP window opens.",
      },
      {
        label: "Dealer agent pilot KPIs not yet defined",
        level: "medium",
        detail:
          "Pilot has been running 8 weeks with no agreed success criteria. Risk of scope creep and delayed go/no-go decision. Need to agree KPIs this week.",
      },
    ],
    expansionLevers: [
      "Full dealer agent rollout (500 dealers EU) → €1.2M expansion",
      "HR LMS narration → ElevenCreative upsell €320k",
      "Prove dealer pilot KPIs to accelerate go/no-go",
      "Executive briefing with Klaus + Ingrid ahead of renewal",
    ],
    recentActivity: [
      { date: "2026-05-17", type: "Meeting", detail: "Lena Fischer: requested roadmap on multilingual voice cloning for 2027 markets" },
      { date: "2026-05-13", type: "Technical", detail: "David Chen scoping ElevenAgents for in-car voice assistant (Phase 2)" },
      { date: "2026-05-09", type: "Executive", detail: "Klaus Weidemann confirmed positive intent on dealer agent expansion" },
      { date: "2026-04-30", type: "Risk", detail: "Procurement flagged formal RFP requirement for Sep renewal" },
    ],
    nrr: 1.22,
    grr: 1.0,
  },

  // ─── Allianz ─────────────────────────────────────────────────────────────────
  {
    id: "allianz",
    name: "Allianz SE",
    industry: "Insurance / Financial Services",
    country: "Germany",
    employees: 155_000,
    arr: 161_000_000_000,
    contractValue: 2_400_000,
    csm: "You",
    stage: "Expanding",
    startDate: "2025-01-15",
    lastQbr: "2026-04-02",
    nextQbr: "2026-07-02",
    renewalDate: "2027-01-14",
    products: {
      adopted: ["ElevenAgents"],
      trialling: ["ElevenAPI"],
      whitespace: ["ElevenCreative"],
    },
    metrics: {
      agents: { deployed: 8, callVolumeMonthly: 420_000, automationRate: 0.58 },
      api: { contractedCharsMonthly: 3_000_000_000, consumedCharsMonthly: 1_100_000_000 },
      creative: { outputsMonthly: 0, languages: 0 },
    },
    stakeholders: [
      {
        name: "Dr. Petra Hofer",
        title: "COO, European Operations",
        org: "Operations",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-04-29",
      },
      {
        name: "Jens Brandt",
        title: "Head of Digital Claims",
        org: "Claims",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-15",
      },
      {
        name: "Sophia Koch",
        title: "AI Governance Lead",
        org: "Risk & Compliance",
        role: "Detractor",
        sentiment: "neutral",
        lastTouch: "2026-05-10",
      },
    ],
    useCases: [
      {
        id: "alz-1",
        name: "Claims first notice of loss (FNOL) voice agent",
        department: "Claims",
        product: "ElevenAgents",
        status: "Production",
        monthlyValue: 340_000,
        description:
          "8 agents handling 420k claims calls/month (DE market). 58% automated resolution. Average claim cycle reduced by 4.2 days.",
      },
      {
        id: "alz-2",
        name: "Policy renewal outbound voice agent",
        department: "Retention",
        product: "ElevenAgents",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "Pilot outbound agent for policy renewals. 12k calls/week. Awaiting compliance sign-off from Sophia Koch's team.",
      },
      {
        id: "alz-3",
        name: "Custom voice API for IVR",
        department: "Technology",
        product: "ElevenAPI",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "Trialling Allianz branded voice for IVR system. 1.1B chars consumed in trial. Full production TBD pending procurement.",
      },
      {
        id: "alz-4",
        name: "Agent training video narration",
        department: "HR / Learning & Development",
        product: "ElevenCreative",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "L&D team flagged interest in automating narration for 500+ training modules. Not yet in active discussion.",
      },
    ],
    consumption: generateConsumption(90, 12_000, 8_000, 28_000_000, 18_000_000, 0, 0, 0.2),
    valueRealized: [
      {
        outcome: "FNOL call handling cost reduction",
        baseline: "€3.20/call human handling",
        current: "€0.52/automated call",
        dollarValue: 5_600_000,
        method: "Cost avoided",
        validatedBy: "Jens Brandt — Head of Digital Claims",
        source: "Claims ops dashboard, Q1 2026",
      },
      {
        outcome: "Claims cycle time improvement",
        baseline: "11.4 days average cycle",
        current: "7.2 days (37% faster)",
        dollarValue: 1_200_000,
        method: "Revenue lifted",
        validatedBy: "Dr. Petra Hofer — COO",
        source: "Allianz claims SLA report, March 2026",
      },
    ],
    risks: [
      {
        label: "AI governance blocking outbound agent pilot",
        level: "high",
        detail:
          "Sophia Koch's team has raised questions about AI disclosure requirements under EU AI Act for outbound voice agents. €600k retention expansion at risk. Need ElevenLabs legal brief on compliance.",
      },
      {
        label: "API trial showing low utilisation (37% of committed)",
        level: "medium",
        detail:
          "API trial 6 months in at only 1.1B of 3B contracted chars. Risk of downsize at renewal. Needs accelerated adoption path or right-size conversation.",
      },
    ],
    expansionLevers: [
      "Unblock outbound agent compliance → €600k retention expansion",
      "Convert API trial to production → volume expansion €400k",
      "ElevenCreative L&D pilot → new product expansion €280k",
      "FR + NL markets agent rollout (Allianz has operations in both)",
    ],
    recentActivity: [
      { date: "2026-05-15", type: "Meeting", detail: "Jens Brandt: FNOL agent scale review — wants 4 additional agents for motor claims" },
      { date: "2026-05-10", type: "Risk", detail: "Sophia Koch raised EU AI Act disclosure requirements for outbound agent" },
      { date: "2026-04-29", type: "Executive", detail: "Dr. Petra Hofer — positive on expansion, wants compliance resolved first" },
    ],
    nrr: 1.18,
    grr: 1.0,
  },

  // ─── Klarna ──────────────────────────────────────────────────────────────────
  {
    id: "klarna",
    name: "Klarna",
    industry: "Fintech / Buy Now Pay Later",
    country: "Sweden",
    employees: 5_000,
    arr: 2_800_000_000,
    contractValue: 1_100_000,
    csm: "You",
    stage: "Strategic",
    startDate: "2024-03-01",
    lastQbr: "2026-02-26",
    nextQbr: "2026-05-28",
    renewalDate: "2026-08-28",
    products: {
      adopted: ["ElevenAgents", "ElevenAPI", "ElevenCreative"],
      trialling: [],
      whitespace: [],
    },
    metrics: {
      agents: { deployed: 18, callVolumeMonthly: 2_400_000, automationRate: 0.87 },
      api: { contractedCharsMonthly: 8_000_000_000, consumedCharsMonthly: 9_200_000_000 },
      creative: { outputsMonthly: 8_800, languages: 18 },
    },
    stakeholders: [
      {
        name: "Anna Svensson",
        title: "Chief Operations Officer",
        org: "Operations",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-14",
      },
      {
        name: "Erik Nilsson",
        title: "Head of Conversational AI",
        org: "Product & Tech",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-18",
      },
      {
        name: "Maria Andersson",
        title: "VP Brand & Creative",
        org: "Marketing",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-11",
      },
    ],
    useCases: [
      {
        id: "kl-1",
        name: "Customer service AI (all markets)",
        department: "Customer Operations",
        product: "ElevenAgents",
        status: "Production",
        monthlyValue: 920_000,
        description:
          "18 voice agents across EU/NA. 2.4M calls/month, 87% automation. Replaced $65M/year contact centre spend.",
      },
      {
        id: "kl-2",
        name: "Klarna branded voice (API)",
        department: "Product",
        product: "ElevenAPI",
        status: "Production",
        monthlyValue: 380_000,
        description:
          "Custom Klarna voice deployed app-wide. 9.2B chars/month (above committed volume — renewal expansion needed).",
      },
      {
        id: "kl-3",
        name: "18-language campaign content",
        department: "Marketing",
        product: "ElevenCreative",
        status: "Production",
        monthlyValue: 210_000,
        description:
          "8,800 audio/video outputs per month across 18 languages. Fashion, lifestyle, finance campaigns.",
      },
    ],
    consumption: generateConsumption(90, 72_000, 14_000, 280_000_000, 35_000_000, 280, 55, 0.1),
    valueRealized: [
      {
        outcome: "Contact centre cost reduction",
        baseline: "$65M/year contact centre budget",
        current: "Reduced by 73% via agent automation",
        dollarValue: 47_000_000,
        method: "Cost avoided",
        validatedBy: "Anna Svensson — COO",
        source: "Klarna H1 2025 earnings call (public)",
      },
      {
        outcome: "Content localisation speed",
        baseline: "3-4 weeks per campaign market",
        current: "48 hours (97% faster)",
        dollarValue: 3_200_000,
        method: "Hours saved",
        validatedBy: "Maria Andersson — VP Brand",
        source: "Marketing ops review, Q1 2026",
      },
    ],
    risks: [
      {
        label: "API consumption 115% of committed — overage billing live",
        level: "medium",
        detail:
          "9.2B of 8B committed chars/month. Overage charges applying. Recommend proactive expansion before renewal (Aug 2026). Erik aligned, needs COO sign-off.",
      },
    ],
    expansionLevers: [
      "Expand API commitment before overage compounds → €400k expansion",
      "Klarna co-marketing case study (highest automation rate in portfolio)",
      "Multi-year deal discussion — Anna receptive",
    ],
    recentActivity: [
      { date: "2026-05-18", type: "Technical", detail: "Erik Nilsson: API volume forecast — expects 15% MoM growth in H2" },
      { date: "2026-05-14", type: "Executive", detail: "Anna Svensson: confirmed expansion intent, wants multi-year discussion" },
      { date: "2026-05-11", type: "Meeting", detail: "Maria Andersson: new languages request — Portuguese (BR) and Korean" },
    ],
    nrr: 1.41,
    grr: 1.0,
  },

  // ─── N26 ─────────────────────────────────────────────────────────────────────
  {
    id: "n26",
    name: "N26",
    industry: "Neobank / Fintech",
    country: "Germany",
    employees: 1_500,
    arr: 220_000_000,
    contractValue: 480_000,
    csm: "You",
    stage: "Production",
    startDate: "2025-10-01",
    lastQbr: "2026-03-18",
    nextQbr: "2026-06-18",
    renewalDate: "2026-09-30",
    products: {
      adopted: ["ElevenAgents"],
      trialling: [],
      whitespace: ["ElevenAPI", "ElevenCreative"],
    },
    metrics: {
      agents: { deployed: 4, callVolumeMonthly: 85_000, automationRate: 0.52 },
      api: { contractedCharsMonthly: 0, consumedCharsMonthly: 0 },
      creative: { outputsMonthly: 0, languages: 0 },
    },
    stakeholders: [
      {
        name: "Camille Dubois",
        title: "VP Customer Experience",
        org: "CX",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-07",
      },
      {
        name: "Rafael García",
        title: "Lead AI Engineer",
        org: "Technology",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-19",
      },
      {
        name: "Hannah Weber",
        title: "Head of Compliance",
        org: "Legal & Compliance",
        role: "Detractor",
        sentiment: "neutral",
        lastTouch: "2026-05-05",
      },
    ],
    useCases: [
      {
        id: "n26-1",
        name: "Card dispute voice agent",
        department: "Customer Experience",
        product: "ElevenAgents",
        status: "Production",
        monthlyValue: 95_000,
        description:
          "4 agents handling card disputes and fraud alerts. 85k calls/month. 52% automation. 7 EU languages supported.",
      },
      {
        id: "n26-2",
        name: "Loan eligibility voice agent",
        department: "Lending",
        product: "ElevenAgents",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "Pilot handling 2k calls/month for consumer lending eligibility checks. Awaiting compliance sign-off for financial advice AI regulation.",
      },
      {
        id: "n26-3",
        name: "N26 branded voice (app-wide)",
        department: "Product",
        product: "ElevenAPI",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "Rafael exploring custom voice persona for the N26 app. API trial budget requested but not approved.",
      },
    ],
    consumption: generateConsumption(90, 2_500, 800, 0, 0, 0, 0, 0.25),
    valueRealized: [
      {
        outcome: "Dispute resolution cost reduction",
        baseline: "€8.40/dispute call",
        current: "€1.60/automated dispute",
        dollarValue: 580_000,
        method: "Cost avoided",
        validatedBy: "Camille Dubois — VP CX",
        source: "CX monthly ops report, April 2026",
      },
    ],
    risks: [
      {
        label: "Lending agent pilot stalled on financial advice regulation",
        level: "high",
        detail:
          "Hannah Weber flagged MiFID II-adjacent concerns about AI providing lending eligibility guidance. ElevenLabs legal team needs to provide position paper. €240k expansion blocked.",
      },
      {
        label: "Single product risk — zero ElevenAPI/Creative footprint",
        level: "medium",
        detail:
          "7 months in with only ElevenAgents. No API or Creative trial. Renewal risk if ElevenAgents automation rate plateaus. Need second product to deepen relationship.",
      },
    ],
    expansionLevers: [
      "Resolve lending pilot compliance → €240k expansion",
      "API trial with Rafael for N26 branded voice → new product footprint",
      "Increase automation rate 52% → 70% with advanced routing",
    ],
    recentActivity: [
      { date: "2026-05-19", type: "Technical", detail: "Rafael García: API product trial pitch — wants custom voice for N26 app" },
      { date: "2026-05-07", type: "Executive", detail: "Camille Dubois: satisfied with dispute agent, cautious on expansion pace" },
      { date: "2026-05-05", type: "Risk", detail: "Hannah Weber: formal note on AI financial advice compliance for lending pilot" },
    ],
    nrr: 1.08,
    grr: 1.0,
  },

  // ─── Delivery Hero ───────────────────────────────────────────────────────────
  {
    id: "deliveryhero",
    name: "Delivery Hero",
    industry: "Food Delivery / Quick Commerce",
    country: "Germany",
    employees: 40_000,
    arr: 10_400_000_000,
    contractValue: 920_000,
    csm: "You",
    stage: "Expanding",
    startDate: "2025-04-01",
    lastQbr: "2026-04-15",
    nextQbr: "2026-07-15",
    renewalDate: "2027-03-31",
    products: {
      adopted: ["ElevenAPI"],
      trialling: ["ElevenAgents"],
      whitespace: ["ElevenCreative"],
    },
    metrics: {
      agents: { deployed: 2, callVolumeMonthly: 18_000, automationRate: 0.41 },
      api: { contractedCharsMonthly: 6_000_000_000, consumedCharsMonthly: 5_800_000_000 },
      creative: { outputsMonthly: 0, languages: 0 },
    },
    stakeholders: [
      {
        name: "Priya Mehta",
        title: "VP Engineering, Platform",
        org: "Technology",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-10",
      },
      {
        name: "Lars Andersen",
        title: "Senior Principal Engineer, AI",
        org: "Technology",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-20",
      },
      {
        name: "Nadia Hassan",
        title: "Head of Rider & Customer Ops",
        org: "Operations",
        role: "End User",
        sentiment: "neutral",
        lastTouch: "2026-04-28",
      },
    ],
    useCases: [
      {
        id: "dh-1",
        name: "In-app voice navigation for riders (API)",
        department: "Product / Rider Experience",
        product: "ElevenAPI",
        status: "Production",
        monthlyValue: 380_000,
        description:
          "Real-time voice instructions for 200k+ riders across 30+ markets. 5.8B chars/month. Multilingual (25 languages). 14% delivery efficiency uplift.",
      },
      {
        id: "dh-2",
        name: "Customer support voice agent",
        department: "Customer Operations",
        product: "ElevenAgents",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "2-agent pilot for order status and refund queries. 18k calls/month. Evaluating for full rollout pending CSAT benchmarks.",
      },
      {
        id: "dh-3",
        name: "Marketing audio content (local markets)",
        department: "Marketing",
        product: "ElevenCreative",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "25+ market teams want localised radio / digital audio ads. Opportunity to expand ElevenCreative footprint into marketing.",
      },
    ],
    consumption: generateConsumption(90, 540, 200, 175_000_000, 22_000_000, 0, 0, 0.18),
    valueRealized: [
      {
        outcome: "Rider navigation efficiency",
        baseline: "Avg 38 min delivery",
        current: "33 min delivery (14% faster)",
        dollarValue: 4_200_000,
        method: "Revenue lifted",
        validatedBy: "Lars Andersen — Sr Principal Engineer",
        source: "Delivery Hero platform metrics dashboard, Q1 2026",
      },
    ],
    risks: [
      {
        label: "Agent pilot CSAT not yet benchmarked",
        level: "medium",
        detail:
          "Pilot has been live 6 weeks with no CSAT baseline set. Risk of go/no-go decision being made on gut feel. Need to instrument CSAT tracking this week.",
      },
      {
        label: "API near capacity — committed volume at 97%",
        level: "medium",
        detail:
          "5.8B of 6B committed chars/month. Summer demand spike could exceed commitment. Proactive discussion needed before Q3.",
      },
    ],
    expansionLevers: [
      "Convert agent pilot to production → €600k expansion",
      "ElevenCreative for 25 local marketing teams → new product footprint",
      "API volume expansion ahead of summer demand spike",
    ],
    recentActivity: [
      { date: "2026-05-20", type: "Technical", detail: "Lars Andersen: benchmarking ElevenAgents for rider emergency support" },
      { date: "2026-05-10", type: "Executive", detail: "Priya Mehta: positive on agent rollout, wants CSAT data first" },
      { date: "2026-04-28", type: "Meeting", detail: "Nadia Hassan: CSAT methodology discussion for agent pilot evaluation" },
    ],
    nrr: 1.19,
    grr: 1.0,
  },

  // ─── Zalando ─────────────────────────────────────────────────────────────────
  {
    id: "zalando",
    name: "Zalando",
    industry: "E-commerce / Fashion",
    country: "Germany",
    employees: 17_000,
    arr: 10_400_000_000,
    contractValue: 740_000,
    csm: "You",
    stage: "First Build",
    startDate: "2026-02-01",
    lastQbr: "2026-05-06",
    nextQbr: "2026-08-06",
    renewalDate: "2027-01-31",
    products: {
      adopted: [],
      trialling: ["ElevenCreative"],
      whitespace: ["ElevenAgents", "ElevenAPI"],
    },
    metrics: {
      agents: { deployed: 0, callVolumeMonthly: 0, automationRate: 0 },
      api: { contractedCharsMonthly: 0, consumedCharsMonthly: 0 },
      creative: { outputsMonthly: 680, languages: 8 },
    },
    stakeholders: [
      {
        name: "Sophie Berger",
        title: "VP Content & Creative Technology",
        org: "Marketing",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-06",
      },
      {
        name: "Tobias Klein",
        title: "Lead ML Engineer, Voice",
        org: "Technology",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-21",
      },
    ],
    useCases: [
      {
        id: "zan-1",
        name: "Fashion campaign audio (ElevenCreative trial)",
        department: "Marketing",
        product: "ElevenCreative",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "Trialling ElevenCreative for seasonal campaign audio in 8 EU markets. 680 outputs/month. Sophie excited about speed vs agency.",
      },
      {
        id: "zan-2",
        name: "Personalised shopping voice assistant",
        department: "Product",
        product: "ElevenAPI",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "Tobias scoping a voice assistant for the Zalando app. Strong interest — ElevenAPI seen as best-in-class for naturalness.",
      },
      {
        id: "zan-3",
        name: "Returns & support voice agent",
        department: "Customer Service",
        product: "ElevenAgents",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "High-volume returns process (20%+ of orders). CS team exploring automation. Not yet in active discussion.",
      },
    ],
    consumption: generateConsumption(90, 0, 0, 0, 0, 20, 28, 0.3),
    valueRealized: [],
    risks: [
      {
        label: "No contracted product — creative trial not yet converted",
        level: "high",
        detail:
          "4 months in — only in ElevenCreative trial, nothing contracted. Critical window to convert trial to contract before competitor alternatives are evaluated.",
      },
      {
        label: "Single champion dependency (Tobias)",
        level: "medium",
        detail:
          "All momentum through Tobias Klein. Sophie (economic buyer) has been to one meeting. Need more executive exposure before contract discussion.",
      },
    ],
    expansionLevers: [
      "Convert ElevenCreative trial → first contract this quarter",
      "Tobias API proposal → ElevenAPI pilot (voice shopping assistant)",
      "Executive engagement: Sophie Berger ROI case from trial data",
    ],
    recentActivity: [
      { date: "2026-05-21", type: "Technical", detail: "Tobias Klein: API naturalness benchmark vs competitors — ElevenLabs leading" },
      { date: "2026-05-06", type: "Meeting", detail: "QBR with Sophie Berger — positive on creative trial, cautious on budget" },
    ],
    nrr: 1.0,
    grr: 1.0,
  },

  // ─── BNP Paribas ─────────────────────────────────────────────────────────────
  {
    id: "bnpparibas",
    name: "BNP Paribas",
    industry: "Banking / Financial Services",
    country: "France",
    employees: 190_000,
    arr: 48_000_000_000,
    contractValue: 2_800_000,
    csm: "You",
    stage: "Champion",
    startDate: "2024-07-01",
    lastQbr: "2026-03-12",
    nextQbr: "2026-06-12",
    renewalDate: "2026-12-31",
    products: {
      adopted: ["ElevenAgents", "ElevenAPI"],
      trialling: ["ElevenCreative"],
      whitespace: [],
    },
    metrics: {
      agents: { deployed: 16, callVolumeMonthly: 980_000, automationRate: 0.64 },
      api: { contractedCharsMonthly: 7_000_000_000, consumedCharsMonthly: 6_400_000_000 },
      creative: { outputsMonthly: 1_200, languages: 5 },
    },
    stakeholders: [
      {
        name: "Isabelle Moreau",
        title: "Group Chief Digital Officer",
        org: "Group Technology",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-08",
      },
      {
        name: "Antoine Lefevre",
        title: "Head of Voice AI, Retail Banking",
        org: "Retail Banking",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-19",
      },
      {
        name: "Céline Bernard",
        title: "VP Private Banking Technology",
        org: "Private Banking",
        role: "End User",
        sentiment: "positive",
        lastTouch: "2026-05-12",
      },
      {
        name: "Pierre Dumont",
        title: "Group Data Protection Officer",
        org: "Legal / Compliance",
        role: "Detractor",
        sentiment: "neutral",
        lastTouch: "2026-05-01",
      },
    ],
    useCases: [
      {
        id: "bnp-1",
        name: "Retail banking voice agents (FR/BE/LU)",
        department: "Retail Banking",
        product: "ElevenAgents",
        status: "Production",
        monthlyValue: 720_000,
        description:
          "16 agents across 3 markets. 980k calls/month. Account enquiries, payment support, branch appointments. 64% automation rate.",
      },
      {
        id: "bnp-2",
        name: "BNP branded voice API (omnichannel)",
        department: "Technology / Brand",
        product: "ElevenAPI",
        status: "Production",
        monthlyValue: 310_000,
        description:
          "Custom BNP voice across all digital touchpoints. 6.4B chars/month. Consistency across app, IVR, web.",
      },
      {
        id: "bnp-3",
        name: "Private banking client reporting narration",
        department: "Private Banking",
        product: "ElevenCreative",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "Céline's team piloting audio summaries of quarterly portfolio reports for HNW clients. GDPR consent framework being built.",
      },
      {
        id: "bnp-4",
        name: "Corporate banking IVR modernisation",
        department: "Corporate Banking",
        product: "ElevenAgents",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "Corporate banking team wants to modernise legacy IVR. 4M calls/year. Antoine to broker intro to Corporate Banking ops lead.",
      },
    ],
    consumption: generateConsumption(90, 29_000, 9_000, 195_000_000, 28_000_000, 38, 22, 0.13),
    valueRealized: [
      {
        outcome: "Retail contact centre cost reduction",
        baseline: "€4.20 per call (FR/BE/LU)",
        current: "€0.68 per automated call",
        dollarValue: 11_200_000,
        method: "Cost avoided",
        validatedBy: "Isabelle Moreau — Group CDO",
        source: "BNP Digital ops annual review, Q4 2025",
      },
      {
        outcome: "HNW client engagement (Private Banking pilot)",
        baseline: "28% report open rate",
        current: "67% audio summary play rate",
        dollarValue: 860_000,
        method: "Revenue lifted",
        validatedBy: "Céline Bernard — VP Private Banking Tech",
        source: "Pilot tracking dashboard, April 2026",
      },
    ],
    risks: [
      {
        label: "DPO blocking ElevenCreative private banking expansion",
        level: "medium",
        detail:
          "Pierre Dumont needs GDPR consent framework for using client voice preferences in personalised audio. Pilot paused. ElevenLabs legal team has draft DPA — needs counter-signature.",
      },
      {
        label: "Corporate banking intro dependent on Antoine",
        level: "medium",
        detail:
          "€1.8M expansion opportunity (4M calls/year) but needs Antoine to broker the introduction. He has agreed but no date set. Risk of opportunity stalling without push.",
      },
    ],
    expansionLevers: [
      "Close GDPR DPA → ElevenCreative private banking expansion €480k",
      "Antoine intro to Corporate Banking → €1.8M expansion pipeline",
      "Multi-market rollout: ES, IT, DE markets for retail agents",
    ],
    recentActivity: [
      { date: "2026-05-19", type: "Meeting", detail: "Antoine Lefevre: corporate banking expansion scoping — 4M calls/year opportunity" },
      { date: "2026-05-12", type: "Meeting", detail: "Céline Bernard: private banking pilot metrics — 67% play rate on audio reports" },
      { date: "2026-05-08", type: "Executive", detail: "Isabelle Moreau: strategic alignment session — confirmed multi-year intent" },
      { date: "2026-05-01", type: "Risk", detail: "Pierre Dumont: GDPR consent framework feedback — DPA draft sent" },
    ],
    nrr: 1.28,
    grr: 1.0,
  },

  // ─── HelloFresh ───────────────────────────────────────────────────────────────
  {
    id: "hellofresh",
    name: "HelloFresh",
    industry: "D2C / Subscription Commerce",
    country: "Germany",
    employees: 8_000,
    arr: 7_600_000_000,
    contractValue: 560_000,
    csm: "You",
    stage: "Expanding",
    startDate: "2025-03-01",
    lastQbr: "2026-04-22",
    nextQbr: "2026-07-22",
    renewalDate: "2027-02-28",
    products: {
      adopted: ["ElevenCreative"],
      trialling: ["ElevenAgents"],
      whitespace: ["ElevenAPI"],
    },
    metrics: {
      agents: { deployed: 1, callVolumeMonthly: 12_000, automationRate: 0.38 },
      api: { contractedCharsMonthly: 0, consumedCharsMonthly: 0 },
      creative: { outputsMonthly: 6_400, languages: 9 },
    },
    stakeholders: [
      {
        name: "Emma Schreiber",
        title: "Global Head of Content Marketing",
        org: "Marketing",
        role: "Economic Buyer",
        sentiment: "positive",
        lastTouch: "2026-05-15",
      },
      {
        name: "Jonas Wolf",
        title: "Senior Creative Technologist",
        org: "Marketing",
        role: "Champion",
        sentiment: "positive",
        lastTouch: "2026-05-20",
      },
      {
        name: "Andrea Russo",
        title: "Head of Customer Care",
        org: "Operations",
        role: "End User",
        sentiment: "neutral",
        lastTouch: "2026-05-02",
      },
    ],
    useCases: [
      {
        id: "hf-1",
        name: "Recipe audio content (9 markets)",
        department: "Marketing / Content",
        product: "ElevenCreative",
        status: "Production",
        monthlyValue: 195_000,
        description:
          "6,400 audio outputs/month across 9 markets — recipes, how-to guides, podcast-style content. Replaced 3 FTE freelance voiceover budget.",
      },
      {
        id: "hf-2",
        name: "Subscription cancellation retention agent",
        department: "Customer Care",
        product: "ElevenAgents",
        status: "Pilot",
        monthlyValue: 0,
        description:
          "1-agent pilot for pause/cancel calls. 12k calls/month. 38% automated. Andrea cautious — wants CSAT proof before scaling.",
      },
      {
        id: "hf-3",
        name: "HelloFresh app voice (branded)",
        department: "Product",
        product: "ElevenAPI",
        status: "Proposed",
        monthlyValue: 0,
        description:
          "Product team exploring voice-guided cooking in-app. Jonas keen to trial ElevenAPI but no budget allocated yet.",
      },
    ],
    consumption: generateConsumption(90, 360, 120, 0, 0, 190, 48, 0.2),
    valueRealized: [
      {
        outcome: "Voiceover production cost elimination",
        baseline: "3 FTE freelance voiceover ($180k/year)",
        current: "$0 — fully replaced by ElevenCreative",
        dollarValue: 180_000,
        method: "Cost avoided",
        validatedBy: "Emma Schreiber — Global Head of Content Marketing",
        source: "Marketing OPEX review, Q1 2026",
      },
      {
        outcome: "Content production throughput",
        baseline: "200 outputs/month",
        current: "6,400 outputs/month (32x increase)",
        dollarValue: 420_000,
        method: "Hours saved",
        validatedBy: "Jonas Wolf — Senior Creative Technologist",
        source: "Content ops metrics, April 2026",
      },
    ],
    risks: [
      {
        label: "Agent pilot CSAT low (38% automation — below target)",
        level: "medium",
        detail:
          "Cancellation agent automation rate at 38% vs 60% target. Andrea Russo cautious about scaling. Need to optimise agent prompts and routing logic with ElevenLabs TAM.",
      },
    ],
    expansionLevers: [
      "Lift agent automation rate to 60% → Andrea sign-off on scaling",
      "ElevenAPI pilot for in-app cooking voice → new product footprint",
      "Creative expansion to 15 markets (FR, IT, ES, PT, AU, US, CA)",
    ],
    recentActivity: [
      { date: "2026-05-20", type: "Technical", detail: "Jonas Wolf: API trial scoping — cooking voice assistant concept" },
      { date: "2026-05-15", type: "Executive", detail: "Emma Schreiber: positive on creative, wants agent proof before expansion budget" },
      { date: "2026-05-02", type: "Risk", detail: "Andrea Russo: agent CSAT concerns — wants A/B test vs human handling" },
    ],
    nrr: 1.14,
    grr: 1.0,
  },
];

export function getAccount(id: string): Account | undefined {
  return ACCOUNTS.find((a) => a.id === id);
}
