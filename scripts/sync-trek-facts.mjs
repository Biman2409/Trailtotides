// Sets each mapped trek's Duration, Distance and Base Camp in src/lib/data.ts from its itinerary
// (src/lib/trails/<slug>.json), so the At a glance facts, cards and filters count the trek the
// way the itinerary does: trailhead to trailhead, travel to the trailhead not included.
//   duration      the itinerary's days (travel and rest days in it count)
//   distance      its walking days' km added up, as the Itinerary panel's "about N km on foot"
//   baseCamp      where day 1 starts
// Run after build-trail.mjs: node scripts/sync-trek-facts.mjs

import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const DATA = "src/lib/data.ts";
const DIR = "src/lib/trails/";
let src = readFileSync(DATA, "utf8");

// The filter buckets; six days sits on the line, so a six-day trek keeps the bucket it has
const bucket = (days, current) => (days <= 2 ? "Weekend" : days <= 5 ? "3–5 days" : days === 6 ? current : "7+ days");

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const trail = JSON.parse(readFileSync(DIR + file, "utf8"));
  const start = src.indexOf(`slug: "${trail.slug}"`);
  if (start < 0) { console.warn(`${trail.slug}: not in data.ts`); continue; }
  let end = src.indexOf('slug: "', start + 10);
  if (end < 0) end = src.length;
  let entry = src.slice(start, end);
  const before = entry;

  const days = trail.days.length;
  const km = Math.round(trail.days.filter((d) => d.kind === "walk").reduce((s, d) => s + (d.km ?? 0), 0));
  const set = (key, value, required = true) => {
    const re = new RegExp(`(\\b${key}: )"[^"]*"`);
    if (re.test(entry)) entry = entry.replace(re, `$1"${value}"`);
    else if (required) console.warn(`${trail.slug}: no ${key}`);
  };

  set("duration", bucket(days, entry.match(/\bduration: "([^"]*)"/)?.[1]));
  set("durationDays", `${days} days`);
  set("durationRange", `${days} Days`, false);
  set("distance", `${km}km`);
  set("distanceRange", `${km} km`, false);
  set("baseCamp", trail.days[0].from);

  if (entry !== before) {
    src = src.slice(0, start) + entry + src.slice(end);
    console.log(`${trail.slug}: ${days} days, ${km} km from ${trail.days[0].from}`);
  }
}

writeFileSync(DATA, src);
