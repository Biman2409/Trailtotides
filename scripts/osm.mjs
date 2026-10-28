// OpenStreetMap lookups for scripts/build-trail.mjs, through the Overpass API:
//   placesNear   every named village, campsite, hut, pass, peak and lake around a trek, once
//   matchPlace   picks a stop out of those by name (and its other names and spellings)
//   pathRoute    a walking route over the mapped paths near two points, for when BRouter can't
//                connect them: short gaps between paths are bridged and counted
// The data is OpenStreetMap's (ODbL).

const MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const UA = { "User-Agent": "TrailToTides/1.0 (hello@trailtotides.com)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function dist([la1, lo1], [la2, lo2]) {
  const R = 6371000, toRad = Math.PI / 180;
  const dLa = (la2 - la1) * toRad, dLo = (lo2 - lo1) * toRad;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toRad) * Math.cos(la2 * toRad) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function overpass(query) {
  let last;
  for (let attempt = 0; attempt < 6; attempt++) {
    const url = MIRRORS[attempt % MIRRORS.length];
    try {
      const res = await fetch(url, { method: "POST", headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(query), signal: AbortSignal.timeout(180000) });
      if (res.ok) return await res.json();
      last = new Error(`Overpass ${res.status}`);
    } catch (e) { last = e; }
    await sleep(3000 * (attempt + 1)); // busy or rate-limited: wait and try the next mirror
  }
  throw last;
}

const bboxOf = ([s, w, n, e]) => `(${s.toFixed(4)},${w.toFixed(4)},${n.toFixed(4)},${e.toFixed(4)})`;

// ── Places ───────────────────────────────────────────────────────────────────
// What a stop's name says it is, so "Nichnai" (a camp) and "Nichnai Pass" don't take each other
const HIGH = /\b(pass|la|top|peak|ri|summit|col|ghati|jot)\b/i;
const WATER = /\b(lake|tal|taal|kund|sar|tso|pokhari)\b/i;
const kindOf = (t) =>
  t.mountain_pass === "yes" || t.natural === "saddle" ? "pass"
  : ["peak", "volcano", "ridge", "hill"].includes(t.natural) ? "peak"
  : t.natural === "water" || t.water ? "water"
  : t.tourism === "camp_site" || t.tourism === "alpine_hut" || t.tourism === "wilderness_hut" || t.amenity === "shelter" ? "camp"
  : t.place ? "place" : "other";

const FILLER = /\b(lake|tal|taal|camp|campsite|camping|site|base|village|pass|la|top|the|bugyal|thach|glacier|kund|sar|gaon|ghati|danda|hut|temple)\b/g;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ");
const core = (s) => norm(s).replace(FILLER, " ").replace(/\s+/g, "").replace(/(.)\1+/g, "$1"); // doubled letters vary too
// Common spelling swaps in transliterated Himalayan names
const loose = (s) => core(s).replace(/ee|ii/g, "i").replace(/oo|uu/g, "u").replace(/aa/g, "a").replace(/w/g, "v").replace(/ph/g, "f").replace(/kh/g, "k").replace(/gh/g, "g").replace(/dh/g, "d").replace(/th/g, "t").replace(/bh/g, "b").replace(/sh/g, "s").replace(/ch/g, "c").replace(/y/g, "i").replace(/h/g, "");

