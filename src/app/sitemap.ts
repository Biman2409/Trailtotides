import type { MetadataRoute } from "next";
import { adventures } from "@/lib/data";
import { getPublishedStories } from "@/lib/stories";
import { DESTINATIONS } from "@/lib/destinations";

const BASE = "https://www.trailtotides.com";
// Images served from /public need the full address in a sitemap
const abs = (url: string) => (url.startsWith("/") ? `${BASE}${url}` : url);

// Rebuilt hourly so newly published stories show up
export const revalidate = 3600;

// No lastModified on pages whose content isn't dated: stamping every URL with "now" on every
// build teaches Google to ignore the field. Stories carry their real dates. Google ignores
// changeFrequency and priority, but Bing still reads priority.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0 },
    { url: `${BASE}/explore`, priority: 0.9 },
    { url: `${BASE}/destinations`, priority: 0.9 },
    { url: `${BASE}/map`, priority: 0.8 },
    { url: `${BASE}/matchmaker`, priority: 0.8 },
    { url: `${BASE}/ace`, priority: 0.7 },
    { url: `${BASE}/guides/offline-maps`, priority: 0.5 },
    { url: `${BASE}/stories`, priority: 0.8 },
    { url: `${BASE}/operators`, priority: 0.7 },
    { url: `${BASE}/about`, priority: 0.6 },
    { url: `${BASE}/contact`, priority: 0.5 },
    { url: `${BASE}/privacy`, priority: 0.2 },
    { url: `${BASE}/terms`, priority: 0.2 },
  ];

  const destinationPages: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${BASE}/destinations/${d.slug}`,
    priority: 0.9,
    images: d.adventures.slice(0, 1).map((a) => abs(a.heroImage)),
  }));

  const adventurePages: MetadataRoute.Sitemap = adventures.map((a) => ({
    url: `${BASE}/experiences/${a.slug}`,
    priority: 0.8,
    images: [abs(a.heroImage)],
  }));

  const stories = await getPublishedStories().catch(() => []);
  const storyPages: MetadataRoute.Sitemap = stories.map((s) => ({
    url: `${BASE}/stories/${s.slug}`,
    lastModified: s.updated_at || s.created_at || s.date,
    priority: 0.7,
  }));

  return [...staticPages, ...destinationPages, ...adventurePages, ...storyPages];
}
