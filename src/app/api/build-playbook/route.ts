import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import { PLAYBOOK_COMBINED_SYSTEM } from "@/lib/prompts/playbook";

export const runtime = "nodejs";
export const maxDuration = 60;

// V1: Single Claude call that produces initial + critique + revised in one response.
// Trades real-time per-step progress for guaranteed reliability under Vercel's 60s timeout.

export async function POST(req: Request) {
  const { accountId, motion } = await req.json();
  const account = getAccount(accountId);
  if (!account) {
    return new Response("Account not found", { status: 404 });
  }

  const accountContext = `Customer: ${account.name}
Industry: ${account.industry}
Employees: ${account.employees.toLocaleString()}
Adoption stage: ${account.stage}
Surfaces in use: API + ${account.surfaces.cfe.seats > 0 ? "CfE" : ""} ${account.surfaces.code.seats > 0 ? "+ Claude Code" : ""}
Top risks: ${account.risks.map((r) => r.label).join("; ")}
Top expansion levers: ${account.expansionLevers.slice(0, 2).join("; ")}`;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        emit({ type: "status", message: "Claude is drafting, critiquing, and revising in one pass…" });

        const response = await anthropic.messages.create({
          model: MODELS.SONNET,
          max_tokens: 6000,
          system: PLAYBOOK_COMBINED_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Motion: ${motion}\n\n${accountContext}\n\nProduce the combined JSON: initial draft, critique, and revised version.`,
            },
          ],
        });

        const text = response.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("");

        const parsed = extractJson(text);

        emit({
          type: "final",
          initial: parsed.initial,
          critique: parsed.critique,
          revised: parsed.revised,
        });
        controller.close();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("build-playbook error:", e);
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

function extractJson(text: string): { initial: unknown; critique: unknown; revised: unknown } {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(jsonStr);
  } catch {
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("Could not find JSON object in Claude's response");
    }
    return JSON.parse(jsonStr.slice(start, end + 1));
  }
}
