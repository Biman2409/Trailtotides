// OpenStreetMap data from local Geofabrik extracts (.osm.pbf), so the trail scripts don't depend on
// the public Overpass servers (busy, often timing out). Two parts:
//   extract   node scripts/osm-local.mjs extract   reads every .osm.pbf in OSM_DIR once and keeps
//             what lies around the treks (every walkable way, every named place of the kinds
//             placesNear wants) in OSM_DIR/extract.json
//   query     localPlaces(box), localWays(box), localGraph(box): what osm.mjs asks Overpass for,
//             answered from extract.json when it exists
// OSM_DIR defaults to ~/trail-data/osm (kept out of the repo and out of OneDrive: the files are
// hundreds of MB). Data © OpenStreetMap contributors, ODbL. Downloads: download.geofabrik.de
// (asia/india/northern-zone, asia/nepal, and eastern / north-eastern zones for Darjeeling, Sikkim).
// No dependencies: the PBF format (zlib-packed protobuf blocks) is read here directly.
import { openSync, readSync, closeSync, readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { homedir } from "node:os";
import { join } from "node:path";

export const OSM_DIR = process.env.OSM_DIR ?? join(homedir(), "trail-data", "osm");
const EXTRACT = join(OSM_DIR, "extract.json");

// ── Protobuf, just enough of it ──────────────────────────────────────────────
function varint(buf, pos) {
  let v = 0, mul = 1, b;
  do { b = buf[pos.p++]; v += (b & 0x7f) * mul; mul *= 128; } while (b & 0x80);
  return v;
}
const zz = (v) => (v % 2 ? -(v + 1) / 2 : v / 2); // zigzag (sint)
/** Fields of one message: [fieldNo, wireType, value or {start,end}] */
function* fields(buf, start = 0, end = buf.length) {
  const pos = { p: start };
  while (pos.p < end) {
    const key = varint(buf, pos), no = Math.floor(key / 8), wt = key & 7;
    if (wt === 0) yield [no, 0, varint(buf, pos)];
    else if (wt === 2) { const len = varint(buf, pos); yield [no, 2, { start: pos.p, end: pos.p + len }]; pos.p += len; }
    else if (wt === 1) { pos.p += 8; } else if (wt === 5) { pos.p += 4; } else throw new Error(`wire type ${wt}`);
  }
}
const packed = (buf, r) => { const out = [], pos = { p: r.start }; while (pos.p < r.end) out.push(varint(buf, pos)); return out; };
const str = (buf, r) => buf.toString("utf8", r.start, r.end);

// ── PBF blocks ───────────────────────────────────────────────────────────────
function* blocks(file) {
  const fd = openSync(file, "r"), size = statSync(file).size;
  let off = 0;
  const head = Buffer.alloc(4);
  try {
    while (off < size) {
      readSync(fd, head, 0, 4, off); off += 4;
      const hlen = head.readUInt32BE(0), hb = Buffer.alloc(hlen);
      readSync(fd, hb, 0, hlen, off); off += hlen;
      let type = "", dsize = 0;
      for (const [no, , v] of fields(hb)) { if (no === 1) type = str(hb, v); if (no === 3) dsize = v; }
      const blob = Buffer.alloc(dsize);
      readSync(fd, blob, 0, dsize, off); off += dsize;
      if (type !== "OSMData") continue;
      let data = null;
      for (const [no, , v] of fields(blob)) {
        if (no === 1) data = blob.subarray(v.start, v.end);
        if (no === 3) data = inflateSync(blob.subarray(v.start, v.end));
      }
      if (data) yield data;
    }
  } finally { closeSync(fd); }
}

/** Calls onNode(id, lat, lng, tags|null) and onWay(id, refs, tags) for every element of a block */
function readBlock(buf, { onNode, onWay, wantNodes = true, wantWays = true }) {
  let strings = [], gran = 100, latOff = 0, lonOff = 0;
  const groups = [];
  for (const [no, , v] of fields(buf)) {
    if (no === 1) strings = [...fields(buf, v.start, v.end)].filter(([n]) => n === 1).map(([, , r]) => str(buf, r));
    else if (no === 2) groups.push(v);
    else if (no === 17) gran = v; else if (no === 19) latOff = v; else if (no === 20) lonOff = v;
  }
  const deg = (raw, o) => (o + gran * raw) * 1e-9;
  for (const g of groups) for (const [no, , v] of fields(buf, g.start, g.end)) {
    if (no === 2 && wantNodes) { // DenseNodes
      let ids = [], lats = [], lons = [], kv = [];
      for (const [f, , r] of fields(buf, v.start, v.end)) {
        if (f === 1) ids = packed(buf, r); else if (f === 8) lats = packed(buf, r); else if (f === 9) lons = packed(buf, r); else if (f === 10) kv = packed(buf, r);
      }
      let id = 0, la = 0, lo = 0, k = 0;
      for (let i = 0; i < ids.length; i++) {
        id += zz(ids[i]); la += zz(lats[i]); lo += zz(lons[i]);
        let tags = null;
        while (k < kv.length && kv[k] !== 0) { (tags ??= {})[strings[kv[k]]] = strings[kv[k + 1]]; k += 2; }
        k++;
        onNode(id, deg(la, latOff), deg(lo, lonOff), tags);
      }
    } else if (no === 1 && wantNodes) { // plain Node
      let id = 0, la = 0, lo = 0, keys = [], vals = [];
      for (const [f, , r] of fields(buf, v.start, v.end)) {
        if (f === 1) id = zz(r); else if (f === 8) la = zz(r); else if (f === 9) lo = zz(r); else if (f === 2) keys = packed(buf, r); else if (f === 3) vals = packed(buf, r);
      }
      const tags = keys.length ? Object.fromEntries(keys.map((kk, i) => [strings[kk], strings[vals[i]]])) : null;
      onNode(id, deg(la, latOff), deg(lo, lonOff), tags);
    } else if (no === 3 && wantWays) { // Way
      let id = 0, keys = [], vals = [], refs = [];
      for (const [f, , r] of fields(buf, v.start, v.end)) {
        if (f === 1) id = r; else if (f === 2) keys = packed(buf, r); else if (f === 3) vals = packed(buf, r); else if (f === 8) refs = packed(buf, r);
      }
      let ref = 0;
      onWay(id, refs.map((d) => (ref += zz(d))), Object.fromEntries(keys.map((kk, i) => [strings[kk], strings[vals[i]]])));
    }
  }
}

// ── What the trail scripts want ──────────────────────────────────────────────
export const WALKABLE = /^(path|footway|track|bridleway|steps|cycleway|pedestrian|unclassified|residential|service|tertiary|secondary|primary|trunk|living_street|road)$/;
// The same named places placesNear asks Overpass for
const isPlace = (t) => !!t?.name && (!!t.place
  || /^(camp_site|alpine_hut|wilderness_hut|guest_house|hostel|hotel|viewpoint|attraction)$/.test(t.tourism ?? "")
  || /^(peak|saddle|water|glacier|spring|ridge|hill|plateau|grassland|meadow|cliff)$/.test(t.natural ?? "")
  || t.mountain_pass === "yes" || /^(shelter|place_of_worship)$/.test(t.amenity ?? "") || !!t.historic || t.landuse === "meadow");
const PLACE_TAGS = ["name", "name:en", "alt_name", "official_name", "old_name", "int_name", "short_name", "loc_name", "ele", "place", "tourism", "natural", "mountain_pass", "amenity", "water", "historic", "landuse"];
const keepTags = (t) => Object.fromEntries(PLACE_TAGS.filter((k) => t[k] != null).map((k) => [k, t[k]]));

/** Boxes ([s, w, n, e]) around every trek: its built trail, or its configured centre */
async function trekBoxes() {
  const boxes = [];
  const DIR = "src/lib/trails/";
  for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
    const t = JSON.parse(readFileSync(DIR + f, "utf8"));
    const pts = [...t.line, ...t.side.map((s) => [s.lat, s.lng])];
    boxes.push([Math.min(...pts.map((p) => p[0])) - 0.2, Math.min(...pts.map((p) => p[1])) - 0.2, Math.max(...pts.map((p) => p[0])) + 0.2, Math.max(...pts.map((p) => p[1])) + 0.2]);
  }
  // Treks configured but not built yet: around their stops' coordinates
  const { TREKS } = await import("./trek-configs.mjs");
  for (const trek of Object.values(TREKS)) {
    const at = [...(trek.stops ?? []), ...(trek.side ?? [])].filter((s) => Array.isArray(s?.at)).map((s) => s.at);
    if (at.length) boxes.push([Math.min(...at.map((p) => p[0])) - 0.3, Math.min(...at.map((p) => p[1])) - 0.3, Math.max(...at.map((p) => p[0])) + 0.3, Math.max(...at.map((p) => p[1])) + 0.3]);
  }
  return boxes;
}

