"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { getTierLabel, getTier } from "@/lib/tiers";
import { loadProfile } from "@/lib/matchmaker";

// ── 10 adventure-themed avatar illustrations ──────────────────────────────────
// Each is a 64×64 SVG drawn inline. Colors match the Trail to Tides palette.
const AVATARS: { id: number; label: string; svg: React.ReactNode }[] = [
  {
    id: 1, label: "Summit",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#1a1008"/>
        <polygon points="32,10 54,52 10,52" fill="#ff5100" opacity="0.85"/>
        <polygon points="32,10 54,52 10,52" fill="url(#mt1)" opacity="0.5"/>
        <polygon points="32,10 43,32 21,32" fill="white" opacity="0.12"/>
        <line x1="32" y1="6" x2="32" y2="12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
        <defs><linearGradient id="mt1" x1="32" y1="10" x2="32" y2="52" gradientUnits="userSpaceOnUse"><stop stopColor="#fbbf24" stopOpacity="0.6"/><stop offset="1" stopColor="#ff5100" stopOpacity="0"/></linearGradient></defs>
      </svg>
    ),
  },
  {
    id: 2, label: "Wave",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#071a2e"/>
        <path d="M6 38 Q16 26 26 34 Q36 42 46 30 Q56 18 62 28 L62 58 L6 58 Z" fill="#0ea5e9" opacity="0.7"/>
        <path d="M6 42 Q16 32 26 38 Q36 44 46 34 Q56 24 62 34 L62 58 L6 58 Z" fill="#38bdf8" opacity="0.5"/>
        <circle cx="32" cy="20" r="8" fill="#fbbf24" opacity="0.9"/>
        <path d="M28 20 Q32 15 36 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 3, label: "Forest",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#071a0e"/>
        <polygon points="32,8 48,38 16,38" fill="#16a34a" opacity="0.9"/>
        <polygon points="32,18 50,46 14,46" fill="#15803d" opacity="0.85"/>
        <polygon points="32,28 52,56 12,56" fill="#166534" opacity="0.8"/>
        <rect x="29" y="46" width="6" height="12" rx="1" fill="#92400e"/>
        <circle cx="32" cy="8" r="3" fill="#fbbf24" opacity="0.8"/>
      </svg>
    ),
  },
  {
    id: 4, label: "Desert",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#1c0f00"/>
        <ellipse cx="32" cy="10" r="12" fill="#f97316" opacity="0.9"/>
        <path d="M4 52 Q16 36 28 44 Q32 48 36 44 Q48 36 60 52 L60 64 L4 64 Z" fill="#b45309" opacity="0.7"/>
        <path d="M4 56 Q20 44 32 50 Q44 44 60 56 L60 64 L4 64 Z" fill="#92400e" opacity="0.6"/>
        <line x1="20" y1="40" x2="20" y2="52" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 44 Q26 40 24 46" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: 5, label: "Glacier",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#030d1a"/>
        <polygon points="32,6 58,56 6,56" fill="#bfdbfe" opacity="0.2"/>
        <polygon points="32,6 58,56 6,56" fill="url(#gl1)" opacity="0.7"/>
        <polygon points="32,6 46,34 18,34" fill="white" opacity="0.3"/>
        <path d="M6 56 L32 6 L58 56" stroke="#93c5fd" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <circle cx="32" cy="6" r="4" fill="#dbeafe" opacity="0.9"/>
        <defs><linearGradient id="gl1" x1="32" y1="6" x2="32" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#93c5fd" stopOpacity="0.9"/><stop offset="1" stopColor="#1d4ed8" stopOpacity="0.4"/></linearGradient></defs>
      </svg>
    ),
  },
  {
    id: 6, label: "Canyon",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#1c0a00"/>
        <rect x="0" y="0" width="20" height="64" rx="0" fill="#c2410c" opacity="0.8"/>
        <rect x="44" y="0" width="20" height="64" rx="0" fill="#b45309" opacity="0.8"/>
        <rect x="14" y="16" width="12" height="48" fill="#ea580c" opacity="0.7"/>
        <rect x="38" y="20" width="12" height="44" fill="#d97706" opacity="0.7"/>
        <path d="M20 0 L20 64 M44 0 L44 64" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
        <ellipse cx="32" cy="14" r="6" fill="#fde68a" opacity="0.7"/>
        <path d="M26 32 Q32 44 38 32" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 7, label: "Night Sky",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#020817"/>
        <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="28" cy="8" r="1" fill="white" opacity="0.6"/>
        <circle cx="50" cy="15" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="44" cy="28" r="1" fill="white" opacity="0.5"/>
        <circle cx="8" cy="30" r="1" fill="white" opacity="0.6"/>
        <circle cx="56" cy="38" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="20" cy="42" r="1" fill="white" opacity="0.4"/>
        <path d="M32 18 Q40 18 44 24 Q40 22 34 24 Q36 30 32 34 Q28 30 30 24 Q24 22 20 24 Q24 18 32 18 Z" fill="#a78bfa" opacity="0.9"/>
        <path d="M6 54 Q20 40 32 46 Q44 40 58 54" fill="#1e1b4b" opacity="0.8"/>
        <ellipse cx="32" cy="55" rx="20" ry="8" fill="#312e81" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 8, label: "River",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#071c10"/>
        <path d="M6 48 Q20 36 32 42 Q44 48 58 36" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
        <path d="M6 52 Q20 40 32 46 Q44 52 58 40 L58 64 L6 64 Z" fill="#059669" opacity="0.5"/>
        <path d="M6 54 Q20 44 32 50 Q44 56 58 46 L58 64 L6 64 Z" fill="#065f46" opacity="0.6"/>
        <path d="M22 8 L18 28 M32 6 L32 24 M42 8 L46 28" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <polygon points="26,8 38,8 34,20 30,20" fill="#15803d" opacity="0.7"/>
        <polygon points="20,6 30,6 27,16 23,16" fill="#16a34a" opacity="0.8"/>
        <polygon points="32,4 44,4 41,14 35,14" fill="#14532d" opacity="0.75"/>
      </svg>
    ),
  },
  {
    id: 9, label: "Volcano",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#0f0200"/>
        <polygon points="32,14 56,56 8,56" fill="#7c2d12" opacity="0.9"/>
        <polygon points="32,14 56,56 8,56" fill="url(#vc1)" opacity="0.6"/>
        <path d="M26 14 Q28 6 32 4 Q36 6 38 14" fill="#ef4444" opacity="0.9"/>
        <circle cx="32" cy="4" r="5" fill="#f97316" opacity="0.8"/>
        <path d="M30 2 Q32 -2 34 2" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M28 18 Q32 40 36 18" stroke="#ef4444" strokeWidth="2" fill="#ef4444" opacity="0.6"/>
        <defs><linearGradient id="vc1" x1="32" y1="14" x2="32" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#f97316" stopOpacity="0.7"/><stop offset="1" stopColor="#7c2d12" stopOpacity="0"/></linearGradient></defs>
      </svg>
    ),
  },
  {
    id: 10, label: "Aurora",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#020c1b"/>
        <path d="M0 20 Q16 10 32 20 Q48 30 64 20 L64 40 Q48 50 32 40 Q16 30 0 40 Z" fill="url(#au1)" opacity="0.45"/>
        <path d="M0 30 Q16 18 32 28 Q48 38 64 28 L64 50 Q48 60 32 50 Q16 40 0 50 Z" fill="url(#au2)" opacity="0.35"/>
        <circle cx="12" cy="10" r="1" fill="white" opacity="0.7"/>
        <circle cx="32" cy="6" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="52" cy="10" r="1" fill="white" opacity="0.6"/>
        <circle cx="44" cy="18" r="0.8" fill="white" opacity="0.5"/>
        <path d="M8 52 Q20 46 32 50 Q44 46 56 52 L56 64 L8 64 Z" fill="#0f172a" opacity="0.9"/>
        <polygon points="20,52 28,42 24,54" fill="#1e293b" opacity="0.8"/>
        <polygon points="32,50 38,40 42,52" fill="#1e293b" opacity="0.8"/>
        <polygon points="42,54 48,44 52,54" fill="#1e293b" opacity="0.7"/>
        <defs>
          <linearGradient id="au1" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#4ade80"/><stop offset="0.5" stopColor="#22d3ee"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
          <linearGradient id="au2" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa"/><stop offset="0.5" stopColor="#4ade80"/><stop offset="1" stopColor="#22d3ee"/></linearGradient>
        </defs>
      </svg>
    ),
  },
];

