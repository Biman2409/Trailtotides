"use client";

import { ChevronRight, Star, Users, ShieldCheck, Clock3, Sparkles } from "lucide-react";
import type { SeasonUrgency } from "@/lib/seasonUrgency";

interface Props {
  priceFrom?: string;
  operatorCount: number;
  avgRating: number | null;
  operatorWebsite?: string;
  operatorName?: string;
  hasVerifiedOperator?: boolean;
  seasonUrgency: SeasonUrgency | null;
}

function UrgencyBadge({ urgency }: { urgency: SeasonUrgency }) {
  if (urgency.kind === "ending") {
    return (
      <div
        className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
        style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
      >
        <Clock3 className="w-3 h-3 shrink-0" />
        Only {urgency.weeksLeft} week{urgency.weeksLeft !== 1 ? "s" : ""} left in season
      </div>
    );
  }
  if (urgency.kind === "upcoming") {
    return (
      <div
        className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
        style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8" }}
      >
        <Sparkles className="w-3 h-3 shrink-0" />
        Season opens in {urgency.weeksUntil} week{urgency.weeksUntil !== 1 ? "s" : ""}
      </div>
    );
  }
  return null;
}

export default function BookingSidebarCard({ priceFrom, operatorCount, avgRating, operatorWebsite, operatorName, hasVerifiedOperator, seasonUrgency }: Props) {
  const handleBook = () => {
    if (operatorWebsite) {
      window.open(operatorWebsite, "_blank", "noopener noreferrer");
    } else {
      document.getElementById("book-this-adventure")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBrowse = () => {
    document.getElementById("book-this-adventure")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,81,0,0.18)", background: "linear-gradient(135deg, rgba(255,81,0,0.07) 0%, rgba(255,81,0,0.02) 100%)" }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {priceFrom ? (
              <p className="leading-none">
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wide block mb-1">From</span>
                <span className="text-white font-bold text-2xl">{priceFrom}</span>
              </p>
            ) : (
              <p className="text-white/50 text-sm font-semibold">Contact for pricing</p>
            )}
          </div>
          {avgRating !== null && (
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-white/80 text-sm font-semibold">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-white/40 text-[11px] font-medium">
          {operatorCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {operatorCount} operator{operatorCount !== 1 ? "s" : ""}
            </span>
          )}
          {hasVerifiedOperator && (
            <span className="flex items-center gap-1.5" style={{ color: "#34d399" }}>
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {seasonUrgency && <UrgencyBadge urgency={seasonUrgency} />}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleBook}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-white text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)",
              boxShadow: "0 4px 20px rgba(255,81,0,0.35), 0 0 0 1px rgba(255,81,0,0.2)",
            }}
          >
            {operatorWebsite && operatorName ? `Book with ${operatorName}` : "Book Now"}
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleBrowse}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Compare Operators
          </button>
        </div>
      </div>
    </div>
  );
}
