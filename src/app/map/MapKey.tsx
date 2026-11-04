"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal, Sun, Users, X, Loader2 } from "lucide-react";
import type { Adventure, Difficulty, Month } from "@/lib/data";
import type { AdventureFilterState } from "@/lib/adventureFilterState";
import { MONTHS } from "@/lib/exploreHelpers";
import { bucketFor } from "@/lib/fitness";
import { MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import { durationLabel } from "@/components/ui/custom/AdventureFilters";
import { track } from "@/lib/analytics";
import { difficultyColor, difficultyOf, formatINR } from "./mapShared";

// The map's key, folded: one row of pills (Difficulty, Season, Fit, More) that says what's set at
// a glance and opens its chart on tap, so the list keeps the room. Opened, Difficulty and Season
// are columns as tall as the adventures they'd show, in the pins' own colours, so the key reads
// the catalogue and filters it in one. Counts are "if you also picked this": each row counts with
// every other filter applied. Below the pills, the filters you've set as removable chips.

const DIFFS: Difficulty[] = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];
const FITS = [["ready", "Ready", "#10b981"], ["stretch", "A stretch", "#f59e0b"]] as const;
type Section = "diff" | "month" | "fit" | null;

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
  const [open, setOpen] = useState<Section>(null);
  const toggleOpen = (s: Exclude<Section, null>) => setOpen((cur) => (cur === s ? null : s));

  const now = MONTHS[monthIdx] as Month;
  const inSeasonNow = f.months.length === 1 && f.months[0] === now;
  const fitOn = canFit && !!score;
  const chips = activeChips(f, set);

  // What each pill says when something is set
  const diffLabel = f.diffs.length === 0 ? "Difficulty" : f.diffs.length === 1 ? f.diffs[0] : `${f.diffs[0]} +${f.diffs.length - 1}`;
  const monthLabel = f.months.length === 0 ? "Season" : inSeasonNow ? "In season" : f.months.length === 1 ? f.months[0] : `${f.months[0]} +${f.months.length - 1}`;
  const fitLabel = f.fit === "ready" ? "Ready" : f.fit === "stretch" ? "A stretch" : group ? group.name : "Your fit";

  return (
    <div className="mk">
      <div className="mk-pills no-scrollbar" role="toolbar" aria-label="Map key and filters">
        <button type="button" onClick={() => toggleOpen("diff")} aria-expanded={open === "diff"} className="mk-pill" data-on={f.diffs.length > 0 || undefined} data-open={open === "diff" || undefined}>
          {/* The pins' colours, so the folded key still reads as a legend */}
          <span className="mk-swatch" aria-hidden>{DIFFS.map((d) => <i key={d} style={{ background: difficultyColor(d) }} />)}</span>
          <span className="truncate">{diffLabel}</span>
          <ChevronDown className="mk-chev" />
        </button>
        <button type="button" onClick={() => toggleOpen("month")} aria-expanded={open === "month"} className="mk-pill" data-on={f.months.length > 0 || undefined} data-open={open === "month" || undefined}>
          <Sun className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span className="truncate">{monthLabel}</span>
          <ChevronDown className="mk-chev" />
        </button>
        {fitOn ? (
          <button type="button" onClick={() => toggleOpen("fit")} aria-expanded={open === "fit"} className="mk-pill" data-on={!!f.fit || undefined} data-open={open === "fit" || undefined}>
            {group ? <Users className="w-3.5 h-3.5 shrink-0 opacity-70" /> : <span className="mk-dot" style={{ "--c": f.fit === "stretch" ? "#f59e0b" : "#10b981" } as React.CSSProperties} />}
            <span className="truncate max-w-[92px]">{fitLabel}</span>
            <ChevronDown className="mk-chev" />
          </button>
        ) : (
          <Link href="/matchmaker" onClick={() => track("map_fitness_cta", { from: "key" })} className="mk-pill mk-pill-cta" title="Find what you're ready for">
            <MatchmakerMark className="w-3.5 h-3.5 shrink-0" />
            <span>Your fit</span>
          </Link>
        )}
        <button type="button" onClick={onMore} className="mk-pill mk-pill-icon" data-on={morePanelCount > 0 || undefined} aria-label={morePanelCount ? `More filters, ${morePanelCount} set` : "More filters"} title="More filters">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {morePanelCount > 0 && <b className="mk-badge">{morePanelCount}</b>}
        </button>
      </div>

      {open === "diff" && <DiffChart f={f} set={set} filterWith={filterWith} />}
      {open === "month" && <MonthChart f={f} set={set} filterWith={filterWith} now={now} inSeasonNow={inSeasonNow} />}
      {open === "fit" && fitOn && (
        <FitChoices f={f} set={set} filterWith={filterWith} score={score!} group={group} groups={groups} groupLoading={groupLoading} onGroup={onGroup} />
      )}

      {chips.length > 0 && (
        <div className="mk-chips">
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={c.remove} className="mk-chip" aria-label={`Remove ${c.label}`}>
              {c.label}<X className="w-3 h-3" />
            </button>
          ))}
          {chips.length > 1 && <button type="button" onClick={onClear} className="mk-clear">Clear all</button>}
        </div>
      )}

      <style>{KEY_CSS}</style>
    </div>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

