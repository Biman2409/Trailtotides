"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { CompassAIMark, MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import { GENRE_GROUPS } from "@/lib/filterOptions";

// The hero's promise reads as one sentence: "Find · compare · book Adventures …" and the line
// below finishes it three ways, taking turns. Each ending is lowercase so it continues the
// sentence, and each is a way in: the fitness test, the Compass prompt bar, the operator
// directory. Hovering pauses the turns.

type PromiseItem = { key: string; text: string; color: string; icon: ReactNode; href?: string };

const PROMISES: PromiseItem[] = [
  { key: "fitness", text: "matched to your fitness", color: "#ffa576", icon: <MatchmakerMark className="w-4 h-4" strokeWidth={2.1} />, href: "/matchmaker" },
  { key: "ai", text: "picked by Compass.AI", color: "#ffd48a", icon: <CompassAIMark className="w-4 h-4" strokeWidth={2} /> },
  { key: "operators", text: "run by verified operators", color: "#7cefe3", icon: <BadgeCheck className="w-4 h-4" strokeWidth={2.2} />, href: "/operators" },
];

const TURN_MS = 3400;

// Hovering "Adventures" scatters every adventure type across the hero, tinted by genre.
// The genre colours in filterOptions are for light panels, so the hero gets pale, airy tints.
const GENRE_TINTS: Record<string, string> = { Earth: "#ffd6c2", Water: "#bdfbf3", Snow: "#e0e5ff", Air: "#ffecc4" };
const ADVENTURE_TYPES = GENRE_GROUPS.flatMap((g) => g.types.map((t) => ({ t, color: GENRE_TINTS[g.label] ?? "#fff" })));

type ScatterWord = { t: string; color: string; x: number; y: number; r: number; s: number; d: number };

type Box = { l: number; t: number; r: number; b: number };
const hits = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
const WORD_PX = 19.2; // 1.2rem, the scatter font size before --s

const CLEARANCE = 14;

// Everything on screen over the hero a word must not touch: every visible line of text
// (headline, promise, navbar, "Explore all", "Scroll"…) measured tightly, plus the search bar.
// Measuring live means new copy in the hero is avoided without updating a list here.
function heroObstacles(hero: HTMLElement, area: DOMRect): Box[] {
  const pad = (r: DOMRect): Box => ({
    l: r.left - area.left - CLEARANCE, t: r.top - area.top - CLEARANCE,
    r: r.right - area.left + CLEARANCE, b: r.bottom - area.top + CLEARANCE,
  });
  const onHero = (r: DOMRect) => r.width > 2 && r.height > 2 && r.right > area.left && r.left < area.right && r.bottom > area.top && r.top < area.bottom;
  const boxes: Box[] = [];
  const range = document.createRange();
  for (const root of [hero, ...document.querySelectorAll("nav")]) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement;
      if (!el || !n.textContent?.trim() || el.closest(".hp-scatter, style, script")) continue;
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (onHero(r)) boxes.push(pad(r));
    }
  }
  // The search bar, and the whole navbar strip so no word squeezes in between its items
  for (const el of [...hero.querySelectorAll("form"), ...document.querySelectorAll("nav")]) {
    const r = el.getBoundingClientRect();
    if (onHero(r)) boxes.push(pad(r));
  }
  return boxes;
}

// Random spots across the hero clear of all hero text and of each other, spread evenly:
// each word samples many clear spots and takes the one farthest from the words already
// placed (best-candidate sampling), so they cover the screen instead of clumping. A word
// with no clear spot tries smaller, and is left out rather than overlap anything.
function scatterWords(hero: HTMLElement): ScatterWord[] {
  const area = hero.getBoundingClientRect();
  const taken = heroObstacles(hero, area);
  const centers: { x: number; y: number }[] = [];
  const words: ScatterWord[] = [];
  // Script glyphs vary a lot in width, so measure each word in the real font
  const ctx = document.createElement("canvas").getContext("2d");
  const family = getComputedStyle(hero.querySelector(".hp-adv") ?? hero).fontFamily;
  const textWidth = (t: string, px: number) => {
    if (!ctx) return t.length * px * 0.5;
    ctx.font = `500 ${px}px ${family}`;
    return ctx.measureText(t).width;
  };
  for (const a of [...ADVENTURE_TYPES].sort(() => Math.random() - 0.5)) {
    const base = 0.85 + Math.random() * 0.45;
    for (const shrink of [1, 0.85, 0.7]) {
      const s = base * shrink;
      const w = textWidth(a.t, WORD_PX * s) * 1.08 + 10;
      const h = WORD_PX * s * 1.2;
      let best: { x: number; y: number; box: Box; far: number } | null = null;
      for (let tries = 0; tries < 120; tries++) {
        const x = w / 2 + Math.random() * (area.width - w);
        const y = h / 2 + Math.random() * (area.height - h);
        const box = { l: x - w / 2, t: y - h / 2, r: x + w / 2, b: y + h / 2 };
        if (taken.some((o) => hits(box, o))) continue;
        const far = centers.length ? Math.min(...centers.map((c) => Math.hypot(c.x - x, c.y - y))) : Math.random();
        if (!best || far > best.far) best = { x, y, box, far };
      }
      if (!best) continue;
      const { x, y, box } = best;
      // Words keep a little space between each other too
      taken.push({ l: box.l - 8, t: box.t - 8, r: box.r + 8, b: box.b + 8 });
      centers.push({ x, y });
      words.push({ ...a, x: (x / area.width) * 100, y: (y / area.height) * 100, r: Math.random() * 10 - 5, s, d: Math.random() * 0.35 });
      break;
    }
  }
  return words;
}

