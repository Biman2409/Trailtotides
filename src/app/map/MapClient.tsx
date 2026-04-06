"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin, Loader2,
  Zap, Activity, ShieldAlert, Trophy, Flame, CalendarRange, User, Users, ArrowRight,
  LocateFixed, Map as MapIcon, Layers,
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9a9590] animate-spin" />}
        {!loading && query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-[#9a9590] hover:text-[#1a1f2e]" />
          </button>
        )}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search adventures or places…"
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f5f0e8] text-[#1a1f2e] text-sm placeholder-[#9a9590] border border-transparent focus:outline-none focus:border-[#1e3d2f] transition-colors"
        />
      </div>

      {open && (
        <div className="absolute z-[2000] top-full mt-1.5 w-full bg-white rounded-2xl shadow-2xl border border-[#e8dfc8] overflow-hidden text-sm min-w-[300px]" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          {adventureMatches.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#b8b0a5]">Adventures</p>
              {adventureMatches.map(a => (
                <button
                  key={a.id}
                  onMouseDown={() => handleAdvSelect(a)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f5f0e8] flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <img src={a.heroImage} alt={a.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1a1f2e] font-semibold text-sm truncate">{a.name}</p>
                    <p className="text-[#9a9590] text-[10px] mt-0.5">{a.type} · {a.state}</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: difficultyColor[a.difficulty] }} />
                </button>
              ))}
            </>
          )}
          {placeResults.length > 0 && (
            <>
              <p className={`px-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#b8b0a5] ${adventureMatches.length > 0 ? "pt-2.5 border-t border-[#f0ece4]" : "pt-3"}`}>
                Places
              </p>
              {placeResults.map(r => (
                <button
                  key={r.place_id}
                  onMouseDown={() => handlePlaceSelect(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f5f0e8] flex items-center gap-3 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#ff5100] shrink-0" />
                  <span className="text-[#1a1f2e] line-clamp-1">{r.display_name}</span>
                </button>
              ))}
            </>
          )}
          <div className="px-4 py-2 border-t border-[#f5f0e8]">
            <p className="text-[10px] text-[#c4bdb5]">Select an adventure to fly to its pin · Select a place to navigate</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Map View ──────────────────────────────────────────────────────────────────

// Base layer — always on
const BASE_TILE = {
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom: 19,
};

// Overlay layers — toggled on top independently
const OVERLAY_LAYERS = {
  terrain: {
    // ESRI World Topo Map — fast global CDN, no key needed.
    // Shows: elevation contours, named peaks, glaciers (cyan), perennial rivers,
    // forest cover, passes, ridgelines, and spot elevations. Renders at all zoom levels.
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Topo &copy; Esri, DeLorme, NAVTEQ, TomTom, USGS, NGA, EPA",
    maxZoom: 19,
    opacityAlone: 1,      // full replace when only terrain is on
    opacityWithSat: 0.6,  // semi-transparent over satellite so imagery shows through
  },
  satellite: {
    // ESRI World Imagery — same CDN, consistent fast load.
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
    const svgIcon = typeIconSvg(adv.type, 13, "white");
    const icon = leaflet.divIcon({
      className: "",
      html: `<div style="position:relative;width:32px;height:38px;">
        <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${diffColor};transform:rotate(-45deg);box-shadow:0 3px 12px rgba(0,0,0,0.35);border:2px solid rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;">
          <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">${svgIcon}</div>
        </div>
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:${diffColor};border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>
      </div>`,
      iconSize: [32, 38],
      iconAnchor: [16, 38],
      popupAnchor: [0, -42],
    });

    const priceFrom = adv.operators?.find(o => o.priceFrom)?.priceFrom;
    const popupHtml = `
      <div style="width:268px;font-family:system-ui,-apple-system,sans-serif;">
        <div style="position:relative;height:144px;border-radius:14px 14px 0 0;overflow:hidden;">
          <img src="${adv.heroImage}" alt="${adv.name}" style="width:100%;height:100%;object-fit:cover;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.1) 55%,transparent 100%);" />
          <div style="position:absolute;bottom:10px;left:12px;right:12px;">
            <div style="display:flex;gap:5px;margin-bottom:6px;">
              <span style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);color:rgba(255,255,255,0.85);font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;">${adv.type}</span>
              <span style="background:${diffColor}30;color:${diffColor};font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid ${diffColor}60;">${adv.difficulty}</span>
            </div>
            <div style="font-size:14px;font-weight:700;color:#fff;line-height:1.25;text-shadow:0 1px 4px rgba(0,0,0,0.5);">${adv.name}</div>
          </div>
        </div>
        <div style="padding:12px 14px 14px;background:#fff;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:11px;color:#9a9590;">${adv.state} · ${adv.durationDays} · ${adv.bestSeason}</span>
            ${priceFrom ? `<span style="font-size:12px;font-weight:700;color:#10b981;">${priceFrom}</span>` : ""}
          </div>
          <p style="font-size:11.5px;color:#6b6560;line-height:1.55;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${adv.tagline}</p>
          <a href="/experiences/${adv.slug}" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#1e3d2f;color:white;padding:9px 12px;border-radius:10px;font-size:12px;font-weight:600;text-decoration:none;transition:background 0.15s;">
            View Experience
            <span style="font-size:14px;line-height:1;">→</span>
          </a>
        </div>
      </div>
    `;

    const marker = leaflet.marker([adv.lat, adv.lng], { icon })
      .bindPopup(popupHtml, { maxWidth: 268, minWidth: 268, className: "ttt-popup" });

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

  // Route overlays removed

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

  // Inject popup style once
  useEffect(() => {
    if (document.getElementById("ttt-popup-style")) return;
    const s = document.createElement("style");
    s.id = "ttt-popup-style";
    s.textContent = `
      .ttt-popup .leaflet-popup-content-wrapper { padding: 0; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.18); border: none; }
      .ttt-popup .leaflet-popup-content { margin: 0; }
      .ttt-popup .leaflet-popup-tip-container { display: none; }
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

      // Base layer — always present, always at bottom
      leaflet.tileLayer(BASE_TILE.url, { maxZoom: BASE_TILE.maxZoom, attribution: BASE_TILE.attribution }).addTo(map);

      // Zoom control — bottom right
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MCG = (leaflet as any).markerClusterGroup({
        maxClusterRadius: 55,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return leaflet.divIcon({
            html: `<div style="width:40px;height:40px;border-radius:50%;background:#ff5100;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(255,81,0,0.45);border:2.5px solid #fff;">${count}</div>`,
            className: "",
            iconSize: [40, 40],
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

  // Sync overlay layer — only one active at a time. Create each layer once, reuse on re-toggle.
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

  const btnBase = "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0";
  const btnIdle = "bg-[#f5f0e8] text-[#1a1f2e] hover:bg-[#ede8de]";
  const btnActive = "bg-[#1e3d2f] text-white";

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <Navbar />
      <div className="h-16 lg:h-20 shrink-0" />

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="z-[1001] bg-white border-b border-[#e8dfc8] shrink-0" style={{ boxShadow: "0 1px 0 #e8dfc8" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex items-center gap-2">

          <UnifiedSearch
            onAdventureSearch={setSearch}
            onPlaceSelect={(lat, lng) => flyToRef.current?.(lat, lng)}
            onAdventurePin={adv => openPinRef.current?.(adv.slug)}
          />

          {/* Overlay toggles — mutually exclusive, one at a time */}
          <div className="flex items-center rounded-xl overflow-hidden shrink-0" style={{ border: "1px solid #e8dfc8" }}>
            <button
              onClick={() => toggleOverlay("terrain")}
              title="Terrain / topo layer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all"
              style={{
                background: activeOverlay === "terrain" ? "#1e3d2f" : "#f5f0e8",
                color: activeOverlay === "terrain" ? "white" : "#4a4540",
                borderRight: "1px solid #e8dfc8",
              }}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Terrain</span>
            </button>
            <button
              onClick={() => toggleOverlay("satellite")}
              title="Satellite imagery"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all"
              style={{
                background: activeOverlay === "satellite" ? "#1e3d2f" : "#f5f0e8",
                color: activeOverlay === "satellite" ? "white" : "#4a4540",
              }}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Satellite</span>
            </button>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <button onClick={handleNearMe} title={nearMe ? "Clear Near Me" : "Adventures Near Me"}
              className={`${btnBase} ${nearMe ? "bg-[#ff5100] text-white" : nearMeError ? "bg-red-50 text-red-500 border border-red-200" : btnIdle}`}>
              {nearMeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
              <span className="hidden sm:inline">{nearMe ? "Near Me ✓" : "Near Me"}</span>
            </button>
            {nearMeError && (
              <span className="text-[10px] text-red-400 font-medium mt-0.5 whitespace-nowrap">Location denied</span>
            )}
          </div>

          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className={`${btnBase} ${filtersOpen || activeFilterCount > 0 ? btnActive : btnIdle}`}>
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#ff5100] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>

          <span className="hidden lg:block text-xs text-[#b8b0a5] font-medium ml-2 shrink-0">
            {visibleAdventures.length} / {adventures.length}
          </span>

          {(activeFilterCount > 0 || search) && (
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#ff5100] hover:text-[#e04800] font-semibold transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="border-t border-[#e8dfc8] bg-[#fdfcfb] px-4 lg:px-6 py-6 max-h-[60vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto">
            {activeFilterCount > 0 && (
              <div className="flex justify-end mb-5">
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#ff5100] hover:text-[#e04800] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all filters
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">

              {/* Adventure Type */}
              <div className="col-span-2 lg:col-span-3">
                <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#b8b0a5] mb-3">Adventure Type</h3>
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
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isExpanded || hasSelected ? "bg-[#ff5100] text-white border-[#ff5100]" : "bg-white border-[#e8dfc8] text-[#4a4540] hover:bg-[#f5f0e8]"}`}>
                              {cat.label}
                              {hasSelected && <span className="bg-white/30 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">{cat.types.filter(t => selectedTypes.includes(t as AdventureType)).length}</span>}
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                          );
                        })}
                      </div>
                      {expandedCategory && (() => {
                        const cat = categories.find(c => c.label === expandedCategory)!;
                        return (
                          <div className="rounded-xl border border-[#e8dfc8] bg-white p-3">
                            {cat.types.length === 0 ? <p className="text-xs text-[#ff5100]/60 italic">Coming soon</p> : (
                              <div className="flex flex-wrap gap-2">
                                {cat.types.map(type => (
                                  <button key={type} onClick={() => toggle(selectedTypes, type as AdventureType, setSelectedTypes)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTypes.includes(type as AdventureType) ? "bg-[#ff5100] text-white" : "bg-[#f5f0e8] text-[#4a4540] hover:bg-[#ede8de]"}`}>
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
                <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#b8b0a5] mb-3">Region</h3>
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
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isExpanded || hasSelected ? "bg-[#ff5100] text-white border-[#ff5100]" : "bg-white border-[#e8dfc8] text-[#4a4540] hover:bg-[#f5f0e8]"}`}>
                              {rg.name}
                              {subCount > 0 && <span className="bg-white/30 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">{subCount}</span>}
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                          );
                        })}
                      </div>
                      {expandedRegion && (() => {
                        const rg = regionGroups.find(r => r.name === expandedRegion)!;
                        return (
                          <div className="rounded-xl border border-[#e8dfc8] bg-white p-3">
                            <div className="flex flex-wrap gap-2">
                              {rg.subRegions.map(sr => (
                                <button key={sr} onClick={() => toggle(selectedSubRegions, sr, setSelectedSubRegions)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSubRegions.includes(sr) ? "bg-[#ff5100] text-white" : "bg-[#f5f0e8] text-[#4a4540] hover:bg-[#ede8de]"}`}>
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
                <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#b8b0a5] mb-3">Best Season</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {seasons.map(({ label, months: sMonths }) => {
                      const isExpanded = expandedSeason === label;
                      const count = sMonths.filter(m => selectedMonths.includes(m)).length;
                      const hasSelected = count > 0;
                      return (
                        <button key={label} onClick={() => setExpandedSeason(isExpanded ? null : label)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isExpanded || hasSelected ? "bg-[#ff5100] text-white border-[#ff5100]" : "bg-white border-[#e8dfc8] text-[#4a4540] hover:bg-[#f5f0e8]"}`}>
                          {label}
                          {hasSelected && <span className="bg-white/30 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">{count}</span>}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      );
                    })}
                  </div>
                  {expandedSeason && (() => {
                    const season = seasons.find(s => s.label === expandedSeason)!;
                    return (
                      <div className="rounded-xl border border-[#e8dfc8] bg-white p-3">
                        <div className="flex flex-wrap gap-2">
                          {season.months.map(m => (
                            <button key={m} onClick={() => toggle(selectedMonths, m, setSelectedMonths)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMonths.includes(m) ? "bg-[#ff5100] text-white" : "bg-[#f5f0e8] text-[#4a4540] hover:bg-[#ede8de]"}`}>
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
                <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#b8b0a5] mb-3">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {(["Easy","Moderate","Hard","Advanced","Extreme"] as Difficulty[]).map(val => {
                    const isSelected = selectedDifficulties.includes(val);
                    return (
                      <button key={val} onClick={() => toggle(selectedDifficulties, val, setSelectedDifficulties)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isSelected ? "text-white border-transparent" : "bg-white border-[#e8dfc8] text-[#4a4540] hover:bg-[#f5f0e8]"}`}
                        style={isSelected ? { background: difficultyColor[val], borderColor: difficultyColor[val] } : {}}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white/60 shrink-0" />}
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration + Group Size */}
              <div className="col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#b8b0a5] mb-3">Duration</h3>
                  <div className="flex flex-wrap gap-2">
                    {(["Weekend","3–5 days","7+ days"] as Duration[]).map(val => (
                      <button key={val} onClick={() => toggle(selectedDurations, val, setSelectedDurations)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedDurations.includes(val) ? "bg-[#ff5100] text-white border-[#ff5100]" : "bg-white border-[#e8dfc8] text-[#4a4540] hover:bg-[#f5f0e8]"}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#b8b0a5] mb-3">Group Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {(["Solo","Small group (2–6)","Large group (6+)"] as GroupSize[]).map(val => (
                      <button key={val} onClick={() => toggle(selectedGroupSizes, val, setSelectedGroupSizes)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${selectedGroupSizes.includes(val) ? "bg-[#ff5100] text-white border-[#ff5100]" : "bg-white border-[#e8dfc8] text-[#4a4540] hover:bg-[#f5f0e8]"}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACE */}
              <div className="col-span-2 lg:col-span-3">
                <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#b8b0a5] mb-3">ACE Profile Match</h3>
                {!userProfile ? (
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#e8dfc8]">
                    <div>
                      <p className="text-sm font-medium text-[#4a4540]">No ACE profile yet</p>
                      <p className="text-xs text-[#9a9590] mt-0.5">Take the assessment to filter by capability</p>
                    </div>
                    <Link href="/matchmaker" className="shrink-0 inline-flex items-center gap-1.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-3 py-2 rounded-xl text-xs transition-all">
                      Take Assessment <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      { key: "ready" as AceCategory,         label: "Ready Now",        desc: "Matches your current level",          color: "#1e3d2f", bg: "#1e3d2f12", border: "#1e3d2f35" },
                      { key: "stretch" as AceCategory,       label: "Stretch Challenge", desc: "Slightly above your level",           color: "#b45309", bg: "#b4530912", border: "#b4530935" },
                      { key: "out-of-range" as AceCategory,  label: "Out of Range",     desc: "Significantly beyond current ability", color: "#dc2626", bg: "#dc262612", border: "#dc262635" },
                    ]).map(({ key, label, desc, color, bg, border }) => {
                      const isActive = aceCategory === key;
                      return (
                        <button key={key} onClick={() => setAceCategory(isActive ? null : key)}
                          className="text-left p-3.5 rounded-xl border transition-all"
                          style={{ background: isActive ? bg : "white", borderColor: isActive ? border : "#e8dfc8" }}>
                          <p className="text-xs font-bold mb-0.5" style={{ color: isActive ? color : "#6b6560" }}>{label}</p>
                          <p className="text-[11px] text-[#9a9590]">{desc}</p>
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

        {/* Active chips */}
        {activeFilterCount > 0 && (
          <div className="px-4 lg:px-6 py-2.5 flex flex-wrap gap-1.5 border-t border-[#e8dfc8] bg-white">
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
              <span key={label} onClick={remove}
                className="flex items-center gap-1 bg-[#ff5100]/10 text-[#ff5100] px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer hover:bg-[#ff5100]/20 transition-colors">
                {label} <X className="w-3 h-3" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {mounted ? (
          <MapView adventures={sortedAdventures} flyToRef={flyToRef} openPinRef={openPinRef} overlays={activeOverlay ? new Set([activeOverlay]) : new Set()} />
        ) : (
          <div className="w-full h-full bg-[#f5f0e8] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#b8b0a5] animate-spin" />
          </div>
        )}

        {/* Difficulty legend */}
        <div className="absolute bottom-5 left-4 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl border border-[#e8dfc8] px-4 py-3 shadow-lg">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b8b0a5] mb-2">Difficulty</p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(difficultyColor).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] font-medium text-[#4a4540]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Branding chip */}
        <div className="absolute bottom-5 right-4 z-[1000] bg-white/80 backdrop-blur-md rounded-xl border border-[#e8dfc8] px-3 py-1.5 shadow">
          <div className="flex items-center gap-1.5 text-[#9a9590] text-[10px] font-semibold tracking-wide">
            <MapIcon className="w-3 h-3" />
            TRAIL TO TIDES
          </div>
        </div>

        {/* Visible count badge (when filtered) */}
        {(activeFilterCount > 0 || search) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-[#1e3d2f] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
            {visibleAdventures.length} adventure{visibleAdventures.length !== 1 ? "s" : ""} visible
          </div>
        )}
      </div>
    </div>
  );
}
