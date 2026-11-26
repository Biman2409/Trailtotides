import type { MetadataRoute } from "next";
import { adventures } from "@/lib/data";
import { getPublishedStories } from "@/lib/stories";
import { DESTINATIONS } from "@/lib/destinations";
import { GUIDES } from "@/lib/adventurepedia";
import { ACTIVITIES, activityHref } from "@/lib/activityGuides";
import { trekAdventures } from "@/lib/trekGuides";
import { operatorPages } from "@/lib/operatorPages";
import { ABOUT_PAGE_LIVE } from "@/lib/pageSwitches";

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
    { url: `${BASE}/adventurepedia`, priority: 0.7 },
    { url: `${BASE}/adventurepedia/offline-maps`, priority: 0.5 },
    { url: `${BASE}/adventurepedia/ready`, priority: 0.5 },
    ...GUIDES.filter((g) => !g.custom).map((g) => ({ url: `${BASE}/adventurepedia/${g.slug}`, priority: 0.6 })),
    ...ACTIVITIES.map((a) => ({ url: `${BASE}${activityHref(a)}`, priority: 0.6 })),
    { url: `${BASE}/adventurepedia/treks`, priority: 0.7 },
    ...trekAdventures().map((a) => ({ url: `${BASE}/adventurepedia/treks/${a.slug}`, priority: 0.6 })),
    { url: `${BASE}/stories`, priority: 0.8 },
    { url: `${BASE}/operators`, priority: 0.7 },
    ...(ABOUT_PAGE_LIVE ? [{ url: `${BASE}/about`, priority: 0.6 }] : []),
    { url: `${BASE}/contact`, priority: 0.5 },
    { url: `${BASE}/privacy`, priority: 0.2 },
    { url: `${BASE}/terms`, priority: 0.2 },
  ];

  const destinationPages: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${BASE}/destinations/${d.slug}`,
    priority: 0.9,
    images: d.adventures.slice(0, 1).map((a) => abs(a.heroImage)),
  }));

  // An adventure page changes when its operators' prices are re-read, so the newest price check
  // is a real "last modified" date (left out when none is recorded)
  const adventurePages: MetadataRoute.Sitemap = adventures.map((a) => {
    const checked = a.operators.map((o) => o.priceCheckedAt).filter((d): d is string => !!d && !isNaN(Date.parse(d))).sort().pop();
    return {
      url: `${BASE}/experiences/${a.slug}`,
      ...(checked ? { lastModified: checked } : {}),
      priority: 0.8,
      images: [abs(a.heroImage)],
    };
  });

  const stories = await getPublishedStories().catch(() => []);
  const storyPages: MetadataRoute.Sitemap = stories.map((s) => ({
    url: `${BASE}/stories/${s.slug}`,
    lastModified: s.updated_at || s.created_at || s.date,
    priority: 0.7,
  }));

  const operatorPageUrls: MetadataRoute.Sitemap = operatorPages().map((o) => ({
    url: `${BASE}/operators/${o.slug}`,
    priority: 0.6,
  }));

  return [...staticPages, ...destinationPages, ...adventurePages, ...operatorPageUrls, ...storyPages];
}
