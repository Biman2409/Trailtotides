// Compares every built trail (src/lib/trails/<slug>.json) with the GPS tracks people have
// uploaded to OpenStreetMap (public traces, ODbL), and writes research/trail-traces.md.
// For each point along the trail, every 25 m, the nearest uploaded track point:
//   on track      within 50 m: people walked where the line runs
//   near          50–150 m: the same path, give or take GPS error and the line's thinning
//   off track     over 150 m, with tracks within 500 m: people walked somewhere else nearby
//   no tracks     nothing uploaded within 500 m: nothing to compare against
// A stretch of 300 m or more off track is listed: the line may follow the wrong path there.
// Tracks include drives and other paths, so "on track" near a road is weaker evidence than on a
// high trail. Run: node scripts/check-traces.mjs [<slug> ...]   (needs network; ~1 s a request)

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";

const DIR = "src/lib/trails";
const UA = { "User-Agent": "TrailToTides/1.0 (hello@trailtotides.com)" };
const CELL = 0.05; // degrees: tracks are fetched for each 0.05° square the trail passes through
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function dist([la1, lo1], [la2, lo2]) {
  const R = 6371000, r = Math.PI / 180;
  const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// The trail's points every 25 m, with how far along each is
function densify(line) {
  const out = [{ p: line[0], km: 0 }];
  let km = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], d = dist(a, b), n = Math.max(1, Math.ceil(d / 25));
    for (let k = 1; k <= n; k++) out.push({ p: [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n], km: (km + (d * k) / n) / 1000 });
    km += d;
  }
  return out;
}

// Uploaded track points in one square, up to three pages of 5,000, shared between trails
const cells = new Map();
async function cellPoints(cx, cy) {
  const key = `${cx},${cy}`;
  if (cells.has(key)) return cells.get(key);
  const [w, s] = [cx * CELL, cy * CELL];
  const pts = [], tracks = new Set();
  for (let page = 0; page < 3; page++) {
    const url = `https://api.openstreetmap.org/api/0.6/trackpoints?bbox=${w.toFixed(3)},${s.toFixed(3)},${(w + CELL).toFixed(3)},${(s + CELL).toFixed(3)}&page=${page}`;
    let xml = null;
    for (let attempt = 0; attempt < 4 && xml == null; attempt++) {
      try {
        const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60000) });
        if (res.ok) xml = await res.text();
        else if (res.status < 500 && res.status !== 429) throw new Error(`OSM ${res.status}`);
      } catch (e) { if (attempt === 3) throw e; }
      await sleep(1000 * (attempt + 1));
    }
    for (const m of xml.matchAll(/<url>([^<]+)<\/url>/g)) tracks.add(m[1]);
    let n = 0;
    for (const m of xml.matchAll(/<trkpt lat="([-\d.]+)" lon="([-\d.]+)"/g)) { pts.push([+m[1], +m[2]]); n++; }
    if (n < 5000) break;
  }
  const out = { pts, tracks };
  cells.set(key, out);
  return out;
}

async function check(t) {
  const along = densify(t.line);
  // Every square within ~500 m of the trail
  const need = new Set();
  for (const { p } of along) for (const dy of [-0.005, 0, 0.005]) for (const dx of [-0.005, 0, 0.005]) need.add(`${Math.floor((p[1] + dx) / CELL)},${Math.floor((p[0] + dy) / CELL)}`);
  // Track points in a ~100 m grid, so each trail point only looks at the points around it
  const grid = new Map(), tracks = new Set();
  const g = (la, lo) => `${Math.floor(la / 0.001)},${Math.floor(lo / 0.001)}`;
  for (const key of need) {
    const [cx, cy] = key.split(",").map(Number);
    const c = await cellPoints(cx, cy);
    c.tracks.forEach((u) => tracks.add(u));
    for (const q of c.pts) { const k = g(q[0], q[1]); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(q); }
  }
  const nearest = (p) => {
    let best = Infinity;
    const [gy, gx] = [Math.floor(p[0] / 0.001), Math.floor(p[1] / 0.001)];
    for (let dy = -5; dy <= 5; dy++) for (let dx = -6; dx <= 6; dx++) for (const q of grid.get(`${gy + dy},${gx + dx}`) ?? []) { const d = dist(p, q); if (d < best) best = d; }
    return best;
  };
  const kind = along.map(({ p }) => { const d = nearest(p); return d <= 50 ? "on" : d <= 150 ? "near" : d <= 500 ? "off" : "none"; });
  const count = (k) => kind.filter((x) => x === k).length;
  const covered = kind.length - count("none");
  // Stretches of 300 m or more off track
  const stretches = [];
  for (let i = 0; i < kind.length; i++) {
    if (kind[i] !== "off") continue;
    let j = i;
    while (j + 1 < kind.length && kind[j + 1] === "off") j++;
    if (along[j].km - along[i].km >= 0.3) stretches.push({ from: along[i].km, to: along[j].km });
    i = j;
  }
  return {
    slug: t.slug, km: t.lengthKm, tracks: tracks.size,
    coveredPct: Math.round((100 * covered) / kind.length),
    onPct: covered ? Math.round((100 * count("on")) / covered) : null,
    nearPct: covered ? Math.round((100 * count("near")) / covered) : null,
    offPct: covered ? Math.round((100 * count("off")) / covered) : null,
    stretches,
  };
}

const args = process.argv.slice(2);
const slugs = args.length ? args : (await readdir(DIR)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const results = [];
for (const slug of slugs) {
  const t = JSON.parse(await readFile(`${DIR}/${slug}.json`, "utf8"));
  try {
    const r = await check(t);
    results.push(r);
    console.log(`${slug}: ${r.tracks} tracks, ${r.coveredPct}% of the trail has tracks nearby; of that ${r.onPct}% on, ${r.nearPct}% near, ${r.offPct}% off; ${r.stretches.length} off-track stretches`);
  } catch (e) { console.error(`${slug}: FAILED ${e.message}`); }
}

// Worst first: the most off-track trail where there are tracks to compare
const order = [...results].sort((a, b) => (b.offPct ?? -1) - (a.offPct ?? -1));
const md = [
  "# Trails against uploaded GPS tracks",
  "",
  `${results.length} trails compared with the public GPS tracks people have uploaded to OpenStreetMap. ` +
    "For each 25 m of trail, the nearest uploaded track point: on track within 50 m, near within 150 m, off track beyond that with tracks within 500 m. " +
    "Tracks include drives and other paths nearby, so treat on-track near roads as weak evidence.",
  "",
  "| Trail | km | Tracks | Trail with tracks nearby | On | Near | Off | Off-track stretches (km along) |",
  "|---|---|---|---|---|---|---|---|",
  ...order.map((r) => `| ${r.slug} | ${r.km} | ${r.tracks} | ${r.coveredPct}% | ${r.onPct ?? "–"}% | ${r.nearPct ?? "–"}% | ${r.offPct ?? "–"}% | ${r.stretches.map((s) => `${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ") || "–"} |`),
  "",
];
await mkdir("research", { recursive: true });
await writeFile("research/trail-traces.md", md.join("\n"));
console.log(`Wrote research/trail-traces.md`);
