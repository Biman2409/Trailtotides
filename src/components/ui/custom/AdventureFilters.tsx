"use client";

// The adventure filters Explore and the Map share: one state shape, one way to read and
// write it in the link, one filter function, the quick chips and the full panel. Keeping
// them here means both pages always offer exactly the same filters.

import { useEffect, useRef } from "react";
import { X, Crown } from "lucide-react";
import { adventures } from "@/lib/data";
import type { AdventureType, Difficulty, Duration, Month } from "@/lib/data";
import { toggleSelection as toggle, GENRE_GROUPS } from "@/lib/filterOptions";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import { MONTHS, SORT_LABELS, type SortKey } from "@/lib/exploreHelpers";

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
        ? { background: "rgba(255,81,0,0.14)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.4)" }
        : { background: "var(--chip-bg, transparent)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
      {icon}
      {children}
    </button>
  );
}

/* ── Genre chips: every kind of adventure at a glance ─────────────────────────── */

// Mountain → ocean, as on the home page's Find your format. Each genre shows its count (or
// "Soon"); opening one filters to it and unfolds every activity type in it, live ones to pick
// from and the rest marked Soon, so the whole range is always in view. They work on the same
// type filter as the panel, so links and the Explore ↔ map hand-off carry them.
const GENRE_LOOK: Record<string, { light: string; dark: string }> = {
  Earth: { light: "#b45309", dark: "#ff9a66" },
  Snow:  { light: "#4f46e5", dark: "#b9c3ff" },
  Air:   { light: "#a16207", dark: "#ffd27a" },
  Water: { light: "#0e7490", dark: "#6ff0e0" },
};
const GENRE_ORDER = ["Earth", "Snow", "Air", "Water"];
const TYPE_COUNTS = adventures.reduce<Record<string, number>>((acc, a) => { acc[a.type] = (acc[a.type] ?? 0) + 1; return acc; }, {});

export function GenreChips({ f, set, className = "" }: {
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  className?: string;
}) {
  const genres = GENRE_ORDER.map((label) => GENRE_GROUPS.find((g) => g.label === label)!).filter(Boolean);
  const isOpen = (types: AdventureType[]) => types.some((t) => f.types.includes(t));
  const open = genres.filter((g) => isOpen(g.types));

  return (
    <div className={`ttt-genres ${className}`}>
      <style>{GENRE_CSS}</style>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {genres.map((g) => {
          const live = g.types.filter((t) => TYPE_COUNTS[t]);
          const n = live.reduce((s, t) => s + TYPE_COUNTS[t], 0);
          const on = isOpen(g.types);
          const look = GENRE_LOOK[g.label];
          return (
            <button key={g.label} type="button" aria-pressed={on} disabled={!n}
              title={n ? `${n} ${g.label} adventure${n > 1 ? "s" : ""}` : `${g.label} adventures are coming soon`}
              // Opening a genre picks all its live types; closing it drops them
              onClick={() => set({ types: on ? f.types.filter((t) => !g.types.includes(t)) : [...new Set([...f.types, ...live])] })}
              className="ttt-genre" style={{ "--g-l": look.light, "--g-d": look.dark } as React.CSSProperties} data-on={on || undefined}>
              <span className="ttt-genre-dot" />{g.label}
              <span className="ttt-genre-n">{n || "Soon"}</span>
            </button>
          );
        })}
      </div>
      {open.length > 0 && (
        <div className="ttt-types flex gap-1.5 overflow-x-auto no-scrollbar mt-1.5">
          {open.flatMap((g) => g.types.map((t) => {
            const n = TYPE_COUNTS[t] ?? 0;
            const on = f.types.includes(t);
            const look = GENRE_LOOK[g.label];
            return (
              <button key={t} type="button" aria-pressed={on} disabled={!n} title={n ? undefined : `${t} is coming soon`}
                onClick={() => toggle(f.types, t, (v) => set({ types: v }))}
                className="ttt-type" style={{ "--g-l": look.light, "--g-d": look.dark } as React.CSSProperties} data-on={on || undefined}>
                <span className="opacity-90 grid place-items-center">{ADVENTURE_TYPE_ICONS[t]?.(11)}</span>
                {t}<span className="ttt-type-n">{n || "Soon"}</span>
              </button>
            );
          }))}
        </div>
      )}
    </div>
  );
}

const GENRE_CSS = `
.ttt-genre, .ttt-type { --g: var(--g-l); }
.dark .ttt-genre, .dark .ttt-type { --g: var(--g-d); }
.ttt-genre { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 7px 0 10px; border-radius: 999px;
  font-size: 12.5px; font-weight: 600; color: var(--text-secondary); background: var(--chip-bg, transparent); border: 1px solid var(--border-default); transition: all .2s; }
.ttt-genre:hover:not(:disabled) { color: var(--text-primary); border-color: color-mix(in srgb, var(--g) 55%, transparent); }
.ttt-genre[data-on] { color: var(--g); background: color-mix(in srgb, var(--g) 13%, transparent); border-color: color-mix(in srgb, var(--g) 55%, transparent);
  box-shadow: 0 0 16px -6px color-mix(in srgb, var(--g) 70%, transparent); }
.ttt-genre:disabled { opacity: .55; cursor: default; }
.ttt-genre-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--g); box-shadow: 0 0 8px color-mix(in srgb, var(--g) 60%, transparent); }
.ttt-genre-n { font-size: 10.5px; font-weight: 700; padding: 1px 6px; border-radius: 999px; background: color-mix(in srgb, var(--g) 14%, transparent); color: var(--g); }
.ttt-types { animation: tttUnfold .25s ease-out both; }
@keyframes tttUnfold { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.ttt-type { flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 6px 0 9px; border-radius: 9px; font-size: 12px; font-weight: 600;
  color: var(--text-secondary); background: var(--chip-bg, transparent); border: 1px solid color-mix(in srgb, var(--g) 30%, transparent); transition: all .2s; }
.ttt-type:hover:not(:disabled) { color: var(--text-primary); }
.ttt-type[data-on] { color: #fff; background: var(--g); border-color: var(--g); }
.dark .ttt-type[data-on] { color: #15110e; }
.ttt-type:disabled { opacity: .45; cursor: default; border-style: dashed; }
.ttt-type-n { font-size: 10.5px; opacity: .7; }
@media (prefers-reduced-motion: reduce) { .ttt-types { animation: none; } }
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
