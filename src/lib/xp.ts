// ─── XP Actions ───────────────────────────────────────────────────────────────

export type XPAction =
  | "ace_complete"
  | "review"
  | "photo"
  | "wishlist"
  | "compare"
  | "trip_log";

export const XP_REWARDS: Record<XPAction, number> = {
  ace_complete: 200,
  trip_log:     100,
  review:       200,
  photo:        100,
  wishlist:     100,
  compare:      100,
};

export const XP_LABELS: Record<XPAction, string> = {
  ace_complete: "ACE Assessment",
  review:       "Review",
  photo:        "Photo upload",
  wishlist:     "Wishlist save",
  compare:      "Compare",
  trip_log:     "Adventure completed",
};

// ─── Tiers ────────────────────────────────────────────────────────────────────

export interface XPTier {
  level: number;
  name: string;
  minXP: number;
  color: string;
  description: string;
}

// Gaps: 250 → 400 → 600 → 850 → 1150 → 1550 → 2000 → 3200 (strictly increasing, sum = 10 000)
export const XP_TIERS: XPTier[] = [
  { level: 1, name: "Toddler",      minXP: 0,     color: "#6b7280", description: "First steps into the wild." },
  { level: 2, name: "Wanderer",     minXP: 250,   color: "#84cc16", description: "Curiosity is your compass." },
  { level: 3, name: "Rover",        minXP: 650,   color: "#22d3ee", description: "Reading the terrain with ease." },
  { level: 4, name: "Rambler",      minXP: 1250,  color: "#3b82f6", description: "Blazing new routes." },
  { level: 5, name: "Expeditioner", minXP: 2100,  color: "#8b5cf6", description: "Leading the charge into the wild." },
  { level: 6, name: "Summiteer",    minXP: 3250,  color: "#f59e0b", description: "At the peak of the pursuit." },
  { level: 7, name: "Wildlander",   minXP: 4800,  color: "#f97316", description: "Built for the long haul." },
  { level: 8, name: "Legend",       minXP: 6800,  color: "#ef4444", description: "Stories told around campfires." },
  { level: 9, name: "Immortal",     minXP: 10000, color: "#fbbf24", description: "The mountain bows to you." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTier(xp: number): XPTier {
  for (let i = XP_TIERS.length - 1; i >= 0; i--) {
    if (xp >= XP_TIERS[i].minXP) return XP_TIERS[i];
  }
  return XP_TIERS[0];
}

export function getNextTier(xp: number): XPTier | null {
  const current = getTier(xp);
  return XP_TIERS.find(t => t.level === current.level + 1) ?? null;
}

export function getProgressPct(xp: number): number {
  const current = getTier(xp);
  const next = getNextTier(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const earned = xp - current.minXP;
  return Math.min(100, Math.round((earned / range) * 100));
}
