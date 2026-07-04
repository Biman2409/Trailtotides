"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { adventures } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function WishlistSection() {
  const { saved, toggle, loading } = useWishlist();

  if (loading) return null;

  const entries = [...saved]
    .map(slug => adventures.find(a => a.slug === slug))
    .filter(Boolean) as typeof adventures;

  if (entries.length === 0) {
    return (
      <div className="rounded-xl px-4 py-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
        <Heart className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--text-muted)", opacity: 0.15 }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nothing saved yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
      {entries.map((a, i) => (
        <div
          key={a.slug}
          className="flex items-center gap-3 px-3 py-2.5 transition-colors group"
          style={i < entries.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}}
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
            <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/experiences/${a.slug}`} className="text-[12px] font-semibold hover:text-[#ff5100] transition-colors leading-snug line-clamp-1" style={{ color: "var(--text-secondary)" }}>
              {a.name}
            </Link>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{a.state} · {a.type}</p>
          </div>
          <button
            onClick={() => toggle(a.slug)}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
            style={{ color: "#f43f5e" }}
            aria-label="Remove from wishlist"
          >
            <Heart className="w-2.5 h-2.5 fill-current" />
          </button>
        </div>
      ))}
    </div>
  );
}