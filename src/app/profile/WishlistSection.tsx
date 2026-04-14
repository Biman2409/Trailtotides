"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { adventures } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin } from "lucide-react";

export default function WishlistSection() {
  const { saved, toggle, loading } = useWishlist();

  if (loading) return null;

  const entries = [...saved]
    .map(slug => adventures.find(a => a.slug === slug))
    .filter(Boolean) as typeof adventures;

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex justify-center mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-25" style={{ background: "#f43f5e" }}>
            <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <p className="text-white/40 text-sm">Nothing saved yet.</p>
        <p className="text-white/25 text-xs mt-1">Tap the heart on any adventure to save it.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(244,63,94,0.15)", color: "#fb7185" }}>
          {entries.length} saved
        </span>
      </div>
      <div className="space-y-3">
        {entries.map(a => (
          <div key={a.slug} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
              <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/experiences/${a.slug}`} className="text-sm font-semibold text-white hover:text-[#ff5100] transition-colors leading-snug line-clamp-1">
                {a.name}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-white/35">
                  <MapPin className="w-2.5 h-2.5" />
                  {a.state}
                </span>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-[10px] text-white/35">{a.type}</span>
              </div>
            </div>
            <button
              onClick={() => toggle(a.slug)}
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/20"
              style={{ color: "#f43f5e" }}
              aria-label="Remove from wishlist"
            >
              <Heart className="w-3 h-3 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
