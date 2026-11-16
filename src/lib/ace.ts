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

const BLANK_ACE: ACE = { stamina: 0, power: 0, strength: 0, agility: 0, water: 0, altitude: 0, focus: 0, nerve: 0 };

// ─── Match verdict thresholds ─────────────────────────────────────────────────
/** A match score at or above this is "Ready" */
export const READY_MIN = 80;
/** At or above this (and below READY_MIN) is "Stretch"; below it, "Not yet" */
export const STRETCH_MIN = 55;

// ─── Difficulty computation from ACE sum ──────────────────────────────────

const DIFFICULTY_LABELS = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"] as const;

/**
 * The difficulty label, from the total of the eight ACE scores and the single hardest demand.
 *
 * Recalibrated 2026-11-16. The old bands (≤8, ≤14, ≤20, ≤26) put 54 of 59 adventures at Hard or
 * above, because a Himalayan trek scores about 2 on every axis before it asks anything hard of
 * you: Kedarkantha, a standard first Himalayan trek, was "Hard", and Everest Base Camp shared
 * "Extreme" with Mera Peak. The bands below are wider at the top, and a 5 on any axis (5,000 m+,
 * a technical climb) keeps an adventure at Hard or above whatever its total. Only labels change:
 * people's scores and every Ready / Stretch / Not yet verdict are worked out per axis, not from this.
 */
export function computeDifficulty(ace: ACE): string {
  const values = Object.values(ace);
  const total = values.reduce((a, b) => a + b, 0);
  const peak = Math.max(...values);
  const byTotal = total <= 12 ? 1 : total <= 24 ? 2 : total <= 29 ? 3 : total <= 34 ? 4 : 5;
  const floor = peak >= 5 ? 3 : peak >= 4 ? 2 : 1;
  return DIFFICULTY_LABELS[Math.max(byTotal, floor) - 1];
}

/**
 * The difficulty every page shows: derived from the adventure's ACE profile. The hand-typed
 * `difficulty` field on the record is only an input to estimateACE for adventures without a
 * profile yet; reading it directly made the same trek "Moderate" in one place and "Extreme" in another.
 */
export function difficultyOf(a: Adventure): string {
  return computeDifficulty(getACE(a));
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
 * - A weighted average alone let strong axes hide a dangerous gap on one (Altitude 1 rated
 *   "Ready" for a 4,300m pass), so the single largest gap caps the result: 2 levels short on any
 *   axis is at best a Stretch, 3 or more is Not yet, however strong the rest of the profile is.
 */
export function computeMatchScore(userAce: ACE, adventureAce: ACE): number {
  const axes = Object.keys(adventureAce) as (keyof ACE)[];
  const relevant = axes.filter((ax) => adventureAce[ax] > 0);
  if (relevant.length === 0) return 100;

  let totalWeight = 0;
  let earnedWeight = 0;
  let maxGap = 0;

  for (const ax of relevant) {
    const required = adventureAce[ax];
    const has = userAce[ax];
    const weight = required; // Higher requirement = more weight
    maxGap = Math.max(maxGap, required - has);

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

  const score = Math.round((earnedWeight / totalWeight) * 100);
  if (maxGap >= 3) return Math.min(score, STRETCH_MIN - 1);
  if (maxGap >= 2) return Math.min(score, READY_MIN - 1);
  return score;
}

