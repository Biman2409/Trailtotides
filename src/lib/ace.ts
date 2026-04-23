import type { Adventure, ACEAxes } from "./data";

// ─── Supplement system ────────────────────────────────────────────────────────

/** Hard gate: blocks the adventure entirely if the user fails */
export interface HardGate {
  key: string;           // e.g. "ear_equalise"
  question: string;
  failAnswer: string;    // the answer that triggers the gate
  failReason: string;    // shown to user
}

/** Soft modifier: adjusts match score if user answers */
export interface SoftModifier {
  key: string;
  question: string;
  options: { value: string; score: number; label: string }[]; // score 0–1 multiplier
}

export interface AdventureTypeSupplements {
  hardGates: HardGate[];
  softModifiers: SoftModifier[];
}

/** Supplement questions keyed by adventure type */
export const TYPE_SUPPLEMENTS: Partial<Record<string, AdventureTypeSupplements>> = {
  Diving: {
    hardGates: [
      {
        key: "ear_equalise",
        question: "Can you equalize ear pressure comfortably (e.g. Valsalva maneuver)?",
        failAnswer: "no",
        failReason: "Ear equalization is required for safe diving. Unable to recommend without this.",
      },
      {
        key: "respiratory",
        question: "Do you have any active respiratory conditions (asthma, recent chest surgery, pneumothorax)?",
        failAnswer: "yes",
        failReason: "Active respiratory conditions are a hard contraindication for scuba diving.",
      },
    ],
    softModifiers: [
      {
        key: "dive_cert",
        question: "What is your highest dive certification?",
        options: [
          { value: "none",       score: 0.4, label: "No certification (beginner dives only)" },
          { value: "ow",         score: 0.7, label: "PADI Open Water or equivalent" },
          { value: "advanced",   score: 0.9, label: "Advanced Open Water" },
          { value: "rescue",     score: 1.0, label: "Rescue Diver / Divemaster+" },
        ],
      },
      {
        key: "max_depth",
        question: "What is the deepest you have dived?",
        options: [
          { value: "never",  score: 0.3, label: "Never dived" },
          { value: "lt10",   score: 0.5, label: "Less than 10m" },
          { value: "10_20",  score: 0.7, label: "10–20m" },
          { value: "20_30",  score: 0.9, label: "20–30m" },
          { value: "30plus", score: 1.0, label: "30m+" },
        ],
      },
    ],
  },

  Snorkelling: {
    hardGates: [],
    softModifiers: [
      {
        key: "open_water_comfort",
        question: "How comfortable are you swimming in open sea (waves, depth, current)?",
        options: [
          { value: "not",        score: 0.3, label: "Not comfortable" },
          { value: "some",       score: 0.6, label: "Some experience" },
          { value: "confident",  score: 1.0, label: "Very confident" },
        ],
      },
    ],
  },

  Kayaking: {
    hardGates: [
      {
        key: "wet_exit",
        question: "Can you perform a wet exit and self-rescue in moving water?",
        failAnswer: "no",
        failReason: "Wet exit self-rescue is required for Grade III+ kayaking.",
      },
    ],
    softModifiers: [
      {
        key: "river_grade",
        question: "What is the highest river grade you have paddled?",
        options: [
          { value: "none",    score: 0.2, label: "No river experience" },
          { value: "i_ii",    score: 0.5, label: "Grade I–II (easy/moving water)" },
          { value: "iii",     score: 0.75, label: "Grade III (moderate rapids)" },
          { value: "iv",      score: 0.9, label: "Grade IV (advanced)" },
          { value: "v",       score: 1.0, label: "Grade V (expert)" },
        ],
      },
    ],
  },

  "River Rafting": {
    hardGates: [],
    softModifiers: [
      {
        key: "river_grade",
        question: "What is the highest river grade you have rafted or paddled?",
        options: [
          { value: "none",    score: 0.3, label: "No river experience" },
          { value: "i_ii",    score: 0.55, label: "Grade I–II" },
          { value: "iii",     score: 0.75, label: "Grade III" },
          { value: "iv",      score: 0.9, label: "Grade IV" },
          { value: "v",       score: 1.0, label: "Grade V" },
        ],
      },
    ],
  },

  "Rock Climbing": {
    hardGates: [],
    softModifiers: [
      {
        key: "belay",
        question: "What is your belay and lead climbing experience?",
        options: [
          { value: "none",        score: 0.2, label: "No climbing experience" },
          { value: "top_rope",    score: 0.6, label: "Top-rope only" },
          { value: "lead",        score: 0.9, label: "Lead certified" },
          { value: "trad",        score: 1.0, label: "Trad / multi-pitch lead" },
        ],
      },
      {
        key: "height_exposure",
        question: "How comfortable are you looking directly down from a height with no railing?",
        options: [
          { value: "no",          score: 0.3, label: "Very uncomfortable" },
          { value: "with_time",   score: 0.65, label: "Takes adjustment but manageable" },
          { value: "yes",         score: 1.0, label: "Completely comfortable" },
        ],
      },
    ],
  },

  Mountaineering: {
    hardGates: [],
    softModifiers: [
      {
        key: "crampon_exp",
        question: "What is your crampon and ice axe experience?",
        options: [
          { value: "none",         score: 0.2, label: "None" },
          { value: "basic_walk",   score: 0.5, label: "Basic crampon walking on snow" },
          { value: "self_arrest",  score: 0.8, label: "Ice axe self-arrest practiced" },
          { value: "technical",    score: 1.0, label: "Technical ice and mixed climbing" },
        ],
      },
      {
        key: "summit_exp",
        question: "What is your highest summit or high camp reached on foot?",
        options: [
          { value: "lt3k",   score: 0.3, label: "Below 3,000m" },
          { value: "3_4k",   score: 0.6, label: "3,000–4,000m" },
          { value: "4_5k",   score: 0.85, label: "4,000–5,000m" },
          { value: "gt5k",   score: 1.0, label: "Above 5,000m" },
        ],
      },
    ],
  },

  "Ice Climbing": {
    hardGates: [],
    softModifiers: [
      {
        key: "crampon_exp",
        question: "What is your crampon and ice axe experience?",
        options: [
          { value: "none",         score: 0.1, label: "None" },
          { value: "basic_walk",   score: 0.4, label: "Basic crampon walking" },
          { value: "self_arrest",  score: 0.7, label: "Self-arrest practiced" },
          { value: "technical",    score: 1.0, label: "Technical ice climbing" },
        ],
      },
    ],
  },

  Paragliding: {
    hardGates: [
      {
        key: "vestibular",
        question: "Do you have any diagnosed vestibular or balance disorder?",
        failAnswer: "yes",
        failReason: "Vestibular disorders are a contraindication for paragliding.",
      },
    ],
    softModifiers: [
      {
        key: "air_exp",
        question: "What is your air sports experience?",
        options: [
          { value: "none",      score: 0.4, label: "None (tandem only)" },
          { value: "tandem",    score: 0.6, label: "Multiple tandem flights" },
          { value: "p1_p2",     score: 0.85, label: "P1/P2 certified solo pilot" },
          { value: "advanced",  score: 1.0, label: "P3+ / extensive solo flying" },
        ],
      },
    ],
  },

  Skydiving: {
    hardGates: [
      {
        key: "vestibular",
        question: "Do you have any diagnosed vestibular or balance disorder?",
        failAnswer: "yes",
        failReason: "Vestibular disorders are a contraindication for skydiving.",
      },
    ],
    softModifiers: [
      {
        key: "freefall_comfort",
        question: "How do you feel about freefall and high-speed airborne exposure?",
        options: [
          { value: "anxious",    score: 0.4, label: "Nervous but willing (tandem)" },
          { value: "excited",    score: 0.8, label: "Excited, first jump" },
          { value: "exp",        score: 1.0, label: "Experienced jumper" },
        ],
      },
    ],
  },

  "Hang Gliding": {
    hardGates: [
      {
        key: "vestibular",
        question: "Do you have any diagnosed vestibular or balance disorder?",
        failAnswer: "yes",
        failReason: "Vestibular disorders are a contraindication for hang gliding.",
      },
    ],
    softModifiers: [],
  },

  Skiing: {
    hardGates: [],
    softModifiers: [
      {
        key: "ski_level",
        question: "What is your skiing ability level?",
        options: [
          { value: "never",         score: 0.1, label: "Never skied" },
          { value: "beginner",      score: 0.4, label: "Beginner (green runs)" },
          { value: "intermediate",  score: 0.65, label: "Intermediate (blue runs)" },
          { value: "advanced",      score: 0.85, label: "Advanced (black runs)" },
          { value: "expert",        score: 1.0, label: "Expert (off-piste / backcountry)" },
        ],
      },
    ],
  },

  Snowboarding: {
    hardGates: [],
    softModifiers: [
      {
        key: "snowboard_level",
        question: "What is your snowboarding ability level?",
        options: [
          { value: "never",         score: 0.1, label: "Never snowboarded" },
          { value: "beginner",      score: 0.4, label: "Beginner (green/blue)" },
          { value: "intermediate",  score: 0.7, label: "Intermediate (blue/red)" },
          { value: "advanced",      score: 0.9, label: "Advanced (black / off-piste)" },
          { value: "expert",        score: 1.0, label: "Expert (backcountry)" },
        ],
      },
    ],
  },

  Caving: {
    hardGates: [
      {
        key: "claustrophobia",
        question: "Do you experience significant claustrophobia in confined spaces?",
        failAnswer: "yes",
        failReason: "Significant claustrophobia makes caving unsafe — especially technical passages.",
      },
    ],
    softModifiers: [
      {
        key: "tight_passage",
        question: "Can you move confidently through tight, body-width passages requiring crawling?",
        options: [
          { value: "no",       score: 0.3, label: "No, I'd struggle" },
          { value: "effort",   score: 0.65, label: "With effort" },
          { value: "yes",      score: 1.0, label: "Yes, comfortable" },
        ],
      },
    ],
  },

  Motorcycling: {
    hardGates: [],
    softModifiers: [
      {
        key: "moto_technical",
        question: "How do you handle technical terrain on a bike (loose gravel, river crossings, high altitude)?",
        options: [
          { value: "beginner",      score: 0.3, label: "Beginner — stick to highways" },
          { value: "some_offroad",  score: 0.6, label: "Some off-road experience" },
          { value: "confident",     score: 0.85, label: "Confident on most terrain" },
          { value: "expert",        score: 1.0, label: "Expert, handle anything" },
        ],
      },
      {
        key: "mech_selfreliance",
        question: "Can you handle basic roadside repairs (puncture, chain, clutch adjustment)?",
        options: [
          { value: "no",    score: 0.5, label: "No — rely on support" },
          { value: "basic", score: 0.8, label: "Basic fixes" },
          { value: "full",  score: 1.0, label: "Full mechanical self-reliance" },
        ],
      },
    ],
  },

  Cycling: {
    hardGates: [],
    softModifiers: [
      {
        key: "saddle_endurance",
        question: "What is your maximum comfortable single-day saddle time?",
        options: [
          { value: "lt2h",   score: 0.2, label: "Under 2 hours" },
          { value: "2_4h",   score: 0.5, label: "2–4 hours" },
          { value: "4_6h",   score: 0.75, label: "4–6 hours" },
          { value: "6_8h",   score: 0.9, label: "6–8 hours" },
          { value: "gt8h",   score: 1.0, label: "8+ hours" },
        ],
      },
    ],
  },
};

