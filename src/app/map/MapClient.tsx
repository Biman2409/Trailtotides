"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  SlidersHorizontal, LocateFixed, Loader2, Camera, Trophy, Compass, Layers, Activity, BadgeCheck, Users, ChevronLeft, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ChatBubble from "@/components/ChatBubble";
import { useTripLog } from "@/contexts/TripLogContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { adventures, type Adventure, type Difficulty, type Month } from "@/lib/data";
import type { GroupMember } from "@/lib/fitness";
import type { GroupSummary, StoredGroup } from "@/lib/matchGroups";
import { track } from "@/lib/analytics";
import { typeIconSvg } from "@/lib/mapMarkerIcons";
import MapCanvas, { type MapApi, type UserPhoto, type CompletedAdventure } from "./MapCanvas";
import SearchBox from "./SearchBox";
import CompassBar, { type CompassPick } from "./CompassBar";
import ResultsList from "./ResultsList";
import PinCard from "./PinCard";
import SeasonScrubber from "./SeasonScrubber";
import CompareTray from "./CompareTray";
import FiltersPanel, { NO_FILTERS, countFilters, type FineFilters } from "./FiltersPanel";
import {
  BASE_LAYERS, GENRES, difficultyOf, hasVerified, inSeason, fitFor, haversineKm,
  type GenreKey, type LayerKey, type Fit,
} from "./mapShared";

// The Adventure Map, built on the home page promise:
//   FIND     — genre lenses (mountain → ocean), a list of what's in view, seasons over the year
//   COMPARE  — add from any pin or row, compare side by side
//   BOOK     — verified operators, prices and a booking link on every pin
//   …matched to your fitness (or your group's), picked for you by AI, run by verified operators.

const GENRE_COUNTS = Object.fromEntries(GENRES.map((g) => [g.key, adventures.filter((a) => g.types.includes(a.type)).length])) as Record<GenreKey, number>;
const TYPE_COUNTS = adventures.reduce<Record<string, number>>((n, a) => ({ ...n, [a.type]: (n[a.type] ?? 0) + 1 }), {});

const PANEL_W = 380;
const GAP = 12;
const SHEET = { peek: 168, half: 0.55, full: 0.88 } as const;
type SheetState = "peek" | "half" | "full";

