"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Layers, Map as MapIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { adventures, adventureTypes } from "@/lib/data";
import type { AdventureType } from "@/lib/data";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false, loading: () => (
  <div className="w-full h-full bg-[#1a1f2e] flex items-center justify-center">
    <div className="text-white/40 text-sm">Loading map…</div>
  </div>
)});

const typeEmoji: Record<AdventureType, string> = {
  "Trekking": "🥾",
  "Biking": "🏍️",
  "Cycling": "🚴",
  "Diving": "🤿",
  "Kayaking": "🛶",
  "Skiing": "⛷️",
  "Mountaineering": "🧗",
};

export default function MapPage() {
  const [activeTypes, setActiveTypes] = useState<AdventureType[]>(
    adventureTypes.map((t) => t.type)
  );

  function toggleType(type: AdventureType) {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  const visibleAdventures = adventures.filter((a) => activeTypes.includes(a.type));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      {/* Map container fills screen */}
      <div className="flex-1 relative mt-[64px] lg:mt-[80px]">
        <MapComponent adventures={visibleAdventures} />

        {/* Layer toggle panel */}
        <div className="absolute top-4 left-4 z-[1000] bg-[#1a1f2e]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-72 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#c4622d]" />
            <span className="text-white text-sm font-semibold">Adventure Layers</span>
            <span className="ml-auto text-white/40 text-xs">{visibleAdventures.length} visible</span>
          </div>
          <div className="space-y-1.5">
            {adventureTypes.map(({ type, count }) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  activeTypes.includes(type)
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{typeEmoji[type]}</span>
                  {type}
                </span>
                <span className={`text-xs ${activeTypes.includes(type) ? "text-white/50" : "text-white/20"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              activeTypes.length === adventureTypes.length
                ? setActiveTypes([])
                : setActiveTypes(adventureTypes.map((t) => t.type))
            }
            className="mt-3 w-full text-xs text-[#c4622d] hover:text-[#e07845] transition-colors py-1.5 border-t border-white/10 font-medium"
          >
            {activeTypes.length === adventureTypes.length ? "Hide all" : "Show all"}
          </button>
        </div>

        {/* Map attribution / legend */}
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
