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

// If the user's message contains a clear destination or activity, they know what
// they want — skip ACE judgment and go straight to recommendations.
const CLEAR_INTENT_SIGNALS = [
  "trek", "trekking", "hike", "hiking", "bike", "cycling", "motorcycle",
  "climb", "climbing", "kayak", "raft", "surf", "dive", "scuba",
  "himachal", "ladakh", "uttarakhand", "kashmir", "rajasthan", "sikkim",
  "andaman", "kerala", "goa", "spiti", "manali", "leh", "zanskar",
  "easy", "moderate", "hard", "advanced", "difficult",
  "days", "weekend", "summit", "peak", "pass", "glacier", "lake",
];

function hasCleanIntent(messages: { role: string; content: string }[]): boolean {
  const text = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");
  return CLEAR_INTENT_SIGNALS.some((s) => text.includes(s));
}

function buildRecommendationsPrompt(messages: { role: string; content: string }[]): string {
  const userQuery = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  return `You are an Indian adventure travel advisor. Pick 1–3 best matching adventures. Use ONLY exact slugs.

Adventure list (JSON):
${ADVENTURE_LIST}

User query: "${userQuery}"

Respond EXACTLY with ONLY these three fields per item:
<recommendations>
[{"slug":"exact-slug","name":"exact name","reason":"one sentence why it matches"}]
</recommendations>
One short helpful sentence.`;
}

function buildAceJudgmentPrompt(messages: { role: string; content: string }[]): string {
  const conversation = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `You are an Indian adventure travel advisor. The user has sent a message that is not clearly about a specific adventure. Judge if they need the ACE assessment.

Suggest ACE if: user has no experience, doesn't know their fitness level, is overwhelmed or confused, doesn't know what's suitable for them.
Do NOT suggest ACE if: user asks for recommendations in general (like "what's good in Ladakh?").

Conversation:
${conversation}

Respond with ONLY one of these two options:
Option 1 (needs ACE): <suggest_ace/>
Option 2 (give recommendations):
<recommendations>
[{"slug":"exact-slug","name":"exact name","reason":"one sentence"}]
</recommendations>
One short sentence.

Adventure list for Option 2:
${ADVENTURE_LIST}`;
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

function parseRecommendations(content: string) {
  const recMatch = content.match(/<recommendations>([\s\S]*?)<\/recommendations>/);
  if (!recMatch) return [];
  try {
    const parsed = JSON.parse(recMatch[1].trim());
    return parsed.map((r: { slug: string; name: string; reason: string }) => ({
      slug: resolveSlug(r.slug),
      name: r.name,
      reason: r.reason ?? "",
    }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const userMessageCount = messages.filter(
      (m: { role: string }) => m.role === "user"
    ).length;

    // Hard rule 1: 3+ exchanges — always suggest ACE
    if (userMessageCount >= 3) {
      return NextResponse.json({
        text: "You've asked a few questions and still haven't found the right fit — your ACE profile will match adventures to your exact body and experience level.",
        recommendations: [],
        cards: [],
        suggestAce: true,
      });
    }

    // Clear intent (specific destination / activity / difficulty) → skip ACE judgment
    const prompt = hasCleanIntent(messages)
      ? buildRecommendationsPrompt(messages)
      : buildAceJudgmentPrompt(messages);

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 768,
    });

    const content = response.choices[0].message.content ?? "";

    // Groq decided to suggest ACE
    if (/<suggest_ace\s*\/>/.test(content)) {
      return NextResponse.json({
        text: "It sounds like you're still figuring out where to start — that's completely normal.",
        recommendations: [],
        cards: [],
        suggestAce: true,
      });
    }

    const recommendations = parseRecommendations(content);
    const text = content
      .replace(/<recommendations>[\s\S]*?<\/recommendations>/, "")
      .trim();
    const cards = recommendations
      .map((r: { slug: string }) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    return NextResponse.json({ text, recommendations, cards, suggestAce: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
