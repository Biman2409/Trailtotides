"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Adventure } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";

interface Props {
  current: Adventure;
  nearby: Adventure[];
}

const DIFF_COLORS: Record<string, string> = {
  Easy: "#10b981",
  Moderate: "#38bdf8",
  Hard: "#a78bfa",
  Advanced: "#ff5100",
  Extreme: "#ef4444",
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyAdventuresMap({ current, nearby }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);

      L.control.attribution({ prefix: false }).addTo(map);

      // Current adventure marker (orange, larger)
      const currentDiff = computeDifficulty(getACE(current));
      const currentColor = DIFF_COLORS[currentDiff] ?? "#ff5100";

      function makeIcon(color: string, size: number, isActive = false) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.3}" viewBox="0 0 32 42">
          <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.6"/></filter>
          <circle cx="16" cy="16" r="${isActive ? 13 : 11}" fill="${color}" filter="url(#sh)" opacity="${isActive ? 1 : 0.85}"/>
          ${isActive ? `<circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>` : `<circle cx="16" cy="16" r="5" fill="white" opacity="0.7"/>`}
          <line x1="16" y1="${isActive ? 29 : 27}" x2="16" y2="40" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
        return L.divIcon({
          html: svg,
          className: "",
          iconSize: [size, size * 1.3],
          iconAnchor: [size / 2, size * 1.3],
          popupAnchor: [0, -size],
        });
      }

      // Current marker
      const currentMarker = L.marker([current.lat, current.lng], {
        icon: makeIcon("#ff5100", 36, true),
        zIndexOffset: 1000,
      }).addTo(map);

      currentMarker.bindPopup(
        `<div style="font-family:sans-serif;min-width:140px;">
          <p style="font-size:11px;color:#ff5100;font-weight:700;margin:0 0 3px;text-transform:uppercase;letter-spacing:0.08em;">You are here</p>
          <p style="font-size:13px;font-weight:700;color:#1a1f2e;margin:0;">${current.name}</p>
        </div>`,
        { closeButton: false }
      );

      // Nearby markers
      const allPoints: [number, number][] = [[current.lat, current.lng]];

      nearby.forEach((a) => {
        const diff = computeDifficulty(getACE(a));
        const color = DIFF_COLORS[diff] ?? "#38bdf8";
        const km = Math.round(haversineKm(current.lat, current.lng, a.lat, a.lng));
        const marker = L.marker([a.lat, a.lng], {
          icon: makeIcon(color, 28),
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-family:sans-serif;min-width:140px;">
            <p style="font-size:10px;color:${color};font-weight:700;margin:0 0 3px;text-transform:uppercase;">${diff} · ${km}km away</p>
            <p style="font-size:12px;font-weight:700;color:#1a1f2e;margin:0 0 6px;">${a.name}</p>
            <a href="/experiences/${a.slug}" style="font-size:11px;color:#ff5100;font-weight:600;text-decoration:none;">View adventure →</a>
          </div>`,
          { closeButton: false }
        );

        allPoints.push([a.lat, a.lng]);
      });

      // Fit bounds to show all markers
      if (allPoints.length > 1) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [32, 32], maxZoom: 10 });
      } else {
        map.setView([current.lat, current.lng], 9);
      }

      // Add zoom controls (bottom-right)
      L.control.zoom({ position: "bottomright" }).addTo(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [current, nearby]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border-subtle)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "var(--bg-surface)" }}>
        <div>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">Nearby Adventures</p>
          <p className="text-white/35 text-xs mt-0.5">{nearby.length} within the region</p>
        </div>
        <MapPin className="w-4 h-4 text-white/20" />
      </div>

      {/* Map */}
      <div ref={mapRef} className="w-full h-56" style={{ background: "#0d1117" }} />

      {/* Nearby list */}
      <div style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
        {nearby.slice(0, 4).map((a) => {
          const diff = computeDifficulty(getACE(a));
          const color = DIFF_COLORS[diff] ?? "#38bdf8";
          const km = Math.round(haversineKm(current.lat, current.lng, a.lat, a.lng));
          return (
            <Link
              key={a.id}
              href={`/experiences/${a.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 transition-colors group"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-semibold group-hover:text-white transition-colors truncate">{a.name}</p>
                <p className="text-white/25 text-[10px] mt-0.5">{diff} · {a.type}</p>
              </div>
              <span className="text-white/25 text-[10px] shrink-0">{km} km</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
