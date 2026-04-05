"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck } from "lucide-react";
import type { Adventure, Month } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";
import Pill from "./Pill";

interface AdventureCardProps {
  adventure: Adventure;
  size?: "default" | "large";
  fromPage?: number;
}

const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatSeasonShort(bestMonths: Month[]): string {
  if (!bestMonths || bestMonths.length === 0) return "";
  if (bestMonths.length === 1) return bestMonths[0];
  return `${bestMonths[0]}–${bestMonths[bestMonths.length - 1]}`;
}

const DIFFICULTY_CONFIG: Record<string, { level: number; color: string; glow: string; label: string }> = {
  Easy:     { level: 1, color: "#10b981", glow: "#10b98155", label: "Easy" },
  Moderate: { level: 2, color: "#38bdf8", glow: "#38bdf855", label: "Moderate" },
  Hard:     { level: 3, color: "#a78bfa", glow: "#a78bfa55", label: "Hard" },
  Advanced: { level: 4, color: "#ff5100", glow: "#ff510055", label: "Advanced" },
  Extreme:  { level: 5, color: "#ef4444", glow: "#ef444455", label: "Extreme" },
};

function DifficultyMeter({ difficulty }: { difficulty: string }) {
  const cfg = DIFFICULTY_CONFIG[difficulty] ?? { level: 1, color: "#10b981", glow: "#10b98155", label: difficulty };
  return (
    <div
      className="inline-flex items-center gap-2 px-2.5 h-5 rounded-full text-[10px] font-bold tracking-tight shadow-sm"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Label */}
      <span
        className="font-bold leading-none"
        style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.glow}` }}
      >
        {cfg.label}
      </span>

      {/* Segmented bar */}
      <div className="flex items-center gap-[3px]">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= cfg.level;
          const isLast = i === cfg.level;
          return (
            <div
              key={i}
              style={{
                width: i === cfg.level ? 14 : 5,
                height: 3,
                borderRadius: 99,
                background: filled ? cfg.color : "rgba(255,255,255,0.12)",
                boxShadow: filled && isLast ? `0 0 6px ${cfg.color}, 0 0 12px ${cfg.glow}` : "none",
                transition: "all 0.2s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function AdventureCard({ adventure, size = "default", fromPage }: AdventureCardProps) {
  const isLarge = size === "large";
  const difficulty = computeDifficulty(getACE(adventure));
  const monthIndex = new Date().getMonth();
  const currentMonth = MONTHS[monthIndex];
  const nextMonth = MONTHS[(monthIndex + 1) % 12];
  const isSeasonActive = adventure.bestMonths.includes(currentMonth);
  const isSeasonUpcoming = !isSeasonActive && adventure.bestMonths.includes(nextMonth);
  const seasonLabel = formatSeasonShort(adventure.bestMonths);
  const operatorCount = adventure.operators?.length ?? 0;

  const verifiedCount = adventure.operators?.filter(o => o.verified).length ?? 0;
  const lowestPrice = adventure.operators?.reduce<number | null>((min, o) => {
    const p = parseInt(o.priceFrom.replace(/[^\d]/g, ""), 10);
    if (isNaN(p)) return min;
    return min === null ? p : Math.min(min, p);
  }, null) ?? null;
  const displayCount = verifiedCount > 0 ? verifiedCount : operatorCount;

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
      <div className={`relative w-full overflow-hidden block group ${isLarge ? "aspect-video" : "aspect-[4/3]"}`}>
        <Link href={`/experiences/${adventure.slug}${fromPage && fromPage > 1 ? `?from=${fromPage}` : ""}`} className="absolute inset-0 z-10" />
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          quality={90}
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          style={{ filter: "brightness(1.02) contrast(1) saturate(0.95)" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Cinematic colour-grade overlay — unifies tone across all images */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(160deg, rgba(30,60,110,0.10) 0%, rgba(10,30,60,0.06) 50%, rgba(80,30,10,0.08) 100%)", mixBlendMode: "multiply" }} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-10 pointer-events-none" />

        {/* Pills — top left */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
          <Pill type="type" value={adventure.type} />
          <DifficultyMeter difficulty={difficulty} />
        </div>

          {/* Season pill — top right */}
          {isSeasonActive ? (
            <span className="absolute top-3 right-3 z-20 pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", boxShadow: "0 0 0 1px rgba(16,185,129,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Season Active
            </span>
          ) : isSeasonUpcoming ? (
            <span className="absolute top-3 right-3 z-20 pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(251,191,36,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Upcoming
            </span>
          ) : seasonLabel ? (
            <span className="absolute top-3 right-3 z-20 pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}>
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
          <span className="text-white/50 text-[10px] font-medium leading-none">{adventure.durationDays}</span>

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
