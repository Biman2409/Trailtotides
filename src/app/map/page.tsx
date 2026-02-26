"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Map as MapIcon, Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2, Wind, Sun, Mountain, Waves, Snowflake, Trees, Palmtree, Sunrise, Building2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { adventures, adventureTypes } from "@/lib/data";
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
  "Paragliding": "🪂",
  "Hot Air Balloon": "🎈"
};

const difficultyColor: Record<string, string> = {
  Beginner:     "#22c55e",  // green
  Intermediate: "#3b82f6",  // blue
  Advanced:     "#ff8e64",  // soothing orange light
  Expert:       "#ff6b35",  // soothing orange
  Extreme:      "#ef4444",  // red
};

const seasons: { label: string; icon: string; months: Month[]; activeColor: string; idleColor: string }[] = [
  { label: "Winter",  months: ["Dec", "Jan", "Feb"],         activeColor: "bg-sky-600 text-white",    idleColor: "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200" },
  { label: "Spring",  months: ["Mar", "Apr", "May"],         activeColor: "bg-pink-500 text-white",   idleColor: "bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200" },
  { label: "Summer",  months: ["Apr", "May", "Jun"],         activeColor: "bg-amber-500 text-white",  idleColor: "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200" },
  { label: "Monsoon", months: ["Jun", "Jul", "Aug", "Sep"],  activeColor: "bg-teal-600 text-white",   idleColor: "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200" },
  { label: "Autumn",  months: ["Oct", "Nov", "Dec"],         activeColor: "bg-[#ff6b35] text-white", idleColor: "bg-[#ff6b35]/5 text-[#9c4a2f] hover:bg-[#ff6b35]/10 border border-[#ff6b35]/20" },
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
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff6b35]" />
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
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f5f0e8] text-[#1a1f2e] text-sm placeholder-[#9a9590] border border-transparent focus:outline-none focus:border-[#ff6b35] transition-colors"
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
                <MapPin className="w-3.5 h-3.5 text-[#ff6b35] mt-0.5 shrink-0" />
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
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  const [expandedRegion, setExpandedRegion] = useState<Region | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  function toggle<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function toggleSeason(seasonMonths: Month[]) {
    const allSelected = seasonMonths.every((m) => selectedMonths.includes(m));
    if (allSelected) {
      setSelectedMonths(selectedMonths.filter((m) => !seasonMonths.includes(m)));
    } else {
      const merged = Array.from(new Set([...selectedMonths, ...seasonMonths])) as Month[];
      setSelectedMonths(merged);
    }
  }

  function clearAll() {
    setSearch("");
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedDifficulties([]);
    setSelectedDurations([]);
    setSelectedMonths([]);
    setSelectedGroupSizes([]);
    setSelectedSubRegions([]);
    setExpandedRegion(null);
  }

  const activeFilterCount =
    selectedTypes.length +
    selectedRegions.length +
    selectedSubRegions.length +
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
    if (selectedSubRegions.length && !selectedSubRegions.some(sr => a.state.includes(sr))) return false;
    if (selectedDifficulties.length && !selectedDifficulties.includes(a.difficulty)) return false;
    if (selectedDurations.length && !selectedDurations.includes(a.duration)) return false;
    if (selectedMonths.length && !selectedMonths.some((m) => a.bestMonths.includes(m))) return false;
    if (selectedGroupSizes.length && !selectedGroupSizes.includes(a.groupSize)) return false;
    return true;
  });

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <Navbar />
      {/* Spacer to push content below fixed navbar */}
      <div className="h-16 lg:h-20 shrink-0" />

      {/* Filter bar */}
      <div className="z-[1001] bg-white/95 backdrop-blur-md border-b border-[#e0d8cc] shadow-sm shrink-0">
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
              <span className="bg-[#ff6b35] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
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
              className="flex items-center gap-1.5 text-sm text-[#ff6b35] hover:text-[#ff8e64] font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div className="border-t border-[#e0d8cc] bg-white px-4 lg:px-8 py-6 max-h-[60vh] overflow-y-auto">
              <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Adventure Type */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Adventure Type</h3>
                  {(() => {
                    const categories = [
                      {
                        label: "Land Based", 
                        btn: "bg-[#ff6b35]/5 border-[#ff6b35]/20 text-[#9c4a2f] hover:bg-[#ff6b35]/10",
                        btnActive: "bg-[#ff6b35] text-white border-[#ff6b35]",
                        chip: "bg-[#ff6b35]/10 text-orange-900 hover:bg-[#ff6b35]/20",
                        chipActive: "bg-[#ff6b35] text-white",
                        types: ["Trekking", "Mountaineering", "Rock Climbing", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"],
                      },
                      {
                        label: "Water Based", 
                        btn: "bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100",
                        btnActive: "bg-sky-500 text-white border-sky-500",
                        chip: "bg-sky-100 text-sky-900 hover:bg-sky-200",
                        chipActive: "bg-sky-500 text-white",
                        types: ["Diving", "Kayaking"],
                      },
                      {
                        label: "Snow Based", 
                        btn: "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100",
                        btnActive: "bg-slate-600 text-white border-slate-600",
                        chip: "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        chipActive: "bg-slate-600 text-white",
                        types: ["Skiing"],
                      },
                        {
                          label: "Air Based", 
                          btn: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100",
                          btnActive: "bg-purple-500 text-white border-purple-500",
                          chip: "bg-purple-100 text-purple-900 hover:bg-purple-200",
                          chipActive: "bg-purple-500 text-white",
                          types: [] as string[],
                        },
                    ];
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => {
                              const isExpanded = expandedCategory === cat.label;
                              const hasSelected = cat.types.some(t => selectedTypes.includes(t as AdventureType));
                              return (
                                <button
                                  key={cat.label}
                                  onClick={() => setExpandedCategory(isExpanded ? null : cat.label)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isExpanded || hasSelected ? cat.btnActive : cat.btn}`}
                                >
                                  {cat.label}

                                {hasSelected && (
                                  <span className="bg-white/30 text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                    {cat.types.filter(t => selectedTypes.includes(t as AdventureType)).length}
                                  </span>
                                )}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedCategory && (() => {
                          const cat = categories.find(c => c.label === expandedCategory)!;
                          return (
                            <div className="rounded-xl border border-[#e8dfc8] bg-[#fafaf8] p-3">
                              {cat.types.length === 0 ? (
                                <p className="text-xs text-[#ff6b35] italic">Coming soon</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {cat.types.map((type) => {
                                    const icon = adventureTypes.find(a => a.type === type)?.icon ?? "";
                                    const isSelected = selectedTypes.includes(type as AdventureType);
                                    return (
                                        <button
                                          key={type}
                                          onClick={() => toggle(selectedTypes, type as AdventureType, setSelectedTypes)}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected ? cat.chipActive : cat.chip}`}
                                        >
                                          {type}
                                        </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>

                {/* Region */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Region</h3>
                  {(() => {
                    const regionGroups: { name: Region; icon: React.ReactNode; btn: string; btnActive: string; chip: string; chipActive: string; subRegions: string[] }[] = [
                      { name: "Himalayas",     btn: "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100", btnActive: "bg-emerald-700 text-white border-emerald-700", chip: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200", chipActive: "bg-emerald-700 text-white", subRegions: ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "Arunachal Pradesh", "Nepal", "Bhutan"] },
                      { name: "Western Ghats", btn: "bg-lime-50 border-lime-200 text-lime-800 hover:bg-lime-100",             btnActive: "bg-lime-600 text-white border-lime-600",     chip: "bg-lime-100 text-lime-900 hover:bg-lime-200",         chipActive: "bg-lime-600 text-white",     subRegions: ["Kerala", "Karnataka", "Goa", "Maharashtra", "Gujarat"] },
                      { name: "Eastern Ghats", btn: "bg-[#ff6b35]/5 border-[#ff6b35]/20 text-[#9c4a2f] hover:bg-[#ff6b35]/10",     btnActive: "bg-[#ff6b35] text-white border-[#ff6b35]", chip: "bg-[#ff6b35]/10 text-orange-900 hover:bg-[#ff6b35]/20",   chipActive: "bg-[#ff6b35] text-white",   subRegions: ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu"] },
                      { name: "Desert",        btn: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100",     btnActive: "bg-yellow-500 text-white border-yellow-500", chip: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",   chipActive: "bg-yellow-500 text-white",   subRegions: ["Rajasthan", "Gujarat"] },
                      { name: "Coast",         btn: "bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100",             btnActive: "bg-cyan-600 text-white border-cyan-600",     chip: "bg-cyan-100 text-cyan-900 hover:bg-cyan-200",         chipActive: "bg-cyan-600 text-white",     subRegions: ["Maharashtra (Konkan)", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"] },
                      { name: "Islands",       btn: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100",             btnActive: "bg-teal-600 text-white border-teal-600",     chip: "bg-teal-100 text-teal-900 hover:bg-teal-200",         chipActive: "bg-teal-600 text-white",     subRegions: ["Andaman & Nicobar", "Lakshadweep"] },
                        { name: "Northeast",     btn: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100",     btnActive: "bg-violet-600 text-white border-violet-600", chip: "bg-violet-100 text-violet-900 hover:bg-violet-200",   chipActive: "bg-violet-600 text-white",   subRegions: ["Nagaland", "Manipur", "Meghalaya", "Assam", "Arunachal Pradesh", "Sikkim"] },
                        { name: "Urban",         btn: "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100",               btnActive: "bg-zinc-700 text-white border-zinc-700",     chip: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",         chipActive: "bg-zinc-700 text-white",     subRegions: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"] },
                      ];
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                            {regionGroups.map((rg) => {
                              const isExpanded = expandedRegion === rg.name;
                              const hasSelected = selectedRegions.includes(rg.name) || rg.subRegions.some(sr => selectedSubRegions.includes(sr));
                              const subCount = rg.subRegions.filter(sr => selectedSubRegions.includes(sr)).length;
                              return (
                                <button key={rg.name} onClick={() => setExpandedRegion(isExpanded ? null : rg.name)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isExpanded || hasSelected ? rg.btnActive : rg.btn}`}>
                                  {rg.name}

                                {subCount > 0 && <span className="bg-white/30 text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none">{subCount}</span>}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedRegion && (() => {
                          const rg = regionGroups.find(r => r.name === expandedRegion)!;
                          return (
                            <div className="rounded-xl border border-[#e8dfc8] bg-[#fafaf8] p-3">
                              <div className="flex flex-wrap gap-2">
                                {rg.subRegions.map((sr) => (
                                  <button key={sr} onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSubRegions.includes(sr) ? rg.chipActive : rg.chip}`}>
                                    {sr}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>

                {/* Best Season */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Best Season</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        {seasons.map(({ label, months: sMonths, activeColor, idleColor }) => {
                          const isExpanded = expandedSeason === label;
                          const hasSelected = sMonths.some((m) => selectedMonths.includes(m));
                          const selectedCount = sMonths.filter((m) => selectedMonths.includes(m)).length;
                          return (
                            <button key={label} onClick={() => setExpandedSeason(isExpanded ? null : label)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isExpanded || hasSelected ? activeColor : idleColor}`}>
                              {label}

                            {hasSelected && <span className="bg-white/30 text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none">{selectedCount}</span>}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                    {expandedSeason && (() => {
                      const season = seasons.find((s) => s.label === expandedSeason)!;
                      return (
                        <div className="rounded-xl border border-[#e8dfc8] bg-[#fafaf8] p-3">
                          <div className="flex flex-wrap gap-2">
                            {season.months.map((m) => (
                              <button key={m} onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMonths.includes(m) ? season.activeColor : season.idleColor}`}>
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Difficulty</h3>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { val: "Beginner",     idle: "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 border",     active: "bg-green-600 text-white border border-green-600" },
                      { val: "Intermediate", idle: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 border",         active: "bg-blue-600 text-white border border-blue-600" },
                        { val: "Advanced",     idle: "bg-[#ff8e64]/5 border-[#ff8e64]/20 text-[#9c4a2f] hover:bg-[#ff8e64]/10 border",     active: "bg-[#ff8e64] text-white border border-[#ff8e64]" },

                      { val: "Expert",       idle: "bg-[#ff6b35]/5 border-[#ff6b35]/20 text-[#9c4a2f] hover:bg-[#ff6b35]/10 border", active: "bg-[#ff6b35] text-white border border-[#ff6b35]" },
                      { val: "Extreme",      idle: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100 border",             active: "bg-red-600 text-white border border-red-600" },
                      ] as { val: Difficulty; icon: string; idle: string; active: string }[]).map(({ val, icon, idle, active }) => (
                        <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDifficulties.includes(val) ? active : idle}`}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="col-span-2 lg:col-span-3">
                    <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Duration</h3>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { val: "Weekend",  label: "Weekend",  idle: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 border", active: "bg-yellow-500 text-white border border-yellow-500" },
                        { val: "3–5 days", label: "3–5 days", idle: "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100 border", active: "bg-indigo-600 text-white border border-indigo-600" },
                        { val: "7+ days",  label: "7+ days",  idle: "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 border",         active: "bg-rose-600 text-white border border-rose-600" },
                      ] as { val: Duration; label: string; icon: string; idle: string; active: string }[]).map(({ val, label, icon, idle, active }) => (
                        <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDurations.includes(val) ? active : idle}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group Size */}
                  <div className="col-span-2 lg:col-span-3">
                    <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Group Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { val: "Solo",              idle: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100 border",     active: "bg-violet-600 text-white border border-violet-600" },
                        { val: "Small group (2–6)",  idle: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 border",             active: "bg-teal-600 text-white border border-teal-600" },
                        { val: "Large group (6+)",   idle: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 hover:bg-fuchsia-100 border", active: "bg-fuchsia-600 text-white border border-fuchsia-600" },
                      ] as { val: GroupSize; icon: string; idle: string; active: string }[]).map(({ val, icon, idle, active }) => (
                        <button key={val} onClick={() => toggle(selectedGroupSizes, val, setSelectedGroupSizes)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedGroupSizes.includes(val) ? active : idle}`}>
                          {val}
                        </button>
                      ))}

                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      {/* Map — fills remaining height */}
      <div className="flex-1 relative overflow-hidden">
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
