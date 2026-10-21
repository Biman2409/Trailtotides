"use client";

// The adventure filters Explore and the Map share: one state shape, one way to read and
// write it in the link, one filter function, the quick chips and the full panel. Keeping
// them here means both pages always offer exactly the same filters.

import { useEffect, useRef } from "react";
import { X, Crown } from "lucide-react";
import { adventures, getLowestPrice } from "@/lib/data";
import type { Adventure, AdventureType, Difficulty, Duration, Month } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";
import { bucketFor } from "@/lib/fitness";
import { toggleSelection as toggle } from "@/lib/filterOptions";
import { MONTHS, SORT_LABELS, matchesSearch, type SortKey } from "@/lib/exploreHelpers";

export type FitFilter = "ready" | "stretch";

export const DIFFICULTIES: Difficulty[] = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];
export const DURATIONS: Duration[] = ["Weekend", "3–5 days", "7+ days"];
export const PRICE_STEPS = [0, 10000, 20000, 40000, 75000];

// Only offer options that actually have adventures behind them — no dead ends.
export const TYPE_OPTIONS = [...new Set(adventures.map((a) => a.type))] as AdventureType[];
export const STATE_COUNTS = Object.entries(
  adventures.reduce<Record<string, number>>((acc, a) => {
    a.state.split("/").map((s) => s.trim()).forEach((s) => { acc[s] = (acc[s] ?? 0) + 1; });
    return acc;
  }, {})
).sort((x, y) => y[1] - x[1]);

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

/* ── Quick chips: the filters most people want, one tap away ─────────────────── */

export function QuickFilterChips({ f, set, thisMonth, hasFit, fitLabel = "Ready for me" }: {
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  thisMonth: Month;
  hasFit: boolean;
  fitLabel?: string;
}) {
  const inSeason = f.months.length === 1 && f.months[0] === thisMonth;
  return (
    <>
      <FilterChip on={inSeason} onClick={() => set({ months: inSeason ? [] : [thisMonth] })} dot="#10b981">In season now</FilterChip>
      {hasFit && (
        <>
          <FilterChip on={f.fit === "ready"} onClick={() => set({ fit: f.fit === "ready" ? null : "ready" })} dot="#10b981">{fitLabel}</FilterChip>
          <FilterChip on={f.fit === "stretch"} onClick={() => set({ fit: f.fit === "stretch" ? null : "stretch" })} dot="#f59e0b">A stretch</FilterChip>
        </>
      )}
      <FilterChip on={f.editorOnly} onClick={() => set({ editorOnly: !f.editorOnly })} icon={<Crown className="w-3.5 h-3.5" />}>Editor&apos;s Choice</FilterChip>
      <span className="w-px h-5 shrink-0" style={{ background: "var(--border-default)" }} />
      {STATE_COUNTS.slice(0, 6).map(([s, n]) => (
        <FilterChip key={s} on={f.states.includes(s)} onClick={() => toggle(f.states, s, (v) => set({ states: v }))}>
          {s} <span className="opacity-60">{n}</span>
        </FilterChip>
      ))}
      <span className="w-px h-5 shrink-0" style={{ background: "var(--border-default)" }} />
      {DURATIONS.map((d) => (
        <FilterChip key={d} on={f.durs.includes(d)} onClick={() => toggle(f.durs, d, (v) => set({ durs: v }))}>{d}</FilterChip>
      ))}
    </>
  );
}

export function FilterChip({ on, onClick, children, dot, icon }: { on: boolean; onClick: () => void; children: React.ReactNode; dot?: string; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors"
      style={on
        ? { background: "rgba(255,81,0,0.14)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.4)" }
        : { background: "var(--chip-bg, transparent)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
      {icon}
      {children}
    </button>
  );
}

/* ── Full panel: bottom sheet on phones, side drawer on larger screens ──────── */

export function FilterPanel({ f, set, onClose, onClear, resultCount, resultNoun = "adventure", sortKey, setSort, hasProfile }: {
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  onClose: () => void;
  onClear: () => void;
  resultCount: number;
  /** "Show 12 adventures" — the map says what it'll show on the map */
  resultNoun?: string;
  sortKey: SortKey;
  setSort: (v: SortKey) => void;
  hasProfile: boolean;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // Escape closes; the page behind doesn't scroll while the panel is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[2000]" role="dialog" aria-label="Filters">
      <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[400px] sm:max-h-none sm:rounded-none flex flex-col animate-in slide-in-from-bottom-6 sm:slide-in-from-right-6 duration-300"
        style={{ background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Filters</p>
          <button onClick={onClose} aria-label="Close filters" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-card-hover)]" style={{ color: "var(--text-secondary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Sort lives here on phones (the toolbar select is hidden there) */}
          <Section title="Sort by" className="md:hidden">
            {(Object.keys(SORT_LABELS) as SortKey[]).filter((k) => k !== "match" || hasProfile).map((k) => (
              <Opt key={k} on={sortKey === k} onClick={() => setSort(k)}>{SORT_LABELS[k]}</Opt>
            ))}
          </Section>
          <Section title="Activity">
            {TYPE_OPTIONS.map((t) => <Opt key={t} on={f.types.includes(t)} onClick={() => toggle(f.types, t, (v) => set({ types: v }))}>{t}</Opt>)}
          </Section>
          <Section title="Where">
            {STATE_COUNTS.map(([s, n]) => (
              <Opt key={s} on={f.states.includes(s)} onClick={() => toggle(f.states, s, (v) => set({ states: v }))}>{s} <span className="opacity-50">{n}</span></Opt>
            ))}
          </Section>
          <Section title="When do you want to go?">
            {MONTHS.map((m) => <Opt key={m} on={f.months.includes(m)} onClick={() => toggle(f.months, m, (v) => set({ months: v }))}>{m}</Opt>)}
          </Section>
          <Section title="Difficulty">
            {DIFFICULTIES.map((d) => <Opt key={d} on={f.diffs.includes(d)} onClick={() => toggle(f.diffs, d, (v) => set({ diffs: v }))}>{d}</Opt>)}
          </Section>
          <Section title="Length">
            {DURATIONS.map((d) => <Opt key={d} on={f.durs.includes(d)} onClick={() => toggle(f.durs, d, (v) => set({ durs: v }))}>{d}</Opt>)}
          </Section>
          <Section title="Budget (starting price)">
            {PRICE_STEPS.map((v) => (
              <Opt key={v} on={f.maxPrice === v} onClick={() => set({ maxPrice: v })}>
                {v === 0 ? "Any" : `Under ₹${v / 1000}k`}
              </Opt>
            ))}
          </Section>
        </div>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={onClear} className="px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
            Clear
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors">
            Show {resultCount} {resultCount === 1 ? resultNoun : `${resultNoun}s`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: "var(--text-tertiary)" }}>{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Opt({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
      style={on
        ? { background: "rgba(255,81,0,0.14)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.4)" }
        : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
    >
      {children}
    </button>
  );
}
