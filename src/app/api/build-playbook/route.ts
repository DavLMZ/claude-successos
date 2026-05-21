import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import { PLAYBOOK_SYSTEM } from "@/lib/prompts/playbook";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { accountId, motion } = await req.json();
  const account = getAccount(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  const accountContext = `Customer: ${account.name}
Country: ${account.country}
Industry: ${account.industry}
Employees: ${account.employees.toLocaleString()}
Adoption stage: ${account.stage}
Products live: ${account.products.adopted.join(", ") || "None yet"}
Products trialling: ${account.products.trialling.join(", ") || "None"}
Products whitespace: ${account.products.whitespace.join(", ") || "None"}
Top risks: ${account.risks.map((r) => r.label).join("; ")}
Top expansion levers: ${account.expansionLevers.slice(0, 2).join("; ")}
Key stakeholders: ${account.stakeholders
  .filter((s) => ["Economic Buyer", "Champion"].includes(s.role))
  .map((s) => `${s.name} (${s.role}, ${s.org})`)
  .join(", ")}`;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        emit({
          type: "status",
          message: "Drafting playbook and self-reviewing in a single pass…",
        });

        const response = await anthropic.messages.create({
          model: MODELS.HAIKU,
          max_tokens: 2500,
          system: PLAYBOOK_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Motion: ${motion}\n\n${accountContext}\n\nProduce the playbook JSON. Be concise — 2-3 items per section max, short strings.`,
            },
          ],
        });

        const text = response.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("");

        const parsed = extractJson(text);
        emit({ type: "final", playbook: parsed });
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

function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(jsonStr);
  } catch {
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON object found in response");
    return JSON.parse(jsonStr.slice(start, end + 1));
  }
}
