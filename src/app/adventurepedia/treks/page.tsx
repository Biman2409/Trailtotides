import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { trekAdventures, ACCESS, altitudeM } from "@/lib/trekGuides";
import { TRAIL_SLUGS } from "@/lib/trails";
import TrekIndex, { type TrekCard } from "./TrekIndex";
import { serif } from "../blocks";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Trek Guides: Itineraries, Seasons and Permits for Every Trek",
  description: "Detailed guides to Himalayan treks in India and Nepal: day-by-day itineraries, best season, how to get there, permits, packing, fitness and costs.",
  alternates: { canonical: `${SITE}/adventurepedia/treks` },
  openGraph: { title: "Trek guides — Adventurepedia", url: `${SITE}/adventurepedia/treks`, type: "website" },
};

export default function TrekGuides() {
  const mapped = new Set(TRAIL_SLUGS);
  const treks: TrekCard[] = trekAdventures().map((a) => ({
    slug: a.slug, name: a.name, tagline: a.tagline, state: a.state, difficulty: a.difficulty, type: a.type,
    days: a.durationDays, altitude: a.altitude ?? "", altM: altitudeM(a), months: a.bestMonths, season: a.bestSeason,
    image: a.heroImage, mapped: mapped.has(a.slug),
    // Extra words search can match: start points and the gateway town
    keywords: [a.baseCamp, a.startingPoint, ACCESS[a.slug]?.gateway, ...a.tags].filter(Boolean).join(" "),
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-28 pb-20">
        <section className="pt-8 sm:pt-12 pb-8" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.07), transparent 85%)" }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-6">
            <nav className="flex items-center gap-1.5 text-[12.5px] t-text-3 mb-4" aria-label="Breadcrumb">
              <Link href="/adventurepedia" className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Adventurepedia</Link>
              <ChevronRight className="w-3 h-3" />
              <span>Trek guides</span>
            </nav>
            <h1 className="text-[40px] sm:text-[56px] t-text leading-[1.03]" style={{ ...serif, letterSpacing: "-0.025em" }}>Trek guides</h1>
            <p className="text-[17px] sm:text-[19px] leading-[1.55] t-text-2 mt-4 max-w-2xl">
              Everything for {treks.length} Himalayan treks and climbs: when to go, how to get there, the day-by-day plan, acclimatisation, permits, packing and what it costs.
            </p>
          </div>
        </section>
        <TrekIndex treks={treks} />
      </main>
      <Footer />
    </div>
  );
}
