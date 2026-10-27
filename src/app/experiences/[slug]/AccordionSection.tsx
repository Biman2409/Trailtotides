"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  /** Small-caps line above the title */
  label?: string;
  defaultOpen?: boolean;
  /** Overrides defaultOpen below the lg breakpoint, for sections too heavy to open on load on a phone. */
  mobileDefaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
  /** A small control beside the title (e.g. an info link) */
  headerExtra?: React.ReactNode;
  /** A glimpse of the content shown only while collapsed; tapping it opens the section */
  peek?: React.ReactNode;
}

/**
 * A chapter of the adventure page in the calm "trail" style: no box, a light
 * serif title, and a dot that sits on the orange trail line running down the
 * left of the main column (drawn by the page). The dot is filled while the
 * section is open and hollow when it's collapsed.
 */
export default function AccordionSection({ title, label, defaultOpen = false, mobileDefaultOpen, children, id, headerExtra, peek }: Props) {
  const [open, setOpen] = useState(mobileDefaultOpen ?? defaultOpen);
  const sectionRef = useRef<HTMLElement>(null);

  // mobileDefaultOpen renders collapsed first (SSR-safe, no hydration mismatch),
  // then desktop viewports promote to defaultOpen once mounted
  useEffect(() => {
    if (mobileDefaultOpen === undefined) return;
    if (window.innerWidth >= 1024) setOpen(defaultOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      // Bring a freshly opened section into view below the sticky bars
      if (next) requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return next;
    });
  }

  return (
    <section ref={sectionRef} id={id} className="pt-5 first:pt-0 scroll-mt-32">
      <div className="relative flex items-start gap-4">
        {/* The section's stop on the trail line, level with the label */}
        <span
          aria-hidden
          className="absolute top-[0.2rem] -left-[29.5px] sm:-left-[33.5px] w-[11px] h-[11px] rounded-full transition-colors duration-300"
          style={{
            background: open ? "#ff5100" : "var(--bg-page)",
            border: "1.5px solid #ff5100",
            boxShadow: "0 0 0 4px var(--bg-page)",
          }}
        />
        <button onClick={toggle} aria-expanded={open} className="flex-1 min-w-0 text-left group">
          {label && (
            <p className="text-[12px] tracking-[0.12em] lowercase mb-0.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>
              {label}
            </p>
          )}
          <h2 className="text-[19px] sm:text-[21px] leading-[1.15] !font-normal tracking-[-0.01em] !text-[#ff5100] group-hover:opacity-80 transition-opacity">
            {title}
          </h2>
        </button>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          {headerExtra}
          <button
            onClick={toggle}
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {peek && !open && (
        <button type="button" onClick={toggle} aria-label={`Expand ${title}`} className="block w-full text-left">{peek}</button>
      )}

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="pt-2.5">{children}</div>
        </div>
      </div>
    </section>
  );
}
