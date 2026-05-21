import { anthropic, MODELS } from "@/lib/anthropic";
import { generateSpeech } from "@/lib/elevenlabs";
import { getAccount } from "@/data/accounts";

export const runtime = "nodejs";
export const maxDuration = 60;

const SCRIPT_SYSTEM = `You are generating a 60-second spoken account briefing for a Strategic Customer Success Manager at ElevenLabs.

ElevenLabs has three products: ElevenAgents (voice/chat agents), ElevenCreative (speech/music/image/video, 70+ languages), ElevenAPI (foundational AI audio models).

Write a natural-sounding briefing script of approximately 120-140 words. It must:
- Sound like a confident, peer-level colleague reading a morning brief
- Reference specific product adoption (ElevenAgents / ElevenCreative / ElevenAPI), key metrics, risks, and the top expansion play
- Use contractions and natural speech patterns — no bullet points
- Start with: "Good morning. Here's your briefing on [account name]."
- End with one concrete recommendation for this week

Do NOT: say "I" or refer to yourself. Do NOT use corporate jargon. Keep it tight — every sentence must earn its place.`;

export async function POST(req: Request) {
  const { accountId } = await req.json();
  const account = getAccount(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  const context = {
    name: account.name,
    country: account.country,
    stage: account.stage,
    contractValue: account.contractValue,
    nrr: account.nrr,
    renewalDate: account.renewalDate,
    productsAdopted: account.products.adopted,
    productsTrialling: account.products.trialling,
    productsWhitespace: account.products.whitespace,
    metrics: account.metrics,
    topRisk: account.risks[0] ?? null,
    topExpansionLever: account.expansionLevers[0] ?? null,
    topStakeholder: account.stakeholders.find((s) => s.role === "Champion") ?? account.stakeholders[0],
  };

  // Step 1: generate the script via Claude
  let script = "";
  try {
    const msg = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 400,
      system: SCRIPT_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Generate the voice briefing script for this account:\n\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    });
    script = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");
  } catch (e) {
    console.error("Claude script generation failed:", e);
    return new Response("Script generation failed", { status: 500 });
  }

  // Step 2: synthesise with ElevenLabs API (gracefully degrade if key missing)
  let audioBase64: string | null = null;
  try {
    const audioBuffer = await generateSpeech(script);
    audioBase64 = audioBuffer.toString("base64");
  } catch (e) {
    console.warn("ElevenLabs voice synthesis skipped:", e instanceof Error ? e.message : e);
  }

  return Response.json({ script, audioBase64 });
}
