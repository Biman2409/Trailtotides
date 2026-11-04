"use client";

import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { adventures, type Adventure } from "@/lib/data";
import AdventureCard from "./AdventureCard";
import { FadeUp } from "./HomeAnimations";

// The home page's Editor's Choice: the editors' six, nothing else. (Fitness matches have their
// own place in the Adventure Matchmaker and on Explore.)

export default function EditorsPicks({ slugs, editorCount }: { slugs: string[]; editorCount: number }) {
  const editors = slugs.map((s) => adventures.find((a) => a.slug === s)).filter(Boolean) as Adventure[];
  const seeAll = { href: "/explore?editor=1", label: `See all ${editorCount} picks` };

  return (
    <>
      <FadeUp>
        <div className="flex items-end justify-between gap-4 mb-3 lg:mb-5">
          <div className="min-w-0">
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 flex items-center gap-1.5 uppercase">
              <Crown className="w-3.5 h-3.5 fill-[#ff5100]" />
              Editor&apos;s Choice
            </p>
            <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">Adventures of a Lifetime</h2>
          </div>
          <Link
            href={seeAll.href}
            className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100] hover:text-[#ff7d47] transition-colors mb-1 shrink-0"
          >
            {seeAll.label}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </FadeUp>

      {/* Phones swipe through the picks sideways; wider screens get the feature grid */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-5 px-5 scroll-px-5 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
        {editors.map((adventure, i) => (
          // The 2-column tablet grid fits the feature and four more; the sixth waits for the 3-column grid
          <div key={adventure.id} className={`snap-start shrink-0 w-[78vw] sm:w-auto ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""} ${i === 5 ? "sm:hidden lg:block" : ""}`}>
            {/* The section is already titled — no per-card badge. The feature card is large only in
                the grid (CSS); in the phone swipe row it matches the rest. The others use wide photos
                so two rows fit on one screen beside the feature. */}
            {i === 0 ? (
              <AdventureCard adventure={adventure} badge={false} fill size="large" />
            ) : (
              <AdventureCard adventure={adventure} badge={false} size="large" />
            )}
          </div>
        ))}
      </div>

      <div className="sm:hidden mt-3">
        <Link href={seeAll.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100]">
          {seeAll.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
