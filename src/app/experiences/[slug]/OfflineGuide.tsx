"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Smartphone, Laptop, Watch, Lightbulb } from "lucide-react";

const ORANGE = "#ff5100";

type Platform = "android" | "ios" | "computer" | "watch";

const TABS: { key: Platform; label: string; icon: typeof Smartphone }[] = [
  { key: "android", label: "Android", icon: Smartphone },
  { key: "ios", label: "iPhone & iPad", icon: Smartphone },
  { key: "computer", label: "Computer", icon: Laptop },
  { key: "watch", label: "GPS watch", icon: Watch },
];

function A({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener" className="font-semibold underline underline-offset-2" style={{ color: "var(--text-primary)" }}>{children}</a>;
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-px" style={{ background: ORANGE }}>{i + 1}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Alternatives({ apps }: { apps: { name: ReactNode; note: string; how: ReactNode }[] }) {
  return (
    <div className="mt-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-tertiary)" }}>If that doesn&apos;t work, try</p>
      <ul className="grid sm:grid-cols-2 gap-2">
        {apps.map((a, i) => (
          <li key={i} className="rounded-lg p-2.5" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)" }}>
            <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>{a.name}</span> <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{a.note}</span></p>
            <p className="mt-0.5">{a.how}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Your device first, picked after load (the server can't know it); defaults to Android */
function detect(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "computer";
}

/**
 * How to download the trail's GPX file and use it offline, per platform, with a recommended free
 * app, what to do if it fails, and other apps that read GPX. App menus change between versions,
 * so steps name the screen, not every tap.
 */
export default function OfflineGuide({ region, start, file }: { region: string; start: string; file: string }) {
  const [tab, setTab] = useState<Platform>("android");
  useEffect(() => setTab(detect()), []);

  const mapStep = <>On Wi-Fi, open the app, search for <b>{start}</b> and download the offline map it offers for {region}. Do this at home: the map is too big for mountain data.</>;

  const content: Record<Platform, ReactNode> = {
    android: (
      <>
        <p className="mb-3">Recommended: <A href="https://organicmaps.app">Organic Maps</A> <span style={{ color: "var(--text-tertiary)" }}>(free, no ads, no account)</span></p>
        <Steps items={[
          <>Install Organic Maps from <A href="https://play.google.com/store/apps/details?id=app.organicmaps">Google Play</A>.</>,
          mapStep,
          <>Tap <b>Download trail (GPX)</b> above. When it finishes, tap the file in the notification (or in <b>Files → Downloads</b>, named <i>{file}</i>) and choose <b>Organic Maps</b>. The trail and stops appear and stay saved under <b>Bookmarks and tracks</b>.</>,
          <>File won&apos;t open? In Organic Maps, open <b>Bookmarks and tracks</b> (the star), choose <b>Import</b> and pick the file from Downloads.</>,
        ]} />
        <Alternatives apps={[
          { name: <A href="https://osmand.net">OsmAnd</A>, note: "free; the free version limits map downloads", how: <>Open the file with OsmAnd, or <b>Menu → My places → Tracks → Import</b>.</> },
          { name: <A href="https://www.gaiagps.com">Gaia GPS</A>, note: "free account; offline maps need a paid plan", how: <>Open the file with Gaia GPS, or import it on gaiagps.com and sync.</> },
          { name: <A href="https://gurumaps.app">Guru Maps</A>, note: "free; extras paid", how: <>Open the file with Guru Maps; it imports the track and waypoints.</> },
          { name: <A href="https://www.locusmap.app">Locus Map</A>, note: "free with ads", how: <>Open the file with Locus Map and choose <b>Import</b>.</> },
        ]} />
      </>
    ),
    ios: (
      <>
        <p className="mb-3">Recommended: <A href="https://organicmaps.app">Organic Maps</A> <span style={{ color: "var(--text-tertiary)" }}>(free, no ads, no account)</span></p>
        <Steps items={[
          <>Install Organic Maps from the <A href="https://apps.apple.com/app/organic-maps-offline-map/id1567437057">App Store</A>.</>,
          mapStep,
          <>Tap <b>Download trail (GPX)</b> above and confirm <b>Download</b>. Open the <b>Files</b> app → <b>Downloads</b>, press and hold <i>{file}</i>, tap <b>Share</b> and choose <b>Organic Maps</b>.</>,
          <>Organic Maps not in the share list? Open Organic Maps → <b>Bookmarks and tracks</b> (the star) → <b>Import</b>, and pick the file from Files.</>,
        ]} />
        <Alternatives apps={[
          { name: <A href="https://osmand.net">OsmAnd Maps</A>, note: "free; the free version limits map downloads", how: <>Share the file to OsmAnd, or <b>My places → Tracks → Import</b>.</> },
          { name: <A href="https://www.gaiagps.com">Gaia GPS</A>, note: "free account; offline maps need a paid plan", how: <>Share the file to Gaia GPS, or import it on gaiagps.com and sync.</> },
          { name: <A href="https://gurumaps.app">Guru Maps</A>, note: "free; extras paid", how: <>Share the file to Guru Maps; it imports the track and waypoints.</> },
        ]} />
      </>
    ),
    computer: (
      <>
        <p className="mb-3">A computer is for planning and printing; on the trail, use your phone or a GPS watch. Works on Windows, Mac and Linux.</p>
        <Steps items={[
          <>Click <b>Download trail (GPX)</b>. The file saves to your Downloads folder.</>,
          <>To look at it or print a backup: drag it onto <A href="https://gpx.studio">gpx.studio</A> (free, in the browser), open it in <A href="https://www.gpxsee.org">GPXSee</A> (free app), or in <A href="https://www.google.com/earth/about/versions/">Google Earth Pro</A> with <b>File → Open</b>.</>,
          <>To get it onto your phone: send the file to yourself by email, WhatsApp, Telegram, Google Drive or iCloud, open it on the phone and choose your map app (see the Android or iPhone tab).</>,
        ]} />
      </>
    ),
    watch: (
      <>
        <p className="mb-3">Watches and handheld GPS units navigate a GPX as a <b>course</b> or <b>route</b>. Download the file on a computer or phone first; menu names vary a little between app versions.</p>
        <Steps items={[
          <><b>Garmin:</b> on <A href="https://connect.garmin.com/modern/courses">Garmin Connect</A> go to <b>Training &amp; Planning → Courses → Import</b>, choose the file, save it and send it to your device. On the watch: <b>Navigate → Courses</b>.</>,
          <><b>Suunto:</b> open the file with the Suunto app (share it to the app), save it as a route, and sync your watch.</>,
          <><b>Coros:</b> open the file with the Coros app (share it to the app) to import it as a route, then sync your watch.</>,
          <><b>Others</b> (Wahoo, Polar, Amazfit, handheld GPS): import the GPX in the brand&apos;s app or desktop software as a route or course.</>,
        ]} />
      </>
    ),
  };

  return (
    <div className="mt-4 rounded-xl p-3 sm:p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] mb-4" role="tablist" aria-label="Your device">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition-colors"
            style={tab === t.key ? { background: ORANGE, color: "#fff" } : { background: "var(--bg-page)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{content[tab]}</div>

      <div className="mt-4 pt-3 text-[12px]" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-tertiary)" }}><Lightbulb className="w-3 h-3" />Before you go</p>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 list-disc pl-4">
          <li>Test it at home: turn on airplane mode and check your position still shows on the trail.</li>
          <li>GPS works in airplane mode and saves a lot of battery. Turn it on when you start walking.</li>
          <li>Cold drains batteries fast: keep the phone in an inside pocket and carry a power bank.</li>
          <li>Put the file on a second phone in your group, in case one breaks or runs flat.</li>
        </ul>
      </div>
    </div>
  );
}
