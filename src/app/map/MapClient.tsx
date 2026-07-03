"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2,
  LocateFixed, Map as MapIcon, Layers, Camera,
  Navigation as NavigationIcon, Compass, RotateCcw,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ChatBubble from "@/components/ChatBubble";
import { typeIconSvg } from "@/lib/mapMarkerIcons";
import { adventures } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, Adventure } from "@/lib/data";

import type L from "leaflet";
import type { GeoJsonObject } from "geojson";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:     "#10b981",
  Moderate: "#38bdf8",
  Hard:     "#a78bfa",
  Advanced: "#ff5100",
  Extreme:  "#ef4444",
};

const seasons: { label: string; months: Month[] }[] = [
  { label: "Spring",     months: ["Mar", "Apr"] },
  { label: "Summer",     months: ["May", "Jun"] },
  { label: "Monsoon",    months: ["Jul", "Aug"] },
  { label: "Autumn",     months: ["Sep", "Oct"] },
  { label: "Pre Winter", months: ["Nov", "Dec"] },
  { label: "Winter",     months: ["Jan", "Feb"] },
];

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
};

declare global { interface Window { L: typeof L } }

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if ((existing as HTMLScriptElement).dataset.loaded) { resolve(); return; }
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => { s.dataset.loaded = "1"; resolve(); };
    document.head.appendChild(s);
  });
}

let leafletPromise: Promise<typeof L> | null = null;

function loadLeaflet(): Promise<typeof L> {
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link"); link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[href*="MarkerCluster"]')) {
      const lc = document.createElement("link"); lc.rel = "stylesheet";
      lc.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
      document.head.appendChild(lc);
      const ld = document.createElement("link"); ld.rel = "stylesheet";
      ld.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
      document.head.appendChild(ld);
    }
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
      .then(() => loadScript("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"))
      .then(() => resolve(window.L));
  });
  return leafletPromise;
}

// ── Unified Search ────────────────────────────────────────────────────────────

