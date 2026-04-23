"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroCTAs() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link
        href="/explore"
        className="group flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: "#ff5100",
          boxShadow: "0 0 0 1px rgba(255,81,0,0.6), 0 4px 20px rgba(255,81,0,0.45)",
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,81,0,0.8), 0 6px 28px rgba(255,81,0,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,81,0,0.6), 0 4px 20px rgba(255,81,0,0.45)")}
      >
        Show me what&apos;s out there
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <Link
        href="#ai-finder"
        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: "rgba(255,255,255,0.08)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.32), inset 0 1px 0 rgba(255,255,255,0.15)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.1)")}
      >
        Not sure where to start?
      </Link>
    </div>
  );
}
