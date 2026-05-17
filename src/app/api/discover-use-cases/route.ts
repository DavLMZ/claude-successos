import { NextResponse } from "next/server";
import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import {
  USE_CASE_DISCOVERY_SYSTEM,
  USE_CASE_TOOLS,
  executeUseCaseTool,
} from "@/lib/prompts/use-case-discovery";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  try {
    const { accountId, signal } = await req.json();
    const account = getAccount(accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
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

Use your tools, then return your structured recommendations followed by the narrative analysis.`;

    const messages: MessageParam[] = [{ role: "user", content: userMessage }];
    const toolCalls: { name: string; input: Record<string, unknown> }[] = [];

    // Agentic loop — keep calling until Claude returns a final text response
    for (let turn = 0; turn < 8; turn++) {
      const response = await anthropic.messages.create({
        model: MODELS.SONNET,
        max_tokens: 4000,
        system: USE_CASE_DISCOVERY_SYSTEM,
        tools: USE_CASE_TOOLS,
        messages,
      });

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason === "tool_use") {
        const toolResults = [];
        for (const block of response.content) {
          if (block.type === "tool_use") {
            toolCalls.push({ name: block.name, input: block.input as Record<string, unknown> });
            const result = executeUseCaseTool(block.name, block.input as Record<string, unknown>);
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

      // Done — parse out the final text
      const finalText = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("\n");

      const parsed = parseUseCasesAndNarrative(finalText);
      return NextResponse.json({
        use_cases: parsed.use_cases,
        narrative: parsed.narrative,
        tool_calls: toolCalls,
        raw: finalText,
      });
    }

    return NextResponse.json(
      { error: "Agent loop exceeded max turns" },
      { status: 500 },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("discover-use-cases error:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseUseCasesAndNarrative(text: string): {
  use_cases: Record<string, unknown>[];
  narrative: string;
} {
  // Look for a JSON array of use cases
  const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  let use_cases: Record<string, unknown>[] = [];
  let narrative = text;

  if (jsonMatch) {
    try {
      use_cases = JSON.parse(jsonMatch[0]);
      narrative = text.replace(jsonMatch[0], "").trim();
      // Strip leading/trailing code fences
      narrative = narrative.replace(/^```(?:json|markdown)?\s*/g, "").replace(/```\s*$/g, "").trim();
    } catch {
      // Fall through — narrative is the full text
    }
  }

  return { use_cases, narrative };
}
