"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind, ChevronUp, Layers, Columns2, Check } from "lucide-react";
import AceRadar, { AXIS_KEYS, AXIS_NAMES, axisColor } from "@/app/ace/AceRadar";
import { ACE_THEME_CSS, BUCKET_VAR, tint } from "@/app/ace/aceTheme";
import { bucketFor } from "@/lib/fitness";
import GradingPill from "@/components/ui/custom/GradingPill";
import { ACE_AXIS_COLORS, ACE_AXIS_LABELS, computeMatchScore } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE, AceAxis } from "@/lib/ace";

interface Props {
  ace: ACE;
  slug: string;
  /** The adventure's name, for the chart legend */
  name: string;
  showAltitudeWarning: boolean;
  showFatalFallWarning: boolean;
  showExtremeIsolationWarning: boolean;
  showTechnicalWarning: boolean;
  showPhysicalExhaustionWarning: boolean;
  showWaterWarning: boolean;
  /** Skip the section's own eyebrow/title/grading-pill header — use when an outer wrapper (e.g. a paired AccordionSection card) already provides it. */
  bare?: boolean;
}

const AXIS_ICONS: Record<string, React.ReactNode> = {
  stamina:  <Flame    className="w-3 h-3" />,
  power:    <Zap      className="w-3 h-3" />,
  strength: <Dumbbell className="w-3 h-3" />,
  agility:  <Compass  className="w-3 h-3" />,
  water:    <Waves    className="w-3 h-3" />,
  altitude: <Mountain className="w-3 h-3" />,
  focus:    <Shield   className="w-3 h-3" />,
  nerve:    <Wind     className="w-3 h-3" />,
};

const TRAINING_TIPS: Record<string, string> = {
  stamina:  "Build aerobic base with 3–4 weekly runs or hikes. Progress to back-to-back long days.",
  power:    "Add interval training and steep hill repeats to develop explosive leg power.",
  strength: "Weighted step-ups, squats and loaded carries will develop the strength needed.",
  agility:  "Practice trail running on technical terrain; add balance and proprioception drills.",
  water:    "Swim 2–3 times a week. Progress from pool to open water, then moving water.",
  altitude: "Spend nights above 3,000m before attempting higher objectives. Acclimatise gradually.",
  focus:    "Exposure therapy on smaller heights — via ferrata and scrambling routes build tolerance.",
  nerve:    "Build comfort in remote settings — overnight solo trips and wilderness navigation without phone support.",
};

