"use client";

import { useState, type ReactNode } from "react";
import { Camera } from "lucide-react";
import PhotoGallery from "./PhotoGallery";

const CARD_STYLE = { background: "rgba(var(--tint-neutral-rgb),0.025)", border: "1px solid rgba(var(--tint-neutral-rgb),0.18)" };

/**
 * Reviews + Photos. Reviews always have content (every adventure has seed
 * reviews); photos often don't, so an empty Photos card is hidden and Reviews
 * takes the full width. Logged-in users still get a slim "share a photo" row.
 */
export default function CommunityCards({ reviews, slug, currentUserId, isCompleted }: {
  reviews: ReactNode;
  slug: string;
  currentUserId?: string;
  isCompleted?: boolean;
}) {
  // null until the gallery has loaded; treated as empty so nothing flashes in
  const [photoCount, setPhotoCount] = useState<number | null>(null);
  const hasPhotos = (photoCount ?? 0) > 0;
  const showUploadRow = !hasPhotos && !!currentUserId && photoCount !== null;

  return (
    <div className={`grid grid-cols-1 gap-3 items-stretch ${hasPhotos ? "md:grid-cols-2" : ""}`}>
      <div className="rounded-xl overflow-hidden" style={CARD_STYLE}>{reviews}</div>

      {/* The gallery stays mounted in this one spot (it does the loading);
          only its frame changes: full card, bare upload row, or hidden */}
      <div
        className={hasPhotos ? "rounded-xl overflow-hidden" : showUploadRow ? "[&_button]:mb-0" : "hidden"}
        style={hasPhotos ? CARD_STYLE : undefined}
      >
        {hasPhotos && (
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(var(--tint-neutral-rgb),0.05)" }}>
            <Camera className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
            <h3 className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--text-tertiary)" }}>Photos</h3>
          </div>
        )}
        <div className={hasPhotos ? "p-3" : ""}>
          <PhotoGallery slug={slug} currentUserId={currentUserId} isCompleted={isCompleted} onCount={setPhotoCount} />
        </div>
      </div>
    </div>
  );
}
