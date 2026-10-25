"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy, Crown, Globe, Brain,
  Footprints, Waves, ScanEye,
  Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, Wand,
  CheckCircle2, Star, Heart, Map, Compass, TrendingUp, Award, Camera, GitCompare,
} from "@/lib/localIcons";
import { ALL_BADGES, badgeProgress, nextBadges, lockedSkillBadgeCount, type Achievement, type EngagementStats } from "@/lib/achievements";
import type { ACE } from "@/lib/ace";

// Badges on /profile: the few closest to unlocking (with how to get them), then the
// ones already earned; the full set of 24 folds away behind a button. Same calm style
// as the adventure page — one orange accent, small-caps labels, no glow.

const ORANGE = "#ff5100";

const ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  Crown, Trophy, Globe, Brain, Footprints, Waves, ScanEye, Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, Wand, CheckCircle2, Star, Heart, Map, Compass, TrendingUp, Award, Camera, GitCompare,
  Flame9000: Zap,
};

function BadgeIcon({ badge, earned, size = 40 }: { badge: Achievement; earned: boolean; size?: number }) {
  const Icon = ICONS[badge.icon] ?? Trophy;
  const apex = badge.tier === "tier1";
  const icon = Math.round(size * 0.46);
  return (
    <span
      className="relative shrink-0 flex items-center justify-center rounded-xl"
      style={{
        width: size, height: size,
        background: earned && apex ? ORANGE : "transparent",
        border: earned ? `1.5px solid ${ORANGE}` : "1px dashed var(--border-default)",
        color: earned ? (apex ? "#fff" : ORANGE) : "var(--text-muted)",
      }}
    >
      <Icon style={{ width: icon, height: icon }} />
      {badge.icon === "Flame9000" && (
        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none">9K</span>
      )}
    </span>
  );
}

function Label({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{children}</p>
      {right && <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{right}</span>}
    </div>
  );
}

function ProgressBar({ have, need }: { have: number; need: number }) {
  return (
    <span className="block h-[3px] w-16 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
      <span className="block h-full rounded-full" style={{ width: `${Math.round((have / need) * 100)}%`, background: ORANGE }} />
    </span>
  );
}

interface CabinetData { ace: ACE | null; totalXP: number; engagement: EngagementStats; earnedIds: string[] }

const TIER_GROUPS: { tier: Achievement["tier"]; label: string }[] = [
  { tier: "tier1", label: "the pinnacle" },
  { tier: "tier2", label: "domain masters" },
  { tier: "tier3", label: "expedition badges" },
];

