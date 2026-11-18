import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Mountain, Map, Sparkles, BadgeCheck, Users } from "lucide-react";
import { adventures } from "@/lib/data";
import FadeInSection from "@/components/ui/custom/FadeInSection";
import { notFound } from "next/navigation";
import { ABOUT_PAGE_LIVE } from "@/lib/pageSwitches";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Built by explorers for explorers: find, compare and book adventures across India, matched to your fitness and run by verified operators.",
  openGraph: {
    title: "About Trail to Tides",
    description: "Built by explorers for explorers. Find, compare and book adventures across India — matched to your fitness and run by verified operators.",
    url: "https://www.trailtotides.com/about",
    images: [{ url: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1200&q=90", width: 1200, height: 630, alt: "About Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Trail to Tides",
    description: "Built by explorers for explorers. Find, compare and book adventures across India.",
    images: ["https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1200&q=90"],
  },
  alternates: { canonical: "https://www.trailtotides.com/about" },
};

const VALUES = [
  {
    icon: BadgeCheck,
    title: "Curated, not aggregated",
    description: "Every adventure on this platform has been reviewed. We don't list everything — we list what's worth your time and money.",
  },
  {
    icon: Map,
    title: "Data-led, story-told",
    description: "Real terrain data, verified operator credentials, and firsthand stories from people who've actually done the adventure.",
  },
    {
      icon: Sparkles,
      title: "Discovery-first",
      description: "Built to help you find the adventure that fits you — not to push the most commercially popular one. Trail to Tides is our commitment to personalised discovery.",
    },
  {
    icon: Users,
    title: "Community-built",
    description: "Stories, operator reviews, and local knowledge come from real adventurers in the community. We platform the people who've been out there.",
  },
];

const TEAM = [
  {
    name: "Biman Barai",
    role: "Founder · Motorcyclist & Mountaineer",
    bio: "A rider and a climber in equal measure, Biman has spent years exploring India on two wheels, returning again and again to the high roads of Ladakh. On foot, he has trekked and climbed across the Himalaya, from remote valleys to high passes. He founded Trail to Tides to share that experience and help every explorer go further, better prepared.",
    initial: "B",
  },
  {
    name: "Rohit Panikar",
    role: "Co-founder · Motorcyclist & Ocean Explorer",
    bio: "Rohit is as much at home on the open road as he is out on the ocean. He has ridden the Himalayan passes of Ladakh and Nepal, explored coral reefs as a scuba diver and chased waves as a surfer. At Trail to Tides, he brings that love of land and sea to every journey, from mountain roads to open water.",
    initial: "R",
  },
  {
    name: "Aditya Yadav",
    role: "Co-founder · Skier & Mountaineer",
    bio: "Driven by a passion bordering on obsession, Aditya lives for the edge and refuses to accept limits. He drops into high-alpine couloirs on skis, hammers across punishing terrain on two wheels and keeps climbing ever higher. At Trail to Tides, he brings that relentless drive to every journey, inspiring explorers to push past what they thought possible.",
    initial: "A",
  },
];

export default function AboutPage() {
  // Off while the page is reworked (src/lib/pageSwitches.ts)
  if (!ABOUT_PAGE_LIVE) notFound();
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=2000&q=80"
            alt="Adventure background"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#171310]/95 via-[#171310]/80 to-[#171310]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Mountain className="w-5 h-5 text-[#ff5100]" />
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase">
              About TRAIL TO TIDES
            </p>
          </div>
            <h1 className="text-white text-5xl lg:text-7xl font-bold tracking-tight leading-none mb-8">
              Designed by Explorers for Explorers
            </h1>
            <p className="text-white/60 text-xl leading-relaxed max-w-2xl">
              Find, compare, and book finest adventures across Indian subcontinent — matched to fitness, guided by Compass.AI, mapped with precision and run by verified operators.
            </p>
        </div>
      </section>

      {/* Origin */}
      <FadeInSection as="section" className="py-20 px-6 lg:px-8 t-bg-surface2 border-t border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-4">
            The Origin
          </p>
          <div className="space-y-6 text-lg leading-relaxed font-light" style={{ color: "var(--text-secondary)" }}>
            <p>
              India has more adventure than almost anywhere on Earth. The Himalayas alone have more trekking routes than most countries have roads. The Andamans hold some of the healthiest reefs left in the Indian Ocean. The Deccan plateau hides rivers no one has kayaked. The Rann of Kutch turns into a salt desert unlike anything else in Asia.
            </p>
            <p>
              And yet, for years, planning an adventure in India meant wading through outdated blogs, WhatsApp groups, and operator websites designed in 2009. You couldn&apos;t easily compare what was out there, couldn&apos;t verify who was safe to book with, and couldn&apos;t find a single place where someone had mapped the whole thing.
            </p>
            <p>
              We built Trail to Tides to fix that. A platform where every adventure is described properly, every operator is checked, and every recommendation is grounded in real experience — not affiliate commissions.
            </p>
          </div>
        </div>
      </FadeInSection>

      {/* Values */}
      <FadeInSection as="section" className="py-20 lg:py-28 px-6 lg:px-8 t-bg-page border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            What We Stand For
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-14" style={{ color: "var(--text-primary)" }}>Our values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-6 transition-all duration-300 hover:bg-black/5 hover:border-[#ff5100]/30"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#ff5100]/15 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-[#ff5100]" />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text-primary)" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* Team */}
      <FadeInSection as="section" className="py-20 lg:py-28 px-6 lg:px-8 t-bg-surface2 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            The Founders
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            People who&apos;ve been there
          </h2>
          <p className="text-base mb-14 max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Riders, climbers, a skier and a diver. We built the platform we wanted for our own adventures.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <div key={member.name} className="rounded-2xl p-7" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <div className="w-14 h-14 rounded-2xl bg-[#ff5100]/20 flex items-center justify-center text-2xl font-bold text-[#ff5100] mb-5">
                  {member.initial}
                </div>
                <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--text-primary)" }}>{member.name}</h3>
                <p className="text-[#ff5100] text-xs font-medium mb-4">{member.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* Stats */}
      <FadeInSection as="section" className="py-20 px-6 lg:px-8 t-bg-page border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: String(adventures.length), label: "Adventures catalogued" },
              // Every adventure's region is "Himalayas", so count the states (and Nepal) they're in instead
              { value: String(new Set(adventures.flatMap(a => a.state.split(/\s*[/,]\s*/).map(s => s.trim()).filter(Boolean))).size), label: "States & countries" },
              { value: String(new Set(adventures.map(a => a.type)).size), label: "Adventure types" },
              { value: "2025", label: "Year founded" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-[#ff5100] text-5xl font-bold mb-2">{value}</div>
                <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection as="section" className="py-20 px-6 lg:px-8 t-bg-surface2 border-t border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-5" style={{ color: "var(--text-primary)" }}>
            Ready to find your adventure?
          </h2>
          <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
            {adventures.length} adventures across India, waiting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-[#1c1814] font-semibold px-8 py-4 rounded-xl text-base group transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/25"
            >
              Explore Adventures
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border font-semibold px-8 py-4 rounded-xl text-base transition-all hover:opacity-80"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Get in touch
            </Link>
          </div>
        </div>
      </FadeInSection>

      <Footer />
    </div>
  );
}
