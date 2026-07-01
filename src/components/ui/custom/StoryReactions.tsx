"use client";

import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, Flame, Mountain, Heart, Meh } from "lucide-react";

interface Props {
  slug: string;
}

const REACTIONS = [
  { emoji: "🔥", label: "Fire", icon: Flame },
  { emoji: "🏔️", label: "Epic", icon: Mountain },
  { emoji: "🙌", label: "Inspiring", icon: ThumbsUp },
  { emoji: "❤️", label: "Love", icon: Heart },
  { emoji: "😢", label: "Moving", icon: Meh },
];

interface ReactionData {
  [emoji: string]: number;
}

export default function StoryReactions({ slug }: Props) {
  const [reactions, setReactions] = useState<ReactionData>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    setUserReaction(localStorage.getItem(`story-reaction-${slug}`));

    async function load() {
      try {
        const res = await fetch(`/api/stories/reactions?slug=${slug}`);
        if (res.ok) {
          const data: ReactionData = await res.json();
          setReactions(data);
        }
      } catch {
        // no data yet
      }
    }
    load();
  }, [slug]);

  const total = Object.values(reactions).reduce((a, b) => a + b, 0);

  const react = useCallback(async (emoji: string) => {
    if (userReaction === emoji) return;

    const newReactions = { ...reactions };
    if (userReaction) {
      newReactions[userReaction] = Math.max(0, (newReactions[userReaction] || 0) - 1);
    }
    newReactions[emoji] = (newReactions[emoji] || 0) + 1;

    setReactions(newReactions);
    setUserReaction(emoji);
    localStorage.setItem(`story-reaction-${slug}`, emoji);
    setAnimating(emoji);
    setTimeout(() => setAnimating(null), 600);

    try {
      await fetch("/api/stories/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, reactions: newReactions }),
      });
    } catch {
      // silently fail
    }
  }, [reactions, userReaction, slug]);

  return (
    <div className="mt-8 pt-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <p className="text-xs font-medium mb-3" style={{ color: "var(--text-tertiary)" }}>React to this story</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium mr-1" style={{ color: "var(--text-muted)" }}>
          {total > 0 ? `${total} reaction${total !== 1 ? "s" : ""}` : ""}
        </span>

        {REACTIONS.map(({ emoji, label }) => {
          const count = reactions[emoji] || 0;
          const isActive = userReaction === emoji;
          const isAnimating = animating === emoji;

          return (
            <button
              key={emoji}
              onClick={() => react(emoji)}
              className={`
                relative flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
                transition-all duration-200 border
                ${isAnimating ? "scale-110" : "scale-100"}
              `}
              style={{
                background: isActive ? "rgba(255,81,0,0.15)" : "var(--bg-card)",
                borderColor: isActive ? "rgba(255,81,0,0.4)" : "var(--border-subtle)",
                color: isActive ? "#ff5100" : "var(--text-secondary)",
              }}
              title={label}
            >
              <span className={`text-sm ${isAnimating ? "animate-bounce" : ""}`}>{emoji}</span>
              {count > 0 && (
                <span className={`text-[11px] font-medium ${isActive ? "text-[#ff5100]" : ""}`} style={{ color: isActive ? undefined : "var(--text-muted)" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}