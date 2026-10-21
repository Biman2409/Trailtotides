"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type L from "leaflet";
import type { GeoJsonObject } from "geojson";
import type { Adventure, Month } from "@/lib/data";
import { typeIconSvg } from "@/lib/mapMarkerIcons";
import {
  BASE_LAYERS, INDIA_CENTER, INDIA_ZOOM, INDIA_BOUNDS, loadLeaflet, inSeason, esc,
  difficultyOf, difficultyColor, priceFrom, formatINR, verifiedOperators,
  type LayerKey, type Fit,
} from "./mapShared";

// The Leaflet side of the map. Leaflet owns the DOM inside this div; React state comes in
// through props and is pushed onto layers and marker icons in effects.

export interface UserPhoto {
  id: string;
  slug: string;
  url: string;
  caption: string;
  created_at: string;
  lat: number;
  lng: number;
  adventureName: string;
}

export interface CompletedAdventure { adv: Adventure; date: string }

/** Imperative handles the page uses (search results, list clicks, Compass, Reset) */
export interface MapApi {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  focus: (slug: string) => void;
  fitTo: (slugs: string[]) => void;
  reset: () => void;
  placePin: (lat: number, lng: number, name: string) => void;
}

/** Screen space the overlays cover, so focusing and "in view" use the map you can actually see */
export interface Insets { left: number; bottom: number }

interface Props {
  adventures: Adventure[];
  fits: Map<string, Fit | null>;
  month: Month | null;
  picks: Set<string>;
  selected: string | null;
  /** A list row under the pointer: its pin lights up */
  hovered: string | null;
  wishlist: Set<string>;
  layer: LayerKey;
  insets: Insets;
  nearMe: { lat: number; lng: number } | null;
  /** Near me radius in km, drawn as a ring around you */
  radiusKm: number | null;
  userPhotos: UserPhoto[];
  completed: CompletedAdventure[];
  apiRef: React.MutableRefObject<MapApi | null>;
  onSelect: (slug: string) => void;
  onViewChange: (inView: Set<string>) => void;
}

const TROPHY_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1200" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;

// Module-level cache for the India outline (survives re-mounts)
let indiaGeoCache: GeoJsonObject | null = null;

// Pins are coloured by difficulty (the same colours as the cards), so the map reads as a
// heatmap of how hard each region is; the icon inside still says what kind of adventure it is.
function pinHtml(a: Adventure, s: { fit: Fit | null | undefined; off: boolean; pick: boolean; selected: boolean; hovered: boolean; saved: boolean }) {
  const c = difficultyColor(difficultyOf(a));
  const cls = ["tm-pin", s.fit ? "has-fit" : "", s.off ? "off" : "", s.pick ? "pick" : "", s.selected ? "sel" : "", s.hovered ? "hov" : ""].filter(Boolean).join(" ");
  return `<div class="${cls}" style="--g:${c};--glow:${c}73;--ring:${s.fit?.bucket.color ?? "transparent"}">
    <span class="tm-pin-core">${typeIconSvg(a.type, 13, "#ffffff")}</span>
    ${s.saved ? '<span class="tm-pin-saved"></span>' : ""}
  </div>`;
}

const DIFFICULTY_BY_LEVEL = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];

// Hovering a pin shows a small card, so the map can be scanned without opening each one
function peekHtml(a: Adventure) {
  const diff = difficultyOf(a);
  const price = priceFrom(a);
  const v = verifiedOperators(a).length;
  return `<div class="tm-peek">
    <img src="${esc(a.heroImage)}" alt="" loading="lazy" />
    <div class="tm-peek-body">
      <b>${esc(a.name)}</b>
      <span>${esc(a.type)} · ${esc(a.durationDays)} · <em style="color:${difficultyColor(diff)}">${esc(diff)}</em></span>
      <span class="tm-peek-foot">${price !== null ? `from <strong>${formatINR(price)}</strong>` : ""}${v ? `<i>✓ ${v} verified</i>` : ""}</span>
    </div>
  </div>`;
}

