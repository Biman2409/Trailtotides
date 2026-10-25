// ─── XP Actions ───────────────────────────────────────────────────────────────

export type XPAction =
  | "ace_complete"
  | "review"
  | "photo"
  | "wishlist"
  | "compare"
  | "trip_log";

export const XP_REWARDS: Record<XPAction, number> = {
  ace_complete: 300,
  trip_log:     150,
  review:       100,
  photo:        50,
  wishlist:     100,
  compare:      100,
};

/** How many of each action earn XP. Every cap filled adds up to exactly MAX_XP — so
 *  "It's Over 9000!" means you've done it all, not that you posted a lot of reviews. */
export const XP_CAPS: Record<XPAction, number> = {
  ace_complete: 1,   //   300
  trip_log:     30,  // 4,500
  review:       20,  // 2,000
  photo:        40,  // 2,000 (and at most 3 per adventure)
  wishlist:     1,   //   100
  compare:      1,   //   100
};

export const MAX_XP = (Object.keys(XP_CAPS) as XPAction[]).reduce((sum, a) => sum + XP_CAPS[a] * XP_REWARDS[a], 0); // 9,000

export const XP_LABELS: Record<XPAction, string> = {
  ace_complete: "ACE™ Assessment",
  review:       "Review",
  photo:        "Photo upload",
  wishlist:     "Wishlist save",
  compare:      "Compare",
  trip_log:     "Adventure completed",
};

/** Total XP from someone's XP events: today's reward for each action, up to its cap.
 *  Worked out from the actions rather than the XP stored on each event, so changing
 *  the rewards re-scores everyone the same way. */
export function xpFromEvents(events: { action: string; revoked?: boolean }[]): number {
  const counts = new Map<string, number>();
  for (const e of events) if (!e.revoked) counts.set(e.action, (counts.get(e.action) ?? 0) + 1);
  return (Object.keys(XP_REWARDS) as XPAction[]).reduce((sum, a) => sum + Math.min(counts.get(a) ?? 0, XP_CAPS[a]) * XP_REWARDS[a], 0);
}

// ─── Tiers ────────────────────────────────────────────────────────────────────

export interface XPTier {
  level: number;
  name: string;
  minXP: number;
  color: string;
  description: string;
}

// Legend sits below the 9,000 maximum: the last stretch to the max is what the badge is for
export const XP_TIERS: XPTier[] = [
  { level: 1, name: "Toddler",      minXP: 0,    color: "#6b7280", description: "First steps into the wild." },
  { level: 2, name: "Drifter",      minXP: 200,  color: "#84cc16", description: "Curiosity is your compass." },
  { level: 3, name: "Wanderer",     minXP: 500,  color: "#22d3ee", description: "Finding your way." },
  { level: 4, name: "Rambler",      minXP: 1000, color: "#3b82f6", description: "The open road calls." },
  { level: 5, name: "Rover",        minXP: 1800, color: "#8b5cf6", description: "Reading terrain with ease." },
  { level: 6, name: "Explorer",     minXP: 3000, color: "#f59e0b", description: "Charting the unknown." },
  { level: 7, name: "Expeditioner", minXP: 4500, color: "#f97316", description: "Leading the charge." },
  { level: 8, name: "Summiteer",    minXP: 6500, color: "#ef4444", description: "At the peak of the pursuit." },
  { level: 9, name: "Legend",       minXP: 8000, color: "#ec4899", description: "Stories told around campfires." },
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

/** Progress through the current level — or, at the top level, toward the maximum */
export function getProgressPct(xp: number): number {
  const current = getTier(xp);
  const target = getNextTier(xp)?.minXP ?? MAX_XP;
  if (xp >= target) return 100;
  return Math.min(100, Math.round(((xp - current.minXP) / (target - current.minXP)) * 100));
}
