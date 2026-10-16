"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";

// The hero's promise: FIND · COMPARE · BOOK, a hand-written "Adventures", then the three
// things that set us apart as linked sentences that take turns. Each sentence is a way in:
// the fitness test, the Compass prompt bar, the operator directory.

type PromiseItem = { key: string; text: string; color: string; icon: ReactNode; href?: string };

const PROMISES: PromiseItem[] = [
  { key: "fitness", text: "Every trip matched to your fitness", color: "#ffa576", icon: <Activity className="w-4 h-4" strokeWidth={2.2} />, href: "/matchmaker" },
  { key: "ai", text: "Picks made for you by AI", color: "#ffd48a", icon: <Sparkles className="w-4 h-4" strokeWidth={2} /> },
  { key: "operators", text: "Booked only with verified operators", color: "#7cefe3", icon: <BadgeCheck className="w-4 h-4" strokeWidth={2.2} />, href: "/operators" },
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
      <p className="hp-kicker">
        <span className="hp-w" style={{ animationDelay: "0.15s" }}>FIND</span>
        <span className="hp-dot" style={{ animationDelay: "0.3s" }} />
        <span className="hp-w" style={{ animationDelay: "0.35s" }}>COMPARE</span>
        <span className="hp-dot" style={{ animationDelay: "0.5s" }} />
        <span className="hp-w" style={{ animationDelay: "0.55s" }}>BOOK</span>
      </p>

      <div className="flex items-end gap-3 sm:gap-4">
        <span className="relative inline-block">
          <span className="hp-adv">Adventures</span>
          <svg className="hp-swoosh" viewBox="0 0 330 22" preserveAspectRatio="none" aria-hidden>
            <path d="M6 15 C 80 5, 190 4, 322 11" pathLength={1} fill="none" stroke="#ff7a33" strokeWidth="4.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </span>
        <span className="hp-where">ACROSS<br />INDIA</span>
      </div>

      <div className="hp-line" aria-live="polite">
        {p.href ? (
          <Link key={p.key} href={p.href} className="hp-link" style={{ "--c": p.color } as React.CSSProperties}>{body}</Link>
        ) : (
          <button key={p.key} type="button" onClick={focusHeroPrompt} className="hp-link" style={{ "--c": p.color } as React.CSSProperties}>{body}</button>
        )}
      </div>

      <div className="flex gap-1.5" role="tablist" aria-label="What sets us apart">
        {PROMISES.map((q, n) => (
          <button
            key={q.key} type="button" role="tab" aria-selected={n === i} aria-label={q.text}
            onClick={() => setI(n)}
            className="hp-tab" style={{ width: n === i ? 34 : 10 }}
          >
            {n === i && <span key={`${i}-${paused}`} className={paused ? "hp-fill hp-fill-held" : "hp-fill"} style={{ background: q.color }} />}
          </button>
        ))}
      </div>

      <style>{`
        .hp-kicker { display: flex; align-items: center; gap: 12px; margin: 0 0 2px; font: 700 12px var(--font-dm-sans, 'DM Sans'), sans-serif; letter-spacing: 0.42em;
                     color: rgba(255,255,255,0.92); text-shadow: 0 1px 10px rgba(0,0,0,0.6); }
        .hp-w { animation: hpUp .6s cubic-bezier(.2,1,.3,1) both; }
        .hp-dot { width: 5px; height: 5px; border-radius: 50%; background: #ff8a4c; flex: none; animation: hpPop .4s cubic-bezier(.3,1.8,.5,1) both; }
        .hp-adv { display: block; font-family: var(--font-script), cursive; font-weight: 700; font-size: clamp(3rem, 5.4vw, 4.75rem); line-height: 0.9;
                  color: #fff; text-shadow: 0 4px 24px rgba(0,0,0,0.55); animation: hpWrite 1s .55s cubic-bezier(.2,1,.3,1) both; }
        .hp-swoosh { position: absolute; left: 0; right: 4%; bottom: -0.32em; width: 96%; height: 0.3em; overflow: visible; }
        .hp-swoosh path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hpDraw .8s 1.3s cubic-bezier(.6,0,.2,1) forwards; }
        .hp-where { padding-bottom: 0.9em; font: 700 10px/1.5 var(--font-dm-sans, 'DM Sans'), sans-serif; letter-spacing: 0.32em; color: rgba(255,255,255,0.75);
                    text-shadow: 0 1px 8px rgba(0,0,0,0.6); animation: hpUp .6s 1.1s both; }
        .hp-line { min-height: 34px; margin-top: 18px; display: flex; align-items: center; }
        .hp-link { display: inline-flex; align-items: center; gap: 9px; padding: 0; background: none; border: 0; cursor: pointer; text-decoration: none;
                   font: 600 16px var(--font-dm-sans, 'DM Sans'), sans-serif; color: var(--c); text-shadow: 0 1px 10px rgba(0,0,0,0.6);
                   animation: hpRoll .55s cubic-bezier(.2,1,.3,1) both; }
        .hp-text { background-image: linear-gradient(currentColor, currentColor); background-repeat: no-repeat; background-position: 0 100%;
                   background-size: 100% 1px; padding-bottom: 2px; transition: background-size .3s; }
        .hp-link:hover .hp-text { background-size: 100% 2px; }
        .hp-arrow { transition: transform .3s; }
        .hp-link:hover .hp-arrow { transform: translateX(4px); }
        .hp-link:focus-visible { outline: 2px solid var(--c); outline-offset: 4px; border-radius: 4px; }
        .hp-icon { display: grid; place-items: center; }
        .hp-tab { position: relative; height: 4px; margin-top: 8px; padding: 0; border: 0; border-radius: 4px; overflow: hidden; cursor: pointer;
                  background: rgba(255,255,255,0.25); transition: width .4s cubic-bezier(.2,1,.3,1); }
        .hp-tab:focus-visible { outline: 1px solid #fff; outline-offset: 3px; }
        .hp-fill { position: absolute; inset: 0; transform-origin: left; animation: hpFill ${TURN_MS}ms linear both; }
        .hp-fill-held { animation: none; }
        @keyframes hpUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes hpPop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: none; } }
        @keyframes hpWrite { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
        @keyframes hpDraw { to { stroke-dashoffset: 0; } }
        @keyframes hpRoll { from { opacity: 0; transform: translateY(12px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
        @keyframes hpFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @media (max-width: 639px) {
          .hp-kicker { font-size: 10.5px; gap: 9px; letter-spacing: 0.36em; }
          .hp-link { font-size: 14px; gap: 7px; }
          .hp-line { margin-top: 14px; }
        }
      `}</style>
    </div>
  );
}
