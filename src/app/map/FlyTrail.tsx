"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Trail } from "@/lib/trails/shared";

// A button that opens "Fly the trail in 3D", for anywhere a trail is shown: the map's trek card
// and top bar, its itinerary panel, and the adventure page. The 3D view's code loads on the
// first click, so pages that show the button don't carry MapLibre's 3D view until it's wanted.

const TrailFlyover = dynamic(() => import("./TrailFlyover"), { ssr: false });

export default function FlyTrail({ name, trail, className, style, title, children, onOpen }: {
  name: string;
  trail: Trail;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  children: ReactNode;
  /** For analytics, say */
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} style={style} title={title} aria-haspopup="dialog"
        onClick={() => { setOpen(true); onOpen?.(); }}>
        {children}
      </button>
      {open && <TrailFlyover name={name} trail={trail} onClose={() => setOpen(false)} />}
    </>
  );
}
