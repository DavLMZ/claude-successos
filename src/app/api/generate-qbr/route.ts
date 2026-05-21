import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import { QBR_SYSTEM, buildQbrUserMessage } from "@/lib/prompts/qbr";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { accountId, quarter } = await req.json();
  const account = getAccount(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  const compact = {
    name: account.name,
    country: account.country,
    industry: account.industry,
    employees: account.employees,
    contract_value: account.contractValue,
    nrr: account.nrr,
    grr: account.grr,
    stage: account.stage,
    renewal_date: account.renewalDate,
    products: account.products,
    metrics: account.metrics,
    stakeholders: account.stakeholders,
    use_cases: account.useCases,
    value_realized: account.valueRealized,
    risks: account.risks,
    expansion_levers: account.expansionLevers,
    last_qbr: account.lastQbr,
    consumption_summary: {
      last_30d_agent_calls: account.consumption.slice(-30).reduce((s, p) => s + p.agentCallVolume, 0),
      prev_30d_agent_calls: account.consumption.slice(-60, -30).reduce((s, p) => s + p.agentCallVolume, 0),
      last_30d_api_chars: account.consumption.slice(-30).reduce((s, p) => s + p.apiCharacters, 0),
      prev_30d_api_chars: account.consumption.slice(-60, -30).reduce((s, p) => s + p.apiCharacters, 0),
      last_30d_creative_outputs: account.consumption.slice(-30).reduce((s, p) => s + p.creativeOutputs, 0),
    },
  };

  const stream = await anthropic.messages.stream({
    model: MODELS.SONNET,
    max_tokens: 4000,
    system: QBR_SYSTEM,
    messages: [
      {
        role: "user",
        content: buildQbrUserMessage({
          accountName: account.name,
          quarter,
          data: JSON.stringify(compact, null, 2),
        }),
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (e) {
        console.error("QBR stream error:", e);
        controller.error(e);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
