import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { adventures } from "@/lib/data";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

const ADVENTURE_SUMMARY = adventures.map((a) => ({
  id: a.id,
  slug: a.slug,
  name: a.name,
  tagline: a.tagline,
  region: a.region,
  state: a.state,
  type: a.type,
  difficulty: a.difficulty,
  duration: a.duration,
  durationDays: a.durationDays,
  altitude: a.altitude,
  bestSeason: a.bestSeason,
  bestMonths: a.bestMonths,
  groupSize: a.groupSize,
  tags: a.tags,
  whoFor: a.whoFor,
  description: a.description.slice(0, 200),
}));

const SYSTEM_PROMPT = `You are an expert Indian adventure travel advisor for an adventure discovery platform.
You help users find the perfect adventure from the following list of adventures.

Available adventures (JSON):
${JSON.stringify(ADVENTURE_SUMMARY, null, 2)}

Your job:
1. Understand what the user is looking for (region, type, difficulty, season, duration, vibe, etc.)
2. Recommend 1–3 matching adventures from the list above
3. For each recommendation, respond with a JSON block AND a short human-readable explanation

ALWAYS respond in this exact format:
<recommendations>
[
  { "slug": "...", "name": "...", "reason": "one-sentence reason why this matches" },
  ...
]
</recommendations>

Then after the JSON block, write 1–2 sentences of conversational advice.

If nothing matches well, suggest the closest options and explain why.
Only recommend adventures from the provided list — never invent adventures.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Convert messages to Anthropic format (user/assistant only, no system)
    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })
    );

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse recommendations out of the response
    const recMatch = content.match(
      /<recommendations>([\s\S]*?)<\/recommendations>/
    );
    let recommendations: { slug: string; name: string; reason: string }[] = [];
    if (recMatch) {
      try {
        recommendations = JSON.parse(recMatch[1].trim());
      } catch {
        recommendations = [];
      }
    }

    // Strip the JSON block from the conversational text
    const text = content
      .replace(/<recommendations>[\s\S]*?<\/recommendations>/, "")
      .trim();

    // Attach full adventure cards for matching slugs
    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    return NextResponse.json({ text, recommendations, cards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
