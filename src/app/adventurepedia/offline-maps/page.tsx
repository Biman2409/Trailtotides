import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";
import { TRAIL_SLUGS } from "@/lib/trails";
import {
  Smartphone, Laptop, Watch, Footprints, BatteryCharging, Wrench, Signal, Download, MapPinned, Plane,
  ChevronDown, ChevronRight, ShieldAlert, Apple,
} from "lucide-react";
import TrekDownloadCard from "./TrekDownloadCard";
import Checklist from "./Checklist";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Adventurepedia: Trek GPX Trails, Offline",
  description: "Download a trek's GPX trail, load it into Organic Maps, OsmAnd or Gaia GPS on Android or iPhone, and follow it with no signal. Plus GPS watches and troubleshooting.",
  alternates: { canonical: `${SITE}/adventurepedia/offline-maps` },
  openGraph: { title: "Adventurepedia: Take your trek offline", url: `${SITE}/adventurepedia/offline-maps`, type: "article" },
};

// ── Building blocks ──────────────────────────────────────────────────────────

const serif = { fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 } as const;

function Section({ id, icon: Icon, kicker, title, children }: { id: string; icon: typeof Smartphone; kicker?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 pt-12 first:pt-0">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}><Icon className="w-5 h-5 text-[#ff5100]" /></span>
        <div>
          {kicker && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ff5100]">{kicker}</p>}
          <h2 className="text-2xl sm:text-[28px] t-text leading-tight" style={serif}>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-[1.7] t-text-2 mb-3">{children}</p>;
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="relative my-4">
      {items.map((s, i) => (
        <li key={i} className="relative flex gap-3.5 pb-4 last:pb-0">
          {i < items.length - 1 && <span className="absolute left-[13px] top-8 bottom-0 w-px" style={{ background: "var(--border-subtle)" }} aria-hidden />}
          <span className="relative w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: "#ff5100" }}>{i + 1}</span>
          <div className="text-[15px] leading-[1.65] t-text-2 pt-0.5">{s}</div>
        </li>
      ))}
    </ol>
  );
}

function A({ href, children }: { href: string; children: ReactNode }) {
  const ext = href.startsWith("http");
  return <a href={href} {...(ext ? { target: "_blank", rel: "noopener" } : {})} className="font-semibold underline underline-offset-2 decoration-[#ff5100]/50 hover:decoration-[#ff5100] t-text">{children}</a>;
}

const B = ({ children }: { children: ReactNode }) => <b className="t-text font-semibold">{children}</b>;

/** A collapsible question, closed by default: keeps backups and fixes out of the way until needed */
function Fold({ title, children, tone }: { title: ReactNode; children: ReactNode; tone?: "warn" }) {
  return (
    <details className="group rounded-xl my-2.5 overflow-hidden" style={{ background: "var(--bg-surface)", border: `1px solid ${tone === "warn" ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}` }}>
      <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="text-[14.5px] font-semibold t-text">{title}</span>
        <ChevronDown className="w-4 h-4 t-text-3 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-[14px] leading-[1.65] t-text-2">{children}</div>
    </details>
  );
}

function AppRow({ name, href, cost, how }: { name: string; href: string; cost: string; how: ReactNode }) {
  return (
    <div className="py-3 first:pt-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <p className="flex flex-wrap items-baseline gap-x-2"><A href={href}>{name}</A><span className="text-[12px] t-text-3">{cost}</span></p>
      <p className="mt-1">{how}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OfflineMapsGuide() {
  const treks = Object.fromEntries(TRAIL_SLUGS.map((s) => [s, adventures.find((a) => a.slug === s)?.name ?? s]));

  const contents: [string, string][] = [
    ["quick-start", "The short version"],
    ["how-it-works", "How it works"],
    ["before-you-go", "Before you leave home"],
    ["android", "Android"],
    ["iphone", "iPhone and iPad"],
    ["computer", "Computer"],
    ["watch", "GPS watches"],
    ["on-the-trail", "On the trail"],
    ["battery", "Battery in the cold"],
    ["troubleshooting", "If something goes wrong"],
  ];

  const devices = [
    { id: "android", icon: Smartphone, label: "Android", sub: "Organic Maps + backups" },
    { id: "iphone", icon: Apple, label: "iPhone & iPad", sub: "Organic Maps + backups" },
    { id: "computer", icon: Laptop, label: "Computer", sub: "View, print, send to phone" },
    { id: "watch", icon: Watch, label: "GPS watch", sub: "Garmin, Suunto, Coros" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12">
          <article className="min-w-0 max-w-3xl">
            {/* ── Hero ── */}
            <nav className="flex items-center gap-1.5 text-[12px] t-text-3 mb-3" aria-label="Breadcrumb">
              <Link href="/adventurepedia" className="font-semibold text-[#ff5100] hover:underline underline-offset-2">Adventurepedia</Link>
              <ChevronRight className="w-3 h-3" />
              <span>Offline maps</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl t-text leading-[1.06]" style={{ ...serif, letterSpacing: "-0.02em" }}>Take your trek offline</h1>
            <p className="text-[17px] leading-[1.6] t-text-2 mt-4">
              Most Himalayan trails have no phone signal for days. Your phone&apos;s GPS doesn&apos;t need any. Load the trail and an offline map before you leave and you&apos;ll see exactly where you are on the route, in airplane mode, anywhere. About 15 minutes at home.
            </p>

            <Suspense fallback={null}>
              <TrekDownloadCard treks={treks} />
            </Suspense>

            {/* ── Quick start ── */}
            <section id="quick-start" className="scroll-mt-28 mt-8 rounded-2xl p-5 sm:p-6" style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.2)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ff5100] mb-3">The short version</p>
              <ol className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Download, t: "Install Organic Maps", d: "Free, no ads, no account. Android or iPhone." },
                  { icon: MapPinned, t: "Download the region's map", d: "The state, or Nepal. On Wi-Fi, at home." },
                  { icon: Footprints, t: "Load the trail file", d: "Download the GPX from the trek's page, open it in the app." },
                  { icon: Plane, t: "Test in airplane mode", d: "Map still shows, blue dot appears: you're ready." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 rounded-xl p-3.5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-[13px] font-bold" style={{ background: "#ff5100" }}>{i + 1}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[14.5px] font-semibold t-text"><s.icon className="w-3.5 h-3.5 text-[#ff5100]" />{s.t}</span>
                      <span className="block text-[13px] t-text-3 mt-0.5">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-[13px] t-text-2 mt-4">Need the details? Pick your device:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {devices.map((d) => (
                  <a key={d.id} href={`#${d.id}`} className="group rounded-xl p-3 transition-colors hover:border-[#ff5100]/50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                    <d.icon className="w-5 h-5 text-[#ff5100] mb-1.5" />
                    <span className="block text-[13.5px] font-semibold t-text">{d.label}</span>
                    <span className="block text-[11.5px] t-text-3 leading-snug">{d.sub}</span>
                  </a>
                ))}
              </div>
            </section>

            <div className="mt-12">
              {/* ── How it works ── */}
              <Section id="how-it-works" icon={Signal} kicker="Basics" title="How it works">
                <P>You need two things on your phone: an <B>offline map</B> of the area and the <B>trail file</B>.</P>
                <div className="grid sm:grid-cols-2 gap-3 my-4">
                  <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                    <p className="text-[14px] font-semibold t-text mb-1">The offline map</p>
                    <p className="text-[14px] leading-[1.6] t-text-2">Valleys, rivers, villages and paths, saved on your phone. Apps like Organic Maps download a whole state or country at once, usually a few hundred MB.</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                    <p className="text-[14px] font-semibold t-text mb-1">The trail file (GPX)</p>
                    <p className="text-[14px] leading-[1.6] t-text-2">The walking line start to finish, plus every overnight stop as a named point with its height. About 40 KB. Every map app and GPS watch reads it.</p>
                  </div>
                </div>
                <P>On the trail your phone&apos;s GPS chip listens to satellites directly: no SIM, no data, works in airplane mode. The app shows a blue dot where you are and the trail as a line. Dot on the line means you&apos;re on the route.</P>
                <div className="flex gap-3 rounded-xl p-4 my-4" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.22)" }}>
                  <ShieldAlert className="w-5 h-5 text-[#ff5100] shrink-0 mt-0.5" />
                  <p className="text-[14px] leading-[1.6] t-text-2"><B>A backup, not your guide.</B> Paths shift after landslides and heavy snow, and a GPS line can&apos;t tell you a bridge is out. Follow your guide and your operator&apos;s route; use the map to know where you are, how far the next stop is, and the way back if you get separated.</p>
                </div>
              </Section>

              {/* ── Before you go ── */}
              <Section id="before-you-go" icon={Download} kicker="At home, on Wi-Fi" title="Before you leave home">
                <P>Tick these off a few days before you travel. Mountain data, where there is any, is too slow for map downloads.</P>
                <Checklist items={[
                  { id: "app", text: <>Install the app on your phone (Organic Maps is our pick)</> },
                  { id: "map", text: <>Download the offline map: the state for Indian treks, or Nepal</> },
                  { id: "gpx", text: <>Download the trek&apos;s GPX file and load it into the app</> },
                  { id: "test", text: <>Test it: airplane mode on, open the app, check the map shows and the blue dot appears</> },
                  { id: "second", text: <>Put the same file on a second phone in your group</> },
                  { id: "power", text: <>Pack a power bank (10,000 mAh) and a short cable</> },
                ]} />
              </Section>

              {/* ── Android ── */}
              <Section id="android" icon={Smartphone} kicker="Step by step" title="Android">
                <Steps items={[
                  <>Install <A href="https://play.google.com/store/apps/details?id=app.organicmaps">Organic Maps from Google Play</A>, open it, and allow location access with <B>Precise</B> on.</>,
                  <>Download the region: open the menu → <B>Download maps</B>, search for the state or country (<i>Uttarakhand</i>, <i>Nepal</i>) and tap to download. Or pan the map to the trek and accept the offer to download that area.</>,
                  <>On the trek&apos;s page, tap <B>Download trail (GPX)</B>. It saves to <B>Downloads</B>, named after the trek.</>,
                  <>Tap the file in the download notification (or <B>Files → Downloads</B>) and choose <B>Organic Maps</B>. The trail and stops appear, saved under <B>Bookmarks and tracks</B> (the star).</>,
                ]} />
                <Fold title="The file won't open in Organic Maps">
                  Open Organic Maps, tap the <B>star</B> (Bookmarks and tracks), open its menu and choose <B>Import</B>, then pick the file from Downloads.
                </Fold>
                <Fold title="Organic Maps doesn't work for me: other apps">
                  <p className="mb-1">These read the same file. Each needs its own offline map downloaded at home.</p>
                  <AppRow name="OsmAnd" href="https://osmand.net" cost="free; the free version limits map downloads" how={<>Open the file with OsmAnd, or <B>Menu → My places → Tracks → Import</B>. For spoken guidance, open the track and choose <B>Follow track</B>.</>} />
                  <AppRow name="Gaia GPS" href="https://www.gaiagps.com" cost="free account; offline maps need a paid plan" how={<>Share the file to Gaia GPS, or upload it on gaiagps.com and it syncs.</>} />
                  <AppRow name="Guru Maps" href="https://gurumaps.app" cost="free to start; some features paid" how={<>Open the file with Guru Maps; it adds the track and stops.</>} />
                  <AppRow name="Locus Map" href="https://www.locusmap.app" cost="free with ads" how={<>Open the file with Locus Map and choose <B>Import</B>.</>} />
                </Fold>
              </Section>

              {/* ── iPhone ── */}
              <Section id="iphone" icon={Apple} kicker="Step by step" title="iPhone and iPad">
                <Steps items={[
                  <>Install <A href="https://apps.apple.com/app/organic-maps-offline-map/id1567437057">Organic Maps from the App Store</A>, open it, and allow location <B>While Using the App</B> with <B>Precise Location</B> on.</>,
                  <>Download the region: menu → <B>Download maps</B>, search for the state or country and tap to download.</>,
                  <>On the trek&apos;s page in Safari, tap <B>Download trail (GPX)</B> and confirm <B>Download</B>. It goes to <B>Files → Downloads</B>.</>,
                  <>In Files, press and hold the file → <B>Share</B> → <B>Organic Maps</B>. The trail is saved under <B>Bookmarks and tracks</B>.</>,
                ]} />
                <Fold title="Organic Maps isn't in the share list">
                  Swipe the row of apps to the end and tap <B>More</B> to switch it on. Or open Organic Maps → the <B>star</B> → <B>Import</B> and pick the file from Files. On Chrome, tap <B>Open in…</B> after the download.
                </Fold>
                <Fold title="Organic Maps doesn't work for me: other apps">
                  <AppRow name="OsmAnd Maps" href="https://osmand.net" cost="free; the free version limits map downloads" how={<>Share the file to OsmAnd, or <B>My places → Tracks → Import</B>.</>} />
                  <AppRow name="Gaia GPS" href="https://www.gaiagps.com" cost="free account; offline maps need a paid plan" how={<>Share the file to Gaia GPS, or upload it on gaiagps.com and sync.</>} />
                  <AppRow name="Guru Maps" href="https://gurumaps.app" cost="free to start; some features paid" how={<>Share the file to Guru Maps from Files.</>} />
                </Fold>
              </Section>

              {/* ── Computer ── */}
              <Section id="computer" icon={Laptop} kicker="Windows, Mac, Linux" title="On a computer">
                <P>Not for navigating on the trail, but the best screen for studying the route and printing a paper backup.</P>
                <Steps items={[
                  <>Click <B>Download trail (GPX)</B>. It saves to your Downloads folder.</>,
                  <>Look at it: drag it onto <A href="https://gpx.studio">gpx.studio</A> in your browser (free, nothing to install) for the line and its elevation, or open it in <A href="https://www.gpxsee.org">GPXSee</A> or <A href="https://www.google.com/earth/about/versions/">Google Earth Pro</A> (<B>File → Open</B>) for 3D.</>,
                  <>Print a backup: zoom to each day&apos;s section and print or save as PDF. A folded page in a zip bag never runs flat.</>,
                  <>Send it to your phone by email, WhatsApp, Google Drive or iCloud, then follow the Android or iPhone steps.</>,
                ]} />
              </Section>

              {/* ── Watch ── */}
              <Section id="watch" icon={Watch} kicker="Garmin, Suunto, Coros" title="GPS watches">
                <P>Outdoor watches follow a GPX as a <B>course</B> or <B>route</B>: the line on the screen, a buzz if you stray. Get the file onto your phone or computer first; menu names vary a little by app version.</P>
                <div className="rounded-xl px-4 my-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <AppRow name="Garmin" href="https://connect.garmin.com/modern/courses" cost="Garmin Connect, free" how={<>On connect.garmin.com: <B>Training &amp; Planning → Courses → Import</B>, save, <B>Send to Device</B>. On the watch: <B>Navigate → Courses</B>.</>} />
                  <AppRow name="Suunto" href="https://www.suunto.com/suunto-app/" cost="Suunto app, free" how={<>Share the GPX to the Suunto app; it saves a route. Sync, then start an exercise with navigation.</>} />
                  <AppRow name="Coros" href="https://coros.com/app" cost="Coros app, free" how={<>Share the GPX to the Coros app to import a route, then sync the watch.</>} />
                  <AppRow name="Others" href="https://www.topografix.com/gpx.asp" cost="Wahoo, Polar, Amazfit, handheld GPS" how={<>Nearly all import GPX in their app or desktop software as a route or course.</>} />
                </div>
              </Section>

              {/* ── On the trail ── */}
              <Section id="on-the-trail" icon={Footprints} kicker="Using it" title="On the trail">
                <P>Open the app, find the trail in Bookmarks and tracks, and tap it so it&apos;s showing. Tap the location button to centre the blue dot.</P>
                <div className="grid sm:grid-cols-2 gap-3 my-4">
                  {[
                    ["Am I on the route?", "Dot on the line means yes. A few dozen metres off in a deep valley is normal: cliffs and forest bounce the signal."],
                    ["How far to camp?", "Tap the next stop's point for the straight-line distance. The trek's itinerary has the walking distance and climb for each day."],
                    ["Which way?", "Tap the location button again so the map turns with you and the way you face is up."],
                    ["Separated from the group?", "Stay put and visible if you can. If you must move, follow the line back to the last stop you all passed."],
                  ].map(([q, a]) => (
                    <div key={q} className="rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                      <p className="text-[14px] font-semibold t-text mb-1">{q}</p>
                      <p className="text-[14px] leading-[1.6] t-text-2">{a}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ── Battery ── */}
              <Section id="battery" icon={BatteryCharging} kicker="Cold drains phones" title="Battery in the cold">
                <ul className="space-y-2.5 my-2">
                  {[
                    [<>Airplane mode</>, <>while walking. GPS keeps working; hunting for a signal is what empties phones in the mountains.</>],
                    [<>Check, don&apos;t stare.</>, <>Open the map at junctions and breaks, then lock the screen.</>],
                    [<>Keep it warm:</>, <>an inside pocket by day, your sleeping bag at night. Batteries fade fast below freezing.</>],
                    [<>Carry a power bank</>, <>(10,000 mAh is two to three charges). Lodge charging is paid and shared, where it exists.</>],
                    [<>Low Power Mode</>, <>(iPhone) or Battery Saver (Android) helps a lot and doesn&apos;t stop GPS.</>],
                  ].map(([h, t], i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-[1.6] t-text-2"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5100] mt-2.5 shrink-0" /><span><B>{h}</B> {t}</span></li>
                  ))}
                </ul>
              </Section>

              {/* ── Troubleshooting ── */}
              <Section id="troubleshooting" icon={Wrench} kicker="Fixes" title="If something goes wrong">
                <Fold title={"The file opens as text, or \"can't open file\""}>Your phone picked the wrong app. Import from inside the map app instead: Organic Maps, the star → <B>Import</B>; OsmAnd, <B>My places → Tracks → Import</B>.</Fold>
                <Fold title="I can't find the downloaded file">Android: <B>Files → Downloads</B>. iPhone: <B>Files → Browse → Downloads</B> (or <B>On My iPhone → Downloads</B>). It&apos;s named after the trek and ends in .gpx.</Fold>
                <Fold title="The map is blank grey under my trail">The offline map for that area isn&apos;t downloaded, and that needs Wi-Fi: do it before the trip. Organic Maps: menu → <B>Download maps</B>.</Fold>
                <Fold title="The blue dot doesn't appear or doesn't move">Check the app has location permission with <B>Precise</B> on and that Location is on in settings (airplane mode doesn&apos;t turn it off). Step into open sky and give it a minute; the first fix after a flight can be slow.</Fold>
                <Fold title="The dot jumps around">Normal in narrow gorges and thick forest. Wait a moment or step into the open; don&apos;t follow a single jump.</Fold>
              </Section>
            </div>

            <div className="mt-14 rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-[15px] t-text-2">Treks with a mapped trail show it on their page and on the <Link href="/map" className="font-semibold t-text underline underline-offset-2">Adventure Map</Link>, with the GPX to download. More guides live in <Link href="/adventurepedia" className="font-semibold text-[#ff5100] underline underline-offset-2">Adventurepedia</Link>.</p>
            </div>
          </article>

          {/* ── Contents (desktop) ── */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28" aria-label="On this page">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-3">On this page</p>
              <ol className="space-y-1.5 text-[13.5px] border-l" style={{ borderColor: "var(--border-subtle)" }}>
                {contents.map(([id, label]) => (
                  <li key={id}><a href={`#${id}`} className="block pl-3 -ml-px border-l border-transparent t-text-2 hover:text-[#ff5100] hover:border-[#ff5100]">{label}</a></li>
                ))}
              </ol>
            </nav>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
