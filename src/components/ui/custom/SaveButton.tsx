"use client";

import { Heart, LogIn } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SaveButtonProps {
  slug: string;
  variant?: "card" | "page";
  className?: string;
}

export default function SaveButton({ slug, variant = "card", className = "" }: SaveButtonProps) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(slug);
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loggedIn === false) {
      toast.error("Log in to save adventures.");
      return;
    }
    const wasSaved = saved;
    await toggle(slug);
    if (wasSaved) {
      toast("Removed from saved.");
    } else {
      toast.success("Adventure saved to wishlist ♥");
    }
  }

  /* ── PAGE variant ─────────────────────────────────────────── */
  if (variant === "page") {
    // Not logged in — show "Login to save" button
    if (loggedIn === false) {
      return (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white ${className}`}
        >
          <LogIn className="w-4 h-4" />
          Wishlist
        </button>
      );
    }

    return (
      <button
        onClick={handleClick}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          saved
            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
            : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
        } ${className}`}
      >
        <Heart className={`w-4 h-4 transition-all duration-200 ${saved ? "fill-rose-400" : ""}`} />
        Wishlist
      </button>
    );
  }

  /* ── CARD variant ─────────────────────────────────────────── */
  // Not logged in — show login hint icon
  if (loggedIn === false) {
    return (
      <button
        onClick={handleClick}
        aria-label="Login to save"
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 bg-black/50 text-white/50 hover:bg-black/70 hover:text-white backdrop-blur-sm ${className}`}
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }}
      >
        <Heart className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save adventure"}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
        saved
          ? "bg-rose-500/90 text-white"
          : "bg-black/50 text-white/70 hover:bg-black/70 hover:text-white"
      } backdrop-blur-sm ${className}`}
      style={{ boxShadow: saved ? "0 0 0 1px rgba(244,63,94,0.4)" : "0 0 0 1px rgba(255,255,255,0.1)" }}
    >
      <Heart className={`w-3.5 h-3.5 transition-all duration-200 ${saved ? "fill-white" : ""}`} />
    </button>
  );
}
