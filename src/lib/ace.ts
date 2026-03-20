import type { Adventure, ACEAxes } from "./data";

// ─── Re-export ACEAxes as ACE for convenience ──────────────────────────────────

export type ACE = ACEAxes;

// ─── Axis metadata ─────────────────────────────────────────────────────────────

export const ACE_AXES = [
  "stamina", "power", "strength", "agility",
  "water", "altitude", "nerve", "tenacity",
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
  tenacity: "Tenacity",
};

export const ACE_AXIS_COLORS: Record<AceAxis, string> = {
  stamina:  "#f97316",
  power:    "#eab308",
  strength: "#84cc16",
  agility:  "#22d3ee",
  water:    "#3b82f6",
  altitude: "#a78bfa",
  nerve:    "#f43f5e",
  tenacity: "#10b981",
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
  { name: "Mind",      axes: ["nerve", "tenacity"] as AceAxis[],          color: "#10b981", desc: "Psychological resilience and the grit to operate far from help." },
];

const BLANK_ACE: ACE = { stamina: 0, power: 0, strength: 0, agility: 0, water: 0, altitude: 0, nerve: 0, tenacity: 0 };

/** Returns the manually stored ACE profile, or a blank profile if not yet assigned. */
export function getACE(a: Adventure): ACE {
  if (a.ace) return a.ace as ACE;
  return BLANK_ACE;
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

  // Tenacity
  if (ace.tenacity >= 4)
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

  const expLabel = ace.nerve >= 4 ? "High Exposure" : ace.nerve === 3 ? "Moderate Exposure" : null;
  if (expLabel) labels.push(expLabel);

  const techLabel = Math.max(ace.strength, ace.agility);
  if (techLabel >= 5) labels.push("Technical Mountaineering");
  else if (techLabel === 4) labels.push("Technical Terrain");

  if (ace.tenacity >= 4) labels.push("Remote Self-Reliance");

  return labels.slice(0, 4);
}
