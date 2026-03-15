import type { Adventure } from "./data";
import { getACE, type ACE, type AceAxis, ACE_AXIS_LABELS } from "./ace";

// ─── Answer types ─────────────────────────────────────────────────────────────

/** Legacy answer type (kept for backward compat with stored profiles) */
export interface MatchmakerAnswers {
  cardio: "A" | "B" | "C" | "D";
  load:   "A" | "B" | "C" | "D";
  altitude: "A" | "B" | "C" | "D";
  terrain:  "A" | "B" | "C" | "D" | "E";
  age: number;
  weight: number;
  height: number;
  injuries?: string;
}

// ─── Profile types ────────────────────────────────────────────────────────────

export interface UserAceProfile {
  ace: ACE;
  label: string;
  summary: string;
}

export interface AceGap {
  axis: AceAxis;
  label: string;
  userVal: number;
  adventureVal: number;
  gap: number;
  explanation: string;
}

export interface RoadmapStep {
  step: number;
  text: string;
  exampleSlug?: string;
  exampleName?: string;
}

export interface Upsell {
  trigger: string;
  recommendation: string;
  icon: string;
}

// ─── Tier labels ──────────────────────────────────────────────────────────────

// Total ACE score: 8 axes × 1–5 each = range 8–40
// Rank 0 = no assessment | Rank 1 = 8–15 | Rank 2 = 16–23 | Rank 3 = 24–31 | Rank 4 = 32–39 | Rank 5 = 40
function aceToLabel(ace: ACE): string {
  const total = Object.values(ace).reduce((a, b) => a + b, 0);
  if (total >= 40) return "Apex";
  if (total >= 32) return "Expeditioner";
  if (total >= 24) return "Navigator";
  if (total >= 16) return "Trailblazer";
  return "Pathfinder";
}

// ─── Adventure matching (ACE-based) ──────────────────────────────────────────

export function getMatchedAdventures(ace: ACE, all: Adventure[]): Adventure[] {
  return all
    .filter((a) => {
      const req = getACE(a);
      // All relevant (>0) axes of the adventure must be within user's score
      return Object.entries(req).every(([k, v]) => v === 0 || ace[k as AceAxis] >= v);
    })
    .sort((a, b) => {
      // Prefer adventures closest to the user ceiling
      const ra = getACE(a), rb = getACE(b);
      const sumA = Object.values(ra).reduce((x, y) => x + y, 0);
      const sumB = Object.values(rb).reduce((x, y) => x + y, 0);
      return sumB - sumA;
    })
    .slice(0, 5);
}

// ─── Gap analysis ─────────────────────────────────────────────────────────────

export function getAceGaps(userAce: ACE, adventureAce: ACE): AceGap[] {
  const gaps: AceGap[] = [];
  (Object.keys(adventureAce) as AceAxis[]).forEach((axis) => {
    const req = adventureAce[axis];
    const has = userAce[axis];
    if (req > has) {
      gaps.push({
        axis,
        label: ACE_AXIS_LABELS[axis],
        userVal: has,
        adventureVal: req,
        gap: req - has,
        explanation: buildGapExplanation(axis, has, req),
      });
    }
  });
  return gaps;
}

function buildGapExplanation(axis: AceAxis, has: number, req: number): string {
  const diff = req - has;
  const gap = diff >= 2 ? "significantly exceeds" : "slightly exceeds";
  switch (axis) {
    case "stamina":  return `This adventure's endurance demand (${req}/5) ${gap} your current level (${has}/5). Expect long physical days that would stretch your current limits.`;
    case "power":    return `Short explosive bursts required (${req}/5) are above your current capacity (${has}/5). Sprint climbs or paddle surges could be challenging.`;
    case "strength": return `Load-bearing and terrain force demands (${req}/5) exceed your current strength (${has}/5). Heavy packs or technical climbing could cause early fatigue.`;
    case "agility":  return `Terrain navigation complexity (${req}/5) exceeds your current agility (${has}/5). Exposed ridges, scree or technical footing may present real difficulty.`;
    case "water":    return `Aquatic competence required (${req}/5) exceeds your current level (${has}/5). Open water or current confidence is essential for this adventure.`;
    case "altitude": return `This adventure reaches altitude levels (${req}/5) beyond your current proven tolerance (${has}/5). Altitude sickness risk is significantly elevated.`;
    case "nerve":    return `Psychological exposure (${req}/5) exceeds your comfort zone (${has}/5). Heights, void or danger-loaded environments are part of this experience.`;
    case "focus":    return `Sustained situational awareness required (${req}/5) is above your current level (${has}/5). Navigation, route-finding or technical decisions must be maintained over many hours.`;
  }
}

// ─── Unlock roadmap ───────────────────────────────────────────────────────────

