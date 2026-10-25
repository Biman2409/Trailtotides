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
    id:          "rhino-beetle",
    name:        "Rhino Beetle",
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
    icon:        "MountainSnow",
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

// ─── Tier 2 — Domain badges ───────────────────────────────────────────────────
// Axes-based first (hardest), engagement-based after

type DomainBadge = Omit<Achievement, "tier"> & {
  tier: "tier2";
  axes?: (keyof ACE)[];
  minReviews?: number;
  minPhotos?: number;
  minCompares?: number;
};

export const DOMAIN_BADGES: DomainBadge[] = [
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
    icon:        "Waves",
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
    color:       "#f59e0b",
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

// ─── Tier 1 — Apex / Special badges (ordered rarest → less rare) ─────────────

type SpecialBadge = Omit<Achievement, "tier"> & {
  tier: "tier1";
  minXP?: number;
  minEliteAxes?: number;
};

export const SPECIAL_BADGES: SpecialBadge[] = [
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
    id:           "over-9000",
    name:         "It's Over 9000!",
    description:  "9,000+ XP earned. The scouter can't even measure this power level.",
    color:        "#ff3d00",
    icon:         "Flame9000",
    tier:         "tier1" as const,
    minXP:        9000,
  },
  {
    id:            "the-mad-titan",
    name:          "The Mad Titan",
    description:   "Elite across 4 or more axes. A rare all-round adventurer with no weak terrain.",
    color:         "#f59e0b",
    icon:          "Award",
    tier:          "tier1" as const,
    minEliteAxes:  4,
  },
];

// ─── XP / Engagement badges (Tier 3) — grouped by action type ────────────────

type XPBadge = Omit<Achievement, "tier"> & {
  tier: "tier3";
  minXP?: number;
  minCompleted?: number;
  minReviews?: number;
  minWishlisted?: number;
  minPhotos?: number;
  minCompares?: number;
};

