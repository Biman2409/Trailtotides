import type { AdventureType, Region, Month } from "@/lib/data";

/** Toggle a value in/out of a selection array. Shared by Explore and Map filter panels. */
export function toggleSelection<T>(arr: T[], val: T, setter: (v: T[]) => void) {
  setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
}

export const REGION_GROUPS: { name: Region; subRegions: string[] }[] = [
  { name: "Himalayas",     subRegions: ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "Arunachal Pradesh", "Nepal", "Bhutan"] },
  { name: "Western Ghats", subRegions: ["Kerala", "Karnataka", "Goa", "Maharashtra"] },
  { name: "Eastern Ghats", subRegions: ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka"] },
  { name: "Desert",        subRegions: ["Rajasthan", "Gujarat"] },
  { name: "Coast",         subRegions: ["Maharashtra", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"] },
  { name: "Islands",       subRegions: ["Andaman & Nicobar", "Lakshadweep"] },
  { name: "Northeast",     subRegions: ["Nagaland", "Manipur", "Meghalaya", "Mizoram", "Assam", "Arunachal Pradesh", "Sikkim"] },
  { name: "Urban",         subRegions: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"] },
];

export const GENRE_GROUPS: { label: string; color: string; types: AdventureType[] }[] = [
  { label: "Earth", color: "#a16207", types: ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Caving", "Motorcycling", "Cycling", "Jeep Safari", "Urban Adventure"] },
  { label: "Water", color: "#0369a1", types: ["Diving", "Kayaking"] },
  { label: "Snow",  color: "#6366f1", types: ["Skiing", "Ice Skating"] },
  { label: "Air",   color: "#0891b2", types: ["Paragliding", "Hot Air Balloon"] },
];

export const SEASONS: { label: string; months: Month[] }[] = [
  { label: "Spring",     months: ["Mar", "Apr"] },
  { label: "Summer",     months: ["May", "Jun"] },
  { label: "Monsoon",    months: ["Jul", "Aug"] },
  { label: "Autumn",     months: ["Sep", "Oct"] },
  { label: "Pre Winter", months: ["Nov", "Dec"] },
  { label: "Winter",     months: ["Jan", "Feb"] },
];
