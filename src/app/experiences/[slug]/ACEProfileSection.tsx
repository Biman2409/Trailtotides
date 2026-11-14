"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw, Check } from "lucide-react";
import AceRadar, { AXIS_KEYS, AXIS_NAMES, axisColor } from "@/app/ace/AceRadar";
import { ACE_THEME_CSS, BUCKET_VAR, tint } from "@/app/ace/aceTheme";
import { bucketFor, TRAINING_TIPS, weeksToReady } from "@/lib/fitness";
import { computeMatchScore } from "@/lib/ace";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import type { ACE } from "@/lib/ace";

/**
 * "How do you measure up?" — the ACE™ check, given the spotlight of the "Is this for you?"
 * section. Without a profile: what this adventure asks for, on the radar, and the 2-minute check.
 * With one: you drawn over it, the verdict, and each gap once, with how to close it.
 */
export default function ACEProfileSection({ ace, slug, name }: { ace: ACE; slug: string; name: string }) {
  const { ace: userAce } = useFitnessProfile();

  const trekValues = AXIS_KEYS.map((k) => ace[k] ?? 0);
  const shortName = name.replace(/ Trek$/, "");
  // What the adventure asks most of: its two highest scores
  const asks = AXIS_KEYS.map((k, i) => ({ i, v: ace[k] ?? 0 })).filter((a) => a.v > 0).sort((a, b) => b.v - a.v).slice(0, 2);

  const match = userAce ? (() => {
    const score = computeMatchScore(userAce, ace);
    const bucket = bucketFor(score);
    const gaps = AXIS_KEYS
      .map((k, i) => ({ k, i, need: ace[k] ?? 0, have: userAce[k] ?? 0 }))
      .filter((g) => g.need > g.have)
      .sort((x, y) => (y.need - y.have) - (x.need - x.have));
    const weeks = weeksToReady(gaps.map((g) => ({ axis: g.k, have: g.have, need: g.need })));
    return { score, bucket, color: BUCKET_VAR[bucket.key], gaps, weeks, altitude: gaps.some((g) => g.k === "altitude") };
  })() : null;

  return (
    <div className="ace rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,81,0,0.35)", background: "linear-gradient(160deg, rgba(255,81,0,0.07), var(--bg-surface) 55%)" }}>
      <style>{ACE_THEME_CSS}</style>
      <div className="px-4 sm:px-5 pt-4">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--accent-ink)" }}>ACE<sup className="tm">™</sup> capability check</p>
        <h3 className="text-[20px] sm:text-[22px] leading-tight mt-1" style={{ color: "var(--text-primary)" }}>How do you measure up?</h3>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] gap-4 sm:gap-6 items-center p-4 sm:p-5 pt-2 sm:pt-3">
        {/* The radar: this adventure, and you over it when there's a profile */}
        <div className="min-w-0">
          <AceRadar
            values={trekValues}
            you={match ? AXIS_KEYS.map((k) => userAce![k] ?? 0) : null}
            color="var(--ace-ink)"
            className="w-full max-w-[260px] mx-auto block"
            title={match ? `You against ${name}` : `${name}: capability scores`}
          />
          {match && (
            <div className="flex justify-center gap-4 text-[12px] mt-1" style={{ color: "var(--ace-soft)" }}>
              <span className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full" style={{ background: "var(--ace-ink)" }} />{shortName}</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed" style={{ borderColor: "var(--ace-you)" }} />You</span>
            </div>
          )}
        </div>

        {!match ? (
          /* No profile: what it asks, and the check */
          <div className="min-w-0 space-y-3">
            {asks.length > 0 && (
              <p className="text-[14px] leading-[1.55]" style={{ color: "var(--text-secondary)" }}>
                {shortName} asks most of your{" "}
                {asks.map((a, j) => (
                  <span key={a.i}>
                    {j > 0 && " and "}
                    <strong style={{ color: axisColor(a.i) }}>{AXIS_NAMES[a.i].toLowerCase()}</strong> ({a.v}/5)
                  </span>
                ))}.
              </p>
            )}
            <p className="text-[14px] leading-[1.55]" style={{ color: "var(--text-secondary)" }}>
              Answer a few questions and see your match, where you fall short, and how long to train.
            </p>
            <Link
              href={`/matchmaker?from=${slug}`}
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14.5px] font-semibold text-white transition-transform hover:-translate-y-px"
              style={{ background: "#ff5100", boxShadow: "0 8px 20px -10px rgba(255,81,0,0.8)" }}
            >
              Check my match <span className="font-normal opacity-85">· 2 min</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* With a profile: the verdict, then each gap once with how to close it */
          <div className="min-w-0">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--ace-faint)" }}>Your match</p>
                <p className="text-2xl font-black leading-tight" style={{ color: match.color }}>{match.bucket.label}</p>
              </div>
              <p className="text-2xl font-black tabular-nums" style={{ color: "var(--ace-ink)" }}>{match.score}%</p>
            </div>
            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: "var(--ace-line)" }}>
              <div className="h-full rounded-full" style={{ width: `${match.score}%`, background: match.color }} />
            </div>
            {(match.weeks > 0 || match.altitude) && (
              <p className="text-[13px] mt-2" style={{ color: "var(--text-secondary)" }}>
                Ready in {match.weeks > 0 ? <>about <strong style={{ color: "var(--text-primary)" }}>{match.weeks} weeks</strong> of steady training</> : null}
                {match.altitude && <>{match.weeks > 0 ? " plus" : ""} an acclimatisation trip</>}.
              </p>
            )}

            {match.gaps.length === 0 ? (
              <p className="flex items-center gap-2 text-[14px] mt-3" style={{ color: "var(--ok)" }}>
                <Check className="w-4 h-4" /> You meet every score {shortName} asks for.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {match.gaps.map((g, idx) => {
                  const short = g.need - g.have;
                  return (
                    <li key={g.k}>
                      <div className="flex items-center gap-2 text-[13.5px]">
                        <span className="font-semibold" style={{ color: axisColor(g.i) }}>{AXIS_NAMES[g.i]}</span>
                        <span style={{ color: "var(--ace-soft)" }}>you {g.have}, needs {g.need}</span>
                        <span className="ml-auto text-[12px] font-bold px-2 py-0.5 rounded-md tabular-nums"
                          style={{ color: short >= 2 ? "var(--bad)" : "var(--warn)", background: tint(short >= 2 ? "var(--bad)" : "var(--warn)", 12) }}>−{short}</span>
                      </div>
                      {/* How to close it, for the three biggest gaps */}
                      {idx < 3 && <p className="text-[12.5px] leading-snug mt-0.5" style={{ color: "var(--text-tertiary)" }}>{TRAINING_TIPS[g.k]}</p>}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[13px]">
              <Link href={`/matchmaker?retake=1&from=${slug}`} className="inline-flex items-center gap-1.5 font-semibold hover:text-[#ff5100]" style={{ color: "var(--accent-ink)" }}>
                <RotateCcw className="w-3.5 h-3.5" /> Trained up? Retake the check
              </Link>
              <Link href="/explore?ace=ready" className="hover:text-[#ff5100]" style={{ color: "var(--text-secondary)" }}>
                What you&apos;re ready for now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
