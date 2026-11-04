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
import ChatBubble from "@/components/ChatBubble";
import { getACE, ACE_AXES, ACE_AXIS_LABELS, ACE_AXIS_COLORS } from "@/lib/ace";
import { adventures } from "@/lib/data";
import { haversineKm } from "@/lib/geo";
import { sunTimes, clock } from "@/lib/sun";
import {
  trekAdventures, trekGuide, trekGuideHref, MONTHS, seasonNotes, acclimatisation, profile, packingNotes, permitNotes, priceRange, splitList,
} from "@/lib/trekGuides";
import { Rich, BlockView, serif } from "../../blocks";
import AskCompassButton from "../../activities/AskCompassButton";
import TrekElevation, { type DayBand } from "./TrekElevation";
import TrekChecklist, { type ChecklistItem } from "./TrekChecklist";
import CompareTreksButton from "./CompareTreksButton";

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
    title: `${a.name}: Itinerary, Season & Permits`,
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

  // Each walking day as a stretch of the profile, from where it starts to where it sleeps
  const bands: DayBand[] = [];
  if (trail) {
    let cursor = 0;
    const kmOf = (name: string, from: number) =>
      trail.stops.find((s) => s.name === name && s.km >= from - 0.05)?.km ?? trail.stops.find((s) => s.name === name)?.km;
    for (const d of walkDays) {
      const a0 = kmOf(d.from, cursor), a1 = d.to ? kmOf(d.to, a0 ?? cursor) : undefined;
      if (a0 == null || a1 == null || Math.abs(a1 - a0) < 0.2) continue;
      bands.push({ day: d.day, from: a0, to: a1, label: `${d.from} to ${d.to}, ${d.km} km, up ${fmt(d.up ?? 0)} m${d.note ? `. ${d.note}` : ""}` });
      cursor = Math.max(a0, a1);
    }
  }

  // Daylight at each camp, in the next month the trek is in season (the 15th, India time)
  const nowMonth = new Date().getUTCMonth();
  const seasonMonth = [...Array(12).keys()].map((i) => (nowMonth + i) % 12).find((m) => a.bestMonths.includes(MONTHS[m])) ?? nowMonth;
  const seasonDate = new Date(Date.UTC(new Date().getUTCFullYear() + (seasonMonth < nowMonth ? 1 : 0), seasonMonth, 15));
  const camps = (trail?.sleepPlaces ?? []).map((p) => ({ ...p, sun: sunTimes(p.lat, p.lng, seasonDate) })).filter((p) => p.sun);
  const sameSun = camps.length > 1 && camps.every((c) => Math.abs(c.sun!.rise - camps[0].sun!.rise) < 3 && Math.abs(c.sun!.set - camps[0].sun!.set) < 3);
  const daylen = (t: { rise: number; set: number }) => { const m = Math.round(t.set - t.rise); return `${Math.floor(m / 60)} h ${m % 60} m`; };

  // Before you leave: what to have sorted, from this trek's own facts
  const checklist: ChecklistItem[] = [
    { id: "id", text: "Original photo ID, and two photocopies." },
    ...(permitNotes(a).length ? [{ id: "permits", text: "Permits confirmed with your operator.", href: "#permits", link: "What's needed" }] : []),
    { id: "insurance", text: alt >= 3000 ? `Insurance that names trekking up to ${fmt(alt)} m, with helicopter evacuation.` : "Travel insurance that names trekking.", href: "/adventurepedia/insurance-and-emergencies", link: "What to check" },
    ...(trail ? [{ id: "gpx", text: "The GPX downloaded and opened offline on your phone.", href: "#offline", link: "Get it" }] : []),
    { id: "home", text: "Your itinerary and your operator's emergency number sent to someone at home." },
    ...(access?.gateway ? [{ id: "cash", text: `Cash from ${access.gateway}: cards and ATMs thin out past it.` }] : []),
    { id: "spare", text: "A spare day at the end, for weather or roads." },
    { id: "boots", text: "Boots worn in on two or three long walks." },
    { id: "fit", text: "Your fitness checked against this trek.", href: `/matchmaker?from=${a.slug}`, link: "Adventure Matchmaker" },
    { id: "weather", text: "The forecast checked the day before you leave." },
  ];

  // The mistakes that catch people out on this trek, worked out from its numbers and season
  const winter = a.bestMonths.some((m) => ["Dec", "Jan", "Feb"].includes(m));
  const monsoon = a.bestMonths.some((m) => ["Jul", "Aug"].includes(m));
  const mistakes = [
    ...(hardest && (hardest.up ?? 0) >= 700 ? [`**Starting day ${hardest.day} late.** It climbs ${fmt(hardest.up ?? 0)} m: leave early, while it's cool and before afternoon weather.`] : []),
    ...(acc && acc.jumps.length ? [`**Pushing on with a headache on day ${acc.jumps[0].day}.** It's the biggest jump in sleeping height, up ${fmt(acc.jumps[0].gain)} m to ${fmt(acc.jumps[0].to)} m. Tell your leader early.`] : []),
    ...(winter ? ["**Cotton layers and smooth soles on snow.** Wet cotton chills fast, and boots without grip slip: wear wool or synthetics, and put microspikes on early."] : []),
    ...(monsoon ? ["**No spare day in the rains.** One landslide can close the road for a day or more."] : []),
    ...(alt >= 3500 ? ["**Drinking only when thirsty.** At height you lose more water than you feel: aim for 3 to 4 litres a day."] : []),
    "**Walking in new boots.** Blisters on day one make every day after it harder.",
    "**Packing heavy.** Over about 10 kg, the steep days get much harder. Offload with your operator if they offer it.",
  ].slice(0, 5);

  // Treks most like this one: closest in what they ask of you, nearest first on a tie
  const similar = trekAdventures().filter((t) => t.slug !== a.slug)
    .map((t) => {
      const ta = getACE(t);
      return { t, d: ACE_AXES.reduce((s, k) => s + Math.abs(ta[k] - ace[k]), 0) + (t.state === a.state ? 0 : 1), km: haversineKm(a.lat, a.lng, t.lat, t.lng) };
    })
    .sort((p, q) => p.d - q.d || p.km - q.km).slice(0, 3);
  // Something else nearby to add on: other kinds of adventure, three days or less, within 200 km
  // in a straight line (mountain roads make the drive longer)
  const nearby = adventures.filter((x) => x.type !== "Trekking" && x.type !== "Mountaineering")
    .map((x) => ({ x, km: haversineKm(a.lat, a.lng, x.lat, x.lng) })).filter((n) => n.km <= 200 && (parseInt(n.x.durationDays, 10) || 99) <= 3)
    .sort((p, q) => p.km - q.km).slice(0, 3);

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
    ["ready", "Before you leave"], ["booking", "Booking and cost"], ...(trail ? [["offline", "Offline map and GPX"]] as [string, string][] : []),
    ["more", "Similar treks, and nearby"], ["faq", "Questions"],
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

                {/* Daylight at each camp, so a day's walk can be timed to it */}
                {camps.length > 0 && (
                  <div className="mt-6 rounded-2xl overflow-hidden" style={card}>
                    <p className="px-4 pt-3.5 pb-2 text-[14px] font-semibold t-text">Daylight at camp in {MONTHS[seasonMonth]}</p>
                    {/* Camps close together share one sunrise and sunset: say it once */}
                    {sameSun ? (
                      <p className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] tabular-nums" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <span className="flex-1 min-w-0 t-text-2">At every camp, {camps.map((c) => c.name).join(", ")}</span>
                        <span className="t-text-2">{clock(camps[0].sun!.rise)} to {clock(camps[0].sun!.set)}</span>
                        <span className="w-16 text-right t-text-3">{daylen(camps[0].sun!)}</span>
                      </p>
                    ) : <ul>
                      {camps.map((c) => (
                        <li key={c.name} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] tabular-nums" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                          <span className="flex-1 min-w-0 truncate font-semibold t-text">{c.name}{c.ele != null && <span className="font-normal t-text-3"> · {fmt(c.ele)} m</span>}</span>
                          <span className="t-text-2">{clock(c.sun!.rise)} to {clock(c.sun!.set)}</span>
                          <span className="w-16 text-right t-text-3">{daylen(c.sun!)}</span>
                        </li>
                      ))}
                    </ul>}
                    <p className="px-4 py-2.5 text-[12px] t-text-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>For the 15th, on a flat horizon. In a valley the sun goes behind the ridges sooner, so plan to reach camp an hour before sunset.</p>
                  </div>
                )}
              </Section>
            )}

            {/* ── Altitude ── */}
            <Section id="altitude" kicker="Altitude" title={trail ? "Altitude and acclimatisation" : "Altitude"}>
              {prof && <TrekElevation pts={prof} bands={bands} />}
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
              <p className="text-[14px] t-text-2 mb-3">What this trek asks of you, on the ACE™ scale from 0 to 5:</p>
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
                Take the <Link href="/matchmaker" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Matchmaker</Link> to compare yourself against these scores, and use the <Link href="/adventurepedia/getting-fit" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>8-week plan</Link> to close any gaps. <Link href="/ace" className="underline underline-offset-2 t-text-3">How ACE™ works</Link>.
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

              <h3 className="text-[18px] t-text mt-8 mb-2" style={serif}>Mistakes people make here</h3>
              <BlockView block={{ list: mistakes }} />
            </Section>

            {/* ── Before you leave ── */}
            <Section id="ready" kicker="Checklist" title="Before you leave">
              <p className="text-[15px] leading-[1.7] t-text-2 mb-4">Tick these off as you sort them; they stay ticked on this device.</p>
              <TrekChecklist slug={a.slug} items={checklist} />
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

            {/* ── Similar treks, and something else nearby ── */}
            <Section id="more" kicker="Also consider" title="Similar treks, and more nearby">
              <div className="grid sm:grid-cols-3 gap-3">
                {similar.map(({ t }) => (
                  <Link key={t.slug} href={trekGuideHref(t.slug)} className="group rounded-2xl p-4 transition-colors hover:border-[#ff5100]/50" style={card}>
                    <span className="block text-[15px] font-semibold t-text leading-snug group-hover:text-[#ff5100]">{t.name}</span>
                    <span className="block text-[12.5px] t-text-3 mt-1">{t.state} · {t.durationDays} · {t.difficulty}</span>
                  </Link>
                ))}
              </div>
              {similar[0] && <CompareTreksButton slugs={[a.slug, similar[0].t.slug]} label={`Compare it side by side with ${similar[0].t.name}`} />}
              {nearby.length > 0 && (
                <>
                  <h3 className="text-[18px] t-text mt-7 mb-2" style={serif}>Make a week of it</h3>
                  <p className="text-[14.5px] t-text-2 mb-3">Something different to add on, three days or less (distances in a straight line):</p>
                  <ul className="space-y-2">
                    {nearby.map(({ x, km }) => (
                      <li key={x.slug}>
                        <Link href={`/experiences/${x.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={card}>
                          <span className="min-w-0">
                            <span className="block text-[14.5px] font-semibold t-text truncate group-hover:text-[#ff5100]">{x.name}</span>
                            <span className="block text-[12.5px] t-text-3">{x.type} · {x.durationDays}</span>
                          </span>
                          <span className="shrink-0 text-[13px] tabular-nums t-text-3">{fmt(km)} km away</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Section>

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
              {/* Anything else: Compass.AI, already asked about this trek */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <AskCompassButton prompt={`Tell me about the ${a.name}: is it right for me, and what should I know before I book?`} label={`Ask Compass.AI about ${a.name}`} />
                <span className="text-[13px] t-text-3">It knows this trek and every other on the site.</span>
              </div>
            </Section>

            <div className="mt-12 rounded-2xl p-5 flex gap-3" style={card}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 t-text-3" />
              <p className="text-[13px] leading-[1.6] t-text-3">
                This guide is built from Trail to Tides&apos; trek data, mapped trails and operator listings, and checked by our team.
                {trail && <> Trail data last rebuilt {new Date(trail.builtAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.</>}
                {" "}Conditions change with weather and seasons: your trek leader&apos;s call on the day always comes first.
                {" "}Spotted something out of date? <Link href="/contact" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Tell us</Link> and we&apos;ll check it.
              </p>
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
      <ChatBubble />
    </div>
  );
}
