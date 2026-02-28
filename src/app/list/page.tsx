"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2,
  ArrowRight,
  BadgeCheck,
  Users,
  Map,
  Sparkles,
  ChevronRight,
  Mountain,
  Mail,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Submit your adventure",
    description: "Fill out the form below with all the details about your adventure — location, type, difficulty, best season, and what makes it special.",
  },
  {
    number: "02",
    title: "We review & verify",
    description: "Our team reviews your submission, validates operator credentials, and verifies safety protocols. This usually takes 3–5 business days.",
  },
  {
    number: "03",
    title: "Go live on TRAIL TO TIDES",
    description: "Once verified, your adventure is published on our platform — discoverable by thousands of adventure seekers across India.",
  },
];

const BENEFITS = [
  {
    icon: Users,
    title: "Reach serious adventurers",
    description: "Our audience is curated — people actively planning their next adventure, not casual browsers.",
  },
  {
    icon: BadgeCheck,
    title: "Earn the verified badge",
    description: "Verified operators get a prominent trust badge that increases booking confidence significantly.",
  },
  {
    icon: Map,
    title: "Pinned on the India map",
    description: "Your adventure appears on our interactive India map, giving it geographic discovery alongside search.",
  },
      {
        icon: Sparkles,
        title: "Featured in AI recommendations",
        description: "Our TRAIL TO TIDES recommends adventures to users. Verified listings are prioritised in AI results.",
      },

];

type FormData = {
  operatorName: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  adventureName: string;
  adventureType: string;
  region: string;
  state: string;
  difficulty: string;
  duration: string;
  bestSeason: string;
  description: string;
  certifications: string;
  message: string;
};

const INITIAL: FormData = {
  operatorName: "",
  website: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  adventureName: "",
  adventureType: "",
  region: "",
  state: "",
  difficulty: "",
  duration: "",
  bestSeason: "",
  description: "",
  certifications: "",
  message: "",
};

