import type { Adventure, ERT } from "./data";
import { getERT } from "./ert";

// ─── Answer types ─────────────────────────────────────────────────────────────

export interface MatchmakerAnswers {
  cardio: "A" | "B" | "C" | "D";            // 5k run time
  load: "A" | "B" | "C" | "D";              // backpack experience
  altitude: "A" | "B" | "C" | "D";          // highest sleep altitude
  terrain: "A" | "B" | "C" | "D" | "E";    // terrain comfort
  age: number;
  weight: number; // kg
  height: number; // cm
  injuries?: string;
}

export interface UserErtProfile {
  ert: ERT;
  label: string;
  summary: string;
  limitReasons: string[];
}

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

export interface RoadmapStep {
  step: number;
  text: string;
  exampleSlug?: string;
  exampleName?: string;
}

// ─── ERT label maps ───────────────────────────────────────────────────────────

const E_LABELS: Record<number, string> = { 1: "Very Easy", 2: "Easy", 3: "Moderate", 4: "Hard", 5: "Extreme" };
const R_LABELS: Record<number, string> = { 1: "Very Low", 2: "Low", 3: "Moderate", 4: "High", 5: "Extreme" };
const T_LABELS: Record<number, string> = { 1: "Walk-in", 2: "Uneven Terrain", 3: "Scrambling", 4: "Crampons / Ice", 5: "Mountaineering" };

// ─── Profile computation ──────────────────────────────────────────────────────

export function computeUserProfile(a: MatchmakerAnswers): UserErtProfile {
  const reasons: string[] = [];

  // ── Exertion ──────────────────────────────────────────────────────────────
  const cardioScore: Record<string, number> = { A: 5, B: 4, C: 3, D: 2 };
  const loadScore:   Record<string, number> = { A: 5, B: 4, C: 2, D: 1 };
  const rawE = Math.round((cardioScore[a.cardio] + loadScore[a.load]) / 2);
  // Age penalty above 55
  const agePenalty = a.age > 65 ? 1 : a.age > 55 ? 0.5 : 0;
  // BMI-based penalty (rough)
  const bmi = a.weight / ((a.height / 100) ** 2);
  const bmiPenalty = bmi > 32 ? 1 : bmi > 27 ? 0.5 : 0;
  const e = Math.max(1, Math.min(5, Math.round(rawE - agePenalty - bmiPenalty)));

  if (agePenalty > 0) reasons.push("Age has been factored into your exertion limit.");
  if (bmiPenalty > 0) reasons.push("Body composition has been factored into your exertion limit.");
  if (a.cardio === "D") reasons.push("Your current cardiovascular baseline limits sustained output at altitude.");
  if (a.load === "C" || a.load === "D") reasons.push("Limited backpack experience raises fatigue risk on multi-day treks.");

  // ── Risk ──────────────────────────────────────────────────────────────────
  const altScore: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
  const r = Math.max(1, Math.min(5, altScore[a.altitude] + (a.load === "A" ? 1 : 0)));

  if (a.altitude === "A") reasons.push("No altitude exposure on record — starting with low-risk routes protects against AMS.");

  // ── Technicality ─────────────────────────────────────────────────────────
  const terrainScore: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
  const t = terrainScore[a.terrain];

  // ── Label ─────────────────────────────────────────────────────────────────
  const avg = (e + r + t) / 3;
  const label =
    avg <= 1.5 ? "Beginner Explorer" :
    avg <= 2.5 ? "Trail Trekker" :
    avg <= 3.5 ? "Mountain Adventurer" :
    avg <= 4.2 ? "High-Altitude Trekker" :
    "Expedition Climber";

  const summary = buildSummary({ e, r, t }, label, a);

  return { ert: { e, r, t }, label, summary, limitReasons: reasons };
}

function buildSummary(ert: ERT, label: string, a: MatchmakerAnswers): string {
  const parts: string[] = [];
  if (ert.e <= 2)
    parts.push(`Your cardiovascular profile supports shorter trekking days — up to ${ert.e === 1 ? "4" : "6"} hours on moderate terrain.`);
  else if (ert.e === 3)
    parts.push("You can sustain typical multi-day trekking with 5–7 hour walking days.");
  else
    parts.push("Your endurance supports long expedition-style days with significant elevation gain.");

  if (ert.r <= 2)
    parts.push("We recommend routes with reliable trail infrastructure and accessible rescue options.");
  else if (ert.r === 3)
    parts.push("You have enough altitude experience to handle moderately remote routes.");
  else
    parts.push("Your altitude history qualifies you for high-altitude and remote environments.");

  if (ert.t === 1)
    parts.push("Stick to walk-in trails — no scrambling or technical gear required.");
  else if (ert.t <= 3)
    parts.push(`You're comfortable with ${T_LABELS[ert.t].toLowerCase()} terrain.`);
  else
    parts.push("You're qualified for routes requiring crampons or mountaineering gear.");

  return parts.join(" ");
}

// ─── Adventure matching ───────────────────────────────────────────────────────

export function getMatchedAdventures(profile: ERT, all: Adventure[]): Adventure[] {
  return all
    .filter(a => {
      const ert = getERT(a);
      return ert.e <= profile.e && ert.r <= profile.r && ert.t <= profile.t;
    })
    .sort((a, b) => {
      // Prefer adventures closest to (but not exceeding) the user's ceiling
      const ea = getERT(a), eb = getERT(b);
      const scoreA = ea.e + ea.r + ea.t;
      const scoreB = eb.e + eb.r + eb.t;
      return scoreB - scoreA; // highest-matching first
    })
    .slice(0, 5);
}