// ─── Re-export ACEAxes as ACE for convenience ──────────────────────────────────

export type ACE = ACEAxes;

// ─── Axis metadata ─────────────────────────────────────────────────────────────

export const ACE_AXES = [
  "stamina", "power", "strength", "agility",
  "water", "altitude", "focus", "nerve",
] as const;

export type AceAxis = typeof ACE_AXES[number];

export const ACE_AXIS_LABELS: Record<AceAxis, string> = {
  stamina:  "Stamina",
  power:    "Power",
  strength: "Strength",
  agility:  "Agility",
  water:    "Water",
  altitude: "Altitude",
  focus:    "Focus",
  nerve:    "Nerve",
};

export const ACE_AXIS_COLORS: Record<AceAxis, string> = {
  stamina:  "#f97316",
  power:    "#eab308",
  strength: "#84cc16",
  agility:  "#22d3ee",
  water:    "#3b82f6",
  altitude: "#a78bfa",
  focus:    "#f43f5e",
  nerve: "#10b981",
};

export const ACE_SCALE_LABELS: Record<number, string> = {
  0: "Not Relevant",
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Extreme",
};

// ─── Domain groupings ─────────────────────────────────────────────────────────

export const ACE_DOMAINS = [
  { name: "Engine",    axes: ["stamina", "power"] as AceAxis[],          color: "#f97316", desc: "The physical engine — sustained output and explosive effort." },
  { name: "Chassis",   axes: ["strength", "agility"] as AceAxis[],       color: "#22d3ee", desc: "Load-bearing capability and terrain navigation." },
  { name: "Elements",  axes: ["water", "altitude"] as AceAxis[],         color: "#a78bfa", desc: "Environmental exposure — aquatic and high-altitude demands." },
  { name: "Mind",      axes: ["focus", "nerve"] as AceAxis[],          color: "#10b981", desc: "Psychological resilience and the grit to operate far from help." },
];

