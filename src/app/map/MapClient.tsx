"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Map as MapIcon, Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2,
  Zap, Activity, ShieldAlert, Trophy, Flame, Calendar, CalendarRange, History, User, Users, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { adventures } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, GroupSize, Adventure } from "@/lib/data";
import { getACE } from "@/lib/ace";
import type { AceAxis } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { StoredProfile } from "@/lib/matchmaker";

type AceCategory = "ready" | "stretch" | "out-of-range";

function classifyAdventure(userAce: StoredProfile["ace"], adventureAce: ReturnType<typeof getACE>): AceCategory {
  const axes = Object.keys(adventureAce) as AceAxis[];
  let maxShortfall = 0;
  for (const axis of axes) {
    const req = adventureAce[axis];
    if (req === 0) continue;
    const has = userAce[axis];
    const shortfall = req - has;
    if (shortfall > maxShortfall) maxShortfall = shortfall;
  }
  if (maxShortfall <= 0) return "ready";
  if (maxShortfall <= 1) return "stretch";
  return "out-of-range";
}
import type L from "leaflet";

const typeEmoji: Record<AdventureType, string> = {
  "Trekking": "🥾",
  "Biking": "🏍️",
  "Cycling": "🚴",
  "Diving": "🤿",
  "Kayaking": "🛶",
  "Skiing": "⛷️",
  "Mountaineering": "🧗",
  "Rock Climbing": "🧱",
  "Scrambling":    "🥾",
  "Jeep Safari": "🚙",
  "Camel Safari": "🐪",
  "Caving": "🪨",
  "Sandboarding": "🏄",
  "Urban Adventure": "🏙️",
  "Paragliding": "🪂",
  "Hot Air Balloon": "🎈"
};

const difficultyColor: Record<string, string> = {
  Easy:         "#10b981",  // emerald
  Moderate:     "#0ea5e9",  // sky blue
  Hard:         "#6366f1",  // indigo
  Advanced:     "#ff5100",  // brand orange
  Extreme:      "#ef4444",  // red
};

const seasons: { label: string; months: Month[] }[] = [
  { label: "Spring",     months: ["Mar", "Apr"] },
  { label: "Summer",     months: ["May", "Jun"] },
  { label: "Monsoon",    months: ["Jul", "Aug"] },
  { label: "Autumn",     months: ["Sep", "Oct"] },
  { label: "Pre Winter", months: ["Nov", "Dec"] },
  { label: "Winter",     months: ["Jan", "Feb"] },
];

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
};

declare global { interface Window { L: typeof L } }

