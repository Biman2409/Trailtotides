"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import Image from "next/image";
import { regions, adventures } from "@/lib/data";

export default function FindByRegion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const regionData = regions.map((region) => {
    const regionAdventures = adventures.filter((a) => a.region === region.name);
    const typesMap = new Map<string, number>();
    regionAdventures.forEach((a) => {
      typesMap.set(a.type, (typesMap.get(a.type) || 0) + 1);
    });
    const items = Array.from(typesMap.entries()).map(([type, count]) => ({
      type,
      count,
    })).sort((a, b) => b.count - a.count);

    return {
      ...region,
      id: region.name.toLowerCase().replace(/\s+/g, "-"),
      items,
    };
  });

  return (
    <section className="py-24 lg:py-32 bg-[#1a1f2e] px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            Discover by Region
          </p>
          <h2 className="text-white text-4xl lg:text-5xl font-bold tracking-tight">
            Adventure lives in every corner.
          </h2>
          <p className="mt-4 text-white/50 text-base max-w-xl">
            Pick a region, and let the journey begin.
          </p>
          <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
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
                  border: `1px solid ${isOpen ? "rgba(196,98,45,0.35)" : "rgba(255,255,255,0.08)"}`,
                  transition: "border-color 0.3s ease",
                  boxShadow: isOpen
                    ? `0 0 0 1px rgba(196,98,45,0.35), 0 20px 48px rgba(0,0,0,0.35)`
                    : "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                {/* Image header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : region.id)}
                  className="relative w-full overflow-hidden cursor-pointer group text-left"
                  style={{ height: "180px" }}
                  aria-expanded={isOpen}
                >
                  <Image
                    src={region.image}
                    alt={region.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                  
                  {/* Content over image */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-end">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase"
                        style={{
                          background: isOpen ? "#c4622d" : "rgba(255,255,255,0.12)",
                          color: "white",
                          backdropFilter: "blur(6px)",
                          transition: "background 0.25s",
                        }}
                      >
                        {isOpen ? "Close" : "Explore"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-white font-bold text-2xl leading-tight tracking-tight">
                        {region.name}
                      </h3>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed line-clamp-1">
                        {region.tagline}
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
                        {region.items.length} categories
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#c4622d]/15 text-[#f4956a]"
                      >
                        {region.adventureCount} adventures
                      </span>
                    </div>
                  )}

                  {/* Expanded items */}
                  {isOpen && (
                    <div className="py-4">
                      <div className="flex flex-col gap-0.5">
                        {region.items.map(({ type, count }) => (
                          <Link
                            key={type}
                            href={`/explore?region=${encodeURIComponent(region.name)}&type=${encodeURIComponent(type)}`}
                            className="group/row flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-[#c4622d]/10"
                          >
                            <span className="text-white/70 group-hover/row:text-white text-sm font-medium transition-colors duration-150">
                              {type}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#c4622d]/15 text-[#f4956a]">
                                {count}
                              </span>
                              <ArrowRight
                                className="w-3 h-3 opacity-0 group-hover/row:opacity-100 -translate-x-1 group-hover/row:translate-x-0 transition-all duration-150 text-[#f4956a]"
                              />
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5">
                        <Link
                          href={`/explore?region=${encodeURIComponent(region.name)}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 bg-[#c4622d] text-white shadow-lg shadow-[#c4622d]/20"
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
