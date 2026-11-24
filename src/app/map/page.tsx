import type { Metadata } from "next";
import { preconnect, preload } from "react-dom";
import MapClient from "./MapClient";
import { TRAIL_SLUGS } from "@/lib/trails";
import { LEAFLET_CSS, CLUSTER_CSS, LEAFLET_JS, CLUSTER_JS, MAPLIBRE_CSS, MAPLIBRE_JS, BRIDGE_JS, DARK_STYLE, PLANET_TILEJSON } from "./mapAssets";

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
  // The map loads in a chain (Leaflet, then its clusters, then MapLibre, its bridge, the style and
  // the tile index), each step waiting on the last. Asking for every file up front lets them all
  // download at once; the loaders then find them already here.
  for (const href of [LEAFLET_CSS, CLUSTER_CSS, MAPLIBRE_CSS]) preload(href, { as: "style" });
  for (const href of [LEAFLET_JS, CLUSTER_JS, MAPLIBRE_JS, BRIDGE_JS]) preload(href, { as: "script" });
  // MapLibre fetches these itself (cross-origin, without credentials)
  for (const href of [DARK_STYLE, PLANET_TILEJSON]) preload(href, { as: "fetch", crossOrigin: "anonymous" });
  // Tiles, fonts and the relief come from these two hosts once the style is read
  preconnect("https://tiles.openfreemap.org", { crossOrigin: "anonymous" });
  preconnect("https://s3.amazonaws.com", { crossOrigin: "anonymous" });
  return (
    <>
      {/* The map is the page; this names it for screen readers and search */}
      <h1 className="sr-only">Adventure map of India and Nepal</h1>
      <MapClient trailSlugs={TRAIL_SLUGS} />
    </>
  );
}
