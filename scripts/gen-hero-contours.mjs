// Generates public/hero/trail-contours.png — the contour map clipped into the hero's "TRAIL".
// Run with: node scripts/gen-hero-contours.mjs
// Contours are traced with marching squares over a three-peak height field, then rasterised
// once here so the browser just loads a small image instead of drawing it on every visit.
// An 8-colour palette PNG: one stroke colour at a few opacities compresses to ~25 KB (WebP was ~115 KB).
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1280, H = 220, N = 4, SCALE = 1.3;
const cols = Math.ceil(W / N) + 1, rows = Math.ceil(H / N) + 1;
const peaks = [
  [0.34, 0.42, 0.2, 0.55, 1],
  [0.72, 0.58, 0.16, 0.5, 0.8],
  [0.55, 0.2, 0.12, 0.35, 0.45],
];

const f = [];
for (let j = 0; j < rows; j++) {
  f[j] = [];
  for (let i = 0; i < cols; i++) {
    const x = (i * N) / W, y = (j * N) / H;
    let v = 0;
    for (const [cx, cy, sx, sy, a] of peaks) v += a * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
    v += 0.035 * Math.sin(x * 23 + y * 7) + 0.03 * Math.sin(y * 19 - x * 11);
    f[j][i] = v;
  }
}

const SEG = {
  1: ["L", "B"], 2: ["B", "R"], 3: ["L", "R"], 4: ["T", "R"], 5: ["L", "T", "B", "R"], 6: ["T", "B"], 7: ["L", "T"],
  8: ["L", "T"], 9: ["T", "B"], 10: ["T", "R", "L", "B"], 11: ["T", "R"], 12: ["L", "R"], 13: ["B", "R"], 14: ["L", "B"],
};

let paths = "";
for (let L = 1; L <= 26; L++) {
  const lv = L * 0.042;
  const major = L % 5 === 0;
  let d = "";
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = f[j][i], b = f[j][i + 1], c = f[j + 1][i + 1], e = f[j + 1][i];
      const idx = ((a > lv) << 3) | ((b > lv) << 2) | ((c > lv) << 1) | +(e > lv);
      if (idx === 0 || idx === 15) continue;
      const x = i * N, y = j * N, t = (p, q) => (lv - p) / (q - p);
      const P = { T: [x + N * t(a, b), y], R: [x + N, y + N * t(b, c)], B: [x + N * t(e, c), y + N], L: [x, y + N * t(a, e)] };
      const s = SEG[idx];
      for (let k = 0; k < s.length; k += 2) {
        const [x1, y1] = P[s[k]], [x2, y2] = P[s[k + 1]];
        d += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
      }
    }
  }
  paths += `<path d="${d}" fill="none" stroke="rgb(110,28,0)" stroke-opacity="${major ? 0.55 : 0.3}" stroke-width="${major ? 1.8 : 0.9}" stroke-linecap="round"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}">${paths}</svg>`;
mkdirSync("public/hero", { recursive: true });
const info = await sharp(Buffer.from(svg)).png({ palette: true, colors: 8, compressionLevel: 9, effort: 10 }).toFile("public/hero/trail-contours.png");
console.log(`public/hero/trail-contours.png ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);
