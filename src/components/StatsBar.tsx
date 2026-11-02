"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { adventures } from "@/lib/data";

const totalAdventures = adventures.length;
const totalStates = new Set(adventures.map((a) => a.state)).size;
const totalTypes = new Set(adventures.map((a) => a.type)).size;
const totalUniqueOperators = new Set(
  adventures.flatMap((a) => a.operators.map((o) => o.name.trim().toLowerCase()))
).size;

// Each stat links to where that number lives on the site
const STATS = [
  { value: totalAdventures,      label: "Adventures", href: "/explore" },
  { value: totalStates,          label: "Regions",    href: "#regions" },
  { value: totalTypes,           label: "Genres",     href: "#styles" },
  { value: totalUniqueOperators, label: "Operators",  href: "/operators" },
];

function useCountUp(target: number, duration = 1600, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let raf = 0;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return count;
}

// "static": real numbers, no motion (server HTML, reduced motion, or already on screen at load).
// "armed": hidden at 0, waiting to scroll into view. "go": counting up.
type Mode = "static" | "armed" | "go";

function StatItem({ value, label, href, mode, index }: { value: number; label: string; href: string; mode: Mode; index: number }) {
  // Each block waits its turn to land, then its own count-up starts —
  // rather than every number ticking up in lockstep the instant the strip enters view.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (mode !== "go") return;
    const t = setTimeout(() => setRevealed(true), index * 130);
    return () => clearTimeout(t);
  }, [mode, index]);

  const count = useCountUp(value, 1400, revealed);
  const shown = mode === "static" ? value : count;
  const hidden = mode !== "static" && !revealed;
  const accent = index % 2 === 0 ? "rgba(255,81,0,0.55)" : "rgba(74,222,128,0.5)";
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center py-4 px-6 text-center group transition-colors duration-200 hover:bg-white/[0.03] focus-visible:bg-white/[0.05]"
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(16px) scale(0.92)" : "translateY(0) scale(1)",
        transition: "opacity 0.65s, transform 0.65s, background-color 0.2s",
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Subtle top accent line — alternates rust / pine to echo the brand duo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-10 transition-all duration-500 group-hover:w-16"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      {/* Number */}
      <div
        className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums leading-none mb-1.5"
        style={{
          background: "linear-gradient(160deg, #ffffff 30%, rgba(255,255,255,0.45) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {shown}
      </div>

      {/* Label */}
      <div className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors text-white/60 group-hover:text-white/85">
        {label}
      </div>
    </Link>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only animate when it's below the fold at load and motion is welcome
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setMode("armed");
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMode("go"); observer.disconnect(); } },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} aria-label="Trail to Tides in numbers">
      <div
        style={{
          background: "linear-gradient(180deg, #0f1319 0%, #171310 100%)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}
          >
            {STATS.map(({ value, label, href }, i) => (
              <div
                key={label}
                style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
              >
                <StatItem value={value} label={label} href={href} mode={mode} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Soft hand-off into the page, so light mode doesn't meet the dark strip at a hard edge */}
      <div aria-hidden className="h-6" style={{ background: "linear-gradient(180deg, #171310, var(--bg-page))" }} />
    </section>
  );
}
