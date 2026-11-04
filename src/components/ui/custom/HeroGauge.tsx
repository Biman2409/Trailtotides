"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HERO_SLIDES, HERO_SLIDE_EVENT, HERO_GOTO_EVENT, SLIDE_DURATION, type HeroMark } from "./HeroSlider";

// "From Mountain to Ocean", as a scale: a thin altitude gauge beside the hero headline, from
// 7,000 m down through sea level to the reef. Its marker follows the hero photo to that
// adventure's height (a summit, a pass, the surf, a dive), and the label links to it.
// It is also the slider's control on these screens: every photo is a stop on the scale (click
// one to show that photo), and a ring round the marker fills while its photo is up.
// The sea is drawn to a larger scale than the land, with a break at sea level, so a dive
// still reads below the line. Large desktops only: the column it sits in only exists there.

const TOP_M = 7000, DEEP_M = 40;
const SEA = 0.8; // sea level sits 80% of the way down
const ticks = [6000, 4000, 2000];
const depthTicks = [-20, -40];

// Photos at the same height (the surf and the kayak at sea level) sit side by side on the scale
const STOPS = HERO_SLIDES.map((s, i) => {
  const same = HERO_SLIDES.filter((x) => x.mark.metres === s.mark.metres);
  return { ...s.mark, src: s.src, x: 10 - (same.length - 1) * 5 + same.findIndex((x) => x.src === s.src) * 10, key: s.src, i };
});
const RING = 2 * Math.PI * 9;

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
    <div className="hg absolute inset-y-0 left-0 w-[240px] hidden xl:block" aria-label="Where in India to do what the photo shows, and how high">
      {/* The scale: trail orange fading to tide teal, with its ticks */}
      <div className="absolute inset-y-0 left-[10px] w-px hg-track" aria-hidden />
      <div className="hg-fill" aria-hidden data-deep={below || undefined}
        style={{ top: `${Math.min(pos, SEA * 100)}%`, height: `${Math.abs(pos - SEA * 100)}%` }} />
      {ticks.map((m) => (
        <span key={m} className="hg-tick" style={{ top: `${at(m) * 100}%`, ...clear(at(m)) }} aria-hidden>{m.toLocaleString("en-IN")} m</span>
      ))}
      {/* Every photo, as a stop at its height: hover to see it, click to show it */}
      {STOPS.map((st) => {
        const on = st.name === mark.name;
        return (
          <button key={st.key} type="button" className="hg-stop" data-on={on || undefined} tabIndex={on ? -1 : 0}
            onClick={() => window.dispatchEvent(new CustomEvent<string>(HERO_GOTO_EVENT, { detail: st.name }))}
            aria-label={`Show the ${st.name} photo, ${fmt(st.metres)}`}
            style={{ top: `${at(st.metres) * 100}%`, left: st.x, "--c": st.metres <= 0 ? "#5fe0d4" : "#ff9a66" } as React.CSSProperties}>
            <i />
            <span className="hg-tip">
              <Image src={st.src} alt="" width={104} height={72} sizes="52px" />
              <span>{st.name}<b>{fmt(st.metres)}</b></span>
            </span>
          </button>
        );
      })}
      <span className="hg-sea" style={{ top: `${SEA * 100}%`, ...clear(SEA) }} aria-hidden><i />Sea level</span>
      {depthTicks.map((m) => (
        <span key={m} className="hg-tick hg-tick-deep" style={{ top: `${at(m) * 100}%`, ...clear(at(m)) }} aria-hidden>{m} m</span>
      ))}

      {/* The marker, at the photo's adventure */}
      <div className="hg-mark" style={{ top: `${pos}%`, "--c": below || mark.metres === 0 ? "#5fe0d4" : "#ff7d47" } as React.CSSProperties}>
        <span className="hg-dot" aria-hidden>
          {/* Fills while this photo is up, like the slider's progress bar */}
          <svg viewBox="0 0 24 24" className="hg-ring"><circle key={mark.name} cx="12" cy="12" r="9" strokeDasharray={RING} style={{ animationDuration: `${SLIDE_DURATION}ms` }} /></svg>
        </span>
        <span className="hg-lead" aria-hidden />
        <Link href={mark.href} className="hg-label" aria-label={`Do this: ${mark.name}, ${fmt(mark.metres)}`}>
          <span className="hg-eyebrow">Do this</span>
          <span key={mark.name} className="hg-name">{mark.name}</span>
          <span className="hg-m">{fmt(shown)}</span>
        </Link>
      </div>

      <style>{`
        /* Short screens: the headline needs the room, so the gauge steps aside */
        @media (max-height: 720px) { .hg { display: none !important; } }
        .hg-track { background: linear-gradient(to bottom, rgba(255,125,71,0.55), rgba(255,125,71,0.2) 70%, rgba(95,224,212,0.5) ${SEA * 100}%, rgba(95,224,212,0.25)); }
        .hg-fill { position: absolute; left: 9px; width: 3px; border-radius: 3px; pointer-events: none;
                   background: linear-gradient(to bottom, #ff7d47, rgba(255,125,71,0.35)); box-shadow: 0 0 12px rgba(255,125,71,0.45);
                   transition: top 1.2s cubic-bezier(0.65, 0, 0.35, 1), height 1.2s cubic-bezier(0.65, 0, 0.35, 1); }
        .hg-fill[data-deep] { background: linear-gradient(to bottom, rgba(95,224,212,0.35), #5fe0d4); box-shadow: 0 0 12px rgba(95,224,212,0.45); }
        .hg-tick { position: absolute; left: 0; transform: translateY(-50%); display: flex; align-items: center; gap: 8px;
                   font: 500 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.55); text-shadow: 0 1px 6px rgba(0,0,0,0.6); letter-spacing: 0.04em; transition: opacity .5s; }
        .hg-tick::before { content: ""; width: 7px; height: 1px; margin-left: 7px; background: rgba(255,255,255,0.45); }
        .hg-tick-deep { color: rgba(95,224,212,0.5); }
        .hg-tick-deep::before { background: rgba(95,224,212,0.45); }
        .hg-stop { position: absolute; width: 20px; height: 20px; margin: -10px 0 0 -10px; display: grid; place-items: center; cursor: pointer; z-index: 2; }
        .hg-stop i { width: 7px; height: 7px; border-radius: 50%; background: var(--c); opacity: 0.75; box-shadow: 0 0 0 2px rgba(5,8,12,0.5); transition: opacity .2s, transform .2s; }
        .hg-stop:hover i, .hg-stop:focus-visible i { opacity: 1; transform: scale(1.5); }
        .hg-stop[data-on] { pointer-events: none; }
        .hg-stop[data-on] i { opacity: 0; }
        .hg-stop:focus-visible { outline: none; }
        .hg-tip { position: absolute; left: 24px; top: 50%; transform: translate(-4px, -50%); white-space: nowrap; pointer-events: none; opacity: 0;
                  display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border-radius: 10px; font-size: 12px; font-weight: 600; color: #fff;
                  background: rgba(5,8,12,0.8); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(8px); transition: opacity .2s, transform .2s; z-index: 3; }
        .hg-tip img { width: 52px; height: 36px; object-fit: cover; border-radius: 7px; }
        .hg-tip > span { display: flex; flex-direction: column; gap: 3px; }
        .hg-tip b { font: 600 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--c); }
        .hg-stop:hover .hg-tip, .hg-stop:focus-visible .hg-tip { opacity: 1; transform: translate(0, -50%); }
        .hg-sea { position: absolute; left: 0; right: 40px; transform: translateY(-50%); display: flex; align-items: center; gap: 8px;
                  font: 600 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(95,224,212,0.85); text-shadow: 0 1px 6px rgba(0,0,0,0.6); transition: opacity .5s; }
        .hg-sea i { display: block; width: 22px; height: 0; border-top: 1px dashed rgba(95,224,212,0.7); }
        .hg-mark { position: absolute; left: 0; right: 0; display: flex; align-items: center; transform: translateY(-50%);
                   transition: top 1.2s cubic-bezier(0.65, 0, 0.35, 1); }
        .hg-dot { position: relative; flex-shrink: 0; width: 12px; height: 12px; margin-left: 4.5px; border-radius: 50%; background: var(--c);
                  box-shadow: 0 0 0 3px rgba(5,8,12,0.55), 0 0 16px var(--c); transition: background .6s; }
        .hg-ring { position: absolute; left: -6px; top: -6px; width: 24px; height: 24px; transform: rotate(-90deg); overflow: visible; }
        .hg-ring circle { fill: none; stroke: var(--c); stroke-width: 1.5; stroke-linecap: round; stroke-dashoffset: ${RING};
                          animation-name: hgFill; animation-timing-function: linear; animation-fill-mode: forwards; opacity: 0.85; }
        @keyframes hgFill { to { stroke-dashoffset: 0; } }
        .hg-lead { width: 18px; height: 1px; margin: 0 6px 0 8px; background: linear-gradient(to right, var(--c), transparent); transition: background .6s; }
        .hg-eyebrow { font: 600 9.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .hg-label { display: flex; flex-direction: column; gap: 4px; min-width: 0; padding: 8px 12px 9px; border-radius: 12px; color: #fff; text-decoration: none;
                    background: rgba(5,8,12,0.42); border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25); transition: background .2s, border-color .2s; }
        .hg-label:hover { background: rgba(5,8,12,0.6); border-color: color-mix(in srgb, var(--c) 55%, transparent); }
        .hg-label::after { content: "Explore →"; font: 600 10.5px/1 system-ui, sans-serif; color: rgba(255,255,255,0.55); margin-top: 2px; transition: color .2s; }
        .hg-label:hover::after { color: var(--c); }
        .hg-name { font-size: 15px; font-weight: 600; line-height: 1.2; text-shadow: 0 1px 10px rgba(0,0,0,0.6); animation: hgIn .6s ease both; }
        .hg-m { font: 600 13px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--c); font-variant-numeric: tabular-nums; letter-spacing: 0.02em; transition: color .6s; }
        .hg-label:hover .hg-name { text-decoration: underline; text-underline-offset: 3px; }
        .hg-label:focus-visible { outline: 2px solid #ff7d47; outline-offset: 4px; border-radius: 4px; }
        @keyframes hgIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .hg-mark { transition: none; } .hg-name { animation: none; } .hg-ring circle { animation: none; stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}
