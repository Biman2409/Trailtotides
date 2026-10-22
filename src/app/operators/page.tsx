import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { createClient } from "@/lib/supabase/server";
import { adventures } from "@/lib/data";
import { ShieldCheck } from "lucide-react";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import OperatorsClient, { OperatorCardData } from "./OperatorsClient";

export const metadata: Metadata = {
  title: "Verified Adventure Operators",
  description: "Browse verified adventure operators across India — trekking guides, diving schools, biking tours, and more. Every operator reviewed and approved by Trail to Tides.",
  openGraph: {
    title: "Verified Adventure Operators — Trail to Tides",
    description: "Discover trusted adventure operators across India — each verified by our team for safety, quality, and expertise.",
    url: "https://trailtotides.com/operators",
    images: [{ url: "https://trailtotides.com/opengraph-image", width: 1200, height: 630, alt: "Verified Adventure Operators — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Adventure Operators — Trail to Tides",
    description: "Trusted operators for trekking, diving, biking, climbing, and more across India.",
  },
  alternates: { canonical: "https://trailtotides.com/operators" },
};

export const dynamic = "force-dynamic";

export default async function OperatorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOperator = user?.user_metadata?.role === "operator";

  const [profiles, submissions] = await Promise.all([
    getAllOperatorProfiles(),
    getAllOperatorSubmissions(),
  ]);

  const approvedSubs = submissions.filter((s) => s.status === "approved");

  // Dynamic operators from Supabase (unverified until manually verified)
  const dynamicCards: OperatorCardData[] = profiles.map((p) => {
    const opSubs = approvedSubs.filter((s) => s.operator_id === p.user_id);
    const prices: Record<string, string> = {};
    opSubs.forEach((s) => {
      const n = parseInt(s.price_from.replace(/[^\d]/g, ""), 10);
      prices[s.adventure_slug] = isNaN(n) ? s.price_from : `₹${n.toLocaleString("en-IN")}`;
    });
    const slugs = [...new Set(opSubs.map((s) => s.adventure_slug))];
    return {
      id: p.user_id,
      company_name: p.company_name,
      website: p.website,
      email: p.email,
      logo_url: p.logo_url ?? null,
      adventureSlugs: slugs,
      prices,
      verified: false,
      rating: null,
      adventureDetails: adventures
        .filter((a) => slugs.includes(a.slug))
        .map((a) => ({ slug: a.slug, name: a.name, type: a.type, state: a.state, heroImage: a.heroImage })),
    };
  });

  // Static verified operators from data.ts
  const staticVerifiedNames = new Set<string>();
  const staticCards: OperatorCardData[] = [];
  adventures.forEach((adv) => {
    adv.operators.filter((op) => op.verified).forEach((op) => {
      if (!staticVerifiedNames.has(op.name)) {
        staticVerifiedNames.add(op.name);
        const prices: Record<string, string> = {};
        const matchedAdventures = adventures.filter((a) => a.operators.some((o) => o.name === op.name));
        matchedAdventures.forEach((a) => {
          const match = a.operators.find((o) => o.name === op.name);
          if (match?.priceFrom) prices[a.slug] = match.priceFrom;
        });
        staticCards.push({
          id: `static-${op.name}`,
          company_name: op.name,
          website: op.website ?? null,
          email: "",
          adventureSlugs: matchedAdventures.map((a) => a.slug),
          prices,
          verified: true,
          rating: null,
          adventureDetails: matchedAdventures.map((a) => ({
            slug: a.slug,
            name: a.name,
            type: a.type,
            state: a.state,
            heroImage: a.heroImage,
          })),
        });
      }
    });
  });

  // Google rating per verified operator (the same on every adventure they run)
  const ratings = new Map<string, number>();
  adventures.forEach((a) => a.operators.forEach((o) => {
    if (o.verified && o.googleRating) ratings.set(o.name, Math.max(ratings.get(o.name) ?? 0, o.googleRating));
  }));
  staticCards.forEach((c) => { c.rating = ratings.get(c.company_name) ?? null; });

  const allCards = [...staticCards, ...dynamicCards];

  // Headline numbers, all counted from the listings themselves
  const verifiedCards = staticCards;
  const stats = {
    verified: verifiedCards.length,
    adventures: new Set(verifiedCards.flatMap((c) => c.adventureSlugs)).size,
    states: new Set(verifiedCards.flatMap((c) => c.adventureDetails.flatMap((a) => a.state.split(/\s*[/,]\s*/).map((s) => s.trim()).filter((s) => s && s !== "Nepal")))).size,
    rating: verifiedCards.length ? Math.round((verifiedCards.reduce((s, c) => s + (c.rating ?? 0), 0) / verifiedCards.length) * 10) / 10 : 0,
  };

  // Derive unique types & states from the listed adventures
  const allTypes = [...new Set(
    allCards.flatMap((c) => c.adventureDetails.map((a) => a.type))
  )].sort();

  const allStates = [...new Set(
    allCards.flatMap((c) => c.adventureDetails.flatMap((a) =>
      // split "Himachal Pradesh / Ladakh" into individual states
      a.state.split(/\s*[/,]\s*/).map((s) => s.trim()).filter(Boolean)
    ))
  )].sort();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <ScrollToTop />
      <Navbar />

      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 lg:pt-36 pb-10 px-5 lg:px-8">
        <SectionTexture kind="trail" color="#ff5100" at="85% 20%" opacity={0.08} />
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <p className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase mb-4" style={{ color: "#e04800" }}>
              Operators
            </p>
            <h1 className="text-[2.6rem] sm:text-5xl lg:text-6xl leading-[1.02]" style={{ color: "var(--text-primary)", textWrap: "balance" }}>
              The people who <span style={{ color: "#ff5100" }}>take you there</span>
            </h1>
            <p className="text-base sm:text-[17px] mt-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Companies running treks, rides and expeditions across India. The ones marked{" "}
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "var(--accent-green)" }}><ShieldCheck className="w-4 h-4" />Verified</span>{" "}
              have been reviewed and approved by our team for safety, quality and expertise.
            </p>
          </div>
          {/* Operator actions live in the "For operators" block below; this page leads with the operators */}
        </div>
      </section>

      {/* ── Filtered operator grid (client component) ──────────── */}
      <OperatorsClient cards={allCards} allTypes={allTypes} allStates={allStates} stats={stats} isOperator={isOperator} />

      <Footer />
    </div>
  );
}
