import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set — Claude calls will fail");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  OPUS: "claude-opus-4-5",
  SONNET: "claude-sonnet-4-5",
  HAIKU: "claude-haiku-4-5-20251001",
} as const;
