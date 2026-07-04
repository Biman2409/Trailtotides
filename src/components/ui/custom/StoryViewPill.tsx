"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STORY VIEW COUNT SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Source of truth:  Supabase table `story_views`  (slug TEXT PK, views INT)
 * API:              GET  /api/stories/views?slug=<slug>   → { views: number }
 *                   POST /api/stories/views  body: { slug } → { views: number } (increments)
 *
 * ── HOW TO ADD A NEW STORY ───────────────────────────────────────────────────
 *  1. Add story to src/lib/data.ts with a unique `slug` field.
 *  2. Seed its initial view count in Supabase:
 *       INSERT INTO story_views (slug, views) VALUES ('your-story-slug', 0);
 *  3. Place <StoryViewPill> in the UI as described below — no other wiring needed.
 *
 * ── WHERE TO USE THIS COMPONENT ─────────────────────────────────────────────
 *  • Story card (homepage / listing)  →  <StoryViewPill slug={story.slug} />
 *    - Fetches live count on mount. No increment.
 *    - StoryCard already handles click-increment via POST on link click.
 *
 *  • Story detail page (/stories/[slug])  →  <StoryViewPill slug={story.slug} incrementOnMount />
 *    - Increments once on mount, then shows the updated count.
 *
 * ── RULES ────────────────────────────────────────────────────────────────────
 *  ✗ Never hardcode view counts anywhere in JSX.
 *  ✗ Never fetch /api/stories/views directly outside this component or StoryCard.
 *  ✓ Always use this component for any view pill — keeps formatting consistent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";

// Shared formatter — used here and exported for any place that needs the same style
export function formatViews(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return `${v}`;
}

interface Props {
  slug: string;
  /** If true, increments the count in Supabase on mount (use only on detail pages). */
  incrementOnMount?: boolean;
  className?: string;
  /** Compact size for use inside story cards */
  compact?: boolean;
}

export default function StoryViewPill({ slug, incrementOnMount = false, className = "", compact = false }: Props) {
  const [views, setViews] = useState<number | null>(null);
  const incremented = useRef(false);

  useEffect(() => {
    if (incrementOnMount && !incremented.current) {
      incremented.current = true;
      fetch("/api/stories/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((r) => r.json())
        .then((d) => { if (typeof d.views === "number") setViews(d.views); })
        .catch(() => {});
    } else {
      fetch(`/api/stories/views?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((d) => { if (typeof d.views === "number") setViews(d.views); })
        .catch(() => {});
    }
  }, [slug, incrementOnMount]);

  const baseClasses = compact
    ? "flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full"
    : "flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 text-xs px-3 py-1.5 rounded-full";

  return (
    <span className={`${baseClasses} ${className}`}>
      <Eye className="w-3 h-3 flex-shrink-0" />
      {views === null ? "—" : formatViews(views)}
    </span>
  );
}