function UnifiedSearch({
  onAdventureSearch,
  onPlaceSelect,
  onAdventurePin,
}: {
  onAdventureSearch: (q: string) => void;
  onPlaceSelect: (lat: number, lng: number, name: string) => void;
  onAdventurePin: (adv: Adventure) => void;
}) {
  const [query, setQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const adventureMatches = query.trim().length >= 2
    ? adventures.filter(a =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.state.toLowerCase().includes(query.toLowerCase()) ||
        a.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const fetchPlaces = useCallback((q: string) => {
    if (!q.trim() || q.length < 2) { setPlaceResults([]); return; }
    setLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=4&countrycodes=in&addressdetails=0`,
      { headers: { "Accept-Language": "en" } }
    )
      .then(r => r.json())
      .then((data: NominatimResult[]) => setPlaceResults(data))
      .catch(() => setPlaceResults([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    onAdventureSearch(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPlaces(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchPlaces, onAdventureSearch]);

  const hasResults = adventureMatches.length > 0 || placeResults.length > 0;
  useEffect(() => { setOpen(query.trim().length >= 2 && hasResults); }, [query, hasResults]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleClear() { setQuery(""); setPlaceResults([]); setOpen(false); onAdventureSearch(""); }

  function handlePlaceSelect(r: NominatimResult) {
    const name = r.display_name.split(",")[0];
    onPlaceSelect(parseFloat(r.lat), parseFloat(r.lon), name);
    setQuery(name); setOpen(false);
  }

  function handleAdvSelect(a: Adventure) {
    onAdventurePin(a);
    setQuery(a.name); setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-white/30" />}
        {!loading && query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
            <X className="w-3.5 h-3.5 text-white/30" />
          </button>
        )}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search adventures or places…"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", caretColor: "#ff5100" }}
          onFocus={e => { e.currentTarget.style.border = "1px solid rgba(255,81,0,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; hasResults && setOpen(true); }}
          onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        />
      </div>

      {open && (
        <div
          className="absolute z-[2000] top-full mt-2 w-full rounded-xl overflow-hidden text-sm min-w-[300px]"
          style={{ background: "rgba(6,9,18,0.97)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)", backdropFilter: "blur(14px)" }}
        >
          {adventureMatches.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Adventures</p>
              {adventureMatches.map(a => (
                <button
                  key={a.id}
                  onMouseDown={() => handleAdvSelect(a)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={a.heroImage} alt={a.name} fill className="object-cover" sizes="32px" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] truncate text-white/85">{a.name}</p>
                    <p className="text-[10px] mt-0.5 truncate text-white/35">{a.type} · {a.state}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: DIFFICULTY_COLORS[a.difficulty] }} />
                </button>
              ))}
            </>
          )}
          {placeResults.length > 0 && (
            <>
              <p className={`px-4 pb-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-white/25 ${adventureMatches.length > 0 ? "pt-2.5 border-t border-white/6" : "pt-3"}`}>
                Places
              </p>
              {placeResults.map(r => (
                <button
                  key={r.place_id}
                  onMouseDown={() => handlePlaceSelect(r)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#ff5100]" />
                  <span className="line-clamp-1 text-[13px] text-white/70">{r.display_name}</span>
                </button>
              ))}
            </>
          )}
          <div className="px-4 py-2 border-t border-white/6">
            <p className="text-[9px] text-white/20">Adventure → fly to pin · Place → navigate to location</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Map View ──────────────────────────────────────────────────────────────────

const BASE_LAYERS = {
  default: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    labelsUrl: null,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
    labelsUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    labelsUrl: null,
  },
} as const;

type OverlayKey = keyof typeof BASE_LAYERS;

// Module-level cache for India GeoJSON (survives re-mounts)
let indiaGeoCache: GeoJsonObject | null = null;

interface UserPhoto {
  id: string;
  slug: string;
  url: string;
  caption: string;
  created_at: string;
  lat: number;
  lng: number;
  adventureName: string;
}

function MapView({
  adventures: advs,
  flyToRef,
  openPinRef,
  resetViewRef,
  viewKey,
  userPhotos,
  wishlist,
  nearMe,
  }: {
  adventures: Adventure[];
  flyToRef: React.MutableRefObject<((lat: number, lng: number) => void) | null>;
  openPinRef: React.MutableRefObject<((slug: string) => void) | null>;
  resetViewRef: React.MutableRefObject<(() => void) | null>;
  viewKey: OverlayKey;
  userPhotos: UserPhoto[];
  wishlist: Set<string>;
  nearMe: { lat: number; lng: number } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const labelsTileRef = useRef<L.TileLayer | null>(null);
  const photoLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    flyToRef.current = (lat, lng) => {
      mapInstanceRef.current?.flyTo([lat, lng], 11, { duration: 1.2 });
    };
    openPinRef.current = (slug) => {
      const marker = markerMapRef.current.get(slug);
      if (marker && mapInstanceRef.current) {
        const adv = advs.find(a => a.slug === slug);
        if (adv) mapInstanceRef.current.flyTo([adv.lat, adv.lng], 11, { duration: 1.0 });
        setTimeout(() => marker.openPopup(), 1100);
      }
    };
  });

  function buildMarker(leaflet: typeof L, adv: Adventure) {
    const diffColor = DIFFICULTY_COLORS[adv.difficulty] ?? "#6366f1";
    const isWishlisted = wishlist.has(adv.slug);
    const markerColor = isWishlisted ? "#ff5100" : diffColor;
    const svgIcon = typeIconSvg(adv.type, 11, "white");

    const icon = leaflet.divIcon({
      className: "",
      html: `<div style="position:relative;width:32px;height:40px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.45));">
        <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${markerColor};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;${isWishlisted ? "box-shadow:0 0 12px rgba(255,81,0,0.6),inset 0 1px 0 rgba(255,255,255,0.3)" : "box-shadow:inset 0 1px 0 rgba(255,255,255,0.3)"};">
          <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">${svgIcon}</div>
        </div>
        ${isWishlisted ? '<div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;background:#ff5100;border-radius:50%;border:1.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:6px;">❤</div>' : ""}
      </div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -44],
    });

    const distStr = nearMe
      ? ` · ${Math.round(haversineKm(nearMe.lat, nearMe.lng, adv.lat, adv.lng))} km`
      : "";

    const popupHtml = `
      <div onclick="window.location.href='/experiences/${adv.slug}'" style="width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;border-radius:16px;overflow:hidden;background:var(--bg-surface,#0f1420);cursor:pointer;border:1px solid var(--border-subtle,rgba(255,255,255,0.06));">
        <div style="position:relative;height:180px;">
          <img src="${adv.heroImage}" alt="${adv.name}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.1) 50%,rgba(0,0,0,0.2) 100%);" />
          <div style="position:absolute;top:10px;left:10px;display:flex;gap:4px;align-items:center;">
            <span style="background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);color:#fff;font-size:10px;font-weight:600;padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);">${adv.type}</span>
            ${isWishlisted ? '<span style="background:rgba(255,81,0,0.55);backdrop-filter:blur(8px);color:#fff;font-size:9px;font-weight:700;padding:3px 8px;border-radius:20px;">❤ Saved</span>' : ""}
          </div>
          <div style="position:absolute;bottom:10px;left:14px;right:14px;">
            <div style="font-size:16px;font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.02em;text-shadow:0 2px 8px rgba(0,0,0,0.7);">${adv.name}</div>
          </div>
        </div>
        <div style="padding:12px 14px 14px;">
          <p style="font-size:12.5px;color:var(--text-secondary,rgba(255,255,255,0.5));line-height:1.5;margin:0 0 12px;">${adv.tagline}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--text-tertiary,rgba(255,255,255,0.3));">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${adv.durationDays}
              </span>
              <span style="display:flex;align-items:center;gap:3px;font-size:11px;color:${diffColor};">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.5 6.5L4 10l5.5 4-2 7L12 17l4.5 4-2-7L20 10l-6.5-.5Z"/></svg>
                ${adv.difficulty}
              </span>
              ${distStr ? `<span style="display:flex;align-items:center;gap:3px;font-size:11px;color:#22c55e;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <span style="font-weight:600;">${distStr.replace(" · ", "")}</span>
              </span>` : ""}
            </div>
            <span style="display:flex;align-items:center;gap:3px;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;background:rgba(255,81,0,0.12);color:#ff5100;">
              Explore
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </div>
    `;

    const marker = leaflet.marker([adv.lat, adv.lng], { icon })
      .bindPopup(popupHtml, { maxWidth: 280, minWidth: 280, className: "ttt-popup" })
      .bindTooltip(adv.name, {
        direction: "top",
        offset: [0, -48],
        className: "ttt-tooltip",
        opacity: 0.9,
      });

    return marker;
  }

  function addMarkers(leaflet: typeof L, list: Adventure[]) {
    markerMapRef.current.clear();
    list.forEach(adv => {
      const marker = buildMarker(leaflet, adv);
      markersLayerRef.current?.addLayer(marker);
      markerMapRef.current.set(adv.slug, marker);
    });
  }

  function addIndiaBorder(leaflet: typeof L, map: L.Map) {
    if (indiaGeoCache) {
      leaflet.geoJSON(indiaGeoCache, {
        style: { color: "#ff5100", weight: 1.8, opacity: 0.3, fillColor: "#ff5100", fillOpacity: 0.03 },
        interactive: false,
      }).addTo(map);
      return;
    }
    fetch("/india-boundary.geojson")
      .then(r => r.json())
      .then(data => {
        indiaGeoCache = data;
        leaflet.geoJSON(data, {
          style: { color: "#ff5100", weight: 1.8, opacity: 0.3, fillColor: "#ff5100", fillOpacity: 0.03 },
          interactive: false,
        }).addTo(map);
      })
      .catch(() => {});
  }

  // Inject popup + zoom control styles once
  useEffect(() => {
    if (document.getElementById("ttt-popup-style")) return;
    const s = document.createElement("style");
    s.id = "ttt-popup-style";
    s.textContent = `
      .ttt-popup .leaflet-popup-content-wrapper {
        padding: 0;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.08);
        background: #09101f;
      }
      .ttt-popup .leaflet-popup-content { margin: 0; line-height: 1; }
      .ttt-popup .leaflet-popup-tip-container { display: none; }
      .ttt-popup .leaflet-popup-close-button {
        top: 8px !important; right: 8px !important;
        width: 22px !important; height: 22px !important;
        font-size: 15px !important; line-height: 22px !important;
        background: rgba(0,0,0,0.55) !important;
        backdrop-filter: blur(4px) !important;
        border-radius: 50% !important;
        color: rgba(255,255,255,0.75) !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
      }
      .ttt-popup .leaflet-popup-close-button:hover { background: rgba(255,81,0,0.6) !important; color: #fff !important; }
      .ttt-tooltip {
        background: rgba(4,7,14,0.92) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        color: #fff !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        padding: 4px 10px !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        backdrop-filter: blur(8px) !important;
      }
      .ttt-tooltip::before { border-top-color: rgba(4,7,14,0.92) !important; }
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        border-radius: 12px !important;
        overflow: hidden;
      }
      .leaflet-control-zoom a {
        background: rgba(4,7,14,0.88) !important;
        backdrop-filter: blur(12px) !important;
        color: rgba(255,255,255,0.7) !important;
        border: none !important;
        font-size: 16px !important;
        line-height: 30px !important;
        width: 30px !important;
        height: 30px !important;
        transition: background 0.15s, color 0.15s;
      }
      .leaflet-control-zoom a:hover { background: rgba(255,81,0,0.25) !important; color: #ff7d47 !important; }
      .leaflet-control-zoom-in { border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
      .leaflet-control-attribution { display: none !important; }
      .ttt-popup .leaflet-popup-content-wrapper > div {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .ttt-popup .leaflet-popup-content-wrapper > div:hover {
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current;
    loadLeaflet().then(leaflet => {
      if (!container) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((container as any)._leaflet_id) (container as any)._leaflet_id = undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = leaflet.map(container, {
        center: [22.5, 80.0], zoom: 5,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      const bl = BASE_LAYERS.default;
      baseTileRef.current = leaflet.tileLayer(bl.url, { maxZoom: bl.maxZoom, attribution: bl.attribution }).addTo(map);
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;

      // Reset view handler
      resetViewRef.current = () => {
        map.flyTo([22.5, 80.0], 5, { duration: 1.2 });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MCG = (leaflet as any).markerClusterGroup({
        maxClusterRadius: 52,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          const size = count >= 100 ? 44 : count >= 20 ? 40 : 36;
          return leaflet.divIcon({
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#ff5100,#ff7d47);color:#fff;font-size:${count >= 100 ? 11 : 12}px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 4px 16px rgba(255,81,0,0.5),0 1px 4px rgba(0,0,0,0.3);">${count}</div>`,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        },
      });
      map.addLayer(MCG);
      markersLayerRef.current = MCG;
      photoLayerRef.current = leaflet.layerGroup().addTo(map);
      addMarkers(leaflet, advs);
      addIndiaBorder(leaflet, map);
    });
    return () => {
      if (mapInstanceRef.current) {
        markersLayerRef.current = null;
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (container) (container as any)._leaflet_id = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    loadLeaflet().then(leaflet => {
      if (!markersLayerRef.current || !mapInstanceRef.current) return;
      markersLayerRef.current.clearLayers();
      addMarkers(leaflet, advs);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advs]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    loadLeaflet().then(leaflet => {
      const map = mapInstanceRef.current;
      if (!map || !baseTileRef.current) return;
      const cfg = BASE_LAYERS[viewKey];
      // swap base tile
      map.removeLayer(baseTileRef.current);
      baseTileRef.current = leaflet.tileLayer(cfg.url, { maxZoom: cfg.maxZoom, attribution: cfg.attribution });
      baseTileRef.current.addTo(map);
      // remove old labels layer
      if (labelsTileRef.current) { map.removeLayer(labelsTileRef.current); labelsTileRef.current = null; }
      // add labels overlay for satellite
      if (cfg.labelsUrl) {
        labelsTileRef.current = leaflet.tileLayer(cfg.labelsUrl, { maxZoom: cfg.maxZoom, attribution: "", opacity: 1 });
        labelsTileRef.current.addTo(map);
      }
      (markersLayerRef.current as any)?.bringToFront?.();
    });
  }, [viewKey]);

  useEffect(() => {
    if (!photoLayerRef.current) return;
    loadLeaflet().then(leaflet => {
      if (!photoLayerRef.current) return;
      photoLayerRef.current.clearLayers();
      userPhotos.forEach(photo => {
        const icon = leaflet.divIcon({
          className: "",
          html: `<div style="position:relative;width:46px;height:46px;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.5));">
            <div style="width:46px;height:46px;border-radius:50%;overflow:hidden;border:3px solid #ff5100;background:#09101f;box-shadow:0 0 0 1.5px rgba(255,81,0,0.3);">
              <img src="${photo.url}" style="width:100%;height:100%;object-fit:cover;" />
            </div>
            <div style="position:absolute;bottom:-1px;right:-1px;width:16px;height:16px;background:linear-gradient(135deg,#ff5100,#ff7d47);border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;">
              <svg width="7" height="7" viewBox="0 0 24 24" fill="white"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.26.07-.54.07-.83s-.03-.57-.07-.83l1.8-1.4c.16-.13.2-.35.1-.53l-1.72-2.97a.397.397 0 0 0-.49-.15l-2.12.85c-.44-.34-.9-.63-1.41-.84l-.32-2.26a.4.4 0 0 0-.4-.34H8.12a.4.4 0 0 0-.4.34l-.32 2.26c-.51.21-.97.5-1.41.84L3.87 7.12a.39.39 0 0 0-.49.15L1.66 10.24c-.1.18-.06.4.1.53l1.8 1.4c-.04.26-.07.53-.07.83s.03.57.07.83l-1.8 1.4c-.16.13-.2.35-.1.53l1.71 2.97c.1.18.3.24.49.15l2.12-.85c.44.34.9.63 1.41.84l.32 2.26c.06.2.24.34.4.34h3.44c.17 0 .34-.14.4-.34l.32-2.26c.51-.21.97-.5 1.41-.84l2.12.85c.19.07.39.01.49-.15l1.71-2.97c.1-.18.06-.4-.1-.53l-1.8-1.4z"/></svg>
            </div>
          </div>`,
          iconSize: [46, 46],
          iconAnchor: [23, 23],
          popupAnchor: [0, -28],
        });

        const popupHtml = `
          <div style="width:220px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;border-radius:14px;overflow:hidden;background:#09101f;">
            <div style="position:relative;height:144px;">
              <img src="${photo.url}" alt="${photo.caption || photo.adventureName}" style="width:100%;height:100%;object-fit:cover;display:block;" />
              <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(9,16,31,0.92) 0%,transparent 55%);" />
              <div style="position:absolute;bottom:9px;left:11px;right:11px;">
                <div style="font-size:12.5px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.01em;">${photo.adventureName}</div>
                ${photo.caption ? `<div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">${photo.caption}</div>` : ""}
              </div>
            </div>
            <div style="padding:10px 11px 11px;background:#09101f;">
              <button onclick="window.location.href='/experiences/${photo.slug}'" style="display:flex;align-items:center;justify-content:center;gap:5px;width:100%;background:linear-gradient(135deg,#ff5100,#ff7d47);color:white;padding:8px;border-radius:8px;font-size:11px;font-weight:700;border:none;cursor:pointer;box-shadow:0 2px 10px rgba(255,81,0,0.3);">
                See Full Details →
              </button>
            </div>
          </div>
        `;

        const marker = leaflet.marker([photo.lat, photo.lng], { icon })
          .bindPopup(popupHtml, { maxWidth: 220, minWidth: 220, className: "ttt-popup" });
        photoLayerRef.current!.addLayer(marker);
      });
    });
  }, [userPhotos]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// ── Haversine ─────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<OverlayKey | null>(null);
  const [myShotsOn, setMyShotsOn] = useState(false);
  const [myShotsLoading, setMyShotsLoading] = useState(false);
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  
  function toggleOverlay(key: OverlayKey) {
    setActiveOverlay(prev => prev === key ? null : key);
  }

  function toggleMyShots() {
    if (myShotsOn) {
      setMyShotsOn(false);
      setUserPhotos([]);
      return;
    }
    setMyShotsOn(true);
    setMyShotsLoading(true);
    fetch("/api/photos/mine")
      .then(r => r.json())
      .then(d => setUserPhotos(d.photos ?? []))
      .catch(() => setUserPhotos([]))
      .finally(() => setMyShotsLoading(false));
  }
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);
  const openPinRef = useRef<((slug: string) => void) | null>(null);
  const resetViewRef = useRef<(() => void) | null>(null);
  const [nearMe, setNearMe] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  // Load wishlist from localStorage
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  useEffect(() => {
    const saved = localStorage.getItem("ttt-bookmarks");
    if (saved) {
      const bookmarks = JSON.parse(saved);
      setWishlist(new Set(Object.keys(bookmarks)));
    }
    function handleWishlistChange() {
      const s = localStorage.getItem("ttt-bookmarks");
      if (s) {
        const b = JSON.parse(s);
        setWishlist(new Set(Object.keys(b)));
      }
    }
    window.addEventListener("storage", handleWishlistChange);
    return () => window.removeEventListener("storage", handleWishlistChange);
  }, []);

  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<AdventureType[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<Duration[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Month[]>([]);
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  const [expandedRegion, setExpandedRegion] = useState<Region | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  useEffect(() => {
    setMounted(true);
    // Check auth state
    import("@/lib/supabase/client").then(({ createClient }) => {
      const sb = createClient();
      sb.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    });
  }, []);

  function toggle<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  function clearAll() {
    setSearch(""); setSelectedTypes([]); setSelectedRegions([]);
    setSelectedDifficulties([]); setSelectedDurations([]);
    setSelectedMonths([]); setSelectedSubRegions([]);
    setExpandedRegion(null); setExpandedCategory(null); setExpandedSeason(null);
  }

  const activeFilterCount =
    selectedTypes.length + selectedRegions.length + selectedSubRegions.length +
    selectedDifficulties.length + selectedDurations.length +
    selectedMonths.length;

  const visibleAdventures = adventures.filter(a => {
    if (search &&
      !a.name.toLowerCase().includes(search.toLowerCase()) &&
      !a.state.toLowerCase().includes(search.toLowerCase()) &&
      !a.tagline.toLowerCase().includes(search.toLowerCase())
    ) return false;
    if (selectedTypes.length && !selectedTypes.includes(a.type)) return false;
    if (selectedRegions.length && !selectedRegions.includes(a.region)) return false;
    if (selectedSubRegions.length && !selectedSubRegions.some(sr => a.state.includes(sr))) return false;
    if (selectedDifficulties.length && !selectedDifficulties.includes(a.difficulty)) return false;
    if (selectedDurations.length && !selectedDurations.includes(a.duration)) return false;
    if (selectedMonths.length && !selectedMonths.some(m => a.bestMonths.includes(m))) return false;
    return true;
  });

  const sortedAdventures = nearMe
    ? [...visibleAdventures].sort((a, b) =>
        haversineKm(nearMe.lat, nearMe.lng, a.lat, a.lng) - haversineKm(nearMe.lat, nearMe.lng, b.lat, b.lng)
      )
    : visibleAdventures;

  function handleNearMe() {
    if (nearMe) { setNearMe(null); setNearMeError(false); return; }
    if (!navigator.geolocation) { setNearMeError(true); return; }
    setNearMeLoading(true);
    setNearMeError(false);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        flyToRef.current?.(pos.coords.latitude, pos.coords.longitude);
        setNearMeLoading(false);
      },
      () => { setNearMeLoading(false); setNearMeError(true); },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }

  // Toolbar button helpers
  const tbBtn = (active: boolean, danger = false) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
      active
        ? danger ? "bg-[#ff5100] text-white" : "text-white"
        : "text-white/50 hover:text-white/80 hover:bg-white/8"
    }`;

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <Navbar />
      <div className="h-16 lg:h-20 shrink-0" />

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div
        className="z-[1001] shrink-0"
        style={{ position: "relative", background: "rgba(4,7,14,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-7xl mx-auto px-3 lg:px-5 py-2 flex items-center gap-2">

          <UnifiedSearch
            onAdventureSearch={setSearch}
            onPlaceSelect={(lat, lng) => flyToRef.current?.(lat, lng)}
            onAdventurePin={adv => openPinRef.current?.(adv.slug)}
          />

          {/* Toolbar items */}
          <div className="flex items-center gap-2">

          {/* Default / Satellite / Terrain — directly visible toggle buttons */}
          <div className="flex items-center rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {([
              { key: null as OverlayKey | null, label: "Default", icon: <MapIcon className="w-3 h-3" /> },
              { key: "satellite" as OverlayKey, label: "Satellite", icon: <Layers className="w-3 h-3" /> },
              { key: "terrain" as OverlayKey, label: "Terrain", icon: <NavigationIcon className="w-3 h-3" /> },
            ]).map(({ key, label, icon }, i, arr) => {
              const active = (activeOverlay ?? null) === key;
              return (
                <button key={label}
                  onClick={() => setActiveOverlay(key)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold transition-all"
                  style={{
                    background: active ? "rgba(255,81,0,0.2)" : "rgba(255,255,255,0.04)",
                    color: active ? "#ff7d47" : "rgba(255,255,255,0.5)",
                    borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  {icon}{label}
                </button>
              );
            })}
          </div>

          {/* My Shots */}
          {loggedIn && (
            <button
              onClick={toggleMyShots}
              title="My trip photos"
              className={tbBtn(myShotsOn, myShotsOn)}
              style={myShotsOn ? { background: "#ff5100" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {myShotsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">My Shots</span>
              {myShotsOn && userPhotos.length > 0 && (
                <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{userPhotos.length}</span>
              )}
            </button>
          )}

          {/* Near Me */}
          <div className="relative shrink-0">
            <button
              onClick={handleNearMe}
              title={nearMe ? "Clear Near Me" : "Adventures Near Me"}
              className={tbBtn(nearMe !== null, nearMe !== null)}
              style={nearMe ? { background: "#ff5100" } : nearMeError ? { background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {nearMeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{nearMe ? "Near Me ✓" : "Near Me"}</span>
            </button>
            {nearMeError && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] text-red-400 font-semibold whitespace-nowrap">Location denied</span>
            )}
          </div>

          {/* Filters */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={tbBtn(filtersOpen || activeFilterCount > 0)}
            style={filtersOpen || activeFilterCount > 0 ? { background: "rgba(255,81,0,0.2)", border: "1px solid rgba(255,81,0,0.35)", color: "#ff7d47" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#ff5100] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none px-1 py-0.5">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Count */}
          <span className="hidden lg:block text-[11px] font-medium shrink-0 text-white/30">
            {visibleAdventures.length}<span className="opacity-50"> / {adventures.length}</span>
          </span>

          {/* Clear */}
          {(activeFilterCount > 0 || search) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-semibold shrink-0 transition-colors"
              style={{ color: "#ff5100" }}
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
          </div>
        </div>

        {/* Filter panel (dropdown) */}
        {filtersOpen && (
          <>
            {/* Invisible backdrop — closes dropdown on outside click */}
            <div className="fixed inset-0 z-[1999]" onClick={() => setFiltersOpen(false)} />
            <div className="absolute top-full left-0 right-0 z-[2000] border-t border-[var(--border-subtle)] max-h-[58vh] overflow-y-auto" style={{ background: "var(--bg-page)", backdropFilter: "blur(12px)" }}>
            <div className="max-w-7xl mx-auto px-3 lg:px-5 py-1.5 space-y-1.5">


                {/* Region */}
                {(() => {
                  const regionGroups: { name: Region; subRegions: string[] }[] = [
                    { name: "Himalayas",     subRegions: ["Ladakh","Jammu & Kashmir","Uttarakhand","Himachal Pradesh","Sikkim","Arunachal Pradesh"] },
                    { name: "Western Ghats", subRegions: ["Kerala","Karnataka","Goa","Maharashtra"] },
                    { name: "Eastern Ghats", subRegions: ["Odisha","Andhra Pradesh","Telangana","Tamil Nadu"] },
                    { name: "Desert",        subRegions: ["Rajasthan","Gujarat"] },
                    { name: "Coast",         subRegions: ["Maharashtra","Goa","Kerala","Karnataka","Odisha","Tamil Nadu","Andhra Pradesh"] },
                    { name: "Islands",       subRegions: ["Andaman & Nicobar","Lakshadweep"] },
                    { name: "Northeast",     subRegions: ["Nagaland","Manipur","Meghalaya","Mizoram","Assam","Arunachal Pradesh","Sikkim"] },
                    { name: "Urban",         subRegions: ["Mumbai","Delhi","Bangalore","Chennai","Kolkata","Hyderabad","Pune"] },
                  ];
                  const totalSelected = selectedRegions.length + selectedSubRegions.length;
                  return (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                        <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Region</span>
                        {totalSelected > 0 && <span className="text-[8px] font-bold px-1 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{totalSelected}</span>}
                      </div>
                      <div className="p-1.5">
                        <div className="flex flex-wrap gap-1">
                          {regionGroups.map(rg => {
                            const isExp = expandedRegion === rg.name;
                            const subCnt = rg.subRegions.filter(sr => selectedSubRegions.includes(sr)).length;
                            const hasSel = selectedRegions.includes(rg.name) || subCnt > 0;
                            return (
                              <button key={rg.name} onClick={() => setExpandedRegion(isExp ? null : rg.name)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                                style={{ background: isExp || hasSel ? "rgba(255,81,0,0.15)" : "var(--bg-card)", color: isExp || hasSel ? "#ff7d47" : "var(--text-tertiary)", border: `1px solid ${isExp || hasSel ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}` }}>
                                {rg.name}
                                {subCnt > 0 && <span className="text-[7px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "rgba(255,81,0,0.25)", color: "#ff7d47" }}>{subCnt}</span>}
                                <ChevronDown className={`w-2 h-2 opacity-50 transition-transform ${isExp ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedRegion && (() => {
                          const rg = regionGroups.find(r => r.name === expandedRegion)!;
                          return (
                            <div className="mt-1.5 pt-1.5 flex flex-wrap gap-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                              {rg.subRegions.map(sr => {
                                const isSel = selectedSubRegions.includes(sr);
                                return (
                                  <button key={sr} onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-medium transition-all"
                                    style={{ background: isSel ? "rgba(255,81,0,0.15)" : "var(--bg-card)", color: isSel ? "#ff7d47" : "var(--text-tertiary)", border: `1px solid ${isSel ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}` }}>
                                    {sr}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {/* Genre */}
              {(() => {
                  const genreGroups: { label: string; color: string; types: AdventureType[] }[] = [
                    { label: "Earth", color: "#a16207", types: ["Trekking","Mountaineering","Rock Climbing","Scrambling","Caving","Motorcycling","Cycling","Jeep Safari","Urban Adventure"] },
                    { label: "Water", color: "#0369a1", types: ["Diving","Kayaking"] },
                    { label: "Snow",  color: "#6366f1", types: ["Skiing","Ice Skating"] },
                    { label: "Air",   color: "#0891b2", types: ["Paragliding","Hot Air Balloon"] },
                  ];
                  return (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                        <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Genre</span>
                        {selectedTypes.length > 0 && <span className="text-[8px] font-bold px-1 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedTypes.length}</span>}
                      </div>
                      <div className="p-1.5">
                        <div className="flex flex-wrap gap-1">
                          {genreGroups.map(grp => {
                            const isExp = expandedCategory === grp.label;
                            const cnt = grp.types.filter(t => selectedTypes.includes(t)).length;
                            return (
                              <button key={grp.label} onClick={() => setExpandedCategory(isExp ? null : grp.label)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                                style={{ background: isExp ? `${grp.color}22` : cnt > 0 ? `${grp.color}18` : "var(--bg-card)", color: isExp || cnt > 0 ? grp.color : "var(--text-tertiary)", border: `1px solid ${isExp || cnt > 0 ? `${grp.color}50` : "var(--border-subtle)"}` }}>
                                {grp.label}
                                {cnt > 0 && <span className="text-[7px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: `${grp.color}30`, color: grp.color }}>{cnt}</span>}
                                <ChevronDown className={`w-2 h-2 opacity-50 transition-transform ${isExp ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedCategory && (() => {
                          const grp = genreGroups.find(g => g.label === expandedCategory)!;
                          return (
                            <div className="mt-1.5 pt-1.5 flex flex-wrap gap-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                              {grp.types.map(type => {
                                const isSel = selectedTypes.includes(type);
                                return (
                                  <button key={type} onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-medium transition-all"
                                    style={{ background: isSel ? "rgba(255,81,0,0.15)" : "var(--bg-card)", color: isSel ? "#ff7d47" : "var(--text-tertiary)", border: `1px solid ${isSel ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}` }}>
                                    {type}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}
                {/* Season */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Season</span>
                    {selectedMonths.length > 0 && <span className="text-[8px] font-bold px-1 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedMonths.length}</span>}
                  </div>
                  <div className="p-1.5">
                    <div className="flex flex-wrap gap-1">
                      {seasons.map(({ label, months: sMonths }) => {
                        const isExp = expandedSeason === label;
                        const cnt = sMonths.filter(m => selectedMonths.includes(m)).length;
                        return (
                          <button key={label} onClick={() => setExpandedSeason(isExp ? null : label)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                            style={{ background: isExp || cnt > 0 ? "#ff5100" : "var(--bg-card)", color: isExp || cnt > 0 ? "#fff" : "var(--text-tertiary)", border: `1px solid ${isExp || cnt > 0 ? "#ff5100" : "var(--border-subtle)"}` }}>
                            {label}
                            {cnt > 0 && <span className="text-[7px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "var(--text-muted)" }}>{cnt}</span>}
                            <ChevronDown className={`w-2 h-2 opacity-50 transition-transform ${isExp ? "rotate-180" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                    {expandedSeason && (
                      <div className="mt-1.5 pt-1.5 flex flex-wrap gap-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        {seasons.find(s => s.label === expandedSeason)!.months.map(m => {
                          const isSel = selectedMonths.includes(m);
                          return (
                            <button key={m} onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium transition-all"
                              style={{ background: isSel ? "rgba(255,81,0,0.15)" : "var(--bg-card)", color: isSel ? "#ff7d47" : "var(--text-tertiary)", border: `1px solid ${isSel ? "rgba(255,81,0,0.3)" : "var(--border-subtle)"}` }}>
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {/* Difficulty */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Difficulty</span>
                  </div>
                  <div className="p-1.5 flex flex-wrap gap-1">
                    {(["Easy","Moderate","Hard","Advanced","Extreme"] as Difficulty[]).map(val => {
                      const isSel = selectedDifficulties.includes(val);
                      const c = DIFFICULTY_COLORS[val] ?? "#ff5100";
                      return (
                        <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                          style={{ background: isSel ? `${c}18` : "var(--bg-card)", color: isSel ? c : "var(--text-tertiary)", border: `1px solid ${isSel ? `${c}40` : "var(--border-subtle)"}` }}>
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              {/* Duration */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span className="text-[8px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Duration</span>
                </div>
                <div className="p-1.5 flex flex-wrap gap-1">
                  {(["Weekend","3–5 days","7+ days"] as Duration[]).map(val => {
                    const isSel = selectedDurations.includes(val);
                    return (
                      <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                        style={{ background: isSel ? "#ff5100" : "var(--bg-card)", color: isSel ? "#fff" : "var(--text-tertiary)", border: `1px solid ${isSel ? "#ff5100" : "var(--border-subtle)"}` }}>
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
              </div>

              <div className="flex items-center gap-2 pt-1.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <button onClick={clearAll} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all" style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-default)" }}>
                  <RotateCcw className="w-3 h-3" /> Clear All
                </button>
                <button onClick={() => setFiltersOpen(false)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)", color: "#fff", boxShadow: "0 4px 14px rgba(255,81,0,0.3)" }}>
                  Close <X className="w-3.5 h-3.5" />
                </button>
              </div>


            </div>
          </div>
        </>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="px-3 lg:px-5 py-2 flex flex-wrap gap-1.5 border-t border-[var(--border-subtle)]" style={{ background: "var(--bg-page)" }}>
            {[
              ...selectedTypes.map(t => ({ label: t, remove: () => toggle(selectedTypes, t, setSelectedTypes) })),
              ...selectedRegions.map(r => ({ label: r, remove: () => toggle(selectedRegions, r, setSelectedRegions) })),
              ...selectedSubRegions.map(sr => ({ label: sr, remove: () => toggle(selectedSubRegions, sr, setSelectedSubRegions) })),
              ...selectedDifficulties.map(d => ({ label: d, remove: () => toggle(selectedDifficulties, d, setSelectedDifficulties) })),
              ...selectedDurations.map(d => ({ label: d, remove: () => toggle(selectedDurations, d, setSelectedDurations) })),
              ...selectedMonths.map(m => ({ label: m, remove: () => toggle(selectedMonths, m, setSelectedMonths) })),
            ].map(({ label, remove }) => (
              <span
                key={label}
                onClick={remove}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors"
                style={{ background: "rgba(255,81,0,0.08)", color: "#ff5100" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,81,0,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,81,0,0.08)")}
              >
                {label} <X className="w-2.5 h-2.5" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {mounted ? (
          <MapView
            adventures={sortedAdventures}
            flyToRef={flyToRef}
            openPinRef={openPinRef}
            resetViewRef={resetViewRef}
            viewKey={activeOverlay ?? "default"}
            userPhotos={userPhotos}
            wishlist={wishlist}
            nearMe={nearMe}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#f0ebe0" }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#b0a898" }} />
          </div>
        )}

        {/* Empty state when nothing matches filters */}
        {visibleAdventures.length === 0 && (activeFilterCount > 0 || search) && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
            <div className="text-center px-6 py-8 rounded-2xl pointer-events-auto"
              style={{
                background: "rgba(4,7,14,0.88)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              }}
            >
              <Compass className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
              <p className="text-white font-bold text-sm mb-1">No adventures match</p>
              <p className="text-white/30 text-xs mb-4">Try different filters or search terms</p>
              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110"
                style={{ background: "#ff5100", color: "#fff", boxShadow: "0 4px 14px rgba(255,81,0,0.25)" }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Legend toggle */}
        <div className="absolute bottom-5 left-4 z-[1000]">
          <button
            onClick={() => setLegendOpen(!legendOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:brightness-110"
            style={{
              background: legendOpen ? "rgba(255,81,0,0.2)" : "rgba(4,7,14,0.85)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${legendOpen ? "rgba(255,81,0,0.35)" : "rgba(255,255,255,0.1)"}`,
              color: legendOpen ? "#ff7d47" : "rgba(255,255,255,0.7)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Legend
          </button>

          {legendOpen && (
            <>
              {/* Invisible backdrop */}
              <div className="fixed inset-0 z-[999]" onClick={() => setLegendOpen(false)} />
              {/* Popup */}
              <div
                className="absolute bottom-full left-0 mb-2 rounded-xl px-3.5 py-3 min-w-[160px]"
                style={{
                  background: "rgba(4,7,14,0.96)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                {/* Difficulty */}
                <p className="text-[8px] font-black uppercase tracking-[0.22em] mb-2 text-white/25">Difficulty</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(DIFFICULTY_COLORS).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[11px] font-medium text-white/60">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reset view button */}
        <button
          onClick={() => resetViewRef.current?.()}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:brightness-110"
          style={{
            background: "rgba(4,7,14,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
          title="Reset map view"
        >
          <Compass className="w-3.5 h-3.5" />
          Reset View
        </button>

        {/* Visible count pill */}
        {(activeFilterCount > 0 || search) && (
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] text-white text-[11px] font-bold px-4 py-1.5 rounded-full"
            style={{ background: "rgba(255,81,0,0.9)", boxShadow: "0 2px 16px rgba(255,81,0,0.4)", backdropFilter: "blur(8px)" }}
          >
            {visibleAdventures.length} adventure{visibleAdventures.length !== 1 ? "s" : ""} shown
          </div>
        )}

        {/* Branding chip */}
        <div
          className="absolute bottom-5 right-4 z-[1000] rounded-lg px-2.5 py-1.5"
          style={{
            background: "rgba(4,7,14,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-white/25">
            <MapIcon className="w-2.5 h-2.5" />
            Trail to Tides
          </div>
        </div>

      </div>

      <ChatBubble />
    </div>
  );
}
