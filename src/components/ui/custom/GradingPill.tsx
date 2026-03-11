"use client";
import { useState } from "react";
import Link from "next/link";

export default function GradingPill() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Link
      href="/difficulty-guide"
      className="flex items-center border border-[#ff5100] rounded-full overflow-hidden transition-all duration-300"
      style={{ paddingLeft: expanded ? "10px" : "0" }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <span
        className="overflow-hidden whitespace-nowrap font-semibold text-[#ff5100] leading-none transition-all duration-300"
        style={{ maxWidth: expanded ? "170px" : "0px", fontSize: "10px" }}
      >
        How do we grade difficulty
      </span>
      <span className="flex items-center justify-center w-5 h-5 shrink-0 text-[10px] font-bold text-[#ff5100]">?</span>
    </Link>
  );
}
