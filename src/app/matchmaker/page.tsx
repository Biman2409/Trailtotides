import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MatchmakerClient from "./MatchmakerClient";

export const metadata: Metadata = {
  title: "Find Your Mountain — Trail to Tides",
  description: "A mountain capability assessment. Answer a few questions and discover the toughest adventure you're genuinely ready for.",
};

export default function MatchmakerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0f1420]">
        <MatchmakerClient />
      </main>
      <Footer />
    </>
  );
}
