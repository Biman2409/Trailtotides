import type { Adventure, Difficulty, ACEAxes } from "./data";

// ─── Re-export ACEAxes as ACE for convenience ──────────────────────────────────

export type ACE = ACEAxes;

// ─── Axis metadata ─────────────────────────────────────────────────────────────

export const ACE_AXES = [
  "stamina", "power", "strength", "agility",
  "water", "altitude", "nerve", "focus",
] as const;

export type AceAxis = typeof ACE_AXES[number];

export const ACE_AXIS_LABELS: Record<AceAxis, string> = {
  stamina:  "Stamina",
  power:    "Power",
  strength: "Strength",
  agility:  "Agility",
  water:    "Water",
  altitude: "Altitude",
  nerve:    "Nerve",
  focus:    "Focus",
};

export const ACE_AXIS_COLORS: Record<AceAxis, string> = {
  stamina:  "#f97316",
  power:    "#eab308",
  strength: "#84cc16",
  agility:  "#22d3ee",
  water:    "#3b82f6",
  altitude: "#a78bfa",
  nerve:    "#f43f5e",
  focus:    "#10b981",
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
  { name: "Mind",      axes: ["nerve", "focus"] as AceAxis[],            color: "#10b981", desc: "Psychological resilience and sustained situational awareness." },
];

// ─── Auto-computation from Adventure fields ────────────────────────────────────

function parseAltitudeM(alt?: string): number {
  if (!alt) return 0;
  const clean = alt.replace(/,/g, "").replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

function parseDays(durationDays: string): number {
  const m = durationDays.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 5;
}

const DIFF_BASE: Record<Difficulty, number> = {
  Beginner:     1,
  Intermediate: 2,
  Advanced:     3,
  Expert:       4,
  Extreme:      5,
};

export function computeACE(a: Adventure): ACE {
  const altM   = parseAltitudeM(a.altitude ?? a.depth);
  const days   = parseDays(a.durationDays);
  const diff   = DIFF_BASE[a.difficulty] ?? 3;
  const isWater = ["Diving", "Kayaking"].includes(a.type);
  const isMoto  = a.type === "Biking";
  const isMountaineering = a.type === "Mountaineering";
  const isClimbing = a.type === "Rock Climbing";

  // ── Stamina ────────────────────────────────────────────────────────────────
  let stamina: number;
  if (days <= 1) stamina = 1;
  else if (days <= 3 && altM < 3000) stamina = 2;
  else if (days <= 5 && altM < 4000) stamina = 3;
  else if (days <= 10 && altM < 5500) stamina = 4;
  else stamina = 5;
  stamina = Math.max(stamina, diff >= 4 ? diff : stamina);
  stamina = Math.min(5, stamina);

  // ── Power ──────────────────────────────────────────────────────────────────
  let power: number;
  if (isMountaineering || isClimbing) power = diff >= 4 ? 4 : 3;
  else if (a.type === "Paragliding") power = 1;
  else power = Math.max(1, diff - 1);
  power = Math.min(5, power);

  // ── Strength ───────────────────────────────────────────────────────────────
  let strength: number;
  if (isMountaineering && altM > 5000) strength = 5;
  else if (isMountaineering || isClimbing) strength = Math.max(3, diff);
  else if (days >= 7) strength = Math.min(4, Math.max(2, diff));
  else strength = Math.max(1, diff - 1);
  strength = Math.min(5, strength);

  // ── Agility ────────────────────────────────────────────────────────────────
  let agility: number;
  if (isMoto) agility = diff + 1;
  else if (isClimbing || isMountaineering) agility = Math.max(3, diff);
  else if (isWater) agility = 2;
  else agility = Math.max(1, diff - 1);
  agility = Math.min(5, agility);

  // ── Water ──────────────────────────────────────────────────────────────────
  let water: number;
  if (a.type === "Diving") water = Math.max(4, diff);
  else if (a.type === "Kayaking") water = Math.max(3, diff);
  else if (a.tags?.includes("river") || a.tags?.includes("rafting")) water = 3;
  else water = 0;
  water = Math.min(5, water);

  // ── Altitude ───────────────────────────────────────────────────────────────
  let altitude: number;
  if (altM >= 6000)       altitude = 5;
  else if (altM >= 5000)  altitude = 4;
  else if (altM >= 4000)  altitude = 3;
  else if (altM >= 2500)  altitude = 2;
  else if (altM >= 1500)  altitude = 1;
  else                    altitude = 0;

  // ── Nerve ──────────────────────────────────────────────────────────────────
  let nerve: number;
  if (a.type === "Paragliding" || a.type === "Hot Air Balloon") nerve = 4;
  else if (isMountaineering && altM > 5000) nerve = 5;
  else if (isMountaineering) nerve = 4;
  else if (isClimbing) nerve = Math.max(3, diff);
  else if (a.type === "Caving" || a.type === "Diving") nerve = 3;
  else nerve = Math.max(1, diff - 2);
  nerve = Math.min(5, nerve);

  // ── Focus ──────────────────────────────────────────────────────────────────
  let focus: number;
  if (isMoto || isClimbing) focus = Math.max(4, diff);
  else if (isMountaineering) focus = Math.max(3, diff - 1);
  else if (days >= 7) focus = 3;
  else focus = Math.max(1, diff - 2);
  focus = Math.min(5, focus);

  return { stamina, power, strength, agility, water, altitude, nerve, focus };
}

/** Returns the ACE profile, using explicit values if set, computed otherwise. */
export function getACE(a: Adventure): ACE {
  if (a.ace) return a.ace as ACE;
  return computeACE(a);
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
  if (ace.nerve >= 4)
    parts.push("Significant psychological exposure — comfort with heights, void, or dangerous environments is critical.");

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

  const expLabel = ace.nerve >= 4 ? "High Exposure" : ace.nerve === 3 ? "Moderate Exposure" : null;
  if (expLabel) labels.push(expLabel);

  const techLabel = Math.max(ace.strength, ace.agility);
  if (techLabel >= 5) labels.push("Technical Mountaineering");
  else if (techLabel === 4) labels.push("Technical Terrain");

  if (ace.focus >= 4) labels.push("High Focus Demand");

  return labels.slice(0, 4);
}
