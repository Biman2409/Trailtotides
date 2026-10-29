// Looks up every named place around the points in scripts/research/landmarks.json (camps the
// trail builder had to estimate, and summits and passes whose height doesn't match) in three
// sources: OpenStreetMap (Overpass), GeoNames (the country dumps) and Wikidata. Writes what it
// finds to research/landmarks.json, nearest first, for placing the stops by hand.
// Runs on GitHub Actions (.github/workflows/find-landmarks.yml): these hosts are out of reach of
// the dev container.

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const items = JSON.parse(readFileSync("scripts/research/landmarks.json", "utf8"));
const UA = { "User-Agent": "trailtotides-research/1.0 (hello@trailtotides.com)" };

const dist = (la1, lo1, la2, lo2) => {
  const r = Math.PI / 180;
  const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

async function get(url, init = {}, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { ...init, headers: { ...UA, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(60000) });
      if (res.ok) return res;
      console.warn(`  ${res.status} from ${url.slice(0, 60)}`);
    } catch (e) { console.warn(`  ${e.message} from ${url.slice(0, 60)}`); }
    await new Promise((r) => setTimeout(r, 5000 * (i + 1)));
  }
  return null;
}

const MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
async function overpass(it) {
  const q = `[out:json][timeout:50];(node(around:${it.r},${it.lat},${it.lng})[name];way(around:${it.r},${it.lat},${it.lng})[name][~"^(natural|place|tourism|water|mountain_pass)$"~"."];);out center tags;`;
  for (let i = 0; i < 3; i++) {
    const res = await get(MIRRORS[i % MIRRORS.length], { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" } }, 1);
    if (!res) continue;
    try {
      const j = await res.json();
      return j.elements.map((e) => {
        const t = e.tags, lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon;
        const kind = ["natural", "place", "tourism", "mountain_pass", "water", "amenity", "highway", "historic", "waterway"].filter((k) => t[k]).map((k) => `${k}=${t[k]}`).join(",");
        return { src: "osm", name: t.name, alt: [t["name:en"], t.alt_name, t.old_name].filter(Boolean).join("|") || undefined, kind, ele: t.ele, lat: +lat.toFixed(5), lng: +lng.toFixed(5), m: Math.round(dist(it.lat, it.lng, lat, lng)), id: `${e.type}/${e.id}` };
      });
    } catch (e) { console.warn(`  overpass parse: ${e.message}`); }
  }
  return null;
}

async function wikidata(it) {
  const q = `SELECT ?item ?label ?coord ?ele WHERE { SERVICE wikibase:around { ?item wdt:P625 ?coord. bd:serviceParam wikibase:center "Point(${it.lng} ${it.lat})"^^geo:wktLiteral; wikibase:radius "${it.r / 1000}". } OPTIONAL { ?item wdt:P2044 ?ele. } ?item rdfs:label ?label. FILTER(LANG(?label) = "en") } LIMIT 200`;
  const res = await get("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(q), { headers: { Accept: "application/sparql-results+json" } });
  if (!res) return null;
  const j = await res.json();
  return j.results.bindings.map((b) => {
    const [lng, lat] = b.coord.value.match(/[-\d.]+/g).map(Number);
    return { src: "wikidata", name: b.label.value, ele: b.ele?.value, lat: +lat.toFixed(5), lng: +lng.toFixed(5), m: Math.round(dist(it.lat, it.lng, lat, lng)), id: b.item.value.split("/").pop() };
  });
}

// GeoNames: the whole country dump once, then every row near any of the points
function geonames() {
  mkdirSync("/tmp/gn", { recursive: true });
  const rows = [];
  for (const cc of ["IN", "NP"]) {
    if (!existsSync(`/tmp/gn/${cc}.txt`)) execSync(`curl -sSL --retry 3 -o /tmp/gn/${cc}.zip https://download.geonames.org/export/dump/${cc}.zip && unzip -o -q /tmp/gn/${cc}.zip ${cc}.txt -d /tmp/gn`);
    for (const line of readFileSync(`/tmp/gn/${cc}.txt`, "utf8").split("\n")) {
      const f = line.split("\t");
      if (f.length < 17) continue;
      rows.push({ name: f[1], alt: f[3], lat: +f[4], lng: +f[5], code: `${f[6]}.${f[7]}`, ele: f[15] || undefined, dem: f[16], id: f[0] });
    }
  }
  return rows;
}

let gn = [];
try { gn = geonames(); console.log(`GeoNames: ${gn.length} places`); } catch (e) { console.warn(`GeoNames unavailable: ${e.message}`); }

mkdirSync("research", { recursive: true });
const out = [];
for (const it of items) {
  console.log(`${it.slug}: ${it.name}`);
  const osm = await overpass(it);
  await new Promise((r) => setTimeout(r, 2000));
  const wd = await wikidata(it);
  const g = gn.filter((p) => Math.abs(p.lat - it.lat) < 0.1 && Math.abs(p.lng - it.lng) < 0.1).map((p) => ({ src: "geonames", ...p, alt: p.alt ? p.alt.split(",").slice(0, 6).join("|") : undefined, m: Math.round(dist(it.lat, it.lng, p.lat, p.lng)) })).filter((p) => p.m <= it.r);
  const found = [...(osm ?? []), ...(wd ?? []), ...g].sort((a, b) => a.m - b.m);
  console.log(`  osm ${osm ? osm.length : "failed"}, wikidata ${wd ? wd.length : "failed"}, geonames ${g.length}`);
  out.push({ ...it, osmOk: !!osm, found });
  // Saved after each place, so a run cut short keeps what it found
  writeFileSync("research/landmarks.json", JSON.stringify(out, null, 1));
}
