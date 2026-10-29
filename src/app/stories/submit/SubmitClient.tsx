"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import { STORY_ACTIVITIES, readMinutes, wordCount } from "@/lib/storyView";
import ActivityPicker from "./ActivityPicker";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Calendar, Image as ImageIcon, MapPin, X, Upload,
  PenLine, ShieldCheck, Send, Lightbulb, Loader2, Check,
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
  activity: string;
  heroImageUrl: string;
};
type Field = keyof FormData | "consent";

const INITIAL: FormData = {
  title: "", excerpt: "", body: "", authorName: "", authorRole: "", authorBio: "",
  dateOfAdventure: "", region: "", activity: "", heroImageUrl: "",
};

const DRAFT_KEY = "ttt_story_draft";
const MIN_WORDS = 80;
const EXCERPT_MAX = 300;
const serif = { fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 } as const;

const inputClass =
  "w-full rounded-xl px-4 py-3 text-[15px] border focus:outline-none focus:border-[#ff5100]/60 focus:ring-2 focus:ring-[#ff5100]/15 transition-all";
const inputStyle = (bad?: boolean): React.CSSProperties => ({
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  borderColor: bad ? "rgba(239,68,68,0.6)" : "var(--border-subtle)",
});

function isHttpsUrl(s: string) {
  try { return new URL(s).protocol === "https:"; } catch { return false; }
}

function validate(f: FormData, consent: boolean): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (!f.title.trim()) e.title = "Give your story a title.";
  if (!f.region.trim()) e.region = "Where did it happen?";
  if (!f.dateOfAdventure.trim()) e.dateOfAdventure = "Roughly when? A month and year is fine.";
  if (!STORY_ACTIVITIES.includes(f.activity)) e.activity = "Pick the kind of trip. Search if you don't see it.";
  if (!f.heroImageUrl.trim()) e.heroImageUrl = "Add one photo from the trip. It leads your story.";
  else if (!isHttpsUrl(f.heroImageUrl.trim())) e.heroImageUrl = "That link doesn't look right. Use one starting with https://";
  if (!f.excerpt.trim()) e.excerpt = "Sum it up in a line or two.";
  else if (f.excerpt.length > EXCERPT_MAX) e.excerpt = `Keep it under ${EXCERPT_MAX} characters.`;
  const words = wordCount(f.body);
  if (words < MIN_WORDS) e.body = `A little more, please: at least ${MIN_WORDS} words (you have ${words}).`;
  if (!f.authorName.trim()) e.authorName = "Who's telling it?";
  if (!f.authorRole.trim()) e.authorRole = "A few words readers see under your name, like \"Weekend biker from Pune\".";
  if (f.authorBio.trim().length < 20) e.authorBio = "Tell readers a little about yourself (a sentence or two).";
  if (!consent) e.consent = "Please confirm this before sending.";
  return e;
}

// The order fields appear in, so we can scroll to the first one with a problem
const FIELD_ORDER: Field[] = ["title", "region", "dateOfAdventure", "activity", "heroImageUrl", "excerpt", "body", "authorName", "authorRole", "authorBio", "consent"];

