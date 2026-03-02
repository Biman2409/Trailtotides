import type { Metadata } from "next";
import MapClient from "./MapClient";

export const metadata: Metadata = {
  title: "Adventure Map — Trail to Tides",
  description:
    "Explore every trail, summit, coast, and canyon across India on one interactive map. Filter by type, region, and difficulty.",
  openGraph: {
    title: "Adventure Map — Trail to Tides",
    description:
      "Explore every trail, summit, coast, and canyon across India on one interactive map. Filter by type, region, and difficulty.",
    url: "https://trailtotides.com/map",
    images: [{ url: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=90", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trailtotides.com/map" },
};

export default function MapPage() {
  return <MapClient />;
}
