import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { adventures } from "@/lib/data";
import { ArrowRight, ArrowUpRight } from "lucide-react";

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
  };

  const cards: OperatorCard[] = profiles.map((p) => {
    const opSubs = approvedSubs.filter((s) => s.operator_id === p.user_id);
    return {
      id: p.user_id,
      company_name: p.company_name,
      contact_name: p.contact_name,
      website: p.website,
      email: p.email,
      adventureSlugs: [...new Set(opSubs.map((s) => s.adventure_slug))],
    };
  });

  const staticVerifiedNames = new Set<string>();
  const staticCards: OperatorCard[] = [];
  adventures.forEach((adv) => {
    adv.operators.filter((op) => op.verified).forEach((op) => {
      if (!staticVerifiedNames.has(op.name)) {
        staticVerifiedNames.add(op.name);
        staticCards.push({
          id: `static-${op.name}`,
          company_name: op.name,
          contact_name: "",
          website: op.website ?? null,
          email: "",
          adventureSlugs: adventures
            .filter((a) => a.operators.some((o) => o.name === op.name))
            .map((a) => a.slug),
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
      <section className="pt-28 pb-12 px-5 lg:px-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">

            {/* Left: title + meta */}
            <div className="flex items-center gap-6">
              {/* Big letter mark */}
              <div
                className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center text-3xl font-black shrink-0"
                style={{ background: "rgba(255,81,0,0.08)", color: "#ff5100", border: "1px solid rgba(255,81,0,0.15)" }}
              >
                O
              </div>
              <div>
                <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
                  Operators
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white/35 text-sm">{allCards.length} companies</span>
                  <span className="w-px h-3.5 bg-white/15" />
                  <span className="text-white/35 text-sm">{totalAdventures} adventures listed</span>
                  <span className="w-px h-3.5 bg-white/15" />
                  <span className="text-white/35 text-sm">India</span>
                </div>
              </div>
            </div>

            {/* Right: CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/auth/login?role=operator"
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Log in
              </Link>
              <Link
                href="/auth/operator-signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:gap-2.5"
                style={{ background: "#ff5100", color: "white" }}
              >
                List your company
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
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
                          {op.contact_name && (
                            <p className="text-white/30 text-[11px] mt-0.5 truncate">{op.contact_name}</p>
                          )}
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

                    {/* Adventure thumbnails */}
                    {listedAdventures.length > 0 ? (
                      <div className="flex-1 flex flex-col gap-2">
                        <p className="text-white/20 text-[10px] uppercase tracking-[0.14em] font-semibold">
                          {listedAdventures.length} {listedAdventures.length === 1 ? "adventure" : "adventures"}
                        </p>

                        {/* Image strip for first 3 */}
                        {listedAdventures.length >= 2 && (
                          <div className="flex gap-1.5 mb-1">
                            {listedAdventures.slice(0, 3).map((adv) => (
                              <Link
                                key={adv.slug}
                                href={`/experiences/${adv.slug}`}
                                className="relative rounded-lg overflow-hidden shrink-0 transition-opacity hover:opacity-80"
                                style={{ width: listedAdventures.length === 2 ? "50%" : "33.333%", aspectRatio: "4/3" }}
                              >
                                <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-medium text-white/80 leading-tight line-clamp-2">{adv.name}</p>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Text list for the rest (or all if only 1) */}
                        <div className="space-y-1">
                          {listedAdventures.slice(listedAdventures.length >= 2 ? 3 : 0, listedAdventures.length >= 2 ? 6 : 4).map((adv) => (
                            <Link
                              key={adv.slug}
                              href={`/experiences/${adv.slug}`}
                              className="flex items-center gap-2 rounded-md px-1.5 py-1 -mx-1.5 transition-colors hover:bg-white/[0.05] group/row"
                            >
                              <div className="relative w-6 h-6 rounded shrink-0 overflow-hidden">
                                <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                              </div>
                              <p className="text-white/50 text-[11px] truncate group-hover/row:text-white/75 transition-colors">{adv.name}</p>
                              <span className="text-white/20 text-[10px] shrink-0 ml-auto">{adv.state}</span>
                            </Link>
                          ))}
                          {listedAdventures.length > 6 && (
                            <p className="text-white/20 text-[10px] pl-1.5 pt-0.5">+{listedAdventures.length - 6} more</p>
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
