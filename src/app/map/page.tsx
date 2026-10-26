import type { Metadata } from "next";
import MapClient from "./MapClient";
import { TRAIL_SLUGS } from "@/lib/trails";

export const metadata: Metadata = {
  title: "Adventure Map",
  description:
    "Explore every trail, summit, coast, and canyon across India on one interactive map. Filter by type, region, and difficulty.",
  openGraph: {
    title: "Adventure Map — Trail to Tides",
    description:
      "Explore every trail, summit, coast, and canyon across India on one interactive map. Filter by type, region, and difficulty.",
    url: "https://www.trailtotides.com/map",
    images: [{ url: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=90", width: 1200, height: 630, alt: "Adventure Map — Trail to Tides" }],
  },
  alternates: { canonical: "https://www.trailtotides.com/map" },
};

export default function MapPage() {
  return (
    <>
      {/* The map is the page; this names it for screen readers and search */}
      <h1 className="sr-only">Adventure map of India and Nepal</h1>
      <MapClient trailSlugs={TRAIL_SLUGS} />
    </>
  );
}
