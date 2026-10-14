"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Compass, ArrowUp, ArrowRight, Activity } from "lucide-react";
import { askCompass, COMPASS_GRADIENT } from "@/lib/compass";

// The hero bar talks to Compass.AI, so prompts read like how people describe a trip.
const PLACEHOLDERS = [
  "A 5-day trek with big views, not too hard…",
  "Somewhere quiet and remote this autumn…",
  "First Himalayan trek for me and two friends…",
  "A Ladakh bike ride in July…",
  "Something wild I can do over a long weekend…",
];
const PLACEHOLDER_MS = 3400;

export default function HeroCTAs() {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused || query) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), PLACEHOLDER_MS);
    return () => clearInterval(id);
  }, [focused, query]);

  function ask(text: string) {
    const t = text.trim();
    if (!t) { inputRef.current?.focus(); return; }
    askCompass(t);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Compass bar + a plain "Explore all" for people who'd rather browse than describe */}
      <div className="flex items-stretch gap-2 w-full">
      {/* Prompt bar — orange gradient hairline marks it as Compass, same identity as the chat */}
      <form
        onSubmit={(e) => { e.preventDefault(); ask(query); }}
        className="flex-1 min-w-0 rounded-[22px] p-px transition-shadow duration-300"
        style={{
          background: focused ? COMPASS_GRADIENT : "linear-gradient(135deg, rgba(255,81,0,0.7), rgba(255,125,71,0.45), rgba(255,179,122,0.6))",
          boxShadow: focused ? "0 0 0 4px rgba(255,81,0,0.18), 0 12px 40px rgba(0,0,0,0.35)" : "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="flex items-center gap-3 rounded-[21px] pl-4 pr-2 py-2"
          style={{ background: "rgba(14,12,12,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
        >
          <Compass className="w-5 h-5 shrink-0" style={{ color: "#ff8a5c" }} strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            aria-label="Describe the adventure you want — Compass.AI will suggest some"
            enterKeyHint="send"
            className="flex-1 min-w-0 bg-transparent text-[15px] sm:text-base py-2 truncate placeholder:text-white/55"
            // Focus is shown by the bar's gradient ring, not the global input outline
            style={{ color: "#fff", caretColor: "#ff5100", outline: "none" }}
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{ background: COMPASS_GRADIENT, boxShadow: "0 4px 16px rgba(255,81,0,0.4)" }}
            aria-label="Ask Compass.AI"
          >
            <ArrowUp className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </button>
        </div>
      </form>
      <Link
        href="/explore"
        className="group shrink-0 inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 rounded-[22px] text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5"
        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
      >
        <span className="hidden sm:inline whitespace-nowrap">Explore all</span>
        <span className="sm:hidden">Explore</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
      </div>

      {/* Secondary path — the fitness match. A quiet text link so the Compass bar stays the hero action */}
      <Link
        href="/matchmaker"
        className="group inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-medium text-white/80 hover:text-white transition-colors"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 2px 12px rgba(0,0,0,0.5)" }}
      >
        <Activity className="w-4 h-4 shrink-0" style={{ color: "#ff8a5c" }} strokeWidth={2.4} />
        <span className="whitespace-nowrap underline-offset-4 decoration-white/40 group-hover:underline">
          or find adventures that match your fitness
        </span>
        <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </Link>
    </div>
  );
}