function loadLeaflet(): Promise<typeof L> {
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
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff5100]" />
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
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f5f0e8] text-[#1a1f2e] text-sm placeholder-[#9a9590] border border-transparent focus:outline-none focus:border-[#ff5100] transition-colors"
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
                <MapPin className="w-3.5 h-3.5 text-[#ff5100] mt-0.5 shrink-0" />
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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Expose flyTo via ref
  useEffect(() => {
    flyToRef.current = (lat: number, lng: number) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 10, { duration: 1.4 });
      }
    };
  });

  function addMarkers(leaflet: typeof L, list: Adventure[]) {
    list.forEach((adv) => {
      const color = difficultyColor[adv.difficulty] ?? "#6366f1";
      const emoji = typeEmoji[adv.type] || "📍";
      const icon = leaflet.divIcon({
        className: "",
        html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:${color};border:2px solid white;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:11px;line-height:1;">${emoji}</span>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -34],
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

      const marker = leaflet.marker([adv.lat, adv.lng], { icon })
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

      if (markersLayerRef.current) {
        markersLayerRef.current.addLayer(marker);
      }
    });
  }

  function addIndiaBorder(leaflet: typeof L, map: L.Map) {
    // Official India Boundary GeoJSON (Composite)
    // Source: Datameet / Hindustan Times Labs (Verified official boundaries)
    fetch("https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/india/india-composite.json")
      .then(res => res.json())
      .then(data => {
        leaflet.geoJSON(data, {
          style: {
            color: "#ff5100",
            weight: 2,
            opacity: 0.6,
            fillColor: "#ff5100",
            fillOpacity: 0.03,
            dashArray: "5, 5"
          },
          interactive: false
        }).addTo(map);
      })
      .catch(err => console.error("Failed to load India border:", err));
  }

  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current;
    loadLeaflet().then((leaflet) => {
      if (!container) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((container as any)._leaflet_id) (container as any)._leaflet_id = undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
        const map = leaflet.map(container, { center: [22.5, 80.0], zoom: 5, zoomControl: true, attributionControl: false, scrollWheelZoom: true });
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = leaflet.layerGroup().addTo(map);
      addMarkers(leaflet, advs);
      addIndiaBorder(leaflet, map);
    });
    return () => {
      if (mapInstanceRef.current) {
        markersLayerRef.current = null;
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (container) (container as any)._leaflet_id = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    loadLeaflet().then((leaflet) => {
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        addMarkers(leaflet, advs);
      }
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
  const [aceCategory, setAceCategory] = useState<AceCategory | null>(null);
  const [userProfile, setUserProfile] = useState<StoredProfile | null>(null);

  useEffect(() => { setMounted(true); setUserProfile(loadProfile()); }, []);

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
    setSelectedSubRegions([]);
    setExpandedRegion(null);
    setExpandedCategory(null);
    setExpandedSeason(null);
    setAceCategory(null);
  }

  const activeFilterCount =
    selectedTypes.length +
    selectedRegions.length +
    selectedSubRegions.length +
    selectedDifficulties.length +
    selectedDurations.length +
    selectedMonths.length +
    selectedGroupSizes.length +
    (aceCategory !== null ? 1 : 0);

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
    if (aceCategory && userProfile) {
      const cat = classifyAdventure(userProfile.ace, getACE(a));
      if (cat !== aceCategory) return false;
    }
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
              <span className="bg-[#ff5100] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
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
              className="flex items-center gap-1.5 text-sm text-[#ff5100] hover:text-[#ff7d47] font-medium"
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
                              label: "Land", 
                              types: ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"],
                            },
                            {
                              label: "Water", 
                              types: ["Diving", "Kayaking"],
                            },
                            {
                              label: "Snow", 
                              types: ["Skiing"],
                            },
                            {
                              label: "Air", 
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
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                          isExpanded || hasSelected 
                                            ? "bg-[#ff5100] text-white border-[#ff5100]" 
                                            : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                        }`}
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
                                <p className="text-xs text-[#ff5100] italic">Coming soon</p>
                              ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {cat.types.map((type) => {
                                      const isSelected = selectedTypes.includes(type as AdventureType);
                                      return (
                                          <button
                                            key={type}
                                            onClick={() => toggle(selectedTypes, type as AdventureType, setSelectedTypes)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                              isSelected 
                                                ? "bg-[#ff5100] text-white" 
                                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
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
          const regionGroups: { name: Region; subRegions: string[] }[] = [
                            { name: "Himalayas",     subRegions: ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "Arunachal Pradesh", "Nepal", "Bhutan"] },
                            { name: "Western Ghats", subRegions: ["Kerala", "Karnataka", "Goa", "Maharashtra"] },
                            { name: "Eastern Ghats", subRegions: ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka"] },
                            { name: "Desert",        subRegions: ["Rajasthan", "Gujarat"] },
                            { name: "Coast",         subRegions: ["Maharashtra", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"] },
                            { name: "Islands",       subRegions: ["Andaman & Nicobar", "Lakshadweep"] },
                            { name: "Northeast",     subRegions: ["Nagaland", "Manipur", "Meghalaya", "Mizoram", "Assam", "Arunachal Pradesh", "Sikkim"] },
                            { name: "Urban",         subRegions: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"] },
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
                                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                        isExpanded || hasSelected 
                                          ? "bg-[#ff5100] text-white border-[#ff5100]" 
                                          : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                      }`}>
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
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                      selectedSubRegions.includes(sr) 
                                        ? "bg-[#ff5100] text-white" 
                                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                    }`}>
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
                          {seasons.map(({ label, months: sMonths }) => {
                            const isExpanded = expandedSeason === label;
                            const hasSelected = sMonths.some((m) => selectedMonths.includes(m));
                            const selectedCount = sMonths.filter((m) => selectedMonths.includes(m)).length;
                            return (
                              <button key={label} onClick={() => setExpandedSeason(isExpanded ? null : label)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                  isExpanded || hasSelected 
                                    ? "bg-[#ff5100] text-white border-[#ff5100]" 
                                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                }`}>
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
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  selectedMonths.includes(m) 
                                    ? "bg-[#ff5100] text-white" 
                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                }`}>
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
                        { val: "Easy",         idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                        { val: "Moderate",     idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                        { val: "Hard",         idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                        { val: "Advanced",     idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                        { val: "Extreme",      idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                        ] as { val: Difficulty; idle: string; active: string }[]).map(({ val, idle, active }) => (
                          <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDifficulties.includes(val) ? active : idle}`}>
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Duration</h3>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { val: "Weekend",  label: "Weekend",  idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                            { val: "3–5 days", label: "3–5 days", idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                            { val: "7+ days",  label: "7+ days",  idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                          ] as { val: Duration; label: string; idle: string; active: string }[]).map(({ val, label, idle, active }) => (
                            <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDurations.includes(val) ? active : idle}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                        <div>
                          <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Group Size</h3>
                          <div className="flex flex-nowrap overflow-x-auto pb-1 gap-2 no-scrollbar">
                            {([
                              { val: "Solo",             idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                              { val: "Small group (2–6)", idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                              { val: "Large group (6+)",  idle: "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                            ] as { val: GroupSize; idle: string; active: string }[]).map(({ val, idle, active }) => (
                              <button key={val} onClick={() => toggle(selectedGroupSizes, val, setSelectedGroupSizes)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${selectedGroupSizes.includes(val) ? active : idle}`}>
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                    </div>

                {/* ACE Profile Filter */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">ACE Profile Match</h3>
                  {!userProfile ? (
                    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div>
                        <p className="text-sm font-medium text-zinc-600">No ACE profile yet</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Take the assessment to filter by your capability level</p>
                      </div>
                      <Link
                        href="/matchmaker"
                        className="shrink-0 inline-flex items-center gap-1.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-3 py-2 rounded-xl text-xs transition-all"
                      >
                        Take Assessment
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {([
                        { key: "ready" as AceCategory, label: "Ready Now", desc: "Matches your current level", color: "#1e3d2f", bg: "#1e3d2f15", border: "#1e3d2f40" },
                        { key: "stretch" as AceCategory, label: "Stretch Challenge", desc: "Slightly above your level", color: "#b45309", bg: "#b4530915", border: "#b4530940" },
                        { key: "out-of-range" as AceCategory, label: "Out of Range", desc: "Significantly beyond current ability", color: "#dc2626", bg: "#dc262615", border: "#dc262640" },
                      ]).map(({ key, label, desc, color, bg, border }) => {
                        const isActive = aceCategory === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setAceCategory(isActive ? null : key)}
                            className="text-left p-3.5 rounded-xl border transition-all"
                            style={{
                              background: isActive ? bg : "#f5f0e8",
                              borderColor: isActive ? border : "#e0d8cc",
                            }}
                          >
                            <p className="text-xs font-bold mb-0.5" style={{ color: isActive ? color : "#6b6560" }}>{label}</p>
                            <p className="text-[11px] text-zinc-400">{desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex flex-wrap gap-2 border-b border-[#e0d8cc] bg-[#fdfcfb] shrink-0">
            {selectedTypes.map((t) => (
              <span
                key={t}
                onClick={() => toggle(selectedTypes, t, setSelectedTypes)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors"
              >
                {t} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedRegions.map((r) => (
              <span
                key={r}
                onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors"
              >
                {r} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedSubRegions.map((sr) => (
              <span
                key={sr}
                onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors"
              >
                {sr} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedDifficulties.map((d) => (
              <span
                key={d}
                onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors"
              >
                {d} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedDurations.map((d) => (
              <span
                key={d}
                onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors"
              >
                {d} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedMonths.map((m) => (
              <span
                key={m}
                onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors"
              >
                {m} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedGroupSizes.map((g) => (
              <span
                key={g}
                onClick={() => toggle(selectedGroupSizes, g, setSelectedGroupSizes)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors"
              >
                {g} <X className="w-3 h-3" />
              </span>
            ))}
            {aceCategory && (
              <span
                onClick={() => setAceCategory(null)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                ACE: {aceCategory === "ready" ? "Ready Now" : aceCategory === "stretch" ? "Stretch" : "Out of Range"} <X className="w-3 h-3" />
              </span>
            )}
          </div>
        )}

      {/* Map — fills remaining height */}
      <div className="flex-1 relative overflow-hidden">
        {mounted ? (
            <MapView adventures={visibleAdventures} flyToRef={flyToRef} />
        ) : (
          <div className="w-full h-full t-bg-surface2 flex items-center justify-center">
            <div className="text-white/40 text-sm">Loading map…</div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] t-bg-surface2/90 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3 shadow-xl">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <MapIcon className="w-3.5 h-3.5" />
            <span>TRAIL TO TIDES · India Adventure Map</span>
          </div>
        </div>
      </div>
    </div>
  );
}
