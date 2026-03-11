"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function GradingPill() {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  return (
    <div ref={ref} className="flex items-center">
      <div
        className="overflow-hidden transition-all duration-300 flex items-center"
        style={{ maxWidth: expanded ? "190px" : "0px", paddingLeft: expanded ? "10px" : "0" }}
      >
        <Link
          href="/ert"
          className="whitespace-nowrap font-semibold text-[#ff5100] leading-none hover:underline"
          style={{ fontSize: "10px" }}
        >
          How do we grade difficulty
        </Link>
      </div>
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full border border-[#ff5100] text-[10px] font-bold text-[#ff5100] hover:bg-[#ff5100] hover:text-white transition-colors duration-150"
      >
        ?
      </button>
    </div>
  );
}
