"use client";

import { ChevronRight, Clock3, Sparkles } from "lucide-react";
import type { SeasonUrgency } from "@/lib/seasonUrgency";
import QuoteRequestButton from "./QuoteRequestButton";

interface Props {
  priceFrom?: string;
  operatorCount: number;
  operatorWebsite?: string;
  operatorName?: string;
  hasVerifiedOperator?: boolean;
  seasonUrgency: SeasonUrgency | null;
  nextDeparture?: string | null;
  /** The adventure and its verified operators, for "Get quotes" */
  quote?: { slug: string; name: string; operators: string[] };
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

export default function BookingSidebarCard({ priceFrom, operatorCount, operatorWebsite, operatorName, hasVerifiedOperator, seasonUrgency, nextDeparture, quote }: Props) {
  // The primary CTA stays neutral when there's a choice: it leads to the
  // comparison, not to whichever operator happens to be cheapest. Only a
  // sole operator gets booked directly.
  const bookDirect = operatorCount === 1 && !!operatorWebsite;

  const handleBook = () => {
    if (bookDirect) {
      window.open(operatorWebsite, "_blank", "noopener noreferrer");
    } else {
      document.getElementById("book-this-adventure")?.scrollIntoView({ behavior: "smooth" });
    }
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
                <span className="text-black/40 dark:text-white/40 text-[10px] font-medium uppercase tracking-wide block mb-1">From</span>
                <span className="text-black dark:text-white font-bold text-2xl">{priceFrom}</span>
                {operatorName && operatorCount > 1 && (
                  <span className="text-black/40 dark:text-white/40 text-[11px] font-medium block mt-1.5">Cheapest: {operatorName}</span>
                )}
              </p>
            ) : (
              <p className="text-black/50 dark:text-white/50 text-sm font-semibold">Contact for pricing</p>
            )}
          </div>
        </div>

        {(operatorCount > 0 || hasVerifiedOperator || nextDeparture) && (
          <p className="mb-3 text-black/40 dark:text-white/40 text-[11px] font-medium leading-relaxed">
            {operatorCount > 0 && <>{operatorCount} operator{operatorCount !== 1 ? "s" : ""}</>}
            {hasVerifiedOperator && <> · <span style={{ color: "#34d399" }}>Verified</span></>}
            {nextDeparture && <> · Next {nextDeparture}</>}
          </p>
        )}

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
            {bookDirect && operatorName
              ? `Book with ${operatorName}`
              : operatorCount > 1 ? `Compare ${operatorCount} operators` : "See operators"}
            <ChevronRight className="w-4 h-4" />
          </button>
          {quote && <QuoteRequestButton {...quote} />}
        </div>
      </div>
    </div>
  );
}
