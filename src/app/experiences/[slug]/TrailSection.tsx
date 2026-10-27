"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Download, Smartphone, MapPinned, Mountain, TrendingUp, Route, Flag, ArrowRight } from "lucide-react";
import { BASE_LAYERS, LIGHT_BASE, createBaseLayer, loadLeaflet } from "@/app/map/mapShared";
import { trailHighPoint, type Trail } from "@/lib/trails/shared";
import Link from "next/link";

const ORANGE = "#ff5100";
const TEAL = "#0e7c86";

const fmt = (n: number) => n.toLocaleString("en-IN");

/**
 * The walking line from OpenStreetMap: its key numbers, the route on a map with numbered stops,
 * and the offline download. The itinerary, elevation and weather live in the At a glance strip.
 */
export default function TrailSection({ trail, slug, name }: { trail: Trail; slug: string; name: string }) {
  const high = trailHighPoint(trail);

  const stats = [
    { icon: Route, label: "One way", value: `${trail.lengthKm} km` },
    { icon: TrendingUp, label: "Total climb", value: `${fmt(trail.ascentM)} m` },
    { icon: Mountain, label: "Highest stop", value: `${fmt(high.ele ?? 0)} m`, sub: high.name },
    { icon: Flag, label: "Stops", value: String(trail.stops.length), sub: `${trail.stops[0].name} to ${trail.stops[trail.stops.length - 1].name}` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl px-3.5 py-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
              <s.icon className="w-3 h-3" />{s.label}
            </p>
            <p className="text-[17px] font-semibold mt-1 tabular-nums" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            {s.sub && <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      <TrailMap trail={trail} hoverPoint={null} />
      <p className="text-[12px] -mt-2" style={{ color: "var(--text-tertiary)" }}>
        The day-by-day itinerary, elevation profile and weather at each stop are in <a href="#at-a-glance" className="underline underline-offset-2 hover:text-[#ff5100]">At a glance</a>, above.
      </p>

      {/* Offline */}
      <div className="rounded-xl p-4 sm:p-5" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.22)" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
              <Smartphone className="w-4 h-4" style={{ color: ORANGE }} />Take it offline
            </p>
            <p className="text-[13px] mt-1 max-w-[60ch]" style={{ color: "var(--text-secondary)" }}>
              There&apos;s no signal for most of this trail. Your phone&apos;s GPS still works without it, so load the trail into a map app before you go.
            </p>
            <Link href={`/trailpedia/offline-maps?trek=${slug}`} className="inline-flex items-center gap-1 mt-2 text-[13px] font-semibold hover:underline underline-offset-2" style={{ color: ORANGE }}>
              How to use it offline: Android, iPhone, computer, GPS watch <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <a
            href={`/experiences/${slug}/trail.gpx`}
            download={`${slug}-trail-to-tides.gpx`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-bold text-white shrink-0 transition-colors hover:brightness-110"
            style={{ background: ORANGE }}
          >
            <Download className="w-4 h-4" />Download trail (GPX)
          </a>
        </div>
        <p className="text-[11px] mt-3 flex items-start gap-1.5" style={{ color: "var(--text-tertiary)" }}>
          <MapPinned className="w-3 h-3 mt-0.5 shrink-0" />
          Paths change after landslides and snow: follow your guide and the {name} route your operator gives you.
        </p>
      </div>
    </div>
  );
}

function TrailMap({ trail, hoverPoint }: { trail: Trail; hoverPoint: [number, number, number] | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const dotRef = useRef<import("leaflet").CircleMarker | null>(null);
  const { resolvedTheme } = useTheme();
  // Same pattern as the nearby map: a fixed default until mounted, then the real theme
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme !== "light";

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !ref.current) return;
      const el = ref.current as HTMLElement & { _leaflet_id?: number };
      if (el._leaflet_id) { mapRef.current?.remove(); el._leaflet_id = undefined; }

      const map = L.map(el, { zoomControl: false, scrollWheelZoom: false, attributionControl: false, maxZoom: 16 });
      mapRef.current = map;
      // Credits (OpenStreetMap's licence requires them) stay behind a small ⓘ, as on the site's
      // other maps: tap to show, tap again to hide. The trail's source is also in the GPX file.
      const CreditToggle = L.Control.extend({
        onAdd() {
          const btn = L.DomUtil.create("button", "ttt-trail-credit");
          btn.type = "button";
          btn.textContent = "i";
          btn.setAttribute("aria-label", "Map and trail credits");
          L.DomEvent.disableClickPropagation(btn);
          L.DomEvent.on(btn, "click", () => el.classList.toggle("ttt-credits-open"));
          return btn;
        },
      });
      new CreditToggle({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomright", prefix: false }).addAttribution("Trail: © OpenStreetMap contributors, via BRouter").addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      createBaseLayer(L, isDark ? BASE_LAYERS.map : LIGHT_BASE).then((base) => {
        if (!cancelled && mapRef.current === map) base.addTo(map);
      });

      const latlngs = trail.line.map(([la, lo]) => [la, lo] as [number, number]);
      // A pale casing under the line keeps it readable on both map themes
      L.polyline(latlngs, { color: isDark ? "#000" : "#fff", weight: 7, opacity: 0.55 }).addTo(map);
      L.polyline(latlngs, { color: ORANGE, weight: 4, opacity: 1 }).addTo(map);

      const pin = (label: string, color: string) => L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;color:#fff;font:700 11px/18px system-ui,sans-serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.4)">${label}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      trail.stops.forEach((s, i) => {
        L.marker([s.lat, s.lng], { icon: pin(String(i + 1), ORANGE), zIndexOffset: 500 })
          .bindTooltip(`${s.name} · km ${s.km}${s.ele != null ? ` · ${s.ele.toLocaleString("en-IN")} m` : ""}`, { direction: "top", offset: [0, -12] })
          .addTo(map);
      });
      trail.side.forEach((s) => {
        L.marker([s.lat, s.lng], { icon: pin("▲", TEAL) })
          .bindTooltip(`${s.name} (side trip)${s.ele != null ? ` · ${s.ele.toLocaleString("en-IN")} m` : ""}`, { direction: "top", offset: [0, -12] })
          .addTo(map);
      });

      dotRef.current = L.circleMarker([0, 0], { radius: 6, color: "#fff", weight: 2, fillColor: ORANGE, fillOpacity: 1, opacity: 0 }).addTo(map);
      map.fitBounds(L.latLngBounds(latlngs), { padding: [24, 24] });
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      dotRef.current = null;
    };
  }, [trail, isDark]);

  // The profile's hover position, shown on the map
  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    if (hoverPoint) { dot.setLatLng([hoverPoint[0], hoverPoint[1]]); dot.setStyle({ opacity: 1, fillOpacity: 1 }); }
    else dot.setStyle({ opacity: 0, fillOpacity: 0 });
  }, [hoverPoint]);

  return (
    <>
      <style>{`
        .ttt-trail-map .leaflet-control-attribution { display: none; font-size: 9.5px; line-height: 1.4; padding: 3px 8px; margin: 0 6px 4px 0; border-radius: 8px; max-width: 92%;
          background: var(--bg-surface) !important; color: var(--text-tertiary) !important; }
        .ttt-trail-map .leaflet-control-attribution a { color: var(--text-secondary) !important; }
        .ttt-trail-map.ttt-credits-open .leaflet-control-attribution { display: block; }
        .ttt-trail-credit { width: 18px; height: 18px; margin: 0 6px 6px 0 !important; border-radius: 9999px; display: flex; align-items: center; justify-content: center;
          font: italic 600 10px/1 Georgia, serif; cursor: pointer; opacity: 0.6;
          background: var(--bg-surface); color: var(--text-tertiary); border: 1px solid var(--border-subtle); }
        .ttt-trail-credit:hover, .ttt-trail-map.ttt-credits-open .ttt-trail-credit { opacity: 1; color: #ff5100; }
      `}</style>
      <div ref={ref} className="ttt-trail-map w-full h-[340px] sm:h-[420px] rounded-xl overflow-hidden z-0" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface-2)" }} aria-label="Trail map" />
    </>
  );
}
