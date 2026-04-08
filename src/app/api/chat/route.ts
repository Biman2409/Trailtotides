import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { adventures } from "@/lib/data";
import type { AdventureType } from "@/lib/data";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Dynamically derive available vs coming-soon types from the actual data ───

// All types the platform supports (defined in the type system)
const ALL_TYPES: AdventureType[] = [
  "Trekking", "Biking", "Cycling", "Diving", "Kayaking", "Skiing",
  "Mountaineering", "Rock Climbing", "Scrambling", "Jeep Safari", "Caving",
  "Urban Adventure", "Paragliding", "Hot Air Balloon", "Ice Skating",
];

// Types that have at least one real adventure in the catalog
const AVAILABLE_TYPES = [...new Set(adventures.map((a) => a.type))];

// Types that are defined but have no live adventures yet
const COMING_SOON_TYPES = ALL_TYPES.filter((t) => !AVAILABLE_TYPES.includes(t));

// Compact adventure list for context window efficiency
const ADVENTURE_LIST = adventures.map((a) => ({
  slug: a.slug,
  name: a.name,
  state: a.state,
  type: a.type,
  difficulty: a.difficulty,
  duration: a.durationDays,
  altitude: a.altitude ?? null,
  region: a.region,
  tags: (a.tags ?? []).slice(0, 6),
  season: a.bestSeason,
}));

const ADVENTURE_LIST_STR = JSON.stringify(ADVENTURE_LIST);