async function extract() {
  const files = readdirSync(OSM_DIR).filter((f) => f.endsWith(".osm.pbf"));
  if (!files.length) throw new Error(`no .osm.pbf files in ${OSM_DIR}`);
  const boxes = await trekBoxes();
  const inBox = (la, lo) => boxes.some(([s, w, n, e]) => la >= s && la <= n && lo >= w && lo <= e);
  const nodes = new Map(), places = [], ways = [];
  for (const f of files) {
    const t0 = Date.now();
    // 1. Nodes inside the boxes (and named places among them)
    for (const b of blocks(join(OSM_DIR, f))) readBlock(b, { wantWays: false, onNode: (id, la, lo, tags) => {
      if (!inBox(la, lo)) return;
      nodes.set(id, [+la.toFixed(6), +lo.toFixed(6)]);
      if (isPlace(tags)) places.push({ type: "node", lat: +la.toFixed(6), lng: +lo.toFixed(6), tags: keepTags(tags) });
    } });
    // 2. Ways touching them: walkable ones for paths, named ones for places (lakes, meadows)
    for (const b of blocks(join(OSM_DIR, f))) readBlock(b, { wantNodes: false, onWay: (id, refs, tags) => {
      const walk = WALKABLE.test(tags.highway ?? ""), place = isPlace(tags);
      if (!walk && !place) return;
      const inside = refs.filter((r) => nodes.has(r));
      if (!inside.length) return;
      if (walk) ways.push({ id, nodes: inside });
      if (place) {
        const pts = inside.map((r) => nodes.get(r));
        const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length, lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        places.push({ type: "way", lat: +lat.toFixed(6), lng: +lng.toFixed(6), tags: keepTags(tags) });
      }
    } });
    console.log(`${f}: ${Math.round((Date.now() - t0) / 1000)} s, ${nodes.size} nodes, ${ways.length} ways, ${places.length} places so far`);
  }
  // Only the nodes the ways use (places carry their own position)
  const used = new Set(ways.flatMap((w) => w.nodes));
  const nodeOut = {};
  for (const id of used) nodeOut[id] = nodes.get(id);
  // A box counts as covered only if the files had paths in it: a trek outside every downloaded
  // region (Uttarakhand is in Geofabrik's central zone) must go to Overpass, not read as unmapped
  const pathPts = [...used].map((id) => nodes.get(id));
  const covered = boxes.filter(([s, w, n, e]) => pathPts.filter(([la, lo]) => la >= s && la <= n && lo >= w && lo <= e).length >= 200);
  for (const b of boxes) if (!covered.includes(b)) console.warn(`  no paths in ${b.map((v) => v.toFixed(2)).join(",")}: not in the downloaded regions`);
  writeFileSync(EXTRACT, JSON.stringify({ builtAt: new Date().toISOString(), files, boxes: covered, nodes: nodeOut, ways, places }));
  console.log(`wrote ${EXTRACT}: ${used.size} nodes, ${ways.length} ways, ${places.length} places; ${covered.length} of ${boxes.length} trek areas covered`);
}

