"use client";
import Link from "next/link";

// Named in words: a lone "?" in a circle didn't say where it led
export default function GradingPill() {
  return (
    <Link
      href="/ace"
      className="relative after:content-[''] after:absolute after:-inset-2 inline-flex items-center h-6 px-2.5 shrink-0 rounded-full border border-[rgba(255,81,0,0.55)] text-[11.5px] font-medium text-[#ff5100] whitespace-nowrap hover:bg-[#ff5100] hover:text-white transition-colors duration-150"
    >
      How we grade
    </Link>
  );
}
