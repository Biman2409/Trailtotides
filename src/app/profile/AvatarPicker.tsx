"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { AVATARS, LS_KEY } from "@/lib/avatars";
import { getTierLabel, getTier } from "@/lib/tiers";
import { loadProfile } from "@/lib/matchmaker";

// ─── Avatar display — used on profile hero ────────────────────────────────────
export default function AvatarPicker() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [rankName, setRankName] = useState("Uncharted");
  const [rankColor, setRankColor] = useState("#6b7280");

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setSelectedId(Number(stored));

    const p = loadProfile();
    if (p?.ace) {
      const total = Object.values(p.ace).reduce((s: number, v) => s + (v as number), 0);
      const label = getTierLabel(total);
      setRankName(label);
      setRankColor(getTier(label).color);
    }
  }, []);

  const selected = selectedId !== null ? AVATARS.find(a => a.id === selectedId) ?? null : null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-24 h-24 rounded-3xl relative overflow-hidden focus:outline-none"
        style={{
          border: `1.5px solid ${selected ? "rgba(255,255,255,0.1)" : rankColor + "35"}`,
          boxShadow: selected ? "none" : `0 0 40px ${rankColor}18`,
          background: selected ? "transparent" : `linear-gradient(135deg,${rankColor}28 0%,${rankColor}0c 100%)`,
        }}
        aria-label="Change profile avatar"
      >
        {selected ? (
          <span className="block w-full h-full rounded-[22px] overflow-hidden">{selected.svg}</span>
        ) : (
          <AceRankDisplay rankName={rankName} rankColor={rankColor} />
        )}
        <span className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl gap-1 pointer-events-none">
          <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Change</span>
        </span>
      </button>

      {open && (
        <AvatarPickerModal
          selectedId={selectedId}
          rankName={rankName}
          rankColor={rankColor}
          onSelect={(id) => { setSelectedId(id); if (id !== null) localStorage.setItem(LS_KEY, String(id)); else localStorage.removeItem(LS_KEY); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── ACE rank default display ─────────────────────────────────────────────────
function AceRankDisplay({ rankName, rankColor }: { rankName: string; rankColor: string }) {
  const RANK_PIPS: Record<string, number> = {
    Uncharted: 1, Pathfinder: 1, Navigator: 2, Trailblazer: 3, Vanguard: 4, Apex: 5,
  };
  const pips = RANK_PIPS[rankName] ?? 1;
  return (
    <span className="flex flex-col items-center justify-center w-full h-full gap-1.5">
      <span className="text-[11px] font-black uppercase tracking-widest leading-none" style={{ color: rankColor }}>
        {rankName}
      </span>
      <span className="flex gap-0.5">
        {Array.from({ length: pips }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: rankColor, opacity: 0.85 }} />
        ))}
      </span>
    </span>
  );
}

// ─── Picker modal — shared between profile and settings ───────────────────────
export function AvatarPickerModal({
  selectedId,
  rankName,
  rankColor,
  onSelect,
  onClose,
}: {
  selectedId: number | null;
  rankName: string;
  rankColor: string;
  onSelect: (id: number | null) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onMouse); document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const choose = (id: number | null) => { onSelect(id); onClose(); };

  const males   = AVATARS.filter(a => a.gender === "m");
  const females = AVATARS.filter(a => a.gender === "f");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div
        ref={dialogRef}
        className="rounded-2xl overflow-hidden w-full max-w-sm"
        style={{ background: "#111014", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 100px rgba(0,0,0,0.7)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <p className="font-bold text-white text-sm">Profile picture</p>
            <p className="text-white/35 text-xs mt-0.5">Choose a character or keep your ACE rank</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* ACE rank default */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold mb-2">Default</p>
            <button type="button" onClick={() => choose(null)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:brightness-110"
              style={{
                background: selectedId === null ? `${rankColor}14` : "rgba(255,255,255,0.04)",
                border: `1px solid ${selectedId === null ? rankColor + "35" : "rgba(255,255,255,0.07)"}`,
              }}>
              <span className="w-10 h-10 rounded-xl shrink-0 flex flex-col items-center justify-center gap-0.5"
                style={{ background: `linear-gradient(135deg,${rankColor}28,${rankColor}0c)`, border: `1.5px solid ${rankColor}35` }}>
                <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{rankName}</span>
              </span>
              <span className="flex-1 text-left">
                <span className="block text-xs font-semibold text-white/80">ACE Rank</span>
                <span className="block text-[10px] text-white/30 mt-0.5">Displays your adventure rank badge</span>
              </span>
              {selectedId === null && <Check className="w-4 h-4 shrink-0" style={{ color: rankColor }} />}
            </button>
          </div>

          {/* Male characters */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold mb-2.5">Characters</p>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {males.map(av => <AvatarCell key={av.id} av={av} active={selectedId === av.id} onPick={() => choose(av.id)} />)}
            </div>
            {/* Female characters */}
            <div className="grid grid-cols-5 gap-2">
              {females.map(av => <AvatarCell key={av.id} av={av} active={selectedId === av.id} onPick={() => choose(av.id)} />)}
              {/* Spacer cells for alignment */}
              {Array.from({ length: 5 - females.length }).map((_, i) => <span key={`sp${i}`} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarCell({ av, active, onPick }: { av: (typeof AVATARS)[0]; active: boolean; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="flex flex-col items-center gap-1 group/av focus:outline-none">
      <span className="w-full aspect-square rounded-xl overflow-hidden block"
        style={{
          border: `1.5px solid ${active ? "#ff5100" : "rgba(255,255,255,0.08)"}`,
          boxShadow: active ? "0 0 14px rgba(255,81,0,0.4)" : "none",
          transform: active ? "scale(1.08)" : "scale(1)",
          transition: "all 0.14s",
        }}>
        {av.svg}
      </span>
      <span className="text-[8px] text-white/28 group-hover/av:text-white/60 transition-colors font-medium leading-none">{av.label}</span>
    </button>
  );
}
