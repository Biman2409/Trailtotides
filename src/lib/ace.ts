import type { Adventure, ACEAxes } from "./data";

// ─── Re-export ACEAxes as ACE for convenience ──────────────────────────────────

export type ACE = ACEAxes;

// ─── Axis metadata ─────────────────────────────────────────────────────────────

export const ACE_AXES = [
  "stamina", "power", "strength", "agility",
  "water", "altitude", "focus", "nerve",
] as const;

export type AceAxis = typeof ACE_AXES[number];

export const ACE_AXIS_LABELS: Record<AceAxis, string> = {
  stamina:  "Stamina",
  power:    "Power",
  strength: "Strength",
  agility:  "Agility",
  water:    "Water",
  altitude: "Altitude",
  focus:    "Focus",
  nerve:    "Nerve",
};

export const ACE_AXIS_COLORS: Record<AceAxis, string> = {
  stamina:  "#f97316",
  power:    "#eab308",
  strength: "#84cc16",
  agility:  "#22d3ee",
  water:    "#3b82f6",
  altitude: "#a78bfa",
  focus:    "#f43f5e",
  nerve: "#10b981",
};

export const ACE_SCALE_LABELS: Record<number, string> = {
  0: "Not Relevant",
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Extreme",
};

// ─── Domain groupings ─────────────────────────────────────────────────────────

export const ACE_DOMAINS = [
  { name: "Engine",    axes: ["stamina", "power"] as AceAxis[],          color: "#f97316", desc: "The physical engine — sustained output and explosive effort." },
  { name: "Chassis",   axes: ["strength", "agility"] as AceAxis[],       color: "#22d3ee", desc: "Load-bearing capability and terrain navigation." },
  { name: "Elements",  axes: ["water", "altitude"] as AceAxis[],         color: "#a78bfa", desc: "Environmental exposure — aquatic and high-altitude demands." },
  { name: "Mind",      axes: ["focus", "nerve"] as AceAxis[],          color: "#10b981", desc: "Psychological resilience and the grit to operate far from help." },
];

const BLANK_ACE: ACE = { stamina: 0, power: 0, strength: 0, agility: 0, water: 0, altitude: 0, focus: 0, nerve: 0 };

// ─── Shared helpers ────────────────────────────────────────────────────────

function parseMaxDays(a: Adventure): number {
  const durStr = (a.durationDays ?? a.durationRange ?? "").replace(/[–—]/g, "-");
  const nums = durStr.match(/\d+/g)?.map(Number) ?? [];
  return nums.length ? Math.max(...nums) : 3;
}

