import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LegalText from "@/components/ui/custom/LegalText";
import { LEGAL_UPDATED, PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Trail to Tides collects, uses, shares and protects your data: your account, quote requests to operators, Adventure Matchmaker health answers, Compass.AI, maps and your rights.",
  alternates: { canonical: "https://www.trailtotides.com/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-14 px-6 lg:px-8 t-bg-surface2">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="t-text text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="t-text-3 text-base">Last updated: {LEGAL_UPDATED}</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="t-text-2 text-base leading-relaxed mb-12">{PRIVACY_INTRO}</p>
          <LegalText sections={PRIVACY_SECTIONS} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