const SYSTEM_PROMPT = `You are Compass.AI — a friendly, knowledgeable Indian adventure travel advisor for Trail to Tides (trailtotides.com).

You help users find their perfect adventure in India. You're conversational, warm, and genuinely enthusiastic about the outdoors.

## Live adventure catalog (JSON):
${ADVENTURE_LIST_STR}

## Adventure types currently LIVE on Trail to Tides:
${AVAILABLE_TYPES.join(", ")}

## Adventure types COMING SOON (not yet available):
${COMING_SOON_TYPES.join(", ")}

## How to respond:

**For clear requests** (place / activity / difficulty / duration / season specified):
- Write 1–3 natural sentences responding to the user.
- Then embed a JSON recommendations block at the END of your message:
<recommendations>[{"slug":"exact-slug","name":"Exact Name","reason":"one concise sentence why this fits them"}]</recommendations>
- Pick 1–3 adventures that best match. Use ONLY exact slugs from the catalog above.

**For coming-soon adventure types** (e.g. Diving, Paragliding, Hot Air Balloon, Ice Skating, Scrambling):
- Warmly let the user know that type is coming soon to Trail to Tides.
- Be specific and enthusiastic — mention the kinds of locations or experiences being planned if you can (e.g. for Diving: Andamans, Lakshadweep; for Paragliding: Bir Billing, Manali; for Hot Air Balloon: Rajasthan).
- Ask if they'd like to explore something from what's currently available.
- Do NOT recommend unrelated adventures without asking first.
- Do NOT embed a <recommendations> block unless they explicitly say yes.

**For vague or open-ended requests** (e.g. "something adventurous", "I want a trip", "recommend anything"):
- Ask ONE focused follow-up question to narrow it down. Examples: "Mountains or coast?" / "How many days do you have?" / "What activity sounds most exciting — trek, bike, or something else?"
- Do NOT embed recommendations yet.

**For follow-ups and refinements** (e.g. "something easier", "closer to Delhi", "shorter"):
- Acknowledge naturally, then give updated recommendations referencing what came before.

**For off-topic or general travel chat** (e.g. "what's the weather in Ladakh", "best time to visit Spiti", "tell me about Kashmir"):
- Engage warmly and helpfully with general knowledge, then steer back to finding an adventure.

**For ACE suggestion** — suggest the ACE assessment when ANY of these apply:
- User has gone back and forth (3+ exchanges) without settling.
- User expresses confusion about their fitness: "not sure if I can", "am I ready for", "what level am I".
- User is overwhelmed: "I don't know", "too many options", "can't decide".
- User asks what suits their fitness or experience level.
When suggesting ACE: include <suggest_ace/> AND write 1–2 warm sentences explaining what it is. You CAN still include recommendations alongside ACE.

## Rules:
- Use ONLY slugs from the live catalog. Never invent slugs.
- Keep conversational text under 3 sentences before the recommendations block.
- Don't repeat already-recommended adventures unless asked.
- Speak naturally — you're Compass, not a chatbot.
- If nothing in the catalog fits, say so honestly and ask a clarifying question.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveSlug(slug: string): string {
  if (adventures.find((a) => a.slug === slug)) return slug;
  const clean = slug.toLowerCase().trim();
  const partial = adventures.find(
    (a) =>
      a.slug.includes(clean) ||
      clean.includes(a.slug) ||
      a.name.toLowerCase().replace(/\s+/g, "-") === clean ||
      a.name.toLowerCase() === clean.replace(/-/g, " ")
  );
  return partial ? partial.slug : slug;
}

function parseRecommendations(content: string) {
  const recMatch = content.match(/<recommendations>([\s\S]*?)<\/recommendations>/);
  if (!recMatch) return [];
  try {
    const parsed = JSON.parse(recMatch[1].trim());
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r: Record<string, string>) => ({
        slug: resolveSlug(r.slug ?? ""),
        name: r.name ?? "",
        reason: r.reason ?? "",
      }))
      .filter((r) => adventures.find((a) => a.slug === r.slug));
  } catch {
    return [];
  }
}

function cleanText(content: string): string {
  return content
    .replace(/<recommendations>[\s\S]*?<\/recommendations>/g, "")
    .replace(/<suggest_ace\s*\/>/g, "")
    .trim();
}

function keywordSearch(query: string, limit = 3) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const synonyms: Record<string, string[]> = {
    beginner: ["beginner-friendly", "Easy", "Moderate"],
    easy: ["beginner-friendly", "Easy", "Moderate"],
    hard: ["Hard", "Advanced", "Extreme"],
    difficult: ["Hard", "Advanced"],
    challenging: ["Hard", "Advanced"],
    bike: ["Biking", "motorcycle"],
    motorbike: ["Biking"],
    motorcycle: ["Biking"],
    cycle: ["Cycling"],
    cycling: ["Cycling"],
    climb: ["Mountaineering", "Rock Climbing"],
    mountaineering: ["Mountaineering"],
    snow: ["glacier", "winter", "skiing"],
    skiing: ["Skiing"],
    kayaking: ["Kayaking"],
    andaman: ["Islands"],
    kerala: ["Malabar", "Western Ghats"],
    kashmir: ["Jammu & Kashmir"],
    himachal: ["Himachal Pradesh"],
    ladakh: ["Ladakh"],
    uttarakhand: ["Uttarakhand"],
    sikkim: ["Sikkim"],
    northeast: ["Northeast"],
    spiti: ["Spiti"],
    weekend: ["2 days", "3 days"],
    summit: ["summit", "peak", "Mountaineering"],
    lake: ["lake", "lakes"],
    glacier: ["glacier"],
    pass: ["pass"],
    family: ["beginner-friendly", "Easy", "Moderate"],
    solo: ["Solo"],
    remote: ["remote", "isolation"],
    scenic: ["scenic", "views", "viewpoint"],
  };

  const expandedTerms = [...words];
  for (const w of words) {
    if (synonyms[w]) expandedTerms.push(...synonyms[w]);
  }

  const scored = adventures.map((a) => {
    const haystack = [
      a.name, a.state, a.type, a.difficulty ?? "", a.region ?? "",
      ...(a.tags ?? []),
      a.tagline ?? "",
      a.description ?? "",
      a.bestSeason ?? "",
    ].join(" ").toLowerCase();

    let score = 0;
    for (const term of expandedTerms) {
      if (haystack.includes(term.toLowerCase())) score++;
    }
    return { a, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.a);
}

function fallbackReason(adventure: typeof adventures[0], query: string): string {
  const q = query.toLowerCase();
  if (q.includes(adventure.state.toLowerCase())) return `Located in ${adventure.state}, which matches your search.`;
  if (q.includes(adventure.type.toLowerCase())) return `A popular ${adventure.type} adventure matching your interests.`;
  if (adventure.difficulty === "Easy" || adventure.difficulty === "Moderate") return `Great for those new to ${adventure.type.toLowerCase()}.`;
  return `One of the top-rated ${adventure.type} adventures in India.`;
}

function detectIndecision(messages: { role: string; content: string }[]): boolean {
  const userMessages = messages.filter((m) => m.role === "user");
  const roundCount = userMessages.length;

  if (roundCount >= 3) {
    const recentText = userMessages.slice(-3).map((m) => m.content.toLowerCase()).join(" ");
    const signals = [
      "don't know", "not sure", "no idea", "can't decide", "hard to choose",
      "help me decide", "don't mind", "anything", "whatever", "too many",
      "overwhelmed", "confused", "lost", "am i ready", "fit enough",
      "what level", "my fitness", "my capability", "not fit", "never done",
      "first time", "complete beginner", "total beginner", "which one",
      "so many options", "can't choose",
    ];
    if (signals.some((s) => recentText.includes(s))) return true;
  }

  if (roundCount >= 4) return true;
  return false;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const serverDetectedIndecision = detectIndecision(messages);

    const systemContent = serverDetectedIndecision
      ? SYSTEM_PROMPT + "\n\n[HINT: User seems indecisive after several exchanges. Include <suggest_ace/> alongside any recommendations.]"
      : SYSTEM_PROMPT;

    const groqMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.55,
      max_tokens: 700,
    });

    const rawContent = response.choices[0].message.content ?? "";
    const suggestAce = /<suggest_ace\s*\/>/.test(rawContent) || serverDetectedIndecision;

    const recommendations = parseRecommendations(rawContent);
    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    let text = cleanText(rawContent);

    if (!text && recommendations.length > 0) {
      const names = recommendations.map((r) => r.name);
      if (names.length === 1) text = `Here's a great pick for you — ${names[0]}.`;
      else text = `Here are ${names.length} adventures that match what you're looking for.`;
    }

    if (cards.length > 0) {
      return NextResponse.json({ text, recommendations, cards, suggestAce });
    }

    // Keyword fallback — but skip if the model already gave a coming-soon / informational response
    const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";
    const isComingSoonQuery = COMING_SOON_TYPES.some((t) =>
      lastQuery.toLowerCase().includes(t.toLowerCase())
    );

    if (!isComingSoonQuery) {
      const fallback = keywordSearch(lastQuery);
      if (fallback.length > 0) {
        const fallbackRecs = fallback.map((a) => ({
          slug: a.slug,
          name: a.name,
          reason: fallbackReason(a, lastQuery),
        }));
        return NextResponse.json({
          text: text || "Here are some adventures that might match what you're looking for.",
          recommendations: fallbackRecs,
          cards: fallback,
          suggestAce,
        });
      }
    }

    return NextResponse.json({
      text: text || "Could you tell me more about what you're looking for — region, activity type, or how many days you have?",
      recommendations: [],
      cards: [],
      suggestAce,
    });
  } catch (err: unknown) {
    console.error("Compass.AI error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
