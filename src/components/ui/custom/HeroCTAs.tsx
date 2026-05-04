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
    <form onSubmit={handleSearch} className="flex items-stretch gap-2 w-full">
      {/* Search input */}
      <div
        className="flex items-center gap-2.5 flex-1 px-4 py-3 rounded-xl min-w-0"
        style={{
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.22)",
          backdropFilter: "blur(16px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <Search className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search adventures"
          className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:font-normal min-w-0"
          style={{ color: "rgba(255,255,255,0.9)", caretColor: "#ff5100" }}
        />
      </div>

      {/* Explore button */}
      <button
        type="submit"
        className="group flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
        style={{
          background: "#ff5100",
          boxShadow: "0 0 0 1px rgba(255,81,0,0.6), 0 4px 20px rgba(255,81,0,0.45)",
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,81,0,0.8), 0 6px 28px rgba(255,81,0,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,81,0,0.6), 0 4px 20px rgba(255,81,0,0.45)")}
      >
        Explore all
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </form>
  );
}
