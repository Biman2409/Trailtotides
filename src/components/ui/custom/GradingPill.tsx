"use client";
import Link from "next/link";

export default function GradingPill() {
  return (
    <Link
      href="/ace"
      className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full border border-[#ff5100] text-[10px] font-bold text-[#ff5100] hover:bg-[#ff5100] hover:text-white transition-colors duration-150"
    >
      ?
    </Link>
  );
}
