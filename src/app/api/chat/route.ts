import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { adventures } from "@/lib/data";
import type { AdventureType } from "@/lib/data";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Dynamically derive available vs coming-soon types ────────────────────────

const ALL_TYPES: AdventureType[] = [
  "Trekking", "Motorcycling", "Cycling", "Diving", "Kayaking", "Skiing",
  "Mountaineering", "Rock Climbing", "Scrambling", "Jeep Safari", "Caving",
  "Urban Adventure", "Paragliding", "Hot Air Balloon", "Ice Skating",
];

const AVAILABLE_TYPES = [...new Set(adventures.map((a) => a.type))];
const COMING_SOON_TYPES = ALL_TYPES.filter((t) => !AVAILABLE_TYPES.includes(t));

// ─── Slim catalog: only what the model needs for lookup ──────────────────────
// Exclude long free-text fields (description, tagline, etc.) to save tokens

const CATALOG = adventures.map((a) => ({
  slug: a.slug,
  name: a.name,
  state: a.state,
  type: a.type,
  difficulty: a.difficulty,
  days: a.durationDays,
  region: a.region,
  altitude: a.altitude ?? undefined,
  tags: (a.tags ?? []).slice(0, 4),
  season: a.bestSeason,
}));

const CATALOG_STR = JSON.stringify(CATALOG);

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Compass.AI — a warm, knowledgeable Indian adventure travel advisor for Trail to Tides.

## Live catalog (JSON — use ONLY these slugs):
${CATALOG_STR}

## LIVE types: ${AVAILABLE_TYPES.join(", ")}
## COMING SOON (no live adventures yet): ${COMING_SOON_TYPES.join(", ")}

---

## Response rules:

**Specific request** (place / activity / difficulty / duration mentioned):
→ Reply in 1 sentence max, then immediately follow with:
<recommendations>[{"slug":"exact-slug","name":"Exact Name","reason":"why it fits in one sentence"}]</recommendations>
→ Recommend 1–3 adventures. ONLY use exact slugs from the catalog.
→ Do NOT write more than one sentence before the recommendations block.

**Vague request** ("something fun", "I want a trip", "recommend anything"):
→ Ask ONE focused question: "Mountains or coast?" / "How many days?" / "Trek, bike, or something else?"
→ No recommendations yet.

**Refinement** ("something easier", "different state", "shorter"):
→ Acknowledge briefly, give new recommendations.

**Coming-soon type** (Diving, Paragliding, Hot Air Balloon, Ice Skating, Scrambling):
→ Say it's coming soon, name exciting planned locations (Diving→Andamans/Lakshadweep; Paragliding→Bir Billing/Kullu; HotAirBalloon→Rajasthan; IceSkating→Shimla/Manali).
→ Ask if they want to explore what's live instead.
→ No <recommendations> block yet.

**General travel chat** (weather, best time, about a place):
→ Answer warmly with general knowledge, then offer to find an adventure there.

**User confused / indecisive** (fitness doubts, "I don't know", "can't decide"):
→ Include <suggest_ace/> + 1 sentence about what ACE does.
→ Still give recommendations if you can make a reasonable guess.

## Hard rules:
- ONLY use slugs from the catalog above. Never invent slugs.
- Never recommend a coming-soon type — say it's coming soon instead.
- Keep text responses concise (1–3 sentences max before any recommendations).
- Don't say "I" awkwardly. Speak as Compass, not a generic bot.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveSlug(raw: string): string | null {
  const slug = raw?.trim();
  if (!slug) return null;

  // Exact match
  if (adventures.find((a) => a.slug === slug)) return slug;

  const clean = slug.toLowerCase();
  const nameFromSlug = clean.replace(/-/g, " ");

  // Try various fuzzy matches
  const match = adventures.find((a) => {
    const aSlug = a.slug.toLowerCase();
    const aName = a.name.toLowerCase();
    return (
      aSlug === clean ||
      aName === nameFromSlug ||
      aName.replace(/\s+/g, "-") === clean ||
      aSlug.includes(clean) ||
      clean.includes(aSlug) ||
      aName.includes(nameFromSlug) ||
      nameFromSlug.includes(aName)
    );
  });

  return match ? match.slug : null;
}

