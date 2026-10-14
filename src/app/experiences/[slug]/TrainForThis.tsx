"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell } from "lucide-react";
import { adventures } from "@/lib/data";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { AXIS_LABEL, TRAINING_TIPS, bucketFor, gapsFor, matchScore, weeksToReady } from "@/lib/fitness";

/**
 * "Get ready for this" — for visitors with a Matchmaker profile, shows exactly which
 * capabilities fall short of this adventure, by how much, and how to close the gap.
 */
export default function TrainForThis({ slug }: { slug: string }) {
  const { ace } = useFitnessProfile();
  const adventure = adventures.find((a) => a.slug === slug);
  if (!ace || !adventure) return null;

  const score = matchScore(ace, adventure);
  const bucket = bucketFor(score);
  const gaps = gapsFor(ace, adventure);

  if (bucket.key === "ready" || gaps.length === 0) {
    return (
      <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2.5" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)" }}>
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold text-emerald-400">You&apos;re ready for this ({score}% match).</span> Your fitness profile meets what {adventure.name} asks for.
        </p>
      </div>
    );
  }

  const weeks = weeksToReady(gaps);
  const altitudeGap = gaps.find((g) => g.axis === "altitude");

  return (
    <div className="mt-4 rounded-2xl p-4 sm:p-5" style={{ background: "var(--bg-card)", border: `1px solid ${bucket.color}40` }}>
      <div className="flex items-start gap-3 mb-4">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bucket.bg, color: bucket.color }}>
          <Dumbbell className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Get ready for {adventure.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            <span className="font-semibold" style={{ color: bucket.color }}>{score}% match today</span>
            {weeks > 0 && <> · roughly {weeks} weeks of steady training</>}
            {altitudeGap && <> {weeks > 0 ? "plus" : "·"} an acclimatisation trip</>}
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {gaps.map((g) => (
          <li key={g.axis}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{AXIS_LABEL[g.axis]}</span>
              <span style={{ color: "var(--text-tertiary)" }}>You {g.have}/5 · needs {g.need}/5</span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(g.need / 5) * 100}%`, background: `${bucket.color}40` }} />
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(g.have / 5) * 100}%`, background: bucket.color }} />
            </div>
            <p className="text-xs leading-relaxed mt-1.5" style={{ color: "var(--text-secondary)" }}>{TRAINING_TIPS[g.axis]}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <Link href={`/matchmaker?retake=1&from=${adventure.slug}`} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100] hover:text-[#ff7d47]">
          Trained up? Update your profile
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link href="/explore?ace=ready" className="text-sm font-medium hover:text-[var(--text-primary)]" style={{ color: "var(--text-secondary)" }}>
          See what you&apos;re ready for now
        </Link>
      </div>
    </div>
  );
}