export function getUnlockRoadmap(userAce: ACE, adventureAce: ACE, all: Adventure[]): RoadmapStep[] {
  const gaps = getAceGaps(userAce, adventureAce);
  const steps: RoadmapStep[] = [];
  let n = 1;

  for (const gap of gaps.slice(0, 4)) {
    const action = buildTrainingAction(gap.axis, gap.adventureVal);
    steps.push({ step: n++, text: action });

    // Find a bridge adventure one level below on this axis
    const bridge = all.find((a) => {
      const req = getACE(a);
      return req[gap.axis] === gap.adventureVal - 1 && req[gap.axis] > userAce[gap.axis];
    });
    if (bridge) {
      steps.push({ step: n++, text: `Use this as a stepping-stone`, exampleSlug: bridge.slug, exampleName: bridge.name });
    }
  }

  return steps;
}

function buildTrainingAction(axis: AceAxis, target: number): string {
  switch (axis) {
    case "stamina":  return `Build stamina to sustain ${target >= 4 ? "6–8 hour" : "4–5 hour"} active days — complete a multi-day loaded hike before attempting this.`;
    case "power":    return `Develop explosive capacity through interval training — sprint sessions and steep stair climbs.`;
    case "strength": return `Increase load tolerance — practice carrying a ${target >= 4 ? "12–15kg" : "8–12kg"} pack on day hikes.`;
    case "agility":  return `Train on uneven terrain — trail running, bouldering or scrambling routes to improve coordination.`;
    case "water":    return `Improve swimming confidence — open-water sessions or a basic safety swimming course.`;
    case "altitude": return `Gain altitude experience — sleep above ${target >= 4 ? "4,000m" : "3,000m"} for at least two nights before this trip.`;
    case "nerve":    return `Build exposure tolerance progressively — start with moderate heights and work toward more exposed environments.`;
    case "focus":    return `Develop sustained awareness — practice technical route navigation and day-long activities that demand continuous attention.`;
  }
}

// ─── Smart upsell recommendations ────────────────────────────────────────────

export function getUpsells(userAce: ACE, adventureAce: ACE): Upsell[] {
  const upsells: Upsell[] = [];

  if (adventureAce.altitude >= 4 && userAce.altitude <= 2)
    upsells.push({ trigger: "Low altitude exposure", recommendation: "Add an extra acclimatization day — don't ascend more than 400m per day above 3,000m", icon: "⛰️" });

  if (adventureAce.stamina >= 4 && userAce.stamina <= 2)
    upsells.push({ trigger: "Borderline endurance", recommendation: "Hire a local guide who sets a sustainable pace — critical for multi-day trips", icon: "🧭" });

  if (adventureAce.strength >= 4 && userAce.strength <= 2)
    upsells.push({ trigger: "Heavy load demand", recommendation: "Consider porter or mule support to carry your main bag on multi-day treks", icon: "🎒" });

  if (adventureAce.nerve >= 4)
    upsells.push({ trigger: "High exposure environment", recommendation: "A satellite communicator for emergency contact in remote or dangerous terrain", icon: "📡" });

  return upsells;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "ttt_matchmaker_profile";

export interface StoredProfile {
  ace: ACE;
  label: string;
  summary: string;
  answers?: Record<string, unknown>; // kept for backward compatibility
  // Legacy ERT field — kept so old profiles don't break
  ert?: { e: number; r: number; t: number };
}

export function saveProfile(profile: StoredProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

export function loadProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProfile;
    // Migrate legacy ERT-only profiles
    if (!parsed.ace && parsed.ert) {
      const { e, r, t } = parsed.ert;
      parsed.ace = { stamina: e, power: Math.max(1, e - 1), strength: e, agility: t, water: 1, altitude: r, nerve: t, focus: t };
      parsed.label = parsed.label ?? "Uncharted";
      parsed.summary = parsed.summary ?? "";
    }
    return parsed.ace ? parsed : null;
  } catch { return null; }
}

export function clearProfile(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ─── Server sync helpers ───────────────────────────────────────────────────────

/** Save profile to Supabase (fire-and-forget, only for logged-in users) */
export async function saveProfileToServer(profile: StoredProfile): Promise<void> {
  try {
    await fetch("/api/ace-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  } catch {}
}

/** Load profile from Supabase, falling back to localStorage */
export async function loadProfileFromServer(): Promise<StoredProfile | null> {
  try {
    const res = await fetch("/api/ace-profile");
    if (!res.ok) return loadProfile();
    const { profile } = await res.json();
    if (profile?.ace) {
      // Sync to localStorage so offline reads work
      saveProfile(profile as StoredProfile);
      return profile as StoredProfile;
    }
  } catch {}
  return loadProfile();
}

// ─── Legacy ERT gap (kept for RealityCheck backward compat) ───────────────────

export interface ErtGap {
  dimension: "e" | "r" | "t";
  label: string;
  userVal: number;
  adventureVal: number;
  gap: number;
  userLabel: string;
  adventureLabel: string;
  explanation: string;
}

/** @deprecated Use getAceGaps */
export function getErtGaps(_userErt: { e: number; r: number; t: number }, _adventureErt: { e: number; r: number; t: number }): ErtGap[] {
  return [];
}

/** @deprecated Use getUnlockRoadmap */
export function getUnlockRoadmap_ert(_u: unknown, _a: unknown, _all: unknown[]): RoadmapStep[] {
  return [];
}
