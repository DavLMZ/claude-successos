import { NextResponse } from "next/server";
import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import {
  PLAYBOOK_PLANNER_SYSTEM,
  PLAYBOOK_CRITIC_SYSTEM,
  PLAYBOOK_REVISER_SYSTEM,
} from "@/lib/prompts/playbook";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { accountId, motion } = await req.json();
    const account = getAccount(accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountContext = `Customer: ${account.name}
Industry: ${account.industry}
Employees: ${account.employees.toLocaleString()}
Adoption stage: ${account.stage}
Surfaces in use: API + ${account.surfaces.cfe.seats > 0 ? "CfE" : ""} ${account.surfaces.code.seats > 0 ? "+ Claude Code" : ""}
Top risks: ${account.risks.map((r) => r.label).join("; ")}
Top expansion levers: ${account.expansionLevers.slice(0, 2).join("; ")}`;

    // STEP 1: Plan
    const plannerInput = `Motion: ${motion}

${accountContext}

Generate the playbook JSON.`;

    const plan = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 3000,
      system: PLAYBOOK_PLANNER_SYSTEM,
      messages: [{ role: "user", content: plannerInput }],
    });
    const initialJson = extractJson(plan.content[0]);
    const initial = JSON.parse(initialJson);

    // STEP 2: Critique (Opus for sharper criticism)
    const critique = await anthropic.messages.create({
      model: MODELS.OPUS,
      max_tokens: 2000,
      system: PLAYBOOK_CRITIC_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Playbook to critique:\n\n${JSON.stringify(initial, null, 2)}\n\nAccount context:\n${accountContext}`,
        },
      ],
    });
    const critiqueJson = extractJson(critique.content[0]);
    const critiqueData = JSON.parse(critiqueJson);

    // STEP 3: Revise
    const revise = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 3000,
      system: PLAYBOOK_REVISER_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Original playbook:\n${JSON.stringify(initial, null, 2)}\n\nCritic feedback to apply:\n${JSON.stringify(critiqueData, null, 2)}\n\nReturn the revised playbook as JSON only.`,
        },
      ],
    });
    const revisedJson = extractJson(revise.content[0]);
    const revised = JSON.parse(revisedJson);

    return NextResponse.json({ initial, critique: critiqueData, revised });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("build-playbook error:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractJson(block: { type: string; text?: string }): string {
  if (block.type !== "text" || !block.text) {
    throw new Error("Expected text block from Claude");
  }
  const text = block.text.trim();
  // Strip code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return fenced[1].trim();
  // Find first { and last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Could not find JSON in response");
  }
  return text.slice(start, end + 1);
}
