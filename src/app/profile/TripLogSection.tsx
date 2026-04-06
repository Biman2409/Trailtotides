"use client";

import { useTripLog } from "@/contexts/TripLogContext";
import { adventures } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { X, MapPin, Tent, CheckCircle2 } from "lucide-react";

export default function TripLogSection() {
  const { log, unmark, loading } = useTripLog();

  const entries = log
    .map(e => ({ entry: e, adventure: adventures.find(a => a.slug === e.slug) }))
    .filter(x => x.adventure)
    .sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime());

  if (loading) return null;

  return (
    <div>
      {entries.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#fcd34d" }}>
            {entries.length} done
          </span>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex justify-center mb-3"><Tent className="w-8 h-8 text-white/20" /></div>
          <p className="text-white/40 text-sm">No adventures logged yet.</p>
          <p className="text-white/25 text-xs mt-1">Mark adventures as done from their page or card.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(({ entry, adventure: a }) => (
            <div key={entry.slug} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
                <Image src={a!.heroImage} alt={a!.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/experiences/${a!.slug}`} className="text-sm font-semibold text-white hover:text-[#ff5100] transition-colors leading-snug line-clamp-1">
                  {a!.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-white/35">
                    <MapPin className="w-2.5 h-2.5" />
                    {a!.state}
                  </span>
                  <span className="text-white/20 text-[10px]">·</span>
                  <span className="text-[10px] text-white/35">{a!.type}</span>
                </div>
                <p className="flex items-center gap-1 text-emerald-400/70 text-[10px] mt-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Done · {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => unmark(entry.slug)}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/20 hover:text-red-400"
                style={{ color: "rgba(255,255,255,0.2)" }}
                aria-label="Remove from trip log"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
