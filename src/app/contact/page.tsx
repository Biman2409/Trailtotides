"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, MapPin, Instagram, Youtube, Twitter, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const TOPICS = [
  "General enquiry",
  "List an adventure / operator",
  "Report an issue",
  "Partnership",
  "Press & media",
  "Feedback",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-8 bg-[#1a1f2e]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Get in Touch
          </p>
          <h1 className="text-white text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-white/50 text-lg max-w-xl">
            Have a question, want to list an adventure, or just want to talk trips? We read every message.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-6 lg:px-8 bg-[#111820]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-14">

          {/* Contact info sidebar */}
          <div className="space-y-8">
            <div>
              <h3 className="text-white font-semibold text-base mb-4">Reach us directly</h3>
              <div className="space-y-4">
                <a
                  href="mailto:hello@trailtotides.com"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center group-hover:border-[#ff5100]/40 transition-colors">
                    <Mail className="w-4 h-4 text-[#ff5100]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">General</p>
                    <p className="text-sm">hello@trailtotides.com</p>
                  </div>
                </a>
                <a
                  href="mailto:list@trailtotides.com"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center group-hover:border-[#ff5100]/40 transition-colors">
                    <Mail className="w-4 h-4 text-[#ff5100]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Operators</p>
                    <p className="text-sm">list@trailtotides.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 text-white/60">
                  <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#ff5100]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Based in</p>
                    <p className="text-sm">Mumbai, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-base mb-4">Follow us</h3>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-[#ff5100]/10 border border-[#ff5100]/20 rounded-2xl p-5">
              <p className="text-[#ff5100] text-xs font-semibold uppercase tracking-wider mb-2">For operators</p>
              <p className="text-white/55 text-sm leading-relaxed mb-3">
                Want to list your adventure on TRAIL TO TIDES?
              </p>
              <Link
                href="/list"
                className="flex items-center gap-1.5 text-[#ff5100] text-xs font-semibold hover:text-[#e07845] transition-colors"
              >
                Apply to list <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-3xl p-14 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-3">Message sent!</h3>
                <p className="text-white/55 text-base leading-relaxed max-w-sm mx-auto">
                  Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/55 text-xs font-medium mb-2 uppercase tracking-wide">Your Name *</label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/55 text-xs font-medium mb-2 uppercase tracking-wide">Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/55 text-xs font-medium mb-2 uppercase tracking-wide">Topic</label>
                  <select
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors"
                  >
                    <option value="">Select a topic</option>
                    {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/55 text-xs font-medium mb-2 uppercase tracking-wide">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-60 text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 group transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/25"
                >
                  {loading ? "Sending…" : (
                    <>Send Message <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
