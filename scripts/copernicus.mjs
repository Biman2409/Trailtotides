// Heights from the Copernicus 90 m elevation model (GLO-90), read straight from its public tiles
// on AWS (copernicus-dem-90m, one 1°×1° GeoTIFF each). It's the model Open-Meteo serves, without
// Open-Meteo's daily request limit. Each tile is a few MB and is downloaded once per run.
// Heights are interpolated between the four nearest cells, rounded to the metre.
// © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS
// by the European Union and ESA.

import { inflateSync } from "node:zlib";

const tiles = new Map();

function tileName(lat, lng) {
  const la = Math.floor(lat), lo = Math.floor(lng);
  const ns = `${la < 0 ? "S" : "N"}${String(Math.abs(la)).padStart(2, "0")}_00`;
  const ew = `${lo < 0 ? "W" : "E"}${String(Math.abs(lo)).padStart(3, "0")}_00`;
  return `Copernicus_DSM_COG_30_${ns}_${ew}_DEM`;
}

// A GeoTIFF tile: float32 heights, deflate-compressed with the floating-point predictor
function readTiff(buf) {
  const le = buf.toString("ascii", 0, 2) === "II";
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const f64 = (o) => (le ? buf.readDoubleLE(o) : buf.readDoubleBE(o));
  const ifd = u32(4), tags = {};
  for (let i = 0; i < u16(ifd); i++) {
    const e = ifd + 2 + i * 12, type = u16(e + 2), count = u32(e + 4);
    const size = { 3: 2, 4: 4, 12: 8 }[type] ?? 1;
    const at = count * size > 4 ? u32(e + 8) : e + 8;
    const vals = [];
    for (let k = 0; k < Math.min(count, 64); k++) vals.push(type === 3 ? u16(at + 2 * k) : type === 4 ? u32(at + 4 * k) : type === 12 ? f64(at + 8 * k) : buf[at + k]);
    tags[u16(e)] = vals;
  }
  const [W] = tags[256], [H] = tags[257], [tw] = tags[322], [th] = tags[323];
  if (tags[259][0] !== 8 || tags[258][0] !== 32) throw new Error("Copernicus tile: unexpected format");
  const predictor = tags[317]?.[0] ?? 1;
  const out = new Float32Array(W * H);
  const across = Math.ceil(W / tw);
  tags[324].forEach((off, t) => {
    const raw = inflateSync(buf.subarray(off, off + tags[325][t]));
    const tx = (t % across) * tw, ty = Math.floor(t / across) * th;
    const row = Buffer.alloc(tw * 4);
    for (let y = 0; y < th && ty + y < H; y++) {
      const r = raw.subarray(y * tw * 4, (y + 1) * tw * 4);
      if (predictor === 3) {
        // Bytes differenced along the row, and split into planes, most significant first
        for (let i = 1; i < r.length; i++) r[i] = (r[i] + r[i - 1]) & 255;
        for (let x = 0; x < tw; x++) for (let k = 0; k < 4; k++) row[x * 4 + k] = r[k * tw + x];
        for (let x = 0; x < tw && tx + x < W; x++) out[(ty + y) * W + tx + x] = row.readFloatBE(x * 4);
      } else {
        for (let x = 0; x < tw && tx + x < W; x++) out[(ty + y) * W + tx + x] = le ? r.readFloatLE(x * 4) : r.readFloatBE(x * 4);
      }
    }
  });
  const [sx, sy] = tags[33550], [, , , west, north] = tags[33922];
  return { W, H, sx, sy, west, north, data: out };
}

async function tile(lat, lng) {
  const name = tileName(lat, lng);
  if (!tiles.has(name)) {
    tiles.set(name, (async () => {
      const url = `https://copernicus-dem-90m.s3.amazonaws.com/${name}/${name}.tif`;
      for (let attempt = 1; ; attempt++) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
          if (res.status === 404 || res.status === 403) return null; // sea: no tile
          if (!res.ok) throw new Error(`Copernicus ${res.status}`);
          return readTiff(Buffer.from(await res.arrayBuffer()));
        } catch (e) {
          if (attempt >= 4) throw e;
          await new Promise((r) => setTimeout(r, 3000 * attempt));
        }
      }
    })().catch((e) => { tiles.delete(name); throw e; }));
  }
  return tiles.get(name);
}

// Height in metres at each [lat, lng]
export async function copernicusHeights(pts) {
  const out = [];
  for (const [lat, lng] of pts) {
    const t = await tile(lat, lng);
    if (!t) { out.push(0); continue; }
    // Pixel-is-area: the tiepoint is the top-left corner of the top-left cell
    const fx = (lng - t.west) / t.sx - 0.5, fy = (t.north - lat) / t.sy - 0.5;
    const x0 = Math.max(0, Math.min(t.W - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(t.H - 2, Math.floor(fy)));
    const dx = Math.max(0, Math.min(1, fx - x0)), dy = Math.max(0, Math.min(1, fy - y0));
    const v = (x, y) => t.data[y * t.W + x];
    const h = v(x0, y0) * (1 - dx) * (1 - dy) + v(x0 + 1, y0) * dx * (1 - dy) + v(x0, y0 + 1) * (1 - dx) * dy + v(x0 + 1, y0 + 1) * dx * dy;
    out.push(Math.round(h));
  }
  return out;
}
