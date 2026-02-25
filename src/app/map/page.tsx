"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Layers, Map as MapIcon, Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { adventures, adventureTypes, regions } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, GroupSize, Adventure } from "@/lib/data";

const typeEmoji: Record<AdventureType, string> = {
  "Trekking": "🥾",
  "Biking": "🏍️",
  "Cycling": "🚴",
  "Diving": "🤿",
  "Kayaking": "🛶",
  "Skiing": "⛷️",
  "Mountaineering": "🧗",
    "Rock Climbing": "🧱",
  "Jeep Safari": "🚙",
  "Camel Safari": "🐪",
  "Caving": "🪨",
  "Sandboarding": "🏄",
  "Urban Adventure": "🏙️",
};

const difficultyColor: Record<string, string> = {
  Beginner:     "#22c55e",  // green
  Intermediate: "#3b82f6",  // blue
  Advanced:     "#f59e0b",  // amber
  Expert:       "#f97316",  // orange  -- kept distinct from amber by hue
  Extreme:      "#ef4444",  // red
};

const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced", "Expert", "Extreme"];
const durations: Duration[] = ["Weekend", "3–5 days", "7+ days"];
const groupSizes: GroupSize[] = ["Solo", "Small group (2–6)", "Large group (6+)"];
const difficultyDot: Record<Difficulty, string> = {
  Beginner:     "bg-green-500",
  Intermediate: "bg-blue-500",
  Advanced:     "bg-amber-400",
  Expert:       "bg-orange-500",
  Extreme:      "bg-red-500",
};
const months: { label: string; value: Month }[] = [
  { label: "Jan", value: "Jan" }, { label: "Feb", value: "Feb" }, { label: "Mar", value: "Mar" },
  { label: "Apr", value: "Apr" }, { label: "May", value: "May" }, { label: "Jun", value: "Jun" },
  { label: "Jul", value: "Jul" }, { label: "Aug", value: "Aug" }, { label: "Sep", value: "Sep" },
  { label: "Oct", value: "Oct" }, { label: "Nov", value: "Nov" }, { label: "Dec", value: "Dec" },
];

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
};

declare global { interface Window { L: any } }

function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.L) { resolve(window.L); return; }
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(window.L);
      document.head.appendChild(script);
    } else {
      const poll = setInterval(() => {
        if (window.L) { clearInterval(poll); resolve(window.L); }
      }, 50);
    }
  });
}

