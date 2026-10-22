// Builds the images the account emails use, into public/email/:
//   logo.png     the header lockup (icon + TRAIL to TIDES wordmark), white on transparent, 3x
//   welcome.jpg  the home page headline (From Mountain TRAIL / To Ocean TIDES, textured like the
//                site's hero) over mountain trail meeting ocean tide, from our own photos, 2x
//   reset.jpg    a slim banner of the TRAIL contour texture, for the password email, 2x
//   signoff.png  "See you out there" in the wordmark's script, 2x
//   hero.jpg     the first welcome photo; kept so emails already sent still show it
// Mail apps don't show SVG, canvas or web fonts reliably, so the brand has to arrive as pictures.
// Run: node scripts/build-email-assets.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ImageResponse } from "next/og.js";

const OUT = new URL("../public/email/", import.meta.url);
const PHOTOS = "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images";

/** A static weight of a Google font as TTF (the old user agent makes the CSS API serve TTF) */
async function googleFont(family, weight) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
  const url = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`No font file for ${family} ${weight}`);
  return (await fetch(url)).arrayBuffer();
}

const fetchBuffer = async (url) => Buffer.from(await (await fetch(url)).arrayBuffer());

async function logo() {
  const [black, script] = await Promise.all([googleFont("DM+Sans", 900), googleFont("Caveat", 600)]);
  const S = 3; // drawn at 3x, shown at 228 x 40
  const png = new ImageResponse(
    {
      type: "div",
      props: {
        style: { display: "flex", alignItems: "center", width: "100%", height: "100%" },
        children: [
          {
            type: "div",
            props: {
              style: { width: 40 * S, height: 40 * S, borderRadius: 11 * S, background: "#ff5100", display: "flex", alignItems: "center", justifyContent: "center" },
              children: {
                type: "svg",
                props: {
                  width: 26 * S, height: 26 * S, viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: 2.1, strokeLinecap: "round", strokeLinejoin: "round",
                  children: [
                    { type: "path", props: { d: "m8 3 4 8 5-5 5 15H2L8 3z" } },
                    { type: "path", props: { d: "M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19" } },
                  ],
                },
              },
            },
          },
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", marginLeft: 12 * S, color: "white", fontFamily: "DM Sans", fontSize: 21 * S, letterSpacing: -0.4 * S },
              children: [
                { type: "span", props: { children: "TRAIL" } },
                { type: "span", props: { style: { fontFamily: "Caveat", fontSize: 21 * S, color: "rgba(255,255,255,0.72)", margin: `${2 * S}px ${5 * S}px 0`, letterSpacing: 0 }, children: "to" } },
                { type: "span", props: { children: "TIDES" } },
              ],
            },
          },
        ],
      },
    },
    { width: 228 * S, height: 40 * S, fonts: [{ name: "DM Sans", data: black, weight: 900 }, { name: "Caveat", data: script, weight: 600 }] },
  );
  await writeFile(new URL("logo.png", OUT), await sharp(Buffer.from(await png.arrayBuffer())).png({ compressionLevel: 9, palette: true }).toBuffer());
}

const DARK = "#0a0a0a"; // the site's page background
const CONTOURS = fileURLToPath(new URL("../public/hero/trail-contours.png", import.meta.url));

/** Render a satori node to a PNG buffer */
async function render(node, width, height, fonts) {
  return Buffer.from(await new ImageResponse(node, { width, height, fonts }).arrayBuffer());
}

/** One hero word as a white mask, trimmed to its letters */
async function wordMask(text, size, font) {
  const png = await render(
    { type: "div", props: { style: { display: "flex", color: "white", fontFamily: "Jakarta", fontWeight: 800, fontSize: size, letterSpacing: -0.025 * size, lineHeight: 1, padding: size * 0.1 }, children: text } },
    Math.round(size * text.length * 0.9), Math.round(size * 1.3), [{ name: "Jakarta", data: font, weight: 800 }]);
  return sharp(png).trim().png().toBuffer();
}

/** The home page's wave tile (components/ui/custom/heroTextures.ts), as SVG paths */
function wavePaths(W, H, amp, gap, opacity, phase, stroke) {
  let paths = "";
  for (let k = 0; k * gap < H + gap; k++) {
    const y = k * gap + 8;
    let d = `M0 ${y}`;
    for (let x = 0; x <= W; x += 6) d += `L${x} ${(y + amp * Math.sin((x / 240) * Math.PI * 4 + k * phase)).toFixed(1)}`;
    paths += `<path d="${d}" fill="none" stroke="rgba(255,255,255,${opacity})" stroke-width="${stroke}" stroke-linecap="round"/>`;
  }
  return paths;
}

const gradient = (w, h, stops) => Buffer.from(`<svg width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`);

