"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, X, Loader2, MapPin } from "lucide-react";
import { adventures, type Adventure } from "@/lib/data";
import { genreOf } from "./mapShared";

// One box for both: adventures by name/state/type (filters the map as you type) and
// places from OpenStreetMap (flies there and drops a pin).

type Place = { place_id: number; display_name: string; lat: string; lon: string };

export default function SearchBox({
  value,
  onChange,
  onPlace,
  onAdventure,
}: {
  value: string;
  onChange: (q: string) => void;
  onPlace: (lat: number, lng: number, name: string) => void;
  onAdventure: (a: Adventure) => void;
}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = value.trim().toLowerCase();
  const advMatches = q.length >= 2
    ? adventures.filter((a) => a.name.toLowerCase().includes(q) || a.state.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)).slice(0, 5)
    : [];

  const fetchPlaces = useCallback((text: string) => {
    if (text.trim().length < 2) { setPlaces([]); return; }
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=4&countrycodes=in&addressdetails=0`, { headers: { "Accept-Language": "en" } })
      .then((r) => r.json())
      .then((d: Place[]) => setPlaces(d))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchPlaces(value), 400);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [value, fetchPlaces]);

  const hasResults = advMatches.length > 0 || places.length > 0;
  useEffect(() => { setOpen(q.length >= 2 && hasResults); }, [q, hasResults]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 pointer-events-none" />
      {loading
        ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-white/35" />
        : value && (
          <button type="button" aria-label="Clear search" onClick={() => { onChange(""); setPlaces([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-white/40 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => hasResults && q.length >= 2 && setOpen(true)}
        placeholder="Search adventures or places…"
        aria-label="Search adventures or places"
        className="tm-input w-full pl-9 pr-8 h-10 rounded-xl text-[13px]"
      />

      {open && (
        <div className="absolute z-[1060] top-full mt-2 w-full min-w-[300px] rounded-2xl overflow-hidden text-sm tm-glass">
          {advMatches.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Adventures</p>
              {advMatches.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onMouseDown={() => { onAdventure(a); setOpen(false); }}
                  className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={a.heroImage} alt="" fill className="object-cover" sizes="32px" unoptimized />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-[13px] truncate text-white/90">{a.name}</span>
                    <span className="block text-[10px] mt-0.5 truncate text-white/40">{a.type} · {a.state}</span>
                  </span>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: genreOf(a.type).color }} />
                </button>
              ))}
            </>
          )}
          {places.length > 0 && (
            <>
              <p className={`px-4 pb-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-white/30 ${advMatches.length ? "pt-2.5 border-t border-white/5" : "pt-3"}`}>Places</p>
              {places.map((p) => (
                <button
                  key={p.place_id}
                  type="button"
                  onMouseDown={() => { const name = p.display_name.split(",")[0]; onPlace(parseFloat(p.lat), parseFloat(p.lon), name); onChange(""); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                  <span className="line-clamp-1 text-[13px] text-white/70">{p.display_name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
