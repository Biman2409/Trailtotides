"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { trailProfile, type Trail } from "@/lib/trails/shared";
import { dayBands } from "@/lib/trails/dayBands";
import { loadLeaflet, loadMapLibre, tuneStyle, TERRARIUM } from "./mapShared";
import { DARK_STYLE } from "./mapAssets";

// "Fly the trail": the trek in 3D, the camera walking the mapped line over real terrain, the day
// you're on named as you reach it. Its own MapLibre map (the main map is Leaflet, which can't tilt
// or turn), with the same style, India's official outline and labels, and the relief's elevation
// tiles raised into terrain. Idea after trip-map-skill's Play Trip (github.com/ashmitmittal/trip-map-skill);
// the code is our own.

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
const RAD = Math.PI / 180;
/** A whole trek takes about this long at 1×, whatever its length */
const PLAY_SECONDS = 75;
const SPEEDS = [1, 2, 4] as const;
const EXAGGERATION = 1.6;

type Pt = { km: number; lat: number; lng: number; ele: number };

function bearing(a: Pt, b: Pt) {
  const y = Math.sin((b.lng - a.lng) * RAD) * Math.cos(b.lat * RAD);
  const x = Math.cos(a.lat * RAD) * Math.sin(b.lat * RAD) - Math.sin(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos((b.lng - a.lng) * RAD);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}

export default function TrailFlyover({ name, trail, onClose }: { name: string; trail: Trail; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const ctl = useRef<{ toggle: () => void; restart: () => void; seek: (f: number) => void; speed: (s: number) => void } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [km, setKm] = useState(0);
  const [ele, setEle] = useState<number | null>(null);
  const [day, setDay] = useState<{ n: number; title: string; sub: string } | null>(null);
  const total = trail.lengthKm;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false, raf = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    // The line with the distance along it at every point
    const prof = trailProfile(trail);
    const pts: Pt[] = trail.line.map((p, i) => ({ km: prof[i].km, lat: p[0], lng: p[1], ele: p[2] }));
    const at = (k: number): Pt => {
      k = Math.max(0, Math.min(total, k));
      let lo = 0, hi = pts.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (pts[mid].km <= k) lo = mid; else hi = mid; }
      const p = pts[lo], q = pts[hi], t = q.km > p.km ? (k - p.km) / (q.km - p.km) : 0;
      return { km: k, lat: p.lat + (q.lat - p.lat) * t, lng: p.lng + (q.lng - p.lng) * t, ele: p.ele + (q.ele - p.ele) * t };
    };
    // Where the walker faces: a little behind to a little ahead, so switchbacks don't spin the camera
    const heading = (k: number) => bearing(at(k - 0.25), at(k + Math.max(0.8, total / 90)));
    const bands = dayBands(trail);
    const dayAt = (k: number) => bands.find((b) => b.from < b.to && k >= b.from && k < b.to) ?? null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const s = { km: 0, playing: false, speed: 1, last: 0, brg: 0, day: -1, painted: 0 };
    const report = () => {
      setKm(s.km);
      setEle(Math.round(at(s.km).ele));
      const d = dayAt(s.km);
      if ((d?.day ?? -1) !== s.day) {
        s.day = d?.day ?? -1;
        const td = d && trail.days.find((x) => x.day === d.day);
        setDay(td ? { n: td.day, title: `${td.from} → ${td.to}`, sub: [td.km != null ? `${td.km} km` : "", td.up ? `${fmt(td.up)} m up` : "", td.sleepEle != null ? `sleep at ${fmt(td.sleepEle)} m` : ""].filter(Boolean).join(" · ") } : null);
      }
    };
    const paintProgress = () => {
      if (!map?.getLayer("fly-trail")) return;
      const f = Math.max(0.0001, Math.min(0.9999, s.km / total));
      map.setPaintProperty("fly-trail", "line-gradient", ["step", ["line-progress"], "#ff5100", f, "rgba(255,255,255,0.55)"]);
    };
    // The camera looks at the walker at the trail's own height. Left to itself MapLibre reads the
    // height from the terrain under the centre, which is sea level until that tile arrives, and
    // in a Himalayan valley that puts the camera inside the mountain.
    const camera = (k: number) => {
      const p = at(k);
      return { center: [p.lng, p.lat] as [number, number], zoom: 12.7, pitch: 66, elevation: p.ele * EXAGGERATION };
    };
    const tick = (now: number) => {
      if (!s.playing) return;
      // Capped so a tab coming back from the background doesn't leap, but loose enough that a
      // slow phone drawing a few frames a second still keeps time
      const dt = Math.min(0.25, (now - s.last) / 1000);
      s.last = now;
      s.km = Math.min(total, s.km + (total / PLAY_SECONDS) * s.speed * dt);
      // Turn smoothly toward the way ahead, the short way round
      const diff = ((heading(s.km) - s.brg + 540) % 360) - 180;
      s.brg = (s.brg + diff * (1 - Math.exp(-dt * 1.8)) + 360) % 360;
      moveWalker(s.km);
      map.jumpTo({ ...camera(s.km), bearing: s.brg });
      if (now - s.painted > 90) { s.painted = now; paintProgress(); report(); }
      if (s.km >= total) { stop(); report(); paintProgress(); return; }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!map || s.playing) return;
      map.setCenterClampedToGround?.(false);
      if (s.km >= total) s.km = 0;
      s.playing = true; setPlaying(true);
      s.brg = heading(s.km);
      // Glide down to the walker, then walk. Listen first: a 0 ms glide ends inside flyTo itself.
      map.once("moveend", () => { if (s.playing) { s.last = performance.now(); raf = requestAnimationFrame(tick); } });
      map.flyTo({ ...camera(s.km), bearing: s.brg, duration: reduced ? 0 : 1800, essential: true });
    };
    const stop = () => { s.playing = false; setPlaying(false); cancelAnimationFrame(raf); };
    // The walker is a map layer, so it sits on the terrain exactly where the line does
    const moveWalker = (k: number) => {
      const p = at(k);
      map?.getSource("fly-walker")?.setData({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [p.lng, p.lat] } });
    };

    ctl.current = {
      toggle: () => (s.playing ? stop() : start()),
      restart: () => { stop(); s.km = 0; paintProgress(); report(); start(); },
      seek: (f) => {
        s.km = Math.max(0, Math.min(total, f * total));
        paintProgress(); report();
        moveWalker(s.km);
        if (!s.playing) map?.easeTo({ ...camera(s.km), bearing: heading(s.km), duration: 900 });
      },
      speed: (v) => { s.speed = v; setSpeed(v); },
    };

    loadLeaflet()
      .then((leaflet) => loadMapLibre(leaflet))
      .then(() => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ml = (window as any).maplibregl;
        const lats = pts.map((p) => p.lat), lngs = pts.map((p) => p.lng);
        const bounds: [[number, number], [number, number]] = [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
        map = new ml.Map({
          container: box, style: DARK_STYLE, bounds, fitBoundsOptions: { padding: 60 },
          pitch: 58, maxPitch: 78, attributionControl: { compact: true }, dragRotate: true,
        });
        map.on("error", () => {}); // a missing tile isn't worth a console line each
        map.on("style.load", () => {
          if (cancelled) return;
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
          map.addSource("fly-line", { type: "geojson", lineMetrics: true, data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts.map((p) => [p.lng, p.lat]) } } });
          map.addLayer({ id: "fly-trail-casing", type: "line", source: "fly-line", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "rgba(0,0,0,0.55)", "line-width": 7 } });
          map.addLayer({ id: "fly-trail", type: "line", source: "fly-line", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-width": 3.5, "line-gradient": ["step", ["line-progress"], "#ff5100", 0.0001, "rgba(255,255,255,0.55)"] } });
          // Stops numbered as on the main map and in the itinerary, drawn as layers so they lie on
          // the terrain with the line (HTML markers float off it while the terrain loads). A loop's
          // last stop is its first again: number it once.
          const first = trail.stops[0], last = trail.stops[trail.stops.length - 1];
          const loop = trail.stops.length > 1 && first.lat === last.lat && first.lng === last.lng;
          const stops = trail.stops.filter((_, i) => !(loop && i === trail.stops.length - 1));
          map.addSource("fly-stops", { type: "geojson", data: { type: "FeatureCollection", features: stops.map((st, i) => ({ type: "Feature", properties: { n: String(i + 1), first: i === 0, name: st.name }, geometry: { type: "Point", coordinates: [st.lng, st.lat] } })) } });
          map.addLayer({ id: "fly-stop", type: "circle", source: "fly-stops", paint: { "circle-radius": 10, "circle-color": ["case", ["get", "first"], "#16a34a", "#ff5100"], "circle-stroke-color": "#ffffff", "circle-stroke-width": 2, "circle-pitch-alignment": "viewport", "circle-pitch-scale": "viewport" } });
          map.addLayer({ id: "fly-stop-n", type: "symbol", source: "fly-stops", layout: { "text-field": ["get", "n"], "text-font": ["Noto Sans Bold"], "text-size": 11, "text-allow-overlap": true, "text-ignore-placement": true, "text-pitch-alignment": "viewport" }, paint: { "text-color": ["case", ["get", "first"], "#ffffff", "#1c1814"] } });
          map.addSource("fly-walker", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [pts[0].lng, pts[0].lat] } } });
          map.addLayer({ id: "fly-walker-glow", type: "circle", source: "fly-walker", paint: { "circle-radius": 18, "circle-color": "rgba(255,154,102,0.45)", "circle-blur": 0.8, "circle-pitch-alignment": "viewport", "circle-pitch-scale": "viewport" } });
          map.addLayer({ id: "fly-walker", type: "circle", source: "fly-walker", paint: { "circle-radius": 6, "circle-color": "#ffffff", "circle-stroke-color": "#ff5100", "circle-stroke-width": 3, "circle-pitch-alignment": "viewport", "circle-pitch-scale": "viewport" } });
          setReady(true);
          report();
          // Moving the map yourself pauses the walk; Play picks it up from the same spot
          // ...and hands the camera back to MapLibre's own ground-following
          map.on("dragstart", () => { stop(); map.setCenterClampedToGround?.(true); });
          map.on("rotatestart", (e: { originalEvent?: Event }) => { if (e.originalEvent) stop(); });
          map.on("zoomstart", (e: { originalEvent?: Event }) => { if (e.originalEvent) stop(); });
          if (!reduced) setTimeout(() => { if (!cancelled) start(); }, 900);
        });
      })
      .catch(() => setFailed(true));

    return () => { cancelled = true; cancelAnimationFrame(raf); ctl.current = null; try { map?.remove(); } catch { /* already gone */ } };
  }, [trail, total]);

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

  const frac = total > 0 ? km / total : 0;

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

      {/* The day you're on, named as you reach it */}
      {day && (
        <div className="absolute inset-x-0 top-[88px] sm:top-[96px] flex justify-center pointer-events-none px-4" aria-live="polite">
          <div key={day.n} className="tm-fly-day text-center max-w-[560px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tm-peach)]">Day {day.n}</p>
            <p className="text-[20px] sm:text-[26px] font-bold text-white leading-tight tm-fly-shadow">{day.title}</p>
            {day.sub && <p className="text-[12px] sm:text-[13px] text-white/75 mt-1 tm-fly-shadow">{day.sub}</p>}
          </div>
        </div>
      )}

      {!ready && !failed && <p className="absolute inset-0 grid place-items-center text-white/60 text-[13px]">Loading the terrain…</p>}
      {failed && <p className="absolute inset-0 grid place-items-center text-white/70 text-[13px] px-6 text-center">The 3D view couldn&apos;t load. Check your connection and try again.</p>}

      {/* Controls: play, speed, progress along the trail */}
      {/* Bottom padding keeps the bar clear of the map's credit in the corner */}
      <div className="absolute bottom-0 inset-x-0 px-3 pt-3 pb-9 sm:px-4 sm:pt-4 sm:pb-9 pointer-events-none">
        <div className="tm-glass rounded-2xl p-3 max-w-[720px] mx-auto pointer-events-auto">
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
              {ele != null && <><br />{fmt(ele)} m</>}
            </p>
          </div>
          {/* Click or drag along the bar to jump there */}
          <div
            role="slider" tabIndex={0} aria-label="Position along the trail" aria-valuemin={0} aria-valuemax={Math.round(total)} aria-valuenow={Math.round(km)} aria-valuetext={`${km.toFixed(1)} of ${total.toFixed(1)} km`}
            className="mt-3 h-2 rounded-full bg-white/10 cursor-pointer relative"
            onPointerDown={(e) => {
              const el = e.currentTarget, go = (x: number) => { const r = el.getBoundingClientRect(); ctl.current?.seek((x - r.left) / r.width); };
              go(e.clientX);
              el.setPointerCapture(e.pointerId);
              el.onpointermove = (m) => go(m.clientX);
              el.onpointerup = () => { el.onpointermove = null; el.onpointerup = null; };
            }}
            onKeyDown={(e) => {
              const step = e.key === "ArrowRight" ? 0.02 : e.key === "ArrowLeft" ? -0.02 : 0;
              if (step) { e.preventDefault(); ctl.current?.seek(frac + step); }
            }}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-[#ff5100]" style={{ width: `${frac * 100}%` }} />
          </div>
          <p className="mt-2 text-[10.5px] text-white/35">Drag to look around; it pauses the walk. Terrain raised {EXAGGERATION}× so the climbs read.</p>
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
        @media (prefers-reduced-transparency: reduce) { .tm-fly .tm-glass { background: #111418; backdrop-filter: none; } }
        .tm-fly-shadow { text-shadow: 0 2px 18px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9); }
        .tm-fly-day { animation: tm-fly-day 0.6s ease-out both; }
        @keyframes tm-fly-day { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .tm-fly-day { animation: none; } }
      `}</style>
    </div>,
    document.body,
  );
}