function parseRecommendations(content: string) {
  const recMatch = content.match(/<recommendations>([\s\S]*?)<\/recommendations>/);
  if (!recMatch) return [];
  try {
    const raw = recMatch[1].trim();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((r: Record<string, string>) => {
        const resolvedSlug = resolveSlug(r.slug ?? "");
        return resolvedSlug
          ? { slug: resolvedSlug, name: r.name ?? "", reason: r.reason ?? "" }
          : null;
      })
      .filter((r): r is { slug: string; name: string; reason: string } => r !== null)
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

// ─── Keyword fallback ─────────────────────────────────────────────────────────

function keywordSearch(query: string, limit = 3) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const synonyms: Record<string, string[]> = {
    beginner: ["Easy", "Moderate", "beginner"],
    easy: ["Easy", "Moderate", "beginner"],
    hard: ["Hard", "Advanced", "Extreme"],
    difficult: ["Hard", "Advanced"],
    challenging: ["Hard", "Advanced"],
    extreme: ["Extreme", "Advanced"],
    bike: ["Motorcycling"],
    biking: ["Motorcycling"],
    motorbike: ["Motorcycling"],
    motorcycle: ["Motorcycling"],
    cycle: ["Cycling"],
    cycling: ["Cycling"],
    climb: ["Mountaineering", "Rock Climbing"],
    mountaineering: ["Mountaineering"],
    snow: ["glacier", "winter", "skiing", "snow"],
    skiing: ["Skiing"],
    kayak: ["Kayaking"],
    kayaking: ["Kayaking"],
    cave: ["Caving"],
    caving: ["Caving"],
    jeep: ["Jeep Safari"],
    safari: ["Jeep Safari"],
    andaman: ["andaman"],
    kerala: ["Kerala", "Western Ghats"],
    kashmir: ["Kashmir", "Jammu"],
    himachal: ["Himachal"],
    ladakh: ["Ladakh"],
    uttarakhand: ["Uttarakhand"],
    sikkim: ["Sikkim"],
    northeast: ["Northeast"],
    spiti: ["Spiti"],
    weekend: ["2 days", "3 days"],
    summit: ["summit", "peak", "Mountaineering"],
    lake: ["lake"],
    glacier: ["glacier"],
    pass: ["pass"],
    family: ["Easy", "Moderate", "beginner"],
    solo: ["solo"],
    remote: ["remote"],
    scenic: ["scenic", "views"],
  };

  const expandedTerms = [...words];
  for (const w of words) {
    if (synonyms[w]) expandedTerms.push(...synonyms[w]);
  }

  const scored = adventures.map((a) => {
    const haystack = [
      a.name, a.state, a.type, a.difficulty ?? "", a.region ?? "",
      ...(a.tags ?? []), a.tagline ?? "", a.description ?? "", a.bestSeason ?? "",
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
  if (q.includes(adventure.state.toLowerCase())) return `Located in ${adventure.state}, matching your region preference.`;
  if (q.includes(adventure.type.toLowerCase())) return `A well-rated ${adventure.type} adventure in India.`;
  if (adventure.difficulty === "Easy" || adventure.difficulty === "Moderate") return `Accessible for most fitness levels — a great starting point.`;
  return `One of the top ${adventure.type} experiences on Trail to Tides.`;
}

// ─── Indecision detection ────────────────────────────────────────────────────

function detectIndecision(messages: { role: string; content: string }[]): boolean {
  const userMessages = messages.filter((m) => m.role === "user");

  // Only signal-based detection — never force ACE just because of round count
  if (userMessages.length >= 2) {
    const recentText = userMessages.slice(-3).map((m) => m.content.toLowerCase()).join(" ");
    const signals = [
      "don't know", "not sure", "no idea", "can't decide", "hard to choose",
      "help me decide", "overwhelmed", "confused", "am i ready",
      "fit enough", "what level", "my fitness", "not fit", "first time",
      "complete beginner", "total beginner", "which one", "can't choose",
      "too many options", "so many choices",
    ];
    if (signals.some((s) => recentText.includes(s))) return true;
  }

  return false;
}

// Check if query is about a coming-soon type (to skip keyword fallback)
function isComingSoonQuery(query: string): boolean {
  const q = query.toLowerCase();
  return COMING_SOON_TYPES.some((t) => q.includes(t.toLowerCase())) ||
    ["scuba", "dive", "diving", "paraglide", "paragliding", "balloon", "hot air",
      "ice skate", "ice skating", "scramble", "scrambling"].some((w) => q.includes(w));
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
      ? SYSTEM_PROMPT + "\n\n[HINT: User seems indecisive. Include <suggest_ace/> in your response alongside any recommendations.]"
      : SYSTEM_PROMPT;

    const groqMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    let rawContent = "";

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.5,
        max_tokens: 500,
      });
      rawContent = response.choices[0].message.content ?? "";
    } catch (groqErr: unknown) {
      // Rate limit or API error — try lighter model as fallback
      const errMsg = groqErr instanceof Error ? groqErr.message : String(groqErr);
      const isRateLimit = errMsg.includes("429") || errMsg.includes("rate_limit") || errMsg.includes("Rate limit");

      if (isRateLimit) {
        try {
          const fallbackResponse = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: groqMessages,
            temperature: 0.5,
            max_tokens: 500,
          });
          rawContent = fallbackResponse.choices[0].message.content ?? "";
        } catch {
          // Both models failed — use keyword search only
          const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";
          const fallback = keywordSearch(lastQuery, 3);
          if (fallback.length > 0) {
            return NextResponse.json({
              text: "Here are some adventures that match what you're looking for.",
              recommendations: fallback.map((a) => ({ slug: a.slug, name: a.name, reason: fallbackReason(a, lastQuery) })),
              cards: fallback,
              suggestAce: serverDetectedIndecision,
            });
          }
          return NextResponse.json({
            rateLimited: true,
            text: "",
            recommendations: [],
            cards: [],
            suggestAce: false,
          });
        }
      } else {
        throw groqErr;
      }
    }

    const suggestAce = /<suggest_ace\s*\/>/.test(rawContent) || serverDetectedIndecision;
    const recommendations = parseRecommendations(rawContent);
    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    let text = cleanText(rawContent);

    if (!text && recommendations.length > 0) {
      const names = recommendations.map((r) => r.name);
      text = names.length === 1
        ? `Here's a great pick — ${names[0]}.`
        : `Here are ${names.length} adventures that match.`;
    }

    if (cards.length > 0) {
      return NextResponse.json({ text, recommendations, cards, suggestAce });
    }

    // Keyword fallback — skip if it's clearly a coming-soon query
    const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";

    if (!isComingSoonQuery(lastQuery)) {
      const fallback = keywordSearch(lastQuery, 3);
      if (fallback.length > 0) {
        return NextResponse.json({
          text: text || "Here are some adventures that might match.",
          recommendations: fallback.map((a) => ({ slug: a.slug, name: a.name, reason: fallbackReason(a, lastQuery) })),
          cards: fallback,
          suggestAce,
        });
      }
    }

    return NextResponse.json({
      text: text || "Could you tell me a bit more — which region or type of adventure interests you?",
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
