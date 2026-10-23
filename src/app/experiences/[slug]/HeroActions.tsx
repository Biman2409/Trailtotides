"use client";

import { Heart, GitCompareArrows, CheckCheck, Share2, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import CheckInButton from "@/components/ui/custom/CheckInButton";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Adventure } from "@/lib/data";
import { EMAIL_ALERTS } from "@/lib/features";

// These buttons sit just under the fixed navbar, so their labels open below
// them; opening upward (the default) put them behind the navbar
const TIP_BELOW = { side: "bottom", sideOffset: 6 } as const;

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

  // Compare is open to everyone; only the wishlist needs an account
  function handleCompare() {
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
        action: { label: "Log in", onClick: () => router.push(`/auth/login?next=${encodeURIComponent(`/experiences/${adventure.slug}`)}`) },
      });
      return;
    }
    const wasSaved = saved;
    await toggle(adventure.slug);
    if (wasSaved) {
      toast("Removed from wishlist");
    } else {
      toast.success("Added to your wishlist", EMAIL_ALERTS ? { description: "We'll email you when its season opens or the price drops." } : undefined);
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

  const btnBase = "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 backdrop-blur-md";

  return (
    <div className="absolute top-20 right-5 lg:right-8 z-20 flex items-center gap-1.5 sm:gap-2">

      {/* ── Wishlist (first) — the most-used action ── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleSave}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            className={btnBase}
            style={saved
              ? { background: "rgba(255,81,0,0.18)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.4)", boxShadow: "0 0 12px rgba(255,81,0,0.2)" }
              : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
            }
          >
            {/* Always a heart, so it reads as the wishlist; logged-out visitors
                get the log-in prompt when they tap it */}
            <Heart className={`w-4 h-4 ${saved ? "fill-[#ff7d47]" : ""}`} />
          </button>
        </TooltipTrigger>
        <TooltipContent {...TIP_BELOW}>{saved ? "In your wishlist" : "Add to wishlist"}</TooltipContent>
      </Tooltip>

      {/* ── Compare (second) — evaluate against other adventures ── */}
      <Tooltip>
        <TooltipTrigger asChild>
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
            {inCompare ? <CheckCheck className="w-4 h-4" /> : <GitCompareArrows className="w-4 h-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent {...TIP_BELOW}>{inCompare ? "Added to compare" : isFull ? "Compare full" : "Compare"}</TooltipContent>
      </Tooltip>

      {/* ── Mark as done (third) — beside Wishlist and Compare, the personal actions ── */}
      <CheckInButton slug={adventure.slug} variant="page" className={btnBase} />

      {/* ── Share (last) — the outward action, at the edge ── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleShare}
            aria-label="Share this adventure"
            className={btnBase}
            style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent {...TIP_BELOW}>{shared ? "Copied" : "Share"}</TooltipContent>
      </Tooltip>

    </div>
  );
}
