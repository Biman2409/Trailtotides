"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, GitCompare, Crown } from "lucide-react";
import { toast } from "sonner";
import { awardXP, revokeXP } from "@/lib/awardXP";
import { getLowestPrice, type Adventure, type Month } from "@/lib/data";
import { getACE, computeDifficulty, computeMatchScore } from "@/lib/ace";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { bucketFor } from "@/lib/fitness";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import DifficultyMeter from "./DifficultyMeter";
import SaveButton from "./SaveButton";
import { useCompare } from "@/contexts/CompareContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { keyStat } from "@/lib/keyStat";
import { useClientMonth } from "@/lib/useClientMonth";

interface AdventureCardProps {
  adventure: Adventure;
  size?: "default" | "large";
  fromPage?: number;
  /** What sits in the slot above the card: omitted → Editor's Choice badge when applicable,
   *  false → no slot at all, a node → that instead (e.g. a "season ends Nov" note). */
  badge?: React.ReactNode | false;
  /** Stretch to fill its grid cell (image grows) — used for the large Editor's Choice feature. */
  fill?: boolean;
}

const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatSeasonShort(bestMonths: Month[]): string {
  if (!bestMonths || bestMonths.length === 0) return "";
  if (bestMonths.length === 1) return bestMonths[0];
  return `${bestMonths[0]}–${bestMonths[bestMonths.length - 1]}`;
}


// Adventure type → category tint class (colors defined in globals.css)
const CATEGORY_CLASS: Partial<Record<Adventure["type"], string>> = {
  Trekking: "cat-trek", Mountaineering: "cat-trek", Scrambling: "cat-trek", "Rock Climbing": "cat-trek",
  Skiing: "cat-trek", "Ice Skating": "cat-trek",
  Diving: "cat-water", Kayaking: "cat-water",
  Paragliding: "cat-air", "Hot Air Balloon": "cat-air",
  Motorcycling: "cat-desert", "Jeep Safari": "cat-desert", Cycling: "cat-desert",
  Caving: "cat-forest", "Urban Adventure": "cat-forest",
};

