import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { adventures } from "@/lib/data";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Slim summary with exact slugs the model must use
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

  return `You are an Indian adventure travel advisor. Pick 1–3 best matching adventures for the user from the list below. Use ONLY the exact slugs from the list — do not invent new ones.

Adventure list (JSON):
${ADVENTURE_LIST}

User query: "${userQuery}"

Respond EXACTLY in this format and nothing else before the tag:
<recommendations>
[{"slug":"exact-slug-from-list","name":"exact name","reason":"one sentence why it matches"}]
</recommendations>
Then write one short helpful sentence.`;
}

// Fuzzy slug resolver — handles minor hallucinations
function resolveSlug(slug: string): string {
  if (adventures.find((a) => a.slug === slug)) return slug;
  // Try partial match
  const partial = adventures.find(
    (a) => a.slug.includes(slug) || slug.includes(a.slug) ||
           a.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
  return partial ? partial.slug : slug;
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
        const parsed = JSON.parse(recMatch[1].trim());
        recommendations = parsed.map((r: { slug: string; name: string; reason: string }) => ({
          ...r,
          slug: resolveSlug(r.slug),
        }));
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
