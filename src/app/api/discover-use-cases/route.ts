import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import { executeUseCaseTool } from "@/lib/prompts/use-case-discovery";

export const runtime = "nodejs";
export const maxDuration = 60;

// Server-orchestrated tool use for reliability under Vercel's 60s timeout.
// We pre-execute the tool calls based on the inferred product/function,
// then make a single streaming Claude call to synthesize.

const SINGLE_TURN_SYSTEM = `You are a Strategic Customer Success Manager at ElevenLabs running an expansion signal analysis for an enterprise customer in Western Europe.

ElevenLabs has three products: ElevenAgents (voice/chat agents at scale), ElevenCreative (speech/music/image/video, 70+ languages), ElevenAPI (foundational AI audio models, custom voice).

You will be given:
1. Customer context (country, industry, current product adoption, stage)
2. The customer signal you're acting on
3. Pre-fetched tool results: matching use cases, ROI estimates, expansion signals

Return 5-8 prioritised ElevenLabs use cases as a JSON array, then a 3-paragraph narrative.

For each use case return this exact shape:
{
  "name": string,
  "department": string,
  "product": "ElevenAgents" | "ElevenCreative" | "ElevenAPI",
  "complexity": number (1-5),
  "estimated_monthly_value_usd": number,
  "time_to_first_value_days": number (typically 14-60),
  "suggested_champion_persona": string,
  "first_30_days_plan": [string, string, string],
  "eu_compliance_notes": string (GDPR / EU AI Act flag, or empty string),
  "risks": [string]
}

Output the JSON array first inside a \`\`\`json fenced block, then the narrative.

Narrative (2 sentences per paragraph max):
1. The pattern across your recommendations
2. The single highest-conviction bet and why (tie to NRR or New Product Expansion)
3. What to deprioritize and why

Rules:
- Use the pre-fetched ROI numbers — don't invent
- Be opinionated — no hedging
- Mix products: include at least one ElevenAgents, one ElevenCreative, one ElevenAPI recommendation
- Reference WE/DACH compliance context where relevant (GDPR, EU AI Act, multilingual requirements)
- Time to first value < 60 days beats speculative wins — flag this explicitly`;

function inferProduct(signal: string): "ElevenAgents" | "ElevenCreative" | "ElevenAPI" {
  const s = signal.toLowerCase();
  if (/agent|call centre|contact centre|support|customer service|ivr|outbound|inbound|automat/.test(s))
    return "ElevenAgents";
  if (/content|creative|marketing|campaign|audio|video|narrat|localisation|dubbing|podcast/.test(s))
    return "ElevenCreative";
  return "ElevenAPI";
}

function inferIndustry(accountIndustry: string): string {
  const i = accountIndustry.toLowerCase();
  if (i.includes("telco") || i.includes("telecom")) return "telco";
  if (i.includes("bank") || i.includes("financial")) return "banking";
  if (i.includes("insurance")) return "insurance";
  if (i.includes("ecommerce") || i.includes("commerce") || i.includes("fashion")) return "ecommerce";
  if (i.includes("automotive") || i.includes("auto")) return "automotive";
  if (i.includes("fintech")) return "fintech";
  if (i.includes("food") || i.includes("delivery")) return "ecommerce";
  return "ecommerce";
}

export async function POST(req: Request) {
  const { accountId, signal } = await req.json();
  const account = getAccount(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        const primaryProduct = inferProduct(signal);
        const industry = inferIndustry(account.industry);
        const toolCalls: { name: string; input: Record<string, unknown> }[] = [];

        // Step 1: search for primary product
        emit({ type: "status", message: `Signal mapped to ${primaryProduct} — searching use case library` });
        const search1Input = { product: primaryProduct, industry, complexity_max: 5 };
        toolCalls.push({ name: "search_use_case_library", input: search1Input });
        emit({ type: "tool_call", name: "search_use_case_library", input: search1Input });
        const search1Raw = executeUseCaseTool("search_use_case_library", search1Input);
        const search1Data = JSON.parse(search1Raw) as {
          matches: { id: string; name: string; product: string; complexity: number }[];
        };

        // Step 2: cross-product expansion (always ensure mix)
        const otherProducts = (["ElevenAgents", "ElevenCreative", "ElevenAPI"] as const).filter(
          (p) => p !== primaryProduct,
        );
        const crossProduct = otherProducts[0];
        emit({ type: "status", message: `Fetching ${crossProduct} cross-sell opportunities` });
        const search2Input = { product: crossProduct, industry, complexity_max: 3 };
        toolCalls.push({ name: "search_use_case_library", input: search2Input });
        emit({ type: "tool_call", name: "search_use_case_library", input: search2Input });
        const search2Raw = executeUseCaseTool("search_use_case_library", search2Input);
        const search2Data = JSON.parse(search2Raw) as {
          matches: { id: string; name: string; product: string; complexity: number }[];
        };

        const allMatches = [...search1Data.matches.slice(0, 4), ...search2Data.matches.slice(0, 3)];

        // Step 3: ROI + signals in parallel (mock, so sync)
        emit({
          type: "status",
          message: `Found ${allMatches.length} candidates — estimating ROI and expansion signals`,
        });

        const enriched = allMatches.map((m) => {
          const roiInput = {
            use_case_name: m.name,
            company_size: account.employees,
            function_size: 200,
          };
          toolCalls.push({ name: "estimate_roi", input: roiInput });
          emit({ type: "tool_call", name: "estimate_roi", input: roiInput });
          const roi = JSON.parse(executeUseCaseTool("estimate_roi", roiInput));

          const signalInput = { use_case_id: m.id };
          toolCalls.push({ name: "get_expansion_signal", input: signalInput });
          emit({ type: "tool_call", name: "get_expansion_signal", input: signalInput });
          const expansionSignal = JSON.parse(executeUseCaseTool("get_expansion_signal", signalInput));

          return { ...m, roi, expansionSignal };
        });

        // Step 4: Claude synthesises
        emit({
          type: "status",
          message: `Tools complete (${toolCalls.length} calls) — Claude synthesising recommendations`,
        });

        const userPrompt = `Customer context:
- Customer: ${account.name}
- Country: ${account.country}
- Industry: ${account.industry}
- Employees: ${account.employees.toLocaleString()}
- Adoption stage: ${account.stage}
- Products live: ${account.products.adopted.join(", ") || "None yet"}
- Products trialling: ${account.products.trialling.join(", ") || "None"}
- Products whitespace: ${account.products.whitespace.join(", ") || "None"}

Customer signal:
${signal}

Pre-fetched tool results:
${JSON.stringify(enriched, null, 2)}

Produce the JSON array (5-8 use cases) then the 3-paragraph narrative.`;

        const stream = await anthropic.messages.stream({
          model: MODELS.HAIKU,
          max_tokens: 3000,
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
        emit({ type: "final", use_cases: parsed.use_cases, narrative: parsed.narrative, tool_calls: toolCalls });
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
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/);
  let use_cases: Record<string, unknown>[] = [];
  let narrative = text;

  if (fenced) {
    try {
      use_cases = JSON.parse(fenced[1]);
      narrative = text.replace(fenced[0], "").trim();
    } catch { /* fallthrough */ }
  }

  if (use_cases.length === 0) {
    const arr = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (arr) {
      try {
        use_cases = JSON.parse(arr[0]);
        narrative = text.replace(arr[0], "").trim();
      } catch { /* fallthrough */ }
    }
  }

  return { use_cases, narrative };
}
