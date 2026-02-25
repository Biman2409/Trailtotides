"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2, Map as MapIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { adventures, adventureTypes, regions } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, GroupSize, Adventure } from "@/lib/data";

// ── Map helpers ────────────────────────────────────────────────────────────

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
      const poll = setInterval(() => { if (window.L) { clearInterval(poll); resolve(window.L); } }, 50);
    }
  });
}

const difficultyColor: Record<string, string> = {
  Beginner: "#22c55e", Intermediate: "#3b82f6", Advanced: "#f59e0b",
  Expert: "#f97316", Extreme: "#ef4444",
};

const typeEmoji: Partial<Record<AdventureType, string>> = {
  Trekking: "🥾", Biking: "🏍️", Cycling: "🚴", Diving: "🤿",
  Kayaking: "🛶", Skiing: "⛷️", Mountaineering: "🧗", "Rock Climbing": "🧱",
  "Jeep Safari": "🚙", "Camel Safari": "🐪", Caving: "🪨",
  Sandboarding: "🏄", "Urban Adventure": "🏙️",
};

function ExploreMapView({ advs }: { advs: Adventure[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  function addMarkers(L: any, list: Adventure[]) {
    list.forEach((adv) => {
      const color = difficultyColor[adv.difficulty] ?? "#6366f1";
      const emoji = typeEmoji[adv.type] || "📍";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:13px;line-height:1;">${emoji}</span>
        </div>`,
        iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40],
      });
      const popupHtml = `
        <div style="width:240px;font-family:'DM Sans',sans-serif;padding:4px;">
          <div style="position:relative;height:130px;border-radius:10px;overflow:hidden;margin-bottom:10px;">
            <img src="${adv.heroImage}" alt="${adv.name}" style="width:100%;height:100%;object-fit:cover;" />
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 60%);" />
            <div style="position:absolute;bottom:8px;left:8px;right:8px;">
              <div style="font-size:14px;font-weight:700;color:#fff;line-height:1.2;text-shadow:0 1px 4px rgba(0,0,0,0.6);">${adv.name}</div>
            </div>
          </div>
          <p style="margin:0 0 8px;font-size:11px;color:#9a9590;">${adv.state} · ${adv.durationDays}</p>
          <a href="/experiences/${adv.slug}" style="display:block;text-align:center;background:#1e3d2f;color:white;padding:8px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">View Experience →</a>
        </div>`;
      markersLayerRef.current.addLayer(L.marker([adv.lat, adv.lng], { icon }).bindPopup(popupHtml, { maxWidth: 260, minWidth: 260 }));
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
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { subdomains: "abc", maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      addMarkers(L, advs);
    });
    return () => {
      if (mapInstanceRef.current) { markersLayerRef.current = null; mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      if (mapRef.current) (mapRef.current as any)._leaflet_id = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    loadLeaflet().then((L) => { markersLayerRef.current.clearLayers(); addMarkers(L, advs); });
  }, [advs]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// filter constants
const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced", "Expert", "Extreme"];
const durations: Duration[] = ["Weekend", "3–5 days", "7+ days"];
const groupSizes: GroupSize[] = ["Solo", "Small group (2–6)", "Large group (6+)"];

const seasons: { label: string; icon: string; months: Month[]; color: string; activeColor: string; idleColor: string }[] = [
  { label: "Winter",  icon: "❄️", months: ["Dec", "Jan", "Feb"],      color: "text-sky-600",    activeColor: "bg-sky-600 text-white",    idleColor: "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200" },
  { label: "Spring",  icon: "🌸", months: ["Mar", "Apr", "May"],      color: "text-pink-600",   activeColor: "bg-pink-500 text-white",   idleColor: "bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200" },
  { label: "Summer",  icon: "☀️", months: ["Apr", "May", "Jun"],      color: "text-amber-600",  activeColor: "bg-amber-500 text-white",  idleColor: "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200" },
  { label: "Monsoon", icon: "🌧️", months: ["Jun", "Jul", "Aug", "Sep"], color: "text-teal-600", activeColor: "bg-teal-600 text-white",   idleColor: "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200" },
  { label: "Autumn",  icon: "🍂", months: ["Oct", "Nov", "Dec"],      color: "text-orange-600", activeColor: "bg-orange-500 text-white", idleColor: "bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200" },
];

const difficultyDot: Record<Difficulty, string> = {
  Beginner:     "bg-green-500",
  Intermediate: "bg-blue-500",
  Advanced:     "bg-amber-400",
  Expert:       "bg-orange-500",
  Extreme:      "bg-red-500",
};

export default function ExploreClient() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<AdventureType[]>(
    searchParams.get("type") ? [searchParams.get("type") as AdventureType] : []
  );
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(
    searchParams.get("region") ? [searchParams.get("region") as Region] : []
  );
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<Duration[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Month[]>([]);
  const [selectedGroupSizes, setSelectedGroupSizes] = useState<GroupSize[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  useEffect(() => { setMounted(true); }, []);

  function toggleSeason(seasonMonths: Month[]) {
    const allSelected = seasonMonths.every((m) => selectedMonths.includes(m));
    if (allSelected) {
      setSelectedMonths(selectedMonths.filter((m) => !seasonMonths.includes(m)));
    } else {
      const merged = Array.from(new Set([...selectedMonths, ...seasonMonths])) as Month[];
      setSelectedMonths(merged);
    }
  }

  function toggle<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const filtered = useMemo(() => {
    return adventures.filter((a) => {
        if (
          search &&
          !a.name.toLowerCase().includes(search.toLowerCase()) &&
          !a.state.toLowerCase().includes(search.toLowerCase()) &&
          !a.tagline.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (selectedTypes.length && !selectedTypes.includes(a.type)) return false;
        if (selectedRegions.length && !selectedRegions.includes(a.region)) return false;
        if (selectedSubRegions.length && !selectedSubRegions.some(sr => a.state.includes(sr))) return false;
      if (selectedDifficulties.length && !selectedDifficulties.includes(a.difficulty))
        return false;
      if (selectedDurations.length && !selectedDurations.includes(a.duration)) return false;
      if (selectedMonths.length && !selectedMonths.some((m) => a.bestMonths.includes(m)))
        return false;
      if (selectedGroupSizes.length && !selectedGroupSizes.includes(a.groupSize))
        return false;
      return true;
    });
  }, [search, selectedTypes, selectedRegions, selectedSubRegions, selectedDifficulties, selectedDurations, selectedMonths, selectedGroupSizes]);

  const activeFilterCount =
    selectedTypes.length +
    selectedRegions.length +
    selectedSubRegions.length +
    selectedDifficulties.length +
    selectedDurations.length +
    selectedMonths.length +
    selectedGroupSizes.length;

  function clearAll() {
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    setSelectedDifficulties([]);
    setSelectedDurations([]);
    setSelectedMonths([]);
    setSelectedGroupSizes([]);
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#1a1f2e] pt-28 pb-14 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Discover
          </p>
          <h1 className="text-white text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
            All Adventures
          </h1>
          <p className="text-white/45 text-lg">
            {adventures.length} experiences across India — treks, rides, dives and more.
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="sticky top-16 lg:top-20 z-40 bg-white/96 backdrop-blur-lg border-b border-[#e0d8cc] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search adventures, regions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f0e8] text-[#1a1f2e] text-sm placeholder-[#9a9590] border border-transparent focus:outline-none focus:border-[#1e3d2f] transition-colors"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
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

          {/* Result count */}
          <span className="hidden md:block text-sm text-[#9a9590] ml-auto">
            {filtered.length} of {adventures.length} adventures
          </span>

          {/* Clear */}
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
          <div className="border-t border-[#e0d8cc] bg-white px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Adventure type */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                    Adventure Type
                  </h3>
                  {(() => {
                    const categories = [
                      {
                        label: "Land Based", icon: "🏔️",
                        btn: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
                        btnActive: "bg-amber-500 text-white border-amber-500",
                        chip: "bg-amber-100 text-amber-900 hover:bg-amber-200",
                        chipActive: "bg-amber-500 text-white",
                        types: ["Trekking", "Mountaineering", "Rock Climbing", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"],
                      },
                      {
                        label: "Water Based", icon: "🌊",
                        btn: "bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100",
                        btnActive: "bg-sky-500 text-white border-sky-500",
                        chip: "bg-sky-100 text-sky-900 hover:bg-sky-200",
                        chipActive: "bg-sky-500 text-white",
                        types: ["Diving", "Kayaking"],
                      },
                      {
                        label: "Snow Based", icon: "❄️",
                        btn: "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100",
                        btnActive: "bg-slate-600 text-white border-slate-600",
                        chip: "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        chipActive: "bg-slate-600 text-white",
                        types: ["Skiing"],
                      },
                      {
                        label: "Air Based", icon: "🪂",
                        btn: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100",
                        btnActive: "bg-purple-500 text-white border-purple-500",
                        chip: "bg-purple-100 text-purple-900 hover:bg-purple-200",
                        chipActive: "bg-purple-500 text-white",
                        types: [] as string[],
                      },
                    ];
                    return (
                      <div className="flex flex-col gap-2">
                        {/* Category buttons row */}
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => {
                            const isExpanded = expandedCategory === cat.label;
                            const hasSelected = cat.types.some(t => selectedTypes.includes(t as AdventureType));
                            return (
                              <button
                                key={cat.label}
                                onClick={() => setExpandedCategory(isExpanded ? null : cat.label)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                  isExpanded || hasSelected ? cat.btnActive : cat.btn
                                }`}
                              >
                                <span>{cat.icon}</span>
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

                        {/* Expanded type chips */}
                        {expandedCategory && (() => {
                          const cat = categories.find(c => c.label === expandedCategory)!;
                          return (
                            <div className="rounded-xl border border-[#e8dfc8] bg-[#fafaf8] p-3">
                              {cat.types.length === 0 ? (
                                <p className="text-xs text-[#c4b99a] italic">Coming soon</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {cat.types.map((type) => {
                                    const icon = adventureTypes.find(a => a.type === type)?.icon ?? "";
                                    const isSelected = selectedTypes.includes(type as AdventureType);
                                    return (
                                      <button
                                        key={type}
                                        onClick={() => toggle(selectedTypes, type as AdventureType, setSelectedTypes)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                          isSelected ? cat.chipActive : cat.chip
                                        }`}
                                      >
                                        <span>{icon}</span>
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
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                    Region
                  </h3>
                  {(() => {
                    const regionGroups: { name: Region; icon: string; btn: string; btnActive: string; chip: string; chipActive: string; subRegions: string[] }[] = [
                      {
                        name: "Himalayas",
                        icon: "🏔️",
                        btn: "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100",
                        btnActive: "bg-emerald-700 text-white border-emerald-700",
                        chip: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
                        chipActive: "bg-emerald-700 text-white",
                          subRegions: ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "Arunachal Pradesh", "Nepal", "Bhutan"],
                      },
                      {
                        name: "Western Ghats",
                        icon: "🌿",
                        btn: "bg-lime-50 border-lime-200 text-lime-800 hover:bg-lime-100",
                        btnActive: "bg-lime-600 text-white border-lime-600",
                        chip: "bg-lime-100 text-lime-900 hover:bg-lime-200",
                        chipActive: "bg-lime-600 text-white",
                        subRegions: ["Kerala", "Karnataka", "Goa", "Maharashtra", "Gujarat"],
                        },
                        {
                          name: "Eastern Ghats",
                          icon: "🌾",
                          btn: "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100",
                          btnActive: "bg-orange-600 text-white border-orange-600",
                          chip: "bg-orange-100 text-orange-900 hover:bg-orange-200",
                          chipActive: "bg-orange-600 text-white",
                          subRegions: ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu"],
                        },
                      {
                        name: "Desert",
                        icon: "🏜️",
                        btn: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100",
                        btnActive: "bg-yellow-500 text-white border-yellow-500",
                        chip: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
                        chipActive: "bg-yellow-500 text-white",
                          subRegions: ["Rajasthan", "Gujarat"],
                      },
                      {
                        name: "Coast",
                        icon: "🌊",
                        btn: "bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100",
                        btnActive: "bg-cyan-600 text-white border-cyan-600",
                        chip: "bg-cyan-100 text-cyan-900 hover:bg-cyan-200",
                        chipActive: "bg-cyan-600 text-white",
                        subRegions: ["Maharashtra (Konkan)", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"],
                      },
                      {
                        name: "Islands",
                        icon: "🏝️",
                        btn: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100",
                        btnActive: "bg-teal-600 text-white border-teal-600",
                        chip: "bg-teal-100 text-teal-900 hover:bg-teal-200",
                        chipActive: "bg-teal-600 text-white",
                        subRegions: ["Andaman & Nicobar", "Lakshadweep"],
                      },
                      {
                        name: "Northeast",
                        icon: "🌄",
                        btn: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100",
                        btnActive: "bg-violet-600 text-white border-violet-600",
                        chip: "bg-violet-100 text-violet-900 hover:bg-violet-200",
                        chipActive: "bg-violet-600 text-white",
                        subRegions: ["Nagaland", "Manipur", "Meghalaya", "Assam", "Arunachal Pradesh", "Sikkim"],
                      },
                    ];
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {regionGroups.map((rg) => {
                            const isExpanded = expandedRegion === rg.name;
                            const hasSelected = selectedRegions.includes(rg.name) || rg.subRegions.some(sr => selectedSubRegions.includes(sr));
                            const subCount = rg.subRegions.filter(sr => selectedSubRegions.includes(sr)).length;
                            return (
                              <button
                                key={rg.name}
                                onClick={() => setExpandedRegion(isExpanded ? null : rg.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                  isExpanded || hasSelected ? rg.btnActive : rg.btn
                                }`}
                              >
                                <span>{rg.icon}</span>
                                {rg.name}
                                {subCount > 0 && (
                                  <span className="bg-white/30 text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                    {subCount}
                                  </span>
                                )}
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
                                {rg.subRegions.map((sr) => {
                                  const isSelected = selectedSubRegions.includes(sr);
                                  return (
                                    <button
                                      key={sr}
                                      onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        isSelected ? rg.chipActive : rg.chip
                                      }`}
                                    >
                                      {sr}
                                    </button>
                                  );
                                })}
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
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                    Best Season
                  </h3>
                  <div className="flex flex-col gap-2">
                    {/* Season buttons row */}
                    <div className="flex flex-wrap gap-2">
                      {seasons.map(({ label, icon, months: sMonths, activeColor, idleColor }) => {
                        const isExpanded = expandedSeason === label;
                        const hasSelected = sMonths.some((m) => selectedMonths.includes(m));
                        const selectedCount = sMonths.filter((m) => selectedMonths.includes(m)).length;
                        return (
                          <button
                            key={label}
                            onClick={() => setExpandedSeason(isExpanded ? null : label)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                              isExpanded || hasSelected ? activeColor : idleColor
                            }`}
                          >
                            <span>{icon}</span>
                            {label}
                            {hasSelected && (
                              <span className="bg-white/30 text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                {selectedCount}
                              </span>
                            )}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                    {/* Expanded month chips */}
                    {expandedSeason && (() => {
                      const season = seasons.find((s) => s.label === expandedSeason)!;
                      return (
                        <div className="rounded-xl border border-[#e8dfc8] bg-[#fafaf8] p-3">
                          <div className="flex flex-wrap gap-2">
                            {season.months.map((m) => (
                              <button
                                key={m}
                                onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  selectedMonths.includes(m) ? season.activeColor : season.idleColor
                                }`}
                              >
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
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                  Difficulty
                </h3>
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
                      <span className={`w-2 h-2 rounded-full ${difficultyDot[d]}`} />
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                  Duration
                </h3>
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

              {/* Group Size */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                  Group Size
                </h3>
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

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 flex flex-wrap gap-2">
          {selectedTypes.map((t) => (
            <span
              key={t}
              onClick={() => toggle(selectedTypes, t, setSelectedTypes)}
              className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#c4622d]/15 hover:text-[#c4622d] transition-colors"
            >
              {t} <X className="w-3 h-3" />
            </span>
          ))}
           {selectedRegions.map((r) => (
              <span
                key={r}
                onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#c4622d]/15 hover:text-[#c4622d] transition-colors"
              >
                {r} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedSubRegions.map((sr) => (
              <span
                key={sr}
                onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#c4622d]/15 hover:text-[#c4622d] transition-colors"
              >
                {sr} <X className="w-3 h-3" />
              </span>
            ))}
          {selectedDifficulties.map((d) => (
            <span
              key={d}
              onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
              className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#c4622d]/15 hover:text-[#c4622d] transition-colors"
            >
              {d} <X className="w-3 h-3" />
            </span>
          ))}
          {selectedDurations.map((d) => (
            <span
              key={d}
              onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
              className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#c4622d]/15 hover:text-[#c4622d] transition-colors"
            >
              {d} <X className="w-3 h-3" />
            </span>
          ))}
          {selectedMonths.map((m) => (
              <span
                key={m}
                onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                className="flex items-center gap-1.5 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-teal-200 transition-colors"
              >
                {m} <X className="w-3 h-3" />
              </span>
            ))}
          {selectedGroupSizes.map((g) => (
            <span
              key={g}
              onClick={() => toggle(selectedGroupSizes, g, setSelectedGroupSizes)}
              className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#c4622d]/15 hover:text-[#c4622d] transition-colors"
            >
              {g} <X className="w-3 h-3" />
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-28">
              <div className="text-6xl mb-5">🗺️</div>
              <h3 className="text-[#1a1f2e] text-2xl font-bold mb-2">No adventures found</h3>
              <p className="text-[#9a9590] mb-7 max-w-xs mx-auto leading-relaxed">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={clearAll}
                className="bg-[#1e3d2f] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-[#2d5a42] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                Clear all filters
              </button>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((adventure) => (
              <AdventureCard key={adventure.id} adventure={adventure} />
            ))}
          </div>
        )}
      </div>

        {/* Interactive Map Section */}
        <div className="bg-[#1a1f2e] mt-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Explore the map
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <h2 className="text-white text-4xl lg:text-5xl font-semibold tracking-tight">
                Adventures across India
              </h2>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                Open full map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Map embed */}
          <div className="relative h-[520px] w-full">
            {mounted ? (
              <ExploreMapView advs={filtered.length > 0 ? filtered : adventures} />
            ) : (
              <div className="w-full h-full bg-[#111827] flex items-center justify-center">
                <div className="text-white/30 text-sm">Loading map…</div>
              </div>
            )}
            {/* Bottom fade into footer */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#1a1f2e] to-transparent pointer-events-none z-[1000]" />
          </div>
        </div>

        <Footer />
      </div>
    );
  }