const BLANK_ACE: ACE = { stamina: 0, power: 0, strength: 0, agility: 0, water: 0, altitude: 0, focus: 0, nerve: 0 };

// ─── Difficulty computation from ACE sum ──────────────────────────────────

/** Derives the difficulty label from the total of all ACE axis scores. */
export function computeDifficulty(ace: ACE): string {
  const total = Object.values(ace).reduce((a, b) => a + b, 0);
  if (total <= 8)  return "Easy";
  if (total <= 14) return "Moderate";
  if (total <= 20) return "Hard";
  if (total <= 26) return "Advanced";
  return "Extreme";
}

/** Returns the ACE profile from manually entered data, or blank if not yet set. */
export function getACE(a: Adventure): ACE {
  return a.ace ? { ...(a.ace as ACE) } : { ...BLANK_ACE };
}

/** Generate a plain-English summary for an adventure's ACE profile */
export function aceSummary(ace: ACE, adventureName: string): string {
  const parts: string[] = [];

  // Stamina + altitude → primary descriptor
  if (ace.stamina >= 4 && ace.altitude >= 4)
    parts.push(`${adventureName} is an endurance-heavy adventure at extreme altitude — sustained days of physical output in a hypoxic environment.`);
  else if (ace.stamina >= 4)
    parts.push(`${adventureName} demands strong endurance — expect long, physically demanding days.`);
  else if (ace.stamina <= 2)
    parts.push(`${adventureName} is physically accessible — short daily effort with no sustained endurance demands.`);
  else
    parts.push(`${adventureName} requires moderate stamina — a typical multi-day effort.`);

  // Technicality: strength + agility
  const tech = Math.max(ace.strength, ace.agility);
  if (tech >= 5)
    parts.push("Technical mountaineering terrain demands specialised gear and movement skills.");
  else if (tech === 4)
    parts.push("Demanding terrain and load-bearing requirements call for solid physical preparation.");
  else if (tech <= 2)
    parts.push("No technical demands — standard gear is sufficient.");

  // Environmental axes: water or altitude
  if (ace.water >= 3)
    parts.push(`Aquatic competence is required — swimming or diving experience is essential.`);
  if (ace.altitude >= 4 && ace.stamina < 4)
    parts.push("The high altitude significantly amplifies the physiological challenge.");

  // Nerve
  if (ace.focus >= 4)
    parts.push("Significant psychological exposure — comfort with heights, void, or dangerous environments is critical.");

  // Tenacity
  if (ace.nerve >= 4)
    parts.push("Remote or isolated terrain demands strong self-reliance — you'll be far from support for extended periods.");

  return parts.join(" ");
}

