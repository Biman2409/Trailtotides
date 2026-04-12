import type { ACE } from "./ace";
import type { XPState } from "./xp";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  color: string;
  /** Lucide icon name (string) — mapped in the component */
  icon: string;
  /** "axis" = single-axis elite | "domain" = 2-axis domain | "special" = multi/full | "activity" = action-based */
  tier: "axis" | "domain" | "special" | "activity";
}

// ─── Tier 3 — Axis badges (awarded when axis === 5) ──────────────────────────

export const AXIS_BADGES: Record<keyof ACE, Omit<Achievement, "tier">> = {
  stamina: {
    id:          "run-forrest-run",
    name:        "Run, Forrest, Run!",
    description: "Moves for 8+ hours without stopping. Built for back-to-back days in the mountains.",
    color:       "#f97316",
    icon:        "Timer",       // stopwatch — relentless endurance
  },
  power: {
    id:          "incredible-hulk",
    name:        "Incredible Hulk",
    description: "Raw power that levels terrain. Carries impossible loads without breaking stride.",
    color:       "#84cc16",
    icon:        "Dumbbell",    // raw strength / weight lifting
  },
  strength: {
    id:          "hero-hercules",
    name:        "Hero Hercules",
    description: "Powers up sustained steep ascents without losing pace. Legs that never quit.",
    color:       "#eab308",
    icon:        "MountainSnow", // steep ascent — legs of Hercules
  },
  agility: {
    id:          "spidey-sense",
    name:        "Spidey-Sense",
    description: "At home on glaciers and exposed rock. Moves confidently where others hesitate.",
    color:       "#22d3ee",
    icon:        "Footprints",  // quick sure-footed movement
  },
  water: {
    id:          "little-mermaid",
    name:        "Little Mermaid",
    description: "Handles strong currents and rough conditions. Water holds no fear.",
    color:       "#3b82f6",
    icon:        "Waves",       // water / ocean element
  },
  altitude: {
    id:          "abominable-snowman",
    name:        "Abominable Snowman",
    description: "Stays active above 4,200m. The altitude works for you, not against you.",
    color:       "#a78bfa",
    icon:        "Wind",        // thin cold high-altitude air
  },
  focus: {
    id:          "master-yoda",
    name:        "Master Yoda",
    description: "Calm and precise on fatal drop-offs. Exposure doesn't break focus.",
    color:       "#f43f5e",
    icon:        "ScanEye",     // acute focus / precision perception
  },
  nerve: {
    id:          "john-rambo",
    name:        "John Rambo",
    description: "No signal, no rescue, no problem. Fully self-sufficient in the wild.",
    color:       "#10b981",
    icon:        "Shield",      // self-reliance / survival armor
  },
};

// ─── Tier 2 — Domain badges (both axes in a domain === 5) ────────────────────

export const DOMAIN_BADGES = [
  {
    id:          "terminator-core",
    name:        "Terminator Core",
    description: "Stamina and Power both maxed. An unstoppable human engine that never shuts down.",
    color:       "#f97316",
    icon:        "Zap",         // raw machine-like energy — terminator
    tier:        "domain" as const,
    axes:        ["stamina", "power"] as (keyof ACE)[],
  },
  {
    id:          "iron-sherpa",
    name:        "Iron Sherpa",
    description: "Strength and Agility both maxed. Total command over any terrain.",
    color:       "#22d3ee",
    icon:        "Pickaxe",     // the sherpa's tool — terrain mastery
    tier:        "domain" as const,
    axes:        ["strength", "agility"] as (keyof ACE)[],
  },
  {
    id:          "the-avatar",
    name:        "The Avatar",
    description: "Water and Altitude both maxed. Master of nature's two most unforgiving elements.",
    color:       "#a78bfa",
    icon:        "Globe",       // mastery of natural elements
    tier:        "domain" as const,
    axes:        ["water", "altitude"] as (keyof ACE)[],
  },
  {
    id:          "awakened-buddha",
    name:        "Awakened Buddha",
    description: "Focus and Nerve both maxed. An unbreakable mind forged in the wilderness.",
    color:       "#10b981",
    icon:        "Brain",       // mental mastery — the awakened mind
    tier:        "domain" as const,
    axes:        ["focus", "nerve"] as (keyof ACE)[],
  },
];

// ─── Tier 1 — Apex badges ─────────────────────────────────────────────────────

