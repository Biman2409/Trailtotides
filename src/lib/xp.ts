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
  ace_complete: "ACE™ Assessment",
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

export const XP_TIERS: XPTier[] = [
  { level: 1, name: "Toddler",      minXP: 0,    color: "#6b7280", description: "First steps into the wild." },
  { level: 2, name: "Drifter",      minXP: 200,  color: "#84cc16", description: "Curiosity is your compass." },
  { level: 3, name: "Wanderer",     minXP: 500,  color: "#22d3ee", description: "Finding your way." },
  { level: 4, name: "Rambler",      minXP: 1000, color: "#3b82f6", description: "The open road calls." },
  { level: 5, name: "Rover",        minXP: 1800, color: "#8b5cf6", description: "Reading terrain with ease." },
  { level: 6, name: "Explorer",     minXP: 3000, color: "#f59e0b", description: "Charting the unknown." },
  { level: 7, name: "Expeditioner", minXP: 4500, color: "#f97316", description: "Leading the charge." },
  { level: 8, name: "Summiteer",    minXP: 6500, color: "#ef4444", description: "At the peak of the pursuit." },
  { level: 9, name: "Legend",       minXP: 9000, color: "#ec4899", description: "Stories told around campfires." },
];

export const OVER_9000_THRESHOLD = 9000;
export const OVER_9000_COLOR = "#fbbf24";

export function isOver9000(xp: number): boolean {
  return xp >= OVER_9000_THRESHOLD;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTier(xp: number): XPTier {
  for (let i = XP_TIERS.length - 1; i >= 0; i--) {
    if (xp >= XP_TIERS[i].minXP) return XP_TIERS[i];
  }
  return XP_TIERS[0];
}

export function getNextTier(xp: number): XPTier | null {
  if (xp >= OVER_9000_THRESHOLD) return null; // Legend+ — no next tier, XP is uncapped
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
