import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import DepartureCalendar from "@/app/experiences/[slug]/DepartureCalendar";
import { operatorPages, getOperatorPage, todayInIndia } from "@/lib/operatorPages";
import { getACE, computeDifficulty } from "@/lib/ace";
import { inr } from "@/lib/operatorOffer";
import WebsiteLink from "./WebsiteLink";

// One page per operator listed on our adventures: what they run, what it costs with them,
// and every start date they publish, on one calendar.

const SITE = "https://www.trailtotides.com";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return operatorPages().map((o) => ({ slug: o.slug }));
}

// Dates move past every day: rebuild daily so the calendar and "next start" stay current
export const revalidate = 86400;

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const op = getOperatorPage(slug);
  if (!op) return {};
  const n = op.treks.length;
  const prices = op.treks.map((t) => t.price).filter((p): p is number => !!p);
  const title = `${op.name}: ${n} ${n === 1 ? "Adventure" : "Adventures"}, ${op.departures.length ? "Prices and Dates" : "Prices"}`;
  const description = [
    `${op.name} on Trail to Tides: ${op.treks.slice(0, 3).map((t) => t.adventure.name).join(", ")}${n > 3 ? ` and ${n - 3} more` : ""}`,
    prices.length ? `, from ${inr(Math.min(...prices))}` : "",
    op.departures.length ? ". Every start date on one calendar." : ".",
  ].join("");
  const url = `${SITE}/operators/${slug}`;
  const image = op.treks[0]?.adventure.heroImage;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} — Trail to Tides`, description, url, type: "website", ...(image ? { images: [{ url: image, alt: op.name }] } : {}) },
    twitter: { card: "summary_large_image", title: `${title} — Trail to Tides`, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function OperatorPage({ params }: Props) {
  const { slug } = await params;
  const op = getOperatorPage(slug);
  if (!op) notFound();

  const today = todayInIndia();
  const upcoming = op.departures.filter((d) => d.date >= today);
  const prices = op.treks.map((t) => t.price).filter((p): p is number => !!p);
  const from = prices.length ? Math.min(...prices) : undefined;
  const types = [...new Set(op.treks.map((t) => t.adventure.type))];
  const noun = types.length === 1 && types[0] === "Trekking" ? "treks" : "adventures";

  // Their adventures, soonest next start first; ones without dates after, by name
  const rows = op.treks
    .map((t) => {
      const next = t.departures.map((d) => d.date).filter((d) => d >= today).sort();
      return { ...t, next: next[0], count: next.length };
    })
    .sort((a, b) => (a.next ?? "9999").localeCompare(b.next ?? "9999") || a.adventure.name.localeCompare(b.adventure.name));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: op.name,
    url: `${SITE}/operators/${slug}`,
    ...(op.website ? { sameAs: [op.website] } : {}),
    makesOffer: op.treks.map((t) => ({
      "@type": "Offer",
      itemOffered: { "@type": "TouristTrip", name: t.adventure.name, url: `${SITE}/experiences/${t.adventure.slug}` },
      ...(t.price ? { price: Math.round(t.price), priceCurrency: "INR" } : {}),
    })),
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ScrollToTop />
      <Navbar />

      <section className="relative overflow-hidden pt-24 lg:pt-32 pb-8 px-5 lg:px-8">
        <SectionTexture kind="trail" color="#ff5100" at="85% 20%" opacity={0.08} />
        <div className="relative max-w-7xl mx-auto">
          <div className="-mx-5 lg:-mx-8 mb-4">
            <Breadcrumbs items={[{ label: "Operators", href: "/operators" }, { label: op.name }]} />
          </div>
          <p className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase mb-4 flex items-center gap-3" style={{ color: "#e04800" }}>
            Operator
            {op.verified && (
              <span className="inline-flex items-center gap-1 normal-case tracking-normal font-sans text-[12.5px]" style={{ color: "var(--accent-green)" }}>
                <ShieldCheck className="w-4 h-4" /> Verified
              </span>
            )}
          </p>
          <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl leading-[1.04] max-w-3xl" style={{ color: "var(--text-primary)", textWrap: "balance" }}>
            {op.name}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]" style={{ color: "var(--text-secondary)" }}>
            {op.googleRating > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "var(--text-primary)" }}>
                <Star className="w-4 h-4 fill-[#f5a524] text-[#f5a524]" />{op.googleRating.toFixed(1)}
                <span className="font-normal" style={{ color: "var(--text-tertiary)" }}>on Google</span>
              </span>
            )}
            <span>{op.treks.length} {op.treks.length === 1 ? noun.slice(0, -1) : noun} listed</span>
            {from && <span>from <strong style={{ color: "var(--text-primary)" }}>{inr(from)}</strong></span>}
            {upcoming.length > 0 && <span>next start <strong style={{ color: "var(--text-primary)" }}>{shortDate(upcoming.map((d) => d.date).sort()[0])}</strong></span>}
          </p>
          {op.website && <div className="mt-6"><WebsiteLink url={op.website} operator={op.name} /></div>}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section id="dates" className="px-5 lg:px-8 pb-12 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>Departure calendar</h2>
            <div className="max-w-4xl">
              <DepartureCalendar departures={op.departures} today={today} by="trek" />
            </div>
          </div>
        </section>
      )}

      <section className="px-5 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
            What they run <span className="font-normal" style={{ color: "var(--text-tertiary)" }}>· {op.treks.length}</span>
          </h2>
          <ul className="max-w-4xl divide-y rounded-2xl border" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}>
            {rows.map((t) => {
              const a = t.adventure;
              const days = t.offer?.days ?? parseInt(a.durationDays, 10);
              return (
                <li key={a.slug} style={{ borderColor: "var(--border-subtle)" }}>
                  <Link href={`/experiences/${a.slug}`} className="group flex items-center gap-4 px-4 sm:px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15.5px] font-semibold transition-colors group-hover:text-[#ff5100]" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {[a.state, computeDifficulty(getACE(a)), Number.isFinite(days) ? `${days} days` : null].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {t.next ? <>Next start {shortDate(t.next)}{t.count > 1 ? ` · ${t.count} dates listed` : ""}</> : "No dates listed: check with them"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {t.price ? (
                        <>
                          <p className="text-[15px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{inr(t.price)}</p>
                          <p className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>{t.offer ? "full trip" : "from"}</p>
                        </>
                      ) : (
                        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>{t.priceFrom || "On request"}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--text-tertiary)" }} />
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="text-[12.5px] mt-3 max-w-4xl" style={{ color: "var(--text-tertiary)" }}>
            Prices and dates are read from {op.name}&apos;s own pages. Each adventure page compares them with the other operators running it.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
