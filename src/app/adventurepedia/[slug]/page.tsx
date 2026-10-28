import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Clock, Search, Stethoscope } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GUIDES, TOPICS, guideBySlug, guideHref, readMinutes } from "@/lib/adventurepedia";
import { adventures } from "@/lib/data";
import { BlockView, GuideIcon, Rich, TopicChip, serif } from "../blocks";

const SITE = "https://www.trailtotides.com";

// The offline maps guide has its own folder, which wins over this route
export function generateStaticParams() {
  return GUIDES.filter((g) => !g.custom).map((g) => ({ slug: g.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  const url = `${SITE}${guideHref(g)}`;
  return {
    title: `${g.short}: Adventurepedia`,
    description: g.summary,
    alternates: { canonical: url },
    openGraph: { title: `${g.title} — Adventurepedia`, description: g.summary, url, type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g || g.custom) notFound();
  const topic = TOPICS.find((t) => t.id === g.topic)!;
  const related = g.related.map(guideBySlug).filter((r): r is NonNullable<typeof r> => !!r);
  const applies = g.appliesTo?.map((type) => ({ type, n: adventures.filter((a) => a.type === type).length })).filter((x) => x.n > 0) ?? [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          <article className="min-w-0 max-w-3xl">
            {/* ── Header ── */}
            <nav className="flex items-center gap-1.5 text-[12.5px] t-text-3 mb-4" aria-label="Breadcrumb">
              <Link href="/adventurepedia" className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Adventurepedia</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/adventurepedia?topic=${g.topic}`} className="hover:underline underline-offset-2">{topic.label}</Link>
            </nav>
            <div className="flex items-start gap-4">
              <span className="hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center shrink-0 mt-1" style={{ background: "#ff5100", boxShadow: "0 8px 24px rgba(255,81,0,0.25)" }}>
                <GuideIcon icon={g.icon} className="w-7 h-7 text-white" />
              </span>
              <h1 className="text-[34px] sm:text-[44px] t-text leading-[1.08]" style={{ ...serif, letterSpacing: "-0.02em" }}>{g.title}</h1>
            </div>
            <p className="text-[17px] leading-[1.6] t-text-2 mt-4">{g.summary}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-[13px] t-text-3">
              <TopicChip>{topic.label}</TopicChip>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readMinutes(g)} min read</span>
            </div>

            {/* ── The short version ── */}
            <section id="short-version" className="scroll-mt-28 mt-8 rounded-2xl p-5 sm:p-6" style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.2)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: "var(--accent-ink)" }}>The short version</p>
              <ul className="space-y-2.5">
                {g.tldr.map((t, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-[1.6] t-text">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5" style={{ background: "#ff5100" }}>{i + 1}</span>
                    <span><Rich text={t} /></span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── Contents (phones and tablets) ── */}
            <details className="lg:hidden mt-6 rounded-2xl group" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[14px] font-semibold t-text">
                In this guide <ChevronRight className="w-4 h-4 t-text-3 transition-transform group-open:rotate-90" />
              </summary>
              <ol className="px-4 pb-3 space-y-1">
                {g.sections.map((s, i) => (
                  <li key={s.id}><a href={`#${s.id}`} className="flex gap-2 py-1.5 text-[14px] t-text-2"><span className="t-text-3 tabular-nums w-5">{i + 1}.</span>{s.title}</a></li>
                ))}
              </ol>
            </details>

            {/* ── Sections ── */}
            <div className="mt-4">
              {g.sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-28 pt-10">
                  <h2 className="text-[24px] sm:text-[28px] t-text leading-tight mb-4" style={serif}>
                    <a href={`#${s.id}`} className="hover:underline decoration-[#ff5100]/40 underline-offset-4">{s.title}</a>
                  </h2>
                  {s.blocks.map((b, i) => <BlockView key={i} block={b} />)}
                </section>
              ))}
            </div>

            {g.topic === "health" && (
              <p className="mt-10 flex gap-2.5 text-[13px] leading-[1.6] t-text-3">
                <Stethoscope className="w-4 h-4 shrink-0 mt-0.5" />
                This guide is general information to help you prepare, not medical advice. Talk to a doctor about your own health before a high-altitude trip, and follow your trek leader on the mountain.
              </p>
            )}

            {/* ── Adventures it applies to ── */}
            {applies.length > 0 && (
              <div className="mt-10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-[15px] t-text-2">Put it to use: {applies.map((a, i) => <span key={a.type}>{i ? ", " : ""}<b className="t-text">{a.n}</b> {a.type.toLowerCase()} {a.n === 1 ? "adventure" : "adventures"}</span>)} on Trail to Tides.</p>
                <Link href={`/explore?type=${applies.map((a) => encodeURIComponent(a.type)).join(",")}`} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
                  Browse them <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* ── Related ── */}
            {related.length > 0 && (
              <div className="mt-12">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3">Read next</p>
                <ul className="grid sm:grid-cols-3 gap-3">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={guideHref(r)} className="group flex flex-col h-full rounded-2xl p-4 transition-colors hover:border-[#ff5100]/50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                        <span className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,81,0,0.1)" }}><GuideIcon icon={r.icon} className="w-[18px] h-[18px] text-[#ff5100]" /></span>
                        <span className="text-[15px] font-semibold t-text leading-snug group-hover:text-[#ff5100] transition-colors">{r.short}</span>
                        <span className="text-[13px] t-text-3 mt-1 line-clamp-2">{r.summary}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          {/* ── Sidebar (desktop): search the library and jump through the guide ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <form action="/adventurepedia" role="search" className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 t-text-3" />
                <input name="q" type="search" placeholder="Search all guides" aria-label="Search all guides"
                  className="w-full h-10 pl-9 pr-3 rounded-xl text-[13.5px] t-text outline-none focus:border-[#ff5100]/60"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }} />
              </form>
              <nav aria-label="In this guide">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3">In this guide</p>
                <ol className="space-y-1.5 text-[13.5px] border-l" style={{ borderColor: "var(--border-subtle)" }}>
                  <li><a href="#short-version" className="block pl-3 -ml-px border-l border-transparent t-text-2 hover:text-[#ff5100] hover:border-[#ff5100]">The short version</a></li>
                  {g.sections.map((s) => (
                    <li key={s.id}><a href={`#${s.id}`} className="block pl-3 -ml-px border-l border-transparent t-text-2 hover:text-[#ff5100] hover:border-[#ff5100]">{s.title}</a></li>
                  ))}
                </ol>
              </nav>
              <Link href="/adventurepedia" className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--accent-ink)" }}>
                All {GUIDES.length} guides <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
