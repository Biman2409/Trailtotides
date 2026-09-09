// Shared rank/tier definitions — single source of truth
// Rank is based on total ACE score (sum of 8 axes, each 1–5, range 8–40)
// Rank 1 = 8–15  | Rank 2 = 16–23 | Rank 3 = 24–31 | Rank 4 = 32–39 | Rank 5 = 40

export interface TierInfo {
  label: string;
  rank: number;
  color: string;
  stars: number;
  minScore: number;
}

// Ordered ascending by rank — every rank/color/stars/threshold lives here
// exactly once; RankBar, ACEProfileSection, and AvatarPicker all build their
// own views from this instead of hand-typing their own copies.
export const TIER_LIST: TierInfo[] = [
  { label: "Uncharted",   rank: 0, color: "#6b7280", stars: 0, minScore: 0  },
  { label: "Pathfinder",  rank: 1, color: "#22d3ee", stars: 1, minScore: 8  },
  { label: "Navigator",   rank: 2, color: "#4ade80", stars: 2, minScore: 16 },
  { label: "Trailblazer", rank: 3, color: "#f59e0b", stars: 3, minScore: 24 },
  { label: "Vanguard",    rank: 4, color: "#f97316", stars: 4, minScore: 32 },
  { label: "Apex",        rank: 5, color: "#a78bfa", stars: 5, minScore: 40 },
];

export const TIERS: Record<string, TierInfo> = Object.fromEntries(TIER_LIST.map((t) => [t.label, t]));

export function getTier(label: string): TierInfo {
  return TIERS[label] ?? TIERS["Uncharted"];
}

export function getTierLabel(total: number): string {
  for (let i = TIER_LIST.length - 1; i >= 0; i--) {
    if (total >= TIER_LIST[i].minScore) return TIER_LIST[i].label;
  }
  return "Uncharted";
}
