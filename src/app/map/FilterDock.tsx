"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Shapes, MapPin, LocateFixed, Loader2, Check, Search, X, Navigation, Minus, Plus, Building2 } from "lucide-react";
import { adventures, type Adventure } from "@/lib/data";
import { toggleSelection } from "@/lib/filterOptions";
import { STATE_COUNTS, CategoryList, categoryLabel, type AdventureFilterState } from "@/components/ui/custom/AdventureFilters";

// The three filters the map keeps on screen — what kind, where, near me — as one dock.
// Everything else lives under Filters. Type and Where write the same state as the panel.

type Menu = "type" | "where" | "near" | null;
type Place = { place_id: number; display_name: string; lat: string; lon: string };

// Near me's radius stops: fine steps close in, wider ones further out (km)
export const RADII = [50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1250, 1500, 2000] as const;
// Quick picks for "From": the cities most trips start from
const CITIES: [string, number, number][] = [
  ["Delhi", 28.6139, 77.209], ["Mumbai", 19.076, 72.8777], ["Bengaluru", 12.9716, 77.5946], ["Kolkata", 22.5726, 88.3639],
  ["Chennai", 13.0827, 80.2707], ["Hyderabad", 17.385, 78.4867], ["Pune", 18.5204, 73.8567], ["Chandigarh", 30.7333, 76.7794],
  ["Dehradun", 30.3165, 78.0322], ["Ahmedabad", 23.0225, 72.5714],
];
type Near = { lat: number; lng: number; name: string | null };
const MAX_STATE = STATE_COUNTS[0]?.[1] ?? 1;

export default function FilterDock({
  f,
  set,
  near,
  nearLoading,
  radius,
  onLocate,
  onNearCity,
  onNearOff,
  onRadius,
  countWithin,
  onPlace,
  onAdventure,
  trailing,
  floating = false,
}: {
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  /** Near me's centre (your location, or a city), or null when Near me is off */
  near: Near | null;
  nearLoading: boolean;
  /** km, or null for no limit */
  radius: number | null;
  /** Centre Near me on where you are */
  onLocate: () => void;
  /** Centre Near me on a city */
  onNearCity: (lat: number, lng: number, name: string) => void;
  onNearOff: () => void;
  onRadius: (km: number | null) => void;
  /** How many adventures match within km of the centre (null: any distance) */
  countWithin: (km: number | null) => number;
  onPlace: (lat: number, lng: number, name: string) => void;
  onAdventure: (a: Adventure) => void;
  /** The Filters button, so it sits at the end of the same row */
  trailing?: React.ReactNode;
  /** Over the map on phones: glass pills instead of panel pills */
  floating?: boolean;
}) {
  const [open, setOpen] = useState<Menu>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Click outside or Escape closes the open menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const toggle = (m: Menu) => setOpen((cur) => (cur === m ? null : m));

  const typeLabel = categoryLabel("type", f);
  const whereLabel = categoryLabel("region", f);
  const nearLabel = near ? `${near.name ?? "Near me"} · ${radius ? `${radius} km` : "any"}` : "Near me";

  return (
    <div ref={wrapRef} className={`relative ${floating ? "tm-dock-float" : ""}`}>
      <div className={`grid ${trailing ? "grid-cols-[1fr_1fr_1fr_auto]" : "grid-cols-3"} items-center gap-1.5`}>
        <DockPill icon={<Shapes className="w-3.5 h-3.5" />} label={typeLabel} on={f.types.length > 0} open={open === "type"} onClick={() => toggle("type")} />
        <DockPill icon={<MapPin className="w-3.5 h-3.5" />} label={whereLabel} on={f.states.length > 0} open={open === "where"} onClick={() => toggle("where")} />
        <DockPill
          icon={nearLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
          label={nearLabel}
          on={!!near}
          open={open === "near"}
          // Your location is the default centre: asked for as the menu opens
          onClick={() => { if (!near && !nearLoading && open !== "near") onLocate(); toggle("near"); }}
          tone="sky"
        />
        {trailing && <div className="flex items-center gap-1.5">{trailing}</div>}
      </div>

      {open && (
        <div className="tm-menu absolute left-0 right-0 top-full mt-2 z-[1100]" role="dialog" aria-label={open === "type" ? "Adventure type" : open === "where" ? "Region" : "Near me"}>
          {open === "type" && <TypeMenu f={f} set={set} />}
          {open === "where" && <WhereMenu f={f} set={set} onPlace={(...a) => { onPlace(...a); setOpen(null); }} onAdventure={(a) => { onAdventure(a); setOpen(null); }} />}
          {open === "near" && (
            <NearMenu near={near} loading={nearLoading} radius={radius} onRadius={onRadius} countWithin={countWithin}
              onLocate={onLocate} onCity={onNearCity} onOff={() => { onNearOff(); setOpen(null); }} />
          )}
        </div>
      )}
    </div>
  );
}

function DockPill({ icon, label, on, open, onClick, tone = "orange" }: {
  icon: React.ReactNode; label: string; on: boolean; open: boolean; onClick: () => void; tone?: "orange" | "sky";
}) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open} aria-pressed={on} title={label}
      className="tm-pill min-w-0 justify-center" data-on={on || undefined} data-open={open || undefined} data-tone={tone}>
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ── Type: tiles with the map's own pin icon, a count and their share of the map ── */

