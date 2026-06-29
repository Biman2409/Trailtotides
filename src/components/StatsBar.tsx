"use client";

import { useEffect, useRef, useState } from "react";
import { adventures } from "@/lib/data";

const totalAdventures = adventures.length;
const totalStates = new Set(adventures.map((a) => a.state)).size;
const totalTypes = new Set(adventures.map((a) => a.type)).size;
const totalUniqueOperators = new Set(
  adventures.flatMap((a) => a.operators.map((o) => o.name.trim().toLowerCase()))
).size;

const STATS = [
  { value: totalAdventures,      label: "Adventures",  suffix: "" },
  { value: totalStates,          label: "Regions",     suffix: "" },
  { value: totalTypes,           label: "Genres",      suffix: "" },
  { value: totalUniqueOperators, label: "Operators",   suffix: "" },
];

function useCountUp(target: number, duration = 1600, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

function StatItem({ value, label, suffix = "", started, index }: { value: number; label: string; suffix?: string; started: boolean; index: number }) {
  const count = useCountUp(value, 1600, started);
  return (
    <div className="relative flex flex-col items-center justify-center py-4 px-6 text-center group">
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-10 transition-all duration-500 group-hover:w-16"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.55), transparent)" }}
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
        {count}{suffix}
      </div>

      {/* Label */}
      <div className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #0f1319 0%, #111820 100%)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}
        >
          {STATS.map(({ value, label, suffix }, i) => (
            <div
              key={label}
              style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
            >
              <StatItem value={value} label={label} suffix={suffix} started={started} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
