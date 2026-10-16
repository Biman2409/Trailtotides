"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, Sparkles, BadgeCheck } from "lucide-react";

// The hero's promise: one plain line, then the three things that set us apart as chips.
// Each chip is a way in — the fitness test, the Compass prompt bar, the operator directory.

type PromiseItem = { key: string; label: string; color: string; icon: ReactNode; href?: string };

const PROMISES: PromiseItem[] = [
  { key: "fitness", label: "Fitness-matched", color: "#ff8a4c", icon: <Activity className="w-3.5 h-3.5" strokeWidth={2.4} />, href: "/matchmaker" },
  { key: "ai", label: "AI picks", color: "#ffc46b", icon: <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} /> },
  { key: "operators", label: "Verified operators", color: "#5fe0d4", icon: <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.4} />, href: "/operators" },
];

// The AI chip points at the hero's own prompt bar rather than opening a new surface
function focusHeroPrompt() {
  (document.getElementById("hero-compass-input") as HTMLInputElement | null)?.focus();
}

export default function HeroPromise() {
  return (
    <div
      className="flex flex-col items-center lg:items-start gap-3 w-full"
      style={{ animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
    >
      <p
        className="text-center lg:text-left font-medium leading-snug"
        style={{ fontSize: "clamp(0.88rem, 1.35vw, 1.1rem)", textWrap: "balance", color: "rgba(255,255,255,0.95)", textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.55)" }}
      >
        Find, compare and book adventures across India.
      </p>

      <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 sm:gap-2">
        {PROMISES.map((p, i) => {
          const body = (
            <>
              <span className="hp-chip-icon" style={{ color: p.color, background: `${p.color}22` }}>{p.icon}</span>
              {p.label}
            </>
          );
          const style = { "--c": p.color, animationDelay: `${0.35 + i * 0.08}s` } as React.CSSProperties;
          return p.href
            ? <Link key={p.key} href={p.href} className="hp-chip" style={style}>{body}</Link>
            : <button key={p.key} type="button" onClick={focusHeroPrompt} className="hp-chip" style={style}>{body}</button>;
        })}
      </div>

      <style>{`
        .hp-chip { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px 5px 5px; border-radius: 999px;
                   font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.9); white-space: nowrap;
                   background: rgba(12,10,9,0.38); border: 1px solid rgba(255,255,255,0.12);
                   backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                   transition: border-color .25s, background .25s, transform .25s, color .25s;
                   animation: hpChipIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .hp-chip:hover { color: #fff; transform: translateY(-1px);
                         border-color: color-mix(in srgb, var(--c) 60%, transparent);
                         background: color-mix(in srgb, var(--c) 14%, rgba(12,10,9,0.45)); }
        .hp-chip:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }
        .hp-chip-icon { width: 22px; height: 22px; border-radius: 999px; display: grid; place-items: center; flex: none; }
        @keyframes hpChipIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (max-width: 639px) {
          .hp-chip { font-size: 10.5px; padding: 3px 8px 3px 3px; gap: 4px; }
          .hp-chip-icon { width: 18px; height: 18px; } .hp-chip-icon svg { width: 11px; height: 11px; }
        }
        @media (prefers-reduced-motion: reduce) { .hp-chip { animation: none; } }
      `}</style>
    </div>
  );
}
