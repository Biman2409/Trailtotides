/**
 * Inline SVG data for map markers — mirrors ADVENTURE_TYPE_ICONS in adventureIcons.tsx
 * Each entry has optional `paths` (d strings) and optional `circles` ({cx,cy,r}).
 */

type IconDef = {
  paths?: string[];
  circles?: Array<{ cx: string; cy: string; r: string }>;
};

export const TYPE_ICON_DEFS: Record<string, IconDef> = {
  // Tent icon
  Trekking: {
    paths: ["M3.5 21 14 3", "M20.5 21 10 3", "M15.5 21 12 15l-3.5 6", "M2 21h20"],
  },
  // MountainSnow icon
  Mountaineering: {
    paths: [
      "m8 3 4 8 5-5 5 15H2L8 3z",
      "M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19",
    ],
  },
  // Pickaxe icon
  "Rock Climbing": {
    paths: [
      "m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999",
      "M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024",
      "M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069",
      "M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z",
    ],
  },
  // Footprints icon
  Scrambling: {
    paths: [
      "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",
      "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",
      "M16 17h4",
      "M4 13h4",
    ],
  },
  // Motorbike icon — Biking uses Motorbike, matching adventureIcons.tsx
  Biking: {
    paths: [
      "m18 14-1-3",
      "m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81",
      "M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5",
    ],
    circles: [
      { cx: "19", cy: "17", r: "3" },
      { cx: "5", cy: "17", r: "3" },
    ],
  },
  // Bike icon — Cycling uses Bike, with wheel circles
  Cycling: {
    paths: ["M12 17.5V14l-3-3 4-3 2 3h2"],
    circles: [
      { cx: "18.5", cy: "17.5", r: "3.5" },
      { cx: "5.5", cy: "17.5", r: "3.5" },
      { cx: "15", cy: "5", r: "1" },
    ],
  },
  // Car icon
  "Jeep Safari": {
    paths: [
      "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
      "M9 17h6",
    ],
    circles: [
      { cx: "7", cy: "17", r: "2" },
      { cx: "17", cy: "17", r: "2" },
    ],
  },
  // Flashlight icon
  Caving: {
    paths: [
      "M12 13v1",
      "M17 2a1 1 0 0 1 1 1v4a3 3 0 0 1-.6 1.8l-.6.8A4 4 0 0 0 16 12v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8a4 4 0 0 0-.8-2.4l-.6-.8A3 3 0 0 1 6 7V3a1 1 0 0 1 1-1z",
      "M6 6h12",
    ],
  },
  // Building2 icon
  "Urban Adventure": {
    paths: [
      "M10 12h4",
      "M10 8h4",
      "M14 21v-3a2 2 0 0 0-4 0v3",
      "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
      "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",
    ],
  },
  // Wind icon
  Paragliding: {
    paths: [
      "M12.8 19.6A2 2 0 1 0 14 16H2",
      "M17.5 8a2.5 2.5 0 1 1 2 4H2",
      "M9.8 4.4A2 2 0 1 1 11 8H2",
    ],
  },
  // Sunrise icon
  "Hot Air Balloon": {
    paths: [
      "M12 2v8",
      "m4.93 10.93 1.41 1.41",
      "M2 18h2",
      "M20 18h2",
      "m19.07 10.93-1.41 1.41",
      "M22 22H2",
      "m8 6 4-4 4 4",
      "M16 18a4 4 0 0 0-8 0",
    ],
  },
  // Anchor icon
  Diving: {
    paths: [
      "M12 6v16",
      "m19 13 2-1a9 9 0 0 1-18 0l2 1",
      "M9 11h6",
    ],
    circles: [{ cx: "12", cy: "4", r: "2" }],
  },
  // Waves icon
  Kayaking: {
    paths: [
      "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    ],
  },
  // Snowflake icon
  Skiing: {
    paths: [
      "m10 20-1.25-2.5L6 18",
      "m10 4-1.25 2.5L6 6",
      "m14 20 1.25-2.5L18 18",
      "m14 4 1.25 2.5L18 6",
      "m17 21-3-6h-4",
      "m17 3-3 6 1.5 3",
      "M2 12h6.5L10 9",
      "m20 10-1.5 2 1.5 2",
      "M22 12h-6.5L14 15",
      "m4 10 1.5 2L4 14",
      "m7 21 3-6-1.5-3",
      "m7 3 3 6h4",
    ],
  },
  // Zap icon (Ice Climbing)
  "Ice Climbing": {
    paths: [
      "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
    ],
  },
  // PlaneLanding icon
  Skydiving: {
    paths: [
      "M2 22h20",
      "M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1l-1.18.15c-.47.06-.95-.02-1.37-.24L4.29 11.15a2 2 0 0 1-.52-.38Z",
    ],
  },
  // Triangle icon (Hang Gliding)
  "Hang Gliding": {
    paths: [
      "M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    ],
  },
  // Car icon (Camel Safari fallback)
  "Camel Safari": {
    paths: [
      "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
      "M9 17h6",
    ],
    circles: [
      { cx: "7", cy: "17", r: "2" },
      { cx: "17", cy: "17", r: "2" },
    ],
  },
  // Waves icon (Sandboarding)
  Sandboarding: {
    paths: [
      "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    ],
  },
};

/**
 * Renders SVG data into an inline SVG string for use in Leaflet divIcon HTML.
 */
export function typeIconSvg(type: string, size = 14, color = "white"): string {
  const def = TYPE_ICON_DEFS[type];
  if (!def) return "";

  const pathEls = (def.paths ?? [])
    .map(d => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");

  const circleEls = (def.circles ?? [])
    .map(c => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${pathEls}${circleEls}</svg>`;
}

// Keep old export name for backward compat
export const TYPE_SVG_PATHS: Record<string, string[]> = Object.fromEntries(
  Object.entries(TYPE_ICON_DEFS).map(([k, v]) => [k, v.paths ?? []])
);