// ── Queries, in the shapes osm.mjs returns from Overpass ────────────────────
let cache = null;
const load = () => (cache ??= existsSync(EXTRACT) ? JSON.parse(readFileSync(EXTRACT, "utf8")) : false);
/** True when a local extract covers this box (else the caller asks Overpass) */
export function hasLocal([s, w, n, e]) {
  const c = load();
  return !!c && c.boxes.some(([bs, bw, bn, be]) => s >= bs && w >= bw && n <= bn && e <= be);
}
const within = ([s, w, n, e], [la, lo]) => la >= s && la <= n && lo >= w && lo <= e;
/** Overpass-style elements: way["highway"~WALKABLE](box);(._;>;);out skel */
export function localGraph(box) {
  const c = load(), els = [], seen = new Set();
  for (const wy of c.ways) {
    if (!wy.nodes.some((id) => within(box, c.nodes[id]))) continue;
    els.push({ type: "way", id: wy.id, nodes: wy.nodes });
    for (const id of wy.nodes) if (!seen.has(id)) { seen.add(id); els.push({ type: "node", id, lat: c.nodes[id][0], lon: c.nodes[id][1] }); }
  }
  return { elements: els };
}
/** Overpass-style named places with their centre: out center tags */
export function localPlaceElements(box) {
  return { elements: load().places.filter((p) => within(box, [p.lat, p.lng])).map((p) => (p.type === "node" ? { type: "node", lat: p.lat, lon: p.lng, tags: p.tags } : { type: "way", center: { lat: p.lat, lon: p.lng }, tags: p.tags })) };
}

// node scripts/osm-local.mjs find <file.osm.pbf> <name>: named nodes whose name contains <name>,
// and how many nodes and ways the file has (a check that the reader reads it right)
async function find(file, q) {
  let n = 0, w = 0, hits = 0;
  const t0 = Date.now();
  for (const b of blocks(file)) readBlock(b, {
    onNode: (id, la, lo, tags) => { n++; if (tags?.name?.toLowerCase().includes(q.toLowerCase()) && hits++ < 10) console.log(`  ${tags.name} (${Object.entries(tags).filter(([k]) => k !== "name").map(([k, v]) => `${k}=${v}`).join(", ")}) ${la.toFixed(5)},${lo.toFixed(5)}`); },
    onWay: () => { w++; },
  });
  console.log(`${file}: ${n} nodes, ${w} ways, ${Math.round((Date.now() - t0) / 1000)} s`);
}

const main = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/osm-local.mjs");
if (main && process.argv[2] === "extract") await extract();
if (main && process.argv[2] === "find") await find(process.argv[3], process.argv[4] ?? "");
