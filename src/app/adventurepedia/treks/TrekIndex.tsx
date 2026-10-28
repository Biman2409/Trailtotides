"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Mountain, Clock, Route } from "lucide-react";
import type { Month } from "@/lib/data";

export interface TrekCard {
  slug: string; name: string; tagline: string; state: string; difficulty: string; type: string;
  days: string; altitude: string; altM: number; months: Month[]; season: string; image: string; mapped: boolean; keywords: string;
}

const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DIFFS = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];
const SORTS = { name: "A to Z", alt: "Highest first", short: "Shortest first" } as const;

const chip = (on: boolean) => on
  ? { background: "#ff5100", color: "#fff", border: "1px solid #ff5100" }
  : { color: "var(--text-secondary)", border: "1px solid var(--border-default)" };

export default function TrekIndex({ treks }: { treks: TrekCard[] }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [month, setMonth] = useState<Month | null>(null);
  const [sort, setSort] = useState<keyof typeof SORTS>("name");

  // Pick up ?q= and ?month= after load, so the list itself renders on the server
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) setQ(p.get("q")!);
    const m = p.get("month");
    if (m && (MONTHS as string[]).includes(m)) setMonth(m as Month);
  }, []);

  // Nepal and the Indian states, most treks first
  const states = useMemo(() => {
    const n = new Map<string, number>();
    treks.forEach((t) => n.set(t.state, (n.get(t.state) ?? 0) + 1));
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  }, [treks]);

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const days = (t: TrekCard) => parseInt(t.days, 10) || 0;
    return treks
      .filter((t) => !state || t.state === state)
      .filter((t) => !diff || t.difficulty === diff)
      .filter((t) => !month || t.months.includes(month))
      .filter((t) => words.every((w) => `${t.name} ${t.state} ${t.tagline} ${t.keywords}`.toLowerCase().includes(w)))
      .sort((a, b) => sort === "alt" ? b.altM - a.altM : sort === "short" ? days(a) - days(b) : a.name.localeCompare(b.name));
  }, [treks, q, state, diff, month, sort]);

  const filtered = !!(q || state || diff || month);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6">
      {/* ── Search and filters ── */}
      <div className="rounded-2xl p-4 sm:p-5 space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 t-text-3 pointer-events-none" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Trek, village or region"
            aria-label="Search trek guides"
            className="w-full h-12 pl-10 pr-10 rounded-xl text-[15px] t-text outline-none focus:shadow-[0_0_0_3px_rgba(255,81,0,0.18)]"
            style={{ background: "var(--bg-page)", border: "1px solid var(--border-default)" }} />
          {q && <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg t-text-3"><X className="w-4 h-4" /></button>}
        </div>

        <FilterRow label="Region">
          <button onClick={() => setState(null)} aria-pressed={!state} className="shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold" style={chip(!state)}>All</button>
          {states.map((s) => <button key={s} onClick={() => setState(state === s ? null : s)} aria-pressed={state === s} className="shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap" style={chip(state === s)}>{s}</button>)}
        </FilterRow>
        <FilterRow label="Month">
          {MONTHS.map((m) => <button key={m} onClick={() => setMonth(month === m ? null : m)} aria-pressed={month === m} className="shrink-0 h-9 w-12 rounded-full text-[13px] font-semibold" style={chip(month === m)}>{m}</button>)}
        </FilterRow>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterRow label="Difficulty">
            {DIFFS.filter((d) => treks.some((t) => t.difficulty === d)).map((d) => <button key={d} onClick={() => setDiff(diff === d ? null : d)} aria-pressed={diff === d} className="shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold" style={chip(diff === d)}>{d}</button>)}
          </FilterRow>
          <label className="flex items-center gap-2 text-[13px] t-text-3">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="h-9 px-3 rounded-xl text-[13px] font-semibold t-text cursor-pointer"
              style={{ background: "var(--bg-page)", border: "1px solid var(--border-default)" }}>
              {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
        </div>
      </div>

      <p className="text-[14px] t-text-3 mt-6 mb-4" aria-live="polite">
        <b className="t-text">{shown.length}</b> {shown.length === 1 ? "guide" : "guides"}{month ? ` for treks that run in ${month}` : ""}
        {filtered && <> · <button onClick={() => { setQ(""); setState(null); setDiff(null); setMonth(null); }} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>clear filters</button></>}
      </p>

      {shown.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <p className="text-[15px] t-text-2">No trek guides match. Try another month or region.</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((t) => (
            <li key={t.slug}>
              <Link href={`/adventurepedia/treks/${t.slug}`} className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <span className="relative block aspect-[16/9] overflow-hidden">
                  <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55))" }} />
                  <span className="absolute left-3 bottom-2.5 text-[12px] font-semibold text-white/90">{t.state}</span>
                  {t.mapped && <span className="absolute right-3 top-3 text-[11px] font-bold px-2 py-1 rounded-full text-white" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>Day-by-day map</span>}
                </span>
                <span className="flex flex-col flex-1 p-4">
                  <span className="text-[17px] font-semibold t-text leading-snug group-hover:text-[#ff5100] transition-colors">{t.name}</span>
                  <span className="text-[13.5px] leading-[1.5] t-text-2 mt-1 line-clamp-2 flex-1">{t.tagline}</span>
                  <span className="flex flex-wrap gap-x-3.5 gap-y-1 mt-3 text-[12.5px] t-text-3">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t.days}</span>
                    {t.altitude && <span className="inline-flex items-center gap-1"><Mountain className="w-3.5 h-3.5" />{t.altitude.replace(/\s*\(.*\)/, "")}</span>}
                    <span className="inline-flex items-center gap-1"><Route className="w-3.5 h-3.5" />{t.difficulty}</span>
                  </span>
                  <span className="text-[12.5px] t-text-3 mt-1">Best: {t.season}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-[72px] shrink-0 text-[12px] font-semibold uppercase tracking-wider t-text-3">{label}</span>
      <div className="flex gap-1.5 overflow-x-auto min-w-0 pb-0.5" style={{ scrollbarWidth: "none" }}>{children}</div>
    </div>
  );
}
