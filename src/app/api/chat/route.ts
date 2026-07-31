import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adventures } from "@/lib/data";
import type { AdventureType } from "@/lib/data";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Gemini's free tier via its OpenAI-compatible endpoint — no billing required.
// https://ai.google.dev/gemini-api/docs/openai
const hasGeminiKey = !!process.env.GEMINI_API_KEY;
const client = hasGeminiKey
  ? new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    })
  : null;

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

**User confused / indecisive** (fitness doubts, "I don't know", "can't decide", "which one", "too many options"):
→ Include <suggest_ace/> + 1 sentence pointing them to the Adventure Matchmaker — an 8-question quiz that matches them straight to adventures their body is ready for, faster than browsing back and forth with you.
→ Still give recommendations if you can make a reasonable guess.

**Third+ round of recommendations without the user committing:**
→ Include <suggest_ace/> and note the Adventure Matchmaker will narrow it down in one pass instead of more back-and-forth.

## Hard rules:
- ONLY use slugs from the catalog above. Never invent slugs.
- Never recommend a coming-soon type — say it's coming soon instead.
- Keep text responses concise (1–3 sentences max before any recommendations).
- Don't say "I" awkwardly. Speak as Compass, not a generic bot.
- When you mention <suggest_ace/> in your own words, call it the "Adventure Matchmaker", not "ACE" — ACE is the fitness engine behind it, Matchmaker is the thing users actually take.`;

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
    water: ["Diving", "Kayaking", "Surfing", "River Rafting", "Snorkelling"],
    coastal: ["Diving", "Surfing", "Snorkelling", "beach", "coast"],
    coast: ["Diving", "Surfing", "Snorkelling", "beach", "coast"],
    ocean: ["Diving", "Surfing", "Snorkelling"],
    sea: ["Diving", "Surfing", "Snorkelling"],
    beach: ["Diving", "Surfing", "Snorkelling", "beach"],
    dive: ["Diving"],
    diving: ["Diving"],
    scuba: ["Diving"],
    snorkel: ["Snorkelling"],
    snorkelling: ["Snorkelling"],
    surf: ["Surfing"],
    surfing: ["Surfing"],
    raft: ["River Rafting"],
    rafting: ["River Rafting"],
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
    // Weight matches by field — the activity type/region are what a synonym like
    // "water" → "Diving" is really trying to signal; generic description text
    // shouldn't outweigh that and pull in unrelated results.
    const primary = [a.type].join(" ").toLowerCase();
    const secondary = [a.state, a.region ?? ""].join(" ").toLowerCase();
    const rest = [
      a.name, a.difficulty ?? "", ...(a.tags ?? []), a.tagline ?? "", a.description ?? "", a.bestSeason ?? "",
    ].join(" ").toLowerCase();

    let score = 0;
    for (const term of expandedTerms) {
      const t = term.toLowerCase();
      if (primary.includes(t)) score += 4;
      if (secondary.includes(t)) score += 3;
      if (rest.includes(t)) score += 1;
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
// Note: Kayaking/Diving are declared types but currently have zero live adventures,
// so generic water/coastal phrasing needs to route here too, not just the exact type name.
function isComingSoonQuery(query: string): boolean {
  const q = query.toLowerCase();
  return COMING_SOON_TYPES.some((t) => q.includes(t.toLowerCase())) ||
    ["scuba", "dive", "diving", "paraglide", "paragliding", "balloon", "hot air",
      "ice skate", "ice skating", "scramble", "scrambling",
      "water", "coastal", "ocean", "beach", "surf", "surfing", "snorkel",
      "kayak", "kayaking", "raft", "rafting"].some((w) => q.includes(w));
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(`chat:${getClientIp(req)}`, 20, 5 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const { messages, recommendationRounds } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const serverDetectedIndecision = detectIndecision(messages);
    // Been shown adventures 2+ times without committing — nudge toward the Matchmaker instead of more browsing.
    const shownRecommendationsRepeatedly = typeof recommendationRounds === "number" && recommendationRounds >= 2;
    const shouldSuggestAce = serverDetectedIndecision || shownRecommendationsRepeatedly;

    const hint = serverDetectedIndecision
      ? "\n\n[HINT: User seems indecisive. Include <suggest_ace/> in your response alongside any recommendations, and call it the Adventure Matchmaker in your own words.]"
      : shownRecommendationsRepeatedly
      ? "\n\n[HINT: You've already shown this user recommendations 2+ times this conversation without them settling on one. Include <suggest_ace/> and briefly note that the Adventure Matchmaker (8 quick questions) would narrow things down in one pass instead of more browsing.]"
      : "";

    const systemContent = SYSTEM_PROMPT + hint;

    const chatMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // No AI configured (missing/empty GEMINI_API_KEY) — degrade to keyword search instead of crashing.
    if (!client) {
      console.error("Compass.AI: GEMINI_API_KEY is not configured — using keyword search only.");
      const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";

      if (isComingSoonQuery(lastQuery)) {
        return NextResponse.json({
          text: "Water adventures are coming soon — we're planning dives and kayaking trips in the Andamans and Lakshadweep. Want to see what's live today instead?",
          recommendations: [],
          cards: [],
          suggestAce: shouldSuggestAce,
        });
      }

      const fallback = keywordSearch(lastQuery, 3);
      if (fallback.length > 0) {
        return NextResponse.json({
          text: "Here are some adventures that match what you're looking for.",
          recommendations: fallback.map((a) => ({ slug: a.slug, name: a.name, reason: fallbackReason(a, lastQuery) })),
          cards: fallback,
          suggestAce: shouldSuggestAce,
        });
      }
      return NextResponse.json({
        text: "Tell me a region, activity, or trip length and I'll pull up matching adventures.",
        recommendations: [],
        cards: [],
        suggestAce: shouldSuggestAce,
      });
    }

    let rawContent = "";

    try {
      const response = await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: chatMessages,
        temperature: 0.5,
        max_tokens: 500,
      });
      rawContent = response.choices[0].message.content ?? "";
    } catch (apiErr: unknown) {
      // Rate limit or API error — try a lighter model as fallback
      const isRateLimit = apiErr instanceof OpenAI.APIError && apiErr.status === 429;
      console.error("Compass.AI primary model error:", apiErr instanceof Error ? apiErr.message : apiErr, "isRateLimit:", isRateLimit);

      if (isRateLimit) {
        try {
          const fallbackResponse = await client.chat.completions.create({
            model: "gemini-2.5-flash-lite",
            messages: chatMessages,
            temperature: 0.5,
            max_tokens: 500,
          });
          rawContent = fallbackResponse.choices[0].message.content ?? "";
        } catch (liteErr: unknown) {
          console.error("Compass.AI lite model also failed:", liteErr instanceof Error ? liteErr.message : liteErr);
          // Both models failed — use keyword search only
          const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";
          const fallback = keywordSearch(lastQuery, 3);
          if (fallback.length > 0) {
            return NextResponse.json({
              text: "Here are some adventures that match what you're looking for.",
              recommendations: fallback.map((a) => ({ slug: a.slug, name: a.name, reason: fallbackReason(a, lastQuery) })),
              cards: fallback,
              suggestAce: shouldSuggestAce,
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
        throw apiErr;
      }
    }

    const suggestAce = /<suggest_ace\s*\/>/.test(rawContent) || shouldSuggestAce;
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
    return NextResponse.json({ error: "Compass.AI is unavailable right now" }, { status: 500 });
  }
}
