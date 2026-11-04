"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Camera, Trophy, Loader2, Check, Map as MapIcon, Satellite } from "lucide-react";
import type { LayerKey } from "./mapShared";
// The map style (map or satellite) and your own overlays (trip photos, adventures done), tucked
// behind one button so the screen keeps to filters. Signed-out visitors get the map style only.

export default function LayersMenu({
  loggedIn, shotsOn, shotsLoading, onShots, trailOn, onTrail, base, onBase, align = "right",
}: {
  loggedIn: boolean;
  shotsOn: boolean;
  shotsLoading: boolean;
  onShots: () => void;
  trailOn: boolean;
  onTrail: () => void;
  base: LayerKey;
  onBase: (b: LayerKey) => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const overlaysOn = Number(shotsOn) + Number(trailOn);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Map layers"
        className="tm-iconbtn-lg relative" data-on={open || undefined}>
        <Layers className="w-4 h-4" />
        {overlaysOn > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#eab308] text-[#1a1200] text-[9px] font-bold grid place-items-center">{overlaysOn}</span>}
      </button>
      {open && (
        <div className={`tm-menu absolute top-full mt-2 w-[260px] z-[1100] p-3 ${align === "right" ? "right-0" : "left-0"}`} role="dialog" aria-label="Map layers">
          <p className="tm-label">Map style</p>
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Map style">
            {([["map", "Map", MapIcon], ["satellite", "Satellite", Satellite]] as const).map(([k, label, Icon]) => (
              <button key={k} type="button" onClick={() => onBase(k)} aria-pressed={base === k}
                className="h-9 rounded-lg flex items-center justify-center gap-1.5 text-[12.5px] font-semibold transition-colors"
                style={base === k ? { background: "#ff5100", color: "#fff" } : { background: "rgba(var(--tm-ink),0.06)", color: "rgba(var(--tm-ink),0.75)" }}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
          {loggedIn && <>
            <p className="tm-label mt-3">Your adventures</p>
            <div className="space-y-1">
              <Toggle on={shotsOn} onClick={onShots} icon={shotsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} label="My trip photos" />
              <Toggle on={trailOn} onClick={onTrail} icon={<Trophy className="w-3.5 h-3.5" />} label="Adventures I've done" gold />
            </div>
          </>}
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onClick, icon, label, gold }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string; gold?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="tm-mrow" data-on={on || undefined}>
      <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: on ? (gold ? "linear-gradient(135deg,#f7cd3a,#eab308)" : "#ff5100") : "rgba(var(--tm-ink),0.06)", color: on && gold ? "#1a1200" : "#fff" }}>{icon}</span>
      <span className="flex-1 text-left text-[12.5px] font-semibold text-white/80">{label}</span>
      {on && <Check className="w-3.5 h-3.5 text-white/60" />}
    </button>
  );
}
