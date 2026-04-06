import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MatchmakerClient from "./MatchmakerClient";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { Mountain } from "lucide-react";

export const metadata: Metadata = {
  title: "Find Your Mountain",
  description: "Answer a few questions and discover the toughest adventure you're genuinely ready for. A capability assessment built for Indian terrain.",
  openGraph: {
    title: "Find Your Mountain — Trail to Tides",
    description: "Answer a few questions and discover the toughest adventure you're genuinely ready for.",
    url: "https://trailtotides.com/matchmaker",
    images: [{ url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90", width: 1200, height: 630, alt: "Find Your Mountain — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Your Mountain — Trail to Tides",
    description: "Discover the toughest adventure you're genuinely ready for.",
    images: ["https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90"],
  },
  alternates: { canonical: "https://trailtotides.com/matchmaker" },
};

export default function MatchmakerPage() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen relative">
        <MatchmakerClient />
        <div className="fixed bottom-4 right-4 z-[100] backdrop-blur-md rounded-xl border border-white/10 px-4 py-3 shadow-xl" style={{ background: "rgba(15,15,20,0.85)" }}>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Mountain className="w-3.5 h-3.5" />
            <span>TRAIL TO TIDES · Adventure Matchmaker</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
