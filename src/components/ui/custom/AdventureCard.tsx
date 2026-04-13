"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, GitCompare, Star } from "lucide-react";
import { toast } from "sonner";
import { awardXP } from "@/lib/awardXP";
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
    if (loggedIn === false) {
      toast.error("Log in to compare adventures.", {
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
      return;
    }
    if (inCompare) {
      remove(adventure.id);
      toast("Removed from compare");
    } else if (isFull) {
      toast.error("Remove an adventure to add another.");
    } else {
      add(adventure);
      toast.success("Added to compare");
      awardXP("compare");
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
              Editor's Choice
            </span>
          </div>
        )}
      </div>

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

        {/* Top-left: difficulty + season */}
        <div className="absolute z-20 flex flex-wrap items-center gap-1.5 top-3 left-3">
          <DifficultyMeter difficulty={difficulty} />
          {matchScore !== null && (() => {
            const pct = matchScore;
            const color = pct >= 80 ? "#10b981" : pct >= 55 ? "#f59e0b" : "#f43f5e";
            const bg   = pct >= 80 ? "rgba(16,185,129,0.22)" : pct >= 55 ? "rgba(245,158,11,0.18)" : "rgba(244,63,94,0.18)";
            const ring = pct >= 80 ? "rgba(16,185,129,0.4)"  : pct >= 55 ? "rgba(245,158,11,0.35)" : "rgba(244,63,94,0.35)";
            const label = pct >= 80 ? "Great fit" : pct >= 55 ? "Good fit" : "Tough fit";
            // mini arc SVG
            const r = 7, circ = 2 * Math.PI * r;
            const dash = (pct / 100) * circ;
            return (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold leading-none"
                style={{ background: bg, color, boxShadow: `0 0 0 1px ${ring}` }}
                title={`${pct}% match with your ACE profile`}
              >
                {/* mini progress arc */}
                <svg width="14" height="14" viewBox="0 0 18 18" className="-rotate-90">
                  <circle cx="9" cy="9" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
                  <circle cx="9" cy="9" r={r} fill="none" stroke={color} strokeWidth="2.5"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
                </svg>
                {pct}% · {label}
              </span>
            );
          })()}
          {isSeasonActive ? (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", boxShadow: "0 0 0 1px rgba(16,185,129,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Season Active
            </span>
          ) : isSeasonUpcoming ? (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(251,191,36,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Upcoming
            </span>
          ) : seasonLabel ? (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}>
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
          <h3 className="text-white font-bold text-lg leading-tight tracking-tight group-hover:text-[#ff5100] transition-colors pointer-events-none">
            {adventure.name}
          </h3>
          <p className="text-white/60 text-[11px] leading-snug mt-1 pointer-events-none line-clamp-2">
            {adventure.tagline}
          </p>
        </div>
      </div>

        {/* Dashboard — duration + operators, then compare button */}
        <div className="px-3 pt-2.5 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] leading-none min-w-0 truncate text-white/40">
            <span className="text-white/60 font-medium shrink-0">{adventure.durationDays}</span>
            {operatorCount > 0 && (
              <>
                <span className="text-white/20 mx-0.5">·</span>
                <BadgeCheck className="w-3 h-3 text-emerald-400/80 shrink-0" />
                <span><span className="text-white/60 font-semibold">{displayCount}</span> {displayCount === 1 ? "operator" : "operators"}</span>
                {lowestPrice && (
                  <>
                    <span className="text-white/20 mx-0.5">·</span>
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
      </div>
    </div>
  );
}
