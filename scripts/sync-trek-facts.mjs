// Sets each mapped trek's Duration, Distance and Base Camp in src/lib/data.ts from its itinerary
// (src/lib/trails/<slug>.json), so the At a glance facts, cards and filters count the trek the
// way the itinerary does: trailhead to trailhead, travel to the trailhead not included.
//   duration      the itinerary's days (travel and rest days in it count)
//   distance      its walking days' km added up, as the Itinerary panel's "about N km on foot"
//   baseCamp      where day 1 starts
//   lat, lng      the trek's map pin, on the trail (see keyPoint)
// Run after build-trail.mjs: node scripts/sync-trek-facts.mjs

import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const DATA = "src/lib/data.ts";
const DIR = "src/lib/trails/";
let src = readFileSync(DATA, "utf8");

// The filter buckets; six days sits on the line, so a six-day trek keeps the bucket it has
const bucket = (days, current) => (days <= 2 ? "Weekend" : days <= 5 ? "3–5 days" : days === 6 ? current : "7+ days");

const km = ([la1, lo1], [la2, lo2]) => {
  const r = Math.PI / 180;
  const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

/**
 * Where the trek's map pin goes, so it sits on the trail map's line:
 *   the place the trek is named after, when the trail has it (Everest Base Camp, Valley of Flowers,
 *   Tarsar Lake); the highest of them when it names two (Gaumukh–Tapovan)
 *   else, on a trek that goes there and comes back the same way, where it turns round
 *   else (a loop, or a crossing from one valley to another) its highest point
 */
function keyPoint(trail, name) {
  const places = [...trail.stops, ...trail.side, ...trail.sleepPlaces];
  const title = name.toLowerCase();
  // (a trek named after a valley isn't pinned to the village of that name: Markha Valley)
  const named = places.filter((p) => p.name.length > 3 && title.includes(p.name.toLowerCase()) && !title.includes(`${p.name.toLowerCase()} valley`));
  if (named.length) return named.sort((a, b) => (b.ele ?? 0) - (a.ele ?? 0))[0];
  const first = trail.stops[0], last = trail.stops[trail.stops.length - 1];
  const loop = km([first.lat, first.lng], [last.lat, last.lng]) < 1;
  if (!loop && trail.days[trail.days.length - 1]?.to === trail.days[0]?.from) return last;
  // The highest named place, unless the line goes clearly higher somewhere unnamed (a pass)
  const top = [...trail.stops, ...trail.side].filter((p) => p.ele != null).sort((a, b) => b.ele - a.ele)[0];
  const hi = trail.line.reduce((h, p) => (p[2] > h[2] ? p : h), trail.line[0]);
  return top && top.ele >= hi[2] - 80 ? top : { name: "the trail's high point", lat: hi[0], lng: hi[1], ele: hi[2] };
}

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const trail = JSON.parse(readFileSync(DIR + file, "utf8"));
  const start = src.indexOf(`slug: "${trail.slug}"`);
  if (start < 0) { console.warn(`${trail.slug}: not in data.ts`); continue; }
  let end = src.indexOf('slug: "', start + 10);
  if (end < 0) end = src.length;
  let entry = src.slice(start, end);
  const before = entry;

  const days = trail.days.length;
  const walked = Math.round(trail.days.filter((d) => d.kind === "walk").reduce((s, d) => s + (d.km ?? 0), 0));
  const set = (key, value, required = true) => {
    const re = new RegExp(`(\\b${key}: )"[^"]*"`);
    if (re.test(entry)) entry = entry.replace(re, `$1"${value}"`);
    else if (required) console.warn(`${trail.slug}: no ${key}`);
  };

  set("duration", bucket(days, entry.match(/\bduration: "([^"]*)"/)?.[1]));
  set("durationDays", `${days} days`);
  set("durationRange", `${days} Days`, false);
  set("distance", `${walked}km`);
  set("distanceRange", `${walked} km`, false);
  set("baseCamp", trail.days[0].from);
  let pin = keyPoint(trail, entry.match(/\bname: "([^"]*)"/)?.[1] ?? trail.slug);
  // A stop can sit a little off the drawn line (a campsite beside the path): the pin goes on the
  // line itself, at its nearest point. Side trips are drawn as their own points and keep theirs
  if (!trail.side.some((s) => s.name === pin.name)) {
    const near = trail.line.reduce((b, p) => (km([pin.lat, pin.lng], p) < km([pin.lat, pin.lng], b) ? p : b), trail.line[0]);
    pin = { ...pin, lat: near[0], lng: near[1] };
  }
  for (const [key, value] of [["lat", pin.lat], ["lng", pin.lng]]) {
    const re = new RegExp(`(\\b${key}: )-?[\\d.]+`);
    if (re.test(entry)) entry = entry.replace(re, `$1${(+value).toFixed(5)}`);
    else console.warn(`${trail.slug}: no ${key}`);
  }

  if (entry !== before) {
    src = src.slice(0, start) + entry + src.slice(end);
    console.log(`${trail.slug}: ${days} days, ${walked} km from ${trail.days[0].from}, pin at ${pin.name}`);
  }
}

writeFileSync(DATA, src);
