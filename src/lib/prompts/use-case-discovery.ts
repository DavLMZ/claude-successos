/**
 * Use Case Discovery Agent — Tool Use
 * Model: claude-sonnet-4-5
 * Why Sonnet: needs to handle multi-turn tool calls efficiently.
 * Why tool use: simulates a real integration with a use case library, ROI engine,
 *   and starter playbooks. Demonstrates the "agentic" capability of Claude.
 * Output: structured JSON list of use cases, followed by a narrative recommendation.
 */

export const USE_CASE_DISCOVERY_SYSTEM = `You are the Use Case Discovery agent inside Claude SuccessOS. Your job: when a CSM tells you about a customer signal (a new exec, a re-org, a budget freeze, a strategic priority), you return 5-8 prioritized Claude use cases for that customer.

You have tools to query Anthropic's validated use case library, estimate ROI, and pull starter playbooks. Always use them — don't reason from priors when you can pull data.

Biases:
- Time to first value < 60 days beats speculative 6-month wins
- Use cases with a clear executive sponsor pattern beat orphan use cases
- Mix across surfaces: at least one API use case, one CfE use case, one Claude Code use case in every recommendation set
- Default to expanding existing champions before recruiting new ones

For each use case return:
- name
- department
- surface (API / Claude for Enterprise / Claude Code)
- complexity (1-5)
- estimated_monthly_value_usd
- time_to_first_value_days
- suggested_champion_persona
- first_30_days_plan (3 bullets)
- risks (1-2)

After the structured list, write a 3-paragraph narrative:
1. The pattern across your recommendations
2. The single highest-conviction bet and why
3. What to deprioritize and why

Tools available:
- search_use_case_library(industry, function, complexity_max)
- estimate_roi(use_case_name, company_size, function_size)
- get_starter_playbook(use_case_id)`;

export const USE_CASE_TOOLS = [
  {
    name: "search_use_case_library",
    description:
      "Search Anthropic's validated library of enterprise Claude use cases by industry, function, and complexity. Returns a list of matching use cases with metadata.",
    input_schema: {
      type: "object" as const,
      properties: {
        industry: { type: "string", description: "Customer industry (e.g. 'fintech', 'developer tools')" },
        function: {
          type: "string",
          description: "Business function to target (e.g. 'legal', 'finance', 'support', 'engineering')",
        },
        complexity_max: { type: "number", description: "Maximum implementation complexity (1-5)" },
      },
      required: ["industry", "function"],
    },
  },
  {
    name: "estimate_roi",
    description:
      "Estimate monthly value in USD for a given use case at a given company size. Returns a dollar value with the calculation method.",
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
    name: "get_starter_playbook",
    description:
      "Retrieve the standard 30-day starter playbook for a given use case. Returns first-week, second-week, and month-one milestones.",
    input_schema: {
      type: "object" as const,
      properties: {
        use_case_id: { type: "string" },
      },
      required: ["use_case_id"],
    },
  },
];

// Mock tool implementations (simulating a real backend)
export function executeUseCaseTool(name: string, input: Record<string, unknown>): string {
  if (name === "search_use_case_library") {
    const fn = String(input.function ?? "").toLowerCase();
    const library: Record<string, Array<{ id: string; name: string; surface: string; complexity: number }>> = {
      legal: [
        { id: "lg-1", name: "Contract review co-pilot", surface: "Claude for Enterprise", complexity: 2 },
        { id: "lg-2", name: "NDA red-lining automation", surface: "API", complexity: 3 },
        { id: "lg-3", name: "Litigation discovery search", surface: "API", complexity: 4 },
        { id: "lg-4", name: "Regulatory change monitoring", surface: "Claude for Enterprise", complexity: 2 },
      ],
      finance: [
        { id: "fn-1", name: "Month-end close accelerator", surface: "API", complexity: 3 },
        { id: "fn-2", name: "Variance analysis narrative generation", surface: "API", complexity: 2 },
        { id: "fn-3", name: "Vendor invoice reconciliation", surface: "API", complexity: 3 },
        { id: "fn-4", name: "Board deck drafting assistant", surface: "Claude for Enterprise", complexity: 1 },
      ],
      engineering: [
        { id: "en-1", name: "Platform team agent for migrations", surface: "Claude Code", complexity: 3 },
        { id: "en-2", name: "Code review assistant", surface: "Claude Code", complexity: 2 },
        { id: "en-3", name: "Incident response co-pilot", surface: "API", complexity: 4 },
        { id: "en-4", name: "Dependency upgrade automation", surface: "Claude Code", complexity: 3 },
      ],
      support: [
        { id: "sp-1", name: "Tier-1 ticket deflection", surface: "API", complexity: 3 },
        { id: "sp-2", name: "Agent assist for tier-2", surface: "Claude for Enterprise", complexity: 2 },
        { id: "sp-3", name: "Voice-of-customer synthesis", surface: "API", complexity: 2 },
      ],
      sales: [
        { id: "sl-1", name: "Deal desk assistant", surface: "Claude for Enterprise", complexity: 2 },
        { id: "sl-2", name: "Call summary + next-step extraction", surface: "API", complexity: 2 },
        { id: "sl-3", name: "Account research briefs", surface: "Claude for Enterprise", complexity: 1 },
      ],
      hr: [
        { id: "hr-1", name: "Policy Q&A assistant", surface: "Claude for Enterprise", complexity: 1 },
        { id: "hr-2", name: "Job description drafting", surface: "Claude for Enterprise", complexity: 1 },
        { id: "hr-3", name: "Onboarding curriculum generator", surface: "API", complexity: 2 },
      ],
    };
    const matches = library[fn] ?? [];
    const filtered = input.complexity_max
      ? matches.filter((m) => m.complexity <= Number(input.complexity_max))
      : matches;
    return JSON.stringify({ matches: filtered.slice(0, 6) });
  }

  if (name === "estimate_roi") {
    const fnSize = Number(input.function_size) || 100;
    const baseHoursPerWeek = 2.5;
    const loadedCost = 95;
    const weeklyValue = fnSize * baseHoursPerWeek * loadedCost;
    const monthlyValue = Math.round(weeklyValue * 4.33);
    return JSON.stringify({
      monthly_value_usd: monthlyValue,
      method: "hours_saved",
      assumptions: {
        hours_saved_per_person_per_week: baseHoursPerWeek,
        loaded_cost_per_hour_usd: loadedCost,
        function_size: fnSize,
      },
    });
  }

  if (name === "get_starter_playbook") {
    return JSON.stringify({
      use_case_id: input.use_case_id,
      week_1: "Identify pilot cohort (5-10 users), define success metric, set baseline measurement",
      week_2: "Ship MVP integration or workflow, daily standups with pilot cohort, capture friction",
      week_3_4: "Iterate on prompts and UX, document wins with metric proof, prep expansion case",
      first_30_days_milestone: "1 documented win, 1 willing internal evangelist, 1 expansion target identified",
    });
  }

  return JSON.stringify({ error: "Unknown tool" });
}
