import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LegalText from "@/components/ui/custom/LegalText";
import { LEGAL_UPDATED, TERMS_INTRO, TERMS_SECTIONS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Trail to Tides terms of use: what the platform is, your account, operators and quote requests, maps and grades, reviews and stories, and liability.",
  alternates: { canonical: "https://www.trailtotides.com/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-14 px-6 lg:px-8 t-bg-surface2">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="text-[var(--text-primary)] text-5xl font-bold tracking-tight mb-4">Terms of Use</h1>
          <p className="text-[var(--text-tertiary)] text-base">Last updated: {LEGAL_UPDATED}</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-12">{TERMS_INTRO}</p>
          <LegalText sections={TERMS_SECTIONS} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
