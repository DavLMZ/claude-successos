import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import { ACCOUNT_BRIEF_SYSTEM, buildAccountBriefUserMessage } from "@/lib/prompts/account-brief";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { accountId } = await req.json();
  const account = getAccount(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  // Compact the consumption data to avoid token bloat
  const compact = {
    ...account,
    consumption: {
      last_30d_agent_calls: account.consumption.slice(-30).reduce((s, p) => s + p.agentCallVolume, 0),
      prev_30d_agent_calls: account.consumption.slice(-60, -30).reduce((s, p) => s + p.agentCallVolume, 0),
      last_30d_api_chars: account.consumption.slice(-30).reduce((s, p) => s + p.apiCharacters, 0),
      prev_30d_api_chars: account.consumption.slice(-60, -30).reduce((s, p) => s + p.apiCharacters, 0),
      last_30d_creative_outputs: account.consumption.slice(-30).reduce((s, p) => s + p.creativeOutputs, 0),
      days_tracked: account.consumption.length,
    },
  };

  const stream = await anthropic.messages.stream({
    model: MODELS.SONNET,
    max_tokens: 8000,
    thinking: { type: "enabled", budget_tokens: 4000 },
    system: ACCOUNT_BRIEF_SYSTEM,
    messages: [
      {
        role: "user",
        content: buildAccountBriefUserMessage(JSON.stringify(compact, null, 2)),
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function emit(type: "thinking" | "text", content: string) {
        controller.enqueue(encoder.encode(JSON.stringify({ type, content }) + "\n"));
      }
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta") {
            if (event.delta.type === "thinking_delta") {
              emit("thinking", event.delta.thinking);
            } else if (event.delta.type === "text_delta") {
              emit("text", event.delta.text);
            }
          }
        }
        controller.close();
      } catch (e) {
        console.error("Account brief stream error:", e);
        controller.error(e);
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
