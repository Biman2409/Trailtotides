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
      <div className="relative w-full overflow-hidden block group" style={{ height: isLarge ? "260px" : "200px" }}>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 z-10 pointer-events-none" />

        {/* Pills — top left */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
          <Pill type="type" value={adventure.type} />
          <Pill type="difficulty" value={adventure.difficulty} />
        </div>

          {/* Season label — top right (only when season is not active) */}
          {!isSeasonActive && seasonLabel && (
            <span className="absolute top-3 right-3 z-20 pointer-events-none text-[10px] font-bold px-2.5 py-1 rounded-full tracking-tight shadow-sm bg-white/15 text-white/80 backdrop-blur-sm">
              {seasonLabel}
            </span>
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

      {/* Dashboard — duration left, operators right */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-white/55 text-[11px] font-medium">{adventure.durationDays}</span>

          {operatorCount > 0 && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <BadgeCheck className="w-3 h-3 text-emerald-400/80 shrink-0" />
                <span className="text-white/45">
                  <span className="text-white/70 font-semibold">{displayCount}</span> operators
                {lowestPrice && (
                  <>
                    <span className="text-white/25 mx-1">·</span>
                    <span className="text-[#ff5100]/90 font-semibold">from ₹{lowestPrice.toLocaleString("en-IN")}</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
