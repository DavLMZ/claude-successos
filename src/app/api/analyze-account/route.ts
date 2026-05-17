import { NextResponse } from "next/server";
import { anthropic, MODELS } from "@/lib/anthropic";
import { getAccount } from "@/data/accounts";
import { ACCOUNT_BRIEF_SYSTEM, buildAccountBriefUserMessage } from "@/lib/prompts/account-brief";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json();
    const account = getAccount(accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Compact account context (omit raw daily consumption to save tokens)
    const compact = {
      ...account,
      consumption: {
        last_30d_spend: account.consumption.slice(-30).reduce((s, p) => s + p.apiSpend, 0),
        prev_30d_spend: account.consumption.slice(-60, -30).reduce((s, p) => s + p.apiSpend, 0),
        days_tracked: account.consumption.length,
      },
    };

    const response = await anthropic.messages.create({
      model: MODELS.OPUS,
      max_tokens: 16000,
      thinking: { type: "enabled", budget_tokens: 8000 },
      system: ACCOUNT_BRIEF_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildAccountBriefUserMessage(JSON.stringify(compact, null, 2)),
        },
      ],
    });

    let thinking = "";
    let brief = "";
    for (const block of response.content) {
      if (block.type === "thinking") thinking += block.thinking;
      else if (block.type === "text") brief += block.text;
    }

    return NextResponse.json({
      thinking,
      brief,
      usage: response.usage,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("analyze-account error:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
