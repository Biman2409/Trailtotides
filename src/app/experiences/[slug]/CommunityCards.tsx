"use client";

import { useState, type ReactNode } from "react";
import { Camera } from "lucide-react";
import PhotoGallery from "./PhotoGallery";

const CARD_STYLE = { border: "1px solid var(--border-default)", background: "var(--bg-surface)" };

/**
 * Traveller reviews and photos, side by side (stacked on phones). With no photos
 * yet the Photos card stays small: the upload prompt for people logged in, a
 * log-in link for visitors.
 */
export default function CommunityCards({ reviews, slug, currentUserId }: {
  reviews: ReactNode;
  slug: string;
  currentUserId?: string;
}) {
  // null until the gallery has loaded
  const [photoCount, setPhotoCount] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
      <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>{reviews}</div>

      <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <Camera className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <span className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>Photos</span>
          {photoCount ? <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{photoCount}</span> : null}
        </div>
        <div className="p-4 [&_button]:mb-0">
          <PhotoGallery slug={slug} currentUserId={currentUserId} onCount={setPhotoCount} />
          {/* Logged out: the same prompt row as the reviews card's "Log in to write a review" */}
          {photoCount !== null && !currentUserId && (
            <a
              href={`/auth/login?next=${encodeURIComponent(`/experiences/${slug}`)}`}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all hover:brightness-110"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}
            >
              <span>{photoCount === 0 ? "No photos yet" : "Been here?"}</span>
              <span className="text-amber-400/70 font-semibold shrink-0">Log in to add photos →</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
