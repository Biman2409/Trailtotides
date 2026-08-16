"use client";

import { useEffect, useState } from "react";
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
      style={{ background: "rgba(8,12,20,0.82)" }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`flex items-center gap-1.5 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 border-b-2 ${
                  isActive ? "" : "text-white/50 border-transparent hover:text-white/80"
                }`}
                style={isActive ? { color: "#ff7d47", borderColor: "#ff5100" } : undefined}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
