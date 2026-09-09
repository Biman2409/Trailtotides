"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Check, Crown, Upload, Loader2, Trash2 } from "lucide-react";
import { AVATARS, LS_KEY } from "@/lib/avatars";
import { getTierLabel, getTier } from "@/lib/tiers";
import { RANK_ICONS } from "@/lib/rankIcons";
import { loadProfile, loadProfileFromServer } from "@/lib/matchmaker";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB — matches the server-side limit in /api/avatar

// ─── Hook — shared state loader ───────────────────────────────────────────────
async function fetchServerAvatar(): Promise<{ avatar_id: number | null; avatar_url: string | null }> {
  try {
    const res = await fetch("/api/me");
    if (!res.ok) return { avatar_id: null, avatar_url: null };
    const data = await res.json();
    return { avatar_id: data.avatar_id ?? null, avatar_url: data.avatar_url ?? null };
  } catch { return { avatar_id: null, avatar_url: null }; }
}

async function saveServerAvatarId(id: number | null): Promise<void> {
  try {
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_id: id }),
    });
  } catch { /* silent */ }
}

export function useAvatarState() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [rankName, setRankName] = useState("Uncharted");
  const [rankColor, setRankColor] = useState("#6b7280");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    // Load from localStorage immediately for instant render
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setSelectedId(Number(stored));

    // Bidirectional sync with server:
    // - server has value → use it (cross-device sync)
    // - server has no value but localStorage does → push local to server
    fetchServerAvatar().then(({ avatar_id: serverId, avatar_url }) => {
      const localRaw = localStorage.getItem(LS_KEY);
      setAvatarUrl(avatar_url);
      if (serverId !== null) {
        setSelectedId(serverId);
        localStorage.setItem(LS_KEY, String(serverId));
      } else if (localRaw && !avatar_url) {
        // Local selection not yet on server (e.g. picked before login) — push it
        saveServerAvatarId(Number(localRaw));
      }
    });

    const applyProfile = (p: ReturnType<typeof loadProfile>) => {
      if (!p?.ace) return;
      const total = Object.values(p.ace).reduce((s: number, v) => s + (v as number), 0);
      const label = getTierLabel(total);
      setRankName(label);
      setRankColor(getTier(label).color);
    };
    applyProfile(loadProfile());
    loadProfileFromServer().then(applyProfile);
  }, []);

  const saveSelection = (id: number | null) => {
    setSelectedId(id);
    setAvatarUrl(null); // picking a preset supersedes any uploaded photo
    if (id !== null) localStorage.setItem(LS_KEY, String(id));
    else localStorage.removeItem(LS_KEY);
    saveServerAvatarId(id);
  };

  const uploadPhoto = async (file: File) => {
    setUploadError("");
    if (file.size > MAX_AVATAR_BYTES) { setUploadError("File too large — max 2MB"); return; }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Use a JPG, PNG, or WebP image"); return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error ?? "Upload failed"); return; }
      setAvatarUrl(data.avatar_url);
      setSelectedId(null);
      localStorage.removeItem(LS_KEY);
    } catch {
      setUploadError("Something went wrong — try again");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setAvatarUrl(null);
    try { await fetch("/api/avatar", { method: "DELETE" }); } catch { /* silent */ }
  };

  return { selectedId, avatarUrl, rankName, rankColor, saveSelection, uploadPhoto, removePhoto, uploading, uploadError };
}

// ─── ACE tier badge — icon only, no label ────────────────────────────────────
export function AceBadge({ rankName, rankColor, size = 96 }: { rankName: string; rankColor: string; size?: number }) {
  const icon = RANK_ICONS[rankName] ?? RANK_ICONS.Uncharted;
  const iconPx = Math.round(size * 0.52);
  return (
    <span className="flex items-center justify-center w-full h-full" style={{ color: rankColor }}>
      <span style={{ width: iconPx, height: iconPx, display: "block" }}>{icon}</span>
    </span>
  );
}

// ─── Admin emblem — exclusive default, no one else can pick this ────────────
export function AdminEmblem({ size = 96 }: { size?: number }) {
  const iconPx = Math.round(size * 0.4);
  return (
    <span
      className="relative flex items-center justify-center w-full h-full"
      style={{ background: "radial-gradient(circle, rgba(167,139,250,0.22) 0%, rgba(201,162,77,0.12) 65%, transparent 100%)" }}
    >
      <span className="absolute rounded-full" style={{ inset: "14%", border: "1px dashed rgba(201,162,77,0.45)" }} />
      <Crown style={{ width: iconPx, height: iconPx }} color="#c9a24d" fill="rgba(167,139,250,0.4)" strokeWidth={1.75} />
    </span>
  );
}

