import type { AdventureType } from "@/lib/data";

/** Toggle a value in/out of a selection array. Shared by Explore and Map filter panels. */
export function toggleSelection<T>(arr: T[], val: T, setter: (v: T[]) => void) {
  setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
}

export const GENRE_GROUPS: { label: string; color: string; types: AdventureType[] }[] = [
  { label: "Earth", color: "#a16207", types: ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Caving", "Motorcycling", "Cycling", "Jeep Safari", "Urban Adventure"] },
  { label: "Water", color: "#0369a1", types: ["River Rafting", "Kayaking", "Diving"] },
  { label: "Snow",  color: "#6366f1", types: ["Skiing", "Ice Skating"] },
  { label: "Air",   color: "#0891b2", types: ["Paragliding", "Hot Air Balloon"] },
];

