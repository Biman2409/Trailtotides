"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, GitCompareArrows, Users, CheckCheck } from "lucide-react";
import type { Adventure, Month } from "@/lib/data";
import { useCompare } from "@/contexts/CompareContext";
import Pill from "./Pill";

interface AdventureCardProps {
  adventure: Adventure;
  size?: "default" | "large";
}

export default function AdventureCard({ adventure, size = "default" }: AdventureCardProps) {
  const isLarge = size === "large";
  const months: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = months[new Date().getMonth()];
  const isSeasonActive = adventure.bestMonths.includes(currentMonth);
  const operatorCount = adventure.operators?.length ?? 0;

  const { add, remove, isSelected, isFull } = useCompare();
  const selected = isSelected(adventure.id);

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      remove(adventure.id);
    } else if (!isFull) {
      add(adventure);
      document.getElementById("compare-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: selected ? "rgba(255,81,0,0.07)" : "rgba(255,255,255,0.04)",
        border: selected ? "1px solid rgba(255,81,0,0.55)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: selected
          ? "0 0 0 1px rgba(255,81,0,0.3), 0 0 32px rgba(255,81,0,0.12), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      {/* Image area */}
      <div className="relative w-full overflow-hidden block group" style={{ height: isLarge ? "260px" : "200px" }}>
        <Link
          href={`/experiences/${adventure.slug}`}
          className="absolute inset-0 z-10"
        />
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          quality={100}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: "brightness(1.05) contrast(1.1) saturate(1.1)" }}
          sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 z-10 pointer-events-none" />
        {selected && <div className="absolute inset-0 bg-[#ff5100]/8 pointer-events-none z-10" />}

        {/* Pills — top left */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
          <Pill type="type" value={adventure.type} />
          <Pill type="difficulty" value={adventure.difficulty} />
        </div>

        {/* Season Active badge — top right */}
        {isSeasonActive && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <div className="bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-400/40 shadow-[0_0_16px_rgba(52,211,153,0.5)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </span>
              <span className="text-emerald-300 text-[10px] font-bold tracking-tight drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]">
                Season Active
              </span>
            </div>
          </div>
        )}

        {/* Bottom content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1 opacity-80 pointer-events-auto">
            <MapPin className="w-3 h-3 text-[#ff5100]" />
            <Link 
              href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-white text-[10px] font-medium tracking-wide hover:text-[#ff5100] transition-colors"
            >
              {adventure.state}
            </Link>
          </div>
          <h3 className="text-white font-bold text-lg leading-tight tracking-tight group-hover:text-[#ff5100] transition-colors pointer-events-none">
            {adventure.name}
          </h3>
        </div>
      </div>

      {/* Dashboard body */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
        {/* Stats row */}
        <div className="flex items-center justify-between text-[11px] text-white/45 font-medium">
          <span>{adventure.duration}</span>
          {operatorCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {operatorCount} operator{operatorCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/6" />

        {/* Add to Compare button */}
        <button
          onClick={handleCompare}
          disabled={!selected && isFull}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
            selected
              ? "bg-[#ff5100] text-white shadow-[0_0_20px_rgba(255,81,0,0.4)]"
              : isFull
              ? "bg-white/4 text-white/25 cursor-not-allowed"
              : "bg-white/6 text-white/60 hover:bg-[#ff5100]/15 hover:text-[#ff5100] border border-white/8 hover:border-[#ff5100]/30"
          }`}
        >
          {selected ? (
            <>
              <CheckCheck className="w-3.5 h-3.5" />
              Added to Compare
            </>
          ) : (
            <>
              <GitCompareArrows className="w-3.5 h-3.5" />
                {isFull ? "Compare Full (6/6)" : "Add to Compare"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
