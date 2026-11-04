import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getACE } from "@/lib/ace";
import { getTrail } from "@/lib/trails";
import { trekAdventures, altitudeM, priceRange, ACCESS } from "@/lib/trekGuides";
import TrekCompare, { type CompareTrek } from "./TrekCompare";
import { serif } from "../../blocks";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Compare Treks Side by Side",
  description: "Put two Himalayan treks side by side: length, climb, top height, days, best months, cost, difficulty and what each asks of you on ACE™.",
  alternates: { canonical: `${SITE}/adventurepedia/treks/compare` },
  openGraph: { title: "Compare treks — Adventurepedia", url: `${SITE}/adventurepedia/treks/compare`, type: "website" },
};

export default function CompareTreksPage() {
  // Everything the table shows, worked out here so the page ships only the numbers
  const treks: CompareTrek[] = trekAdventures().map((a) => {
    const trail = getTrail(a.slug);
    const walk = trail?.days.filter((d) => d.kind === "walk") ?? [];
    const hardest = walk.reduce((m, d) => Math.max(m, d.up ?? 0), 0);
    const price = priceRange(a);
    return {
      slug: a.slug, name: a.name, state: a.state, difficulty: a.difficulty, type: a.type, image: a.heroImage,
      duration: a.durationDays, months: a.bestMonths,
      lengthKm: trail?.lengthKm ?? null, ascentM: trail?.ascentM ?? null,
      topM: altitudeM(a) || trail?.maxEleM || null,
      walkDays: walk.length || null, hardestUpM: hardest || null,
      price: price?.text ?? null, priceLo: price?.lo ?? null, operators: a.operators.length,
      gateway: ACCESS[a.slug]?.gateway ?? null,
      ace: getACE(a),
    };
  }).sort((x, y) => x.name.localeCompare(y.name));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-28 pb-20">
        <section className="pt-8 sm:pt-12 pb-6" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.07), transparent 85%)" }}>
          <div className="max-w-5xl mx-auto px-5 sm:px-6">
            <nav className="flex items-center gap-1.5 text-[12.5px] t-text-3 mb-4" aria-label="Breadcrumb">
              <Link href="/adventurepedia" className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Adventurepedia</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/adventurepedia/treks" className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Trek guides</Link>
              <ChevronRight className="w-3 h-3" />
              <span>Compare</span>
            </nav>
            <h1 className="text-[36px] sm:text-[50px] t-text leading-[1.04]" style={{ ...serif, letterSpacing: "-0.025em" }}>Compare two treks</h1>
            <p className="text-[17px] leading-[1.55] t-text-2 mt-3 max-w-2xl">
              Pick any two of our {treks.length} treks to see them side by side: how far, how high, how long, when, what it costs and what each asks of you.
            </p>
          </div>
        </section>
        <Suspense>
          <TrekCompare treks={treks} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
