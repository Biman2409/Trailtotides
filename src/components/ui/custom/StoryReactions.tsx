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
    <div className="mt-8 pt-8 border-t border-white/10">
      <p className="text-white/30 text-xs font-medium mb-3">React to this story</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-white/40 text-xs font-medium mr-1">
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
                transition-all duration-200
                ${isActive
                  ? "bg-[#ff5100]/15 border-[#ff5100]/40 text-white"
                  : "bg-white/6 hover:bg-white/12 border-white/10 text-white/60 hover:text-white/90"
                }
                border
                ${isAnimating ? "scale-110" : "scale-100"}
              `}
              title={label}
            >
              <span className={`text-sm ${isAnimating ? "animate-bounce" : ""}`}>{emoji}</span>
              {count > 0 && (
                <span className={`text-[11px] font-medium ${isActive ? "text-[#ff5100]" : "text-white/50"}`}>
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