// Trek trails built from OpenStreetMap by scripts/build-trail.mjs. One JSON file per trek; add
// it to TRAILS below once it has been checked on a map. The data is OpenStreetMap's (ODbL), so
// anything that shows a trail must credit "© OpenStreetMap contributors".
// Server only: importing this bundles every trail. Browser code uses ./shared and fetches one
// trail at a time from /trails/<slug>.json.

import type { Trail } from "./shared";
import everestBaseCamp from "./everest-base-camp.json";

export * from "./shared";

const TRAILS: Record<string, Trail> = {
  "everest-base-camp": everestBaseCamp as Trail,
};

export const TRAIL_SLUGS = Object.keys(TRAILS);

export function getTrail(slug: string): Trail | null {
  return TRAILS[slug] ?? null;
}
