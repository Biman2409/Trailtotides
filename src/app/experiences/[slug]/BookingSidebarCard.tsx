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

// Season timing as one quiet line, not a coloured badge
function UrgencyNote({ urgency }: { urgency: SeasonUrgency }) {
  if (urgency.kind === "ending") {
    return (
      <p className="flex items-center gap-1.5 text-[13px]" style={{ color: "#e0684f" }}>
        <Clock3 className="w-3.5 h-3.5 shrink-0" />
        {urgency.weeksLeft} week{urgency.weeksLeft !== 1 ? "s" : ""} left in season
      </p>
    );
  }
  if (urgency.kind === "upcoming") {
    return (
      <p className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        Season opens in {urgency.weeksUntil} week{urgency.weeksUntil !== 1 ? "s" : ""}
      </p>
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

  // Calm style: a thin-bordered card, the price, quiet details, one solid pill
  return (
    <div className="rounded-2xl p-4" style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
      {priceFrom ? (
        <div>
          <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>from</p>
          <p className="text-[24px] leading-tight font-medium tracking-[-0.01em]" style={{ color: "var(--text-primary)" }}>{priceFrom}</p>
          {operatorName && operatorCount > 1 && (
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Cheapest: {operatorName}</p>
          )}
        </div>
      ) : (
        <p className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>Contact for pricing</p>
      )}

      {(operatorCount > 0 || nextDeparture || seasonUrgency) && (
        <div className="mt-3 pt-2.5 space-y-0.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {(operatorCount > 0 || hasVerifiedOperator) && (
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              {operatorCount} operator{operatorCount !== 1 ? "s" : ""}
              {hasVerifiedOperator && <> · <span style={{ color: "#3fa877" }}>verified</span></>}
            </p>
          )}
          {nextDeparture && <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Next departure {nextDeparture}</p>}
          {seasonUrgency && <UrgencyNote urgency={seasonUrgency} />}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={handleBook}
          className="w-full h-11 flex items-center justify-center gap-1.5 rounded-full text-white text-[14px] font-medium transition-colors bg-[#ff5100] hover:bg-[#e64900]"
        >
          {bookDirect && operatorName
            ? `Book with ${operatorName}`
            : operatorCount > 1 ? `Compare ${operatorCount} operators` : "See operators"}
          <ChevronRight className="w-4 h-4" />
        </button>
        {quote && <QuoteRequestButton {...quote} />}
      </div>
    </div>
  );
}
