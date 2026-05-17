import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import {
  PLAYBOOK_PLANNER_SYSTEM,
  PLAYBOOK_CRITIC_SYSTEM,
  PLAYBOOK_REVISER_SYSTEM,
} from "@/lib/prompts/playbook";

export const runtime = "nodejs";
export const maxDuration = 60;

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
        // STEP 1: Plan
        emit({ type: "status", message: "Step 1/3 — Drafting initial playbook" });
        const plan = await anthropic.messages.create({
          model: MODELS.HAIKU,
          max_tokens: 2500,
          system: PLAYBOOK_PLANNER_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Motion: ${motion}\n\n${accountContext}\n\nGenerate the playbook JSON.`,
            },
          ],
        });
        const initial = JSON.parse(extractJson(plan.content[0]));
        emit({ type: "step_complete", step: "initial", data: initial });

        // STEP 2: Critique (use Sonnet not Opus for speed under timeout)
        emit({ type: "status", message: "Step 2/3 — Critiquing as a skeptical VP" });
        const critique = await anthropic.messages.create({
          model: MODELS.HAIKU,
          max_tokens: 1500,
          system: PLAYBOOK_CRITIC_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Playbook to critique:\n\n${JSON.stringify(initial, null, 2)}\n\nAccount context:\n${accountContext}`,
            },
          ],
        });
        const critiqueData = JSON.parse(extractJson(critique.content[0]));
        emit({ type: "step_complete", step: "critique", data: critiqueData });

        // STEP 3: Revise
        emit({ type: "status", message: "Step 3/3 — Revising based on critique" });
        const revise = await anthropic.messages.create({
          model: MODELS.HAIKU,
          max_tokens: 2500,
          system: PLAYBOOK_REVISER_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Original playbook:\n${JSON.stringify(initial, null, 2)}\n\nCritic feedback to apply:\n${JSON.stringify(critiqueData, null, 2)}\n\nReturn the revised playbook as JSON only.`,
            },
          ],
        });
        const revised = JSON.parse(extractJson(revise.content[0]));
        emit({ type: "step_complete", step: "revised", data: revised });

        emit({
          type: "final",
          initial,
          critique: critiqueData,
          revised,
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

function extractJson(block: { type: string; text?: string }): string {
  if (block.type !== "text" || !block.text) {
    throw new Error("Expected text block from Claude");
  }
  const text = block.text.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Could not find JSON in response");
  }
  return text.slice(start, end + 1);
}
