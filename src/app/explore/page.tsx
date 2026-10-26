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
    url: "https://www.trailtotides.com/explore",
    images: [{ url: "https://www.trailtotides.com/opengraph-image", width: 1200, height: 630, alt: "Explore Adventures — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Adventures — Trail to Tides",
    description: "Browse and filter handpicked adventures across India — trekking, biking, climbing, kayaking, and more.",
    images: ["https://www.trailtotides.com/opengraph-image"],
  },
  alternates: { canonical: "https://www.trailtotides.com/explore" },
};

export default function ExplorePage() {
  return (
    // The page reads its filters from the address, so it draws in the browser. The fallback is
    // what crawlers get in the HTML: the same heading the page shows, until it takes over.
    <Suspense fallback={
      <div className="min-h-screen">
        <h1 className="sr-only">Find your next adventure</h1>
        <p className="sr-only">Browse treks, bike trips, rafting and more across India and Nepal, filtered by type, region, difficulty, season, duration and price.</p>
      </div>
    }>
      <ExploreClient />
    </Suspense>
  );
}
