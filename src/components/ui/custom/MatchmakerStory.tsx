"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { ACE, AceAxis } from "@/lib/ace";

// The home page's Matchmaker preview, told with one radar that never cuts away:
//   1. your profile grows out of the centre,
//   2. it's laid over trek after trek — shortfalls light up as each one is rated,
//   3. friends split out of your shape for a group match, and the least-ready
//      person decides what the whole group is ready for.
// Trail orange is always the trek, tides teal is always you.

export type StorySample = { id: string; name: string; image: string; ace: ACE; score: number };
export type StoryGroup = { trek: { name: string; ace: ACE }; members: { name: string; ace: ACE; score: number }[] };

const AXES: AceAxis[] = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"];
const LABEL: Record<AceAxis, string> = {
  stamina: "Stamina", power: "Power", strength: "Strength", agility: "Agility",
  water: "Water", altitude: "Altitude", focus: "Focus", nerve: "Nerve",
};
const YOU = "#5fe0d4";
const TREK = "#ff7d47";
const SHORT = "#f43f5e";
// You, then friends
const MEMBER_COLORS = [YOU, "#60a5fa", "#c4b5fd"];

const RANKS = [
  { label: "Uncharted", min: 0 }, { label: "Pathfinder", min: 8 }, { label: "Navigator", min: 16 },
  { label: "Trailblazer", min: 24 }, { label: "Vanguard", min: 32 }, { label: "Apex", min: 40 },
];

// Same thresholds and colours as the match bar on adventure cards
function bucket(score: number) {
  if (score >= 80) return { label: "Ready", color: "#10b981" };
  if (score >= 55) return { label: "Stretch", color: "#f59e0b" };
  return { label: "Not yet", color: "#f43f5e" };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Tweens a list of numbers toward a target, so shapes morph rather than jump */
function useTween(target: number[], ms = 750) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const key = target.join(",");
  useEffect(() => {
    const from = valueRef.current;
    const to = key.split(",").map(Number);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const v = to.map((x, i) => (from[i] ?? 0) + (x - (from[i] ?? 0)) * ease(t));
      valueRef.current = v;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, ms]);
  return value;
}

// Radar geometry — a fixed viewBox, scaled by CSS. Wide enough either side for "Altitude +2".
const VW = 360, VH = 250, CX = VW / 2, CY = VH / 2, R = 80, MAX = 5;
const pt = (i: number, v: number) => {
  const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
  const r = (Math.max(0, v) / MAX) * R;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
};
const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

const BEATS = [
  { label: "Your radar", ms: 5200 },
  { label: "Every trek rated", ms: 7800 },
  { label: "Group match", ms: 7600 },
];
const CYCLE_MS = BEATS[1].ms / 3;