// ─── Gap analysis ─────────────────────────────────────────────────────────────

export function getErtGaps(userErt: ERT, adventureErt: ERT): ErtGap[] {
  const gaps: ErtGap[] = [];

  if (adventureErt.e > userErt.e) {
    gaps.push({
      dimension: "e", label: "Exertion",
      userVal: userErt.e, adventureVal: adventureErt.e,
      gap: adventureErt.e - userErt.e,
      userLabel: E_LABELS[userErt.e],
      adventureLabel: E_LABELS[adventureErt.e],
      explanation: adventureErt.e >= 4
        ? "This trek involves 6–8 hour walking days for 10+ consecutive days at altitude. At your current endurance level, recovery between days may be insufficient."
        : "This trek involves longer or steeper days than your current fitness comfortably supports.",
    });
  }

  if (adventureErt.r > userErt.r) {
    gaps.push({
      dimension: "r", label: "Risk",
      userVal: userErt.r, adventureVal: adventureErt.r,
      gap: adventureErt.r - userErt.r,
      userLabel: R_LABELS[userErt.r],
      adventureLabel: R_LABELS[adventureErt.r],
      explanation: adventureErt.r >= 4
        ? "The environment is remote and weather can change rapidly. Rescue and evacuation may take many hours or be weather-dependent."
        : "This route has more environmental risk than your current altitude and isolation experience has prepared you for.",
    });
  }

  if (adventureErt.t > userErt.t) {
    gaps.push({
      dimension: "t", label: "Technicality",
      userVal: userErt.t, adventureVal: adventureErt.t,
      gap: adventureErt.t - userErt.t,
      userLabel: T_LABELS[userErt.t],
      adventureLabel: T_LABELS[adventureErt.t],
      explanation: adventureErt.t >= 4
        ? "This route requires ice axe, crampons, or glacier travel experience. Without this, the risk of a serious fall is real."
        : "This route involves terrain (scrambling or exposed ridges) beyond your current comfort zone.",
    });
  }

  return gaps;
}

// ─── Unlock roadmap ───────────────────────────────────────────────────────────

export function getUnlockRoadmap(
  userErt: ERT,
  adventureErt: ERT,
  all: Adventure[]
): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  let n = 1;

  if (adventureErt.e > userErt.e) {
    if (adventureErt.e - userErt.e >= 2)
      steps.push({ step: n++, text: `Build your 5 km run time to under ${adventureErt.e >= 4 ? "28" : "32"} minutes and complete a loaded day-hike of 15+ km.` });
    // Find a stepping-stone trek (one E level below target)
    const bridge = all.find(a => {
      const e = getERT(a);
      return e.e === adventureErt.e - 1 && e.r <= adventureErt.r && e.t <= adventureErt.t;
    });
    if (bridge)
      steps.push({ step: n++, text: `Complete an E${adventureErt.e - 1} trek as preparation`, exampleSlug: bridge.slug, exampleName: bridge.name });
  }

  if (adventureErt.r > userErt.r) {
    if (adventureErt.r >= 3)
      steps.push({ step: n++, text: `Gain experience sleeping above ${adventureErt.r >= 4 ? "4,000m" : "3,000m"} for at least two nights to build altitude tolerance.` });
  }

  if (adventureErt.t > userErt.t) {
    if (adventureErt.t >= 4)
      steps.push({ step: n++, text: "Complete a basic mountaineering skills course covering crampon use, ice axe arrest, and rope techniques." });
    else if (adventureErt.t === 3)
      steps.push({ step: n++, text: "Practice scrambling on a T2–T3 route to build confidence on exposed terrain." });
  }

  return steps;
}

// ─── Smart upsell recommendations ────────────────────────────────────────────

export interface Upsell {
  trigger: string;
  recommendation: string;
  icon: string;
}

export function getUpsells(answers: MatchmakerAnswers, adventureErt: ERT): Upsell[] {
  const upsells: Upsell[] = [];

  if (answers.load === "C" || answers.load === "D")
    upsells.push({ trigger: "Limited backpack experience", recommendation: "Porter or mule support to carry your main bag", icon: "🎒" });

  if (answers.altitude === "A" || answers.altitude === "B")
    upsells.push({ trigger: "Low altitude exposure", recommendation: "An extra acclimatization day at base camp before ascending", icon: "⛰️" });

  if (answers.cardio === "C" || answers.cardio === "D")
    upsells.push({ trigger: "Borderline endurance", recommendation: "A guided trek rather than independent travel — guides set a sustainable pace", icon: "🧭" });

  if (adventureErt.r >= 4)
    upsells.push({ trigger: "High-risk environment", recommendation: "A satellite communicator for emergency contact in remote terrain", icon: "📡" });

  return upsells;
}

// ─── localStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = "ttt_matchmaker_profile";

export interface StoredProfile {
  ert: ERT;
  label: string;
  summary: string;
  answers: MatchmakerAnswers;
}

export function saveProfile(profile: StoredProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

export function loadProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProfile) : null;
  } catch { return null; }
}

export function clearProfile(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
