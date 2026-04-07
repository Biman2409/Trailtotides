import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { adventures } from "@/lib/data";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "placeholder",
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

const ADVENTURE_SUMMARY = adventures.map((a) => ({
  id: a.id,
  slug: a.slug,
  name: a.name,
  tagline: a.tagline,
  region: a.region,
  state: a.state,
  type: a.type,
  difficulty: a.difficulty,
  duration: a.duration,
  durationDays: a.durationDays,
  altitude: a.altitude,
  bestSeason: a.bestSeason,
  bestMonths: a.bestMonths,
  groupSize: a.groupSize,
  tags: a.tags,
  whoFor: a.whoFor,
  description: a.description.slice(0, 200),
}));

const SYSTEM_PROMPT = `You are an expert Indian adventure travel advisor for an adventure discovery platform.
You help users find the perfect adventure from the following list of adventures.

Available adventures (JSON):
${JSON.stringify(ADVENTURE_SUMMARY, null, 2)}

Your job:
1. Understand what the user is looking for (region, type, difficulty, season, duration, vibe, etc.)
2. Recommend 1–3 matching adventures from the list above
3. For each recommendation, respond with a JSON block AND a short human-readable explanation

ALWAYS respond in this exact format:
<recommendations>
[
  { "slug": "...", "name": "...", "reason": "one-sentence reason why this matches" },
  ...
]
</recommendations>

Then after the JSON block, write 1–2 sentences of conversational advice.

If nothing matches well, suggest the closest options and explain why.
Only recommend adventures from the provided list — never invent adventures.`;

// ── Keyword-based fallback matcher ────────────────────────────────────────────

const REGION_KEYWORDS: Record<string, string[]> = {
  himachal:   ["himachal", "himachali", "spiti", "manali", "kullu", "lahaul"],
  ladakh:     ["ladakh", "leh", "zanskar", "nubra"],
  uttarakhand:["uttarakhand", "garhwal", "kumaon", "kedarnath", "badrinath", "roopkund", "chopta"],
  kashmir:    ["kashmir", "jammu"],
  rajasthan:  ["rajasthan", "desert", "thar"],
  sikkim:     ["sikkim", "darjeeling", "sandakphu"],
  northeast:  ["northeast", "meghalaya", "assam", "arunachal", "nagaland"],
  goa:        ["goa", "coastal"],
  kerala:     ["kerala", "western ghats", "munnar"],
  andaman:    ["andaman", "island"],
};

const DIFFICULTY_KEYWORDS: Record<string, string[]> = {
  easy:       ["easy", "beginner", "simple", "gentle", "kids", "family", "first time", "starter"],
  moderate:   ["moderate", "intermediate", "medium"],
  hard:       ["hard", "difficult", "challenging", "tough", "expert", "advanced"],
};

const TYPE_KEYWORDS: Record<string, string[]> = {
  trek:       ["trek", "trekking", "hike", "hiking", "walk", "trail"],
  bike:       ["bike", "cycling", "bicycle", "motorcycle", "motorbike", "road trip"],
  water:      ["water", "kayak", "raft", "surf", "dive", "snorkel", "swim", "scuba"],
  climb:      ["climb", "climbing", "mountaineer", "summit", "peak", "ascent"],
  camp:       ["camp", "camping", "glamping", "overnight"],
  wildlife:   ["wildlife", "safari", "bird", "jungle", "forest"],
};

function fallbackMatch(userMessage: string): { slug: string; name: string; reason: string }[] {
  const msg = userMessage.toLowerCase();

  // Score each adventure
  const scored = adventures.map((a) => {
    let score = 0;

    // Region match
    for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
      if (keywords.some(k => msg.includes(k))) {
        const advRegion = (a.region ?? a.state ?? "").toLowerCase();
        const advState  = (a.state ?? "").toLowerCase();
        if (advRegion.includes(region) || advState.includes(region) ||
            keywords.some(k => advRegion.includes(k) || advState.includes(k))) {
          score += 4;
        }
      }
    }

    // Difficulty match
    for (const [diff, keywords] of Object.entries(DIFFICULTY_KEYWORDS)) {
      if (keywords.some(k => msg.includes(k))) {
        if ((a.difficulty ?? "").toLowerCase().startsWith(diff.slice(0, 4))) {
          score += 3;
        }
      }
    }

    // Type match
    for (const [, keywords] of Object.entries(TYPE_KEYWORDS)) {
      if (keywords.some(k => msg.includes(k))) {
        if (keywords.some(k => (a.type ?? "").toLowerCase().includes(k))) {
          score += 3;
        }
      }
    }

    // Duration match
    const daysMatch = msg.match(/(\d+)\s*day/);
    if (daysMatch) {
      const requestedDays = parseInt(daysMatch[1]);
      const adventureDays = a.durationDays ?? 0;
      if (Math.abs(adventureDays - requestedDays) <= 1) score += 2;
    }

    // Tag overlap
    const tags = (a.tags ?? []).join(" ").toLowerCase();
    const tagKeywords = ["beginner", "family", "solo", "group", "scenic", "adventure", "remote"];
    for (const tag of tagKeywords) {
      if (msg.includes(tag) && tags.includes(tag)) score += 1;
    }

    return { adv: a, score };
  });

  const top = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Fall back to first 3 if nothing matched
  const results = top.length > 0 ? top : scored.slice(0, 3);

  return results.map(({ adv, score }) => ({
    slug: adv.slug,
    name: adv.name,
    reason: score > 0
      ? `Matches your criteria for ${adv.type.toLowerCase()} in ${adv.state} (${adv.difficulty} difficulty)`
      : `A popular ${adv.type.toLowerCase()} experience in ${adv.state}`,
  }));
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })
    );

    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: anthropicMessages,
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      const recMatch = content.match(
        /<recommendations>([\s\S]*?)<\/recommendations>/
      );
      let recommendations: { slug: string; name: string; reason: string }[] = [];
      if (recMatch) {
        try {
          recommendations = JSON.parse(recMatch[1].trim());
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
    } catch {
      // AI API unavailable — use keyword-based fallback
      const lastUserMessage = messages
        .filter((m: { role: string }) => m.role === "user")
        .pop()?.content ?? "";

      const recommendations = fallbackMatch(lastUserMessage);
      const cards = recommendations
        .map((r) => adventures.find((a) => a.slug === r.slug))
        .filter(Boolean);

      const text = recommendations.length > 0
        ? "Here are some adventures that match what you're looking for. Browse the cards below to explore each one in detail."
        : "I found some great Indian adventures for you. Tap any card to learn more.";

      return NextResponse.json({ text, recommendations, cards });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
