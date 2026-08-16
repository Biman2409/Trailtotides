"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Ticket, ShieldCheck, ShieldAlert, MessagesSquare } from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "suitability", label: "Suitability", icon: ShieldCheck },
  { id: "safety", label: "Safety", icon: ShieldAlert },
  { id: "book-this-adventure", label: "Book", icon: Ticket },
  { id: "community", label: "Reviews", icon: MessagesSquare },
];

export default function SectionNav() {
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
  }, []);

  return (
    <div
      className="hidden lg:block sticky top-20 z-30 backdrop-blur-xl"
      style={{ background: "rgba(8,12,20,0.82)", boxShadow: "0 1px 0 rgba(255,255,255,0.06), 0 12px 24px -16px rgba(0,0,0,0.5)" }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <nav className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/45 hover:text-white/75"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sectionNavPill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)", boxShadow: "0 4px 18px rgba(255,81,0,0.4)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 shrink-0 relative z-10" />
                <span className="relative z-10">{label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