// ─── Profile hero avatar (clickable) ─────────────────────────────────────────
export default function AvatarPicker({ isAdmin = false }: { isAdmin?: boolean }) {
  const { selectedId, avatarUrl, rankName, rankColor, saveSelection, uploadPhoto, removePhoto, uploading, uploadError } = useAvatarState();
  const [open, setOpen] = useState(false);
  const selected = selectedId !== null ? AVATARS.find(a => a.id === selectedId) ?? null : null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-24 h-24 rounded-3xl relative overflow-hidden focus:outline-none"
        style={{
          border: `1.5px solid ${selected || avatarUrl ? "rgba(255,255,255,0.09)" : rankColor + "30"}`,
          background: selected || avatarUrl ? "transparent" : `linear-gradient(145deg,${rankColor}1a 0%,${rankColor}08 100%)`,
          boxShadow: selected || avatarUrl ? "none" : `0 0 32px ${rankColor}14`,
        }}
        aria-label="Change profile picture"
      >
        {avatarUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={avatarUrl} alt="Your photo" className="w-full h-full object-cover rounded-[22px]" />
          : selected
          ? <Image src={selected.src} alt={selected.label} fill sizes="96px" className="object-cover rounded-[22px]" />
          : isAdmin
          ? <AdminEmblem />
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
          avatarUrl={avatarUrl}
          rankName={rankName}
          rankColor={rankColor}
          onSelect={saveSelection}
          onUpload={uploadPhoto}
          onRemovePhoto={removePhoto}
          uploading={uploading}
          uploadError={uploadError}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Picker modal — used in profile hero + settings ───────────────────────────
export function AvatarPickerModal({
  selectedId,
  avatarUrl = null,
  rankName,
  rankColor,
  onSelect,
  onUpload,
  onRemovePhoto,
  uploading = false,
  uploadError = "",
  onClose,
}: {
  selectedId: number | null;
  avatarUrl?: string | null;
  rankName: string;
  rankColor: string;
  onSelect: (id: number | null) => void;
  onUpload?: (file: File) => void;
  onRemovePhoto?: () => void;
  uploading?: boolean;
  uploadError?: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
          {/* Uploaded photo */}
          {onUpload && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-2.5">Your Photo</p>
              {avatarUrl ? (
                <div className="flex items-center gap-3">
                  <span className="w-14 h-14 rounded-xl overflow-hidden shrink-0 block" style={{ border: "1.5px solid rgba(255,255,255,0.09)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl} alt="Your photo" className="w-full h-full object-cover" />
                  </span>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg self-start transition-all hover:brightness-110 disabled:opacity-50"
                      style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.18)" }}>
                      {uploading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Change photo"}
                    </button>
                    <button type="button" onClick={onRemovePhoto} disabled={uploading}
                      className="text-[10px] text-white/30 hover:text-white/55 text-left flex items-center gap-1 transition-colors disabled:opacity-50">
                      <Trash2 className="w-2.5 h-2.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all disabled:opacity-60"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.14)" }}>
                  <span className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                    {uploading ? <Loader2 className="w-4 h-4 text-white/40 animate-spin" /> : <Upload className="w-4 h-4 text-white/40" />}
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-xs font-semibold text-white/80">{uploading ? "Uploading…" : "Upload your photo"}</span>
                    <span className="block text-[10px] text-white/28 mt-0.5">JPG, PNG, or WebP · Max 2MB</span>
                  </span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
              />
              {uploadError && <p className="text-[10px] text-red-400 mt-1.5">{uploadError}</p>}
            </div>
          )}

          {/* ACE rank default */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-2.5">Default</p>
            <button type="button" onClick={() => choose(null)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: selectedId === null && !avatarUrl ? `${rankColor}12` : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedId === null && !avatarUrl ? rankColor + "30" : "rgba(255,255,255,0.06)"}`,
              }}>
              {/* Mini ACE badge preview */}
              <span
                className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: `${rankColor}14`, border: `1px solid ${rankColor}28`, color: rankColor }}
              >
                <span style={{ width: 20, height: 20, display: "block" }}>{RANK_ICONS[rankName] ?? RANK_ICONS.Uncharted}</span>
              </span>
              <span className="flex-1 text-left">
                <span className="block text-xs font-semibold text-white/80">ACE<sup>™</sup> Rank — {rankName}</span>
                <span className="block text-[10px] text-white/28 mt-0.5">Shows your adventure tier badge</span>
              </span>
              {selectedId === null && !avatarUrl && <Check className="w-4 h-4 shrink-0" style={{ color: rankColor }} />}
            </button>
          </div>

          {/* Characters — 2 rows × 5 cols */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-2.5">Characters</p>
            <div className="grid grid-cols-5 gap-2.5">
              {AVATARS.map(av => <AvatarCell key={av.id} av={av} active={selectedId === av.id && !avatarUrl} onPick={() => choose(av.id)} />)}
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
        className="relative w-full aspect-square rounded-xl overflow-hidden block"
        style={{
          border: `1.5px solid ${active ? "rgba(255,81,0,0.8)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: active ? "0 0 16px rgba(255,81,0,0.4)" : "none",
          outline: active ? "1px solid rgba(255,81,0,0.2)" : "none",
          outlineOffset: "2px",
          transform: active ? "scale(1.06)" : "scale(1)",
          transition: "all 0.13s",
        }}
      >
        <Image src={av.src} alt={av.label} fill sizes="80px" className="object-cover" />
      </span>
      <span className="text-[7.5px] text-white/25 group-hover/av:text-white/55 transition-colors font-medium leading-none tracking-wide">
        {av.label}
      </span>
    </button>
  );
}
