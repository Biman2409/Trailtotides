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
          {photoCount === 0 && !currentUserId && (
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              No photos yet.{" "}
              <a href={`/auth/login?next=${encodeURIComponent(`/experiences/${slug}`)}`} className="text-[#ff5100] hover:underline">Log in to add yours</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
