/**
 * Use Case Discovery Agent — Tool Use
 * Model: claude-sonnet-4-6
 * Tool use: simulates queries to an ElevenLabs use case library, ROI engine, and signal database.
 * Output: structured JSON use case list + narrative recommendation.
 */

export const USE_CASE_DISCOVERY_SYSTEM = `You are the Use Case Discovery agent inside ElevenLabs SuccessOS. When a CSM tells you about a customer signal — a new exec, a re-org, a budget event, a strategic priority, or a competitive threat — you return 5-8 prioritised ElevenLabs use cases for that customer.

ElevenLabs products:
- **ElevenAgents**: Voice and chat agents at scale. Best for: contact centre automation, customer service, outbound outreach, IVR modernisation, retail/banking voice workflows.
- **ElevenCreative**: Speech, music, image, video across 70+ languages. Best for: content localisation, marketing audio, e-learning narration, podcast production, branded voice content.
- **ElevenAPI**: Foundational AI audio models for developers. Best for: embedded voice in products, in-app assistants, real-time voice synthesis, custom brand voice, rider/navigation voice.

You have tools to query the ElevenLabs validated use case library, estimate ROI, and surface expansion signals. Always use them.

Biases:
- Time to first value < 60 days beats speculative 6-month wins (the first 30-60 days are critical per Vanessa's framework)
- Expand from existing products before recruiting new ones — deepen before broadening
- Mix products: at least one ElevenAgents, one ElevenCreative, one ElevenAPI use case in every recommendation set
- For WE/DACH accounts: flag multilingual requirements (70+ languages is an ElevenLabs differentiator), EU compliance considerations, German procurement timelines

For each use case return:
- name
- department
- product (ElevenAgents / ElevenCreative / ElevenAPI)
- complexity (1-5)
- estimated_monthly_value_usd
- time_to_first_value_days
- suggested_champion_persona
- first_30_days_plan (3 bullets)
- eu_compliance_notes (GDPR / EU AI Act flags if applicable)
- risks (1-2)

After the structured list, write a 3-paragraph narrative:
1. The pattern across your recommendations
2. The single highest-conviction bet and why (reference the NRR and New Product Expansion metrics)
3. What to deprioritize and why

Tools available:
- search_use_case_library(product, industry, complexity_max)
- estimate_roi(use_case_name, company_size, function_size)
- get_expansion_signal(use_case_id)

EFFICIENCY RULES (mandatory — serverless timeouts apply):
1. Read the signal carefully. Identify ONE primary function. Do not search adjacent functions unless explicitly mentioned.
2. At most TWO searches total.
3. After searching, pick your top 5-8 use cases BEFORE doing anything else.
4. Estimate ROI ONLY for the use cases you've decided to recommend.
5. Fetch expansion signals ONLY for your top 3 picks.
6. Batch all tool calls in parallel within a single response.
7. Aim to finish in 2-3 turns. More than 3 turns is a failure mode.`;

export const USE_CASE_TOOLS = [
  {
    name: "search_use_case_library",
    description:
      "Search ElevenLabs' validated enterprise use case library by product, industry, and complexity.",
    input_schema: {
      type: "object" as const,
      properties: {
        product: {
          type: "string",
          description: "ElevenLabs product: 'ElevenAgents', 'ElevenCreative', or 'ElevenAPI'",
        },
        industry: {
          type: "string",
          description:
            "Customer industry (e.g. 'fintech', 'automotive', 'insurance', 'ecommerce', 'telco')",
        },
        complexity_max: {
          type: "number",
          description: "Maximum implementation complexity (1-5)",
        },
      },
      required: ["product", "industry"],
    },
  },
  {
    name: "estimate_roi",
    description:
      "Estimate monthly value in USD for a given ElevenLabs use case at a given company size.",
    input_schema: {
      type: "object" as const,
      properties: {
        use_case_name: { type: "string" },
        company_size: { type: "number", description: "Total employee count" },
        function_size: { type: "number", description: "Headcount in the target function" },
      },
      required: ["use_case_name", "company_size", "function_size"],
    },
  },
  {
    name: "get_expansion_signal",
    description:
      "Retrieve the ElevenLabs expansion signal for a use case — what workspace events, usage patterns, or stakeholder moves indicate readiness.",
    input_schema: {
      type: "object" as const,
      properties: {
        use_case_id: { type: "string" },
      },
      required: ["use_case_id"],
    },
  },
];

