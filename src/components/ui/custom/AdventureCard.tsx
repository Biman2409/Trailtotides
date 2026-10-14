"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, GitCompare, Crown } from "lucide-react";
import { toast } from "sonner";
import { awardXP, revokeXP } from "@/lib/awardXP";
import { getLowestPrice, type Adventure, type Month } from "@/lib/data";
import { getACE, computeDifficulty, computeMatchScore } from "@/lib/ace";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { formatAltitude } from "@/lib/exploreHelpers";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import DifficultyMeter from "./DifficultyMeter";
import SaveButton from "./SaveButton";
import { useCompare } from "@/contexts/CompareContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  const monthIndex = new Date().getMonth();
  const currentMonth = MONTHS[monthIndex];
  const nextMonth = MONTHS[(monthIndex + 1) % 12];
  const isSeasonActive = adventure.bestMonths.includes(currentMonth);
  const isSeasonUpcoming = !isSeasonActive && adventure.bestMonths.includes(nextMonth);
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
        className={`${CATEGORY_CLASS[adventure.type] ?? "cat-trek"} rounded-2xl overflow-hidden flex flex-col ${fill ? "flex-1" : ""}`}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderTop: "2px solid var(--cat)",
          boxShadow: "0 4px 20px rgba(var(--shadow-color), 0.2)",
        }}
        whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(255,81,0,0.15)" }}
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

        {/* Gradient overlay — only as dark as the text at the bottom needs */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent z-10 pointer-events-none" />

        {/* Top-left: difficulty */}
        <div className="absolute z-20 top-3 left-3">
          <DifficultyMeter difficulty={difficulty} />
        </div>

        {/* Top-right: save */}
        <div className="absolute top-3 right-3 z-20">
          <SaveButton slug={adventure.slug} variant="card" />
        </div>

        {/* Bottom content over image */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 pointer-events-none ${fill ? "p-5 lg:p-6" : "p-4"}`}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5 text-white/70">
            <span className="inline-flex items-center gap-1 shrink-0" style={{ color: "color-mix(in srgb, var(--cat) 65%, white)" }}>
              {ADVENTURE_TYPE_ICONS[adventure.type]?.(11)}
              {adventure.type}
            </span>
            <span className="text-white/35">·</span>
            <span className="truncate">{adventure.state}</span>
          </div>
          <h3 className={`text-white font-bold leading-tight tracking-tight group-hover:text-[#ff8a5c] transition-colors pointer-events-none ${fill ? "text-2xl lg:text-3xl" : "text-base sm:text-lg"}`}>
            {adventure.name}
          </h3>
          <p className={`text-white/65 leading-snug mt-1 pointer-events-none ${fill ? "text-sm line-clamp-2 max-w-lg" : "text-[11px] line-clamp-1"}`}>
            {adventure.tagline}
          </p>
        </div>
      </div>

        {/* Dashboard — price on its own line so it never truncates, duration + operators beneath, then compare button */}
        <div className="px-3 pt-2.5 pb-2 flex items-center justify-between gap-2">
          <div className="min-w-0 flex flex-col gap-1">
            {/* Price + season on the first line, so the facts line below stays short enough to never truncate */}
            <span className="flex items-center gap-2 text-[13px] leading-none whitespace-nowrap">
              {operatorCount > 0 && lowestPrice && (
                <span className="font-semibold text-[#ff5100]">
                  <span className="text-[10px] font-medium mr-1" style={{ color: "var(--text-tertiary)" }}>From</span>
                  ₹{lowestPrice.toLocaleString("en-IN")}
                </span>
              )}
              {isSeasonActive ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400/90"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />In season</span>
              ) : isSeasonUpcoming ? (
                <span className="text-[10px] font-medium text-amber-400/90">Next month</span>
              ) : seasonLabel ? (
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{seasonLabel}</span>
              ) : null}
            </span>
            <div className="flex items-center gap-1 text-[10px] leading-none min-w-0 truncate" style={{ color: "var(--text-tertiary)" }}>
              <span className="font-medium shrink-0" style={{ color: "var(--text-secondary)" }}>{adventure.durationDays}</span>
              {formatAltitude(adventure) && (
                <>
                  <span className="mx-0.5" style={{ color: "var(--text-muted)" }}>·</span>
                  <span className="shrink-0">{formatAltitude(adventure)}</span>
                </>
              )}
              {operatorCount > 0 && (
                <>
                  <span className="mx-0.5" style={{ color: "var(--text-muted)" }}>·</span>
                  <BadgeCheck className="w-3 h-3 text-emerald-400/80 shrink-0" />
                  <span><span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{displayCount}</span> {displayCount === 1 ? "operator" : "operators"}</span>
                </>
              )}
            </div>
          </div>

          {/* Compare pill */}
          <button
            onClick={handleCompare}
            disabled={!inCompare && isFull}
            aria-label={inCompare ? "Remove from compare" : "Add to Compare"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 active:scale-95 shrink-0 disabled:opacity-35 disabled:cursor-not-allowed select-none"
            style={inCompare
              ? { background: "rgba(255,81,0,0.18)", color: "#ff7d47", boxShadow: "0 0 0 1.5px rgba(255,81,0,0.45)" }
              : { background: "var(--bg-card-hover)", color: "var(--text-secondary)", boxShadow: "0 0 0 1px var(--border-default)" }
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
