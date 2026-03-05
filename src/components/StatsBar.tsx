"use client";

import { useEffect, useRef, useState } from "react";
import { adventures } from "@/lib/data";

const totalAdventures = adventures.length;
const totalRegions = new Set(adventures.map((a) => a.region)).size;
const totalTypes = new Set(adventures.map((a) => a.type)).size;
const totalVerifiedOperators = adventures.reduce(
  (sum, a) => sum + a.operators.filter((o) => o.verified).length,
  0
);

const STATS = [
  { value: totalAdventures, label: "Adventures" },
  { value: totalRegions,    label: "Regions" },
  { value: totalTypes,      label: "Adventure Types" },
  { value: totalVerifiedOperators, label: "Verified Operators" },
];

function useCountUp(target: number, duration = 1400, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

function StatItem({ value, label, suffix = "", started }: { value: number; label: string; suffix?: string; started: boolean }) {
  const count = useCountUp(value, 1400, started);
  return (
    <div className="text-center py-8 px-6">
      <div className="text-white text-3xl font-bold tracking-tight tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-white/32 text-xs mt-1.5 tracking-widest uppercase">{label}</div>
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#141920] border-b border-white/6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
          {STATS.map(({ value, label, suffix }) => (
            <StatItem key={label} value={value} label={label} suffix={suffix} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
