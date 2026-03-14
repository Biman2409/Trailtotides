import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
  defaultHeaders: {
    "x-orchids-api-key": process.env.ANTHROPIC_API_KEY ?? "",
  },
});
