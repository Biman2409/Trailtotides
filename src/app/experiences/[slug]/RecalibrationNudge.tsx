"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, X } from "lucide-react";
import { loadProfileFromServer, isProfileStale } from "@/lib/matchmaker";

function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

interface Props {
  /** computeDifficulty()'s return type is a plain string, not the Difficulty union — matches that here. */
  difficulty: string;
  thresholdDays?: number;
}

/**
 * Non-blocking nudge — never gates booking (there's no real checkout to
 * gate), just surfaces that a capability profile may be out of date before
 * the user books a trip against it.
 */
export default function RecalibrationNudge({ difficulty, thresholdDays = 90 }: Props) {
  const [stale, setStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    loadProfileFromServer().then((profile) => {
      setChecked(true);
      if (!profile) return; // no profile at all — the "Take Assessment" CTA elsewhere already covers this case
      const at = (profile as { updatedAt?: string }).updatedAt ?? null;
      setUpdatedAt(at);
      setStale(isProfileStale(at, thresholdDays));
    });
  }, [thresholdDays]);

  if (!checked || !stale || dismissed) return null;

  const isExtreme = difficulty === "Extreme";
  const accent = isExtreme ? "#ef4444" : "#f59e0b";

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-4"
      style={{
        background: isExtreme ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.06)",
        border: `1px solid ${isExtreme ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.2)"}`,
      }}
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Your capability profile is from {updatedAt ? `${relativeTime(updatedAt)} ago` : "a while back"} — refresh it before booking?
        </p>
        {isExtreme && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            This is an Extreme-rated adventure — fitness and altitude tolerance can change a lot in that time.
          </p>
        )}
        <Link href="/matchmaker?retake=1" className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2 transition-colors hover:brightness-110" style={{ color: accent }}>
          <RotateCcw className="w-3 h-3" /> Retake Assessment
        </Link>
      </div>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="shrink-0 transition-colors" style={{ color: "var(--text-muted)" }}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
