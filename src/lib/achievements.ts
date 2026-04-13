import type { ACE } from "./ace";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  color: string;
  /** Lucide icon name (string) — mapped in the component */
  icon: string;
  /** "axis" = single-axis elite | "domain" = 2-axis domain | "special" = multi/full */
  tier: "axis" | "domain" | "special";
}

// ─── Tier 3 — Axis badges (awarded when axis === 5) ──────────────────────────

export const AXIS_BADGES: Record<keyof ACE, Omit<Achievement, "tier">> = {
  stamina: {
    id:          "run-forrest-run",
    name:        "Run, Forrest, Run!",
    description: "Moves for 8+ hours without stopping. Built for back-to-back days in the mountains.",
    color:       "#f97316",
    icon:        "Timer",
  },
  power: {
    id:          "incredible-hulk",
    name:        "Incredible Hulk",
    description: "Raw power that levels terrain. Carries impossible loads without breaking stride.",
    color:       "#84cc16",
    icon:        "Dumbbell",
  },
  strength: {
    id:          "hero-hercules",
    name:        "Hero Hercules",
    description: "Powers up sustained steep ascents without losing pace. Legs that never quit.",
    color:       "#eab308",
    icon:        "MountainSnow",
  },
  agility: {
    id:          "spidey-sense",
    name:        "Spidey-Sense",
    description: "At home on glaciers and exposed rock. Moves confidently where others hesitate.",
    color:       "#22d3ee",
    icon:        "Footprints",
  },
  water: {
    id:          "little-mermaid",
    name:        "Little Mermaid",
    description: "Handles strong currents and rough conditions. Water holds no fear.",
    color:       "#3b82f6",
    icon:        "Waves",
  },
  altitude: {
    id:          "abominable-snowman",
    name:        "Abominable Snowman",
    description: "Stays active above 4,200m. The altitude works for you, not against you.",
    color:       "#a78bfa",
    icon:        "Wind",
  },
  focus: {
    id:          "master-yoda",
    name:        "Master Yoda",
    description: "Calm and precise on fatal drop-offs. Exposure doesn't break focus.",
    color:       "#f43f5e",
    icon:        "ScanEye",
  },
  nerve: {
    id:          "john-rambo",
    name:        "John Rambo",
    description: "No signal, no rescue, no problem. Fully self-sufficient in the wild.",
    color:       "#10b981",
    icon:        "Shield",
  },
};

// ─── Tier 2 — Domain badges (both axes in a domain === 5) ────────────────────

export const DOMAIN_BADGES = [
  {
    id:          "terminator-core",
    name:        "Terminator Core",
    description: "Stamina and Power both maxed. An unstoppable human engine that never shuts down.",
    color:       "#f97316",
    icon:        "Zap",
    tier:        "domain" as const,
    axes:        ["stamina", "power"] as (keyof ACE)[],
  },
  {
    id:          "iron-sherpa",
    name:        "Iron Sherpa",
    description: "Strength and Agility both maxed. Total command over any terrain.",
    color:       "#22d3ee",
    icon:        "Pickaxe",
    tier:        "domain" as const,
    axes:        ["strength", "agility"] as (keyof ACE)[],
  },
  {
    id:          "the-avatar",
    name:        "The Avatar",
    description: "Water and Altitude both maxed. Master of nature's two most unforgiving elements.",
    color:       "#a78bfa",
    icon:        "Globe",
    tier:        "domain" as const,
    axes:        ["water", "altitude"] as (keyof ACE)[],
  },
  {
    id:          "awakened-buddha",
    name:        "Awakened Buddha",
    description: "Focus and Nerve both maxed. An unbreakable mind forged in the wilderness.",
    color:       "#10b981",
    icon:        "Brain",
    tier:        "domain" as const,
    axes:        ["focus", "nerve"] as (keyof ACE)[],
  },
];

// ─── Tier 1 — Apex / Special badges ──────────────────────────────────────────

export const SPECIAL_BADGES = [
  {
    id:           "over-9000",
    name:         "It's Over 9000!",
    description:  "9,000+ XP earned. The scouter can't even measure this power level.",
    color:        "#ff3d00",
    icon:         "Flame9000",   // custom — mapped in components
    tier:         "special" as const,
    minXP:        9000,
  },
  {
    id:           "one-above-all",
    name:         "One Above All",
    description:  "All 8 axes maxed. The complete adventurer — nothing is out of reach.",
    color:        "#fbbf24",
    icon:         "Crown",
    tier:         "special" as const,
    minEliteAxes: 8,
  },
  {
    id:            "gandalf-the-grey",
    name:          "Gandalf the Grey",
    description:   "Elite across 4 or more axes. A rare all-round expedition-grade profile.",
    color:         "#f59e0b",
    icon:          "Wand",
    tier:          "special" as const,
    minEliteAxes:  4,
  },
];

// ─── Core function ────────────────────────────────────────────────────────────

export function getAchievements(ace: ACE, totalXP = 0): Achievement[] {
  const earned: Achievement[] = [];

  const axes = Object.keys(ace) as (keyof ACE)[];
  const eliteCount = axes.filter((ax) => ace[ax] >= 5).length;

  // Tier 1 — Apex
  for (const badge of SPECIAL_BADGES) {
    if ("minXP" in badge && badge.minXP !== undefined) {
      if (totalXP >= badge.minXP) earned.push({ ...badge });
    } else if ("minEliteAxes" in badge && badge.minEliteAxes !== undefined) {
      if (eliteCount >= badge.minEliteAxes) earned.push({ ...badge });
    }
  }

  // Tier 2 — Domain
  for (const badge of DOMAIN_BADGES) {
    if (badge.axes.every((ax) => ace[ax] >= 5)) {
      earned.push({ ...badge });
    }
  }

  // Tier 3 — Axis
  for (const ax of axes) {
    if (ace[ax] >= 5) {
      earned.push({ ...AXIS_BADGES[ax], tier: "axis" });
    }
  }

  return earned;
}
