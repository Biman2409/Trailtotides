"use client";

import { GitCompareArrows } from "lucide-react";
import { adventures } from "@/lib/data";
import { useCompare } from "@/contexts/CompareContext";
import CompareContent from "@/components/ui/custom/CompareContent";

export default function SharedComparison({ name, by, slugs }: { name: string; by: string | null; slugs: string[] }) {
  const { clear, add, openDrawer } = useCompare();
  const list = slugs.map((s) => adventures.find((a) => a.slug === s)!).filter(Boolean);

  // Carry these into the visitor's own compare, where they can swap adventures in and out
  function openInCompare() {
    clear();
    list.forEach(add);
    openDrawer();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-2">Shared comparison</p>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">{name}</h1>
          {by && <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>Saved by {by}</p>}
        </div>
        <button onClick={openInCompare} className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-semibold text-white hover:brightness-110 transition"
          style={{ background: "#ff5100" }}>
          <GitCompareArrows className="w-4 h-4" /> Open in my compare
        </button>
      </div>
      <CompareContent fixed={list} />
    </div>
  );
}
