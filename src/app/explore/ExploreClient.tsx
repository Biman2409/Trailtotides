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
import type { AdventureType, Region, Difficulty, Duration, Month, Adventure } from "@/lib/data";
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



export default function ExploreClient() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
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
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
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
    }, [search, selectedTypes, selectedRegions, selectedSubRegions, selectedDifficulties, selectedDurations, selectedMonths, priceRange, aceCategory, userProfile, editorOnly]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [search, selectedTypes, selectedRegions, selectedSubRegions, selectedDifficulties, selectedDurations, selectedMonths, priceRange, aceCategory]);

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
    (priceActive ? 1 : 0) +
    (aceCategory !== null ? 1 : 0);

  function clearAll() {
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    setSelectedDifficulties([]);
    setSelectedDurations([]);
    setSelectedMonths([]);
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
          <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search adventures..."
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
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative overflow-hidden"
            style={{
              background: aiOpen
                ? "linear-gradient(135deg,rgba(255,81,0,0.25),rgba(255,125,71,0.15))"
                : "linear-gradient(135deg,rgba(255,81,0,0.18),rgba(255,125,71,0.08))",
              border: `1px solid ${aiOpen ? "rgba(255,81,0,0.55)" : "rgba(255,81,0,0.28)"}`,
              color: aiOpen ? "#ff7d47" : "rgba(255,125,71,0.85)",
              boxShadow: aiOpen ? "0 0 14px rgba(255,81,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <Compass className={`w-3.5 h-3.5 ${aiOpen ? "text-[#ff5100]" : "text-[#ff7d47]/70"}`} />
            <span className="hidden sm:inline tracking-wide">Compass.AI</span>
            <span className="sm:hidden tracking-wide">AI</span>
            {aiOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
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
            <div className="border-t" style={{ borderColor: "rgba(255,81,0,0.12)", background: "rgba(4,7,14,0.98)", backdropFilter: "blur(16px)" }}>
              <div className="max-w-4xl mx-auto px-5 lg:px-8 py-5">
                {/* HUD frame */}
                <div
                  className="rounded-2xl overflow-hidden relative"
                  style={{
                    background: "linear-gradient(160deg, rgba(255,81,0,0.04) 0%, rgba(6,9,18,0.95) 40%)",
                    border: "1px solid rgba(255,81,0,0.18)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 4px 40px rgba(255,81,0,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl" style={{ borderColor: "rgba(255,81,0,0.4)" }} />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-xl" style={{ borderColor: "rgba(255,81,0,0.4)" }} />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-xl" style={{ borderColor: "rgba(255,81,0,0.4)" }} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl" style={{ borderColor: "rgba(255,81,0,0.4)" }} />

                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ background: "rgba(255,81,0,0.05)", borderBottom: "1px solid rgba(255,81,0,0.1)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="w-1 h-1 rounded-full bg-emerald-400/40" />
                      </div>
                      <div className="w-px h-3.5 bg-white/10" />
                      <Compass className="w-3.5 h-3.5 text-[#ff5100]" strokeWidth={2.5} />
                      <span className="text-[11px] font-black tracking-[0.18em] uppercase text-white/70">Compass</span>
                      <span className="text-[11px] font-black tracking-[0.1em] text-[#ff5100]">.AI</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded" style={{ color: "rgba(255,81,0,0.5)", background: "rgba(255,81,0,0.07)", border: "1px solid rgba(255,81,0,0.15)" }}>
                        Groq · LLM
                      </span>
                      {aiMessages.length > 0 && (
                        <button
                          onClick={() => { setAiMessages([]); setAiInput(""); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:bg-white/5 text-white/25 hover:text-white/50"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Reset
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
                      <div className="px-5 py-7 flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.2)" }}>
                            <Compass className="w-4 h-4 text-[#ff5100]" strokeWidth={2} />
                          </div>
                          <p className="text-[9px] font-black tracking-[0.25em] uppercase text-white/20 mt-1">Suggested queries</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {AI_SUGGESTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => sendAi(s)}
                              className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                              style={{
                                borderColor: "rgba(255,81,0,0.2)",
                                color: "rgba(255,255,255,0.45)",
                                background: "rgba(255,81,0,0.04)",
                                border: "1px solid rgba(255,81,0,0.15)",
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,81,0,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#ff7d47"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,81,0,0.1)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,81,0,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,81,0,0.04)"; }}
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
                              <div className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5" style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.22)" }}>
                                <Compass className="w-3 h-3 text-[#ff5100]" strokeWidth={2} />
                              </div>
                            )}
                            <div className={`space-y-2.5 ${msg.role === "assistant" ? "flex-1 min-w-0" : "max-w-[75%]"}`}>
                              {msg.content && (
                                <div
                                  className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                                    msg.role === "user" ? "text-white font-semibold rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"
                                  }`}
                                  style={
                                    msg.role === "user"
                                      ? { background: "linear-gradient(135deg,#ff5100,#ff7d47)", boxShadow: "0 2px 12px rgba(255,81,0,0.25)" }
                                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)" }
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
                            <div className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.22)" }}>
                              <Compass className="w-3 h-3 text-[#ff5100]" strokeWidth={2} />
                            </div>
                            <div
                              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
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
                  <div className="p-3 flex items-center gap-2.5" style={{ borderTop: "1px solid rgba(255,81,0,0.1)", background: "rgba(255,81,0,0.03)" }}>
                    <div
                      className="flex items-center gap-2.5 flex-1 rounded-xl px-3.5 transition-all focus-within:shadow-[0_0_0_1px_rgba(255,81,0,0.35)]"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <Compass className="w-3.5 h-3.5 text-[#ff5100]/40 shrink-0" />
                      <input
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !aiLoading && sendAi()}
                        placeholder={aiMessages.length > 0 ? "Refine or ask something new…" : "Ask Compass.AI anything about adventures…"}
                        className="flex-1 bg-transparent text-[13px] py-2.5 outline-none text-white/80 placeholder-white/20"
                      />
                    </div>
                    <button
                      onClick={() => sendAi()}
                      disabled={!aiInput.trim() || aiLoading}
                      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl text-white disabled:opacity-20 active:scale-95 transition-all"
                      style={{ background: "linear-gradient(135deg,#ff5100,#ff7d47)", boxShadow: "0 2px 12px rgba(255,81,0,0.3)" }}
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
            <div className="border-t border-white/8" style={{ background: "rgba(6,9,18,0.97)", backdropFilter: "blur(12px)" }}>
              <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 space-y-4">

                {/* ── Region ── */}
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
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-2.5 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Region</span>
                        {(selectedRegions.length > 0 || selectedSubRegions.length > 0) && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>
                            {selectedRegions.length + selectedSubRegions.length}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {regionGroups.map((rg) => {
                            const isExpanded = expandedRegion === rg.name;
                            const hasSelected = selectedRegions.includes(rg.name) || rg.subRegions.some(sr => selectedSubRegions.includes(sr));
                            const subCount = rg.subRegions.filter(sr => selectedSubRegions.includes(sr)).length;
                            return (
                              <button
                                key={rg.name}
                                onClick={() => setExpandedRegion(isExpanded ? null : rg.name)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                                style={{
                                  background: isExpanded || hasSelected ? "#ff5100" : "rgba(255,255,255,0.05)",
                                  color: isExpanded || hasSelected ? "#fff" : "rgba(255,255,255,0.55)",
                                  border: `1px solid ${isExpanded || hasSelected ? "#ff5100" : "rgba(255,255,255,0.08)"}`,
                                }}
                              >
                                {rg.name}
                                {subCount > 0 && (
                                  <span className="text-[8px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "rgba(255,255,255,0.25)" }}>{subCount}</span>
                                )}
                                <ChevronDown className={`w-2.5 h-2.5 opacity-60 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedRegion && (() => {
                          const rg = regionGroups.find(r => r.name === expandedRegion)!;
                          return (
                            <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                              {rg.subRegions.map((sr) => {
                                const isSelected = selectedSubRegions.includes(sr);
                                return (
                                  <button
                                    key={sr}
                                    onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                                    style={{
                                      background: isSelected ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.04)",
                                      color: isSelected ? "#ff7d47" : "rgba(255,255,255,0.45)",
                                      border: `1px solid ${isSelected ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.06)"}`,
                                    }}
                                  >
                                    {sr}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}

                {/* ── Genre + Season (combined row) ── */}
                {(() => {
                  const genreGroups: { label: string; color: string; types: AdventureType[] }[] = [
                    { label: "Earth", color: "#a16207", types: ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Caving", "Motorcycling", "Cycling", "Jeep Safari", "Urban Adventure"] },
                    { label: "Water", color: "#0369a1", types: ["Diving", "Kayaking"] },
                    { label: "Snow",  color: "#6366f1", types: ["Skiing", "Ice Skating"] },
                    { label: "Air",   color: "#0891b2", types: ["Paragliding", "Hot Air Balloon"] },
                  ];
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {/* Genre */}
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex items-center gap-2 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Genre</span>
                          {selectedTypes.length > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedTypes.length}</span>}
                        </div>
                        <div className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {genreGroups.map((grp) => {
                              const isExpanded = expandedGenre === grp.label;
                              const groupSelected = grp.types.filter(t => selectedTypes.includes(t)).length;
                              const hasSelected = groupSelected > 0;
                              return (
                                <button
                                  key={grp.label}
                                  onClick={() => setExpandedGenre(isExpanded ? null : grp.label)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                                  style={{
                                    background: isExpanded ? `${grp.color}22` : hasSelected ? `${grp.color}18` : "rgba(255,255,255,0.05)",
                                    color: isExpanded || hasSelected ? grp.color : "rgba(255,255,255,0.5)",
                                    border: `1px solid ${isExpanded || hasSelected ? `${grp.color}50` : "rgba(255,255,255,0.08)"}`,
                                  }}
                                >
                                  {grp.label}
                                  {groupSelected > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: `${grp.color}30`, color: grp.color }}>{groupSelected}</span>}
                                  <ChevronDown className={`w-2.5 h-2.5 opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              );
                            })}
                          </div>
                          {expandedGenre && (() => {
                            const grp = genreGroups.find(g => g.label === expandedGenre)!;
                            return (
                              <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                {grp.types.map((type) => {
                                  const isSelected = selectedTypes.includes(type);
                                  return (
                                    <button
                                      key={type}
                                      onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                                      style={{
                                        background: isSelected ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.04)",
                                        color: isSelected ? "#ff7d47" : "rgba(255,255,255,0.4)",
                                        border: `1px solid ${isSelected ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.06)"}`,
                                      }}
                                    >
                                      <span className="opacity-60">{ADVENTURE_TYPE_ICONS[type]?.(10)}</span>
                                      {type}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Season */}
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex items-center gap-2 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Season</span>
                          {selectedMonths.length > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedMonths.length}</span>}
                        </div>
                        <div className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {seasons.map(({ label, months: sMonths }) => {
                              const isExpanded = expandedSeason === label;
                              const hasSelected = sMonths.some(m => selectedMonths.includes(m));
                              const selectedCount = sMonths.filter(m => selectedMonths.includes(m)).length;
                              return (
                                <button
                                  key={label}
                                  onClick={() => setExpandedSeason(isExpanded ? null : label)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                                  style={{
                                    background: isExpanded || hasSelected ? "#ff5100" : "rgba(255,255,255,0.05)",
                                    color: isExpanded || hasSelected ? "#fff" : "rgba(255,255,255,0.5)",
                                    border: `1px solid ${isExpanded || hasSelected ? "#ff5100" : "rgba(255,255,255,0.08)"}`,
                                  }}
                                >
                                  {label}
                                  {selectedCount > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "rgba(255,255,255,0.25)" }}>{selectedCount}</span>}
                                  <ChevronDown className={`w-2.5 h-2.5 opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              );
                            })}
                          </div>
                          {expandedSeason && (
                            <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                              {seasons.find(s => s.label === expandedSeason)!.months.map(m => (
                                <button
                                  key={m}
                                  onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                                  style={{
                                    background: selectedMonths.includes(m) ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.04)",
                                    color: selectedMonths.includes(m) ? "#ff7d47" : "rgba(255,255,255,0.4)",
                                    border: `1px solid ${selectedMonths.includes(m) ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.06)"}`,
                                  }}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* ── Difficulty + Duration row ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* Difficulty */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center gap-2.5 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Difficulty</span>
                    </div>
                    <div className="p-3 flex flex-wrap gap-1.5">
                      {(["Easy", "Moderate", "Hard", "Advanced", "Extreme"] as Difficulty[]).map((val) => {
                        const isSelected = selectedDifficulties.includes(val);
                        const colorMap: Record<string, string> = { Easy: "#22c55e", Moderate: "#eab308", Hard: "#f97316", Advanced: "#ef4444", Extreme: "#a855f7" };
                        const c = colorMap[val] ?? "#ff5100";
                        return (
                          <button
                            key={val}
                            onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                            style={{
                              background: isSelected ? `${c}18` : "rgba(255,255,255,0.05)",
                              color: isSelected ? c : "rgba(255,255,255,0.55)",
                              border: `1px solid ${isSelected ? `${c}40` : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center gap-2.5 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Duration</span>
                    </div>
                    <div className="p-3 flex flex-wrap gap-1.5">
                      {(["Weekend", "3–5 days", "7+ days"] as Duration[]).map((val) => {
                        const isSelected = selectedDurations.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                            style={{
                              background: isSelected ? "#ff5100" : "rgba(255,255,255,0.05)",
                              color: isSelected ? "#fff" : "rgba(255,255,255,0.55)",
                              border: `1px solid ${isSelected ? "#ff5100" : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* ── Price + ACE row ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* Price Range */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Price Range</span>
                      <span className="text-[9px] font-bold" style={{ color: priceActive ? "#ff5100" : "rgba(255,255,255,0.2)" }}>
                        {priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX ? "Any price" : `₹${(priceRange[0]/1000).toFixed(0)}k – ₹${(priceRange[1]/1000).toFixed(0)}k`}
                      </span>
                    </div>
                    <div className="px-4 pt-4 pb-3">
                      <div className="relative h-4 flex items-center">
                        <div className="absolute inset-x-0 h-0.5 rounded-full bg-white/10" />
                        <div className="absolute h-0.5 rounded-full bg-[#ff5100]" style={{ left: `${(priceRange[0] / PRICE_MAX) * 100}%`, right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%` }} />
                        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={5000} value={priceRange[0]}
                          onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 5000), priceRange[1]])}
                          className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ff5100] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#ff5100] [&::-moz-range-track]:bg-transparent"
                          style={{ zIndex: priceRange[0] > PRICE_MAX * 0.9 ? 5 : 3 }} />
                        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={5000} value={priceRange[1]}
                          onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 5000)])}
                          className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ff5100] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#ff5100] [&::-moz-range-track]:bg-transparent"
                          style={{ zIndex: 4 }} />
                      </div>
                      <div className="flex justify-between mt-2 text-[9px] text-white/20 font-medium">
                        <span>₹0</span><span>₹50k</span><span>₹1L</span><span>₹1.5L</span><span>₹2L+</span>
                      </div>
                    </div>
                  </div>

                  {/* ACE Filter */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">ACE™ Readiness</span>
                        {aceCategory && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>1</span>}
                      </div>
                      <a href="/ace" target="_blank" className="text-[9px] font-semibold transition-colors" style={{ color: "#ff5100" }}>What is ACE™?</a>
                    </div>
                    <div className="p-3">
                      {!userProfile ? (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.15)" }}>
                            <Compass className="w-3.5 h-3.5 text-[#ff5100]/50" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/50 text-[11px] font-semibold">No ACE profile yet</p>
                            <p className="text-white/25 text-[10px]">Take the assessment to filter by capability</p>
                          </div>
                          <Link href="/matchmaker" className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all" style={{ background: "#ff5100" }}>
                            Assess <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {([
                            { key: "ready" as AceCategory, label: "Ready", color: "#4ade80" },
                            { key: "stretch" as AceCategory, label: "Stretch", color: "#f59e0b" },
                            { key: "out-of-range" as AceCategory, label: "Out of Range", color: "#f43f5e" },
                          ]).map(({ key, label, color }) => {
                            const isActive = aceCategory === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setAceCategory(isActive ? null : key)}
                                className="flex-1 py-2 px-2 rounded-lg text-[11px] font-bold transition-all text-center"
                                style={{
                                  background: isActive ? `${color}15` : "rgba(255,255,255,0.04)",
                                  color: isActive ? color : "rgba(255,255,255,0.4)",
                                  border: `1px solid ${isActive ? `${color}35` : "rgba(255,255,255,0.07)"}`,
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

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

        {/* Adventure Map — strip */}
        <div className="relative mx-5 lg:mx-8 mb-8 overflow-hidden rounded-xl" style={{ background: "linear-gradient(90deg, #070e09 0%, #0a1810 60%, #070e09 100%)", border: "1px solid rgba(126,200,138,0.09)" }}>
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(126,200,138,1) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="absolute right-0 inset-y-0 w-64 pointer-events-none" style={{ background: "radial-gradient(ellipse at 100% 50%, rgba(126,200,138,0.07) 0%, transparent 70%)" }} />

          <div className="relative flex items-center gap-0 divide-x" style={{ divideColor: "rgba(126,200,138,0.07)" }}>

            {/* Label + description */}
            <div className="flex items-center gap-3 px-5 py-3.5 flex-1 min-w-0">
              <MapIcon className="w-4 h-4 shrink-0" style={{ color: "rgba(126,200,138,0.6)" }} />
              <div className="min-w-0">
                <span className="text-white/70 text-[12px] font-semibold">Adventure Map</span>
                <span className="hidden sm:inline text-white/25 text-[11px] ml-2">— every adventure in India, pinned</span>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center divide-x px-0" style={{ borderColor: "rgba(126,200,138,0.07)" }}>
              {([
                { val: adventures.length, lbl: "pins" },
                { val: new Set(adventures.map(a => a.state)).size, lbl: "regions" },
                { val: new Set(adventures.map(a => a.type)).size, lbl: "genres" },
              ]).map(({ val, lbl }) => (
                <div key={lbl} className="flex items-baseline gap-1.5 px-4 py-3.5">
                  <span className="text-[13px] font-black" style={{ color: "#7ec88a" }}>{val}</span>
                  <span className="text-[10px] text-white/25">{lbl}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-4 py-3 shrink-0">
              <Link
                href="/map"
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:brightness-110"
                style={{ background: "rgba(126,200,138,0.1)", color: "#7ec88a", border: "1px solid rgba(126,200,138,0.18)" }}
              >
                Open Map
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>
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
