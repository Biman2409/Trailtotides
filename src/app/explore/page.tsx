import type { Metadata } from "next";
import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore Adventures — Trail to Tides",
    description:
      "Browse and filter handpicked adventures across India — trekking, biking, diving, climbing, kayaking, and more. Filter by region, difficulty, duration, and season.",
    openGraph: {
      title: "Explore Adventures — Trail to Tides",
      description:
        "Browse and filter handpicked adventures across India — trekking, biking, diving, climbing, kayaking, and more.",
    url: "https://trailtotides.com/explore",
    images: [{ url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trailtotides.com/explore" },
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111820]" />}>
      <ExploreClient />
    </Suspense>
  );
}
