// Shared rank/tier definitions — single source of truth
// Rank is based on total ACE score (sum of 8 axes, each 1–5, range 8–40)
// Rank 1 = 8–15  | Rank 2 = 16–23 | Rank 3 = 24–31 | Rank 4 = 32–39 | Rank 5 = 40

export interface TierInfo {
  rank: number;
  color: string;
  stars: number;
}

export const TIERS: Record<string, TierInfo> = {
  "Uncharted":    { rank: 1, color: "#22d3ee", stars: 1 },
  "Trailblazer":  { rank: 2, color: "#4ade80", stars: 2 },
  "Navigator":    { rank: 3, color: "#f59e0b", stars: 3 },
  "Expeditioner": { rank: 4, color: "#f97316", stars: 4 },
  "Apex":         { rank: 5, color: "#a78bfa", stars: 5 },
};

export function getTier(label: string): TierInfo {
  return TIERS[label] ?? TIERS["Uncharted"];
}

export function getTierLabel(total: number): string {
  if (total >= 40) return "Apex";
  if (total >= 32) return "Expeditioner";
  if (total >= 24) return "Navigator";
  if (total >= 16) return "Trailblazer";
  return "Uncharted";
}
