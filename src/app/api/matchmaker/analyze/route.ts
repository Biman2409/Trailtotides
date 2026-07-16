import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { adventures } from "@/lib/data";
import { getACE } from "@/lib/ace";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// ─── System prompts verbatim from the 5 agent definitions ────────────────────

const CAPABILITY_MAPPER_PROMPT = `ROLE
You are the Biological Capability Mapper for an adventure matching platform.

Your task is to convert a user's questionnaire responses into an 8-axis capability map.

You must output a structured JSON object representing the user's biological capability.

AXES

1. Stamina
2. Power
3. Strength
4. Agility
5. Water
6. Altitude
7. Focus
8. Nerve

SCORING SCALE

A = 1
B = 2
C = 3
D = 4
E = 5

QUESTION MAPPING

Q1 → Stamina
Q2 → Power
Q3 → Strength
Q4 → Agility
Q5 → Water
Q6 → Altitude
Q7 → Focus
Q8 → Nerve

RULES

• Every axis must return a value from 1–5
• If an axis is not applicable return 0
• Do not explain reasoning
• Only return JSON
• Output must match schema exactly

OUTPUT SCHEMA

{
 "axes":{
  "stamina":0,
  "power":0,
  "strength":0,
  "agility":0,
  "water":0,
  "altitude":0,
  "focus":0,
  "nerve":0
 }
}`;

const BIOMECHANICS_ANALYST_PROMPT = `ROLE

You are an Adventure Biomechanics Analyst.

Your job is to analyze an outdoor adventure and determine the biological capability required to safely complete it.

You must evaluate the adventure across 8 biological axes.

AXES

Stamina
Power
Strength
Agility
Water
Altitude
Focus
Nerve

SCORING SCALE

0 = not relevant
1 = very low demand
2 = low demand
3 = moderate demand
4 = high demand
5 = extreme demand

EVALUATION PRINCIPLES

Stamina → sustained effort duration
Power → short burst exertion
Strength → load bearing or body force
Agility → balance, terrain navigation
Water → swimming or aquatic survival
Altitude → hypoxic exposure
Focus → panic control and fear tolerance
Nerve → self-reliance in remote, no-support terrain

RISK LEVEL SCALE

1 = Urban / Commercial
2 = Rural
3 = Wilderness
4 = Severe Isolation
5 = The Void (self-rescue required)

CERTIFICATION KEYS

Moto_License
BMC_AMC
PADI_OpenWater
Swiftwater_Rescue
Paragliding_P3
Ski_Backcountry
WFR

RULES

• Score all 8 axes
• Assign a risk level
• Identify required certification keys
• Only output JSON
• No explanation text

OUTPUT SCHEMA

{
 "axes":{
  "stamina":0,
  "power":0,
  "strength":0,
  "agility":0,
  "water":0,
  "altitude":0,
  "focus":0,
  "nerve":0
 },
 "risk_level":0,
 "required_keys":[]
}`;

const MATCHMAKER_ENGINE_PROMPT = `ROLE

You are the Adventure Matchmaker Engine.

Your task is to determine if a user can safely perform an adventure.

You compare the user's capability map with the adventure requirement map.

INPUTS

User axes
Adventure axes
Adventure required keys
User keys

MATCHING RULES

STEP 1

If any required key is missing

status = RESTRICTED

STEP 2

Compare biological axes.

If user axis >= adventure axis for all axes

status = IN_ZONE

STEP 3

If adventure axis exceeds user axis by exactly 1 on up to two axes

status = STRETCH

STEP 4

If adventure axis exceeds user axis by 2 or more on any axis

status = RESTRICTED

OUTPUT DEFINITIONS

IN_ZONE
User safely exceeds requirements.

STRETCH
User is slightly below requirement.

RESTRICTED
User lacks capability or certification.

RULES

• Always list axes where the user is weaker
• Always list missing certification keys
• Output JSON only

OUTPUT SCHEMA

{
 "status":"",
 "weak_axes":[],
 "missing_keys":[],
 "analysis":""
}`;

const TRAINING_COACH_PROMPT = `ROLE

You are an Adventure Training Coach.

Your task is to recommend how a user can unlock an adventure they currently cannot perform.

INPUT

User capability map
Adventure requirement map
Weak axes

TASK

For each weak axis:

1 Identify current level
2 Identify required level
3 Recommend a training action

TRAINING RULES

Stamina → cardio training
Power → interval training
Strength → load bearing strength
Agility → balance and coordination
Water → swimming drills
Altitude → progressive altitude exposure
Focus → exposure training
Nerve → remote self-reliance and resilience drills

OUTPUT RULES

• Return only JSON
• Provide actionable training advice
• Only include axes that require improvement

OUTPUT SCHEMA

{
 "training_plan":[
  {
   "axis":"",
   "current_level":0,
   "required_level":0,
   "recommendation":""
  }
 ]
}`;

// ─── Helper: call Claude and parse JSON ───────────────────────────────────────

