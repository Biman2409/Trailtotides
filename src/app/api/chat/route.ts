import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adventures } from "@/lib/data";
import type { AdventureType } from "@/lib/data";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getACE, computeDifficulty, computeMatchScore, type ACE } from "@/lib/ace";
import { stripEmphasis } from "@/lib/emphasis";

// Gemini's free tier via its OpenAI-compatible endpoint — no billing required.
// https://ai.google.dev/gemini-api/docs/openai
// COMPASS_AI=off (in Vercel) runs Compass on the keyword engine alone: instant answers, no AI key
const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.COMPASS_AI !== "off";
const client = hasGeminiKey
  ? new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      // A stuck model mustn't freeze the chat. The models run side by side, so this is the
      // longest anyone waits before the keyword search answers instead
      timeout: 25_000,
      maxRetries: 0,
    })
  : null;

// Tried in order. The lite models answer in a few seconds on the free tier (the full Flash
// ones can hang for minutes); the "latest" alias follows Google's newest lite model, so the
// chat keeps working when they retire one, as they did gemini-2.5-flash for new keys.
// GEMINI_MODEL (set in Vercel) swaps the first one without a code change.
const GEMINI_MODELS = [...new Set([process.env.GEMINI_MODEL || "gemini-3.5-flash-lite", "gemini-flash-lite-latest"])];

// Room for the slow free-tier models, so the platform never cuts the function off first
export const maxDuration = 60;

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
  difficulty: computeDifficulty(getACE(a)), // same rating the site shows, not the raw data field
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
→ Include <suggest_ace/> + 1 sentence pointing them to the Adventure Matchmaker — a short fitness check (a 2-minute quick match, or about 3 minutes for the full version) that rates every adventure for their body, faster than browsing back and forth with you.
→ Still give recommendations if you can make a reasonable guess.

**Third+ round of recommendations without the user committing:**
→ Include <suggest_ace/> and note the Adventure Matchmaker will narrow it down in one pass instead of more back-and-forth.

## Hard rules:
- ONLY use slugs from the catalog above. Never invent slugs.
- Difficulty is the catalog's "difficulty" field (Easy, Moderate, Hard, Advanced, Extreme) and nothing else. Never call an adventure easier or harder than that field says.
- When the user asks for a difficulty ("moderate", "easy", "challenging"…), recommend ONLY adventures whose "difficulty" field is that level. If none fit the rest of the request, say so and offer the nearest level, naming it.
- Never recommend a coming-soon type — say it's coming soon instead.
- Keep text responses concise (1–3 sentences max before any recommendations).
- Don't say "I" awkwardly. Speak as Compass.AI, not a generic bot.
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
      a.name, computeDifficulty(getACE(a)), ...(a.tags ?? []), a.tagline ?? "", stripEmphasis(a.description ?? ""), a.bestSeason ?? "",
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

// ─── Fitness-aware matching ───────────────────────────────────────────────────
// The client sends the visitor's Matchmaker profile (8 levels, 1–5) with each message, so
// recommendations respect what their body can actually handle.

const ACE_KEYS = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"] as const;

function parseAce(raw: unknown): ACE | null {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, number> = {};
  for (const k of ACE_KEYS) {
    const v = Number((raw as Record<string, unknown>)[k]);
    if (!Number.isFinite(v) || v < 0 || v > 5) return null;
    out[k] = v;
  }
  return out as unknown as ACE;
}

const LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };
const BEGINNER_WORDS = /\b(beginner|beginners|easy|first[- ]?time|first trek|gentle|newbie|novice|not too hard|family)\b/i;

const ratingOf = (slug: string) => {
  const a = adventures.find((x) => x.slug === slug);
  return a ? computeDifficulty(getACE(a)) : null;
};

/**
 * The difficulty levels the visitor asked for, in the site's own ratings, or null if they didn't
 * ask. The model is told to respect the catalog's rating but doesn't always; this is enforced.
 */
function requestedDifficulty(query: string): string[] | null {
  const q = query.toLowerCase().replace(/\bnot (too |that |very )?(hard|difficult|tough)\b/g, " gentle ");
  const want = new Set<string>();
  if (/\bextreme\b/.test(q)) want.add("Extreme");
  if (/\b(advanced|expert)\b/.test(q)) want.add("Advanced");
  if (/\b(hard|difficult|challenging|tough|strenuous)\b/.test(q)) want.add("Hard");
  if (/\b(moderate|medium|intermediate)\b/.test(q)) want.add("Moderate");
  if (/\beasy\b/.test(q)) want.add("Easy");
  if (/\b(beginners?|first[- ]?time|first trek|gentle|newbie|novice|family)\b/.test(q)) { want.add("Easy"); want.add("Moderate"); }
  return want.size ? [...want] : null;
}

