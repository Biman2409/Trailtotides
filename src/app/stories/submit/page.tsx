"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mountain,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";

type FormData = {
  title: string;
  excerpt: string;
  body: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  dateOfAdventure: string;
  region: string;
  heroImageUrl: string;
};

const INITIAL: FormData = {
  title: "",
  excerpt: "",
  body: "",
  authorName: "",
  authorRole: "",
  authorBio: "",
  dateOfAdventure: "",
  region: "",
  heroImageUrl: "",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
      {children}
    </label>
  );
}

const inputClass =
  "w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 transition-colors";

export default function SubmitStoryPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stories/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 lg:px-8 bg-[#1a1f2e] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #ff510022 0%, transparent 50%), radial-gradient(circle at 80% 30%, #1e3d2f30 0%, transparent 50%)",
          }}
        />
        <div className="max-w-3xl mx-auto relative z-10">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/80 text-xs font-semibold uppercase tracking-widest mb-6 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Stories
          </Link>
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Share Your Story
          </p>
          <h1 className="text-white text-5xl lg:text-6xl font-bold tracking-tight leading-none mb-4">
            Tell us what<br />
            <span className="text-[#ff5100]">happened out there</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-xl">
            We feature stories from real adventurers — not travel bloggers, not influencers. If you&apos;ve done something remarkable, fill out the form below. Our team reviews every submission and reaches out to you personally if your story makes the cut.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">Story submitted!</h3>
              <p className="text-white/55 text-base leading-relaxed mb-8 max-w-md mx-auto">
                Thanks for sharing. Our team will review your submission and reach out within a few days if your story is a good fit.
              </p>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 bg-[#ff5100] text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all hover:bg-[#ff7d47] hover:-translate-y-0.5 group"
              >
                Read Other Stories
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-2xl px-5 py-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* About You */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-7 space-y-5">
                <div className="flex items-center gap-2.5 mb-1">
                  <User className="w-4 h-4 text-[#ff5100]" />
                  <h3 className="text-white font-semibold text-base">About You</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Your Name *</FieldLabel>
                    <input
                      name="authorName"
                      required
                      value={form.authorName}
                      onChange={handleChange}
                      placeholder="e.g. Nishant Ingle"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <FieldLabel>What kind of adventurer are you?</FieldLabel>
                    <input
                      name="authorRole"
                      value={form.authorRole}
                      onChange={handleChange}
                      placeholder="e.g. Solo biker, Freediver…"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Author Bio</FieldLabel>
                    <textarea
                      name="authorBio"
                      rows={3}
                      value={form.authorBio}
                      onChange={handleChange}
                      placeholder="A few lines about yourself — who you are, what drives you out there. This appears on your story page."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* The Adventure */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-7 space-y-5">
                <div className="flex items-center gap-2.5 mb-1">
                  <Mountain className="w-4 h-4 text-[#ff5100]" />
                  <h3 className="text-white font-semibold text-base">The Adventure</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <FieldLabel>Story Title *</FieldLabel>
                    <input
                      name="title"
                      required
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Riding the Photi La at 4,000m"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Short Excerpt *</FieldLabel>
                    <textarea
                      name="excerpt"
                      required
                      rows={3}
                      value={form.excerpt}
                      onChange={handleChange}
                      placeholder="1–2 sentences that capture the essence of the story. This appears on the story card."
                      className={`${inputClass} resize-none overflow-hidden`}
                    />
                  </div>
                  <div>
                    <FieldLabel>Adventure Date *</FieldLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                      <input
                        name="dateOfAdventure"
                        required
                        type="month"
                        value={form.dateOfAdventure}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Where did this happen? *</FieldLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                      <input
                        name="region"
                        required
                        value={form.region}
                        onChange={handleChange}
                        placeholder="e.g. Spiti Valley, Himachal Pradesh"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Hero Image URL</FieldLabel>
                    <div className="relative">
                      <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                      <input
                        name="heroImageUrl"
                        value={form.heroImageUrl}
                        onChange={handleChange}
                        placeholder="https://… (optional — we may use our own if left blank)"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Story */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-7 space-y-5">
                <div className="flex items-center gap-2.5 mb-1">
                  <FileText className="w-4 h-4 text-[#ff5100]" />
                  <h3 className="text-white font-semibold text-base">Your Story</h3>
                </div>
                <div>
                  <FieldLabel>Write it out *</FieldLabel>
                  <textarea
                    name="body"
                    required
                    rows={14}
                    value={form.body}
                    onChange={handleChange}
                    placeholder="Tell us everything. What happened, what you felt, what went wrong, what you learned. Don't hold back. Write it like you're telling a friend over a fire."
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-white/25 text-xs mt-1.5">No word limit. The best stories are honest and vivid.</p>
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
                    Submit Story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-white/30 text-xs text-center">
                By submitting, you confirm that this story is your own. We&apos;ll reach out via your account contact details if we&apos;d like to feature it.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
