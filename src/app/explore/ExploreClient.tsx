"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search, SlidersHorizontal, X, LayoutGrid, List, ChevronRight, Heart, RotateCcw, Map as MapIcon, ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import DifficultyMeter from "@/components/ui/custom/DifficultyMeter";
import SeasonStrip from "@/components/ui/custom/SeasonStrip";
import EmptyState from "@/components/ui/custom/EmptyState";
import ChatBubble from "@/components/ChatBubble";
import { adventures, getLowestPrice } from "@/lib/data";
import type { Adventure } from "@/lib/data";
import { getACE, computeDifficulty, computeMatchScore } from "@/lib/ace";
import { bucketFor } from "@/lib/fitness";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { currentMonthIndexIST } from "@/lib/homeCuration";
import {
  SORT_LABELS, formatAltitude, latestPriceCheck, searchSuggestions, sortAdventures,
  type SortKey,
} from "@/lib/exploreHelpers";
import {
  NO_FILTERS, filtersFromParams, writeFilterParams, filterAdventures, anyFilter,
  CategoryBar, FilterPanel, type AdventureFilterState,
} from "@/components/ui/custom/AdventureFilters";

type View = "grid" | "list";

const PAGE = 24;

export default function ExploreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthIdx = currentMonthIndexIST();
  const { ace: fitAce, ready: profileReady } = useFitnessProfile();

  // ── State, initialised from the link (old single-value params still work) ──
  // Filters are shared with the Map (components/ui/custom/AdventureFilters)
  const [f, setF] = useState<AdventureFilterState>(() => filtersFromParams(new URLSearchParams(searchParams.toString())));
  const set = (patch: Partial<AdventureFilterState>) => setF((cur) => ({ ...cur, ...patch }));
  const [sort, setSort] = useState<SortKey | null>(() => (searchParams.get("sort") as SortKey) || null);
  const [view, setView] = useState<View>(() => (searchParams.get("view") === "list" ? "list" : "grid"));
  const [shown, setShown] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const region = searchParams.get("region"); // from the home page's region cards

  // Default sort: best match when there's a profile, otherwise recommended
  const sortKey: SortKey = sort ?? (fitAce ? "match" : "recommended");

  // ── Keep the link in sync so filtered views can be shared, bookmarked and "back"-ed ──
  const firstSync = useRef(true);
  useEffect(() => {
    if (firstSync.current) { firstSync.current = false; return; }
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      writeFilterParams(p, f);
      if (region) p.set("region", region);
      if (sort) p.set("sort", sort);
      if (view === "list") p.set("view", "list");
      const qs = p.toString();
      router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [f, region, sort, view, router]);

  // Arriving from an adventure page's "back to results" — scroll that card into view
  const scrollToSlug = searchParams.get("scroll");
  useEffect(() => {
    if (scrollToSlug) document.getElementById(`card-${scrollToSlug}`)?.scrollIntoView({ behavior: "instant", block: "center" });
  }, [scrollToSlug]);

  const score = (a: Adventure) => (fitAce ? computeMatchScore(fitAce, getACE(a)) : 0);

  const results = useMemo(() => {
    const filtered = filterAdventures(adventures, f, { region, score: fitAce ? score : undefined });
    return sortAdventures(filtered, sortKey, { monthIdx, score: fitAce ? score : undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, region, fitAce, sortKey, monthIdx]);

  // New filters start from the top of the list again
  useEffect(() => { setShown(PAGE); }, [f, region, sortKey]);

  // The Filters badge counts only what's inside the panel; Type and Region show on their own buttons
  const extraCount = f.diffs.length + f.durs.length + f.months.length + (f.maxPrice ? 1 : 0) + (f.fit ? 1 : 0) + (f.editorOnly ? 1 : 0);
  const anyActive = anyFilter(f) || !!region;
  const search = f.search;
  const suggestions = results.length === 0 && search ? searchSuggestions(adventures, search) : [];

  function clearAll() {
    setF(NO_FILTERS);
    if (region) router.replace("/explore", { scroll: false });
  }

  // Shared wishlist banner — ?saved=slug1,slug2,...
  const sharedAdventures = useMemo(() => {
    const raw = searchParams.get("saved");
    return raw ? adventures.filter((a) => raw.split(",").includes(a.slug)) : null;
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Compact header ── */}
      <header className="pt-24 lg:pt-28 pb-5 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <div>
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-1.5">Explore</p>
            <h1 className="t-text text-2xl sm:text-3xl font-bold tracking-tight">
              {region ? `Adventures in the ${region}` : "Find your next adventure"}
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{results.length}</span>
            {results.length === adventures.length ? " adventures" : ` of ${adventures.length} adventures`}
          </p>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="sticky top-16 lg:top-20 z-40 backdrop-blur-lg" style={{ background: "color-mix(in srgb, var(--bg-page) 92%, transparent)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-2.5 flex items-center gap-2">
          <div className="relative flex-1 min-w-0 sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => set({ search: e.target.value })}
              placeholder="Search a trek, place or activity"
              aria-label="Search adventures"
              className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm border border-transparent focus:border-[#ff5100]/50 transition-colors"
              style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)", outline: "none" }}
            />
            {search && (
              <button onClick={() => set({ search: "" })} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1" style={{ color: "var(--text-tertiary)" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <label className="hidden md:flex items-center gap-2 text-sm ml-auto" style={{ color: "var(--text-tertiary)" }}>
            Sort
            <select
              value={sortKey}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)", border: "none", outline: "none" }}
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).filter((k) => k !== "match" || fitAce).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </label>

          <div className="flex items-center rounded-xl p-1 shrink-0" style={{ background: "var(--bg-surface-2)" }} role="group" aria-label="View">
            {([["grid", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={v === "grid" ? "Card view" : "List view"}
                className="p-1.5 rounded-lg transition-colors"
                style={view === v ? { background: "var(--bg-surface)", color: "var(--text-primary)" } : { color: "var(--text-tertiary)" }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Two broad categories, as on the home page, then everything else under Filters ── */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pb-2.5">
          <CategoryBar
            f={f} set={set}
            trailing={
              <button
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
                style={extraCount > 0
                  ? { background: "#ff5100", color: "#fff", border: "1px solid #ff5100" }
                  : { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {extraCount > 0 && <span className="text-xs font-bold">{extraCount}</span>}
              </button>
            }
          />
        </div>
      </div>

      {/* ── Filter panel: bottom sheet on phones, side drawer on larger screens ── */}
      {filtersOpen && (
        <FilterPanel
          f={f} set={set}
          onClose={() => setFiltersOpen(false)}
          onClear={clearAll}
          resultCount={results.length}
          sortKey={sortKey} setSort={setSort}
          hasProfile={!!fitAce}
        />
      )}

      {/* Sentinel that reveals the floating Compass button on scroll */}
      <div id="featured-adventures" className="h-px w-full opacity-0 pointer-events-none" />

      {/* Shared wishlist banner */}
      {sharedAdventures && sharedAdventures.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-6">
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,81,0,0.07)", border: "1px solid rgba(255,81,0,0.25)" }}>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#ff7d47] mb-4">
              <Heart className="w-4 h-4 fill-[#ff5100] text-[#ff5100]" />
              Shared wishlist — {sharedAdventures.length} adventure{sharedAdventures.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {sharedAdventures.map((a) => (
                <Link key={a.id} href={`/experiences/${a.slug}`} className="group flex-none w-48 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                  <div className="relative h-28"><Image src={a.heroImage} alt={a.name} fill sizes="192px" className="photo-grade object-cover" /></div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold line-clamp-1 group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{a.type} · {a.state}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-6 lg:py-8">
        {anyActive && (
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {results.length} {results.length === 1 ? "match" : "matches"}
              {search && <> for &ldquo;<span style={{ color: "var(--text-primary)" }}>{search}</span>&rdquo;</>}
            </p>
            <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-[var(--text-primary)] transition-colors" style={{ color: "var(--text-tertiary)" }}>
              <RotateCcw className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
        )}

        {results.length === 0 ? (
          <div>
            <EmptyState icon="🗺️" heading="No adventures found" subtext="Try fewer filters or a different search." actionLabel="Clear all filters" onAction={clearAll} size="lg" />
            {suggestions.length > 0 && (
              <p className="text-center text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                Did you mean{" "}
                {suggestions.map((s, i) => (
                  <span key={s}>
                    <button onClick={() => set({ search: s })} className="font-semibold text-[#ff5100] hover:underline">{s}</button>
                    {i < suggestions.length - 1 ? ", " : "?"}
                  </span>
                ))}
              </p>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {results.slice(0, shown).map((a) => (
              <div key={a.id} id={`card-${a.slug}`}>
                <AdventureCard adventure={a} badge={false} />
              </div>
            ))}
          </div>
        ) : (
          <ListView items={results.slice(0, shown)} monthIdx={monthIdx} score={fitAce ? score : undefined} />
        )}

        {/* ── Show more ── */}
        {results.length > shown && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              onClick={() => setShown((n) => n + PAGE)}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            >
              Show {Math.min(PAGE, results.length - shown)} more
            </button>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Showing {shown} of {results.length}</p>
          </div>
        )}

        {!profileReady || fitAce ? null : (
          <p className="text-center text-sm mt-10" style={{ color: "var(--text-tertiary)" }}>
            Want these sorted by what your body&apos;s ready for?{" "}
            <Link href="/matchmaker?mode=quick" className="font-semibold text-[#ff5100] hover:underline">Take the 2-minute quick match</Link>
          </p>
        )}
      </main>

      {/* ── Map strip ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pb-10">
        {/* Same filters on both pages, so the map opens on exactly these results */}
        <Link href={(() => { const p = new URLSearchParams(); writeFilterParams(p, f); const qs = p.toString(); return qs ? `/map?${qs}` : "/map"; })()} className="group flex items-center justify-between gap-4 rounded-2xl px-5 py-4 transition-colors hover:bg-[var(--bg-card-hover)]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <span className="flex items-center gap-3">
            <MapIcon className="w-5 h-5 text-[#5fb873]" />
            <span>
              <span className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>See them on the map</span>
              <span className="block text-xs" style={{ color: "var(--text-tertiary)" }}>Every adventure pinned, clustered by region</span>
            </span>
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--text-secondary)" }} />
        </Link>
      </div>

      <ChatBubble />
      <Footer />
    </div>
  );
}

/* ── Small pieces ─────────────────────────────────────────────────────────── */

/** Dense comparison rows — the facts trekkers scan for, in the same order every time. */
function ListView({ items, monthIdx, score }: { items: Adventure[]; monthIdx: number; score?: (a: Adventure) => number }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
      <div className="hidden md:grid grid-cols-[minmax(0,2.4fr)_70px_90px_110px_100px_90px_110px_20px] gap-4 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-subtle)" }}>
        <span>Adventure</span><span>Days</span><span>Max alt</span><span>Difficulty</span><span>Season</span><span>Operators</span><span className="text-right">From</span><span />
      </div>
      {items.map((a, i) => {
        const price = getLowestPrice(a);
        const checked = latestPriceCheck(a);
        const s = score?.(a);
        const b = s !== undefined ? bucketFor(s) : null;
        return (
          <Link
            key={a.id}
            id={`card-${a.slug}`}
            href={`/experiences/${a.slug}`}
            className="group grid grid-cols-[56px_minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2.4fr)_70px_90px_110px_100px_90px_110px_20px] items-center gap-3 md:gap-4 px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)]"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)" }}
          >
            {/* Name + place (with thumbnail) */}
            <span className="contents md:flex md:items-center md:gap-3 md:min-w-0">
              <span className="relative w-14 h-14 md:w-12 md:h-12 rounded-lg overflow-hidden shrink-0">
                <Image src={a.heroImage} alt="" fill sizes="56px" className="photo-grade object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold truncate group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-primary)" }}>{a.name}</span>
                <span className="block text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                  {a.state} · {a.type}
                  {b && <span className="ml-1.5 font-semibold" style={{ color: b.color }}>· {s}% {b.label.toLowerCase()}</span>}
                </span>
                {/* Phone: the key facts on one line */}
                <span className="md:hidden block text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {a.durationDays}{formatAltitude(a) ? ` · ${formatAltitude(a)}` : ""} · {computeDifficulty(getACE(a))}
                </span>
              </span>
            </span>
            <span className="hidden md:block text-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>{a.durationDays.replace(/\s*days?/i, "")}</span>
            <span className="hidden md:block text-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>{formatAltitude(a) ?? "—"}</span>
            <span className="hidden md:block"><DifficultyMeter difficulty={computeDifficulty(getACE(a))} /></span>
            <span className="hidden md:block"><SeasonStrip months={a.bestMonths} currentMonthIdx={monthIdx} /></span>
            <span className="hidden md:block text-sm" style={{ color: "var(--text-secondary)" }}>
              {a.operators?.length ?? 0}
              {checked && <span className="block text-[10px]" style={{ color: "var(--text-tertiary)" }}>checked {checked.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
            </span>
            <span className="text-right">
              {price ? (
                <>
                  <span className="block text-[10px]" style={{ color: "var(--text-tertiary)" }}>from</span>
                  <span className="block text-sm font-semibold text-[#ff5100] tabular-nums">₹{price.toLocaleString("en-IN")}</span>
                </>
              ) : <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>—</span>}
            </span>
            <ChevronRight className="hidden md:block w-4 h-4 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" style={{ color: "var(--text-secondary)" }} />
          </Link>
        );
      })}
    </div>
  );
}