// The same Earth / Water / Snow / Air lists as Explore's Type button
function TypeMenu({ f, set }: { f: AdventureFilterState; set: (p: Partial<AdventureFilterState>) => void }) {
  return (
    <div className="p-3 max-h-[min(60vh,420px)] overflow-y-auto tm-scroll">
      <div className="flex items-center justify-between mb-2.5">
        <p className="tm-label !mb-0">Adventure type</p>
        {f.types.length > 0 && <button type="button" onClick={() => set({ types: [] })} className="text-[11px] font-semibold text-[var(--tm-peach)] hover:underline">All types</button>}
      </div>
      <CategoryList kind="type" f={f} set={set} columns={1} />
    </div>
  );
}

/* ── Where: one box for states, places and adventures; states as a ranked list ── */

function WhereMenu({ f, set, onPlace, onAdventure }: {
  f: AdventureFilterState; set: (p: Partial<AdventureFilterState>) => void;
  onPlace: (lat: number, lng: number, name: string) => void; onAdventure: (a: Adventure) => void;
}) {
  const [q, setQ] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = q.trim().toLowerCase();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const fetchPlaces = useCallback((text: string) => {
    if (text.trim().length < 2) { setPlaces([]); return; }
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=3&countrycodes=in&addressdetails=0`, { headers: { "Accept-Language": "en" } })
      .then((r) => r.json())
      .then((d: Place[]) => setPlaces(d))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchPlaces(q), 400);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [q, fetchPlaces]);

  const states = query ? STATE_COUNTS.filter(([s]) => s.toLowerCase().includes(query)) : STATE_COUNTS;
  const advs = query.length >= 2 ? adventures.filter((a) => a.name.toLowerCase().includes(query)).slice(0, 4) : [];

  return (
    <div>
      <div className="relative p-2.5 border-b border-white/[0.06]">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        {loading
          ? <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-white/40" />
          : q && <button type="button" aria-label="Clear" onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="A state, a place or an adventure" aria-label="Search states, places and adventures"
          className="tm-input w-full h-10 pl-9 pr-8 rounded-xl text-[16px] lg:text-[13px]" />
      </div>

      <div className="max-h-[min(52vh,360px)] overflow-y-auto tm-scroll p-2">
        {advs.length > 0 && (
          <Group title="Adventures">
            {advs.map((a) => (
              <button key={a.slug} type="button" onClick={() => onAdventure(a)} className="tm-mrow">
                <span className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0"><Image src={a.heroImage} alt="" fill className="object-cover" sizes="32px" unoptimized /></span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[12.5px] font-semibold text-white/90 truncate">{a.name}</span>
                  <span className="block text-[10.5px] text-white/40 truncate">{a.type} · {a.state}</span>
                </span>
                <Navigation className="w-3.5 h-3.5 text-white/30 shrink-0" />
              </button>
            ))}
          </Group>
        )}

        {/* No search yet: the regions, each with its states, as on Explore's Region button */}
        {!query && (
          <Group title="Regions" action={f.states.length > 0 ? <button type="button" onClick={() => set({ states: [] })} className="text-[11px] font-semibold text-[var(--tm-peach)] hover:underline">Anywhere</button> : null}>
            <div className="px-1.5 pb-1"><CategoryList kind="region" f={f} set={set} columns={1} /></div>
          </Group>
        )}

        {query && states.length > 0 && (
          <Group title="States">
            {states.map(([s, n]) => {
              const on = f.states.includes(s);
              return (
                <button key={s} type="button" aria-pressed={on} onClick={() => toggleSelection(f.states, s, (v) => set({ states: v }))} className="tm-mrow" data-on={on || undefined}>
                  <span className={`w-4 h-4 rounded-[5px] grid place-items-center shrink-0 border ${on ? "bg-[#ff5100] border-[#ff5100]" : "border-white/20"}`}>{on && <Check className="w-3 h-3 text-white" />}</span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-white/85 truncate">{s}</span>
                      <span className="text-[10.5px] text-white/40 shrink-0">{n}</span>
                    </span>
                    <span className="block h-[3px] mt-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <span className="block h-full rounded-full" style={{ width: `${(n / MAX_STATE) * 100}%`, background: on ? "var(--tm-orange)" : "rgba(var(--tm-ink),0.22)" }} />
                    </span>
                  </span>
                </button>
              );
            })}
          </Group>
        )}

        {places.length > 0 && (
          <Group title="Places — fly there">
            {places.map((p) => (
              <button key={p.place_id} type="button" onClick={() => onPlace(parseFloat(p.lat), parseFloat(p.lon), p.display_name.split(",")[0])} className="tm-mrow">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-[12.5px] text-white/70 line-clamp-1 text-left">{p.display_name}</span>
              </button>
            ))}
          </Group>
        )}

        {query.length >= 2 && !advs.length && !states.length && !places.length && !loading && (
          <p className="text-center text-[12px] text-white/40 py-6">Nothing called “{q}”. Try a state or a town.</p>
        )}
      </div>
    </div>
  );
}

function Group({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5">
        <p className="tm-label !mb-0">{title}</p>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

/* ── Near me: from your location or a city, within a radius drawn on the map as a ring ── */

function NearMenu({ near, loading, radius, onRadius, countWithin, onLocate, onCity, onOff }: {
  near: Near | null; loading: boolean; radius: number | null; onRadius: (km: number | null) => void;
  countWithin: (km: number | null) => number; onLocate: () => void; onCity: (lat: number, lng: number, name: string) => void; onOff: () => void;
}) {
  const [q, setQ] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const query = q.trim();

  // Towns and cities in India, from OpenStreetMap, as you type
  useEffect(() => {
    if (query.length < 2) { setPlaces([]); return; }
    const t = setTimeout(() => {
      setSearching(true);
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&addressdetails=0&featuretype=settlement`, { headers: { "Accept-Language": "en" } })
        .then((r) => r.json()).then((d: Place[]) => setPlaces(d)).catch(() => setPlaces([])).finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const pick = (lat: number, lng: number, name: string) => { onCity(lat, lng, name); setQ(""); setPlaces([]); };
  const quick = CITIES.filter(([n]) => !query || n.toLowerCase().includes(query.toLowerCase()));

  // The slider moves through RADII; Any distance sits past the last stop
  const found = radius == null ? -1 : RADII.findIndex((r) => r >= radius);
  const idx = radius == null ? RADII.length : found < 0 ? RADII.length - 1 : found;
  const setIdx = (i: number) => onRadius(i >= RADII.length ? null : RADII[Math.max(0, Math.min(RADII.length - 1, i))]);
  const n = near ? countWithin(radius) : null;
  const fromMe = !!near && near.name === null;

  return (
    <div className="p-3 space-y-3.5">
      {/* From: your location by default, or any city */}
      <div>
        <p className="tm-label">From</p>
        <button type="button" onClick={onLocate} aria-pressed={fromMe} className="tm-mrow" data-on={fromMe || undefined}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-[var(--tm-sky)] shrink-0" /> : <LocateFixed className="w-4 h-4 text-[var(--tm-sky)] shrink-0" />}
          <span className="flex-1 text-left text-[12.5px] font-semibold text-white/85">{loading ? "Finding you…" : "My location"}</span>
          {fromMe && <Check className="w-3.5 h-3.5 text-[var(--tm-sky)]" />}
        </button>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-white/40" />}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={near?.name ? `From ${near.name} · search another city` : "Or search a city"}
            aria-label="Search a city to search near" className="tm-input w-full h-10 pl-8 pr-8 rounded-xl text-[16px] lg:text-[13px]" />
        </div>
        {places.length > 0 ? (
          <div className="mt-1 space-y-0.5">
            {places.map((p) => {
              const name = p.display_name.split(",")[0];
              return (
                <button key={p.place_id} type="button" onClick={() => pick(parseFloat(p.lat), parseFloat(p.lon), name)} className="tm-mrow">
                  <Building2 className="w-4 h-4 text-white/40 shrink-0" />
                  <span className="text-[12.5px] text-white/75 line-clamp-1 text-left">{p.display_name}</span>
                </button>
              );
            })}
          </div>
        ) : quick.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quick.map(([name, lat, lng]) => (
              <button key={name} type="button" onClick={() => pick(lat, lng, name)} aria-pressed={near?.name === name}
                className="tm-near-city" data-on={near?.name === name || undefined}>{name}</button>
            ))}
          </div>
        )}
      </div>

      {/* How far: a slider with − and + for single steps, the count updating as it moves */}
      <div>
        <div className="flex items-baseline justify-between">
          <p className="tm-label !mb-0">How far will you go?</p>
          <p className="text-[13px] font-bold text-white tabular-nums">{radius ? `${radius.toLocaleString("en-IN")} km` : "Any distance"}</p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={() => setIdx(idx - 1)} disabled={!near || idx <= 0} aria-label="Closer" className="tm-near-step"><Minus className="w-3.5 h-3.5" /></button>
          <input type="range" min={0} max={RADII.length} step={1} value={idx} disabled={!near}
            onChange={(e) => setIdx(Number(e.target.value))} aria-label="Search radius"
            aria-valuetext={radius ? `${radius} kilometres` : "Any distance"} className="tm-near-range flex-1" />
          <button type="button" onClick={() => setIdx(idx + 1)} disabled={!near || idx >= RADII.length} aria-label="Further" className="tm-near-step"><Plus className="w-3.5 h-3.5" /></button>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-white/40 tabular-nums px-9"><span>50 km</span><span>2,000 km · Any</span></div>
      </div>

      <p className="text-[11px] text-white/50 leading-snug">
        {loading ? "Finding you…" : near
          ? <><b className="text-white/85">{n} {n === 1 ? "adventure" : "adventures"}</b> {radius ? `within ${radius.toLocaleString("en-IN")} km` : "at any distance"} of {near.name ?? "you"}, nearest first.</>
          : "Allow location, or pick a city, to see what's around it."}
      </p>
      {near && (
        <button type="button" onClick={onOff} className="text-[11.5px] font-semibold text-white/55 hover:text-white">Turn off Near me</button>
      )}
    </div>
  );
}
