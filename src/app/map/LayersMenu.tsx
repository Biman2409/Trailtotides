"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Camera, Trophy, Loader2, Check } from "lucide-react";
// Your own overlays on the map (trip photos, adventures done), tucked behind one button so the
// screen keeps to filters. There's one map style, so signed-out visitors have nothing to toggle
// and don't get the button.

export default function LayersMenu({
  loggedIn, shotsOn, shotsLoading, onShots, trailOn, onTrail, align = "right",
}: {
  loggedIn: boolean;
  shotsOn: boolean;
  shotsLoading: boolean;
  onShots: () => void;
  trailOn: boolean;
  onTrail: () => void;
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

  if (!loggedIn) return null;

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Your layers on the map"
        className="tm-iconbtn-lg relative" data-on={open || undefined}>
        <Layers className="w-4 h-4" />
        {overlaysOn > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#eab308] text-[#1a1200] text-[9px] font-bold grid place-items-center">{overlaysOn}</span>}
      </button>
      {open && (
        <div className={`tm-menu absolute top-full mt-2 w-[260px] z-[1100] p-3 ${align === "right" ? "right-0" : "left-0"}`} role="dialog" aria-label="Your layers on the map">
          <p className="tm-label">Your adventures</p>
          <div className="space-y-1">
            <Toggle on={shotsOn} onClick={onShots} icon={shotsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} label="My trip photos" />
            <Toggle on={trailOn} onClick={onTrail} icon={<Trophy className="w-3.5 h-3.5" />} label="Adventures I've done" gold />
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onClick, icon, label, gold }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string; gold?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="tm-mrow" data-on={on || undefined}>
      <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: on ? (gold ? "linear-gradient(135deg,#f7cd3a,#eab308)" : "#ff5100") : "rgba(255,255,255,0.06)", color: on && gold ? "#1a1200" : "#fff" }}>{icon}</span>
      <span className="flex-1 text-left text-[12.5px] font-semibold text-white/80">{label}</span>
      {on && <Check className="w-3.5 h-3.5 text-white/60" />}
    </button>
  );
}
