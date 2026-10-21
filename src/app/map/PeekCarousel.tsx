"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { Adventure } from "@/lib/data";
import { difficultyOf, difficultyColor, priceFrom, formatINR, verifiedOperators, type Fit } from "./mapShared";

// The collapsed phone sheet: a swipeable row of what's in view. The card in the middle lights
// up its pin on the map, and tapping a card opens it. Swiping doesn't move the map, so the
// row stays put under your thumb.

const MAX = 12;

export default function PeekCarousel({ list, fits, onHover, onOpen }: {
  list: Adventure[];
  fits: Map<string, Fit | null>;
  onHover: (slug: string | null) => void;
  onOpen: (slug: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const items = list.slice(0, MAX);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function markCentre() {
    const row = rowRef.current;
    if (!row) return;
    const mid = row.scrollLeft + row.clientWidth / 2;
    let best: { slug: string; d: number } | null = null;
    for (const el of row.querySelectorAll<HTMLElement>("[data-slug]")) {
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (!best || d < best.d) best = { slug: el.dataset.slug!, d };
    }
    onHover(best?.slug ?? null);
  }

  // Light up the first card's pin as soon as the row shows; let go when it closes
  useEffect(() => {
    markCentre();
    return () => onHover(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((a) => a.slug).join()]);

  if (!items.length) return null;

  return (
    <div
      ref={rowRef}
      onScroll={() => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(markCentre, 90); }}
      className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-3.5 px-3.5 pb-1"
      aria-label="Adventures in view"
    >
      {items.map((a) => {
        const fit = fits.get(a.slug);
        const diff = difficultyOf(a);
        const price = priceFrom(a);
        const v = verifiedOperators(a).length;
        return (
          <button key={a.slug} type="button" data-slug={a.slug} onClick={() => onOpen(a.slug)}
            className="tm-peekcard snap-center shrink-0 text-left" style={{ "--c": difficultyColor(diff) } as React.CSSProperties}>
            <span className="relative w-[72px] h-full shrink-0 overflow-hidden rounded-l-[15px]">
              <Image src={a.heroImage} alt="" fill className="object-cover" sizes="72px" unoptimized />
              {fit && <span className="absolute bottom-1 left-1 text-[9.5px] font-black px-1 rounded" style={{ background: "rgba(11,13,16,0.85)", color: fit.bucket.color }}>{fit.score}</span>}
            </span>
            <span className="min-w-0 flex-1 py-2 pr-2.5 flex flex-col justify-center">
              <span className="text-[12.5px] font-semibold text-white leading-tight line-clamp-2">{a.name}</span>
              <span className="text-[10.5px] text-white/45 mt-0.5 truncate">{a.durationDays} · <b className="font-semibold" style={{ color: "var(--c)" }}>{diff}</b></span>
              <span className="flex items-center gap-2 mt-1 text-[10.5px]">
                {price !== null && <span className="text-white/50">from <b className="text-white">{formatINR(price)}</b></span>}
                {v > 0 && <span className="inline-flex items-center gap-0.5 text-[#6ff0e0]/85"><BadgeCheck className="w-3 h-3" />{v}</span>}
              </span>
            </span>
          </button>
        );
      })}
      {list.length > MAX && (
        <span className="snap-center shrink-0 w-28 grid place-items-center text-[11.5px] text-white/45 text-center">+{list.length - MAX} more<br />pull up to see all</span>
      )}
    </div>
  );
}
