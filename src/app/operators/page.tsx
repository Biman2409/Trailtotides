import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { adventures } from "@/lib/data";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

export const metadata: Metadata = {
  title: "Operators — Trail to Tides",
  description: "Browse adventure operators across India listed on Trail to Tides.",
};

export const dynamic = "force-dynamic";

export default async function OperatorsPage() {
  const [profiles, submissions] = await Promise.all([
    getAllOperatorProfiles(),
    getAllOperatorSubmissions(),
  ]);

  const approvedSubs = submissions.filter((s) => s.status === "approved");

  type OperatorCard = {
    id: string;
    company_name: string;
    contact_name: string;
    website: string | null;
    email: string;
    adventureSlugs: string[];
    prices: Record<string, string>; // slug → formatted price
  };

  const cards: OperatorCard[] = profiles.map((p) => {
    const opSubs = approvedSubs.filter((s) => s.operator_id === p.user_id);
    const prices: Record<string, string> = {};
    opSubs.forEach((s) => {
      const n = parseInt(s.price_from.replace(/[^\d]/g, ""), 10);
      prices[s.adventure_slug] = isNaN(n) ? s.price_from : `₹${n.toLocaleString("en-IN")}`;
    });
    return {
      id: p.user_id,
      company_name: p.company_name,
      contact_name: p.contact_name,
      website: p.website,
      email: p.email,
      adventureSlugs: [...new Set(opSubs.map((s) => s.adventure_slug))],
      prices,
    };
  });

  const staticVerifiedNames = new Set<string>();
  const staticCards: OperatorCard[] = [];
  adventures.forEach((adv) => {
    adv.operators.filter((op) => op.verified).forEach((op) => {
      if (!staticVerifiedNames.has(op.name)) {
        staticVerifiedNames.add(op.name);
        const prices: Record<string, string> = {};
        adventures
          .filter((a) => a.operators.some((o) => o.name === op.name))
          .forEach((a) => {
            const match = a.operators.find((o) => o.name === op.name);
            if (match?.priceFrom) prices[a.slug] = match.priceFrom;
          });
        staticCards.push({
          id: `static-${op.name}`,
          company_name: op.name,
          contact_name: "",
          website: op.website ?? null,
          email: "",
          adventureSlugs: adventures
            .filter((a) => a.operators.some((o) => o.name === op.name))
            .map((a) => a.slug),
          prices,
        });
      }
    });
  });

  const allCards = [...cards, ...staticCards];
  const totalAdventures = new Set(allCards.flatMap((c) => c.adventureSlugs)).size;

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
              Operators
            </h1>
            <p className="text-white/40 text-base mt-4 leading-relaxed">
              {allCards.length} companies · {totalAdventures} adventures listed across India.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
          </div>
        </div>
      </section>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <section className="px-5 lg:px-8 py-10 pb-24">
        <div className="max-w-7xl mx-auto">
          {allCards.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-white/20 text-sm">No operators listed yet.</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
              style={{
                background: "var(--border-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "1.25rem",
                overflow: "hidden",
              }}
            >
              {allCards.map((op) => {
                const listedAdventures = adventures.filter((a) => op.adventureSlugs.includes(a.slug));
                const isStatic = op.id.startsWith("static-");
                const initial = op.company_name.charAt(0).toUpperCase();

                return (
                  <div
                    key={op.id}
                    className="group flex flex-col gap-5 p-6 transition-colors duration-200 hover:bg-white/[0.025]"
                    style={{ background: "var(--bg-surface)" }}
                  >
                    {/* Operator identity */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-black"
                          style={{ background: "rgba(255,81,0,0.09)", color: "#ff6b2b" }}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-white/90 font-semibold text-sm leading-tight truncate">{op.company_name}</h2>
                        </div>
                      </div>
                      {op.website && (
                        <a
                          href={op.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1 -m-1 rounded-lg text-white/20 hover:text-[#ff5100] transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Adventures */}
                    {listedAdventures.length > 0 ? (
                      <div className="flex-1 flex flex-col gap-3">
                        <p className="text-white/20 text-[10px] uppercase tracking-[0.14em] font-semibold">
                          {listedAdventures.length} {listedAdventures.length === 1 ? "adventure" : "adventures"}
                        </p>
                        <div className="space-y-1.5">
                          {listedAdventures.slice(0, 5).map((adv) => (
                            <Link
                              key={adv.slug}
                              href={`/experiences/${adv.slug}`}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05] group/row"
                              style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                              {/* Thumbnail */}
                              <div className="relative w-10 h-10 rounded-lg shrink-0 overflow-hidden">
                                <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-xs font-medium truncate group-hover/row:text-white transition-colors leading-snug">
                                  {adv.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                                    {ADVENTURE_TYPE_ICONS[adv.type]?.(9)}
                                    {adv.type}
                                  </span>
                                  <span className="w-px h-2.5 bg-white/10" />
                                  <span className="text-[10px] text-white/25">{adv.state}</span>
                                  {op.prices[adv.slug] && (
                                    <>
                                      <span className="w-px h-2.5 bg-white/10" />
                                      <span className="text-[10px] font-semibold text-emerald-400">
                                        {op.prices[adv.slug]} onwards
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                            </Link>
                          ))}
                          {listedAdventures.length > 5 && (
                            <p className="text-white/20 text-[10px] pt-1 pl-1">+{listedAdventures.length - 5} more</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/20 text-xs flex-1 italic">Listings under review.</p>
                    )}

                    {/* Email footer */}
                    {!isStatic && op.email && (
                      <p
                        className="text-white/18 text-[10px] pt-3 truncate"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        {op.email}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
