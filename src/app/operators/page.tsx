import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { adventures } from "@/lib/data";
import { Building2, Globe, CheckCircle2, ShieldCheck, ArrowRight, BadgeCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Operators Directory — Trail to Tides",
  description: "Browse verified adventure operators across India. Find trek companies, biking guides, and expedition outfitters listed on Trail to Tides.",
};

export const dynamic = "force-dynamic";

export default async function OperatorsPage() {
  const [profiles, submissions] = await Promise.all([
    getAllOperatorProfiles(),
    getAllOperatorSubmissions(),
  ]);

  // Build a map: operatorId → approved submissions
  const approvedSubs = submissions.filter((s) => s.status === "approved");

  // Build operator cards
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

  // Also surface operators from static data.ts that have verified=true
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
  const totalListings = allCards.reduce((sum, c) => sum + c.adventureSlugs.length, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <ScrollToTop />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-5 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff5100]/6 blur-[160px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-bold uppercase tracking-widest text-[#ff7d47]" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.15)" }}>
            <Building2 className="w-3.5 h-3.5" />
            Verified Operators
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.05]">
            Adventure<br />
            <span className="text-[#ff5100]">Operators</span>
          </h1>
          <p className="text-white/45 text-base md:text-lg max-w-xl font-light leading-relaxed mb-10">
            Discover trusted trek companies, biking guides, and expedition outfitters. Every operator listed here is vetted by our team.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: <Building2 className="w-4 h-4 text-[#ff5100]" />, value: allCards.length, label: "Operators" },
              { icon: <BadgeCheck className="w-4 h-4 text-emerald-400" />, value: totalListings, label: "Listings" },
              { icon: <Users className="w-4 h-4 text-sky-400" />, value: "50K+", label: "Monthly explorers" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                {icon}
                <div>
                  <p className="text-white font-bold text-lg leading-none">{value}</p>
                  <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for operators */}
      <section className="px-5 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            style={{ background: "linear-gradient(135deg, rgba(255,81,0,0.08) 0%, rgba(255,81,0,0.02) 100%)", border: "1px solid rgba(255,81,0,0.18)" }}
          >
            <div>
              <p className="text-white font-semibold text-base mb-1">Want to list your adventures here?</p>
              <p className="text-white/40 text-sm">Register as an operator and submit your listings for review. Free to join.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/auth/operator-signup"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#ff5100] hover:bg-[#ff7d47] text-white transition-all"
              >
                Register Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login?role=operator"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/55 hover:text-white transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Operators grid */}
      <section className="px-5 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {allCards.length === 0 ? (
            <div className="text-center py-24">
              <Building2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-base">No operators listed yet.</p>
              <p className="text-white/20 text-sm mt-1">Be the first to register your company.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allCards.map((op) => {
                const listedAdventures = adventures.filter((a) => op.adventureSlugs.includes(a.slug));
                const isStatic = op.id.startsWith("static-");

                return (
                  <div
                    key={op.id}
                    className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                  >
                    {/* Header */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-black" style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47" }}>
                          {op.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-semibold text-sm leading-snug truncate">{op.company_name}</h2>
                          {op.contact_name && (
                            <p className="text-white/35 text-xs mt-0.5">{op.contact_name}</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.18)" }}>
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      </div>

                      {/* Links */}
                      <div className="flex items-center gap-3">
                        {op.website && (
                          <a
                            href={op.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-[#ff5100] transition-colors font-medium"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                        {!isStatic && op.email && (
                          <span className="text-[11px] text-white/25 truncate">{op.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Verification badges */}
                    <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                      {[
                        { label: "Licensed", color: "rgba(16,185,129,0.1)", text: "#34d399", border: "rgba(16,185,129,0.2)" },
                        { label: "Insured", color: "rgba(56,189,248,0.08)", text: "#38bdf8", border: "rgba(56,189,248,0.18)" },
                      ].map(({ label, color, text, border }) => (
                        <span key={label} className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: color, color: text, border: `1px solid ${border}` }}>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Listed adventures */}
                    {listedAdventures.length > 0 && (
                      <div className="px-5 pb-4 flex-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 mt-3 mb-2.5">
                          {listedAdventures.length} {listedAdventures.length === 1 ? "Adventure" : "Adventures"} Listed
                        </p>
                        <div className="space-y-2">
                          {listedAdventures.slice(0, 4).map((adv) => (
                            <Link
                              key={adv.slug}
                              href={`/experiences/${adv.slug}`}
                              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04] group"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-xs font-medium truncate group-hover:text-[#ff5100] transition-colors">{adv.name}</p>
                                <p className="text-white/30 text-[10px] mt-0.5">{adv.state} · {adv.type}</p>
                              </div>
                              <ArrowRight className="w-3 h-3 text-white/20 shrink-0 group-hover:text-[#ff5100] transition-colors" />
                            </Link>
                          ))}
                          {listedAdventures.length > 4 && (
                            <p className="text-white/25 text-[10px] text-center pt-1">+{listedAdventures.length - 4} more adventures</p>
                          )}
                        </div>
                      </div>
                    )}

                    {listedAdventures.length === 0 && (
                      <div className="px-5 pb-5 flex-1 flex items-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <p className="text-white/20 text-xs mt-3">No approved listings yet — submissions under review.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How verification works */}
      <section
        className="px-5 lg:px-8 py-14"
        style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#ff5100] text-xs font-bold tracking-[0.22em] uppercase mb-2">Our Promise</p>
            <h2 className="text-white text-3xl font-bold tracking-tight">How We Vet Operators</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "🏛️", title: "Government Permits", desc: "We verify all required state and central government permits for operating in protected areas." },
              { icon: "🎓", title: "Certified Guides", desc: "IMF, ATOAI, and PADI certifications are confirmed directly with issuing bodies." },
              { icon: "🛡️", title: "Safety Standards", desc: "First-aid kits, evacuation protocols, and emergency contact procedures are inspected." },
              { icon: "⭐", title: "Track Record", desc: "A minimum of 2 successful seasons with documented client reviews is required." },
              { icon: "💰", title: "Insurance", desc: "Operators must carry valid third-party liability insurance covering all listed adventures." },
              { icon: "🔄", title: "Annual Review", desc: "Verification is renewed each year to ensure ongoing compliance and quality." },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
