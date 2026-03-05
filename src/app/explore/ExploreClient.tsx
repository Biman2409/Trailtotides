"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, Map as MapIcon, ArrowRight, Compass, Send, ChevronRight, Loader2, Zap, Activity, ShieldAlert, Trophy, Flame, Calendar, CalendarRange, History, User, Users, ChevronLeft } from "lucide-react";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { adventures } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, GroupSize, Adventure } from "@/lib/data";
import { difficultyStyle } from "@/lib/styles";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // AI chat state
  type AiMessage = { role: "user" | "assistant"; content: string; cards?: Adventure[]; recommendations?: { slug: string; name: string; reason: string }[] };
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

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [search, selectedTypes, selectedRegions, selectedSubRegions, selectedDifficulties, selectedDurations, selectedMonths, selectedGroupSizes]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedResults = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#1a1f2e] pt-28 pb-14 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Discover
        </p>

          <h1 className="text-white text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
            All Adventures
          </h1>
              <p className="text-white/45 text-lg w-full">
                Discover and compare epic adventures across Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision — for you.
              </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="sticky top-16 lg:top-20 z-40 bg-[#111820]/96 backdrop-blur-lg border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-4">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filtersOpen || activeFilterCount > 0
                    ? "bg-[#ff5100] text-white"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white text-[#ff5100] text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
              </button>
  
              {/* Compass.AI toggle */}
                  <button
                    onClick={() => { setAiOpen(!aiOpen); setFiltersOpen(false); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        aiOpen
                          ? "bg-[#ff5100] text-white"
                          : "bg-[#ff5100] text-white hover:bg-[#ff7d47]"
                      }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span className="hidden sm:inline">Compass.AI</span>
                    <span className="sm:hidden">ai</span>
                  </button>



          {/* Result count */}
          <span className="hidden md:block text-sm text-white/40 ml-auto uppercase tracking-wider font-medium">
            {filtered.length} of {adventures.length} adventures
          </span>

            {/* Clear */}
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

          {/* Compass.AI panel */}
          {aiOpen && (
            <div className="border-t border-white/10 bg-[#141920] px-6 lg:px-8 py-5">
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
                                    style={msg.role === "user" ? { background: "#ff5100" } : {}}
                                  >
                                    {msg.content}
                                  </div>
                                )}
                                {msg.cards && msg.cards.length > 0 && (
                                  <div className="grid gap-2">
                                    {msg.cards.map((card: Adventure, ci: number) => {
                                      const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                                      return (
                                        <Link
                                          key={ci}
                                          href={`/adventure/${card.slug}`}
                                          className="flex items-stretch bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/16 rounded-xl overflow-hidden transition-all group"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={card.heroImage} alt={card.name} className="w-16 h-16 object-cover flex-shrink-0" style={{ objectFit: "cover" }} />
                                            <div className="p-3 flex-1 min-w-0">
                                              <p className="text-white text-xs font-semibold tracking-tight uppercase">{card.name}</p>
                                              <p className="text-white/40 text-xs mt-0.5 tracking-wide uppercase">{card.state} · {card.type} · {card.difficulty}</p>
                                              {rec?.reason && <p className="text-[#ff5100] text-xs mt-1 line-clamp-1">{rec.reason}</p>}
                                            </div>
                                          <div className="flex items-center pr-3">
                                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#ff5100] transition-colors" />
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
                                  <Loader2 className="w-3.5 h-3.5 text-[#ff5100] animate-spin" />
                                    <span className="text-white/50 text-sm">Compass.AI is finding adventures…</span>
                                    </div>
                                  </div>
                                )}
      
                              <div ref={aiBottomRef} />
                            </div>
                          )}
                          {aiMessages.length === 0 && (
                            <div className="px-4 pt-4 pb-3 bg-white/2">
                              <p className="text-white/20 text-[10px] uppercase tracking-widest mb-3 font-semibold">Try asking Compass.AI</p>
    
                            <div className="flex flex-wrap gap-2">
                              {AI_SUGGESTIONS.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => sendAi(s)}
                                  className="text-xs border border-white/10 text-white/50 hover:text-white hover:border-[#ff5100]/50 hover:bg-[#ff5100]/5 px-3 py-1.5 rounded-full transition-all"
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
                                  placeholder="Ask Compass.AI..."
                                  className="flex-1 bg-white/6 border border-white/8 text-white placeholder-white/30 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#ff5100]/50 transition-all"
                                />

                      <button
                        onClick={() => sendAi()}
                        disabled={!aiInput.trim() || aiLoading}
                        className="disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
                        style={{ background: "#ff5100" }}
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline uppercase tracking-wider">Search</span>
                      </button>
                    </div>

                </div>
              </div>
            </div>
          )}

        {/* Filter panel */}
          {filtersOpen && (
            <div className="border-t border-white/10 bg-[#111820] px-6 lg:px-8 py-6 max-h-[60vh] overflow-y-auto no-scrollbar">
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
                              subRegions: ["Maharashtra (Konkan)", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"],
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
                                  types: ["Trekking", "Mountaineering", "Rock Climbing", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"],
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
                          {(["Beginner", "Intermediate", "Advanced", "Expert", "Extreme"] as Difficulty[]).map((val) => {
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
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
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
          </div>
        )}


      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-28">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedResults.map((adventure) => (
                <AdventureCard key={adventure.id} adventure={adventure} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
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

        {/* Compare Adventures */}
        <CompareAdventures />

        {/* Map CTA Section */}
          <div className="bg-[#1a1f2e] mt-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
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
                className="inline-flex items-center gap-2.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white px-7 py-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap"
              >
                <MapIcon className="w-4 h-4" />
                  Open Map
                  <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
          </div>

        <Footer />
      </div>
  );
}
