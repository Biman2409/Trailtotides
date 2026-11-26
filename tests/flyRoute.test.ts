// "Fly the trail" walks the whole itinerary: every trail's joined route covers each walking day,
// takes its side trips, and never jumps far in a straight line. Runs on the real trail files.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { flyRoute } from "../src/app/map/flyRoute";
import type { Trail } from "../src/lib/trails/shared";

const dir = path.join(import.meta.dirname, "../src/lib/trails");
const trails: Trail[] = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const km = (a: number[], b: number[]) => Math.hypot((b[0] - a[0]) * 111.2, (b[1] - a[1]) * 111.2 * Math.cos((a[0] * Math.PI) / 180));

test("trails come back the way the itinerary goes", () => {
  assert.ok(trails.length > 40);
  for (const t of trails) {
    const r = flyRoute(t);
    // The itinerary ends where the joined line ends
    const lastTo = [...t.days].reverse().find((d) => d.to && d.kind !== "travel")?.to;
    const end = lastTo && (t.stops.find((s) => s.name === lastTo) ?? t.sleepPlaces.find((s) => s.name === lastTo));
    const tail = r.trail.line[r.trail.line.length - 1];
    if (end) assert.ok(km([end.lat, end.lng], tail) < 1.6, `${t.slug}: the fly-through ends ${km([end.lat, end.lng], tail).toFixed(1)} km from ${lastTo}`);
  }
});

test("a joined route covers every walking day and every side trip in the itinerary", () => {
  for (const t of trails) {
    const r = flyRoute(t);
    if (!r.extended) continue;
    for (const d of t.days) if ((d.kind === "walk" || d.kind === "drive") && d.to) assert.ok(r.bands.some((b) => b.day === d.day), `${t.slug}: day ${d.day} isn't in the fly-through`);
    for (const st of t.sideTrips ?? []) if (t.days.some((d) => d.via?.includes(st.name))) assert.ok(r.summits.some((s) => s.name === st.name), `${t.slug}: side trip ${st.name} isn't walked`);
    const names = r.summits.map((s) => `${s.name}@${Math.round(s.km)}`);
    assert.equal(new Set(names).size, names.length, `${t.slug}: a side trip is walked twice in a row`);
  }
});

test("the joined line never jumps more than 1.6 km in a straight line", () => {
  for (const t of trails) {
    const L = flyRoute(t).trail.line;
    for (let i = 1; i < L.length; i++) assert.ok(km(L[i - 1], L[i]) < 1.6, `${t.slug}: ${km(L[i - 1], L[i]).toFixed(2)} km jump at point ${i}`);
  }
});
