"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { OPEN_SECTION_EVENT } from "./AccordionSection";
const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "safety", label: "Safety" },
  { id: "suitability", label: "Suitability" },
  { id: "dates", label: "Dates" },
  { id: "book-this-adventure", label: "Book" },
  { id: "community", label: "Reviews" },
  { id: "faq", label: "FAQ" },
];

// A section counts as the one being read once its top passes this line: just under the
// navbar and this menu (64px + ~45px on phones, 80px + ~53px on desktop), with a little slack
const READING_LINE_PX = 160;

export default function SectionNav({ hasFaq = false, hasDates = false }: { hasFaq?: boolean; hasDates?: boolean }) {
  // The FAQ exists only for adventures without a trek guide; Dates only when operators list start dates
  const items = NAV_ITEMS.filter((item) => (item.id !== "faq" || hasFaq) && (item.id !== "dates" || hasDates));
  const [active, setActive] = useState(items[0].id);
  const navRef = useRef<HTMLElement>(null);

  // The active item is the last section whose top has scrolled past the reading line. Measured
  // on every scroll (once per frame) rather than with an observer, so a jump straight to a
  // section, or a section opening and closing, always lands on the right item
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0].id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= READING_LINE_PX) current = id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFaq, hasDates]);

  // On phones the menu scrolls sideways: keep the active item in view
  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    const nav = navRef.current;
    if (!link || !nav || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: link.offsetLeft - nav.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  // Calm style: plain text links, the active one marked by a thin orange rule. Sticky under the
  // navbar at every size, so phones can jump to Book or Reviews without scrolling the whole page
  return (
    <div
      className="sticky top-16 z-30"
      style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <nav ref={navRef} aria-label="On this page" className="flex items-center gap-6 lg:gap-8 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0">
          {items.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                // Opens the section if it's collapsed, so jumping to it shows its details
                onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SECTION_EVENT, { detail: id }))}
                aria-current={isActive ? "true" : undefined}
                className="relative py-3 lg:py-4 text-[14px] whitespace-nowrap transition-colors duration-200"
                style={{ color: isActive ? "var(--text-primary)" : "var(--text-tertiary)" }}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="sectionNavRule"
                    className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-[#ff5100]"
                    transition={{ type: "spring", stiffness: 420, damping: 38 }}
                  />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
