"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2,
  ArrowRight, LocateFixed, Map as MapIcon, Layers,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { typeIconSvg } from "@/lib/mapMarkerIcons";
import { adventures } from "@/lib/data";
import type { AdventureType, Region, Difficulty, Duration, Month, GroupSize, Adventure } from "@/lib/data";
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9a9590" }} />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin" style={{ color: "#9a9590" }} />}
        {!loading && query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
            <X className="w-3.5 h-3.5" style={{ color: "#9a9590" }} />
          </button>
        )}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search adventures or places…"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm placeholder-[#a0998f] border border-transparent focus:outline-none focus:border-[#c8bfb0] transition-colors"
          style={{ background: "#f0ebe0", color: "#1a1814" }}
        />
      </div>

      {open && (
        <div
          className="absolute z-[2000] top-full mt-2 w-full rounded-2xl overflow-hidden text-sm min-w-[300px]"
          style={{ background: "#fff", border: "1px solid #e8e0d0", boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {adventureMatches.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1.5 text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "#c0b8ad" }}>Adventures</p>
              {adventureMatches.map(a => (
                <button
                  key={a.id}
                  onMouseDown={() => handleAdvSelect(a)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
                  style={{ color: "#1a1814" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#faf6ef")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={a.heroImage} alt={a.name} fill className="object-cover" sizes="32px" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] truncate">{a.name}</p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: "#9a9590" }}>{a.type} · {a.state}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: difficultyColor[a.difficulty] }} />
                </button>
              ))}
            </>
          )}
          {placeResults.length > 0 && (
            <>
              <p className={`px-4 pb-1.5 text-[9px] font-black uppercase tracking-[0.25em] ${adventureMatches.length > 0 ? "pt-2.5 border-t border-[#f0ece4]" : "pt-3"}`} style={{ color: "#c0b8ad" }}>
                Places
              </p>
              {placeResults.map(r => (
                <button
                  key={r.place_id}
                  onMouseDown={() => handlePlaceSelect(r)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = "#faf6ef")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#ff5100" }} />
                  <span className="line-clamp-1 text-[13px]" style={{ color: "#1a1814" }}>{r.display_name}</span>
                </button>
              ))}
            </>
          )}
          <div className="px-4 py-2.5 border-t" style={{ borderColor: "#f0ece4" }}>
            <p className="text-[9px]" style={{ color: "#c0b8ad" }}>Adventure → fly to pin · Place → navigate to location</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Map View ──────────────────────────────────────────────────────────────────

const BASE_TILE = {
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom: 19,
};

const OVERLAY_LAYERS = {
  terrain: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Topo &copy; Esri, DeLorme, NAVTEQ, TomTom, USGS, NGA, EPA",
    maxZoom: 19,
    opacityAlone: 1,
    opacityWithSat: 0.6,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
    opacityAlone: 1,
    opacityWithSat: 1,
  },
} as const;

type OverlayKey = keyof typeof OVERLAY_LAYERS;

function MapView({
  adventures: advs,
  flyToRef,
  openPinRef,
  overlays,
}: {
  adventures: Adventure[];
  flyToRef: React.MutableRefObject<((lat: number, lng: number) => void) | null>;
  openPinRef: React.MutableRefObject<((slug: string) => void) | null>;
  overlays: Set<OverlayKey>;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const overlayLayerRefs = useRef<Partial<Record<OverlayKey, L.TileLayer>>>({});

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
            <span style="background:${diffColor}22;color:${diffColor};font-size:9.5px;font-weight:700;padding:2.5px 8px;border-radius:20px;border:1px solid ${diffColor}55;letter-spacing:0.04em;">${adv.difficulty}</span>
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
          <a href="/experiences/${adv.slug}" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#ff5100;color:white;padding:9px 14px;border-radius:10px;font-size:12px;font-weight:600;text-decoration:none;letter-spacing:0.01em;">
            View Experience
            <span style="font-size:15px;line-height:1;margin-top:-1px;">→</span>
          </a>
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

      leaflet.tileLayer(BASE_TILE.url, { maxZoom: BASE_TILE.maxZoom, attribution: BASE_TILE.attribution }).addTo(map);
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
      if (!map) return;

      (Object.keys(OVERLAY_LAYERS) as OverlayKey[]).forEach(key => {
        const cfg = OVERLAY_LAYERS[key];
        const wantOn = overlays.has(key);

        if (wantOn) {
          if (!overlayLayerRefs.current[key]) {
            overlayLayerRefs.current[key] = leaflet.tileLayer(cfg.url, {
              maxZoom: cfg.maxZoom,
              attribution: cfg.attribution,
              opacity: cfg.opacityAlone,
              keepBuffer: 4,
            });
          }
          if (!map.hasLayer(overlayLayerRefs.current[key]!)) {
            overlayLayerRefs.current[key]!.addTo(map);
          }
        } else {
          if (overlayLayerRefs.current[key] && map.hasLayer(overlayLayerRefs.current[key]!)) {
            map.removeLayer(overlayLayerRefs.current[key]!);
          }
        }
      });
    });
  }, [overlays]);

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

  function toggleOverlay(key: OverlayKey) {
    setActiveOverlay(prev => prev === key ? null : key);
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
  const [selectedGroupSizes, setSelectedGroupSizes] = useState<GroupSize[]>([]);
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  const [expandedRegion, setExpandedRegion] = useState<Region | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [aceCategory, setAceCategory] = useState<AceCategory | null>(null);
  const [userProfile, setUserProfile] = useState<StoredProfile | null>(null);

  useEffect(() => { setMounted(true); setUserProfile(loadProfile()); }, []);

  function toggle<T>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  function clearAll() {
    setSearch(""); setSelectedTypes([]); setSelectedRegions([]);
    setSelectedDifficulties([]); setSelectedDurations([]);
    setSelectedMonths([]); setSelectedGroupSizes([]); setSelectedSubRegions([]);
    setExpandedRegion(null); setExpandedCategory(null); setExpandedSeason(null);
    setAceCategory(null);
  }

  const activeFilterCount =
    selectedTypes.length + selectedRegions.length + selectedSubRegions.length +
    selectedDifficulties.length + selectedDurations.length +
    selectedMonths.length + selectedGroupSizes.length + (aceCategory !== null ? 1 : 0);

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
    if (selectedGroupSizes.length && !selectedGroupSizes.includes(a.groupSize)) return false;
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
        : "text-[#4a4540] hover:bg-[#ede8de]"
    }`;

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <Navbar />
      <div className="h-16 lg:h-20 shrink-0" />

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div
        className="z-[1001] shrink-0"
        style={{ background: "rgba(255,253,248,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e0d0", boxShadow: "0 1px 0 #e8e0d0" }}
      >
        <div className="max-w-7xl mx-auto px-3 lg:px-5 py-2 flex items-center gap-2">

          <UnifiedSearch
            onAdventureSearch={setSearch}
            onPlaceSelect={(lat, lng) => flyToRef.current?.(lat, lng)}
            onAdventurePin={adv => openPinRef.current?.(adv.slug)}
          />

          {/* Layer toggles */}
          <div
            className="flex items-center rounded-xl overflow-hidden shrink-0"
            style={{ border: "1px solid #e0d8c8", background: "#f0ebe0" }}
          >
            <button
              onClick={() => toggleOverlay("terrain")}
              title="Terrain layer"
              className={tbBtn(activeOverlay === "terrain")}
              style={activeOverlay === "terrain" ? { background: "#1e3d2f" } : {}}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terrain</span>
            </button>
            <div style={{ width: 1, alignSelf: "stretch", background: "#e0d8c8" }} />
            <button
              onClick={() => toggleOverlay("satellite")}
              title="Satellite imagery"
              className={tbBtn(activeOverlay === "satellite")}
              style={activeOverlay === "satellite" ? { background: "#1e3d2f" } : {}}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Satellite</span>
            </button>
          </div>

          {/* Near Me */}
          <div className="relative shrink-0">
            <button
              onClick={handleNearMe}
              title={nearMe ? "Clear Near Me" : "Adventures Near Me"}
              className={tbBtn(nearMe !== null, nearMe !== null)}
              style={nearMe ? { background: "#ff5100" } : nearMeError ? { background: "#fff0ee", color: "#ef4444", border: "1px solid #fca5a5" } : { background: "#f0ebe0", border: "1px solid #e0d8c8" }}
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
            style={filtersOpen || activeFilterCount > 0 ? { background: "#1e3d2f" } : { background: "#f0ebe0", border: "1px solid #e0d8c8" }}
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
          <span className="hidden lg:block text-[11px] font-medium shrink-0" style={{ color: "#a0998f" }}>
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
          <div
            className="border-t px-3 lg:px-5 py-5 max-h-[58vh] overflow-y-auto"
            style={{ borderColor: "#e8e0d0", background: "#fdfcfb" }}
          >
            <div className="max-w-7xl mx-auto">
              {activeFilterCount > 0 && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: "#ff5100" }}
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-7">

                {/* Adventure Type */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#b0a898" }}>Adventure Type</h3>
                  {(() => {
                    const categories = [
                      { label: "Land",  types: ["Trekking","Mountaineering","Rock Climbing","Scrambling","Biking","Cycling","Jeep Safari","Caving","Urban Adventure"] },
                      { label: "Water", types: ["Diving","Kayaking"] },
                      { label: "Snow",  types: ["Skiing"] },
                      { label: "Air",   types: [] as string[] },
                    ];
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {categories.map(cat => {
                            const isExpanded = expandedCategory === cat.label;
                            const hasSelected = cat.types.some(t => selectedTypes.includes(t as AdventureType));
                            return (
                              <button key={cat.label} onClick={() => setExpandedCategory(isExpanded ? null : cat.label)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all"
                                style={isExpanded || hasSelected
                                  ? { background: "#ff5100", color: "white", borderColor: "#ff5100" }
                                  : { background: "white", borderColor: "#e0d8c8", color: "#3a3530" }}>
                                {cat.label}
                                {hasSelected && <span className="bg-white/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{cat.types.filter(t => selectedTypes.includes(t as AdventureType)).length}</span>}
                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedCategory && (() => {
                          const cat = categories.find(c => c.label === expandedCategory)!;
                          return (
                            <div className="rounded-xl border p-3" style={{ background: "white", borderColor: "#e0d8c8" }}>
                              {cat.types.length === 0 ? <p className="text-[11px] italic" style={{ color: "#ff5100", opacity: 0.5 }}>Coming soon</p> : (
                                <div className="flex flex-wrap gap-1.5">
                                  {cat.types.map(type => (
                                    <button key={type} onClick={() => toggle(selectedTypes, type as AdventureType, setSelectedTypes)}
                                      className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                                      style={selectedTypes.includes(type as AdventureType)
                                        ? { background: "#ff5100", color: "white" }
                                        : { background: "#f0ebe0", color: "#3a3530" }}>
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>

                {/* Region */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#b0a898" }}>Region</h3>
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
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {regionGroups.map(rg => {
                            const isExpanded = expandedRegion === rg.name;
                            const subCount = rg.subRegions.filter(sr => selectedSubRegions.includes(sr)).length;
                            const hasSelected = selectedRegions.includes(rg.name) || subCount > 0;
                            return (
                              <button key={rg.name} onClick={() => setExpandedRegion(isExpanded ? null : rg.name)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all"
                                style={isExpanded || hasSelected
                                  ? { background: "#ff5100", color: "white", borderColor: "#ff5100" }
                                  : { background: "white", borderColor: "#e0d8c8", color: "#3a3530" }}>
                                {rg.name}
                                {subCount > 0 && <span className="bg-white/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{subCount}</span>}
                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            );
                          })}
                        </div>
                        {expandedRegion && (() => {
                          const rg = regionGroups.find(r => r.name === expandedRegion)!;
                          return (
                            <div className="rounded-xl border p-3" style={{ background: "white", borderColor: "#e0d8c8" }}>
                              <div className="flex flex-wrap gap-1.5">
                                {rg.subRegions.map(sr => (
                                  <button key={sr} onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                    className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                                    style={selectedSubRegions.includes(sr)
                                      ? { background: "#ff5100", color: "white" }
                                      : { background: "#f0ebe0", color: "#3a3530" }}>
                                    {sr}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>

                {/* Season */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#b0a898" }}>Best Season</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      {seasons.map(({ label, months: sMonths }) => {
                        const isExpanded = expandedSeason === label;
                        const count = sMonths.filter(m => selectedMonths.includes(m)).length;
                        const hasSelected = count > 0;
                        return (
                          <button key={label} onClick={() => setExpandedSeason(isExpanded ? null : label)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all"
                            style={isExpanded || hasSelected
                              ? { background: "#ff5100", color: "white", borderColor: "#ff5100" }
                              : { background: "white", borderColor: "#e0d8c8", color: "#3a3530" }}>
                            {label}
                            {hasSelected && <span className="bg-white/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{count}</span>}
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                    {expandedSeason && (() => {
                      const season = seasons.find(s => s.label === expandedSeason)!;
                      return (
                        <div className="rounded-xl border p-3" style={{ background: "white", borderColor: "#e0d8c8" }}>
                          <div className="flex flex-wrap gap-1.5">
                            {season.months.map(m => (
                              <button key={m} onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                                className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                                style={selectedMonths.includes(m)
                                  ? { background: "#ff5100", color: "white" }
                                  : { background: "#f0ebe0", color: "#3a3530" }}>
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#b0a898" }}>Difficulty</h3>
                  <div className="flex flex-wrap gap-2">
                    {(["Easy","Moderate","Hard","Advanced","Extreme"] as Difficulty[]).map(val => {
                      const isSelected = selectedDifficulties.includes(val);
                      return (
                        <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all"
                          style={isSelected
                            ? { background: difficultyColor[val], color: "white", borderColor: difficultyColor[val] }
                            : { background: "white", borderColor: "#e0d8c8", color: "#3a3530" }}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: isSelected ? "rgba(255,255,255,0.55)" : difficultyColor[val] }} />
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration + Group Size */}
                <div className="col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-7">
                  <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#b0a898" }}>Duration</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(["Weekend","3–5 days","7+ days"] as Duration[]).map(val => (
                        <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                          className="px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all"
                          style={selectedDurations.includes(val)
                            ? { background: "#ff5100", color: "white", borderColor: "#ff5100" }
                            : { background: "white", borderColor: "#e0d8c8", color: "#3a3530" }}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#b0a898" }}>Group Size</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(["Solo","Small group (2–6)","Large group (6+)"] as GroupSize[]).map(val => (
                        <button key={val} onClick={() => toggle(selectedGroupSizes, val, setSelectedGroupSizes)}
                          className="px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap"
                          style={selectedGroupSizes.includes(val)
                            ? { background: "#ff5100", color: "white", borderColor: "#ff5100" }
                            : { background: "white", borderColor: "#e0d8c8", color: "#3a3530" }}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACE */}
                <div className="col-span-2 lg:col-span-3">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: "#b0a898" }}>ACE Profile Match</h3>
                  {!userProfile ? (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border" style={{ background: "white", borderColor: "#e0d8c8" }}>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#3a3530" }}>No ACE profile yet</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#9a9590" }}>Take the assessment to filter by capability</p>
                      </div>
                      <Link href="/matchmaker" className="shrink-0 inline-flex items-center gap-1.5 text-white font-semibold px-3 py-2 rounded-xl text-[11px] transition-all" style={{ background: "#ff5100" }}>
                        Take Assessment <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {([
                        { key: "ready" as AceCategory,        label: "Ready Now",        desc: "Matches your current level",          color: "#1e3d2f", bg: "#1e3d2f10", border: "#1e3d2f30" },
                        { key: "stretch" as AceCategory,      label: "Stretch Challenge", desc: "Slightly above your level",           color: "#b45309", bg: "#b4530910", border: "#b4530930" },
                        { key: "out-of-range" as AceCategory, label: "Out of Range",     desc: "Significantly beyond current ability", color: "#dc2626", bg: "#dc262610", border: "#dc262630" },
                      ]).map(({ key, label, desc, color, bg, border }) => {
                        const isActive = aceCategory === key;
                        return (
                          <button key={key} onClick={() => setAceCategory(isActive ? null : key)}
                            className="text-left p-3 rounded-xl border transition-all"
                            style={{ background: isActive ? bg : "white", borderColor: isActive ? border : "#e0d8c8" }}>
                            <p className="text-[11px] font-bold mb-0.5" style={{ color: isActive ? color : "#5a5550" }}>{label}</p>
                            <p className="text-[10px]" style={{ color: "#9a9590" }}>{desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="px-3 lg:px-5 py-2 flex flex-wrap gap-1.5 border-t" style={{ borderColor: "#e8e0d0", background: "#fff" }}>
            {[
              ...selectedTypes.map(t => ({ label: t, remove: () => toggle(selectedTypes, t, setSelectedTypes) })),
              ...selectedRegions.map(r => ({ label: r, remove: () => toggle(selectedRegions, r, setSelectedRegions) })),
              ...selectedSubRegions.map(sr => ({ label: sr, remove: () => toggle(selectedSubRegions, sr, setSelectedSubRegions) })),
              ...selectedDifficulties.map(d => ({ label: d, remove: () => toggle(selectedDifficulties, d, setSelectedDifficulties) })),
              ...selectedDurations.map(d => ({ label: d, remove: () => toggle(selectedDurations, d, setSelectedDurations) })),
              ...selectedMonths.map(m => ({ label: m, remove: () => toggle(selectedMonths, m, setSelectedMonths) })),
              ...selectedGroupSizes.map(g => ({ label: g, remove: () => toggle(selectedGroupSizes, g, setSelectedGroupSizes) })),
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
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#f0ebe0" }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#b0a898" }} />
          </div>
        )}

        {/* Difficulty legend — glass card */}
        <div
          className="absolute bottom-5 left-4 z-[1000] rounded-2xl px-3.5 py-3"
          style={{
            background: "rgba(255,253,248,0.88)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(232,224,208,0.8)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <p className="text-[8px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#b0a898" }}>Difficulty</p>
          <div className="flex flex-col gap-1">
            {Object.entries(difficultyColor).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] font-medium" style={{ color: "#3a3530" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visible count pill — floats above map when filtered */}
        {(activeFilterCount > 0 || search) && (
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] text-white text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-lg"
            style={{ background: "#1e3d2f", boxShadow: "0 4px 14px rgba(30,61,47,0.4)" }}
          >
            {visibleAdventures.length} adventure{visibleAdventures.length !== 1 ? "s" : ""} shown
          </div>
        )}

        {/* Branding chip */}
        <div
          className="absolute bottom-5 right-4 z-[1000] rounded-xl px-2.5 py-1.5"
          style={{
            background: "rgba(255,253,248,0.82)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(232,224,208,0.7)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase" style={{ color: "#9a9590" }}>
            <MapIcon className="w-2.5 h-2.5" />
            Trail to Tides
          </div>
        </div>
      </div>
    </div>
  );
}
