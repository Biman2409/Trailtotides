"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowRight, Check, Copy, Instagram, Youtube, Twitter, MapPin, Clock, Mail, MessageCircle, Mountain, Handshake, Newspaper, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import { sendContactMessage } from "./actions";
import { CONTACT_TOPICS } from "./topics";

const INBOX = "hello@trailtotides.com";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// One stamp per topic: the postcard's stamp changes as you pick
const TOPIC_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "A trip question": MessageCircle,
  "Listing my adventures": Mountain,
  "Partnership": Handshake,
  "Press": Newspaper,
  "Report a problem": AlertTriangle,
  "Feedback": Sparkles,
};

type Field = "name" | "email" | "message";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<{ text: string; field?: Field } | null>(null);
  const [copied, setCopied] = useState(false);
  const [today, setToday] = useState("");
  const startedAt = useRef(0);
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), message: useRef<HTMLTextAreaElement>(null) };

  useEffect(() => {
    startedAt.current = Date.now();
    // The postmark date is the visitor's own day, so it's set after mount
    setToday(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
  }, []);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    if (error?.field === k) setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      const res = await sendContactMessage({ ...form, startedAt: startedAt.current });
      if (res.ok) { setStatus("sent"); return; }
      setError({ text: res.error, field: res.field });
      if (res.field) refs[res.field].current?.focus();
    } catch {
      setError({ text: `We couldn't send that just now. Please try again, or email ${INBOX}.` });
    }
    setStatus("idle");
  }

  function reset() {
    setForm({ name: form.name, email: form.email, topic: "", message: "", company: "" });
    startedAt.current = Date.now();
    setStatus("idle");
  }

  async function copyEmail() {
    try { await navigator.clipboard.writeText(INBOX); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* the address is visible to copy by hand */ }
  }

  const StampIcon = TOPIC_ICONS[form.topic] ?? Mail;

  return (
    <MotionConfig reducedMotion="user">
      <div className="ct min-h-screen" style={{ background: "var(--bg-page)" }}>
        <Navbar />

        <section className="relative overflow-hidden pt-28 lg:pt-36 pb-20 lg:pb-28">
          <SectionTexture kind="trail" color="#ff5100" at="12% 30%" opacity={0.08} />
          <div className="relative mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-12 lg:gap-14 items-start">

            {/* ── Left: who you're writing to ── */}
            <div className="min-w-0 lg:pt-6">
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
                className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] mb-4" style={{ color: "var(--accent-strong, #e04800)" }}>
                Contact
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
                className="text-[2.7rem] sm:text-6xl leading-[1.02] mb-5" style={{ color: "var(--text-primary)", textWrap: "balance" }}>
                Write to us.<br /><span style={{ color: "var(--accent-ink)" }}>We write back.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                className="text-base sm:text-[17px] leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                A question about a trip, adventures you&apos;d like to list, or just mountains on your mind? Every message reaches our team&apos;s inbox, and a person replies.
              </motion.p>

              <motion.dl initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
                className="mt-10 divide-y" style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-4 py-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--accent-ink)" }} />
                  <dt className="sr-only">Email</dt>
                  <dd className="flex-1 min-w-0 flex items-center justify-between gap-3">
                    <a href={`mailto:${INBOX}`} className="text-[15px] font-semibold truncate hover:underline underline-offset-4" style={{ color: "var(--text-primary)" }}>{INBOX}</a>
                    <button type="button" onClick={copyEmail} aria-label="Copy email address"
                      className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      style={{ color: copied ? "var(--accent-green)" : "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}>
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "Copied" : "Copy"}
                    </button>
                  </dd>
                </div>
                <div className="flex items-center gap-4 py-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <Clock className="w-4 h-4 shrink-0" style={{ color: "var(--accent-ink)" }} />
                  <dt className="sr-only">Replies</dt>
                  <dd className="text-[15px]" style={{ color: "var(--text-secondary)" }}>We reply within 1–2 working days</dd>
                </div>
                <div className="flex items-center gap-4 py-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--accent-ink)" }} />
                  <dt className="sr-only">Based in</dt>
                  <dd className="text-[15px]" style={{ color: "var(--text-secondary)" }}>Based in Mumbai, India</dd>
                </div>
              </motion.dl>

              <div className="mt-8 flex items-center gap-3">
                {[
                  { href: "https://instagram.com/trailtotides", label: "Instagram", Icon: Instagram },
                  { href: "https://youtube.com/@trailtotides", label: "YouTube", Icon: Youtube },
                  { href: "https://twitter.com/trailtotides", label: "X (Twitter)", Icon: Twitter },
                ].map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5 hover:text-[#ff5100]"
                    style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-default)" }}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Right: the postcard ── */}
            <motion.div initial={{ opacity: 0, y: 24, rotate: 1.2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
              className="relative min-w-0 rounded-[22px] p-5 sm:p-7"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 1px 2px rgba(var(--shadow-color),0.06), 0 30px 60px -28px rgba(var(--shadow-color),0.35)" }}>

              {/* Postcard header: label and a stamp that follows the topic */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em]" style={{ color: "var(--text-tertiary)" }}>Post card</p>
                  <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>To <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Trail to Tides</span>, {INBOX}</p>
                </div>
                <div className="relative shrink-0">
                  <motion.div key={form.topic || "none"} initial={{ rotate: -8, scale: 0.85 }} animate={{ rotate: 3, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}
                    className="ct-stamp w-[72px] h-[86px] flex flex-col items-center justify-center gap-1 text-center"
                    aria-hidden>
                    <StampIcon className="w-6 h-6" strokeWidth={1.8} />
                    <span className="text-[8.5px] font-bold uppercase tracking-[0.14em] leading-tight px-1">{form.topic || "Hello"}</span>
                  </motion.div>
                  {/* Postmark, stamped on send */}
                  <AnimatePresence>
                    {status === "sent" && (
                      <motion.div initial={{ opacity: 0, scale: 2, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: -14 }} transition={{ type: "spring", stiffness: 260, damping: 13 }}
                        className="absolute -left-14 top-3 w-[92px] h-[92px] rounded-full flex flex-col items-center justify-center text-center pointer-events-none"
                        style={{ border: "2px solid var(--accent-green)", color: "var(--accent-green)", background: "color-mix(in srgb, var(--bg-surface) 70%, transparent)" }}>
                        <span className="font-mono text-[9px] font-bold tracking-[0.2em]">MUMBAI</span>
                        <span className="text-[15px] font-black tracking-wider">SENT</span>
                        <span className="font-mono text-[8.5px] font-bold tracking-[0.1em]">{today}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {status === "sent" ? (
                  <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}
                    className="py-10 sm:py-14 text-center" role="status">
                    <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "var(--accent-green-soft)", color: "var(--accent-green)" }}>
                      <Check className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl mb-2" style={{ color: "var(--text-primary)" }}>Sent. We&apos;ve got it.</h2>
                    <p className="text-[15px] max-w-sm mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      We&apos;ll reply to <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{form.email}</span> within 1–2 working days.
                    </p>
                    <button type="button" onClick={reset} className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold px-5 py-3 rounded-xl transition-colors"
                      style={{ color: "var(--text-primary)", border: "1px solid var(--border-default)" }}>
                      Send another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-6 md:gap-0">
                      {/* Message side, ruled like a postcard */}
                      <div className="order-2 md:order-1 md:pr-6 min-w-0 flex flex-col">
                        <label htmlFor="ct-message" className="ct-label">Your message</label>
                        <textarea
                          id="ct-message" ref={refs.message} name="message" required rows={8} maxLength={5000}
                          value={form.message} onChange={(e) => set("message", e.target.value)}
                          placeholder="Dear Trail to Tides,"
                          aria-invalid={error?.field === "message"} aria-describedby={error?.field === "message" ? "ct-error" : undefined}
                          className="ct-lines flex-1 w-full resize-none bg-transparent outline-none text-[16px]"
                          style={{ color: "var(--text-primary)" }}
                        />
                        <p className="mt-1 text-right text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{form.message.length.toLocaleString("en-IN")} / 5,000</p>
                      </div>

                      {/* Address side */}
                      <div className="order-1 md:order-2 md:pl-6 min-w-0 flex flex-col gap-5 md:border-l md:border-dashed" style={{ borderColor: "var(--border-default)" }}>
                        <div>
                          <label htmlFor="ct-name" className="ct-label">Your name</label>
                          <input id="ct-name" ref={refs.name} name="name" required autoComplete="name" maxLength={100}
                            value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rahul Sharma"
                            aria-invalid={error?.field === "name"} className="ct-input" />
                        </div>
                        <div>
                          <label htmlFor="ct-email" className="ct-label">Your email</label>
                          <input id="ct-email" ref={refs.email} name="email" type="email" required autoComplete="email" maxLength={200}
                            value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com"
                            aria-invalid={error?.field === "email"} className="ct-input" />
                        </div>
                        <fieldset>
                          <legend className="ct-label">What&apos;s it about?</legend>
                          <div className="flex flex-wrap gap-1.5">
                            {CONTACT_TOPICS.map((t) => {
                              const on = form.topic === t;
                              return (
                                <button key={t} type="button" aria-pressed={on} onClick={() => set("topic", on ? "" : t)}
                                  className="px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors"
                                  style={{ color: on ? "#fff" : "var(--text-secondary)", background: on ? "#ff5100" : "transparent", border: `1px solid ${on ? "#ff5100" : "var(--border-default)"}` }}>
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                        {/* Hidden from people; bots fill it in */}
                        <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
                          <label htmlFor="ct-company">Company</label>
                          <input id="ct-company" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set("company", e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <div className="min-h-[20px]" aria-live="polite">
                        {error ? (
                          <p id="ct-error" className="text-[13.5px] font-medium" style={{ color: "#dc2626" }}>{error.text}</p>
                        ) : (
                          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>Goes straight to our team&apos;s inbox.</p>
                        )}
                      </div>
                      <button type="submit" disabled={status === "sending"}
                        className="group shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                        style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)", boxShadow: "0 10px 24px -10px rgba(255,81,0,0.6)" }}>
                        {status === "sending"
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                          : <>Send message <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>

      <style>{`
        .ct-label { display: block; margin-bottom: 8px; font: 700 11px var(--font-mono, monospace); letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-tertiary); }
        .ct-input { width: 100%; background: transparent; border: 0; border-bottom: 1.5px solid var(--border-default); padding: 6px 0 9px; font-size: 16px; color: var(--text-primary); outline: none; transition: border-color .2s; }
        .ct-input::placeholder, .ct-lines::placeholder { color: var(--text-tertiary); opacity: 0.8; }
        .ct-input:focus { border-bottom-color: #ff5100; }
        .ct-input[aria-invalid="true"] { border-bottom-color: #dc2626; }
        /* Ruled lines that sit under each line of text */
        .ct-lines { min-height: 256px; line-height: 32px; padding: 0; background-image: linear-gradient(to bottom, transparent 31px, var(--border-subtle) 31px, var(--border-subtle) 32px); background-size: 100% 32px; background-attachment: local; }
        .ct-lines[aria-invalid="true"] { background-image: linear-gradient(to bottom, transparent 31px, rgba(220,38,38,0.5) 31px, rgba(220,38,38,0.5) 32px); }
        /* Perforated postage stamp */
        /* solid centre plus a ring of punched holes around the edge */
        .ct-stamp { color: #ff5100; background: color-mix(in srgb, #ff5100 9%, var(--bg-surface)); border: 1.5px solid color-mix(in srgb, #ff5100 45%, transparent); border-radius: 2px;
          -webkit-mask: linear-gradient(#000 0 0) center / calc(100% - 10px) calc(100% - 10px) no-repeat, radial-gradient(circle, transparent 2.6px, #000 3.2px) -5px -5px / 10px 10px round;
          mask: linear-gradient(#000 0 0) center / calc(100% - 10px) calc(100% - 10px) no-repeat, radial-gradient(circle, transparent 2.6px, #000 3.2px) -5px -5px / 10px 10px round; }
        .ct { --accent-strong: #c24000; }
        .dark .ct { --accent-strong: #ff6a1f; }
      `}</style>
    </MotionConfig>
  );
}
