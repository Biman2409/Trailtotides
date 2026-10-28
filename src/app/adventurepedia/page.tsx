import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GUIDES, TOPICS, readMinutes, searchIndex } from "@/lib/adventurepedia";
import Library, { type GuideCard } from "./Library";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Adventurepedia: Guides for Treks and Rides",
  description: "Practical guides for Himalayan treks and rides: altitude sickness, what to pack, getting fit, seasons, permits, choosing an operator, offline maps, rafting and more.",
  alternates: { canonical: `${SITE}/adventurepedia` },
  openGraph: { title: "Adventurepedia — Trail to Tides", url: `${SITE}/adventurepedia`, type: "website" },
};

export default function Adventurepedia() {
  // Cards get only what they show; search gets each section as plain text (no markup or tables)
  const guides: GuideCard[] = GUIDES.map((g) => ({
    slug: g.slug, title: g.title, short: g.short, summary: g.summary, topic: g.topic, icon: g.icon,
    featured: !!g.featured, minutes: g.custom ? 12 : readMinutes(g), sections: g.sections.length,
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-28 pb-20">
        <Library guides={guides} topics={TOPICS} index={searchIndex()} />
      </main>
      <Footer />
    </div>
  );
}