const LS_KEY = "ttt_avatar_id";

export default function AvatarPicker() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [rankName, setRankName] = useState("Uncharted");
  const [rankColor, setRankColor] = useState("#6b7280");

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setSelectedId(Number(stored));
    // Load ACE rank from localStorage profile
    const p = loadProfile();
    if (p?.ace) {
      const total = Object.values(p.ace).reduce((s: number, v) => s + (v as number), 0);
      const label = getTierLabel(total);
      const tier = getTier(label);
      setRankName(label);
      setRankColor(tier.color);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const choose = (id: number) => {
    setSelectedId(id);
    localStorage.setItem(LS_KEY, String(id));
    setOpen(false);
  };

  const clearAvatar = () => {
    setSelectedId(null);
    localStorage.removeItem(LS_KEY);
  };

  const selected = selectedId !== null ? AVATARS.find(a => a.id === selectedId) : null;

  return (
    <div className="relative shrink-0">
      {/* ── Avatar display ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-24 h-24 rounded-3xl relative overflow-hidden focus:outline-none"
        style={{
          background: selected
            ? "transparent"
            : `linear-gradient(135deg, ${rankColor}30 0%, ${rankColor}10 100%)`,
          border: `1.5px solid ${selected ? "transparent" : rankColor + "35"}`,
          boxShadow: selected ? "none" : `0 0 40px ${rankColor}18`,
        }}
        aria-label="Change profile avatar"
      >
        {selected ? (
          /* Chosen illustration */
          <span className="block w-full h-full rounded-3xl overflow-hidden">
            {selected.svg}
          </span>
        ) : (
          /* ACE rank display */
          <span className="flex flex-col items-center justify-center w-full h-full gap-0.5">
            <span
              className="text-[11px] font-black uppercase tracking-widest leading-none"
              style={{ color: rankColor }}
            >
              {rankName}
            </span>
            {/* Rank pip dots */}
            <span className="flex gap-0.5 mt-1">
              {Array.from({ length: rankName === "Uncharted" ? 1 : rankName === "Pathfinder" ? 1 : rankName === "Navigator" ? 2 : rankName === "Trailblazer" ? 3 : rankName === "Vanguard" ? 4 : 5 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: rankColor, opacity: 0.8 }}
                />
              ))}
            </span>
          </span>
        )}

        {/* Hover overlay */}
        <span className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl gap-1">
          <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Change</span>
        </span>
      </button>

      {/* ── Picker dialog ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div
            ref={dialogRef}
            className="rounded-2xl overflow-hidden w-full max-w-sm"
            style={{ background: "#111014", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div>
                <p className="font-bold text-white text-sm">Choose your avatar</p>
                <p className="text-white/35 text-xs mt-0.5">Or keep your ACE rank displayed</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ACE rank option */}
            <div className="px-5 pt-4">
              <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold mb-2">Default</p>
              <button
                type="button"
                onClick={clearAvatar}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:brightness-110"
                style={{
                  background: selectedId === null ? `${rankColor}14` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selectedId === null ? rankColor + "35" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                <span
                  className="w-10 h-10 rounded-xl shrink-0 flex flex-col items-center justify-center gap-0.5"
                  style={{ background: `linear-gradient(135deg, ${rankColor}30, ${rankColor}10)`, border: `1.5px solid ${rankColor}35` }}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: rankColor }}>
                    {rankName}
                  </span>
                </span>
                <span className="flex-1 text-left">
                  <span className="block text-xs font-semibold text-white/80">ACE Rank</span>
                  <span className="block text-[10px] text-white/30 mt-0.5">Shows your adventure rank</span>
                </span>
                {selectedId === null && <Check className="w-4 h-4 shrink-0" style={{ color: rankColor }} />}
              </button>
            </div>

            {/* Avatar grid */}
            <div className="px-5 py-4">
              <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold mb-3">Illustrations</p>
              <div className="grid grid-cols-5 gap-2.5">
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => choose(av.id)}
                    className="flex flex-col items-center gap-1 group/av focus:outline-none"
                  >
                    <span
                      className="w-full aspect-square rounded-xl overflow-hidden transition-all"
                      style={{
                        border: `1.5px solid ${selectedId === av.id ? "#ff5100" : "rgba(255,255,255,0.08)"}`,
                        boxShadow: selectedId === av.id ? "0 0 12px rgba(255,81,0,0.4)" : "none",
                        transform: selectedId === av.id ? "scale(1.08)" : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    >
                      {av.svg}
                    </span>
                    <span className="text-[8px] text-white/30 group-hover/av:text-white/55 transition-colors font-medium">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
