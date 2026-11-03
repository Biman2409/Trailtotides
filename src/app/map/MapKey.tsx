"use client";

import Link from "next/link";
import { SlidersHorizontal, Sun, Users, X, Loader2 } from "lucide-react";
import type { Adventure, Difficulty, Month } from "@/lib/data";
import type { AdventureFilterState } from "@/lib/adventureFilterState";
import { MONTHS } from "@/lib/exploreHelpers";
import { bucketFor } from "@/lib/fitness";
import { MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import { track } from "@/lib/analytics";
import { difficultyColor, difficultyOf, formatINR } from "./mapShared";

// The map's key, made of the controls themselves: difficulty in the pins' own colours and the
// best months, each a column as tall as the adventures it would show, so the key reads the
// catalogue and filters it in one. Then how ready you are, and the filters you've set as chips.
// Counts are "if you also picked this": each row counts with every other filter applied.

const DIFFS: Difficulty[] = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];

export default function MapKey({ f, set, filterWith, monthIdx, score, canFit, group, groups, groupLoading, onGroup, onMore, morePanelCount, onClear }: {
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  /** The map's own filtering (Near me, a group's picks included), with other filter values */
  filterWith: (f: AdventureFilterState) => Adventure[];
  monthIdx: number;
  score?: (a: Adventure) => number;
  canFit: boolean;
  group: { code: string; name: string } | null;
  groups: { code: string; name: string; memberCount: number }[];
  groupLoading: boolean;
  onGroup: (code: string) => void;
  onMore: () => void;
  /** Filters only the drawer sets (duration, budget, picks): shown on its button */
  morePanelCount: number;
  onClear: () => void;
}) {
  const byDiff = filterWith({ ...f, diffs: [] });
  const byMonth = filterWith({ ...f, months: [] });
  const diffN = DIFFS.map((d) => byDiff.filter((a) => difficultyOf(a) === d).length);
  const monthN = MONTHS.map((m) => byMonth.filter((a) => a.bestMonths.includes(m)).length);
  const byFit = score ? filterWith({ ...f, fit: null }) : [];
  const fitN = { ready: byFit.filter((a) => bucketFor(score!(a)).key === "ready").length, stretch: byFit.filter((a) => bucketFor(score!(a)).key === "stretch").length };
  const now = MONTHS[monthIdx];

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const chips = activeChips(f, set);

  return (
    <div className="mk">
      {/* Difficulty: the pins' colours, as columns */}
      <div className="mk-row">
        <div className="mk-head">
          <span className="mk-label">Difficulty</span>
          <span className="mk-hint">Pin colour</span>
        </div>
        <div className="mk-cols mk-cols-5" role="group" aria-label="Difficulty">
          {DIFFS.map((d, i) => {
            const on = f.diffs.includes(d);
            const dim = f.diffs.length > 0 && !on;
            return (
              <button key={d} type="button" onClick={() => set({ diffs: toggle(f.diffs, d) })} aria-pressed={on}
                aria-label={`${d}: ${diffN[i]} ${diffN[i] === 1 ? "adventure" : "adventures"}`} title={d}
                className="mk-col" data-on={on || undefined} data-dim={dim || undefined} disabled={!diffN[i] && !on}
                style={{ "--c": difficultyColor(d) } as React.CSSProperties}>
                <span className="mk-n">{diffN[i]}</span>
                <span className="mk-bar" style={{ height: `${barH(diffN[i], diffN)}%` }} />
                <span className="mk-tick">{d === "Moderate" ? "Mod" : d === "Advanced" ? "Adv" : d}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Best months: how many adventures are in season, month by month */}
      <div className="mk-row">
        <div className="mk-head">
          <span className="mk-label">Best months</span>
          <button type="button" onClick={() => set({ months: f.months.length === 1 && f.months[0] === now ? [] : [now] })}
            className="mk-quick" data-on={(f.months.length === 1 && f.months[0] === now) || undefined}>
            <Sun className="w-3 h-3" />In season now
          </button>
        </div>
        <div className="mk-cols mk-cols-12" role="group" aria-label="Best months">
          {MONTHS.map((m, i) => {
            const on = f.months.includes(m as Month);
            const dim = f.months.length > 0 && !on;
            return (
              <button key={m} type="button" onClick={() => set({ months: toggle(f.months, m as Month) })} aria-pressed={on}
                aria-label={`${m}: ${monthN[i]} in season`} title={`${m} · ${monthN[i]}`}
                className="mk-col" data-on={on || undefined} data-dim={dim || undefined} data-now={m === now || undefined}
                style={{ "--c": "#ff7d47" } as React.CSSProperties}>
                <span className="mk-bar" style={{ height: `${shapeH(monthN[i], monthN)}%` }} />
                <span className="mk-tick">{m[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* How ready you are, or the way into it */}
      <div className="mk-row mk-row-line">
        {canFit && score ? (
          <>
            <span className="mk-label">Your fit</span>
            <div className="flex items-center gap-1.5 min-w-0">
              {([["ready", "Ready", "#10b981"], ["stretch", "A stretch", "#f59e0b"]] as const).map(([k, label, c]) => {
                const on = f.fit === k;
                return (
                  <button key={k} type="button" onClick={() => set({ fit: on ? null : k })} aria-pressed={on} className="mk-fit" data-on={on || undefined} style={{ "--c": c } as React.CSSProperties}>
                    <i />{label}<b>{fitN[k]}</b>
                  </button>
                );
              })}
              {groups.length > 0 && (
                <label className="mk-fit relative cursor-pointer" title="Rate adventures for a group">
                  {groupLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
                  <span className="max-w-[84px] truncate">{group ? group.name : "Just me"}</span>
                  <select aria-label="Rate adventures for a group" value={group?.code ?? ""} onChange={(e) => onGroup(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
                    <option value="">Just me</option>
                    {groups.map((g) => <option key={g.code} value={g.code}>{g.name} ({g.memberCount})</option>)}
                  </select>
                </label>
              )}
            </div>
          </>
        ) : (
          <Link href="/matchmaker" onClick={() => track("map_fitness_cta", { from: "key" })} className="mk-cta">
            <MatchmakerMark className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 min-w-0 truncate">Find what you&apos;re ready for</span>
            <span className="mk-cta-go">Matchmaker →</span>
          </Link>
        )}
      </div>

      {/* What's set, each one removable */}
      <div className="mk-row mk-row-chips">
        {chips.map((c) => (
          <button key={c.key} type="button" onClick={c.remove} className="mk-chip" aria-label={`Remove ${c.label}`}>
            {c.label}<X className="w-3 h-3" />
          </button>
        ))}
        <button type="button" onClick={onMore} className="mk-more" data-on={morePanelCount > 0 || undefined}>
          <SlidersHorizontal className="w-3.5 h-3.5" />More filters{morePanelCount > 0 && <b>{morePanelCount}</b>}
        </button>
        {chips.length > 1 && <button type="button" onClick={onClear} className="mk-clear">Clear all</button>}
      </div>

      <style>{KEY_CSS}</style>
    </div>
  );
}

// Column height as a share of the row's tallest, with a sliver for zero so the slot still reads
const barH = (n: number, all: number[]) => (n ? 18 + (n / Math.max(1, ...all)) * 82 : 6);
// The months as a shape: most adventures run several months, so share-of-tallest bars come out
// nearly flat. These run from the quietest month to the busiest; the count is in each label.
const shapeH = (n: number, all: number[]) => {
  if (!n) return 6;
  const lo = Math.min(...all.filter(Boolean)), hi = Math.max(...all);
  return hi === lo ? 70 : 22 + ((n - lo) / (hi - lo)) * 78;
};

function activeChips(f: AdventureFilterState, set: (p: Partial<AdventureFilterState>) => void) {
  const out: { key: string; label: string; remove: () => void }[] = [];
  if (f.search) out.push({ key: "q", label: `“${f.search}”`, remove: () => set({ search: "" }) });
  f.types.forEach((t) => out.push({ key: `t-${t}`, label: t, remove: () => set({ types: f.types.filter((x) => x !== t) }) }));
  f.states.forEach((s) => out.push({ key: `s-${s}`, label: s, remove: () => set({ states: f.states.filter((x) => x !== s) }) }));
  f.diffs.forEach((d) => out.push({ key: `d-${d}`, label: d, remove: () => set({ diffs: f.diffs.filter((x) => x !== d) }) }));
  f.months.forEach((m) => out.push({ key: `m-${m}`, label: m, remove: () => set({ months: f.months.filter((x) => x !== m) }) }));
  f.durs.forEach((d) => out.push({ key: `u-${d}`, label: d, remove: () => set({ durs: f.durs.filter((x) => x !== d) }) }));
  if (f.maxPrice) out.push({ key: "p", label: `Under ${formatINR(f.maxPrice)}`, remove: () => set({ maxPrice: 0 }) });
  if (f.editorOnly) out.push({ key: "e", label: "Editor's picks", remove: () => set({ editorOnly: false }) });
  if (f.fit) out.push({ key: "f", label: f.fit === "ready" ? "Ready for me" : "A stretch", remove: () => set({ fit: null }) });
  return out;
}

const KEY_CSS = `
  .mk { display: flex; flex-direction: column; gap: 12px; }
  .mk-row { display: flex; flex-direction: column; gap: 6px; }
  .mk-row-line { flex-direction: row; align-items: center; justify-content: space-between; gap: 10px; }
  .mk-row-chips { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 6px; }
  .mk-head { display: flex; align-items: baseline; justify-content: space-between; }
  .mk-label { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.42); }
  .mk-hint { font-size: 10.5px; color: rgba(255,255,255,0.32); }

  /* Columns: a count, a bar as tall as its share, a tick label */
  .mk-cols { display: grid; gap: 3px; align-items: end; }
  .mk-cols-5 { grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .mk-cols-12 { grid-template-columns: repeat(12, 1fr); }
  .mk-col { position: relative; display: flex; flex-direction: column; align-items: stretch; justify-content: flex-end; gap: 3px;
            height: 50px; padding: 0; border-radius: 8px; cursor: pointer; background: none; transition: opacity .2s; }
  .mk-cols-12 .mk-col { height: 38px; }
  .mk-col:disabled { cursor: default; }
  .mk-n { font: 600 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.55); text-align: center; font-variant-numeric: tabular-nums; }
  .mk-bar { display: block; width: 100%; min-height: 3px; border-radius: 4px 4px 2px 2px;
            background: color-mix(in srgb, var(--c) 55%, rgba(255,255,255,0.05)); transition: height .45s cubic-bezier(0.22,1,0.36,1), background .2s, box-shadow .2s; }
  .mk-tick { font: 600 9.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.4); text-align: center; letter-spacing: 0.02em; }
  .mk-col:hover .mk-bar { background: color-mix(in srgb, var(--c) 80%, transparent); }
  .mk-col[data-on] .mk-bar { background: var(--c); box-shadow: 0 0 14px -2px var(--c); }
  .mk-col[data-on] .mk-tick, .mk-col[data-on] .mk-n { color: #fff; }
  .mk-col[data-dim] { opacity: 0.4; }
  .mk-col[data-dim]:hover { opacity: 0.75; }
  /* This month: a dot under its tick */
  .mk-col[data-now] .mk-tick::after { content: ""; display: block; width: 3px; height: 3px; margin: 3px auto 0; border-radius: 50%; background: #ff7d47; }
  .mk-col:focus-visible { outline: 2px solid #ff7d47; outline-offset: 2px; }

  .mk-quick { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.55); padding: 6px 0; margin: -6px 0; }
  .mk-quick:hover, .mk-quick[data-on] { color: #ffb08a; }

  .mk-fit { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
            color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); transition: all .2s; }
  .mk-fit i { width: 8px; height: 8px; border-radius: 50%; box-shadow: inset 0 0 0 2px var(--c); }
  .mk-fit b { font: 600 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.45); }
  .mk-fit:hover { border-color: rgba(255,255,255,0.2); }
  .mk-fit[data-on] { color: #fff; background: color-mix(in srgb, var(--c) 16%, transparent); border-color: color-mix(in srgb, var(--c) 55%, transparent); }
  .mk-fit[data-on] i { background: var(--c); }

  .mk-cta { flex: 1; display: flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 12px; border-radius: 12px; font-size: 12.5px; font-weight: 600;
            color: rgba(255,255,255,0.8); background: rgba(255,81,0,0.07); border: 1px dashed rgba(255,125,71,0.35); transition: all .2s; }
  .mk-cta svg { color: #ff9a66; }
  .mk-cta-go { font-size: 11px; color: #ff9a66; white-space: nowrap; }
  .mk-cta:hover { background: rgba(255,81,0,0.12); border-style: solid; }

  .mk-chip { display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 8px 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
             color: #ffcfb5; background: rgba(255,81,0,0.14); border: 1px solid rgba(255,125,71,0.4); transition: background .15s; }
  .mk-chip svg { opacity: 0.7; }
  .mk-chip:hover { background: rgba(255,81,0,0.24); }
  .mk-more { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
             color: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.12); transition: all .2s; }
  .mk-more b { min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; display: grid; place-items: center; font-size: 10px; color: #fff; background: #ff5100; }
  .mk-more:hover, .mk-more[data-on] { color: #fff; border-color: rgba(255,255,255,0.25); }
  .mk-clear { font-size: 12px; font-weight: 600; color: #ff9a66; padding: 6px 2px; }
  .mk-clear:hover { text-decoration: underline; }
  @media (prefers-reduced-motion: reduce) { .mk-bar { transition: none; } }
`;
