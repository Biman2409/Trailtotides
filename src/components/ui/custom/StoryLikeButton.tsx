"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

// A personal like, kept in this browser. Likes aren't counted anywhere yet, so the button shows
// no number: a count would only ever be a made-up base plus your own tap.
// baseLikes stays in the props so existing callers keep compiling; it isn't shown.
export default function StoryLikeButton({ slug, className = "", pill = false, muted = false }: { slug: string; baseLikes?: number; className?: string; pill?: boolean; muted?: boolean }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try { setLiked(localStorage.getItem(`story_liked_${slug}`) === "true"); } catch {}
  }, [slug]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    try { localStorage.setItem(`story_liked_${slug}`, next ? "true" : "false"); } catch {}
  }

  const label = liked ? "Liked" : "Like this story";

  if (pill) {
    const idleColor = muted ? "var(--text-tertiary)" : "rgba(255,255,255,0.7)";
    return (
      <button
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={label}
        title={label}
        className={`flex items-center justify-center rounded-full w-9 h-9 transition-all active:scale-90 ${muted ? "" : "bg-white/15 backdrop-blur-sm border border-white/20"} ${className}`}
        style={muted ? { background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" } : undefined}
      >
        <Heart
          className="w-4 h-4 transition-colors"
          style={{
            color: liked ? "#ff4d6d" : idleColor,
            fill: liked ? "#ff4d6d" : "transparent",
          }}
        />
      </button>
    );
  }

  return (
    <button onClick={toggleLike} aria-pressed={liked} aria-label={label} title={label} className={`transition-all active:scale-90 ${className}`}>
      <Heart
        className="w-4 h-4 transition-colors"
        style={{
          color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)",
          fill: liked ? "#ff4d6d" : "transparent",
        }}
      />
    </button>
  );
}
