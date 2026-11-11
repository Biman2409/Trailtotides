import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MatchmakerClient from "./MatchmakerClient";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";

export const metadata: Metadata = {
  title: "Adventure Matchmaker",
  description: "Answer a few questions and discover the toughest adventure you're genuinely ready for. The Adventure Matchmaker builds your ACE™ profile, made for Indian terrain.",
  openGraph: {
    title: "Adventure Matchmaker — Trail to Tides",
    description: "Answer a few questions and discover the toughest adventure you're genuinely ready for.",
    url: "https://www.trailtotides.com/matchmaker",
    images: [{ url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=90", width: 1200, height: 630, alt: "Adventure Matchmaker — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adventure Matchmaker — Trail to Tides",
    description: "Discover the toughest adventure you're genuinely ready for.",
    images: ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=90"],
  },
  alternates: { canonical: "https://www.trailtotides.com/matchmaker" },
};

export default function MatchmakerPage() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen relative">
        {/* Drawn in the browser; the fallback gives crawlers the page's heading */}
        <Suspense fallback={
          <div className="min-h-screen">
            <h1 className="sr-only">Adventure Matchmaker: adventures built for your body</h1>
            <p className="sr-only">Tell us about your fitness and experience. We build your ACE<sup className="tm">™</sup> profile, eight capabilities scored 1 to 5, and rate every adventure against it: ready, a stretch, or not yet.</p>
          </div>
        }>
          <MatchmakerClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
