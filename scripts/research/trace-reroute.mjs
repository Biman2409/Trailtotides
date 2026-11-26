// Where a trail runs away from where people walk: for each stretch of 300 m or more off the GPS
// tracks uploaded to OpenStreetMap (as check-traces.mjs finds them), looks for uploaded tracks that
// walk past it, joining the line 150 m before and after (within 60 m) and taking another way between.
// Two or more people's tracks (separate uploaders) agreeing on that way (median within 60 m of each
// other) are taken as the trail: their shared line, as guide points every ~80 m, ready to add to the
// trek's gapGuides in trek-configs.mjs. One track alone isn't: the mapped path stays.
// Writes research/trace-reroute.json and prints a line per stretch.
// Run: node scripts/research/trace-reroute.mjs [<slug> ...]   (needs network; ~1 s a request)
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { lineBetweenKm } from "../trail-geo.mjs";

const UA = { "User-Agent": process.env.MAP_CONTACT ? `trail-builder/1.0 (${process.env.MAP_CONTACT})` : "trail-builder/1.0" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dist = ([la1, lo1], [la2, lo2]) => { const R = 6371000, r = Math.PI / 180; const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const at = (line, km) => lineBetweenKm(line, km, km + 0.001)[0] ?? line.at(-1);

// Uploaded traces in a box: separate tracks with their points in order (identifiable ones), and
// every point (anonymous ones too) for telling where the line is off track
async function traces([s, w, n, e]) {
  const named = [], all = [];
  for (let page = 0; page < 4; page++) {
    const url = `https://api.openstreetmap.org/api/0.6/trackpoints?bbox=${w.toFixed(4)},${s.toFixed(4)},${e.toFixed(4)},${n.toFixed(4)}&page=${page}`;
    let xml = null;
    for (let a = 0; a < 4 && xml == null; a++) {
      try { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60000) }); if (r.ok) xml = await r.text(); else if (r.status !== 429 && r.status < 500) throw new Error(`OSM ${r.status}`); } catch (err) { if (a === 3) throw err; }
      await sleep(1000 * (a + 1));
    }
    let count = 0;
    for (const trk of xml.split("<trk>").slice(1)) {
      const who = trk.match(/<url>\/user\/([^/<]+)\//)?.[1] ?? null;
      const id = trk.match(/<url>([^<]+)<\/url>/)?.[1] ?? null;
      for (const seg of trk.split("<trkseg>").slice(1)) {
        const pts = [...seg.matchAll(/<trkpt lat="([-\d.]+)" lon="([-\d.]+)"/g)].map((m) => [+m[1], +m[2]]);
        count += pts.length; all.push(...pts);
        if (who && pts.length > 3) named.push({ who: decodeURIComponent(who), id, pts });
      }
    }
    if (count < 5000) break;
  }
  return { named, all };
}

function densify(line, step = 25) {
  const out = [{ p: line[0], km: 0 }];
  let km = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], d = dist(a, b), n = Math.max(1, Math.ceil(d / step));
    for (let k = 1; k <= n; k++) out.push({ p: [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n], km: (km + (d * k) / n) / 1000 });
    km += d;
  }
  return out;
}
const nearestD = (p, pts) => pts.reduce((m, q) => Math.min(m, dist(p, q)), Infinity);
const sample = (pts, step) => { const o = [pts[0]]; let acc = 0; for (let i = 1; i < pts.length; i++) { acc += dist(pts[i - 1], pts[i]); if (acc >= step) { o.push(pts[i]); acc = 0; } } if (o.at(-1) !== pts.at(-1)) o.push(pts.at(-1)); return o; };
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1]; };

