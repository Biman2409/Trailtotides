import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, MapPinned } from "lucide-react";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Adventurepedia: Guides for Treks and Rides",
  description: "Adventurepedia is Trail to Tides' library of practical, tested guides for Himalayan treks and rides: offline maps, GPS trails and more.",
  alternates: { canonical: `${SITE}/adventurepedia` },
  openGraph: { title: "Adventurepedia — Trail to Tides", url: `${SITE}/adventurepedia`, type: "website" },
};

// Every guide in the library; add new ones here
const GUIDES = [
  {
    href: "/adventurepedia/offline-maps",
    icon: MapPinned,
    title: "Take your trek offline",
    blurb: "Load a trek's GPX trail and an offline map onto your phone or GPS watch, and follow it with no signal. Android, iPhone, computer and watches.",
    meta: "15 minutes at home",
  },
];

export default function Adventurepedia() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Guides</p>
          <h1 className="text-4xl sm:text-5xl t-text leading-[1.06]" style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600, letterSpacing: "-0.02em" }}>Adventurepedia</h1>
          <p className="text-[17px] leading-[1.6] t-text-2 mt-4">Practical guides for getting out there and back safely. Short, tested, and written for the treks and rides on Trail to Tides.</p>

          <ul className="mt-10 space-y-3">
            {GUIDES.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="group flex gap-4 rounded-2xl p-5 transition-colors hover:border-[#ff5100]/50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}><g.icon className="w-5 h-5 text-[#ff5100]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[18px] font-semibold t-text group-hover:text-[#ff5100] transition-colors">{g.title}</span>
                    <span className="block text-[14px] leading-[1.6] t-text-2 mt-1">{g.blurb}</span>
                    <span className="block text-[12px] t-text-3 mt-2">{g.meta}</span>
                  </span>
                  <ArrowRight className="w-5 h-5 t-text-3 self-center shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
