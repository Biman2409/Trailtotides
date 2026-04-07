import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { adventures } from "@/lib/data";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ADVENTURE_LIST = JSON.stringify(
  adventures.map((a) => ({
    slug: a.slug,
    name: a.name,
    state: a.state,
    type: a.type,
    difficulty: a.difficulty,
    duration: a.durationDays,
    tags: (a.tags ?? []).slice(0, 4),
  }))
);

// Deterministic ACE trigger — no AI judgment needed for this
const UNSURE_SIGNALS = [
  "don't know", "dont know", "not sure", "unsure", "confused",
  "no idea", "never trekked", "never hiked", "never done",
  "first time", "first trek", "no experience", "no prior",
  "what should i", "what suits me", "help me decide",
  "where do i start", "where should i start",
];

function shouldSuggestAce(messages: { role: string; content: string }[], userMessageCount: number): boolean {
  // Rule 1: 3 or more back-and-forth exchanges
  if (userMessageCount >= 3) return true;
  // Rule 2: user explicitly signals uncertainty or no experience
  const allUserText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");
  return UNSURE_SIGNALS.some((signal) => allUserText.includes(signal));
}

function buildPrompt(messages: { role: string; content: string }[]): string {
  const userQuery = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  return `You are an Indian adventure travel advisor. Pick 1–3 best matching adventures for the user. Use ONLY exact slugs from the list.

Adventure list (JSON):
${ADVENTURE_LIST}

User query: "${userQuery}"

Respond EXACTLY like this:
<recommendations>
[{"slug":"exact-slug","name":"exact name","reason":"one sentence why it matches"}]
</recommendations>
One short helpful sentence.`;
}

// Fuzzy slug resolver — handles minor hallucinations
function resolveSlug(slug: string): string {
  if (adventures.find((a) => a.slug === slug)) return slug;
  const partial = adventures.find(
    (a) =>
      a.slug.includes(slug) ||
      slug.includes(a.slug) ||
      a.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
  return partial ? partial.slug : slug;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const userMessageCount = messages.filter(
      (m: { role: string }) => m.role === "user"
    ).length;

    // Check ACE trigger before calling the model
    const suggestAce = shouldSuggestAce(messages, userMessageCount);

    if (suggestAce) {
      const isUnsure = UNSURE_SIGNALS.some((s) =>
        messages
          .filter((m) => m.role === "user")
          .map((m) => m.content.toLowerCase())
          .join(" ")
          .includes(s)
      );
      const aceText = isUnsure
        ? "It sounds like you're still figuring out where to start — that's completely normal."
        : `You've asked a few questions and still haven't found the right fit — your ACE profile will match adventures to your exact body and experience level.`;
      return NextResponse.json({ text: aceText, recommendations: [], cards: [], suggestAce: true });
    }

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: buildPrompt(messages) }],
      temperature: 0.6,
      max_tokens: 512,
    });

    const content = response.choices[0].message.content ?? "";

    const suggestAceFallback = false;

    const recMatch = content.match(/<recommendations>([\s\S]*?)<\/recommendations>/);
    let recommendations: { slug: string; name: string; reason: string }[] = [];
    if (recMatch) {
      try {
        const parsed = JSON.parse(recMatch[1].trim());
        recommendations = parsed.map(
          (r: { slug: string; name: string; reason: string }) => ({
            ...r,
            slug: resolveSlug(r.slug),
          })
        );
      } catch {
        recommendations = [];
      }
    }

    const text = content
      .replace(/<recommendations>[\s\S]*?<\/recommendations>/, "")
      .replace(/<suggest_ace\s*\/>/, "")
      .trim();

    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    return NextResponse.json({ text, recommendations, cards, suggestAce: suggestAceFallback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
