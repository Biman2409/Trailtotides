"use client";

import { Heart, LogIn, GitCompareArrows, CheckCheck } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
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

  async function handleSave() {
    if (loggedIn === false) {
      toast("Login to save this adventure", {
        description: "Create a free account to build your wishlist.",
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
      return;
    }
    const wasSaved = saved;
    await toggle(adventure.slug);
    if (wasSaved) {
      toast("Removed from saved adventures");
    } else {
      toast.success("Adventure saved!", { description: "Find it anytime in your wishlist." });
    }
  }

  function handleCompare() {
    if (inCompare) {
      remove(adventure.id);
    } else if (!isFull) {
      add(adventure);
      toast("Added to compare", { description: "Open the compare panel to see side-by-side." });
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2.5">

      {/* ── Save ── */}
      {loggedIn === false ? (
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all duration-200 bg-white/6 text-white/55 border border-white/12 hover:bg-white/10 hover:text-white"
        >
          <LogIn className="w-4 h-4" />
          Login to save
        </button>
      ) : (
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            saved
              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/22"
              : "bg-white/6 text-white/60 border border-white/12 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Heart className={`w-4 h-4 transition-all ${saved ? "fill-rose-400 text-rose-400" : ""}`} />
          {saved ? "Adventure saved" : "Save adventure"}
        </button>
      )}

      {/* ── Compare ── */}
      <button
        onClick={handleCompare}
        disabled={!inCompare && isFull}
        className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
          inCompare
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/22"
            : "bg-white/6 text-white/60 border border-white/12 hover:bg-white/10 hover:text-white"
        }`}
      >
        {inCompare
          ? <><CheckCheck className="w-4 h-4" /> Added to compare</>
          : <><GitCompareArrows className="w-4 h-4" /> {isFull ? "Compare full" : "Compare"}</>
        }
      </button>

    </div>
  );
}
