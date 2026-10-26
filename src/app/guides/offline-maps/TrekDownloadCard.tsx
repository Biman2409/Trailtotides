"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";

/** Opened from a trek page (?trek=slug): that trek's download, right at the top of the guide */
export default function TrekDownloadCard({ treks }: { treks: Record<string, string> }) {
  const slug = useSearchParams().get("trek");
  const name = slug ? treks[slug] : null;
  if (!slug || !name) return null;
  return (
    <div className="mt-6 rounded-xl p-4 sm:p-5 flex flex-wrap items-center gap-3" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.22)" }}>
      <div className="flex-1 min-w-[200px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ff5100]">Your trail</p>
        <p className="text-[16px] font-semibold t-text">{name}</p>
        <Link href={`/experiences/${slug}#trail`} className="inline-flex items-center gap-1 text-[13px] t-text-3 hover:text-[#ff5100] mt-0.5"><ArrowLeft className="w-3.5 h-3.5" />Back to the trek</Link>
      </div>
      <a href={`/experiences/${slug}/trail.gpx`} download className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[14px] font-bold text-white bg-[#ff5100] hover:bg-[#ff6a1f]">
        <Download className="w-4 h-4" />Download trail (GPX)
      </a>
    </div>
  );
}
