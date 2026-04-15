import type { ACE } from "./ace";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  color: string;
  /** Lucide icon name (string) — mapped in the component */
  icon: string;
  /** "tier1" = pinnacle | "tier2" = domain | "tier3" = axis + engagement */
  tier: "tier1" | "tier2" | "tier3";
  /** Human-readable unlock condition shown on locked trophies */
  condition?: string;
}

// ─── Tier 3 — Axis badges (awarded when axis === 5) ──────────────────────────

export const AXIS_BADGES: Record<keyof ACE, Omit<Achievement, "tier">> = {
  stamina: {
    id:          "run-forrest-run",
    name:        "Run, Forrest, Run!",
    description: "Moves for 8+ hours without stopping. Built for back-to-back days in the field.",
    color:       "#f97316",
    icon:        "Timer",
  },
  power: {
    id:          "juggernaut",
    name:        "Juggernaut",
    description: "Raw power that levels terrain. Carries impossible loads without breaking stride.",
    color:       "#84cc16",
    icon:        "Dumbbell",
  },
  strength: {
    id:          "t-800",
    name:        "T-800",
    description: "Powers through sustained physical demands without losing pace. Never quits.",
    color:       "#eab308",
    icon:        "MountainSnow",
  },
  agility: {
    id:          "spidey-sense",
    name:        "Spidey-Sense",
    description: "At home in any terrain — rock, reef, or ridge. Moves confidently where others hesitate.",
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
    description: "Calm and precise in high-stakes moments. Exposure — above or below — doesn't break focus.",
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
    id:          "incredible-hulk",
    name:        "Incredible Hulk",
    description: "Stamina and Power both maxed. An unstoppable force that never shuts down.",
    color:       "#f97316",
    icon:        "Zap",
    tier:        "tier2" as const,
    axes:        ["stamina", "power"] as (keyof ACE)[],
  },
  {
    id:          "iron-sherpa",
    name:        "Iron Sherpa",
    description: "Strength and Agility both maxed. Total command over any terrain.",
    color:       "#22d3ee",
    icon:        "Pickaxe",
    tier:        "tier2" as const,
    axes:        ["strength", "agility"] as (keyof ACE)[],
  },
  {
    id:          "avatar-state",
    name:        "Avatar State",
    description: "Water and Altitude both maxed. Rides above the clouds and commands the current.",
    color:       "#a78bfa",
    icon:        "Globe",
    tier:        "tier2" as const,
    axes:        ["water", "altitude"] as (keyof ACE)[],
  },
  {
    id:          "awakened-buddha",
    name:        "Awakened Buddha",
    description: "Focus and Nerve both maxed. An unbreakable mind forged in the wild.",
    color:       "#10b981",
    icon:        "Brain",
    tier:        "tier2" as const,
    axes:        ["focus", "nerve"] as (keyof ACE)[],
  },
  {
    id:          "gordon-ramsayd",
    name:        "Gordon Ramsay'd",
    description: "10 reviews written. The community reads your every word.",
    color:       "#f97316",
    icon:        "Star",
    tier:        "tier2" as const,
    condition:   "Write 10 reviews",
    minReviews:  10,
  },
  {
    id:          "nolan-vision",
    name:        "Nolan Vision",
    description: "20 adventure photos uploaded. Your feed is the envy of the community.",
    color:       "#3b82f6",
    icon:        "Camera",
    tier:        "tier2" as const,
    condition:   "Upload 20 photos",
    minPhotos:   20,
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
    tier:         "tier1" as const,
    minXP:        9000,
  },
  {
    id:           "one-above-all",
    name:         "The One Above All",
    description:  "All 8 axes maxed. The complete adventurer — nothing is out of reach.",
    color:        "#fbbf24",
    icon:         "Crown",
    tier:         "tier1" as const,
    minEliteAxes: 8,
  },
  {
    id:            "the-mad-titan",
    name:          "The Mad Titan",
    description:   "Elite across 4 or more axes. A rare all-round adventurer with no weak terrain.",
    color:         "#f59e0b",
    icon:          "Wand",
    tier:          "special" as const,
    minEliteAxes:  4,
  },
];

// ─── XP Trophies — reward engagement actions ─────────────────────────────────

