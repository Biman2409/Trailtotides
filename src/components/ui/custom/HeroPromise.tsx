"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Activity, Sparkles, BadgeCheck, ArrowUpRight } from "lucide-react";
import { TIDES_FILL } from "./heroTextures";
import CanvasText, { type Painter } from "./CanvasText";

// "adventures": trail orange into tides teal, the headline's two colours. Painted on a
// canvas so dark-mode extensions can't strip or darken it.
const paintScript: Painter = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  [["0", "#ffc27a"], ["0.3", "#ff8a33"], ["0.52", "#ffe2c4"], ["0.68", "#7fe6dc"], ["1", "#4fd6cf"]]
    .forEach(([o, c]) => g.addColorStop(Number(o), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

// The hero promise sentence. Each of its three phrases is a way into the product; a preview
// card for one of them sits above the copy, cycling through all three, tied to its phrase
// by a bracket line in the left gutter. Hovering a phrase (or focusing it) takes over the cycle.

type Feature = {
  key: string;
  phrase: string;
  title: string;
  blurb: string;
  color: string;
  tint: string;
  icon: ReactNode;
  href?: string;
  // Card backdrop — the same mountain/ocean textures as the headline words
  texture: string;
  textureSize: string;
};

const FEATURES: Feature[] = [
  {
    key: "fitness",
    phrase: "Matched to your body",
    title: "Fitness match",
    blurb: "Take the 2-min fitness test",
    color: "#ff8a4c",
    tint: "rgba(255,106,34,0.16)",
    icon: <Activity className="w-[18px] h-[18px]" strokeWidth={2.2} />,
    href: "/matchmaker",
    texture: "url(/hero/trail-contours.png)",
    textureSize: "320% 100%",
  },
  {
    key: "ai",
    phrase: "recommended by AI",
    title: "Compass AI",
    blurb: "Describe a trip, get picks",
    color: "#ffc46b",
    tint: "rgba(255,196,107,0.14)",
    icon: <Sparkles className="w-[18px] h-[18px]" strokeWidth={2} />,
    texture: "radial-gradient(120% 140% at 100% 0%, rgba(255,196,107,0.22), transparent 55%), radial-gradient(90% 120% at 0% 100%, rgba(95,224,212,0.14), transparent 60%)",
    textureSize: "100% 100%",
  },
  {
    key: "operators",
    phrase: "run by real operators",
    title: "Verified operators",
    blurb: "See who runs every trip",
    color: "#5fe0d4",
    tint: "rgba(95,224,212,0.14)",
    icon: <BadgeCheck className="w-[18px] h-[18px]" strokeWidth={2.2} />,
    href: "/operators",
    texture: TIDES_FILL.split(",url")[0],
    textureSize: "240px 180px",
  },
];

const START_DELAY = 1800;
const CYCLE_MS = 7500;

// The Compass card points at the hero's own prompt bar rather than opening a new surface
function focusHeroPrompt() {
  const input = document.getElementById("hero-compass-input") as HTMLInputElement | null;
  input?.focus();
}

export default function HeroPromise() {
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false); // a hover/focus has taken over the cycle
  const [cycleKey, setCycleKey] = useState(0); // restarts the progress bar
  const [line, setLine] = useState<{ d: string; dot: [number, number]; w: number; h: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const scriptRef = useRef<HTMLParagraphElement>(null);
  const reducedRef = useRef(false);

  // First card appears on a delay; then the cycle runs unless someone is hovering
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setActive(0), reducedRef.current ? 0 : START_DELAY);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Cycles even under reduced motion: it's a slow swap of one card, not movement
    if (active === null || pinned) return;
    const t = setTimeout(() => {
      setActive((i) => ((i ?? 0) + 1) % FEATURES.length);
      setCycleKey((k) => k + 1);
    }, CYCLE_MS);
    return () => clearTimeout(t);
  }, [active, pinned, cycleKey]);

  // Bracket from the active phrase, out into the left gutter, up to the card's left edge
  const measure = useCallback(() => {
    const wrap = wrapRef.current, card = cardRef.current, ph = active !== null ? phraseRefs.current[active] : null;
    if (!wrap || !card || !ph) { setLine(null); return; }
    const w = wrap.getBoundingClientRect(), c = card.getBoundingClientRect(), p = ph.getBoundingClientRect();
    const gx = -12, r = 8;
    const x1 = p.left - w.left - 6, y1 = p.top - w.top + p.height * 0.55;
    const y2 = c.top - w.top + c.height / 2, x2 = c.left - w.left;
    const d = `M${x1} ${y1}H${gx + r}Q${gx} ${y1} ${gx} ${y1 - r}V${y2 + r}Q${gx} ${y2} ${gx + r} ${y2}H${x2}`;
    setLine({ d, dot: [x1, y1], w: w.width, h: w.height });
  }, [active]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // "adventures" is sized so its ink spans exactly from the F of "Find" to the K of "Book"
  useLayoutEffect(() => {
    const eyebrow = eyebrowRef.current, script = scriptRef.current;
    if (!eyebrow || !script) return;
    const inkWidth = (el: Node) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return r.getBoundingClientRect().width;
    };
    const fit = () => {
      script.style.fontSize = "";
      // The eyebrow's letter-spacing trails its last letter; leave it out of the target width
      const target = inkWidth(eyebrow) - (parseFloat(getComputedStyle(eyebrow).letterSpacing) || 0);
      // Measure the word itself, not the canvas painted over it
      const natural = inkWidth(script.firstChild ?? script);
      if (target > 0 && natural > 0) {
        script.style.fontSize = `${parseFloat(getComputedStyle(script).fontSize) * (target / natural)}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(eyebrow);
    return () => ro.disconnect();
  }, []);

  const take = (i: number) => { setPinned(true); setActive(i); setCycleKey((k) => k + 1); };
  const release = () => { setPinned(false); setCycleKey((k) => k + 1); };

  const f = active !== null ? FEATURES[active] : null;

  const cardBody = f && (
    <>
      <span
        className="hp-tex"
        style={{ backgroundImage: f.texture, backgroundSize: f.textureSize }}
        aria-hidden
      />
      <span className="hp-edge" style={{ background: `linear-gradient(90deg, ${f.color}, transparent 75%)` }} aria-hidden />
      <span className="hp-icon" style={{ background: f.tint, color: f.color }}>{f.icon}</span>
      <span className="flex-1 min-w-0">
        <span className="hp-title">{f.title}</span>
        <span className="hp-blurb">{f.blurb}</span>
      </span>
      <span className="hp-go" style={{ color: f.color, borderColor: `${f.color}55` }}><ArrowUpRight className="w-4 h-4" strokeWidth={2.4} /></span>
      {!pinned && (
        <span key={cycleKey} className="hp-progress" style={{ background: f.color, animationDuration: `${CYCLE_MS}ms` }} aria-hidden />
      )}
    </>
  );

  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col items-center lg:items-start gap-2 w-full"
      style={{ animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
      onMouseLeave={release}
    >
      {/* Preview card — sits above the copy, never over it */}
      <div className="hp-slot">
        {f && (
          f.href ? (
            <Link key={f.key} ref={cardRef as React.Ref<HTMLAnchorElement>} href={f.href} className="hp-card" onMouseEnter={() => take(active!)}>
              {cardBody}
            </Link>
          ) : (
            <button key={f.key} ref={cardRef as React.Ref<HTMLButtonElement>} type="button" onClick={focusHeroPrompt} className="hp-card" onMouseEnter={() => take(active!)}>
              {cardBody}
            </button>
          )
        )}
      </div>

      {/* Reads as one line: "Find · Compare · Book adventures — matched to your body, …" */}
      {/* Shrink-wrapped to the eyebrow's width so "adventures" centres beneath it */}
      <div className="inline-flex flex-col items-center" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.55)" }}>
        <p ref={eyebrowRef} className="font-bold uppercase" style={{ fontSize: "clamp(8.5px, 0.84vw, 11.4px)", letterSpacing: "0.26em", color: "rgba(255,255,255,0.72)", marginRight: "-0.26em" }}>
          Find <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span> Compare <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span> Book
        </p>
        <p ref={scriptRef} className="hp-script">adventures<CanvasText targetRef={scriptRef} paint={paintScript} /></p>
      </div>

      <p className="text-center lg:text-left font-medium leading-snug" style={{ fontSize: "clamp(0.78rem, 1.2vw, 0.98rem)", color: "rgba(255,255,255,0.94)", letterSpacing: "0.01em", textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.55)" }}>
        {FEATURES.map((feat, i) => {
          const on = active === i;
          const props = {
            ref: (el: HTMLElement | null) => { phraseRefs.current[i] = el as HTMLSpanElement | null; },
            className: "hp-phrase",
            "data-on": on || undefined,
            style: { textDecorationColor: feat.color, ...(on ? { color: "#fff" } : {}) },
            onMouseEnter: () => take(i),
            onFocus: () => take(i),
            onBlur: release,
          };
          const inner = (
            <>
              <span className="hp-picon" style={{ color: feat.color, animationDelay: `${0.9 + i * 0.25}s` }} aria-hidden>{feat.icon}</span>
              {feat.phrase}
            </>
          );
          return (
            <span key={feat.key} className="block">
              {feat.href
                ? <Link href={feat.href} {...props}>{inner}</Link>
                : <button type="button" onClick={focusHeroPrompt} {...props}>{inner}</button>}
              {i < 2 ? ", " : "."}
            </span>
          );
        })}
      </p>

      {/* Bracket line from the active phrase up to the card */}
      {line && f && (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" width={line.w} height={line.h} viewBox={`0 0 ${line.w} ${line.h}`} aria-hidden>
          <path key={`${f.key}-${cycleKey}`} className="hp-line" d={line.d} fill="none" stroke={f.color} strokeOpacity={0.4} strokeWidth={1} strokeLinecap="round" pathLength={1} />
          <circle cx={line.dot[0]} cy={line.dot[1]} r={2} fill={f.color} fillOpacity={0.7} />
        </svg>
      )}

      <style>{`
        .hp-slot { min-height: 34px; display: flex; align-items: flex-end; margin-bottom: 8px; }
        /* Quiet glass chip — a hint beside the copy, not a second CTA. Dimmed at rest so it
           doesn't compete with the headline; it comes up to full strength on hover */
        .hp-card { position: relative; overflow: hidden; display: flex; align-items: center; gap: 7px; width: min(196px, 100%);
                   padding: 4px 6px 5px 4px; border-radius: 10px; text-align: left; color: #fff; opacity: 0.78;
                   background: rgba(12,10,9,0.22); border: 1px solid rgba(255,255,255,0.05);
                   backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                   animation: hpIn 0.5s cubic-bezier(0.22,1,0.36,1) both; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
        .hp-card:hover { opacity: 1; border-color: rgba(255,255,255,0.14); background: rgba(12,10,9,0.45); }
        .hp-card:hover .hp-go { transform: translate(2px,-2px); opacity: 1; }
        .hp-tex { position: absolute; inset: 0; opacity: 0.07; pointer-events: none;
                  -webkit-mask-image: linear-gradient(90deg, transparent 40%, #000 100%); mask-image: linear-gradient(90deg, transparent 40%, #000 100%); }
        .hp-edge { position: absolute; left: 0; right: 0; top: 0; height: 1px; opacity: 0.3; }
        .hp-icon { position: relative; width: 20px; height: 20px; border-radius: 6px; display: grid; place-items: center; flex: none; }
        .hp-icon svg { width: 11px; height: 11px; }
        .hp-picon svg { width: 14px; height: 14px; }
        .hp-title { position: relative; display: block; font-family: var(--font-jakarta), 'Plus Jakarta Sans', sans-serif; font-weight: 800;
                    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.1; color: rgba(255,255,255,0.85); }
        .hp-blurb { position: relative; display: block; font-size: 9.5px; color: rgba(255,255,255,0.45); margin-top: 1px; }
        .hp-go svg { width: 12px; height: 12px; }
        .hp-go { position: relative; width: 16px; height: 16px; display: grid; place-items: center; flex: none;
                 border: 0 !important; opacity: 0.75; transition: transform 0.2s, opacity 0.2s; }
        .hp-progress { position: absolute; left: 0; bottom: 0; height: 1px; width: 100%; transform-origin: left; opacity: 0.5;
                       animation-name: hpBar; animation-timing-function: linear; animation-fill-mode: both; }
        /* "adventures" in the hand-lettered script of the logo tagline, tucked under the eyebrow and
           sized in JS to its width. Filled trail orange into tides teal, the headline's two colours;
           a drop-shadow, not text-shadow, since text-shadow would show through the clipped fill */
        .hp-script { font-family: var(--font-script), cursive; font-weight: 700; font-size: clamp(1.94rem, 3vw, 2.46rem);
                     line-height: 1; padding: 0 0.08em; margin: 0 -0.08em 6px; white-space: nowrap; transform: rotate(-2deg);
                     position: relative; color: transparent !important; -webkit-text-fill-color: transparent !important;
                     text-shadow: none; filter: drop-shadow(0 2px 10px rgba(0,0,0,0.55)); }
        .hp-phrase { white-space: nowrap; text-decoration: underline dotted; text-decoration-thickness: 1.5px; text-underline-offset: 5px;
                     transition: color 0.3s, text-decoration-style 0.3s; cursor: pointer; font: inherit; color: inherit; background: none; padding: 0; }
        .hp-phrase[data-on] { text-decoration-style: solid; }
        .hp-picon { display: inline-grid; place-items: center; vertical-align: -2px; width: 0; margin-right: 0; opacity: 0; overflow: hidden;
                    animation: hpIcon 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .hp-line { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hpDraw 0.5s cubic-bezier(0.65,0,0.35,1) forwards; }
        @keyframes hpIn { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes hpBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes hpIcon { to { width: 20px; margin-right: 6px; opacity: 1; } }
        @keyframes hpDraw { to { stroke-dashoffset: 0; } }
        /* Phones: a smaller chip and phrase icons so the bottom band doesn't crowd the headline */
        @media (max-width: 639px) {
          .hp-slot { min-height: 30px; margin-bottom: 4px; }
          .hp-card { width: min(172px, 100%); gap: 6px; padding: 3px 5px 4px 3px; }
          .hp-icon { width: 18px; height: 18px; }
          .hp-title { font-size: 8px; }
          .hp-blurb { font-size: 8.5px; }
          .hp-picon svg { width: 12px; height: 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hp-card, .hp-picon, .hp-line { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
