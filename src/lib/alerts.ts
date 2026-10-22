// What counts as news for the daily alerts job: a wishlisted adventure whose season opens
// next month or whose lowest price dropped, and adventures newly matching a saved map search.
// Plain functions, so they're easy to reason about apart from the job that sends the email.

import { adventures, getLowestPrice, type Adventure } from "@/lib/data";
import { MONTHS, MONTH_NAMES, currentMonthIndexIST } from "@/lib/homeCuration";
import { filtersFromParams, filterAdventures } from "@/lib/adventureFilterState";
import { haversineKm } from "@/lib/geo";

export const formatRupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** "2026-11" when the adventure's season starts next month (and it isn't in season now), else null */
export function seasonOpening(a: Adventure, now = new Date()): { key: string; month: string } | null {
  const cur = currentMonthIndexIST(now);
  const next = (cur + 1) % 12;
  if (a.bestMonths.includes(MONTHS[cur]) || !a.bestMonths.includes(MONTHS[next])) return null;
  const year = now.getUTCFullYear() + (next === 0 ? 1 : 0);
  return { key: `${year}-${String(next + 1).padStart(2, "0")}`, month: MONTH_NAMES[next] };
}

export interface AlertState { last_price: number | null; season_alerted: string | null }

/** What to tell the user about one wishlisted adventure, and the state to remember afterwards */
export function wishlistNews(a: Adventure, prev: AlertState | null, now = new Date()) {
  const lines: string[] = [];
  const price = getLowestPrice(a);
  // A drop needs a price we've seen before; the first sighting only sets the baseline
  if (price !== null && prev?.last_price && price < prev.last_price) {
    lines.push(`price down to ${formatRupees(price)} (was ${formatRupees(prev.last_price)})`);
  }
  const season = seasonOpening(a, now);
  if (season && prev?.season_alerted !== season.key) lines.push(`season opens in ${season.month}`);
  return {
    line: lines.length ? lines.join(", ") : null,
    next: { last_price: price, season_alerted: season?.key ?? prev?.season_alerted ?? null },
  };
}

/** Everything a saved map search matches today: the shared filters plus the map's Near me ring */
export function searchMatches(query: string): Adventure[] {
  const p = new URLSearchParams(query);
  // No visitor profile on the server, so the "Ready for me" filter is left out here
  let rows = filterAdventures(adventures, filtersFromParams(p));
  const near = nearFrom(p);
  if (near) rows = rows.filter((a) => haversineKm(near.lat, near.lng, a.lat, a.lng) <= near.radius);
  return rows;
}

/** The Near me part of a map link: near=lat,lng and r=km (0 or missing means any distance) */
export function nearFrom(p: URLSearchParams): { lat: number; lng: number; radius: number } | null {
  const [lat, lng] = (p.get("near") ?? "").split(",").map(Number);
  const radius = Number(p.get("r")) || 0;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !p.get("near") || !radius) return null;
  return { lat, lng, radius };
}
