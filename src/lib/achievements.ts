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
    description: "8+ hours of continuous movement without fatigue",
    color:       "#f97316",
    icon:        "Flame",
  },
  power: {
    id:          "iron-sherpa",
    name:        "Iron Sherpa",
    description: "Carries 15+ kg across a full trekking day with ease",
    color:       "#eab308",
    icon:        "Zap",
  },
  strength: {
    id:          "summit-legs",
    name:        "Summit Legs",
    description: "Sustained steep ascents without breaking pace",
    color:       "#84cc16",
    icon:        "Dumbbell",
  },
  agility: {
    id:          "goat-path",
    name:        "Goat Path",
    description: "Navigates glaciers and exposed rock with confidence",
    color:       "#22d3ee",
    icon:        "Compass",
  },
  water: {
    id:          "open-water",
    name:        "Open Water",
    description: "Handles strong currents and advanced aquatic conditions",
    color:       "#3b82f6",
    icon:        "Waves",
  },
  altitude: {
    id:          "thin-air",
    name:        "Thin Air",
    description: "Physically active above 4,200 m without significant discomfort",
    color:       "#a78bfa",
    icon:        "Mountain",
  },
  focus: {
    id:          "steel-eyes",
    name:        "Steel Eyes",
    description: "Fully composed on narrow, exposed terrain with fatal drop-offs",
    color:       "#f43f5e",
    icon:        "Shield",
  },
  nerve: {
    id:          "off-grid",
    name:        "Off Grid",
    description: "Completely self-sufficient — no signal, no help, no problem",
    color:       "#10b981",
    icon:        "Wind",
  },
};

// ─── Domain mastery badges (all 4 axes in a domain === 5) ─────────────────────

export const DOMAIN_BADGES = [
  {
    id:          "engine-master",
    name:        "Engine Master",
    description: "Elite in both Stamina and Power — the physical engine maxed out",
    color:       "#f97316",
    icon:        "Gauge",
    tier:        "domain" as const,
    axes:        ["stamina", "power"] as (keyof ACE)[],
  },
  {
    id:          "chassis-master",
    name:        "Chassis Master",
    description: "Elite in both Strength and Agility — total terrain control",
    color:       "#22d3ee",
    icon:        "Layers",
    tier:        "domain" as const,
    axes:        ["strength", "agility"] as (keyof ACE)[],
  },
  {
    id:          "elements-master",
    name:        "Elements Master",
    description: "Elite in both Water and Altitude — nature's extremes mastered",
    color:       "#a78bfa",
    icon:        "Globe",
    tier:        "domain" as const,
    axes:        ["water", "altitude"] as (keyof ACE)[],
  },
  {
    id:          "mind-master",
    name:        "Mind Master",
    description: "Elite in both Focus and Nerve — unbreakable mental game",
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
    description: "Reached elite level (5/5) on 4 or more axes",
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
    description: "All 8 ACE axes at maximum — the rarest achievement on the platform",
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
