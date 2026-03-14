"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Compass, Zap } from "lucide-react";
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
        style={{
          background: "linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(124,58,237,0.05) 100%)",
          border: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        <div className="px-5 pt-5 pb-5">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Is this right for you?</p>
              <p className="text-white/35 text-xs mt-0.5">Know before you go.</p>
            </div>
          </div>
          <p className="text-white/45 text-xs leading-relaxed mb-4">
            Take the 3-minute ACE assessment and get a personalized readiness score for this adventure.
          </p>
          <Link
            href="/matchmaker"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:brightness-110 hover:-translate-y-0.5"
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
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(16,185,129,0.15)" }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-bold text-sm">Adventure Match</p>
              <p className="text-white/35 text-xs mt-0.5">Your profile covers all requirements.</p>
            </div>
          </div>
          <div
            className="flex flex-wrap items-start gap-4 pt-4 mt-1"
            style={{ borderTop: "1px solid rgba(16,185,129,0.12)" }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Your Profile</p>
              <ACEBadge ace={profile.ace} size="sm" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5">Radar</p>
              <ACERadar ace={adventureAce} userAce={profile.ace} size={90} showLabels={false} />
            </div>
          </div>
          <p className="mt-3 text-white/25 text-xs">
            <span className="text-white/40">{profile.label}</span> ·{" "}
            <Link href="/matchmaker" className="hover:text-[#ff5100] transition-colors">Retake</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(15,20,32,0.8) 60%)",
        border: "1px solid rgba(245,158,11,0.18)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(245,158,11,0.12)" }}
        >
          <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Reality Check</p>
          <p className="text-white/40 text-xs mt-0.5">
            This adventure exceeds your current capability on{" "}
            <span className="text-amber-400 font-semibold">{gaps.length} axis{gaps.length !== 1 ? "es" : ""}</span>.
          </p>
        </div>
      </div>

      {/* Radar comparison */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start gap-5 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Capability vs Required</p>
            <ACERadar ace={adventureAce} userAce={profile.ace} size={110} showLabels={false} />
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-[#ff5100] rounded-full" />
                <span className="text-[9px] text-white/30">Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)", borderTop: "1px dashed" }} />
                <span className="text-[9px] text-white/30">Your level</span>
              </div>
            </div>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5">Your tier</p>
            <p className="text-white font-bold text-sm mb-2">{profile.label}</p>
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
                style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
                    {gap.label}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {gap.userVal} → <span className="text-white/50">{gap.adventureVal}</span>
                  </span>
                </div>
                <div className="flex gap-0.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background:
                          n <= gap.adventureVal
                            ? n <= gap.userVal
                              ? color
                              : `${color}28`
                            : "rgba(255,255,255,0.06)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/35 text-[10px] leading-snug">{gap.explanation}</p>
              </div>
            );
          })}

          {/* Matching axes */}
          {(Object.keys(adventureAce) as AceAxis[])
            .filter((k) => adventureAce[k] > 0 && profile.ace[k] >= adventureAce[k])
            .map((k) => (
              <div
                key={k}
                className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-white/50 text-xs">
                  <span className="text-emerald-400 font-medium">{ACE_AXIS_LABELS[k]}</span> — you meet this requirement.
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Roadmap */}
      {roadmap.length > 0 && (
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setRoadmapOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left group"
          >
            <p className="text-white/80 font-semibold text-sm group-hover:text-white transition-colors">
              Your roadmap to {adventure.name}
            </p>
            {roadmapOpen
              ? <ChevronUp className="w-4 h-4 text-white/30" />
              : <ChevronDown className="w-4 h-4 text-white/30" />}
          </button>
          {roadmapOpen && (
            <div className="mt-4 space-y-3">
              {roadmap.map((step) => (
                <div key={step.step} className="flex gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}
                  >
                    {step.step}
                  </span>
                  <div>
                    <p className="text-white/50 text-xs leading-relaxed">{step.text}</p>
                    {step.exampleSlug && (
                      <Link
                        href={`/experiences/${step.exampleSlug}`}
                        className="inline-flex items-center gap-1 mt-1 text-[#ff5100] text-xs font-medium hover:underline"
                      >
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
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="w-3 h-3 text-[#ff5100]" />
            <p className="text-white/25 text-[10px] uppercase tracking-widest">Recommended Prep</p>
          </div>
          <div className="space-y-2.5">
            {upsells.map((u, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base shrink-0 leading-none mt-0.5">{u.icon}</span>
                <div>
                  <p className="text-white/25 text-[10px] mb-0.5">{u.trigger}</p>
                  <p className="text-white/65 text-xs font-medium">{u.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Override acknowledgement */}
      <div className="px-5 py-4">
        {!overrideAccepted ? (
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-0.5 shrink-0 accent-[#ff5100]"
              onChange={(e) => setOverrideAccepted(e.target.checked)}
            />
            <span className="text-white/30 text-xs leading-relaxed group-hover:text-white/45 transition-colors">
              I acknowledge the physical and environmental risks and will prepare appropriately before attempting this adventure.
            </span>
          </label>
        ) : (
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.2)" }}
          >
            <AlertTriangle className="w-4 h-4 text-[#ff5100] shrink-0" />
            <p className="text-[#ff5100]/80 text-xs font-medium">Risk acknowledged — prepare thoroughly before committing.</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-4">
        <Link href="/matchmaker" className="text-[10px] text-white/20 hover:text-[#ff5100] transition-colors">
          Update your profile →
        </Link>
      </div>
    </div>
  );
}
