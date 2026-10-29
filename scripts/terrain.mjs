// Terrain for scripts/build-trail.mjs: where OpenStreetMap has no path between two points of a
// trail, or maps one with so few points that it would be drawn as a long straight line, the line
// is drawn along the terrain instead — the easiest walking route between the two points over a
// 30 m elevation model, the way a path settles into the ground: along a valley side, up a spur in
// switchbacks, never over a cliff.
//   elevation   AWS Terrain Tiles (Mapzen terrarium encoding, SRTM in the Himalaya), public
//   routing     least-cost path, cost = time by Tobler's hiking function, slopes over 45° shut
//   previews    satellite crops (Esri World Imagery) with the line drawn on, for checking by eye
// No dependencies: PNG tiles are read and written with node:zlib.

import { inflateSync, deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";

const UA = { "User-Agent": "TrailToTides/1.0 (hello@trailtotides.com)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function dist([la1, lo1], [la2, lo2]) {
  const R = 6371000, toRad = Math.PI / 180;
  const dLa = (la2 - la1) * toRad, dLo = (lo2 - lo1) * toRad;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toRad) * Math.cos(la2 * toRad) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ── PNG ──────────────────────────────────────────────────────────────────────
// Enough of PNG for map tiles: 8-bit RGB, RGBA or palette, not interlaced

function readPng(buf) {
  let p = 8, w = 0, h = 0, type = 0, palette = null;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), kind = buf.toString("ascii", p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (kind === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; if (data[8] !== 8 || data[12]) throw new Error("unsupported PNG"); }
    else if (kind === "PLTE") palette = data;
    else if (kind === "IDAT") idat.push(data);
    p += 12 + len;
  }
  const bpp = type === 6 ? 4 : type === 2 ? 3 : type === 3 || type === 0 ? 1 : type === 4 ? 2 : 0;
  if (!bpp) throw new Error(`unsupported PNG colour type ${type}`);
  const raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(w * h * 3);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      line[x] = (line[x] + (f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0)) & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 3;
      if (type === 3) { const i = line[x] * 3; out[o] = palette[i]; out[o + 1] = palette[i + 1]; out[o + 2] = palette[i + 2]; }
      else if (type === 0 || type === 4) { out[o] = out[o + 1] = out[o + 2] = line[x * bpp]; }
      else { out[o] = line[x * bpp]; out[o + 1] = line[x * bpp + 1]; out[o + 2] = line[x * bpp + 2]; }
    }
    prev = line;
  }
  return { w, h, rgb: out };
}

