"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, GitCompare, Star } from "lucide-react";
import { toast } from "sonner";
import { awardXP, revokeXP } from "@/lib/awardXP";
import type { Adventure, Month } from "@/lib/data";
import { getACE, computeDifficulty, computeMatchScore } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import Pill from "./Pill";
import DifficultyMeter from "./DifficultyMeter";
import SaveButton from "./SaveButton";
import CheckInButton from "./CheckInButton";
import { useCompare } from "@/contexts/CompareContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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


export default function AdventureCard({ adventure, size = "default", fromPage }: AdventureCardProps) {
  const isLarge = size === "large";
  const difficulty = computeDifficulty(getACE(adventure));
  const { isSelected, add, remove, isFull } = useCompare();
  const inCompare = isSelected(adventure.id);
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
      const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
      return () => listener.subscription.unsubscribe();
    });
  }, []);

  useEffect(() => {
    const profile = loadProfile();
    if (profile?.ace) {
      setMatchScore(computeMatchScore(profile.ace, getACE(adventure)));
    }
  }, [adventure]);

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      remove(adventure.id);
      toast("Removed from compare");
      revokeXP("compare", adventure.slug);
    } else if (isFull) {
      toast.error("Remove an adventure to add another.");
    } else {
      add(adventure);
      toast.success("Added to compare");
      if (loggedIn) awardXP("compare");
    }
  }
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
    <div className="flex flex-col">
      {/* Fixed-height slot above every card — keeps grid rows aligned */}
      <div className="h-7 flex items-center">
        {adventure.editorChoice && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full relative overflow-hidden"
            style={{
              background: "linear-gradient(105deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)",
              border: "1px solid rgba(255,81,0,0.35)",
              boxShadow: "0 0 12px rgba(255,81,0,0.2), inset 0 1px 0 rgba(255,140,80,0.15)",
            }}
          >
            {/* shimmer line */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,120,60,0.08) 50%, transparent 70%)" }} />
            <Star className="w-2.5 h-2.5 shrink-0" style={{ color: "#ff7d47", fill: "#ff7d47", filter: "drop-shadow(0 0 3px rgba(255,81,0,0.7))" }} />
            <span
              className="text-[9px] font-bold tracking-[0.22em] uppercase leading-none"
              style={{ color: "#ffb38a", letterSpacing: "0.22em" }}
            >
              Editor&apos;s Choice
            </span>
          </div>
        )}
      </div>

      <motion.div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
        whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(255,81,0,0.15)" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
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

        {/* Top-left: difficulty + season */}
        <div className="absolute z-20 flex flex-wrap items-center gap-1.5 top-3 left-3">
          <DifficultyMeter difficulty={difficulty} />
          {isSeasonActive ? (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1 backdrop-blur-sm" style={{ background: "rgba(6,78,59,0.8)", color: "#6ee7b7", boxShadow: "0 0 0 1px rgba(110,231,183,0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Season Active
            </span>
          ) : isSeasonUpcoming ? (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1 backdrop-blur-sm" style={{ background: "rgba(120,53,15,0.8)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(253,230,138,0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Upcoming
            </span>
          ) : seasonLabel ? (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.9)", boxShadow: "0 0 0 1px rgba(255,255,255,0.15)" }}>
              {seasonLabel}
            </span>
          ) : null}
        </div>

        {/* Top-right: Save + CheckIn buttons */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <SaveButton slug={adventure.slug} variant="card" />
          <CheckInButton slug={adventure.slug} variant="card" />
        </div>

        {/* Bottom content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
          {/* Type + location pills above name */}
          <div className="flex items-center gap-1.5 mb-1.5 pointer-events-auto">
            <Pill type="type" value={adventure.type} />
            <Pill type="subRegion" value={adventure.state} />
          </div>
          <h3 className="text-white font-bold text-base sm:text-lg leading-tight tracking-tight group-hover:text-[#ff5100] transition-colors pointer-events-none">
            {adventure.name}
          </h3>
          <p className="text-white/60 text-[11px] leading-snug mt-1 pointer-events-none line-clamp-2">
            {adventure.tagline}
          </p>
        </div>
      </div>

        {/* Dashboard — duration + operators, then compare button */}
        <div className="px-3 pt-2.5 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] leading-none min-w-0 truncate" style={{ color: "var(--text-tertiary)" }}>
            <span className="font-medium shrink-0" style={{ color: "var(--text-secondary)" }}>{adventure.durationDays}</span>
            {operatorCount > 0 && (
              <>
                <span className="mx-0.5" style={{ color: "var(--text-muted)" }}>·</span>
                <BadgeCheck className="w-3 h-3 text-emerald-400/80 shrink-0" />
                <span><span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{displayCount}</span> {displayCount === 1 ? "operator" : "operators"}</span>
                {lowestPrice && (
                  <>
                    <span className="mx-0.5" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-[#ff5100]/85 font-semibold shrink-0">₹{lowestPrice.toLocaleString("en-IN")} onwards</span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Compare pill */}
          <button
            onClick={handleCompare}
            disabled={!inCompare && isFull}
            aria-label={inCompare ? "Remove from compare" : "Add to Compare"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 active:scale-95 shrink-0 disabled:opacity-35 disabled:cursor-not-allowed select-none"
            style={inCompare
              ? { background: "rgba(255,81,0,0.18)", color: "#ff7d47", boxShadow: "0 0 0 1.5px rgba(255,81,0,0.45)" }
              : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }
            }
          >
            <GitCompare className="w-3 h-3 shrink-0" />
            {inCompare ? "Added" : "Compare"}
          </button>
        </div>

        {/* Capability match bar */}
        {matchScore !== null && (() => {
          const pct = matchScore;
          const isGreat  = pct >= 80;
          const isGood   = pct >= 55;
          const color    = isGreat ? "#10b981" : isGood ? "#f59e0b" : "#f43f5e";
          const bgColor  = isGreat ? "rgba(16,185,129,0.08)"  : isGood ? "rgba(245,158,11,0.08)"  : "rgba(244,63,94,0.08)";
          const bdColor  = isGreat ? "rgba(16,185,129,0.18)"  : isGood ? "rgba(245,158,11,0.18)"  : "rgba(244,63,94,0.18)";
          return (
            <div className="px-3 pb-3 pt-0">
              <div
                className="rounded-lg px-2.5 py-1.5 flex items-center gap-2"
                style={{ background: bgColor, border: `1px solid ${bdColor}` }}
              >
                <span className="text-[10px] font-black tabular-nums shrink-0" style={{ color }}>{pct}%</span>
                <div className="flex-1 min-w-0">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
                    />
                  </div>
                </div>
                <span className="text-[9px] font-bold tracking-wide shrink-0" style={{ color: `${color}cc` }}>
                  ACE<sup className="text-[0.7em]">™</sup> Ready
                </span>
              </div>
            </div>
          );
        })()}
      </motion.div>
    </div>
  );
}
