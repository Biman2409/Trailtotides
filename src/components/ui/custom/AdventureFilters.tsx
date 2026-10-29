"use client";

// The adventure filters Explore and the Map share: one state shape, one way to read and
// write it in the link, one filter function, the quick chips and the full panel. Keeping
// them here means both pages always offer exactly the same filters.

import { useEffect, useRef, useState } from "react";
import { X, Crown, ChevronDown, Shapes, MapPin } from "lucide-react";
import { adventures, getLowestPrice } from "@/lib/data";
import type { AdventureType, Difficulty, Duration, Month } from "@/lib/data";
import { toggleSelection as toggle, GENRE_GROUPS } from "@/lib/filterOptions";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import { REGION_STATES, REGION_ORDER } from "@/lib/regionGroups";
import { MONTHS, SORT_LABELS, type SortKey } from "@/lib/exploreHelpers";
import { currentMonthIndexIST } from "@/lib/homeCuration";

export type { FitFilter, AdventureFilterState } from "@/lib/adventureFilterState";
export { NO_FILTERS, filtersFromParams, writeFilterParams, panelCount, anyFilter, filterAdventures } from "@/lib/adventureFilterState";
import type { AdventureFilterState } from "@/lib/adventureFilterState";

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
        ? { background: "rgba(255,81,0,0.14)", color: "var(--accent-ink-soft)", border: "1px solid rgba(255,81,0,0.4)" }
        : { background: "var(--chip-bg, transparent)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
      {icon}
      {children}
    </button>
  );
}

/* ── Type and Region: the two broad categories, as on the home page ────────────── */

// Type is Earth / Water / Snow / Air (the home page's "Find your format"); Region is the home
// page's "Find by region". Each group lists everything under it, live ones to pick and the rest
// marked Soon, so the whole range is in view. Tapping a group's name picks all its live
// entries. They drive the same type and state filters as before, so links and the Explore ↔ map
// hand-off carry them.

type CatEntry = { key: string; n: number; icon?: React.ReactNode };
type CatGroup = { label: string; light: string; dark: string; entries: CatEntry[] };

const GENRE_LOOK: Record<string, { light: string; dark: string }> = {
  Earth: { light: "#b45309", dark: "#ff9a66" },
  Water: { light: "#0e7490", dark: "#6ff0e0" },
  Snow:  { light: "#4f46e5", dark: "#b9c3ff" },
  Air:   { light: "#a16207", dark: "#ffd27a" },
};
const REGION_LOOK = { light: "#15803d", dark: "#7edc96" };

const TYPE_COUNTS = adventures.reduce<Record<string, number>>((acc, a) => { acc[a.type] = (acc[a.type] ?? 0) + 1; return acc; }, {});
const stateCount = (s: string) => adventures.filter((a) => a.state.includes(s)).length;

export const TYPE_GROUPS: CatGroup[] = ["Earth", "Water", "Snow", "Air"].map((label) => {
  const g = GENRE_GROUPS.find((x) => x.label === label)!;
  return { label, ...GENRE_LOOK[label], entries: g.types.map((t) => ({ key: t, n: TYPE_COUNTS[t] ?? 0, icon: ADVENTURE_TYPE_ICONS[t]?.(12) })) };
});

export const REGION_GROUPS: CatGroup[] = REGION_ORDER.map((label) => ({
  label, ...REGION_LOOK,
  entries: REGION_STATES[label].map((s) => ({ key: s, n: stateCount(s) })),
}));

const groupTotal = (g: CatGroup, field: "types" | "states") =>
  field === "types"
    ? g.entries.reduce((s, e) => s + e.n, 0)
    // A region's adventures, each counted once even when it lists two of the region's states
    : adventures.filter((a) => g.entries.some((e) => e.n && a.state.includes(e.key))).length;