export default function MapCanvas(props: Props) {
  // onSelect and onViewChange are read through `live` by Leaflet handlers bound once
  const { adventures: advs, fits, month, picks, selected, hovered, wishlist, layer, insets, nearMe, radiusKm, userPhotos, completed, apiRef } = props;
  const router = useRouter();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const clusterRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileRefs = useRef<L.TileLayer[]>([]);
  const photoRef = useRef<L.LayerGroup | null>(null);
  const placeRef = useRef<L.LayerGroup | null>(null);
  const meRef = useRef<L.LayerGroup | null>(null);
  const trophyRef = useRef<L.LayerGroup | null>(null);
  /** Slug of the pin currently taken out of its cluster */
  const loose = useRef<string | null>(null);

  // Latest props for Leaflet event handlers, which are bound once
  const live = useRef(props);
  live.current = props;

  // ── Helpers that need the live map ──────────────────────────────────────────

  function visibleBounds(map: L.Map, leaflet: typeof L): L.LatLngBounds {
    const size = map.getSize();
    const { left, bottom } = live.current.insets;
    const nw = map.containerPointToLatLng(leaflet.point(Math.min(left, size.x - 40), 0));
    const se = map.containerPointToLatLng(leaflet.point(size.x, Math.max(40, size.y - bottom)));
    return leaflet.latLngBounds(nw, se);
  }

  function reportView() {
    const map = mapRef.current, leaflet = leafletRef.current;
    if (!map || !leaflet) return;
    const b = visibleBounds(map, leaflet);
    live.current.onViewChange(new Set(live.current.adventures.filter((a) => b.contains([a.lat, a.lng])).map((a) => a.slug)));
  }

  /** Centre a point in the part of the map the overlays leave uncovered */
  function centreOn(lat: number, lng: number, zoom: number) {
    const map = mapRef.current, leaflet = leafletRef.current;
    if (!map || !leaflet) return;
    const { left, bottom } = live.current.insets;
    const p = map.project([lat, lng], zoom).subtract(leaflet.point(left / 2, -bottom / 2));
    map.flyTo(map.unproject(p, zoom), zoom, { duration: 1 });
  }

  /** All of India, inside the part of the map the panel and sheet leave uncovered */
  function fitIndia(animate: boolean) {
    const map = mapRef.current;
    if (!map) return;
    const { left, bottom } = live.current.insets;
    const opts = { paddingTopLeft: [left + 16, 16] as [number, number], paddingBottomRight: [16, bottom + 16] as [number, number] };
    if (animate) map.flyToBounds(INDIA_BOUNDS, { ...opts, duration: 1.1 });
    else map.fitBounds(INDIA_BOUNDS, opts);
  }

  function iconFor(a: Adventure) {
    const p = live.current;
    const leaflet = leafletRef.current!;
    return leaflet.divIcon({
      className: "",
      html: pinHtml(a, {
        fit: p.fits.get(a.slug),
        off: !inSeason(a, p.month),
        pick: p.picks.has(a.slug),
        selected: p.selected === a.slug,
        hovered: p.hovered === a.slug,
        saved: p.wishlist.has(a.slug),
      }),
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }

  // ── Imperative API ──────────────────────────────────────────────────────────

  useEffect(() => {
    apiRef.current = {
      flyTo: (lat, lng, zoom = 10) => centreOn(lat, lng, zoom),
      focus: (slug) => {
        const a = live.current.adventures.find((x) => x.slug === slug);
        const map = mapRef.current;
        if (!a || !map) return;
        centreOn(a.lat, a.lng, Math.max(map.getZoom(), 8));
      },
      fitTo: (slugs) => {
        const map = mapRef.current, leaflet = leafletRef.current;
        const pts = live.current.adventures.filter((a) => slugs.includes(a.slug)).map((a) => [a.lat, a.lng] as [number, number]);
        if (!map || !leaflet || !pts.length) return;
        const { left, bottom } = live.current.insets;
        map.flyToBounds(leaflet.latLngBounds(pts), {
          paddingTopLeft: [left + 60, 80], paddingBottomRight: [60, bottom + 60], maxZoom: 8, duration: 1.1,
        });
      },
      reset: () => fitIndia(true),
      placePin: (lat, lng, name) => {
        const leaflet = leafletRef.current, layer = placeRef.current;
        if (!leaflet || !layer) return;
        layer.clearLayers();
        const icon = leaflet.divIcon({ className: "", html: '<div class="tm-place"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
        leaflet.marker([lat, lng], { icon })
          .bindTooltip(esc(name), { direction: "top", offset: [0, -10], className: "tm-tip", permanent: true })
          .addTo(layer);
      },
    };
  });

  // ── Create the map once ─────────────────────────────────────────────────────

  useEffect(() => {
    const container = elRef.current;
    if (!container) return;
    const markers = markersRef.current;
    let cancelled = false;
    loadLeaflet().then((leaflet) => {
      if (cancelled || !container) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(container, {
        // maxZoom up front: the cluster layer needs it before any tiles are added
        center: INDIA_CENTER, zoom: INDIA_ZOOM, minZoom: 4, maxZoom: 16,
        zoomControl: false, attributionControl: false, zoomSnap: 0.5,
      });
      leaflet.control.zoom({ position: "topright" }).addTo(map);
      mapRef.current = map;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (leaflet as any).markerClusterGroup({
        maxClusterRadius: 44,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconCreateFunction: (c: any) => {
          const n = c.getChildCount();
          const size = n >= 20 ? 44 : 38;
          // The ring takes the average difficulty inside, so the zoomed-out map still reads as a difficulty map
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const levels: number[] = c.getAllChildMarkers().map((m: any) => m.options.level ?? 3);
          const avg = Math.round(levels.reduce((s, l) => s + l, 0) / Math.max(1, levels.length));
          const ring = difficultyColor(DIFFICULTY_BY_LEVEL[avg - 1] ?? "Hard");
          return leaflet.divIcon({ className: "", html: `<div class="tm-cluster" style="width:${size}px;height:${size}px;--ring:${ring}">${n}</div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
        },
      });
      map.addLayer(cluster);
      clusterRef.current = cluster;
      photoRef.current = leaflet.layerGroup().addTo(map);
      trophyRef.current = leaflet.layerGroup().addTo(map);
      placeRef.current = leaflet.layerGroup().addTo(map);
      meRef.current = leaflet.layerGroup().addTo(map);

      const outline = (data: GeoJsonObject) =>
        leaflet.geoJSON(data, { style: { color: "#ffffff", weight: 1, opacity: 0.22, fillColor: "#ff5100", fillOpacity: 0.025 }, interactive: false }).addTo(map);
      if (indiaGeoCache) outline(indiaGeoCache);
      else fetch("/india-boundary.geojson").then((r) => r.json()).then((d) => { indiaGeoCache = d; if (mapRef.current === map) outline(d); }).catch(() => {});

      map.on("moveend", reportView);
      map.on("resize", reportView);

      setTiles(live.current.layer);
      buildMarkers();
      fitIndia(false);
      reportView();
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tiles ───────────────────────────────────────────────────────────────────

  function setTiles(key: LayerKey) {
    const map = mapRef.current, leaflet = leafletRef.current;
    if (!map || !leaflet) return;
    tileRefs.current.forEach((t) => map.removeLayer(t));
    const cfg = BASE_LAYERS[key];
    map.setMaxZoom(cfg.maxZoom);
    const opts = { maxZoom: cfg.maxZoom, maxNativeZoom: cfg.maxZoom };
    tileRefs.current = [
      leaflet.tileLayer(cfg.url, { ...opts, className: "tm-base" }),
      ...(cfg.relief ? [leaflet.tileLayer(cfg.relief, { ...opts, className: "tm-relief" })] : []),
      ...(cfg.labels ? [leaflet.tileLayer(cfg.labels, { ...opts, className: "tm-labels" })] : []),
    ];
    tileRefs.current.forEach((t) => t.addTo(map));
  }

  useEffect(() => { setTiles(layer); }, [layer]);

  // ── Adventure pins ──────────────────────────────────────────────────────────

  function buildMarkers() {
    const leaflet = leafletRef.current, cluster = clusterRef.current, map = mapRef.current;
    if (!leaflet || !cluster || !map) return;
    cluster.clearLayers();
    // A pin pulled out of its cluster for the selection is on the map directly
    markersRef.current.forEach((m) => { if (map.hasLayer(m)) map.removeLayer(m); });
    markersRef.current.clear();
    loose.current = null;
    for (const a of live.current.adventures) {
      // level: 1 (Easy) to 5 (Extreme), read by the cluster icon
      const opts = { icon: iconFor(a), riseOnHover: true, level: DIFFICULTY_BY_LEVEL.indexOf(difficultyOf(a)) + 1 || 3 } as L.MarkerOptions;
      const m = leaflet.marker([a.lat, a.lng], opts)
        .bindTooltip(peekHtml(a), { direction: "top", offset: [0, -18], className: "tm-tip tm-tip-peek", opacity: 1 });
      m.on("click", () => live.current.onSelect(a.slug));
      cluster.addLayer(m);
      markersRef.current.set(a.slug, m);
    }
  }

  // The set of pins changes: rebuild. Only their look changes: swap icons in place.
  useEffect(() => { buildMarkers(); reportView(); }, [advs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    for (const a of advs) {
      const m = markersRef.current.get(a.slug);
      if (!m || !leafletRef.current) continue;
      m.setIcon(iconFor(a));
      m.setZIndexOffset(selected === a.slug || hovered === a.slug ? 1000 : picks.has(a.slug) ? 500 : inSeason(a, month) ? 0 : -500);
    }
  }, [fits, month, picks, selected, hovered, wishlist]); // eslint-disable-line react-hooks/exhaustive-deps

  // A hovered row whose pin is folded into a cluster lights up that cluster instead
  const hovCluster = useRef<HTMLElement | null>(null);
  useEffect(() => {
    hovCluster.current?.classList.remove("hov");
    hovCluster.current = null;
    const m = hovered ? markersRef.current.get(hovered) : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parent = m && (clusterRef.current as any)?.getVisibleParent?.(m);
    if (parent && parent !== m) {
      const el = (parent as L.Marker).getElement()?.querySelector<HTMLElement>(".tm-cluster") ?? null;
      el?.classList.add("hov");
      hovCluster.current = el;
    }
  }, [hovered]);

  // The selected pin leaves its cluster so it's always on show; it goes back when deselected
  useEffect(() => {
    const map = mapRef.current, cluster = clusterRef.current;
    if (!map || !cluster) return;
    if (loose.current && loose.current !== selected) {
      const m = markersRef.current.get(loose.current);
      if (m) { map.removeLayer(m); cluster.addLayer(m); }
      loose.current = null;
    }
    if (selected && loose.current !== selected) {
      const m = markersRef.current.get(selected);
      if (m) { cluster.removeLayer(m); m.addTo(map); loose.current = selected; }
    }
  }, [selected, advs]);

  // Overlays covering a different share of the map change what "in view" means
  useEffect(() => { reportView(); }, [insets.left, insets.bottom]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── You are here ────────────────────────────────────────────────────────────

  useEffect(() => {
    const leaflet = leafletRef.current, layer = meRef.current;
    if (!leaflet || !layer) return;
    layer.clearLayers();
    if (!nearMe) return;
    if (radiusKm) {
      const ring = leaflet.circle([nearMe.lat, nearMe.lng], {
        radius: radiusKm * 1000, color: "#38bdf8", weight: 1.5, opacity: 0.7, dashArray: "4 6",
        fillColor: "#38bdf8", fillOpacity: 0.06, interactive: false,
      }).addTo(layer);
      // Frame the whole ring in the uncovered part of the map
      const map = mapRef.current;
      const { left, bottom } = live.current.insets;
      map?.flyToBounds(ring.getBounds(), { paddingTopLeft: [left + 24, 24], paddingBottomRight: [24, bottom + 24], duration: 0.9 });
    }
    const icon = leaflet.divIcon({ className: "", html: '<div class="tm-me"><i></i></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
    leaflet.marker([nearMe.lat, nearMe.lng], { icon, zIndexOffset: 2000 })
      .bindTooltip("You are here", { direction: "top", offset: [0, -10], className: "tm-tip" })
      .addTo(layer);
  }, [nearMe, radiusKm]);

  // ── Trip photos ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const leaflet = leafletRef.current, layer = photoRef.current;
    if (!leaflet || !layer) return;
    layer.clearLayers();
    for (const photo of userPhotos) {
      const alt = esc(photo.caption || photo.adventureName);
      const icon = leaflet.divIcon({
        className: "",
        html: `<div class="tm-photo"><img src="${esc(photo.url)}" alt="${alt}" /></div>`,
        iconSize: [44, 44], iconAnchor: [22, 22],
      });
      const html = `<div class="tm-pop">
          <img src="${esc(photo.url)}" alt="${alt}" />
          <div class="tm-pop-body">
            <b>${esc(photo.adventureName)}</b>
            ${photo.caption ? `<span>${esc(photo.caption)}</span>` : ""}
            <button data-nav="/experiences/${esc(photo.slug)}">See the adventure →</button>
          </div>
        </div>`;
      const m = leaflet.marker([photo.lat, photo.lng], { icon }).bindPopup(html, { className: "tm-popup", maxWidth: 240, minWidth: 240 });
      // Popups are raw HTML outside React; route through Next's router instead of a full reload
      m.on("popupopen", () => {
        const el = m.getPopup()?.getElement()?.querySelector<HTMLElement>("[data-nav]");
        if (el) el.onclick = () => router.push(el.dataset.nav!);
      });
      layer.addLayer(m);
    }
  }, [userPhotos, router]);

  // ── Adventure Passport: completed adventures as gold trophies ───────────────

  useEffect(() => {
    const leaflet = leafletRef.current, layer = trophyRef.current;
    if (!leaflet || !layer) return;
    layer.clearLayers();
    for (const { adv, date } of completed) {
      const dateStr = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const icon = leaflet.divIcon({ className: "", html: `<div class="tm-trophy">${TROPHY_SVG}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] });
      const m = leaflet.marker([adv.lat, adv.lng], { icon, zIndexOffset: 1500 })
        .bindTooltip(`<b>${esc(adv.name)}</b><span>Completed ${dateStr}</span>`, { direction: "top", offset: [0, -16], className: "tm-tip" });
      m.on("click", () => live.current.onSelect(adv.slug));
      layer.addLayer(m);
    }
  }, [completed]);

  return (
    <>
      <div ref={elRef} className="tm-map w-full h-full" />
      <style>{MAP_CSS}</style>
    </>
  );
}

const MAP_CSS = `
  .tm-map { background: #0b0d10; }
  /* Hillshade over the dark canvas: soft-light keeps flat ground as is and lifts the ranges */
  .tm-map .tm-relief { mix-blend-mode: soft-light; opacity: 0.9; }
  .tm-map .tm-labels { opacity: 0.75; }

  .tm-pin { position: relative; width: 34px; height: 34px; display: grid; place-items: center; transition: transform .25s cubic-bezier(.2,1.4,.4,1), opacity .35s, filter .35s; }
  .tm-pin-core { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
                 /* a light sheen only, so the white icon keeps its contrast */
                 background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--g) 82%, #fff), var(--g) 70%);
                 box-shadow: 0 0 0 2px rgba(11,13,16,0.92), 0 0 16px var(--glow), 0 4px 10px rgba(0,0,0,0.55); }
  .tm-pin.has-fit::before { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2.5px solid var(--ring); box-shadow: 0 0 10px color-mix(in srgb, var(--ring) 60%, transparent); }
  .tm-pin:hover, .tm-pin.sel, .tm-pin.hov { transform: scale(1.22); }
  .tm-pin.hov .tm-pin-core { box-shadow: 0 0 0 2px rgba(255,255,255,0.85), 0 0 24px var(--glow), 0 4px 12px rgba(0,0,0,0.6); }
  .tm-pin.off.hov { opacity: 0.9; filter: none; }
  .tm-pin.sel .tm-pin-core { box-shadow: 0 0 0 2px #fff, 0 0 22px var(--glow), 0 4px 12px rgba(0,0,0,0.6); }
  .tm-pin.off { opacity: 0.32; filter: grayscale(0.85); }
  .tm-pin.off:hover, .tm-pin.off.sel { opacity: 0.9; filter: none; }
  /* Compass picks breathe an orange halo */
  .tm-pin.pick::after { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid #ff7d47; animation: tmPick 1.8s ease-out infinite; }
  @keyframes tmPick { from { transform: scale(0.8); opacity: 0.9; } to { transform: scale(1.6); opacity: 0; } }
  .tm-pin-saved { position: absolute; top: 1px; right: 1px; width: 9px; height: 9px; border-radius: 50%; background: #ff5100; box-shadow: 0 0 0 1.5px #0b0d10; }

  /* Clusters: dark glass with a warm ring, so they group pins without shouting over the map */
  .tm-cluster { border-radius: 50%; display: grid; place-items: center; color: #fff; font: 800 12.5px var(--font-dm-sans, 'DM Sans'), sans-serif;
                background: radial-gradient(circle at 35% 30%, rgba(40,44,50,0.96), rgba(17,20,24,0.96));
                border: 2px solid var(--ring, #ff9a66);
                box-shadow: 0 0 0 5px color-mix(in srgb, var(--ring, #ff9a66) 16%, transparent), 0 0 18px color-mix(in srgb, var(--ring, #ff9a66) 40%, transparent), 0 6px 18px rgba(0,0,0,0.55);
                transition: transform .2s; }
  .tm-cluster:hover { transform: scale(1.08); }
  .tm-cluster.hov { transform: scale(1.18); border-color: #fff; box-shadow: 0 0 0 6px rgba(255,255,255,0.15), 0 0 26px rgba(255,154,102,0.6), 0 6px 18px rgba(0,0,0,0.55); }

  .tm-me { position: relative; width: 22px; height: 22px; }
  .tm-me::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: rgba(56,189,248,0.35); animation: tmPulse 2s ease-out infinite; }
  .tm-me i { position: absolute; inset: 5px; border-radius: 50%; background: #38bdf8; border: 2px solid #fff; }
  @keyframes tmPulse { from { transform: scale(0.6); opacity: 0.8; } to { transform: scale(2.3); opacity: 0; } }
  .tm-place { width: 18px; height: 18px; border-radius: 50%; background: #38bdf8; border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(56,189,248,0.25), 0 3px 10px rgba(0,0,0,0.5); }
  .tm-trophy { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg,#f7cd3a,#eab308);
               box-shadow: 0 0 0 2px #fff, 0 0 18px rgba(234,179,8,0.6); }
  .tm-photo { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 3px solid #ff5100; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
  .tm-photo img, .tm-pop img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .tm-tip { background: rgba(11,13,16,0.94) !important; border: 1px solid rgba(255,255,255,0.12) !important; color: #fff !important; border-radius: 10px !important;
            padding: 6px 10px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.45) !important; font: 600 11px var(--font-dm-sans, 'DM Sans'), sans-serif !important; }
  .tm-tip b { display: block; font-size: 12px; }
  .tm-tip span { display: block; color: rgba(255,255,255,0.5); font-weight: 500; margin-top: 1px; }
  .tm-tip::before { border-top-color: rgba(11,13,16,0.94) !important; }
  .tm-tip-peek { padding: 0 !important; overflow: hidden; border-radius: 14px !important; }
  .tm-peek { display: flex; width: 250px; }
  .tm-peek img { width: 74px; height: 78px; object-fit: cover; flex-shrink: 0; }
  .tm-peek-body { min-width: 0; padding: 8px 10px; display: flex; flex-direction: column; justify-content: center; gap: 2px; white-space: normal; }
  .tm-peek-body b { font-size: 12.5px; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .tm-peek-body span { font-size: 10.5px; color: rgba(255,255,255,0.5); margin: 0; }
  .tm-peek-body em { font-style: normal; font-weight: 700; }
  .tm-peek-foot { display: flex; gap: 8px; align-items: baseline; margin-top: 2px !important; }
  .tm-peek-foot strong { color: #fff; font-size: 12px; }
  .tm-peek-foot i { font-style: normal; color: #6ff0e0; font-weight: 600; margin-left: 2px; }

  .tm-popup .leaflet-popup-content-wrapper { padding: 0; border-radius: 16px; overflow: hidden; background: #111418; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.55); }
  .tm-popup .leaflet-popup-content { margin: 0; width: 240px !important; }
  .tm-popup .leaflet-popup-tip-container { display: none; }
  .tm-pop img { height: 140px; }
  .tm-pop-body { padding: 10px 12px 12px; font-family: var(--font-dm-sans, 'DM Sans'), sans-serif; color: #fff; }
  .tm-pop-body b { display: block; font-size: 13px; }
  .tm-pop-body span { display: block; font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
  .tm-pop-body button { margin-top: 10px; width: 100%; padding: 8px; border-radius: 10px; border: 0; cursor: pointer; color: #fff; font-weight: 700; font-size: 11px; background: linear-gradient(135deg,#ff5100,#ff7d47); }

  .tm-map .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.45) !important; margin-top: 12px !important; margin-right: 12px !important; }
  .tm-map .leaflet-control-zoom a { background: rgba(11,13,16,0.9) !important; color: rgba(255,255,255,0.75) !important; border: 0 !important; width: 32px !important; height: 32px !important; line-height: 32px !important; }
  .tm-map .leaflet-control-zoom a:hover { background: rgba(255,81,0,0.25) !important; color: #fff !important; }
  .tm-map .leaflet-control-zoom-in { border-bottom: 1px solid rgba(255,255,255,0.08) !important; }

  @media (prefers-reduced-motion: reduce) { .tm-pin.pick::after, .tm-me::before { animation: none; } }
`;
