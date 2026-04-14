"use client";

import { useTripLog } from "@/contexts/TripLogContext";
import { adventures } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { X, Mountain } from "lucide-react";

export default function TripLogSection() {
  const { log, unmark, loading } = useTripLog();

  const entries = log
    .map(e => ({ entry: e, adventure: adventures.find(a => a.slug === e.slug) }))
    .filter(x => x.adventure)
    .sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime());

  if (loading) return null;

  if (entries.length === 0) {
    return (
      <div className="rounded-xl px-4 py-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Mountain className="w-5 h-5 mx-auto mb-2 opacity-15 text-white" />
        <p className="text-white/30 text-xs">No completed adventures yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      {entries.map(({ entry, adventure: a }, i) => (
        <div
          key={entry.slug}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] transition-colors group"
          style={i < entries.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.05)" } : {}}
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
            <Image src={a!.heroImage} alt={a!.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/experiences/${a!.slug}`} className="text-[12px] font-semibold text-white/80 hover:text-[#ff5100] transition-colors leading-snug line-clamp-1">
              {a!.name}
            </Link>
            <p className="text-[10px] text-white/30 mt-0.5 truncate">{a!.state} · {a!.type}</p>
          </div>
          <button
            onClick={() => unmark(entry.slug)}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-400"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
