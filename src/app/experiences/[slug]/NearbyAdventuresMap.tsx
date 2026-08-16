"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Adventure } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";
import { haversineKm } from "@/lib/geo";
import { typeIconSvg } from "@/lib/mapMarkerIcons";

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

export default function NearbyAdventuresMap({ current, nearby }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const router = useRouter();

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

      let style = document.getElementById("ttt-nearby-map-style") as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = "ttt-nearby-map-style";
        document.head.appendChild(style);
      }
      style.textContent = `
        .ttt-nearby-map .leaflet-control-zoom a {
          background: ${isDark ? "rgba(9,16,31,0.9)" : "rgba(255,255,255,0.92)"} !important;
          border-color: ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,31,0.12)"} !important;
          color: ${isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,31,0.65)"} !important;
        }
        .ttt-nearby-map .leaflet-control-zoom a:hover {
          background: rgba(255,81,0,0.25) !important;
          color: #ff7d47 !important;
        }
        .ttt-marker-glow {
          filter: drop-shadow(0 0 3px var(--glow)) drop-shadow(0 0 ${isDark ? 9 : 5}px var(--glow));
          transition: transform 0.15s ease-out;
        }
        .ttt-nearby-map .leaflet-marker-icon {
          cursor: pointer;
        }
        .ttt-nearby-map .leaflet-marker-icon:hover .ttt-marker-glow {
          transform: scale(1.18);
        }
        .ttt-marker-pulse {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          animation: ttt-marker-pulse-anim 2.4s cubic-bezier(0.4,0,0.6,1) infinite;
        }
        @keyframes ttt-marker-pulse-anim {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .ttt-nearby-tooltip {
          background: rgba(4,7,14,0.92) !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          color: #fff !important;
          font-family: sans-serif !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 4px 9px !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35) !important;
        }
        .ttt-nearby-tooltip::before {
          border-top-color: rgba(4,7,14,0.92) !important;
        }
      `;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      L.tileLayer(tileUrl, { maxZoom: isDark ? 18 : 19 }).addTo(map);

      function makeIcon(color: string, size: number, type: string, isActive = false) {
        const iconSize = Math.round(size * 0.42);
        const svgIcon = typeIconSvg(type, iconSize, "white");
        const html = `<div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
          ${isActive ? `<span class="ttt-marker-pulse" style="background:${color};"></span>` : ""}
          <div class="ttt-marker-glow" style="--glow:${color};position:relative;width:${isActive ? 22 : 16}px;height:${isActive ? 22 : 16}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:inset 0 1px 0 rgba(255,255,255,0.35);">
            ${svgIcon}
          </div>
        </div>`;
        return L.divIcon({
          html,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2) - 4],
        });
      }

      const currentMarker = L.marker([current.lat, current.lng], {
        icon: makeIcon("#ff5100", 36, current.type, true),
        zIndexOffset: 1000,
      }).addTo(map);

      currentMarker.bindTooltip(`${current.name} · You are here`, {
        direction: "top",
        offset: [0, -22],
        opacity: 0.95,
        className: "ttt-nearby-tooltip",
      });

      const allPoints: [number, number][] = [[current.lat, current.lng]];

      nearby.forEach((a) => {
        const diff = computeDifficulty(getACE(a));
        const color = DIFF_COLORS[diff] ?? "#38bdf8";
        const km = Math.round(haversineKm(current.lat, current.lng, a.lat, a.lng));
        const marker = L.marker([a.lat, a.lng], {
          icon: makeIcon(color, 26, a.type),
        }).addTo(map);

        marker.bindTooltip(`${a.name} · ${km} km`, {
          direction: "top",
          offset: [0, -16],
          opacity: 0.95,
          className: "ttt-nearby-tooltip",
        });

        marker.on("click", () => router.push(`/experiences/${a.slug}`));

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
  }, [current, nearby, isDark, router]);

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
      <div className="relative">
        <div ref={mapRef} className="ttt-nearby-map w-full h-44" style={{ background: isDark ? "#0d1117" : "#e5e3dc" }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px 0px rgba(0,0,0,${isDark ? 0.35 : 0.1})` }}
        />
      </div>

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