export default function AdventureCard({ adventure, size = "default", fromPage, badge, fill = false }: AdventureCardProps) {
  const isLarge = size === "large";
  const difficulty = computeDifficulty(getACE(adventure));
  const stat = keyStat(adventure);
  const { isSelected, add, remove, isFull } = useCompare();
  const inCompare = isSelected(adventure.id);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  // Match uses the Matchmaker profile with completed trips folded in
  const { ace: fitnessAce } = useFitnessProfile();
  const matchScore = fitnessAce ? computeMatchScore(fitnessAce, getACE(adventure)) : null;

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
      const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
      return () => listener.subscription.unsubscribe();
    });
  }, []);

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
  // "In season" needs today's month, which a cached page can't know: the season range shows
  // until the page is running, then the live label takes over
  const monthIndex = useClientMonth();
  const isSeasonActive = monthIndex !== null && adventure.bestMonths.includes(MONTHS[monthIndex]);
  const isSeasonUpcoming = monthIndex !== null && !isSeasonActive && adventure.bestMonths.includes(MONTHS[(monthIndex + 1) % 12]);
  const seasonLabel = formatSeasonShort(adventure.bestMonths);
  const operatorCount = adventure.operators?.length ?? 0;

  const verifiedCount = adventure.operators?.filter(o => o.verified).length ?? 0;
  const lowestPrice = getLowestPrice(adventure);
  const displayCount = verifiedCount > 0 ? verifiedCount : operatorCount;

  return (
    <div className={`flex flex-col ${fill ? "h-full" : ""}`}>
      {/* Fixed-height slot above every card — keeps grid rows aligned */}
      {badge !== false && (
      <div className="h-7 flex items-center">
        {badge !== undefined ? badge : adventure.editorChoice && (
          <div
            className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full backdrop-blur-md"
            style={{ background: "rgba(10,8,6,0.72)", border: "1px solid rgba(255,179,122,0.3)" }}
          >
            <Crown className="w-3 h-3 shrink-0" style={{ color: "#ffb37a" }} />
            <span className="text-[9px] font-bold tracking-[0.16em] uppercase leading-none" style={{ color: "#ffd9b8" }}>
              Editor&apos;s Choice
            </span>
          </div>
        )}
      </div>
      )}

      <motion.div
        className={`${CATEGORY_CLASS[adventure.type] ?? "cat-trek"} rounded-[20px] overflow-hidden flex flex-col ${fill ? "flex-1" : ""}`}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 1px 2px rgba(var(--shadow-color), 0.12), 0 8px 24px -12px rgba(var(--shadow-color), 0.35)",
        }}
        whileHover={{ y: -4, boxShadow: "0 1px 2px rgba(var(--shadow-color), 0.12), 0 22px 44px -18px rgba(var(--shadow-color), 0.55)" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
      {/* Image area — kept calm: difficulty and save on the photo, everything else below it */}
      <div className={`relative w-full overflow-hidden block group ${fill ? "flex-1 min-h-[260px]" : isLarge ? "aspect-video" : "aspect-video sm:aspect-[4/3]"}`}>
        <Link href={`/experiences/${adventure.slug}${fromPage && fromPage > 1 ? `?from=${fromPage}` : ""}`} aria-label={adventure.name} className="absolute inset-0 z-10" />
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          quality={75}
          className="photo-grade object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes={fill ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        />

        {/* Shading: a long soft fade under the title, and a faint one at the top for the pills */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(8,6,4,0.88) 0%, rgba(8,6,4,0.45) 32%, rgba(8,6,4,0) 62%), linear-gradient(to bottom, rgba(8,6,4,0.35) 0%, rgba(8,6,4,0) 28%)" }} />

        {/* Top-left: difficulty, then how long and when, as matching pills in one row. The row
            stops short of save and compare (right-[84px]); on the narrowest cards the season
            text shortens with an ellipsis rather than running under the buttons. */}
        <div className="absolute z-20 top-3 left-3 right-[84px] flex items-center gap-1.5 min-w-0">
          <DifficultyMeter difficulty={difficulty} className="shrink-0" />
          <span
            className="inline-flex items-center gap-1 px-2 h-5 min-w-0 rounded-full text-[10px] font-bold tracking-tight leading-none text-white/85 backdrop-blur-md whitespace-nowrap"
            style={{ background: "rgba(10,8,6,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="shrink-0">{adventure.durationDays}</span>
            {(isSeasonActive || isSeasonUpcoming || seasonLabel) && (
              <>
                <span className={`w-1.5 h-1.5 ml-0.5 rounded-full shrink-0 ${isSeasonActive ? "bg-emerald-400" : isSeasonUpcoming ? "bg-amber-400" : "bg-white/40"}`} />
                <span className="truncate">{isSeasonActive ? "In season" : isSeasonUpcoming ? "Next month" : seasonLabel}</span>
              </>
            )}
          </span>
        </div>

        {/* Top-right: save and compare, as twin round buttons */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <SaveButton slug={adventure.slug} variant="card" />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCompare}
                disabled={!inCompare && isFull}
                aria-label={inCompare ? "Remove from compare" : "Add to compare"}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={inCompare
                  ? { background: "rgba(255,81,0,0.9)", color: "#fff", boxShadow: "0 0 0 1px rgba(255,81,0,0.5), 0 0 10px rgba(255,81,0,0.3)" }
                  : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }
                }
              >
                <GitCompare className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{inCompare ? "In compare" : isFull ? "Compare is full (3)" : "Add to compare"}</TooltipContent>
          </Tooltip>
        </div>

        {/* Bottom of the photo: title 100% → tagline 75% */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 pointer-events-none ${fill ? "p-5 lg:p-6" : "p-4"}`}>
          {/* The title in the site's display serif, like its headlines */}
          <h3
            className={`text-white leading-[1.12] tracking-[-0.01em] group-hover:text-[#ffb08a] transition-colors pointer-events-none ${fill ? "text-[28px] lg:text-[34px]" : "text-[19px] sm:text-xl"}`}
            style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 }}
          >
            {adventure.name}
          </h3>
          <p className={`text-white/70 leading-snug mt-1.5 pointer-events-none ${fill ? "text-sm line-clamp-2 max-w-lg" : "text-[11px] line-clamp-1"}`}>
            {adventure.tagline}
          </p>
        </div>
      </div>

        {/* Below the photo, the same on every card (difficulty, duration and season sit on the
            photo; save and compare at its top-right):
              1. place, type and the type's key number (altitude, distance, rapid grade) in small
                 spaced capitals, the category icon carrying the colour
              2. a hairline, then the starting price large in the display serif, with how many
                 operators offer it as a quiet outlined tag */}
        <div className="px-4 pt-3 pb-4">
          <p className="flex items-center gap-1.5 min-w-0 text-[10px] font-semibold uppercase tracking-[0.14em] leading-none" style={{ color: "var(--text-tertiary)" }}>
            <span className="shrink-0" style={{ color: "var(--cat)" }}>{ADVENTURE_TYPE_ICONS[adventure.type]?.(12)}</span>
            <span className="truncate">{adventure.state}</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span className="shrink-0">{adventure.type}</span>
            {stat && (
              <>
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span className="shrink-0 tabular-nums" style={{ color: "var(--text-secondary)" }}>{stat}</span>
              </>
            )}
          </p>
          <div className="mt-3 pt-3 flex items-end justify-between gap-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="min-w-0">
              <span className="block text-[10px] font-medium leading-none mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                {lowestPrice ? "Starting from" : "Price"}
              </span>
              {lowestPrice ? (
                <span className="block text-[22px] tabular-nums leading-none tracking-[-0.01em]" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 }}>
                  ₹{lowestPrice.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="block text-sm font-semibold leading-none" style={{ color: "var(--text-secondary)" }}>On request</span>
              )}
            </div>
            {operatorCount > 0 && (
              <span
                className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-medium leading-none whitespace-nowrap shrink-0"
                style={{ color: "var(--text-secondary)", boxShadow: "inset 0 0 0 1px var(--border-default)" }}
              >
                <BadgeCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />{displayCount} {displayCount === 1 ? "operator" : "operators"}
              </span>
            )}
          </div>
        </div>

        {/* Capability match bar */}
        {/* Capability match: the bucket colour carries the status (percentage + bar), the
            label stays neutral — and names the actual bucket, not "Ready" for every score */}
        {matchScore !== null && (() => {
          const pct = matchScore;
          const b = bucketFor(pct);
          return (
            <div className="px-3 pb-3 pt-0">
              <div
                className="rounded-lg px-2.5 py-1.5 flex items-center gap-2"
                style={{ background: b.bg.replace("0.12", "0.07"), border: `1px solid ${b.bg.replace("0.12", "0.2")}` }}
              >
                <span className="text-[10px] font-black tabular-nums shrink-0" style={{ color: b.color }}>{pct}%</span>
                <div className="flex-1 min-w-0">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${b.color}99, ${b.color})` }}
                    />
                  </div>
                </div>
                <span className="text-[9px] font-bold tracking-wide shrink-0" style={{ color: "var(--text-secondary)" }}>
                  {b.label}
                </span>
              </div>
            </div>
          );
        })()}
      </motion.div>
    </div>
  );
}