// The activity and place a visitor names are hard limits when topping up picks: a "moderate trek
// in Uttarakhand" must never become a rafting trip just because rafting there is Moderate
const TYPE_WORDS: [RegExp, string][] = [
  [/\b(trek|treks|trekking|hike|hikes|hiking)\b/, "Trekking"],
  [/\b(motorbike|motorcycle|motorcycling|bike trip|bike ride|biking|ride|riding)\b/, "Motorcycling"],
  [/\b(cycle|cycling|bicycle)\b/, "Cycling"],
  [/\b(raft|rafting)\b/, "River Rafting"],
  [/\b(mountaineering|summit|expedition|peak)\b/, "Mountaineering"],
];
const PLACE_WORDS: [RegExp, string][] = [
  [/\b(kashmir|jammu|srinagar|sonamarg)\b/, "Jammu & Kashmir"],
  [/\b(himachal|manali|spiti|kullu|kinnaur|parvati)\b/, "Himachal"],
  [/\b(uttarakhand|garhwal|kumaon|rishikesh|dehradun)\b/, "Uttarakhand"],
  [/\b(ladakh|leh|zanskar)\b/, "Ladakh"],
  [/\b(sikkim|gangtok)\b/, "Sikkim"],
  [/\b(darjeeling|west bengal|bengal)\b/, "West Bengal"],
  [/\b(nepal|everest|annapurna)\b/, "Nepal"],
];

function requestLimits(query: string) {
  const q = query.toLowerCase();
  return {
    types: TYPE_WORDS.filter(([re]) => re.test(q)).map(([, t]) => t),
    places: PLACE_WORDS.filter(([re]) => re.test(q)).map(([, p]) => p),
  };
}

/**
 * Adventures at the wanted levels within the activity and place asked for, best keyword match
 * first. When nothing at those levels fits, the nearest level that does (and which one it was).
 */
function pickByDifficulty(query: string, wanted: string[], exclude: Set<string>, limit: number) {
  const { types, places } = requestLimits(query);
  const fits = (a: typeof adventures[0]) =>
    !exclude.has(a.slug) &&
    (types.length === 0 || types.includes(a.type)) &&
    (places.length === 0 || places.some((p) => a.state.includes(p)));
  const ranked = keywordSearch(query, adventures.length);
  const pool = [...ranked, ...adventures.filter((a) => !ranked.includes(a))].filter(fits);
  const exact = pool.filter((a) => wanted.includes(computeDifficulty(getACE(a))));
  if (exact.length > 0) return { picks: exact.slice(0, limit), nearest: null as string | null };
  if (pool.length === 0) return { picks: [], nearest: null as string | null };
  const gap = (a: typeof adventures[0]) => Math.min(...wanted.map((w) => Math.abs(LEVEL[computeDifficulty(getACE(a))] - LEVEL[w])));
  const best = Math.min(...pool.map(gap));
  const nearest = pool.filter((a) => gap(a) === best);
  return { picks: nearest.slice(0, limit), nearest: computeDifficulty(getACE(nearest[0])) };
}

/** A factual one-liner from the site's own data, for picks the model got wrong or didn't explain. */
function factualReason(a: typeof adventures[0]): string {
  return `${computeDifficulty(getACE(a))} ${a.type.toLowerCase()} in ${a.state}, ${a.durationDays}${a.bestSeason ? `. Best ${a.bestSeason}` : ""}.`;
}

const DIFFICULTY_WORD = /\b(easy|moderate|hard|advanced|extreme|gentle|beginner[- ]friendly|challenging|tough|strenuous)\b/gi;
const WORD_LEVEL: Record<string, string> = {
  easy: "Easy", gentle: "Easy", "beginner-friendly": "Easy", "beginner friendly": "Easy", moderate: "Moderate",
  hard: "Hard", challenging: "Hard", tough: "Hard", strenuous: "Hard", advanced: "Advanced", extreme: "Extreme",
};

/** True when a reason describes the adventure at a different level than the site rates it. */
function misstatesDifficulty(reason: string, slug: string): boolean {
  const rating = ratingOf(slug);
  const said = [...reason.matchAll(DIFFICULTY_WORD)].map((m) => WORD_LEVEL[m[0].toLowerCase()]).filter(Boolean);
  return !!rating && said.length > 0 && !said.includes(rating);
}

