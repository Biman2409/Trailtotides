"use client";

import Image from "next/image";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare, MAX } from "@/contexts/CompareContext";
import { genreOf } from "./mapShared";

// Collects what you're weighing up from the map; opens the site's side-by-side compare.

export default function CompareTray({ onFocus }: { onFocus: (slug: string) => void }) {
  const { selected, remove, clear, openDrawer } = useCompare();
  if (!selected.length) return null;

  return (
    <div className="tm-glass rounded-2xl p-1.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {Array.from({ length: MAX }, (_, i) => {
        const a = selected[i];
        if (!a) return <span key={i} className="w-10 h-10 rounded-xl border border-dashed border-white/15 grid place-items-center text-white/20 text-[16px]">+</span>;
        return (
          <span key={a.id} className="relative w-10 h-10 group">
            <button type="button" onClick={() => onFocus(a.slug)} title={a.name} className="block w-10 h-10 rounded-xl overflow-hidden relative" style={{ boxShadow: `0 0 0 1.5px ${genreOf(a.type).color}` }}>
              <Image src={a.heroImage} alt={a.name} fill className="object-cover" sizes="40px" unoptimized />
            </button>
            <button type="button" onClick={() => remove(a.id)} aria-label={`Remove ${a.name} from compare`}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#1b1e22] border border-white/20 grid place-items-center text-white/70 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        );
      })}
      <button
        type="button"
        onClick={openDrawer}
        disabled={selected.length < 2}
        className="h-10 px-3.5 rounded-xl text-[12px] font-bold inline-flex items-center gap-1.5 transition disabled:opacity-60"
        style={{ background: selected.length >= 2 ? "linear-gradient(135deg,#ff5100,#ff7d47)" : "rgba(255,255,255,0.06)", color: "#fff" }}
        title={selected.length < 2 ? "Add one more to compare" : undefined}
      >
        <GitCompareArrows className="w-3.5 h-3.5" />
        {selected.length < 2 ? "Add 1 more" : `Compare ${selected.length}`}
      </button>
      <button type="button" onClick={clear} aria-label="Clear compare" className="w-7 h-7 rounded-lg grid place-items-center text-white/40 hover:text-white hover:bg-white/10">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
