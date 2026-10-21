// Shared pieces of the Adventure Map: tiles, genre colours, the Leaflet loader and the small
// helpers the canvas, the list and the pin card all use. No React here.
import type L from "leaflet";
import type { Adventure, AdventureType, Month } from "@/lib/data";
import { getLowestPrice } from "@/lib/data";
import { GENRE_GROUPS } from "@/lib/filterOptions";
import { getACE, computeDifficulty, type ACE } from "@/lib/ace";
import { matchScore, bucketFor, gapsFor, weeksToReady, type Bucket, type Gap, type GroupMember } from "@/lib/fitness";
import { DIFFICULTY_CONFIG } from "@/components/ui/custom/DifficultyMeter";

declare global { interface Window { L: typeof L } }

// ── Tiles ─────────────────────────────────────────────────────────────────────
// Two styles, both keyless. "Default" is a dark canvas with dark hillshade blended over it, so the
// Himalaya and the Ghats read as relief — mountain to ocean, in the hero's palette.

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";

export type LayerKey = "map" | "terrain";

export const BASE_LAYERS: Record<LayerKey, { label: string; url: string; maxZoom: number; relief?: string; labels?: string }> = {
  map: {
    label: "Default",
    url: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    relief: `${ESRI}/Elevation/World_Hillshade_Dark/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
    maxZoom: 16,
  },
  terrain: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    maxZoom: 17,
  },
};

export const INDIA_CENTER: [number, number] = [22.5, 80.0];
export const INDIA_ZOOM = 5;
/** Mainland India plus the Himalayan arc, for fitting the whole country into the visible map */
export const INDIA_BOUNDS: [[number, number], [number, number]] = [[7.5, 68.5], [35.5, 97]];

// ── Leaflet loader ────────────────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded) { resolve(); return; }
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => { s.dataset.loaded = "1"; resolve(); };
    document.head.appendChild(s);
  });
}

function loadCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

let leafletPromise: Promise<typeof L> | null = null;

export function loadLeaflet(): Promise<typeof L> {
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    loadCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css");
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
      .then(() => loadScript("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"))
      .then(() => resolve(window.L));
  });
  return leafletPromise;
}

// ── Genres ────────────────────────────────────────────────────────────────────
// The same tints as the words that scatter across the home hero, ordered mountain → ocean.

export type GenreKey = "Earth" | "Snow" | "Air" | "Water";

export const GENRES: { key: GenreKey; label: string; color: string; glow: string; types: AdventureType[] }[] = (
  [
    { key: "Earth", label: "Earth", color: "#ff9a66", glow: "rgba(255,154,102,0.45)" },
    { key: "Snow", label: "Snow", color: "#b9c3ff", glow: "rgba(185,195,255,0.45)" },
    { key: "Air", label: "Air", color: "#ffd27a", glow: "rgba(255,210,122,0.45)" },
    { key: "Water", label: "Water", color: "#6ff0e0", glow: "rgba(111,240,224,0.45)" },
  ] as const
).map((g) => ({ ...g, types: GENRE_GROUPS.find((x) => x.label === g.key)?.types ?? [] }));

const GENRE_BY_TYPE = new Map<string, (typeof GENRES)[number]>(GENRES.flatMap((g) => g.types.map((t) => [t, g] as const)));

export function genreOf(type: AdventureType) {
  return GENRE_BY_TYPE.get(type) ?? GENRES[0];
}

// ── Difficulty, price, operators ──────────────────────────────────────────────

/** Same ACE-derived difficulty the cards and detail pages show, not the raw data field */
export function difficultyOf(a: Adventure): string {
  return computeDifficulty(getACE(a));
}

export function difficultyColor(d: string): string {
  return DIFFICULTY_CONFIG[d as keyof typeof DIFFICULTY_CONFIG]?.color ?? "#94a3b8";
}

export const verifiedOperators = (a: Adventure) => (a.operators ?? []).filter((o) => o.verified);

export function hasVerified(a: Adventure) {
  return verifiedOperators(a).length > 0;
}

/** Lowest price among verified operators, falling back to any operator */
export function priceFrom(a: Adventure): number | null {
  const v = verifiedOperators(a);
  return getLowestPrice({ operators: v.length ? v : a.operators ?? [] });
}

export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function daysAgo(iso?: string): number | null {
  if (!iso) return null;
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return Number.isNaN(d) || d < 0 ? null : d;
}

// ── Season ────────────────────────────────────────────────────────────────────

export function inSeason(a: Adventure, month: Month | null) {
  return !month || a.bestMonths.includes(month);
}

// ── Fit: for one person, or for a whole group (the group moves at its weakest member) ──

export interface Fit {
  score: number;
  bucket: Bucket;
  gaps: Gap[];
  weeks: number;
  /** For a group: who the group waits on */
  weakest?: string;
}

export function fitFor(a: Adventure, ace: ACE | null, group: GroupMember[] | null): Fit | null {
  if (group && group.length) {
    const scores = group.map((m) => matchScore(m.ace, a));
    const score = Math.min(...scores);
    const w = group[scores.indexOf(score)];
    const gaps = gapsFor(w.ace, a);
    return { score, bucket: bucketFor(score), gaps, weeks: weeksToReady(gaps), weakest: w.name };
  }
  if (!ace) return null;
  const score = matchScore(ace, a);
  const gaps = gapsFor(ace, a);
  return { score, bucket: bucketFor(score), gaps, weeks: weeksToReady(gaps) };
}

// ── Distance ──────────────────────────────────────────────────────────────────

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Escape text going into Leaflet's raw-HTML tooltips and popups */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