function writePng(w, h, rgb) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (kind, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const kd = Buffer.concat([Buffer.from(kind, "ascii"), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(kd)); return Buffer.concat([len, kd, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

// ── Tiles ────────────────────────────────────────────────────────────────────

const tileXY = (lat, lng, z) => {
  const n = 2 ** z, r = (lat * Math.PI) / 180;
  return [((lng + 180) / 360) * n, ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n];
};
const tileLatLng = (x, y, z) => {
  const n = 2 ** z;
  return [(Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI, (x / n) * 360 - 180];
};

// Each tile is fetched once; lookups that need it while it's on its way wait for the same request
const cache = new Map();
function tile(url) {
  if (!cache.has(url)) cache.set(url, fetchTile(url).catch((e) => { cache.delete(url); throw e; }));
  return cache.get(url);
}
async function fetchTile(url) {
  let last;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
      if (res.ok) return readPng(Buffer.from(await res.arrayBuffer()));
      last = new Error(`${new URL(url).host} ${res.status}`);
    } catch (e) { last = e; }
    await sleep(2000 * attempt);
  }
  throw last;
}

// Elevation: terrarium tiles at zoom 14 (about 8 m a pixel here; the data under them is 30 m)
const DEM_Z = 14;
const demUrl = (x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${DEM_Z}/${x}/${y}.png`;

/** Height in metres at a point, interpolated between the tile's pixels */
export async function elevation(lat, lng) {
  const [fx, fy] = tileXY(lat, lng, DEM_Z);
  const px = (fx % 1) * 256 - 0.5, py = (fy % 1) * 256 - 0.5;
  const tx = Math.floor(fx), ty = Math.floor(fy);
  const at = async (x, y) => {
    // pixels just past a tile edge belong to the next tile
    let X = tx, Y = ty;
    if (x < 0) { X--; x += 256; } else if (x > 255) { X++; x -= 256; }
    if (y < 0) { Y--; y += 256; } else if (y > 255) { Y++; y -= 256; }
    const t = await tile(demUrl(X, Y)), o = (y * 256 + x) * 3;
    return t.rgb[o] * 256 + t.rgb[o + 1] + t.rgb[o + 2] / 256 - 32768;
  };
  const x0 = Math.floor(px), y0 = Math.floor(py), dx = px - x0, dy = py - y0;
  const [a, b, c, d] = await Promise.all([at(x0, y0), at(x0 + 1, y0), at(x0, y0 + 1), at(x0 + 1, y0 + 1)]);
  return a * (1 - dx) * (1 - dy) + b * dx * (1 - dy) + c * (1 - dx) * dy + d * dx * dy;
}

// ── The easiest way over the ground ─────────────────────────────────────────

class Heap {
  constructor() { this.a = []; }
  push(k, v) { const a = this.a; a.push([k, v]); let i = a.length - 1; while (i) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
  get size() { return this.a.length; }
}

/**
 * The easiest walking route from a to b ([lat, lng]) over the terrain, within `halfWidth` metres
 * of the straight line between them: a grid of points every `step` m in a band along the line,
 * each move costing its walking time by Tobler's hiking function, slopes steeper than 45° shut.
 * `keep` adds cost for straying from the line (a mapped path's end points are on the path, so a
 * coarsely mapped path stays close to it). Returns [lat, lng, ele][] from a to b.
 */
export async function terrainPath(a, b, { halfWidth = 150, step = 15, keep = 0.002 } = {}) {
  const L = dist(a, b);
  const k = Math.cos((a[0] * Math.PI) / 180) * 111320, m = 110540;
  const ux = ((b[1] - a[1]) * k) / L, uy = ((b[0] - a[0]) * m) / L; // unit vector along a→b, in metres
  const N = Math.max(2, Math.ceil(L / step)), M = Math.max(1, Math.round(halfWidth / step));
  const along = L / N;
  const pt = (i, j) => { const s = i * along, t = j * step; return [a[0] + (s * uy + t * ux) / m, a[1] + (s * ux - t * uy) / k]; };
  const W = 2 * M + 1, id = (i, j) => i * W + (j + M);
  const ele = new Float64Array((N + 1) * W);
  const jobs = [];
  for (let i = 0; i <= N; i++) for (let j = -M; j <= M; j++) { const [la, lo] = pt(i, j); jobs.push(elevation(la, lo).then((e) => (ele[id(i, j)] = e))); }
  await Promise.all(jobs);

  const tobler = (dh, dx) => 6 * Math.exp(-3.5 * Math.abs(dh / dx + 0.05)); // km/h
  const best = new Float64Array(ele.length).fill(Infinity), prev = new Int32Array(ele.length).fill(-1), h = new Heap();
  const start = id(0, 0), goal = id(N, 0);
  best[start] = 0; h.push(0, start);
  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1], [1, 2], [1, -2], [2, 1], [2, -1], [-1, 2], [-1, -2], [-2, 1], [-2, -1]];
  while (h.size) {
    const [c, u] = h.pop();
    if (u === goal) break;
    if (c > best[u]) continue;
    const i = Math.floor(u / W), j = (u % W) - M;
    for (const [di, dj] of moves) {
      const I = i + di, J = j + dj;
      if (I < 0 || I > N || J < -M || J > M) continue;
      const v = id(I, J), dx = Math.hypot(di * along, dj * step), dh = ele[v] - ele[u];
      if (Math.abs(dh) > dx) continue; // steeper than 45°: rock, not a path
      const hours = dx / 1000 / tobler(dh, dx);
      const nc = c + hours * (1 + keep * Math.abs(J * step));
      if (nc < best[v]) { best[v] = nc; prev[v] = u; h.push(nc, v); }
    }
  }
  if (prev[goal] < 0) return null;
  const path = [];
  for (let u = goal; u >= 0; u = prev[u]) {
    const i = Math.floor(u / W), j = (u % W) - M, [la, lo] = pt(i, j);
    path.push([la, lo, Math.round(ele[u])]);
    if (u === start) break;
  }
  return smooth(path.reverse());
}

/**
 * The grid's route has the grid's corners: steps that double back on themselves and right-angled
 * kinks. Points where the route turns back by more than 120° are dropped (a spike, not a
 * switchback: real switchbacks come in runs the terrain asks for, which survive this), then the
 * corners are rounded by two rounds of Chaikin's corner cutting. The ends stay where they are.
 */
function smooth(path) {
  const k = Math.cos((path[0][0] * Math.PI) / 180);
  const turn = (a, b, c) => {
    const ux = (b[1] - a[1]) * k, uy = b[0] - a[0], vx = (c[1] - b[1]) * k, vy = c[0] - b[0];
    const n = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    return n ? Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / n))) : 0;
  };
  let p = path;
  for (let changed = true; changed && p.length > 2;) {
    changed = false;
    const q = [p[0]];
    for (let i = 1; i < p.length - 1; i++) {
      if (turn(q[q.length - 1], p[i], p[i + 1]) > (2 * Math.PI) / 3) { changed = true; continue; }
      q.push(p[i]);
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  for (let round = 0; round < 2; round++) {
    const q = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const [a, b] = [p[i], p[i + 1]];
      const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.round(a[2] + (b[2] - a[2]) * t)];
      if (i > 0) q.push(at(0.25));
      if (i < p.length - 2) q.push(at(0.75));
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  return p;
}

// ── Satellite previews ───────────────────────────────────────────────────────

const merc = (lat, lng) => [lng * 20037508.34 / 180, Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) * 6378137];

/**
 * Writes a PNG of the satellite view around `line` ([lat, lng][]) with the line drawn on in
 * orange and `marks` ([lat, lng][]) as white squares. For checking a drawn path by eye; the
 * imagery is Esri's World Imagery (one export request) and isn't published.
 */
export async function satellitePreview(file, line, marks = []) {
  const pts = line.map(([la, lo]) => merc(la, lo));
  let x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
  let y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  const pad = Math.max(150, 0.25 * Math.max(x1 - x0, y1 - y0));
  x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
  const W = 900, H = Math.max(200, Math.min(1400, Math.round((W * (y1 - y0)) / (x1 - x0))));
  const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${x0},${y0},${x1},${y1}&bboxSR=3857&imageSR=3857&size=${W},${H}&format=png24&f=image`;
  const img = await tile(url);
  const { w, h, rgb } = img;
  const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) { const o = (y * w + x) * 3; rgb[o] = c[0]; rgb[o + 1] = c[1]; rgb[o + 2] = c[2]; } };
  const px = ([mx, my]) => [Math.round(((mx - x0) / (x1 - x0)) * w), Math.round(((y1 - my) / (y1 - y0)) * h)];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = px(pts[i - 1]), [bx, by] = px(pts[i]), n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let s = 0; s <= n; s++) { const x = Math.round(ax + ((bx - ax) * s) / n), y = Math.round(ay + ((by - ay) * s) / n); put(x, y, [255, 81, 0]); put(x + 1, y, [255, 81, 0]); put(x, y + 1, [255, 81, 0]); }
  }
  for (const [la, lo] of marks) { const [x, y] = px(merc(la, lo)); for (let d = -5; d <= 5; d++) for (const e of [-5, 5]) { put(x + d, y + e, [255, 255, 255]); put(x + e, y + d, [255, 255, 255]); } }
  await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  await writeFile(file, writePng(w, h, rgb));
  return true;
}

export { tileLatLng };