export const SPECIAL_BADGES = [
  {
    id:           "one-above-all",
    name:         "One Above All",
    description:  "All 8 axes maxed. The complete adventurer — nothing is out of reach.",
    color:        "#fbbf24",
    icon:         "Crown",      // ultimate royalty — pinnacle of achievement
    tier:         "special" as const,
    minEliteAxes: 8,
    suppressIfAll: false,
  },
  {
    id:            "gandalf-the-grey",
    name:          "Gandalf the Grey",
    description:   "Elite across 4 or more axes. A rare all-round expedition-grade profile.",
    color:         "#f59e0b",
    icon:          "Wand",      // Gandalf's staff — wizard-level adventurer
    tier:          "special" as const,
    minEliteAxes:  4,
    suppressIfAll: false,
  },
];

// ─── Activity badges (earned through check-ins, reviews, photos) ─────────────

export const ACTIVITY_BADGES: (Omit<Achievement, "tier"> & {
  tier: "activity";
  check: (xp: XPState) => boolean;
})[] = [
  {
    id:          "first-step",
    name:        "First Step",
    description: "Marked your first adventure as done. The journey begins.",
    color:       "#34d399",
    icon:        "Footprints",
    tier:        "activity",
    check:       (xp) => xp.checkIns >= 1,
  },
  {
    id:          "five-summits",
    name:        "Five Summits",
    description: "Completed 5 adventures. You're building a serious log.",
    color:       "#f97316",
    icon:        "MountainSnow",
    tier:        "activity",
    check:       (xp) => xp.checkIns >= 5,
  },
  {
    id:          "ten-peaks",
    name:        "Ten Peaks",
    description: "Ten adventures done. Elite territory.",
    color:       "#fbbf24",
    icon:        "Crown",
    tier:        "activity",
    check:       (xp) => xp.checkIns >= 10,
  },
  {
    id:          "voice-of-trails",
    name:        "Voice of Trails",
    description: "Left your first review. Others will find their way because of you.",
    color:       "#60a5fa",
    icon:        "Star",
    tier:        "activity",
    check:       (xp) => xp.reviews >= 1,
  },
  {
    id:          "trail-critic",
    name:        "Trail Critic",
    description: "Reviewed 5 adventures. Your word shapes the community.",
    color:       "#a78bfa",
    icon:        "MessageSquare",
    tier:        "activity",
    check:       (xp) => xp.reviews >= 5,
  },
  {
    id:          "trail-photographer",
    name:        "Trail Photographer",
    description: "Uploaded your first trail photo. Let others see what you saw.",
    color:       "#f43f5e",
    icon:        "Camera",
    tier:        "activity",
    check:       (xp) => xp.photos >= 1,
  },
  {
    id:          "visual-storyteller",
    name:        "Visual Storyteller",
    description: "5 trail photos shared. You're painting the mountains for others.",
    color:       "#e879f9",
    icon:        "Images",
    tier:        "activity",
    check:       (xp) => xp.photos >= 5,
  },
  {
    id:          "century-explorer",
    name:        "Century Explorer",
    description: "Earned 100 XP. You're no longer just passing through.",
    color:       "#34d399",
    icon:        "Zap",
    tier:        "activity",
    check:       (xp) => xp.total >= 100,
  },
  {
    id:          "legend-in-making",
    name:        "Legend in Making",
    description: "Earned 500 XP. Your name is becoming legend on these trails.",
    color:       "#fbbf24",
    icon:        "Trophy",
    tier:        "activity",
    check:       (xp) => xp.total >= 500,
  },
];

// ─── Core function ────────────────────────────────────────────────────────────

export function getAchievements(ace: ACE): Achievement[] {
  const earned: Achievement[] = [];

  const axes = Object.keys(ace) as (keyof ACE)[];
  const eliteCount = axes.filter((ax) => ace[ax] >= 5).length;
  const hasAll = eliteCount >= 8;

  // Tier 1 — Apex
  for (const badge of SPECIAL_BADGES) {
    if (badge.suppressIfAll && hasAll) continue;
    if (eliteCount >= badge.minEliteAxes) {
      earned.push({ ...badge });
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

export function getActivityAchievements(xp: XPState): Achievement[] {
  return ACTIVITY_BADGES.filter(b => b.check(xp)).map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    color: b.color,
    icon: b.icon,
    tier: "activity" as const,
  }));
}