/** Every group in a category with all its entries; the body of the Type and Region menus */
export function CategoryList({ kind, f, set, columns = 2 }: {
  kind: "type" | "region";
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  /** Groups side by side on wide screens */
  columns?: 1 | 2;
}) {
  const field = kind === "type" ? "types" : "states";
  const groups = kind === "type" ? TYPE_GROUPS : REGION_GROUPS;
  const picked = f[field] as string[];
  const write = (v: string[]) => set({ [field]: v } as Partial<AdventureFilterState>);
  const sorted = [...groups].sort((a, b) => (groupTotal(b, field) ? 1 : 0) - (groupTotal(a, field) ? 1 : 0));

  return (
    <div className={`ttt-cats grid gap-x-5 gap-y-3.5 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      <style>{CAT_CSS}</style>
      {sorted.map((g) => {
        const live = g.entries.filter((e) => e.n).map((e) => e.key);
        const total = groupTotal(g, field);
        const allOn = live.length > 0 && live.every((k) => picked.includes(k));
        const look = { "--g-l": g.light, "--g-d": g.dark } as React.CSSProperties;
        return (
          <div key={g.label} style={look}>
            <button type="button" disabled={!total} aria-pressed={allOn}
              onClick={() => write(allOn ? picked.filter((k) => !live.includes(k)) : [...new Set([...picked, ...live])])}
              className="ttt-cat-head" data-on={allOn || undefined}
              title={total ? `All of ${g.label}` : `${g.label} adventures are coming soon`}>
              <span className="ttt-cat-dot" />{g.label}
              <span className="ttt-cat-n">{total || "Soon"}</span>
            </button>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {g.entries.map((e) => {
                const on = picked.includes(e.key);
                return (
                  <button key={e.key} type="button" disabled={!e.n} aria-pressed={on}
                    onClick={() => toggle(picked, e.key, write)}
                    className="ttt-cat-item" data-on={on || undefined} title={e.n ? undefined : `${e.key} is coming soon`}>
                    {e.icon && <span className="grid place-items-center opacity-90">{e.icon}</span>}
                    {e.key}<span className="ttt-cat-item-n">{e.n || "Soon"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** "Type" / "Region" with what's picked: "Trekking +2" */
export function categoryLabel(kind: "type" | "region", f: AdventureFilterState) {
  const picked = kind === "type" ? f.types : f.states;
  const name = kind === "type" ? "Type" : "Region";
  return !picked.length ? name : picked.length === 1 ? picked[0] : `${picked[0]} +${picked.length - 1}`;
}

/** The two category buttons, each opening its list in a popover; extra buttons go at the end */
export function CategoryBar({ f, set, trailing }: {
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  trailing?: React.ReactNode;
}) {
  const [open, setOpen] = useState<"type" | "region" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const btn = (kind: "type" | "region", icon: React.ReactNode) => {
    const n = (kind === "type" ? f.types : f.states).length;
    const isOpen = open === kind;
    return (
      <button type="button" onClick={() => setOpen(isOpen ? null : kind)} aria-expanded={isOpen}
        className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl text-sm font-medium transition-colors min-w-0"
        style={n || isOpen
          ? { background: "rgba(255,81,0,0.1)", color: "var(--accent-ink-soft)", border: "1px solid rgba(255,81,0,0.4)" }
          : { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}>
        <span className="shrink-0 hidden sm:inline">{icon}</span>
        <span className="truncate max-w-[9rem]">{categoryLabel(kind, f)}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    );
  };

  return (
    <div ref={wrapRef} className="relative flex items-center gap-2 sm:flex-wrap">
      {btn("type", <Shapes className="w-4 h-4" />)}
      {btn("region", <MapPin className="w-4 h-4" />)}
      {trailing}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-[60] w-[min(92vw,620px)] max-h-[min(70vh,560px)] overflow-y-auto rounded-2xl p-4 shadow-2xl"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }} role="dialog" aria-label={open === "type" ? "Adventure type" : "Region"}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{open === "type" ? "Adventure type" : "Region"}</p>
            {(open === "type" ? f.types : f.states).length > 0 && (
              <button type="button" onClick={() => set(open === "type" ? { types: [] } : { states: [] })} className="text-[12px] font-semibold text-[#ff7d47] hover:underline">
                {open === "type" ? "All types" : "Anywhere"}
              </button>
            )}
          </div>
          <CategoryList kind={open} f={f} set={set} />
        </div>
      )}
    </div>
  );
}

const CAT_CSS = `
.ttt-cats > div { --g: var(--g-l); }
.dark .ttt-cats > div { --g: var(--g-d); }
.ttt-cat-head { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 700; color: var(--text-primary); border-radius: 8px; padding: 2px 6px 2px 2px; transition: color .2s; }
.ttt-cat-head:hover:not(:disabled), .ttt-cat-head[data-on] { color: var(--g); }
.ttt-cat-head:disabled { color: var(--text-tertiary); cursor: default; }
.ttt-cat-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--g); box-shadow: 0 0 8px color-mix(in srgb, var(--g) 60%, transparent); }
.ttt-cat-head:disabled .ttt-cat-dot { opacity: .45; box-shadow: none; }
.ttt-cat-n { font-size: 10.5px; font-weight: 700; padding: 1px 6px; border-radius: 999px; background: color-mix(in srgb, var(--g) 14%, transparent); color: var(--g); }
.ttt-cat-item { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 6px 0 9px; border-radius: 9px; font-size: 12px; font-weight: 600;
  color: var(--text-secondary); background: var(--bg-card); border: 1px solid color-mix(in srgb, var(--g) 30%, transparent); transition: all .2s; }
.ttt-cat-item:hover:not(:disabled) { color: var(--text-primary); border-color: color-mix(in srgb, var(--g) 60%, transparent); }
.ttt-cat-item[data-on] { color: #fff; background: var(--g); border-color: var(--g); }
.dark .ttt-cat-item[data-on] { color: #15110e; }
.ttt-cat-item:disabled { opacity: .45; cursor: default; border-style: dashed; background: transparent; }
.ttt-cat-item-n { font-size: 10.5px; opacity: .7; }
`;

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
          {/* Type and Region have their own buttons; this panel holds everything broader */}
          <PriceSlider value={f.maxPrice} onChange={(v) => set({ maxPrice: v })} />
          <Section title="Season: when do you want to go?">
            <Opt on={f.months.length === 1 && f.months[0] === THIS_MONTH} onClick={() => set({ months: f.months.length === 1 && f.months[0] === THIS_MONTH ? [] : [THIS_MONTH] })}>
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />In season now</span>
            </Opt>
            <div className="w-full grid grid-cols-6 gap-1.5 mt-1">
              {MONTHS.map((m) => (
                <Opt key={m} on={f.months.includes(m)} onClick={() => toggle(f.months, m, (v) => set({ months: v }))} block>{m}</Opt>
              ))}
            </div>
          </Section>
          <Section title="Duration">
            {DURATIONS.map((d) => <Opt key={d} on={f.durs.includes(d)} onClick={() => toggle(f.durs, d, (v) => set({ durs: v }))}>{d}</Opt>)}
          </Section>
          <Section title="Difficulty">
            {DIFFICULTIES.map((d) => <Opt key={d} on={f.diffs.includes(d)} onClick={() => toggle(f.diffs, d, (v) => set({ diffs: v }))}>{d}</Opt>)}
          </Section>
          {hasProfile && (
            <Section title="Your fitness">
              <Opt on={f.fit === "ready"} onClick={() => set({ fit: f.fit === "ready" ? null : "ready" })}>Ready for me</Opt>
              <Opt on={f.fit === "stretch"} onClick={() => set({ fit: f.fit === "stretch" ? null : "stretch" })}>A stretch</Opt>
            </Section>
          )}
          <Section title="Picks">
            <Opt on={f.editorOnly} onClick={() => set({ editorOnly: !f.editorOnly })}>
              <span className="inline-flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" />Editor&apos;s Choice</span>
            </Opt>
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

// India time, like the rest of the site's "this month" (the filter panel only renders in the browser)
const THIS_MONTH = MONTHS[currentMonthIndexIST()];

// The slider runs from the cheapest starting price to the dearest, in ₹1,000 steps; the far
// right end means any price
const PRICES = adventures.map((a) => getLowestPrice(a)).filter((p): p is number => p !== null && p > 0);
const PRICE_MIN = Math.floor(Math.min(...PRICES) / 1000) * 1000;
const PRICE_MAX = Math.ceil(Math.max(...PRICES) / 5000) * 5000;
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function PriceSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const shown = value || PRICE_MAX;
  const within = value ? PRICES.filter((p) => p <= value).length : PRICES.length;
  const pct = ((shown - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Budget: starting price</p>
        <p className="text-[13px] font-semibold tabular-nums" style={{ color: value ? "var(--accent-ink-soft)" : "var(--text-secondary)" }}>
          {value ? `Up to ${inr(value)}` : "Any price"}
        </p>
      </div>
      <input
        type="range" min={PRICE_MIN} max={PRICE_MAX} step={1000} value={shown}
        onChange={(e) => { const v = Number(e.target.value); onChange(v >= PRICE_MAX ? 0 : v); }}
        aria-label="Highest starting price"
        className="ttt-range w-full"
        style={{ background: `linear-gradient(to right, #ff5100 ${pct}%, var(--border-default) ${pct}%)` }}
      />
      <div className="flex justify-between mt-1.5 text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
        <span>{inr(PRICE_MIN)}</span>
        <span>{within} adventure{within === 1 ? "" : "s"}</span>
        <span>{inr(PRICE_MAX)}+</span>
      </div>
      <style>{`
        .ttt-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px; outline: none; }
        .ttt-range::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid #ff5100; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; }
        .ttt-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 2px solid #ff5100; cursor: pointer; }
        .ttt-range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px rgba(255,81,0,0.3); }
      `}</style>
    </div>
  );
}

function Opt({ on, onClick, children, block }: { on: boolean; onClick: () => void; children: React.ReactNode; block?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${block ? "w-full px-0" : ""}`}
      style={on
        ? { background: "rgba(255,81,0,0.14)", color: "var(--accent-ink-soft)", border: "1px solid rgba(255,81,0,0.4)" }
        : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
    >
      {children}
    </button>
  );
}