export default function MatchmakerStory({ you, samples, group }: { you: ACE; samples: StorySample[]; group: StoryGroup }) {
  const [beat, setBeat] = useState(0);
  const [sub, setSub] = useState(0); // which trek beat 2 is showing
  const [grown, setGrown] = useState(false);
  const [joined, setJoined] = useState(1); // how many group members have split out so far
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => { if (onScreen && !grown) { const t = setTimeout(() => setGrown(true), 150); return () => clearTimeout(t); } }, [onScreen, grown]);

  const running = onScreen && !paused;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => { setBeat((b) => (b + 1) % BEATS.length); setSub(0); }, BEATS[beat].ms);
    return () => clearTimeout(t);
  }, [beat, running]);
  useEffect(() => {
    if (!running || beat !== 1) return;
    const t = setTimeout(() => setSub((s) => Math.min(s + 1, samples.length - 1)), CYCLE_MS);
    return () => clearTimeout(t);
  }, [beat, sub, running, samples.length]);
  // Group beat: friends split out of your shape one at a time
  useEffect(() => {
    if (beat !== 2) { setJoined(1); return; }
    if (joined >= group.members.length) return;
    const t = setTimeout(() => setJoined((j) => j + 1), joined === 1 ? 700 : 650);
    return () => clearTimeout(t);
  }, [beat, joined, group.members.length]);

  const youVals = AXES.map((k) => you[k]);
  const inGroup = beat === 2;
  const trekAce = beat === 1 ? samples[sub]?.ace : inGroup ? group.trek.ace : null;
  const trekColor = beat === 1 && samples[sub] ? bucket(samples[sub].score).color : TREK;

  // Members: friends sit on top of you until they "join", then morph into their own shape
  const memberTargets = group.members.flatMap((m, i) =>
    AXES.map((k) => (!grown ? 0 : inGroup && i < joined ? m.ace[k] : you[k])));
  const shownMembers = useTween(memberTargets, 850);
  const shownYou = shownMembers.slice(0, AXES.length);
  const shownTrek = useTween(trekAce ? AXES.map((k) => trekAce[k]) : youVals, 750);

  const total = youVals.reduce((a, b) => a + b, 0);
  const rank = [...RANKS].reverse().find((r) => total >= r.min)!;
  const strengths = [...AXES].sort((a, b) => you[b] - you[a]).slice(0, 3);

  // Who gets the red shortfall marks: you on beat 2, the least-ready member on beat 3
  const lowest = group.members.reduce((lo, m, i) => (m.score < group.members[lo].score ? i : lo), 0);
  const groupReady = joined >= group.members.length;
  const markIdx = inGroup ? (groupReady ? lowest : -1) : 0;
  const markAce = markIdx >= 0 ? group.members[markIdx].ace : you;
  const gaps = trekAce && markIdx >= 0 ? AXES.filter((k) => trekAce[k] > markAce[k]) : [];
  const groupMin = group.members[lowest].score;
  const gb = bucket(groupMin);

  return (
    <div
      ref={rootRef}
      className="ms-card relative rounded-[22px] p-4 sm:p-5 min-w-0 w-full max-w-[420px] mx-auto overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "var(--text-tertiary)" }}>Sample results</p>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(95,224,212,0.1)", color: YOU }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: YOU }} />Example profile
        </span>
      </div>
      <div className="relative grid grid-cols-3 gap-1.5" role="tablist" aria-label="Sample results">
        {BEATS.map((b, i) => {
          const on = beat === i;
          return (
            <button key={b.label} type="button" role="tab" aria-selected={on} onClick={() => { setBeat(i); setSub(0); }} className="text-left min-w-0 group">
              <span className="block h-[3px] rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                <span
                  key={on ? `${beat}-${running}` : `off-${i}`}
                  className={`block h-full rounded-full ${on && running ? "ms-fill" : ""}`}
                  style={{ background: "linear-gradient(90deg,#ff5100,#ff9a5c)", width: i < beat || (on && !running) ? "100%" : on ? undefined : "0%", animationDuration: `${b.ms}ms` }}
                />
              </span>
              <span className="block mt-1.5 text-[10.5px] font-semibold truncate transition-colors group-hover:text-[var(--text-primary)]" style={{ color: on ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                <span className="tabular-nums mr-1" style={{ color: on ? "#ff5100" : undefined }}>0{i + 1}</span>{b.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* The radar */}
      <div className="relative -mx-3 mt-1">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto block" role="img" aria-label={inGroup ? `Group match for ${group.trek.name}` : trekAce ? "Example profile compared with a trek" : "Example fitness profile"}>
          <defs>
            <radialGradient id="ms-you" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={YOU} stopOpacity={trekAce ? 0.08 : 0.38} />
              <stop offset="100%" stopColor={YOU} stopOpacity={trekAce ? 0.04 : 0.12} />
            </radialGradient>
            <radialGradient id="ms-trek" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={trekColor} stopOpacity={inGroup ? 0.2 : 0.34} />
              <stop offset="100%" stopColor={trekColor} stopOpacity={inGroup ? 0.06 : 0.1} />
            </radialGradient>
            <radialGradient id="ms-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={trekAce ? trekColor : YOU} stopOpacity="0.18" />
              <stop offset="100%" stopColor={trekAce ? trekColor : YOU} stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r={R * 1.35} fill="url(#ms-glow)" />
          {[1, 2, 3, 4, 5].map((l) => (
            <polygon key={l} points={poly(AXES.map(() => l))} fill="none" stroke="var(--ms-grid)" strokeWidth={l === 5 ? 1 : 0.6} />
          ))}
          {AXES.map((k, i) => {
            const [x, y] = pt(i, MAX);
            return <line key={k} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--ms-grid)" strokeWidth={0.6} />;
          })}

          {/* Trek demands */}
          <polygon
            points={poly(shownTrek)}
            fill="url(#ms-trek)"
            stroke={trekColor}
            strokeWidth={1.8}
            strokeLinejoin="round"
            style={{ opacity: trekAce ? 1 : 0, transition: "opacity 0.5s ease, stroke 0.5s ease" }}
          />

          {/* Friends (drawn under you), then you */}
          {group.members.map((m, i) => {
            if (i === 0) return null;
            const vals = shownMembers.slice(i * AXES.length, (i + 1) * AXES.length);
            const weakest = inGroup && groupReady && i === lowest;
            return (
              <polygon
                key={m.name}
                points={poly(vals)}
                fill={MEMBER_COLORS[i]}
                fillOpacity={0.05}
                stroke={MEMBER_COLORS[i]}
                strokeWidth={weakest ? 2.2 : 1.4}
                strokeDasharray={weakest ? undefined : "4 3"}
                strokeLinejoin="round"
                style={{ opacity: inGroup && i < joined ? 1 : 0, transition: "opacity 0.4s ease, stroke-width 0.4s ease" }}
              />
            );
          })}
          <polygon
            points={poly(shownYou)}
            fill="url(#ms-you)"
            stroke={YOU}
            strokeWidth={trekAce ? (inGroup && groupReady && lowest === 0 ? 2.2 : 1.5) : 2}
            strokeDasharray={trekAce && !(inGroup && groupReady && lowest === 0) ? "4 3" : undefined}
            strokeLinejoin="round"
          />
          {!trekAce && shownYou.map((v, i) => {
            const [x, y] = pt(i, v);
            return <circle key={i} cx={x} cy={y} r={3} fill={YOU} stroke="var(--bg-surface)" strokeWidth={1.5} />;
          })}

          {/* Shortfalls: where the trek reaches past the marked person, the gap glows along the spoke */}
          {trekAce && markIdx >= 0 && AXES.map((k, i) => {
            const need = trekAce[k], have = markAce[k];
            if (need <= have) return null;
            const [x1, y1] = pt(i, have);
            const [x2, y2] = pt(i, Math.min(need, shownTrek[i]));
            return (
              <g key={`${beat}-${sub}-${markIdx}-${k}`} className="ms-gap">
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SHORT} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
                <circle cx={x2} cy={y2} r={3.2} fill={SHORT} />
              </g>
            );
          })}

          {AXES.map((k, i) => {
            const [x, y] = pt(i, MAX + 1.2);
            const short = gaps.includes(k);
            return (
              <text
                key={k}
                x={x}
                y={y}
                textAnchor={Math.abs(x - CX) < 4 ? "middle" : x > CX ? "start" : "end"}
                dominantBaseline="middle"
                className="ms-label"
                style={{ fill: short ? SHORT : "var(--text-tertiary)", fontWeight: short ? 700 : 600 }}
              >
                {LABEL[k]}
                {!trekAce && <tspan style={{ fill: YOU }} dx={4}>{you[k]}</tspan>}
                {short && <tspan dx={3}>+{trekAce![k] - markAce[k]}</tspan>}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute left-3 bottom-1 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
          {(inGroup ? group.members : group.members.slice(0, 1)).map((m, i) => (
            <span key={m.name} className="flex items-center gap-1.5 transition-opacity duration-500" style={{ opacity: !inGroup || i < joined ? 1 : 0.3 }}>
              <span className="w-3.5 h-[2px] rounded-full" style={{ background: MEMBER_COLORS[i] }} />{m.name}
            </span>
          ))}
          <span className="flex items-center gap-1.5 transition-opacity duration-500" style={{ opacity: trekAce ? 1 : 0.35 }}>
            <span className="w-3.5 h-[2px] rounded-full" style={{ background: trekColor }} />Trek
          </span>
        </div>
      </div>

      {/* Caption — one panel per beat, stacked so the card never changes height */}
      <div className="relative grid mt-3">
        <div className={`ms-pane ${beat === 0 ? "ms-on" : ""}`} aria-hidden={beat !== 0}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>Rank</p>
              <p className="text-xl font-bold tracking-tight" style={{ color: YOU }}>{rank.label}</p>
            </div>
            <p className="text-right text-[11px] leading-snug" style={{ color: "var(--text-tertiary)" }}>
              <span className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{total}</span>/40<br />across 8 capabilities
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {strengths.map((k) => (
              <span key={k} className="text-[10.5px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(95,224,212,0.1)", color: YOU }}>Strong in {LABEL[k]}</span>
            ))}
          </div>
        </div>

        <div className={`ms-pane ${beat === 1 ? "ms-on" : ""}`} aria-hidden={beat !== 1}>
          <ul className="space-y-1">
            {samples.map((s, i) => {
              const b = bucket(s.score);
              const on = beat === 1 && sub === i;
              const done = beat === 1 && i <= sub;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSub(i)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors"
                    style={{ background: on ? "var(--bg-card-hover)" : "transparent" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform" style={{ background: b.color, transform: on ? "scale(1.6)" : "none" }} />
                    <span className="flex-1 min-w-0 text-[12px] font-semibold truncate" style={{ color: on ? "var(--text-primary)" : "var(--text-secondary)" }}>{s.name}</span>
                    <span className="w-16 h-1 rounded-full overflow-hidden shrink-0" style={{ background: "var(--border-subtle)" }}>
                      <span className="block h-full rounded-full" style={{ width: done ? `${s.score}%` : "0%", background: b.color, transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)" }} />
                    </span>
                    <span className="w-14 text-right text-[10px] font-bold shrink-0" style={{ color: done ? b.color : "var(--text-tertiary)" }}>{done ? b.label : "…"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={`ms-pane ${beat === 2 ? "ms-on" : ""}`} aria-hidden={beat !== 2}>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{group.trek.name}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-opacity duration-500" style={{ background: `${gb.color}1f`, color: gb.color, opacity: groupReady ? 1 : 0 }}>
              Group: {gb.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {group.members.map((m, i) => {
              const b = bucket(m.score);
              const shown = beat === 2 && i < joined;
              const weakest = groupReady && i === lowest;
              return (
                <div key={m.name} className="rounded-lg px-2 py-1.5 transition-colors" style={{ background: weakest ? "rgba(244,63,94,0.08)" : "var(--bg-card-hover)", border: `1px solid ${weakest ? "rgba(244,63,94,0.35)" : "transparent"}` }}>
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold truncate" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: MEMBER_COLORS[i] }} />{m.name}
                  </p>
                  <span className="block mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                    <span className="block h-full rounded-full" style={{ width: shown ? `${m.score}%` : "0%", background: b.color, transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)" }} />
                  </span>
                  <p className="mt-1 text-[10px] font-bold transition-opacity duration-500" style={{ color: b.color, opacity: shown ? 1 : 0 }}>{b.label}</p>
                </div>
              );
            })}
          </div>
          <p className="flex items-center justify-between gap-2 mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <span className="truncate transition-opacity duration-500" style={{ opacity: groupReady ? 1 : 0 }}>
              The least-ready member sets the pace.
            </span>
            <Link href="/matchmaker/group" className="inline-flex items-center gap-1 font-semibold shrink-0 hover:underline" style={{ color: "#ff7d47" }}>
              Group match <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .ms-card { --ms-grid: rgba(var(--fg-rgb, 255,255,255), 0.09);
                   background: linear-gradient(160deg, var(--bg-surface) 0%, var(--bg-card) 100%);
                   border: 1px solid var(--border-subtle);
                   box-shadow: 0 24px 60px rgba(var(--shadow-color), 0.22), inset 0 1px 0 rgba(255,255,255,0.04); }
        .ms-label { font-size: 10.5px; letter-spacing: 0.02em; transition: fill 0.4s ease; }
        .ms-gap { animation: msGap 0.5s ease 0.55s both; }
        @keyframes msGap { from { opacity: 0; } to { opacity: 1; } }
        .ms-pane { grid-area: 1 / 1; min-width: 0; opacity: 0; visibility: hidden; transform: translateY(6px);
                   transition: opacity 0.4s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1), visibility 0s linear 0.4s; }
        .ms-pane.ms-on { opacity: 1; visibility: visible; transform: none; transition-delay: 0.1s, 0.1s, 0s; }
        .ms-fill { width: 0; animation: msFill linear forwards; }
        @keyframes msFill { to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) { .ms-pane { transition: none; transform: none; } .ms-gap { animation: none; } }
      `}</style>
    </div>
  );
}
