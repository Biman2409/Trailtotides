"use client";

import { useCompare } from "@/context/CompareContext";
import Image from "next/image";
import Link from "next/link";
import { X, GitCompare, MapPin, Clock, TrendingUp, ChevronDown } from "lucide-react";

const difficultyColor: Record<string, string> = {
  Beginner: "text-emerald-400",
  Intermediate: "text-teal-400",
  Advanced: "text-amber-400",
  Expert: "text-orange-400",
  Extreme: "text-red-400",
};

export default function CompareDrawer() {
  const { items, remove, clear, isOpen, open, close } = useCompare();

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating pill trigger when drawer is closed */}
      {!isOpen && (
        <button
          onClick={open}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 bg-[#c4622d] text-white rounded-full shadow-2xl shadow-[#c4622d]/40 hover:bg-[#b3571f] hover:-translate-y-0.5 hover:shadow-[#c4622d]/60 transition-all duration-200 text-sm font-semibold"
        >
          <GitCompare className="w-4 h-4" />
          Compare {items.length} adventure{items.length > 1 ? "s" : ""}
          <ChevronDown className="w-3.5 h-3.5 rotate-180" />
        </button>
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
            onClick={close}
          />
        )}

        <div className="bg-[#0d1117] border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0d1117] z-10 rounded-t-3xl">
            <div className="flex items-center gap-2.5">
              <GitCompare className="w-5 h-5 text-[#c4622d]" />
              <span className="text-white font-semibold text-lg">Compare Adventures</span>
              <span className="text-white/40 text-sm">({items.length}/3)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clear}
                className="text-white/40 hover:text-white/70 text-xs transition-colors px-3 py-1.5 rounded-full hover:bg-white/10"
              >
                Clear all
              </button>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Cards grid */}
          <div className="p-6">
            <div className={`grid gap-5 ${items.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : items.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {items.map(adventure => (
                <div key={adventure.id} className="bg-[#1a1f2e] rounded-2xl overflow-hidden border border-white/8">
                  {/* Image */}
                  <div className="relative h-40">
                    <Image
                      src={adventure.heroImage}
                      alt={adventure.name}
                      fill
                      className="object-cover brightness-110 saturate-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {/* Remove button */}
                    <button
                      onClick={() => remove(adventure.id)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500/80 flex items-center justify-center transition-colors backdrop-blur-sm"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{adventure.name}</h3>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <MapPin className="w-3.5 h-3.5 text-[#c4622d] shrink-0" />
                      <span className="text-xs truncate">{adventure.state}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 mb-0.5">Duration</p>
                        <div className="flex items-center gap-1 text-white font-medium">
                          <Clock className="w-3 h-3 text-[#c4622d]" />
                          <span>{adventure.durationDays}</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 mb-0.5">Difficulty</p>
                        <p className={`font-semibold ${difficultyColor[adventure.difficulty] ?? "text-white"}`}>
                          {adventure.difficulty}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 mb-0.5">Type</p>
                        <p className="text-white font-medium truncate">{adventure.type}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 mb-0.5">Region</p>
                        <p className="text-white font-medium truncate">{adventure.region}</p>
                      </div>
                      {adventure.altitude && (
                        <div className="bg-white/5 rounded-lg p-2.5 col-span-2">
                          <p className="text-white/40 mb-0.5">Altitude</p>
                          <div className="flex items-center gap-1 text-white font-medium">
                            <TrendingUp className="w-3 h-3 text-[#c4622d]" />
                            <span>{adventure.altitude}</span>
                          </div>
                        </div>
                      )}
                      <div className="bg-white/5 rounded-lg p-2.5 col-span-2">
                        <p className="text-white/40 mb-0.5">Best Season</p>
                        <p className="text-white font-medium text-xs leading-snug">{adventure.bestSeason}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5 col-span-2">
                        <p className="text-white/40 mb-0.5">Group Size</p>
                        <p className="text-white font-medium">{adventure.groupSize}</p>
                      </div>
                    </div>

                    <Link
                      href={`/experiences/${adventure.slug}`}
                      className="block w-full text-center py-2.5 rounded-xl bg-[#c4622d] hover:bg-[#b3571f] text-white text-xs font-semibold transition-colors mt-1"
                    >
                      View Adventure
                    </Link>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white/3 border border-dashed border-white/15 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-white/25 p-6">
                  <GitCompare className="w-8 h-8" />
                  <p className="text-sm text-center">Add another adventure to compare</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
