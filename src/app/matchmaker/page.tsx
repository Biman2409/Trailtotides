import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MatchmakerClient from "./MatchmakerClient";

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
      <Navbar />
      <main className="min-h-screen">
        <MatchmakerClient />
      </main>
      <Footer />
    </>
  );
}