function Label({ htmlFor, children, required, hint }: { htmlFor?: string; children: React.ReactNode; required?: boolean; hint?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
        {children}
        {required ? <span className="sr-only"> (required)</span> : <span className="ml-1.5 text-[12px] font-normal" style={{ color: "var(--text-tertiary)" }}>optional</span>}
      </label>
      {hint && <span className="text-[12px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{hint}</span>}
    </div>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="text-[12.5px] mt-1.5" style={{ color: "#ef4444" }}>{msg}</p>;
}

function Step({ n, title, sub, children }: { n: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <header className="flex items-start gap-3.5 px-5 sm:px-7 pt-6 pb-5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 text-white" style={{ background: "#ff5100" }}>{n}</span>
        <div>
          <h2 className="text-xl" style={{ ...serif, color: "var(--text-primary)" }}>{title}</h2>
          <p className="text-[13.5px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{sub}</p>
        </div>
      </header>
      <div className="px-5 sm:px-7 py-6 space-y-5">{children}</div>
    </section>
  );
}

export default function SubmitStoryPage({ liveTypes }: { liveTypes: string[] }) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [tried, setTried] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ status: "idle" | "uploading" | "error"; msg?: string }>({ status: "idle" });
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const restored = useRef(false);

  // Bring back an unsent draft, then fill the name from the account if it's still empty
  useEffect(() => {
    let draft: Partial<FormData> | null = null;
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) draft = JSON.parse(raw); } catch {}
    if (draft) setForm((f) => ({ ...f, ...draft }));
    restored.current = true;

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      setSignedIn(!!u);
      if (!u) return;
      const name = u.user_metadata?.full_name || "";
      if (name) setForm((f) => (f.authorName ? f : { ...f, authorName: name }));
    });
  }, []);

  // Save the draft as they type, so a closed tab doesn't cost them the story
  useEffect(() => {
    if (!restored.current || submitted) return;
    const t = setTimeout(() => {
      try {
        const empty = Object.values(form).every((v) => !v.trim());
        if (empty) localStorage.removeItem(DRAFT_KEY);
        else { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); setDraftSaved(true); }
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [form, submitted]);

  // Once they've tried to send, keep the messages in step with what they fix
  useEffect(() => { if (tried) setErrors(validate(form, consent)); }, [form, consent, tried]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDraftSaved(false);
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.target.name as keyof FormData, e.target.value);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setUpload({ status: "error", msg: "That photo is over 8 MB. Try a smaller one." }); return; }
    setUpload({ status: "uploading" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/stories/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) { setUpload({ status: "error", msg: data.error || "Upload failed. Try again." }); return; }
      setUpload({ status: "idle" });
      set("heroImageUrl", data.url);
    } catch {
      setUpload({ status: "error", msg: "Upload failed. Check your connection and try again." });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    setServerError(null);
    const found = validate(form, consent);
    setErrors(found);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      const el = document.getElementById(`f-${first}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLInputElement | null)?.focus({ preventScroll: true });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stories/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setServerError(data.error || "Something went wrong. Please try again."); return; }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Couldn't reach us. Your draft is saved on this device, so try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setForm((f) => ({ ...INITIAL, authorName: f.authorName, authorRole: f.authorRole, authorBio: f.authorBio }));
    setConsent(false); setTried(false); setErrors({}); setSubmitted(false);
    window.scrollTo({ top: 0 });
  }

  function discardDraft() {
    if (!confirm("Clear everything you've written here?")) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setForm(INITIAL); setConsent(false); setTried(false); setErrors({}); setDraftSaved(false);
  }

  const words = wordCount(form.body);
  const err = (f: Field) => errors[f];
  const aria = (f: Field) => ({ id: `f-${f}`, "aria-invalid": !!errors[f] || undefined, "aria-describedby": errors[f] ? `e-${f}` : undefined });
  const hasContent = Object.values(form).some((v) => v.trim());

  return (
    <div className="min-h-screen t-bg-page topo">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 lg:pt-28 pb-8 sm:pb-10 px-5 lg:px-8" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.07), transparent 85%)" }}>
        <SectionTexture kind="trail" color="#ff5100" at="85% 20%" opacity={0.08} />
        <div className="relative max-w-6xl mx-auto">
          <Link href="/stories" className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-5 transition-colors hover:text-[#ff5100] group" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Stories
          </Link>
          <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-ink)" }}>Share your story</p>
          <h1 className="text-[38px] sm:text-5xl lg:text-6xl t-text leading-[1.04]" style={{ ...serif, letterSpacing: "-0.025em" }}>
            {submitted ? "Thank you. It's with us." : "Tell us what happened out there"}
          </h1>
          {!submitted && (
            <p className="text-[16px] sm:text-[18px] leading-[1.55] t-text-2 mt-4 max-w-2xl">
              The road that went wrong, the summit that nearly broke you, the silence that said everything. Write it the way you&apos;d tell a friend. We read every story ourselves.
            </p>
          )}
        </div>
      </section>

      <section className="pb-20 px-5 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {submitted ? (
            <div className="max-w-2xl rounded-3xl p-7 sm:p-10" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5" style={{ background: "var(--accent-green-soft)", border: "1px solid var(--accent-green-border)" }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: "var(--accent-green)" }} />
              </div>
              <p className="text-[15.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>&ldquo;{form.title}&rdquo;</strong> is in the review queue. Here&apos;s what happens next:
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  { icon: ShieldCheck, t: "An editor reads it", d: "Usually within a few days. We may fix typos or trim for length, never your voice." },
                  { icon: Send, t: "It goes live", d: signedIn ? "It appears on the Stories page under your name, and on your profile." : "It appears on the Stories page under the name you gave." },
                ].map((s) => (
                  <li key={s.t} className="flex gap-3.5">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.12)" }}>
                      <s.icon className="w-4 h-4" style={{ color: "var(--accent-ink)" }} />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>{s.t}</p>
                      <p className="text-[13.5px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/stories" className="group inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all">
                  Read other stories <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <button type="button" onClick={startOver} className="inline-flex items-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm transition-colors hover:border-[#ff5100]/50"
                  style={{ color: "var(--text-primary)", border: "1px solid var(--border-default)" }}>
                  <PenLine className="w-4 h-4" /> Write another
                </button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-10 items-start">
              <form onSubmit={handleSubmit} noValidate className="space-y-6 min-w-0">
                {signedIn === false && (
                  <p className="rounded-xl px-4 py-3 text-[13.5px]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                    <Link href="/auth/login?next=/stories/submit" className="font-semibold hover:underline" style={{ color: "var(--accent-ink)" }}>Log in</Link> to have the story show on your profile with your avatar. You can also send it without an account.
                  </p>
                )}

                {/* 1 — The trip */}
                <Step n={1} title="The trip" sub="Where you went, when, and one photo that sums it up.">
                  <div>
                    <Label htmlFor="f-title" required hint={`${form.title.length}/120`}>Title</Label>
                    <input name="title" maxLength={120} value={form.title} onChange={onChange} placeholder="The night Photi La tested us" className={inputClass} style={inputStyle(!!err("title"))} {...aria("title")} />
                    <FieldError id="e-title" msg={err("title")} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="f-region" required>Where</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
                        <input name="region" maxLength={100} value={form.region} onChange={onChange} placeholder="Spiti Valley" className={`${inputClass} pl-10`} style={inputStyle(!!err("region"))} {...aria("region")} />
                      </div>
                      <FieldError id="e-region" msg={err("region")} />
                    </div>
                    <div>
                      <Label htmlFor="f-dateOfAdventure" required>When</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
                        <input name="dateOfAdventure" maxLength={50} value={form.dateOfAdventure} onChange={onChange} placeholder="July 2025" className={`${inputClass} pl-10`} style={inputStyle(!!err("dateOfAdventure"))} {...aria("dateOfAdventure")} />
                      </div>
                      <FieldError id="e-dateOfAdventure" msg={err("dateOfAdventure")} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="f-activity" required>What kind of trip</Label>
                    <ActivityPicker id="f-activity" value={form.activity} onChange={(v) => set("activity", v)} live={liveTypes}
                      invalid={!!err("activity")} describedBy={err("activity") ? "e-activity" : undefined} />
                    <FieldError id="e-activity" msg={err("activity")} />
                  </div>

                  {/* Photo */}
                  <div>
                    <Label htmlFor="f-heroImageUrl" required>Cover photo</Label>
                    {form.heroImageUrl && isHttpsUrl(form.heroImageUrl) ? (
                      <div className="relative rounded-xl overflow-hidden aspect-[16/9]" style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied image URL on any host */}
                        <img src={form.heroImageUrl} alt="Your cover photo" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => set("heroImageUrl", "")} aria-label="Remove photo"
                          className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-semibold text-white backdrop-blur-md"
                          style={{ background: "rgba(0,0,0,0.6)" }}>
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <label
                          className={`flex flex-col items-center justify-center gap-2 w-full rounded-xl px-4 py-8 text-center transition-colors ${upload.status === "uploading" ? "cursor-wait" : "cursor-pointer hover:border-[#ff5100]/50"}`}
                          style={{ border: `1.5px dashed ${err("heroImageUrl") ? "rgba(239,68,68,0.6)" : "var(--border-default)"}`, background: "var(--bg-card)" }}>
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="sr-only" disabled={upload.status === "uploading"} />
                          {upload.status === "uploading"
                            ? <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-ink)" }} />
                            : <Upload className="w-6 h-6" style={{ color: "var(--accent-ink)" }} />}
                          <span className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                            {upload.status === "uploading" ? "Uploading…" : "Upload a photo"}
                          </span>
                          <span className="text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>JPG, PNG or WebP, up to 8 MB. Landscape works best.</span>
                        </label>
                        {upload.status === "error" && <p className="text-[12.5px] mt-1.5" style={{ color: "#ef4444" }}>{upload.msg}</p>}
                        <div className="flex items-center gap-3 my-3">
                          <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
                          <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-tertiary)" }}>or paste a link</span>
                          <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
                        </div>
                        <div className="relative">
                          <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
                          <input name="heroImageUrl" type="url" inputMode="url" value={form.heroImageUrl} onChange={onChange} placeholder="https://…" className={`${inputClass} pl-10 text-[14px]`} style={inputStyle(!!err("heroImageUrl"))} {...aria("heroImageUrl")} />
                        </div>
                      </>
                    )}
                    <FieldError id="e-heroImageUrl" msg={err("heroImageUrl")} />
                    <p className="text-[12px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>Only use a photo you took, or one you have permission to share.</p>
                  </div>
                </Step>

                {/* 2 — The story */}
                <Step n={2} title="Your story" sub="Start with a hook, then tell it straight.">
                  <div>
                    <Label htmlFor="f-excerpt" required hint={<span style={{ color: form.excerpt.length > EXCERPT_MAX ? "#ef4444" : undefined }}>{form.excerpt.length}/{EXCERPT_MAX}</span>}>The hook</Label>
                    <textarea name="excerpt" rows={2} value={form.excerpt} onChange={onChange}
                      placeholder="One or two lines that make someone want to read the rest."
                      className={`${inputClass} resize-none`} style={inputStyle(!!err("excerpt"))} {...aria("excerpt")} />
                    <FieldError id="e-excerpt" msg={err("excerpt")} />
                  </div>
                  <div>
                    <Label htmlFor="f-body" required hint={<>{words} {words === 1 ? "word" : "words"}{words > 0 && <> · {readMinutes(form.body)} min read</>}</>}>The story</Label>
                    <textarea name="body" rows={16} value={form.body} onChange={onChange}
                      placeholder={"What happened, what you felt, what went wrong, what you learned.\n\nEach new line becomes a new paragraph."}
                      className={`${inputClass} resize-y leading-relaxed min-h-[320px]`} style={inputStyle(!!err("body"))} {...aria("body")} />
                    <FieldError id="e-body" msg={err("body")} />
                    {!err("body") && (
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }} aria-hidden>
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (words / MIN_WORDS) * 100)}%`, background: words >= MIN_WORDS ? "var(--accent-green)" : "#ff5100" }} />
                      </div>
                    )}
                  </div>
                </Step>

                {/* 3 — About you */}
                <Step n={3} title="About you" sub="How you'll be credited on the story.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="f-authorName" required>Name</Label>
                      <input name="authorName" maxLength={100} value={form.authorName} onChange={onChange} placeholder="Your name" autoComplete="name" className={inputClass} style={inputStyle(!!err("authorName"))} {...aria("authorName")} />
                      <FieldError id="e-authorName" msg={err("authorName")} />
                    </div>
                    <div>
                      <Label htmlFor="f-authorRole" required hint={`${form.authorRole.length}/60`}>Tagline</Label>
                      <input name="authorRole" maxLength={60} value={form.authorRole} onChange={onChange} placeholder="Weekend biker from Pune" className={inputClass} style={inputStyle(!!err("authorRole"))} {...aria("authorRole")} />
                      <FieldError id="e-authorRole" msg={err("authorRole")} />
                      <p className="text-[12px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>Shown under your name on the story and its card.</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="f-authorBio" required hint={`${form.authorBio.length}/400`}>Short bio</Label>
                    <textarea name="authorBio" rows={3} maxLength={400} value={form.authorBio} onChange={onChange} placeholder="Where you're from, what gets you outdoors, how long you've been at it." className={`${inputClass} resize-none`} style={inputStyle(!!err("authorBio"))} {...aria("authorBio")} />
                    <FieldError id="e-authorBio" msg={err("authorBio")} />
                    <p className="text-[12px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>Appears in the &ldquo;Written by&rdquo; box at the end of your story.</p>
                  </div>
                </Step>

                {/* Consent and send */}
                <div className="rounded-2xl px-5 sm:px-7 py-5" style={{ background: "var(--bg-surface)", border: `1px solid ${err("consent") ? "rgba(239,68,68,0.6)" : "var(--border-subtle)"}` }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input id="f-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-[#ff5100]" aria-describedby={err("consent") ? "e-consent" : undefined} />
                    <span className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      This is my own story and photo. Trail to Tides may publish it and make light edits for length and clarity, as set out in the <Link href="/terms" target="_blank" className="underline hover:text-[#ff5100]">terms</Link>.
                    </span>
                  </label>
                  <FieldError id="e-consent" msg={err("consent")} />
                </div>

                {serverError && (
                  <div role="alert" className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
                    {serverError}
                  </div>
                )}
                {tried && Object.keys(errors).length > 0 && (
                  <p role="alert" className="text-[13px]" style={{ color: "#ef4444" }}>A few things need a look before this can go. They&apos;re marked above.</p>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
                  <p className="text-[12.5px] sm:mr-auto flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                    {draftSaved && hasContent && <><Check className="w-3.5 h-3.5" style={{ color: "var(--accent-green)" }} /> Draft saved on this device</>}
                    {hasContent && <button type="button" onClick={discardDraft} className="ml-2 underline hover:text-[#ff5100]">Clear</button>}
                  </p>
                  <button type="submit" disabled={loading || upload.status === "uploading"}
                    className="group bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-7 py-3.5 rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ boxShadow: "0 6px 18px rgba(255,81,0,0.25)" }}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Send for review <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                  </button>
                </div>
              </form>

              {/* Sidebar: a live preview of the card, and what makes a good story */}
              <aside className="lg:sticky lg:top-28 space-y-5">
                <div>
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.18em] mb-2.5" style={{ color: "var(--text-tertiary)" }}>Preview</p>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                    <div className="relative aspect-[4/3]" style={{ background: "var(--bg-surface-2)" }}>
                      {form.heroImageUrl && isHttpsUrl(form.heroImageUrl)
                        // eslint-disable-next-line @next/next/no-img-element -- user-supplied image URL on any host
                        ? <img src={form.heroImageUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8" style={{ color: "var(--border-default)" }} /></span>}
                      {form.activity && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] text-white" style={{ background: "rgba(10,8,6,0.6)" }}>
                          {ADVENTURE_TYPE_ICONS[form.activity]?.(11)}{form.activity}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5 truncate" style={{ color: "var(--accent-ink)" }}>
                        <MapPin className="w-3 h-3 shrink-0" />{form.region || "Where"}<span className="opacity-50">·</span>{form.dateOfAdventure || "When"}
                      </p>
                      <p className="text-[18px] leading-snug line-clamp-2" style={{ ...serif, color: form.title ? "var(--text-primary)" : "var(--text-tertiary)" }}>{form.title || "Your title"}</p>
                      <p className="text-[13px] leading-relaxed line-clamp-3 mt-1.5" style={{ color: "var(--text-secondary)" }}>{form.excerpt || "Your hook shows here."}</p>
                      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <p className="text-[12.5px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{form.authorName || "Your name"}</p>
                        <p className="text-[14px] truncate leading-tight" style={{ fontFamily: "var(--font-script), cursive", fontWeight: 600, color: "var(--text-tertiary)" }}>{form.authorRole || "Your tagline"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <p className="flex items-center gap-2 text-[14px] font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                    <Lightbulb className="w-4 h-4" style={{ color: "var(--accent-ink)" }} /> What makes a good story
                  </p>
                  <ul className="space-y-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {[
                      "Start in the middle of the action, not at the airport.",
                      "The details only you saw: a smell, a name, a sound.",
                      "What went wrong. That's usually the best part.",
                      "Something useful for the next person who goes.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2"><span className="mt-[9px] w-1 h-1 rounded-full shrink-0 bg-[#ff5100]" />{t}</li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
