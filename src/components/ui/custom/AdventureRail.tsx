"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import AdventureCard from "./AdventureCard";
import type { Adventure } from "@/lib/data";

export interface RailItem {
  adventure: Adventure;
  /** Short note shown above the card (replaces the Editor's Choice slot). */
  note?: ReactNode;
}

interface AdventureRailProps {
  id?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: { href: string; label: string };
  items: RailItem[];
  className?: string;
  /** Decorative layer behind the row (e.g. a SectionTexture) */
  backdrop?: ReactNode;
}

/** A horizontally scrolling row of adventure cards — used for the curated home-page rows. */
export default function AdventureRail({ id, eyebrow, title, subtitle, action, items, className = "", backdrop }: AdventureRailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const hasNotes = items.some((i) => i.note);

  function scrollBy(dir: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section id={id} className={`relative overflow-hidden py-6 lg:py-10 ${className}`}>
      {backdrop}
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-3 lg:mb-4">
          <div className="min-w-0">
            <div className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 uppercase flex items-center gap-1.5">{eyebrow}</div>
            <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">{title}</h2>
            {subtitle && <p className="text-sm sm:text-base mt-2 max-w-xl" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {action && (
              <Link
                href={action.href}
                className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100] hover:text-[#ff7d47] transition-colors mr-2"
              >
                {action.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            {items.length > 3 && (
              <>
                <button
                  onClick={() => scrollBy(-1)}
                  aria-label="Scroll left"
                  className="hidden lg:flex w-9 h-9 rounded-full items-center justify-center transition-colors hover:bg-[var(--bg-card-hover)]"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollBy(1)}
                  aria-label="Scroll right"
                  className="hidden lg:flex w-9 h-9 rounded-full items-center justify-center transition-colors hover:bg-[var(--bg-card-hover)]"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroller: full-bleed on mobile, aligned to the content column on desktop */}
      <div
        ref={scroller}
        className="relative flex gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar px-5 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] pb-2 scroll-px-5 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {items.map(({ adventure, note }) => (
          <div key={adventure.id} className="snap-start shrink-0 w-[78vw] sm:w-[320px] lg:w-[340px]">
            <AdventureCard adventure={adventure} badge={hasNotes ? (note ?? null) : false} />
          </div>
        ))}
      </div>

      {action && (
        <div className="sm:hidden px-5 mt-4">
          <Link href={action.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100]">
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
