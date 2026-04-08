import type { Metadata } from "next";
import PlannerClient from "./PlannerClient";

export const metadata: Metadata = {
  title: "Adventure Trip Planner",
  description: "Plan your next adventure across India. Build a personalised itinerary, browse by season, compare routes, and organise your trips — all in one place.",
  openGraph: {
    title: "Adventure Trip Planner — Trail to Tides",
    description: "Build your perfect adventure itinerary across India — season-aware planning, route comparison, and expert-curated options.",
    url: "https://trailtotides.com/planner",
    images: [{ url: "https://trailtotides.com/opengraph-image", width: 1200, height: 630, alt: "Adventure Trip Planner — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adventure Trip Planner — Trail to Tides",
    description: "Build your perfect adventure itinerary across India.",
  },
  alternates: { canonical: "https://trailtotides.com/planner" },
};

export default function PlannerPage() {
  return <PlannerClient />;
}