/** TRAIL's fill: warm gradient with the contour map, as on the home page */
async function trailFill(w, h) {
  const contours = await sharp(CONTOURS).resize(Math.round(w * 1.4), h, { fit: "cover" }).extract({ left: Math.round(w * 0.2), top: 0, width: w, height: h }).toBuffer();
  return sharp(gradient(w, h, [[0, "#ffc27a"], [0.45, "#ff8a33"], [1, "#f2560f"]])).composite([{ input: contours }]).png().toBuffer();
}

/** TIDES's fill: cool gradient with two layers of wave lines, as on the home page */
async function tidesFill(w, h) {
  // The home page tiles are drawn for ~200px letters; scale the lines to these
  const s = h / 150;
  const waves = Buffer.from(`<svg width="${w}" height="${h}"><g transform="scale(${s})">${wavePaths(w / s, h / s, 5, 20, 0.5, 0.7, 1.6)}${wavePaths(w / s, h / s, 3, 13, 0.18, 1.3, 1)}</g></svg>`);
  return sharp(gradient(w, h, [[0, "#b8f6ec"], [0.45, "#4fd6cf"], [1, "#1797a8"]])).composite([{ input: waves }]).png().toBuffer();
}

/** A textured word with the soft drop shadow the home page gives it */
async function heroWord(text, size, font, fill) {
  const mask = await wordMask(text, size, font);
  const { width: w, height: h } = await sharp(mask).metadata();
  const word = await sharp(await fill(w, h)).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const pad = Math.round(size * 0.25);
  const shadow = await sharp(mask).extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .linear([0, 0, 0, 0.4], [0, 0, 0, 0]).blur(size * 0.08).png().toBuffer();
  return { word, shadow, w, h, pad };
}

/** The script lead-in above each word, e.g. "From Mountain" with the second word bolder */
async function lead(first, second, size, regular, bold) {
  const png = await render(
    { type: "div", props: { style: { display: "flex", alignItems: "baseline", fontFamily: "Caveat", fontSize: size, lineHeight: 1, padding: 6 }, children: [
      { type: "span", props: { style: { color: "rgba(255,255,255,0.75)", fontWeight: 600, marginRight: size * 0.22 }, children: first } },
      { type: "span", props: { style: { color: "white", fontWeight: 700 }, children: second } },
    ] } },
    size * 8, Math.round(size * 1.5), [{ name: "Caveat", data: regular, weight: 600 }, { name: "Caveat", data: bold, weight: 700 }]);
  return sharp(png).trim().png().toBuffer();
}

/** Mountain trail meets ocean tide, from our Himalaya and coast region photos */
async function splitPhoto(W, H) {
  const [trail, tide] = await Promise.all(["region-himalayas", "region-coast"].map((p) => fetchBuffer(`${PHOTOS}/${p}.jpeg`)));
  const left = await sharp(trail).resize(1600).extract({ left: 470, top: 120, width: W, height: H }).toBuffer();
  const right = await sharp(tide).flop().resize(W, H, { fit: "cover", position: "centre" }).toBuffer();
  const seamTop = W * 0.62, seamBottom = W * 0.46;
  const mask = Buffer.from(`<svg width="${W}" height="${H}"><polygon points="${seamTop},0 ${W},0 ${W},${H} ${seamBottom},${H}" fill="white"/></svg>`);
  const coast = await sharp(right).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const seam = Buffer.from(`<svg width="${W}" height="${H}"><line x1="${seamTop}" y1="0" x2="${seamBottom}" y2="${H}" stroke="#ff5100" stroke-width="5"/></svg>`);
  return sharp(left).composite([{ input: coast }, { input: seam }]).png().toBuffer();
}

async function welcome(fonts) {
  const W = 1120, H = 640; // shown at 560 x 320
  // Dimmed like the home hero so the lettering carries, fading into the page at the bottom
  const shade = Buffer.from(`<svg width="${W}" height="${H}"><defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${DARK}" stop-opacity="0.35"/><stop offset="0.6" stop-color="${DARK}" stop-opacity="0.3"/><stop offset="1" stop-color="${DARK}" stop-opacity="1"/></linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${DARK}" stop-opacity="0.45"/><stop offset="0.7" stop-color="${DARK}" stop-opacity="0"/></linearGradient>
  </defs><rect width="${W}" height="${H}" fill="url(#v)"/><rect width="${W}" height="${H}" fill="url(#h)"/></svg>`);

  const [trail, tides, l1, l2] = await Promise.all([
    heroWord("TRAIL", 230, fonts.jakarta, trailFill),
    heroWord("TIDES", 230, fonts.jakarta, tidesFill),
    lead("From", "Mountain", 50, fonts.caveat, fonts.caveatBold),
    lead("To", "Ocean", 50, fonts.caveat, fonts.caveatBold),
  ]);
  // One left axis, TIDES stepped in under TRAIL, each lead-in just above its word
  const x1 = 64, y1 = 92, x2 = 236;
  const l1h = (await sharp(l1).metadata()).height, l2h = (await sharp(l2).metadata()).height;
  const yTrail = y1 + l1h + 14, yLead2 = yTrail + trail.h + 26, yTides = yLead2 + l2h + 14;
  const layers = [
    { input: shade },
    { input: l1, left: x1 + 6, top: y1 },
    { input: trail.shadow, left: x1 - trail.pad, top: yTrail - trail.pad + 14 },
    { input: trail.word, left: x1, top: yTrail },
    { input: l2, left: x2 + 6, top: yLead2 },
    { input: tides.shadow, left: x2 - tides.pad, top: yTides - tides.pad + 14 },
    { input: tides.word, left: x2, top: yTides },
  ];
  await writeFile(new URL("welcome.jpg", OUT), await sharp(await splitPhoto(W, H)).composite(layers).jpeg({ quality: 80, mozjpeg: true }).toBuffer());
}