function parseAltitudeM(alt?: string): number {
  if (!alt) return 0;
  const clean = alt.replace(/,/g, "").replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

// ─── Stamina computation from duration + distance ──────────────────────────

/** Derives the stamina ACE axis from an adventure's duration and distance fields. */
export function computeStamina(a: Adventure): number {
  const days = parseMaxDays(a);

  // Duration score 1–5
  const daysScore = days <= 1 ? 1 : days <= 3 ? 2 : days <= 6 ? 3 : days <= 10 ? 4 : 5;

  // Distance score — type-aware thresholds (biking km/day >> trekking km/day)
  const distStr = a.distance ?? a.distanceRange ?? "";
  const kmMatch = distStr.match(/(\d+)/);
  if (!kmMatch) return daysScore;

  const km = parseInt(kmMatch[1]);
  const kmPerDay = km / Math.max(days, 1);
  const isBike = a.type === "Biking";

  const distScore = isBike
    ? (kmPerDay < 50 ? 1 : kmPerDay < 80 ? 2 : kmPerDay < 120 ? 3 : kmPerDay < 180 ? 4 : 5)
    : (kmPerDay < 6  ? 1 : kmPerDay < 10 ? 2 : kmPerDay < 15 ? 3 : kmPerDay < 20 ? 4 : 5);

  return Math.max(1, Math.min(5, Math.max(daysScore, Math.round((daysScore + distScore) / 2))));
}

// ─── Power computation from altitude + duration ────────────────────────────

/**
 * Derives the power ACE axis from max altitude and duration.
 * Power = explosive short-burst effort — proxied by altitude gain per day.
 * Raw altitude also sets a floor (high camps demand power regardless of pace).
 */
export function computePower(a: Adventure): number {
  const altM = parseAltitudeM(a.altitude ?? a.depth);
  const days = parseMaxDays(a);

  // Altitude-per-day score (steepness proxy)
  const altPerDay = altM / Math.max(days, 1);
  const rateScore = altPerDay < 300 ? 1 : altPerDay < 600 ? 2 : altPerDay < 1000 ? 3 : altPerDay < 1500 ? 4 : 5;

  // Raw altitude floor (just being at extreme altitude demands power)
  const altFloor = altM < 2000 ? 1 : altM < 3500 ? 2 : altM < 4800 ? 3 : altM < 6000 ? 4 : 5;

  return Math.max(1, Math.min(5, Math.max(rateScore, altFloor)));
}

// ─── Difficulty computation from ACE sum ──────────────────────────────────

/** Derives the difficulty label from the total of all ACE axis scores. */
export function computeDifficulty(ace: ACE): string {
  const total = Object.values(ace).reduce((a, b) => a + b, 0);
  if (total <= 8)  return "Easy";
  if (total <= 14) return "Moderate";
  if (total <= 20) return "Intermediate";
  if (total <= 26) return "Hard";
  return "Extreme";
}

/** Returns the ACE profile from manually entered data, or blank if not yet set. */
export function getACE(a: Adventure): ACE {
  return a.ace ? { ...(a.ace as ACE) } : { ...BLANK_ACE };
}

/** Generate a plain-English summary for an adventure's ACE profile */
export function aceSummary(ace: ACE, adventureName: string): string {
  const parts: string[] = [];

  // Stamina + altitude → primary descriptor
  if (ace.stamina >= 4 && ace.altitude >= 4)
    parts.push(`${adventureName} is an endurance-heavy adventure at extreme altitude — sustained days of physical output in a hypoxic environment.`);
  else if (ace.stamina >= 4)
    parts.push(`${adventureName} demands strong endurance — expect long, physically demanding days.`);
  else if (ace.stamina <= 2)
    parts.push(`${adventureName} is physically accessible — short daily effort with no sustained endurance demands.`);
  else
    parts.push(`${adventureName} requires moderate stamina — a typical multi-day effort.`);

  // Technicality: strength + agility
  const tech = Math.max(ace.strength, ace.agility);
  if (tech >= 5)
    parts.push("Technical mountaineering terrain demands specialised gear and movement skills.");
  else if (tech === 4)
    parts.push("Demanding terrain and load-bearing requirements call for solid physical preparation.");
  else if (tech <= 2)
    parts.push("No technical demands — standard gear is sufficient.");

  // Environmental axes: water or altitude
  if (ace.water >= 3)
    parts.push(`Aquatic competence is required — swimming or diving experience is essential.`);
  if (ace.altitude >= 4 && ace.stamina < 4)
    parts.push("The high altitude significantly amplifies the physiological challenge.");

  // Nerve
  if (ace.focus >= 4)
    parts.push("Significant psychological exposure — comfort with heights, void, or dangerous environments is critical.");

  // Tenacity
  if (ace.nerve >= 4)
    parts.push("Remote or isolated terrain demands strong self-reliance — you'll be far from support for extended periods.");

  return parts.join(" ");
}

/** Generate card labels (3–4 short highlight strings) for an adventure */
export function aceCardLabels(ace: ACE): string[] {
  const labels: string[] = [];

  const stamLabel = ace.stamina >= 4 ? "Endurance Heavy" : ace.stamina === 3 ? "Moderate Endurance" : ace.stamina <= 1 ? "Low Effort" : null;
  if (stamLabel) labels.push(stamLabel);

  if (ace.altitude >= 5) labels.push("Extreme Altitude");
  else if (ace.altitude === 4) labels.push("High Altitude");
  else if (ace.altitude === 3) labels.push("Moderate Altitude");

  if (ace.water >= 4) labels.push("Strong Swimming");
  else if (ace.water >= 3) labels.push("Water Confident");

  const expLabel = ace.focus >= 4 ? "High Exposure" : ace.focus === 3 ? "Moderate Exposure" : null;
  if (expLabel) labels.push(expLabel);

  const techLabel = Math.max(ace.strength, ace.agility);
  if (techLabel >= 5) labels.push("Technical Mountaineering");
  else if (techLabel === 4) labels.push("Technical Terrain");

  if (ace.nerve >= 4) labels.push("Remote Self-Reliance");

  return labels.slice(0, 4);
}
