"use client";

import { useState, useEffect, useCallback } from "react";
import BadgeIcon from "@/components/ui/custom/BadgeIcon";
import { ALL_BADGES, badgeProgress, nextBadges, badgeFace, type Achievement, type EngagementStats } from "@/lib/achievements";
import { useBadgeRarity } from "@/lib/useBadgeRarity";

// Badges on /profile: the few closest to unlocking (with how to get them), then the
// ones already earned; the full set folds away behind a button. Same calm style
// as the adventure page — one orange accent, small-caps labels, no glow.

const ORANGE = "#ff5100";

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

interface CabinetData { totalXP: number; engagement: EngagementStats; earnedIds: string[] }

const TIER_GROUPS: { tier: Achievement["tier"] | "secret"; label: string }[] = [
  { tier: "tier1", label: "the pinnacle" },
  { tier: "tier2", label: "domain masters" },
  { tier: "tier3", label: "expedition badges" },
  { tier: "secret", label: "secret badges" },
];

export default function TrophyCabinet() {
  const [data, setData] = useState<CabinetData | null>(null);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [openNext, setOpenNext] = useState<string | null>(null);
  const rarityOf = useBadgeRarity();

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
        <button onClick={fetchAll} className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ color: "var(--accent-ink)", border: `1px solid ${ORANGE}` }}>
          Try again
        </button>
      </div>
    );
  }
  if (!data) return <div className={`${card} h-40 animate-pulse`} style={cardStyle} />;

  const earned = new Set(data.earnedIds);
  const progress = (b: Achievement) => badgeProgress(b.id, data.totalXP, data.engagement);
  const earnedBadges = ALL_BADGES.filter((b) => earned.has(b.id));

  const nextUp = nextBadges(earned, data.totalXP, data.engagement).map(({ badge, progress: p }) => ({ badge, p }));

  const selectedBadge = ALL_BADGES.find((b) => b.id === selected) ?? null;
  const toggleSelect = (id: string) => setSelected((cur) => (cur === id ? null : id));

  // The selected badge's details open right under the list it was tapped in, not at the bottom
  const detailIn = (list: Achievement[]) => {
    if (!selectedBadge || !list.some((b) => b.id === selectedBadge.id)) return null;
    const has = earned.has(selectedBadge.id);
    const face = badgeFace(selectedBadge, has);
    const p = has || selectedBadge.secret ? null : progress(selectedBadge);
    const rare = rarityOf(selectedBadge.id);
    return (
      <div className="mt-3 rounded-xl p-3 flex gap-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <BadgeIcon badge={face} earned={has} size={36} />
        <div className="min-w-0 text-[13px] leading-snug">
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{face.name}</p>
          <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>{face.description}</p>
          {p && (
            <p className="mt-1.5" style={{ color: "var(--text-tertiary)" }}>
              {p.hint}{p.need > 1 && ` · ${p.have.toLocaleString("en-IN")} / ${p.need.toLocaleString("en-IN")}`}
            </p>
          )}
          {rare && <p className="mt-1.5" style={{ color: "var(--accent-ink)" }}>{rare}</p>}
        </div>
      </div>
    );
  };

  const cell = (b: Achievement) => {
    const has = earned.has(b.id);
    const face = badgeFace(b, has);
    const p = has || b.secret ? null : progress(b);
    return (
      <button
        key={b.id}
        type="button"
        onClick={() => toggleSelect(b.id)}
        aria-pressed={selected === b.id}
        className="flex flex-col items-center gap-1.5 text-center rounded-xl py-1.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
        style={selected === b.id ? { background: "var(--bg-surface)" } : undefined}
      >
        <BadgeIcon badge={face} earned={has} size={b.tier === "tier1" ? 52 : 40} />
        <span className={`text-[12px] leading-tight px-0.5 ${b.tier === "tier1" && has ? "font-semibold" : ""}`} style={{ color: has ? "var(--text-primary)" : "var(--text-tertiary)" }}>{face.name}</span>
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
              <li key={badge.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <button
                  type="button"
                  onClick={() => setOpenNext((cur) => (cur === badge.id ? null : badge.id))}
                  aria-expanded={openNext === badge.id}
                  className="w-full flex items-center gap-3 py-2 text-left rounded-lg transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
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
                </button>
                {openNext === badge.id && (
                  <p className="pb-2 pl-12 text-[13px] leading-snug" style={{ color: "var(--text-secondary)" }}>{badge.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Earned, or every badge */}
      {showAll ? (
        TIER_GROUPS.map(({ tier, label }) => {
          const group = ALL_BADGES.filter((b) => (tier === "secret" ? b.secret : b.tier === tier && !b.secret));
          return (
            <div key={tier} className="mb-4">
              <Label right={`${group.filter((b) => earned.has(b.id)).length} of ${group.length}`}>{label}</Label>
              <div className={grid}>{group.map(cell)}</div>
              {detailIn(group)}
            </div>
          );
        })
      ) : (
        <>
          <Label right={`${earnedBadges.length} of ${ALL_BADGES.length}`}>earned</Label>
          {earnedBadges.length > 0 ? (
            <>
              <div className={grid}>{earnedBadges.map(cell)}</div>
              {detailIn(earnedBadges)}
            </>
          ) : (
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              None yet. Log an adventure you&apos;ve done, save one to your wishlist or write a review to earn your first.
            </p>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => { setShowAll((v) => !v); setSelected(null); }}
        className="mt-4 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors hover:bg-[#ff5100]/[0.06]"
        style={{ color: "var(--accent-ink)", border: `1px solid ${ORANGE}` }}
      >
        {showAll ? "Show less" : `See all ${ALL_BADGES.length} badges`}
      </button>
    </div>
  );
}
