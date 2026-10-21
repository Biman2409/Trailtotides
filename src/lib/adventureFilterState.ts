// The filter state Explore and the Map share, how it reads from and writes to a link, and
// the filter itself. Plain functions with no React, so the server can run them too (saved
// map searches are checked for new matches by the daily alerts job).

import { getLowestPrice } from "@/lib/data";
import type { Adventure, AdventureType, Difficulty, Duration, Month } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";
import { bucketFor } from "@/lib/fitness";
import { MONTHS, matchesSearch } from "@/lib/exploreHelpers";

export type FitFilter = "ready" | "stretch";

export interface AdventureFilterState {
  search: string;
  types: AdventureType[];
  states: string[];
  diffs: Difficulty[];
  durs: Duration[];
  months: Month[];
  maxPrice: number;
  fit: FitFilter | null;
  editorOnly: boolean;
}

export const NO_FILTERS: AdventureFilterState = {
  search: "", types: [], states: [], diffs: [], durs: [], months: [], maxPrice: 0, fit: null, editorOnly: false,
};

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/** Read filters from a link (old single-value params still work) */
export function filtersFromParams(p: URLSearchParams): AdventureFilterState {
  const fit = p.get("ace");
  return {
    search: p.get("q") ?? "",
    types: list(p.get("type")) as AdventureType[],
    states: list(p.get("state") ?? p.get("subRegion")),
    diffs: list(p.get("difficulty")) as Difficulty[],
    durs: list(p.get("dur")) as Duration[],
    months: list(p.get("month")).filter((m) => (MONTHS as string[]).includes(m)) as Month[],
    maxPrice: Number(p.get("max")) || 0,
    fit: fit === "ready" || fit === "stretch" ? fit : null,
    editorOnly: p.get("editor") === "1",
  };
}

/** Write filters into link params, so filtered views can be shared and carried between pages */
export function writeFilterParams(p: URLSearchParams, f: AdventureFilterState) {
  const set = (k: string, v: string) => (v ? p.set(k, v) : p.delete(k));
  set("q", f.search.trim());
  set("type", f.types.join(","));
  set("state", f.states.join(","));
  set("difficulty", f.diffs.join(","));
  set("dur", f.durs.join(","));
  set("month", f.months.join(","));
  set("max", f.maxPrice ? String(f.maxPrice) : "");
  set("ace", f.fit ?? "");
  set("editor", f.editorOnly ? "1" : "");
  p.delete("subRegion");
}

/** Filters in the panel (the badge on the Filters button) */
export function panelCount(f: AdventureFilterState) {
  return f.types.length + f.states.length + f.diffs.length + f.durs.length + f.months.length + (f.maxPrice ? 1 : 0);
}

export function anyFilter(f: AdventureFilterState) {
  return panelCount(f) > 0 || !!f.search || !!f.fit || f.editorOnly;
}

/** `score` rates an adventure for the visitor (or their group); without it the fit filter is ignored */
export function filterAdventures(all: Adventure[], f: AdventureFilterState, opts: { region?: string | null; score?: (a: Adventure) => number } = {}) {
  return all.filter((a) => {
    if (f.editorOnly && !a.editorChoice) return false;
    if (f.search && !matchesSearch(a, f.search)) return false;
    if (opts.region && a.region !== opts.region) return false;
    if (f.types.length && !f.types.includes(a.type)) return false;
    if (f.states.length && !f.states.some((s) => a.state.includes(s))) return false;
    if (f.diffs.length && !f.diffs.includes(computeDifficulty(getACE(a)) as Difficulty)) return false;
    if (f.durs.length && !f.durs.includes(a.duration)) return false;
    if (f.months.length && !f.months.some((m) => a.bestMonths.includes(m))) return false;
    if (f.maxPrice) {
      const p = getLowestPrice(a);
      if (p === null || p > f.maxPrice) return false;
    }
    if (f.fit && opts.score && bucketFor(opts.score(a)).key !== f.fit) return false;
    return true;
  });
}
