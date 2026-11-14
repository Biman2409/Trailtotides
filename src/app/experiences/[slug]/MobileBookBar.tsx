"use client";

import { useState, useEffect } from "react";
import { ChevronRight, AlertTriangle, Clock3 } from "lucide-react";
import { loadProfileFromServer, isProfileStale } from "@/lib/matchmaker";
import type { SeasonUrgency } from "@/lib/seasonUrgency";
import { openOperator } from "@/lib/outbound";
import { OPEN_COMPARE_EVENT } from "./OperatorsSection";

interface Props {
  adventureName: string;
  priceFrom?: string;
  /** True when priceFrom is the full trip (fee, GST and transport), not just the trek fee */
  priceIsFull?: boolean;
  difficulty: string;
  duration: string;
  operatorWebsite?: string;
  slug?: string;
  operatorName?: string;
  operatorCount: number;
  seasonUrgency?: SeasonUrgency | null;
  nextDeparture?: string | null;
}

export default function MobileBookBar({ slug, adventureName, priceFrom, priceIsFull, difficulty, duration, operatorWebsite, operatorName, operatorCount, seasonUrgency, nextDeparture }: Props) {
  const [visible, setVisible] = useState(false);
  const [staleProfile, setStaleProfile] = useState(false);

  useEffect(() => {
    const threshold = window.innerHeight * 0.8;
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mirrors RecalibrationNudge's staleness check — this was the original
  // gap: mobile is the primary last-mile booking surface, so the nudge
  // shouldn't only live below the fold in the desktop-style banner.
  useEffect(() => {
    loadProfileFromServer().then((profile) => {
      if (!profile) return;
      setStaleProfile(isProfileStale((profile as { updatedAt?: string }).updatedAt));
    });
  }, []);

  // Same rule as BookingSidebarCard: lead to the comparison unless there's
  // only one operator to book with.
  const bookDirect = operatorCount === 1 && !!operatorWebsite;

  const handleBook = () => {
    if (bookDirect) {
      openOperator({ url: operatorWebsite!, operator: operatorName ?? "Operator", source: "mobile_bar", slug });
    } else {
      // Straight into the side-by-side comparison, with the section scrolled into view behind it
      document.getElementById("operators-section")?.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new Event(OPEN_COMPARE_EVENT));
    }
  };

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[999] transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      {/* Blur backdrop */}
      <div
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(255,255,255,0.97)_60%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(to_top,rgba(8,10,18,0.97)_60%,rgba(8,10,18,0)_100%)]"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      />

      {/* One row: what it costs on the left, the next step on the right. The trek's name is on the
          page behind it, so the bar doesn't repeat it and keeps to about 70px of the screen. */}
      <div className="relative flex items-center gap-3 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="min-w-0 flex-1">
          {priceFrom ? (
            <p className="text-black dark:text-white font-bold text-[15px] leading-tight whitespace-nowrap">
              <span className="text-black/45 dark:text-white/40 font-normal text-[11px]">From </span>{priceFrom}
            </p>
          ) : (
            <p className="text-black dark:text-white font-semibold text-sm leading-tight truncate">{adventureName}</p>
          )}
          <p className="text-black/45 dark:text-white/40 text-[11px] mt-0.5 truncate">
            {priceFrom
              ? <>{priceIsFull ? "Full trip" : "Trek fee"}{operatorName && operatorCount > 1 ? ` · ${operatorName}` : ""}</>
              : <>{duration}{difficulty && <> · {difficulty}</>}</>}
          </p>
          {/* At most one note, so the bar stays one row tall */}
          {staleProfile ? (
            <button
              onClick={() => document.getElementById("book-this-adventure")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-1 mt-0.5 text-[10.5px] font-semibold"
              style={{ color: difficulty === "Extreme" ? "#f87171" : "#fbbf24" }}
            >
              <AlertTriangle className="w-3 h-3" /> Your fitness profile is out of date
            </button>
          ) : seasonUrgency?.kind === "ending" ? (
            <p className="inline-flex items-center gap-1 mt-0.5 text-[10.5px] font-semibold" style={{ color: "#f87171" }}>
              <Clock3 className="w-3 h-3" /> {seasonUrgency.weeksLeft}w left in season
            </p>
          ) : nextDeparture ? (
            <p className="text-black/45 dark:text-white/40 text-[10.5px] mt-0.5 truncate">Next departure {nextDeparture}</p>
          ) : null}
        </div>
        <button
          onClick={handleBook}
          className="shrink-0 h-11 px-5 flex items-center justify-center gap-1 rounded-full text-white text-[14px] font-medium transition-colors bg-[#ff5100] active:bg-[#e64900]"
        >
          {bookDirect ? "Book" : operatorCount > 1 ? `Compare ${operatorCount}` : "See operators"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
