"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Play, Pause, RotateCcw, Mountain, BedDouble, LocateFixed } from "lucide-react";
import { trailProfile, type Trail } from "@/lib/trails/shared";
import { loadLeaflet, loadMapLibre, tuneStyle, TERRARIUM } from "./mapShared";
import { DARK_STYLE, MAPBOX_CSS, MAPBOX_JS, MAPBOX_STYLE, MAPBOX_TOKEN } from "./mapAssets";

// "Fly the trail": the trek in 3D, the camera walking the mapped line over real terrain.
//   - The camera looks at the walker at the trail's own height, and checks its line of sight to
//     the walker against the terrain a few times a second: when a ridge is in the way it drops
//     its tilt and backs off, then eases back to the cinematic angle once the view is clear.
//   - Passes, summits and base camps on the trail are named with their heights; side summits
//     carry a ▲; nearby named peaks from the map data give quiet context as you get close.
//   - A live elevation profile doubles as the scrubber, with clickable day markers.
//   - Callouts follow the itinerary: each day's note as it starts, the high points as you
//     reach them, the night's camp as you arrive. The walker slows a little to let you read.
//   - Drag, turn or zoom to look around: the walk pauses, then glides back and carries on after
//     a moment unless you choose to stay.
// Its own MapLibre map (the main map is Leaflet, which can't tilt or turn), with the same style
// and India's official outline and labels. Idea after trip-map-skill's Play Trip
// (github.com/ashmitmittal/trip-map-skill); the code is our own.

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
const RAD = Math.PI / 180;
/** A whole trek takes about this long at 1×, whatever its length */
const PLAY_SECONDS = 75;
const SPEEDS = [1, 2, 4] as const;
const EXAGGERATION = 1.6;
/** The camera's preferred tilt, and how low it may drop to see over a ridge */
const PITCH = 70, PITCH_MIN = 34;
/** How long after you stop moving the map the walk carries on */
const RESUME_MS = 2500;
/** Names that mark a place worth calling out: passes, summits, lakes, camps at the top */
const NOTABLE = /\b(la|pass|peak|top|ri|summit|base camp|kund|tal|lake|glacier|bugyal|kantha)\b/i;

/** With a Mapbox token the view runs on Mapbox GL JS (satellite imagery, Mapbox terrain); without one,
 *  on MapLibre with the site's own style. Everything else is the same on both. */
const USE_MAPBOX = !!MAPBOX_TOKEN;
const FONT_BOLD = USE_MAPBOX ? ["DIN Pro Bold", "Arial Unicode MS Bold"] : ["Noto Sans Bold"];
let mapboxPromise: Promise<void> | null = null;
function loadMapbox(): Promise<void> {
  if (mapboxPromise) return mapboxPromise;
  mapboxPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[rel="stylesheet"][href="${MAPBOX_CSS}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = MAPBOX_CSS; document.head.appendChild(l);
    }
    const sc = document.createElement("script");
    sc.src = MAPBOX_JS; sc.onload = () => resolve(); sc.onerror = () => { mapboxPromise = null; reject(new Error("Mapbox didn't load")); };
    document.head.appendChild(sc);
  });
  return mapboxPromise;
}

/** The walker: the trekker from the profile-photo avatars (avatar-10, "Peak Finder": brown hair,
 *  goggles up, navy jacket with orange shoulders and collar, ice axe), walking, on a white disc */
const HIKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<circle cx="32" cy="32" r="29.5" fill="#f4f7fb" stroke="#ff5100" stroke-width="3.5"/>
<path d="M29 24 L25.5 31 L24 33.5" fill="none" stroke="#18304d" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 37 L26.5 44.5 L22.5 50.5" fill="none" stroke="#2b2f36" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="18.5" y="49" width="6.5" height="3.6" rx="1.6" fill="#5a3a22"/>
<rect x="20.5" y="21.5" width="8" height="13.5" rx="2.6" fill="#33475e"/>
<path d="M27.5 21.5 L36 21.5 L35.2 38.5 L28.2 38.5 Z" fill="#1f3a5c" stroke="#13263d" stroke-width="0.8" stroke-linejoin="round"/>
<path d="M27.5 21.5 L36 21.5 L35.8 26.5 L27.6 26.5 Z" fill="#ff7a1a"/>
<rect x="29.6" y="18.6" width="4.6" height="3.6" rx="1" fill="#ff7a1a"/>
<path d="M31.5 37.5 L36 44.5 L38 51" fill="none" stroke="#3a3f47" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="35.5" y="49.4" width="6.8" height="3.6" rx="1.6" fill="#5a3a22"/>
<circle cx="32.6" cy="14.4" r="5.3" fill="#f2c9a3"/>
<path d="M27.2 14.6 C26.6 10 29.4 7.6 32.8 7.8 C36.4 7.9 38.6 9.8 38.3 12.2 L36.4 11.4 L35.4 13 L33.6 11.6 L31.4 13.4 L30.6 12 L29.4 15.8 Z" fill="#6b3f1f"/>
<path d="M27.6 11.2 L38 10.4" stroke="#1f2933" stroke-width="1.6" stroke-linecap="round"/>
<ellipse cx="35.6" cy="10.4" rx="2.8" ry="1.8" fill="#8fd0ff" stroke="#1f2933" stroke-width="0.9"/>
<path d="M34 24 L38.2 29.5 L41 29.6" fill="none" stroke="#1f3a5c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42.4 27.2 L40.6 52" stroke="#9aa5b1" stroke-width="2.2" stroke-linecap="round"/>
<path d="M39 26.4 C41 24.6 44.6 24.8 46.6 26.6 L42.6 27.4 Z" fill="#2b2f36"/>
<circle cx="41.6" cy="29.6" r="2.3" fill="#1b1f24"/>
</svg>`;
const HIKER_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(HIKER_SVG)}`;

type Pt = { km: number; lat: number; lng: number; ele: number };
type Callout = { key: string; km: number; kind: "landmark" | "night"; title: string; meta: string; note?: string; day?: number };

