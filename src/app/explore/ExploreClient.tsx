"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, Map as MapIcon, ArrowRight, Compass, Send, ChevronRight, Loader2, Wind, Sun, Mountain, Waves, Snowflake, Trees, Palmtree, Sunrise, Building2, Flower2, CloudRain, Leaf, Footprints, Bike, Car, HardHat, Ship } from "lucide-react";
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
  Expert: "#f4845f", Extreme: "#ef4444",
};

const typeEmoji: Partial<Record<AdventureType, string>> = {
  Trekking: "🥾", Biking: "🏍️", Cycling: "🚴", Diving: "🤿",
  Kayaking: "🛶", Skiing: "⛷️", Mountaineering: "🧗", "Rock Climbing": "🧱",
  "Jeep Safari": "🚙", "Camel Safari": "🐪", Caving: "🪨",
  Sandboarding: "🏄", "Urban Adventure": "🏙️",
};

const typeIcons: Record<string, React.ReactNode> = {
  Trekking: <Footprints className="w-3.5 h-3.5 shrink-0" />,
  Biking: <Bike className="w-3.5 h-3.5 shrink-0" />,
  Cycling: <Bike className="w-3.5 h-3.5 shrink-0" />,
  Diving: <Waves className="w-3.5 h-3.5 shrink-0" />,
  Kayaking: <Ship className="w-3.5 h-3.5 shrink-0" />,
  Skiing: <Snowflake className="w-3.5 h-3.5 shrink-0" />,
  Mountaineering: <Mountain className="w-3.5 h-3.5 shrink-0" />,
  "Rock Climbing": <Mountain className="w-3.5 h-3.5 shrink-0" />,
  "Jeep Safari": <Car className="w-3.5 h-3.5 shrink-0" />,
  "Camel Safari": <Sun className="w-3.5 h-3.5 shrink-0" />,
  Caving: <HardHat className="w-3.5 h-3.5 shrink-0" />,
  Sandboarding: <Sun className="w-3.5 h-3.5 shrink-0" />,
  "Urban Adventure": <Building2 className="w-3.5 h-3.5 shrink-0" />,
  Paragliding: <Wind className="w-3.5 h-3.5 shrink-0" />,
  "Hot Air Balloon": <Wind className="w-3.5 h-3.5 shrink-0" />,
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

const seasons: { label: string; icon: React.ReactNode; months: Month[]; color: string; activeColor: string; idleColor: string }[] = [
  { label: "Winter",  icon: <Snowflake className="w-4 h-4" />, months: ["Dec", "Jan", "Feb"],      color: "text-sky-600",    activeColor: "bg-sky-600 text-white",    idleColor: "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200" },
  { label: "Spring",  icon: <Flower2 className="w-4 h-4" />, months: ["Mar", "Apr", "May"],      color: "text-pink-600",   activeColor: "bg-pink-500 text-white",   idleColor: "bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200" },
  { label: "Summer",  icon: <Sun className="w-4 h-4" />, months: ["Apr", "May", "Jun"],      color: "text-amber-600",  activeColor: "bg-amber-500 text-white",  idleColor: "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200" },
  { label: "Monsoon", icon: <CloudRain className="w-4 h-4" />, months: ["Jun", "Jul", "Aug", "Sep"], color: "text-teal-600", activeColor: "bg-teal-600 text-white",   idleColor: "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200" },
    { label: "Autumn",  icon: <Leaf className="w-4 h-4" />, months: ["Oct", "Nov", "Dec"],      color: "text-[#f4845f]", activeColor: "bg-[#f4845f] text-white", idleColor: "bg-[#f4845f]/5 text-[#f4845f] hover:bg-[#f4845f]/10 border border-[#f4845f]/20" },
];


export default function ExploreClient() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<AdventureType[]>(
    searchParams.get("type") ? [searchParams.get("type") as AdventureType] : []
  );
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(
    searchParams.get("region") ? [searchParams.get("region") as Region] : []
  );
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>(
    searchParams.get("subRegion") ? [searchParams.get("subRegion") as string] : []
  );
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<Duration[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Month[]>([]);
  const [selectedGroupSizes, setSelectedGroupSizes] = useState<GroupSize[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // AI chat state
  type AiMessage = { role: "user" | "assistant"; content: string; cards?: any[]; recommendations?: { slug: string; name: string; reason: string }[] };
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef<HTMLDivElement>(null);
  const AI_SUGGESTIONS = ["Easy Himalayan trek for beginners", "Scuba diving near islands", "Solo adventure in Northeast", "Extreme cycling in summer"];

  useEffect(() => { aiBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages]);

  async function sendAi(text?: string) {
    const msg = (text ?? aiInput).trim();
    if (!msg || aiLoading) return;
    setAiInput("");
    const userMsg: AiMessage = { role: "user", content: msg };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...aiMessages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setAiMessages((prev) => [...prev, { role: "assistant", content: data.text || data.error || "Sorry, something went wrong.", cards: data.cards, recommendations: data.recommendations }]);
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  }

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
        <p className="text-[#f4845f] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
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
                onClick={() => { setFiltersOpen(!filtersOpen); setAiOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtersOpen || activeFilterCount > 0
                    ? "bg-[#1e3d2f] text-white"
                    : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#e8dfc8]"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#f4845f] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
              </button>
  
              {/* AI Adventure Finder toggle */}
              <button
                onClick={() => { setAiOpen(!aiOpen); setFiltersOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    aiOpen
                      ? "bg-[#f4845f] text-white"
                      : "bg-[#f4845f] text-white hover:bg-[#f69d7c]"
                  }`}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">Compass AI</span>
                <span className="sm:hidden">AI</span>
              </button>


          {/* Result count */}
          <span className="hidden md:block text-sm text-[#9a9590] ml-auto">
            {filtered.length} of {adventures.length} adventures
          </span>

            {/* Clear */}
            {(activeFilterCount > 0 || search) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-sm text-[#f4845f] hover:text-[#f69d7c] font-medium"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* AI Adventure Finder panel */}
          {aiOpen && (
            <div className="border-t border-[#e0d8cc] bg-[#141920] px-6 lg:px-8 py-5">
              <div className="max-w-7xl mx-auto">
                <div className="border border-white/8 rounded-2xl overflow-hidden">
                  {aiMessages.length > 0 && (
                    <div className="max-h-[280px] overflow-y-auto p-4 space-y-3 bg-white/2">
                      {aiMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[85%] space-y-2">
                            {msg.content && (
                              <div
                                  className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                                    msg.role === "user"
                                      ? "text-white rounded-br-sm"
                                      : "bg-white/6 border border-white/8 text-white/80 rounded-bl-sm"
                                  }`}
                                  style={msg.role === "user" ? { background: "#f4845f" } : {}}
                                >
                                  {msg.content}
                                </div>
                              )}
                              {msg.cards && msg.cards.length > 0 && (
                                <div className="grid gap-2">
                                  {msg.cards.map((card: any, ci: number) => {
                                    const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                                    return (
                                      <Link
                                        key={ci}
                                        href={`/adventure/${card.slug}`}
                                        className="flex items-stretch bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/16 rounded-xl overflow-hidden transition-all group"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={card.heroImage} alt={card.name} className="w-16 h-16 object-cover flex-shrink-0" />
                                        <div className="p-3 flex-1 min-w-0">
                                          <p className="text-white text-xs font-semibold tracking-tight">{card.name}</p>
                                          <p className="text-white/40 text-xs mt-0.5 uppercase tracking-wide">{card.state} · {card.type} · {card.difficulty}</p>
                                          {rec?.reason && <p className="text-[#f4845f] text-xs mt-1 line-clamp-1">{rec.reason}</p>}
                                        </div>
                                        <div className="flex items-center pr-3">
                                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#f4845f] transition-colors" />
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {aiLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white/6 border border-white/8 px-4 py-2.5 rounded-xl rounded-bl-sm flex items-center gap-2">
                              <Loader2 className="w-3.5 h-3.5 text-[#f4845f] animate-spin" />
                              <span className="text-white/50 text-sm">Finding adventures…</span>
                            </div>
                          </div>
                        )}

                      <div ref={aiBottomRef} />
                    </div>
                  )}
                  {aiMessages.length === 0 && (
                    <div className="px-4 pt-4 pb-3 bg-white/2">
                      <div className="flex flex-wrap gap-2">
                        {AI_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => sendAi(s)}
                            className="text-xs border border-white/10 text-white/50 hover:text-white hover:border-white/24 px-3 py-1.5 rounded-full transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                    <div className="border-t border-white/8 p-3 flex gap-3 bg-white/3">
                      <input
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendAi()}
                        placeholder="Describe what you're looking for — we'll match you with the right trip"
                        className="flex-1 bg-white/6 border border-white/8 text-white placeholder-white/30 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#f4845f]/50 transition-all"
                      />
                      <button
                        onClick={() => sendAi()}
                        disabled={!aiInput.trim() || aiLoading}
                        className="disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
                        style={{ background: "#f4845f" }}
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Search</span>
                      </button>
                    </div>

                </div>
              </div>
            </div>
          )}

        {/* Filter panel */}
          {filtersOpen && (
            <div className="border-t border-[#e0d8cc] bg-white px-6 lg:px-8 py-6 max-h-[60vh] overflow-y-auto">
              <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Adventure type */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                    Adventure Type
                  </h3>
                  {(() => {
                      const categories = [
                        {
                          label: "Land Based", icon: <Mountain className="w-4 h-4" />,
                          btn: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
                          btnActive: "bg-amber-500 text-white border-amber-500",
                          chip: "bg-amber-100 text-amber-900 hover:bg-amber-200",
                          chipActive: "bg-amber-500 text-white",
                          types: ["Trekking", "Mountaineering", "Rock Climbing", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"],
                        },
                        {
                          label: "Water Based", icon: <Waves className="w-4 h-4" />,
                          btn: "bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100",
                          btnActive: "bg-sky-500 text-white border-sky-500",
                          chip: "bg-sky-100 text-sky-900 hover:bg-sky-200",
                          chipActive: "bg-sky-500 text-white",
                          types: ["Diving", "Kayaking"],
                        },
                        {
                          label: "Snow Based", icon: <Snowflake className="w-4 h-4" />,
                          btn: "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100",
                          btnActive: "bg-slate-600 text-white border-slate-600",
                          chip: "bg-slate-100 text-slate-700 hover:bg-slate-200",
                          chipActive: "bg-slate-600 text-white",
                          types: ["Skiing"],
                        },
                        {
                          label: "Air Based", icon: <Wind className="w-4 h-4" />,
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
                                  <p className="text-xs text-[#f4845f] italic">Coming soon</p>
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
                    const regionGroups: { name: Region; icon: React.ReactNode; btn: string; btnActive: string; chip: string; chipActive: string; subRegions: string[] }[] = [
                      {
          name: "Himalayas",
          icon: <Mountain className="w-4 h-4" />,
                        btn: "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100",
                        btnActive: "bg-emerald-700 text-white border-emerald-700",
                        chip: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
                        chipActive: "bg-emerald-700 text-white",
                          subRegions: ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "Arunachal Pradesh", "Nepal", "Bhutan"],
                      },
                      {
                          name: "Western Ghats",
                            icon: <Trees className="w-4 h-4" />,
                        btn: "bg-lime-50 border-lime-200 text-lime-800 hover:bg-lime-100",
                        btnActive: "bg-lime-600 text-white border-lime-600",
                        chip: "bg-lime-100 text-lime-900 hover:bg-lime-200",
                        chipActive: "bg-lime-600 text-white",
                        subRegions: ["Kerala", "Karnataka", "Goa", "Maharashtra", "Gujarat"],
                        },
                        {
                              name: "Eastern Ghats",
                                icon: <Mountain className="w-4 h-4" />,
                          btn: "bg-[#f4845f]/5 border-[#f4845f]/20 text-[#9c4a2f] hover:bg-[#f4845f]/10",
                          btnActive: "bg-[#d84315] text-white border-[#d84315]",
                          chip: "bg-[#f4845f]/10 text-orange-900 hover:bg-[#f4845f]/20",
                          chipActive: "bg-[#d84315] text-white",
                          subRegions: ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu"],
                        },
                        {
                          name: "Desert",
                          icon: <Sun className="w-4 h-4" />,
                          btn: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100",
                          btnActive: "bg-yellow-500 text-white border-yellow-500",
                          chip: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
                          chipActive: "bg-yellow-500 text-white",
                            subRegions: ["Rajasthan", "Gujarat"],
                        },
                      {
                        name: "Coast",
                        icon: <Waves className="w-4 h-4" />,
                        btn: "bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100",
                        btnActive: "bg-cyan-600 text-white border-cyan-600",
                        chip: "bg-cyan-100 text-cyan-900 hover:bg-cyan-200",
                        chipActive: "bg-cyan-600 text-white",
                        subRegions: ["Maharashtra (Konkan)", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"],
                      },
                      {
                        name: "Islands",
                        icon: <Palmtree className="w-4 h-4" />,
                        btn: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100",
                        btnActive: "bg-teal-600 text-white border-teal-600",
                        chip: "bg-teal-100 text-teal-900 hover:bg-teal-200",
                        chipActive: "bg-teal-600 text-white",
                        subRegions: ["Andaman & Nicobar", "Lakshadweep"],
                      },
                          {
                            name: "Northeast",
                            icon: <Mountain className="w-4 h-4" />,
                            btn: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100",
                          btnActive: "bg-violet-600 text-white border-violet-600",
                          chip: "bg-violet-100 text-violet-900 hover:bg-violet-200",
                          chipActive: "bg-violet-600 text-white",
                          subRegions: ["Nagaland", "Manipur", "Meghalaya", "Assam", "Arunachal Pradesh", "Sikkim"],
                        },
                        {
                          name: "Urban",
                          icon: <Building2 className="w-4 h-4" />,
                          btn: "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100",
                          btnActive: "bg-zinc-700 text-white border-zinc-700",
                          chip: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
                          chipActive: "bg-zinc-700 text-white",
                          subRegions: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"],
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

              {/* Difficulty, Duration, Group Size — each on its own row */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Difficulty</h3>
                  <div className="flex flex-wrap gap-2">
                    {([ 
                      { val: "Beginner",     icon: "🟢", idle: "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 border",     active: "bg-green-600 text-white border border-green-600" },
                      { val: "Intermediate", icon: "🔵", idle: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 border",         active: "bg-blue-600 text-white border border-blue-600" },
                      { val: "Advanced",     icon: "🟠", idle: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 border",     active: "bg-amber-500 text-white border border-amber-500" },
                      { val: "Expert",       icon: "🟠", idle: "bg-[#f4845f]/5 border-[#f4845f]/20 text-[#9c4a2f] hover:bg-[#f4845f]/10 border", active: "bg-[#f4845f] text-white border border-[#f4845f]" },
                      { val: "Extreme",      icon: "🔴", idle: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100 border",             active: "bg-red-600 text-white border border-red-600" },
                    ] as { val: Difficulty; icon: string; idle: string; active: string }[]).map(({ val, icon, idle, active }) => (
                      <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDifficulties.includes(val) ? active : idle}`}>
                        <span>{icon}</span>{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Duration</h3>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { val: "Weekend",  label: "Weekend",  icon: "⚡", idle: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 border", active: "bg-yellow-500 text-white border border-yellow-500" },
                      { val: "3–5 days", label: "3–5 days", icon: "🗓️", idle: "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100 border", active: "bg-indigo-600 text-white border border-indigo-600" },
                      { val: "7+ days",  label: "7+ days",  icon: "🏕️", idle: "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 border",         active: "bg-rose-600 text-white border border-rose-600" },
                    ] as { val: Duration; label: string; icon: string; idle: string; active: string }[]).map(({ val, label, icon, idle, active }) => (
                      <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDurations.includes(val) ? active : idle}`}>
                        <span>{icon}</span>{label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Group Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { val: "Solo",             icon: "🧍", idle: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100 border",     active: "bg-violet-600 text-white border border-violet-600" },
                      { val: "Small group (2–6)", icon: "👥", idle: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 border",             active: "bg-teal-600 text-white border border-teal-600" },
                      { val: "Large group (6+)",  icon: "🫂", idle: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 hover:bg-fuchsia-100 border", active: "bg-fuchsia-600 text-white border border-fuchsia-600" },
                    ] as { val: GroupSize; icon: string; idle: string; active: string }[]).map(({ val, icon, idle, active }) => (
                      <button key={val} onClick={() => toggle(selectedGroupSizes, val, setSelectedGroupSizes)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedGroupSizes.includes(val) ? active : idle}`}>
                        <span>{icon}</span>{val}
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
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#f4845f]/15 hover:text-[#f4845f] transition-colors"
              >
                {t} <X className="w-3 h-3" />
              </span>
            ))}
             {selectedRegions.map((r) => (
                <span
                  key={r}
                  onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                  className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#f4845f]/15 hover:text-[#f4845f] transition-colors"
                >
                  {r} <X className="w-3 h-3" />
                </span>
              ))}
              {selectedSubRegions.map((sr) => (
                <span
                  key={sr}
                  onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                  className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#f4845f]/15 hover:text-[#f4845f] transition-colors"
                >
                  {sr} <X className="w-3 h-3" />
                </span>
              ))}
            {selectedDifficulties.map((d) => (
              <span
                key={d}
                onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#f4845f]/15 hover:text-[#f4845f] transition-colors"
              >
                {d} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedDurations.map((d) => (
              <span
                key={d}
                onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#f4845f]/15 hover:text-[#f4845f] transition-colors"
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
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#f4845f]/15 hover:text-[#f4845f] transition-colors"
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

        {/* Map CTA Section */}
          <div className="bg-[#1a1f2e] mt-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-[#f4845f] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                  Explore the map
                </p>
                <h2 className="text-white text-4xl lg:text-5xl font-semibold tracking-tight">
                  Adventures across India
                </h2>
                <p className="text-white/45 mt-3 text-base">
                  View all {adventures.length} adventures pinned on an interactive map.
                </p>
              </div>
              <Link
                href="/map"
                className="inline-flex items-center gap-2.5 bg-[#f4845f] hover:bg-[#f69d7c] text-white px-7 py-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap"
              >
                <MapIcon className="w-4 h-4" />
                Open full map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        <Footer />
      </div>
  );
}
