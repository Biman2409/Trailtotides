"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, ArrowRight } from "lucide-react";
import { askCompass, COMPASS_GRADIENT } from "@/lib/compass";

// The hero bar talks to Compass.AI, so prompts read like how people describe a trip.
const PLACEHOLDERS = [
  "A 5-day trek with big views, not too hard…",
  "Somewhere quiet and remote this autumn…",
  "First Himalayan trek for me and two friends…",
  "A Ladakh bike ride in July…",
  "Something wild I can do over a long weekend…",
];
// Phones only fit a few words before the field truncates, so they get short prompts
const PLACEHOLDERS_SHORT = [
  "Describe your trip…",
  "A trek with big views…",
  "Ladakh by bike in July…",
  "Something wild, one weekend…",
];
const PLACEHOLDER_MS = 3400;

export default function HeroCTAs({ stats }: { stats: { adventures: number; operators: number; regions: number } }) {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prompts = narrow ? PLACEHOLDERS_SHORT : PLACEHOLDERS;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (focused || query) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setPlaceholderIdx((i) => i + 1), PLACEHOLDER_MS);
    return () => clearInterval(id);
  }, [focused, query]);

  function ask(text: string) {
    const t = text.trim();
    if (!t) { inputRef.current?.focus(); return; }
    askCompass(t);
    setQuery("");
    inputRef.current?.blur();
  }

  // Quiet white hairline at rest; the Compass gradient lights up on hover and focus
  const ring = focused
    ? COMPASS_GRADIENT
    : hovered
      ? "linear-gradient(135deg, rgba(255,81,0,0.75), rgba(255,125,71,0.5), rgba(255,179,122,0.65))"
      : "rgba(255,255,255,0.2)";

  // At rest the bar breathes a faint orange ring to draw the eye; hover/focus take over
  const idle = !focused && !hovered && !query;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 w-full">
        <div className="relative isolate flex-1 sm:flex-none sm:w-[420px] min-w-0">
        {/* Soft orange glow pooled behind the bar */}
        <span
          aria-hidden
          className="absolute -inset-x-6 -inset-y-5 -z-10 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(closest-side, rgba(255,81,0,0.24), rgba(255,81,0,0.08) 60%, transparent)", filter: "blur(14px)", opacity: focused || hovered ? 1 : 0.75, transition: "opacity 0.3s" }}
        />
        <form
          onSubmit={(e) => { e.preventDefault(); ask(query); }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`w-full rounded-[18px] p-px transition-shadow duration-300${idle ? " hc-breathe" : ""}`}
          style={{
            background: ring,
            boxShadow: focused
              ? "0 0 0 4px rgba(255,81,0,0.18), 0 12px 40px rgba(0,0,0,0.35)"
              : hovered
                ? "0 10px 36px -6px rgba(255,81,0,0.35)"
                : "0 12px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="flex items-center gap-2.5 rounded-[17px] pl-3.5 pr-1.5 py-1.5"
            style={{ background: "rgba(14,12,12,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          >
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: "#ff8a5c" }} strokeWidth={2} />
            <input
              ref={inputRef}
              id="hero-compass-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={prompts[placeholderIdx % prompts.length]}
              aria-label="Describe the adventure you want — Compass.AI will suggest some"
              enterKeyHint="send"
              className="flex-1 min-w-0 bg-transparent text-[14px] sm:text-[15px] py-1.5 truncate placeholder:text-white/55"
              // Focus is shown by the bar's gradient ring, not the global input outline
              style={{ color: "#fff", caretColor: "#ff5100", outline: "none" }}
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{ background: COMPASS_GRADIENT, boxShadow: "0 4px 16px rgba(255,81,0,0.4)" }}
              aria-label="Ask Compass.AI"
            >
              <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
        </div>

        {/* Browse instead — a quiet text link so the bar stays the one obvious action */}
        <Link
          href="/explore"
          className="group shrink-0 self-center sm:self-auto inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
        >
          <span className="whitespace-nowrap underline-offset-4 decoration-white/40 group-hover:underline">Explore all</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Trust line — real counts from the adventure data */}
      <p className="mt-3 text-center sm:text-left text-[11.5px] font-medium tracking-wide text-white/55" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
        {stats.adventures} adventures <span className="text-white/30">·</span> {stats.operators} verified operators <span className="text-white/30">·</span> {stats.regions} regions
      </p>

      <style>{`
        .hc-breathe { animation: hcBreathe 3.2s ease-in-out infinite; }
        @keyframes hcBreathe {
          0%, 100% { box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 0 rgba(255,81,0,0); }
          50% { box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 5px rgba(255,81,0,0.14), 0 0 26px rgba(255,81,0,0.22); }
        }
        @media (prefers-reduced-motion: reduce) { .hc-breathe { animation: none; } }
      `}</style>
    </div>
  );
}
