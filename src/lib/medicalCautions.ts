// Derives advisory-only caution strings for a specific adventure from a
// user's medical flags. Never filters, reorders, or hides matched
// adventures, and never modifies any ACE axis — a flag only ever becomes a
// note. "A person, not the algorithm, should make the final call."

import type { Adventure } from "./data";
import { getACE } from "./ace";
import type { MedicalFlags } from "./matchmakerQuestions";

export function deriveMedicalCautions(flags: MedicalFlags | null | undefined, adventure: Adventure): string[] {
  if (!flags) return [];
  const req = getACE(adventure);
  const isExtreme = adventure.difficulty === "Extreme";
  const notes: string[] = [];

  if (flags.cardioRespiratory && (req.stamina >= 4 || req.altitude >= 4)) {
    notes.push("You mentioned a cardiovascular or respiratory condition — this adventure's exertion and/or altitude demands may need a doctor's clearance.");
  }
  if (flags.jointInjury && (req.strength >= 4 || req.agility >= 4)) {
    notes.push("You mentioned a joint, bone, or recent injury — this adventure's load-bearing or technical terrain could aggravate it. Worth a check-in before booking.");
  }
  if (flags.ongoingMedicalNeeds && req.nerve >= 4) {
    notes.push("You mentioned needing regular access to medical care or supplies — this adventure is remote and self-reliant, so plan for carrying what you need or confirm evacuation options.");
  }
  if (flags.medicationEffects && (req.focus >= 4 || req.agility >= 4)) {
    notes.push("You mentioned medication that can affect balance or reaction time — this adventure demands sustained focus or technical footing.");
  }
  if (flags.pregnancy === "yes" && (req.altitude >= 4 || req.water >= 3 || isExtreme)) {
    notes.push("You mentioned you're currently pregnant — this adventure's altitude, water conditions, or overall intensity make a doctor's clearance especially important.");
  }
  if (flags.smokingTier !== undefined && flags.smokingTier >= 3 && req.altitude >= 4) {
    notes.push("High-altitude adventures are significantly harder for smokers due to reduced lung capacity and slower acclimatization — worth factoring in.");
  }
  if (flags.alcoholTier !== undefined && flags.alcoholTier >= 4 && req.altitude >= 4) {
    notes.push("Regular alcohol use can affect hydration, sleep quality, and judgement at altitude — worth pacing yourself differently on this trip.");
  }
  if (isExtreme && flags.pregnancy === "prefer_not_to_say") {
    notes.push("You chose not to share whether you're currently pregnant — for an Extreme-rated trip, we'd recommend a check-in with your doctor before booking.");
  }
  if (isExtreme && flags.skippedAll) {
    notes.push("You skipped the health questions — for an Extreme-rated trip like this, we'd still recommend a check-in with your doctor before booking.");
  }

  return notes;
}
