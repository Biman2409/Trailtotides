"use client";

import { useEffect, useRef } from "react";
import type { Adventure } from "@/lib/data";

interface Props {
  adventures: Adventure[];
}

const difficultyColor: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Expert: "#ef4444",
};

const typeEmoji: Record<string, string> = {
  "Trekking": "🥾",
  "Biking": "🏍️",
  "Cycling": "🚴",
  "Diving": "🤿",
  "Kayaking": "🛶",
  "Skiing": "⛷️",
  "Mountaineering": "🧗",
};

declare global {
  interface Window { L: any }
}

function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }

    // CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // JS
    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(window.L);
      document.head.appendChild(script);
    } else {
      // script already inserted but may not be loaded yet — poll
      const poll = setInterval(() => {
        if (window.L) { clearInterval(poll); resolve(window.L); }
      }, 50);
    }
  });
}

export default function MapComponent({ adventures }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    loadLeaflet().then((L) => {
      if (!mapRef.current) return;

      // Guard against StrictMode double-invoke
      const container = mapRef.current;
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = undefined;
      }

      // Fix default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(container, {
        center: [22.5, 80.0],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
        { subdomains: "abcd", maxZoom: 19 }
      ).addTo(map);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
        { subdomains: "abcd", maxZoom: 19, opacity: 0.6 }
      ).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      addMarkers(L, adventures);
    });

    return () => {
      if (mapInstanceRef.current) {
        markersLayerRef.current = null;
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) {
        (mapRef.current as any)._leaflet_id = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    loadLeaflet().then((L) => {
      markersLayerRef.current.clearLayers();
      addMarkers(L, adventures);
    });
  }, [adventures]);

  function addMarkers(L: any, advs: Adventure[]) {
    advs.forEach((adv) => {
      const color = difficultyColor[adv.difficulty] ?? "#6366f1";
      const emoji = typeEmoji[adv.type] || "📍";

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:40px;height:40px;border-radius:50% 50% 50% 0;
          background:${color};border:3px solid white;
          transform:rotate(-45deg);
          box-shadow:0 4px 12px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="transform:rotate(45deg);font-size:14px;line-height:1;">${emoji}</span>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -44],
      });

      const popupHtml = `
        <div style="width:260px;font-family:'DM Sans',sans-serif;padding:4px;">
          <div style="position:relative;height:140px;border-radius:12px;overflow:hidden;margin-bottom:12px;">
            <img src="${adv.heroImage}" alt="${adv.name}"
              style="width:100%;height:100%;object-fit:cover;" />
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.6),transparent);" />
            <div style="position:absolute;bottom:8px;left:10px;display:flex;gap:6px;">
              <span style="background:rgba(26,31,46,0.85);color:rgba(255,255,255,0.8);font-size:10px;padding:3px 8px;border-radius:20px;">${adv.type}</span>
              <span style="background:${color}33;color:${color};font-size:10px;padding:3px 8px;border-radius:20px;">${adv.difficulty}</span>
            </div>
          </div>
          <h3 style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1a1f2e;line-height:1.3;">${adv.name}</h3>
          <p style="margin:0 0 10px;font-size:12px;color:#9a9590;">${adv.state} · ${adv.durationDays} · ${adv.bestSeason}</p>
          <p style="margin:0 0 12px;font-size:12px;color:#6b6560;line-height:1.5;">${adv.tagline}</p>
          <a href="/experiences/${adv.slug}"
            style="display:block;text-align:center;background:#1e3d2f;color:white;padding:9px;border-radius:10px;font-size:12px;font-weight:600;text-decoration:none;">
            View Experience →
          </a>
        </div>
      `;

      const marker = L.marker([adv.lat, adv.lng], { icon })
        .bindPopup(popupHtml, { maxWidth: 280, minWidth: 280 });

      marker.on("popupopen", () => {
        const popupEl = marker.getPopup()?.getElement();
        if (popupEl) {
          popupEl.style.cursor = "pointer";
          popupEl.addEventListener("click", () => {
            window.location.href = `/experiences/${adv.slug}`;
          });
        }
      });

      markersLayerRef.current.addLayer(marker);
    });
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
