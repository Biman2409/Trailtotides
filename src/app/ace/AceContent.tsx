"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, MotionConfig, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown, Check, Waves as WavesIcon } from "lucide-react";
import { Flame, Zap, Dumbbell, Compass, Waves, Mountain, ScanEye, Ghost } from "@/lib/localIcons";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import { computeMatchScore, type ACE } from "@/lib/ace";
import { bucketFor, TRAINING_TIPS } from "@/lib/fitness";
import { TIER_LIST, getTierLabel } from "@/lib/tiers";
import { RANK_ICONS } from "@/lib/rankIcons";
import AceRadar, { AXIS_KEYS, AXIS_NAMES, axisColor, RollingNumber } from "./AceRadar";

/* ── Content ──────────────────────────────────────────────────── */

export type AceTrek = {
  slug: string;
  name: string;
  image?: string;
  grade: string;
  /** difficulty level whose colour the trek wears */
  tone: 3 | 4 | 5;
  blurb: string;
  /** stamina, power, strength, agility, water, altitude, focus, nerve */
  values: number[];
};

type Profile = { id: string; name: string; grade: string; color: string; values: number[]; blurb: string; slug?: string; image?: string };

// Ganga rapids up to Class IV; low altitude and close to town, so altitude 0 and nerve stays low
const RISHIKESH_RAFTING: Profile = {
  id: "rishikesh-rafting", name: "Rishikesh River Rafting", grade: "Class III–IV", color: "var(--ace-water)",
  values: [2, 3, 2, 2, 4, 0, 3, 2], blurb: "The Ganga's rapids, close to town and at low altitude.",
};

const AXES = [
  { icon: Flame,    group: "Engine",   desc: "Keeping going, day after day.",                       low: "A few hours of walking with plenty of rest.",            high: "Eight hours or more a day, for a week, with no rest day." },
  { icon: Zap,      group: "Engine",   desc: "Short, all-out efforts.",                             low: "Steady effort with nothing steep.",                      high: "Repeated hard pushes: a steep summit day, a big rapid." },
  { icon: Dumbbell, group: "Chassis",  desc: "Carrying weight over rough ground.",                  low: "A day pack, with porters or mules for the rest.",        high: "A heavy pack over boulders and moraine for hours." },
  { icon: Compass,  group: "Chassis",  desc: "Keeping your footing.",                               low: "Clear, even paths.",                                     high: "Loose scree, ice and narrow ridges where a slip matters." },
  { icon: Waves,    group: "Elements", desc: "Being at ease in moving water.",                      low: "Calm water with a life jacket on.",                      high: "Big rapids or open water you may have to swim in." },
  { icon: Mountain, group: "Elements", desc: "Coping with thin air.",                               low: "Staying below about 2,500m.",                            high: "Above 5,000m, with acclimatisation days built in." },
  { icon: ScanEye,  group: "Mind",     desc: "Staying calm and careful near drops.",                low: "Nothing exposed.",                                       high: "Long stretches on fixed ropes or above big drops." },
  { icon: Ghost,    group: "Mind",     desc: "Staying clear-headed far from help.",                 low: "A road and phone signal close by.",                      high: "Days from the nearest road, no signal, rescue hours away." },
];

const GROUPS = [
  { name: "Engine",   sub: "How hard and how long you can go", axes: [0, 1] },
  { name: "Chassis",  sub: "Carrying weight and footing",      axes: [2, 3] },
  { name: "Elements", sub: "Water and thin air",               axes: [4, 5] },
  { name: "Mind",     sub: "Staying calm when it counts",      axes: [6, 7] },
];

const LEVELS = [
  { label: "Not part of it", sub: "The trip doesn't ask for this at all." },
  { label: "Very light",     sub: "Fine for anyone who's active." },
  { label: "Light",          sub: "Some regular exercise helps." },
  { label: "Moderate",       sub: "You'll want regular training." },
  { label: "High",           sub: "Needs serious preparation." },
  { label: "Extreme",        sub: "For very fit, experienced people." },
];

// Sample people for the rank and matching demos (stamina … nerve, each 1–5)
const PEOPLE = [
  { name: "New to the hills",   values: [2, 1, 2, 2, 1, 1, 2, 2] },
  { name: "Weekend trekker",    values: [3, 2, 3, 3, 1, 2, 3, 3] },
  { name: "Seasoned trekker",   values: [4, 3, 3, 4, 2, 4, 4, 3] },
  { name: "Expedition regular", values: [5, 4, 4, 5, 3, 5, 4, 4] },
  { name: "Strong at everything", values: [5, 5, 5, 5, 5, 5, 5, 5] },
];

const RANK_COPY: Record<string, string> = {
  Pathfinder:  "Day hikes and easy multi-day trails.",
  Navigator:   "Multi-day treks with moderate demands.",
  Trailblazer: "Technical routes, high altitude and longer trips.",
  Vanguard:    "Expeditions in remote, extreme conditions.",
  Apex:        "Strong across the board. Nothing is out of reach.",
};
const RANKS = TIER_LIST.filter(t => t.rank > 0);

const toACE = (v: number[]) => Object.fromEntries(AXIS_KEYS.map((k, i) => [k, v[i]])) as unknown as ACE;
const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
const BUCKET_VAR = { ready: "var(--ok)", stretch: "var(--warn)", "not-yet": "var(--bad)" } as const;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Shared bits ──────────────────────────────────────────────── */