const DIR = "src/lib/trails/";
const args = process.argv.slice(2);
const slugs = args.length ? args : readdirSync(DIR).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const out = {};
for (const slug of slugs) {
  const t = JSON.parse(readFileSync(`${DIR}${slug}.json`, "utf8"));
  if (t.drives?.length) continue; // circuits: fix the treks they're cut from
  // Every point of the trail and the traces near it, one box per ~0.05° of trail
  const along = densify(t.line);
  const boxes = new Map();
  for (const { p } of along) { const k = `${Math.floor(p[0] / 0.05)},${Math.floor(p[1] / 0.05)}`; boxes.set(k, true); }
  const named = [], all = [];
  for (const k of boxes.keys()) {
    const [cy, cx] = k.split(",").map(Number);
    const r = await traces([cy * 0.05 - 0.004, cx * 0.05 - 0.004, cy * 0.05 + 0.054, cx * 0.05 + 0.054]);
    named.push(...r.named); all.push(...r.all);
  }
  // Points in a ~100 m grid for "is the line on track here"
  const grid = new Map(), gk = (la, lo) => `${Math.floor(la / 0.001)},${Math.floor(lo / 0.001)}`;
  for (const q of all) { const k = gk(q[0], q[1]); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(q); }
  const near = (p) => { let best = Infinity; const [gy, gx] = [Math.floor(p[0] / 0.001), Math.floor(p[1] / 0.001)]; for (let dy = -5; dy <= 5; dy++) for (let dx = -6; dx <= 6; dx++) for (const q of grid.get(`${gy + dy},${gx + dx}`) ?? []) best = Math.min(best, dist(p, q)); return best; };
  const kind = along.map(({ p }) => { const d = near(p); return d <= 150 ? "on" : d <= 500 ? "off" : "none"; });
  const stretches = [];
  for (let i = 0; i < kind.length; i++) { if (kind[i] !== "off") continue; let j = i; while (j + 1 < kind.length && kind[j + 1] === "off") j++; if (along[j].km - along[i].km >= 0.3) stretches.push({ from: along[i].km, to: along[j].km }); i = j; }
  out[slug] = [];
  for (const st of stretches) {
    const A = at(t.line, Math.max(0, st.from - 0.15)), B = at(t.line, Math.min(t.lengthKm, st.to + 0.15));
    const ours = lineBetweenKm(t.line, st.from, st.to);
    const cands = [];
    for (const tr of named) {
      let ia = 0, ib = 0;
      tr.pts.forEach((q, i) => { if (dist(q, A) < dist(tr.pts[ia], A)) ia = i; if (dist(q, B) < dist(tr.pts[ib], B)) ib = i; });
      if (dist(tr.pts[ia], A) > 60 || dist(tr.pts[ib], B) > 60 || ia === ib) continue;
      const part = ia < ib ? tr.pts.slice(ia, ib + 1) : tr.pts.slice(ib, ia + 1).reverse();
      // It must be another way, not the same one with GPS error
      const away = median(part.map((q) => nearestD(q, ours)));
      if (away < 100) continue;
      cands.push({ who: tr.who, id: tr.id, part, away });
    }
    // Agreement: tracks by different people whose lines run within 60 m of each other
    let best = null;
    for (const c of cands) {
      const agree = cands.filter((o) => o.who !== c.who && median(o.part.map((q) => nearestD(q, c.part))) < 60);
      const who = new Set([c.who, ...agree.map((o) => o.who)]);
      if (!best || who.size > best.who.size || (who.size === best.who.size && c.part.length > best.c.part.length)) best = { c, who };
    }
    const r = { fromKm: +st.from.toFixed(2), toKm: +st.to.toFixed(2), candidates: cands.length };
    if (best && best.who.size >= 2) {
      r.people = [...best.who];
      r.trace = best.c.id;
      r.awayM = Math.round(best.c.away);
      r.chain = sample(best.c.part, 80).map(([a, b]) => [+a.toFixed(5), +b.toFixed(5)]);
    }
    out[slug].push(r);
    console.log(`${slug} km ${r.fromKm}–${r.toKm}: ${r.chain ? `${r.people.length} people (${r.people.join(", ")}) walk another way ${r.awayM} m off: ${r.chain.length} guide points` : `${cands.length} track(s) another way, not agreed: keep the line`}`);
  }
}
writeFileSync("research/trace-reroute.json", JSON.stringify(out, null, 1));
console.log("Wrote research/trace-reroute.json");
