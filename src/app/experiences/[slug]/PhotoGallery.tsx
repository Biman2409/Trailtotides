"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2, X, ZoomIn, Upload, ImageOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Photo {
  id: string;
  slug: string;
  user_id: string;
  username: string;
  avatar_id?: number | null;
  caption: string;
  url: string;
  created_at: string;
}

interface Props {
  slug: string;
  currentUserId?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function PhotoGallery({ slug, currentUserId }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/photos?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  function handleFileChange(f: File | null) {
    if (!f) return;
    setFile(f);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileChange(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      form.append("caption", caption);
      const res = await fetch("/api/photos", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      setPhotos((prev) => [data.photo, ...prev]);
      setFile(null);
      setPreview(null);
      setCaption("");
      toast.success("Photo shared!", { description: "Your shot is live on the trail.", duration: 3000 });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/photos?id=${id}&slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section>

      {/* Upload area — logged in only */}
      {currentUserId ? (
        <div className="mb-6">
          {!preview ? (
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-8 rounded-2xl cursor-pointer transition-all duration-200 hover:border-[#ff5100]/40 hover:bg-[#ff5100]/3"
              style={{ border: "2px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
            >
              <Camera className="w-6 h-6 text-white/20" />
              <p className="text-white/40 text-sm font-medium">Drop a photo or tap to upload</p>
              <p className="text-white/20 text-xs">JPG, PNG, WebP · Max 8MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
              {/* Preview */}
              <div className="relative aspect-video">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPreview(null); setFile(null); setCaption(""); }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-black/60 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Caption + Submit */}
              <div className="p-4">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={120}
                  placeholder="Add a caption (optional)"
                  className="w-full bg-transparent border-b text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-[#ff5100]/50 pb-2 mb-4 transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                />
                <div className="flex items-center justify-between gap-3">
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => { setPreview(null); setFile(null); setCaption(""); setError(""); }}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all active:scale-95"
                      style={{ background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)" }}
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? "Uploading…" : "Share Photo"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Gallery grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <ImageOff className="w-8 h-8 text-white/10" />
          <p className="text-white/25 text-sm">No photos yet. Be the first to share.</p>
        </div>
      ) : (
        <>
        <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: "340px" }}>
        <div className="columns-2 gap-2 space-y-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid relative rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => setLightbox(photo)}
            >
              <img
                src={photo.url}
                alt={photo.caption || "Trail photo"}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,81,0,0.4)" }}>
                      {photo.avatar_id
                        ? <img src={`/avatars/avatar-${photo.avatar_id}.png`} alt={photo.username} className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-white text-[8px] font-bold">{photo.username.charAt(0).toUpperCase()}</span>}
                    </div>
                    <span className="text-white text-[10px] font-semibold leading-none truncate max-w-[80px]">{photo.username}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-white/60" />
                    {currentUserId === photo.user_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                        disabled={deleting === photo.id}
                        className="text-white/60 hover:text-red-400 transition-colors"
                      >
                        {deleting === photo.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
                {photo.caption && (
                  <p className="text-white/70 text-[10px] mt-1 leading-snug line-clamp-2">{photo.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
        {photos.length > 1 && (
          <p className="text-center text-white/25 text-[10px] mt-3">{photos.length} photos · scroll to see all</p>
        )}
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption || "Trail photo"}
              className="w-full object-contain max-h-[78vh]"
              style={{ background: "#000" }}
            />
            <div className="px-5 py-3 flex items-center gap-3" style={{ background: "rgba(15,15,20,0.95)" }}>
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,81,0,0.3)" }}>
                {lightbox.avatar_id
                  ? <img src={`/avatars/avatar-${lightbox.avatar_id}.png`} alt={lightbox.username} className="w-full h-full object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{lightbox.username.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-semibold">{lightbox.username}</p>
                {lightbox.caption && <p className="text-white/45 text-xs mt-0.5 truncate">{lightbox.caption}</p>}
              </div>
              <span className="text-white/25 text-xs shrink-0">{timeAgo(lightbox.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