// The AI sentence points at the hero's own prompt bar rather than opening a new surface
function focusHeroPrompt() {
  (document.getElementById("hero-compass-input") as HTMLInputElement | null)?.focus();
}

export default function HeroPromise() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [hero, setHero] = useState<HTMLElement | null>(null);
  const [words, setWords] = useState<{ id: number; list: ScatterWord[] } | null>(null);
  const [wordsOn, setWordsOn] = useState(false);
  const raf = useRef(0);

  // The words fill the whole hero section, not just this column
  useEffect(() => {
    const section = rootRef.current?.closest("section") ?? null;
    section?.classList.add("hp-hero");
    setHero(section);
  }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  // While the words are out the rest of the hero copy fades back too; "Adventures" stays lit
  useEffect(() => {
    hero?.classList.toggle("hp-dim-on", wordsOn);
  }, [hero, wordsOn]);

  function showWords() {
    if (!hero) return;
    // A fresh layout each hover; they mount hidden and switch on next frame so they animate in
    const list = scatterWords(hero);
    setWords((w) => ({ id: (w?.id ?? 0) + 1, list }));
    setWordsOn(false);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => { raf.current = requestAnimationFrame(() => setWordsOn(true)); });
  }
  function hideWords() {
    cancelAnimationFrame(raf.current);
    setWordsOn(false);
  }

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((n) => (n + 1) % PROMISES.length), TURN_MS);
    return () => clearTimeout(t);
  }, [i, paused]);

  const p = PROMISES[i];
  const body = (
    <>
      <span className="hp-icon">{p.icon}</span>
      <span className="hp-text">{p.text}</span>
      <ArrowRight className="hp-arrow w-4 h-4" />
    </>
  );

  return (
    <div
      ref={rootRef}
      className="flex flex-col items-center lg:items-start w-full"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      {/* "Adventures" sets the block's width; the line above and the sentence below
          stretch to exactly that width, and their sizes scale with it */}
      <div className="hp-block">
        <p className="hp-kicker">
          <span className="hp-w" style={{ animationDelay: "0.15s" }}>FIND</span>
          <span className="hp-dot" style={{ animationDelay: "0.3s" }} />
          <span className="hp-w" style={{ animationDelay: "0.35s" }}>COMPARE</span>
          <span className="hp-dot" style={{ animationDelay: "0.5s" }} />
          <span className="hp-w hp-w-last" style={{ animationDelay: "0.55s" }}>BOOK</span>
        </p>

        <span className="relative block" onMouseEnter={showWords} onMouseLeave={hideWords}>
          <span className="hp-adv">Adventures</span>
          <svg className="hp-swoosh" viewBox="0 0 330 22" preserveAspectRatio="none" aria-hidden>
            <path d="M6 15 C 80 5, 190 4, 322 11" pathLength={1} fill="none" stroke="#ff7a33" strokeWidth="4.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </span>

        <div className="hp-line">
          {p.href ? (
            <Link key={p.key} href={p.href} className="hp-link" style={{ "--c": p.color } as React.CSSProperties}>{body}</Link>
          ) : (
            <button key={p.key} type="button" onClick={focusHeroPrompt} className="hp-link" style={{ "--c": p.color } as React.CSSProperties}>{body}</button>
          )}
        </div>
      </div>

      {hero && words && createPortal(
        <div aria-hidden className={`hp-scatter${wordsOn ? " is-on" : ""}`}>
          {words.list.map((w) => (
            <span
              key={`${words.id}-${w.t}`}
              style={{ left: `${w.x}%`, top: `${w.y}%`, transitionDelay: wordsOn ? `${w.d}s` : "0s", "--c": w.color, "--r": `${w.r}deg`, "--s": w.s } as React.CSSProperties}
            >
              {w.t}
            </span>
          ))}
        </div>,
        hero,
      )}

      <style>{`
        /* --adv is the size of "Adventures"; everything else is measured from it */
        .hp-block { --adv: clamp(3.6rem, 5.4vw, 4.75rem); display: inline-flex; flex-direction: column; width: max-content; max-width: 100%; }
        /* width 0 + min-width 100%: fill the block without widening it */
        .hp-kicker, .hp-line { width: 0; min-width: 100%; }
        /* Bigger, tighter caps; padding-left matches where the script's "A" ink begins */
        .hp-kicker { display: flex; align-items: center; justify-content: space-between; margin: 0 0 0.3em; padding-left: calc(var(--adv) * 0.035); line-height: 1;
                     font: 700 calc(var(--adv) * 0.22) var(--font-dm-sans, 'DM Sans'), sans-serif; letter-spacing: 0.16em;
                     color: rgba(255,255,255,0.92); text-shadow: 0 1px 10px rgba(0,0,0,0.6); }
        .hp-w { animation: hpUp .6s cubic-bezier(.2,1,.3,1) both; }
        /* letter-spacing trails the last letter; pull it back, plus the script's "s" swash overhang, so BOOK ends flush */
        .hp-w-last { margin-right: calc(-0.16em - var(--adv) * 0.028); }
        .hp-dot { width: 0.36em; height: 0.36em; border-radius: 50%; background: #ff8a4c; flex: none; animation: hpPop .4s cubic-bezier(.3,1.8,.5,1) both; }
        .hp-adv { display: block; padding-right: 0.06em; font-family: var(--font-script), cursive; font-weight: 700; font-size: var(--adv); line-height: 0.9;
                  color: #fff; text-shadow: 0 4px 24px rgba(0,0,0,0.55); animation: hpWrite 1s .55s cubic-bezier(.2,1,.3,1) both; }
        .hp-swoosh { position: absolute; left: 0; bottom: -0.32em; width: 96%; height: 0.3em; overflow: visible; }
        .hp-swoosh path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hpDraw .8s 1.3s cubic-bezier(.6,0,.2,1) forwards; }
        .hp-line { margin-top: calc(var(--adv) * 0.32); display: flex; }
        /* Icon at the left edge, arrow at the right */
        .hp-link { width: 100%; display: flex; align-items: center; gap: 0.55em; padding: 0; background: none; border: 0; cursor: pointer; text-decoration: none;
                   font: 600 calc(var(--adv) * 0.225) var(--font-dm-sans, 'DM Sans'), sans-serif; color: var(--c); text-shadow: 0 1px 10px rgba(0,0,0,0.6);
                   animation: hpRoll .55s cubic-bezier(.2,1,.3,1) both; }
        .hp-text { white-space: nowrap; }
        .hp-arrow { margin-left: auto; flex: none; transition: transform .3s; }
        .hp-link:hover .hp-arrow { transform: translateX(3px); }
        .hp-link:focus-visible { outline: 2px solid var(--c); outline-offset: 4px; border-radius: 4px; }
        .hp-icon { display: grid; place-items: center; }
        /* Scattered types sit above the photo and scrim but under the hero copy (z-10) */
        .hp-scatter { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
        /* The photo fades back while the words are out, so they read clearly */
        .hp-scatter::before { content: ""; position: absolute; inset: 0; background: rgba(5,8,12,0.55); opacity: 0; transition: opacity .5s ease; }
        .hp-scatter.is-on::before { opacity: 1; }
        .hp-hero :is(h1, .hp-kicker, .hp-line, form, a[href='/explore'], .hero-scroll) { transition: opacity .5s ease; }
        .hp-hero.hp-dim-on :is(h1, .hp-kicker, .hp-line, form, a[href='/explore'], .hero-scroll) { opacity: 0.15; }
        /* Handwritten like "Adventures": each word writes itself in left to right, in a
           white-to-genre gradient with a soft genre glow, then drifts gently while shown */
        .hp-scatter span { position: absolute; white-space: nowrap; opacity: 0; padding: 0 0.12em;
                           /* 1.2rem matches WORD_PX, which the layout uses to size each word */
                           font: 500 calc(1.2rem * var(--s)) var(--font-script), cursive; line-height: 1.1;
                           background: linear-gradient(100deg, #fff 15%, var(--c) 85%); -webkit-background-clip: text; background-clip: text; color: transparent;
                           filter: drop-shadow(0 0 10px color-mix(in srgb, var(--c) 50%, transparent)) drop-shadow(0 1px 6px rgba(0,0,0,0.5));
                           clip-path: inset(-30% 100% -30% -10%);
                           transform: translate(-50%, -50%) rotate(var(--r));
                           transition: opacity .35s ease, clip-path .9s cubic-bezier(.3,.7,.2,1); }
        .hp-scatter.is-on span { opacity: 0.92; clip-path: inset(-30% -15% -30% -10%);
                                 animation: hpDrift 5s ease-in-out infinite alternate; }
        .hp-scatter.is-on span:nth-child(odd) { animation-direction: alternate-reverse; animation-duration: 6.5s; }
        @keyframes hpDrift { from { translate: 0 -3px; } to { translate: 0 4px; } }
        @media (prefers-reduced-motion: reduce) {
          .hp-scatter span, .hp-scatter.is-on span { clip-path: none; animation: none; transition: opacity .4s ease; }
        }
        @keyframes hpUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes hpPop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: none; } }
        /* Negative insets leave room for the script's swashes, so the final "s" isn't clipped */
        @keyframes hpWrite { from { opacity: 0; clip-path: inset(-30% 100% -30% -10%); } to { opacity: 1; clip-path: inset(-30% -15% -30% -10%); } }
        @keyframes hpDraw { to { stroke-dashoffset: 0; } }
        @keyframes hpRoll { from { opacity: 0; transform: translateY(12px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
      `}</style>
    </div>
  );
}
