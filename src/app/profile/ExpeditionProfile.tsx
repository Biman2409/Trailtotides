"use client";

import { useEffect, useState } from "react";
import { ChevronDown, CheckCircle2, Star, Camera, Heart } from "lucide-react";
import { getTier, getNextTier, getProgressPct, XP_TIERS, MAX_XP } from "@/lib/xp";
import type { EngagementStats } from "@/lib/achievements";

// Level and XP on /profile, plus the counts behind them. Same calm style as the
// Passport and Trophy Cabinet: one orange accent, small-caps labels, no glow.

const ORANGE = "#ff5100";

function Label({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{children}</p>
      {right}
    </div>
  );
}

export default function ExpeditionProfile() {
  const [xp, setXp]         = useState<number>(0);
  const [engagement, setEngagement] = useState<EngagementStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLadder, setShowLadder] = useState(false);

  const fetchXP = () => {
    setError(false);
    fetch("/api/xp")
      .then(r => { if (!r.ok) throw new Error("not ok"); return r.json(); })
      .then(d => { setXp(d.xp ?? 0); setEngagement(d.engagement ?? {}); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchXP();
    window.addEventListener("xp:updated", fetchXP);
    return () => window.removeEventListener("xp:updated", fetchXP);
  }, []);

  const tier     = getTier(xp);
  const next     = getNextTier(xp);
  const pct      = getProgressPct(xp);
  const xpToNext = next ? next.minXP - xp : 0;
  const maxed    = xp >= MAX_XP;

  const card = "rounded-2xl p-4 sm:p-5";
  const cardStyle = { background: "var(--bg-card)", border: "1px solid var(--border-subtle)" };

  if (loading) return <div className={`${card} h-40 animate-pulse`} style={cardStyle} />;

  if (error) {
    return (
      <div className={`${card} flex flex-col items-center gap-3 text-center`} style={cardStyle}>
        <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>Couldn&apos;t load your level.</p>
        <button onClick={fetchXP} className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ color: "var(--accent-ink)", border: `1px solid ${ORANGE}` }}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={card} style={cardStyle}>
      {/* Level and XP */}
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-[18px] font-semibold tabular-nums"
          style={{ border: `1.5px solid ${ORANGE}`, color: "var(--accent-ink)" }}>
          {tier.level}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>level</p>
          <p className="text-[18px] leading-tight font-semibold" style={{ color: "var(--text-primary)" }}>{tier.name}</p>
          <p className="text-[13px] leading-snug" style={{ color: "var(--text-tertiary)" }}>{tier.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[22px] leading-none font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{xp.toLocaleString("en-IN")}</p>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>XP</p>
        </div>
      </div>

      {/* Progress to the next level */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <span className="text-[13px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
            {next
              ? <>{xpToNext.toLocaleString("en-IN")} XP to <span style={{ color: "var(--text-primary)" }}>{next.name}</span></>
              : maxed ? <>Maxed out · every XP source done</> : <>{(MAX_XP - xp).toLocaleString("en-IN")} XP to the {MAX_XP.toLocaleString("en-IN")} max</>}
          </span>
          <button
            type="button"
            onClick={() => setShowLadder(v => !v)}
            aria-expanded={showLadder}
            aria-controls="level-ladder"
            className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold"
            style={{ color: "var(--accent-ink)" }}
          >
            All levels
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: showLadder ? "rotate(180deg)" : "none" }} />
          </button>
        </div>
        <span className="block h-[3px] rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
          <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: ORANGE }} />
        </span>
      </div>

      {/* Every level — a plain list reads better than nine squeezed nodes on a phone */}
      {showLadder && (
        <ol id="level-ladder" className="mt-4">
          {XP_TIERS.map(t => {
            const reached = xp >= t.minXP;
            const current = t.level === tier.level;
            return (
              <li key={t.level} className="flex items-center gap-3 py-1.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <span className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[12px] tabular-nums"
                  style={current
                    ? { background: ORANGE, color: "#fff" }
                    : reached ? { border: `1px solid ${ORANGE}`, color: "var(--accent-ink)" } : { border: "1px dashed var(--border-default)", color: "var(--text-muted)" }}>
                  {t.level}
                </span>
                <span className="flex-1 min-w-0 text-[14px]" style={{ color: reached ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                  {t.name}
                  <span className="hidden sm:inline text-[13px]" style={{ color: "var(--text-tertiary)" }}> · {t.description}</span>
                </span>
                <span className="text-[12px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{t.minXP.toLocaleString("en-IN")} XP</span>
              </li>
            );
          })}
        </ol>
      )}

      {/* The counts behind it — the same ones the badges use */}
      <div className="mt-5">
        <Label>activity</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
          {[
            { value: engagement.completed  ?? 0, label: "completed",  icon: CheckCircle2 },
            { value: engagement.reviews    ?? 0, label: "reviews",    icon: Star         },
            { value: engagement.photos     ?? 0, label: "photos",     icon: Camera       },
            { value: engagement.wishlisted ?? 0, label: "wishlisted", icon: Heart        },
          ].map(({ value, label, icon: Icon }, i) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 px-3 py-3 min-w-0 ${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0 sm:border-l" : ""}`}
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color: value > 0 ? ORANGE : "var(--text-muted)" }} />
              <span className="min-w-0">
                <span className="block text-[18px] leading-none font-semibold tabular-nums" style={{ color: value > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>{value}</span>
                <span className="block text-[12px] mt-1 tracking-[0.06em] lowercase truncate" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>{label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
