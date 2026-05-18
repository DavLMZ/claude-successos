import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import { executeUseCaseTool } from "@/lib/prompts/use-case-discovery";

export const runtime = "nodejs";
export const maxDuration = 60;

// V1: For reliability under Vercel's 60s timeout, we pre-execute the tool calls
// server-side based on the inferred function, then make a SINGLE streaming Claude
// call to synthesize the recommendation. This collapses 3 Claude round-trips into 1
// while still showcasing tool use in the UI.

const SINGLE_TURN_SYSTEM = `You are a Strategic Customer Success Manager at Anthropic running a use case discovery for a Digital Native Business customer.

You will be given:
1. The customer context (industry, size, current Claude usage)
2. The customer signal you're acting on
3. Pre-fetched tool results: matching use cases from the library, ROI estimates, and starter playbooks

Your job: return 5-8 prioritized use cases as a JSON array, followed by a 3-paragraph narrative recommendation.

For each use case return this exact JSON shape:
{
  "name": string,
  "department": string,
  "surface": "API" | "Claude for Enterprise" | "Claude Code",
  "complexity": number (1-5),
  "estimated_monthly_value_usd": number,
  "time_to_first_value_days": number (typically 14-60),
  "suggested_champion_persona": string,
  "first_30_days_plan": [string, string, string],
  "risks": [string]
}

Output the JSON array first inside a \`\`\`json fenced block, then a SHORT narrative.

Narrative structure (be concise — 2 sentences per paragraph, max):
1. The pattern across your recommendations
2. The single highest-conviction bet and why
3. What to deprioritize and why

Rules:
- Use the pre-fetched ROI numbers — don't invent
- Be opinionated, no hedging
- Time to first value < 60 days beats speculative wins
- Keep first_30_days_plan bullets SHORT (one line each, ~10 words max)
- Keep risks SHORT (one line each)
- Generate 5-6 use cases, not 7-8`;

function extractFunction(signal: string): string {
  const s = signal.toLowerCase();
  if (/finance|cfo|fp&a|accounting|treasury|audit|invoice|reconcil|close/.test(s)) return "finance";
  if (/legal|contract|nda|compliance|gdpr|regulatory|red[ -]?line/.test(s)) return "legal";
  if (/engineer|platform|developer|sre|devops|migration|codebase|repo|pr |pull request/.test(s)) return "engineering";
  if (/support|helpdesk|ticket|deflect|tier[ -]?1|customer service/.test(s)) return "support";
  if (/sales|deal|revenue|pipeline|sdr|account exec/.test(s)) return "sales";
  if (/hr|people|recruit|onboard|hiring|employee/.test(s)) return "hr";
  return "engineering";
}

export async function POST(req: Request) {
  const { accountId, signal } = await req.json();
  const account = getAccount(accountId);
  if (!account) {
    return new Response("Account not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        const targetFn = extractFunction(signal);
        const toolCalls: { name: string; input: Record<string, unknown> }[] = [];

        // Step 1: Search
        emit({ type: "status", message: `Detected function: ${targetFn} — searching library` });
        const searchInput = { industry: account.industry, function: targetFn, complexity_max: 5 };
        toolCalls.push({ name: "search_use_case_library", input: searchInput });
        emit({ type: "tool_call", name: "search_use_case_library", input: searchInput });
        const searchRaw = executeUseCaseTool("search_use_case_library", searchInput);
        const searchData = JSON.parse(searchRaw) as {
          matches: { id: string; name: string; surface: string; complexity: number }[];
        };

        // Step 2: ROI estimates (parallel — all run synchronously since mock)
        const functionSize = targetFn === "engineering" ? 8500 : 450;
        emit({
          type: "status",
          message: `Found ${searchData.matches.length} candidates — estimating ROI in parallel`,
        });
        const enriched = searchData.matches.map((m) => {
          const roiInput = {
            use_case_name: m.name,
            company_size: account.employees,
            function_size: functionSize,
          };
          toolCalls.push({ name: "estimate_roi", input: roiInput });
          emit({ type: "tool_call", name: "estimate_roi", input: roiInput });
          const roi = JSON.parse(executeUseCaseTool("estimate_roi", roiInput)) as {
            monthly_value_usd: number;
            method: string;
            assumptions: Record<string, unknown>;
          };

          const playbookInput = { use_case_id: m.id };
          toolCalls.push({ name: "get_starter_playbook", input: playbookInput });
          emit({ type: "tool_call", name: "get_starter_playbook", input: playbookInput });
          const playbook = JSON.parse(executeUseCaseTool("get_starter_playbook", playbookInput));

          return { ...m, roi, playbook };
        });

        // Step 3: Single Claude call to synthesize
        emit({
          type: "status",
          message: `Tools complete (${toolCalls.length} calls) — Claude is synthesizing recommendations`,
        });

        const userPrompt = `Customer context:
- Customer: ${account.name}
- Industry: ${account.industry}
- Employees: ${account.employees.toLocaleString()}
- Adoption stage: ${account.stage}
- Surfaces in use: API + Claude for Enterprise${account.surfaces.code.seats > 0 ? " + Claude Code" : ""}

Customer signal:
${signal}

Pre-fetched tool results (use these — don't re-search):
${JSON.stringify(enriched, null, 2)}

Now produce the JSON array of 5-8 prioritized use cases, followed by the 3-paragraph narrative.`;

        const stream = await anthropic.messages.stream({
          model: MODELS.HAIKU,
          max_tokens: 2800,
          system: SINGLE_TURN_SYSTEM,
          messages: [{ role: "user", content: userPrompt }],
        });

        let fullText = "";
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            fullText += event.delta.text;
            emit({ type: "text_delta", content: event.delta.text });
          }
        }

        const parsed = parseUseCasesAndNarrative(fullText);
        emit({
          type: "final",
          use_cases: parsed.use_cases,
          narrative: parsed.narrative,
          tool_calls: toolCalls,
        });
        controller.close();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("discover-use-cases error:", e);
        emit({ type: "error", message });
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

function parseUseCasesAndNarrative(text: string): {
  use_cases: Record<string, unknown>[];
  narrative: string;
} {
  // Look for fenced ```json block first
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/);
  let use_cases: Record<string, unknown>[] = [];
  let narrative = text;

  if (fenced) {
    try {
      use_cases = JSON.parse(fenced[1]);
      narrative = text.replace(fenced[0], "").trim();
    } catch {
      // fallthrough
    }
  }

  if (use_cases.length === 0) {
    // Try unfenced JSON array
    const arr = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (arr) {
      try {
        use_cases = JSON.parse(arr[0]);
        narrative = text.replace(arr[0], "").trim();
      } catch {
        // fallthrough
      }
    }
  }

  return { use_cases, narrative };
}