async function callClaude(system: string, userMessage: string): Promise<unknown> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "{}";
  // Strip markdown code fences if present
  const clean = text.replace(/```(?:json)?\n?/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Try to extract JSON array or object from the response
    const arrMatch = clean.match(/\[[\s\S]*\]/);
    const objMatch = clean.match(/\{[\s\S]*\}/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error(`Failed to parse Claude response: ${clean.slice(0, 200)}`);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export const maxDuration = 60; // seconds (Vercel/Next.js edge or serverless)

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(`matchmaker:${getClientIp(req)}`, 10, 5 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const { answers, userKeys = [] } = await req.json();
    // answers: { Q1: "A"|"B"|"C"|"D"|"E", ..., Q8: "..." }

    // ── Step 1: Map answers → user capability axes ───────────────────────────
    const userAxes = await callClaude(
      CAPABILITY_MAPPER_PROMPT,
      `User answers: ${JSON.stringify(answers)}`
    ) as { axes: Record<string, number> };

    // ── Step 2: Analyse each adventure's bio requirements ────────────────────
    const adventureSummaries = adventures.map((a) => ({
      slug: a.slug,
      name: a.name,
      type: a.type,
      difficulty: a.difficulty,
      altitude: a.altitude ?? null,
      depth: a.depth ?? null,
      tags: a.tags,
      whoFor: a.whoFor,
      whoNot: a.whoNot,
    }));

    // Analyse all adventures in one call for efficiency
    const bioRequirements = await callClaude(
      BIOMECHANICS_ANALYST_PROMPT,
      `Analyse each adventure and return a JSON array of objects. Each object must have "slug" and the full output schema fields.

Adventures:
${JSON.stringify(adventureSummaries, null, 2)}

Return a JSON array: [{ "slug": "...", "axes": {...}, "risk_level": 0, "required_keys": [] }, ...]`
    ) as Array<{ slug: string; axes: Record<string, number>; risk_level: number; required_keys: string[] }>;

    // Build a map from slug → requirements
    const reqMap = new Map(
      (Array.isArray(bioRequirements) ? bioRequirements : []).map((r) => [r.slug, r])
    );

    // ── Step 3: Match user against each adventure ─────────────────────────────
    const matchResults = await callClaude(
      MATCHMAKER_ENGINE_PROMPT,
      `User capability axes: ${JSON.stringify(userAxes.axes)}
User certification keys: ${JSON.stringify(userKeys)}

Match the user against each adventure below. Return a JSON array with one object per adventure, adding "slug" to each output schema object.

Adventures and their requirements:
${JSON.stringify(
  adventures.map((a) => ({
    slug: a.slug,
    name: a.name,
    requirements: reqMap.get(a.slug) ?? null,
  })),
  null,
  2
)}

Return: [{ "slug": "...", "status": "IN_ZONE"|"STRETCH"|"RESTRICTED", "weak_axes": [], "missing_keys": [], "analysis": "" }, ...]`
    ) as Array<{ slug: string; status: string; weak_axes: string[]; missing_keys: string[]; analysis: string }>;

    const matchMap = new Map(
      (Array.isArray(matchResults) ? matchResults : []).map((r) => [r.slug, r])
    );

    // ── Step 4: Build training plan for weak axes (aggregated across all STRETCH/RESTRICTED) ──
    const allWeakAxes = new Set<string>();
    const highestReqPerAxis: Record<string, number> = {};

    for (const m of (Array.isArray(matchResults) ? matchResults : [])) {
      if (m.status !== "IN_ZONE") {
        for (const ax of m.weak_axes) {
          allWeakAxes.add(ax);
          const req = reqMap.get(m.slug);
          if (req?.axes[ax]) {
            highestReqPerAxis[ax] = Math.max(highestReqPerAxis[ax] ?? 0, req.axes[ax]);
          }
        }
      }
    }

    let trainingPlan: { training_plan: Array<{ axis: string; current_level: number; required_level: number; recommendation: string }> } = { training_plan: [] };

    if (allWeakAxes.size > 0) {
      trainingPlan = await callClaude(
        TRAINING_COACH_PROMPT,
        `User capability map: ${JSON.stringify(userAxes.axes)}

Weak axes with highest required levels:
${JSON.stringify(
  Array.from(allWeakAxes).map((ax) => ({
    axis: ax,
    current_level: userAxes.axes[ax] ?? 0,
    required_level: highestReqPerAxis[ax] ?? 0,
  }))
)}`
      ) as typeof trainingPlan;
    }

    // ── Step 5: Assemble final response ───────────────────────────────────────
    const enrichedAdventures = adventures.map((a) => {
      const match = matchMap.get(a.slug);
      const req = reqMap.get(a.slug);
      const ace = getACE(a);
      return {
        id: a.id,
        slug: a.slug,
        name: a.name,
        heroImage: a.heroImage,
        state: a.state,
        region: a.region,
        type: a.type,
        difficulty: a.difficulty,
        altitude: a.altitude,
        ace,
        status: match?.status ?? "RESTRICTED",
        weakAxes: match?.weak_axes ?? [],
        missingKeys: match?.missing_keys ?? [],
        analysis: match?.analysis ?? "",
        requirements: req?.axes ?? null,
        riskLevel: req?.risk_level ?? null,
      };
    });

    return NextResponse.json({
      userAxes: userAxes.axes,
      adventures: enrichedAdventures,
      trainingPlan: trainingPlan.training_plan,
    });
  } catch (err) {
    console.error("matchmaker analyze error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
