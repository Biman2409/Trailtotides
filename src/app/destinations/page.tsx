import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import { DESTINATIONS, destinationFacts, inr } from "@/lib/destinations";

// Every destination page, in one place: the hub search engines and people start from

const SITE = "https://www.trailtotides.com";
const ORANGE = "#ff5100";

export const metadata: Metadata = {
  title: "Trekking & Adventure Destinations in India and Nepal",
  description: `Treks and adventures in ${DESTINATIONS.slice(0, 4).map((d) => d.name).join(", ")} and more, compared by difficulty, days, season and price. Matched to your fitness, run by verified operators.`,
  alternates: { canonical: `${SITE}/destinations` },
  openGraph: { title: "Destinations — Trail to Tides", url: `${SITE}/destinations`, type: "website" },
};

export default function DestinationsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Destinations",
    url: `${SITE}/destinations`,
    isPartOf: { "@id": `${SITE}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: DESTINATIONS.map((d, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/destinations/${d.slug}`, name: d.name })),
    },
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ScrollToTop />
      <Navbar />

      <section className="relative overflow-hidden pt-28 lg:pt-36 pb-10 px-5 lg:px-8">
        <SectionTexture kind="trail" color={ORANGE} at="85% 20%" opacity={0.08} />
        <div className="relative max-w-7xl mx-auto">
          <p className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase mb-4" style={{ color: "#e04800" }}>Destinations</p>
          <h1 className="text-[2.6rem] sm:text-5xl lg:text-6xl leading-[1.02] max-w-3xl" style={{ color: "var(--text-primary)", textWrap: "balance" }}>
            Where do you want to <span style={{ color: ORANGE }}>go?</span>
          </h1>
          <p className="text-base sm:text-[17px] mt-5 leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Every region we cover, with its treks and adventures compared by difficulty, days, season and price.
          </p>
        </div>
      </section>

      <section className="px-5 lg:px-8 pb-16">
        <ul className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESTINATIONS.map((d) => {
            const f = destinationFacts(d);
            const cover = d.adventures.find((a) => a.featured) ?? d.adventures[0];
            return (
              <li key={d.slug}>
                <Link href={`/destinations/${d.slug}`} className="group block rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div className="relative aspect-[16/9]">
                    <Image src={cover.heroImage} alt={`${d.name}: ${cover.name}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{d.name}</h2>
                    <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {f.count} {f.noun}{f.minPrice ? ` · from ${inr(f.minPrice)}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Footer />
    </div>
  );
}