/**
 * Computes a 0–100 match score between a user's ACE profile and an adventure's ACE requirement.
 *
 * Logic:
 * - Axes where the adventure requires 0 are ignored (not relevant).
 * - For each relevant axis: if user meets or exceeds the requirement → full score for that axis.
 * - Partial credit if the user is within 1 point below.
 * - Heavy penalty if the user is 2+ below on any axis.
 * - Returns a 0–100 integer.
 */
export function computeMatchScore(userAce: ACE, adventureAce: ACE): number {
  const axes = Object.keys(adventureAce) as (keyof ACE)[];
  const relevant = axes.filter((ax) => adventureAce[ax] > 0);
  if (relevant.length === 0) return 100;

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const ax of relevant) {
    const required = adventureAce[ax];
    const has = userAce[ax];
    const weight = required; // Higher requirement = more weight

    totalWeight += weight;

    if (has >= required) {
      earnedWeight += weight;
    } else {
      const gap = required - has;
      if (gap === 1) {
        // Slightly under — 75% credit
        earnedWeight += weight * 0.75;
      } else if (gap === 2) {
        // Notably under — 40% credit
        earnedWeight += weight * 0.4;
      } else {
        // Far under — 10% credit (not zero — shows willingness)
        earnedWeight += weight * 0.1;
      }
    }
  }

  return Math.round((earnedWeight / totalWeight) * 100);
}

/** Generate card labels (3–4 short highlight strings) for an adventure */
export function aceCardLabels(ace: ACE): string[] {
  const labels: string[] = [];

  const stamLabel = ace.stamina >= 4 ? "Endurance Heavy" : ace.stamina === 3 ? "Moderate Endurance" : ace.stamina <= 1 ? "Low Effort" : null;
  if (stamLabel) labels.push(stamLabel);

  if (ace.altitude >= 5) labels.push("Extreme Altitude");
  else if (ace.altitude === 4) labels.push("High Altitude");
  else if (ace.altitude === 3) labels.push("Moderate Altitude");

  if (ace.water >= 4) labels.push("Strong Swimming");
  else if (ace.water >= 3) labels.push("Water Confident");

  const expLabel = ace.focus >= 4 ? "High Exposure" : ace.focus === 3 ? "Moderate Exposure" : null;
  if (expLabel) labels.push(expLabel);

  const techLabel = Math.max(ace.strength, ace.agility);
  if (techLabel >= 5) labels.push("Technical Mountaineering");
  else if (techLabel === 4) labels.push("Technical Terrain");

  if (ace.nerve >= 4) labels.push("Remote Self-Reliance");

  return labels.slice(0, 4);
}
