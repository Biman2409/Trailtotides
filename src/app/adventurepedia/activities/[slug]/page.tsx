import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Check, ChevronRight, MapPin, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatBubble from "@/components/ChatBubble";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import { ACTIVITIES, ELEMENTS, activityBySlug, activityHref } from "@/lib/activityGuides";
import { guideBySlug, guideHref } from "@/lib/adventurepedia";
import { AXIS_LABEL } from "@/lib/fitness";
import { adventures } from "@/lib/data";
import { GuideIcon, serif } from "../../blocks";
import AskCompassButton from "../AskCompassButton";

const SITE = "https://www.trailtotides.com";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function generateStaticParams() {
  return ACTIVITIES.map((a) => ({ slug: a.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = activityBySlug((await params).slug);
  if (!a) return {};
  const url = `${SITE}${activityHref(a)}`;
  const description = `${a.type} in India: where and when to go, what it asks of your body, how to pick an operator and how to start.`;
  return {
    title: `${a.type} in India: Adventurepedia`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${a.type} in India — Adventurepedia`, description, url, type: "article" },
  };
}

// One page per kind of adventure, live or coming soon: what it is, where and when, what it asks
// of your body on the ACE™ scale, what to check in an operator, and the guides and listings for it
export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = activityBySlug((await params).slug);
  if (!a) notFound();
  const element = ELEMENTS.find((e) => e.id === a.element)!;
  const live = adventures.filter((x) => x.type === a.type);
  const guides = a.guides.map(guideBySlug).filter((g): g is NonNullable<typeof g> => !!g);
  const siblings = ACTIVITIES.filter((x) => x.element === a.element && x.slug !== a.slug);
  const icon = ADVENTURE_TYPE_ICONS[a.type];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-6">
        <article className="max-w-3xl mx-auto">
          {/* ── Header ── */}
          <nav className="flex items-center gap-1.5 text-[12.5px] t-text-3 mb-4" aria-label="Breadcrumb">
            <Link href="/adventurepedia" className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Adventurepedia</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/adventurepedia#every-adventure" className="hover:underline underline-offset-2">{element.label}</Link>
          </nav>
          <div className="flex items-start gap-4">
            <span className="hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center shrink-0 mt-1 text-white" style={{ background: "#ff5100", boxShadow: "0 8px 24px rgba(255,81,0,0.25)" }}>
              {icon?.(28)}
            </span>
            <h1 className="text-[34px] sm:text-[44px] t-text leading-[1.08]" style={{ ...serif, letterSpacing: "-0.02em" }}>{a.type} in India</h1>
          </div>
          <p className="text-[17px] leading-[1.6] t-text-2 mt-4">{a.what}</p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {live.length > 0 ? (
              <Link href={`/explore?type=${encodeURIComponent(a.type)}`} className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{live.length} {live.length === 1 ? "adventure" : "adventures"} to book
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ color: "var(--accent-ink)", background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.2)" }}>
                Coming soon to Trail to Tides
              </span>
            )}
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full t-text-3" style={{ border: "1px solid var(--border-subtle)" }}>{element.label} · {element.blurb}</span>
          </div>

          {/* ── At a glance ── */}
          <div id="when" className="scroll-mt-28 grid sm:grid-cols-2 gap-3 mt-8">
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3"><MapPin className="w-3.5 h-3.5" />Where in India</p>
              <ul className="space-y-1.5">
                {a.where.map((w) => <li key={w} className="text-[14.5px] t-text-2 leading-snug">{w}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3"><CalendarDays className="w-3.5 h-3.5" />When to go</p>
              <div className="grid grid-cols-12 gap-[3px] mb-3" aria-label={`Best months: ${a.months.join(", ")}`}>
                {MONTHS.map((m) => {
                  const on = a.months.includes(m);
                  return <span key={m} title={m} className="h-6 rounded-md grid place-items-center text-[9.5px] font-bold" style={{ background: on ? "rgba(255,81,0,0.16)" : "var(--bg-surface-2)", color: on ? "var(--accent-ink)" : "var(--text-tertiary)" }}>{m[0]}</span>;
                })}
              </div>
              <p className="text-[14px] t-text-2 leading-[1.6]">{a.season}</p>
            </div>
          </div>

          {/* ── What it asks of your body ── */}
          <section id="body" className="scroll-mt-28 pt-10">
            <h2 className="text-[24px] sm:text-[28px] t-text leading-tight mb-3" style={serif}>What it asks of your body</h2>
            <p className="text-[15.5px] leading-[1.75] t-text-2">{a.bodyNote}</p>
            {a.body.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {a.body.map((ax, i) => (
                  <span key={ax} className="text-[13px] font-semibold px-3 py-1.5 rounded-full" style={i === 0 ? { background: "#ff5100", color: "#fff" } : { background: "rgba(255,81,0,0.08)", color: "var(--accent-ink)" }}>{AXIS_LABEL[ax]}</span>
                ))}
              </div>
            )}
            <div className="mt-4 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.2)" }}>
              <p className="flex-1 text-[14.5px] leading-[1.6] t-text-2">
                {a.body.length > 0 ? <>These are capabilities on the <Link href="/ace" className="font-semibold t-text underline underline-offset-2 decoration-[#ff5100]/50">ACE™ scale</Link>. </> : null}
                The Adventure Matchmaker builds your ACE™ profile in 2 minutes and rates every adventure for you: ready, a stretch, or not yet.
              </p>
              <Link href="/matchmaker" className="shrink-0 inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
                Take the Matchmaker <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* ── Choosing an operator ── */}
          <section id="operator" className="scroll-mt-28 pt-10">
            <h2 className="text-[24px] sm:text-[28px] t-text leading-tight mb-3" style={serif}>What to check before you book</h2>
            <ul className="space-y-2.5">
              {a.operator.map((o) => (
                <li key={o} className="flex gap-3 text-[15px] leading-[1.65] t-text-2">
                  <Check className="w-4 h-4 shrink-0 mt-1 text-[#ff5100]" />{o}
                </li>
              ))}
            </ul>
            <p className="text-[13.5px] t-text-3 mt-3">Rules and requirements change. Ask your operator for the current word before you go.</p>
          </section>

          {/* ── Getting started ── */}
          <section id="start" className="scroll-mt-28 pt-10">
            <h2 className="text-[24px] sm:text-[28px] t-text leading-tight mb-3" style={serif}>Your first time</h2>
            <p className="text-[15.5px] leading-[1.75] t-text-2">{a.start}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <AskCompassButton prompt={`I'd like to try ${a.type.toLowerCase()} in India. Where should I start?`} label={`Ask Compass.AI about ${a.type.toLowerCase()}`} />
              <span className="text-[13px] t-text-3">It knows every adventure on the site.</span>
            </div>
          </section>

          {/* ── Book it, or hear when it's here ── */}
          <section id="adventures" className="scroll-mt-28 pt-10">
            <h2 className="text-[24px] sm:text-[28px] t-text leading-tight mb-4" style={serif}>{live.length > 0 ? `${a.type} on Trail to Tides` : "Coming soon"}</h2>
            {live.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  {live.slice(0, 4).map((x) => <AdventureCard key={x.id} adventure={x} badge={false} />)}
                </div>
                {live.length > 4 && (
                  <Link href={`/explore?type=${encodeURIComponent(a.type)}`} className="inline-flex items-center gap-1.5 mt-4 text-[14px] font-semibold" style={{ color: "var(--accent-ink)" }}>
                    See all {live.length} <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </>
            ) : (
              <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <Sparkles className="w-6 h-6 shrink-0 text-[#ff5100]" />
                <p className="flex-1 text-[14.5px] leading-[1.6] t-text-2">
                  We&apos;re checking operators for {a.type.toLowerCase()} before we list any. Run one, or want it sooner? Tell us.
                </p>
                <Link href="/contact" className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[14px] font-semibold t-text" style={{ border: "1px solid var(--border-default)" }}>
                  Get in touch <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>

          {/* ── Guides for it ── */}
          {guides.length > 0 && (
            <section id="guides" className="scroll-mt-28 pt-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3">Guides for {a.type.toLowerCase()}</p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link href={guideHref(g)} className="group flex gap-3 h-full rounded-2xl p-4 transition-colors hover:border-[#ff5100]/50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}><GuideIcon icon={g.icon} className="w-[18px] h-[18px] text-[#ff5100]" /></span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold t-text leading-snug group-hover:text-[#ff5100] transition-colors">{g.short}</span>
                        <span className="block text-[13px] t-text-3 mt-1 line-clamp-2">{g.summary}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── More in this element ── */}
          <section className="pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3">More {element.label.toLowerCase()} adventures</p>
            <div className="flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link key={s.slug} href={activityHref(s)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13.5px] font-semibold t-text-2 transition-colors hover:border-[#ff5100]/50 hover:text-[#ff5100]" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                  {ADVENTURE_TYPE_ICONS[s.type]?.(14)}{s.type}
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
      <Footer />
      {/* Compass.AI, for "Ask Compass.AI about …" */}
      <ChatBubble />
    </div>
  );
}