/** Tells the model which adventures this person is ready for, so it stops suggesting ones they aren't. */
function fitnessHint(ace: ACE | null): string {
  if (!ace) return "";
  const groups = { ready: [] as string[], stretch: [] as string[], notYet: [] as string[] };
  for (const a of adventures) {
    const s = computeMatchScore(ace, getACE(a));
    (s >= 80 ? groups.ready : s >= 55 ? groups.stretch : groups.notYet).push(a.slug);
  }
  return `\n\n## This user's fitness (from the Adventure Matchmaker)
Levels 1–5: ${ACE_KEYS.map((k) => `${k} ${ace[k]}`).join(", ")}.
READY for: ${groups.ready.join(", ") || "none"}
STRETCH (possible with preparation): ${groups.stretch.join(", ") || "none"}
NOT YET (beyond them today): ${groups.notYet.join(", ") || "none"}
Rules: recommend READY adventures first. Only suggest a STRETCH one if it fits the request especially well, and say it will need preparation. Never recommend a NOT YET adventure unless they explicitly ask for it by name — then say plainly it's beyond their current fitness. You don't need to mention the Matchmaker; they've already taken it.`;
}

/** Keyword fallback, made safe: respects "beginner" wording and the user's fitness when known. */
function pickFallback(query: string, ace: ACE | null, limit = 3) {
  const wanted = requestedDifficulty(query);
  let list = wanted ? pickByDifficulty(query, wanted, new Set(), 15).picks : keywordSearch(query, 15);
  if (BEGINNER_WORDS.test(query)) {
    const gentle = list.filter((a) => LEVEL[computeDifficulty(getACE(a))] <= 2);
    list = gentle.length > 0 ? gentle : list.filter((a) => LEVEL[computeDifficulty(getACE(a))] <= 3);
  }
  if (ace) {
    const scored = list.map((a) => ({ a, s: computeMatchScore(ace, getACE(a)) }));
    const fitting = scored.filter((x) => x.s >= 55);
    list = (fitting.length > 0 ? fitting : scored).sort((x, y) => y.s - x.s).map((x) => x.a);
  }
  return list.slice(0, limit);
}

