"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, SlidersHorizontal, X, ChevronDown, Map as MapIcon, ArrowRight, Compass, Send, ChevronRight, Loader2, ChevronLeft, Heart, RotateCcw, MapPin, Clock, BarChart2, Star, Layers, Navigation } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { adventures } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, GroupSize, Adventure } from "@/lib/data";
import { difficultyStyle } from "@/lib/styles";
import { getACE, computeDifficulty } from "@/lib/ace";
import type { AceAxis } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { StoredProfile } from "@/lib/matchmaker";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";

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

// filter constants
const seasons: { label: string; months: Month[] }[] = [
  { label: "Spring",     months: ["Mar", "Apr"] },
  { label: "Summer",     months: ["May", "Jun"] },
  { label: "Monsoon",    months: ["Jul", "Aug"] },
  { label: "Autumn",     months: ["Sep", "Oct"] },
  { label: "Pre Winter", months: ["Nov", "Dec"] },
  { label: "Winter",     months: ["Jan", "Feb"] },
];


const LAND_TYPES: AdventureType[] = ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Motorcycling", "Cycling", "Jeep Safari", "Caving", "Urban Adventure"];

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
    const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(
      searchParams.get("difficulty") ? [searchParams.get("difficulty") as Difficulty] : []
    );
  const [selectedDurations, setSelectedDurations] = useState<Duration[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Month[]>([]);
  const [selectedGroupSizes, setSelectedGroupSizes] = useState<GroupSize[]>([]);
  const PRICE_MIN = 0;
  const PRICE_MAX = 200000;
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  // ACE filters — initialise from ?ace= URL param if present
  const [aceCategory, setAceCategory] = useState<AceCategory | null>(() => {
    const p = searchParams.get("ace");
    if (p === "ready" || p === "stretch" || p === "out-of-range") return p;
    return null;
  });
  const [userProfile, setUserProfile] = useState<StoredProfile | null>(null);
  const [editorOnly, setEditorOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const PAGE_SIZE = 12;

  // Shared wishlist banner — ?saved=slug1,slug2,...
  const sharedSlugs = useMemo(() => {
    const raw = searchParams.get("saved");
    if (!raw) return null;
    return raw.split(",").filter(Boolean);
  }, [searchParams]);
  const sharedAdventures = useMemo(() =>
    sharedSlugs ? adventures.filter(a => sharedSlugs.includes(a.slug)) : null,
  [sharedSlugs]);
  const scrollToSlug = searchParams.get("scroll");

  // AI chat state
  type AiMessage = { role: "user" | "assistant"; content: string; cards?: Adventure[]; recommendations?: { slug: string; name: string; reason: string }[] };
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef<HTMLDivElement>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);
  const AI_SUGGESTIONS = ["Easy Himalayan trek for beginners", "Ladakh bike expedition", "Solo adventure in Northeast"];

  useEffect(() => { setUserProfile(loadProfile()); }, []);

  useEffect(() => {
    if (scrollToSlug) {
      const el = document.getElementById(`card-${scrollToSlug}`);
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "center" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [scrollToSlug]);

  useEffect(() => {
    if (aiChatRef.current) aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
  }, [aiMessages, aiLoading]);

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

  function toggle<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const filtered = useMemo(() => {
    return adventures.filter((a) => {
        if (!LAND_TYPES.includes(a.type)) return false;
        if (editorOnly && !a.editorChoice) return false;
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
      if (selectedDifficulties.length && !selectedDifficulties.includes(computeDifficulty(getACE(a)) as Difficulty))
        return false;
      if (selectedDurations.length && !selectedDurations.includes(a.duration)) return false;
      if (selectedMonths.length && !selectedMonths.some((m) => a.bestMonths.includes(m)))
        return false;
      if (selectedGroupSizes.length && !selectedGroupSizes.includes(a.groupSize))
        return false;
      // Price filter — use cheapest operator price for the adventure
      if (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) {
        const lowestPrice = a.operators?.reduce((min, o) => {
          const p = parseInt(o.priceFrom.replace(/[^\d]/g, ""), 10);
          return isNaN(p) ? min : Math.min(min, p);
        }, Infinity) ?? Infinity;
        if (lowestPrice === Infinity || lowestPrice < priceRange[0] || lowestPrice > priceRange[1]) return false;
      }
      // ACE category filter
      if (aceCategory && userProfile) {
        const req = getACE(a);
        const cat = classifyAdventure(userProfile.ace, req);
        if (cat !== aceCategory) return false;
      }
      return true;
    });
    }, [search, selectedTypes, selectedRegions, selectedSubRegions, selectedDifficulties, selectedDurations, selectedMonths, selectedGroupSizes, priceRange, aceCategory, userProfile, editorOnly]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [search, selectedTypes, selectedRegions, selectedSubRegions, selectedDifficulties, selectedDurations, selectedMonths, selectedGroupSizes, priceRange, aceCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedResults = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const priceActive = priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;
  const activeFilterCount =
    selectedTypes.length +
    selectedRegions.length +
    selectedSubRegions.length +
    selectedDifficulties.length +
    selectedDurations.length +
    selectedMonths.length +
    selectedGroupSizes.length +
    (priceActive ? 1 : 0) +
    (aceCategory !== null ? 1 : 0);

  function clearAll() {
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    setSelectedDifficulties([]);
    setSelectedDurations([]);
    setSelectedMonths([]);
    setSelectedGroupSizes([]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setAceCategory(null);
    setSearch("");
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Page header */}
      <div className="t-bg-surface pt-24 lg:pt-28 pb-10 lg:pb-12 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Explore
          </p>
          <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-3">
            All Adventures
          </h1>
          <p className="text-white/40 text-base lg:text-lg max-w-2xl leading-relaxed">
            Every adventure across the Indian subcontinent — search, filter, and find what fits you.
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="sticky top-16 lg:top-20 z-40 t-bg-page/96 backdrop-blur-lg border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3 flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search adventures, regions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-white text-sm placeholder-white/30 border border-transparent focus:outline-none focus:border-[#ff5100]/50 transition-colors"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => { setFiltersOpen(!filtersOpen); setAiOpen(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filtersOpen || activeFilterCount > 0
                ? "bg-[#ff5100] text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-[#ff5100] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Compass.AI toggle */}
          <button
            onClick={() => { setAiOpen(!aiOpen); setFiltersOpen(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              aiOpen
                ? "text-white"
                : "text-white hover:opacity-90"
            }`}
            style={{ background: aiOpen ? "linear-gradient(135deg,#e04800,#ff7d47)" : "linear-gradient(135deg,#ff5100,#ff7d47)" }}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Compass.AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Editor's Choice */}
          <button
            onClick={() => setEditorOnly(!editorOnly)}
            className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              editorOnly
                ? "text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            style={editorOnly ? { background: "linear-gradient(135deg,#ff5100,#ff7d47)", boxShadow: "0 2px 12px rgba(255,81,0,0.3)" } : {}}
          >
            <Star className={`w-4 h-4 ${editorOnly ? "fill-white" : ""}`} />
            <span className="hidden md:inline">Editor's Choice</span>
            <span className="md:hidden">Top Picks</span>
          </button>

          {/* Result count */}
          <span className="hidden lg:block text-xs text-white/35 ml-auto font-medium whitespace-nowrap">
            {filtered.length} / {adventures.length}
          </span>

          {/* Clear */}
          {(activeFilterCount > 0 || search) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

          {/* Compass.AI panel */}
          {aiOpen && (
            <div className="border-t border-white/10" style={{ background: "var(--bg-page)" }}>
              <div className="max-w-4xl mx-auto px-5 lg:px-8 py-4">
                <div
                  className="rounded-2xl overflow-hidden shadow-[0_0_40px_-8px_rgba(0,0,0,0.5)] border"
                  style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5 border-b"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <Compass className="w-3.5 h-3.5 text-[#ff5100]" strokeWidth={2} />
                      <span className="text-[11px] font-bold tracking-wide" style={{ color: "var(--text-secondary)" }}>
                        Compass.AI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ color: "var(--text-tertiary)", background: "var(--bg-page)", border: "1px solid var(--border-subtle)" }}>
                        Powered by Groq
                      </span>
                      {aiMessages.length > 0 && (
                        <button
                          onClick={() => { setAiMessages([]); setAiInput(""); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:bg-white/5"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          New chat
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conversation */}
                  <div
                    ref={aiChatRef}
                    className="overflow-y-auto"
                    style={{ minHeight: 80, maxHeight: aiMessages.length > 0 ? 420 : "auto" }}
                  >
                    {/* Empty state */}
                    {aiMessages.length === 0 && (
                      <div className="px-5 py-6 flex flex-col items-center gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>
                          Try asking
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {AI_SUGGESTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => sendAi(s)}
                              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all hover:border-[#ff5100]/50 hover:text-[#ff5100] hover:bg-[#ff5100]/5"
                              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-page)" }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {aiMessages.length > 0 && (
                      <div className="p-4 space-y-4">
                        {aiMessages.map((msg, i) => (
                          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                              <div className="shrink-0 w-6 h-6 rounded-lg bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center mt-0.5">
                                <Compass className="w-3 h-3 text-[#ff5100]" strokeWidth={2} />
                              </div>
                            )}
                            <div className={`space-y-2.5 ${msg.role === "assistant" ? "flex-1 min-w-0" : "max-w-[75%]"}`}>
                              {msg.content && (
                                <div
                                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === "user" ? "text-white font-medium rounded-tr-sm" : "rounded-tl-sm border"
                                  }`}
                                  style={
                                    msg.role === "user"
                                      ? { background: "#ff5100" }
                                      : { background: "var(--bg-surface-2,#141b28)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }
                                  }
                                >
                                  {msg.content}
                                </div>
                              )}
                              {msg.cards && msg.cards.length > 0 && (
                                <ExploreAiCards cards={msg.cards.slice(0, 2)} recommendations={msg.recommendations} />
                              )}
                            </div>
                          </div>
                        ))}
                        {aiLoading && (
                          <div className="flex gap-2.5 justify-start">
                            <div className="shrink-0 w-6 h-6 rounded-lg bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center">
                              <Compass className="w-3 h-3 text-[#ff5100]" strokeWidth={2} />
                            </div>
                            <div
                              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm border"
                              style={{ background: "var(--bg-surface-2,#141b28)", borderColor: "var(--border-subtle)" }}
                            >
                              {[0,1,2].map((d) => (
                                <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#ff5100]/60 animate-bounce"
                                  style={{ animationDelay: `${d * 0.15}s`, animationDuration: "0.8s" }} />
                              ))}
                            </div>
                          </div>
                        )}
                        <div ref={aiBottomRef} />
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t p-3 flex items-center gap-2" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}>
                    <div
                      className="flex items-center gap-2 flex-1 rounded-xl px-3.5 border transition-all focus-within:border-[#ff5100]/40"
                      style={{ background: "var(--bg-page)", borderColor: "var(--border-default)" }}
                    >
                      <Compass className="w-3.5 h-3.5 text-[#ff5100]/50 shrink-0" />
                      <input
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !aiLoading && sendAi()}
                        placeholder={aiMessages.length > 0 ? "Refine or ask something new…" : "Ask Compass.AI…"}
                        className="flex-1 bg-transparent text-sm py-2.5 outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                    </div>
                    <button
                      onClick={() => sendAi()}
                      disabled={!aiInput.trim() || aiLoading}
                      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-[#ff5100] text-white disabled:opacity-25 hover:bg-[#ff7d47] active:scale-95 transition-all shadow-lg shadow-[#ff5100]/20"
                    >
                      {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Filter panel */}
          {filtersOpen && (
            <div className="border-t border-white/10 t-bg-page px-6 lg:px-8 py-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-8">

                  {/* Region */}
                    <div className="col-span-2 lg:col-span-3">
                      <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">
                        Region
                      </h3>
                      {(() => {
                          const regionGroups: { name: Region; subRegions: string[] }[] = [
                            {
                              name: "Himalayas",
                              subRegions: ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "Arunachal Pradesh", "Nepal", "Bhutan"],
                            },
                            {
                                name: "Western Ghats",
                              subRegions: ["Kerala", "Karnataka", "Goa", "Maharashtra"],
                              },
                              {
                                    name: "Eastern Ghats",
                                subRegions: ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka"],
                              },
                              {
                                name: "Desert",
                                  subRegions: ["Rajasthan", "Gujarat"],
                              },
                            {
                              name: "Coast",
                              subRegions: ["Maharashtra", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"],
                            },
                            {
                              name: "Islands",
                              subRegions: ["Andaman & Nicobar", "Lakshadweep"],
                            },
                                {
                                  name: "Northeast",
                                subRegions: ["Nagaland", "Manipur", "Meghalaya", "Mizoram", "Assam", "Arunachal Pradesh", "Sikkim"],
                              },
                              {
                                name: "Urban",
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
                                         isExpanded || hasSelected 
                                           ? "bg-[#ff5100] text-white border-[#ff5100]" 
                                           : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                       }`}
                                     >
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
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="flex flex-wrap gap-2">
                                {rg.subRegions.map((sr) => {
                                  const isSelected = selectedSubRegions.includes(sr);
                                  return (
                                    <button
                                      key={sr}
                                      onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        isSelected 
                                          ? "bg-[#ff5100] text-white" 
                                          : "bg-white/10 text-white/70 hover:bg-white/20"
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

                  {/* Adventure type */}
                  <div className="col-span-2 lg:col-span-3">
                    <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">
                      Adventure Type
                    </h3>
                    {(() => {
                            const categories = [
                                {
                                  label: "Land",
                                  types: ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Motorcycling", "Cycling", "Jeep Safari", "Caving", "Urban Adventure"],
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
                                          isExpanded || hasSelected 
                                            ? "bg-[#ff5100] text-white border-[#ff5100]" 
                                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
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

                          {/* Expanded type chips */}
                            {expandedCategory && (() => {
                              const cat = categories.find(c => c.label === expandedCategory)!;
                              return (
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
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
                                                : "bg-white/10 text-white/70 hover:bg-white/20"
                                            }`}
                                          >
                                            <span className="flex-shrink-0 opacity-80">
                                              {ADVENTURE_TYPE_ICONS[type]?.(11)}
                                            </span>
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

                {/* Best Season */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">
                    Best Season
                  </h3>
                  <div className="flex flex-col gap-2">
                      {/* Season buttons row */}
                        <div className="flex flex-wrap gap-2">
                          {seasons.map(({ label, months: sMonths }) => {
                            const isExpanded = expandedSeason === label;
                            const hasSelected = sMonths.some((m) => selectedMonths.includes(m));
                            const selectedCount = sMonths.filter((m) => selectedMonths.includes(m)).length;
                            return (
                                <button
                                  key={label}
                                  onClick={() => setExpandedSeason(isExpanded ? null : label)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                    isExpanded || hasSelected 
                                      ? "bg-[#ff5100] text-white border-[#ff5100]" 
                                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                  }`}
                                >
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
                        return (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="flex flex-wrap gap-2">
                              {seasons.find((s) => s.label === expandedSeason)!.months.map((m) => (
                                <button
                                  key={m}
                                  onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    selectedMonths.includes(m) 
                                      ? "bg-[#ff5100] text-white" 
                                      : "bg-white/10 text-white/70 hover:bg-white/20"
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
                        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">Difficulty</h3>
                        <div className="flex flex-wrap gap-2">
                          {(["Easy", "Moderate", "Hard", "Advanced", "Extreme"] as Difficulty[]).map((val) => {
                              const isSelected = selectedDifficulties.includes(val);
                              const activeClass = difficultyStyle[val] || "bg-[#ff5100] text-white";
                              return (
                                <button 
                                  key={val} 
                                  onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    isSelected 
                                      ? `${activeClass} border-transparent` 
                                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 border"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">Duration</h3>
                            <div className="flex flex-wrap gap-2">
                              {([
                                { val: "Weekend",  label: "Weekend",  idle: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                                { val: "3–5 days", label: "3–5 days", idle: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                                { val: "7+ days",  label: "7+ days",  idle: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                              ] as { val: Duration; label: string; idle: string; active: string }[]).map(({ val, label, idle, active }) => (
                                <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDurations.includes(val) ? active : idle}`}>
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                            <div>
                              <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">Group Size</h3>
                              <div className="flex flex-nowrap overflow-x-auto pb-1 gap-2 no-scrollbar">
                                {([
                                  { val: "Solo",             idle: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                                  { val: "Small group (2–6)", idle: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                                  { val: "Large group (6+)",  idle: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 border", active: "bg-[#ff5100] text-white border border-[#ff5100]" },
                                ] as { val: GroupSize; idle: string; active: string }[]).map(({ val, idle, active }) => (
                                  <button key={val} onClick={() => toggle(selectedGroupSizes, val, setSelectedGroupSizes)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${selectedGroupSizes.includes(val) ? active : idle}`}>
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="col-span-2 lg:col-span-3">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40">Price Range</h3>
                            <span className="text-xs font-semibold text-[#ff5100]">
                              {priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX
                                ? "Any price"
                                : `₹${(priceRange[0]/1000).toFixed(0)}k – ₹${(priceRange[1]/1000).toFixed(0)}k`}
                            </span>
                          </div>
                          <div className="px-1">
                            {/* Dual range slider — two stacked inputs */}
                            <div className="relative h-5 flex items-center">
                              {/* Track background */}
                              <div className="absolute inset-x-0 h-1 rounded-full bg-white/10" />
                              {/* Filled track */}
                              <div
                                className="absolute h-1 rounded-full bg-[#ff5100]"
                                style={{
                                  left: `${(priceRange[0] / PRICE_MAX) * 100}%`,
                                  right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%`,
                                }}
                              />
                              <input
                                type="range"
                                min={PRICE_MIN}
                                max={PRICE_MAX}
                                step={5000}
                                value={priceRange[0]}
                                onChange={(e) => {
                                  const v = Math.min(Number(e.target.value), priceRange[1] - 5000);
                                  setPriceRange([v, priceRange[1]]);
                                }}
                                className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ff5100] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#ff5100] [&::-moz-range-track]:bg-transparent"
                                style={{ zIndex: priceRange[0] > PRICE_MAX * 0.9 ? 5 : 3 }}
                              />
                              <input
                                type="range"
                                min={PRICE_MIN}
                                max={PRICE_MAX}
                                step={5000}
                                value={priceRange[1]}
                                onChange={(e) => {
                                  const v = Math.max(Number(e.target.value), priceRange[0] + 5000);
                                  setPriceRange([priceRange[0], v]);
                                }}
                                className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ff5100] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#ff5100] [&::-moz-range-track]:bg-transparent"
                                style={{ zIndex: 4 }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-white/30 font-medium">
                              <span>₹0</span>
                              <span>₹50k</span>
                              <span>₹1L</span>
                              <span>₹1.5L</span>
                              <span>₹2L+</span>
                            </div>
                          </div>
                        </div>

                        {/* ACE Filters */}
                        <div className="col-span-2 lg:col-span-3">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/40">ACE Difficulty</h3>
                            <a href="/ace" target="_blank" className="text-[10px] text-white/25 hover:text-[#ff5100] transition-colors">What is ACE?</a>
                          </div>
                          {!userProfile ? (
                            <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/3">
                              <div className="w-9 h-9 rounded-xl bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center shrink-0">
                                <Compass className="w-4 h-4 text-[#ff5100]/60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/60 text-xs font-medium">No ACE profile yet</p>
                                <p className="text-white/30 text-[11px] mt-0.5">Take the assessment to filter by your capability level</p>
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
                                { key: "ready" as AceCategory, label: "Ready Now", desc: "Matches your current level", color: "#4ade80", bg: "#4ade8015" },
                                { key: "stretch" as AceCategory, label: "Stretch Challenge", desc: "Slightly above your level", color: "#f59e0b", bg: "#f59e0b15" },
                                { key: "out-of-range" as AceCategory, label: "Out of Range", desc: "Significantly beyond current ability", color: "#f43f5e", bg: "#f43f5e15" },
                              ]).map(({ key, label, desc, color, bg }) => {
                                const isActive = aceCategory === key;
                                return (
                                  <button
                                    key={key}
                                    onClick={() => setAceCategory(isActive ? null : key)}
                                    className="text-left p-3.5 rounded-2xl border transition-all"
                                    style={{
                                      background: isActive ? bg : "rgba(255,255,255,0.03)",
                                      borderColor: isActive ? color : "rgba(255,255,255,0.08)",
                                    }}
                                  >
                                    <p className="text-xs font-bold mb-0.5" style={{ color: isActive ? color : "rgba(255,255,255,0.6)" }}>{label}</p>
                                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
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
          <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-4 flex flex-wrap gap-2">
            {selectedTypes.map((t) => (
              <span
                key={t}
                onClick={() => toggle(selectedTypes, t, setSelectedTypes)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                <span className="flex-shrink-0">{ADVENTURE_TYPE_ICONS[t]?.(11)}</span>
                {t} <X className="w-3 h-3" />
              </span>
            ))}
             {selectedRegions.map((r) => (
                <span
                  key={r}
                  onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                  className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
                >
                  {r} <X className="w-3 h-3" />
                </span>
              ))}
              {selectedSubRegions.map((sr) => (
                <span
                  key={sr}
                  onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                  className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
                >
                  {sr} <X className="w-3 h-3" />
                </span>
              ))}
            {selectedDifficulties.map((d) => (
              <span
                key={d}
                onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                {d} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedDurations.map((d) => (
              <span
                key={d}
                onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                {d} <X className="w-3 h-3" />
              </span>
            ))}
            {selectedMonths.map((m) => (
                <span
                  key={m}
                  onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                  className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
                >
                  {m} <X className="w-3 h-3" />
                </span>
              ))}
            {selectedGroupSizes.map((g) => (
              <span
                key={g}
                onClick={() => toggle(selectedGroupSizes, g, setSelectedGroupSizes)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                {g} <X className="w-3 h-3" />
              </span>
            ))}
            {priceActive && (
              <span
                onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                ₹{(priceRange[0]/1000).toFixed(0)}k – ₹{(priceRange[1]/1000).toFixed(0)}k <X className="w-3 h-3" />
              </span>
            )}
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


      {/* Shared wishlist banner */}
      {sharedAdventures && sharedAdventures.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">
          <div className="rounded-2xl p-5 mb-2" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.25)" }}>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-4 h-4 fill-[#ff5100] text-[#ff5100]" />
              <span className="text-[#ff5100] text-sm font-semibold">Shared Wishlist — {sharedAdventures.length} adventure{sharedAdventures.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {sharedAdventures.map(a => (
                <Link key={a.id} href={`/experiences/${a.slug}`} className="group flex-none w-48 rounded-xl overflow-hidden transition-transform hover:-translate-y-0.5" style={{ border: "1px solid rgba(255,81,0,0.2)" }}>
                  <div className="relative h-28">
                    <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <div className="p-2.5" style={{ background: "rgba(255,81,0,0.06)" }}>
                    <p className="text-white text-xs font-semibold leading-snug line-clamp-1 group-hover:text-[#ff5100] transition-colors">{a.name}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{a.type} · {a.state}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
              <div className="text-6xl mb-5">🗺️</div>
              <h3 className="text-white text-2xl font-bold mb-2 uppercase tracking-tight">No adventures found</h3>
              <p className="text-white/40 mb-7 max-w-xs mx-auto leading-relaxed">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={clearAll}
                className="bg-[#ff5100] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-[#ff7d47] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 uppercase tracking-wider"
              >
                Clear all filters
              </button>
            </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {pagedResults.map((adventure) => (
                <div key={adventure.id} id={`card-${adventure.slug}`}>
                  <AdventureCard adventure={adventure} fromPage={currentPage} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isActive = page === currentPage;
                    const isNearby = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                    if (!isNearby) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="text-white/30 px-1">…</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-[#ff5100] text-white"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-center text-white/25 text-xs mt-4 tracking-wide">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} adventures
            </p>
          </>
        )}
      </div>

        {/* Compare Adventures — compact */}
        <CompareAdventures />

        {/* Adventure Map — full-width cinematic section */}
        <div className="relative overflow-hidden" style={{ background: "#060e08" }}>

          {/* Top edge separator */}
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(126,200,138,0.25) 30%, rgba(126,200,138,0.5) 50%, rgba(126,200,138,0.25) 70%, transparent 100%)" }} />

          {/* Deep atmospheric background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Base dark green */}
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 80% at 60% 50%, #0d2114 0%, #060e08 65%)" }} />
            {/* Left glow */}
            <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(126,200,138,0.09) 0%, transparent 65%)" }} />
            {/* Right deep glow */}
            <div className="absolute -right-20 bottom-0 w-[600px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(126,200,138,0.05) 0%, transparent 60%)" }} />
          </div>

          {/* Fine dot-grid */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, rgba(126,200,138,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          {/* Contour lines (topographic feel) */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 55px, rgba(126,200,138,0.6) 55px, rgba(126,200,138,0.6) 56px)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
            <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">

              {/* LEFT — copy */}
              <div>
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full" style={{ background: "rgba(126,200,138,0.07)", border: "1px solid rgba(126,200,138,0.18)" }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ec88a] opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#7ec88a]" />
                  </span>
                  <span className="text-[#7ec88a] text-[10px] font-bold tracking-[0.22em] uppercase">Adventure Map</span>
                </div>

                {/* Headline */}
                <h2 className="text-white font-black tracking-tight leading-none mb-5" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}>
                  India. Every<br />
                  <span style={{ color: "#7ec88a" }}>adventure,</span><br />
                  one map.
                </h2>

                <p className="text-white/45 text-base leading-relaxed max-w-md mb-8">
                  Every trail, summit, coast, and canyon pinned with precision. Filter by type, cluster by region, tap any pin to explore in full detail.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mb-10">
                  {[
                    { icon: Layers, label: "Filter by adventure type" },
                    { icon: MapPin, label: "Cluster by region" },
                    { icon: Navigation, label: "Real coordinates" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/50"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Icon className="w-3 h-3 text-[#7ec88a]" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Region stats row */}
                <div className="grid grid-cols-4 gap-3 mb-10">
                  {(["Himalayas", "Western Ghats", "Coast", "Islands"] as const).map((region) => {
                    const count = adventures.filter(a => a.region === region).length;
                    const labels: Record<string, string> = { "Himalayas": "Himalayas", "Western Ghats": "W. Ghats", "Coast": "Coast", "Islands": "Islands" };
                    return (
                      <div key={region} className="rounded-xl p-3 text-center" style={{ background: "rgba(126,200,138,0.05)", border: "1px solid rgba(126,200,138,0.1)" }}>
                        <div className="text-[#7ec88a] text-xl font-black leading-none mb-1">{count}</div>
                        <div className="text-white/30 text-[10px] font-semibold">{labels[region]}</div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <Link
                  href="/map"
                  className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #7ec88a 0%, #5ab568 100%)", color: "#071209", boxShadow: "0 8px 32px rgba(126,200,138,0.35), 0 0 0 1px rgba(126,200,138,0.3)" }}
                >
                  <MapIcon className="w-4 h-4" />
                  Open the Map
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* RIGHT — visual map display */}
              <div className="relative hidden lg:block">
                {/* Card frame */}
                <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg, #0c1e10 0%, #081409 100%)", border: "1px solid rgba(126,200,138,0.15)", boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(126,200,138,0.1)" }}>

                  {/* Card header bar */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(126,200,138,0.12)" }}>
                        <MapIcon className="w-3 h-3 text-[#7ec88a]" />
                      </div>
                      <span className="text-white/50 text-[11px] font-semibold">trailtotides.com/map</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-[#7ec88a]/60" />
                    </div>
                  </div>

                  {/* Map visual area */}
                  <div className="relative" style={{ height: 340 }}>
                    {/* Dark map bg */}
                    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, #0f2416 0%, #080f0a 100%)" }} />
                    {/* Dot grid inside map */}
                    <div className="absolute inset-0 opacity-[0.06]"
                      style={{ backgroundImage: "radial-gradient(circle, rgba(126,200,138,1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                    {/* India SVG silhouette (abstract simplified) */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                      <path d="M120 20 L160 18 L195 30 L215 55 L230 80 L238 110 L240 145 L235 175 L220 205 L205 230 L190 255 L175 275 L162 295 L150 315 L138 295 L124 275 L108 255 L92 230 L76 205 L60 175 L55 145 L58 110 L68 80 L80 55 L100 35 Z" fill="#7ec88a" />
                    </svg>

                    {/* Route lines between pins */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M85 58 Q130 90 155 130" stroke="#7ec88a" strokeWidth="0.8" strokeDasharray="4 3" />
                      <path d="M155 130 Q185 155 200 195" stroke="#7ec88a" strokeWidth="0.8" strokeDasharray="4 3" />
                      <path d="M200 195 Q230 215 265 230" stroke="#7ec88a" strokeWidth="0.8" strokeDasharray="4 3" />
                      <path d="M155 130 Q115 165 90 200" stroke="#7ec88a" strokeWidth="0.6" strokeDasharray="3 4" />
                      <path d="M310 80 Q270 110 265 150" stroke="#7ec88a" strokeWidth="0.6" strokeDasharray="3 4" />
                    </svg>

                    {/* Adventure pins */}
                    {[
                      { x: "20%", y: "17%", label: "Ladakh", type: "Trek", pulse: true },
                      { x: "37%", y: "38%", label: "Spiti", type: "Cycling", pulse: false },
                      { x: "48%", y: "55%", label: "Coorg", type: "Trek", pulse: true },
                      { x: "62%", y: "48%", label: "Meghalaya", type: "Kayak", pulse: false },
                      { x: "76%", y: "24%", label: "Zanskar", type: "Trek", pulse: false },
                      { x: "28%", y: "72%", label: "Kerala", type: "Surf", pulse: true },
                      { x: "55%", y: "78%", label: "Andamans", type: "Dive", pulse: false },
                      { x: "68%", y: "65%", label: "Arunachal", type: "Trek", pulse: false },
                    ].map((pin, i) => (
                      <div key={i} className="absolute" style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -50%)" }}>
                        {pin.pulse && (
                          <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping" style={{ background: "rgba(126,200,138,0.2)", animationDuration: `${2 + i * 0.4}s` }} />
                        )}
                        <div className="relative group cursor-pointer">
                          <div className="w-3 h-3 rounded-full border-2 border-[#7ec88a] shadow-lg"
                            style={{ background: "rgba(126,200,138,0.35)", boxShadow: "0 0 8px rgba(126,200,138,0.6), 0 0 0 3px rgba(126,200,138,0.1)" }} />
                          {/* Hover tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap px-2 py-1 rounded-lg text-[10px] font-bold z-10"
                            style={{ background: "#0d2114", border: "1px solid rgba(126,200,138,0.3)", color: "#7ec88a" }}>
                            {pin.label}
                            <span className="text-white/40 ml-1">· {pin.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Bottom stat bar inside card */}
                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2.5" style={{ background: "linear-gradient(0deg, rgba(6,14,8,0.95) 0%, transparent 100%)" }}>
                      <span className="text-[#7ec88a] text-[11px] font-black">{adventures.length} adventures</span>
                      <span className="text-white/25 text-[10px]">8 regions · {new Set(adventures.map(a => a.type)).size} types</span>
                    </div>
                  </div>
                </div>

                {/* Floating accent card — top right */}
                <div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl z-10" style={{ background: "#0d2114", border: "1px solid rgba(126,200,138,0.25)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#7ec88a]" />
                    <span className="text-white/60 text-[10px] font-semibold">Live pins</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7ec88a] animate-pulse" />
                  </div>
                </div>

                {/* Floating accent card — bottom left */}
                <div className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl z-10" style={{ background: "#0d2114", border: "1px solid rgba(126,200,138,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3 h-3 text-[#7ec88a]" />
                    <span className="text-white/60 text-[10px] font-semibold">Filter by type</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom edge */}
          <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(126,200,138,0.15) 50%, transparent 100%)" }} />
        </div>

        <Footer />
      </div>
  );
}

// ─── Compass.AI adventure cards (explore panel) ────────────────────────────────

function ExploreAiCards({
  cards,
  recommendations,
}: {
  cards: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}) {
  const colClass = cards.length === 1 ? "grid-cols-1 max-w-xs" : "grid-cols-2";

  return (
    <div className={`grid gap-2.5 ${colClass}`}>
      {cards.map((card, ci) => {
        const rec = recommendations?.find((r) => r.slug === card.slug);
        return (
          <Link
            key={ci}
            href={`/experiences/${card.slug}`}
            className="group flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff5100]/30 hover:shadow-xl hover:shadow-[#ff5100]/5"
            style={{ background: "var(--bg-page)", borderColor: "var(--border-subtle)" }}
          >
            {/* Hero image */}
            <div className="relative h-28 overflow-hidden shrink-0">
              <Image
                src={card.heroImage}
                alt={card.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, 300px"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#ff5100] text-white text-[9px] font-black uppercase tracking-wider">
                  {card.type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-[9px] font-semibold flex items-center gap-0.5 border border-white/10">
                  <MapPin className="w-2 h-2" />{card.state}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-2.5 flex-1 flex flex-col gap-1.5">
              <h4 className="text-[12px] font-bold leading-snug group-hover:text-[#ff5100] transition-colors t-text line-clamp-2">
                {card.name}
              </h4>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="flex items-center gap-1 text-[10px] t-text-3">
                  <BarChart2 className="w-2.5 h-2.5" />{card.difficulty}
                </span>
                {card.durationDays && (
                  <span className="flex items-center gap-1 text-[10px] t-text-3">
                    <Clock className="w-2.5 h-2.5" />{card.durationDays}
                  </span>
                )}
              </div>
              {rec?.reason && (
                <p className="text-[10px] leading-relaxed t-text-3 italic pt-1.5 border-t mt-auto" style={{ borderColor: "var(--border-subtle)" }}>
                  {rec.reason}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-2.5 py-2 border-t flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5100]">View</span>
              <ArrowRight className="w-3 h-3 text-[#ff5100] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
