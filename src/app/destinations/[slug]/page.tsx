import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import { DESTINATIONS, destinationBySlug, destinationFacts, difficultyOf, altitudeOf, inr, MONTHS } from "@/lib/destinations";
import type { Month } from "@/lib/data";

// One page per region: "Treks in Uttarakhand" and the like — the searches people actually
// make. Everything on it is worked out from the adventure data, so it never goes stale.

const SITE = "https://www.trailtotides.com";
const ORANGE = "#ff5100";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// Consecutive months as one window, so a split season reads "May–Jun and Sep–Oct"
function monthRange(ms: string[]) {
  const runs: string[][] = [];
  for (const m of MONTHS.filter((x) => ms.includes(x))) {
    const last = runs[runs.length - 1];
    if (last && MONTHS.indexOf(m) === MONTHS.indexOf(last[last.length - 1] as Month) + 1) last.push(m);
    else runs.push([m]);
  }
  const parts = runs.map((r) => (r.length > 1 ? `${r[0]}–${r[r.length - 1]}` : r[0]));
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0] ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) return {};
  const f = destinationFacts(d);
  // Title case for the search result: "25 Best Treks and Adventures in Uttarakhand"
  const title = `${f.count} Best ${f.noun.replace(/\b(treks|adventures)\b/g, cap)} in ${d.name}`;
  // Google shows about 160 characters: shorten the closing line until it fits
  const describe = (close: string) => [
    `Compare ${f.count} ${f.noun} in ${d.name} by difficulty, days and price`,
    f.bestMonths.length ? `; best from ${monthRange(f.bestMonths)}` : "",
    f.minPrice ? `, from ${inr(f.minPrice)}` : "",
    close,
  ].join("");
  const description = [
    ". Matched to your fitness, run by verified operators.",
    ". Matched to your fitness.",
    ".",
  ].map(describe).find((t) => t.length <= 160) ?? describe(".");
  const url = `${SITE}/destinations/${slug}`;
  const image = d.adventures[0]?.heroImage;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} — Trail to Tides`, description, url, type: "website", ...(image ? { images: [{ url: image, alt: `${cap(f.noun)} in ${d.name}` }] } : {}) },
    twitter: { card: "summary_large_image", title: `${title} — Trail to Tides`, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) notFound();
  const f = destinationFacts(d);
  const url = `${SITE}/destinations/${slug}`;
  const peak = Math.max(...f.monthCounts, 1);

  const faqs = [
    f.easiest && {
      q: `What is the easiest ${f.noun === "treks" ? "trek" : "adventure"} in ${d.name}?`,
      a: `${f.easiest.name} (${difficultyOf(f.easiest)}, ${f.easiest.durationDays}) is the gentlest of the ${f.count} listed here.`,
    },
    f.hardest && f.hardest !== f.easiest && {
      q: `What is the hardest?`,
      a: `${f.hardest.name} is rated ${difficultyOf(f.hardest)} on our ACE scale${f.hardest.altitude ? `, topping out at ${altitudeOf(f.hardest)}` : ""}. Take the fitness check before booking it.`,
    },
    f.bestMonths.length > 0 && {
      q: `When is the best time to go?`,
      a: `Most routes in ${d.name} are in season ${monthRange(f.bestMonths)}. Each adventure page lists its own best months.`,
    },
    f.minPrice > 0 && f.cheapest && {
      q: `How much does it cost?`,
      a: `Prices start at ${inr(f.minPrice)} (${f.cheapest.name}) with verified operators. Every adventure page compares its operators side by side.`,
    },
  ].filter(Boolean) as { q: string; a: string }[];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${cap(f.noun)} in ${d.name}`,
      url,
      isPartOf: { "@id": `${SITE}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: f.count,
        itemListElement: d.adventures.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/experiences/${a.slug}`, name: a.name })),
      },
    },
    // (The breadcrumb trail's own structured data comes from <Breadcrumbs>)
    ...(faqs.length ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ScrollToTop />
      <Navbar />

      <section className="relative overflow-hidden pt-24 lg:pt-32 pb-8 px-5 lg:px-8">
        <SectionTexture kind="trail" color={ORANGE} at="85% 20%" opacity={0.08} />
        <div className="relative max-w-7xl mx-auto">
          <div className="-mx-5 lg:-mx-8 mb-4">
            <Breadcrumbs items={[{ label: "Destinations", href: "/destinations" }, { label: d.name }]} />
          </div>
          <p className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase mb-4" style={{ color: "#e04800" }}>
            {f.count} {f.noun}
          </p>
          <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl leading-[1.04] max-w-3xl" style={{ color: "var(--text-primary)", textWrap: "balance" }}>
            {cap(f.noun)} in <span style={{ color: "var(--accent-ink)" }}>{d.name}</span>
          </h1>
          <p className="text-base sm:text-[17px] mt-5 leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            {f.count} {f.noun} in {d.name}, from {f.minDays === f.maxDays ? `${f.minDays}` : `${f.minDays} to ${f.maxDays}`} days
            {f.byDifficulty.length > 1 ? ` and ${f.byDifficulty[0].level.toLowerCase()} to ${f.byDifficulty[f.byDifficulty.length - 1].level.toLowerCase()}` : ""}.
            {f.highest && <> The highest, {f.highest.name}, reaches {altitudeOf(f.highest)}.</>}
            {f.minPrice > 0 && <> Prices start at {inr(f.minPrice)}, run by verified operators.</>}
            {" "}Compare them by difficulty, days and season, or <Link href="/matchmaker" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>find the ones matched to your fitness</Link>.
          </p>
        </div>
      </section>

      {/* When to go: how many routes are in season each month */}
      {f.bestMonths.length > 0 && (
        <section className="px-5 lg:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>When to go</h2>
            <p className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>Routes in season each month. Most open {monthRange(f.bestMonths)}.</p>
            <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end max-w-2xl" role="img" aria-label={`Routes in season by month: ${MONTHS.map((m, i) => `${m} ${f.monthCounts[i]}`).join(", ")}`}>
              {MONTHS.map((m, i) => (
                <div key={m} className="flex flex-col items-center gap-1">
                  <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{f.monthCounts[i] || ""}</span>
                  <span className="w-full rounded-sm" style={{ height: Math.max(3, (f.monthCounts[i] / peak) * 64), background: f.bestMonths.includes(m) ? ORANGE : "var(--border-default)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{m.charAt(0)}<span className="hidden sm:inline">{m.slice(1)}</span></span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Every adventure, easiest first */}
      <section className="px-5 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {f.byDifficulty.map(({ level, items }) => (
            <div key={level}>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
                {level} <span className="font-normal" style={{ color: "var(--text-tertiary)" }}>· {items.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((a) => <AdventureCard key={a.slug} adventure={a} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="px-5 lg:px-8 pb-12">
          <div className="max-w-3xl mx-auto lg:mx-0 lg:max-w-7xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>Good to know</h2>
            <dl className="max-w-3xl divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {faqs.map(({ q, a }) => (
                <div key={q} className="py-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <dt className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>{q}</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Other destinations */}
      <section className="px-5 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>More destinations</h2>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.filter((x) => x.slug !== slug).map((x) => (
              <Link key={x.slug} href={`/destinations/${x.slug}`} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors hover:bg-[#ff5100]/[0.06]" style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
                {x.name} <span style={{ color: "var(--text-tertiary)" }}>· {x.adventures.length}</span>
              </Link>
            ))}
            <Link href="/explore" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold" style={{ color: "var(--accent-ink)", border: `1px solid ${ORANGE}` }}>
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
