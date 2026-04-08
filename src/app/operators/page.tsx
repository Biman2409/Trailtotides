import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { createClient } from "@/lib/supabase/server";
import { adventures } from "@/lib/data";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import OperatorsClient, { OperatorCardData } from "./OperatorsClient";

export const metadata: Metadata = {
  title: "Verified Adventure Operators",
  description: "Browse verified adventure operators across India — trekking guides, diving schools, biking tours, and more. Every operator reviewed and approved by Trail to Tides.",
  openGraph: {
    title: "Verified Adventure Operators — Trail to Tides",
    description: "Discover trusted adventure operators across India — each verified by our team for safety, quality, and expertise.",
    url: "https://trailtotides.com/operators",
    images: [{ url: "https://trailtotides.com/og-image.jpg", width: 1200, height: 630, alt: "Verified Adventure Operators — Trail to Tides" }],
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
  const isLoggedIn = !!user;

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
      adventureSlugs: slugs,
      prices,
      verified: false,
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

  const allCards = [...staticCards, ...dynamicCards];

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
      <section className="pt-28 lg:pt-36 pb-10 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[#ff5100] text-xs font-bold tracking-[0.25em] uppercase mb-4">Operators Directory</p>
            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.02]">
              Guided by the Best
            </h1>
            <p className="text-white/45 text-base mt-4 max-w-lg leading-relaxed font-light">
              Vetted companies running adventures across India&apos;s wildest terrain — from Ladakh passes to Andaman reefs.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isOperator ? (
              // Logged in as operator — show their dashboard link
              <Link
                href="/auth/operator-dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#ff5100", color: "white" }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                My Profile
              </Link>
            ) : isLoggedIn ? (
              // Logged in as explorer — offer operator signup
              <Link
                href="/auth/operator-signup"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#ff5100", color: "white" }}
              >
                List your company
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              // Not logged in — show both login + signup
              <>
                <Link
                  href="/auth/login?role=operator"
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/operator-signup"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "#ff5100", color: "white" }}
                >
                  List your company
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Filtered operator grid (client component) ──────────── */}
      <OperatorsClient cards={allCards} allTypes={allTypes} allStates={allStates} />

      <Footer />
    </div>
  );
}
