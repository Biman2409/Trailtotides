import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Mountain, Map, Sparkles, BadgeCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Trail to Tides is India's adventure discovery platform — built by explorers for explorers. Learn about our mission, values, and the team behind it.",
  openGraph: {
    title: "About Trail to Tides",
    description: "Built by explorers for explorers. Learn about our mission, values, and the team behind India's adventure discovery platform.",
    url: "https://trailtotides.com/about",
    images: [{ url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90", width: 1200, height: 630, alt: "About Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Trail to Tides",
    description: "Built by explorers for explorers — India's adventure discovery platform.",
    images: ["https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90"],
  },
  alternates: { canonical: "https://trailtotides.com/about" },
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
      description: "Built to help you find the adventure that fits you — not to push the most commercially popular one. TRAIL TO TIDES is our commitment to personalised discovery.",
    },
  {
    icon: Users,
    title: "Community-built",
    description: "Stories, operator reviews, and local knowledge come from real adventurers in the community. We platform the people who've been out there.",
  },
];

const TEAM = [
  {
    name: "Arjun Mehta",
    role: "Co-founder · Trail runner & trekker",
    bio: "Former software engineer who left a tech job to trek the length of the Western Ghats. Built TRAIL TO TIDES after spending two years frustrated by the lack of reliable information for Indian adventures.",
    initial: "A",
    adventures: "47 adventures completed",
  },
  {
    name: "Priya Nair",
    role: "Co-founder · Diver & coastal explorer",
    bio: "Marine biologist and PADI Divemaster. Has dived in the Andamans, Lakshadweep, and the Malabar coast. Handles operator verification and the water-based section of the platform.",
    initial: "P",
    adventures: "PADI Divemaster · 12 years underwater",
  },
  {
    name: "Vikram Singh",
    role: "Lead Rider · Biking & Himalayan routes",
    bio: "Motorcycle journalist and long-distance rider. Has ridden Manali–Leh five times and the Zanskar route twice. Responsible for all biking content and operator relationships in Ladakh.",
    initial: "V",
    adventures: "60,000+ km ridden across India",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=2000&q=80"
            alt="Adventure background"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#111820]/95 via-[#111820]/80 to-[#111820]" />
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
              Find, assess, and book India&apos;s finest adventures — matched to your body, guided by AI, run by verified operators.
            </p>
        </div>
      </section>

      {/* Origin */}
      <section className="py-20 px-6 lg:px-8 t-bg-surface2 border-t border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-4">
            The Origin
          </p>
          <div className="space-y-6 text-white/65 text-lg leading-relaxed font-light">
            <p>
              India has more adventure than almost anywhere on Earth. The Himalayas alone have more trekking routes than most countries have roads. The Andamans hold some of the healthiest reefs left in the Indian Ocean. The Deccan plateau hides rivers no one has kayaked. The Rann of Kutch turns into a salt desert unlike anything else in Asia.
            </p>
            <p>
              And yet, for years, planning an adventure in India meant wading through outdated blogs, WhatsApp groups, and operator websites designed in 2009. You couldn&apos;t easily compare what was out there, couldn&apos;t verify who was safe to book with, and couldn&apos;t find a single place where someone had mapped the whole thing.
            </p>
            <p>
              We built TRAIL TO TIDES to fix that. A platform where every adventure is described properly, every operator is checked, and every recommendation is grounded in real experience — not affiliate commissions.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 t-bg-page border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            What We Stand For
          </p>
          <h2 className="text-white text-4xl font-bold tracking-tight mb-14">Our values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-[#ff5100]/30 hover:bg-white/6 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ff5100]/15 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-[#ff5100]" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{v.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 t-bg-surface2 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            The Team
          </p>
          <h2 className="text-white text-4xl font-bold tracking-tight mb-3">
            People who&apos;ve been there
          </h2>
          <p className="text-white/45 text-base mb-14 max-w-xl">
            Everyone who works on TRAIL TO TIDES has done the adventures. No desk-bound curation here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white/4 border border-white/8 rounded-2xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-[#ff5100]/20 flex items-center justify-center text-2xl font-bold text-[#ff5100] mb-5">
                  {member.initial}
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-[#ff5100] text-xs font-medium mb-4">{member.role}</p>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{member.bio}</p>
                <p className="text-white/25 text-xs border-t border-white/8 pt-4">{member.adventures}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 lg:px-8 t-bg-page border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "287", label: "Adventures catalogued" },
              { value: "8", label: "Regions covered" },
              { value: "48+", label: "Verified operators" },
              { value: "2026", label: "Year founded" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-[#ff5100] text-5xl font-bold mb-2">{value}</div>
                <div className="text-white/40 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8 t-bg-surface2 border-t border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white text-4xl font-bold tracking-tight mb-5">
            Ready to find your adventure?
          </h2>
          <p className="text-white/50 text-base mb-8">
            287 adventures across India, waiting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-8 py-4 rounded-xl text-base group transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/25"
            >
              Explore Adventures
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
