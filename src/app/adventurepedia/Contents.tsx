"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

export interface ContentsItem { id: string; title: string }

/** Which section is being read: the last heading above the upper third of the screen */
function useActive(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const update = () => {
      const line = window.innerHeight * 0.33;
      let current: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [ids]);
  return active;
}

/** The guide's sections down the side on desktop, with the one you're reading lit */
export function SideContents({ items }: { items: ContentsItem[] }) {
  const active = useActive(items.map((i) => i.id));
  return (
    <nav aria-label="In this guide">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3">In this guide</p>
      <ol className="space-y-1.5 text-[13.5px] border-l" style={{ borderColor: "var(--border-subtle)" }}>
        {items.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={on ? "location" : undefined}
                className={`block pl-3 -ml-px border-l transition-colors hover:text-[#ff5100] hover:border-[#ff5100] ${on ? "border-[#ff5100] font-semibold t-text" : "border-transparent t-text-2"}`}>
                {s.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The same list, folded, for phones and tablets */
export function InlineContents({ items }: { items: ContentsItem[] }) {
  return (
    <details className="lg:hidden mt-6 rounded-2xl group" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[14px] font-semibold t-text">
        In this guide <span className="flex items-center gap-2 text-[12.5px] font-normal t-text-3">{items.length} sections<ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" /></span>
      </summary>
      <ol className="px-4 pb-3 space-y-1">
        {items.map((s, i) => (
          <li key={s.id}><a href={`#${s.id}`} className="flex gap-2 py-1.5 text-[14px] t-text-2"><span className="t-text-3 tabular-nums w-5">{i + 1}.</span>{s.title}</a></li>
        ))}
      </ol>
    </details>
  );
}
