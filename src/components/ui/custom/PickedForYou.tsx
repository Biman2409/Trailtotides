"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import AdventureRail, { type RailItem } from "./AdventureRail";
import SectionTexture from "./SectionTexture";
import { adventures } from "@/lib/data";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { useWishlist } from "@/contexts/WishlistContext";
import { currentMonthIndexIST, pickedForProfile, similarToSaved } from "@/lib/homeCuration";

type Mode = { kind: "profile"; items: RailItem[] } | { kind: "saved"; items: RailItem[] } | null;

/**
 * Returning visitors get a personal row: best fitness matches if they've taken the Matchmaker,
 * otherwise adventures like the ones they've saved. First-time visitors see nothing.
 * Both signals live in the browser, so this renders after mount.
 */
export default function PickedForYou() {
  const { saved } = useWishlist();
  const { ace } = useFitnessProfile(); // completed trips included
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    const month = currentMonthIndexIST();
    if (ace) {
      setMode({ kind: "profile", items: pickedForProfile(adventures, ace, month).map((adventure) => ({ adventure })) });
      return;
    }
    const similar = similarToSaved(adventures, saved);
    setMode(similar.length > 0 ? { kind: "saved", items: similar.map((adventure) => ({ adventure })) } : null);
  }, [saved, ace]);

  if (!mode) return null;

  // Orange contours pooled top-left, so it reads apart from the teal waves of "In season" right below
  const backdrop = <SectionTexture kind="trail" color="#ff5100" at="8% 20%" opacity={0.1} />;

  return mode.kind === "profile" ? (
    <AdventureRail
      id="picked-for-you"
      className="t-bg-page animate-in fade-in duration-500"
      backdrop={backdrop}
      eyebrow={<><Sparkles className="w-3.5 h-3.5" /> Picked for you</>}
      title="Your best fitness matches"
      subtitle="Ranked by how well each adventure fits your Matchmaker profile."
      action={{ href: "/explore?ace=ready", label: "See all matches" }}
      items={mode.items}
    />
  ) : (
    <AdventureRail
      id="picked-for-you"
      className="t-bg-page animate-in fade-in duration-500"
      backdrop={backdrop}
      eyebrow={<><Sparkles className="w-3.5 h-3.5" /> Picked for you</>}
      title="More like what you've saved"
      subtitle="Similar activities, places and difficulty to your wishlist."
      action={{ href: "/profile", label: "Your wishlist" }}
      items={mode.items}
    />
  );
}
