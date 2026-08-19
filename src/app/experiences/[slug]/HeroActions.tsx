"use client";

import { Heart, LogIn, GitCompareArrows, CheckCheck, Share2, Check } from "lucide-react";
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
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  function handleCompare() {
    if (loggedIn === false) {
      toast.error("Log in to compare adventures.", {
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
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
      toast.error("Log in to wishlist this adventure.", {
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
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

  async function handleShare() {
    const url = `https://trailtotides.com/experiences/${adventure.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: adventure.name, text: adventure.tagline, url });
      } catch {
        // user cancelled the native share sheet — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setShared(false), 2000);
    } catch {
      toast.error("Couldn't copy link — copy it from the address bar instead.");
    }
  }

  const btnBase = "inline-flex items-center gap-0 sm:gap-2 h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 backdrop-blur-md";

  return (
    <div className="absolute top-20 right-5 lg:right-8 z-20 flex items-center gap-1.5 sm:gap-2">

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
          ? <><CheckCheck className="w-3.5 h-3.5" /><span className="hidden sm:inline">Added to compare</span></>
          : <><GitCompareArrows className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isFull ? "Compare full" : "Compare"}</span></>
        }
      </button>

      {/* ── Share (second) ── */}
      <button
        onClick={handleShare}
        aria-label="Share this adventure"
        className={btnBase}
        style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        {shared
          ? <><Check className="w-3.5 h-3.5" /><span className="hidden sm:inline">Copied</span></>
          : <><Share2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Share</span></>
        }
      </button>

      {/* ── Save / Wishlist (third) — grouped next to "Mark as done" so the two
           personal-tracking actions (save for later / log as completed) sit
           together for quick access ── */}
      <button
        onClick={handleSave}
        aria-label={saved ? "Remove from saved" : "Save this adventure"}
        className={`${btnBase}`}
        style={saved
          ? { background: "rgba(255,81,0,0.18)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.4)", boxShadow: "0 0 12px rgba(255,81,0,0.2)" }
          : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
        }
      >
        {loggedIn === false
          ? <><LogIn className="w-3.5 h-3.5" /><span className="hidden sm:inline">Save</span></>
          : <><Heart className={`w-3.5 h-3.5 ${saved ? "fill-[#ff7d47]" : ""}`} /><span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span></>
        }
      </button>

      {/* ── Been There (fourth) ── */}
      <CheckInButton slug={adventure.slug} variant="page" className={btnBase} />

    </div>
  );
}