export default function ACEProfileSection({ ace, slug, name, bare }: Props) {
  const [userAce, setUserAce] = useState<ACE | null>(null);
  // Overlap is the default — more compact than side-by-side (especially
  // when an adventure's requirements are low/near-zero, which leaves the
  // split view's "Trek Requirements" radar nearly empty) and it surfaces
  // more information (per-axis ✓/gap badges) in less space.
  const [overlapped, setOverlapped] = useState(true);

  useEffect(() => {
    const p = loadProfile();
    if (p) setUserAce(p.ace);
  }, []);

  // The ACE page's chart and gap list, in its axis order
  const trekValues = AXIS_KEYS.map(k => ace[k] ?? 0);
  const userValues = userAce ? AXIS_KEYS.map(k => userAce[k] ?? 0) : null;
  const shortName = name.replace(/ Trek$/, "");
  const match = userAce && userValues ? (() => {
    const score = computeMatchScore(userAce, ace);
    const bucket = bucketFor(score);
    const gaps = trekValues
      .map((need, k) => ({ k, need, have: userValues[k] }))
      .filter(g => g.need > g.have)
      .sort((x, y) => (y.need - y.have) - (x.need - x.have));
    return { score, bucket, color: BUCKET_VAR[bucket.key], gaps };
  })() : null;

  const axes = Object.keys(ace) as AceAxis[];
  const gaps = userAce
    ? axes
        .map(ax => ({ ax, gap: ace[ax] - ((userAce as unknown as Record<string, number>)[ax] ?? 0) }))
        .filter(({ gap }) => gap > 0)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3)
    : [];
  const readyCount = userAce
    ? axes.filter(ax => (userAce as unknown as Record<string, number>)[ax] >= ace[ax]).length
    : 0;
  const totalAxes = axes.length;

  return (
    <section>
      {/* Header */}
      {!bare && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-0.5">Capability Profile</p>
            <h2 className="text-black dark:text-white font-semibold text-base leading-snug tracking-tight">How do you measure up?</h2>
          </div>
          <GradingPill />
        </div>
      )}

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden mb-3"
        style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}
      >
        {/* Score pill — only when user has profile */}
        {userAce && (
          <div
            className="mx-4 mt-4 px-3 py-2 rounded-xl flex items-center gap-2.5"
            style={{
              background: readyCount === totalAxes
                ? "rgba(34,197,94,0.07)"
                : "rgba(255,81,0,0.07)",
              border: readyCount === totalAxes ? "1px solid rgba(34,197,94,0.18)" : "1px solid rgba(255,81,0,0.15)",
            }}
          >
            <p className="text-xl font-black leading-none tabular-nums" style={{ color: readyCount === totalAxes ? "#4ade80" : "var(--accent-ink)" }}>
              {readyCount}/{totalAxes}
            </p>
            <div style={{ width: 1, height: 20, background: "rgba(var(--fg-rgb),0.07)" }} />
            <p className="text-[11px] text-black/40 dark:text-white/35 leading-snug flex-1">
              {readyCount === totalAxes ? "You meet all requirements" : `${totalAxes - readyCount} ${totalAxes - readyCount === 1 ? "score needs" : "scores need"} work`}
            </p>
            <button
              onClick={() => setOverlapped(o => !o)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0"
              style={{
                background: overlapped ? "rgba(255,81,0,0.15)" : "rgba(var(--fg-rgb),0.05)",
                border: overlapped ? "1px solid rgba(255,81,0,0.3)" : "1px solid rgba(var(--fg-rgb),0.09)",
                color: overlapped ? "var(--accent-ink-soft)" : "rgba(var(--fg-rgb),0.4)",
              }}
            >
              {overlapped ? <Columns2 className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
              {overlapped ? "Side by side" : "Overlap"}
            </button>
          </div>
        )}

        {/* Radar views — the same chart as the ACE page */}
        <div className="ace p-4">
          <style>{ACE_THEME_CSS}</style>
          {overlapped && userAce && userValues && match ? (
            /* ── Overlap view (default): you drawn over the adventure, gaps marked ── */
            <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-5 items-center">
              <div className="min-w-0">
                <AceRadar values={trekValues} you={userValues} color="var(--ace-ink)" className="w-full max-w-[380px] mx-auto block"
                  title={`You against ${name}`} />
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] mt-1" style={{ color: "var(--ace-soft)" }}>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full" style={{ background: "var(--ace-ink)" }} />{shortName}</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed" style={{ borderColor: "var(--ace-you)" }} />You</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full" style={{ background: "var(--warn)" }} />Short by 1</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full" style={{ background: "var(--bad)" }} />Short by 2+</span>
                </div>
              </div>

              <div className="min-w-0">
                {/* Verdict */}
                <div className="rounded-2xl p-4" style={{ background: tint(match.color, 9), border: `1px solid ${tint(match.color, 35)}` }}>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--ace-faint)" }}>Verdict</p>
                      <p className="text-2xl font-black" style={{ color: match.color }}>{match.bucket.label}</p>
                    </div>
                    <p className="text-right">
                      <span className="text-2xl font-black tabular-nums" style={{ color: "var(--ace-ink)" }}>{match.score}%</span>
                      <span className="block text-[11px]" style={{ color: "var(--ace-faint)" }}>match</span>
                    </p>
                  </div>
                  <div className="mt-2.5 h-2 rounded-full overflow-hidden relative" style={{ background: "var(--ace-line)" }}>
                    <div className="h-full rounded-full" style={{ width: `${match.score}%`, background: match.color }} />
                    <span className="absolute top-0 bottom-0 w-px" style={{ left: "55%", background: "var(--ace-grid-strong)" }} />
                    <span className="absolute top-0 bottom-0 w-px" style={{ left: "80%", background: "var(--ace-grid-strong)" }} />
                  </div>
                </div>

                {/* Where you fall short */}
                <p className="text-[11px] font-bold uppercase tracking-wider mt-4 mb-1.5" style={{ color: "var(--ace-faint)" }}>Where you fall short</p>
                {match.gaps.length === 0 ? (
                  <p className="flex items-center gap-2 text-[14px]" style={{ color: "var(--ok)" }}>
                    <Check className="w-4 h-4" /> Nowhere. You meet every score.
                  </p>
                ) : match.gaps.map(g => {
                  const short = g.need - g.have;
                  return (
                    <div key={g.k} className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 py-1 text-[13.5px]">
                      <span className="font-semibold" style={{ color: axisColor(g.k) }}>{AXIS_NAMES[g.k]}</span>
                      <span style={{ color: "var(--ace-soft)" }}>you {g.have}, needs {g.need}</span>
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-md tabular-nums" style={{ color: short >= 2 ? "var(--bad)" : "var(--warn)", background: tint(short >= 2 ? "var(--bad)" : "var(--warn)", 12) }}>−{short}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : userAce && userValues ? (
            /* ── Side by side ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: shortName, values: trekValues, color: "var(--ace-ink)" },
                { label: "You", values: userValues, color: "var(--ace-you)" },
              ].map(r => (
                <div key={r.label} className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2" style={{ background: "var(--ace-panel-2)" }}>
                  <span className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{r.label}</span>
                  <AceRadar values={r.values} color={r.color} className="w-full max-w-[300px] block" title={`${r.label}: capability scores`} />
                </div>
              ))}
            </div>
          ) : (
            /* ── No profile ── */
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center sm:items-stretch">
              {/* Trek radar — larger, dominant */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 sm:pr-4 w-full sm:w-auto">
                <span className="text-[12px] tracking-[0.1em] text-center" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{name} requirements</span>
                <AceRadar values={trekValues} color="var(--ace-ink)" className="w-full max-w-[300px] block" title={`${name}: capability scores`} />
              </div>

              {/* Divider — vertical on desktop, horizontal on mobile */}
              <div className="w-full h-px sm:w-px sm:h-auto sm:self-stretch" style={{ background: "rgba(var(--fg-rgb),0.05)" }} />

              {/* CTA sub-section */}
              <div className="flex flex-col justify-center w-full sm:pl-4 flex-1 min-w-0">
                <div className="p-1 flex flex-col gap-3">
                  <div>
                    <p className="font-medium text-[15px] leading-snug mb-1" style={{ color: "var(--text-primary)" }}>See how you measure up</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      A 2-minute check against this trek.
                    </p>
                  </div>
                  <Link
                    href={`/matchmaker?from=${slug}`}
                    className="self-start inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-[14px] font-medium text-[#ff5100] transition-colors hover:bg-[rgba(255,81,0,0.06)]"
                    style={{ border: "1px solid rgba(255,81,0,0.55)" }}
                  >
                    Take the assessment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar — only the retake link, for people with a profile */}
        {userAce && (
        <div
          className="px-4 py-2.5 flex items-center justify-end gap-3"
          style={{ borderTop: "1px solid rgba(var(--fg-rgb),0.04)", background: "rgba(0,0,0,0.12)" }}
        >
            <Link
              href={`/matchmaker?retake=1&from=${slug}`}
              className="inline-flex items-center gap-1.5 shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:brightness-110 whitespace-nowrap"
              style={{ background: "rgba(var(--fg-rgb),0.04)", border: "1px solid rgba(var(--fg-rgb),0.08)", color: "rgba(var(--fg-rgb),0.35)" }}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Retake Assessment
            </Link>
        </div>
        )}
      </div>

      {/* Training priorities */}
      {gaps.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden mb-3"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
            <div className="w-1 h-3.5 rounded-full bg-red-500" />
            <div>
              <p className="text-red-400 text-[10px] font-bold tracking-[0.22em] uppercase">Training Priority</p>
              <p className="text-black/40 dark:text-white/35 text-[10px] mt-0.5">Top {gaps.length} axes to build before this trek</p>
            </div>
          </div>
          <div className="p-3.5 space-y-2">
            {gaps.map(({ ax, gap }, idx) => {
              const color = ACE_AXIS_COLORS[ax];
              const icon = AXIS_ICONS[ax];
              const userVal = userAce ? (userAce as unknown as Record<string, number>)[ax] ?? 0 : 0;
              const trekVal = ace[ax];
              return (
                <div
                  key={ax}
                  className="flex items-start gap-2.5 rounded-xl p-3"
                  style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-black/40 dark:text-white/35"
                      style={{ background: "rgba(var(--fg-rgb),0.06)" }}
                    >
                      {idx + 1}
                    </span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, color }}>
                      {icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-black dark:text-white font-bold text-xs capitalize">{ACE_AXIS_LABELS[ax]}</span>
                      <span
                        className="text-[8px] px-1.5 py-px rounded-full font-bold inline-flex items-center gap-0.5"
                        style={{ background: `${color}20`, color }}
                      >
                        <ChevronUp className="w-2 h-2" />+{gap}
                      </span>
                      <span className="text-black/35 dark:text-white/30 text-[9px] ml-auto font-mono">Lv {userVal} → {trekVal}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(var(--fg-rgb),0.06)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(userVal / trekVal) * 100}%`, background: `linear-gradient(to right, ${color}99, ${color})` }}
                      />
                    </div>
                    <p className="text-black/40 dark:text-white/35 text-[10px] leading-snug">{TRAINING_TIPS[ax]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
