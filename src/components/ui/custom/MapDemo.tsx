"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUp, ArrowUpRight, BadgeCheck, Download, GitCompare, LocateFixed, Map as MapIcon, MapPin, MousePointer2, Shapes, WifiOff } from "lucide-react";
import { INDIA_PATH, PROJ } from "@/lib/passportVisuals";
import { DEMO_SPOTS, type DemoGenre } from "@/lib/mapDemoSpots";
import { CompassAIMark } from "@/components/ui/custom/BrandMarks";

// A small, live preview of /map for the home page, acting out what the real map does: pins
// coloured by difficulty, ask Compass.AI and its picks light up with rings for how ready you
// are, what's near you, a pin's card with its trail and compare, and the trail's GPX to follow
// offline. A pointer acts the tour out; any click hands over the controls.
//
// Rendering is split for smoothness: the map itself is drawn once and moved as a single
// GPU layer, while the dots, rings and pulses are painted on a canvas every frame.
// Nothing re-renders in React while the camera flies.

export type MapDemoFit = "ready" | "stretch" | "not-yet";

export type MapDemoPin = {
  slug: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  difficulty: string;
  durationDays: string;
  state: string;
  image: string;
  price: number | null;
  verified: number;
  /** How ready the example profile is for it (the same one the Matchmaker preview uses) */
  fit: MapDemoFit;
};

/** What the tour acts out with real listings: a Compass.AI prompt and its picks, and the pin it opens */
export type MapDemoTour = {
  prompt: string;
  picks: string[];
  slug: string;
  /** The trail's shape, fitted into a unit box (x, y from 0 to 1) */
  route: [number, number][];
  /** Elevations along the trail, evenly spaced */
  profile: number[];
  lengthKm: number;
  maxEleM: number;
};

type Pin = {
  slug: string; name: string; genre: DemoGenre; difficulty: string; x: number; y: number; lat: number; lng: number;
  image: string; meta: string; href: string; km: number; price: number | null; verified: number; fit: MapDemoFit | null;
};

// Pins are coloured by difficulty, as on the real map and the cards
const DIFFS = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"] as const;
const DIFF_COLOR: Record<string, string> = { Easy: "#10b981", Moderate: "#38bdf8", Hard: "#a78bfa", Advanced: "#ff7a2f", Extreme: "#ef4444" };
const FIT_COLOR: Record<MapDemoFit, string> = { ready: "#10b981", stretch: "#f59e0b", "not-yet": "#f43f5e" };
const FIT_LABEL: Record<MapDemoFit, string> = { ready: "Ready for you", stretch: "A stretch", "not-yet": "Not yet" };
const AI_COLOR = "#ffb37a";

const GENRES: DemoGenre[] = ["Trekking", "Water", "Air", "Snow", "Road", "Rock"];
const GENRE_OF: Record<string, DemoGenre> = {
  Trekking: "Trekking", Mountaineering: "Trekking", Scrambling: "Trekking",
  Diving: "Water", Kayaking: "Water", "River Rafting": "Water",
  Paragliding: "Air", "Hot Air Balloon": "Air",
  Skiing: "Snow", "Ice Skating": "Snow",
  Motorcycling: "Road", Cycling: "Road", "Jeep Safari": "Road",
  "Rock Climbing": "Rock", Caving: "Rock",
};

// Sample spots borrow the genre photos from "Adventure Lives in Every Element", and get a
// steady made-up difficulty from their name so they colour like the rest
const ELEMENT = (name: string) => `https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/element-${name}.jpeg`;
const GENRE_IMAGE: Record<DemoGenre, string> = {
  Trekking: ELEMENT("earth"), Road: ELEMENT("earth"), Rock: ELEMENT("earth"),
  Water: ELEMENT("water"), Air: ELEMENT("air"), Snow: ELEMENT("snow"),
};
const sampleDifficulty = (name: string) => DIFFS[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 4];

const W = PROJ.W, H = PROJ.H;
const toXY = (lng: number, lat: number) => ({
  x: (lng - PROJ.minLng) * PROJ.scale + PROJ.offX,
  y: (PROJ.maxLat - lat) * PROJ.scale + PROJ.offY,
});
const kmBetween = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

type Camera = { x: number; y: number; scale: number };
const HOME: Camera = { x: W / 2, y: H / 2, scale: 1 };
const HIMALAYAS: Camera = { ...toXY(78.2, 31.6), scale: 2.6 };
// "Near you" uses a stand-in location so the preview never asks for permission: Delhi, whose
// ring takes in real listings (Rishikesh rafting at ~200 km, then the Uttarakhand treks)
const ME = { name: "Delhi", lat: 28.61, lng: 77.21 };
const ME_XY = toXY(ME.lng, ME.lat);
const NEAR_KM = 300;
const NEAR_R = (NEAR_KM / 111) * PROJ.scale; // radius in map units
const NEAR: Camera = { ...ME_XY, scale: 3 };

type Mode = { kind: "all" } | { kind: "picks" } | { kind: "region"; label: string } | { kind: "near" };