export default function MapClient() {
  const [mounted, setMounted] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [areaH, setAreaH] = useState(700);
  const areaRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<MapApi | null>(null);

  // ── What's shown ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<GenreKey[]>([]);
  const [fine, setFine] = useState<FineFilters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [readyOnly, setReadyOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [month, setMonth] = useState<Month | null>(null);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const genreTypes = new Set(GENRES.filter((g) => genres.includes(g.key)).flatMap((g) => g.types));
    return adventures.filter((a) => {
      if (q && !a.name.toLowerCase().includes(q) && !a.state.toLowerCase().includes(q) && !a.type.toLowerCase().includes(q) && !a.tagline.toLowerCase().includes(q)) return false;
      if (genres.length && !genreTypes.has(a.type)) return false;
      if (fine.types.length && !fine.types.includes(a.type)) return false;
      if (fine.regions.length && !fine.regions.includes(a.region)) return false;
      if (fine.subRegions.length && !fine.subRegions.some((sr) => a.state.includes(sr))) return false;
      if (fine.difficulties.length && !fine.difficulties.includes(difficultyOf(a) as Difficulty)) return false;
      if (fine.durations.length && !fine.durations.includes(a.duration)) return false;
      if (verifiedOnly && !hasVerified(a)) return false;
      if (readyOnly && canFit && fits.get(a.slug)?.bucket.key !== "ready") return false;
      return true;
    });
  }, [search, genres, fine, verifiedOnly, readyOnly, canFit, fits]);

  // Compass picks stay on the map even when a filter would hide them
  const shown = useMemo(() => {
    const extra = adventures.filter((a) => pickReasons.has(a.slug) && !filtered.includes(a));
    return extra.length ? [...filtered, ...extra] : filtered;
  }, [filtered, pickReasons]);

  const listed = useMemo(() => {
    const rows = shown.filter((a) => inView.has(a.slug));
    const dist = (a: Adventure) => (nearMe ? haversineKm(nearMe.lat, nearMe.lng, a.lat, a.lng) : 0);
    return rows.sort((x, y) =>
      Number(inSeason(y, month)) - Number(inSeason(x, month)) ||
      (canFit ? (fits.get(y.slug)?.score ?? 0) - (fits.get(x.slug)?.score ?? 0) : 0) ||
      dist(x) - dist(y) ||
      Number(!!y.featured) - Number(!!x.featured) ||
      x.name.localeCompare(y.name));
  }, [shown, inView, month, canFit, fits, nearMe]);

  const pickAdventures = useMemo(() => picks.map((p) => adventures.find((a) => a.slug === p.slug)).filter((a): a is Adventure => !!a), [picks]);
  const selectedAdv = selected ? adventures.find((a) => a.slug === selected) ?? null : null;

  const completed: CompletedAdventure[] = useMemo(() => trailOn
    ? tripLog.map((e) => { const adv = adventures.find((a) => a.slug === e.slug); return adv ? { adv, date: e.date } : null; }).filter((x): x is CompletedAdventure => !!x)
    : [], [trailOn, tripLog]);

  const sheetH = sheet === "peek" ? SHEET.peek : Math.round(areaH * SHEET[sheet]);
  const insets = desktop ? { left: panelOpen ? GAP + PANEL_W + GAP : 0, bottom: 84 } : { left: 0, bottom: sheetH };

  const activeCount = countFilters(fine) + genres.length + (readyOnly ? 1 : 0) + (verifiedOnly ? 1 : 0) + (search ? 1 : 0);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const select = useCallback((slug: string) => {
    setSelected(slug);
    setFiltersOpen(false);
    setPanelOpen(true);
    apiRef.current?.focus(slug);
    if (!desktop) setSheet((s) => (s === "full" ? s : "half"));
    track("map_pin_open", { slug });
  }, [desktop]);

  // The open adventure lives in the URL (?a=slug), so a link opens the map on that pin.
  // Syncing waits until the incoming link has been read, or it would wipe it on load.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (!deepLinked.current) return;
    const url = new URL(window.location.href);
    if (selected) url.searchParams.set("a", selected); else url.searchParams.delete("a");
    window.history.replaceState(window.history.state, "", url);
  }, [selected]);
  useEffect(() => {
    if (!mounted || deepLinked.current) return;
    deepLinked.current = true;
    const slug = new URLSearchParams(window.location.search).get("a");
    // Wait a beat for Leaflet to load before flying there
    if (slug && adventures.some((a) => a.slug === slug)) setTimeout(() => select(slug), 400);
  }, [mounted, select]);

  const showAll = useCallback(() => apiRef.current?.fitTo(shown.map((a) => a.slug)), [shown]);

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
    setSearch(""); setGenres([]); setFine(NO_FILTERS); setReadyOnly(false); setVerifiedOnly(false);
  }

  function handleNearMe() {
    if (nearMe) { setNearMe(null); return; }
    if (!navigator.geolocation) { toast.error("Location isn't supported on this device."); return; }
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        apiRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 7);
        setNearMeLoading(false);
      },
      () => { setNearMeLoading(false); toast.error("Location access denied — enable it in your browser settings to see nearby adventures."); },
      { timeout: 8000, enableHighAccuracy: false },
    );
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

  // Mountain → ocean. A genre with nothing listed yet says so instead of emptying the map.
  const genreChip = (g: (typeof GENRES)[number], floating = false) => {
    const on = genres.includes(g.key);
    const n = GENRE_COUNTS[g.key];
    return (
      <button key={g.key} type="button" aria-pressed={on} disabled={!n}
        title={n ? `${n} ${g.label} adventure${n > 1 ? "s" : ""}` : `${g.label} adventures are coming soon`}
        onClick={() => {
          setGenres((cur) => (on ? cur.filter((x) => x !== g.key) : [...cur, g.key]));
          // Closing a genre drops its type picks too, so nothing filters out of sight
          if (on) setFine((f) => ({ ...f, types: f.types.filter((t) => !g.types.includes(t)) }));
        }}
        className={`tm-genre shrink-0 ${floating ? "tm-genre-float" : ""}`} style={{ "--g": g.color, "--glow": g.glow } as React.CSSProperties} data-on={on || undefined}>
        <span className="tm-genre-dot" />{g.label}
        <span className="tm-genre-n">{n || "Soon"}</span>
      </button>
    );
  };

  // An open genre unfolds into its activity types (only ones that have adventures), each a
  // filter of its own. Same selection as Activity under Filters.
  const typeChips = genres.length > 0 && (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar tm-types">
      {GENRES.filter((g) => genres.includes(g.key)).flatMap((g) =>
        g.types.filter((t) => TYPE_COUNTS[t]).map((t) => {
          const on = fine.types.includes(t);
          return (
            <button key={t} type="button" aria-pressed={on}
              onClick={() => setFine((f) => ({ ...f, types: on ? f.types.filter((x) => x !== t) : [...f.types, t] }))}
              className="tm-type shrink-0" style={{ "--g": g.color } as React.CSSProperties} data-on={on || undefined}>
              <span className="tm-type-icon" dangerouslySetInnerHTML={{ __html: typeIconSvg(t, 11, "currentColor") }} />
              {t}<span className="tm-type-n">{TYPE_COUNTS[t]}</span>
            </button>
          );
        }),
      )}
    </div>
  );

  const genreChips = (
    <>
      <div className="grid grid-cols-4 gap-1.5 tm-genre-grid">{GENRES.map((g) => genreChip(g))}</div>
      {typeChips}
    </>
  );

  const fitToggles = (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {canFit ? (
        <button type="button" aria-pressed={readyOnly} onClick={() => setReadyOnly((v) => !v)} className="tm-toggle shrink-0" data-on={readyOnly || undefined}>
          <Activity className="w-3.5 h-3.5" />{group ? "Ready for all" : "Ready for me"}
        </button>
      ) : (
        <Link href="/matchmaker" onClick={() => track("map_fitness_cta", { from: "toolbar" })} className="tm-toggle tm-toggle-cta shrink-0">
          <Activity className="w-3.5 h-3.5" />Light up my matches
        </Link>
      )}
      <button type="button" aria-pressed={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)} className="tm-toggle shrink-0" data-on={verifiedOnly || undefined}>
        <BadgeCheck className="w-3.5 h-3.5" />Verified only
      </button>
      {loggedIn && groups.length > 0 && (
        <label className="tm-toggle shrink-0 relative" data-on={group ? true : undefined}>
          {groupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
          <span className="max-w-[110px] truncate">{group ? group.name : "Fit for a group"}</span>
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
      {canFit && (
        <span className="hidden sm:inline-flex items-center gap-1.5 ml-auto">
          <i className="w-2 h-2 rounded-full border-2 border-[#10b981]" />Ready
          <i className="w-2 h-2 rounded-full border-2 border-[#f59e0b]" />Stretch
          <i className="w-2 h-2 rounded-full border-2 border-[#f43f5e]" />Not yet
        </span>
      )}
      {activeCount > 0 && <button type="button" onClick={clearAll} className={`font-semibold text-[#ff9a66] hover:underline ${canFit ? "" : "ml-auto"}`}>Clear</button>}
    </div>
  );

  const body = filtersOpen ? (
    <div>
      <button type="button" onClick={() => setFiltersOpen(false)} className="mb-3 inline-flex items-center gap-1 text-[12px] font-semibold text-white/60 hover:text-white"><ChevronLeft className="w-4 h-4" /> Back to results</button>
      <FiltersPanel value={fine} onChange={setFine} />
    </div>
  ) : selectedAdv ? (
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
    <button type="button" onClick={() => { setFiltersOpen((o) => !o); setSelected(null); if (!desktop) setSheet("full"); }} aria-expanded={filtersOpen}
      className="tm-iconbtn-lg relative" data-on={filtersOpen || countFilters(fine) > 0 || undefined} aria-label="More filters">
      <SlidersHorizontal className="w-4 h-4" />
      {countFilters(fine) > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#ff5100] text-white text-[9px] font-bold grid place-items-center">{countFilters(fine)}</span>}
    </button>
  );

  const you = (
    <>
      <button type="button" onClick={handleNearMe} className="tm-ctl" data-on={nearMe ? true : undefined} title={nearMe ? "Clear Near Me" : "Adventures near me"}>
        {nearMeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}<span>Near me</span>
      </button>
      {loggedIn && (
        <>
          <button type="button" onClick={toggleShots} className="tm-ctl" data-on={shotsOn || undefined} title="My trip photos">
            {shotsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}<span>My shots</span>
          </button>
          <button type="button" onClick={toggleTrail} className="tm-ctl" data-on={trailOn || undefined} data-gold title="My completed adventures">
            <Trophy className="w-3.5 h-3.5" /><span>My trail</span>
          </button>
        </>
      )}
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="tm-page flex flex-col" style={{ height: "100dvh" }}>
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
            userPhotos={photos}
            completed={completed}
            apiRef={apiRef}
            onSelect={select}
            onViewChange={setInView}
          />
        ) : (
          <div className="w-full h-full grid place-items-center bg-[#0b0d10]"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
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
                <PanelLeftOpen className="w-4 h-4 text-[#ff9a66]" /> {listed.length} in view · Compass & filters
              </button>
            )}
            <aside className={`absolute z-[1000] flex flex-col tm-glass rounded-3xl overflow-hidden transition-[transform,opacity] duration-300 ${panelOpen ? "" : "-translate-x-[110%] opacity-0 pointer-events-none"}`}
              style={{ top: GAP, left: GAP, bottom: GAP, width: PANEL_W }} aria-hidden={!panelOpen || undefined}>
              <div className="p-3.5 space-y-2.5 border-b border-white/[0.06]">
                <CompassBar ace={ace} onPicks={onPicks} active={picks.length > 0} />
                <div className="flex items-center gap-2">
                  <SearchBox value={search} onChange={setSearch} onPlace={(lat, lng, name) => { apiRef.current?.flyTo(lat, lng, 9); apiRef.current?.placePin(lat, lng, name); }} onAdventure={(a) => { setSearch(""); select(a.slug); }} />
                  {filtersButton}
                </div>
                {genreChips}
                {fitToggles}
                {statusLine}
              </div>
              <div className="flex-1 overflow-y-auto p-3.5 tm-scroll">{body}</div>
            </aside>

            <div className="absolute z-[1000] top-3 flex items-center gap-1.5" style={{ right: 56 }}>
              <div className="tm-glass rounded-xl p-1 flex items-center gap-0.5">
                {(Object.keys(BASE_LAYERS) as LayerKey[]).map((k) => (
                  <button key={k} type="button" onClick={() => setLayer(k)} aria-pressed={layer === k} className="tm-seg" data-on={layer === k || undefined}>{BASE_LAYERS[k].label}</button>
                ))}
              </div>
              <div className="tm-glass rounded-xl p-1 flex items-center gap-0.5">{you}</div>
              <button type="button" onClick={() => apiRef.current?.reset()} className="tm-glass rounded-xl h-[38px] px-3 text-[11.5px] font-semibold text-white/70 hover:text-white inline-flex items-center gap-1.5" title="Show all of India">
                <Compass className="w-3.5 h-3.5" /> India
              </button>
            </div>

            <div className="absolute z-[1000] bottom-4 flex justify-center pointer-events-none" style={{ left: insets.left, right: 0 }}>
              <div className="pointer-events-auto"><SeasonScrubber month={month} onChange={setMonth} adventures={shown} /></div>
            </div>

            {/* Above the season row, so the two never collide on narrower desktops */}
            <div className="absolute z-[1000] right-4" style={{ bottom: 84 }}><CompareTray onFocus={select} /></div>
          </>
        )}

        {mounted && !desktop && (
          <>
            <div className="absolute z-[1000] top-2 inset-x-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 tm-glass rounded-xl">
                  <SearchBox value={search} onChange={setSearch} onPlace={(lat, lng, name) => { apiRef.current?.flyTo(lat, lng, 9); apiRef.current?.placePin(lat, lng, name); }} onAdventure={(a) => { setSearch(""); select(a.slug); }} />
                </div>
                {filtersButton}
                <button type="button" aria-label={`Map style: ${BASE_LAYERS[layer].label}`} className="tm-iconbtn-lg"
                  onClick={() => setLayer((l) => (l === "map" ? "satellite" : l === "satellite" ? "terrain" : "map"))}>
                  <Layers className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-2 px-2">
                {GENRES.map((g) => genreChip(g, true))}
                <span className="tm-glass rounded-xl p-0.5 flex items-center gap-0.5 shrink-0">{you}</span>
              </div>
              {typeChips && <div className="-mx-2 px-2 tm-types-float">{typeChips}</div>}
            </div>

            <div className="absolute z-[1000] inset-x-0 flex justify-center px-2 pointer-events-none transition-[bottom] duration-300" style={{ bottom: sheetH + 8 }}>
              <div className="pointer-events-auto max-w-full"><SeasonScrubber month={month} onChange={setMonth} adventures={shown} /></div>
            </div>

            <MobileSheet height={sheetH} state={sheet} onState={setSheet} areaH={areaH}>
              <div className="px-3.5 pb-3 space-y-2.5">
                <CompassBar ace={ace} onPicks={onPicks} active={picks.length > 0} />
                {fitToggles}
                {statusLine}
                <CompareTray onFocus={select} />
              </div>
              <div className="px-3.5 pb-6">{body}</div>
            </MobileSheet>
          </>
        )}
      </div>

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

  .tm-genre { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 6px 0 9px; border-radius: 999px; font-size: 11.5px; font-weight: 600;
              color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all .2s; }
  .tm-genre:hover { color: #fff; border-color: color-mix(in srgb, var(--g) 50%, transparent); }
  .tm-genre[data-on] { color: var(--g); background: color-mix(in srgb, var(--g) 14%, transparent); border-color: color-mix(in srgb, var(--g) 55%, transparent); box-shadow: 0 0 16px -4px var(--glow); }
  .tm-genre-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--g); box-shadow: 0 0 8px var(--glow); }
  .tm-genre-float { background: rgba(17,20,24,0.86); backdrop-filter: blur(14px); }
  .tm-types { animation: tmUnfold .25s ease-out both; }
  @keyframes tmUnfold { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  .tm-type { display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 5px 0 8px; border-radius: 8px; font-size: 11px; font-weight: 600;
             color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.03); border: 1px solid color-mix(in srgb, var(--g) 22%, transparent); transition: all .2s; }
  .tm-type:hover { color: #fff; }
  .tm-type[data-on] { color: #15110e; background: var(--g); border-color: var(--g); }
  .tm-type-icon { display: grid; place-items: center; }
  .tm-type-n { font-size: 9px; font-weight: 700; padding: 0 4px; border-radius: 999px; background: rgba(255,255,255,0.07); }
  .tm-type[data-on] .tm-type-n { background: rgba(0,0,0,0.15); }
  .tm-types-float .tm-type { background: rgba(17,20,24,0.86); backdrop-filter: blur(14px); }
  .tm-types-float .tm-type[data-on] { background: var(--g); }
  .tm-genre-grid .tm-genre { justify-content: center; padding: 0 4px; gap: 4px; font-size: 11px; min-width: 0; }
  .tm-genre-grid .tm-genre-n { padding: 1px 4px; font-size: 8.5px; }
  .tm-genre-n { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 999px; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); }
  .tm-genre:disabled { cursor: default; opacity: 0.55; }
  .tm-genre:disabled:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.08); }

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

  .tm-seg, .tm-ctl { height: 30px; padding: 0 10px; border-radius: 9px; font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,0.6); display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: all .2s; }
  .tm-seg:hover, .tm-ctl:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .tm-seg[data-on] { color: #fff; background: rgba(255,81,0,0.3); }
  .tm-ctl[data-on] { color: #fff; background: #ff5100; }
  .tm-ctl[data-on][data-gold] { color: #1a1200; background: linear-gradient(135deg,#f7cd3a,#eab308); }

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
