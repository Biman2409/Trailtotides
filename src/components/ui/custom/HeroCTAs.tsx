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

export default function HeroCTAs() {
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

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full">
        <form
          onSubmit={(e) => { e.preventDefault(); ask(query); }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex-1 min-w-0 rounded-[22px] p-px transition-shadow duration-300"
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
            className="flex items-center gap-3 rounded-[21px] pl-4 pr-2 py-2.5"
            style={{ background: "rgba(14,12,12,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          >
            <Sparkles className="w-5 h-5 shrink-0" style={{ color: "#ff8a5c" }} strokeWidth={2} />
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
              className="flex-1 min-w-0 bg-transparent text-[15px] sm:text-base py-2 truncate placeholder:text-white/55"
              // Focus is shown by the bar's gradient ring, not the global input outline
              style={{ color: "#fff", caretColor: "#ff5100", outline: "none" }}
            />
            <button
              type="submit"
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{ background: COMPASS_GRADIENT, boxShadow: "0 4px 16px rgba(255,81,0,0.4)" }}
              aria-label="Ask Compass.AI"
            >
              <ArrowUp className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Browse instead — a quiet text link so the bar stays the one obvious action */}
        <Link
          href="/explore"
          className="group shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
        >
          <span className="whitespace-nowrap underline-offset-4 decoration-white/40 group-hover:underline">Explore all</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
