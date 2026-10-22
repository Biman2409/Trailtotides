// Builds the images the account emails use, into public/email/:
//   logo.png  the header lockup (icon + TRAIL to TIDES wordmark), white on transparent, 3x
//   hero.jpg  mountain trail meets ocean tide, from our own region photos, 2x
// Mail apps don't show SVG or web fonts reliably, so the brand has to arrive as pictures.
// Run: node scripts/build-email-assets.mjs

import { mkdir, writeFile } from "node:fs/promises";
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
await Promise.all([logo(), hero()]);
console.log("Wrote public/email/logo.png and public/email/hero.jpg");
