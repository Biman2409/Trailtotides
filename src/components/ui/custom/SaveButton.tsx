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
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
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
      toast("Removed from wishlist");
    } else {
      toast.success("Added to wishlist ♥");
    }
  }

  /* ── PAGE variant ─────────────────────────────────────────── */
  if (variant === "page") {
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
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${className}`}
        style={saved
          ? { background: "rgba(255,81,0,0.15)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.35)", boxShadow: "0 0 12px rgba(255,81,0,0.15)" }
          : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }
        }
      >
        <Heart className={`w-4 h-4 transition-all duration-200 ${saved ? "fill-[#ff7d47]" : ""}`} />
        Wishlist
      </button>
    );
  }

  /* ── CARD variant ─────────────────────────────────────────── */
  if (loggedIn === false) {
    return (
      <button
        onClick={handleClick}
        aria-label="Log in to save"
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-sm ${className}`}
        style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.5)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }}
      >
        <Heart className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save adventure"}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-sm ${className}`}
      style={saved
        ? { background: "rgba(255,81,0,0.9)", color: "#fff", boxShadow: "0 0 0 1px rgba(255,81,0,0.5), 0 0 10px rgba(255,81,0,0.3)" }
        : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }
      }
    >
      <Heart className={`w-3.5 h-3.5 transition-all duration-200 ${saved ? "fill-white" : ""}`} />
    </button>
  );
}
