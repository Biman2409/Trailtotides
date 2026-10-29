"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";
import StoryCard from "@/components/ui/custom/StoryCard";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import type { StoryView } from "@/lib/storyView";

/** Activity chips over the story grid. The choice lives in ?activity= so a filtered list can be shared. */
export default function StoriesBrowser({ stories, featuredSlug }: { stories: StoryView[]; featuredSlug?: string }) {
  const [activity, setActivity] = useState("all");

  const activities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of stories) { const a = s.pillTags?.[0]; if (a) counts.set(a, (counts.get(a) ?? 0) + 1); }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [stories]);

  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get("activity");
    if (a && activities.some(([name]) => name === a)) setActivity(a);
  }, [activities]);

  function choose(a: string) {
    setActivity(a);
    const p = new URLSearchParams(window.location.search);
    if (a === "all") p.delete("activity"); else p.set("activity", a);
    const s = p.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  }

  // The featured story already leads the page, so "All" leaves it out; a filter still includes it
  const shown = activity === "all" ? stories.filter((s) => s.slug !== featuredSlug) : stories.filter((s) => s.pillTags?.[0] === activity);

  const chip = (key: string, label: React.ReactNode, count: number) => {
    const on = activity === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => choose(key)}
        aria-pressed={on}
        className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold transition-colors"
        style={on
          ? { background: "#ff5100", color: "#fff", border: "1px solid #ff5100" }
          : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
      >
        {label}
        <span className="text-[11px] tabular-nums" style={{ opacity: on ? 0.85 : 0.6 }}>{count}</span>
      </button>
    );
  };

  return (
    <>
      {activities.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap mb-7 lg:mb-9" role="group" aria-label="Filter stories by activity">
          {chip("all", "All stories", stories.length)}
          {activities.map(([name, count]) => chip(name, <>{ADVENTURE_TYPE_ICONS[name]?.(13)}{name}</>, count))}
        </div>
      )}

      {shown.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {shown.map((story) => <StoryCard key={story.id} story={story} />)}
        </div>
      ) : (
        <div className="rounded-2xl px-6 py-12 text-center" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-default)" }}>
          <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>No {activity.toLowerCase()} stories yet</p>
          <p className="text-sm mt-1 mb-5" style={{ color: "var(--text-tertiary)" }}>Been on one? Yours could be the first.</p>
          <Link href="/stories/submit" className="inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <PenLine className="w-4 h-4" /> Write it up
          </Link>
        </div>
      )}
    </>
  );
}
