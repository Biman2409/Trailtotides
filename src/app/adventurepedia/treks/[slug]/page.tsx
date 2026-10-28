import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight, ChevronRight, Search, Plane, TrainFront, Car, MapPin, Mountain, CalendarDays, Route, Clock, Gauge,
  ArrowUp, ArrowDown, BedDouble, Footprints, Moon, Download, BadgeCheck, Star, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getACE, ACE_AXES, ACE_AXIS_LABELS, ACE_AXIS_COLORS } from "@/lib/ace";
import {
  trekAdventures, trekGuide, trekGuideHref, MONTHS, seasonNotes, acclimatisation, profile, packingNotes, permitNotes, priceRange, splitList,
} from "@/lib/trekGuides";
import { Rich, BlockView, serif } from "../../blocks";

const SITE = "https://www.trailtotides.com";
const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export function generateStaticParams() {
  return trekAdventures().map((a) => ({ slug: a.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = trekGuide((await params).slug);
  if (!g) return {};
  const { a } = g;
  const url = `${SITE}${trekGuideHref(a.slug)}`;
  const description = `${a.name} guide: ${a.durationDays}, ${a.distance ?? ""} to ${a.altitude ?? ""}. Best season, how to get there, day-by-day itinerary, permits, packing, fitness and costs.`.replace(/ ,/g, ",");
  return {
    title: `${a.name} Guide: Itinerary, Season, Permits & Cost`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${a.name}: the complete guide`, description, url, type: "article", images: [a.heroImage] },
  };
}

// The same benchmarks as the Getting fit guide, by the site's difficulty scale
const FITNESS: Record<string, string> = {
  Easy: "Walk 10 km comfortably and climb 20 floors of stairs without stopping.",
  Moderate: "Jog 5 km in about 40 minutes, or climb 40 floors with a 5 kg pack.",
  Hard: "Jog 5 km in about 35 minutes, and manage a 4 to 5 hour hill walk with a pack.",
  Advanced: "Several long training days with a 10 kg pack, and earlier treks above 4,000 m.",
  Extreme: "Regular long training days with a heavy pack, and prior high-altitude experience.",
};

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 pt-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--accent-ink)" }}>{kicker}</p>
      <h2 className="text-[24px] sm:text-[28px] t-text leading-tight mb-4" style={serif}>{title}</h2>
      {children}
    </section>
  );
}

const card = { background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" } as const;

export default async function TrekGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = trekGuide((await params).slug);
  if (!g) notFound();
  const { a, trail, access, alt } = g;
  const ace = getACE(a);
  const price = priceRange(a);
  const acc = trail ? acclimatisation(trail) : null;
  const prof = trail ? profile(trail) : null;
  const start = a.baseCamp ?? a.startingPoint ?? access?.roadhead;
  const whoFor = splitList(a.whoFor);
  const whoNot = splitList(a.whoNot);
  const walkDays = trail?.days.filter((d) => d.kind === "walk") ?? [];
  const hardest = walkDays.length ? walkDays.reduce((m, d) => ((d.up ?? 0) > (m.up ?? 0) ? d : m), walkDays[0]) : null;

  const acclimVerdict = acc
    ? acc.jumps.length === 0
      ? `The itinerary gains height gently: no night above 3,000 m is more than 500 m higher than the one before${acc.restDays ? `, with ${acc.restDays} rest ${acc.restDays === 1 ? "day" : "days"} built in` : ""}.`
      : `${acc.jumps.length === 1 ? "One night gains" : `${acc.jumps.length} nights gain`} more than 500 m above 3,000 m. That's common on Himalayan treks, but it's where altitude sickness tends to show up: go slowly the day before and drink well.`
    : null;

  const tldr = [
    `**${a.durationDays}**${a.distance ? `, about **${a.distanceRange ?? a.distance}**` : ""} on foot, topping out at **${a.altitude ?? "high altitude"}**. Rated **${a.difficulty}** on Trail to Tides.`,
    `Best in **${a.bestSeason}**.`,
    start ? `Starts from **${start}**${access ? `, reached via **${access.gateway}**` : ""}.` : access ? `Most groups start from **${access.gateway}**.` : null,
    acclimVerdict,
    price ? `Operators charge **${price.text}** per person; ${price.operators} listed, ${price.verified} verified.` : null,
  ].filter((x): x is string => !!x);

  const faq: [string, string][] = [
    [`How difficult is the ${a.name}?`, `It's rated ${a.difficulty} on Trail to Tides. ${FITNESS[a.difficulty] ? `A fair benchmark before you go: ${FITNESS[a.difficulty].charAt(0).toLowerCase()}${FITNESS[a.difficulty].slice(1)}` : ""} The highest point is ${a.altitude ?? "high"}, so pace and acclimatisation matter as much as fitness.`],
    [`When is the best time for the ${a.name}?`, `${a.bestSeason}. ${seasonNotes(a)[0]?.replace(/\*\*/g, "") ?? ""}`],
    [`How many days does the ${a.name} take?`, `${a.durationDays} including travel to and from the trailhead${trail ? `, with ${walkDays.length} walking ${walkDays.length === 1 ? "day" : "days"}` : ""}. Add a buffer day for weather or road delays.`],
    [`How do I reach the ${a.name}?`, access ? `Most groups meet in ${access.gateway}. Nearest airport: ${access.air}. Nearest railway: ${access.rail}.${access.drive ? ` ${access.drive}.` : ""}` : `Your operator arranges transport from the nearest town.`],
    ...(price ? [[`How much does the ${a.name} cost?`, `Listed operators charge from ${price.text} per person. Check what's included: transport, permits, meals, tents and offloading vary.`] as [string, string]] : []),
    [`Do I need a permit for the ${a.name}?`, permitNotes(a).join(" ") || "Ask your operator; most arrange permits as part of the package."],
  ];

  const contents: [string, string][] = [
    ["short-version", "The short version"], ["overview", "Overview"], ["when", "When to go"], ["getting-there", "Getting there"],
    ...(trail ? [["itinerary", "Day by day"], ["altitude", "Altitude and acclimatisation"]] as [string, string][] : [["altitude", "Altitude"]] as [string, string][]),
    ["fitness", "How fit you need to be"], ["permits", "Permits and paperwork"], ["packing", "What to pack"], ["safety", "Safety"],
    ["booking", "Booking and cost"], ...(trail ? [["offline", "Offline map and GPX"]] as [string, string][] : []), ["faq", "Questions"],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })),
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <header className="relative h-[52vh] min-h-[380px] max-h-[560px] overflow-hidden">
        <Image src={a.heroImage} alt={a.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.75) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 px-5 sm:px-6 pb-8">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center gap-1.5 text-[12.5px] text-white/80 mb-3" aria-label="Breadcrumb">
              <Link href="/adventurepedia" className="font-semibold hover:underline underline-offset-2">Adventurepedia</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/adventurepedia/treks" className="hover:underline underline-offset-2">Trek guides</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60">{a.state}</span>
            </nav>
            <h1 className="text-[34px] sm:text-[52px] text-white leading-[1.04]" style={{ ...serif, letterSpacing: "-0.02em" }}>{a.name}</h1>
            <p className="text-[16px] sm:text-[18px] text-white/85 mt-2 max-w-2xl">{a.tagline}</p>
          </div>
        </div>
      </header>

      <main className="pb-20 px-5 sm:px-6">
        {/* ── Facts strip ── */}
        <div className="max-w-6xl mx-auto -mt-0 pt-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px rounded-2xl overflow-hidden" style={{ background: "var(--border-subtle)", border: "1px solid var(--border-subtle)" }}>
            {([
              [Clock, "Duration", a.durationRange ?? a.durationDays],
              [Route, "Distance", a.distanceRange ?? a.distance ?? "—"],
              [Mountain, "Highest point", a.altitude ?? "—"],
              [Gauge, "Difficulty", a.difficulty],
              [CalendarDays, "Best season", a.bestSeason],
              [MapPin, "Starts from", start ?? access?.gateway ?? "—"],
            ] as const).map(([Icon, label, value]) => (
              <div key={label} className="px-4 py-3" style={{ background: "var(--bg-surface)" }}>
                <dt className="flex items-center gap-1.5 text-[11.5px] uppercase tracking-wider t-text-3"><Icon className="w-3.5 h-3.5" />{label}</dt>
                <dd className="text-[15px] font-semibold t-text mt-1 leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          <article className="min-w-0 max-w-3xl">
            {/* ── The short version ── */}
            <section id="short-version" className="scroll-mt-28 mt-8 rounded-2xl p-5 sm:p-6" style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.2)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: "var(--accent-ink)" }}>The short version</p>
              <ul className="space-y-2.5">
                {tldr.map((t, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-[1.6] t-text">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5" style={{ background: "#ff5100" }}>{i + 1}</span>
                    <span><Rich text={t} /></span>
                  </li>
                ))}
              </ul>
              <Link href={`/experiences/${a.slug}`} className="inline-flex items-center gap-1.5 mt-4 text-[14px] font-semibold" style={{ color: "var(--accent-ink)" }}>
                Trek page, photos and reviews <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            {/* ── Overview ── */}
            <Section id="overview" kicker="The trek" title="Overview">
              <p className="text-[15.5px] leading-[1.75] t-text-2 mb-5"><Rich text={a.description} /></p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={card}>
                  <p className="text-[13px] font-bold t-text mb-2.5">Right for you if</p>
                  <ul className="space-y-2">{whoFor.map((w) => <li key={w} className="flex gap-2 text-[14px] leading-[1.55] t-text-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />{w}</li>)}</ul>
                </div>
                <div className="rounded-2xl p-4" style={card}>
                  <p className="text-[13px] font-bold t-text mb-2.5">Think twice if</p>
                  <ul className="space-y-2">{whoNot.map((w) => <li key={w} className="flex gap-2 text-[14px] leading-[1.55] t-text-2"><XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />{w}</li>)}</ul>
                </div>
              </div>
            </Section>

            {/* ── When to go ── */}
            <Section id="when" kicker="Season" title="When to go">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-5" role="list" aria-label={`Best months: ${a.bestMonths.join(", ")}`}>
                {MONTHS.map((m) => {
                  const on = a.bestMonths.includes(m);
                  return (
                    <div key={m} role="listitem" className="rounded-lg py-2 text-center text-[12.5px] font-semibold"
                      style={on ? { background: "#ff5100", color: "#fff" } : { background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}>
                      {m}
                    </div>
                  );
                })}
              </div>
              {seasonNotes(a).map((n) => <BlockView key={n} block={{ p: n }} />)}
              <p className="text-[14px] t-text-3">More on the Himalayan seasons: <Link href="/adventurepedia/choosing-a-season" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>When to go</Link>.</p>
            </Section>

            {/* ── Getting there ── */}
            <Section id="getting-there" kicker="Travel" title="Getting there">
              {access ? (
                <>
                  <div className="rounded-2xl overflow-hidden" style={card}>
                    {([
                      [MapPin, "Meet in", access.gateway],
                      [Plane, "Nearest airport", access.air],
                      [TrainFront, "Nearest railway", access.rail],
                      ...(access.drive ? [[Car, "By road", access.drive]] : []),
                    ] as [typeof MapPin, string, string][]).map(([Icon, label, value], i) => (
                      <div key={label} className="flex gap-3.5 px-4 py-3.5" style={{ borderTop: i ? "1px solid var(--border-subtle)" : undefined }}>
                        <Icon className="w-4 h-4 shrink-0 mt-1" style={{ color: "var(--accent-ink)" }} />
                        <div><p className="text-[12px] uppercase tracking-wider t-text-3">{label}</p><p className="text-[15px] t-text mt-0.5">{value}</p></div>
                      </div>
                    ))}
                  </div>
                  {access.note && <BlockView block={{ callout: "tip", title: "Good to know", text: access.note }} />}
                  <p className="text-[14px] leading-[1.65] t-text-2 mt-4">Most operators run a shared pickup from {access.gateway} early on day one. Arrive the evening before so a late train or flight doesn&apos;t cost you the trek, and keep a buffer day at the end: mountain roads close for landslides and snow. Travel times are approximate.</p>
                </>
              ) : (
                <p className="text-[15px] t-text-2">Your operator arranges the transfer from the nearest town; ask them for the meeting point.</p>
              )}
            </Section>

            {/* ── Day by day ── */}
            {trail && (
              <Section id="itinerary" kicker="Itinerary" title="Day by day">
                <p className="text-[15px] leading-[1.7] t-text-2 mb-5">
                  A typical plan, measured along the mapped trail: <b className="t-text">{fmt(trail.lengthKm)} km</b> with about <b className="t-text">{fmt(trail.ascentM)} m</b> of climbing{hardest ? <>. The biggest day is <b className="t-text">day {hardest.day}</b>, climbing {fmt(hardest.up ?? 0)} m</> : null}. Operators vary it a little{(trail.approxKm ?? 0) > 0 ? "; figures marked ≈ are estimates where the path isn't mapped" : ""}.
                </p>
                <ol className="relative">
                  {trail.days.map((d, i) => {
                    const Icon = d.kind === "rest" ? Moon : d.kind === "travel" ? Car : Footprints;
                    const title = d.kind === "rest" ? `Rest day at ${d.from}` : d.kind === "travel" ? d.note.split(" (")[0] : `${d.from} → ${d.to}`;
                    return (
                      <li key={d.day} className="relative flex gap-4 pb-5 last:pb-0">
                        {i < trail.days.length - 1 && <span className="absolute left-[17px] top-10 bottom-0 w-px" style={{ background: "var(--border-subtle)" }} aria-hidden />}
                        <span className="relative w-9 h-9 rounded-full flex flex-col items-center justify-center shrink-0 text-white" style={{ background: d.kind === "walk" ? "#ff5100" : "var(--text-tertiary)" }}>
                          <span className="text-[9px] font-bold uppercase leading-none opacity-80">Day</span>
                          <span className="text-[13px] font-bold leading-none">{d.day}</span>
                        </span>
                        <div className="min-w-0 flex-1 rounded-2xl p-4" style={card}>
                          <p className="flex items-center gap-2 text-[15.5px] font-semibold t-text"><Icon className="w-4 h-4 shrink-0" style={{ color: "var(--accent-ink)" }} />{title}</p>
                          {d.via && d.via.length > 0 && <p className="text-[13px] t-text-3 mt-0.5">via {d.via.join(", ")}</p>}
                          {d.kind !== "travel" && d.note && <p className="text-[14px] leading-[1.6] t-text-2 mt-1.5">{d.note}</p>}
                          {d.kind === "walk" && (
                            <p className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-[13px] tabular-nums t-text-2">
                              <span className="inline-flex items-center gap-1"><Route className="w-3.5 h-3.5" />{d.approx ? "≈" : ""}{d.km} km</span>
                              <span className="inline-flex items-center gap-1"><ArrowUp className="w-3.5 h-3.5" />{fmt(d.up ?? 0)} m</span>
                              <span className="inline-flex items-center gap-1"><ArrowDown className="w-3.5 h-3.5" />{fmt(d.down ?? 0)} m</span>
                              {d.sleepEle != null && <span className="inline-flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />sleep at {fmt(d.sleepEle)} m</span>}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Section>
            )}

            {/* ── Altitude ── */}
            <Section id="altitude" kicker="Altitude" title={trail ? "Altitude and acclimatisation" : "Altitude"}>
              {prof && <ElevationChart pts={prof} />}
              {acc ? (
                <>
                  <div className="grid grid-cols-3 gap-3 my-5">
                    {([["Start", acc.startEle], ["Highest night", acc.highestSleep], ["Highest point", trail!.maxEleM]] as [string, number][]).map(([l, v]) => (
                      <div key={l} className="rounded-2xl p-3.5 text-center" style={card}>
                        <p className="text-[11.5px] uppercase tracking-wider t-text-3">{l}</p>
                        <p className="text-[20px] font-bold t-text tabular-nums mt-0.5">{fmt(v)} m</p>
                      </div>
                    ))}
                  </div>
                  <BlockView block={acc.jumps.length
                    ? { callout: "warn", title: "Where the itinerary climbs fast", text: `${acc.jumps.map((j) => `Day ${j.day} to ${j.place}: up ${fmt(j.gain)} m to sleep at ${fmt(j.to)} m`).join(". ")}. Take those days slowly, drink well, and tell your leader about any headache.` }
                    : { callout: "tip", title: "A gentle ascent", text: acclimVerdict! }} />
                </>
              ) : (
                <p className="text-[15px] leading-[1.7] t-text-2">The highest point is <b className="t-text">{a.altitude ?? "well above 3,000 m"}</b>. {g.alt >= 3000 ? "Check that your operator's itinerary sleeps no more than 300 to 500 m higher each night above 3,000 m, with a rest day on longer climbs." : "That's low enough that altitude sickness is unlikely, though not impossible."}</p>
              )}
              {alt >= 2500 && <p className="text-[14px] t-text-3 mt-3">Know the warning signs before you go: <Link href="/adventurepedia/altitude-sickness" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Altitude sickness</Link>.</p>}
            </Section>

            {/* ── Fitness ── */}
            <Section id="fitness" kicker="Fitness" title="How fit you need to be">
              {FITNESS[a.difficulty] && <BlockView block={{ p: `Rated **${a.difficulty}**. A fair benchmark before you go: ${FITNESS[a.difficulty].charAt(0).toLowerCase()}${FITNESS[a.difficulty].slice(1)}` }} />}
              <p className="text-[14px] t-text-2 mb-3">What this trek asks of you, on the ACE scale from 0 to 5:</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 rounded-2xl p-4" style={card}>
                {ACE_AXES.map((k) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-16 text-[13px] font-semibold t-text">{ACE_AXIS_LABELS[k]}</span>
                    <span className="flex-1 flex gap-1" aria-label={`${ACE_AXIS_LABELS[k]} ${ace[k]} of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => <span key={n} className="h-2 flex-1 rounded-full" style={{ background: n <= ace[k] ? ACE_AXIS_COLORS[k] : "var(--bg-surface-2)" }} />)}
                    </span>
                    <span className="w-8 text-right text-[12.5px] tabular-nums t-text-3">{ace[k]}/5</span>
                  </div>
                ))}
              </div>
              <p className="text-[14px] leading-[1.65] t-text-2 mt-4">
                Take the <Link href="/matchmaker" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Matchmaker</Link> to compare yourself against these scores, and use the <Link href="/adventurepedia/getting-fit" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>8-week plan</Link> to close any gaps. <Link href="/ace" className="underline underline-offset-2 t-text-3">How ACE works</Link>.
              </p>
            </Section>

            {/* ── Permits ── */}
            <Section id="permits" kicker="Paperwork" title="Permits and paperwork">
              <BlockView block={{ list: [...permitNotes(a), "Carry original government photo ID and a few photocopies.", "Rules and fees change. Ask your operator what's included and what you need to bring, two weeks before you go."] }} />
              <p className="text-[14px] t-text-3">More detail: <Link href="/adventurepedia/permits-and-documents" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Permits and documents</Link>.</p>
            </Section>

            {/* ── Packing ── */}
            <Section id="packing" kicker="Kit" title="What to pack">
              <p className="text-[15px] leading-[1.7] t-text-2 mb-1">For {a.name} in particular, on top of the standard layers:</p>
              <BlockView block={{ list: packingNotes(a) }} />
              <p className="text-[14px] t-text-3">The full list and how to layer: <Link href="/adventurepedia/what-to-pack" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>What to pack</Link>. The <Link href={`/experiences/${a.slug}#safety`} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>trek page</Link> has a tick-off checklist for this trek.</p>
            </Section>

            {/* ── Safety ── */}
            <Section id="safety" kicker="Safety" title="Safety on this trek">
              <BlockView block={{ callout: "warn", title: "From the trail", text: a.safetyNotes }} />
              <BlockView block={{ list: [
                ...(alt >= 3000 ? ["Altitude is the main risk. Don't go higher with symptoms; descend if they get worse."] : []),
                ...(a.bestMonths.some((m) => ["Dec", "Jan", "Feb"].includes(m)) ? ["Ice on the trail in winter: put microspikes on early, not after the first slip."] : []),
                ...(a.bestMonths.some((m) => ["Jul", "Aug"].includes(m)) ? ["Streams rise in the afternoon and after rain. Cross early, and turn back if it looks too fast."] : []),
                "Stay between the leader and the sweep, and respect the turnaround time on summit or pass days.",
                "Signal is scarce beyond the roadhead. Share your itinerary and your operator's emergency number with someone at home.",
              ] }} />
              <p className="text-[14px] t-text-3">See also <Link href="/adventurepedia/trail-craft" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Trail craft</Link> and <Link href="/adventurepedia/insurance-and-emergencies" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Insurance and emergencies</Link>.</p>
            </Section>

            {/* ── Booking ── */}
            <Section id="booking" kicker="Booking" title="Booking and cost">
              {price ? (
                <>
                  <p className="text-[15px] leading-[1.7] t-text-2 mb-4">{price.operators} operators run this trek on Trail to Tides, from <b className="t-text">{price.text}</b> per person. Prices usually cover the trek from the roadhead; check transport, permits and offloading.</p>
                  <ul className="rounded-2xl overflow-hidden" style={card}>
                    {[...a.operators].sort((x, y) => parseInt(x.priceFrom.replace(/\D/g, "")) - parseInt(y.priceFrom.replace(/\D/g, ""))).map((o, i) => (
                      <li key={o.name} className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid var(--border-subtle)" : undefined }}>
                        <span className="min-w-0 flex items-center gap-2 text-[14.5px] font-semibold t-text">
                          <span className="truncate">{o.name}</span>
                          {o.verified && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: "var(--accent-ink)" }} aria-label="Verified" />}
                        </span>
                        <span className="flex items-center gap-4 shrink-0 text-[13.5px] tabular-nums">
                          <span className="inline-flex items-center gap-1 t-text-3"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{o.googleRating.toFixed(1)}</span>
                          <span className="font-semibold t-text">{o.priceFrom}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/experiences/${a.slug}#book-this-adventure`} className="mt-4 inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
                    Compare operators side by side <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[14px] t-text-3 mt-4">What to ask before you pay: <Link href="/adventurepedia/choosing-an-operator" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Choosing an operator</Link>.</p>
                </>
              ) : (
                <p className="text-[15px] t-text-2">Operators for this trek are coming soon.</p>
              )}
            </Section>

            {/* ── Offline ── */}
            {trail && (
              <Section id="offline" kicker="Navigation" title="Offline map and GPX">
                <p className="text-[15px] leading-[1.7] t-text-2 mb-4">Download the trail, with every overnight stop and its height, and load it on your phone before you lose signal.</p>
                <div className="flex flex-wrap gap-3">
                  <a href={`/experiences/${a.slug}/trail.gpx`} download={`${a.slug}-trail-to-tides.gpx`} className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
                    <Download className="w-4 h-4" /> Download GPX
                  </a>
                  <Link href={`/adventurepedia/offline-maps?trek=${a.slug}`} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14px] font-semibold t-text" style={{ border: "1px solid var(--border-default)" }}>
                    How to use it offline <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-[12px] t-text-3 mt-3">Trail © OpenStreetMap contributors, via BRouter.</p>
              </Section>
            )}

            {/* ── FAQ ── */}
            <Section id="faq" kicker="FAQ" title="Questions people ask">
              <div className="space-y-2.5">
                {faq.map(([q, ans]) => (
                  <details key={q} className="group rounded-2xl overflow-hidden" style={card}>
                    <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <span className="text-[15px] font-semibold t-text">{q}</span>
                      <ChevronRight className="w-4 h-4 t-text-3 shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="px-4 pb-4 text-[14.5px] leading-[1.65] t-text-2">{ans}</p>
                  </details>
                ))}
              </div>
            </Section>

            <div className="mt-12 rounded-2xl p-5 flex gap-3" style={card}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 t-text-3" />
              <p className="text-[13px] leading-[1.6] t-text-3">This guide is built from Trail to Tides&apos; trek data, mapped trails and operator listings, and checked by our team. Conditions change with weather and seasons: your trek leader&apos;s call on the day always comes first.</p>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block pt-8">
            <div className="sticky top-28 space-y-6">
              <form action="/adventurepedia" role="search" className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 t-text-3" />
                <input name="q" type="search" placeholder="Search all guides" aria-label="Search all guides"
                  className="w-full h-10 pl-9 pr-3 rounded-xl text-[13.5px] t-text outline-none" style={card} />
              </form>
              <nav aria-label="In this guide">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3">In this guide</p>
                <ol className="space-y-1.5 text-[13.5px] border-l" style={{ borderColor: "var(--border-subtle)" }}>
                  {contents.map(([id, label]) => (
                    <li key={id}><a href={`#${id}`} className="block pl-3 -ml-px border-l border-transparent t-text-2 hover:text-[#ff5100] hover:border-[#ff5100]">{label}</a></li>
                  ))}
                </ol>
              </nav>
              {price && (
                <Link href={`/experiences/${a.slug}#book-this-adventure`} className="block rounded-2xl p-4" style={card}>
                  <p className="text-[12px] uppercase tracking-wider t-text-3">From</p>
                  <p className="text-[22px] font-bold t-text">₹{price.lo.toLocaleString("en-IN")}</p>
                  <p className="text-[13px] font-semibold mt-1 inline-flex items-center gap-1" style={{ color: "var(--accent-ink)" }}>Compare {price.operators} operators <ArrowRight className="w-3.5 h-3.5" /></p>
                </Link>
              )}
              <Link href="/adventurepedia/treks" className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--accent-ink)" }}>
                All trek guides <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Elevation along the trail, with the start, high point and finish labelled */
function ElevationChart({ pts }: { pts: [number, number][] }) {
  const W = 1000, H = 220, PAD = { l: 44, r: 12, t: 24, b: 24 };
  const maxKm = pts[pts.length - 1][0] || 1;
  const eles = pts.map((p) => p[1]);
  const lo = Math.floor((Math.min(...eles) - 100) / 500) * 500;
  const hi = Math.ceil((Math.max(...eles) + 100) / 500) * 500;
  const x = (km: number) => PAD.l + (km / maxKm) * (W - PAD.l - PAD.r);
  const y = (e: number) => PAD.t + (1 - (e - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const line = pts.map(([k, e], i) => `${i ? "L" : "M"}${x(k).toFixed(1)},${y(e).toFixed(1)}`).join("");
  const top = pts.reduce((m, p) => (p[1] > m[1] ? p : m), pts[0]);
  const ticks: number[] = [];
  for (let e = lo; e <= hi; e += hi - lo > 2000 ? 1000 : 500) ticks.push(e);
  return (
    <figure className="rounded-2xl p-3 sm:p-4" style={card}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Elevation from ${fmt(eles[0])} m, highest ${fmt(top[1])} m, over ${maxKm.toFixed(0)} km`}>
        <defs>
          <linearGradient id="tg-elev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5100" stopOpacity="0.32" />
            <stop offset="1" stopColor="#ff5100" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((e) => (
          <g key={e}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(e)} y2={y(e)} stroke="var(--border-subtle)" strokeDasharray="3 4" />
            <text x={PAD.l - 6} y={y(e) + 4} textAnchor="end" fontSize="13" fill="var(--text-tertiary)">{fmt(e)}</text>
          </g>
        ))}
        <path d={`${line}L${x(maxKm)},${H - PAD.b}L${x(0)},${H - PAD.b}Z`} fill="url(#tg-elev)" />
        <path d={line} fill="none" stroke="#ff5100" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={x(top[0])} cy={y(top[1])} r="5" fill="#ff5100" stroke="var(--bg-surface)" strokeWidth="2" />
        {/* Keep the label inside the chart when the high point sits at either end */}
        <text x={x(top[0])} y={y(top[1]) - 10} textAnchor={x(top[0]) > W - 80 ? "end" : x(top[0]) < PAD.l + 60 ? "start" : "middle"} fontSize="14" fontWeight="700" fill="var(--text-primary)">{fmt(top[1])} m</text>
        <text x={PAD.l} y={H - 6} fontSize="13" fill="var(--text-tertiary)">0 km</text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize="13" fill="var(--text-tertiary)">{maxKm.toFixed(0)} km</text>
      </svg>
    </figure>
  );
}
