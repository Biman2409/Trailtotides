import React from "react";

// Ice axe/pickaxe icon for Ice Climbing
const IceAxe = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999"/>
    <path d="M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024"/>
    <path d="M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069"/>
    <path d="M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z"/>
  </svg>
);

// Diving helmet icon for Diving
const DivingHelmet = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 17.9c1.5-.9 2.7-2.2 3.4-3.9h.8c.4 0 .8-.4.8-1V9c0-.6-.4-1-.8-1h-.8A7.92 7.92 0 0 0 15 3.6v-.8c0-.4-.4-.8-1-.8h-4c-.6 0-1 .4-1 .8v.8A7.92 7.92 0 0 0 4.6 8h-.8c-.4 0-.8.4-.8 1v4c0 .6.4 1 .8 1h.8c.7 1.7 1.9 3 3.4 3.9"/>
    <circle cx="12" cy="11" r="4"/>
    <path d="M8 11h8"/>
    <path d="M12 7v8"/>
    <path d="M6.7 17c-1 .6-1.7 1.2-1.7 2 0 1.7 3.1 3 7 3s7-1.3 7-3c0-.8-.7-1.4-1.7-2"/>
  </svg>
);

// Snowboard icon for Snowboarding
const Snowboard = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 6a4 4 0 0 0-7.2-2.3c-4.2 5.8-5.3 6.9-11.1 11.1a4 4 0 1 0 5.5 5.5c4.2-5.8 5.3-6.9 11.1-11.1 1-.7 1.7-1.9 1.7-3.2"/>
    <path d="M6.15 13H11v4.85"/>
  </svg>
);

// Skis icon for Skiing
const Skis = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3-1"/>
    <path d="m3 2 7 20"/>
    <path d="M10 2 3 22"/>
    <path d="m2 20 3 1"/>
    <path d="M22 22V6c0-2.2-2-4-2-4s-2 1.8-2 4c0-2.2-2-4-2-4s-2 1.8-2 4v16Z"/>
    <path d="M18 6v16"/>
  </svg>
);

// Surfboard icon for Surfing
const Surfboard = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 2.6 21.4"/>
    <path d="M13.8 19.2A18 18 0 0 0 22 4V2h-2C10.1 2 2 10.1 2 20a2 2 0 0 0 2 2 17 17 0 0 0 7.63-1.7"/>
    <path d="M7 17c2.7 0 4.9 2.3 5 5a6.7 6.7 0 0 0-.1-9.9"/>
  </svg>
);

// Mask + snorkel icon for Diving
const MaskSnorkel = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 14a2 2 0 0 1-1.4-.6l-.7-.8c-.8-.8-2-.8-2.8 0l-.7.8a2 2 0 0 1-1.4.6H6a4 4 0 0 1 0-8h8a4 4 0 0 1 0 8Z"/>
    <path d="M12 18a2 2 0 0 1-4 0"/>
    <path d="M10 20a2 2 0 0 0 2 2h4c3.3 0 6-2.7 6-6V2h-4v14a2 2 0 0 1-2 2"/>
    <path d="M18 10h4"/>
    <circle cx="4.5" cy="21.5" r=".5"/>
    <path d="M3 17.5h.01"/>
  </svg>
);

// Custom sport-shoe SVG for Scrambling (no Lucide equivalent)
const SportShoe = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}
    fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {/* sole */}
    <path d="M2 17.5Q2 19.5 5 19.5h14q3 0 3-2v-1H2v1Z" />
    {/* upper body of shoe */}
    <path d="M2 16.5V14Q2 10 6 9.5l3-0.5 2-3.5Q12 4 14 4.5l1 1.5-3 4.5h9l.5 2.5q.5 2-1.5 4H2Z" />
    {/* laces */}
    <line x1="10" y1="11" x2="13" y2="11" />
    <line x1="11" y1="13" x2="15" y2="13" />
  </svg>
);

import {
  Footprints,
  Mountain,
  MountainSnow,
  Pickaxe,

  Tent,
  Bike,
  Motorbike,
  Car,
  Sun,
  Flashlight,
  Building2,
  Wind,
  Sunrise,
  Kayak,
  Ship,
  PlaneLanding,
  Triangle,
} from "lucide-react";

export const ADVENTURE_TYPE_ICONS: Record<string, (size?: number) => React.ReactNode> = {
  Trekking:          (s = 14) => <Tent          style={{ width: s, height: s }} />,
  Mountaineering:    (s = 14) => <MountainSnow  style={{ width: s, height: s }} />,
  "Rock Climbing":   (s = 14) => <Pickaxe       style={{ width: s, height: s }} />,
  Scrambling:        (s = 14) => <Footprints    style={{ width: s, height: s }} />,
  Biking:            (s = 14) => <Motorbike     style={{ width: s, height: s }} />,
  Cycling:           (s = 14) => <Bike          style={{ width: s, height: s }} />,
  "Jeep Safari":     (s = 14) => <Car           style={{ width: s, height: s }} />,
  Caving:            (s = 14) => <Flashlight    style={{ width: s, height: s }} />,
  "Urban Adventure": (s = 14) => <Building2     style={{ width: s, height: s }} />,
  Paragliding:       (s = 14) => <Wind          style={{ width: s, height: s }} />,
  "Hot Air Balloon": (s = 14) => <Sunrise       style={{ width: s, height: s }} />,
  Diving:            (s = 14) => <DivingHelmet  size={s} />,
  Kayaking:          (s = 14) => <Kayak         style={{ width: s, height: s }} />,
  Surfing:           (s = 14) => <Surfboard      size={s} />,
  "River Rafting":   (s = 14) => <Ship          style={{ width: s, height: s }} />,
  Snorkelling:       (s = 14) => <MaskSnorkel   size={s} />,
  Skiing:            (s = 14) => <Skis           size={s} />,
  Snowboarding:      (s = 14) => <Snowboard      size={s} />,
  "Ice Climbing":    (s = 14) => <IceAxe        size={s} />,

  Skydiving:         (s = 14) => <PlaneLanding  style={{ width: s, height: s }} />,
  "Hang Gliding":    (s = 14) => <Triangle      style={{ width: s, height: s }} />,
};
