import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { adventures } from "@/lib/data";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

## Your adventure catalog (JSON):
${ADVENTURE_LIST_STR}

## How to respond:

**For clear requests** (place / activity / difficulty / duration / season specified):
- Write 1–3 natural sentences responding to the user (e.g. "Great choice! Ladakh in summer is epic for biking...").
- Then embed a JSON recommendations block at the END of your message, like this:
<recommendations>[{"slug":"exact-slug","name":"Exact Name","reason":"one concise sentence why this fits them"}]</recommendations>
- Pick 1–3 adventures that best match. Use ONLY exact slugs from the catalog above.

**For vague or open-ended requests** (e.g. "something adventurous", "I want a trip", "recommend anything"):
- Ask ONE focused follow-up question to narrow it down. Examples: "Are you looking for a trek, a bike ride, or something else?" / "Do you prefer mountains or coast?" / "How many days do you have?"
- Do NOT embed recommendations yet.

**For follow-ups and refinements** (e.g. "something easier", "closer to Delhi", "I prefer shorter"):
- Acknowledge the refinement naturally, then give new recommendations.
- Reference what they said before: "Since you want something easier than Hampta Pass..."

**For ACE suggestion** — suggest the ACE assessment when ANY of these apply:
- User has been going back and forth (3+ exchanges) without finding something they like.
- User expresses confusion about their fitness/capability: "not sure if I can", "don't know if I'm fit enough", "what level am I?", "am I ready for", "too hard?", "too easy?".
- User is genuinely overwhelmed by choices after 2+ rounds: "I don't know", "hard to decide", "there are too many", "can't choose".
- User asks what adventure suits their profile/fitness/experience level.
When suggesting ACE: include <suggest_ace/> in your message AND write 1–2 warm sentences explaining what ACE is and why it'll help. You CAN still include recommendations alongside ACE — give both if you have a decent guess.

## Rules:
- Use ONLY slugs from the catalog. Never invent slugs.
- Keep your text conversational and under 3 sentences before the recommendations block.
- Don't repeat adventures already recommended in this conversation unless the user asks.
- Don't say "I" awkwardly — you're Compass, speak naturally.
- Never break character. You only know about adventures on Trail to Tides.
- If nothing fits: say so honestly and ask a clarifying question. Never recommend adventures that don't match.`;

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

// Strip XML tags from text for display
function cleanText(content: string): string {
  return content
    .replace(/<recommendations>[\s\S]*?<\/recommendations>/g, "")
    .replace(/<suggest_ace\s*\/>/g, "")
    .trim();
}

// Keyword-based fallback search across all adventure fields
function keywordSearch(query: string, limit = 3) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const synonyms: Record<string, string[]> = {
    beginner: ["beginner-friendly", "Easy", "Moderate"],
    easy: ["beginner-friendly", "Easy", "Moderate"],
    hard: ["Hard", "Advanced", "Extreme"],
    difficult: ["Hard", "Advanced"],
    challenging: ["Hard", "Advanced"],
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
    snow: ["glacier", "winter", "skiing"],
    skiing: ["Skiing"],
    paragliding: ["Paragliding"],
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

// Generate contextual reason for fallback results
function fallbackReason(adventure: typeof adventures[0], query: string): string {
  const q = query.toLowerCase();
  if (q.includes(adventure.state.toLowerCase())) return `Located in ${adventure.state}, which matches your search.`;
  if (q.includes(adventure.type.toLowerCase())) return `A popular ${adventure.type} adventure matching your interests.`;
  if (adventure.difficulty === "Easy" || adventure.difficulty === "Moderate") return `Great for those new to ${adventure.type.toLowerCase()}.`;
  return `One of the top-rated ${adventure.type} adventures in India.`;
}

// Detect indecision signals in the latest user messages
function detectIndecision(messages: { role: string; content: string }[]): boolean {
  const userMessages = messages.filter((m) => m.role === "user");
  const roundCount = userMessages.length;

  // After 3+ exchanges, check for indecision language
  if (roundCount >= 3) {
    const recentText = userMessages
      .slice(-3)
      .map((m) => m.content.toLowerCase())
      .join(" ");

    const indecisionSignals = [
      "don't know", "not sure", "no idea", "can't decide", "hard to choose",
      "help me decide", "don't mind", "anything", "whatever", "too many",
      "overwhelmed", "confused", "lost", "don't understand", "am i ready",
      "fit enough", "what level", "my fitness", "my capability", "not fit",
      "never done", "first time", "complete beginner", "total beginner",
      "which one", "so many options", "hard to decide", "can't choose",
    ];

    const matchCount = indecisionSignals.filter((s) => recentText.includes(s)).length;
    if (matchCount >= 1) return true;
  }

  // Always nudge ACE after 4+ rounds regardless (user is clearly browsing/undecided)
  if (roundCount >= 4) return true;

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Detect indecision before calling the model
    const serverDetectedIndecision = detectIndecision(messages);

    // Build proper multi-turn messages array for Groq
    // If server detected indecision, append a hint to the system message
    const systemContent = serverDetectedIndecision
      ? SYSTEM_PROMPT + "\n\n[HINT: The user has been going back and forth for a while or seems indecisive. Include <suggest_ace/> in your response alongside any recommendations you make.]"
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

    // Check if model wants ACE assessment (model decision OR server-detected indecision)
    const suggestAce = /<suggest_ace\s*\/>/.test(rawContent) || serverDetectedIndecision;

    // Parse recommendations
    const recommendations = parseRecommendations(rawContent);
    const cards = recommendations
      .map((r) => adventures.find((a) => a.slug === r.slug))
      .filter(Boolean);

    // Clean text for display (strip XML tags)
    let text = cleanText(rawContent);

    // If model gave no text but gave recommendations, generate a brief summary
    if (!text && recommendations.length > 0) {
      const names = recommendations.map((r) => r.name);
      if (names.length === 1) text = `Here's a great pick for you — ${names[0]}.`;
      else text = `Here are ${names.length} adventures that match what you're looking for.`;
    }

    // If model returned valid recommendations, we're done
    if (cards.length > 0) {
      return NextResponse.json({
        text,
        recommendations,
        cards,
        suggestAce,
      });
    }

    // Model gave no valid cards — try keyword fallback
    const lastQuery = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";
    const fallback = keywordSearch(lastQuery);

    if (fallback.length > 0) {
      const fallbackRecs = fallback.map((a) => ({
        slug: a.slug,
        name: a.name,
        reason: fallbackReason(a, lastQuery),
      }));

      // Keep model's conversational text if it had something, otherwise generic
      const fallbackText = text || `Here are some adventures that might match what you're looking for.`;

      return NextResponse.json({
        text: fallbackText,
        recommendations: fallbackRecs,
        cards: fallback,
        suggestAce,
      });
    }

    // Nothing found at all
    return NextResponse.json({
      text: text || "I couldn't find a perfect match in our current listings. Could you tell me more — what region or type of adventure interests you?",
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
