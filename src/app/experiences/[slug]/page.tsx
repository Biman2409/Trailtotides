import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OperatorButton from "./OperatorButton";
import {
  MapPin,
  Clock,
  TrendingUp,
  Sun,
  ShieldCheck,
  ChevronLeft,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Route,
  BadgeCheck,
  Flag,
  Navigation,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";
import Pill from "@/components/ui/custom/Pill";
import ACEProfileSection from "./ACEProfileSection";
import CompareCTA from "./CompareCTA";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
import ReviewSection from "@/components/ui/custom/ReviewSection";
import { createClient } from "@/lib/supabase/server";
import { getACE } from "@/lib/ace";
import type { Adventure } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

type Operator = NonNullable<Adventure["operators"]>[number];

function OperatorCard({ op, verified }: { op: Operator; verified: boolean }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={
        verified
          ? {
              background: "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(5,150,105,0.03) 100%)",
              border: "1px solid rgba(16,185,129,0.18)",
            }
          : {
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{op.name}</span>
            {verified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                <ShieldCheck className="w-3 h-3" />Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertTriangle className="w-3 h-3" />Unverified
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />
            ))}
            <span className="text-white/35 text-xs ml-1">{op.rating}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>From</div>
          <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{op.priceFrom}</div>
        </div>
      </div>
      <OperatorButton
        website={op.website ?? ""}
        label={verified ? "Get Details" : "Visit Website"}
        variant={verified ? "primary" : "secondary"}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-4">
      {children}
    </p>
  );
}

