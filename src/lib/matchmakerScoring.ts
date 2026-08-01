// Pure ACE-scoring math — no React, no medical data. This file has no
// parameter anywhere through which medical-question answers could reach a
// score; that's the actual enforcement of "medical answers never become a
// number," not just a naming convention.

import type { ACE, AceAxis } from "./ace";
import { CAPABILITY_QUESTIONS, DECAY_QUESTIONS, type CapabilityOption } from "./matchmakerQuestions";

const LETTER_SCORE: Record<CapabilityOption["v"], number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };

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

const PHYSICAL_AXES: AceAxis[] = ["stamina", "power", "strength", "agility"];

const DECAY_TIER_MULTIPLIER: Record<1 | 2 | 3 | 4 | 5, number> = {
  5: 1.0,
  4: 0.9,
  3: 0.8,
  2: 0.68,
  1: 0.55,
};

/** Takes the worse (lower) of the two decay-question tiers — not an average. */
export function computeDecayMultiplier(recencyTier: 1 | 2 | 3 | 4 | 5, activityTier: 1 | 2 | 3 | 4 | 5): number {
  const worst = Math.min(recencyTier, activityTier) as 1 | 2 | 3 | 4 | 5;
  return DECAY_TIER_MULTIPLIER[worst];
}

/** If the user reported an altitude-illness evacuation, cap the axis regardless of height reached. */
export function applyAltitudeCap(rawAltitudeScore: number, evacuationFlagged: boolean, cap = 2): number {
  return evacuationFlagged ? Math.min(rawAltitudeScore, cap) : rawAltitudeScore;
}

export interface AceComputationResult {
  ace: ACE;
  rawAxes: Record<AceAxis, number>;
  decayMultiplier: number;
  altitudeCapped: boolean;
}

/**
 * Computes the final ACE profile from capability + decay + altitude-flag
 * answers. Deliberately takes no medical-answer parameter.
 */
export function computeAceFromAnswers(
  capabilityAnswers: Partial<Record<string, string>>,
  decayAnswers: Partial<Record<string, string>>,
  altitudeEvacuationFlagged: boolean
): AceComputationResult {
  // 1. Combine each axis's 1-2 capability answers into a raw 1-5 score.
  const byAxis: Partial<Record<AceAxis, number[]>> = {};
  CAPABILITY_QUESTIONS.forEach((q) => {
    const letter = capabilityAnswers[q.key] as CapabilityOption["v"] | undefined;
    const val = LETTER_SCORE[letter ?? "A"] ?? 1;
    const axisKey = q.axis.toLowerCase() as AceAxis;
    (byAxis[axisKey] ??= []).push(val);
  });

  const rawAxes = {} as Record<AceAxis, number>;
  (Object.keys(byAxis) as AceAxis[]).forEach((axis) => {
    const vals = byAxis[axis]!;
    rawAxes[axis] = vals.length === 2 ? combineDualAxis(vals[0], vals[1]) : clamp(vals[0]);
  });

  // 2. Decay multiplier — worse of the two decay answers, physical axes only.
  const recencyOpt = DECAY_QUESTIONS[0].options.find((o) => o.v === decayAnswers[DECAY_QUESTIONS[0].key]);
  const activityOpt = DECAY_QUESTIONS[1].options.find((o) => o.v === decayAnswers[DECAY_QUESTIONS[1].key]);
  const decayMultiplier = recencyOpt && activityOpt
    ? computeDecayMultiplier(recencyOpt.tier, activityOpt.tier)
    : 1.0; // both questions are mandatory in the UI — this is a safe fallback, not the expected path

  const ace = { ...rawAxes } as ACE;
  PHYSICAL_AXES.forEach((axis) => {
    ace[axis] = clamp(Math.round(rawAxes[axis] * decayMultiplier));
  });

  // 3. Altitude safety cap — independent of decay (decay never touches altitude).
  const altitudeCapped = altitudeEvacuationFlagged && rawAxes.altitude > 2;
  ace.altitude = applyAltitudeCap(rawAxes.altitude, altitudeEvacuationFlagged);

  return { ace, rawAxes, decayMultiplier, altitudeCapped };
}