export default function ListPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-8 bg-[#1a1f2e] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #ff510022 0%, transparent 50%), radial-gradient(circle at 80% 30%, #1e3d2f30 0%, transparent 50%)",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            For Operators
          </p>
          <h1 className="text-white text-5xl lg:text-7xl font-bold tracking-tight leading-none mb-6 max-w-3xl">
            List Your Adventure
          </h1>
          <p className="text-white/55 text-xl max-w-2xl leading-relaxed">
            Join India&apos;s most trusted adventure discovery platform. Get your experiences in front of serious adventurers — verified, mapped, and TRAIL TO TIDES-recommended.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/25 group"
            >
              Apply Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="mailto:list@trailtotides.com"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-[#111820]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            The Process
          </p>
          <h2 className="text-white text-4xl font-bold tracking-tight mb-14">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#ff5100]/15 border border-[#ff5100]/25 flex items-center justify-center shrink-0">
                    <span className="text-[#ff5100] font-bold text-sm tracking-wider">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-[#1a1f2e] border-t border-white/6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            Why List With Us
          </p>
          <h2 className="text-white text-4xl font-bold tracking-tight mb-14">What you get</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-[#ff5100]/30 hover:bg-white/6 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ff5100]/15 flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-[#ff5100]" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{benefit.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification standards */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-[#111820] border-t border-white/6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
                Our Standards
              </p>
              <h2 className="text-white text-4xl font-bold tracking-tight mb-6">
                What we verify before listing
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                We maintain strict standards to protect adventurers. Every operator on TRAIL TO TIDES is independently reviewed — not just listed.
              </p>
              <ul className="space-y-4">
                {[
                  "Valid government permits & operator licenses",
                  "ATOAI / IMF / PADI / relevant certification",
                  "Certified and trained local guides on staff",
                  "Safety gear and evacuation protocols",
                  "On-ground review by our team (for select listings)",
                  "Consistent track record over 2+ seasons",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1a1f2e] rounded-3xl p-8 border border-white/8">
              <div className="flex items-center gap-3 mb-6">
                <Mountain className="w-6 h-6 text-[#ff5100]" />
                <span className="text-white font-semibold text-lg">Verification Tiers</span>
              </div>
              <div className="space-y-5">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-sm">Verified Operator</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Full credential check, on-ground review, prominent badge on all listings. Highest discovery priority.
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-sm">Community Listed</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Listed but not yet independently verified. Clearly marked. A starting point before full verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-20 lg:py-28 px-6 lg:px-8 bg-[#1a1f2e] border-t border-white/6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            Apply
          </p>
          <h2 className="text-white text-4xl font-bold tracking-tight mb-3">
            List your adventure
          </h2>
          <p className="text-white/45 text-base mb-10">
            Fill out the form below and we&apos;ll be in touch within 3–5 business days.
          </p>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">Application received!</h3>
              <p className="text-white/55 text-base leading-relaxed mb-8 max-w-md mx-auto">
                Thanks for applying. Our team will review your submission and get back to you within 3–5 business days.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-[#ff5100] text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all hover:bg-[#ff7d47] hover:-translate-y-0.5 group"
              >
                Explore Adventures
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Operator details */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-7 space-y-5">
                <h3 className="text-white font-semibold text-base">Operator Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Operator / Company Name *</label>
                    <input
                      name="operatorName"
                      required
                      value={form.operatorName}
                      onChange={handleChange}
                      placeholder="e.g. Himalayan Adventures Pvt. Ltd."
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Website</label>
                    <input
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Contact Name *</label>
                    <input
                      name="contactName"
                      required
                      value={form.contactName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Contact Email *</label>
                    <input
                      name="contactEmail"
                      required
                      type="email"
                      value={form.contactEmail}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Phone</label>
                    <input
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Certifications / Memberships</label>
                    <input
                      name="certifications"
                      value={form.certifications}
                      onChange={handleChange}
                      placeholder="e.g. ATOAI, IMF, PADI"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Adventure details */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-7 space-y-5">
                <h3 className="text-white font-semibold text-base">Adventure Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Adventure Name *</label>
                    <input
                      name="adventureName"
                      required
                      value={form.adventureName}
                      onChange={handleChange}
                      placeholder="e.g. Hampta Pass Trek"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Type *</label>
                    <select
                      name="adventureType"
                      required
                      value={form.adventureType}
                      onChange={handleChange}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    >
                      <option value="">Select type</option>
                      {["Trekking","Biking","Cycling","Mountaineering","Rock Climbing","Jeep Safari","Camel Safari","Caving","Sandboarding","Urban Adventure","Diving","Kayaking","Skiing"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Region *</label>
                    <select
                      name="region"
                      required
                      value={form.region}
                      onChange={handleChange}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    >
                      <option value="">Select region</option>
                      {["Himalayas","Western Ghats","Eastern Ghats","Desert","Coast","Islands","Northeast","Urban"].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">State *</label>
                    <input
                      name="state"
                      required
                      value={form.state}
                      onChange={handleChange}
                      placeholder="e.g. Himachal Pradesh"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Difficulty *</label>
                    <select
                      name="difficulty"
                      required
                      value={form.difficulty}
                      onChange={handleChange}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    >
                      <option value="">Select difficulty</option>
                      {["Beginner","Intermediate","Advanced","Expert","Extreme"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Duration</label>
                    <select
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    >
                      <option value="">Select duration</option>
                      {["Weekend","3–5 days","7+ days"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Best Season</label>
                    <input
                      name="bestSeason"
                      value={form.bestSeason}
                      onChange={handleChange}
                      placeholder="e.g. Oct – Jun"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Short Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the adventure in 2–4 sentences. What makes it special? Who is it for?"
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Anything else you&apos;d like us to know?</label>
                    <textarea
                      name="message"
                      rows={3}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Any additional context, certifications you hold, or specific requests."
                      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/25 group"
              >
                {loading ? (
                  <span>Submitting…</span>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-white/30 text-xs text-center">
                By submitting, you agree to our review process and{" "}
                <Link href="/terms" className="text-white/50 hover:text-[#ff5100] transition-colors">
                  Terms of Use
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
