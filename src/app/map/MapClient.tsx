"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  SlidersHorizontal, Loader2, Compass, Users, ChevronLeft, PanelLeftClose, PanelLeftOpen, BookmarkPlus,
} from "lucide-react";
import { nearFrom } from "@/lib/alerts";
import { MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import Navbar from "@/components/layout/Navbar";
import ChatBubble from "@/components/ChatBubble";
import { useTripLog } from "@/contexts/TripLogContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { adventures, type Adventure, type Month } from "@/lib/data";
import type { GroupMember } from "@/lib/fitness";
import type { GroupSummary, StoredGroup } from "@/lib/matchGroups";
import { track } from "@/lib/analytics";
import { currentMonthIndexIST } from "@/lib/homeCuration";
import { SORT_LABELS, sortAdventures, type SortKey } from "@/lib/exploreHelpers";
import {
  NO_FILTERS, filtersFromParams, writeFilterParams, filterAdventures, panelCount, anyFilter,
  FilterPanel, type AdventureFilterState,
} from "@/components/ui/custom/AdventureFilters";
import MapCanvas, { type MapApi, type UserPhoto, type CompletedAdventure } from "./MapCanvas";
import FilterDock from "./FilterDock";
import LayersMenu from "./LayersMenu";
import CompassBar, { type CompassPick } from "./CompassBar";
import ResultsList from "./ResultsList";
import PinCard from "./PinCard";
import CompareTray from "./CompareTray";
import { fitFor, haversineKm, difficultyColor, type LayerKey, type Fit } from "./mapShared";
import PeekCarousel from "./PeekCarousel";
import MapEmptyState from "./MapEmptyState";

const DIFFICULTY_SCALE = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];

// The Adventure Map, built on the home page promise:
//   FIND     — Type, Where and Near me on screen; every other filter (Explore's, shared) under Filters
//   COMPARE  — add from any pin or row, compare side by side
//   BOOK     — verified operators, prices and a booking link on every pin
//   …matched to your fitness (or your group's), picked for you by AI, run by verified operators.

const PANEL_W = 380;
const GAP = 12;
// Peek fits the handle, Compass's one line and a row of cards
const SHEET = { peek: 206, half: 0.55, full: 0.88 } as const;
type SheetState = "peek" | "half" | "full";

