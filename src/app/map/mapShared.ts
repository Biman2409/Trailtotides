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
// Both styles are OpenStreetMap data and keyless. "Default" is OpenFreeMap's dark vector style,
// drawn by MapLibre inside Leaflet, with hillshade from the public Terrarium elevation tiles so the
// Himalaya and the Ghats read as relief — mountain to ocean, in the hero's palette. "Terrain" is
// OpenTopoMap (OSM plus SRTM contours). Every style's credit is shown, as the licences require.

const OSM_CREDIT = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
const OPENFREEMAP_CREDIT = `<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · ${OSM_CREDIT}`;
const TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

export interface BaseStyle {
  label: string;
  maxZoom: number;
  attribution: string;
  /** A MapLibre style (vector, drawn by MapLibre) … */
  style?: string;
  /** … or a raster tile URL (drawn by Leaflet) */
  url?: string;
  dark?: boolean;
}

export type LayerKey = "map" | "terrain";

export const BASE_LAYERS: Record<LayerKey, BaseStyle> = {
  map: {
    label: "Default",
    style: "https://tiles.openfreemap.org/styles/dark",
    dark: true,
    maxZoom: 16,
    attribution: `${OPENFREEMAP_CREDIT} · Elevation: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Terrain Tiles</a>`,
  },
  terrain: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    maxZoom: 17,
    attribution: `${OSM_CREDIT}, SRTM · Style © <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA)`,
  },
};

/** A light counterpart to Default, for maps that follow the site's light theme */
export const LIGHT_BASE: BaseStyle = {
  label: "Light",
  style: "https://tiles.openfreemap.org/styles/positron",
  dark: false,
  maxZoom: 16,
  attribution: BASE_LAYERS.map.attribution,
};

/** Builds a base layer for any style. Vector styles load MapLibre on first use. Add it with addBaseLayer. */
export async function createBaseLayer(leaflet: typeof L, cfg: BaseStyle, className = "tm-base"): Promise<L.Layer> {
  if (cfg.url) {
    return leaflet.tileLayer(cfg.url, { maxZoom: cfg.maxZoom, maxNativeZoom: cfg.maxZoom, attribution: cfg.attribution, className });
  }
  await loadMapLibre(leaflet);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layer = (leaflet as any).maplibreGL({ style: cfg.style, interactive: false, attributionControl: false });
  // MapLibre's own attribution box is off; Leaflet's control shows the credit instead
  layer.getAttribution = () => cfg.attribution;
  layer.on("add", () => tuneStyle(layer.getMaplibreMap(), !!cfg.dark));
  return layer;
}

// English labels (the styles show local scripts beside them) and shaded relief under the labels,
// from the Terrarium elevation tiles (public, keyless)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tuneStyle(gl: any, dark: boolean) {
  const add = () => {
    if (gl.getSource("ttt-dem")) return;
    for (const l of gl.getStyle().layers) {
      const field = l.layout?.["text-field"];
      if (field && JSON.stringify(field).includes("name:nonlatin")) {
        gl.setLayoutProperty(l.id, "text-field", ["coalesce", ["get", "name_en"], ["get", "name:latin"], ["get", "name"]]);
      }
    }
    gl.addSource("ttt-dem", { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstLabel = gl.getStyle().layers.find((l: any) => l.type === "symbol")?.id;
    gl.addLayer({
      id: "ttt-hillshade", type: "hillshade", source: "ttt-dem",
      paint: dark
        ? { "hillshade-exaggeration": 0.55, "hillshade-shadow-color": "#000000", "hillshade-highlight-color": "rgba(255,255,255,0.16)", "hillshade-accent-color": "#000000" }
        : { "hillshade-exaggeration": 0.35, "hillshade-shadow-color": "#6b6b6b", "hillshade-highlight-color": "#ffffff", "hillshade-accent-color": "#8a8a8a" },
    }, firstLabel);
  };
  // "style.load" fires once the style is parsed; "load" waits for a full first render, which can
  // take a while (or not come) while tiles keep streaming in
  if (gl.isStyleLoaded()) add(); else gl.once("style.load", add);
}

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

// MapLibre (draws the OpenFreeMap vector styles) and its Leaflet bridge. Loaded only when a vector
// style is first shown, after Leaflet. 5.x is the last line with a classic script build, which the bridge needs.
let maplibrePromise: Promise<void> | null = null;

export function loadMapLibre(leaflet: typeof L): Promise<void> {
  if (maplibrePromise) return maplibrePromise;
  loadCss("https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css");
  maplibrePromise = loadScript("https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js")
    .then(() => {
      // The bridge attaches L.maplibreGL to whatever window.L is when it runs: make that our Leaflet
      window.L = leaflet;
      return loadScript("https://unpkg.com/@maplibre/maplibre-gl-leaflet@0.1.4/leaflet-maplibre-gl.js");
    });
  return maplibrePromise;
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
