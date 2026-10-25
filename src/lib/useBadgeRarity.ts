"use client";

import { useEffect, useState } from "react";

// How rare each badge is ("Earned by 12% of explorers"), fetched once per page load.
// Stays quiet until there are enough accounts for the numbers to mean something.

const MIN_ACCOUNTS = 25;

type Rarity = { total: number; counts: Record<string, number> };
let pending: Promise<Rarity | null> | null = null;

export function useBadgeRarity(): (id: string) => string | null {
  const [data, setData] = useState<Rarity | null>(null);
  useEffect(() => {
    pending ??= fetch("/api/badge-rarity").then((r) => (r.ok ? r.json() : null)).catch(() => null);
    let live = true;
    pending.then((d) => { if (live) setData(d); });
    return () => { live = false; };
  }, []);

  return (id) => {
    if (!data || data.total < MIN_ACCOUNTS) return null;
    const pct = ((data.counts[id] ?? 0) / data.total) * 100;
    return `Earned by ${pct > 0 && pct < 1 ? "under 1" : Math.round(pct)}% of explorers`;
  };
}
