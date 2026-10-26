import type { Adventure, ACEAxes } from "./data";

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

/** True when the adventure has a hand-set ACE profile (not an estimate). */
export function hasRealACE(a: Adventure): boolean {
  return !!a.ace && Object.values(a.ace).some((v) => (v as number) > 0);
}

const DIFFICULTY_LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };

/** Altitude band (1–5) from a string like "5,359m"; 0 when unknown */
function altitudeLevel(alt?: string): number {
  const m = alt ? Number(alt.replace(/[^\d.]/g, "")) : NaN;
  if (!m || Number.isNaN(m)) return 0;
  return m < 1500 ? 1 : m < 2500 ? 2 : m < 3500 ? 3 : m < 4500 ? 4 : 5;
}

/**
 * A cautious ACE estimate for adventures whose profile hasn't been set yet, from their type,
 * difficulty and top altitude. Without it, a blank profile has no demands and rates every
 * visitor "Ready" — even for an Extreme ride over 5,000m passes.
 */
export function estimateACE(a: Adventure): ACE {
  const d = DIFFICULTY_LEVEL[a.difficulty] ?? 3;
  const alt = altitudeLevel(a.altitude);
  const c = (n: number) => Math.min(5, Math.max(0, Math.round(n)));
  switch (a.type) {
    case "Mountaineering":
      return { stamina: c(d + 1), power: c(d), strength: c(d), agility: c(d), water: 0, altitude: c(Math.max(alt, d)), focus: c(d), nerve: c(d) };
    case "Motorcycling":
      return { stamina: c(d - 1), power: 1, strength: c(d - 2), agility: c(d - 2), water: 0, altitude: alt, focus: c(d - 1), nerve: c(d - 1) };
    case "Cycling":
      return { stamina: c(d), power: c(d - 1), strength: c(d - 2), agility: c(d - 2), water: 0, altitude: alt, focus: c(d - 2), nerve: c(d - 1) };
    case "Diving": case "Kayaking": case "River Rafting":
      return { stamina: c(d - 1), power: c(d - 2), strength: c(d - 2), agility: c(d - 2), water: c(d + 1), altitude: 0, focus: c(d - 1), nerve: c(d - 1) };
    default: // Trekking and everything on foot
      return { stamina: c(d), power: c(d - 1), strength: c(d - 1), agility: c(d - 1), water: 0, altitude: alt, focus: c(d - 2), nerve: c(d - 1) };
  }
}

/** The adventure's ACE profile: hand-set when available, otherwise a cautious estimate. */
export function getACE(a: Adventure): ACE {
  return hasRealACE(a) ? { ...BLANK_ACE, ...(a.ace as ACE) } : estimateACE(a);
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