/** Every named place OpenStreetMap has in a [south, west, north, east] box, with its height when tagged */
export async function placesNear(box) {
  const b = bboxOf(box);
  const j = await overpass(`[out:json][timeout:120];
(
  nwr["name"]["place"]${b};
  nwr["name"]["tourism"~"^(camp_site|alpine_hut|wilderness_hut|guest_house|hostel|hotel|viewpoint|attraction)$"]${b};
  nwr["name"]["natural"~"^(peak|saddle|water|glacier|spring|ridge|hill|plateau|grassland|meadow|cliff)$"]${b};
  nwr["name"]["mountain_pass"="yes"]${b};
  nwr["name"]["amenity"~"^(shelter|place_of_worship)$"]${b};
  nwr["name"]["historic"]${b};
  nwr["name"]["landuse"="meadow"]${b};
);
out center tags;`);
  return j.elements.map((el) => {
    const t = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
    const names = [t.name, t["name:en"], t.alt_name, t.official_name, t.old_name, t.int_name, t.short_name, t.loc_name]
      .filter(Boolean).flatMap((n) => n.split(";")).map((n) => n.trim()).filter(Boolean);
    const ele = t.ele ? Math.round(parseFloat(String(t.ele).replace(",", "."))) : null;
    return { name: t.name, names, lat, lng, ele: Number.isFinite(ele) ? ele : null, kind: kindOf(t) };
  }).filter((p) => p.lat != null && p.names.length);
}

/**
 * The place in `index` a stop names, or null. `near` is where it should be and `maxD` how far
 * from there it may be. Exact names beat loose ones; a high point should be a pass or peak, a lake
 * water, a camp a campsite or village; the closest of equals wins.
 */
export function matchPlace(index, name, { near, maxD, as = name }) {
  // `as` is the stop's own name when `name` is a shorter search for it ("Gadsar" for Gadsar Lake)
  const wantHigh = HIGH.test(as), wantWater = WATER.test(as) && !wantHigh;
  const n0 = norm(name).replace(/\s+/g, " ").trim(), c0 = core(name), l0 = loose(name);
  let best = null;
  for (const p of index) {
    const d = near ? dist(near, [p.lat, p.lng]) : 0;
    if (near && d > maxD) continue;
    let score = 0;
    for (const n of p.names) {
      const s = norm(n).replace(/\s+/g, " ").trim() === n0 ? 3
        : c0.length >= 3 && core(n) === c0 ? 2
        : l0.length >= 4 && loose(n) === l0 ? 1 : 0;
      score = Math.max(score, s);
    }
    if (!score) continue;
    // Type fit: the wrong kind of place with the same name ranks below the right kind
    const fits = wantHigh ? ["pass", "peak"].includes(p.kind) : wantWater ? p.kind === "water" : ["camp", "place", "water", "other"].includes(p.kind);
    // "Nichnai Pass" is never the Nichnai campsite, and Gadsar Lake never Gadsar Pass
    if ((wantHigh || wantWater) && !fits && (wantHigh || ["pass", "peak"].includes(p.kind))) continue;
    const rank = score * 10 + (fits ? 5 : 0) + (p.ele != null ? 1 : 0) - d / 100000;
    if (!best || rank > best.rank) best = { ...p, rank, d };
  }
  return best;
}

// ── Paths ────────────────────────────────────────────────────────────────────
const WALKABLE = "^(path|footway|track|bridleway|steps|cycleway|pedestrian|unclassified|residential|service|tertiary|secondary|primary|trunk|living_street|road)$";

class Heap {
  constructor() { this.a = []; }
  push(k, v) { const a = this.a; a.push([k, v]); let i = a.length - 1; while (i) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } }
    return top;
  }
  get size() { return this.a.length; }
}

/**
 * A route from a to b ([lat, lng]) over OpenStreetMap's paths and roads in the box around them.
 * Where paths don't join up, the route may jump up to `bridge` metres between them, and up to
 * `reach` metres from a or b onto the nearest path; those jumps cost four times their length,
 * so a mapped way round is preferred. Returns { coords: [lat, lng][], bridgedM } or null.
 */
