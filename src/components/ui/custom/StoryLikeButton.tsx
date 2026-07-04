"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const BASE_LIKES = 50;

export default function StoryLikeButton({ slug, className = "" }: { slug: string; className?: string }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(BASE_LIKES);

  useEffect(() => {
    const stored = localStorage.getItem(`story_liked_${slug}`);
    if (stored === "true") {
      setLiked(true);
      setLikeCount(BASE_LIKES + 1);
    }
  }, [slug]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikeCount(next ? BASE_LIKES + 1 : BASE_LIKES);
    localStorage.setItem(`story_liked_${slug}`, next ? "true" : "false");
  }

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1 bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full transition-all active:scale-90 ${className}`}
    >
      <Heart
        className="w-3 h-3 transition-colors"
        style={{
          color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)",
          fill: liked ? "#ff4d6d" : "transparent",
        }}
      />
      <span className="text-[10px] font-semibold tabular-nums" style={{ color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)" }}>
        {likeCount}
      </span>
    </button>
  );
}