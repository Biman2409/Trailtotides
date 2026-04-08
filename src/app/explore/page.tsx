import type { Metadata } from "next";
import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore Adventures",
  description:
    "Browse and filter handpicked adventures across India — trekking, biking, climbing, kayaking, and more. Filter by region, difficulty, duration, and season.",
  openGraph: {
    title: "Explore Adventures — Trail to Tides",
    description:
      "Browse and filter handpicked adventures across India — trekking, biking, climbing, kayaking, and more.",
    url: "https://trailtotides.com/explore",
    images: [{ url: "https://trailtotides.com/og-image.jpg", width: 1200, height: 630, alt: "Explore Adventures — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Adventures — Trail to Tides",
    description: "Browse and filter handpicked adventures across India — trekking, biking, climbing, kayaking, and more.",
    images: ["https://trailtotides.com/og-image.jpg"],
  },
  alternates: { canonical: "https://trailtotides.com/explore" },
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ExploreClient />
    </Suspense>
  );
}
