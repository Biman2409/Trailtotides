"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Shapes, MapPin, LocateFixed, Loader2, Check, Search, X, Navigation } from "lucide-react";
import { adventures, type Adventure } from "@/lib/data";
import { toggleSelection } from "@/lib/filterOptions";
import { STATE_COUNTS, CategoryList, categoryLabel, type AdventureFilterState } from "@/components/ui/custom/AdventureFilters";

// The three filters the map keeps on screen — what kind, where, near me — as one dock.
// Everything else lives under Filters. Type and Where write the same state as the panel.

type Menu = "type" | "where" | "near" | null;
type Place = { place_id: number; display_name: string; lat: string; lon: string };

export const RADII = [100, 250, 500] as const;
const MAX_STATE = STATE_COUNTS[0]?.[1] ?? 1;

export default function FilterDock({
  f,
  set,
  nearMe,
  nearLoading,
  radius,
  onNearMe,
  onRadius,
  onPlace,
  onAdventure,
  trailing,
  floating = false,
}: {
  f: AdventureFilterState;
  set: (patch: Partial<AdventureFilterState>) => void;
  nearMe: boolean;
  nearLoading: boolean;
  /** km, or null for no limit */
  radius: number | null;
  onNearMe: () => void;
  onRadius: (km: number | null) => void;
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
  const nearLabel = nearMe ? (radius ? `${radius} km` : "Near me") : "Near me";

  return (
    <div ref={wrapRef} className={`relative ${floating ? "tm-dock-float" : ""}`}>
      <div className={`grid ${trailing ? "grid-cols-[1fr_1fr_1fr_auto]" : "grid-cols-3"} items-center gap-1.5`}>
        <DockPill icon={<Shapes className="w-3.5 h-3.5" />} label={typeLabel} on={f.types.length > 0} open={open === "type"} onClick={() => toggle("type")} />
        <DockPill icon={<MapPin className="w-3.5 h-3.5" />} label={whereLabel} on={f.states.length > 0} open={open === "where"} onClick={() => toggle("where")} />
        <DockPill
          icon={nearLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
          label={nearLabel}
          on={nearMe}
          open={open === "near"}
          onClick={() => { if (!nearMe) onNearMe(); toggle("near"); }}
          tone="sky"
        />
        {trailing && <div className="flex items-center gap-1.5">{trailing}</div>}
      </div>

      {open && (
        <div className="tm-menu absolute left-0 right-0 top-full mt-2 z-[1100]" role="dialog" aria-label={open === "type" ? "Adventure type" : open === "where" ? "Region" : "Near me"}>
          {open === "type" && <TypeMenu f={f} set={set} />}
          {open === "where" && <WhereMenu f={f} set={set} onPlace={(...a) => { onPlace(...a); setOpen(null); }} onAdventure={(a) => { onAdventure(a); setOpen(null); }} />}
          {open === "near" && <NearMenu nearMe={nearMe} loading={nearLoading} radius={radius} onRadius={onRadius} onToggle={() => { onNearMe(); if (nearMe) setOpen(null); }} />}
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
        {f.types.length > 0 && <button type="button" onClick={() => set({ types: [] })} className="text-[11px] font-semibold text-[#ff9a66] hover:underline">All types</button>}
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
          className="tm-input w-full h-10 pl-9 pr-8 rounded-xl text-[13px]" />
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
          <Group title="Regions" action={f.states.length > 0 ? <button type="button" onClick={() => set({ states: [] })} className="text-[11px] font-semibold text-[#ff9a66] hover:underline">Anywhere</button> : null}>
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
                      <span className="block h-full rounded-full" style={{ width: `${(n / MAX_STATE) * 100}%`, background: on ? "#ff7d47" : "rgba(255,255,255,0.22)" }} />
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

/* ── Near me: a radius, drawn on the map as a ring ── */

function NearMenu({ nearMe, loading, radius, onRadius, onToggle }: {
  nearMe: boolean; loading: boolean; radius: number | null; onRadius: (km: number | null) => void; onToggle: () => void;
}) {
  return (
    <div className="p-3">
      <p className="tm-label">How far will you go?</p>
      <div className="grid grid-cols-4 gap-1.5">
        {[...RADII, null].map((r) => (
          <button key={r ?? "any"} type="button" disabled={!nearMe} aria-pressed={radius === r} onClick={() => onRadius(r)}
            className="tm-radius" data-on={(nearMe && radius === r) || undefined}>
            {r ? <><b>{r}</b><span>km</span></> : <><b>Any</b><span>sorted</span></>}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] text-white/45 leading-snug">
        {loading ? "Finding you…" : nearMe
          ? radius ? `Showing adventures within ${radius} km, nearest first.` : "Showing every adventure, nearest first."
          : "Allow location to see what's around you."}
      </p>
      {nearMe && (
        <button type="button" onClick={onToggle} className="mt-2 text-[11.5px] font-semibold text-white/55 hover:text-white">Turn off Near me</button>
      )}
    </div>
  );
}