function RelatedSection({ title, items, exploreHref }: { title: string; items: Adventure[]; exploreHref: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <SectionLabel>You Might Also Like</SectionLabel>
          <h2 className="text-white text-3xl font-semibold tracking-tight">{title}</h2>
        </div>
        <Link href={exploreHref} className="hidden md:flex items-center gap-1.5 text-white/40 text-sm font-medium hover:text-[#ff5100] transition-colors group">
          Explore all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory no-scrollbar">
        {items.map((a) => (
          <div key={a.id} className="group relative flex flex-col rounded-2xl overflow-hidden flex-none w-72 snap-start transition-all duration-300 hover:-translate-y-1.5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
            <div className="relative h-48 overflow-hidden">
              <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectFit: "cover" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                <Pill type="type" value={a.type} />
                <Pill type="difficulty" value={a.difficulty} />
              </div>
            </div>
            <div className="p-5 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3 h-3 text-[#ff5100]" />
                <span className="text-white/35 text-xs">{a.state}</span>
              </div>
              <h3 className="text-white font-semibold text-base leading-snug mb-1 group-hover:text-[#ff5100] transition-colors">{a.name}</h3>
              <p className="text-white/35 text-xs line-clamp-2 leading-relaxed">{a.tagline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return adventures.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const adventure = adventures.find((a) => a.slug === slug);
  if (!adventure) return {};
  return {
    title: `${adventure.name} — Trail to Tides`,
    description: `${adventure.type} in ${adventure.state} · ${adventure.difficulty} · ${adventure.duration} days. ${adventure.tagline ?? "Discover this handpicked adventure on Trail to Tides."}`,
    openGraph: {
      title: `${adventure.name} — Trail to Tides`,
      description: `${adventure.type} in ${adventure.state} · ${adventure.difficulty} · ${adventure.duration} days.`,
      url: `https://trailtotides.com/experiences/${slug}`,
      images: [{ url: adventure.heroImage, width: 1200, height: 630, alt: adventure.name }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${adventure.name} — Trail to Tides`,
      images: [adventure.heroImage],
    },
    alternates: { canonical: `https://trailtotides.com/experiences/${slug}` },
  };
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  const adventure = adventures.find((a) => a.slug === slug);
  if (!adventure) notFound();

  const PAGE_SIZE = 12;
  const adventureIndex = adventures.findIndex((a) => a.slug === slug);
  const explorePage = adventureIndex >= 0 ? Math.ceil((adventureIndex + 1) / PAGE_SIZE) : 1;

  const ace = getACE(adventure);
  const altM = adventure.altitude ? parseFloat(adventure.altitude.replace(/[^0-9.]/g, "")) : 0;
  const showAltitudeWarning = altM >= 4200 || ace.altitude >= 4;
  const showIsolationWarning = ace.nerve >= 5;
  const showTechnicalWarning = ace.strength >= 5 || ace.agility >= 5;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const relatedByState = adventures
    .filter((a) => a.id !== adventure.id && a.state === adventure.state)
    .slice(0, 6);
  const relatedByStateIds = new Set(relatedByState.map((a) => a.id));
  const relatedByType = adventures
    .filter((a) => a.id !== adventure.id && a.type === adventure.type && !relatedByStateIds.has(a.id))
    .slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-[92vh] min-h-[640px] flex items-end overflow-hidden">
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          priority
          className="object-cover scale-[1.02]"
          style={{ objectFit: "cover" }}
        />
        {/* Color grade overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff5100]/10 via-transparent to-sky-900/15 mix-blend-multiply pointer-events-none" />
        {/* Gradient fade to page bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080c14]/60 to-transparent" />

        {/* Back button */}
        <Link
          href={`/explore?page=${explorePage}`}
          className="absolute top-24 left-6 lg:left-8 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-all text-sm font-medium backdrop-blur-md px-4 py-2 rounded-full"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          All Adventures
        </Link>

        {/* Hero text */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20 w-full">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Pill type="type" value={adventure.type} />
              <Pill type="difficulty" value={adventure.difficulty} />
              <Link
                href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
                className="flex items-center gap-1.5 text-white/50 text-xs font-semibold tracking-tight hover:text-[#ff5100] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#ff5100]" />
                {adventure.state}
              </Link>
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.0] mb-5" style={{ color: "#f0ede8" }}>
              {adventure.name}
            </h1>
            <p className="text-white/55 text-xl leading-relaxed max-w-xl font-light">
              {adventure.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────── */}
      <section style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-stretch overflow-x-auto no-scrollbar divide-x" style={{ borderColor: "var(--border-subtle)" }}>
            {[
              { icon: <Clock className="w-4 h-4 text-[#ff5100]" />, label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
              ...(adventure.distance ? [{ icon: <Route className="w-4 h-4 text-emerald-400" />, label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
              ...((adventure.altitude || adventure.depth) ? [{ icon: <TrendingUp className="w-4 h-4 text-sky-400" />, label: adventure.type === "Diving" ? "Max Depth" : "Max Altitude", value: adventure.depth ?? adventure.altitude }] : []),
              { icon: <Sun className="w-4 h-4 text-amber-400" />, label: "Best Season", value: adventure.bestSeason },
              ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ icon: <Flag className="w-4 h-4 text-violet-400" />, label: "Base Camp", value: adventure.baseCamp }] : []),
              ...(adventure.type === "Biking" && adventure.startingPoint ? [{ icon: <Navigation className="w-4 h-4 text-emerald-400" />, label: "Starting Point", value: adventure.startingPoint }] : []),
            ].map(({ icon, label, value }, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-4 shrink-0 first:pl-0">
                {icon}
                <div>
                  <div className="text-white/25 text-[9px] uppercase tracking-widest">{label}</div>
                  <div className="text-white font-medium text-sm whitespace-nowrap">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-16">

            {/* The Adventure */}
            <section>
              <SectionLabel>The Adventure</SectionLabel>
              <p className="text-white/65 text-xl leading-relaxed font-light">
                {adventure.description}
              </p>
            </section>

            {/* What Makes It Special */}
            <section>
              <SectionLabel>What Makes It Special</SectionLabel>
              <div
                className="rounded-2xl p-7"
                style={{
                  background: "linear-gradient(135deg, rgba(255,81,0,0.07) 0%, rgba(255,81,0,0.02) 100%)",
                  borderLeft: "3px solid rgba(255,81,0,0.5)",
                  borderTop: "1px solid rgba(255,81,0,0.08)",
                  borderRight: "1px solid rgba(255,81,0,0.05)",
                  borderBottom: "1px solid rgba(255,81,0,0.05)",
                }}
              >
                <p className="text-white/75 text-lg leading-relaxed">{adventure.whatMakesSpecial}</p>
              </div>
            </section>

            {/* Is This For You? */}
            <section>
              <SectionLabel>Is This For You?</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.03) 100%)",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm">Go if you have</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {adventure.whoFor.split("·").map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="text-emerald-400 mt-0.5 shrink-0 text-sm">✓</span>
                        <span className="text-white/50 text-sm leading-snug">{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(185,28,28,0.03) 100%)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm">Skip if you have</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {adventure.whoNot.split("·").map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="text-red-400 mt-0.5 shrink-0 text-sm">✕</span>
                        <span className="text-white/50 text-sm leading-snug">{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Safety & Prep */}
            <section>
              <SectionLabel>Safety &amp; Prep</SectionLabel>
              <div
                className="rounded-2xl p-6 flex gap-4"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(180,83,9,0.03) 100%)",
                  border: "1px solid rgba(245,158,11,0.18)",
                }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(245,158,11,0.12)" }}>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-white/55 text-sm leading-relaxed">{adventure.safetyNotes}</p>
              </div>
            </section>

            {/* ACE Profile */}
            <ACEProfileSection
              ace={ace}
              adventureName={adventure.name}
              showAltitudeWarning={showAltitudeWarning}
              showIsolationWarning={showIsolationWarning}
              showTechnicalWarning={showTechnicalWarning}
            />

            {/* Operators */}
            <section>
              {/* Verified */}
              {adventure.operators.some((op) => op.verified) && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)" }}>
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <SectionLabel>Verified Operators</SectionLabel>
                      <p className="text-white/35 text-xs -mt-3">ATOAI / PADI / IMF registered, vetted track record</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {adventure.operators.filter((op) => op.verified).map((op) => (
                      <OperatorCard key={op.name} op={op} verified />
                    ))}
                  </div>
                  <p className="mt-4 text-white/25 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    All verified operators hold valid permits, safety certifications and guide credentials.
                  </p>
                </div>
              )}

              {/* Verification criteria */}
              <div
                className="mb-10 rounded-2xl p-5"
                style={{
                  background: "rgba(16,185,129,0.04)",
                  border: "1px solid rgba(16,185,129,0.12)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-emerald-400/80 text-xs font-bold tracking-[0.15em] uppercase">How We Verify Operators</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Valid government permits & licenses",
                    "ATOAI / IMF / PADI certification confirmed",
                    "Certified & trained local guides on staff",
                    "Safety gear & evacuation protocols in place",
                    "Independently reviewed by our team on-ground",
                    "Consistent track record over 2+ seasons",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                      <span className="text-white/40 text-xs">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unverified */}
              {adventure.operators.some((op) => !op.verified) && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase">Other Operators</p>
                      <p className="text-white/30 text-xs mt-0.5">Listed by the community — not verified by us</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {adventure.operators.filter((op) => !op.verified).map((op) => (
                      <OperatorCard key={op.name} op={op} verified={false} />
                    ))}
                  </div>
                  <p className="mt-4 text-white/25 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Do your own research. Ask operators directly for permits and certifications.
                  </p>
                </div>
              )}
            </section>

            {/* Reviews */}
            <ReviewSection slug={adventure.slug} currentUserId={currentUserId} adventureType={adventure.type} adventureName={adventure.name} />

            {/* Tags */}
            <section>
              <div className="flex flex-wrap gap-2">
                {adventure.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-white/30 text-xs px-3 py-1.5 rounded-full transition-colors hover:text-white/50"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* At a Glance */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-5">
                At a Glance
              </p>
              <div className="space-y-3">
                {[
                  { label: "Type", value: adventure.type },
                  ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ label: "Base Camp", value: adventure.baseCamp }] : []),
                  ...(adventure.type === "Biking" && adventure.startingPoint ? [{ label: "Starting Point", value: adventure.startingPoint }] : []),
                  { label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
                  ...((adventure.type === "Trekking" || adventure.type === "Biking")
                    ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance ?? "Contact for route" }]
                    : adventure.distance ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
                  { label: "Difficulty", value: adventure.difficulty },
                  { label: "Best Season", value: adventure.bestSeason },
                  ...(adventure.altitude ? [{ label: "Max Altitude", value: adventure.altitude }] : []),
                  ...(adventure.depth ? [{ label: "Max Depth", value: adventure.depth }] : []),
                  { label: "Group Size", value: adventure.groupSize },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 pb-3 last:pb-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-white/30 text-xs shrink-0">{label}</span>
                    <span className="text-white/70 text-xs text-right leading-snug">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compare CTA */}
            <CompareCTA adventure={adventure} />

            {/* Explore links */}
            <Link
              href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white/50 hover:text-white text-sm font-medium transition-all duration-200 hover:bg-white/5"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              More in {adventure.state}
            </Link>
            <Link
              href={`/explore?type=${encodeURIComponent(adventure.type)}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white/50 hover:text-white text-sm font-medium transition-all duration-200 hover:bg-white/5"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              More in {adventure.type}
            </Link>
          </div>
        </div>
      </div>

      {/* ── YOU MIGHT ALSO LIKE ───────────────────────────────── */}
      {(relatedByState.length > 0 || relatedByType.length > 0) && (
        <section
          className="py-20 px-6 lg:px-8"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div className="max-w-7xl mx-auto space-y-16">
            <RelatedSection
              title={`More in ${adventure.state}`}
              items={relatedByState}
              exploreHref={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
            />
            <RelatedSection
              title={`More in ${adventure.type}`}
              items={relatedByType}
              exploreHref={`/explore?type=${encodeURIComponent(adventure.type)}`}
            />
          </div>
        </section>
      )}

      <CompareAdventures />
      <Footer />
    </div>
  );
}
