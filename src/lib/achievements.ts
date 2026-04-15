import type { ACE } from "./ace";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  color: string;
  /** Lucide icon name (string) — mapped in the component */
  icon: string;
  /** "axis" = single-axis elite | "domain" = 2-axis domain | "special" = multi/full | "xp" = engagement */
  tier: "axis" | "domain" | "special" | "xp" | "type";
  /** Human-readable unlock condition shown on locked trophies */
  condition?: string;
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

// ─── XP Trophies — reward engagement actions ─────────────────────────────────

export const XP_BADGES = [
  {
    id:          "first-blood",
    name:        "First Blood",
    description: "Logged your very first completed adventure. The journey begins.",
    color:       "#10b981",
    icon:        "CheckCircle2",
    tier:        "xp" as const,
    condition:   "Complete 1 adventure",
    minCompleted: 1,
  },
  {
    id:          "trail-blazer",
    name:        "Trail Blazer",
    description: "5 adventures in the log. You're building a real expedition record.",
    color:       "#f97316",
    icon:        "Map",
    tier:        "xp" as const,
    condition:   "Complete 5 adventures",
    minCompleted: 5,
  },
  {
    id:          "seasoned-explorer",
    name:        "Seasoned Explorer",
    description: "10 adventures done. Half-way to legendary status.",
    color:       "#fbbf24",
    icon:        "Compass",
    tier:        "xp" as const,
    condition:   "Complete 10 adventures",
    minCompleted: 10,
  },
  {
    id:          "critic",
    name:        "The Critic",
    description: "Left your first review. Your voice shapes the expedition community.",
    color:       "#f59e0b",
    icon:        "Star",
    tier:        "xp" as const,
    condition:   "Write 1 review",
    minReviews:  1,
  },
  {
    id:          "dream-collector",
    name:        "Dream Collector",
    description: "10 adventures wishlisted. The bucket list is getting serious.",
    color:       "#f43f5e",
    icon:        "Heart",
    tier:        "xp" as const,
    condition:   "Wishlist 10 adventures",
    minWishlisted: 10,
  },
  {
    id:          "pen-and-trail",
    name:        "Pen & Trail",
    description: "5 reviews written. The community reads your words.",
    color:       "#f59e0b",
    icon:        "Star",
    tier:        "xp" as const,
    condition:   "Write 5 reviews",
    minReviews:  5,
  },
  {
    id:          "wishlist-1",
    name:        "Window Shopper",
    description: "First adventure wishlisted. The dreaming has begun.",
    color:       "#f43f5e",
    icon:        "Heart",
    tier:        "xp" as const,
    condition:   "Wishlist 1 adventure",
    minWishlisted: 1,
  },
  {
    id:          "shutter-chaser",
    name:        "Shutter Chaser",
    description: "Uploaded your first adventure photo. Every summit deserves proof.",
    color:       "#3b82f6",
    icon:        "Camera",
    tier:        "xp" as const,
    condition:   "Upload 1 photo",
    minPhotos:   1,
  },
  {
    id:          "lens-legend",
    name:        "Lens Legend",
    description: "5 adventure photos uploaded. Your feed is the envy of the trail.",
    color:       "#3b82f6",
    icon:        "Camera",
    tier:        "xp" as const,
    condition:   "Upload 5 photos",
    minPhotos:   5,
  },
  {
    id:          "the-analyst",
    name:        "The Analyst",
    description: "First comparison made. You don't just pick adventures — you study them.",
    color:       "#a78bfa",
    icon:        "GitCompare",
    tier:        "xp" as const,
    condition:   "Compare 1 adventure",
    minCompares: 1,
  },
  {
    id:          "comparison-king",
    name:        "Comparison King",
    description: "5 comparisons done. No adventure gets past your scrutiny.",
    color:       "#a78bfa",
    icon:        "GitCompare",
    tier:        "xp" as const,
    condition:   "Compare 5 adventures",
    minCompares: 5,
  },
  {
    id:          "xp-500",
    name:        "500 Club",
    description: "500 XP earned. You're officially on the board.",
    color:       "#60a5fa",
    icon:        "Zap",
    tier:        "xp" as const,
    condition:   "Earn 500 XP",
    minXP:       500,
  },
  {
    id:          "xp-2000",
    name:        "2K Grinder",
    description: "2,000 XP earned. Commitment is your middle name.",
    color:       "#a78bfa",
    icon:        "TrendingUp",
    tier:        "xp" as const,
    condition:   "Earn 2,000 XP",
    minXP:       2000,
  },
  {
    id:          "xp-5000",
    name:        "5K Veteran",
    description: "5,000 XP and counting. An expedition career worth talking about.",
    color:       "#fb923c",
    icon:        "Award",
    tier:        "xp" as const,
    condition:   "Earn 5,000 XP",
    minXP:       5000,
  },
];

// ─── Adventure-type trophies ──────────────────────────────────────────────────

