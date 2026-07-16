"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, SlidersHorizontal, X, ChevronDown, Map as MapIcon, ArrowRight, ChevronRight, ChevronLeft, Heart, RotateCcw, BarChart2, Star, Compass } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { adventures } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month } from "@/lib/data";
import { difficultyStyle } from "@/lib/styles";
import { getACE, computeDifficulty } from "@/lib/ace";
import type { AceAxis } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { StoredProfile } from "@/lib/matchmaker";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
import { motion } from "framer-motion";
import ChatBubble from "@/components/ChatBubble";
import { toggleSelection, REGION_GROUPS, GENRE_GROUPS, SEASONS } from "@/lib/filterOptions";

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
const seasons = SEASONS;

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
  const [acePopupOpen, setAcePopupOpen] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const PAGE_SIZE = 24;

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

  const toggle = toggleSelection;

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
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            All Adventures
          </h1>
          <p className="text-base lg:text-lg max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Every adventure across the Indian subcontinent — search, filter, and find what fits you.
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="sticky top-16 lg:top-20 z-40 backdrop-blur-lg shadow-sm relative" style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-2 flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search adventures..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:border-[#ff5100]/50 transition-colors"
              style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: filtersOpen || activeFilterCount > 0 ? "#ff5100" : "var(--bg-surface-2)",
              color: filtersOpen || activeFilterCount > 0 ? "#fff" : "var(--text-secondary)",
            }}
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

          {/* ACE Readiness */}
          {userProfile ? (
            <button
              onClick={() => setAceCategory(aceCategory === "ready" ? null : "ready")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              style={aceCategory ? { background: "#ff5100", color: "#fff" } : { background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">ACE<sup>™</sup> Readiness</span>
            </button>
          ) : (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAcePopupOpen(!acePopupOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">ACE<sup>™</sup> Readiness</span>
              </button>
              {acePopupOpen && (
                <>
                  <div className="fixed inset-0 z-[1998]" onClick={() => setAcePopupOpen(false)} />
                  <div className="absolute top-full left-0 mt-1.5 z-[2001] w-72 rounded-xl overflow-hidden" style={{ background: "var(--bg-overlay)", backdropFilter: "blur(12px)", border: "1px solid var(--border-default)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center">
                          <Compass className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>ACE<sup>™</sup> Assessment</p>
                          <p className="text-[var(--text-muted)] text-[10px] font-medium">Adventure Compatibility Engine</p>
                        </div>
                      </div>
                      <p className="text-[var(--text-tertiary)] text-xs leading-relaxed mb-4">
                        Find adventures tailored to your fitness, experience and comfort level.
                      </p>
                      <Link
                        href="/matchmaker"
                        onClick={() => setAcePopupOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                        style={{ background: "#ff5100", color: "#fff", boxShadow: "0 4px 14px rgba(255,81,0,0.3)" }}
                      >
                        Take Assessment
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Editor's Choice */}
          <button
            onClick={() => setEditorOnly(!editorOnly)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
            style={editorOnly ? {
              background: "linear-gradient(105deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)",
              color: "#ffb38a",
              border: "1px solid rgba(255,81,0,0.35)",
              boxShadow: "0 0 12px rgba(255,81,0,0.2), inset 0 1px 0 rgba(255,140,80,0.15)",
            } : { background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}
          >
            <Star className="w-4 h-4" style={editorOnly ? { color: "#ff7d47", fill: "#ff7d47", filter: "drop-shadow(0 0 3px rgba(255,81,0,0.7))" } : {}} />
            <span className="hidden md:inline">Editor&apos;s Choice</span>
            <span className="md:hidden">Top Picks</span>
          </button>

          {/* Result count */}
          <span className="hidden lg:block text-xs ml-auto font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
            {filtered.length} / {adventures.length}
          </span>

          {/* Clear */}
          {(activeFilterCount > 0 || search) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap"
              style={{ color: "var(--text-tertiary)", background: "var(--bg-surface-2)" }}
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Filter panel (dropdown) */}
          {filtersOpen && (
            <>
              {/* Backdrop — closes on outside click */}
              <div className="fixed inset-0 z-[1999]" onClick={() => setFiltersOpen(false)} />
              <div className="absolute top-full left-0 right-0 z-[2000] border-t border-[var(--border-subtle)]" style={{ background: "var(--bg-page)", backdropFilter: "blur(12px)" }}>
              <div className="max-w-7xl mx-auto px-3 lg:px-5 py-1.5 space-y-1.5">

                {/* ── Region ── */}
                {(() => {
                  const regionGroups = REGION_GROUPS;
                  return (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                        <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Region</span>
                        {(selectedRegions.length > 0 || selectedSubRegions.length > 0) && (
                          <span className="text-[8px] font-bold px-1 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>
                            {selectedRegions.length + selectedSubRegions.length}
                          </span>
                        )}
                      </div>
                      <div className="p-1.5">
                        <div className="flex flex-wrap gap-1">
                          {regionGroups.map((rg) => {
                            const isExpanded = expandedRegion === rg.name;
                            const hasSelected = selectedRegions.includes(rg.name) || rg.subRegions.some(sr => selectedSubRegions.includes(sr));
                            const subCount = rg.subRegions.filter(sr => selectedSubRegions.includes(sr)).length;
                            return (
                              <button
                                key={rg.name}
                                onClick={() => setExpandedRegion(isExpanded ? null : rg.name)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                                style={{
                                  background: isExpanded || hasSelected ? "rgba(255,81,0,0.15)" : "var(--bg-card)",
                                  color: isExpanded || hasSelected ? "#ff7d47" : "var(--text-tertiary)",
                                  border: `1px solid ${isExpanded || hasSelected ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}`,
                                }}
                              >
                                {rg.name}
                                {subCount > 0 && (
                                  <span className="text-[8px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "var(--text-muted)" }}>{subCount}</span>
                                )}
                                <ChevronDown className={`w-2.5 h-2.5 opacity-60 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedRegion && (() => {
                          const rg = regionGroups.find(r => r.name === expandedRegion)!;
                          return (
                            <div className="mt-1.5 pt-1.5 flex flex-wrap gap-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                              {rg.subRegions.map((sr) => {
                                const isSelected = selectedSubRegions.includes(sr);
                                return (
                                  <button
                                    key={sr}
                                    onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-medium transition-all"
                                    style={{
                                      background: isSelected ? "rgba(255,81,0,0.15)" : "var(--bg-card)",
                                      color: isSelected ? "#ff7d47" : "var(--text-tertiary)",
                                      border: `1px solid ${isSelected ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}`,
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
                  const genreGroups = GENRE_GROUPS;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">

                      {/* Genre */}
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                        <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Genre</span>
                          {selectedTypes.length > 0 && <span className="text-[8px] font-bold px-1 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedTypes.length}</span>}
                        </div>
                        <div className="p-1.5">
                          <div className="flex flex-wrap gap-1">
                            {genreGroups.map((grp) => {
                              const isExpanded = expandedGenre === grp.label;
                              const groupSelected = grp.types.filter(t => selectedTypes.includes(t)).length;
                              const hasSelected = groupSelected > 0;
                              return (
                                <button
                                  key={grp.label}
                                  onClick={() => setExpandedGenre(isExpanded ? null : grp.label)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                                  style={{
                                    background: isExpanded ? `${grp.color}22` : hasSelected ? `${grp.color}18` : "var(--bg-card)",
                                    color: isExpanded || hasSelected ? grp.color : "var(--text-tertiary)",
                                    border: `1px solid ${isExpanded || hasSelected ? `${grp.color}50` : "var(--border-subtle)"}`,
                                  }}
                                >
                                  {grp.label}
                                  {groupSelected > 0 && <span className="text-[7px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: `${grp.color}30`, color: grp.color }}>{groupSelected}</span>}
                                  <ChevronDown className={`w-2 h-2 opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              );
                            })}
                          </div>
                          {expandedGenre && (() => {
                            const grp = genreGroups.find(g => g.label === expandedGenre)!;
                            return (
                              <div className="mt-1.5 pt-1.5 flex flex-wrap gap-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                                {grp.types.map((type) => {
                                  const isSelected = selectedTypes.includes(type);
                                  return (
                                    <button
                                      key={type}
                                      onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all"
                                      style={{
                                        background: isSelected ? "rgba(255,81,0,0.15)" : "var(--bg-card)",
                                        color: isSelected ? "#ff7d47" : "var(--text-tertiary)",
                                        border: `1px solid ${isSelected ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}`,
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
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                        <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Season</span>
                          {selectedMonths.length > 0 && <span className="text-[8px] font-bold px-1 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedMonths.length}</span>}
                        </div>
                        <div className="p-1.5">
                          <div className="flex flex-wrap gap-1">
                            {seasons.map(({ label, months: sMonths }) => {
                              const isExpanded = expandedSeason === label;
                              const hasSelected = sMonths.some(m => selectedMonths.includes(m));
                              const selectedCount = sMonths.filter(m => selectedMonths.includes(m)).length;
                              return (
                                <button
                                  key={label}
                                  onClick={() => setExpandedSeason(isExpanded ? null : label)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                                  style={{
                                    background: isExpanded || hasSelected ? "rgba(255,81,0,0.15)" : "var(--bg-card)",
                                    color: isExpanded || hasSelected ? "#ff7d47" : "var(--text-tertiary)",
                                    border: `1px solid ${isExpanded || hasSelected ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}`,
                                  }}
                                >
                                  {label}
                                  {selectedCount > 0 && <span className="text-[7px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "rgba(255,81,0,0.25)", color: "#ff7d47" }}>{selectedCount}</span>}
                                  <ChevronDown className={`w-2 h-2 opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              );
                            })}
                          </div>
                          {expandedSeason && (
                            <div className="mt-1.5 pt-1.5 flex flex-wrap gap-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                              {seasons.find(s => s.label === expandedSeason)!.months.map(m => (
                                <button
                                  key={m}
                                  onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-medium transition-all"
                                  style={{
                                    background: selectedMonths.includes(m) ? "rgba(255,81,0,0.15)" : "var(--bg-card)",
                                    color: selectedMonths.includes(m) ? "#ff7d47" : "var(--text-tertiary)",
                                    border: `1px solid ${selectedMonths.includes(m) ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}`,
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">

                  {/* Difficulty */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Difficulty</span>
                    </div>
                    <div className="p-1.5 flex flex-wrap gap-1">
                      {(["Easy", "Moderate", "Hard", "Advanced", "Extreme"] as Difficulty[]).map((val) => {
                        const isSelected = selectedDifficulties.includes(val);
                        const colorMap: Record<string, string> = { Easy: "#22c55e", Moderate: "#eab308", Hard: "#f97316", Advanced: "#ef4444", Extreme: "#a855f7" };
                        const c = colorMap[val] ?? "#ff5100";
                        return (
                          <button
                            key={val}
                            onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                            style={{
                              background: isSelected ? `${c}18` : "var(--bg-card)",
                              color: isSelected ? c : "var(--text-tertiary)",
                              border: `1px solid ${isSelected ? `${c}40` : "var(--border-subtle)"}`,
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Duration</span>
                    </div>
                    <div className="p-1.5 flex flex-wrap gap-1">
                      {(["Weekend", "3–5 days", "7+ days"] as Duration[]).map((val) => {
                        const isSelected = selectedDurations.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                            style={{
                              background: isSelected ? "rgba(255,81,0,0.15)" : "var(--bg-card)",
                              color: isSelected ? "#ff7d47" : "var(--text-tertiary)",
                              border: `1px solid ${isSelected ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}`,
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* ── Price Range ── */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center justify-between px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Price Range</span>
                    <span className="text-[8px] font-bold" style={{ color: priceActive ? "#ff5100" : "var(--text-muted)" }}>
                      {priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX ? "Any price" : `₹${(priceRange[0]/1000).toFixed(0)}k – ₹${(priceRange[1]/1000).toFixed(0)}k`}
                    </span>
                  </div>
                  <div className="px-3 pt-2 pb-2">
                    <div className="relative h-3 flex items-center">
                      <div className="absolute inset-x-0 h-0.5 rounded-full" style={{ background: "var(--border-subtle)" }} />
                      <div className="absolute h-0.5 rounded-full bg-[#ff5100]" style={{ left: `${(priceRange[0] / PRICE_MAX) * 100}%`, right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%` }} />
                      <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={5000} value={priceRange[0]}
                        onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 5000), priceRange[1]])}
                        className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ff5100] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#ff5100] [&::-moz-range-track]:bg-transparent"
                        style={{ zIndex: priceRange[0] > PRICE_MAX * 0.9 ? 5 : 3 }} />
                      <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={5000} value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 5000)])}
                        className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ff5100] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#ff5100] [&::-moz-range-track]:bg-transparent"
                        style={{ zIndex: 4 }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[8px] text-[var(--text-muted)] font-medium">
                      <span>₹0</span><span>₹50k</span><span>₹1L</span><span>₹1.5L</span><span>₹2L+</span>
                    </div>
                  </div>
                </div>

                {/* ── Clear / Apply ── */}
                <div className="flex items-center gap-2 pt-1.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear All
                  </button>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, #ff5100, #ff7d47)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(255,81,0,0.3)",
                    }}
                  >
                    Close
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
            </>
          )}
      </div>

      {/* Sentinel to trigger ChatBubble on scroll */}
      <div id="featured-adventures" className="h-px w-full opacity-0 pointer-events-none" />

      {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-4 flex flex-wrap gap-2">
            {selectedTypes.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => toggle(selectedTypes, t, setSelectedTypes)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                <span className="flex-shrink-0">{ADVENTURE_TYPE_ICONS[t]?.(11)}</span>
                {t} <X className="w-3 h-3" />
              </button>
            ))}
             {selectedRegions.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                  className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
                >
                  {r} <X className="w-3 h-3" />
                </button>
              ))}
              {selectedSubRegions.map((sr) => (
                <button
                  type="button"
                  key={sr}
                  onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                  className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
                >
                  {sr} <X className="w-3 h-3" />
                </button>
              ))}
            {selectedDifficulties.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                {d} <X className="w-3 h-3" />
              </button>
            ))}
            {selectedDurations.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                {d} <X className="w-3 h-3" />
              </button>
            ))}
            {selectedMonths.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                  className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
                >
                  {m} <X className="w-3 h-3" />
                </button>
              ))}
            {priceActive && (
              <button
                type="button"
                onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
                className="flex items-center gap-1.5 bg-[#ff5100]/15 text-[#ff5100] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ff5100]/25 transition-colors uppercase"
              >
                ₹{(priceRange[0]/1000).toFixed(0)}k – ₹{(priceRange[1]/1000).toFixed(0)}k <X className="w-3 h-3" />
              </button>
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
              {pagedResults.map((adventure, i) => (
                <motion.div
                  key={adventure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div id={`card-${adventure.slug}`}>
                    <AdventureCard adventure={adventure} fromPage={currentPage} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
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
                        return <span key={page} className="text-[var(--text-muted)] px-1">…</span>;
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
                            : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
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
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-center text-[var(--text-muted)] text-xs mt-4 tracking-wide">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} adventures
            </p>
          </>
        )}
      </div>

        {/* Adventure Map — strip */}
        <div className="relative mx-5 lg:mx-8 mb-8 overflow-hidden rounded-xl" style={{ background: "linear-gradient(90deg, #070e09 0%, #0a1810 60%, #070e09 100%)", border: "1px solid rgba(126,200,138,0.09)" }}>
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(126,200,138,1) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="absolute right-0 inset-y-0 w-64 pointer-events-none" style={{ background: "radial-gradient(ellipse at 100% 50%, rgba(126,200,138,0.07) 0%, transparent 70%)" }} />

          <div className="relative flex items-center gap-0 [&>:not(:first-child)]:border-l" style={{ borderColor: "rgba(126,200,138,0.07)" }}>

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

        <ChatBubble />
        <Footer />
      </div>
  );
}

