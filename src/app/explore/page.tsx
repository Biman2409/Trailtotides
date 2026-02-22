"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { adventures, adventureTypes, regions } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration } from "@/lib/data";

const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Expert"];
const durations: Duration[] = ["Weekend", "3–5 days", "7+ days"];

export default function ExplorePage() {
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  function toggle<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const filtered = useMemo(() => {
    return adventures.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.state.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedTypes.length && !selectedTypes.includes(a.type)) return false;
      if (selectedRegions.length && !selectedRegions.includes(a.region)) return false;
      if (selectedDifficulties.length && !selectedDifficulties.includes(a.difficulty)) return false;
      if (selectedDurations.length && !selectedDurations.includes(a.duration)) return false;
      return true;
    });
  }, [search, selectedTypes, selectedRegions, selectedDifficulties, selectedDurations]);

  const activeFilterCount =
    selectedTypes.length + selectedRegions.length + selectedDifficulties.length + selectedDurations.length;

  function clearAll() {
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedDifficulties([]);
    setSelectedDurations([]);
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#1a1f2e] pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Discover
          </p>
          <h1 className="text-white text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
            All Adventures
          </h1>
          <p className="text-white/50 text-lg">
            {adventures.length} experiences across India's wildest terrain
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Search + filter bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#e0d8cc] bg-white text-[#1a1f2e] placeholder-[#9a9590] text-sm focus:outline-none focus:border-[#1e3d2f] transition-colors"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-medium transition-colors ${
              activeFilterCount > 0
                ? "bg-[#1e3d2f] border-[#1e3d2f] text-white"
                : "bg-white border-[#e0d8cc] text-[#1a1f2e] hover:border-[#1e3d2f]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#c4622d] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-[#9a9590] hover:text-[#c4622d] transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-white border border-[#e0d8cc] rounded-2xl p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Type */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#9a9590] mb-3">
                Adventure Type
              </h4>
              <div className="space-y-2">
                {adventureTypes.map(({ type, icon }) => (
                  <button
                    key={type}
                    onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                    className={`flex items-center gap-2 w-full text-left text-sm py-1.5 transition-colors ${
                      selectedTypes.includes(type)
                        ? "text-[#1e3d2f] font-semibold"
                        : "text-[#6b6560] hover:text-[#1a1f2e]"
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
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#9a9590] mb-3">
                Region
              </h4>
              <div className="space-y-2">
                {regions.map(({ name }) => (
                  <button
                    key={name}
                    onClick={() => toggle(selectedRegions, name, setSelectedRegions)}
                    className={`flex items-center gap-2 w-full text-left text-sm py-1.5 transition-colors ${
                      selectedRegions.includes(name)
                        ? "text-[#1e3d2f] font-semibold"
                        : "text-[#6b6560] hover:text-[#1a1f2e]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedRegions.includes(name) ? "bg-[#c4622d]" : "bg-[#e0d8cc]"
                      }`}
                    />
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#9a9590] mb-3">
                Difficulty
              </h4>
              <div className="space-y-2">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
                    className={`flex items-center gap-2 w-full text-left text-sm py-1.5 transition-colors ${
                      selectedDifficulties.includes(d)
                        ? "text-[#1e3d2f] font-semibold"
                        : "text-[#6b6560] hover:text-[#1a1f2e]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        d === "Beginner"
                          ? "bg-emerald-500"
                          : d === "Intermediate"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#9a9590] mb-3">
                Duration
              </h4>
              <div className="space-y-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
                    className={`flex items-center gap-2 w-full text-left text-sm py-1.5 transition-colors ${
                      selectedDurations.includes(d)
                        ? "text-[#1e3d2f] font-semibold"
                        : "text-[#6b6560] hover:text-[#1a1f2e]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedDurations.includes(d) ? "bg-[#c4622d]" : "bg-[#e0d8cc]"
                      }`}
                    />
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {(selectedTypes.length > 0 || selectedRegions.length > 0 || selectedDifficulties.length > 0 || selectedDurations.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {selectedTypes.map((t) => (
              <button
                key={t}
                onClick={() => toggle(selectedTypes, t, setSelectedTypes)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#c4622d]/10 hover:text-[#c4622d] transition-colors"
              >
                {t} <X className="w-3 h-3" />
              </button>
            ))}
            {selectedRegions.map((r) => (
              <button
                key={r}
                onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#c4622d]/10 hover:text-[#c4622d] transition-colors"
              >
                {r} <X className="w-3 h-3" />
              </button>
            ))}
            {selectedDifficulties.map((d) => (
              <button
                key={d}
                onClick={() => toggle(selectedDifficulties, d, setSelectedDifficulties)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#c4622d]/10 hover:text-[#c4622d] transition-colors"
              >
                {d} <X className="w-3 h-3" />
              </button>
            ))}
            {selectedDurations.map((d) => (
              <button
                key={d}
                onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
                className="flex items-center gap-1.5 bg-[#1e3d2f]/10 text-[#1e3d2f] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#c4622d]/10 hover:text-[#c4622d] transition-colors"
              >
                {d} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <p className="text-[#9a9590] text-sm">
            {filtered.length === adventures.length
              ? `Showing all ${filtered.length} adventures`
              : `${filtered.length} adventures found`}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((adventure) => (
              <AdventureCard key={adventure.id} adventure={adventure} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🧭</div>
            <h3 className="text-[#1a1f2e] text-xl font-semibold mb-2">No adventures found</h3>
            <p className="text-[#9a9590] text-sm mb-6">Try adjusting your filters or search</p>
            <button
              onClick={clearAll}
              className="bg-[#1e3d2f] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-[#2d5a42] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
