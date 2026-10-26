"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Download, Smartphone, MapPinned, Mountain, TrendingUp, Route, Flag, ArrowRight } from "lucide-react";
import { BASE_LAYERS, LIGHT_BASE, createBaseLayer, loadLeaflet } from "@/app/map/mapShared";
import { trailProfile, trailHighPoint, type Trail } from "@/lib/trails/shared";
import Link from "next/link";

const ORANGE = "#ff5100";
const TEAL = "#0e7c86";

const fmt = (n: number) => n.toLocaleString("en-IN");

/**
 * The walking line from OpenStreetMap: the route on a map, an elevation profile that moves a marker
 * along it, the stops with distances, and how to take it offline in a phone map app.
 */
export default function TrailSection({ trail, slug, name }: { trail: Trail; slug: string; name: string }) {
  const profile = useMemo(() => trailProfile(trail), [trail]);
  const high = trailHighPoint(trail);
  const [hover, setHover] = useState<number | null>(null);

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

      <TrailMap trail={trail} hoverPoint={hover != null ? trail.line[hover] : null} />

      <ElevationProfile trail={trail} profile={profile} hover={hover} onHover={setHover} />

      {/* Stops */}
      <ol className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
        {trail.stops.map((s, i) => {
          const prev = trail.stops[i - 1];
          const climb = prev && s.ele != null && prev.ele != null ? s.ele - prev.ele : null;
          return (
            <li key={s.name} className="flex items-center gap-3 px-3.5 py-2.5 text-[13px]" style={{ borderTop: i ? "1px solid var(--border-subtle)" : undefined, background: "var(--bg-surface)" }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: ORANGE }}>{i + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                {prev && <span className="text-[12px] ml-2" style={{ color: "var(--text-tertiary)" }}>+{(s.km - prev.km).toFixed(1)} km{climb != null ? ` · ${climb >= 0 ? "+" : ""}${fmt(climb)} m` : ""}</span>}
              </span>
              <span className="tabular-nums text-[12px] whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>km {s.km} · {s.ele != null ? `${fmt(s.ele)} m` : "—"}</span>
            </li>
          );
        })}
        {trail.side.map((s) => (
          <li key={s.name} className="flex items-center gap-3 px-3.5 py-2.5 text-[13px]" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: TEAL }}><Mountain className="w-3 h-3 text-white" /></span>
            <span className="flex-1 font-semibold" style={{ color: "var(--text-primary)" }}>{s.name} <span className="font-normal text-[12px]" style={{ color: "var(--text-tertiary)" }}>side trip</span></span>
            <span className="tabular-nums text-[12px]" style={{ color: "var(--text-secondary)" }}>{s.ele != null ? `${fmt(s.ele)} m` : ""}</span>
          </li>
        ))}
      </ol>

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
            <Link href={`/guides/offline-maps?trek=${slug}`} className="inline-flex items-center gap-1 mt-2 text-[13px] font-semibold hover:underline underline-offset-2" style={{ color: ORANGE }}>
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

function ElevationProfile({ trail, profile, hover, onHover }: {
  trail: Trail; profile: { km: number; ele: number }[]; hover: number | null; onHover: (i: number | null) => void;
}) {
  const W = 1000, H = 190, PAD = { l: 44, r: 12, t: 16, b: 26 };
  const maxKm = profile[profile.length - 1].km;
  const eles = profile.map((p) => p.ele);
  const lo = Math.floor((Math.min(...eles) - 150) / 500) * 500;
  const hi = Math.ceil((Math.max(...eles, ...trail.stops.map((s) => s.ele ?? 0)) + 100) / 500) * 500;
  const x = (km: number) => PAD.l + (km / maxKm) * (W - PAD.l - PAD.r);
  const y = (e: number) => PAD.t + (1 - (e - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const line = profile.map((p, i) => `${i ? "L" : "M"}${x(p.km).toFixed(1)},${y(p.ele).toFixed(1)}`).join("");
  const area = `${line}L${x(maxKm)},${H - PAD.b}L${x(0)},${H - PAD.b}Z`;
  const ticks: number[] = [];
  for (let e = lo; e <= hi; e += 1000) ticks.push(e);

  function move(e: React.PointerEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const km = ((e.clientX - box.left) / box.width * W - PAD.l) / (W - PAD.l - PAD.r) * maxKm;
    if (km < 0 || km > maxKm) return onHover(null);
    let best = 0;
    for (let i = 1; i < profile.length; i++) if (Math.abs(profile[i].km - km) < Math.abs(profile[best].km - km)) best = i;
    onHover(best);
  }

  const h = hover != null ? profile[hover] : null;
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center justify-between px-1 mb-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        <span className="font-bold uppercase tracking-[0.14em]">Elevation</span>
        <span className="tabular-nums">{h ? `km ${h.km.toFixed(1)} · ${fmt(h.ele)} m` : "Move along the chart to follow the trail on the map"}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none" onPointerMove={move} onPointerLeave={() => onHover(null)} role="img" aria-label={`Elevation from ${fmt(eles[0])} m to ${fmt(eles[eles.length - 1])} m over ${trail.lengthKm} km`}>
        <defs>
          <linearGradient id="trail-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={ORANGE} stopOpacity="0.35" />
            <stop offset="1" stopColor={ORANGE} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {ticks.map((e) => (
          <g key={e}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(e)} y2={y(e)} stroke="var(--border-subtle)" strokeDasharray="3 4" />
            <text x={PAD.l - 6} y={y(e) + 4} textAnchor="end" fontSize="11" fill="var(--text-tertiary)">{fmt(e)}</text>
          </g>
        ))}
        <path d={area} fill="url(#trail-fill)" />
        <path d={line} fill="none" stroke={ORANGE} strokeWidth="2.2" strokeLinejoin="round" />
        {trail.stops.map((s, i) => (
          <g key={s.name}>
            <line x1={x(s.km)} x2={x(s.km)} y1={H - PAD.b} y2={y(s.ele ?? 0)} stroke="var(--text-tertiary)" strokeOpacity="0.4" />
            <circle cx={x(s.km)} cy={H - PAD.b + 11} r="8" fill={ORANGE} />
            <text x={x(s.km)} y={H - PAD.b + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{i + 1}</text>
          </g>
        ))}
        {h && (
          <g>
            <line x1={x(h.km)} x2={x(h.km)} y1={PAD.t} y2={H - PAD.b} stroke="var(--text-primary)" strokeOpacity="0.35" />
            <circle cx={x(h.km)} cy={y(h.ele)} r="5" fill={ORANGE} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
