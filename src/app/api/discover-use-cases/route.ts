import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import {
  USE_CASE_DISCOVERY_SYSTEM,
  USE_CASE_TOOLS,
  executeUseCaseTool,
} from "@/lib/prompts/use-case-discovery";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_TURNS = 5;

export async function POST(req: Request) {
  const { accountId, signal } = await req.json();
  const account = getAccount(accountId);
  if (!account) {
    return new Response("Account not found", { status: 404 });
  }

  const userMessage = `Account context:
- Customer: ${account.name}
- Industry: ${account.industry}
- Employees: ${account.employees.toLocaleString()}
- Current adoption stage: ${account.stage}
- Current Claude surfaces in use: API (${(account.surfaces.api.consumed / 1e9).toFixed(2)}B tokens consumed), CfE (${account.surfaces.cfe.activated}/${account.surfaces.cfe.seats} seats), Claude Code (${account.surfaces.code.activated}/${account.surfaces.code.seats} seats)
- Existing use cases: ${account.useCases.map((u) => u.name).join("; ")}

Customer signal to act on:
${signal}

Use your tools (in PARALLEL within single responses), then return your structured recommendations followed by the narrative analysis.`;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        const messages: MessageParam[] = [{ role: "user", content: userMessage }];
        const toolCalls: { name: string; input: Record<string, unknown> }[] = [];

        for (let turn = 0; turn < MAX_TURNS; turn++) {
          emit({ type: "status", message: `Turn ${turn + 1}: Claude is reasoning…` });

          const response = await anthropic.messages.create({
            model: MODELS.SONNET,
            max_tokens: 4000,
            system: USE_CASE_DISCOVERY_SYSTEM,
            tools: USE_CASE_TOOLS,
            messages,
          });

          messages.push({ role: "assistant", content: response.content });

          if (response.stop_reason === "tool_use") {
            const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
            emit({
              type: "status",
              message: `Claude called ${toolUseBlocks.length} tool(s) in parallel`,
            });

            const toolResults = [];
            for (const block of response.content) {
              if (block.type === "tool_use") {
                toolCalls.push({
                  name: block.name,
                  input: block.input as Record<string, unknown>,
                });
                emit({
                  type: "tool_call",
                  name: block.name,
                  input: block.input,
                });
                const result = executeUseCaseTool(
                  block.name,
                  block.input as Record<string, unknown>,
                );
                toolResults.push({
                  type: "tool_result" as const,
                  tool_use_id: block.id,
                  content: result,
                });
              }
            }
            messages.push({ role: "user", content: toolResults });
            continue;
          }

          // Final answer
          const finalText = response.content
            .filter((b) => b.type === "text")
            .map((b) => (b as { type: "text"; text: string }).text)
            .join("\n");

          const parsed = parseUseCasesAndNarrative(finalText);
          emit({
            type: "final",
            use_cases: parsed.use_cases,
            narrative: parsed.narrative,
            tool_calls: toolCalls,
          });
          controller.close();
          return;
        }

        emit({
          type: "error",
          message: `Agent exceeded ${MAX_TURNS} turns without producing a final answer`,
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
  const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  let use_cases: Record<string, unknown>[] = [];
  let narrative = text;

  if (jsonMatch) {
    try {
      use_cases = JSON.parse(jsonMatch[0]);
      narrative = text.replace(jsonMatch[0], "").trim();
      narrative = narrative.replace(/^```(?:json|markdown)?\s*/g, "").replace(/```\s*$/g, "").trim();
    } catch {
      // fallthrough
    }
  }

  return { use_cases, narrative };
}
