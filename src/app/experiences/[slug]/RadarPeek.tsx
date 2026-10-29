"use client";

import { useEffect, useState } from "react";
import AceRadar, { AXIS_KEYS } from "@/app/ace/AceRadar";
import { ACE_THEME_CSS } from "@/app/ace/aceTheme";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE } from "@/lib/ace";

/** The trek's capability radar on its own, shown while "Is this for you?" is collapsed */
export default function RadarPeek({ ace, name }: { ace: ACE; name: string }) {
  const [you, setYou] = useState<number[] | null>(null);
  useEffect(() => {
    const p = loadProfile();
    if (p) setYou(AXIS_KEYS.map((k) => p.ace[k] ?? 0));
  }, []);

  return (
    <div className="ace pt-1">
      <style>{ACE_THEME_CSS}</style>
      {/* Names only: at this size the scores would be too small to read, and the open section lists them */}
      <AceRadar values={AXIS_KEYS.map((k) => ace[k] ?? 0)} you={you} color="var(--ace-ink)" scores={false}
        className="w-full max-w-[320px] mx-auto block" title={you ? `You against ${name}` : `${name}: capability scores`} />
      <p className="text-center text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
        {you ? "You (dashed) against this trek." : "What this trek asks of you."} Tap to see who it suits.
      </p>
    </div>
  );
}