export async function pathRoute(a, b, { bridge = 400, reach = 1500 } = {}) {
  const pad = Math.max(0.02, 0.3 * Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])));
  const box = [Math.min(a[0], b[0]) - pad, Math.min(a[1], b[1]) - pad, Math.max(a[0], b[0]) + pad, Math.max(a[1], b[1]) + pad];
  const j = await overpass(`[out:json][timeout:120];way["highway"~"${WALKABLE}"]${bboxOf(box)};(._;>;);out skel qt;`);
  const pos = new Map(), adj = new Map(), endCount = new Map();
  const edge = (u, v, w, virt) => { if (!adj.has(u)) adj.set(u, []); adj.get(u).push([v, w, virt]); };
  for (const el of j.elements) if (el.type === "node") pos.set(el.id, [el.lat, el.lon]);
  for (const el of j.elements) {
    if (el.type !== "way") continue;
    const ns = el.nodes.filter((n) => pos.has(n));
    for (let i = 1; i < ns.length; i++) {
      const w = dist(pos.get(ns[i - 1]), pos.get(ns[i]));
      edge(ns[i - 1], ns[i], w, false); edge(ns[i], ns[i - 1], w, false);
    }
    for (const n of [ns[0], ns[ns.length - 1]]) if (n != null) endCount.set(n, (endCount.get(n) ?? 0) + 1);
  }
  if (!pos.size) return null;

  // Dead ends of paths get bridges to any path node within `bridge` m (a grid keeps it quick)
  const cell = 0.005, key = (p) => `${Math.floor(p[0] / cell)},${Math.floor(p[1] / cell)}`, grid = new Map();
  for (const [id, p] of pos) { if (!adj.has(id)) continue; const k = key(p); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(id); }
  const around = (p, r) => {
    const out = [], span = Math.ceil(r / 111000 / cell) + 1, [ci, cj] = key(p).split(",").map(Number);
    for (let di = -span; di <= span; di++) for (let dj = -span; dj <= span; dj++) for (const id of grid.get(`${ci + di},${cj + dj}`) ?? []) out.push(id);
    return out;
  };
  for (const [id, c] of endCount) {
    if (c !== 1 || adj.get(id)?.length > 1) continue; // only true dead ends
    const p = pos.get(id);
    for (const o of around(p, bridge)) {
      if (o === id) continue;
      const d = dist(p, pos.get(o));
      if (d > 0 && d <= bridge) { edge(id, o, d * 4, true); edge(o, id, d * 4, true); }
    }
  }
  const A = "A", B = "B";
  pos.set(A, a); pos.set(B, b);
  for (const o of around(a, reach)) { const d = dist(a, pos.get(o)); if (d <= reach) edge(A, o, d * 4, true); }
  for (const o of around(b, reach)) { const d = dist(b, pos.get(o)); if (d <= reach) edge(o, B, d * 4, true); }
  if (dist(a, b) <= reach) edge(A, B, dist(a, b) * 4, true);

  const best = new Map([[A, 0]]), prev = new Map(), h = new Heap();
  h.push(0, A);
  while (h.size) {
    const [c, u] = h.pop();
    if (u === B) break;
    if (c > (best.get(u) ?? Infinity)) continue;
    for (const [v, w, virt] of adj.get(u) ?? []) {
      const nc = c + w;
      if (nc < (best.get(v) ?? Infinity)) { best.set(v, nc); prev.set(v, [u, virt]); h.push(nc, v); }
    }
  }
  if (!prev.has(B)) return null;
  const ids = [B], virts = [];
  for (let u = B; u !== A;) { const [p, virt] = prev.get(u); ids.push(p); virts.push(virt); u = p; }
  ids.reverse(); virts.reverse();
  // Bridged stretches are drawn straight with a point every 100 m, so heights can be looked up
  const coords = [pos.get(ids[0])];
  let bridgedM = 0;
  for (let i = 1; i < ids.length; i++) {
    const p = pos.get(ids[i - 1]), q = pos.get(ids[i]);
    if (virts[i - 1]) {
      const d = dist(p, q), n = Math.max(1, Math.ceil(d / 100));
      bridgedM += d;
      for (let k = 1; k < n; k++) coords.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
    }
    coords.push(q);
  }
  return { coords, bridgedM };
}
