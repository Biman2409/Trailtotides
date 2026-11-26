import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GUIDES, TOPICS, guideBySlug, guideHref, readMinutes, searchIndex } from "@/lib/adventurepedia";
import { trekAdventures, trekSearchIndex } from "@/lib/trekGuides";
import { ACTIVITIES, ELEMENTS, activitySearchIndex } from "@/lib/activityGuides";
import { adventures } from "@/lib/data";
import Library, { type ActivityTile, type GuideCard, type PathStep, type TrekTile } from "./Library";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Adventurepedia: Guides to Adventure in India",
  description: "Full guides to every adventure in India, from trekking and rafting to diving, paragliding and skiing, plus every trek, and the essentials from altitude and fitness to permits and budgets.",
  alternates: { canonical: `${SITE}/adventurepedia` },
  openGraph: { title: "Adventurepedia — Trail to Tides", url: `${SITE}/adventurepedia`, type: "website", images: [DEFAULT_OG_IMAGE] },
};

/** The order to read things in before a first big trek, and why each one matters */
const PATH: { slug: string; why: string }[] = [
  { slug: "choosing-a-season", why: "Pick months that suit the place and the adventure" },
  { slug: "activities/trekking", why: "Kinds of treks, choosing your first, and what it costs" },
  { slug: "getting-fit", why: "An 8-week plan, and the benchmark for your trek's grade" },
  { slug: "what-to-pack", why: "Layers, shoes and what operators provide" },
  { slug: "altitude-sickness", why: "The ascent rules, the warning signs, and what to do" },
  { slug: "choosing-an-operator", why: "The questions that separate safe from cheap" },
  { slug: "insurance-and-emergencies", why: "Cover that actually covers you, and how rescue works" },
  { slug: "permits-and-documents", why: "ID, forest and border permits" },
  { slug: "camp-life", why: "Tents, food, toilets and sleeping warm" },
  { slug: "offline-maps", why: "Load the trail on your phone before you lose signal" },
];

export default function Adventurepedia() {
  // Cards get only what they show; search gets each section as plain text (no markup or tables)
  const guides: GuideCard[] = GUIDES.map((g) => ({
    slug: g.slug, title: g.title, short: g.short, summary: g.summary, topic: g.topic, icon: g.icon,
    featured: !!g.featured, minutes: g.custom ? 12 : readMinutes(g), sections: g.sections.length,
  }));
  const path: PathStep[] = PATH.map(({ slug, why }) => {
    if (slug === "activities/trekking") return { href: "/adventurepedia/activities/trekking", title: "Trekking in India", why, icon: "trail" as const };
    const g = guideBySlug(slug)!;
    return { href: guideHref(g), title: g.short, why, minutes: g.custom ? 12 : readMinutes(g), icon: g.icon };
  });
  const allTreks = trekAdventures();
  // India first (this is a guide to adventure in India), then editor's picks, then featured treks
  const featured: TrekTile[] = [...allTreks]
    .sort((a, b) => Number(a.state === "Nepal") - Number(b.state === "Nepal") || Number(!!b.editorChoice) - Number(!!a.editorChoice) || Number(b.featured) - Number(a.featured))
    .slice(0, 4)
    .map((a) => ({ slug: a.slug, name: a.name, state: a.state, days: a.durationDays, image: a.heroImage }));
  const activities: ActivityTile[] = ACTIVITIES.map((a) => ({ slug: a.slug, type: a.type, element: a.element, count: adventures.filter((x) => x.type === a.type).length }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-28 pb-20">
        <Library guides={guides} topics={TOPICS} index={[...searchIndex(), ...activitySearchIndex(), ...trekSearchIndex()]} treks={{ count: allTreks.length, featured }} activities={activities} elements={ELEMENTS} path={path} />
      </main>
      <Footer />
    </div>
  );
}
