// Pure ACE-scoring math, no React. Capability answers set each axis; calibration and health
// answers then lower specific axes by fixed multipliers (see the tables below), never by more
// than half in total. Health answers arrive only as MedicalFlags, never as raw answers.

import type { ACE, AceAxis } from "./ace";
import { CAPABILITY_QUESTIONS, DECAY_QUESTIONS, type CapabilityOption, type MedicalFlags } from "./matchmakerQuestions";

const LETTER_SCORE: Record<CapabilityOption["v"], number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };

/** Answer value for "Not sure / haven't tried this" on a capability question. */
export const NOT_SURE = "U";

// Quick mode: the questions that best separate beginners from veterans, plus Water — it can't be
// inferred from anything else and gates whole adventure types, so it's always asked. The other
// answers are estimated from these (see estimateQuickAnswers) until the person refines their profile.
export const QUICK_KEYS = ["stamina-1", "strength-1", "agility-1", "water-1", "altitude-1", "nerve-1"];

/** Fills unanswered capability questions from related quick answers. */
export function estimateQuickAnswers(answers: Partial<Record<string, string>>): Partial<Record<string, string>> {
  const est: Partial<Record<string, string>> = { ...answers };
  const from = (key: string, source: string) => { if (!est[key]) est[key] = answers[source]; };
  from("stamina-2", "stamina-1");
  from("power-1", "strength-1");
  from("power-2", "strength-1");
  from("strength-2", "strength-1");
  from("agility-2", "agility-1");
  from("focus-1", "agility-1");
  return est;
}

function clamp(n: number, min = 1, max = 5): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Combines the two answers for a dual-question axis (stamina/power/strength/
 * agility) into one 1-5 score. A plain average would let someone score high
 * on Power just by being great at one type of burst but bad at repeating it
 * — so once the two answers diverge meaningfully, the result leans toward
 * the weaker one instead of splitting the difference evenly.
 */
export function combineDualAxis(a: number, b: number): number {
  const weak = Math.min(a, b);
  const strong = Math.max(a, b);
  const diff = strong - weak;
  if (diff <= 1) return Math.round((a + b) / 2);
  if (diff === 2) return Math.round(weak * 0.65 + strong * 0.35);
  return Math.round(weak * 0.75 + strong * 0.25);
}

/**
 * The profile so far, for the radar that builds up while someone answers: each axis from the
 * questions answered on it (combined the same way as the final score), 0 where nothing is
 * answered yet or only "Not sure". Before the activity questions, so no decay is applied.
 */
export function liveAxisScores(answers: Partial<Record<string, string>>): Record<AceAxis, number> {
  const byAxis: Partial<Record<AceAxis, number[]>> = {};
  CAPABILITY_QUESTIONS.forEach((q) => {
    const axis = q.axis.toLowerCase() as AceAxis;
    byAxis[axis] ??= [];
    const letter = answers[q.key];
    if (letter && letter !== NOT_SURE && LETTER_SCORE[letter as CapabilityOption["v"]]) byAxis[axis]!.push(LETTER_SCORE[letter as CapabilityOption["v"]]);
  });
  const out = {} as Record<AceAxis, number>;
  (Object.keys(byAxis) as AceAxis[]).forEach((axis) => {
    const v = byAxis[axis]!;
    out[axis] = v.length === 2 ? combineDualAxis(v[0], v[1]) : v.length === 1 ? v[0] : 0;
  });
  return out;
}

const PHYSICAL_AXES: AceAxis[] = ["stamina", "power", "strength", "agility"];
const ALL_AXES: AceAxis[] = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"];

// ── Calibration ───────────────────────────────────────────────────────────────
// Capability answers describe someone's level when they last performed at it; calibration
// estimates how much of that has faded since. It follows the detraining research:
// - Fitness fades at different rates: aerobic endurance fastest (VO2max drops ~7% in the first
//   3 weeks off and ~15-20% by 2-3 months), then power, then maximal strength (largely kept for
//   3-4 weeks), and balance/footwork slowest, since much of it is skill.
// - Most of the loss comes in the first few months, then it levels off.
// - Ongoing training preserves it: about 2 hard sessions a week maintain endurance and 1 a week
//   maintains strength, so current activity shields most of the loss even after a long gap.
// loss(axis) = MAX_LOSS[axis] × RECENCY_SHARE[recency] × (1 − ACTIVITY_SHIELD[activity])
type Tier = 1 | 2 | 3 | 4 | 5;

/** The share of each physical axis lost after a year or more with no training at all. */
const MAX_LOSS: Partial<Record<AceAxis, number>> = { stamina: 0.4, power: 0.3, strength: 0.25, agility: 0.15 };

/** How much of the maximum loss has happened, by recency tier (1 = over a year ago, 5 = this month). */
const RECENCY_SHARE: Record<Tier, number> = { 1: 1, 2: 0.85, 3: 0.7, 4: 0.45, 5: 0.1 };

/** How much of that loss current activity prevents, by activity tier (1 = sedentary, 5 = daily). */
const ACTIVITY_SHIELD: Record<Tier, number> = { 1: 0, 2: 0.15, 3: 0.5, 4: 0.75, 5: 0.9 };

/** The calibration multiplier for each physical axis (non-physical axes aren't calibrated). */
export function computeDecayMultipliers(recencyTier: Tier, activityTier: Tier): Partial<Record<AceAxis, number>> {
  const out: Partial<Record<AceAxis, number>> = {};
  PHYSICAL_AXES.forEach((axis) => {
    const loss = MAX_LOSS[axis]! * RECENCY_SHARE[recencyTier] * (1 - ACTIVITY_SHIELD[activityTier]);
    out[axis] = Math.round((1 - loss) * 100) / 100;
  });
  return out;
}

