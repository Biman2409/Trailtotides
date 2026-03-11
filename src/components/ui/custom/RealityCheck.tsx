"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowRight, MapPin } from "lucide-react";
import type { Adventure, ERT } from "@/lib/data";
import { getERT } from "@/lib/ert";
import {
  loadProfile,
  getErtGaps,
  getUnlockRoadmap,
  getUpsells,
  type ErtGap,
  type RoadmapStep,
  type Upsell,
} from "@/lib/matchmaker";
import ERTBadge from "@/components/ui/custom/ERTBadge";
import { adventures as allAdventures } from "@/lib/data";

const DIM_COLOR: Record<ErtGap["dimension"], string> = {
  e: "#ff5100",
  r: "#f59e0b",
  t: "#8b5cf6",
};

const DIM_BG: Record<ErtGap["dimension"], string> = {
  e: "rgba(255,81,0,0.08)",
  r: "rgba(245,158,11,0.08)",
  t: "rgba(139,92,246,0.08)",
};

interface Props {
  adventure: Adventure;
}

export default function RealityCheck({ adventure }: Props) {
  const [profile, setProfile] = useState<{ ert: ERT; label: string } | null>(null);
  const [overrideAccepted, setOverrideAccepted] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p) setProfile({ ert: p.ert, label: p.label });
  }, []);

  if (!profile) {
    // No profile yet — show a soft CTA to take the matchmaker
    return (
      <div className="rounded-2xl border border-dashed border-[#1a1f2e]/15 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#ff5100]/10 flex items-center justify-center shrink-0">
          <span className="text-[#ff5100] text-lg font-bold">?</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#1a1f2e] font-semibold text-sm">Is this adventure right for you?</p>
          <p className="text-[#1a1f2e]/50 text-xs mt-0.5">Take the 2-minute matchmaker to find out.</p>
        </div>
        <Link
          href="/matchmaker"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff5100] text-white text-xs font-semibold"
        >
          Match me
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  const adventureErt = getERT(adventure);
  const gaps = getErtGaps(profile.ert, adventureErt);
  const isMatch = gaps.length === 0;
  const roadmap = isMatch ? [] : getUnlockRoadmap(profile.ert, adventureErt, allAdventures);
  const upsells = getUpsells(
    loadProfile()?.answers ?? { cardio: "B", load: "B", altitude: "A", terrain: "A", age: 30, weight: 70, height: 170 },
    adventureErt
  );

  if (isMatch) {
    return (
      <div
        className="rounded-2xl p-5 border"
        style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.2)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-emerald-800 font-bold text-sm">Adventure Match</p>
            <p className="text-emerald-700/70 text-xs mt-0.5">This adventure falls within your ERT comfort range.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-emerald-100">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-700/50 mb-1.5">Your Limit</p>
            <ERTBadge ert={profile.ert} size="sm" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-700/50 mb-1.5">This Adventure</p>
            <ERTBadge ert={adventureErt} size="sm" />
          </div>
        </div>
        <p className="mt-3 text-emerald-700/60 text-xs">
          Profile: <span className="font-medium text-emerald-700">{profile.label}</span> ·{" "}
          <Link href="/matchmaker" className="hover:underline">Retake assessment</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 overflow-hidden" style={{ background: "#fffdf9" }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-3 border-b border-amber-100">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[#1a1f2e] font-bold text-sm">Reality Check</p>
          <p className="text-[#1a1f2e]/50 text-xs mt-0.5">This adventure exceeds your current ERT comfort range.</p>
        </div>
      </div>

      {/* ERT comparison */}
      <div className="px-5 py-4 border-b border-amber-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-2">Your Comfort Limit</p>
            <ERTBadge ert={profile.ert} size="sm" />
            <p className="text-[#1a1f2e]/50 text-xs mt-1.5">{profile.label}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-2">This Adventure Requires</p>
            <ERTBadge ert={adventureErt} size="sm" />
            <p className="text-[#1a1f2e]/50 text-xs mt-1.5">{adventure.name}</p>
          </div>
        </div>

        {/* Gap breakdown */}
        <div className="space-y-3">
          {gaps.map(gap => (
            <div
              key={gap.dimension}
              className="rounded-xl p-4"
              style={{ background: DIM_BG[gap.dimension], border: `1px solid ${DIM_COLOR[gap.dimension]}22` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: DIM_COLOR[gap.dimension] }}>
                  {gap.label} Gap
                </span>
                <span className="text-[10px] text-[#1a1f2e]/40">
                  You: {gap.label[0]}{gap.userVal} → Required: {gap.label[0]}{gap.adventureVal}
                </span>
              </div>
              {/* Pip bars */}
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(n => (
                  <div
                    key={n}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      background: n <= gap.adventureVal
                        ? (n <= gap.userVal ? DIM_COLOR[gap.dimension] : `${DIM_COLOR[gap.dimension]}33`)
                        : "rgba(26,31,46,0.08)",
                    }}
                  />
                ))}
              </div>
              <p className="text-[#1a1f2e]/60 text-xs leading-relaxed">{gap.explanation}</p>
            </div>
          ))}

          {/* Dimensions with no gap — show as good news */}
          {(["e","r","t"] as const).filter(d => adventureErt[d] <= profile.ert[d]).map(d => {
            const label = d === "e" ? "Exertion" : d === "r" ? "Risk" : "Technicality";
            return (
              <div key={d} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-emerald-800 text-xs font-medium">{label} match — you meet this requirement.</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roadmap */}
      {roadmap.length > 0 && (
        <div className="px-5 py-4 border-b border-amber-100">
          <button
            onClick={() => setRoadmapOpen(v => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <p className="text-[#1a1f2e] font-semibold text-sm">Your Roadmap to {adventure.name}</p>
            {roadmapOpen ? <ChevronUp className="w-4 h-4 text-[#1a1f2e]/40" /> : <ChevronDown className="w-4 h-4 text-[#1a1f2e]/40" />}
          </button>
          {roadmapOpen && (
            <div className="mt-4 space-y-3">
              {roadmap.map(step => (
                <div key={step.step} className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ background: "rgba(255,81,0,0.12)", color: "#ff5100" }}
                  >
                    {step.step}
                  </span>
                  <div>
                    <p className="text-[#1a1f2e] text-xs leading-relaxed">{step.text}</p>
                    {step.exampleSlug && (
                      <Link
                        href={`/experiences/${step.exampleSlug}`}
                        className="inline-flex items-center gap-1 mt-1.5 text-[#ff5100] text-xs font-medium hover:underline"
                      >
                        <MapPin className="w-3 h-3" />
                        {step.exampleName}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Smart upsells */}
      {upsells.length > 0 && (
        <div className="px-5 py-4 border-b border-amber-100">
          <p className="text-[#1a1f2e]/40 text-[10px] uppercase tracking-widest mb-3">Recommended Add-ons</p>
          <div className="space-y-2">
            {upsells.map((u, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base shrink-0 mt-0.5">{u.icon}</span>
                <div>
                  <p className="text-[#1a1f2e]/50 text-[10px]">{u.trigger}</p>
                  <p className="text-[#1a1f2e] text-xs font-medium">{u.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Override */}
      <div className="px-5 py-4">
        {!overrideAccepted ? (
          <div>
            <p className="text-[#1a1f2e]/60 text-xs mb-3">Still want to attempt this adventure?</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 shrink-0 accent-[#ff5100]"
                onChange={e => setOverrideAccepted(e.target.checked)}
              />
              <span className="text-[#1a1f2e]/60 text-xs leading-relaxed">
                I acknowledge the physical and environmental risks and will train and prepare appropriately before attempting this adventure.
              </span>
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.15)" }}>
            <AlertTriangle className="w-4 h-4 text-[#ff5100] shrink-0" />
            <p className="text-[#ff5100] text-xs font-medium">Risk acknowledged — proceed with caution and proper preparation.</p>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="px-5 pb-4">
        <Link href="/matchmaker" className="text-[10px] text-[#1a1f2e]/30 hover:text-[#ff5100] transition-colors">
          Update your profile →
        </Link>
      </div>
    </div>
  );
}
