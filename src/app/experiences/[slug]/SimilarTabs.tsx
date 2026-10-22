"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface SimilarTab {
  key: string;
  label: string;
  content: ReactNode;
}

/**
 * The page's one "what else should I look at?" block. Panels are rendered on
 * the server and handed in; this only switches between them. A link to
 * `#<key>` (e.g. the "see easier treks" hint in Is This For You?) opens that
 * tab and scrolls here.
 */
export default function SimilarTabs({ tabs }: { tabs: SimilarTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const openFromHash = () => {
      const key = window.location.hash.slice(1);
      if (!tabs.some((t) => t.key === key)) return;
      setActive(key);
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      // Drop the hash so the same link works again after switching tabs
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [tabs]);

  if (tabs.length === 0) return null;

  return (
    <section ref={ref} id="similar" className="scroll-mt-40">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mr-1">Similar Adventures</p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist">
          {tabs.map((t) => {
            const on = t.key === active;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.key)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={on
                  ? { background: "rgba(255,81,0,0.14)", color: "#ff5100", border: "1px solid rgba(255,81,0,0.3)" }
                  : { background: "transparent", color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" hidden={t.key !== active}>
          {t.content}
        </div>
      ))}
    </section>
  );
}