const SWEEP_MS = 1500;
const ARRIVE = 900; // the pointer's travel time before it "clicks"
const TYPE_MS = 32; // per character of the Compass prompt
const BEATS = [
  { caption: "Every pin, coloured by difficulty", ms: 3400 },
  { caption: "Ask Compass.AI, see your matches", ms: 7000 },
  { caption: "Near you", ms: 3400 },
  { caption: "Tap a pin, add it to compare", ms: 5600 },
  { caption: "Get the GPX, follow it offline", ms: 5000 },
  // The tour ends on the way in: the pointer taps the demo's own "Open map" button
  { caption: "Open the map", ms: 2800 },
];
// Within the Compass beat: the prompt types out and the map frames the picks, then the rings come on
const MATCH_AT = 3600;
// Within the pin beat: the card opens, then the pointer moves on to compare
const COMPARE_AT = 2700;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** `cta` is the way into the real thing — it lives inside the demo, and the tour ends by tapping it */
export default function MapDemo({ pins: real, tour, cta }: { pins: MapDemoPin[]; tour: MapDemoTour; cta: { href: string; label: string } }) {
  const pins: Pin[] = useMemo(() => [
    ...real.filter((p) => GENRE_OF[p.type]).map((p) => ({
      slug: p.slug, name: p.name, genre: GENRE_OF[p.type], difficulty: p.difficulty, ...toXY(p.lng, p.lat), lat: p.lat, lng: p.lng,
      image: p.image, meta: `${p.durationDays} · ${p.difficulty}`, href: `/experiences/${p.slug}`, km: kmBetween(ME, p),
      price: p.price, verified: p.verified, fit: p.fit,
    })),
    ...DEMO_SPOTS.map(([genre, name, lat, lng]) => ({
      slug: `spot-${name.toLowerCase().replace(/[^a-z]+/g, "-")}`, name, genre, difficulty: sampleDifficulty(name), ...toXY(lng, lat), lat, lng,
      image: GENRE_IMAGE[genre], meta: `${genre} · sample spot`, href: `/explore?q=${encodeURIComponent(name)}`, km: kmBetween(ME, { lat, lng }),
      price: null, verified: 0, fit: null,
    })),
  ], [real]);

  const picks = useMemo(() => new Set(tour.picks), [tour.picks]);
  // The camera that frames Compass's picks
  const picksCam = useMemo<Camera>(() => {
    const ps = pins.filter((p) => picks.has(p.slug));
    if (!ps.length) return HOME;
    const xs = ps.map((p) => p.x), ys = ps.map((p) => p.y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const scale = Math.max(1, Math.min(5, W / (x1 - x0 + 70), H / (y1 - y0 + 70)));
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, scale };
  }, [pins, picks]);

  const [genre, setGenre] = useState<DemoGenre | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "all" });
  const [asked, setAsked] = useState("");       // the Compass prompt as typed so far
  const [typing, setTyping] = useState(false);
  const [matches, setMatches] = useState(false);
  const [compared, setCompared] = useState<string | null>(null);
  const [offline, setOffline] = useState(false); // the GPX is saved and the trail is being followed
  const [target, setTarget] = useState<Camera>(HOME);
  const [cam, setCam] = useState<Camera>(HOME); // the settled camera; flights never re-render
  const [flying, setFlying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ name: string; left: number; top: number } | null>(null);
  const [step, setStep] = useState(0);
  const [touring, setTouring] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number; click: number } | null>(null);
  const [ctaHot, setCtaHot] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const askRef = useRef<HTMLButtonElement>(null);
  const matchRef = useRef<HTMLButtonElement>(null);
  const nearRef = useRef<HTMLButtonElement>(null);
  const compareRef = useRef<HTMLButtonElement>(null);
  const gpxRef = useRef<HTMLAnchorElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const typeTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const sendTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Everything the frame loop reads lives in refs
  const live = useRef({
    cam: HOME as Camera,
    flight: null as null | { from: Camera; to: Camera; start: number; ms: number; dist: number },
    genre: null as DemoGenre | null,
    mode: { kind: "all" } as Mode,
    matches: false,
    selected: null as string | null,
    revealAt: 0,
    ringAt: 0,
    w: 0, h: 0,
    anim: new Map<string, { a: number; k: number; r: number }>(),
  });
  live.current.genre = genre;
  live.current.selected = selected;
  live.current.matches = matches;
  if (live.current.mode !== mode) {
    if (mode.kind === "near" && live.current.mode.kind !== "near") live.current.ringAt = performance.now();
    live.current.mode = mode;
  }

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      setOnScreen(e.isIntersecting);
      if (e.isIntersecting && !live.current.revealAt) { live.current.revealAt = performance.now(); setRevealed(true); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stopTyping = () => { clearInterval(typeTimer.current); clearTimeout(sendTimer.current); setTyping(false); };
  useEffect(() => () => { clearInterval(typeTimer.current); clearTimeout(sendTimer.current); }, []);

  // Start a flight whenever the target changes
  useEffect(() => {
    const L = live.current;
    const from = L.cam;
    if (from.x === target.x && from.y === target.y && from.scale === target.scale) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dist = Math.hypot(target.x - from.x, target.y - from.y) + Math.abs(Math.log(target.scale / from.scale)) * 60;
    L.flight = { from, to: target, start: performance.now(), ms: reduce ? 1 : Math.min(1800, 1000 + dist * 3), dist };
    setFlying(true);
  }, [target]);

  // Size the canvas to the box
  useEffect(() => {
    const box = boxRef.current, canvas = canvasRef.current;
    if (!box || !canvas) return;
    const fit = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      live.current.w = r.width; live.current.h = r.height;
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // The frame loop: runs only while the map is on screen
  useEffect(() => {
    if (!onScreen) return;
    const canvas = canvasRef.current, base = baseRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !base || !ctx) return;
    let raf = 0, last = performance.now();

    const frame = (now: number) => {
      const L = live.current;
      const dt = Math.min(64, now - last); last = now;
      const { w, h } = L;

      // Camera
      if (L.flight) {
        const f = L.flight;
        const t = easeInOut(Math.min(1, (now - f.start) / f.ms));
        const lift = Math.sin(Math.PI * t) * Math.min(0.35, f.dist / 600);
        const s = Math.exp(Math.log(f.from.scale) + (Math.log(f.to.scale) - Math.log(f.from.scale)) * t - lift);
        L.cam = { x: f.from.x + (f.to.x - f.from.x) * t, y: f.from.y + (f.to.y - f.from.y) * t, scale: s };
        if (t >= 1) {
          L.cam = f.to; L.flight = null;
          base.style.willChange = "auto"; // re-raster crisp at the final zoom
          setCam(f.to); setFlying(false);
        } else base.style.willChange = "transform";
      }
      const c = L.cam, u = w / W;
      base.style.transform = `translate3d(${w / 2}px, ${h / 2}px, 0) scale(${c.scale}) translate3d(${-c.x * u}px, ${-c.y * u}px, 0)`;
      const sx = (x: number) => (x - c.x) * c.scale * u + w / 2;
      const sy = (y: number) => (y - c.y) * c.scale * u + h / 2;

      ctx.clearRect(0, 0, w, h);

      // Near you: range ring with a radar sweep
      const near = L.mode.kind === "near";
      if (near) {
        // ringAt is stamped after this frame's timestamp, so clamp at 0: a negative radius makes
        // arc() throw, which used to stop the whole animation
        const p = easeOut(Math.min(1, Math.max(0, (now - L.ringAt) / 900)));
        const mx = sx(ME_XY.x), my = sy(ME_XY.y), R = NEAR_R * c.scale * u * p;
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(1, R));
        g.addColorStop(0, "rgba(96,165,250,0.22)"); g.addColorStop(0.85, "rgba(96,165,250,0.08)"); g.addColorStop(1, "rgba(96,165,250,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, R, 0, Math.PI * 2); ctx.fill();
        ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(96,165,250,0.55)"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
        const a0 = (now / 2800) * Math.PI * 2;
        const sweep = ctx.createLinearGradient(mx, my, mx + Math.cos(a0 + 0.9) * R, my + Math.sin(a0 + 0.9) * R);
        sweep.addColorStop(0, "rgba(96,165,250,0)"); sweep.addColorStop(1, "rgba(96,165,250,0.32)");
        ctx.fillStyle = sweep; ctx.beginPath(); ctx.moveTo(mx, my); ctx.arc(mx, my, R, a0, a0 + 0.9); ctx.closePath(); ctx.fill();
      }

      // Pins
      const asking = L.mode.kind === "picks";
      const ease = 1 - Math.exp(-dt / 140); // smooth every state change toward its target
      let selPin: Pin | null = null;
      for (const p of pins) {
        const x = sx(p.x), y = sy(p.y);
        if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue;
        const picked = asking && picks.has(p.slug);
        const shown = (!L.genre || p.genre === L.genre) && (!near || p.km <= NEAR_KM) && (!asking || picked);
        const on = L.selected === p.slug;
        let st = L.anim.get(p.slug);
        if (!st) { st = { a: 1, k: 1, r: 0 }; L.anim.set(p.slug, st); }
        st.a += ((shown ? 1 : 0.12) - st.a) * ease;
        st.k += ((on ? 1.9 : picked ? 1.6 : shown ? (L.genre || near ? 1.15 : 1) : 0.55) - st.k) * ease;
        st.r += ((L.matches && p.fit && shown ? 1 : 0) - st.r) * ease;
        // Pop in as the scan line passes
        const pt = L.revealAt ? Math.min(1, Math.max(0, (now - L.revealAt - (p.x / W) * SWEEP_MS) / 650)) : 0;
        if (pt <= 0) continue;
        const pop = easeOutBack(pt);
        const alpha = st.a * Math.min(1, pt * 2);
        const col = DIFF_COLOR[p.difficulty] ?? "#94a3b8";
        // Compass's picks glow in its colour
        if (picked) {
          ctx.globalAlpha = alpha * (0.28 + 0.12 * Math.sin(now / 300));
          ctx.fillStyle = AI_COLOR;
          ctx.beginPath(); ctx.arc(x, y, 11 * st.k * pop, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = col;
        ctx.globalAlpha = alpha * 0.16;
        ctx.beginPath(); ctx.arc(x, y, 7.5 * st.k * pop, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(x, y, 2.7 * st.k * pop, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = "#0b1211"; ctx.stroke();
        // Fit ring: how ready the example profile is for it
        if (st.r > 0.02 && p.fit) {
          ctx.globalAlpha = alpha * st.r;
          ctx.strokeStyle = FIT_COLOR[p.fit]; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, (4.4 + 1.6 * st.r) * st.k * pop, 0, Math.PI * 2); ctx.stroke();
        }
        if (on) selPin = p;
      }
      ctx.globalAlpha = 1;

      // Selected pin pulse
      if (selPin) {
        const x = sx(selPin.x), y = sy(selPin.y), t = (now % 1600) / 1600;
        ctx.strokeStyle = DIFF_COLOR[selPin.difficulty] ?? "#fff"; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.9 * (1 - t);
        ctx.beginPath(); ctx.arc(x, y, 6 + t * 14, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }

      // You
      if (near) {
        const mx = sx(ME_XY.x), my = sy(ME_XY.y), t = (now % 1800) / 1800;
        ctx.fillStyle = "#60a5fa"; ctx.globalAlpha = 0.5 * (1 - t);
        ctx.beginPath(); ctx.arc(mx, my, 5 + t * 16, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(mx, my, 4.4, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 1.8; ctx.strokeStyle = "#fff"; ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onScreen, pins, picks]);

  // Geometry helpers for the tour pointer and the card
  const screenPct = (x: number, y: number, c: Camera) => ({
    left: (((x - c.x) * c.scale + W / 2) / W) * 100,
    top: (((y - c.y) * c.scale + H / 2) / H) * 100,
  });
  const relToRoot = (px: number, py: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    return r ? { x: px - r.left, y: py - r.top } : null;
  };
  const elPoint = (el: HTMLElement | null | undefined) => {
    const c = el?.getBoundingClientRect();
    return c ? relToRoot(c.left + c.width * 0.6, c.top + c.height * 0.7) : null;
  };
  const pinPoint = (p: Pin, c: Camera) => {
    const b = boxRef.current?.getBoundingClientRect();
    if (!b) return null;
    const s = screenPct(p.x, p.y, c);
    return relToRoot(b.left + (s.left / 100) * b.width, b.top + (s.top / 100) * b.height);
  };

  // The tour opens the trek whose trail it has (a real listing near "you"), else the nearest real one
  const tourPin = useMemo(
    () => pins.find((p) => p.slug === tour.slug) ?? [...pins].sort((a, b) => a.km - b.km).find((p) => p.km > 20 && p.href.startsWith("/experiences/")) ?? pins[0],
    [pins, tour.slug],
  );

  // Ask Compass.AI: the prompt types itself out, then the picks light up and the map frames them
  const ask = (instant = false) => {
    stopTyping();
    setSelected(null); setGenre(null);
    const done = () => { setTyping(false); setAsked(tour.prompt); setMode({ kind: "picks" }); setTarget(picksCam); };
    if (instant) return done();
    setTyping(true); setAsked("");
    let n = 0;
    typeTimer.current = setInterval(() => {
      n++;
      setAsked(tour.prompt.slice(0, n));
      if (n >= tour.prompt.length) { clearInterval(typeTimer.current); sendTimer.current = setTimeout(done, 350); }
    }, TYPE_MS);
  };

  useEffect(() => {
    if (!touring || !onScreen) return;
    const press = (pt: { x: number; y: number } | null) => pt && setCursor((c) => ({ ...pt, click: (c?.click ?? 0) + 1 }));
    const acts: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => acts.push(setTimeout(fn, ms));
    if (step === 0) {
      stopTyping();
      setGenre(null); setMode({ kind: "all" }); setTarget(HOME); setSelected(null); setCtaHot(false);
      setAsked(""); setMatches(false); setCompared(null); setOffline(false);
      setCursor((c) => c ?? (() => { const r = rootRef.current?.getBoundingClientRect(); return r ? { x: r.width * 0.84, y: r.height * 0.8, click: 0 } : null; })());
    } else if (step === 1) {
      // Ask, then light up how ready you are for what came back
      press(elPoint(askRef.current));
      at(ARRIVE, () => ask());
      at(MATCH_AT, () => press(elPoint(matchRef.current)));
      at(MATCH_AT + ARRIVE, () => setMatches(true));
    } else if (step === 2) {
      press(elPoint(nearRef.current));
      at(ARRIVE, () => { setAsked(""); setGenre(null); setMode({ kind: "near" }); setTarget(NEAR); });
    } else if (step === 3) {
      // Open the pin, then add it to compare
      press(pinPoint(tourPin, NEAR));
      at(ARRIVE, () => setSelected(tourPin.slug));
      at(COMPARE_AT, () => press(elPoint(compareRef.current)));
      at(COMPARE_AT + ARRIVE, () => setCompared(tourPin.slug));
    } else if (step === 4) {
      press(elPoint(gpxRef.current));
      at(ARRIVE, () => setOffline(true));
    } else if (step === 5) {
      press(elPoint(ctaRef.current));
      at(ARRIVE, () => setCtaHot(true));
    }
    const t = setTimeout(() => setStep((s) => (s + 1) % BEATS.length), BEATS[step].ms + (step === 0 && !revealed ? SWEEP_MS : 0));
    return () => { clearTimeout(t); acts.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, touring, onScreen]);

  const takeOver = () => { if (touring) { stopTyping(); setTouring(false); setCursor(null); setCtaHot(false); } };
  const replay = () => {
    stopTyping();
    setStep(0); setGenre(null); setMode({ kind: "all" }); setTarget(HOME); setSelected(null); setCursor(null);
    setAsked(""); setMatches(false); setCompared(null); setOffline(false); setTouring(true);
  };

  // Hit-test the canvas: the nearest visible pin within reach of the pointer
  const pinAt = (clientX: number, clientY: number) => {
    const b = boxRef.current?.getBoundingClientRect();
    if (!b) return null;
    const c = live.current.cam, u = b.width / W;
    let best: Pin | null = null, bd = 12 * 12;
    for (const p of pins) {
      const shown = (!genre || p.genre === genre) && (mode.kind !== "near" || p.km <= NEAR_KM) && (mode.kind !== "picks" || picks.has(p.slug));
      if (!shown) continue;
      const x = (p.x - c.x) * c.scale * u + b.width / 2 + b.left, y = (p.y - c.y) * c.scale * u + b.height / 2 + b.top;
      const d = (x - clientX) ** 2 + (y - clientY) ** 2;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  };

  const sel = selected ? pins.find((p) => p.slug === selected) ?? null : null;
  const hasTrail = !!sel && sel.slug === tour.slug && tour.route.length > 1;
  const routePts = tour.route.map(([x, y]) => `${x},${y}`).join(" ");
  const selPos = sel && !flying ? screenPct(sel.x, sel.y, cam) : null;
  const zoomed = target.scale > 1;

  const selectPin = (p: Pin) => {
    takeOver();
    setSelected(p.slug);
    if (target.scale < 2) setTarget({ x: p.x, y: p.y, scale: 2.6 });
  };
  // Type steps through the kinds, as the real map's Type menu filters them
  const cycleType = () => {
    takeOver(); setSelected(null);
    setGenre((g) => (g === null ? GENRES[0] : GENRES.indexOf(g) === GENRES.length - 1 ? null : GENRES[GENRES.indexOf(g) + 1]));
  };
  const region = () => {
    takeOver(); setSelected(null); setAsked("");
    if (mode.kind === "region") { setMode({ kind: "all" }); setTarget(HOME); } else { setMode({ kind: "region", label: "Himalayas" }); setTarget(HIMALAYAS); }
  };
  const locate = () => { takeOver(); setAsked(""); setGenre(null); setSelected(null); setMode({ kind: "near" }); setTarget(NEAR); };
  const zoomOut = () => { takeOver(); setSelected(null); setAsked(""); setMode({ kind: "all" }); setTarget(HOME); };
  const askNow = () => { takeOver(); ask(true); };

  const status =
    mode.kind === "near" ? `Within ${NEAR_KM} km of ${ME.name}`
    : mode.kind === "picks" ? `Compass.AI · ${tour.picks.length} picks`
    : mode.kind === "region" ? `${genre ?? "Everything"} · ${mode.label}`
    : genre ?? "All of India";
  const statusColor = mode.kind === "near" ? "#60a5fa" : mode.kind === "picks" ? AI_COLOR : "#7edc96";

  return (
    <div ref={rootRef} className="relative w-full min-w-0 max-w-[320px] sm:max-w-[360px] lg:max-w-[400px] mx-auto lg:mr-0 select-none">
      <div className="md-shell rounded-[22px] p-3">
        {/* Compass.AI, as on the map: describe a trip and the picks light up */}
        <button ref={askRef} type="button" onClick={askNow} className="md-ask w-full flex items-center gap-2 h-10 pl-3 pr-1.5 rounded-xl text-left mb-2" data-on={mode.kind === "picks" || typing || undefined}>
          <CompassAIMark className="w-3.5 h-3.5 shrink-0" style={{ color: AI_COLOR }} strokeWidth={2} />
          <span className={`flex-1 min-w-0 truncate text-[12px] ${asked ? "text-white" : "text-white/45"}`}>
            {asked || "Describe your trip — Compass.AI picks"}
            {typing && <span className="md-caret" aria-hidden />}
          </span>
          <span className="w-7 h-7 rounded-full grid place-items-center shrink-0" style={{ background: "linear-gradient(135deg,#ff5100,#ff7d47,#ffb37a)" }}>
            <ArrowUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </span>
        </button>

        {/* The dock: Type, Region and Near me, plus the fit rings; sized to their labels, and they always fit */}
        <div className="flex gap-1.5 mb-2.5">
          <button type="button" onClick={cycleType} className="md-chip md-hit flex-auto inline-flex items-center justify-center gap-1 min-w-0" data-on={genre || undefined} style={{ "--c": "#ff7d47" } as React.CSSProperties}>
            <Shapes className="w-3 h-3 shrink-0" /><span className="truncate">{genre ?? "Type"}</span>
          </button>
          <button type="button" onClick={region} className="md-chip md-hit flex-auto inline-flex items-center justify-center gap-1 min-w-0" data-on={mode.kind === "region" || undefined} style={{ "--c": "#7edc96" } as React.CSSProperties}>
            <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{mode.kind === "region" ? mode.label : "Region"}</span>
          </button>
          <button ref={nearRef} type="button" onClick={locate} className="md-chip md-hit flex-auto inline-flex items-center justify-center gap-1 min-w-0" data-on={mode.kind === "near" || undefined} style={{ "--c": "#60a5fa" } as React.CSSProperties}>
            <LocateFixed className="w-3 h-3 shrink-0" /><span className="truncate">Near me</span>
          </button>
          <button ref={matchRef} type="button" onClick={() => { takeOver(); setMatches((m) => !m); }} className="md-chip md-hit flex-auto inline-flex items-center justify-center gap-1 min-w-0" data-on={matches || undefined} style={{ "--c": "#10b981" } as React.CSSProperties}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ boxShadow: "inset 0 0 0 1.5px #10b981" }} /><span className="truncate">Matches</span>
          </button>
        </div>

        {/* Map */}
        <div
          ref={boxRef}
          className="md-map relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: `${W} / ${H}` }}
          onClick={(e) => { const p = pinAt(e.clientX, e.clientY); if (p) selectPin(p); else { takeOver(); setSelected(null); } }}
          onMouseMove={(e) => {
            const p = pinAt(e.clientX, e.clientY);
            const b = boxRef.current!.getBoundingClientRect();
            setHover(p && p.slug !== selected ? { name: p.name, left: e.clientX - b.left, top: e.clientY - b.top } : null);
            e.currentTarget.style.cursor = p ? "pointer" : "default";
          }}
          onMouseLeave={() => setHover(null)}
        >
          {/* Ocean: its own composited layer, drifting */}
          <div className="md-sea" aria-hidden />

          {/* The map: drawn once, moved as one GPU layer */}
          <div ref={baseRef} className="md-base" aria-hidden>
            <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-full overflow-visible">
              <defs>
                <pattern id="md-contours" width="420" height="72" patternUnits="userSpaceOnUse">
                  <image href="/hero/trail-contours.png" width="420" height="72" preserveAspectRatio="none" />
                </pattern>
                <linearGradient id="md-land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2c3c2e" />
                  <stop offset="100%" stopColor="#1a241b" />
                </linearGradient>
              </defs>
              {[70, 75, 80, 85, 90, 95].map((lng) => {
                const x = toXY(lng, 0).x;
                return <line key={`g${lng}`} x1={x} y1={-H} x2={x} y2={H * 2} stroke="rgba(255,255,255,0.045)" strokeWidth={0.5} />;
              })}
              {[10, 15, 20, 25, 30, 35].map((lat) => {
                const y = toXY(0, lat).y;
                return <line key={`t${lat}`} x1={-W} y1={y} x2={W * 2} y2={y} stroke="rgba(255,255,255,0.045)" strokeWidth={0.5} />;
              })}
              {/* A soft offset copy stands in for a drop shadow (filters are costly to move) */}
              <path d={INDIA_PATH} fill="rgba(0,0,0,0.35)" transform="translate(0 5)" />
              <path d={INDIA_PATH} fill="url(#md-land)" />
              <path d={INDIA_PATH} fill="url(#md-contours)" opacity={0.3} />
              <path d={INDIA_PATH} fill="none" stroke="rgba(126,220,150,0.55)" strokeWidth={0.7} strokeLinejoin="round" />
            </svg>
          </div>

          {/* Dots, rings and pulses */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />

          {/* Scan line on first view */}
          {revealed && <span className="md-scan" style={{ animationDuration: `${SWEEP_MS}ms` }} aria-hidden />}

          {/* Hover label */}
          {hover && (
            <span className="absolute z-10 pointer-events-none text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap -translate-x-1/2" style={{ left: hover.left, top: hover.top - 26, background: "rgba(0,0,0,0.75)", color: "#fff" }}>
              {hover.name}
            </span>
          )}

          {/* Status; once something is in compare, the compare tray takes its place (up here, clear of the card) */}
          <div className="absolute left-2 top-2 right-16 pointer-events-none">
            {compared ? (
              <span key="compare" className="md-badge inline-flex items-center gap-1.5 text-[10px] font-semibold pl-2 pr-2.5 py-1 rounded-full" style={{ background: "rgba(255,81,0,0.92)", color: "#fff" }}>
                <GitCompare className="w-3 h-3" />1 in compare · add 2 more
              </span>
            ) : <span key={status} className="md-badge inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full max-w-full" style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(6px)" }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
              <span className="truncate">{status}</span>
            </span>}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); zoomOut(); }}
            className="md-hit absolute right-2 top-2 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-opacity duration-300"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(6px)", opacity: zoomed ? 1 : 0, pointerEvents: zoomed ? "auto" : "none" }}
            tabIndex={zoomed ? 0 : -1}
          >
            All India
          </button>

          {/* Region name, set large and faint along the bottom */}
          <div className="absolute inset-x-0 bottom-10 text-center pointer-events-none">
            <span
              key={mode.kind === "region" ? mode.label : mode.kind}
              className="md-region inline-block text-[22px] font-black uppercase tracking-[0.28em]"
              style={{ opacity: !flying && (mode.kind === "region" || mode.kind === "near") && !sel ? undefined : 0 }}
            >
              {mode.kind === "region" ? mode.label : mode.kind === "near" ? "Near you" : ""}
            </span>
          </div>

          {/* Key: what the colours mean (difficulty), or the rings when they're on */}
          <div className="absolute left-2 right-10 bottom-2 pointer-events-none">
            {(
              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.7)" }}>
                {matches ? (
                  (["ready", "stretch", "not-yet"] as MapDemoFit[]).map((f) => (
                    <span key={f} className="inline-flex items-center gap-1">
                      <i className="w-2 h-2 rounded-full" style={{ boxShadow: `inset 0 0 0 1.5px ${FIT_COLOR[f]}` }} />{f === "ready" ? "Ready" : f === "stretch" ? "Stretch" : "Not yet"}
                    </span>
                  ))
                ) : (
                  <>Easy{DIFFS.map((d) => <i key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: DIFF_COLOR[d] }} />)}Extreme</>
                )}
              </span>
            )}
          </div>
          <svg className="absolute right-2 bottom-2 w-7 h-7 pointer-events-none" viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r="14.5" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.18)" />
            <path d="M16 5 L19 16 L16 14.5 L13 16 Z" fill="#ff7d47" />
            <path d="M16 27 L19 16 L16 17.5 L13 16 Z" fill="rgba(255,255,255,0.5)" />
          </svg>

          {/* Pin card: the trail, how ready you are, verified operators and price, then compare */}
          {sel && selPos && (
            <div
              key={sel.slug}
              onClick={(e) => e.stopPropagation()}
              className="md-card absolute z-10 w-[204px] rounded-xl overflow-hidden text-left"
              style={{
                left: `clamp(6px, calc(${selPos.left}% - 102px), calc(100% - 210px))`,
                top: selPos.top > 50 ? undefined : `calc(${selPos.top}% + 16px)`,
                bottom: selPos.top > 50 ? `calc(${100 - selPos.top}% + 16px)` : undefined,
                background: "rgba(11,14,13,0.95)",
                border: `1px solid ${DIFF_COLOR[sel.difficulty] ?? "#fff"}66`,
                boxShadow: `0 14px 36px rgba(0,0,0,0.55), 0 0 26px ${DIFF_COLOR[sel.difficulty] ?? "#fff"}33`,
              }}
            >
              <Link href={sel.href} className="group relative block h-[64px]">
                <Image src={sel.image} alt="" fill sizes="204px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,14,13,0.95), transparent 70%)" }} />
                <span className="absolute left-2.5 bottom-1.5 right-2.5 text-[12.5px] font-semibold text-white leading-snug truncate">{sel.name}</span>
                {offline && hasTrail ? (
                  <span key="off" className="md-badge absolute right-2 top-2 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.92)", color: "#03140d" }}>
                    <WifiOff className="w-2.5 h-2.5" />No signal · GPS on
                  </span>
                ) : mode.kind === "near" && (
                  <span className="absolute right-2 top-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.9)", color: "#06121f" }}>
                    {Math.round(sel.km)} km away
                  </span>
                )}
              </Link>
              <span className="block px-2.5 pb-2.5 pt-1.5">
                <span className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-white/60 truncate">{sel.meta}</span>
                  {sel.fit && (
                    <span className="inline-flex items-center gap-1 font-semibold shrink-0" style={{ color: FIT_COLOR[sel.fit] }}>
                      <i className="w-1.5 h-1.5 rounded-full" style={{ background: FIT_COLOR[sel.fit] }} />{FIT_LABEL[sel.fit]}
                    </span>
                  )}
                </span>
                {/* The trail and its climb, for the trek the tour opens */}
                {hasTrail && (
                  <span className="flex items-center gap-2 mt-2">
                    <svg viewBox="-0.08 -0.08 1.16 1.16" className="w-9 h-9 shrink-0 rounded-md" style={{ background: "rgba(255,255,255,0.04)" }} aria-hidden>
                      <polyline points={routePts} fill="none" stroke={AI_COLOR} strokeWidth={0.06} strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="md-draw" />
                      {/* Offline: your GPS position walking the trail */}
                      {offline && (
                        <circle r={0.07} fill="#60a5fa" stroke="#fff" strokeWidth={0.025}>
                          <animateMotion dur="4s" repeatCount="indefinite" path={`M${routePts.replaceAll(" ", " L")}`} />
                        </circle>
                      )}
                    </svg>
                    <span className="flex-1 min-w-0">
                      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="block w-full h-5" aria-hidden>
                        {(() => {
                          const lo = Math.min(...tour.profile), hi = Math.max(...tour.profile), n = Math.max(1, tour.profile.length - 1);
                          const pts = tour.profile.map((e, i) => `${(i / n) * 100},${22 - ((e - lo) / Math.max(1, hi - lo)) * 20}`).join(" ");
                          return <><polygon points={`0,24 ${pts} 100,24`} fill="rgba(255,179,122,0.18)" /><polyline points={pts} fill="none" stroke={AI_COLOR} strokeWidth={1.2} vectorEffect="non-scaling-stroke" /></>;
                        })()}
                      </svg>
                      <span className="block text-[9.5px] text-white/50 mt-0.5 tabular-nums">{tour.lengthKm} km · up to {tour.maxEleM.toLocaleString("en-IN")} m</span>
                    </span>
                  </span>
                )}
                {/* The trail file, for following it with no signal */}
                {hasTrail && (
                  <span className="flex items-center justify-between gap-2 mt-1.5">
                    <a
                      ref={gpxRef}
                      href={`/experiences/${sel.slug}/trail.gpx`}
                      download
                      onClick={() => { takeOver(); setOffline(true); }}
                      className="md-hit inline-flex items-center gap-1 text-[10px] font-semibold px-2 h-6 rounded-full transition-colors"
                      style={offline ? { background: "rgba(16,185,129,0.18)", color: "#34d399" } : { background: "rgba(255,255,255,0.08)", color: "#fff" }}
                    >
                      <Download className="w-3 h-3" />{offline ? "GPX saved" : "GPX"}
                    </a>
                    <Link href="/adventurepedia/offline-maps" className="text-[9.5px] text-white/50 hover:text-white truncate">
                      {offline ? "Works with no signal" : "Follow it offline"}
                    </Link>
                  </span>
                )}
                <span className="flex items-center justify-between gap-2 mt-2">
                  {sel.price ? (
                    <span className="min-w-0 text-[10px] text-white/60 whitespace-nowrap" title="Lowest price from a verified operator">
                      <b className="text-white text-[12px]">{inr(sel.price)}</b>
                      {sel.verified > 0 && <span className="inline-flex items-center gap-0.5 ml-1"><BadgeCheck className="w-3 h-3 text-emerald-400" />{sel.verified}</span>}
                    </span>
                  ) : <span className="text-[10px] text-white/45">Sample spot</span>}
                  <span className="flex items-center gap-1 shrink-0">
                    <button
                      ref={compareRef}
                      type="button"
                      onClick={() => { takeOver(); setCompared((c) => (c === sel.slug ? null : sel.slug)); }}
                      aria-label={compared === sel.slug ? "Remove from compare" : "Add to compare"}
                      className="md-hit w-6 h-6 rounded-full grid place-items-center transition-colors"
                      style={compared === sel.slug ? { background: "#ff5100", color: "#fff" } : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
                    >
                      <GitCompare className="w-3 h-3" />
                    </button>
                    <Link href={sel.href} className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 h-6 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                      View <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </span>
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Tour caption, progress, and the way into the real map */}
        <div className="flex items-center gap-3 mt-2.5 px-0.5">
          <div className="flex-1 min-w-0">
            {touring ? (
              <>
                <p key={step} className="md-cap text-[12px] font-semibold text-white/90 truncate">
                  <span className="tabular-nums mr-1.5" style={{ color: "#7edc96" }}>0{step + 1}</span>
                  {BEATS[step].caption}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {BEATS.map((_, i) => (
                    <span key={i} className="h-1 rounded-full transition-all duration-500" style={{ width: i === step ? 16 : 5, background: i === step ? "#7edc96" : "rgba(255,255,255,0.15)" }} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-[12px] text-white/55 truncate">Your turn.</p>
                <button type="button" onClick={replay} className="text-[11px] font-semibold text-[#7edc96] hover:underline">Replay tour</button>
              </>
            )}
          </div>
          <Link ref={ctaRef} href={cta.href} className="md-cta group shrink-0 inline-flex items-center gap-1.5 h-8 pl-3 pr-3 rounded-full text-[12px] font-semibold" data-hot={ctaHot || undefined}>
            <MapIcon className="w-3.5 h-3.5" />
            {cta.label}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* The tour's pointer — moved with a composited transform */}
      {touring && cursor && (
        <span className="md-cursor absolute left-0 top-0 z-20 pointer-events-none" style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }} aria-hidden>
          <span key={cursor.click} className="md-ripple" />
          <MousePointer2 className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" fill="#111" strokeWidth={1.6} />
        </span>
      )}

      <style>{`
        .md-shell { background: linear-gradient(165deg, #121a18 0%, #0b100f 100%);
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 30px 70px rgba(0,0,0,0.35), 0 0 0 1px rgba(126,220,150,0.04), inset 0 1px 0 rgba(255,255,255,0.05); }
        .md-ask { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); transition: border-color .35s, box-shadow .35s; }
        .md-ask:hover { border-color: rgba(255,179,122,0.4); }
        .md-ask[data-on] { border-color: rgba(255,179,122,0.6); box-shadow: 0 0 18px rgba(255,125,71,0.25); }
        .md-caret { display: inline-block; width: 1.5px; height: 12px; margin-left: 1px; vertical-align: -2px; background: ${AI_COLOR}; animation: mdBlink 0.9s steps(1) infinite; }
        @keyframes mdBlink { 50% { opacity: 0; } }
        .md-chip { padding: 6px 6px; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap;
                   color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
                   transition: color .35s, background .35s, border-color .35s, box-shadow .35s; }
        .md-chip:hover { color: #fff; }
        /* Small controls get a finger-sized hit area without growing */
        .md-hit:not(.absolute) { position: relative; }
        .md-hit::after { content: ""; position: absolute; inset: -9px -3px; }
        .md-chip[data-on] { color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent);
                            border-color: color-mix(in srgb, var(--c) 65%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--c) 30%, transparent); }
        .md-map { container-type: inline-size; isolation: isolate; background: radial-gradient(120% 90% at 50% 35%, #12201d 0%, #0a1110 70%);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 60px rgba(0,0,0,0.55); }
        .md-sea { position: absolute; inset: -10% -30% -10% -10%; pointer-events: none; will-change: transform;
                  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='22'><path d='M0 11 Q12 5 24 11 T48 11' fill='none' stroke='%235fe0d4' stroke-opacity='0.14' stroke-width='0.8'/></svg>");
                  background-size: 48px 22px; animation: mdSea 8s linear infinite; }
        @keyframes mdSea { to { transform: translate3d(-48px, 0, 0); } }
        .md-base { position: absolute; left: 0; top: 0; width: 100%; height: 100%; transform-origin: 0 0; pointer-events: none; backface-visibility: hidden; }
        .md-scan { position: absolute; top: 0; bottom: 0; left: 0; width: 70px; pointer-events: none; opacity: 0; will-change: transform;
                   background: linear-gradient(90deg, transparent, rgba(126,220,150,0.16) 70%, rgba(190,255,210,0.65) 98%, transparent);
                   animation-name: mdScan; animation-timing-function: cubic-bezier(0.45,0,0.55,1); animation-fill-mode: both; }
        @keyframes mdScan { 0% { transform: translate3d(-70px,0,0); opacity: 1; } 90% { opacity: 1; } 100% { transform: translate3d(100cqw,0,0); opacity: 0; } }
        .md-region { color: rgba(255,255,255,0.16); text-shadow: 0 0 30px rgba(0,0,0,0.4); transition: opacity .5s ease;
                     animation: mdRegion 0.9s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes mdRegion { from { letter-spacing: 0.6em; opacity: 0; } to { letter-spacing: 0.28em; } }
        .md-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: mdDraw 1.4s 0.2s cubic-bezier(0.6,0,0.2,1) forwards; }
        @keyframes mdDraw { to { stroke-dashoffset: 0; } }
        .md-cta { color: #07160b; background: #5fb873; transition: background .3s, box-shadow .3s, transform .3s; }
        .md-cta:hover { background: #7fd692; }
        .md-cta[data-hot] { background: #7fd692; animation: mdCtaPulse 1.4s ease-out infinite; }
        @keyframes mdCtaPulse { 0% { box-shadow: 0 0 0 0 rgba(127,214,146,0.55); } 100% { box-shadow: 0 0 0 10px rgba(127,214,146,0); } }
        .md-card { animation: mdIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes mdIn { from { opacity: 0; transform: translateY(8px) scale(0.96); } to { opacity: 1; transform: none; } }
        .md-cap, .md-badge { animation: mdIn 0.4s ease both; }
        .md-cursor { transition: transform 0.9s cubic-bezier(0.65,0,0.35,1); will-change: transform; margin: -2px 0 0 -3px; }
        .md-ripple { position: absolute; left: -9px; top: -9px; width: 22px; height: 22px; border-radius: 50%;
                     border: 2px solid rgba(255,255,255,0.8); opacity: 0; animation: mdRipple 0.6s ease-out 0.9s; }
        @keyframes mdRipple { from { transform: scale(0.3); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .md-cursor { transition-duration: 0.01ms; }
          .md-ripple, .md-sea, .md-scan, .md-region, .md-cta[data-hot], .md-caret { animation: none; }
          .md-draw { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