function fallbackReason(adventure: typeof adventures[0], query: string, ace: ACE | null = null): string {
  if (ace) {
    const s = computeMatchScore(ace, getACE(adventure));
    if (s >= 80) return `A strong fit for your fitness — ${s}% match.`;
    if (s >= 55) return `A stretch for you (${s}% match) — doable with some preparation.`;
  }
  const q = query.toLowerCase();
  if (q.includes(adventure.state.toLowerCase())) return `Located in ${adventure.state}, matching your region preference.`;
  if (q.includes(adventure.type.toLowerCase())) return `A well-rated ${adventure.type} adventure in India.`;
  if (LEVEL[computeDifficulty(getACE(adventure))] <= 2) return `Accessible for most fitness levels — a great starting point.`;
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
  // Rafting is live, even when asked as "white water rafting"
  if (q.includes("raft")) return false;
  return COMING_SOON_TYPES.some((t) => q.includes(t.toLowerCase())) ||
    ["scuba", "dive", "diving", "paraglide", "paragliding", "balloon", "hot air",
      "ice skate", "ice skating", "scramble", "scrambling",
      "water", "coastal", "ocean", "beach", "surf", "surfing", "snorkel",
      "kayak", "kayaking"].some((w) => q.includes(w));
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
    const { messages, recommendationRounds, ace: rawAce } = await req.json();
    const userAce = parseAce(rawAce);
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
      ? "\n\n[HINT: You've already shown this user recommendations 2+ times this conversation without them settling on one. Include <suggest_ace/> and briefly note that the Adventure Matchmaker (a 2-minute quick match) would narrow things down in one pass instead of more browsing.]"
      : "";

    const systemContent = SYSTEM_PROMPT + hint + fitnessHint(userAce);

    const chatMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // No AI configured (missing/empty GEMINI_API_KEY) — degrade to keyword search instead of crashing.
    if (!client) {
      if (process.env.COMPASS_AI !== "off") console.error("Compass.AI: GEMINI_API_KEY is not configured — using keyword search only.");
      const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";

      if (isComingSoonQuery(lastQuery)) {
        return NextResponse.json({
          text: "Water adventures are coming soon — we're planning dives and kayaking trips in the Andamans and Lakshadweep. Want to see what's live today instead?",
          recommendations: [],
          cards: [],
          suggestAce: shouldSuggestAce,
        });
      }

      const fallback = pickFallback(lastQuery, userAce);
      if (fallback.length > 0) {
        return NextResponse.json({
          text: "Here are some adventures that match what you're looking for.",
          recommendations: fallback.map((a) => ({ slug: a.slug, name: a.name, reason: fallbackReason(a, lastQuery, userAce) })),
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

    // Every model at once, first answer wins. The free tier takes 15–25 s per answer, so asking
    // them one after another left people waiting 40 s for a fallback. Any failure (limit, bad
    // key, retired model) just drops out; if all fail the keyword search answers.
    let rateLimited = false;
    const ask = (model: string) =>
      client.chat.completions.create({ model, messages: chatMessages, temperature: 0.5, max_tokens: 500 })
        .then((r) => {
          const text = r.choices[0]?.message.content ?? "";
          if (!text) throw new Error("empty reply");
          return text;
        })
        .catch((apiErr: unknown) => {
          rateLimited ||= apiErr instanceof OpenAI.APIError && apiErr.status === 429;
          console.error(`Compass.AI: ${model} failed —`, apiErr instanceof OpenAI.APIError ? `${apiErr.status} ${apiErr.message}` : apiErr);
          throw apiErr;
        });
    const rawContent = await Promise.any(GEMINI_MODELS.map(ask)).catch(() => "");

    if (!rawContent) {
      const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";
      const fallback = pickFallback(lastQuery, userAce);
      if (fallback.length > 0) {
        return NextResponse.json({
          text: "Here are some adventures that match what you're looking for.",
          recommendations: fallback.map((a) => ({ slug: a.slug, name: a.name, reason: fallbackReason(a, lastQuery, userAce) })),
          cards: fallback,
          suggestAce: shouldSuggestAce,
        });
      }
      return NextResponse.json(rateLimited
        ? { rateLimited: true, text: "", recommendations: [], cards: [], suggestAce: false }
        : { text: "Tell me a region, activity, or trip length and I'll pull up matching adventures.", recommendations: [], cards: [], suggestAce: shouldSuggestAce });
    }

    const suggestAce = /<suggest_ace\s*\/>/.test(rawContent) || shouldSuggestAce;
    let recommendations = parseRecommendations(rawContent);

    // Hold the model to the site's difficulty ratings: drop picks at a level the visitor didn't
    // ask for (topping up from the catalog), and replace reasons that misstate a rating
    const askedQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";
    const askedFor = requestedDifficulty(askedQuery);
    let replacedPicks = false;
    let nearestNote = "";
    if (askedFor && recommendations.length > 0) {
      const kept = recommendations.filter((r) => askedFor.includes(ratingOf(r.slug) ?? ""));
      if (kept.length < recommendations.length) {
        replacedPicks = true;
        const { picks, nearest } = pickByDifficulty(askedQuery, askedFor, new Set(kept.map((r) => r.slug)), recommendations.length - kept.length);
        // Nothing at the asked level: show the nearest level only if nothing else was kept, and say so
        const extra = nearest && kept.length > 0 ? [] : picks;
        if (nearest && kept.length === 0 && extra.length > 0) {
          const { types, places } = requestLimits(askedQuery);
          const what = types.length === 1 ? { Trekking: "treks", Motorcycling: "bike trips", Cycling: "cycling trips", "River Rafting": "rafting trips", Mountaineering: "climbs" }[types[0]] ?? "adventures" : "adventures";
          const where = places.length === 1 ? ` in ${places[0]}` : "";
          nearestNote = `There are no ${askedFor.join(" or ").toLowerCase()} ${what}${where} on Trail to Tides yet. The closest are rated ${nearest}:`;
        }
        recommendations = [...kept, ...extra.map((a) => ({ slug: a.slug, name: a.name, reason: factualReason(a) }))];
      }
    }
    recommendations = recommendations.map((r) => {
      const a = adventures.find((x) => x.slug === r.slug)!;
      return !r.reason || misstatesDifficulty(r.reason, r.slug) ? { ...r, name: a.name, reason: factualReason(a) } : r;
    });
    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    // The model's sentence may name or describe a pick that was swapped out
    let text = replacedPicks ? nearestNote : cleanText(rawContent);

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
      const fallback = pickFallback(lastQuery, userAce);
      if (fallback.length > 0) {
        return NextResponse.json({
          text: text || "Here are some adventures that might match.",
          recommendations: fallback.map((a) => ({ slug: a.slug, name: a.name, reason: fallbackReason(a, lastQuery, userAce) })),
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