/** Steps through `count` items while `running`; a manual pick stops the autoplay */
function useCycle(count: number, ms: number, running: boolean) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const reduce = useReducedMotion();
  // keeps going under reduced motion, just slower: things change in place, they don't travel
  const period = reduce ? Math.round(ms * 1.6) : ms;
  useEffect(() => {
    if (!running || held) return;
    const t = setTimeout(() => setI(x => (x + 1) % count), period);
    return () => clearTimeout(t);
  }, [i, running, held, count, period]);
  return { i, period, auto: running && !held, pick: (n: number) => { setI(n); setHeld(true); } };
}

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** A thin bar that fills over one autoplay step */
function StepTimer({ period, color, show, k }: { period: number; color: string; show: boolean; k: string | number }) {
  const mounted = useMounted();
  if (!mounted || !show) return null;
  return <span key={k} className="ace-timer absolute left-0 bottom-0 h-[2px] w-full" style={{ background: color, animationDuration: `${period}ms` }} />;
}

function SectionHead({ eyebrow, title, children, center }: { eyebrow: string; title: string; children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: "var(--ace-accent)" }}>{eyebrow}</p>
      <h2 className="text-[1.9rem] sm:text-[2.4rem] leading-[1.08] mb-4" style={{ color: "var(--ace-ink)", textWrap: "balance" }}>{title}</h2>
      <p className="text-[15px] sm:text-base leading-relaxed" style={{ color: "var(--ace-soft)" }}>{children}</p>
    </div>
  );
}

const panel: React.CSSProperties = { background: "var(--ace-panel)", border: "1px solid var(--ace-line)", boxShadow: "var(--ace-shadow)" };

/* ── Page ─────────────────────────────────────────────────────── */

export default function AceContent({ treks }: { treks: AceTrek[] }) {
  const profiles: Profile[] = [
    ...treks.map(t => ({ id: t.slug, name: t.name, grade: t.grade, color: `var(--lv-${t.tone})`, values: t.values, blurb: t.blurb, slug: t.slug, image: t.image })),
    RISHIKESH_RAFTING,
  ];
  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div className="ace">
        <Hero profiles={profiles} />
        <Scores profiles={profiles} />
        <Scale profiles={profiles} />
        <Rank />
        <Matching profiles={profiles} />
        <Cta />
      </div>
    </MotionConfig>
  );
}

/* ── Hero: a live instrument ──────────────────────────────────── */

