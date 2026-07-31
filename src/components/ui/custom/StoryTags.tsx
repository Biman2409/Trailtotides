"use client";

import { useEffect, useState } from "react";
import { Crown, Mountain, MapPin } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

export type TagSize = "sm" | "md";

const SIZE = {
  sm: { text: "text-[10px]", pad: "px-2.5 py-1", gap: "gap-1", icon: 10, iconCls: "w-2.5 h-2.5" },
  md: { text: "text-xs", pad: "px-3 py-1.5", gap: "gap-1.5", icon: 12, iconCls: "w-3 h-3" },
} as const;

/**
 * Shared visual language for story tags/badges — keep every story surface
 * (grid cards, the featured hero, the detail-page hero) rendering these
 * through this file so the look stays uniform if it ever changes.
 */

export function FeaturedBadge({ size = "md" }: { size?: TagSize }) {
  const s = SIZE[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${s.pad} rounded-full ${s.text} font-bold bg-black text-[#ff5100] border border-[#ff5100]/30 shadow-sm`}>
      <Crown className={s.iconCls} />
      Featured
    </span>
  );
}

export function TTTOriginalBadge({ size = "md" }: { size?: TagSize }) {
  const s = SIZE[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${s.pad} rounded-full ${s.text} font-bold bg-[#ff5100] text-black border border-[#ff5100]/30 shadow-sm`}>
      <Mountain className={s.iconCls} />
      TTT Original
    </span>
  );
}

export function GenreTag({ tag, size = "md" }: { tag: string; size?: TagSize }) {
  const s = SIZE[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${s.pad} rounded-full ${s.text} font-bold bg-[#ff5100] text-white`}>
      {ADVENTURE_TYPE_ICONS[tag]?.(s.icon)}
      {tag}
    </span>
  );
}

/** Solid pill matching GenreTag — for rows where region sits beside a genre tag. */
export function RegionTag({ region, size = "md" }: { region: string; size?: TagSize }) {
  const s = SIZE[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${s.pad} rounded-full ${s.text} font-bold bg-[#ff5100] text-white`}>
      <MapPin className={s.iconCls} />
      {region}
    </span>
  );
}

/** Cross-fades between tags in a single slot instead of showing them side by side — for tight spaces. */
export function RotatingTag({ items, intervalMs = 2600 }: { items: { key: string; node: React.ReactNode }[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;

  return (
    <div className="grid">
      {items.map((item, i) => (
        <div
          key={item.key}
          className="col-start-1 row-start-1 transition-all duration-500 ease-out"
          style={{
            opacity: i === index ? 1 : 0,
            transform: i === index ? "translateY(0)" : "translateY(-6px)",
            pointerEvents: i === index ? "auto" : "none",
          }}
        >
          {item.node}
        </div>
      ))}
    </div>
  );
}

/** Convenience wrapper: rotates through genre tag(s) + region in one slot. */
export function GenreRegionRotator({ genres, region, size = "sm" }: { genres: string[]; region: string; size?: TagSize }) {
  const items = [
    ...genres.map((tag) => ({ key: `genre-${tag}`, node: <GenreTag tag={tag} size={size} /> })),
    { key: "region", node: <RegionTag region={region} size={size} /> },
  ];
  return <RotatingTag items={items} />;
}

/** Rotates through every tag — Featured/TTT Original badges, genre(s), and region — in one slot. */
export function AllTagsRotator({
  featured,
  tttOriginal,
  genres,
  region,
  size = "md",
}: {
  featured?: boolean;
  tttOriginal?: boolean;
  genres: string[];
  region: string;
  size?: TagSize;
}) {
  const items: { key: string; node: React.ReactNode }[] = [];
  if (featured) items.push({ key: "featured", node: <FeaturedBadge size={size} /> });
  if (tttOriginal) items.push({ key: "ttt-original", node: <TTTOriginalBadge size={size} /> });
  genres.forEach((tag) => items.push({ key: `genre-${tag}`, node: <GenreTag tag={tag} size={size} /> }));
  items.push({ key: "region", node: <RegionTag region={region} size={size} /> });
  return <RotatingTag items={items} />;
}
