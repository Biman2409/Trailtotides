"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

export default function HeroCTAs() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/explore");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto">
      {/* Search input */}
      <div
        className="flex items-center gap-3 w-full px-4 py-3 rounded-full"
        style={{
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.22)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <Search className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, location or type"
          className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:font-normal min-w-0"
          style={{ color: "rgba(255,255,255,0.9)", caretColor: "#ff5100" }}
        />
      </div>

      {/* Explore button */}
      <button
        type="submit"
        className="group flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: "#ff5100",
          boxShadow: "0 0 0 1px rgba(255,81,0,0.6), 0 4px 20px rgba(255,81,0,0.45)",
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,81,0,0.8), 0 6px 28px rgba(255,81,0,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,81,0,0.6), 0 4px 20px rgba(255,81,0,0.45)")}
      >
        Explore all adventures
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
