"use client";

import { useState } from "react";
import { Share2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdventurePassportCard() {
  const [sharing, setSharing] = useState(false);
  const [imgError, setImgError] = useState(false);

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch("/api/passport");
      if (!res.ok) {
        toast.error("Couldn't generate your Adventure Passport — try again in a moment.");
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], "adventure-passport.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Adventure Passport", text: "My adventures on Trail to Tides 🏔️" });
      } else {
        window.open(URL.createObjectURL(blob), "_blank");
        toast.success("Adventure Passport opened in a new tab — save it to share.");
      }
    } catch {
      // AbortError from a cancelled native share sheet is expected — no toast
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
      <div className="relative w-full" style={{ aspectRatio: "1600 / 1040", background: "radial-gradient(ellipse 90% 70% at 50% 15%, #7a1a26 0%, #4a0d16 55%, #2c0a10 100%)" }}>
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/api/passport"
            alt="Your Adventure Passport"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-8 h-8" style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
        )}
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Your Adventure Passport</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Every completed adventure, stamped.</p>
        </div>
        <button
          onClick={handleShare}
          disabled={sharing}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
          style={{ background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)", color: "#fff", boxShadow: "0 4px 14px rgba(255,81,0,0.3)" }}
        >
          {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
          {sharing ? "Generating…" : "Share"}
        </button>
      </div>
    </div>
  );
}
