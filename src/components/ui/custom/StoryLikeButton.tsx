"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const DEFAULT_LIKES = 50;

export default function StoryLikeButton({ slug, baseLikes, className = "", pill = false, muted = false }: { slug: string; baseLikes?: number; className?: string; pill?: boolean; muted?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(baseLikes ?? DEFAULT_LIKES);

  useEffect(() => {
    const stored = localStorage.getItem(`story_liked_${slug}`);
    if (stored === "true") {
      setLiked(true);
      setLikeCount((baseLikes ?? DEFAULT_LIKES) + 1);
    }
  }, [slug]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikeCount(next ? (baseLikes ?? DEFAULT_LIKES) + 1 : baseLikes ?? DEFAULT_LIKES);
    localStorage.setItem(`story_liked_${slug}`, next ? "true" : "false");
  }

  if (pill) {
    const idleColor = muted ? "var(--text-tertiary)" : "rgba(255,255,255,0.7)";
    return (
      <button
        onClick={toggleLike}
        className={`flex items-center gap-1.5 rounded-full px-3 h-9 transition-all active:scale-90 ${muted ? "" : "bg-white/15 backdrop-blur-sm border border-white/20"} ${className}`}
        style={muted ? { background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" } : undefined}
      >
        <Heart
          className="w-4 h-4 transition-colors"
          style={{
            color: liked ? "#ff4d6d" : idleColor,
            fill: liked ? "#ff4d6d" : "transparent",
          }}
        />
        <span className="text-xs font-semibold tabular-nums" style={{ color: liked ? "#ff4d6d" : idleColor }}>
          {likeCount}
        </span>
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-0 ${className}`}>
      <button onClick={toggleLike} className="transition-all active:scale-90">
        <Heart
          className="w-4 h-4 transition-colors"
          style={{
            color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)",
            fill: liked ? "#ff4d6d" : "transparent",
          }}
        />
      </button>
      <span className="text-[9px] font-semibold tabular-nums -mt-0.5" style={{ color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)" }}>
        {likeCount}
      </span>
    </div>
  );
}