"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { adventures, adventureTypes, regions } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, GroupSize } from "@/lib/data";

const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Expert"];
const durations: Duration[] = ["Weekend", "3–5 days", "7+ days"];
const groupSizes: GroupSize[] = ["Solo", "Small group (2–8)", "Large group (9+)"];

const months: { label: string; value: Month }[] = [
  { label: "Jan", value: "Jan" },
  { label: "Feb", value: "Feb" },
  { label: "Mar", value: "Mar" },
  { label: "Apr", value: "Apr" },
  { label: "May", value: "May" },
  { label: "Jun", value: "Jun" },
  { label: "Jul", value: "Jul" },
  { label: "Aug", value: "Aug" },
  { label: "Sep", value: "Sep" },
  { label: "Oct", value: "Oct" },
  { label: "Nov", value: "Nov" },
  { label: "Dec", value: "Dec" },
];

const difficultyDot: Record<Difficulty, string> = {
  Beginner: "bg-emerald-400",
  Intermediate: "bg-amber-400",
  Expert: "bg-red-400",
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
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<Duration[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Month[]>([]);
  const [selectedGroupSizes, setSelectedGroupSizes] = useState<GroupSize[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
      if (selectedDifficulties.length && !selectedDifficulties.includes(a.difficulty))
        return false;
      if (selectedDurations.length && !selectedDurations.includes(a.duration)) return false;
      if (selectedMonths.length && !selectedMonths.some((m) => a.bestMonths.includes(m)))
        return false;
      if (selectedGroupSizes.length && !selectedGroupSizes.includes(a.groupSize))
        return false;
      return true;
    });
  }, [search, selectedTypes, selectedRegions, selectedDifficulties, selectedDurations, selectedMonths, selectedGroupSizes]);

  const activeFilterCount =
    selectedTypes.length +
    selectedRegions.length +
    selectedDifficulties.length +
    selectedDurations.length +
    selectedMonths.length +
    selectedGroupSizes.length;

  function clearAll() {
    setSelectedTypes([]);
    setSelectedRegions([]);
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
      <div className="sticky top-[64px] lg:top-[80px] z-40 bg-white/95 backdrop-blur-md border-b border-[#e0d8cc] shadow-sm">
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
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                  Adventure Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {adventureTypes.map(({ type, icon }) => (
                    <button
                      key={type}
                      onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedTypes.includes(type)
                          ? "bg-[#1e3d2f] text-white"
                          : "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#e8dfc8]"
                      }`}
                    >
                      <span>{icon}</span>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                  Region
                </h3>
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

              {/* Season — month picker */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">
                  Best Season
                </h3>
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
              className="flex items-center gap-1.5 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-sky-200 transition-colors"
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
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-[#1a1f2e] text-xl font-semibold mb-2">No adventures found</h3>
            <p className="text-[#9a9590] mb-6">
              Try adjusting your filters or search term
            </p>
            <button
              onClick={clearAll}
              className="bg-[#1e3d2f] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#2d5a42] transition-colors"
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

      <Footer />
    </div>
  );
}