function bearing(a: Pt, b: Pt) {
  const y = Math.sin((b.lng - a.lng) * RAD) * Math.cos(b.lat * RAD);
  const x = Math.cos(a.lat * RAD) * Math.sin(b.lat * RAD) - Math.sin(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos((b.lng - a.lng) * RAD);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** What the trail calls out, in order along it: high points and the night's camp */
type DayBand = { day: number; from: number; to: number; label: string };

/** Each walking day as a stretch of the line, found by walking forward along it from where the
 *  last day ended to the point nearest that night's camp. Treks that come back past a place
 *  (Lobuche after Base Camp, Namche on the way out) then keep their days in order. */
function dayMarks(trail: Trail, pts: Pt[]): DayBand[] {
  const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const h = Math.sin(((b.lat - a.lat) * RAD) / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(((b.lng - a.lng) * RAD) / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
  };
  const placeOf = (n: string) => trail.sleepPlaces.find((x) => x.name === n) ?? trail.stops.find((x) => x.name === n);
  const out: DayBand[] = [];
  let cursor = 0;
  for (const d of trail.days) {
    if (d.kind !== "walk" || !d.to) continue;
    const place = placeOf(d.to);
    if (!place) continue;
    let best = -1, bestD = Infinity;
    for (let i = cursor; i < pts.length; i++) { const m = dist(place, pts[i]); if (m < bestD) { bestD = m; best = i; } }
    if (best < 0 || bestD > 1500) continue;
    const from = pts[cursor].km, to = pts[best].km;
    if (to - from >= 0.2) out.push({ day: d.day, from, to, label: `Day ${d.day}: ${d.from} to ${d.to}${d.km != null ? `, ${d.km} km` : ""}` });
    cursor = best;
  }
  return out;
}

function calloutsFor(trail: Trail, bands: DayBand[]): Callout[] {
  const out: Callout[] = [];
  const top = trail.stops.reduce((a, s) => ((s.ele ?? 0) > (a.ele ?? 0) ? s : a), trail.stops[0]);
  const bandAt = (k: number) => bands.find((b) => b.from < b.to && k >= b.from - 0.05 && k <= b.to + 0.05);
  trail.stops.forEach((st, i) => {
    if (i === 0 || i === trail.stops.length - 1) return;
    if (!(NOTABLE.test(st.name) || st === top)) return;
    const b = bandAt(st.km), d = b && trail.days.find((x) => x.day === b.day);
    out.push({
      key: `l-${i}`, km: st.km, kind: "landmark", title: st.name, day: b?.day,
      meta: [st.ele != null ? `${fmt(st.ele)} m` : "", st === top ? "highest point of the trek" : b ? `Day ${b.day}'s high point` : ""].filter(Boolean).join(" · "),
      note: d?.note,
    });
  });
  bands.forEach((b, i) => {
    if (i === bands.length - 1 || b.to <= b.from) return;
    const d = trail.days.find((x) => x.day === b.day);
    if (!d?.to) return;
    out.push({ key: `n-${b.day}`, km: b.to, kind: "night", title: `Night ${b.day} at ${d.to}`, meta: d.sleepEle != null ? `sleep at ${fmt(d.sleepEle)} m` : "", day: b.day });
  });
  return out.sort((a, b) => a.km - b.km);
}

export default function TrailFlyover({ name, trail, onClose }: { name: string; trail: Trail; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const ctl = useRef<{ toggle: () => void; restart: () => void; seekKm: (k: number) => void; speed: (s: number) => void; stay: () => void; back: () => void } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [km, setKm] = useState(0);
  const [ele, setEle] = useState<number | null>(null);
  const [day, setDay] = useState<{ n: number; title: string; sub: string; note?: string; via?: string } | null>(null);
  const [callout, setCallout] = useState<Callout | null>(null);
  /** Looking around: seconds until the walk carries on, or "stay" when you chose to stay */
  const [lookAround, setLookAround] = useState<number | "stay" | null>(null);
  const total = trail.lengthKm;

  // The line with the distance along it at every point, and the days laid along it
  const pts = useMemo<Pt[]>(() => { const prof = trailProfile(trail); return trail.line.map((p, i) => ({ km: prof[i].km, lat: p[0], lng: p[1], ele: p[2] })); }, [trail]);
  const bands = useMemo(() => dayMarks(trail, pts), [trail, pts]);
  const profile = useMemo(() => {
    // The profile thinned to ~240 points, for the live chart
    const p = trailProfile(trail), n = 240, out: { km: number; ele: number }[] = [];
    for (let i = 0; i < n; i++) { const k = (i / (n - 1)) * total; const q = p.find((x) => x.km >= k) ?? p[p.length - 1]; out.push({ km: k, ele: q.ele }); }
    const lo = Math.min(...out.map((x) => x.ele)), hi = Math.max(...out.map((x) => x.ele));
    return { pts: out, lo, hi };
  }, [trail, total]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false, raf = 0, resumeTimer = 0, countdown = 0, calloutTimer = 0, settleTimer = 0;
    const cleanups: (() => void)[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    const at = (k: number): Pt => {
      k = clamp(k, 0, total);
      let lo = 0, hi = pts.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (pts[mid].km <= k) lo = mid; else hi = mid; }
      const p = pts[lo], q = pts[hi], t = q.km > p.km ? (k - p.km) / (q.km - p.km) : 0;
      return { km: k, lat: p.lat + (q.lat - p.lat) * t, lng: p.lng + (q.lng - p.lng) * t, ele: p.ele + (q.ele - p.ele) * t };
    };
    // Where the walker faces: a little behind to a little ahead, so switchbacks don't spin the camera
    const heading = (k: number) => bearing(at(k - 0.25), at(k + Math.max(0.8, total / 90)));
    const dayAt = (k: number) => bands.find((b) => b.from < b.to && k >= b.from && k < b.to) ?? null;
    const events = calloutsFor(trail, bands);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const s = {
      km: 0, playing: false, speed: 1, last: 0, brg: 0, day: -1, painted: 0,
      // The smart camera's current and wanted tilt and zoom
      pitch: PITCH, pitchWant: PITCH, zoomOff: 0, zoomOffWant: 0, losAt: 0,
      // Walking when you took the camera, so the walk carries on after
      resume: false,
    };
    const baseZoom = () => 13.5 - 0.35 * Math.log2(s.speed);
    // Development only: lets a test read the camera's state
    if (process.env.NODE_ENV !== "production") (window as unknown as { __fly?: unknown }).__fly = { s, blocked: () => blocked(), map: () => map, at: (k: number) => at(k) };

    const report = () => {
      setKm(s.km);
      setEle(Math.round(at(s.km).ele));
      const d = dayAt(s.km);
      if ((d?.day ?? -1) !== s.day) {
        s.day = d?.day ?? -1;
        const td = d && trail.days.find((x) => x.day === d.day);
        setDay(td ? {
          n: td.day, title: `${td.from} → ${td.to}`,
          sub: [td.km != null ? `${td.km} km` : "", td.up ? `${fmt(td.up)} m up` : "", td.down ? `${fmt(td.down)} m down` : ""].filter(Boolean).join(" · "),
          note: td.note || undefined, via: td.via?.length ? td.via.join(", ") : undefined,
        } : null);
      }
    };
    const showCallout = (c: Callout) => {
      setCallout(c);
      clearTimeout(calloutTimer);
      calloutTimer = window.setTimeout(() => setCallout((cur) => (cur?.key === c.key ? null : cur)), 5200);
    };
    const paintProgress = () => {
      if (!map?.getLayer("fly-trail")) return;
      const f = clamp(s.km / total, 0.0001, 0.9999);
      map.setPaintProperty("fly-trail", "line-gradient", ["step", ["line-progress"], "#ff5100", f, "rgba(255,255,255,0.55)"]);
    };
    // The walker is a map layer, so it sits on the terrain exactly where the line does
    const moveWalker = (k: number) => {
      const p = at(k);
      map?.getSource("fly-walker")?.setData({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [p.lng, p.lat] } });
    };

    // The camera looks at the walker at the trail's own height. Left to itself MapLibre reads the
    // height from the terrain under the centre, which is sea level until that tile arrives, and
    // in a Himalayan valley that puts the camera inside the mountain.
    const camera = (k: number) => {
      const p = at(k);
      return { center: [p.lng, p.lat] as [number, number], zoom: baseZoom() + s.zoomOff, pitch: s.pitch, elevation: p.ele * EXAGGERATION };
    };

    // Line of sight: sample the straight line from the camera to the walker and ask the terrain
    // whether any of it is underground. queryTerrainElevation gives absolute heights in the
    // exaggerated scene's metres, the same as the camera's altitude.
    const blocked = (): boolean => {
      if (!map) return false;
      // Where the camera is: Mapbox says through its free camera, MapLibre through its transform
      let cam: { lng: number; lat: number }, camAlt: number;
      if (map.getFreeCameraOptions) { const pos = map.getFreeCameraOptions().position; if (!pos) return false; cam = pos.toLngLat(); camAlt = pos.toAltitude(); }
      else if (map.transform?.getCameraLngLat) { cam = map.transform.getCameraLngLat(); camAlt = map.transform.getCameraAltitude(); }
      else return false;
      const q = (ll: [number, number]) => (USE_MAPBOX ? map.queryTerrainElevation(ll, { exaggerated: true }) : map.queryTerrainElevation(ll));
      const w = at(s.km), wAlt = q([w.lng, w.lat]) ?? w.ele * EXAGGERATION;
      // In a deep gorge the map lifts the camera clear of the cliffs behind it, which drops the
      // walker down the screen and under the controls (or up behind the day card): look down
      // more steeply, as for a ridge in the way
      const sp = map.project([w.lng, w.lat]), h = map.getContainer().clientHeight;
      if (h >= 560 && (sp.y > h - 250 || sp.y < 190)) return true;
      for (let i = 1; i < 9; i++) {
        const t = i / 10;
        const lng = cam.lng + (w.lng - cam.lng) * t, lat = cam.lat + (w.lat - cam.lat) * t, alt = camAlt + (wAlt - camAlt) * t;
        const g = q([lng, lat]);
        if (g != null && g + 50 > alt) return true;
      }
      return false;
    };
    const steer = (now: number, dt: number) => {
      if (now - s.losAt > 120) {
        s.losAt = now;
        if (blocked()) { s.pitchWant = Math.max(PITCH_MIN, s.pitchWant - 9); s.zoomOffWant = Math.max(-1.4, s.zoomOffWant - 0.22); }
        else { s.pitchWant = Math.min(PITCH, s.pitchWant + 2); s.zoomOffWant = Math.min(0, s.zoomOffWant + 0.05); }
      }
      // Backing off is quick, coming back in is gentle
      const k = 1 - Math.exp(-dt * (s.pitchWant < s.pitch ? 4 : 1.8));
      s.pitch += (s.pitchWant - s.pitch) * k;
      s.zoomOff += (s.zoomOffWant - s.zoomOff) * k;
    };

    const tick = (now: number) => {
      if (!s.playing) return;
      // Capped so a tab coming back from the background doesn't leap, but loose enough that a
      // slow phone drawing a few frames a second still keeps time
      const dt = Math.min(0.25, (now - s.last) / 1000);
      s.last = now;
      // Slow a little near a callout, so there's time to read it
      const base = (total / PLAY_SECONDS) * s.speed;
      const next = events.find((e) => e.km > s.km - 0.05);
      const near = next ? Math.abs(next.km - s.km) : 1e9;
      const v = base * (0.4 + 0.6 * smooth(clamp(near / Math.max(0.3, base * 1.2), 0, 1)));
      const prevKm = s.km;
      s.km = Math.min(total, s.km + v * dt);
      for (const e of events) if (e.km > prevKm && e.km <= s.km) showCallout(e);
      // Turn smoothly toward the way ahead, the short way round
      const diff = ((heading(s.km) - s.brg + 540) % 360) - 180;
      s.brg = (s.brg + diff * (1 - Math.exp(-dt * 1.8)) + 360) % 360;
      steer(now, dt);
      moveWalker(s.km);
      map.jumpTo({ ...camera(s.km), bearing: s.brg });
      if (now - s.painted > 90) { s.painted = now; paintProgress(); report(); }
      if (s.km >= total) { stop(); report(); paintProgress(); return; }
      raf = requestAnimationFrame(tick);
    };
    const run = () => { s.last = performance.now(); raf = requestAnimationFrame(tick); };
    // Glide to the walker, then walk. Listen first: a 0 ms glide ends inside flyTo itself.
    const glideThen = (then: () => void, ms = 1500) => {
      map.setCenterClampedToGround?.(false);
      map.once("moveend", then);
      map.easeTo({ ...camera(s.km), bearing: s.brg, duration: reduced ? 0 : ms, essential: true });
    };
    const start = () => {
      if (!map || s.playing) return;
      if (s.km >= total) { s.km = 0; paintProgress(); report(); }
      cancelLook();
      s.playing = true; setPlaying(true);
      s.brg = heading(s.km); s.pitch = s.pitchWant = PITCH; s.zoomOff = s.zoomOffWant = 0;
      glideThen(() => { if (s.playing) run(); }, 1800);
    };
    const stop = () => { s.playing = false; setPlaying(false); cancelAnimationFrame(raf); };

    // Looking around: the walk pauses while you move the map, then glides back and carries on
    const cancelLook = () => { clearTimeout(resumeTimer); clearInterval(countdown); setLookAround(null); };
    const takeOver = () => {
      clearTimeout(settleTimer); // the person is looking around; leave the camera to them
      if (s.playing) { s.resume = true; stop(); }
      clearTimeout(resumeTimer); clearInterval(countdown);
      if (s.resume) setLookAround(Math.ceil(RESUME_MS / 1000));
      map.setCenterClampedToGround?.(true);
    };
    const letGo = () => {
      if (!s.resume) return;
      clearTimeout(resumeTimer); clearInterval(countdown);
      let left = Math.ceil(RESUME_MS / 1000);
      setLookAround(left);
      countdown = window.setInterval(() => { left -= 1; if (left > 0) setLookAround(left); }, 1000);
      resumeTimer = window.setTimeout(backToTrail, RESUME_MS);
    };
    const backToTrail = () => {
      cancelLook();
      s.resume = false;
      s.playing = true; setPlaying(true);
      s.pitch = s.pitchWant = PITCH; s.zoomOff = s.zoomOffWant = 0;
      glideThen(() => { if (s.playing) run(); }, 1200);
    };
    const seekKm = (k: number) => {
      const wasPlaying = s.playing || s.resume;
      stop(); cancelLook(); s.resume = false;
      s.km = clamp(k, 0, total);
      paintProgress(); report(); moveWalker(s.km);
      // Jumping to a callout's spot shows it
      const e = events.find((x) => Math.abs(x.km - s.km) < 0.15);
      if (e) showCallout(e); else setCallout(null);
      s.brg = heading(s.km);
      if (wasPlaying) { s.playing = true; setPlaying(true); glideThen(() => { if (s.playing) run(); }, 900); }
      else { map?.setCenterClampedToGround?.(false); map?.easeTo({ ...camera(s.km), bearing: s.brg, duration: 900 }); settleSoon(950); }
    };
    // Paused, nothing steers the camera, so after a jump look down a step at a time until the
    // walker is in clear view. On a timer, not moveend: starting a move ends the one before it,
    // and that moveend would fire straight away.
    const settleSoon = (ms: number, n = 5) => { clearTimeout(settleTimer); settleTimer = window.setTimeout(() => settle(n), ms); };
    const settle = (n = 5) => {
      if (!map || s.playing || n <= 0 || !blocked()) return;
      s.pitch = s.pitchWant = Math.max(PITCH_MIN, s.pitch - 10);
      s.zoomOff = s.zoomOffWant = Math.max(-1.4, s.zoomOff - 0.25);
      map.easeTo({ ...camera(s.km), bearing: s.brg, duration: 400 });
      settleSoon(450, n - 1);
    };

    ctl.current = {
      toggle: () => (s.playing ? (stop(), settleSoon(0)) : s.resume ? backToTrail() : start()),
      restart: () => { stop(); cancelLook(); s.resume = false; s.km = 0; setCallout(null); paintProgress(); report(); start(); },
      seekKm,
      speed: (v) => { s.speed = v; setSpeed(v); },
      stay: () => { cancelLook(); s.resume = false; setLookAround("stay"); },
      back: () => { s.resume = true; backToTrail(); },
    };

    (USE_MAPBOX ? loadMapbox() : loadLeaflet().then((leaflet) => loadMapLibre(leaflet)))
      .then(() => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ml = USE_MAPBOX ? (window as any).mapboxgl : (window as any).maplibregl;
        const lats = pts.map((p) => p.lat), lngs = pts.map((p) => p.lng);
        const bounds: [[number, number], [number, number]] = [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
        map = new ml.Map({
          container: box, style: USE_MAPBOX ? MAPBOX_STYLE : DARK_STYLE, bounds,
          // The whole trail in the open middle, clear of the title and day cards and the controls
          // (a short screen, like a phone on its side, just gets an even margin)
          fitBoundsOptions: { padding: window.innerHeight >= 560 ? { top: 160, bottom: 240, left: 40, right: 40 } : 30 },
          pitch: 58, maxPitch: USE_MAPBOX ? 85 : 78, dragRotate: true,
          // Mapbox's own logo and credit stay as its terms ask; MapLibre's credit folds away
          ...(USE_MAPBOX ? { accessToken: MAPBOX_TOKEN, projection: "mercator" } : { attributionControl: { compact: true } }),
        });
        map.on("error", () => {}); // a missing tile isn't worth a console line each
        // Keep the walker in the open part of the screen, between the day card and the controls,
        // rather than the middle, which on a phone sits low and near the control bar
        if (window.innerHeight >= 560) map.setPadding?.({ top: 120, bottom: 210, left: 0, right: 0 });
        map.on("style.load", () => {
          if (cancelled) return;
          if (USE_MAPBOX) setUpMapbox(); else setUpMapLibre();
          addTrailLayers();
        });
      })
      .catch(() => setFailed(true));

    // Mapbox: the Outdoors map (contours, peaks, passes, glaciers) draped on the open elevation tiles,
    // fog for depth, and India's official map: the style's boundaries and labels switched to Mapbox's
    // India worldview, our outline on top. Mapbox's own terrain and satellite need a paid account.
    const setUpMapbox = () => {
      map.addSource("fly-terrain", { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
      map.setTerrain({ source: "fly-terrain", exaggeration: EXAGGERATION });
      map.setFog?.({ range: [1, 9], color: "#dfe7ee", "horizon-blend": 0.1, "high-color": "#7ea3cc", "space-color": "#1b2a40", "star-intensity": 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const l of map.getStyle().layers as any[]) {
        const f = map.getFilter(l.id);
        const js = f ? JSON.stringify(f) : "";
        if (js.includes('"worldview"') && js.includes('"US"')) map.setFilter(l.id, JSON.parse(js.split('"US"').join('"IN"')));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstLabel = map.getStyle().layers.find((l: any) => l.type === "symbol")?.id;
      map.addSource("fly-india", { type: "geojson", data: `${window.location.origin}/india-boundary.geojson` });
      map.addLayer({ id: "fly-india", type: "line", source: "fly-india", paint: { "line-color": "rgba(90,70,110,0.7)", "line-width": 1.6 } }, firstLabel);
    };

    // MapLibre: the site's own style, re-toned for 3D, with open elevation tiles and strong shading
    const setUpMapLibre = () => {
          tuneStyle(map, true, { relief: false });
          // The dark style is near black, which hides the relief in 3D. Here only: a slate ground,
          // glaciers as snow, forest and water tinted, so the shading below has something to show on.
          const paint = (layer: string, prop: string, value: unknown) => { if (map.getLayer(layer)) map.setPaintProperty(layer, prop, value); };
          paint("background", "background-color", "#3b4047");
          paint("landcover_glacier", "fill-color", "#dfe6ee");
          paint("landcover_glacier", "fill-opacity", 0.85);
          paint("landcover_ice_shelf", "fill-color", "#dfe6ee");
          paint("landcover_wood", "fill-color", "#34452f");
          paint("landcover_wood", "fill-opacity", 0.75);
          paint("landuse_park", "fill-color", "#34452f");
          paint("water", "fill-color", "#22394a");
          paint("waterway", "line-color", "#2c4a5e");
          map.addSource("fly-terrain", { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
          map.addSource("fly-shade", { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
          map.setTerrain({ source: "fly-terrain", exaggeration: EXAGGERATION });
          // Strong shading with warm light on the sunlit faces: ridges, valleys and slopes read at a glance
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const firstLabel = map.getStyle().layers.find((l: any) => l.type === "symbol")?.id;
          map.addLayer({ id: "fly-hillshade", type: "hillshade", source: "fly-shade", paint: {
            "hillshade-exaggeration": 0.85, "hillshade-shadow-color": "#07090c", "hillshade-highlight-color": "rgba(255,236,214,0.55)", "hillshade-accent-color": "#1a1f26",
          } }, firstLabel);
          map.setSky?.({ "sky-color": "#14202e", "horizon-color": "#6b7d92", "fog-color": "#33404e", "sky-horizon-blend": 0.5, "horizon-fog-blend": 0.5, "fog-ground-blend": 0.25 });
    };

    // The trail, its stops and landmarks, the hiker, and the controls' hooks: the same on both engines
    const addTrailLayers = () => {

          // Context: named peaks around the trail from the map data, quiet and only once you're close
          const halo = { "text-halo-color": "rgba(10,12,16,0.85)", "text-halo-width": 1.4, "text-halo-blur": 0.4 };
          if (map.getSource("openmaptiles")) {
            map.addLayer({ id: "fly-peak-dot", type: "circle", source: "openmaptiles", "source-layer": "mountain_peak", minzoom: 10, filter: ["has", "name"],
              paint: { "circle-radius": 2, "circle-color": "rgba(255,255,255,0.7)", "circle-pitch-alignment": "viewport" } });
            map.addLayer({ id: "fly-peak", type: "symbol", source: "openmaptiles", "source-layer": "mountain_peak", minzoom: 10, filter: ["has", "name"],
              layout: { "text-field": ["format", ["coalesce", ["get", "name_en"], ["get", "name:latin"], ["get", "name"]], {}, ["case", ["has", "ele"], ["concat", "\n", ["to-string", ["get", "ele"]], " m"], ""], { "font-scale": 0.85 }],
                "text-font": ["Noto Sans Italic"], "text-size": 11, "text-anchor": "top", "text-offset": [0, 0.4], "text-padding": 8 },
              paint: { "text-color": "rgba(235,240,248,0.62)", ...halo } });
          }

          map.addSource("fly-line", { type: "geojson", lineMetrics: true, data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts.map((p) => [p.lng, p.lat]) } } });
          map.addLayer({ id: "fly-trail-casing", type: "line", source: "fly-line", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "rgba(0,0,0,0.55)", "line-width": 7 } });
          map.addLayer({ id: "fly-trail", type: "line", source: "fly-line", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-width": 3.5, "line-gradient": ["step", ["line-progress"], "#ff5100", 0.0001, "rgba(255,255,255,0.55)"] } });

          // Stops numbered as on the main map and in the itinerary, drawn as layers so they lie on
          // the terrain with the line. Passes, summits and base camps also carry their name and
          // height; the rest their name, smaller. A loop's last stop is its first again.
          const first = trail.stops[0], last = trail.stops[trail.stops.length - 1];
          const loop = trail.stops.length > 1 && first.lat === last.lat && first.lng === last.lng;
          const top = trail.stops.reduce((a, st) => ((st.ele ?? 0) > (a.ele ?? 0) ? st : a), trail.stops[0]);
          const stops = trail.stops.filter((_, i) => !(loop && i === trail.stops.length - 1));
          map.addSource("fly-stops", { type: "geojson", data: { type: "FeatureCollection", features: stops.map((st, i) => ({
            type: "Feature",
            properties: { n: String(i + 1), first: i === 0, name: st.name, km: st.km, notable: NOTABLE.test(st.name) || st === top, ele: st.ele != null ? `${fmt(st.ele)} m` : "" },
            geometry: { type: "Point", coordinates: [st.lng, st.lat] },
          })) } });
          map.addLayer({ id: "fly-stop", type: "circle", source: "fly-stops", paint: { "circle-radius": 10, "circle-color": ["case", ["get", "first"], "#16a34a", "#ff5100"], "circle-stroke-color": "#ffffff", "circle-stroke-width": 2, "circle-pitch-alignment": "viewport", "circle-pitch-scale": "viewport" } });
          map.addLayer({ id: "fly-stop-n", type: "symbol", source: "fly-stops", layout: { "text-field": ["get", "n"], "text-font": FONT_BOLD, "text-size": 11, "text-allow-overlap": true, "text-ignore-placement": true, "text-pitch-alignment": "viewport" }, paint: { "text-color": ["case", ["get", "first"], "#ffffff", "#1c1814"] } });
          map.addLayer({ id: "fly-stop-name", type: "symbol", source: "fly-stops", layout: {
            "text-field": ["case", ["get", "notable"], ["format", ["get", "name"], { "font-scale": 1 }, "\n", {}, ["get", "ele"], { "font-scale": 0.82 }], ["get", "name"]],
            "text-font": FONT_BOLD, "text-size": ["case", ["get", "notable"], 13, 11], "text-anchor": "left", "text-offset": [1.1, 0], "text-justify": "left",
            "text-pitch-alignment": "viewport", "text-padding": 4,
          }, paint: { "text-color": ["case", ["get", "notable"], "#ffd9c2", "rgba(255,255,255,0.85)"], ...halo } });
          // Side summits off the line (Gokyo Ri, Kala Patthar): a triangle, name and height
          map.addSource("fly-side", { type: "geojson", data: { type: "FeatureCollection", features: trail.side.map((st) => ({ type: "Feature", properties: { label: `▲ ${st.name}${st.ele != null ? `\n${fmt(st.ele)} m` : ""}` }, geometry: { type: "Point", coordinates: [st.lng, st.lat] } })) } });
          map.addLayer({ id: "fly-side", type: "symbol", source: "fly-side", layout: { "text-field": ["get", "label"], "text-font": FONT_BOLD, "text-size": 12, "text-anchor": "bottom", "text-pitch-alignment": "viewport" }, paint: { "text-color": "#a7f3e8", ...halo } });

          map.addSource("fly-walker", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [pts[0].lng, pts[0].lat] } } });
          map.addLayer({ id: "fly-walker-glow", type: "circle", source: "fly-walker", paint: { "circle-radius": 22, "circle-color": "rgba(255,154,102,0.45)", "circle-blur": 0.8, "circle-pitch-alignment": "viewport", "circle-pitch-scale": "viewport" } });
          // The walker is a small hiker; until its image has loaded (or if it can't), a dot
          map.addLayer({ id: "fly-walker", type: "circle", source: "fly-walker", paint: { "circle-radius": 6, "circle-color": "#ffffff", "circle-stroke-color": "#ff5100", "circle-stroke-width": 3, "circle-pitch-alignment": "viewport", "circle-pitch-scale": "viewport" } });
          const hiker = new Image(64, 64);
          hiker.src = HIKER_URL;
          hiker.decode().then(() => {
            if (cancelled || !map.getStyle()) return;
            if (!map.hasImage("fly-hiker")) map.addImage("fly-hiker", hiker, { pixelRatio: 2 });
            map.removeLayer("fly-walker");
            map.addLayer({ id: "fly-walker", type: "symbol", source: "fly-walker", layout: {
              "icon-image": "fly-hiker", "icon-size": 1, "icon-allow-overlap": true, "icon-ignore-placement": true, "icon-pitch-alignment": "viewport",
            } });
          }).catch(() => { /* keep the dot */ });

          // A stop on the map takes you there
          map.on("click", "fly-stop", (e: { features?: { properties: { km: number } }[] }) => { const k = e.features?.[0]?.properties.km; if (k != null) seekKm(Number(k)); });
          map.on("mouseenter", "fly-stop", () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", "fly-stop", () => { map.getCanvas().style.cursor = ""; });

          setReady(true);
          report();
          // Moving the map yourself: the walk pauses the moment a finger or the mouse goes down (or
          // the wheel turns), before MapLibre starts its drag, since the walk's jumpTo would cancel
          // a drag in progress. It carries on once you let go and the map comes to rest.
          const canvas = map.getCanvasContainer();
          canvas.addEventListener("pointerdown", takeOver, true);
          let wheelEnd = 0;
          canvas.addEventListener("wheel", () => { takeOver(); clearTimeout(wheelEnd); wheelEnd = window.setTimeout(letGo, 350); }, { capture: true, passive: true });
          const release = () => window.setTimeout(letGo, 60);
          window.addEventListener("pointerup", release);
          cleanups.push(() => window.removeEventListener("pointerup", release), () => clearTimeout(wheelEnd));
          map.on("moveend", (e: { originalEvent?: Event }) => { if (e.originalEvent && s.resume) letGo(); });
          if (!reduced) setTimeout(() => { if (!cancelled) start(); }, 900);
    };

    return () => {
      cancelled = true; cancelAnimationFrame(raf); clearTimeout(resumeTimer); clearInterval(countdown); clearTimeout(calloutTimer); clearTimeout(settleTimer);
      cleanups.forEach((f) => f());
      ctl.current = null; try { map?.remove(); } catch { /* already gone */ }
    };
  }, [trail, total, bands, pts]);

  // Esc closes, Space plays and pauses; focus starts on Close
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // Caught first and kept here, so the map page behind doesn't also close its panel
      if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); onClose(); }
      if (e.key === " " && (e.target as HTMLElement)?.tagName !== "BUTTON") { e.preventDefault(); e.stopImmediatePropagation(); ctl.current?.toggle(); }
    };
    window.addEventListener("keydown", onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey, true); document.body.style.overflow = prev; };
  }, [onClose]);

  // The live profile: area under the elevation, walked part in orange, the walker as a dot
  const W = 600, H = 64, PAD = 4;
  const x = (k: number) => (k / total) * W;
  const y = (e: number) => PAD + (1 - (e - profile.lo) / Math.max(1, profile.hi - profile.lo)) * (H - PAD * 2);
  const area = `M0,${H} ` + profile.pts.map((p) => `L${x(p.km).toFixed(1)},${y(p.ele).toFixed(1)}`).join(" ") + ` L${W},${H} Z`;
  const ridge = profile.pts.map((p, i) => `${i ? "L" : "M"}${x(p.km).toFixed(1)},${y(p.ele).toFixed(1)}`).join(" ");
  const frac = total > 0 ? km / total : 0;
  const walkBands = bands.filter((b) => b.to > b.from);
  // Day numbers thin out when there are too many to fit
  const every = walkBands.length > 12 ? 2 : 1;
  // Day numbers are the itinerary's, so "of" counts its days (drive and rest days too)
  const dayCount = trail.days.reduce((m, d) => Math.max(m, d.day), 0);

  return createPortal(
    <div className="tm-fly fixed inset-0 z-[3000] bg-[#0b0f14] text-white" role="dialog" aria-modal="true" aria-label={`${name}: the trail in 3D`}>
      {/* MapLibre makes its container position: relative, so it fills a positioned wrapper */}
      <div className="absolute inset-0"><div ref={boxRef} className="w-full h-full" /></div>

      {/* Title and close */}
      <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-start gap-3 pointer-events-none">
        <div className="tm-glass rounded-2xl px-4 py-3 min-w-0 pointer-events-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Fly the trail</p>
          <h2 className="text-[16px] sm:text-[18px] font-bold text-white leading-tight truncate">{name}</h2>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close the 3D view"
          className="ml-auto tm-glass rounded-xl w-11 h-11 grid place-items-center text-white/80 hover:text-white pointer-events-auto"><X className="w-4 h-4" /></button>
      </div>

      {/* The day you're on, with its note from the itinerary */}
      {day && (
        <div className="absolute inset-x-0 top-[84px] sm:top-[92px] flex justify-center pointer-events-none px-4" aria-live="polite">
          {/* On its own card: the Outdoors map is light, so bare text over it is hard to read */}
          <div key={day.n} className="tm-fly-day tm-glass rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-center max-w-[560px]">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--tm-peach)]">Day {day.n}{dayCount > 1 ? ` of ${dayCount}` : ""}</p>
            <p className="text-[17px] sm:text-[22px] font-bold text-white leading-tight mt-0.5">{day.title}</p>
            {day.sub && <p className="text-[12px] sm:text-[13px] text-white/70 mt-1 tabular-nums">{day.sub}{day.via ? ` · via ${day.via}` : ""}</p>}
            {day.note && <p className="hidden sm:block text-[13px] text-white/60 mt-1.5 leading-snug">{day.note}</p>}
          </div>
        </div>
      )}

      {/* Reaching a high point or the night's camp */}
      {callout && (
        <div className="absolute inset-x-0 bottom-[214px] sm:bottom-[206px] flex justify-center pointer-events-none px-4" aria-live="polite">
          <div key={callout.key} className="tm-fly-call tm-glass rounded-2xl px-4 py-3 max-w-[460px] flex gap-3 items-start">
            <span className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: callout.kind === "night" ? "rgba(111,240,224,0.14)" : "rgba(255,81,0,0.18)", color: callout.kind === "night" ? "#6ff0e0" : "#ff9a66" }}>
              {callout.kind === "night" ? <BedDouble className="w-4 h-4" /> : <Mountain className="w-4 h-4" />}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold leading-tight">{callout.title}</span>
              {callout.meta && <span className="block text-[12px] text-white/65 mt-0.5">{callout.meta}</span>}
              {/* The note on wider screens; on a phone it would cover the trail */}
              {callout.note && <span className="hidden sm:block text-[12.5px] text-white/80 mt-1 leading-snug">{callout.note}</span>}
            </span>
          </div>
        </div>
      )}

      {/* Looking around: the walk carries on shortly, unless you stay */}
      {lookAround != null && (
        <div className="absolute inset-x-0 top-[84px] sm:top-auto sm:bottom-[214px] flex justify-center px-4 pointer-events-none">
          <div className="tm-glass rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-2 text-[12.5px] pointer-events-auto" role="status">
            {lookAround === "stay" ? <span className="text-white/75">Looking around</span> : <span className="text-white/75 tabular-nums">Back to the trail in {lookAround}s</span>}
            {lookAround !== "stay" && <button type="button" onClick={() => ctl.current?.stay()} className="h-8 px-3 rounded-full text-[12px] font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10">Stay here</button>}
            <button type="button" onClick={() => ctl.current?.back()} className="h-8 px-3 rounded-full text-[12px] font-bold text-white inline-flex items-center gap-1.5" style={{ background: "linear-gradient(135deg,#ff5100,#ff7d47)" }}>
              <LocateFixed className="w-3.5 h-3.5" />Back to trail
            </button>
          </div>
        </div>
      )}

      {!ready && !failed && <p className="absolute inset-0 grid place-items-center text-white/60 text-[13px]">Loading the terrain…</p>}
      {failed && <p className="absolute inset-0 grid place-items-center text-white/70 text-[13px] px-6 text-center">The 3D view couldn&apos;t load. Check your connection and try again.</p>}

      {/* Controls, and the live profile that doubles as the scrubber */}
      {/* Bottom padding keeps the bar clear of the map's credit in the corner */}
      <div className="absolute bottom-0 inset-x-0 px-3 pt-3 pb-9 sm:px-4 sm:pt-4 sm:pb-9 pointer-events-none">
        <div className="tm-glass rounded-2xl p-3 max-w-[760px] mx-auto pointer-events-auto">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => ctl.current?.toggle()} disabled={!ready} className="tm-btn tm-btn-primary !h-10 !px-4 min-w-[96px]" aria-label={playing ? "Pause" : "Play"}>
              {playing ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> {km > 0 && km < total ? "Play" : "Play trail"}</>}
            </button>
            <button type="button" onClick={() => ctl.current?.restart()} disabled={!ready} className="tm-btn !h-10 !w-10 !px-0" aria-label="From the start"><RotateCcw className="w-3.5 h-3.5" /></button>
            <div className="flex rounded-xl overflow-hidden border border-white/10" role="group" aria-label="Speed">
              {SPEEDS.map((v) => (
                <button key={v} type="button" onClick={() => ctl.current?.speed(v)} aria-pressed={speed === v}
                  className={`h-10 px-2.5 text-[12px] font-bold tabular-nums ${speed === v ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}>{v}×</button>
              ))}
            </div>
            <p className="ml-auto text-right text-[11.5px] text-white/60 tabular-nums leading-tight">
              <span className="text-white font-semibold">{km.toFixed(1)}</span> / {total.toFixed(1)} km
              {ele != null && <><br /><span className="text-white font-semibold">{fmt(ele)}</span> m</>}
            </p>
          </div>

          {/* Day markers: tap one to go to the start of that day */}
          <div className="relative h-5 mt-2.5" aria-label="Days">
            {walkBands.map((b, i) => (i % every === 0 || day?.n === b.day) && (
              <button key={b.day} type="button" onClick={() => ctl.current?.seekKm(b.from + 0.01)} title={b.label}
                aria-label={`Go to day ${b.day}`} aria-current={day?.n === b.day || undefined}
                className={`absolute top-0 -translate-x-1/2 h-5 min-w-5 px-1 rounded-md text-[10px] font-bold tabular-nums transition-colors ${day?.n === b.day ? "bg-[#ff5100] text-white" : "bg-white/8 text-white/60 hover:bg-white/15 hover:text-white"}`}
                style={{ left: `${clamp(((b.from + b.to) / 2 / total) * 100, 2.5, 97.5)}%` }}>{b.day}</button>
            ))}
          </div>
          {/* Click or drag along the profile to jump there */}
          <div
            role="slider" tabIndex={0} aria-label="Position along the trail" aria-valuemin={0} aria-valuemax={Math.round(total)} aria-valuenow={Math.round(km)}
            aria-valuetext={`${km.toFixed(1)} of ${total.toFixed(1)} km${ele != null ? `, ${fmt(ele)} m` : ""}`}
            className="mt-1 relative cursor-pointer select-none touch-none"
            onPointerDown={(e) => {
              const el = e.currentTarget, go = (cx: number) => { const r = el.getBoundingClientRect(); ctl.current?.seekKm(clamp((cx - r.left) / r.width, 0, 1) * total); };
              go(e.clientX);
              el.setPointerCapture(e.pointerId);
              el.onpointermove = (m) => go(m.clientX);
              el.onpointerup = () => { el.onpointermove = null; el.onpointerup = null; };
            }}
            onKeyDown={(e) => {
              const step = e.key === "ArrowRight" ? 0.02 : e.key === "ArrowLeft" ? -0.02 : 0;
              if (step) { e.preventDefault(); ctl.current?.seekKm(clamp(frac + step, 0, 1) * total); }
            }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block w-full h-12 sm:h-14" aria-hidden>
              <defs>
                <clipPath id="tm-fly-done"><rect x="0" y="0" width={x(km)} height={H} /></clipPath>
              </defs>
              {/* Every other day faintly banded */}
              {walkBands.map((b, i) => i % 2 === 0 && <rect key={b.day} x={x(b.from)} y="0" width={Math.max(0, x(b.to) - x(b.from))} height={H} fill="rgba(255,255,255,0.035)" />)}
              <path d={area} fill="rgba(255,255,255,0.08)" />
              <path d={ridge} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              <g clipPath="url(#tm-fly-done)">
                <path d={area} fill="rgba(255,81,0,0.28)" />
                <path d={ridge} fill="none" stroke="#ff7d47" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
              </g>
              <line x1={x(km)} x2={x(km)} y1="0" y2={H} stroke="rgba(255,255,255,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* The hiker on the profile (outside the SVG so it keeps its shape) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HIKER_URL} alt="" width={22} height={22} className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
              style={{ left: `${frac * 100}%`, top: `${(ele != null ? y(ele) / H : 0.5) * 100}%`, boxShadow: "0 0 12px rgba(255,154,102,0.8)" }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-white/40 tabular-nums">
            <span>{fmt(profile.lo)} m</span>
            <span className="hidden sm:inline">Drag the map to look around · tap a day or a stop to go there</span>
            <span>{fmt(profile.hi)} m</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Its own copies of the map page's glass, buttons and colours, so it looks the same opened
           from the adventure page, where the map's styles aren't loaded */
        .tm-fly { --tm-ink: 255,255,255; --tm-fg: 255,255,255; --tm-bg: 17,20,24; --tm-card: #111418; --tm-peach: #ff9a66; --tm-orange: #ff7d47; font-family: var(--font-dm-sans, 'DM Sans'), sans-serif; }
        .tm-fly .tm-glass { background: rgba(17,20,24,0.86); backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 16px 48px rgba(0,0,0,0.45); }
        .tm-fly .tm-btn { height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); transition: all .2s; }
        .tm-fly .tm-btn:hover:not(:disabled) { background: rgba(255,255,255,0.09); }
        .tm-fly .tm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .tm-fly .tm-btn-primary { color: #fff; border: 0; background: linear-gradient(135deg,#ff5100,#ff7d47); box-shadow: 0 6px 20px -6px rgba(255,81,0,0.6); }
        .tm-fly .bg-white\\/8 { background: rgba(255,255,255,0.08); }
        @media (prefers-reduced-transparency: reduce) { .tm-fly .tm-glass { background: #111418; backdrop-filter: none; } }
        .tm-fly-shadow { text-shadow: 0 2px 18px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9); }
        .tm-fly-day { animation: tm-fly-in 0.6s ease-out both; }
        .tm-fly-call { animation: tm-fly-in 0.45s ease-out both; }
        @keyframes tm-fly-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .tm-fly-day, .tm-fly-call { animation: none; } }
      `}</style>
    </div>,
    document.body,
  );
}
