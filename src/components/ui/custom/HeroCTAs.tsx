"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import CompassSearch from "@/components/ui/custom/CompassSearch";
import { track } from "@/lib/analytics";

// The hero bar is the site's search, powered by Compass.AI: names match as you type, and a trip
// described in words gets Compass.AI's picks, all in a panel right under the bar (no chat pop-up).
// The placeholder reads like how people describe a trip; both sets open with the same line so the
// phone swap after hydration is invisible.
const PLACEHOLDERS = [
  "Search or ask Compass.AI…",
  "A 5-day trek with big views, not too hard…",
  "Somewhere quiet and remote this autumn…",
  "First Himalayan trek for me and two friends…",
  "Kedarkantha, Spiti, Ladakh…",
  "Something wild I can do over a long weekend…",
];
// Phones only fit a few words before the field truncates, so they get short prompts
const PLACEHOLDERS_SHORT = [
  "Search or ask Compass.AI…",
  "A trek with big views…",
  "Ladakh by bike in July…",
  "Something wild, one weekend…",
];

const NARROW_QUERY = "(max-width: 639px)";
function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getNarrow = () => window.matchMedia(NARROW_QUERY).matches;
const getNarrowServer = () => false;

export default function HeroCTAs() {
  const narrow = useSyncExternalStore(subscribeNarrow, getNarrow, getNarrowServer);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start gap-3 sm:gap-5 w-full">
        <div className="relative isolate flex-1 sm:flex-none sm:w-[420px] lg:flex-1 lg:w-auto lg:max-w-[520px] min-w-0 z-20">
          {/* Soft orange glow pooled behind the bar */}
          <span
            aria-hidden
            className="absolute -inset-x-6 -inset-y-5 -z-10 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(closest-side, rgba(255,81,0,0.24), rgba(255,81,0,0.08) 60%, transparent)", filter: "blur(14px)", opacity: 0.75 }}
          />
          <CompassSearch variant="hero" placeholders={narrow ? PLACEHOLDERS_SHORT : PLACEHOLDERS} />
        </div>

        {/* Browse instead — a quiet text link so the bar stays the one obvious action */}
        <Link
          href="/explore"
          onClick={() => track("hero_explore_click")}
          className="group shrink-0 self-center sm:self-auto inline-flex items-center gap-1.5 py-3 -my-3 text-[13px] sm:text-sm font-semibold text-white/80 hover:text-white transition-colors"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
        >
          <span className="whitespace-nowrap underline-offset-4 decoration-white/40 group-hover:underline">Explore all</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
