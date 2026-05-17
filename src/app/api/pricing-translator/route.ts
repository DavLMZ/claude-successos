import { anthropic, MODELS } from "@/lib/anthropic";
import {
  PRICING_TRANSLATOR_SYSTEM,
  buildPricingTranslatorUserMessage,
} from "@/lib/prompts/pricing-translator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { situation } = await req.json();

  const stream = await anthropic.messages.stream({
    model: MODELS.SONNET,
    max_tokens: 2000,
    system: PRICING_TRANSLATOR_SYSTEM,
    messages: [{ role: "user", content: buildPricingTranslatorUserMessage(situation) }],
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
        console.error("Pricing translator stream error:", e);
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
