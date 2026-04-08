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
    tags: (a.tags ?? []).slice(0, 5),
  }))
);

// Fuzzy slug resolver — handles minor model hallucinations
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

// Generate a natural summary text from resolved adventure names
function buildSummaryText(recs: { name: string }[]): string {
  if (recs.length === 0) return "I couldn't find a perfect match — try describing what you're looking for in more detail.";
  const names = recs.map((r) => r.name);
  if (names.length === 1) return `Here's a great pick for you: ${names[0]}.`;
  if (names.length === 2) return `Here are two great options: ${names[0]} and ${names[1]}.`;
  return `Here are ${names.length} adventures that match what you're looking for.`;
}

// Keyword-based fallback search across all adventure fields
function keywordSearch(query: string, limit = 3) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  // keyword → tag/type/state mappings
  const synonyms: Record<string, string[]> = {
    beginner: ["beginner-friendly", "easy", "moderate", "Moderate"],
    easy: ["beginner-friendly", "Moderate"],
    hard: ["Hard", "Advanced"],
    difficult: ["Hard", "Advanced"],
    scuba: ["Diving", "diving", "underwater"],
    dive: ["Diving", "diving"],
    diving: ["Diving"],
    bike: ["Biking", "motorcycle"],
    motorbike: ["Biking"],
    motorcycle: ["Biking"],
    cycle: ["Cycling"],
    cycling: ["Cycling"],
    climb: ["Mountaineering", "Rock Climbing"],
    mountaineering: ["Mountaineering"],
    andaman: ["Islands"],
    kerala: ["Malabar", "Western Ghats"],
    kashmir: ["Jammu & Kashmir"],
    himachal: ["Himachal Pradesh"],
    ladakh: ["Ladakh"],
    uttarakhand: ["Uttarakhand"],
    sikkim: ["Sikkim"],
    nepal: ["Nepal"],
    spiti: ["Spiti"],
    weekend: ["2 days", "3 days", "4 days", "Moderate"],
    summit: ["summit", "peak", "Mountaineering"],
    lake: ["lake", "lakes"],
    glacier: ["glacier"],
    pass: ["pass"],
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

const SYSTEM_PROMPT = `You are Compass.AI, an expert Indian adventure travel advisor for Trail to Tides.

Your job: read the user's message and either:
A) Recommend specific adventures from the provided list, OR
B) Suggest the ACE assessment if the user is genuinely confused/lost (doesn't know their fitness level or what type of adventure suits them).

Rules:
- For ANY query about a place, type of activity, difficulty, duration, or season → give recommendations (Option A).
- Only suggest ACE if the user is completely directionless — e.g., "I have no idea what to do", "I'm totally lost", "I don't know anything about adventures".
- "I'm a beginner" is NOT enough to suggest ACE — still give recommendations for beginner-appropriate adventures.
- ALWAYS pick from the adventure list. Use ONLY the exact slug values provided.
- Return ONLY the JSON inside the XML tags. No extra fields. Just slug, name, reason.`;

function buildPrompt(messages: { role: string; content: string }[]): string {
  const history = messages
    .map((m) => `${m.role === "user" ? "User" : "Compass.AI"}: ${m.content}`)
    .join("\n");

  return `${SYSTEM_PROMPT}

Adventure list:
${ADVENTURE_LIST}

Conversation:
${history}

Respond with ONLY one of:

Option A — Recommendations:
<recommendations>
[{"slug":"exact-slug-from-list","name":"Exact Adventure Name","reason":"one sentence why it fits"}]
</recommendations>

Option B — Needs ACE assessment:
<suggest_ace/>`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const userMessages = messages.filter((m: { role: string }) => m.role === "user");
    const userMessageCount = userMessages.length;

    // After 3+ exchanges WITH no good result yet, gently suggest ACE alongside recommendations
    const shouldNudgeAce = userMessageCount >= 3;

    const prompt = buildPrompt(messages);

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content ?? "";

    // Model chose to suggest ACE
    if (/<suggest_ace\s*\/>/.test(content)) {
      return NextResponse.json({
        text: "It sounds like you're still exploring what's right for you — that's totally fine. Your ACE profile will match adventures to your exact fitness level and experience.",
        recommendations: [],
        cards: [],
        suggestAce: true,
      });
    }

    // Parse recommendations
    const recommendations = parseRecommendations(content);
    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    // If model returned garbage / no valid slugs, fall back to keyword search
    const lastQuery = userMessages[userMessages.length - 1]?.content ?? "";
    if (cards.length === 0) {
      const fallback = keywordSearch(lastQuery);

      if (fallback.length > 0) {
        const fallbackRecs = fallback.map((a) => ({
          slug: a.slug,
          name: a.name,
          reason: "Matches based on your search.",
        }));
        return NextResponse.json({
          text: buildSummaryText(fallbackRecs),
          recommendations: fallbackRecs,
          cards: fallback,
          suggestAce: false,
        });
      }

      return NextResponse.json({
        text: "I couldn't find an exact match in our current listings. Try describing the region, type (trek/bike/dive), or difficulty you're looking for.",
        recommendations: [],
        cards: [],
        suggestAce: shouldNudgeAce,
      });
    }

    const text = buildSummaryText(recommendations);
    return NextResponse.json({
      text,
      recommendations,
      cards,
      suggestAce: shouldNudgeAce && cards.length === 0,
    });
  } catch (err: unknown) {
    console.error("Compass.AI error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
