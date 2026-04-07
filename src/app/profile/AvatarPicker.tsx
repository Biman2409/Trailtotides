"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { AVATARS, LS_KEY } from "@/lib/avatars";
import { getTierLabel, getTier } from "@/lib/tiers";
import { loadProfile } from "@/lib/matchmaker";

// ─── ACE rank icons (mirrors ACEProfileSection RANKS) ────────────────────────
export const RANK_ICONS: Record<string, React.ReactNode> = {
  Uncharted: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/>
      <path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="1.2" fill="currentColor"/>
    </svg>
  ),
  Pathfinder: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/>
      <path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Navigator: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/>
    </svg>
  ),
  Trailblazer: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
      <path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Vanguard: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
      <path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  ),
  Apex: (
    <svg viewBox="0 0 24 24" fill="none">
      <polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/>
      <polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/>
    </svg>
  ),
};

// ─── Hook — shared state loader ───────────────────────────────────────────────
function useAvatarState() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rankName, setRankName] = useState("Uncharted");
  const [rankColor, setRankColor] = useState("#6b7280");

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setSelectedId(Number(stored));
    // Try localStorage first for instant render, then sync from server
    const applyProfile = (p: ReturnType<typeof loadProfile>) => {
      if (!p?.ace) return;
      const total = Object.values(p.ace).reduce((s: number, v) => s + (v as number), 0);
      const label = getTierLabel(total);
      setRankName(label);
      setRankColor(getTier(label).color);
    };
    applyProfile(loadProfile());
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then(applyProfile);
    });
  }, []);

  const saveSelection = (id: number | null) => {
    setSelectedId(id);
    if (id !== null) localStorage.setItem(LS_KEY, String(id));
    else localStorage.removeItem(LS_KEY);
  };

  return { selectedId, rankName, rankColor, saveSelection };
}

// ─── ACE tier badge — icon only, no label ────────────────────────────────────
function AceBadge({ rankName, rankColor, size = 96 }: { rankName: string; rankColor: string; size?: number }) {
  const icon = RANK_ICONS[rankName] ?? RANK_ICONS.Uncharted;
  const iconPx = Math.round(size * 0.52);
  return (
    <span className="flex items-center justify-center w-full h-full" style={{ color: rankColor }}>
      <span style={{ width: iconPx, height: iconPx, display: "block" }}>{icon}</span>
    </span>
  );
}

// ─── Profile hero avatar (clickable) ─────────────────────────────────────────
export default function AvatarPicker() {
  const { selectedId, rankName, rankColor, saveSelection } = useAvatarState();
  const [open, setOpen] = useState(false);
  const selected = selectedId !== null ? AVATARS.find(a => a.id === selectedId) ?? null : null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-24 h-24 rounded-3xl relative overflow-hidden focus:outline-none"
        style={{
          border: `1.5px solid ${selected ? "rgba(255,255,255,0.09)" : rankColor + "30"}`,
          background: selected ? "transparent" : `linear-gradient(145deg,${rankColor}1a 0%,${rankColor}08 100%)`,
          boxShadow: selected ? "none" : `0 0 32px ${rankColor}14`,
        }}
        aria-label="Change profile picture"
      >
        {selected
          ? <span className="block w-full h-full rounded-[22px] overflow-hidden">{selected.svg}</span>
          : <AceBadge rankName={rankName} rankColor={rankColor} />
        }
        <span className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl gap-1 pointer-events-none">
          <svg className="w-5 h-5 text-white/75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span className="text-[9px] font-bold text-white/65 uppercase tracking-wider">Change</span>
        </span>
      </button>

      {open && (
        <AvatarPickerModal
          selectedId={selectedId}
          rankName={rankName}
          rankColor={rankColor}
          onSelect={saveSelection}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Picker modal — used in profile hero + settings ───────────────────────────
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
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const choose = (id: number | null) => { onSelect(id); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
      <div
        ref={dialogRef}
        className="rounded-2xl overflow-hidden w-full max-w-sm"
        style={{ background: "#0e0e12", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="font-bold text-white text-sm">Profile picture</p>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* ACE rank default */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-2.5">Default</p>
            <button type="button" onClick={() => choose(null)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: selectedId === null ? `${rankColor}12` : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedId === null ? rankColor + "30" : "rgba(255,255,255,0.06)"}`,
              }}>
              {/* Mini ACE badge preview */}
              <span
                className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: `${rankColor}14`, border: `1px solid ${rankColor}28`, color: rankColor }}
              >
                <span style={{ width: 20, height: 20, display: "block" }}>{RANK_ICONS[rankName] ?? RANK_ICONS.Uncharted}</span>
              </span>
              <span className="flex-1 text-left">
                <span className="block text-xs font-semibold text-white/80">ACE Rank — {rankName}</span>
                <span className="block text-[10px] text-white/28 mt-0.5">Shows your adventure tier badge</span>
              </span>
              {selectedId === null && <Check className="w-4 h-4 shrink-0" style={{ color: rankColor }} />}
            </button>
          </div>

          {/* Characters — 2 rows × 5 cols */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-2.5">Characters</p>
            <div className="grid grid-cols-5 gap-2.5">
              {AVATARS.map(av => <AvatarCell key={av.id} av={av} active={selectedId === av.id} onPick={() => choose(av.id)} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarCell({ av, active, onPick }: { av: (typeof AVATARS)[0]; active: boolean; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="flex flex-col items-center gap-1.5 group/av focus:outline-none">
      <span
        className="w-full aspect-square rounded-xl overflow-hidden block"
        style={{
          border: `1.5px solid ${active ? av.accentColor : "rgba(255,255,255,0.07)"}`,
          boxShadow: active ? `0 0 16px ${av.accentColor}40` : "none",
          outline: active ? `1px solid ${av.accentColor}20` : "none",
          outlineOffset: "2px",
          transform: active ? "scale(1.06)" : "scale(1)",
          transition: "all 0.13s",
        }}
      >
        {av.svg}
      </span>
      <span className="text-[7.5px] text-white/25 group-hover/av:text-white/55 transition-colors font-medium leading-none tracking-wide">
        {av.label}
      </span>
    </button>
  );
}
