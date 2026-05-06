"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2,
  ArrowRight, LocateFixed, Map as MapIcon, Layers, Camera,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { typeIconSvg } from "@/lib/mapMarkerIcons";
import { adventures } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, Adventure } from "@/lib/data";
import { getACE } from "@/lib/ace";
import type { AceAxis } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { StoredProfile } from "@/lib/matchmaker";

type AceCategory = "ready" | "stretch" | "out-of-range";

function classifyAdventure(userAce: StoredProfile["ace"], adventureAce: ReturnType<typeof getACE>): AceCategory {
  const axes = Object.keys(adventureAce) as AceAxis[];
  let maxShortfall = 0;
  for (const axis of axes) {
    const req = adventureAce[axis];
    if (req === 0) continue;
    const shortfall = req - userAce[axis];
    if (shortfall > maxShortfall) maxShortfall = shortfall;
  }
  if (maxShortfall <= 0) return "ready";
  if (maxShortfall <= 1) return "stretch";
  return "out-of-range";
}

import type L from "leaflet";

const difficultyColor: Record<string, string> = {
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

function loadLeaflet(): Promise<typeof L> {
  return new Promise((resolve) => {
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
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search adventures or places…"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", caretColor: "#ff5100" }}
          onFocus={e => { e.currentTarget.style.border = "1px solid rgba(255,81,0,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
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
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: difficultyColor[a.difficulty] }} />
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
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
  terrain: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Topo &copy; Esri, DeLorme, NAVTEQ, TomTom, USGS, NGA, EPA",
    maxZoom: 19,
  },
} as const;