export default function TrophyCabinet() {
  const [data, setData] = useState<CabinetData | null>(null);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    setError(false);
    fetch("/api/achievements")
      .then((r) => { if (!r.ok) throw new Error("not ok"); return r.json(); })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    fetchAll();
    window.addEventListener("xp:updated", fetchAll);
    return () => window.removeEventListener("xp:updated", fetchAll);
  }, [fetchAll]);

  const card = "rounded-2xl p-4 sm:p-5";
  const cardStyle = { background: "var(--bg-card)", border: "1px solid var(--border-subtle)" };

  if (error) {
    return (
      <div className={`${card} flex flex-col items-center gap-3 text-center`} style={cardStyle}>
        <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>Couldn&apos;t load your badges.</p>
        <button onClick={fetchAll} className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ color: ORANGE, border: `1px solid ${ORANGE}` }}>
          Try again
        </button>
      </div>
    );
  }
  if (!data) return <div className={`${card} h-40 animate-pulse`} style={cardStyle} />;

  const earned = new Set(data.earnedIds);
  const progress = (b: Achievement) => badgeProgress(b.id, data.ace, data.totalXP, data.engagement);
  const earnedBadges = ALL_BADGES.filter((b) => earned.has(b.id));

  const nextUp = nextBadges(earned, data.ace, data.totalXP, data.engagement).map(({ badge, progress: p }) => ({ badge, p }));
  const skillBadgesLocked = lockedSkillBadgeCount(earned);

  const selectedBadge = ALL_BADGES.find((b) => b.id === selected) ?? null;
  const toggleSelect = (id: string) => setSelected((cur) => (cur === id ? null : id));

  const detail = selectedBadge && (() => {
    const p = progress(selectedBadge);
    const has = earned.has(selectedBadge.id);
    return (
      <div className="mt-3 rounded-xl p-3 flex gap-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <BadgeIcon badge={selectedBadge} earned={has} size={36} />
        <div className="min-w-0 text-[13px] leading-snug">
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedBadge.name}</p>
          <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>{selectedBadge.description}</p>
          {!has && p && (
            <p className="mt-1.5" style={{ color: "var(--text-tertiary)" }}>
              {p.hint}{p.need > 1 && ` · ${p.have.toLocaleString("en-IN")} / ${p.need.toLocaleString("en-IN")}`}
            </p>
          )}
        </div>
      </div>
    );
  })();

  const cell = (b: Achievement) => {
    const has = earned.has(b.id);
    const p = has ? null : progress(b);
    return (
      <button
        key={b.id}
        type="button"
        onClick={() => toggleSelect(b.id)}
        aria-pressed={selected === b.id}
        className="flex flex-col items-center gap-1.5 text-center rounded-xl py-1.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
        style={selected === b.id ? { background: "var(--bg-surface)" } : undefined}
      >
        <BadgeIcon badge={b} earned={has} />
        <span className="text-[12px] leading-tight px-0.5" style={{ color: has ? "var(--text-primary)" : "var(--text-tertiary)" }}>{b.name}</span>
        {p && p.need > 1 && p.have > 0 && <ProgressBar have={p.have} need={p.need} />}
      </button>
    );
  };
  const grid = "grid gap-x-2 gap-y-3 grid-cols-[repeat(auto-fill,minmax(76px,1fr))]";

  return (
    <div className={card} style={cardStyle}>
      {/* Next up */}
      {nextUp.length > 0 && (
        <div className="mb-5">
          <Label>next up</Label>
          <ul>
            {nextUp.map(({ badge, p }) => (
              <li key={badge.id}>
                <div
                  title={badge.description}
                  className="flex items-center gap-3 py-2"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <BadgeIcon badge={badge} earned={false} size={36} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] truncate" style={{ color: "var(--text-primary)" }}>{badge.name}</span>
                    <span className="block text-[12px] leading-snug" style={{ color: "var(--text-tertiary)" }}>{p.hint}</span>
                  </span>
                  {p.need > 1 && (
                    <span className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[12px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {p.have.toLocaleString("en-IN")} / {p.need.toLocaleString("en-IN")}
                      </span>
                      <ProgressBar have={p.have} need={p.need} />
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {!data.ace && skillBadgesLocked > 0 && (
            <p className="text-[13px] pt-2" style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" }}>
              {skillBadgesLocked} skill badges open up after the{" "}
              <Link href="/ace" className="underline underline-offset-2" style={{ color: ORANGE }}>ACE™ assessment</Link>.
            </p>
          )}
        </div>
      )}

      {/* Earned, or every badge */}
      {showAll ? (
        TIER_GROUPS.map(({ tier, label }) => {
          const group = ALL_BADGES.filter((b) => b.tier === tier);
          return (
            <div key={tier} className="mb-4">
              <Label right={`${group.filter((b) => earned.has(b.id)).length} of ${group.length}`}>{label}</Label>
              <div className={grid}>{group.map(cell)}</div>
            </div>
          );
        })
      ) : (
        <>
          <Label right={`${earnedBadges.length} of ${ALL_BADGES.length}`}>earned</Label>
          {earnedBadges.length > 0 ? (
            <div className={grid}>{earnedBadges.map(cell)}</div>
          ) : (
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              None yet. Log an adventure you&apos;ve done, save one to your wishlist or write a review to earn your first.
            </p>
          )}
        </>
      )}

      {detail}

      <button
        type="button"
        onClick={() => { setShowAll((v) => !v); setSelected(null); }}
        className="mt-4 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors hover:bg-[#ff5100]/[0.06]"
        style={{ color: ORANGE, border: `1px solid ${ORANGE}` }}
      >
        {showAll ? "Show less" : `See all ${ALL_BADGES.length} badges`}
      </button>
    </div>
  );
}
