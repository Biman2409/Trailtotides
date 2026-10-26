"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
const ALL_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "trail", label: "Trail" },
  { id: "safety", label: "Safety" },
  { id: "suitability", label: "Suitability" },
  { id: "book-this-adventure", label: "Book" },
  { id: "community", label: "Reviews" },
];

export default function SectionNav({ hasTrail = false }: { hasTrail?: boolean }) {
  // "Trail" only on adventures that have one mapped
  const NAV_ITEMS = hasTrail ? ALL_ITEMS : ALL_ITEMS.filter((i) => i.id !== "trail");
  const [active, setActive] = useState(NAV_ITEMS[0].id);

  useEffect(() => {
    const sections = NAV_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-140px 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [hasTrail]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calm style: plain text links, the active one marked by a thin orange rule
  return (
    <div
      className="hidden lg:block sticky top-20 z-30 backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--bg-page) 88%, transparent)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <nav className="flex items-center gap-8">
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className="relative py-4 text-[14px] whitespace-nowrap transition-colors duration-200"
                style={{ color: isActive ? "var(--text-primary)" : "var(--text-tertiary)" }}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="sectionNavRule"
                    className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-[#ff5100]"
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