export const TYPE_BADGES = [
  // ── Trekking ──
  { id: "boot-initiate",    name: "Boot Initiate",    description: "First trek logged. One trail down, thousands to go.",                          color: "#10b981", icon: "Footprints", tier: "type" as const, adventureType: "Trekking",      minCount: 1,  condition: "Complete 1 trek" },
  { id: "ridge-walker",     name: "Ridge Walker",     description: "5 treks in the bag. You know the rhythm of the mountains.",                    color: "#10b981", icon: "MountainSnow", tier: "type" as const, adventureType: "Trekking",    minCount: 5,  condition: "Complete 5 treks" },
  { id: "mountain-monk",    name: "Mountain Monk",    description: "10 treks completed. The trail is home.",                                        color: "#10b981", icon: "Compass",    tier: "type" as const, adventureType: "Trekking",      minCount: 10, condition: "Complete 10 treks" },

  // ── Mountaineering ──
  { id: "summit-seeker",    name: "Summit Seeker",    description: "First peak bagged. The summit hunger is real.",                                 color: "#a78bfa", icon: "MountainSnow", tier: "type" as const, adventureType: "Mountaineering", minCount: 1, condition: "Complete 1 mountaineering" },
  { id: "peak-bagger",      name: "Peak Bagger",      description: "3 summits. Altitude is your natural habitat.",                                  color: "#a78bfa", icon: "Wind",       tier: "type" as const, adventureType: "Mountaineering", minCount: 3,  condition: "Complete 3 mountaineering" },

  // ── Biking ──
  { id: "gravel-rookie",    name: "Gravel Rookie",    description: "First MTB adventure in the log. The dirt calls you back.",                     color: "#f97316", icon: "Zap",        tier: "type" as const, adventureType: "Biking",         minCount: 1,  condition: "Complete 1 biking" },
  { id: "trail-shredder",   name: "Trail Shredder",   description: "3 biking adventures done. Two wheels, no limits.",                             color: "#f97316", icon: "Timer",      tier: "type" as const, adventureType: "Biking",         minCount: 3,  condition: "Complete 3 biking" },

  // ── Rock Climbing ──
  { id: "crag-rat",         name: "Crag Rat",         description: "First route sent. The rock face is where you feel alive.",                     color: "#fb923c", icon: "Dumbbell",   tier: "type" as const, adventureType: "Rock Climbing",  minCount: 1,  condition: "Complete 1 rock climbing" },
  { id: "vertical-addict",  name: "Vertical Addict",  description: "3 rock climbs logged. Gravity is just a suggestion.",                         color: "#fb923c", icon: "Shield",     tier: "type" as const, adventureType: "Rock Climbing",  minCount: 3,  condition: "Complete 3 rock climbing" },

  // ── Kayaking / Water ──
  { id: "paddle-starter",   name: "Paddle Starter",   description: "First paddle adventure completed. You're at home on the water.",               color: "#22d3ee", icon: "Waves",      tier: "type" as const, adventureType: "Kayaking",       minCount: 1,  condition: "Complete 1 kayaking" },
  { id: "river-runner",     name: "River Runner",     description: "3 kayaking trips done. The current is just the beginning.",                    color: "#22d3ee", icon: "Waves",      tier: "type" as const, adventureType: "Kayaking",       minCount: 3,  condition: "Complete 3 kayaking" },

  // ── Diving ──
  { id: "first-dive",       name: "First Dive",       description: "First dive logged. The underwater world is yours to explore.",                 color: "#3b82f6", icon: "Waves",      tier: "type" as const, adventureType: "Diving",         minCount: 1,  condition: "Complete 1 diving" },

  // ── Skiing ──
  { id: "fresh-tracks",     name: "Fresh Tracks",     description: "First ski adventure on the board. The powder doesn't stand a chance.",        color: "#e0f2fe", icon: "Wind",       tier: "type" as const, adventureType: "Skiing",         minCount: 1,  condition: "Complete 1 skiing" },

  // ── Paragliding ──
  { id: "first-flight",     name: "First Flight",     description: "First paragliding adventure. You've tasted the sky.",                         color: "#fbbf24", icon: "Wind",       tier: "type" as const, adventureType: "Paragliding",    minCount: 1,  condition: "Complete 1 paragliding" },

  // ── Cross-type ──
  { id: "type-explorer",    name: "Type Explorer",    description: "3 different adventure types completed. Refusing to be put in a box.",         color: "#f43f5e", icon: "Compass",    tier: "type" as const, adventureType: null,             minTypes: 3,  condition: "Complete 3 different adventure types" },
  { id: "all-terrain",      name: "All Terrain",      description: "5 different adventure types. Land, water, sky — you've done it all.",        color: "#fbbf24", icon: "Globe",      tier: "type" as const, adventureType: null,             minTypes: 5,  condition: "Complete 5 different adventure types" },
];

// ─── Core function ────────────────────────────────────────────────────────────

export interface EngagementStats {
  completed?: number;
  reviews?: number;
  wishlisted?: number;
  photos?: number;
  compares?: number;
  /** Count of completed adventures per type, e.g. { Trekking: 3, Biking: 1 } */
  byType?: Partial<Record<string, number>>;
  /** Number of distinct adventure types completed */
  distinctTypes?: number;
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

  // Adventure-type trophies
  for (const badge of TYPE_BADGES) {
    let qualifies = false;
    if (badge.adventureType && "minCount" in badge && badge.minCount != null) {
      const count = engagement.byType?.[badge.adventureType] ?? 0;
      if (count >= badge.minCount) qualifies = true;
    }
    if (!badge.adventureType && "minTypes" in badge && badge.minTypes != null) {
      if ((engagement.distinctTypes ?? 0) >= badge.minTypes) qualifies = true;
    }
    if (qualifies) earned.push({ ...badge });
  }

  return earned;
}