export function executeUseCaseTool(name: string, input: Record<string, unknown>): string {
  if (name === "search_use_case_library") {
    const product = String(input.product ?? "").toLowerCase();
    const industry = String(input.industry ?? "").toLowerCase();

    const library: Record<
      string,
      Record<string, Array<{ id: string; name: string; complexity: number }>>
    > = {
      elevenagemts: {
        telco: [
          { id: "ag-telco-1", name: "Tier-1 customer support voice agent", complexity: 2 },
          { id: "ag-telco-2", name: "Network outage proactive outbound notification", complexity: 3 },
          { id: "ag-telco-3", name: "Contract renewal outbound agent", complexity: 2 },
        ],
        fintech: [
          { id: "ag-fin-1", name: "Card dispute and fraud alert voice agent", complexity: 3 },
          { id: "ag-fin-2", name: "Loan eligibility pre-screening agent", complexity: 4 },
          { id: "ag-fin-3", name: "Payment support inbound voice agent", complexity: 2 },
        ],
        insurance: [
          { id: "ag-ins-1", name: "First notice of loss (FNOL) agent", complexity: 2 },
          { id: "ag-ins-2", name: "Policy renewal outbound agent", complexity: 2 },
          { id: "ag-ins-3", name: "Claims status update inbound agent", complexity: 1 },
        ],
        ecommerce: [
          { id: "ag-ec-1", name: "Order status and returns voice agent", complexity: 2 },
          { id: "ag-ec-2", name: "Subscription cancellation retention agent", complexity: 3 },
          { id: "ag-ec-3", name: "Post-purchase upsell voice agent", complexity: 3 },
        ],
        automotive: [
          { id: "ag-auto-1", name: "Dealer booking and parts availability agent", complexity: 2 },
          { id: "ag-auto-2", name: "Recall notification outbound agent", complexity: 2 },
          { id: "ag-auto-3", name: "Roadside assistance dispatch agent", complexity: 3 },
        ],
        banking: [
          { id: "ag-bnk-1", name: "Account enquiry and payment inbound agent", complexity: 2 },
          { id: "ag-bnk-2", name: "Branch appointment booking agent", complexity: 1 },
          { id: "ag-bnk-3", name: "Private banking client check-in agent", complexity: 3 },
        ],
      },
      elevencreative: {
        automotive: [
          { id: "cr-auto-1", name: "Multilingual campaign audio localisation", complexity: 1 },
          { id: "cr-auto-2", name: "Dealer training video narration", complexity: 1 },
          { id: "cr-auto-3", name: "In-car voice persona creation", complexity: 2 },
        ],
        ecommerce: [
          { id: "cr-ec-1", name: "Fashion campaign audio (seasonal)", complexity: 1 },
          { id: "cr-ec-2", name: "Product description audio for app", complexity: 1 },
          { id: "cr-ec-3", name: "Podcast-style content marketing", complexity: 2 },
        ],
        insurance: [
          { id: "cr-ins-1", name: "Agent training video narration", complexity: 1 },
          { id: "cr-ins-2", name: "Client portfolio report audio summary", complexity: 2 },
          { id: "cr-ins-3", name: "Policy explainer video dubbing", complexity: 1 },
        ],
        banking: [
          { id: "cr-bnk-1", name: "Private banking quarterly report narration", complexity: 2 },
          { id: "cr-bnk-2", name: "Employee L&D content narration", complexity: 1 },
          { id: "cr-bnk-3", name: "Branch marketing video localisation", complexity: 1 },
        ],
        telco: [
          { id: "cr-tel-1", name: "Customer education video dubbing", complexity: 1 },
          { id: "cr-tel-2", name: "Promotional campaign localisation", complexity: 1 },
        ],
      },
      elevenapi: {
        ecommerce: [
          { id: "api-ec-1", name: "In-app voice shopping assistant", complexity: 3 },
          { id: "api-ec-2", name: "Voice-guided recipe or product tutorial", complexity: 2 },
        ],
        automotive: [
          { id: "api-auto-1", name: "In-car iDrive / infotainment voice persona", complexity: 3 },
          { id: "api-auto-2", name: "Rider navigation voice (real-time)", complexity: 4 },
        ],
        telco: [
          { id: "api-tel-1", name: "IVR modernisation with branded voice", complexity: 2 },
          { id: "api-tel-2", name: "NOC alert narration system", complexity: 3 },
        ],
        banking: [
          { id: "api-bnk-1", name: "Omnichannel branded voice (app + IVR)", complexity: 2 },
          { id: "api-bnk-2", name: "Real-time fraud alert voice synthesis", complexity: 3 },
        ],
        fintech: [
          { id: "api-fin-1", name: "App branded voice persona", complexity: 2 },
          { id: "api-fin-2", name: "Transaction confirmation voice", complexity: 1 },
        ],
        insurance: [
          { id: "api-ins-1", name: "IVR branded voice model", complexity: 2 },
          { id: "api-ins-2", name: "Claims status real-time voice update", complexity: 2 },
        ],
      },
    };

    const productKey = product.includes("agent")
      ? "elevenagemts"
      : product.includes("creative")
        ? "elevencreative"
        : "elevenapi";

    const industryKey = Object.keys(library[productKey] ?? {}).find((k) =>
      industry.includes(k),
    ) ?? industry;

    const matches = library[productKey]?.[industryKey] ?? [];
    const filtered = input.complexity_max
      ? matches.filter((m) => m.complexity <= Number(input.complexity_max))
      : matches;

    return JSON.stringify({
      matches: filtered.slice(0, 5).map((m) => ({ ...m, product: input.product })),
    });
  }

  if (name === "estimate_roi") {
    const fnSize = Number(input.function_size) || 100;
    const ucName = String(input.use_case_name ?? "").toLowerCase();

    let baseMonthlyValue = 0;
    if (ucName.includes("agent") || ucName.includes("voice")) {
      const callsPerMonth = fnSize * 200;
      const humanCost = 3.5;
      const aiCost = 0.6;
      baseMonthlyValue = Math.round(callsPerMonth * (humanCost - aiCost));
    } else if (ucName.includes("creative") || ucName.includes("content") || ucName.includes("narration")) {
      const outputsPerMonth = fnSize * 5;
      const agencyRate = 120;
      const aiRate = 2;
      baseMonthlyValue = Math.round(outputsPerMonth * (agencyRate - aiRate));
    } else {
      baseMonthlyValue = Math.round(fnSize * 1200);
    }

    return JSON.stringify({
      monthly_value_usd: baseMonthlyValue,
      method: ucName.includes("agent") ? "cost_avoided" : "hours_saved",
      assumptions: { function_size: fnSize },
    });
  }

  if (name === "get_expansion_signal") {
    return JSON.stringify({
      use_case_id: input.use_case_id,
      signal_type: "workspace_adoption",
      trigger:
        "Customer trialling product outside contracted scope — proactively surface to champion",
      leading_indicators: [
        "New teams accessing the platform without formal enablement",
        "Usage growth >20% MoM in a trialling product",
        "Champion mentions use case in a meeting or email",
      ],
      recommended_play: "Proactive outreach with an ROI case before renewal window opens",
      urgency: "medium",
    });
  }

  return JSON.stringify({ error: "Unknown tool" });
}
