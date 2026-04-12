"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    if (!mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      const container = mapRef.current as HTMLElement & { _leaflet_id?: number };
      if (container._leaflet_id) {
        mapInstanceRef.current?.remove();
        mapInstanceRef.current = null;
        container._leaflet_id = undefined;
      }
      if (mapInstanceRef.current) return;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);

      function makeIcon(color: string, size: number, isActive = false) {
        const pulse = isActive
          ? `<circle cx="16" cy="16" r="18" fill="${color}" opacity="0.15"/>`
          : "";
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
          ${pulse}
          <circle cx="16" cy="16" r="${isActive ? 9 : 7}" fill="${color}" opacity="${isActive ? 1 : 0.9}"/>
          <circle cx="16" cy="16" r="${isActive ? 4 : 3}" fill="white" opacity="0.95"/>
        </svg>`;
        return L.divIcon({
          html: svg,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2) - 4],
        });
      }

      const currentMarker = L.marker([current.lat, current.lng], {
        icon: makeIcon("#ff5100", 36, true),
        zIndexOffset: 1000,
      }).addTo(map);

      currentMarker.bindPopup(
        `<div style="font-family:sans-serif;min-width:130px;padding:2px 0;">
          <p style="font-size:9px;color:#ff5100;font-weight:800;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.1em;">You are here</p>
          <p style="font-size:12px;font-weight:700;color:#0f1117;margin:0;line-height:1.3;">${current.name}</p>
        </div>`,
        { closeButton: false, className: "leaflet-popup-clean" }
      );

      const allPoints: [number, number][] = [[current.lat, current.lng]];

      nearby.forEach((a) => {
        const diff = computeDifficulty(getACE(a));
        const color = DIFF_COLORS[diff] ?? "#38bdf8";
        const km = Math.round(haversineKm(current.lat, current.lng, a.lat, a.lng));
        const marker = L.marker([a.lat, a.lng], {
          icon: makeIcon(color, 26),
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-family:sans-serif;min-width:130px;padding:2px 0;">
            <p style="font-size:9px;color:${color};font-weight:800;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">${diff} · ${km} km</p>
            <p style="font-size:12px;font-weight:700;color:#0f1117;margin:0 0 6px;line-height:1.3;">${a.name}</p>
            <a href="/experiences/${a.slug}" style="font-size:10px;color:#ff5100;font-weight:700;text-decoration:none;letter-spacing:0.03em;">View →</a>
          </div>`,
          { closeButton: false }
        );

        allPoints.push([a.lat, a.lng]);
      });

      if (allPoints.length > 1) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [28, 28], maxZoom: 10 });
      } else {
        map.setView([current.lat, current.lng], 9);
      }

      L.control.zoom({ position: "bottomright" }).addTo(map);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) {
        (mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id = undefined;
      }
    };
  }, [current, nearby]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase leading-none mb-1">Nearby</p>
          <p className="text-white/60 text-xs font-semibold">{nearby.length} adventures in region</p>
        </div>
        <span className="text-white/15 text-[9px] font-medium uppercase tracking-widest">Map</span>
      </div>

      {/* Map */}
      <div ref={mapRef} className="w-full h-44" style={{ background: "#0d1117" }} />

      {/* List */}
      <div className="divide-y" style={{ borderTop: "1px solid var(--border-subtle)", borderColor: "var(--border-subtle)" }}>
        {nearby.slice(0, 4).map((a) => {
          const diff = computeDifficulty(getACE(a));
          const color = DIFF_COLORS[diff] ?? "#38bdf8";
          const km = Math.round(haversineKm(current.lat, current.lng, a.lat, a.lng));
          return (
            <Link
              key={a.id}
              href={`/experiences/${a.slug}`}
              className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.03] transition-colors group"
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <p className="text-white/65 text-[11px] font-semibold group-hover:text-white/90 transition-colors truncate leading-none mb-0.5">{a.name}</p>
                <p className="text-white/20 text-[9px] uppercase tracking-wide">{diff} · {a.type}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-white/30 text-[10px] tabular-nums">{km} km</span>
                <ArrowRight className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
