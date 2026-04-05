"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SaveButtonProps {
  slug: string;
  /** "card" = small overlay button on image, "page" = larger button on detail page */
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
  }, []);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loggedIn === false) {
      router.push("/auth/login");
      return;
    }
    const wasSaved = saved;
    await toggle(slug);
    if (variant === "card") {
      if (wasSaved) {
        toast("Removed from saved");
      } else {
        toast.success("Adventure saved to wishlist ♥");
      }
    }
  }

  if (variant === "page") {
    return (
      <button
        onClick={handleClick}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          saved
            ? "bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25"
            : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
        } ${className}`}
      >
        <Heart className={`w-4 h-4 transition-all duration-200 ${saved ? "fill-rose-400 text-rose-400" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  // card variant — small floating button
  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
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
