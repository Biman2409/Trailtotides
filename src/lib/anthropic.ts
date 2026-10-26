import Anthropic from "@anthropic-ai/sdk";

// Straight to Anthropic with our own API key. baseURL and authToken are pinned because the
// SDK otherwise picks up ANTHROPIC_BASE_URL / ANTHROPIC_AUTH_TOKEN from the environment,
// which the old Orchids setup used to route calls through its proxy.
export const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  authToken: null,
  baseURL: "https://api.anthropic.com",
});
