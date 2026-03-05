"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck } from "lucide-react";
import type { Adventure, Month } from "@/lib/data";
import Pill from "./Pill";

interface AdventureCardProps {
  adventure: Adventure;
  size?: "default" | "large";
}

function formatSeasonShort(bestMonths: Month[]): string {
  if (!bestMonths || bestMonths.length === 0) return "";
  if (bestMonths.length === 1) return bestMonths[0];
  return `${bestMonths[0]}–${bestMonths[bestMonths.length - 1]}`;
}

export default function AdventureCard({ adventure, size = "default" }: AdventureCardProps) {
  const isLarge = size === "large";
  const months: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = months[new Date().getMonth()];
  const isSeasonActive = adventure.bestMonths.includes(currentMonth);
  const seasonLabel = formatSeasonShort(adventure.bestMonths);
  const operatorCount = adventure.operators?.length ?? 0;

  const verifiedOps = adventure.operators?.filter(o => o.verified) ?? [];
  const allPrices = adventure.operators
    ?.map(o => parseInt(o.priceFrom.replace(/[^\d]/g, "")))
    .filter(p => !isNaN(p)) ?? [];
  const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
  const displayCount = verifiedOps.length > 0 ? verifiedOps.length : operatorCount;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      {/* Image area */}
      <div className="relative w-full overflow-hidden block group" style={{ aspectRatio: isLarge ? "16/9" : "4/3" }}>
        <Link href={`/experiences/${adventure.slug}`} className="absolute inset-0 z-10" />
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          quality={100}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: "brightness(1.05) contrast(1.1) saturate(1.1)" }}
          sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-10 pointer-events-none" />

        {/* Pills — top left */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
          <Pill type="type" value={adventure.type} />
          <Pill type="difficulty" value={adventure.difficulty} />
        </div>

          {/* Season pill — top right */}
          {isSeasonActive ? (
            <span className="absolute top-3 right-3 z-20 pointer-events-none text-[10px] font-bold px-2.5 py-1 rounded-full tracking-tight flex items-center gap-1" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", boxShadow: "0 0 0 1px rgba(16,185,129,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Season Active
            </span>
          ) : seasonLabel ? (
            <span className="absolute top-3 right-3 z-20 pointer-events-none text-[10px] font-bold px-2.5 py-1 rounded-full tracking-tight" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}>
              {seasonLabel}
            </span>
          ) : null}

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
          <p className="text-white/60 text-[11px] leading-snug mt-1 pointer-events-none line-clamp-2">
            {adventure.tagline}
          </p>
        </div>
      </div>

        {/* Dashboard — duration left, operators right */}
        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-[10px] font-medium leading-none">{adventure.durationDays}</span>
              {(adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-white/50 text-[10px] font-medium leading-none">{adventure.baseCamp}</span>
              </>
            )}
          </div>

          {operatorCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] leading-none">
              <BadgeCheck className="w-3 h-3 text-emerald-400/80 shrink-0" />
                <span className="text-white/40">
                  <span className="text-white/65 font-semibold">{displayCount}</span> operators
                  {lowestPrice && (
                    <>
                      <span className="text-white/20 mx-1">·</span>
                      <span className="text-[#ff5100]/85 font-semibold">₹{lowestPrice.toLocaleString("en-IN")} onwards</span>
                    </>
                  )}
                </span>
            </div>
          )}
        </div>
    </div>
  );
}