function Hero({ profiles }: { profiles: Profile[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const [hoverAxis, setHoverAxis] = useState<number | null>(null);
  const [hoverPanel, setHoverPanel] = useState(false);
  const { i, pick, auto, period } = useCycle(profiles.length, 3800, inView && hoverAxis === null && !hoverPanel);
  const p = profiles[i];
  const max = Math.max(...p.values);
  const biggest = p.values.map((v, k) => ({ v, k })).filter(x => x.v === max).slice(0, 3);
  const words = "Know what an adventure asks of you".split(" ");

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(var(--ace-grid) 1px, transparent 1px), linear-gradient(90deg, var(--ace-grid) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.35, WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 60% 40%, #000, transparent 75%)", maskImage: "radial-gradient(ellipse 80% 70% at 60% 40%, #000, transparent 75%)" }} />
      <SectionTexture kind="trail" color="var(--ace-accent)" at="80% 40%" opacity={0.1} />

      <div className="relative mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-10 lg:gap-12 items-center">
        {/* Words */}
        <div className="min-w-0">
          <div className="ace-in inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full" style={{ background: tint("var(--ace-accent)", 10), border: `1px solid ${tint("var(--ace-accent)", 30)}` }}>
            <span className="relative flex w-2 h-2">
              <span className="ace-ping-dot absolute inset-0 rounded-full" style={{ background: "var(--ace-accent)" }} />
              <span className="relative w-2 h-2 rounded-full" style={{ background: "var(--ace-accent)" }} />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--ace-accent)" }}>ACE<sup>™</sup> · Adventure Capability Engine</span>
          </div>
          <h1 className="text-[2.6rem] sm:text-5xl lg:text-[3.6rem] leading-[1.02] mb-5" style={{ color: "var(--ace-ink)" }}>
            {words.map((w, k) => (
              <span key={k} className="ace-in ace-in-blur inline-block mr-[0.24em]" style={{ animationDelay: `${80 + k * 60}ms`, color: w === "asks" ? "var(--ace-accent)" : undefined }}>{w}</span>
            ))}
          </h1>
          <p className="ace-in text-base sm:text-[17px] leading-relaxed max-w-xl mb-7" style={{ color: "var(--ace-soft)", animationDelay: "520ms" }}>
            &ldquo;Easy&rdquo; and &ldquo;hard&rdquo; hide too much. ACE scores every adventure on <strong style={{ color: "var(--ace-ink)" }}>eight things it asks of your body and mind</strong>. Answer a few questions and we score you the same way, so you can see what you&apos;re ready for before you book.
          </p>
          <div className="ace-in flex flex-wrap items-center gap-3" style={{ animationDelay: "650ms" }}>
            <Link href="/matchmaker" className="ace-shimmer group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white transition-transform hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)", boxShadow: "0 10px 28px -10px rgba(255,81,0,0.6)" }}>
              Find my matches <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#scores" className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[15px] transition-colors" style={{ color: "var(--ace-ink)", border: "1px solid var(--ace-line)", background: "var(--ace-panel)" }}>
              How scoring works <ArrowDown className="w-4 h-4" />
            </a>
          </div>
          <p className="ace-in mt-4 text-[13px]" style={{ color: "var(--ace-faint)", animationDelay: "750ms" }}>Takes 1 to 3 minutes.</p>
        </div>

        {/* Instrument */}
        <div
          className="ace-in ace-in-scale min-w-0 rounded-3xl p-4 sm:p-6" style={{ ...panel, animationDelay: "200ms" }}
          onMouseEnter={() => setHoverPanel(true)} onMouseLeave={() => setHoverPanel(false)}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--ace-faint)" }}>Now scoring</p>
              <div className="h-7 relative overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p key={p.id} className="text-lg font-bold truncate" style={{ color: "var(--ace-ink)" }}
                    initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}
                  >{p.name}</motion.p>
                </AnimatePresence>
              </div>
            </div>
            <span className="shrink-0 text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ color: p.color, background: tint(p.color, 12), border: `1px solid ${tint(p.color, 35)}`, transition: "color 500ms, background 500ms, border-color 500ms" }}>{p.grade}</span>
          </div>

          <div className="grid sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 sm:gap-4 items-center">
            <AceRadar values={p.values} color={p.color} sweep scores={false} highlight={hoverAxis} onHover={setHoverAxis} className="w-full max-w-[380px] mx-auto" title={`${p.name}: ${p.values.map((v, k) => `${AXIS_NAMES[k]} ${v}`).join(", ")}`} />

            {/* Readout: the same eight scores as moving bars */}
            <ul className="space-y-1" onMouseLeave={() => setHoverAxis(null)}>
              {AXIS_NAMES.map((name, k) => {
                const v = p.values[k];
                const on = hoverAxis === k;
                return (
                  <li key={name}
                    onMouseEnter={() => setHoverAxis(k)}
                    className="grid grid-cols-[66px_1fr_18px] items-center gap-2 px-2 py-1.5 rounded-lg cursor-default"
                    style={{ background: on ? tint(axisColor(k), 12) : "transparent", opacity: hoverAxis !== null && !on ? 0.45 : 1, transition: "background 200ms, opacity 200ms" }}
                  >
                    <span className="text-[13px] font-semibold" style={{ color: "var(--ace-ink)" }}>{name}</span>
                    <span className="h-2 rounded-full overflow-hidden" style={{ background: "var(--ace-line)" }}>
                      <motion.span className="block h-full rounded-full" style={{ background: axisColor(k) }}
                        initial={false} animate={{ width: `${v * 20}%` }} transition={{ type: "spring", stiffness: 120, damping: 18, delay: k * 0.03 }} />
                    </span>
                    <RollingNumber value={v} className="text-[13px] font-bold text-right tabular-nums" style={{ color: v ? "var(--ace-ink)" : "var(--ace-faint)" }} />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-3 pt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={{ borderTop: "1px solid var(--ace-line)" }}>
            <p className="text-[13px]" style={{ color: "var(--ace-soft)" }}>
              Asks most: {biggest.map((b, n) => (
                <span key={b.k} className="font-bold" style={{ color: axisColor(b.k) }}>{n ? ", " : ""}{AXIS_NAMES[b.k]} {b.v}</span>
              ))}
            </p>
            <div className="flex gap-1.5" role="tablist" aria-label="Example adventures">
              {profiles.map((q, n) => (
                <button key={q.id} type="button" role="tab" aria-selected={n === i} aria-label={q.name} title={q.name}
                  onClick={() => pick(n)}
                  className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
                  style={{ width: n === i ? 40 : 16, background: n === i && !auto ? q.color : "var(--ace-line)" }}
                >
                  {n === i && <StepTimer show={auto} period={period} color={q.color} k={`${i}`} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The eight scores: an explorer ────────────────────────────── */

function Scores({ profiles }: { profiles: Profile[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const { i: axis, pick, auto, period } = useCycle(8, 5200, inView);
  const a = AXES[axis];
  const color = axisColor(axis);
  const Icon = a.icon;

  return (
    <section id="scores" ref={ref} className="py-16 lg:py-24 scroll-mt-20" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--ace-line)" }}>
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHead eyebrow="What we measure" title="Eight things an adventure asks of you">
          They fall into four groups. A trek can be gentle on your legs and hard on your nerves, and a single difficulty grade would hide that.
        </SectionHead>

        <div className="mt-10 grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-6 items-start">
          {/* Picker */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-3 gap-y-5">
            {GROUPS.map(g => (
              <div key={g.name} className="min-w-0">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--ace-ink)" }}>{g.name}</p>
                <p className="text-[12.5px] mb-2" style={{ color: "var(--ace-faint)" }}>{g.sub}</p>
                <div className="grid lg:grid-cols-2 gap-1.5">
                  {g.axes.map(k => {
                    const on = k === axis;
                    const KIcon = AXES[k].icon;
                    return (
                      <button key={k} type="button" onClick={() => pick(k)} aria-pressed={on}
                        className="relative overflow-hidden flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-[14px] font-semibold transition-colors"
                        style={{ color: on ? axisColor(k) : "var(--ace-ink)", background: on ? tint(axisColor(k), 12) : "var(--ace-panel-2)", border: `1px solid ${on ? tint(axisColor(k), 45) : "transparent"}` }}
                      >
                        <KIcon className="w-4 h-4 shrink-0" style={{ color: axisColor(k) }} />
                        {AXIS_NAMES[k]}
                        {on && <StepTimer show={auto} period={period} color={axisColor(k)} k={axis} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="rounded-3xl p-5 sm:p-8 min-w-0 relative overflow-hidden" style={panel}>
            <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${tint(color, 18)}, transparent 70%)`, transition: "background 500ms" }} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={axis} className="relative"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: tint(color, 14), color, border: `1px solid ${tint(color, 35)}` }}
                    initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15 }}>
                    <Icon className="w-7 h-7" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--ace-faint)" }}>{a.group}</p>
                    <h3 className="text-2xl font-bold" style={{ color: "var(--ace-ink)" }}>{AXIS_NAMES[axis]}</h3>
                    <p className="text-[15px] mt-0.5" style={{ color: "var(--ace-soft)" }}>{a.desc}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-7">
                  {[{ n: 1, t: a.low }, { n: 5, t: a.high }].map(({ n, t }) => (
                    <div key={n} className="rounded-2xl p-4" style={{ background: "var(--ace-panel-2)" }}>
                      <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `var(--lv-${n})` }}>
                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] text-white" style={{ background: `var(--lv-${n})` }}>{n}</span>
                        {n === 1 ? "Scores 1 when" : "Scores 5 when"}
                      </p>
                      <p className="text-[14px] leading-snug" style={{ color: "var(--ace-ink)" }}>{t}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* The same axis across the example adventures; bars slide between axes */}
            <p className="relative text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--ace-faint)" }}>{AXIS_NAMES[axis]} on our example adventures</p>
            <ul className="relative space-y-2.5">
              {profiles.map((p, n) => {
                const v = p.values[axis];
                return (
                  <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center gap-3">
                    <span className="text-[13.5px] font-medium truncate" style={{ color: "var(--ace-ink)" }}>{p.name}</span>
                    <span className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--ace-line)" }}>
                      <motion.span className="block h-full rounded-full" style={{ background: color, transition: "background 400ms" }}
                        initial={false} animate={{ width: `${v * 20}%` }} transition={{ type: "spring", stiffness: 110, damping: 17, delay: n * 0.05 }} />
                    </span>
                    <span className="w-16 text-right text-[13px] tabular-nums" style={{ color: v ? "var(--ace-ink)" : "var(--ace-faint)" }}>
                      <RollingNumber value={v} className="font-bold" />/5
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The 0–5 scale: a staircase ───────────────────────────────── */

function Scale({ profiles }: { profiles: Profile[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const seen = useInView(ref, { once: true, amount: 0.35 });
  const { i: level, pick, auto, period } = useCycle(6, 2400, inView);
  const heights = [8, 24, 40, 56, 72, 90];
  // A real example of each level from the adventures above
  const example = (() => {
    for (const p of profiles) {
      const k = p.values.findIndex(v => v === level);
      if (k >= 0) return { p, k };
    }
    return null;
  })();

  return (
    <section ref={ref} className="py-16 lg:py-24" style={{ borderTop: "1px solid var(--ace-line)" }}>
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-center">
        <div className="min-w-0">
          <SectionHead eyebrow="How scores work" title="Every score runs from 0 to 5">
            1 is light and 5 is extreme. A 0 means the trip doesn&apos;t ask for it at all, like water on a desert trek.
          </SectionHead>

          <div className="mt-8 rounded-2xl p-5 relative overflow-hidden" style={panel}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={level} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-white tabular-nums" style={{ background: `var(--lv-${level})` }}>{level}</span>
                  <span className="text-xl font-bold" style={{ color: "var(--ace-ink)" }}>{LEVELS[level].label}</span>
                </div>
                <p className="text-[15px]" style={{ color: "var(--ace-soft)" }}>{LEVELS[level].sub}</p>
                {example && (
                  <p className="text-[13.5px] mt-3 pt-3" style={{ color: "var(--ace-soft)", borderTop: "1px dashed var(--ace-line)" }}>
                    Example: <strong style={{ color: "var(--ace-ink)" }}>{example.p.name}</strong> scores {level} for <strong style={{ color: axisColor(example.k) }}>{AXIS_NAMES[example.k]}</strong>.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Staircase chart with a ridge line over the tops */}
        <div className="min-w-0">
          <div className="relative h-64 sm:h-72 flex items-end gap-2 sm:gap-3">
            {heights.map((h, k) => {
              const on = k === level;
              return (
                <button key={k} type="button" onClick={() => pick(k)} onMouseEnter={() => pick(k)} aria-label={`Level ${k}: ${LEVELS[k].label}`} aria-pressed={on}
                  className="relative flex-1 h-full flex flex-col justify-end items-center group"
                >
                  {on && (
                    <motion.span layoutId="ace-level-pin" className="absolute -translate-x-1/2 left-1/2 flex flex-col items-center" style={{ bottom: `calc(${h}% + 10px)` }} transition={{ type: "spring", stiffness: 300, damping: 26 }}>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap text-white" style={{ background: `var(--lv-${k})` }}>{LEVELS[k].label}</span>
                      <span className="w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid var(--lv-${k})` }} />
                    </motion.span>
                  )}
                  <motion.span
                    className="w-full rounded-t-xl flex items-start justify-center pt-2 origin-bottom"
                    style={{ height: `${h}%`, background: on ? `var(--lv-${k})` : tint(`var(--lv-${k})`, 22), border: `1px solid ${tint(`var(--lv-${k})`, 50)}`, borderBottom: "none", transition: "background 300ms" }}
                    initial={{ scaleY: 0 }} animate={{ scaleY: seen ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.1 + k * 0.08, ease: EASE }}
                  >
                    <span className="text-lg font-black tabular-nums" style={{ color: on ? "#fff" : `var(--lv-${k})` }}>{k}</span>
                  </motion.span>
                </button>
              );
            })}
          </div>
          <div className="h-px" style={{ background: "var(--ace-grid-strong)" }} />
          <div className="flex justify-between mt-2 text-[12px]" style={{ color: "var(--ace-faint)" }}>
            <span>Not needed</span><span>Extreme</span>
          </div>
          {auto && <span className="sr-only">Stepping through levels every {Math.round(period / 1000)} seconds</span>}
        </div>
      </div>
    </section>
  );
}

/* ── Rank: eight scores add up to a total ─────────────────────── */

function Rank() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const { i, pick, auto, period } = useCycle(PEOPLE.length, 3400, inView);
  const person = PEOPLE[i];
  const total = person.values.reduce((s, v) => s + v, 0);
  const label = getTierLabel(total);
  const tier = RANKS.find(r => r.label === label)!;
  const rankColor = `var(--rk-${tier.rank})`;
  // Track spans 8–40; Apex is a single point, so give it a sliver
  const spans = [8, 8, 8, 8, 1.6];
  const spanTotal = spans.reduce((s, v) => s + v, 0);
  const markerAt = (() => {
    const idx = tier.rank - 1;
    const before = spans.slice(0, idx).reduce((s, v) => s + v, 0);
    const within = idx === 4 ? 0.5 : (total - tier.minScore + 0.5) / 8;
    return ((before + within * spans[idx]) / spanTotal) * 100;
  })();

  return (
    <section ref={ref} className="py-16 lg:py-24" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--ace-line)" }}>
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-center">
        <div className="min-w-0">
          <SectionHead eyebrow="Your rank" title="Add up your eight scores to get your rank">
            Your own scores also run from 1 to 5, so your total lands between 8 and 40. Your rank is a quick read on the kind of trips you&apos;re ready for.
          </SectionHead>
          <div className="mt-7">
            <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--ace-faint)" }}>Try a sample person</p>
            <div className="flex flex-wrap gap-2">
              {PEOPLE.map((p, n) => (
                <button key={p.name} type="button" onClick={() => pick(n)} aria-pressed={n === i}
                  className="relative overflow-hidden px-3.5 py-2 rounded-full text-[13.5px] font-semibold transition-colors"
                  style={{ color: n === i ? "var(--ace-ink)" : "var(--ace-soft)", background: n === i ? "var(--ace-panel)" : "transparent", border: `1px solid ${n === i ? "var(--ace-grid-strong)" : "var(--ace-line)"}` }}
                >
                  {p.name}
                  {n === i && <StepTimer show={auto} period={period} color={rankColor} k={i} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-5 sm:p-7 min-w-0" style={panel}>
          {/* Eight bars + a rolling total */}
          <div className="flex items-end gap-4 sm:gap-6">
            <div className="flex-1 grid grid-cols-8 gap-1.5 sm:gap-2 items-end h-32">
              {person.values.map((v, k) => (
                <div key={k} className="flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
                  <RollingNumber value={v} className="text-[12px] font-bold tabular-nums" style={{ color: "var(--ace-ink)" }} />
                  <div className="w-full rounded-md overflow-hidden flex items-end" style={{ height: "70%", background: "var(--ace-line)" }}>
                    <motion.div className="w-full rounded-md" style={{ background: axisColor(k) }}
                      initial={false} animate={{ height: `${v * 20}%` }} transition={{ type: "spring", stiffness: 140, damping: 16, delay: k * 0.04 }} />
                  </div>
                  <span className="text-[10.5px] font-semibold truncate max-w-full" style={{ color: "var(--ace-faint)" }} title={AXIS_NAMES[k]}>{AXIS_NAMES[k].slice(0, 3)}</span>
                </div>
              ))}
            </div>
            <div className="text-center shrink-0 pb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--ace-faint)" }}>Total</p>
              <p className="text-5xl font-black tabular-nums leading-none" style={{ color: "var(--ace-ink)" }}><RollingNumber value={total} /></p>
              <p className="text-[12px]" style={{ color: "var(--ace-faint)" }}>of 40</p>
            </div>
          </div>

          {/* 8–40 track with a sliding marker */}
          <div className="mt-7 relative pt-7">
            <motion.div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" initial={false} animate={{ left: `${markerAt}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
              <span className="text-[11px] font-bold px-1.5 rounded text-white tabular-nums" style={{ background: rankColor, transition: "background 400ms" }}>{total}</span>
              <span className="w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${rankColor}`, transition: "border-color 400ms" }} />
            </motion.div>
            <div className="flex gap-1 h-3">
              {RANKS.map((r, n) => (
                <div key={r.label} className="h-full rounded-full" style={{ flex: spans[n], background: `var(--rk-${r.rank})`, opacity: r.rank === tier.rank ? 1 : 0.28, transition: "opacity 400ms" }} />
              ))}
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] tabular-nums" style={{ color: "var(--ace-faint)" }}><span>8</span><span>16</span><span>24</span><span>32</span><span>40</span></div>
          </div>

          {/* The rank it lands on */}
          <div className="mt-5 relative h-[84px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={tier.label} className="absolute inset-0 flex items-center gap-4 rounded-2xl px-4"
                style={{ background: tint(rankColor, 10), border: `1px solid ${tint(rankColor, 35)}` }}
                initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE }}
              >
                <motion.span className="w-12 h-12 shrink-0 [&_svg]:w-full [&_svg]:h-full" style={{ color: rankColor }}
                  initial={{ rotate: -90, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }}>
                  {RANK_ICONS[tier.label]}
                </motion.span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2">
                    <span className="text-lg font-black" style={{ color: "var(--ace-ink)" }}>{tier.label}</span>
                    <span className="text-[12px] font-bold font-mono" style={{ color: rankColor }}>{tier.label === "Apex" ? "40" : `${tier.minScore}–${tier.minScore + 7}`}</span>
                  </p>
                  <p className="text-[14px]" style={{ color: "var(--ace-soft)" }}>{RANK_COPY[tier.label]}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Matching: you against the adventure ──────────────────────── */

function Matching({ profiles }: { profiles: Profile[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [personIdx, setPersonIdx] = useState(1);
  const [touched, setTouched] = useState(false);
  const { i: advIdx, pick } = useCycle(profiles.length, 4600, inView && !touched);
  const adv = profiles[advIdx];
  const person = PEOPLE[personIdx];
  const score = computeMatchScore(toACE(person.values), toACE(adv.values));
  const bucket = bucketFor(score);
  const bucketColor = BUCKET_VAR[bucket.key];
  const gaps = adv.values
    .map((need, k) => ({ k, need, have: person.values[k] }))
    .filter(g => g.need > g.have)
    .sort((x, y) => (y.need - y.have) - (x.need - x.have));

  const steps = [
    { t: "We score the adventure", d: "Our team rates each one on all eight, using route data: altitude, terrain and trip reports." },
    { t: "You answer a few questions", d: "The quick match takes a minute, the full one about three. Your answers become your eight scores." },
    { t: "You get a verdict", d: "Every adventure is marked Ready, Stretch or Not yet, with what to work on." },
  ];

  return (
    <section id="match" ref={ref} className="py-16 lg:py-24" style={{ borderTop: "1px solid var(--ace-line)" }}>
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHead eyebrow="How matching works" title="We compare you to the adventure, one score at a time">
          Where you meet a score, you&apos;re covered. Where you fall short, the gap counts against you, and bigger gaps count for more. Try it below with a sample person.
        </SectionHead>

        {/* The three steps, in order */}
        <ol className="mt-9 grid md:grid-cols-3 gap-3 relative">
          {steps.map((s, n) => (
            <li key={s.t} className="relative rounded-2xl p-4 flex gap-3" style={{ background: "var(--ace-panel-2)" }}>
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[13px] font-black text-white" style={{ background: "var(--ace-accent)" }}>{n + 1}</span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold" style={{ color: "var(--ace-ink)" }}>{s.t}</p>
                <p className="text-[13.5px] leading-snug mt-0.5" style={{ color: "var(--ace-soft)" }}>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* The demo */}
        <div className="mt-6 rounded-3xl p-4 sm:p-7" style={panel}>
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="min-w-0">
              <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--ace-faint)" }}>You (sample)</p>
              <div className="flex flex-wrap gap-1.5">
                {PEOPLE.slice(0, 4).map((p, n) => (
                  <button key={p.name} type="button" onClick={() => { setPersonIdx(n); setTouched(true); }} aria-pressed={n === personIdx}
                    className="px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors"
                    style={{ color: n === personIdx ? "var(--ace-plate-solid)" : "var(--ace-ink)", background: n === personIdx ? "var(--ace-you)" : "var(--ace-panel-2)" }}
                  >{p.name}</button>
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--ace-faint)" }}>Adventure</p>
              <div className="grid grid-cols-4 gap-1.5">
                {profiles.map((p, n) => {
                  const on = n === advIdx;
                  return (
                    <button key={p.id} type="button" onClick={() => { pick(n); setTouched(true); }} aria-pressed={on} title={p.name}
                      className="relative h-14 rounded-xl overflow-hidden text-left transition-transform hover:-translate-y-0.5"
                      style={{ outline: on ? `2px solid ${p.color}` : "none", outlineOffset: 2 }}
                    >
                      {p.image
                        ? <Image src={p.image} alt="" fill sizes="120px" className="object-cover" />
                        : <span className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0e7490, #1d4ed8)" }}><WavesIcon className="w-6 h-6 text-white/70" /></span>}
                      <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05))" }} />
                      <span className="absolute left-1.5 right-1.5 bottom-1 text-[10.5px] font-bold leading-tight text-white line-clamp-2">{p.name.replace(/ Trek$/, "")}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 items-center">
            <div className="min-w-0">
              <AceRadar values={adv.values} you={person.values} color="var(--ace-ink)" className="w-full max-w-[400px] mx-auto"
                title={`${person.name} against ${adv.name}`} />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] mt-1" style={{ color: "var(--ace-soft)" }}>
                <span className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full" style={{ background: "var(--ace-ink)" }} />{adv.name.replace(/ Trek$/, "")}</span>
                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed" style={{ borderColor: "var(--ace-you)" }} />You</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full" style={{ background: "var(--warn)" }} />Short by 1</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full" style={{ background: "var(--bad)" }} />Short by 2+</span>
              </div>
            </div>

            <div className="min-w-0">
              {/* Verdict */}
              <div className="rounded-2xl p-5" style={{ background: tint(bucketColor, 9), border: `1px solid ${tint(bucketColor, 35)}`, transition: "background 400ms, border-color 400ms" }}>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--ace-faint)" }}>Verdict</p>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p key={bucket.key} className="text-3xl font-black" style={{ color: bucketColor }}
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
                        {bucket.label}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <p className="text-right">
                    <span className="text-3xl font-black tabular-nums" style={{ color: "var(--ace-ink)" }}><RollingNumber value={score} />%</span>
                    <span className="block text-[12px]" style={{ color: "var(--ace-faint)" }}>match</span>
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden relative" style={{ background: "var(--ace-line)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: bucketColor, transition: "background 400ms" }} initial={false} animate={{ width: `${score}%` }} transition={{ type: "spring", stiffness: 90, damping: 18 }} />
                  <span className="absolute top-0 bottom-0 w-px" style={{ left: "55%", background: "var(--ace-grid-strong)" }} />
                  <span className="absolute top-0 bottom-0 w-px" style={{ left: "80%", background: "var(--ace-grid-strong)" }} />
                </div>
                <div className="relative mt-1 h-4 text-[10.5px]" style={{ color: "var(--ace-faint)" }}>
                  <span className="absolute -translate-x-1/2" style={{ left: "55%" }}>55</span>
                  <span className="absolute -translate-x-1/2" style={{ left: "80%" }}>80</span>
                </div>
              </div>

              {/* Gaps */}
              <p className="text-[12px] font-bold uppercase tracking-wider mt-5 mb-2" style={{ color: "var(--ace-faint)" }}>Where you fall short</p>
              <div className="min-h-[96px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  {gaps.length === 0 ? (
                    <motion.p key="none" className="flex items-center gap-2 text-[14px]" style={{ color: "var(--ok)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Check className="w-4 h-4" /> Nowhere. You meet every score.
                    </motion.p>
                  ) : gaps.slice(0, 3).map(g => {
                    const short = g.need - g.have;
                    return (
                      <motion.div key={`${g.k}`} layout className="grid grid-cols-[84px_minmax(0,1fr)_auto] items-center gap-3 py-1.5 text-[14px]"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
                        <span className="font-semibold" style={{ color: axisColor(g.k) }}>{AXIS_NAMES[g.k]}</span>
                        <span style={{ color: "var(--ace-soft)" }}>you {g.have}, needs {g.need}</span>
                        <span className="text-[12px] font-bold px-2 py-0.5 rounded-md tabular-nums" style={{ color: short >= 2 ? "var(--bad)" : "var(--warn)", background: tint(short >= 2 ? "var(--bad)" : "var(--warn)", 12) }}>−{short}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              {gaps.length > 0 && (
                <p className="text-[13.5px] leading-snug mt-2 pt-3" style={{ color: "var(--ace-soft)", borderTop: "1px dashed var(--ace-line)" }}>
                  <strong style={{ color: "var(--ace-ink)" }}>Work on {AXIS_NAMES[gaps[0].k].toLowerCase()} first.</strong> {TRAINING_TIPS[AXIS_KEYS[gaps[0].k]]}
                </p>
              )}
              {adv.slug && (
                <Link href={`/experiences/${adv.slug}`} className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: "var(--ace-accent)" }}>
                  See {adv.name} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Call to action ───────────────────────────────────────────── */

function Cta() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const { i } = useCycle(PEOPLE.length - 1, 2600, inView);
  return (
    <section ref={ref} className="py-16 lg:py-20" style={{ borderTop: "1px solid var(--ace-line)", background: "var(--bg-surface)" }}>
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl grid md:grid-cols-[minmax(0,1fr)_240px] gap-6 items-center p-7 sm:p-10" style={{ background: tint("var(--ace-accent)", 8), border: `1px solid ${tint("var(--ace-accent)", 28)}` }}>
          <div className="min-w-0">
            <h2 className="text-[1.9rem] sm:text-[2.3rem] leading-tight mb-3" style={{ color: "var(--ace-ink)", textWrap: "balance" }}>Find out what you&apos;re ready for</h2>
            <p className="text-[15px] sm:text-base leading-relaxed max-w-lg mb-6" style={{ color: "var(--ace-soft)" }}>
              Answer a few questions and every adventure gets a verdict for you, along with what to work on next.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/matchmaker" className="ace-shimmer ace-pulse group relative overflow-hidden inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-[15px] text-white transition-transform hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)" }}>
                Find my matches <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-[13px]" style={{ color: "var(--ace-faint)" }}>1 to 3 minutes · results straight away</span>
            </div>
          </div>
          <div className="hidden md:block" aria-hidden>
            <AceRadar values={PEOPLE[i].values} color="var(--ace-accent)" labels={false} sweep title="" className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Styles: theme-aware colours and the CSS-only motion ──────── */

const CSS = `
.ace {
  --ace-stamina:#c2410c; --ace-power:#a16207; --ace-strength:#4d7c0f; --ace-agility:#0e7490;
  --ace-water:#1d4ed8; --ace-altitude:#6d28d9; --ace-focus:#be123c; --ace-nerve:#047857;
  --ace-accent:#d94600; --ace-ink:#1c1814; --ace-soft:#4f473f; --ace-faint:#776d62;
  --ace-line:rgba(28,24,20,0.11); --ace-grid:rgba(28,24,20,0.11); --ace-grid-strong:rgba(28,24,20,0.28);
  --ace-plate:rgba(255,255,255,0.7); --ace-plate-solid:#ffffff;
  --ace-panel:#ffffff; --ace-panel-2:#f4efe6;
  --ace-you:#2563eb; --ace-you-fill:rgba(37,99,235,0.08);
  --ok:#15803d; --warn:#d97706; --bad:#be123c;
  --lv-0:#8a8178; --lv-1:#15803d; --lv-2:#4d7c0f; --lv-3:#a16207; --lv-4:#c2410c; --lv-5:#b91c1c;
  --rk-1:#0e7490; --rk-2:#15803d; --rk-3:#b45309; --rk-4:#c2410c; --rk-5:#6d28d9;
  --ace-shadow:0 1px 2px rgba(28,22,16,0.06), 0 18px 40px -18px rgba(28,22,16,0.22);
}
.dark .ace {
  --ace-stamina:#fb923c; --ace-power:#facc15; --ace-strength:#a3e635; --ace-agility:#22d3ee;
  --ace-water:#60a5fa; --ace-altitude:#a78bfa; --ace-focus:#fb7185; --ace-nerve:#34d399;
  --ace-accent:#ff6a1f; --ace-ink:#f5efe8; --ace-soft:rgba(245,239,232,0.74); --ace-faint:rgba(245,239,232,0.52);
  --ace-line:rgba(255,255,255,0.1); --ace-grid:rgba(255,255,255,0.09); --ace-grid-strong:rgba(255,255,255,0.24);
  --ace-plate:rgba(255,255,255,0.025); --ace-plate-solid:#17120f;
  --ace-panel:rgba(255,214,170,0.045); --ace-panel-2:rgba(255,214,170,0.07);
  --ace-you:#7cb2ff; --ace-you-fill:rgba(124,178,255,0.08);
  --ok:#4ade80; --warn:#fbbf24; --bad:#fb7185;
  --lv-0:#8b8f98; --lv-1:#22c55e; --lv-2:#84cc16; --lv-3:#eab308; --lv-4:#f97316; --lv-5:#ef4444;
  --rk-1:#22d3ee; --rk-2:#4ade80; --rk-3:#f59e0b; --rk-4:#f97316; --rk-5:#a78bfa;
  --ace-shadow:0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -24px rgba(0,0,0,0.7);
}
.ace-sweep { animation: aceSpin 6s linear infinite; transform-box: view-box; }
.ace-ping { transform-box: fill-box; transform-origin: center; animation: acePing 2.8s ease-out infinite; opacity: 0; }
.ace-ping-dot { animation: acePingDot 1.8s ease-out infinite; }
.ace-timer { transform-origin: left; animation: aceTimer linear forwards; }
.ace-in { animation: aceIn 0.7s cubic-bezier(0.22,1,0.36,1) backwards; }
.ace-in-blur { animation-name: aceInBlur; }
.ace-in-scale { animation-name: aceInScale; animation-duration: 0.9s; }
.ace-shimmer::after { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background:linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%);
  background-size:250% 100%; animation:aceShimmer 3.4s ease-in-out infinite; }
.ace-pulse { animation: acePulse 2.6s ease-out infinite; }
@keyframes aceSpin { to { transform: rotate(360deg); } }
@keyframes acePing { 0% { transform: scale(1); opacity: 0.55; } 70%, 100% { transform: scale(3.2); opacity: 0; } }
@keyframes acePingDot { 0% { transform: scale(1); opacity: 0.6; } 80%, 100% { transform: scale(2.6); opacity: 0; } }
@keyframes aceTimer { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes aceIn { from { opacity: 0; transform: translateY(12px); } }
@keyframes aceInBlur { from { opacity: 0; transform: translateY(18px); filter: blur(6px); } }
@keyframes aceInScale { from { opacity: 0; transform: scale(0.96); } }
@keyframes aceShimmer { 0% { background-position: 130% 0; } 60%, 100% { background-position: -30% 0; } }
@keyframes acePulse { 0% { box-shadow: 0 0 0 0 rgba(255,81,0,0.45); } 70%, 100% { box-shadow: 0 0 0 14px rgba(255,81,0,0); } }
@media (prefers-reduced-motion: reduce) {
  .ace-sweep, .ace-ping, .ace-ping-dot, .ace-shimmer::after, .ace-pulse { animation: none; }
  .ace-sweep { display: none; }
  /* entrances still fade, they just don't move */
  .ace-in, .ace-in-blur, .ace-in-scale { animation-name: aceFade; }
  @keyframes aceFade { from { opacity: 0; } }
}
`;
