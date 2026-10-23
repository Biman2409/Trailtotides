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
      {/* Calm style: a light serif heading, tabs as text with an orange rule under the active one */}
      <div className="flex items-end justify-between gap-x-6 gap-y-3 mb-5 flex-wrap" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h2 className="text-[21px] sm:text-[23px] !font-normal tracking-[-0.01em] pb-3">Similar adventures</h2>
        <div className="flex gap-6 overflow-x-auto no-scrollbar" role="tablist">
          {tabs.map((t) => {
            const on = t.key === active;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.key)}
                className="relative shrink-0 pb-3 text-[14px] transition-colors"
                style={{ color: on ? "var(--text-primary)" : "var(--text-tertiary)" }}
              >
                {t.label}
                {on && <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-[#ff5100]" />}
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
