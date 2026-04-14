import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MatchmakerClient from "./MatchmakerClient";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";

export const metadata: Metadata = {
  title: "Adventure Matchmaker",
  description: "Answer a few questions and discover the toughest adventure you're genuinely ready for. A capability assessment built for Indian terrain.",
  openGraph: {
    title: "Adventure Matchmaker — Trail to Tides",
    description: "Answer a few questions and discover the toughest adventure you're genuinely ready for.",
    url: "https://trailtotides.com/matchmaker",
    images: [{ url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=90", width: 1200, height: 630, alt: "Adventure Matchmaker — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adventure Matchmaker — Trail to Tides",
    description: "Discover the toughest adventure you're genuinely ready for.",
    images: ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=90"],
  },
  alternates: { canonical: "https://trailtotides.com/matchmaker" },
};

export default function MatchmakerPage() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen relative">
        <Suspense>
          <MatchmakerClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
