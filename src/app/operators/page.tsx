import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { adventures } from "@/lib/data";
import { Globe, ArrowRight, ArrowUpRight } from "lucide-react";

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

  // Pull verified operators from static data
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

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <ScrollToTop />
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">Directory</p>
            <h1 className="text-white text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Operators
            </h1>
            <p className="text-white/40 text-sm mt-3 max-w-sm leading-relaxed">
              {allCards.length} companies running adventures across India.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Link
              href="/auth/login?role=operator"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Log in
            </Link>
            <Link
              href="/auth/operator-signup"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#ff5100] hover:bg-[#ff7d47] text-white transition-all"
            >
              List your company
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-5 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {allCards.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-white/20 text-sm">No operators listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
              style={{ background: "var(--border-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "1rem", overflow: "hidden" }}
            >
              {allCards.map((op) => {
                const listedAdventures = adventures.filter((a) => op.adventureSlugs.includes(a.slug));
                const isStatic = op.id.startsWith("static-");

                return (
                  <div
                    key={op.id}
                    className="flex flex-col p-6 transition-colors duration-150"
                    style={{ background: "var(--bg-surface)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-surface)")}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-black"
                          style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47" }}
                        >
                          {op.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-white font-semibold text-sm leading-snug truncate">{op.company_name}</h2>
                          {op.contact_name && (
                            <p className="text-white/30 text-xs mt-0.5 truncate">{op.contact_name}</p>
                          )}
                        </div>
                      </div>
                      {op.website && (
                        <a
                          href={op.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-white/25 hover:text-[#ff5100] transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Adventures */}
                    {listedAdventures.length > 0 ? (
                      <div className="flex-1">
                        <p className="text-white/25 text-[10px] uppercase tracking-[0.15em] font-semibold mb-3">
                          {listedAdventures.length} {listedAdventures.length === 1 ? "adventure" : "adventures"}
                        </p>
                        <div className="space-y-1.5">
                          {listedAdventures.slice(0, 4).map((adv) => (
                            <Link
                              key={adv.slug}
                              href={`/experiences/${adv.slug}`}
                              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-white/[0.05] group"
                            >
                              <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0">
                                <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/65 text-xs font-medium truncate group-hover:text-white transition-colors">{adv.name}</p>
                                <p className="text-white/25 text-[10px]">{adv.state}</p>
                              </div>
                            </Link>
                          ))}
                          {listedAdventures.length > 4 && (
                            <p className="text-white/20 text-[10px] pl-2 pt-0.5">+{listedAdventures.length - 4} more</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/20 text-xs flex-1">Listings under review.</p>
                    )}

                    {/* Footer */}
                    {!isStatic && op.email && (
                      <p className="text-white/20 text-[10px] mt-4 pt-3 truncate" style={{ borderTop: "1px solid var(--border-subtle)" }}>
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
