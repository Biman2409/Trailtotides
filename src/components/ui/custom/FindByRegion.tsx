"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sun, Mountain, Trees, Waves, Palmtree, Building2, Sunrise } from "lucide-react";
import Image from "next/image";
import { regions, adventures } from "@/lib/data";
import type { AdventureType } from "@/lib/data";

const LAND_TYPES: AdventureType[] = ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Biking", "Cycling", "Jeep Safari", "Camel Safari", "Sandboarding", "Caving", "Urban Adventure"];

const regionSubRegions: Record<string, string[]> = {
  "Himalayas": ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "Arunachal Pradesh", "Nepal", "Bhutan"],
  "Western Ghats": ["Kerala", "Karnataka", "Goa", "Maharashtra", "Gujarat"],
  "Eastern Ghats": ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu"],
  "Desert": ["Rajasthan", "Gujarat"],
  "Coast": ["Maharashtra (Konkan)", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"],
  "Islands": ["Andaman & Nicobar", "Lakshadweep"],
  "Northeast": ["Nagaland", "Manipur", "Meghalaya", "Assam", "Arunachal Pradesh", "Sikkim"],
  "Urban": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"]
};

const regionIcons: Record<string, React.ReactNode> = {
  "Himalayas": <Mountain className="w-5 h-5" />,
  "Western Ghats": <Trees className="w-5 h-5" />,
  "Eastern Ghats": <Mountain className="w-5 h-5" />,
  "Desert": <Sun className="w-5 h-5" />,
  "Coast": <Waves className="w-5 h-5" />,
  "Islands": <Palmtree className="w-5 h-5" />,
  "Northeast": <Sunrise className="w-5 h-5" />,
  "Urban": <Building2 className="w-5 h-5" />
};

const regionSubtitles: Record<string, string> = {
  "Himalayas": "Scale the highest peaks and find stillness in deep valleys",
  "Western Ghats": "Trace emerald trails through misty rainforests and hills",
  "Eastern Ghats": "Discover ancient ranges and hidden waterfall sanctuaries",
  "Desert": "Conquer golden dunes and embrace the vibrant desert spirit",
  "Coast": "Ride rhythmic tides and find peace on sun-soaked shores",
  "Islands": "Dive into turquoise depths and explore pristine wild wonders",
  "Northeast": "Venture into untouched forests and living mountain legends",
  "Urban": "Uncover secret adrenaline spots hidden in the city's pulse"
};

export default function FindByRegion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const regionData = regions.map((region) => {
    const regionAdventures = adventures.filter((a) => a.region === region.name && LAND_TYPES.includes(a.type));
    const subRegions = regionSubRegions[region.name] || [];

    const items = subRegions.map(sr => {
      const count = regionAdventures.filter(a => a.state.includes(sr)).length;
      return {
        label: sr,
        count,
        icon: regionIcons[region.name] || "📍"
      };
    }).filter(item => item.count > 0);

    return {
      ...region,
      id: region.name.toLowerCase().replace(/\s+/g, "-"),
      items,
      totalCount: regionAdventures.length,
    };
  });

    return (
      <section id="regions" className="py-20 lg:py-28 t-bg-surface2 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3 uppercase">
            DISCOVER YOUR REGION
          </p>
          <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
            Adventure Lives in Every Corner
          </h2>
          <div className="mt-4 w-12 h-0.5 bg-[#ff5100] rounded-full" />
          <p className="mt-3 text-white/50 text-sm lg:text-base max-w-xl">
            Pick a region, and let the journey begin.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {regionData.map((region) => {
            const isOpen = openId === region.id;
            
            return (
                <div
                  key={region.id}
                  className="rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${isOpen ? "rgba(255,81,0,0.35)" : "rgba(255,255,255,0.08)"}`,
                        transition: "border-color 0.3s ease",
                        boxShadow: isOpen
                          ? `0 0 0 1px rgba(255,81,0,0.35), 0 20px 48px rgba(0,0,0,0.35)`
                          : "0 4px 16px rgba(0,0,0,0.2)",
                    }}
                >
                  {/* Image header */}
                  <button
                    onClick={() => setOpenId(isOpen ? null : region.id)}
                      className="relative w-full overflow-hidden cursor-pointer group text-left"
                      style={{ aspectRatio: "16/9" }}
                    aria-expanded={isOpen}
                  >
                    <Image
                      src={region.image}
                      alt={region.name}
                      fill
                      quality={100}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ 
                          objectFit: "cover",
                          filter: "brightness(1.05) contrast(1.1) saturate(1.1)" 
                        }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                    
                    {/* Content over image */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                        <div className="flex items-start justify-end">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              background: isOpen ? "#ff5100" : "rgba(255,255,255,0.12)",
                              color: "white",
                              backdropFilter: "blur(6px)",
                              transition: "background 0.25s",
                            }}
                          >
                            {isOpen ? "Close" : "Explore"}
                          </span>
                        </div>


                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[#ff5100] transition-colors duration-300">
                                {regionIcons[region.name]}
                              </span>
                              <h3 className="text-white font-bold text-2xl leading-tight tracking-tight">
                                {region.name}
                              </h3>
                            </div>
                              <p className="text-white/60 text-xs mt-1.5 leading-relaxed line-clamp-2">
                                {regionSubtitles[region.name]}
                              </p>
                          </div>


                  </div>
                </button>

                  {/* Body */}
                  <div
                    className="px-5 transition-all duration-300 ease-in-out overflow-hidden"
                    style={{
                      maxHeight: isOpen ? "600px" : "56px",
                    }}
                  >
                    {/* Collapsed summary */}
                    {!isOpen && (
                        <div className="py-3.5 flex items-center justify-between">
                          <span className="text-white/40 text-xs">
                            {region.items.length} {region.items.length === 1 ? "Area" : "Areas"}
                          </span>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ff5100]/15 text-[#ff5100]"
                          >
                            {region.totalCount} Adventures
                          </span>
                        </div>
                    )}


                    {/* Expanded items */}
                    {isOpen && (
                      <div className="py-4">
                        <div className="flex flex-col gap-0.5">
                            {region.items.map(({ label, count }) => (
                              <Link
                                key={label}
                                href={`/explore?region=${encodeURIComponent(region.name)}&subRegion=${encodeURIComponent(label)}`}
                                className="group/row flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-[#ff5100]/10"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-white/70 group-hover/row:text-white text-sm font-medium transition-colors duration-150">
                                    {label}
                                  </span>
                                </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ff5100]/15 text-[#ff5100]">
                                  {count}
                                </span>
                                <ArrowRight
                                  className="w-3 h-3 opacity-0 group-hover/row:opacity-100 -translate-x-1 group-hover/row:translate-x-0 transition-all duration-150 text-[#ff5100]"
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
  
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <Link
                          href={`/explore?region=${encodeURIComponent(region.name)}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 bg-[#ff5100] text-white shadow-lg shadow-[#ff5100]/20"
                        >
                          View all in {region.name}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
