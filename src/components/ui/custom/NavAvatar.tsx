"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AVATARS, LS_KEY } from "@/lib/avatars";
import { getTierLabel, getTier } from "@/lib/tiers";
import { loadProfile } from "@/lib/matchmaker";
import { RANK_ICONS } from "@/app/profile/AvatarPicker";

const OPERATOR_LOGO_KEY = "ttt_operator_logo";

export default function NavAvatar({ fallback, role }: { fallback: string; role?: string }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rankName, setRankName] = useState("Uncharted");
  const [rankColor, setRankColor] = useState("#6b7280");
  const [operatorLogo, setOperatorLogo] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (role === "operator") {
      // Load operator logo from cache first, then sync from server
      const cached = localStorage.getItem(OPERATOR_LOGO_KEY);
      if (cached) setOperatorLogo(cached);

      fetch("/api/operator-profile").then(r => r.ok ? r.json() : null).then(data => {
        const url = data?.logo_url ?? null;
        setOperatorLogo(url);
        if (url) localStorage.setItem(OPERATOR_LOGO_KEY, url);
        else localStorage.removeItem(OPERATOR_LOGO_KEY);
      }).catch(() => {});

      setReady(true);
      return;
    }

    const stored = localStorage.getItem(LS_KEY);
    if (stored) setSelectedId(Number(stored));

    // Bidirectional sync: server wins if it has a value; otherwise push local to server
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(data => {
      const localRaw = localStorage.getItem(LS_KEY);
      if (data?.avatar_id != null) {
        setSelectedId(data.avatar_id);
        localStorage.setItem(LS_KEY, String(data.avatar_id));
      } else if (localRaw) {
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
  }, [role]);

  // ── Operator: show company logo or building icon fallback ──────────────────
  if (role === "operator") {
    if (!ready) {
      return (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0" style={{ background: "rgba(255,81,0,0.2)", color: "#ff7d47" }}>
          {fallback}
        </div>
      );
    }
    if (operatorLogo) {
      return (
        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center" style={{ border: "1.5px solid rgba(255,255,255,0.12)" }}>
          <Image src={operatorLogo} alt="Company logo" fill sizes="28px" className="object-contain p-0.5" />
        </div>
      );
    }
    // No logo yet — show initial letter in a square (operator style)
    return (
      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0" style={{ background: "rgba(255,81,0,0.15)", border: "1.5px solid rgba(255,81,0,0.3)", color: "#ff7d47" }}>
        {fallback}
      </div>
    );
  }

  // ── Explorer ───────────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0" style={{ background: "rgba(255,81,0,0.2)", color: "#ff7d47" }}>
        {fallback}
      </div>
    );
  }

  const selected = selectedId !== null ? AVATARS.find(a => a.id === selectedId) ?? null : null;

  if (selected) {
    return (
      <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ border: "1.5px solid rgba(255,255,255,0.12)" }}>
        <Image src={selected.src} alt={selected.label} fill sizes="28px" className="object-cover" />
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
