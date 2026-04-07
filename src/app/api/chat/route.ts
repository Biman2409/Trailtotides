import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { adventures } from "@/lib/data";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Slim summary — only what the model needs to match
const ADVENTURE_LIST = JSON.stringify(
  adventures.map((a) => ({
    slug: a.slug,
    name: a.name,
    state: a.state,
    type: a.type,
    difficulty: a.difficulty,
    durationDays: a.durationDays,
    tags: (a.tags ?? []).slice(0, 4),
  }))
);

function buildPrompt(messages: { role: string; content: string }[]): string {
  const userQuery = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  return `Available adventures (JSON): ${ADVENTURE_LIST}

User is looking for: ${userQuery}

Respond ONLY in this exact format:
<recommendations>
[{"slug":"...","name":"...","reason":"one sentence why it matches"}]
</recommendations>
Then write one short sentence of advice.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: buildPrompt(messages) }],
      temperature: 0.6,
      max_tokens: 512,
    });

    const content = response.choices[0].message.content ?? "";

    const recMatch = content.match(/<recommendations>([\s\S]*?)<\/recommendations>/);
    let recommendations: { slug: string; name: string; reason: string }[] = [];
    if (recMatch) {
      try {
        recommendations = JSON.parse(recMatch[1].trim());
      } catch {
        recommendations = [];
      }
    }

    const text = content
      .replace(/<recommendations>[\s\S]*?<\/recommendations>/, "")
      .trim();

    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    return NextResponse.json({ text, recommendations, cards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