function PlaceSearch({ onSelect }: { onSelect: (lat: number, lng: number, name: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback((q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=in&addressdetails=0`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((data: NominatimResult[]) => {
        setResults(data);
        setOpen(data.length > 0);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleSelect(r: NominatimResult) {
    onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(",")[0]);
    setQuery(r.display_name.split(",")[0]);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4622d]" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9a9590] animate-spin" />}
        {!loading && query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-[#9a9590] hover:text-[#1a1f2e]" />
          </button>
        )}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Go to a place…"
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f5f0e8] text-[#1a1f2e] text-sm placeholder-[#9a9590] border border-transparent focus:outline-none focus:border-[#c4622d] transition-colors"
        />
      </div>
      {open && (
        <ul className="absolute z-[2000] top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-[#e0d8cc] overflow-hidden text-sm">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                onMouseDown={() => handleSelect(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-[#f5f0e8] flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-[#c4622d] mt-0.5 shrink-0" />
                <span className="text-[#1a1f2e] leading-snug line-clamp-2">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapView({ adventures: advs, flyToRef }: { adventures: Adventure[]; flyToRef: React.MutableRefObject<((lat: number, lng: number) => void) | null> }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Expose flyTo via ref
  useEffect(() => {
    flyToRef.current = (lat: number, lng: number) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 10, { duration: 1.4 });
      }
    };
  });

  function addMarkers(L: any, list: Adventure[]) {
    list.forEach((adv) => {
      const color = difficultyColor[adv.difficulty] ?? "#6366f1";
      const emoji = typeEmoji[adv.type] || "📍";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:40px;height:40px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:14px;line-height:1;">${emoji}</span>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -44],
      });

      const popupHtml = `
        <div style="width:260px;font-family:'DM Sans',sans-serif;padding:4px;">
          <div style="position:relative;height:150px;border-radius:12px;overflow:hidden;margin-bottom:12px;">
            <img src="${adv.heroImage}" alt="${adv.name}" style="width:100%;height:100%;object-fit:cover;" />
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.1) 55%,transparent 100%);" />
            <div style="position:absolute;bottom:10px;left:10px;right:10px;">
              <div style="font-size:15px;font-weight:700;color:#fff;line-height:1.2;margin-bottom:6px;text-shadow:0 1px 4px rgba(0,0,0,0.6);">${adv.name}</div>
              <div style="display:flex;gap:6px;">
                <span style="background:rgba(26,31,46,0.85);color:rgba(255,255,255,0.8);font-size:10px;padding:3px 8px;border-radius:20px;">${adv.type}</span>
                <span style="background:${color}33;color:${color};font-size:10px;padding:3px 8px;border-radius:20px;border:1px solid ${color}55;">${adv.difficulty}</span>
              </div>
            </div>
          </div>
          <p style="margin:0 0 10px;font-size:12px;color:#9a9590;">${adv.state} · ${adv.durationDays} · ${adv.bestSeason}</p>
          <p style="margin:0 0 12px;font-size:12px;color:#6b6560;line-height:1.5;">${adv.tagline}</p>
          <a href="/experiences/${adv.slug}" style="display:block;text-align:center;background:#1e3d2f;color:white;padding:9px;border-radius:10px;font-size:12px;font-weight:600;text-decoration:none;">
            View Experience →
          </a>
        </div>
      `;

      const marker = L.marker([adv.lat, adv.lng], { icon })
        .bindPopup(popupHtml, { maxWidth: 280, minWidth: 280 });

      marker.on("popupopen", () => {
        const popupEl = marker.getPopup()?.getElement();
        if (popupEl) {
          popupEl.style.cursor = "pointer";
          popupEl.addEventListener("click", () => {
            window.location.href = `/experiences/${adv.slug}`;
          });
        }
      });

      markersLayerRef.current.addLayer(marker);
    });
  }

  useEffect(() => {
    if (!mapRef.current) return;
    loadLeaflet().then((L) => {
      if (!mapRef.current) return;
      const container = mapRef.current;
      if ((container as any)._leaflet_id) (container as any)._leaflet_id = undefined;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(container, { center: [22.5, 80.0], zoom: 5, zoomControl: true, attributionControl: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        subdomains: "abc", maxZoom: 19, attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      addMarkers(L, advs);
    });
    return () => {
      if (mapInstanceRef.current) {
        markersLayerRef.current = null;
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) (mapRef.current as any)._leaflet_id = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    loadLeaflet().then((L) => {
      markersLayerRef.current.clearLayers();
      addMarkers(L, advs);
    });
  }, [advs]);

  return <div ref={mapRef} className="w-full h-full" />;
}

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);

  const [search, setSearch] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<AdventureType[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<Duration[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Month[]>([]);
  const [selectedGroupSizes, setSelectedGroupSizes] = useState<GroupSize[]>([]);

  useEffect(() => { setMounted(true); }, []);

  function toggle<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function clearAll() {
    setSearch("");
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedDifficulties([]);
    setSelectedDurations([]);
    setSelectedMonths([]);
    setSelectedGroupSizes([]);
  }

  const activeFilterCount =
    selectedTypes.length +
    selectedRegions.length +
    selectedDifficulties.length +
    selectedDurations.length +
    selectedMonths.length +
    selectedGroupSizes.length;

  const visibleAdventures = adventures.filter((a) => {
    if (
      search &&
      !a.name.toLowerCase().includes(search.toLowerCase()) &&
      !a.state.toLowerCase().includes(search.toLowerCase()) &&
      !a.tagline.toLowerCase().includes(search.toLowerCase())
    ) return false;
    if (selectedTypes.length && !selectedTypes.includes(a.type)) return false;
    if (selectedRegions.length && !selectedRegions.includes(a.region)) return false;
    if (selectedDifficulties.length && !selectedDifficulties.includes(a.difficulty)) return false;
    if (selectedDurations.length && !selectedDurations.includes(a.duration)) return false;
    if (selectedMonths.length && !selectedMonths.some((m) => a.bestMonths.includes(m))) return false;
    if (selectedGroupSizes.length && !selectedGroupSizes.includes(a.groupSize)) return false;
    return true;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      {/* Filter bar */}
      <div className="sticky z-[1001] bg-white/95 backdrop-blur-md border-b border-[#e0d8cc] shadow-sm mt-[64px] lg:mt-[80px]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-3">
            {/* Adventure search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search adventures..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f5f0e8] text-[#1a1f2e] text-sm placeholder-[#9a9590] border border-transparent focus:outline-none focus:border-[#1e3d2f] transition-colors"
              />
            </div>

            {/* Place search */}
            <PlaceSearch onSelect={(lat, lng) => flyToRef.current?.(lat, lng)} />

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtersOpen || activeFilterCount > 0
                ? "bg-[#1e3d2f] text-white"
                : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#e8dfc8]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#c4622d] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>

          <span className="hidden md:block text-sm text-[#9a9590] ml-auto">
            {visibleAdventures.length} of {adventures.length} visible
          </span>

          {(activeFilterCount > 0 || search) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-[#c4622d] hover:text-[#e07845] font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="border-t border-[#e0d8cc] bg-white px-4 lg:px-8 py-5">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Adventure type — categorised */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Adventure Type</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                      {/* Land Based */}
                      <div className="rounded-xl border p-3 bg-amber-50 border-amber-200">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-600 mb-2">Land Based</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(["Trekking", "Mountaineering", "Rock Climbing", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"] as AdventureType[]).map((type) => {
                            const icon = adventureTypes.find(a => a.type === type)?.icon ?? "";
                            return (
                              <button
                                key={type}
                                onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                  selectedTypes.includes(type)
                                    ? "bg-amber-500 text-white"
                                    : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                }`}
                              >
                                <span>{icon}</span>
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Water / Snow / Air */}
                      {[
                        { label: "Water Based", box: "bg-sky-50 border-sky-200", labelColor: "text-sky-600", activeColor: "bg-sky-500 text-white", idleColor: "bg-sky-100 text-sky-900 hover:bg-sky-200", types: ["Diving", "Kayaking"] },
                        { label: "Snow Based",  box: "bg-slate-50 border-slate-200", labelColor: "text-slate-500", activeColor: "bg-white text-slate-800 ring-1 ring-slate-400 shadow", idleColor: "bg-slate-100 text-slate-700 hover:bg-slate-200", types: ["Skiing"] },
                        { label: "Air Based",   box: "bg-purple-50 border-purple-200", labelColor: "text-purple-600", activeColor: "bg-purple-500 text-white", idleColor: "bg-purple-100 text-purple-900 hover:bg-purple-200", types: [] },
                      ].map(({ label, box, labelColor, activeColor, idleColor, types: catTypes }) => (
                        <div key={label} className={`rounded-xl border p-3 ${box}`}>
                          <p className={`text-[10px] font-semibold tracking-widest uppercase mb-2 ${labelColor}`}>{label}</p>
                          {catTypes.length === 0 ? (
                            <p className="text-xs text-[#c4b99a] italic">Coming soon</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {adventureTypes
                                .filter(({ type }) => catTypes.includes(type))
                                .map(({ type, icon }) => (
                                  <button
                                    key={type}
                                    onClick={() => toggle(selectedTypes, type as AdventureType, setSelectedTypes)}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                      selectedTypes.includes(type as AdventureType) ? activeColor : idleColor
                                    }`}
                                  >
                                    <span>{icon}</span>{type}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

              {/* Region */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Region</h3>
                <div className="flex flex-wrap gap-2">
                  {regions.map(({ name }) => (
                    <button
                      key={name}
                      onClick={() => toggle(selectedRegions, name, setSelectedRegions)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedRegions.includes(name)
                          ? "bg-[#1e3d2f] text-white"
                          : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#e8dfc8]"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedDifficulties.includes(d)
                          ? "bg-[#1e3d2f] text-white"
                          : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#e8dfc8]"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${difficultyDot[d]}`} />{d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Duration</h3>
                <div className="flex flex-wrap gap-2">
                  {durations.map((dur) => (
                    <button
                      key={dur}
                      onClick={() => toggle(selectedDurations, dur, setSelectedDurations)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedDurations.includes(dur)
                          ? "bg-[#1e3d2f] text-white"
                          : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#e8dfc8]"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Best Season */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Best Season</h3>
                <div className="flex flex-wrap gap-1.5">
                  {months.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => toggle(selectedMonths, value, setSelectedMonths)}
                      className={`w-10 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedMonths.includes(value)
                          ? "bg-sky-700 text-white"
                          : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-sky-100 hover:text-sky-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Size */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Group Size</h3>
                <div className="flex flex-wrap gap-2">
                  {groupSizes.map((gs) => (
                    <button
                      key={gs}
                      onClick={() => toggle(selectedGroupSizes, gs, setSelectedGroupSizes)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedGroupSizes.includes(gs)
                          ? "bg-[#1e3d2f] text-white"
                          : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#e8dfc8]"
                      }`}
                    >
                      {gs}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {mounted ? (
            <MapView adventures={visibleAdventures} flyToRef={flyToRef} />
        ) : (
          <div className="w-full h-full bg-[#1a1f2e] flex items-center justify-center">
            <div className="text-white/40 text-sm">Loading map…</div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-[#1a1f2e]/90 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3 shadow-xl">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <MapIcon className="w-3.5 h-3.5" />
            <span>Trail to Tides · India Adventure Map</span>
          </div>
        </div>
      </div>
    </div>
  );
}
