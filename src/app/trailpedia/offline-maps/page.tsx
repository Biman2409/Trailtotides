import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";
import { TRAIL_SLUGS } from "@/lib/trails";
import { Smartphone, Laptop, Watch, Home, Footprints, BatteryCharging, Wrench, Signal, ArrowUp } from "lucide-react";
import TrekDownloadCard from "./TrekDownloadCard";

const SITE = "https://www.trailtotides.com";

export const metadata: Metadata = {
  title: "Trailpedia: Your Trek's GPX Trail, Offline",
  description: "Step-by-step: download a trek's GPX trail, load it into Organic Maps, OsmAnd or Gaia GPS on Android or iPhone, and follow it with no signal. Plus GPS watches.",
  alternates: { canonical: `${SITE}/trailpedia/offline-maps` },
  openGraph: { title: "Trailpedia: Take your trek offline", url: `${SITE}/trailpedia/offline-maps`, type: "article" },
};

// ── Building blocks ──────────────────────────────────────────────────────────

function H2({ id, icon: Icon, children }: { id: string; icon: typeof Smartphone; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-28 flex items-center gap-3 text-2xl sm:text-3xl t-text mt-14 mb-4" style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 }}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}><Icon className="w-5 h-5 text-[#ff5100]" /></span>
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-[17px] font-semibold t-text mt-8 mb-2">{children}</h3>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-[1.7] t-text-2 mb-3">{children}</p>;
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-3 my-4">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: "#ff5100" }}>{i + 1}</span>
          <div className="text-[15px] leading-[1.65] t-text-2 pt-0.5">{s}</div>
        </li>
      ))}
    </ol>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl px-4 py-3 my-4 text-[14px] leading-[1.6] t-text-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      {children}
    </div>
  );
}

function A({ href, children }: { href: string; children: ReactNode }) {
  const ext = href.startsWith("http");
  return <a href={href} {...(ext ? { target: "_blank", rel: "noopener" } : {})} className="font-semibold underline underline-offset-2 decoration-[#ff5100]/50 hover:decoration-[#ff5100] t-text">{children}</a>;
}

function AppCard({ name, href, cost, best, how }: { name: string; href: string; cost: string; best: string; how: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <p className="flex flex-wrap items-baseline gap-x-2"><A href={href}>{name}</A><span className="text-[12px] t-text-3">{cost}</span></p>
      <p className="text-[13px] t-text-3 mt-0.5">{best}</p>
      <div className="text-[14px] leading-[1.6] t-text-2 mt-2">{how}</div>
    </div>
  );
}