type ChartProps = { f: AdventureFilterState; set: (p: Partial<AdventureFilterState>) => void; filterWith: (f: AdventureFilterState) => Adventure[] };

/* ── Difficulty: the pins' colours, as columns ── */
function DiffChart({ f, set, filterWith }: ChartProps) {
  const rows = filterWith({ ...f, diffs: [] });
  const n = DIFFS.map((d) => rows.filter((a) => difficultyOf(a) === d).length);
  return (
    <div className="mk-drop">
      <div className="mk-head">
        <span className="mk-label">Pin colour shows difficulty</span>
        {f.diffs.length > 0 && <button type="button" onClick={() => set({ diffs: [] })} className="mk-reset">Any</button>}
      </div>
      <div className="mk-cols mk-cols-5" role="group" aria-label="Difficulty">
        {DIFFS.map((d, i) => {
          const on = f.diffs.includes(d);
          return (
            <button key={d} type="button" onClick={() => set({ diffs: toggle(f.diffs, d) })} aria-pressed={on}
              aria-label={`${d}: ${n[i]} ${n[i] === 1 ? "adventure" : "adventures"}`} title={d}
              className="mk-col" data-on={on || undefined} data-dim={(f.diffs.length > 0 && !on) || undefined} disabled={!n[i] && !on}
              style={{ "--c": difficultyColor(d) } as React.CSSProperties}>
              <span className="mk-n">{n[i]}</span>
              <span className="mk-bar" style={{ height: `${barH(n[i], n)}%` }} />
              <span className="mk-tick">{d}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Season: how many adventures are at their best, month by month ── */
function MonthChart({ f, set, filterWith, now, inSeasonNow }: ChartProps & { now: Month; inSeasonNow: boolean }) {
  const rows = filterWith({ ...f, months: [] });
  const n = MONTHS.map((m) => rows.filter((a) => a.bestMonths.includes(m as Month)).length);
  return (
    <div className="mk-drop">
      <div className="mk-head">
        <span className="mk-label">In season, month by month</span>
        <span className="flex items-center gap-3">
          {f.months.length > 0 && !inSeasonNow && <button type="button" onClick={() => set({ months: [] })} className="mk-reset">Any</button>}
          <button type="button" onClick={() => set({ months: inSeasonNow ? [] : [now] })} className="mk-quick" data-on={inSeasonNow || undefined}>
            <Sun className="w-3 h-3" />In season now
          </button>
        </span>
      </div>
      <div className="mk-cols mk-cols-12" role="group" aria-label="Best months">
        {MONTHS.map((m, i) => {
          const on = f.months.includes(m as Month);
          return (
            <button key={m} type="button" onClick={() => set({ months: toggle(f.months, m as Month) })} aria-pressed={on}
              aria-label={`${m}: ${n[i]} in season`} title={`${m} · ${n[i]}`}
              className="mk-col" data-on={on || undefined} data-dim={(f.months.length > 0 && !on) || undefined} data-now={m === now || undefined}
              style={{ "--c": "var(--tm-orange)" } as React.CSSProperties}>
              <span className="mk-bar" style={{ height: `${shapeH(n[i], n)}%` }} />
              <span className="mk-tick">{m[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Fit: ready or a stretch, for you or a group ── */
function FitChoices({ f, set, filterWith, score, group, groups, groupLoading, onGroup }: ChartProps & {
  score: (a: Adventure) => number;
  group: { code: string; name: string } | null;
  groups: { code: string; name: string; memberCount: number }[];
  groupLoading: boolean;
  onGroup: (code: string) => void;
}) {
  const rows = filterWith({ ...f, fit: null });
  const n = { ready: rows.filter((a) => bucketFor(score(a)).key === "ready").length, stretch: rows.filter((a) => bucketFor(score(a)).key === "stretch").length };
  return (
    <div className="mk-drop">
      <div className="mk-head">
        <span className="mk-label">{group ? `Fit for ${group.name}` : "Your fit"}</span>
        {f.fit && <button type="button" onClick={() => set({ fit: null })} className="mk-reset">Any</button>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {FITS.map(([k, label, c]) => {
          const on = f.fit === k;
          return (
            <button key={k} type="button" onClick={() => set({ fit: on ? null : k })} aria-pressed={on} className="mk-fit" data-on={on || undefined} style={{ "--c": c } as React.CSSProperties}>
              <i />{label}<b>{n[k]}</b>
            </button>
          );
        })}
        {groups.length > 0 && (
          <label className="mk-fit relative cursor-pointer ml-auto" title="Rate adventures for a group">
            {groupLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
            <span className="max-w-[96px] truncate">{group ? group.name : "Just me"}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
            <select aria-label="Rate adventures for a group" value={group?.code ?? ""} onChange={(e) => onGroup(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
              <option value="">Just me</option>
              {groups.map((g) => <option key={g.code} value={g.code}>{g.name} ({g.memberCount})</option>)}
            </select>
          </label>
        )}
      </div>
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
  f.durs.forEach((d) => out.push({ key: `u-${d}`, label: durationLabel(d), remove: () => set({ durs: f.durs.filter((x) => x !== d) }) }));
  if (f.maxPrice) out.push({ key: "p", label: `Under ${formatINR(f.maxPrice)}`, remove: () => set({ maxPrice: 0 }) });
  if (f.editorOnly) out.push({ key: "e", label: "Editor's picks", remove: () => set({ editorOnly: false }) });
  if (f.fit) out.push({ key: "f", label: f.fit === "ready" ? "Ready for me" : "A stretch", remove: () => set({ fit: null }) });
  return out;
}

const KEY_CSS = `
  .mk { display: flex; flex-direction: column; gap: 8px; }

  /* The folded key: one row of pills */
  .mk-pills { display: flex; align-items: center; gap: 6px; overflow-x: auto; }
  .mk-pill { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap;
             color: rgba(var(--tm-ink),0.72); background: rgba(var(--tm-ink),0.04); border: 1px solid rgba(var(--tm-ink),0.09); transition: color .2s, background .2s, border-color .2s; }
  .mk-pill:hover, .mk-pill[data-open] { color: rgb(var(--tm-fg)); border-color: rgba(var(--tm-ink),0.22); background: rgba(var(--tm-ink),0.07); }
  .mk-pill[data-on] { color: var(--tm-peach-5); background: rgba(255,81,0,0.12); border-color: rgba(255,125,71,0.42); }
  .mk-pill:focus-visible { outline: 2px solid var(--tm-orange); outline-offset: 2px; }
  .mk-chev { width: 12px; height: 12px; flex-shrink: 0; opacity: 0.5; transition: transform .2s; }
  .mk-pill[data-open] .mk-chev { transform: rotate(180deg); opacity: 0.8; }
  .mk-pill-icon { width: 32px; padding: 0; justify-content: center; position: relative; margin-left: auto; }
  /* Phones have the Filters button in the dock over the map already */
  /* Filters sits beside Sort above the results (desktop) and beside the search row (phones) */
  .mk-pill-icon { display: none; }
  .mk-pill-cta { color: var(--tm-peach-3); border-style: dashed; border-color: rgba(255,125,71,0.4); background: rgba(255,81,0,0.06); }
  .mk-pill-cta svg { color: var(--tm-peach); }
  .mk-pill-cta:hover { border-style: solid; color: rgb(var(--tm-fg)); }
  .mk-badge { position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; display: grid; place-items: center; font-size: 9.5px; color: #fff; background: #ff5100; }
  .mk-swatch { display: inline-flex; gap: 2px; flex-shrink: 0; }
  .mk-swatch i { width: 4px; height: 12px; border-radius: 2px; }
  .mk-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: inset 0 0 0 2px var(--c); }
  .mk-pill[data-on] .mk-dot { background: var(--c); }

  /* An opened pill's chart */
  .mk-drop { display: flex; flex-direction: column; gap: 8px; padding: 10px 10px 8px; border-radius: 14px; background: rgba(var(--tm-ink),0.03); border: 1px solid rgba(var(--tm-ink),0.07); animation: mkIn .18s ease-out both; }
  @keyframes mkIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  .mk-head { display: flex; align-items: center; justify-content: space-between; min-height: 18px; }
  .mk-label { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(var(--tm-ink),0.42); }
  .mk-reset { font-size: 11px; font-weight: 600; color: var(--tm-peach); }
  .mk-reset:hover { text-decoration: underline; }
  .mk-quick { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: rgba(var(--tm-ink),0.55); }
  .mk-quick:hover, .mk-quick[data-on] { color: var(--tm-peach-3); }

  /* Columns: a count, a bar as tall as its share, a tick label */
  .mk-cols { display: grid; gap: 3px; align-items: end; }
  .mk-cols-5 { grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .mk-cols-12 { grid-template-columns: repeat(12, 1fr); }
  .mk-col { position: relative; display: flex; flex-direction: column; align-items: stretch; justify-content: flex-end; gap: 3px;
            height: 54px; padding: 0; border-radius: 8px; cursor: pointer; background: none; transition: opacity .2s; }
  .mk-cols-12 .mk-col { height: 42px; }
  .mk-col:disabled { cursor: default; }
  .mk-n { font: 600 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(var(--tm-ink),0.55); text-align: center; font-variant-numeric: tabular-nums; }
  .mk-bar { display: block; width: 100%; min-height: 3px; border-radius: 4px 4px 2px 2px;
            background: color-mix(in srgb, var(--c) 55%, rgba(var(--tm-ink),0.05)); transition: height .45s cubic-bezier(0.22,1,0.36,1), background .2s, box-shadow .2s; }
  .mk-tick { font: 600 9.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(var(--tm-ink),0.4); text-align: center; letter-spacing: 0.02em; }
  .mk-col:hover .mk-bar { background: color-mix(in srgb, var(--c) 80%, transparent); }
  .mk-col[data-on] .mk-bar { background: var(--c); box-shadow: 0 0 14px -2px var(--c); }
  .mk-col[data-on] .mk-tick, .mk-col[data-on] .mk-n { color: rgb(var(--tm-fg)); }
  .mk-col[data-dim] { opacity: 0.4; }
  .mk-col[data-dim]:hover { opacity: 0.75; }
  .mk-col[data-now] .mk-tick::after { content: ""; display: block; width: 3px; height: 3px; margin: 3px auto 0; border-radius: 50%; background: var(--tm-orange); }
  .mk-col:focus-visible { outline: 2px solid var(--tm-orange); outline-offset: 2px; }

  .mk-fit { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
            color: rgba(var(--tm-ink),0.75); background: rgba(var(--tm-ink),0.04); border: 1px solid rgba(var(--tm-ink),0.09); transition: all .2s; }
  .mk-fit i { width: 8px; height: 8px; border-radius: 50%; box-shadow: inset 0 0 0 2px var(--c); }
  .mk-fit b { font: 600 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(var(--tm-ink),0.45); }
  .mk-fit:hover { border-color: rgba(var(--tm-ink),0.2); }
  .mk-fit[data-on] { color: rgb(var(--tm-fg)); background: color-mix(in srgb, var(--c) 16%, transparent); border-color: color-mix(in srgb, var(--c) 55%, transparent); }
  .mk-fit[data-on] i { background: var(--c); }

  /* What's set, each one removable */
  .mk-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .mk-chip { display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 7px 0 10px; border-radius: 999px; font-size: 11.5px; font-weight: 600;
             color: var(--tm-peach-5); background: rgba(255,81,0,0.1); border: 1px solid rgba(255,125,71,0.3); transition: background .15s; }
  .mk-chip svg { opacity: 0.7; }
  .mk-chip:hover { background: rgba(255,81,0,0.2); }
  .mk-clear { font-size: 11.5px; font-weight: 600; color: var(--tm-peach); padding: 4px 2px; }
  .mk-clear:hover { text-decoration: underline; }
  @media (prefers-reduced-motion: reduce) { .mk-bar { transition: none; } .mk-drop { animation: none; } }
`;
