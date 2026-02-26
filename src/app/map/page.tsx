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
  Advanced:     "#f59e0b",  // amber
  Expert:       "#ff5722",  // vibrant orange
  Extreme:      "#ef4444",  // red
};
...
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff5722]" />
...
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Go to a place…"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f5f0e8] text-[#1a1f2e] text-sm placeholder-[#9a9590] border border-transparent focus:outline-none focus:border-[#ff5722] transition-colors"
          />
...
                <MapPin className="w-3.5 h-3.5 text-[#ff5722] mt-0.5 shrink-0" />
...
              {activeFilterCount > 0 && (
                <span className="bg-[#ff5722] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
...
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-[#ff5722] hover:text-[#ff7043] font-medium"
            >
...
                        {
                          label: "Land Based", icon: <Mountain className="w-4 h-4" />,
                          btn: "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100",
                          btnActive: "bg-[#ff5722] text-white border-[#ff5722]",
                          chip: "bg-orange-100 text-orange-900 hover:bg-orange-200",
                          chipActive: "bg-[#ff5722] text-white",
                          types: ["Trekking", "Mountaineering", "Rock Climbing", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"],
                        },
...
                        { name: "Eastern Ghats", icon: <Mountain className="w-4 h-4" />, btn: "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100",     btnActive: "bg-[#ff5722] text-white border-[#ff5722]", chip: "bg-orange-100 text-orange-900 hover:bg-orange-200",   chipActive: "bg-[#ff5722] text-white",   subRegions: ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu"] },

                      { name: "Desert",        icon: <Sun className="w-4 h-4" />, btn: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100",     btnActive: "bg-yellow-500 text-white border-yellow-500", chip: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",   chipActive: "bg-yellow-500 text-white",   subRegions: ["Rajasthan", "Gujarat"] },
                      { name: "Coast",         icon: <Waves className="w-4 h-4" />, btn: "bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100",             btnActive: "bg-cyan-600 text-white border-cyan-600",     chip: "bg-cyan-100 text-cyan-900 hover:bg-cyan-200",         chipActive: "bg-cyan-600 text-white",     subRegions: ["Maharashtra (Konkan)", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"] },
                      { name: "Islands",       icon: <Palmtree className="w-4 h-4" />, btn: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100",             btnActive: "bg-teal-600 text-white border-teal-600",     chip: "bg-teal-100 text-teal-900 hover:bg-teal-200",         chipActive: "bg-teal-600 text-white",     subRegions: ["Andaman & Nicobar", "Lakshadweep"] },
                        { name: "Northeast",     icon: <Sunrise className="w-4 h-4" />, btn: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100",     btnActive: "bg-violet-600 text-white border-violet-600", chip: "bg-violet-100 text-violet-900 hover:bg-violet-200",   chipActive: "bg-violet-600 text-white",   subRegions: ["Nagaland", "Manipur", "Meghalaya", "Assam", "Arunachal Pradesh", "Sikkim"] },
                        { name: "Urban",         icon: <Building2 className="w-4 h-4" />, btn: "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100",               btnActive: "bg-zinc-700 text-white border-zinc-700",     chip: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",         chipActive: "bg-zinc-700 text-white",     subRegions: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"] },
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
                                <span>{rg.icon}</span>
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
                      {seasons.map(({ label, icon, months: sMonths, activeColor, idleColor }) => {
                        const isExpanded = expandedSeason === label;
                        const hasSelected = sMonths.some((m) => selectedMonths.includes(m));
                        const selectedCount = sMonths.filter((m) => selectedMonths.includes(m)).length;
                        return (
                          <button key={label} onClick={() => setExpandedSeason(isExpanded ? null : label)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isExpanded || hasSelected ? activeColor : idleColor}`}>
                            <span>{icon}</span>
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
                      { val: "Beginner",     icon: "🟢", idle: "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 border",     active: "bg-green-600 text-white border border-green-600" },
                      { val: "Intermediate", icon: "🔵", idle: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 border",         active: "bg-blue-600 text-white border border-blue-600" },
                      { val: "Advanced",     icon: "🟠", idle: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 border",     active: "bg-amber-500 text-white border border-amber-500" },
                      { val: "Expert",       icon: "🟠", idle: "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100 border", active: "bg-orange-500 text-white border border-orange-500" },
                      { val: "Extreme",      icon: "🔴", idle: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100 border",             active: "bg-red-600 text-white border border-red-600" },
                    ] as { val: Difficulty; icon: string; idle: string; active: string }[]).map(({ val, icon, idle, active }) => (
                      <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDifficulties.includes(val) ? active : idle}`}>
                        <span>{icon}</span>{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
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

                {/* Group Size */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9a9590] mb-3">Group Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { val: "Solo",              icon: "🧍", idle: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100 border",     active: "bg-violet-600 text-white border border-violet-600" },
                      { val: "Small group (2–6)",  icon: "👥", idle: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 border",             active: "bg-teal-600 text-white border border-teal-600" },
                      { val: "Large group (6+)",   icon: "🫂", idle: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 hover:bg-fuchsia-100 border", active: "bg-fuchsia-600 text-white border border-fuchsia-600" },
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