async function resetBanner() {
  const W = 1120, H = 200; // shown at 560 x 100
  const fill = await trailFill(W, H);
  // The TRAIL texture, dimmed to a glow behind the header, fading out at the edges
  const fade = Buffer.from(`<svg width="${W}" height="${H}"><defs>
    <radialGradient id="r" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stop-color="${DARK}" stop-opacity="0.35"/><stop offset="1" stop-color="${DARK}" stop-opacity="0.95"/></radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stop-color="${DARK}" stop-opacity="0"/><stop offset="1" stop-color="${DARK}" stop-opacity="1"/></linearGradient>
  </defs><rect width="${W}" height="${H}" fill="url(#r)"/><rect width="${W}" height="${H}" fill="url(#b)"/></svg>`);
  await writeFile(new URL("reset.jpg", OUT), await sharp(fill).composite([{ input: fade }]).jpeg({ quality: 80, mozjpeg: true }).toBuffer());
}

async function signoff(fonts) {
  const png = await render(
    { type: "div", props: { style: { display: "flex", flexDirection: "column", fontFamily: "Caveat", lineHeight: 1.05, padding: 8 }, children: [
      { type: "span", props: { style: { color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 52 }, children: "See you out there," } },
      { type: "span", props: { style: { color: "#ff7d47", fontWeight: 700, fontSize: 60 }, children: "Team Trail to Tides" } },
    ] } },
    700, 180, [{ name: "Caveat", data: fonts.caveat, weight: 600 }, { name: "Caveat", data: fonts.caveatBold, weight: 700 }]);
  await writeFile(new URL("signoff.png", OUT), await sharp(png).trim().png({ compressionLevel: 9 }).toBuffer());
}

async function hero() {
  const W = 1120, H = 440; // shown at 560 x 220
  const [trail, tide] = await Promise.all(["region-himalayas", "region-coast"].map((p) => fetchBuffer(`${PHOTOS}/${p}.jpeg`)));
  // The peak sits mid-photo; scale up and shift it into the left half. The coast is mirrored
  // so its sunset lands in the right half instead of behind the mountain.
  const left = await sharp(trail).resize(1600).extract({ left: 470, top: 150, width: W, height: H }).toBuffer();
  const right = await sharp(tide).flop().resize(W, H, { fit: "cover", position: "centre" }).toBuffer();

  // The coast takes over along a slanted seam, edged in brand orange; a soft shade at the
  // bottom keeps the photo from ending abruptly against the white card
  const seamTop = W * 0.6, seamBottom = W * 0.44;
  const mask = Buffer.from(`<svg width="${W}" height="${H}"><polygon points="${seamTop},0 ${W},0 ${W},${H} ${seamBottom},${H}" fill="white"/></svg>`);
  const coast = await sharp(right).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const overlay = Buffer.from(`<svg width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#0f0d0b" stop-opacity="0"/><stop offset="1" stop-color="#0f0d0b" stop-opacity="0.55"/></linearGradient></defs>
    <line x1="${seamTop}" y1="0" x2="${seamBottom}" y2="${H}" stroke="#ff5100" stroke-width="6"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
  </svg>`);
  await writeFile(new URL("hero.jpg", OUT), await sharp(left).composite([{ input: coast }, { input: overlay }]).jpeg({ quality: 78, mozjpeg: true }).toBuffer());
}

await mkdir(OUT, { recursive: true });
const [jakarta, caveat, caveatBold] = await Promise.all([googleFont("Plus+Jakarta+Sans", 800), googleFont("Caveat", 600), googleFont("Caveat", 700)]);
const fonts = { jakarta, caveat, caveatBold };
await Promise.all([logo(), hero(), welcome(fonts), resetBanner(), signoff(fonts)]);
console.log("Wrote public/email/: logo.png, hero.jpg, welcome.jpg, reset.jpg, signoff.png");
