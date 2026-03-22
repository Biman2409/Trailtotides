/**
 * ACE Achievement System
 * ──────────────────────
 * Badges are awarded when ACE axis scores hit 5/5 (elite).
 * Special badges trigger on multi-axis mastery.
 *
 * To add a new badge:
 *   - Add to AXIS_BADGES (per-axis, score === 5)
 *   - Or add to SPECIAL_BADGES (custom logic via `check` function)
 *
 * To change thresholds, edit the `check` in SPECIAL_BADGES or
 * the `score >= 5` condition in getAchievements().
 */

import type { ACE } from "./ace";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  color: string;
  /** Lucide icon name (string) — mapped in the component */
  icon: string;
  /** "axis" = single-axis elite | "domain" = 4-axis domain | "special" = multi/full */
  tier: "axis" | "domain" | "special";
}

// ─── Per-axis badges (awarded when axis === 5) ────────────────────────────────

export const AXIS_BADGES: Record<keyof ACE, Omit<Achievement, "tier">> = {
  stamina: {
    id:          "iron-lung",
    name:        "Iron Lung",
    description: "Moves for 8+ hours without stopping. Built for back-to-back days in the mountains.",
    color:       "#f97316",
    icon:        "Flame",
  },
  power: {
    id:          "iron-sherpa",
    name:        "Iron Sherpa",
    description: "Carries a 15kg+ pack all day without slowing down. A human cargo vessel.",
    color:       "#eab308",
    icon:        "Zap",
  },
  strength: {
    id:          "summit-legs",
    name:        "Summit Legs",
    description: "Powers up sustained steep ascents without losing pace. Legs that never quit.",
    color:       "#84cc16",
    icon:        "Dumbbell",
  },
  agility: {
    id:          "goat-path",
    name:        "Goat Path",
    description: "At home on glaciers and exposed rock. Moves confidently where others hesitate.",
    color:       "#22d3ee",
    icon:        "Compass",
  },
  water: {
    id:          "open-water",
    name:        "Open Water",
    description: "Handles strong currents and rough conditions. Water holds no fear.",
    color:       "#3b82f6",
    icon:        "Waves",
  },
  altitude: {
    id:          "thin-air",
    name:        "Thin Air",
    description: "Stays active above 4,200m. The altitude works for you, not against you.",
    color:       "#a78bfa",
    icon:        "Mountain",
  },
  focus: {
    id:          "steel-eyes",
    name:        "Steel Eyes",
    description: "Calm and precise on fatal drop-offs. Exposure doesn't break focus.",
    color:       "#f43f5e",
    icon:        "Shield",
  },
  nerve: {
    id:          "off-grid",
    name:        "Off Grid",
    description: "No signal, no rescue, no problem. Fully self-sufficient in the wild.",
    color:       "#10b981",
    icon:        "Wind",
  },
};

// ─── Domain mastery badges (all 4 axes in a domain === 5) ─────────────────────

export const DOMAIN_BADGES = [
  {
    id:          "engine-master",
    name:        "Engine Master",
    description: "Stamina and Power both maxed. The human engine running at full capacity.",
    color:       "#f97316",
    icon:        "Gauge",
    tier:        "domain" as const,
    axes:        ["stamina", "power"] as (keyof ACE)[],
  },
  {
    id:          "chassis-master",
    name:        "Chassis Master",
    description: "Strength and Agility both maxed. Total command over any terrain.",
    color:       "#22d3ee",
    icon:        "Layers",
    tier:        "domain" as const,
    axes:        ["strength", "agility"] as (keyof ACE)[],
  },
  {
    id:          "elements-master",
    name:        "Elements Master",
    description: "Water and Altitude both maxed. Nature's extremes are your playground.",
    color:       "#a78bfa",
    icon:        "Globe",
    tier:        "domain" as const,
    axes:        ["water", "altitude"] as (keyof ACE)[],
  },
  {
    id:          "mind-master",
    name:        "Mind Master",
    description: "Focus and Nerve both maxed. An unbreakable mind built for the wilderness.",
    color:       "#10b981",
    icon:        "Brain",
    tier:        "domain" as const,
    axes:        ["focus", "nerve"] as (keyof ACE)[],
  },
];

// ─── Special badges (custom multi-axis logic) ─────────────────────────────────

export const SPECIAL_BADGES = [
  {
    id:          "multi-domain-elite",
    name:        "Multi-Domain Elite",
    description: "Elite across 4 or more axes. A rare all-round expedition-grade profile.",
    color:       "#f59e0b",
    icon:        "Trophy",
    tier:        "special" as const,
    /** Number of axes that must hit 5 to unlock this */
    minEliteAxes: 4,
    /** Does NOT show if Full Apex also applies */
    suppressIfApex: true,
  },
  {
    id:          "full-apex",
    name:        "Full Apex",
    description: "All 8 axes maxed. The complete adventurer — nothing is out of reach.",
    color:       "#fbbf24",
    icon:        "Crown",
    tier:        "special" as const,
    minEliteAxes: 8,
    suppressIfApex: false,
  },
];

// ─── Core function ─────────────────────────────────────────────────────────────

/**
 * Returns the list of achievements earned for a given ACE profile.
 * Order: special (highest first) → domain → per-axis.
 */
export function getAchievements(ace: ACE): Achievement[] {
  const earned: Achievement[] = [];

  const axes = Object.keys(ace) as (keyof ACE)[];
  const eliteAxes = axes.filter((ax) => ace[ax] >= 5);
  const eliteCount = eliteAxes.length;
  const isFullApex = eliteCount === 8;

  // Special badges — highest tier first
  for (const badge of SPECIAL_BADGES) {
    if (eliteCount >= badge.minEliteAxes) {
      if (badge.suppressIfApex && isFullApex) continue;
      earned.push({ ...badge });
    }
  }

  // Domain badges
  for (const badge of DOMAIN_BADGES) {
    if (badge.axes.every((ax) => ace[ax] >= 5)) {
      earned.push({ ...badge });
    }
  }

  // Per-axis badges
  for (const ax of axes) {
    if (ace[ax] >= 5) {
      earned.push({ ...AXIS_BADGES[ax], tier: "axis" });
    }
  }

  return earned;
}
