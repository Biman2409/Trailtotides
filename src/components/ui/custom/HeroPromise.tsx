"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { CompassAIMark, MatchmakerMark } from "@/components/ui/custom/BrandMarks";

// The hero's promise: FIND · COMPARE · BOOK, a hand-written "Adventures", then the three
// things that set us apart as linked sentences that take turns. Each sentence is a way in:
// the fitness test, the Compass prompt bar, the operator directory. Hovering pauses the turns.

type PromiseItem = { key: string; text: string; color: string; icon: ReactNode; href?: string };

const PROMISES: PromiseItem[] = [
  { key: "fitness", text: "Matched to your fitness", color: "#ffa576", icon: <MatchmakerMark className="w-4 h-4" strokeWidth={2.1} />, href: "/matchmaker" },
  { key: "ai", text: "Picked by Compass.AI", color: "#ffd48a", icon: <CompassAIMark className="w-4 h-4" strokeWidth={2} /> },
  { key: "operators", text: "Verified operators only", color: "#7cefe3", icon: <BadgeCheck className="w-4 h-4" strokeWidth={2.2} />, href: "/operators" },
];

const TURN_MS = 3400;

// The AI sentence points at the hero's own prompt bar rather than opening a new surface
function focusHeroPrompt() {
  (document.getElementById("hero-compass-input") as HTMLInputElement | null)?.focus();
}

export default function HeroPromise() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

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

        <span className="relative block">
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

      <style>{`
        /* --adv is the size of "Adventures"; everything else is measured from it */
        .hp-block { --adv: clamp(3.6rem, 5.4vw, 4.75rem); display: inline-flex; flex-direction: column; width: max-content; max-width: 100%; }
        /* width 0 + min-width 100%: fill the block without widening it */
        .hp-kicker, .hp-line { width: 0; min-width: 100%; }
        .hp-kicker { display: flex; align-items: center; justify-content: space-between; margin: 0 0 0.35em; line-height: 1;
                     font: 700 calc(var(--adv) * 0.165) var(--font-dm-sans, 'DM Sans'), sans-serif; letter-spacing: 0.3em;
                     color: rgba(255,255,255,0.92); text-shadow: 0 1px 10px rgba(0,0,0,0.6); }
        .hp-w { animation: hpUp .6s cubic-bezier(.2,1,.3,1) both; }
        /* letter-spacing trails the last letter; pull it back so BOOK ends flush */
        .hp-w-last { margin-right: -0.3em; }
        .hp-dot { width: 0.42em; height: 0.42em; border-radius: 50%; background: #ff8a4c; flex: none; animation: hpPop .4s cubic-bezier(.3,1.8,.5,1) both; }
        .hp-adv { display: block; padding-right: 0.06em; font-family: var(--font-script), cursive; font-weight: 700; font-size: var(--adv); line-height: 0.9;
                  color: #fff; text-shadow: 0 4px 24px rgba(0,0,0,0.55); animation: hpWrite 1s .55s cubic-bezier(.2,1,.3,1) both; }
        .hp-swoosh { position: absolute; left: 0; bottom: -0.32em; width: 96%; height: 0.3em; overflow: visible; }
        .hp-swoosh path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hpDraw .8s 1.3s cubic-bezier(.6,0,.2,1) forwards; }
        .hp-line { margin-top: calc(var(--adv) * 0.32); display: flex; }
        /* Icon at the left edge, arrow at the right, a hairline across the full width */
        .hp-link { width: 100%; display: flex; align-items: center; gap: 0.55em; padding: 0 0 0.45em; background: none; border: 0; cursor: pointer; text-decoration: none;
                   border-bottom: 1px solid color-mix(in srgb, var(--c) 55%, transparent); transition: border-color .3s;
                   font: 600 calc(var(--adv) * 0.225) var(--font-dm-sans, 'DM Sans'), sans-serif; color: var(--c); text-shadow: 0 1px 10px rgba(0,0,0,0.6);
                   animation: hpRoll .55s cubic-bezier(.2,1,.3,1) both; }
        .hp-link:hover { border-bottom-color: var(--c); }
        .hp-text { white-space: nowrap; }
        .hp-arrow { margin-left: auto; flex: none; transition: transform .3s; }
        .hp-link:hover .hp-arrow { transform: translateX(3px); }
        .hp-link:focus-visible { outline: 2px solid var(--c); outline-offset: 4px; border-radius: 4px; }
        .hp-icon { display: grid; place-items: center; }
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
