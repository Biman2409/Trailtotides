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

function buildPrompt(
  messages: { role: string; content: string }[],
  userMessageCount: number
): string {
  const userQuery = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const forceAce = userMessageCount >= 3;

  const aceConditions = forceAce
    ? `The user has sent ${userMessageCount} messages — you MUST suggest the ACE assessment (use <suggest_ace/>). Do NOT output <recommendations>.`
    : `Use <suggest_ace/> ONLY if the user says they have NO experience at all, OR explicitly says they don't know their fitness level, OR says they don't know what is suitable for them.
IMPORTANT: If the user asks for a "beginner trek" or "easy adventure" — that is a difficulty filter, NOT uncertainty. Recommend matching adventures normally.`;

  return `You are an Indian adventure travel advisor.

RULE: ${aceConditions}

Adventure list (JSON):
${ADVENTURE_LIST}

User query: "${userQuery}"

If the ACE rule applies, respond EXACTLY like:
<suggest_ace/>
One warm sentence about the ACE assessment.

Otherwise respond EXACTLY like:
<recommendations>
[{"slug":"exact-slug","name":"exact name","reason":"one sentence why it matches"}]
</recommendations>
One short helpful sentence. Do NOT mention ACE in this case.`;
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

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: buildPrompt(messages, userMessageCount) }],
      temperature: 0.6,
      max_tokens: 512,
    });

    const content = response.choices[0].message.content ?? "";

    // Check if AI is suggesting ACE, or force it after 3+ user messages
    const suggestAce = /<suggest_ace\s*\/>/.test(content) || userMessageCount >= 3;

    const recMatch = content.match(/<recommendations>([\s\S]*?)<\/recommendations>/);
    let recommendations: { slug: string; name: string; reason: string }[] = [];
    if (!suggestAce && recMatch) {
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

    return NextResponse.json({ text, recommendations, cards, suggestAce });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
