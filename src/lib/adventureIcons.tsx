import React from "react";

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
  Anchor,
  Kayak,
  Waves,
  Ship,
  Fish,
  Snowflake,
  CloudSnow,
  Zap,
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
  Diving:            (s = 14) => <Anchor        style={{ width: s, height: s }} />,
  Kayaking:          (s = 14) => <Kayak         style={{ width: s, height: s }} />,
  Surfing:           (s = 14) => <Waves         style={{ width: s, height: s }} />,
  "River Rafting":   (s = 14) => <Ship          style={{ width: s, height: s }} />,
  Snorkelling:       (s = 14) => <Fish          style={{ width: s, height: s }} />,
  Skiing:            (s = 14) => <Snowflake     style={{ width: s, height: s }} />,
  Snowboarding:      (s = 14) => <CloudSnow     style={{ width: s, height: s }} />,
  "Ice Climbing":    (s = 14) => <Zap           style={{ width: s, height: s }} />,
  "Snow Trekking":   (s = 14) => <MountainSnow  style={{ width: s, height: s }} />,
  Skydiving:         (s = 14) => <PlaneLanding  style={{ width: s, height: s }} />,
  "Hang Gliding":    (s = 14) => <Triangle      style={{ width: s, height: s }} />,
};
