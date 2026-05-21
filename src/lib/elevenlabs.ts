const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb"; // default: George

export async function generateSpeech(text: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not set");

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.1,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API error ${res.status}: ${err}`);
  }

  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}

export function buildBriefingScript(params: {
  date: string;
  accountCount: number;
  highRisks: { account: string; label: string }[];
  expansionOpps: { account: string; lever: string }[];
  renewalsSoon: { account: string; date: string }[];
  topNrr: { account: string; nrr: number };
}): string {
  const { date, accountCount, highRisks, expansionOpps, renewalsSoon, topNrr } = params;

  const risksText =
    highRisks.length > 0
      ? `${highRisks.length === 1 ? "One account needs" : `${highRisks.length} accounts need`} immediate attention: ${highRisks.map((r) => `${r.account} — ${r.label}`).join("; ")}.`
      : "No high-severity risks in the portfolio today.";

  const expansionText =
    expansionOpps.length > 0
      ? `Your top expansion play this week: ${expansionOpps[0].account} — ${expansionOpps[0].lever}.`
      : "";

  const renewalsText =
    renewalsSoon.length > 0
      ? `Renewal watch: ${renewalsSoon.map((r) => `${r.account} renews ${r.date}`).join(", ")}.`
      : "";

  return [
    `Good morning. Here's your ElevenLabs portfolio briefing for ${date}.`,
    `You're managing ${accountCount} strategic accounts across Western Europe.`,
    risksText,
    expansionText,
    renewalsText,
    `Your strongest performer by NRR is ${topNrr.account} at ${(topNrr.nrr * 100).toFixed(0)}%.`,
    `That's your briefing. Have a great day.`,
  ]
    .filter(Boolean)
    .join(" ");
}
