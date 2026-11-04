"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HERO_SLIDES, HERO_SLIDE_EVENT, type HeroMark } from "./HeroSlider";

// "From Mountain to Ocean", as a scale: a thin altitude gauge beside the hero headline, from
// 7,000 m down through sea level to the reef. Its marker follows the hero photo to that
// adventure's height (a summit, a pass, the surf, a dive), and the label links to it.
// The sea is drawn to a larger scale than the land, with a break at sea level, so a dive
// still reads below the line. Large desktops only: the column it sits in only exists there.

const TOP_M = 7000, DEEP_M = 40;
const SEA = 0.8; // sea level sits 80% of the way down
const ticks = [6000, 4000, 2000];
const depthTicks = [-20, -40];

/** Where a height sits on the gauge, 0 (top) to 1 (bottom) */
const at = (m: number) => (m >= 0 ? SEA - (Math.min(m, TOP_M) / TOP_M) * (SEA - 0.03) : SEA + (Math.min(-m, DEEP_M) / DEEP_M) * (0.98 - SEA));
const fmt = (m: number) => (m === 0 ? "Sea level" : `${m < 0 ? "−" : ""}${Math.abs(Math.round(m)).toLocaleString("en-IN")} m`);

export default function HeroGauge({ start = 0 }: { start?: number }) {
  // Opens on the photo the slider opens on, then follows it
  const [mark, setMark] = useState<HeroMark>(HERO_SLIDES[start % HERO_SLIDES.length].mark);
  const [shown, setShown] = useState(mark.metres); // the readout counts to each new height
  const shownRef = useRef(shown);

  useEffect(() => {
    const on = (e: Event) => setMark((e as CustomEvent<HeroMark>).detail);
    window.addEventListener(HERO_SLIDE_EVENT, on);
    return () => window.removeEventListener(HERO_SLIDE_EVENT, on);
  }, []);

  useEffect(() => {
    const from = shownRef.current, to = mark.metres;
    if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { shownRef.current = to; setShown(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1200);
      const v = from + (to - from) * (1 - Math.pow(1 - t, 3));
      shownRef.current = v; setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mark]);

  const below = mark.metres < 0;
  const pos = at(mark.metres) * 100;
  // A tick or the sea-level label fades while the marker's label sits on it
  const clear = (y: number) => ({ opacity: Math.abs(y - at(mark.metres)) < 0.06 ? 0 : 1 });

  return (
    <div className="hg absolute inset-y-0 left-0 w-[240px] hidden xl:block" aria-label="Height of the adventure in the photo">
      {/* The scale: trail orange fading to tide teal, with its ticks */}
      <div className="absolute inset-y-0 left-[10px] w-px hg-track" aria-hidden />
      {ticks.map((m) => (
        <span key={m} className="hg-tick" style={{ top: `${at(m) * 100}%`, ...clear(at(m)) }} aria-hidden>{m.toLocaleString("en-IN")}</span>
      ))}
      {HERO_SLIDES.map((s) => (
        <span key={s.src} className="hg-ghost" style={{ top: `${at(s.mark.metres) * 100}%`, background: s.mark.metres < 0 ? "#5fe0d4" : "#ff9a66" }} aria-hidden />
      ))}
      <span className="hg-sea" style={{ top: `${SEA * 100}%`, ...clear(SEA) }} aria-hidden><i />Sea level</span>
      {depthTicks.map((m) => (
        <span key={m} className="hg-tick hg-tick-deep" style={{ top: `${at(m) * 100}%`, ...clear(at(m)) }} aria-hidden>{m} m</span>
      ))}

      {/* The marker, at the photo's adventure */}
      <div className="hg-mark" style={{ top: `${pos}%`, "--c": below || mark.metres === 0 ? "#5fe0d4" : "#ff7d47" } as React.CSSProperties}>
        <span className="hg-dot" aria-hidden />
        <span className="hg-lead" aria-hidden />
        <Link href={mark.href} className="hg-label" aria-label={`${mark.name}, ${fmt(mark.metres)}`}>
          <span key={mark.name} className="hg-name">{mark.name}</span>
          <span className="hg-m">{fmt(shown)}</span>
        </Link>
      </div>

      <style>{`
        /* Short screens: the headline needs the room, so the gauge steps aside */
        @media (max-height: 720px) { .hg { display: none !important; } }
        .hg-track { background: linear-gradient(to bottom, rgba(255,125,71,0.55), rgba(255,125,71,0.2) 70%, rgba(95,224,212,0.5) ${SEA * 100}%, rgba(95,224,212,0.25)); }
        .hg-tick { position: absolute; left: 0; transform: translateY(-50%); display: flex; align-items: center; gap: 8px;
                   font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.38); letter-spacing: 0.04em; transition: opacity .5s; }
        .hg-tick::before { content: ""; width: 7px; height: 1px; margin-left: 7px; background: rgba(255,255,255,0.35); }
        .hg-tick-deep { color: rgba(95,224,212,0.5); }
        .hg-tick-deep::before { background: rgba(95,224,212,0.45); }
        .hg-ghost { position: absolute; left: 8px; width: 5px; height: 5px; margin-top: -2.5px; border-radius: 50%; opacity: 0.35; }
        .hg-sea { position: absolute; left: 0; right: 40px; transform: translateY(-50%); display: flex; align-items: center; gap: 8px;
                  font: 600 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(95,224,212,0.75); transition: opacity .5s; }
        .hg-sea i { display: block; width: 22px; height: 0; border-top: 1px dashed rgba(95,224,212,0.7); }
        .hg-mark { position: absolute; left: 0; right: 0; display: flex; align-items: center; transform: translateY(-50%);
                   transition: top 1.2s cubic-bezier(0.65, 0, 0.35, 1); }
        .hg-dot { position: relative; flex-shrink: 0; width: 11px; height: 11px; margin-left: 5px; border-radius: 50%; background: var(--c);
                  box-shadow: 0 0 0 3px rgba(5,8,12,0.55), 0 0 16px var(--c); transition: background .6s; }
        .hg-dot::after { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 1px solid var(--c); opacity: 0; animation: hgPing 2.4s ease-out infinite; }
        @keyframes hgPing { 0% { transform: scale(0.5); opacity: 0.7; } 100% { transform: scale(1.6); opacity: 0; } }
        .hg-lead { width: 22px; height: 1px; margin: 0 8px; background: linear-gradient(to right, var(--c), transparent); transition: background .6s; }
        .hg-label { display: flex; flex-direction: column; gap: 3px; min-width: 0; padding: 4px 0; color: #fff; text-decoration: none; }
        .hg-name { font-size: 13px; font-weight: 600; line-height: 1.2; text-shadow: 0 1px 10px rgba(0,0,0,0.6); animation: hgIn .6s ease both; }
        .hg-m { font: 600 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--c); font-variant-numeric: tabular-nums; letter-spacing: 0.02em; transition: color .6s; }
        .hg-label:hover .hg-name { text-decoration: underline; text-underline-offset: 3px; }
        .hg-label:focus-visible { outline: 2px solid #ff7d47; outline-offset: 4px; border-radius: 4px; }
        @keyframes hgIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .hg-mark { transition: none; } .hg-dot::after, .hg-name { animation: none; } }
      `}</style>
    </div>
  );
}