// ── Health ────────────────────────────────────────────────────────────────────
// Each health answer lowers specific axes. Skipped or "No" changes nothing. Smoking and alcohol
// add more axes as the answer gets heavier. All multipliers on an axis stack.
type HealthEffect = { label: string; axes: Partial<Record<AceAxis, number>> };

export function healthEffects(flags: MedicalFlags | null | undefined): HealthEffect[] {
  if (!flags) return [];
  const out: HealthEffect[] = [];
  if (flags.cardioRespiratory) out.push({ label: "Heart or breathing condition", axes: { stamina: 0.75, power: 0.75 } });
  if (flags.jointInjury) out.push({ label: "Joint, bone or recent injury", axes: { strength: 0.75, agility: 0.75 } });
  if (flags.ongoingMedicalNeeds) out.push({ label: "Ongoing medical needs", axes: { altitude: 0.75, water: 0.75 } });
  if (flags.medicationEffects) out.push({ label: "Medication affecting balance or reactions", axes: { focus: 0.75, nerve: 0.75 } });
  // Smoking: 3 occasionally, 4 regularly under a pack a week, 5 a pack a week or more
  if (flags.smokingTier === 3) out.push({ label: "Smoking (occasionally)", axes: { stamina: 0.95, power: 0.95 } });
  if (flags.smokingTier === 4) out.push({ label: "Smoking (regularly)", axes: { stamina: 0.88, power: 0.88, strength: 0.92, agility: 0.92 } });
  if (flags.smokingTier === 5) out.push({ label: "Smoking (a pack a week or more)", axes: { stamina: 0.8, power: 0.8, strength: 0.88, agility: 0.88, altitude: 0.88, water: 0.88 } });
  // Alcohol: 3 occasionally, 4 weekly, 5 several times a week
  if (flags.alcoholTier === 3) out.push({ label: "Alcohol (occasionally)", axes: { nerve: 0.95, focus: 0.95 } });
  if (flags.alcoholTier === 4) out.push({ label: "Alcohol (weekly)", axes: { nerve: 0.9, focus: 0.9 } });
  if (flags.alcoholTier === 5) out.push({ label: "Alcohol (several times a week)", axes: { nerve: 0.85, focus: 0.85, agility: 0.9, strength: 0.9, altitude: 0.9, water: 0.9 } });
  return out;
}

/** Calibration and health together can take at most half of an axis's answered score */
export const MIN_TOTAL_MULTIPLIER = 0.5;

export interface AceComputationResult {
  ace: ACE;
  rawAxes: Record<AceAxis, number>;
  /** Calibration multiplier per physical axis (empty if calibration wasn't answered) */
  decayMultipliers: Partial<Record<AceAxis, number>>;
  /** Health answers that lowered a score, and on which axes */
  health: HealthEffect[];
  /** The combined multiplier each axis got (after the 50% floor) */
  totalMultiplier: Record<AceAxis, number>;
}

/**
 * Computes the final ACE profile: capability answers, then calibration (physical axes), then
 * health answers (via MedicalFlags), multiplied together and held to at most a 50% drop.
 */
export function computeAceFromAnswers(
  capabilityAnswers: Partial<Record<string, string>>,
  decayAnswers: Partial<Record<string, string>>,
  medicalFlags?: MedicalFlags | null,
): AceComputationResult {
  // 1. Combine each axis's 1-2 capability answers into a raw 1-5 score.
  const byAxis: Partial<Record<AceAxis, number[]>> = {};
  // "U" = "Not sure / haven't tried this". It's left out rather than guessed: on a two-question
  // axis the other answer stands alone; if nothing on the axis is known it scores the cautious 1.
  CAPABILITY_QUESTIONS.forEach((q) => {
    const axisKey = q.axis.toLowerCase() as AceAxis;
    byAxis[axisKey] ??= [];
    const letter = capabilityAnswers[q.key];
    if (letter === NOT_SURE) return;
    byAxis[axisKey]!.push(LETTER_SCORE[(letter ?? "A") as CapabilityOption["v"]] ?? 1);
  });

  const rawAxes = {} as Record<AceAxis, number>;
  (Object.keys(byAxis) as AceAxis[]).forEach((axis) => {
    const vals = byAxis[axis]!;
    rawAxes[axis] = vals.length === 2 ? combineDualAxis(vals[0], vals[1]) : vals.length === 1 ? clamp(vals[0]) : 1;
  });

  // 2. Calibration — per physical axis, from recency and current activity together.
  const recencyOpt = DECAY_QUESTIONS[0].options.find((o) => o.v === decayAnswers[DECAY_QUESTIONS[0].key]);
  const activityOpt = DECAY_QUESTIONS[1].options.find((o) => o.v === decayAnswers[DECAY_QUESTIONS[1].key]);
  const decayMultipliers = recencyOpt && activityOpt
    ? computeDecayMultipliers(recencyOpt.tier, activityOpt.tier)
    : {}; // both questions are mandatory in the UI — this is a safe fallback, not the expected path

  // 3. Health — every effect that applies, stacked per axis.
  const health = healthEffects(medicalFlags);

  const ace = { ...rawAxes } as ACE;
  const totalMultiplier = {} as Record<AceAxis, number>;
  ALL_AXES.forEach((axis) => {
    let m = decayMultipliers[axis] ?? 1;
    health.forEach((h) => { m *= h.axes[axis] ?? 1; });
    m = Math.max(MIN_TOTAL_MULTIPLIER, m);
    totalMultiplier[axis] = m;
    ace[axis] = clamp(Math.round(rawAxes[axis] * m));
  });

  return { ace, rawAxes, decayMultipliers, health, totalMultiplier };
}
