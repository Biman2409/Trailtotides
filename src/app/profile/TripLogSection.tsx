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
      <div className="rounded-xl px-4 py-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
        <Mountain className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--text-muted)", opacity: 0.15 }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No completed adventures yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
      {entries.map(({ entry, adventure: a }, i) => (
        <div
          key={entry.slug}
          className="flex items-center gap-3 px-3 py-2.5 transition-colors group"
          style={i < entries.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}}
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
            <Image src={a!.heroImage} alt={a!.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/experiences/${a!.slug}`} className="text-[12px] font-semibold hover:text-[#ff5100] transition-colors leading-snug line-clamp-1" style={{ color: "var(--text-secondary)" }}>
              {a!.name}
            </Link>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{a!.state} · {a!.type}</p>
          </div>
          <button
            onClick={() => unmark(entry.slug)}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-400"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}