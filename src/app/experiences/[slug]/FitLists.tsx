"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const SHOWN = 3;

/** "For you if" / "Skip it if": the first few of each, the rest a tap away */
export default function FitLists({ whoFor, whoNot, easier }: { whoFor: string; whoNot: string; easier?: { href: string; label: string } }) {
  const [all, setAll] = useState(false);
  const lists = [
    { heading: "for you if", items: split(whoFor), mark: "✓", markColor: "#3fa877" },
    { heading: "skip it if", items: split(whoNot), mark: "✕", markColor: "#d4675a" },
  ];
  const more = Math.max(...lists.map((l) => l.items.length)) > SHOWN;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {lists.map(({ heading, items, mark, markColor }) => (
          <div key={heading}>
            <h3 className="text-[13px] tracking-[0.1em] !font-normal mb-2" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>{heading}</h3>
            <ul className="space-y-1">
              {(all ? items : items.slice(0, SHOWN)).map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="shrink-0 text-[12px] leading-[1.75]" style={{ color: markColor }} aria-hidden>{mark}</span>
                  <span className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-[13px]">
        {more && (
          <button type="button" onClick={() => setAll((a) => !a)} aria-expanded={all} className="inline-flex items-center gap-1 font-semibold" style={{ color: "var(--accent-ink)" }}>
            {all ? "Show fewer" : "Show all"} <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: all ? "rotate(180deg)" : undefined }} />
          </button>
        )}
        {easier && (
          <a href={easier.href} className="inline-flex items-center gap-1.5 hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
            {easier.label} <ArrowRight className="w-3.5 h-3.5 rotate-90" />
          </a>
        )}
      </div>
    </div>
  );
}

function split(s: string): string[] {
  return s.split("·").map((t) => t.trim()).filter(Boolean).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
}