export const XP_BADGES: XPBadge[] = [
  // ── Completions ──
  {
    id:           "first-blood",
    name:         "First Blood",
    description:  "Logged your very first completed adventure. Every legend starts somewhere.",
    color:        "#10b981",
    icon:         "CheckCircle2",
    tier:         "tier3" as const,
    condition:    "Complete 1 adventure",
    minCompleted: 1,
  },
  // ── Wishlist ──
  {
    id:            "window-shopper",
    name:          "Window Shopper",
    description:   "First adventure wishlisted. The dreaming has begun.",
    color:         "#f43f5e",
    icon:          "Compass",
    tier:          "tier3" as const,
    condition:     "Wishlist 1 adventure",
    minWishlisted: 1,
  },
  {
    id:            "dream-collector",
    name:          "Dream Collector",
    description:   "10 adventures wishlisted. The bucket list is getting serious.",
    color:         "#f43f5e",
    icon:          "Heart",
    tier:          "tier3" as const,
    condition:     "Wishlist 10 adventures",
    minWishlisted: 10,
  },
  // ── Reviews ──
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
  // ── Photos ──
  {
    id:          "shutter-bug",
    name:        "Shutter Bug",
    description: "Uploaded your first adventure photo. Every adventure deserves proof.",
    color:       "#3b82f6",
    icon:        "Camera",
    tier:        "tier3" as const,
    condition:   "Upload 1 photo",
    minPhotos:   1,
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

/** `ace` is null before the ACE assessment: skill badges stay locked, everything else still counts */
export function getAchievements(ace: ACE | null, totalXP = 0, engagement: EngagementStats = {}): Achievement[] {
  const earned: Achievement[] = [];

  const axes = ace ? (Object.keys(ace) as (keyof ACE)[]) : [];
  const maxed = (ax: keyof ACE) => !!ace && ace[ax] >= 5;
  const eliteCount = axes.filter(maxed).length;

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
    if (badge.axes) {
      if (badge.axes.every(maxed)) earned.push({ ...badge });
    } else {
      let qualifies = false;
      if (badge.minReviews  != null && (engagement.reviews  ?? 0) >= badge.minReviews)  qualifies = true;
      if (badge.minCompares != null && (engagement.compares ?? 0) >= badge.minCompares) qualifies = true;
      if (badge.minPhotos   != null && (engagement.photos   ?? 0) >= badge.minPhotos)   qualifies = true;
      if (qualifies) earned.push({ ...badge });
    }
  }

  // Tier 3 — Axis
  for (const ax of axes) {
    if (maxed(ax)) {
      earned.push({ ...AXIS_BADGES[ax], tier: "tier3" });
    }
  }

  // Tier 3 — XP & Engagement
  for (const badge of XP_BADGES) {
    let qualifies = false;
    if (badge.minXP         != null && totalXP                 >= badge.minXP)         qualifies = true;
    if (badge.minCompleted  != null && (engagement.completed ?? 0) >= badge.minCompleted)  qualifies = true;
    if (badge.minReviews    != null && (engagement.reviews   ?? 0) >= badge.minReviews)    qualifies = true;
    if (badge.minWishlisted != null && (engagement.wishlisted ?? 0) >= badge.minWishlisted) qualifies = true;
    if (badge.minPhotos     != null && (engagement.photos    ?? 0) >= badge.minPhotos)     qualifies = true;
    if (badge.minCompares   != null && (engagement.compares  ?? 0) >= badge.minCompares)   qualifies = true;
    if (qualifies) earned.push({ ...badge });
  }

  return earned;
}

/** Every badge, rarest tier first */
export const ALL_BADGES: Achievement[] = [
  ...SPECIAL_BADGES,
  ...DOMAIN_BADGES,
  ...Object.values(AXIS_BADGES).map((b) => ({ ...b, tier: "tier3" as const })),
  ...XP_BADGES,
];

// ─── Progress toward a badge ─────────────────────────────────────────────────

const AXIS_NAME: Record<keyof ACE, string> = {
  stamina: "Stamina", power: "Power", strength: "Strength", agility: "Agility",
  water: "Water", altitude: "Altitude", focus: "Focus", nerve: "Nerve",
};

export interface BadgeProgress {
  /** How to unlock it, in a few words */
  hint: string;
  have: number;
  need: number;
}

/** How far someone is toward any badge, earned or not — the same rules getAchievements uses */
export function badgeProgress(id: string, ace: ACE | null, totalXP = 0, engagement: EngagementStats = {}): BadgeProgress | null {
  const maxedCount = (axes: (keyof ACE)[]) => axes.filter((ax) => !!ace && ace[ax] >= 5).length;
  const allAxes = Object.keys(AXIS_NAME) as (keyof ACE)[];

  const axisKey = allAxes.find((ax) => AXIS_BADGES[ax].id === id);
  if (axisKey) return { hint: `Score 5/5 for ${AXIS_NAME[axisKey]} in the ACE™ assessment`, have: maxedCount([axisKey]), need: 1 };

  const special = SPECIAL_BADGES.find((b) => b.id === id);
  if (special?.minXP != null) return { hint: `Earn ${special.minXP.toLocaleString("en-IN")} XP`, have: Math.min(totalXP, special.minXP), need: special.minXP };
  if (special?.minEliteAxes != null) {
    const n = special.minEliteAxes;
    return { hint: n === allAxes.length ? "Score 5/5 on all 8 ACE™ skills" : `Score 5/5 on ${n} ACE™ skills`, have: Math.min(maxedCount(allAxes), n), need: n };
  }

  const domain = DOMAIN_BADGES.find((b) => b.id === id);
  if (domain?.axes) return { hint: `Score 5/5 for ${domain.axes.map((ax) => AXIS_NAME[ax]).join(" and ")} in the ACE™ assessment`, have: maxedCount(domain.axes), need: domain.axes.length };

  const counted = domain ?? XP_BADGES.find((b) => b.id === id);
  if (!counted) return null;
  const rules: [number | undefined, number | undefined][] = [
    [counted.minReviews, engagement.reviews],
    [counted.minPhotos, engagement.photos],
    [counted.minCompares, engagement.compares],
    ["minCompleted" in counted ? counted.minCompleted : undefined, engagement.completed],
    ["minWishlisted" in counted ? counted.minWishlisted : undefined, engagement.wishlisted],
  ];
  const rule = rules.find(([need]) => need != null);
  if (!rule) return null;
  const need = rule[0]!;
  return { hint: counted.condition ?? "", have: Math.min(rule[1] ?? 0, need), need };
}

/** The locked badges closest to unlocking. Skill badges only count once there's an ACE result to measure. */
export function nextBadges(earnedIds: Set<string>, ace: ACE | null, totalXP = 0, engagement: EngagementStats = {}, count = 3): { badge: Achievement; progress: BadgeProgress }[] {
  const skillIds = new Set([
    ...Object.values(AXIS_BADGES).map((b) => b.id),
    ...DOMAIN_BADGES.filter((b) => b.axes).map((b) => b.id),
    ...SPECIAL_BADGES.filter((b) => b.minEliteAxes != null).map((b) => b.id),
  ]);
  return ALL_BADGES
    .filter((b) => !earnedIds.has(b.id) && (ace || !skillIds.has(b.id)))
    .flatMap((badge) => {
      const progress = badgeProgress(badge.id, ace, totalXP, engagement);
      return progress ? [{ badge, progress }] : [];
    })
    // A badge one action away (first review, first trip) counts as half done
    .map((x) => ({ ...x, score: x.progress.need === 1 && !skillIds.has(x.badge.id) ? 0.5 : x.progress.have / x.progress.need }))
    .sort((a, b) => b.score - a.score || a.progress.need - b.progress.need)
    .map(({ badge, progress }) => ({ badge, progress }))
    .slice(0, count);
}

/** How many skill badges are still locked — all of them before the ACE assessment */
export function lockedSkillBadgeCount(earnedIds: Set<string>): number {
  return [
    ...Object.values(AXIS_BADGES),
    ...DOMAIN_BADGES.filter((b) => b.axes),
    ...SPECIAL_BADGES.filter((b) => b.minEliteAxes != null),
  ].filter((b) => !earnedIds.has(b.id)).length;
}
