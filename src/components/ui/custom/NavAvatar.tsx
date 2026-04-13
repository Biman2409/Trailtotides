"use client";

import { useState, useEffect } from "react";
import { AVATARS, LS_KEY } from "@/lib/avatars";
import { getTierLabel, getTier } from "@/lib/tiers";
import { loadProfile } from "@/lib/matchmaker";
import { RANK_ICONS } from "@/app/profile/AvatarPicker";

export default function NavAvatar({ fallback }: { fallback: string }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rankName, setRankName] = useState("Uncharted");
  const [rankColor, setRankColor] = useState("#6b7280");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setSelectedId(Number(stored));

    // Bidirectional sync: server wins if it has a value; otherwise push local to server
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(data => {
      const localRaw = localStorage.getItem(LS_KEY);
      if (data?.avatar_id != null) {
        setSelectedId(data.avatar_id);
        localStorage.setItem(LS_KEY, String(data.avatar_id));
      } else if (localRaw) {
        // Push local selection to server (selected before login or server lost it)
        fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar_id: Number(localRaw) }),
        }).catch(() => {});
      }
    }).catch(() => {});

    const apply = (p: ReturnType<typeof loadProfile>) => {
      if (!p?.ace) return;
      const total = Object.values(p.ace).reduce((s: number, v) => s + (v as number), 0);
      const label = getTierLabel(total);
      setRankName(label);
      setRankColor(getTier(label).color);
    };
    apply(loadProfile());
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then(apply);
    });
    setReady(true);
  }, []);

  const selected = selectedId !== null ? AVATARS.find(a => a.id === selectedId) ?? null : null;

  if (!ready) {
    // SSR / first paint: show initial letter
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0" style={{ background: "rgba(255,81,0,0.2)", color: "#ff7d47" }}>
        {fallback}
      </div>
    );
  }

  if (selected) {
    return (
      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ border: "1.5px solid rgba(255,255,255,0.12)" }}>
        <img src={selected.src} alt={selected.label} className="w-full h-full object-cover" />
      </div>
    );
  }

  // ACE rank badge
  const icon = RANK_ICONS[rankName] ?? RANK_ICONS["Uncharted"];
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
      style={{ background: `${rankColor}18`, border: `1.5px solid ${rankColor}40`, color: rankColor }}
    >
      <span style={{ width: 14, height: 14, display: "block" }}>{icon}</span>
    </div>
  );
}