export const XP_BADGES = [
  {
    id:          "first-blood",
    name:        "First Blood",
    description: "Logged your very first completed adventure. Every legend starts somewhere.",
    color:       "#10b981",
    icon:        "CheckCircle2",
    tier:        "tier3" as const,
    condition:   "Complete 1 adventure",
    minCompleted: 1,
  },
  {
    id:          "rotten-tomato",
    name:        "Rotten Tomato",
    description: "Left your first review. Your voice shapes the adventure community.",
    color:       "#f59e0b",
    icon:        "Star",
    tier:        "tier3" as const,
    condition:   "Write 1 review",
    minReviews:  1,
  },
  {
    id:          "dream-collector",
    name:        "Dream Collector",
    description: "10 adventures wishlisted. The bucket list is getting serious.",
    color:       "#f43f5e",
    icon:        "Heart",
    tier:        "tier3" as const,
    condition:   "Wishlist 10 adventures",
    minWishlisted: 10,
  },
  {
    id:          "wishlist-1",
    name:        "Window Shopper",
    description: "First adventure wishlisted. The dreaming has begun.",
    color:       "#f43f5e",
    icon:        "Heart",
    tier:        "tier3" as const,
    condition:   "Wishlist 1 adventure",
    minWishlisted: 1,
  },
  {
    id:          "shutter-chaser",
    name:        "Shutter Bug",
    description: "Uploaded your first adventure photo. Every adventure deserves proof.",
    color:       "#3b82f6",
    icon:        "Camera",
    tier:        "tier3" as const,
    condition:   "Upload 1 photo",
    minPhotos:   1,
  },
  {
    id:          "elementary",
    name:        "Elementary",
    description: "First comparison made. The game is afoot.",
    color:       "#a78bfa",
    icon:        "GitCompare",
    tier:        "tier3" as const,
    condition:   "Compare 1 adventure",
    minCompares: 1,
  },
  {
    id:          "the-analyst",
    name:        "Sherlock Scan",
    description: "10 comparisons made. You don't just pick adventures — you deduce them.",
    color:       "#a78bfa",
    icon:        "GitCompare",
    tier:        "tier3" as const,
    condition:   "Compare 10 adventures",
    minCompares: 10,
  },
];

// ─── Core function ────────────────────────────────────────────────────────────

export interface EngagementStats {
  completed?: number;
  reviews?: number;
  wishlisted?: number;
  photos?: number;
  compares?: number;
}

export function getAchievements(ace: ACE, totalXP = 0, engagement: EngagementStats = {}): Achievement[] {
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
    if ("axes" in badge && badge.axes) {
      if (badge.axes.every((ax) => ace[ax] >= 5)) earned.push({ ...badge });
    } else {
      let qualifies = false;
      if ("minReviews"  in badge && badge.minReviews  != null && (engagement.reviews  ?? 0) >= badge.minReviews)  qualifies = true;
      if ("minCompares" in badge && badge.minCompares != null && (engagement.compares ?? 0) >= badge.minCompares) qualifies = true;
      if ("minPhotos"   in badge && badge.minPhotos   != null && (engagement.photos   ?? 0) >= badge.minPhotos)   qualifies = true;
      if (qualifies) earned.push({ ...badge });
    }
  }

  // Tier 3 — Axis
  for (const ax of axes) {
    if (ace[ax] >= 5) {
      earned.push({ ...AXIS_BADGES[ax], tier: "tier3" });
    }
  }

  // XP & Engagement trophies
  for (const badge of XP_BADGES) {
    let qualifies = false;
    if ("minXP"        in badge && badge.minXP        != null && totalXP                    >= badge.minXP)        qualifies = true;
    if ("minCompleted" in badge && badge.minCompleted  != null && (engagement.completed ?? 0) >= badge.minCompleted) qualifies = true;
    if ("minReviews"   in badge && badge.minReviews    != null && (engagement.reviews   ?? 0) >= badge.minReviews)   qualifies = true;
    if ("minWishlisted"in badge && badge.minWishlisted != null && (engagement.wishlisted ?? 0) >= badge.minWishlisted) qualifies = true;
    if ("minPhotos"    in badge && badge.minPhotos     != null && (engagement.photos     ?? 0) >= badge.minPhotos)     qualifies = true;
    if ("minCompares"  in badge && badge.minCompares   != null && (engagement.compares   ?? 0) >= badge.minCompares)   qualifies = true;
    if (qualifies) earned.push({ ...badge });
  }

  return earned;
}
