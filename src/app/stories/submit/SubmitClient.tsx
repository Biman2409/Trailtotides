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
  X,
  Upload,
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

type UploadState = {
  status: "idle" | "uploading" | "done" | "error";
  url: string;
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

const inputClass =
  "w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 focus:ring-1 focus:ring-[#ff5100]/20 transition-all";

const textareaClass =
  "w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#ff5100]/60 focus:ring-1 focus:ring-[#ff5100]/20 transition-all resize-none";

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-6 pt-5 pb-3 border-b border-white/[0.05]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#ff5100]/10">
          <Icon className="w-3.5 h-3.5 text-[#ff5100]" />
        </div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-white/50 text-[11px] font-medium mb-1.5 uppercase tracking-wider">
      {children}
      {required && <span className="text-[#ff5100] ml-1">*</span>}
    </label>
  );
}

export default function SubmitStoryPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<UploadState>({ status: "idle", url: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpload({ status: "uploading", url: "" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/stories/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setUpload({ status: "error", url: data.error || "Upload failed" });
        return;
      }
      setUpload({ status: "done", url: data.url });
      setForm((prev) => ({ ...prev, heroImageUrl: data.url }));
    } catch {
      setUpload({ status: "error", url: "Upload failed. Try again." });
    }
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
    <div className="min-h-screen t-bg-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 40%, #ff5100 0%, transparent 50%), radial-gradient(circle at 75% 60%, #1e3d2f 0%, transparent 50%)",
          }}
        />
        <div className="max-w-3xl mx-auto relative">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
          <p className="text-[#ff5100] text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
            Share Your Story
          </p>
          <h1 className="text-white text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-3">
            Tell us what<br />
            <span className="text-[#ff5100]">happened out there</span>
          </h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-lg">
            Real stories from real adventurers. Fill out the form — our team reviews every submission.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-20 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-3xl p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Story submitted!</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-7 max-w-sm mx-auto">
                Our team will review your submission and reach out if it&apos;s a good fit.
              </p>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 bg-[#ff5100] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:bg-[#ff7d47] hover:-translate-y-0.5 group"
              >
                Read Stories
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* ── Section: About You ── */}
              <SectionCard icon={User} title="About You">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>Name</Label>
                    <input name="authorName" required value={form.authorName} onChange={handleChange} placeholder="e.g. Nishant Ingle" className={inputClass} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <input name="authorRole" value={form.authorRole} onChange={handleChange} placeholder="e.g. Solo biker" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Bio</Label>
                    <textarea name="authorBio" rows={2} value={form.authorBio} onChange={handleChange} placeholder="A few lines about yourself..." className={textareaClass} />
                  </div>
                </div>
              </SectionCard>

              {/* ── Section: The Adventure ── */}
              <SectionCard icon={Mountain} title="The Adventure">
                <div className="space-y-4">
                  <div>
                    <Label required>Title</Label>
                    <input name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Riding the Photi La at 4,000m" className={inputClass} />
                  </div>
                  <div>
                    <Label required>Excerpt</Label>
                    <textarea name="excerpt" required rows={2} value={form.excerpt} onChange={handleChange} placeholder="1–2 sentences capturing the essence..." className={textareaClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <Label required>Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                        <input name="dateOfAdventure" required type="text" value={form.dateOfAdventure} onChange={handleChange}
                          placeholder="e.g. July 2022"
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Label required>Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                        <input name="region" required value={form.region} onChange={handleChange} placeholder="e.g. Spiti Valley"
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div>
                    <Label>Hero photo</Label>
                    <div className="space-y-3">
                      {upload.status === "done" && form.heroImageUrl && (
                        <div className="relative rounded-xl overflow-hidden h-40 bg-black/40 border border-white/10">
                          <img src={form.heroImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setUpload({ status: "idle", url: "" }); setForm(p => ({ ...p, heroImageUrl: "" })); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/70 flex items-center justify-center hover:bg-black/90"
                          >
                            <X className="w-3.5 h-3.5 text-white/70" />
                          </button>
                        </div>
                      )}
                      <label className={`flex items-center justify-center gap-2.5 w-full border border-dashed rounded-xl px-4 py-3.5 cursor-pointer text-sm transition-all ${
                        upload.status === "uploading"
                          ? "border-[#ff5100]/50 text-[#ff5100] bg-[#ff5100]/5"
                          : upload.status === "done"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
                          : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/60 hover:bg-white/[0.02]"
                      }`}>
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileUpload} className="hidden" disabled={upload.status === "uploading"} />
                        {upload.status === "uploading" ? (
                          <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading…</>
                        ) : upload.status === "done" ? (
                          <><Upload className="w-4 h-4" />Photo uploaded — or upload another</>
                        ) : (
                          <><Upload className="w-4 h-4" />Upload photo from device</>
                        )}
                      </label>
                      {upload.status === "error" && <p className="text-red-400 text-xs">{upload.url}</p>}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-white/15 text-[10px] uppercase tracking-wider font-medium">or paste URL</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                      </div>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                        <input name="heroImageUrl" value={form.heroImageUrl} onChange={handleChange} placeholder="https://..." className={`${inputClass} pl-9 text-xs`} />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* ── Section: Your Story ── */}
              <SectionCard icon={FileText} title="Your Story">
                <div>
                  <Label required>Story body</Label>
                  <textarea name="body" required rows={12} value={form.body} onChange={handleChange}
                    placeholder="Tell us everything. What happened, what you felt, what went wrong, what you learned. Don't hold back."
                    className={textareaClass}
                  />
                  <p className="text-white/20 text-[10px] mt-1.5">No word limit. Honest and vivid wins.</p>
                </div>
              </SectionCard>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/20 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting…
                  </span>
                ) : (
                  <>
                    Submit Story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}