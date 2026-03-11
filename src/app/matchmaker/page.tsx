import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MatchmakerClient from "./MatchmakerClient";

export const metadata: Metadata = {
  title: "Adventure Matchmaker — Trail to Tides",
  description: "Answer 5 quick questions and discover adventures perfectly matched to your fitness and experience level.",
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
