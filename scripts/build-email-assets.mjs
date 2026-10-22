// Builds the images the emails use, into public/email/:
//   logo.png / logo-light.png        the header lockup (icon + TRAIL to TIDES wordmark) with
//                                    white lettering for dark mode, dark lettering for white, 3x
//   signoff.png / signoff-light.png  "See you out there, Team Trail to Tides" in the wordmark's
//                                    script, the same two ways, 2x
// Mail apps don't show SVG or web fonts reliably, so the brand has to arrive as pictures.
// hero.jpg, welcome.jpg and reset.jpg in that folder are from earlier designs: no email uses
// them now, but emails already sent still point at them, so they stay.
// Run: node scripts/build-email-assets.mjs

import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { ImageResponse } from "next/og.js";

const OUT = new URL("../public/email/", import.meta.url);

/** A static weight of a Google font as TTF (the old user agent makes the CSS API serve TTF) */
async function googleFont(family, weight) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
  const url = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`No font file for ${family} ${weight}`);
  return (await fetch(url)).arrayBuffer();
}

/** Render a satori node to a PNG buffer */
async function render(node, width, height, fonts) {
  return Buffer.from(await new ImageResponse(node, { width, height, fonts }).arrayBuffer());
}

/** The header lockup; white lettering for dark mode, dark lettering for the light email */
async function logo(file, text, toColor) {
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
              style: { display: "flex", alignItems: "center", marginLeft: 12 * S, color: text, fontFamily: "DM Sans", fontSize: 21 * S, letterSpacing: -0.4 * S },
              children: [
                { type: "span", props: { children: "TRAIL" } },
                { type: "span", props: { style: { fontFamily: "Caveat", fontSize: 21 * S, color: toColor, margin: `${2 * S}px ${5 * S}px 0`, letterSpacing: 0 }, children: "to" } },
                { type: "span", props: { children: "TIDES" } },
              ],
            },
          },
        ],
      },
    },
    { width: 228 * S, height: 40 * S, fonts: [{ name: "DM Sans", data: black, weight: 900 }, { name: "Caveat", data: script, weight: 600 }] },
  );
  await writeFile(new URL(file, OUT), await sharp(Buffer.from(await png.arrayBuffer())).png({ compressionLevel: 9, palette: true }).toBuffer());
}

/** "See you out there, Team Trail to Tides"; light lettering for dark mode, dark for the light email */
async function signoff(fonts, file, first, second) {
  const png = await render(
    { type: "div", props: { style: { display: "flex", flexDirection: "column", fontFamily: "Caveat", lineHeight: 1.05, padding: 8 }, children: [
      { type: "span", props: { style: { color: first, fontWeight: 600, fontSize: 52 }, children: "See you out there," } },
      { type: "span", props: { style: { color: second, fontWeight: 700, fontSize: 60 }, children: "Team Trail to Tides" } },
    ] } },
    700, 180, [{ name: "Caveat", data: fonts.caveat, weight: 600 }, { name: "Caveat", data: fonts.caveatBold, weight: 700 }]);
  await writeFile(new URL(file, OUT), await sharp(png).trim().png({ compressionLevel: 9 }).toBuffer());
}

await mkdir(OUT, { recursive: true });
const [caveat, caveatBold] = await Promise.all([googleFont("Caveat", 600), googleFont("Caveat", 700)]);
const fonts = { caveat, caveatBold };
await Promise.all([
  logo("logo.png", "#ffffff", "rgba(255,255,255,0.72)"), logo("logo-light.png", "#141210", "#6b655e"),
  signoff(fonts, "signoff.png", "rgba(255,255,255,0.7)", "#ff7d47"), signoff(fonts, "signoff-light.png", "#6b655e", "#e04800"),
]);
console.log("Wrote public/email/: logo.png, logo-light.png, signoff.png, signoff-light.png");