export default function MapClient() {
  const [mounted, setMounted] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [areaH, setAreaH] = useState(700);
  const areaRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<MapApi | null>(null);

  // ── What's shown ────────────────────────────────────────────────────────────
  // Same filters as Explore, read from and written to the same link params
  const [f, setF] = useState<AdventureFilterState>(NO_FILTERS);
  const set = useCallback((patch: Partial<AdventureFilterState>) => setF((cur) => ({ ...cur, ...patch })), []);
  const [sort, setSort] = useState<SortKey | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const monthIdx = currentMonthIndexIST();
  // A single month picked under Filters is outlined on cards and rows
  const month: Month | null = f.months.length === 1 ? f.months[0] : null;
  const [radius, setRadius] = useState<number | null>(250);
  const [picks, setPicks] = useState<CompassPick[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [inView, setInView] = useState<Set<string>>(new Set());
  const [layer, setLayer] = useState<LayerKey>("map");
  const [sheet, setSheet] = useState<SheetState>("peek");

  // ── You ─────────────────────────────────────────────────────────────────────
  const { ace } = useFitnessProfile();
  const { saved } = useWishlist();
  const { log: tripLog } = useTripLog();
  const [loggedIn, setLoggedIn] = useState(false);
  const [nearMe, setNearMe] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [shotsOn, setShotsOn] = useState(false);
  const [shotsLoading, setShotsLoading] = useState(false);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [trailOn, setTrailOn] = useState(false);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [group, setGroup] = useState<{ code: string; name: string; members: GroupMember[] } | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    });
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAreaH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  // Your groups from Group Match, so the map can rate adventures for everyone at once
  useEffect(() => {
    if (!loggedIn) return;
    fetch("/api/match-groups").then((r) => (r.ok ? r.json() : null)).then((d) => setGroups(d?.groups ?? [])).catch(() => {});
  }, [loggedIn]);

  function chooseGroup(code: string) {
    if (!code) { setGroup(null); return; }
    setGroupLoading(true);
    fetch(`/api/match-groups/${code}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { group: StoredGroup }) => {
        setGroup({ code, name: d.group.name, members: d.group.members.map((m) => ({ name: m.name, ace: m.ace })) });
        track("map_group_fit", { members: d.group.members.length });
      })
      .catch(() => toast.error("Couldn't load that group."))
      .finally(() => setGroupLoading(false));
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const fits = useMemo(() => {
    const m = new Map<string, Fit | null>();
    for (const a of adventures) m.set(a.slug, fitFor(a, ace, group?.members ?? null));
    return m;
  }, [ace, group]);
  const canFit = !!ace || !!group;

  const pickReasons = useMemo(() => new Map(picks.map((p) => [p.slug, p.reason])), [picks]);
  const pickSet = useMemo(() => new Set(picks.map((p) => p.slug)), [picks]);

  // With a group picked, "Ready" and "A stretch" mean for everyone in it
  const score = useMemo(() => (canFit ? (a: Adventure) => fits.get(a.slug)?.score ?? 0 : undefined), [canFit, fits]);
  const sortKey: SortKey = sort ?? (canFit ? "match" : "recommended");

  // Explore's filters, then the Near me radius (a map-only filter)
  const filtered = useMemo(() => {
    const rows = filterAdventures(adventures, f, { score });
    return nearMe && radius ? rows.filter((a) => haversineKm(nearMe.lat, nearMe.lng, a.lat, a.lng) <= radius) : rows;
  }, [f, score, nearMe, radius]);

  // Compass picks stay on the map even when a filter would hide them
  const shown = useMemo(() => {
    const extra = adventures.filter((a) => pickReasons.has(a.slug) && !filtered.includes(a));
    return extra.length ? [...filtered, ...extra] : filtered;
  }, [filtered, pickReasons]);

  // Explore's sort; with Near me on, nearest first
  const listed = useMemo(() => {
    const rows = sortAdventures(shown.filter((a) => inView.has(a.slug)), sortKey, { monthIdx, score });
    if (!nearMe) return rows;
    const dist = (a: Adventure) => haversineKm(nearMe.lat, nearMe.lng, a.lat, a.lng);
    return [...rows].sort((x, y) => dist(x) - dist(y));
  }, [shown, inView, sortKey, monthIdx, score, nearMe]);

  const pickAdventures = useMemo(() => picks.map((p) => adventures.find((a) => a.slug === p.slug)).filter((a): a is Adventure => !!a), [picks]);
  const selectedAdv = selected ? adventures.find((a) => a.slug === selected) ?? null : null;

  const completed: CompletedAdventure[] = useMemo(() => trailOn
    ? tripLog.map((e) => { const adv = adventures.find((a) => a.slug === e.slug); return adv ? { adv, date: e.date } : null; }).filter((x): x is CompletedAdventure => !!x)
    : [], [trailOn, tripLog]);

  const sheetH = sheet === "peek" ? SHEET.peek : Math.round(areaH * SHEET[sheet]);
  const insets = desktop ? { left: panelOpen ? GAP + PANEL_W + GAP : 0, bottom: 16 } : { left: 0, bottom: sheetH, top: 60 };

  const filtersActive = anyFilter(f);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const select = useCallback((slug: string) => {
    setSelected(slug);
    setFiltersOpen(false);
    setPanelOpen(true);
    apiRef.current?.focus(slug);
    if (!desktop) setSheet((s) => (s === "full" ? s : "half"));
    track("map_pin_open", { slug });
  }, [desktop]);

  // The link carries the filters (same params as Explore), the sort and the open adventure
  // (?a=slug), so a map view can be shared, and Explore's "See them on the map" lands on
  // the same results. Syncing waits until the incoming link has been read, or it would wipe it.
  const linkRead = useRef(false);
  useEffect(() => {
    if (!linkRead.current) return;
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      writeFilterParams(url.searchParams, f);
      if (sort) url.searchParams.set("sort", sort); else url.searchParams.delete("sort");
      if (selected) url.searchParams.set("a", selected); else url.searchParams.delete("a");
      window.history.replaceState(window.history.state, "", url);
    }, 300);
    return () => clearTimeout(t);
  }, [f, sort, selected]);
  useEffect(() => {
    if (!mounted || linkRead.current) return;
    linkRead.current = true;
    const params = new URLSearchParams(window.location.search);
    setF(filtersFromParams(params));
    if (params.get("sort") && params.get("sort")! in SORT_LABELS) setSort(params.get("sort") as SortKey);
    // A saved search can carry Near me (near=lat,lng&r=km)
    const near = nearFrom(params);
    if (near) { setNearMe({ lat: near.lat, lng: near.lng }); setRadius(near.radius); }
    const slug = params.get("a");
    // Wait a beat for Leaflet to load before flying there
    if (slug && adventures.some((a) => a.slug === slug)) setTimeout(() => select(slug), 400);
  }, [mounted, select]);

  const showAll = useCallback(() => apiRef.current?.fitTo(shown.map((a) => a.slug)), [shown]);

  // Picking a type or a place takes the map to what's left, so the choice shows at once
  const typeWhere = `${f.types.join()}|${f.states.join()}`;
  const lastTypeWhere = useRef<string | null>(null);
  useEffect(() => {
    if (!linkRead.current) return;
    if (lastTypeWhere.current === null) { lastTypeWhere.current = typeWhere; return; }
    if (lastTypeWhere.current === typeWhere) return;
    lastTypeWhere.current = typeWhere;
    if (!shown.length) return;
    const t = setTimeout(() => (typeWhere === "|" ? apiRef.current?.reset() : showAll()), 80);
    return () => clearTimeout(t);
  }, [typeWhere, shown.length, showAll]);

  const onPicks = useCallback((p: CompassPick[]) => {
    setPicks(p);
    setSelected(null);
    if (!desktop && p.length) setSheet("half");
  }, [desktop]);

  // Fly to Compass picks once they're on the map
  useEffect(() => {
    if (!picks.length) return;
    const t = setTimeout(() => apiRef.current?.fitTo(picks.map((p) => p.slug)), 60);
    return () => clearTimeout(t);
  }, [picks]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSelected(null); setFiltersOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function clearAll() {
    setF(NO_FILTERS);
  }

  // Each filter change is remembered, so an empty map can step back one instead of starting over
  const history = useRef<AdventureFilterState[]>([]);
  const prevF = useRef(f);
  const undoing = useRef(false);
  useEffect(() => {
    if (prevF.current === f) return;
    if (!undoing.current && linkRead.current) history.current = [...history.current.slice(-19), prevF.current];
    undoing.current = false;
    prevF.current = f;
  }, [f]);
  function undoFilter() {
    const prev = history.current.pop();
    if (!prev) return;
    undoing.current = true;
    setF(prev);
  }

  // The map only knows what's in view once it has drawn; until then don't call the view empty
  const [viewReady, setViewReady] = useState(false);
  const onViewChange = useCallback((s: Set<string>) => { setInView(s); setViewReady(true); }, []);
  const emptyKind: "none" | "elsewhere" | null = !mounted || selectedAdv ? null
    : shown.length === 0 ? "none"
    : viewReady && listed.length === 0 ? "elsewhere" : null;
  // Near me is the only thing emptying the map: offer to drop the distance
  const nearIsTheCause = !!nearMe && !!radius && shown.length === 0 && filterAdventures(adventures, f, { score }).length > 0;

  function handleNearMe() {
    if (nearMe) { setNearMe(null); return; }
    if (!navigator.geolocation) { toast.error("Location isn't supported on this device."); return; }
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // With a radius the map frames the ring itself
        if (!radius) apiRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 7);
        setNearMeLoading(false);
        track("map_near_me", { radius: radius ?? 0 });
      },
      () => { setNearMeLoading(false); toast.error("Location access denied — enable it in your browser settings to see nearby adventures."); },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }

  // Saving a search needs an account: it's kept for you and can email you new matches
  async function saveSearch() {
    if (!loggedIn) {
      toast.error("Log in to save searches and get alerts.", {
        action: { label: "Log in", onClick: () => window.location.assign(`/auth/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`) },
      });
      return;
    }
    const p = new URLSearchParams();
    writeFilterParams(p, f);
    if (nearMe && radius) { p.set("near", `${nearMe.lat.toFixed(2)},${nearMe.lng.toFixed(2)}`); p.set("r", String(radius)); }
    const parts = [f.types.join(", "), f.states.join(", "), f.months.join(", "), f.diffs.join(", "), f.search && `“${f.search}”`, nearMe && radius ? `within ${radius} km` : ""].filter(Boolean);
    const res = await fetch("/api/saved-searches", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: (parts.join(" · ") || "My map search").slice(0, 60), query: p.toString() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { toast.error(data.error ?? "Couldn't save the search."); return; }
    track("map_save_search", { filters: panelCount(f) });
    toast.success("Search saved", { description: "We'll email you when new adventures match it.", action: { label: "View", onClick: () => window.location.assign("/profile") } });
  }

  function toggleShots() {
    if (shotsOn) { setShotsOn(false); setPhotos([]); return; }
    setShotsOn(true);
    setShotsLoading(true);
    fetch("/api/photos/mine")
      .then((r) => r.json())
      .then((d) => { const p = d.photos ?? []; setPhotos(p); if (!p.length) toast("No trip photos yet — add some from a completed adventure's page."); })
      .catch(() => setPhotos([]))
      .finally(() => setShotsLoading(false));
  }

  function toggleTrail() {
    if (trailOn) { setTrailOn(false); return; }
    setTrailOn(true);
    if (!tripLog.length) toast("No completed adventures yet — mark one done from its page to build your trail map.");
  }

  // ── Pieces shared by the desktop panel and the phone sheet ──────────────────

  // On screen: Type, Where, Near me. Everything else is under Filters.
  const dock = (floating: boolean) => (
    <FilterDock
      f={f} set={set}
      nearMe={!!nearMe} nearLoading={nearMeLoading} radius={radius}
      onNearMe={handleNearMe} onRadius={setRadius}
      onPlace={(lat, lng, name) => { apiRef.current?.flyTo(lat, lng, 9); apiRef.current?.placePin(lat, lng, name); }}
      onAdventure={(a) => select(a.slug)}
      floating={floating}
      trailing={filtersButton}
    />
  );

  // Not filters: the way into fitness matching, and whose fitness the rings show
  // One quiet line: what the pin colours and rings mean, and the way into fitness matching
  const legendLine = (
    <div className="flex items-center gap-2.5 text-[10.5px] text-white/45 overflow-x-auto no-scrollbar whitespace-nowrap">
      <span className="inline-flex items-center gap-1 shrink-0" title="Pin colour: difficulty">
        {DIFFICULTY_SCALE.map((d) => <i key={d} title={d} className="w-2 h-2 rounded-full" style={{ background: difficultyColor(d) }} />)}
        <span className="ml-0.5">Easy → Extreme</span>
      </span>
      {canFit ? (
        <span className="inline-flex items-center gap-1 shrink-0" title="Ring: how ready you are">
          <i className="w-2 h-2 rounded-full border-2 border-[#10b981]" /><i className="w-2 h-2 rounded-full border-2 border-[#f59e0b]" /><i className="w-2 h-2 rounded-full border-2 border-[#f43f5e]" />
          <span className="ml-0.5">Ready → Not yet</span>
        </span>
      ) : (
        <Link href="/matchmaker" onClick={() => track("map_fitness_cta", { from: "toolbar" })} className="inline-flex items-center gap-1 font-semibold text-[#ffa576] hover:underline shrink-0">
          <MatchmakerMark className="w-3 h-3" />Light up my matches
        </Link>
      )}
      {loggedIn && groups.length > 0 && (
        <label className="relative inline-flex items-center gap-1 font-semibold text-white/60 hover:text-white shrink-0 cursor-pointer">
          {groupLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
          <span className="max-w-[100px] truncate">{group ? group.name : "Fit for a group"}</span>
          <select aria-label="Rate adventures for a group" value={group?.code ?? ""} onChange={(e) => chooseGroup(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
            <option value="">Just me</option>
            {groups.map((g) => <option key={g.code} value={g.code}>{g.name} ({g.memberCount})</option>)}
          </select>
        </label>
      )}
    </div>
  );

  const statusLine = (
    <div className="flex items-center gap-2 text-[11px] text-white/45">
      <span><b className="text-white/85">{listed.length}</b> in view{shown.length !== adventures.length && <> · {shown.length} of {adventures.length} match</>}</span>
      {listed.length < shown.length && listed.length > 0 && (
        <button type="button" onClick={showAll} className="font-semibold text-white/60 hover:text-white underline-offset-2 hover:underline">Show all</button>
      )}
      {filtersActive && <button type="button" onClick={clearAll} className="font-semibold text-[#ff9a66] hover:underline">Clear</button>}
      {(filtersActive || nearMe) && (
        <button type="button" onClick={saveSearch} className="inline-flex items-center gap-1 font-semibold text-white/60 hover:text-white">
          <BookmarkPlus className="w-3 h-3" />Save search
        </button>
      )}
      {/* Same sort options as Explore (phones get them in the Filters panel) */}
      <label className="hidden md:inline-flex items-center gap-1 ml-auto">
        <span className="sr-only">Sort</span>
        <select value={sortKey} onChange={(e) => setSort(e.target.value as SortKey)} className="tm-sort">
          {(Object.keys(SORT_LABELS) as SortKey[]).filter((k) => k !== "match" || canFit).map((k) => (
            <option key={k} value={k}>{SORT_LABELS[k]}</option>
          ))}
        </select>
      </label>
    </div>
  );

  const body = selectedAdv ? (
    <div>
      <button type="button" onClick={() => setSelected(null)} className="mb-2 inline-flex items-center gap-1 text-[12px] font-semibold text-white/60 hover:text-white"><ChevronLeft className="w-4 h-4" /> All in view</button>
      <PinCard
        adventure={selectedAdv}
        fit={fits.get(selectedAdv.slug) ?? null}
        group={group?.name ?? null}
        hasProfile={!!ace}
        month={month}
        pickReason={pickReasons.get(selectedAdv.slug)}
        onClose={() => setSelected(null)}
      />
    </div>
  ) : (
    <ResultsList list={listed} picks={pickAdventures.filter((a) => shown.includes(a))} fits={fits} month={month} selected={selected}
      matches={shown.length} onPick={select} onHover={setHovered} onShowAll={showAll} onClear={clearAll} />
  );

  const filtersButton = (
    <button type="button" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen}
      className="tm-iconbtn-lg relative" data-on={filtersOpen || panelCount(f) > 0 || undefined} aria-label="Filters">
      <SlidersHorizontal className="w-4 h-4" />
      {panelCount(f) > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#ff5100] text-white text-[9px] font-bold grid place-items-center">{panelCount(f)}</span>}
    </button>
  );

  const layersMenu = (
    <LayersMenu
      layer={layer} onLayer={setLayer} loggedIn={loggedIn}
      shotsOn={shotsOn} shotsLoading={shotsLoading} onShots={toggleShots}
      trailOn={trailOn} onTrail={toggleTrail}
    />
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    // Always dark: the map is dark, so the shared filter pieces use the site's dark theme here
    <div className="tm-page dark flex flex-col" style={{ height: "100dvh" }}>
      <Navbar />
      <div className="h-16 lg:h-20 shrink-0" />

      <div ref={areaRef} className="relative flex-1 overflow-hidden isolate" data-hide-compass>
        {mounted ? (
          <MapCanvas
            adventures={shown}
            fits={fits}
            month={month}
            picks={pickSet}
            selected={selected}
            hovered={hovered}
            wishlist={saved}
            layer={layer}
            insets={insets}
            nearMe={nearMe}
            radiusKm={radius}
            userPhotos={photos}
            completed={completed}
            apiRef={apiRef}
            onSelect={select}
            onViewChange={onViewChange}
          />
        ) : (
          <div className="w-full h-full grid place-items-center bg-[#0b0d10]"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
        )}

        {emptyKind && (
          <MapEmptyState
            kind={emptyKind}
            matches={shown.length}
            insets={insets}
            onUndo={history.current.length ? undoFilter : undefined}
            onWiden={nearIsTheCause ? () => setRadius(null) : undefined}
            onClear={() => { clearAll(); if (nearIsTheCause) setRadius(null); }}
            onShowAll={showAll}
          />
        )}

        {mounted && desktop && (
          <>
            {panelOpen && (
              <button type="button" onClick={() => setPanelOpen(false)} aria-label="Hide the panel and show the whole map" title="Hide panel"
                className="absolute z-[1000] tm-glass w-8 h-10 rounded-r-xl rounded-l-none border-l-0 grid place-items-center text-white/45 hover:text-white"
                style={{ top: GAP + 18, left: GAP + PANEL_W }}>
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
            {!panelOpen && (
              <button type="button" onClick={() => setPanelOpen(true)} className="absolute z-[1000] tm-glass rounded-2xl h-11 pl-3 pr-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/85 hover:text-white"
                style={{ top: GAP, left: GAP }}>
                <PanelLeftOpen className="w-4 h-4 text-[#ff9a66]" /> {listed.length} in view · Compass.AI & filters
              </button>
            )}
            <aside className={`absolute z-[1000] flex flex-col tm-glass rounded-3xl overflow-hidden transition-[transform,opacity] duration-300 ${panelOpen ? "" : "-translate-x-[110%] opacity-0 pointer-events-none"}`}
              style={{ top: GAP, left: GAP, bottom: GAP, width: PANEL_W }} aria-hidden={!panelOpen || undefined}>
              <div className="p-3 space-y-2 border-b border-white/[0.06]">
                <CompassBar ace={ace} onPicks={onPicks} active={picks.length > 0} />
                {dock(false)}
                {statusLine}
                {legendLine}
              </div>
              <div className="flex-1 overflow-y-auto p-3.5 tm-scroll">{body}</div>
            </aside>

            <div className="absolute z-[1000] top-3 flex items-center gap-1.5" style={{ right: 56 }}>
              <button type="button" onClick={() => apiRef.current?.reset()} className="tm-glass rounded-xl h-10 px-3 text-[11.5px] font-semibold text-white/70 hover:text-white inline-flex items-center gap-1.5" title="Show all of India">
                <Compass className="w-3.5 h-3.5" /> All of India
              </button>
              {layersMenu}
            </div>

            <div className="absolute z-[1000] bottom-4 right-4"><CompareTray onFocus={select} /></div>
          </>
        )}

        {mounted && !desktop && (
          <>
            <div className="absolute z-[1000] top-2 inset-x-2">{dock(true)}</div>
            <div className="absolute z-[999] right-2" style={{ top: 56 }}>{layersMenu}</div>

            <MobileSheet height={sheetH} state={sheet} onState={setSheet} areaH={areaH}>
              {/* An open adventure gets the whole sheet: on a phone the card is the point, so
                  Compass, the count and the legend step aside until you go back */}
              {!selectedAdv && (
                <div className="px-3.5 pb-3 space-y-2.5">
                  <CompassBar ace={ace} onPicks={onPicks} active={picks.length > 0} />
                  {sheet === "peek" ? (
                    // Collapsed: a swipeable row of what's in view, tied to the pins
                    <PeekCarousel list={listed.length ? listed : shown} fits={fits} onHover={setHovered} onOpen={select} />
                  ) : (
                    <>
                      {statusLine}
                      {legendLine}
                      <CompareTray onFocus={select} />
                    </>
                  )}
                </div>
              )}
              {/* Collapsed, the card row stands in for the list */}
              {(sheet !== "peek" || selectedAdv) && <div className={`px-3.5 pb-6 ${selectedAdv ? "pt-0.5" : ""}`}>{body}</div>}
            </MobileSheet>
          </>
        )}
      </div>

      {filtersOpen && (
        <FilterPanel
          f={f} set={set}
          onClose={() => setFiltersOpen(false)}
          onClear={clearAll}
          resultCount={filtered.length}
          sortKey={sortKey} setSort={setSort}
          hasProfile={canFit}
        />
      )}

      <ChatBubble />
      <style>{PAGE_CSS}</style>
    </div>
  );
}

// ── Phone bottom sheet: tap the handle to step, or drag it ─────────────────────

function MobileSheet({ height, state, onState, areaH, children }: {
  height: number; state: SheetState; onState: (s: SheetState) => void; areaH: number; children: React.ReactNode;
}) {
  const drag = useRef<{ y: number; h: number } | null>(null);
  const [dragH, setDragH] = useState<number | null>(null);

  function snap(h: number) {
    const opts: [SheetState, number][] = [["peek", SHEET.peek], ["half", areaH * SHEET.half], ["full", areaH * SHEET.full]];
    onState(opts.reduce((best, o) => (Math.abs(o[1] - h) < Math.abs(best[1] - h) ? o : best))[0]);
  }

  return (
    <section
      className="absolute z-[1001] inset-x-0 bottom-0 tm-glass rounded-t-[26px] flex flex-col"
      style={{ height: dragH ?? height, transition: dragH === null ? "height .3s cubic-bezier(.2,1,.3,1)" : "none" }}
      aria-label="Adventures on the map"
    >
      <button
        type="button"
        aria-label={state === "peek" ? "Show the list" : "Collapse the list"}
        className="w-full pt-2.5 pb-2 grid place-items-center touch-none shrink-0"
        onClick={() => onState(state === "peek" ? "half" : state === "half" ? "full" : "peek")}
        onPointerDown={(e) => { drag.current = { y: e.clientY, h: height }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (!drag.current) return; const h = drag.current.h + (drag.current.y - e.clientY); if (Math.abs(drag.current.y - e.clientY) > 6) setDragH(Math.max(SHEET.peek, Math.min(areaH * SHEET.full, h))); }}
        onPointerUp={() => { if (dragH !== null) snap(dragH); drag.current = null; setDragH(null); }}
      >
        <span className="w-10 h-1.5 rounded-full bg-white/25" />
      </button>
      <div className={`flex-1 min-h-0 tm-scroll ${state === "peek" ? "overflow-hidden" : "overflow-y-auto"}`}>{children}</div>
    </section>
  );
}

const PAGE_CSS = `
  .tm-page { background: #0b0d10; color: #fff; }
  .tm-glass { background: rgba(17,20,24,0.86); backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2);
              border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 16px 48px rgba(0,0,0,0.45); }
  @media (prefers-reduced-transparency: reduce) { .tm-glass { background: #121519; backdrop-filter: none; } }
  .tm-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }

  .tm-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); color: #fff; outline: none; caret-color: #ff5100; transition: border-color .2s, background .2s; }
  .tm-input::placeholder { color: rgba(255,255,255,0.4); }
  .tm-input:focus { border-color: rgba(255,125,71,0.5); background: rgba(255,255,255,0.07); }
  .tm-glass .tm-input { background: transparent; border-color: transparent; }

  .tm-label { font-size: 9.5px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 6px; }

  .tm-sort { height: 26px; padding: 0 6px; border-radius: 8px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.75);
             background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); outline: none; cursor: pointer; }
  .tm-sort option { background: #17120f; }

  /* Sized to the phone, leaving the next card peeking in from the right */
  .tm-peekcard { display: flex; width: min(268px, calc(100vw - 64px)); height: 88px; border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.045);
                 border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 3px 0 0 -1px var(--c); transition: border-color .2s; }
  .tm-peekcard:active { border-color: color-mix(in srgb, var(--c) 60%, transparent); }

  .tm-empty { padding: 20px 18px 18px; border-radius: 22px; background: rgba(17,20,24,0.92); border: 1px solid rgba(255,255,255,0.1);
              box-shadow: 0 30px 70px rgba(0,0,0,0.55); backdrop-filter: blur(18px); animation: tmMenu .25s ease-out both; }

  /* ── Filter dock: Type · Where · Near me ── */
  .tm-pill { display: inline-flex; align-items: center; gap: 5px; height: 40px; padding: 0 8px; border-radius: 12px; font-size: 12.5px; font-weight: 600;
             color: rgba(255,255,255,0.78); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); transition: all .2s; }
  .tm-pill:hover, .tm-pill[data-open] { color: #fff; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); }
  .tm-pill[data-on] { color: #ffb08a; background: rgba(255,81,0,0.14); border-color: rgba(255,125,71,0.45); box-shadow: 0 0 18px -6px rgba(255,81,0,0.6); }
  .tm-pill[data-on][data-tone="sky"] { color: #8fd8fb; background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.45); box-shadow: 0 0 18px -6px rgba(56,189,248,0.6); }
  .tm-dock-float .tm-pill { background: rgba(17,20,24,0.88); backdrop-filter: blur(14px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
  .tm-dock-float .tm-pill[data-on] { background: rgba(60,26,12,0.92); }
  .tm-dock-float .tm-pill[data-on][data-tone="sky"] { background: rgba(12,40,56,0.92); }
  /* Narrow phones: the words matter more than the icons */
  @media (max-width: 359px) { .tm-pill > span:first-child { display: none; } .tm-pill { padding: 0 6px; font-size: 12px; } }

  .tm-menu { border-radius: 18px; overflow: hidden; background: rgba(17,20,24,0.97); border: 1px solid rgba(255,255,255,0.1);
             box-shadow: 0 24px 60px rgba(0,0,0,0.6); backdrop-filter: blur(20px); animation: tmMenu .18s ease-out both; }
  @keyframes tmMenu { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }

  /* Type tiles: the map's own pin, a count, and a bar for their share of all adventures */
  .tm-tile { position: relative; overflow: hidden; display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 14px; color: rgba(255,255,255,0.85);
             background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); transition: all .2s; }
  .tm-tile:hover { background: rgba(255,255,255,0.07); }
  .tm-tile[data-on] { color: #fff; background: color-mix(in srgb, var(--g) 14%, transparent); border-color: color-mix(in srgb, var(--g) 60%, transparent); }
  .tm-tile-icon { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0;
                  background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--g) 70%, #fff), var(--g) 70%); box-shadow: 0 0 14px var(--glow); }
  .tm-tile-bar { position: absolute; left: 0; bottom: 0; height: 2px; background: var(--g); opacity: 0.7; }

  .tm-mrow { width: 100%; display: flex; align-items: center; gap: 10px; padding: 7px 8px; border-radius: 10px; transition: background .15s; }
  .tm-mrow:hover { background: rgba(255,255,255,0.05); }
  .tm-mrow[data-on] { background: rgba(255,81,0,0.08); }

  .tm-radius { display: flex; flex-direction: column; align-items: center; padding: 8px 0; border-radius: 12px; line-height: 1.1;
               background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.75); transition: all .2s; }
  .tm-radius b { font-size: 15px; }
  .tm-radius span { font-size: 9.5px; opacity: 0.55; text-transform: uppercase; letter-spacing: 0.1em; }
  .tm-radius:hover:not(:disabled) { border-color: rgba(56,189,248,0.4); }
  .tm-radius[data-on] { color: #fff; background: rgba(56,189,248,0.16); border-color: rgba(56,189,248,0.6); }
  .tm-radius:disabled { opacity: 0.4; cursor: default; }

  .tm-toggle { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 9px; font-size: 11.5px; font-weight: 600;
               color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); transition: all .2s; cursor: pointer; }
  .tm-toggle:hover { color: #fff; }
  .tm-toggle[data-on] { color: #6ff0e0; background: rgba(111,240,224,0.1); border-color: rgba(111,240,224,0.35); }
  .tm-toggle-cta { color: #ffa576; border-color: rgba(255,165,118,0.35); background: rgba(255,81,0,0.08); }

  .tm-iconbtn-lg { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; color: rgba(255,255,255,0.7);
                   background: rgba(17,20,24,0.86); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(14px); transition: all .2s; }
  .tm-iconbtn-lg:hover, .tm-iconbtn-lg[data-on] { color: #ff9a66; border-color: rgba(255,125,71,0.4); }
  .tm-iconbtn { width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center; color: rgba(255,255,255,0.85); background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.12); }
  .tm-iconbtn:hover { background: rgba(255,81,0,0.55); }


  .tm-row { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 14px; cursor: pointer; border: 1px solid transparent; transition: background .2s, border-color .2s, opacity .2s; }
  .tm-row:hover { background: rgba(255,255,255,0.04); }
  .tm-row.is-active { background: color-mix(in srgb, var(--g) 9%, transparent); border-color: color-mix(in srgb, var(--g) 35%, transparent); }
  .tm-row.is-off { opacity: 0.5; }
  .tm-row:focus-visible { outline: 2px solid #ff7d47; outline-offset: 1px; }
  .tm-cmp { width: 30px; height: 30px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.08); transition: all .2s; }
  .tm-row:hover .tm-cmp { color: rgba(255,255,255,0.7); }
  .tm-cmp:hover:not(:disabled) { color: #fff; border-color: rgba(255,255,255,0.3); }
  .tm-cmp.is-on { color: #6ff0e0; border-color: rgba(111,240,224,0.4); background: rgba(111,240,224,0.1); }
  .tm-cmp:disabled { opacity: 0.35; cursor: not-allowed; }

  .tm-card { border-radius: 20px; overflow: hidden; background: #111418; border: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column; }
  .tm-chip { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: rgba(0,0,0,0.55); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.12); }
  .tm-panel { padding: 10px 12px; border-radius: 14px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.06); }
  .tm-score { --p: 0%; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0;
              background: radial-gradient(closest-side, #15181c 78%, transparent 80%), conic-gradient(var(--c) var(--p), rgba(255,255,255,0.08) 0); }
  .tm-btn { height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px; font-weight: 700;
            color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); transition: all .2s; }
  .tm-btn:hover:not(:disabled) { background: rgba(255,255,255,0.09); }
  .tm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .tm-btn-primary { color: #fff; border: 0; background: linear-gradient(135deg,#ff5100,#ff7d47); box-shadow: 0 6px 20px -6px rgba(255,81,0,0.6); }
  .tm-btn-primary:hover { filter: brightness(1.08); }

  /* Phones pinch to zoom, and the search row sits where the zoom buttons would */
  @media (max-width: 1023px) { .tm-map .leaflet-control-zoom { display: none; } }
`;
