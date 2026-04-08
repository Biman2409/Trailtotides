"use client";

import { Heart, LogIn, GitCompareArrows, CheckCheck } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import CheckInButton from "@/components/ui/custom/CheckInButton";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Adventure } from "@/lib/data";

export default function HeroActions({ adventure }: { adventure: Adventure }) {
  const { isSaved, toggle } = useWishlist();
  const { add, remove, isSelected, isFull } = useCompare();
  const saved = isSaved(adventure.slug);
  const inCompare = isSelected(adventure.id);
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  function handleCompare() {
    if (loggedIn === false) {
      toast.error("Log in to compare adventures.");
      return;
    }
    if (inCompare) {
      remove(adventure.id);
      toast("Removed from compare");
    } else if (isFull) {
      toast.error("Remove an adventure to add another.");
    } else {
      add(adventure);
      toast.success("Added to compare");
    }
  }

  async function handleSave() {
    if (loggedIn === false) {
      toast.error("Log in to wishlist this adventure.");
      return;
    }
    const wasSaved = saved;
    await toggle(adventure.slug);
    if (wasSaved) {
      toast("Removed from wishlist");
    } else {
      toast.success("Adventure saved to wishlist ♥");
    }
  }

  const btnBase = "inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 backdrop-blur-md";

  return (
    <div className="absolute top-20 right-5 lg:right-8 z-20 flex items-center gap-2">

      {/* ── Compare (first) ── */}
      <button
        onClick={handleCompare}
        disabled={!inCompare && isFull}
        aria-label={inCompare ? "Remove from compare" : "Compare"}
        className={`${btnBase} disabled:opacity-40 disabled:cursor-not-allowed`}
        style={inCompare
          ? { background: "rgba(255,81,0,0.18)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.4)", boxShadow: "0 0 12px rgba(255,81,0,0.2)" }
          : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
        }
      >
        {inCompare
          ? <><CheckCheck className="w-3.5 h-3.5" />Added to compare</>
          : <><GitCompareArrows className="w-3.5 h-3.5" />{isFull ? "Compare full" : "Compare"}</>
        }
      </button>

      {/* ── Wishlist (second) ── */}
      <button
        onClick={handleSave}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        className={`${btnBase}`}
        style={saved
          ? { background: "rgba(255,81,0,0.18)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.4)", boxShadow: "0 0 12px rgba(255,81,0,0.2)" }
          : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
        }
      >
        {loggedIn === false
          ? <><LogIn className="w-3.5 h-3.5" />Wishlist</>
          : <><Heart className={`w-3.5 h-3.5 ${saved ? "fill-[#ff7d47]" : ""}`} />{saved ? "Wishlisted" : "Wishlist"}</>
        }
      </button>

      {/* ── Been There (third) ── */}
      <CheckInButton slug={adventure.slug} variant="page" className={btnBase} />

    </div>
  );
}