const B = ({ children }: { children: ReactNode }) => <b className="t-text font-semibold">{children}</b>;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OfflineMapsGuide() {
  const treks = Object.fromEntries(TRAIL_SLUGS.map((s) => [s, adventures.find((a) => a.slug === s)?.name ?? s]));
  const contents = [
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-6">
        <article className="max-w-3xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Trailpedia</p>
          <h1 className="text-4xl sm:text-5xl t-text leading-[1.08]" style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Take your trek offline
          </h1>
          <p className="text-[17px] leading-[1.6] t-text-2 mt-4">
            Most Himalayan trails have no phone signal for days. Your phone&apos;s GPS doesn&apos;t need one. With the trail file and an offline map loaded before you leave, you can see exactly where you are on the route, anywhere, in airplane mode. This guide takes about 15 minutes at home.
          </p>

          <Suspense fallback={null}>
            <TrekDownloadCard treks={treks} />
          </Suspense>

          <nav className="mt-8 rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }} aria-label="On this page">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-2">On this page</p>
            <ol className="grid sm:grid-cols-3 gap-x-4 gap-y-1.5 text-[14px]">
              {contents.map(([id, label]) => <li key={id}><a href={`#${id}`} className="t-text-2 hover:text-[#ff5100]">{label}</a></li>)}
            </ol>
          </nav>

          {/* ── How it works ── */}
          <H2 id="how-it-works" icon={Signal}>How it works</H2>
          <P>You need two things on your phone: <B>an offline map</B> of the area, and <B>the trail file</B>.</P>
          <P>
            The <B>offline map</B> is the base map, with valleys, rivers, villages and paths, saved on your phone so it works without data. Free apps like Organic Maps download a whole state or country at once, usually a few hundred MB.
          </P>
          <P>
            The <B>trail file</B> is a GPX file, the standard format every map app and GPS watch reads. Ours holds the walking line from the start to the end of the trek and every overnight stop as a named point, with heights. It comes from OpenStreetMap&apos;s mapped paths and is about 40 KB.
          </P>
          <P>
            On the trail, your phone&apos;s GPS chip talks to satellites directly. It works with no SIM, no data and in airplane mode. The app puts a blue dot on the map where you are, and the trail is drawn as a line. If the dot is on the line, you&apos;re on the route.
          </P>
          <Note>
            <B>This is a backup, not your guide.</B> Paths shift after landslides and heavy snow, and a GPS line can&apos;t tell you a bridge is out. Follow your guide and the route your operator gives you. Use the map to know where you are, how far the next stop is, and to find your way back if you get separated.
          </Note>

          {/* ── Before you go ── */}
          <H2 id="before-you-go" icon={Home}>Before you leave home</H2>
          <P>Do all of this on Wi-Fi, a few days before you travel. Mountain data, where there is any, is too slow for map downloads.</P>
          <Steps items={[
            <>Install the app (Organic Maps is our pick: free, no ads, no account). Steps for your phone are below.</>,
            <>Download the offline map for the region: the state for Indian treks (Uttarakhand, Himachal Pradesh, Ladakh, Sikkim) or the country for Nepal.</>,
            <>Download the trek&apos;s GPX file from its page on Trail to Tides and load it into the app.</>,
            <>Test it: switch on airplane mode, open the app, and check the map still shows and the blue dot appears. If it does, you&apos;re set.</>,
            <>Put the same file on one more phone in your group, in case one breaks or goes flat.</>,
          ]} />

          {/* ── Android ── */}
          <H2 id="android" icon={Smartphone}>Android</H2>
          <H3>With Organic Maps (recommended)</H3>
          <Steps items={[
            <>Install <A href="https://play.google.com/store/apps/details?id=app.organicmaps">Organic Maps from Google Play</A> and open it. Allow location access when it asks, and choose <B>Precise</B> location.</>,
            <>Download the region: open the menu, choose <B>Download maps</B>, search for the state or country (for example <i>Uttarakhand</i> or <i>Nepal</i>) and tap it to download. You can also just pan the map to the trek; the app offers to download the area you&apos;re looking at.</>,
            <>On the trek&apos;s page, tap <B>Download trail (GPX)</B>. The file saves to your phone&apos;s <B>Downloads</B> folder, named after the trek.</>,
            <>Open the file: tap it in the download notification, or open the <B>Files</B> app → <B>Downloads</B> and tap it. When Android asks which app to use, choose <B>Organic Maps</B>. The trail and every stop appear on the map.</>,
            <>If the file won&apos;t open in Organic Maps: open Organic Maps, tap the <B>star</B> (Bookmarks and tracks), open its menu and choose <B>Import</B>, then pick the file from Downloads.</>,
            <>The trail is now saved in <B>Bookmarks and tracks</B>. Tap it there any time to jump to it; use the eye icon to show or hide it.</>,
          ]} />

          <H3>If Organic Maps doesn&apos;t work for you</H3>
          <P>Any of these read the same file. Each needs its own offline map downloaded at home.</P>
          <div className="grid sm:grid-cols-2 gap-3 my-4">
            <AppCard name="OsmAnd" href="https://osmand.net" cost="Free; the free version limits map downloads" best="Best if you want spoken guidance along the trail, contour lines and more detail."
              how={<>Open the GPX file and choose OsmAnd, or go to <B>Menu → My places → Tracks → Import</B>. To be guided along it, open the track and choose <B>Follow track</B>.</>} />
            <AppCard name="Gaia GPS" href="https://www.gaiagps.com" cost="Free account; offline maps need a paid plan" best="Popular with hikers; good topographic maps."
              how={<>Share the file to Gaia GPS from your Files app, or upload it on gaiagps.com and it syncs to your phone.</>} />
            <AppCard name="Guru Maps" href="https://gurumaps.app" cost="Free to start; some features paid" best="Clean, fast, imports tracks and waypoints."
              how={<>Open the GPX file and choose Guru Maps; it adds the track and stops to your collection.</>} />
            <AppCard name="Locus Map" href="https://www.locusmap.app" cost="Free with ads" best="Android-only, very configurable, strong for outdoor use."
              how={<>Open the GPX file with Locus Map and choose <B>Import</B>.</>} />
          </div>

          {/* ── iPhone ── */}
          <H2 id="iphone" icon={Smartphone}>iPhone and iPad</H2>
          <H3>With Organic Maps (recommended)</H3>
          <Steps items={[
            <>Install <A href="https://apps.apple.com/app/organic-maps-offline-map/id1567437057">Organic Maps from the App Store</A> and open it. Allow location access <B>While Using the App</B>, with <B>Precise Location</B> on.</>,
            <>Download the region: open the menu, choose <B>Download maps</B>, search for the state or country and tap to download. Or pan to the trek and accept the offer to download that area.</>,
            <>On the trek&apos;s page in Safari, tap <B>Download trail (GPX)</B> and confirm <B>Download</B>. The file goes to the <B>Files</B> app, in <B>Downloads</B>.</>,
            <>Open <B>Files → Downloads</B>, press and hold the file, tap <B>Share</B> and choose <B>Organic Maps</B>. If you don&apos;t see it in the row of apps, swipe to the end and tap <B>More</B>.</>,
            <>Another way in: open Organic Maps, tap the <B>star</B> (Bookmarks and tracks), choose <B>Import</B>, and pick the file from Files.</>,
            <>The trail is saved under <B>Bookmarks and tracks</B>, ready for the trek.</>,
          ]} />
          <Note>Using Chrome on iPhone? After the download, tap <B>Open in…</B> and choose Organic Maps, or find the file in <B>Files → Downloads</B> as above.</Note>

          <H3>If Organic Maps doesn&apos;t work for you</H3>
          <div className="grid sm:grid-cols-2 gap-3 my-4">
            <AppCard name="OsmAnd Maps" href="https://osmand.net" cost="Free; the free version limits map downloads" best="Spoken guidance along the trail, contour lines."
              how={<>Share the file to OsmAnd from Files, or <B>My places → Tracks → Import</B>.</>} />
            <AppCard name="Gaia GPS" href="https://www.gaiagps.com" cost="Free account; offline maps need a paid plan" best="Good topographic maps."
              how={<>Share the file to Gaia GPS, or upload it on gaiagps.com and sync.</>} />
            <AppCard name="Guru Maps" href="https://gurumaps.app" cost="Free to start; some features paid" best="Clean, fast, imports tracks and waypoints."
              how={<>Share the file to Guru Maps from Files.</>} />
          </div>

          {/* ── Computer ── */}
          <H2 id="computer" icon={Laptop}>On a computer (Windows, Mac, Linux)</H2>
          <P>A laptop isn&apos;t for navigating on the trail, but it&apos;s the best screen for studying the route and printing a paper backup.</P>
          <Steps items={[
            <>Click <B>Download trail (GPX)</B> on the trek&apos;s page. It saves to your Downloads folder.</>,
            <>To look at it: drag the file onto <A href="https://gpx.studio">gpx.studio</A> in your browser (free, nothing to install). You&apos;ll see the line on a topo map with its elevation profile. Or open it in <A href="https://www.gpxsee.org">GPXSee</A> (free app) or <A href="https://www.google.com/earth/about/versions/">Google Earth Pro</A> with <B>File → Open</B> (set the file type to GPS) for a 3D view.</>,
            <>To print a backup: zoom gpx.studio or GPXSee to each day&apos;s section and print or save it as PDF. A folded page in a zip bag weighs nothing and never runs flat.</>,
            <>To get it onto your phone: email or WhatsApp it to yourself, or put it in Google Drive or iCloud Drive, then open it on the phone and follow the Android or iPhone steps.</>,
          ]} />

          {/* ── Watch ── */}
          <H2 id="watch" icon={Watch}>GPS watches and handheld GPS</H2>
          <P>Outdoor watches follow a GPX file as a <B>course</B> or <B>route</B>, showing the line and buzzing if you wander off it. Download the file on a phone or computer first. Menu names change slightly between app versions.</P>
          <div className="grid sm:grid-cols-2 gap-3 my-4">
            <AppCard name="Garmin" href="https://connect.garmin.com/modern/courses" cost="Garmin Connect, free" best="Fenix, Instinct, Forerunner, eTrex and more."
              how={<>On connect.garmin.com go to <B>Training &amp; Planning → Courses → Import</B>, choose the file, save it and <B>Send to Device</B>. On the watch: <B>Navigate → Courses</B>.</>} />
            <AppCard name="Suunto" href="https://www.suunto.com/suunto-app/" cost="Suunto app, free" best="Suunto 9, Vertical, Race and others."
              how={<>Share the GPX file to the Suunto app; it saves it as a route. Sync the watch, then start an exercise with navigation.</>} />
            <AppCard name="Coros" href="https://coros.com/app" cost="Coros app, free" best="Vertix, Apex, Pace and others."
              how={<>Share the GPX file to the Coros app to import it as a route, then sync it to the watch.</>} />
            <AppCard name="Others" href="https://www.topografix.com/gpx.asp" cost="" best="Wahoo, Polar, Amazfit, handheld GPS units."
              how={<>Nearly all import GPX in their app or desktop software, as a route or course.</>} />
          </div>

          {/* ── On the trail ── */}
          <H2 id="on-the-trail" icon={Footprints}>On the trail</H2>
          <P>Open the app, find the trail in Bookmarks and tracks, and tap it so it&apos;s showing. Tap the location button to put the blue dot in the middle.</P>
          <ul className="list-disc pl-5 space-y-2 text-[15px] leading-[1.65] t-text-2 my-4">
            <li><B>Am I on the route?</B> If the blue dot is on the line, yes. A few dozen metres off in a deep valley is normal: cliffs and forest bounce the signal.</li>
            <li><B>How far to camp?</B> Tap the next stop&apos;s point; the app shows the straight-line distance. Our trek page lists the walking distance and climb between stops.</li>
            <li><B>Which way?</B> Tap the location button again to make the map turn with you, so the way you face is up.</li>
            <li><B>At a junction</B>, check which branch keeps the dot on the line before walking far.</li>
            <li><B>Separated from your group?</B> Stay put if you can and stay visible. If you must move, use the line to walk back towards the last stop you all passed.</li>
          </ul>

          {/* ── Battery ── */}
          <H2 id="battery" icon={BatteryCharging}>Battery in the cold</H2>
          <ul className="list-disc pl-5 space-y-2 text-[15px] leading-[1.65] t-text-2 my-4">
            <li><B>Airplane mode</B> while walking. GPS keeps working; searching for a signal that isn&apos;t there is what drains phones in the mountains.</li>
            <li><B>Check, don&apos;t stare.</B> Open the map at junctions and breaks, then lock the screen. A screen on all day empties the battery by lunch.</li>
            <li><B>Keep it warm.</B> Batteries lose charge fast below freezing. Carry the phone in an inside pocket by day and in your sleeping bag at night.</li>
            <li><B>Carry a power bank</B> (10,000 mAh charges most phones two to three times), and a short cable. Teahouse charging, where it exists, costs extra and is often shared.</li>
            <li><B>Low Power Mode</B> (iPhone) or <B>Battery Saver</B> (Android) helps a lot and doesn&apos;t stop GPS.</li>
          </ul>

          {/* ── Troubleshooting ── */}
          <H2 id="troubleshooting" icon={Wrench}>If something goes wrong</H2>
          <div className="space-y-4 my-4">
            {[
              ["The file opens as text, or \"can't open file\"", <>Your phone picked the wrong app. Use the app&apos;s own import instead: in Organic Maps, the star → <B>Import</B>; in OsmAnd, <B>My places → Tracks → Import</B>.</>],
              ["Organic Maps isn't in the iPhone share list", <>Swipe the row of apps to the end and tap <B>More</B>, then switch Organic Maps on. Or import from inside Organic Maps with the star → <B>Import</B>.</>],
              ["I can't find the downloaded file", <>Android: <B>Files → Downloads</B>. iPhone: <B>Files → Browse → Downloads</B> (or <B>On My iPhone → Downloads</B>). It&apos;s named after the trek and ends in .gpx.</>],
              ["The map is blank grey with my trail on it", <>The offline map for that area isn&apos;t downloaded. You need Wi-Fi to fix this, so do it before the trip. In Organic Maps: menu → <B>Download maps</B>.</>],
              ["The blue dot doesn't appear or doesn't move", <>Check the app has location permission with <B>Precise</B> on, and that Location is switched on in settings (airplane mode doesn&apos;t turn it off). Step into open sky and give it a minute: the first fix after a long flight can take a while.</>],
              ["The dot jumps around", <>Normal in narrow gorges and thick forest. Wait a moment or step into the open; don&apos;t follow a single jump.</>],
            ].map(([q, a], i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-[15px] font-semibold t-text">{q}</p>
                <p className="text-[14px] leading-[1.6] t-text-2 mt-1">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-xl p-5" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.22)" }}>
            <p className="text-[15px] t-text-2">Treks with a mapped trail draw it on the <Link href="/map" className="font-semibold t-text underline underline-offset-2">Adventure Map</Link> when you open them, and have the GPX on their page.</p>
            <a href="#how-it-works" className="inline-flex items-center gap-1.5 text-[13px] font-semibold t-text-2 hover:text-[#ff5100]"><ArrowUp className="w-4 h-4" />Back to top</a>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