type OverlayKey = keyof typeof BASE_LAYERS;

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
  overlays,
  userPhotos,
}: {
  adventures: Adventure[];
  flyToRef: React.MutableRefObject<((lat: number, lng: number) => void) | null>;
  openPinRef: React.MutableRefObject<((slug: string) => void) | null>;
  overlays: Set<OverlayKey>;
  userPhotos: UserPhoto[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const baseTileRef = useRef<L.TileLayer | null>(null);
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
    const diffColor = difficultyColor[adv.difficulty] ?? "#6366f1";
    const svgIcon = typeIconSvg(adv.type, 11, "white");

    // Crisp circular pin with a subtle drop shadow
    const icon = leaflet.divIcon({
      className: "",
      html: `<div style="position:relative;width:30px;height:36px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.32));">
        <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:${diffColor};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.92);">
          <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">${svgIcon}</div>
        </div>
      </div>`,
      iconSize: [30, 36],
      iconAnchor: [15, 36],
      popupAnchor: [0, -40],
    });

    const priceFrom = adv.operators?.find(o => o.priceFrom)?.priceFrom;

    // Crisp popup card — clean white, tight grid layout
    const popupHtml = `
      <div style="width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;border-radius:16px;overflow:hidden;">
        <div style="position:relative;height:148px;">
          <img src="${adv.heroImage}" alt="${adv.name}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.08) 55%,transparent 100%);" />
          <div style="position:absolute;top:10px;left:10px;display:flex;gap:5px;">
            <span style="background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:rgba(255,255,255,0.9);font-size:9.5px;font-weight:700;padding:2.5px 8px;border-radius:20px;letter-spacing:0.04em;text-transform:uppercase;">${adv.type}</span>
            <span style="background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:${diffColor};font-size:9.5px;font-weight:700;padding:2.5px 8px;border-radius:20px;border:1px solid ${diffColor}80;letter-spacing:0.04em;">${adv.difficulty}</span>
          </div>
          <div style="position:absolute;bottom:10px;left:12px;right:12px;">
            <div style="font-size:14.5px;font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.01em;">${adv.name}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,0.6);margin-top:3px;">${adv.state}</div>
          </div>
          ${priceFrom ? `<div style="position:absolute;top:10px;right:10px;background:#10b981;color:white;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;">${priceFrom}</div>` : ""}
        </div>
        <div style="padding:12px 14px 14px;background:#fff;">
          <div style="display:flex;gap:12px;margin-bottom:10px;">
            <div style="text-align:center;flex:1;padding:6px 4px;border-radius:10px;background:#f8f5f0;">
              <div style="font-size:10px;font-weight:700;color:#1a1814;line-height:1;">${adv.durationDays}</div>
              <div style="font-size:9px;color:#9a9590;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em;">Duration</div>
            </div>
            <div style="text-align:center;flex:1;padding:6px 4px;border-radius:10px;background:#f8f5f0;">
              <div style="font-size:10px;font-weight:700;color:#1a1814;line-height:1;">${adv.difficulty}</div>
              <div style="font-size:9px;color:#9a9590;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em;">Difficulty</div>
            </div>
            <div style="text-align:center;flex:1;padding:6px 4px;border-radius:10px;background:#f8f5f0;">
              <div style="font-size:10px;font-weight:700;color:#1a1814;line-height:1;">${adv.bestSeason}</div>
              <div style="font-size:9px;color:#9a9590;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em;">Best Season</div>
            </div>
          </div>
          <p style="font-size:11px;color:#6b6560;line-height:1.5;margin:0 0 11px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${adv.tagline}</p>
          <button onclick="window.location.href='/experiences/${adv.slug}'" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#ff5100;color:white;padding:9px 14px;border-radius:10px;font-size:12px;font-weight:600;border:none;cursor:pointer;letter-spacing:0.01em;">
            See Full Details
            <span style="font-size:15px;line-height:1;margin-top:-1px;">→</span>
          </button>
        </div>
      </div>
    `;

    const marker = leaflet.marker([adv.lat, adv.lng], { icon })
      .bindPopup(popupHtml, { maxWidth: 280, minWidth: 280, className: "ttt-popup" });

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
    fetch("/india-boundary.geojson")
      .then(r => r.json())
      .then(data => {
        leaflet.geoJSON(data, {
          style: { color: "#ff5100", weight: 1.5, opacity: 0.22, fillColor: "#ff5100", fillOpacity: 0.02 },
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
        box-shadow: 0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
        border: 1px solid rgba(0,0,0,0.06);
      }
      .ttt-popup .leaflet-popup-content { margin: 0; line-height: 1; }
      .ttt-popup .leaflet-popup-tip-container { display: none; }
      .ttt-popup .leaflet-popup-close-button {
        top: 8px !important; right: 8px !important;
        width: 22px !important; height: 22px !important;
        font-size: 16px !important; line-height: 22px !important;
        background: rgba(0,0,0,0.45) !important;
        border-radius: 50% !important;
        color: rgba(255,255,255,0.85) !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
      }
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12) !important;
        border-radius: 10px !important;
        overflow: hidden;
      }
      .leaflet-control-zoom a {
        background: rgba(255,255,255,0.92) !important;
        backdrop-filter: blur(8px) !important;
        color: #1a1814 !important;
        border: none !important;
        font-size: 16px !important;
        line-height: 28px !important;
        width: 28px !important;
        height: 28px !important;
      }
      .leaflet-control-zoom a:hover { background: white !important; }
      .leaflet-control-zoom-in { border-bottom: 1px solid #e8e0d0 !important; }
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MCG = (leaflet as any).markerClusterGroup({
        maxClusterRadius: 52,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          const size = count >= 100 ? 44 : count >= 20 ? 40 : 36;
          return leaflet.divIcon({
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#ff5100;color:#fff;font-size:${count >= 100 ? 11 : 12}px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 3px 14px rgba(255,81,0,0.4);">${count}</div>`,
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
      // pick the active base layer key — default if nothing selected
      const activeKey = ([...overlays][0] as OverlayKey | undefined) ?? "default";
      const cfg = BASE_LAYERS[activeKey];
      map.removeLayer(baseTileRef.current);
      baseTileRef.current = leaflet.tileLayer(cfg.url, { maxZoom: cfg.maxZoom, attribution: cfg.attribution });
      baseTileRef.current.addTo(map);
      // ensure markers stay on top
      markersLayerRef.current?.bringToFront?.();
    });
  }, [overlays]);

  useEffect(() => {
    if (!photoLayerRef.current) return;
    loadLeaflet().then(leaflet => {
      if (!photoLayerRef.current) return;
      photoLayerRef.current.clearLayers();
      userPhotos.forEach(photo => {
        const icon = leaflet.divIcon({
          className: "",
          html: `<div style="position:relative;width:44px;height:44px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4));">
            <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2.5px solid #ff5100;background:#111;">
              <img src="${photo.url}" style="width:100%;height:100%;object-fit:cover;" />
            </div>
            <div style="position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;background:#ff5100;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.26.07-.54.07-.83s-.03-.57-.07-.83l1.8-1.4c.16-.13.2-.35.1-.53l-1.72-2.97a.397.397 0 0 0-.49-.15l-2.12.85c-.44-.34-.9-.63-1.41-.84l-.32-2.26a.4.4 0 0 0-.4-.34H8.12a.4.4 0 0 0-.4.34l-.32 2.26c-.51.21-.97.5-1.41.84L3.87 7.12a.39.39 0 0 0-.49.15L1.66 10.24c-.1.18-.06.4.1.53l1.8 1.4c-.04.26-.07.53-.07.83s.03.57.07.83l-1.8 1.4c-.16.13-.2.35-.1.53l1.71 2.97c.1.18.3.24.49.15l2.12-.85c.44.34.9.63 1.41.84l.32 2.26c.06.2.24.34.4.34h3.44c.17 0 .34-.14.4-.34l.32-2.26c.51-.21.97-.5 1.41-.84l2.12.85c.19.07.39.01.49-.15l1.71-2.97c.1-.18.06-.4-.1-.53l-1.8-1.4z"/></svg>
            </div>
          </div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -26],
        });

        const popupHtml = `
          <div style="width:220px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;border-radius:14px;overflow:hidden;">
            <div style="position:relative;height:140px;">
              <img src="${photo.url}" alt="${photo.caption || photo.adventureName}" style="width:100%;height:100%;object-fit:cover;display:block;" />
              <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 60%);" />
              <div style="position:absolute;bottom:8px;left:10px;right:10px;">
                <div style="font-size:12px;font-weight:700;color:#fff;line-height:1.2;">${photo.adventureName}</div>
                ${photo.caption ? `<div style="font-size:10px;color:rgba(255,255,255,0.65);margin-top:2px;">${photo.caption}</div>` : ""}
              </div>
            </div>
            <div style="padding:10px 12px;background:#fff;">
              <button onclick="window.location.href='/experiences/${photo.slug}'" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#ff5100;color:white;padding:8px;border-radius:8px;font-size:11px;font-weight:600;border:none;cursor:pointer;">
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
  const [viewOpen, setViewOpen] = useState(false);
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
  const [nearMe, setNearMe] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState(false);

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
  const [aceCategory, setAceCategory] = useState<AceCategory | null>(null);
  const [userProfile, setUserProfile] = useState<StoredProfile | null>(null);

  useEffect(() => {
    setMounted(true);
    setUserProfile(loadProfile());
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
    setAceCategory(null);
  }

  const activeFilterCount =
    selectedTypes.length + selectedRegions.length + selectedSubRegions.length +
    selectedDifficulties.length + selectedDurations.length +
    selectedMonths.length + (aceCategory !== null ? 1 : 0);

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
    if (aceCategory && userProfile) {
      if (classifyAdventure(userProfile.ace, getACE(a)) !== aceCategory) return false;
    }
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
        style={{ background: "rgba(4,7,14,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-7xl mx-auto px-3 lg:px-5 py-2 flex items-center gap-2">

          <UnifiedSearch
            onAdventureSearch={setSearch}
            onPlaceSelect={(lat, lng) => flyToRef.current?.(lat, lng)}
            onAdventurePin={adv => openPinRef.current?.(adv.slug)}
          />

          {/* View toggle dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setViewOpen(v => !v)}
              className={tbBtn(!!activeOverlay)}
              style={activeOverlay ? { background: "rgba(255,81,0,0.2)", border: "1px solid rgba(255,81,0,0.35)", color: "#ff7d47" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {activeOverlay === "terrain" ? "Terrain" : activeOverlay === "satellite" ? "Satellite" : "Default"}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${viewOpen ? "rotate-180" : ""}`} />
            </button>
            {viewOpen && (
              <div
                className="absolute left-0 top-full mt-1.5 z-[2000] rounded-xl overflow-hidden min-w-[130px]"
                style={{ background: "rgba(6,9,18,0.97)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", backdropFilter: "blur(14px)" }}
              >
                {([
                  { key: "default"   as OverlayKey, icon: <MapIcon className="w-3.5 h-3.5" />,  label: "Default"   },
                  { key: "satellite" as OverlayKey, icon: <Layers className="w-3.5 h-3.5" />,   label: "Satellite" },
                  { key: "terrain"   as OverlayKey, icon: <Navigation className="w-3.5 h-3.5" />, label: "Terrain"   },
                ] as { key: OverlayKey; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => {
                  const active = (activeOverlay ?? "default") === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setActiveOverlay(key === "default" ? null : key); setViewOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-semibold transition-colors text-left"
                      style={{ color: active ? "#ff7d47" : "rgba(255,255,255,0.6)", background: active ? "rgba(255,81,0,0.12)" : "transparent" }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      {icon}{label}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
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

        {/* Filter panel */}
        {filtersOpen && (
          <div className="border-t border-white/8 max-h-[58vh] overflow-y-auto" style={{ background: "rgba(6,9,18,0.97)", backdropFilter: "blur(12px)" }}>
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 space-y-3">

              {/* Genre + Region row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Genre */}
                {(() => {
                  const genreGroups: { label: string; color: string; types: AdventureType[] }[] = [
                    { label: "Earth", color: "#a16207", types: ["Trekking","Mountaineering","Rock Climbing","Scrambling","Caving","Motorcycling","Cycling","Jeep Safari","Urban Adventure"] },
                    { label: "Water", color: "#0369a1", types: ["Diving","Kayaking"] },
                    { label: "Snow",  color: "#6366f1", types: ["Skiing","Ice Skating"] },
                    { label: "Air",   color: "#0891b2", types: ["Paragliding","Hot Air Balloon"] },
                  ];
                  return (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-2 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Genre</span>
                        {selectedTypes.length > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedTypes.length}</span>}
                      </div>
                      <div className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {genreGroups.map(grp => {
                            const isExp = expandedCategory === grp.label;
                            const cnt = grp.types.filter(t => selectedTypes.includes(t)).length;
                            return (
                              <button key={grp.label} onClick={() => setExpandedCategory(isExp ? null : grp.label)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                                style={{ background: isExp ? `${grp.color}22` : cnt > 0 ? `${grp.color}18` : "rgba(255,255,255,0.05)", color: isExp || cnt > 0 ? grp.color : "rgba(255,255,255,0.5)", border: `1px solid ${isExp || cnt > 0 ? `${grp.color}50` : "rgba(255,255,255,0.08)"}` }}>
                                {grp.label}
                                {cnt > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: `${grp.color}30`, color: grp.color }}>{cnt}</span>}
                                <ChevronDown className={`w-2.5 h-2.5 opacity-50 transition-transform ${isExp ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedCategory && (() => {
                          const grp = genreGroups.find(g => g.label === expandedCategory)!;
                          return (
                            <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                              {grp.types.map(type => {
                                const isSel = selectedTypes.includes(type);
                                return (
                                  <button key={type} onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                                    style={{ background: isSel ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.04)", color: isSel ? "#ff7d47" : "rgba(255,255,255,0.4)", border: `1px solid ${isSel ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.06)"}` }}>
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
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-2 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Region</span>
                        {totalSelected > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{totalSelected}</span>}
                      </div>
                      <div className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {regionGroups.map(rg => {
                            const isExp = expandedRegion === rg.name;
                            const subCnt = rg.subRegions.filter(sr => selectedSubRegions.includes(sr)).length;
                            const hasSel = selectedRegions.includes(rg.name) || subCnt > 0;
                            return (
                              <button key={rg.name} onClick={() => setExpandedRegion(isExp ? null : rg.name)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                                style={{ background: isExp || hasSel ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.05)", color: isExp || hasSel ? "#ff7d47" : "rgba(255,255,255,0.5)", border: `1px solid ${isExp || hasSel ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                                {rg.name}
                                {subCnt > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "rgba(255,81,0,0.25)", color: "#ff7d47" }}>{subCnt}</span>}
                                <ChevronDown className={`w-2.5 h-2.5 opacity-50 transition-transform ${isExp ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedRegion && (() => {
                          const rg = regionGroups.find(r => r.name === expandedRegion)!;
                          return (
                            <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                              {rg.subRegions.map(sr => {
                                const isSel = selectedSubRegions.includes(sr);
                                return (
                                  <button key={sr} onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                                    style={{ background: isSel ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.04)", color: isSel ? "#ff7d47" : "rgba(255,255,255,0.4)", border: `1px solid ${isSel ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.06)"}` }}>
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
              </div>

              {/* Season + Difficulty row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Season */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Season</span>
                    {selectedMonths.length > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{selectedMonths.length}</span>}
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {seasons.map(({ label, months: sMonths }) => {
                        const isExp = expandedSeason === label;
                        const cnt = sMonths.filter(m => selectedMonths.includes(m)).length;
                        return (
                          <button key={label} onClick={() => setExpandedSeason(isExp ? null : label)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                            style={{ background: isExp || cnt > 0 ? "#ff5100" : "rgba(255,255,255,0.05)", color: isExp || cnt > 0 ? "#fff" : "rgba(255,255,255,0.5)", border: `1px solid ${isExp || cnt > 0 ? "#ff5100" : "rgba(255,255,255,0.08)"}` }}>
                            {label}
                            {cnt > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded-full leading-none" style={{ background: "rgba(255,255,255,0.25)" }}>{cnt}</span>}
                            <ChevronDown className={`w-2.5 h-2.5 opacity-50 transition-transform ${isExp ? "rotate-180" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                    {expandedSeason && (
                      <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        {seasons.find(s => s.label === expandedSeason)!.months.map(m => {
                          const isSel = selectedMonths.includes(m);
                          return (
                            <button key={m} onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                              style={{ background: isSel ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.04)", color: isSel ? "#ff7d47" : "rgba(255,255,255,0.4)", border: `1px solid ${isSel ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2.5 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Difficulty</span>
                  </div>
                  <div className="p-3 flex flex-wrap gap-1.5">
                    {(["Easy","Moderate","Hard","Advanced","Extreme"] as Difficulty[]).map(val => {
                      const isSel = selectedDifficulties.includes(val);
                      const c = difficultyColor[val] ?? "#ff5100";
                      return (
                        <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                          style={{ background: isSel ? `${c}18` : "rgba(255,255,255,0.05)", color: isSel ? c : "rgba(255,255,255,0.55)", border: `1px solid ${isSel ? `${c}40` : "rgba(255,255,255,0.08)"}` }}>
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Duration + ACE row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Duration */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2.5 px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">Duration</span>
                  </div>
                  <div className="p-3 flex flex-wrap gap-1.5">
                    {(["Weekend","3–5 days","7+ days"] as Duration[]).map(val => {
                      const isSel = selectedDurations.includes(val);
                      return (
                        <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                          style={{ background: isSel ? "#ff5100" : "rgba(255,255,255,0.05)", color: isSel ? "#fff" : "rgba(255,255,255,0.55)", border: `1px solid ${isSel ? "#ff5100" : "rgba(255,255,255,0.08)"}` }}>
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ACE */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between px-3.5 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white/30">ACE™ Readiness</span>
                      {aceCategory && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>1</span>}
                    </div>
                    <a href="/ace" className="text-[9px] text-white/20 hover:text-[#ff5100] transition-colors">What is ACE™?</a>
                  </div>
                  <div className="p-3">
                    {!userProfile ? (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] text-white/30">No ACE profile yet</p>
                        <Link href="/matchmaker" className="shrink-0 inline-flex items-center gap-1 text-white font-semibold px-2.5 py-1 rounded-lg text-[10px] transition-all" style={{ background: "#ff5100" }}>
                          Take Assessment <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {([
                          { key: "ready" as AceCategory, label: "Ready Now", color: "#22c55e" },
                          { key: "stretch" as AceCategory, label: "Stretch", color: "#eab308" },
                          { key: "out-of-range" as AceCategory, label: "Out of Range", color: "#ef4444" },
                        ]).map(({ key, label, color }) => {
                          const isAct = aceCategory === key;
                          return (
                            <button key={key} onClick={() => setAceCategory(isAct ? null : key)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                              style={{ background: isAct ? `${color}18` : "rgba(255,255,255,0.05)", color: isAct ? color : "rgba(255,255,255,0.55)", border: `1px solid ${isAct ? `${color}40` : "rgba(255,255,255,0.08)"}` }}>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="px-3 lg:px-5 py-2 flex flex-wrap gap-1.5 border-t border-white/8" style={{ background: "rgba(6,9,18,0.97)" }}>
            {[
              ...selectedTypes.map(t => ({ label: t, remove: () => toggle(selectedTypes, t, setSelectedTypes) })),
              ...selectedRegions.map(r => ({ label: r, remove: () => toggle(selectedRegions, r, setSelectedRegions) })),
              ...selectedSubRegions.map(sr => ({ label: sr, remove: () => toggle(selectedSubRegions, sr, setSelectedSubRegions) })),
              ...selectedDifficulties.map(d => ({ label: d, remove: () => toggle(selectedDifficulties, d, setSelectedDifficulties) })),
              ...selectedDurations.map(d => ({ label: d, remove: () => toggle(selectedDurations, d, setSelectedDurations) })),
              ...selectedMonths.map(m => ({ label: m, remove: () => toggle(selectedMonths, m, setSelectedMonths) })),
              ...(aceCategory ? [{ label: `ACE: ${aceCategory === "ready" ? "Ready" : aceCategory === "stretch" ? "Stretch" : "Out of Range"}`, remove: () => setAceCategory(null) }] : []),
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
            overlays={activeOverlay ? new Set([activeOverlay]) : new Set()}
            userPhotos={userPhotos}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#f0ebe0" }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#b0a898" }} />
          </div>
        )}

        {/* Difficulty legend */}
        <div
          className="absolute bottom-5 left-4 z-[1000] rounded-xl px-3 py-2.5"
          style={{
            background: "rgba(4,7,14,0.88)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <p className="text-[8px] font-black uppercase tracking-[0.22em] mb-2 text-white/25">Difficulty</p>
          <div className="flex flex-col gap-1">
            {Object.entries(difficultyColor).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] font-medium text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>

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
    </div>
  );
}
