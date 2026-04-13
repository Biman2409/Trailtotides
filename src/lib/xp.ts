// ─── XP Actions ───────────────────────────────────────────────────────────────

export type XPAction =
  | "ace_complete"
  | "checkin"
  | "review"
  | "photo"
  | "wishlist"
  | "compare"
  | "trip_log";

export const XP_REWARDS: Record<XPAction, number> = {
  ace_complete: 100,
  checkin:      20,
  review:       30,
  photo:        30,
  wishlist:     20,
  compare:      20,
  trip_log:     20,
};

export const XP_LABELS: Record<XPAction, string> = {
  ace_complete: "ACE Assessment",
  checkin:      "Check-in",
  review:       "Review",
  photo:        "Photo upload",
  wishlist:     "Wishlist save",
  compare:      "Compare",
  trip_log:     "Trip logged",
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
  { level: 1,  name: "Uncharted",   minXP: 0,    color: "#6b7280", description: "Your journey begins." },
  { level: 2,  name: "Wanderer",    minXP: 80,   color: "#84cc16", description: "Curiosity is your compass." },
  { level: 3,  name: "Pathfinder",  minXP: 200,  color: "#22d3ee", description: "You're finding your trail." },
  { level: 4,  name: "Navigator",   minXP: 380,  color: "#3b82f6", description: "Reading the terrain with ease." },
  { level: 5,  name: "Trailblazer", minXP: 620,  color: "#8b5cf6", description: "Blazing new routes." },
  { level: 6,  name: "Vanguard",    minXP: 940,  color: "#f59e0b", description: "Leading the charge into the wild." },
  { level: 7,  name: "Apex",        minXP: 1350, color: "#f97316", description: "At the peak of the pursuit." },
  { level: 8,  name: "Expedition",  minXP: 1900, color: "#ef4444", description: "Built for the long haul." },
  { level: 9,  name: "Legend",      minXP: 2600, color: "#ec4899", description: "Stories told around campfires." },
  { level: 10, name: "Immortal",    minXP: 3500, color: "#fbbf24", description: "The mountain bows to you." },
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
