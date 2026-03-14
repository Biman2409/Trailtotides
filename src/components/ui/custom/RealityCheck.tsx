"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Compass } from "lucide-react";
import type { Adventure } from "@/lib/data";
import { getACE, ACE_AXIS_COLORS, ACE_AXIS_LABELS, type AceAxis } from "@/lib/ace";
import {
  loadProfile,
  getAceGaps,
  getUnlockRoadmap,
  getUpsells,
  type AceGap,
  type StoredProfile,
} from "@/lib/matchmaker";
import ACEBadge from "@/components/ui/custom/ACEBadge";
import ACERadar from "@/components/ui/custom/ACERadar";
import { adventures as allAdventures } from "@/lib/data";

interface Props {
  adventure: Adventure;
}

export default function RealityCheck({ adventure }: Props) {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [overrideAccepted, setOverrideAccepted] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  if (!profile) {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1420 0%, #1a1f2e 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
              <Compass className="w-5 h-5" />
            </div>
            <p className="text-white font-semibold text-sm">Is this adventure right for you?</p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed mb-5">
            Take the 3-minute ACE assessment to find out.
          </p>
          <Link
            href="/matchmaker"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
          >
            Take Assessment
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  const adventureAce = getACE(adventure);
  const gaps = getAceGaps(profile.ace, adventureAce);
  const isMatch = gaps.length === 0;
  const roadmap = isMatch ? [] : getUnlockRoadmap(profile.ace, adventureAce, allAdventures);
  const upsells = getUpsells(profile.ace, adventureAce);

  if (isMatch) {
    return (
      <div className="rounded-2xl p-5 border" style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.2)" }}>
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-emerald-800 font-bold text-sm">Adventure Match</p>
            <p className="text-emerald-700/70 text-xs mt-0.5">Your capability profile covers all requirements.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-4 pt-3 border-t border-emerald-100">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-700/50 mb-2">Your Profile</p>
            <ACEBadge ace={profile.ace} size="sm" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-700/50 mb-1.5">Radar</p>
            <div style={{ filter: "hue-rotate(100deg) saturate(0.7) brightness(0.9)" }}>
              <ACERadar ace={adventureAce} userAce={profile.ace} size={90} showLabels={false} />
            </div>
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
          <p className="text-[#1a1f2e]/50 text-xs mt-0.5">This adventure exceeds your current capability on {gaps.length} axis{gaps.length !== 1 ? "es" : ""}.</p>
        </div>
      </div>

      {/* Radar comparison */}
      <div className="px-5 py-4 border-b border-amber-100">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-1.5">Capability vs Required</p>
            <ACERadar ace={adventureAce} userAce={profile.ace} size={110} showLabels={false} />
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#ff5100]" /><span className="text-[9px] text-[#1a1f2e]/40">Required</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 border-t border-dashed border-[#1a1f2e]/30" /><span className="text-[9px] text-[#1a1f2e]/40">Your level</span></div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-1.5">Your tier</p>
            <p className="text-[#1a1f2e] font-bold text-sm mb-2">{profile.label}</p>
            <ACEBadge ace={profile.ace} size="sm" />
          </div>
        </div>

        {/* Gap breakdown */}
        <div className="space-y-2">
          {gaps.map((gap) => {
            const color = ACE_AXIS_COLORS[gap.axis];
            return (
              <div
                key={gap.axis}
                className="rounded-xl p-3"
                style={{ background: `${color}0a`, border: `1px solid ${color}22` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
                    {gap.label} Gap
                  </span>
                  <span className="text-[10px] text-[#1a1f2e]/40">
                    You: {gap.userVal} → Required: {gap.adventureVal}
                  </span>
                </div>
                <div className="flex gap-0.5 mb-1.5">
                  {[1,2,3,4,5].map((n) => (
                    <div
                      key={n}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        background: n <= gap.adventureVal
                          ? (n <= gap.userVal ? color : `${color}30`)
                          : "rgba(26,31,46,0.07)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-[#1a1f2e]/55 text-[10px] leading-snug">{gap.explanation}</p>
              </div>
            );
          })}

          {/* Matching axes */}
          {(Object.keys(adventureAce) as AceAxis[])
            .filter((k) => adventureAce[k] > 0 && profile.ace[k] >= adventureAce[k])
            .map((k) => (
              <div key={k} className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <p className="text-emerald-800 text-xs font-medium">{ACE_AXIS_LABELS[k]} — you meet this requirement.</p>
              </div>
            ))}
        </div>
      </div>

      {/* Roadmap */}
      {roadmap.length > 0 && (
        <div className="px-5 py-4 border-b border-amber-100">
          <button onClick={() => setRoadmapOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
            <p className="text-[#1a1f2e] font-semibold text-sm">Your roadmap to {adventure.name}</p>
            {roadmapOpen ? <ChevronUp className="w-4 h-4 text-[#1a1f2e]/40" /> : <ChevronDown className="w-4 h-4 text-[#1a1f2e]/40" />}
          </button>
          {roadmapOpen && (
            <div className="mt-4 space-y-3">
              {roadmap.map((step) => (
                <div key={step.step} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: "rgba(255,81,0,0.12)", color: "#ff5100" }}>
                    {step.step}
                  </span>
                  <div>
                    <p className="text-[#1a1f2e] text-xs leading-relaxed">{step.text}</p>
                    {step.exampleSlug && (
                      <Link href={`/experiences/${step.exampleSlug}`} className="inline-flex items-center gap-1 mt-1 text-[#ff5100] text-xs font-medium hover:underline">
                        {step.exampleName} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upsells */}
      {upsells.length > 0 && (
        <div className="px-5 py-4 border-b border-amber-100">
          <p className="text-[#1a1f2e]/40 text-[10px] uppercase tracking-widest mb-3">Recommended Prep</p>
          <div className="space-y-2">
            {upsells.map((u, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base shrink-0">{u.icon}</span>
                <div>
                  <p className="text-[#1a1f2e]/45 text-[10px]">{u.trigger}</p>
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
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 shrink-0 accent-[#ff5100]" onChange={(e) => setOverrideAccepted(e.target.checked)} />
            <span className="text-[#1a1f2e]/55 text-xs leading-relaxed">
              I acknowledge the physical and environmental risks and will prepare appropriately before attempting this adventure.
            </span>
          </label>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.15)" }}>
            <AlertTriangle className="w-4 h-4 text-[#ff5100] shrink-0" />
            <p className="text-[#ff5100] text-xs font-medium">Risk acknowledged — proceed with caution and proper preparation.</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-4">
        <Link href="/matchmaker" className="text-[10px] text-[#1a1f2e]/30 hover:text-[#ff5100] transition-colors">Update your profile →</Link>
      </div>
    </div>
  );
}
