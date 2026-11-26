import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { serif } from "../blocks";
import Readiness from "./Readiness";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Am I ready? A pre-trek readiness checklist",
  description: "Check you're ready for a trek or adventure in India: fitness, health, kit, paperwork and safety, with the guide to read for anything you haven't done yet.",
  alternates: { canonical: `${SITE}/adventurepedia/ready` },
  openGraph: { title: "Am I ready? — Adventurepedia", url: `${SITE}/adventurepedia/ready`, type: "website" },
};

export default function ReadyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-1.5 text-[12.5px] t-text-3 mb-4" aria-label="Breadcrumb">
            <Link href="/adventurepedia" className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Adventurepedia</Link>
            <ChevronRight className="w-3 h-3" />
            <span aria-current="page">Am I ready?</span>
          </nav>
          <h1 className="text-[34px] sm:text-[44px] t-text leading-[1.08]" style={{ ...serif, letterSpacing: "-0.02em" }}>Am I ready?</h1>
          <p className="text-[17px] leading-[1.6] t-text-2 mt-4">
            Two to four weeks before you go, run through this list. Tick what you&apos;ve done; anything left links to the guide that covers it. Your ticks stay on this device.
          </p>
          <Readiness />
        </div>
      </main>
      <Footer />
    </div>
  );
}
