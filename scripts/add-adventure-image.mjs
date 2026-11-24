#!/usr/bin/env node
/**
 * Usage: node scripts/add-adventure-image.mjs <input-file> <dest-name> [--dry-run] [--no-grade] [--force]
 *
 * Processes any image to the adventure-images standard and uploads it:
 *   - 1280×960 exact (cover crop, centre gravity)
 *   - Graded to the catalogue's uniform look: moved 70% of the way toward
 *     brightness 129, contrast 64 (luminance std-dev) and colourfulness 72
 *     (Hasler–Süsstrunk), with limits so snow stays white and forests aren't crushed
 *   - JPEG quality 100, progressive
 *   - Uploaded to the Supabase adventure-images bucket
 *
 *   --dry-run   write <dest-name> next to the input instead of uploading, to look at it first
 *   --no-grade  crop and resize only
 *   --force     replace a file of the same name in the bucket (refused otherwise)
 *
 * Example:
 *   node scripts/add-adventure-image.mjs ./my-photo.jpg rupin-pass.jpeg
 *
 * A very heavily edited photo (neon skies, HDR) can still stand out after grading;
 * check the result by eye and tone it down further by hand if needed.
 *
 * Env vars required (auto-loaded from .env.local if present):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env.local if env vars not already set
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");
if (existsSync(envPath) && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  }
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [inputArg, destArg] = args.filter((a) => !a.startsWith("--"));
if (!inputArg || !destArg) {
  console.error("Usage: node scripts/add-adventure-image.mjs <input-file> <dest-name.jpeg> [--dry-run] [--no-grade] [--force]");
  process.exit(1);
}

const inputFile = resolve(inputArg);
if (!existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

// Ensure dest has .jpeg extension
const dest = destArg.endsWith(".jpeg") ? destArg : destArg.replace(/\.[^.]+$/, "") + ".jpeg";
const W = 1280, H = 960;

// --- Grading -----------------------------------------------------------------
// The catalogue's median look (measured over all heroes, Nov 2026) and how far to move toward it.
const TARGET = { bright: 129, contrast: 64, colour: 72 }, PULL = 0.7;
const LIMIT = { sat: [0.5, 1.3], contrast: [0.8, 1.25], shift: 18 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function measure(px) {
  let n = 0, sL = 0, sL2 = 0, srg = 0, srg2 = 0, syb = 0, syb2 = 0;
  for (let i = 0; i < px.length; i += 3) {
    const R = px[i], G = px[i + 1], B = px[i + 2], L = 0.299 * R + 0.587 * G + 0.114 * B;
    const rg = R - G, yb = 0.5 * (R + G) - B;
    sL += L; sL2 += L * L; srg += rg; srg2 += rg * rg; syb += yb; syb2 += yb * yb; n++;
  }
  const m = sL / n, mrg = srg / n, myb = syb / n;
  return {
    bright: m,
    contrast: Math.sqrt(sL2 / n - m * m),
    colour: Math.sqrt(srg2 / n - mrg * mrg + syb2 / n - myb * myb) + 0.3 * Math.sqrt(mrg * mrg + myb * myb),
  };
}
// f scales colour around each pixel's luminance, k stretches luminance around the mean m, s shifts it
function apply(px, { f, k, s }, m) {
  const out = new Uint8ClampedArray(px.length);
  for (let i = 0; i < px.length; i += 3) {
    const L = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2], dL = (k - 1) * (L - m) + s;
    for (let c = 0; c < 3; c++) out[i + c] = L + f * (px[i + c] - L) + dL;
  }
  return out;
}
async function grade(full) {
  const small = await sharp(full, { raw: { width: W, height: H, channels: 3 } }).resize(320, 240, { fit: "fill" }).raw().toBuffer();
  const before = measure(small);
  const want = Object.fromEntries(Object.keys(TARGET).map((key) => [key, before[key] + PULL * (TARGET[key] - before[key])]));
  const p = { f: 1, k: 1, s: 0 };
  for (let i = 0; i < 6; i++) {
    const now = measure(apply(small, p, before.bright));
    p.f = clamp(p.f * (want.colour / Math.max(now.colour, 1)), ...LIMIT.sat);
    p.k = clamp(p.k * (want.contrast / Math.max(now.contrast, 1)), ...LIMIT.contrast);
    p.s = clamp(p.s + (want.bright - now.bright), -LIMIT.shift, LIMIT.shift);
  }
  const after = measure(apply(small, p, before.bright));
  const fmt = (x) => `brightness ${x.bright.toFixed(0)}, contrast ${x.contrast.toFixed(0)}, colour ${x.colour.toFixed(0)}`;
  console.log(`Before: ${fmt(before)}\nAfter : ${fmt(after)}  (catalogue: brightness 118–137, contrast 53–69)`);
  return Buffer.from(apply(full, p, before.bright).buffer);
}

// --- Process -------------------------------------------------------------------
console.log(`Input : ${inputFile}`);
console.log(`Dest  : ${dest}`);
console.log(`Processing (${W}×${H}, cover crop, centre${flags.has("--no-grade") ? "" : ", graded"}, JPEG q100)...`);

let pixels = await sharp(readFileSync(inputFile)).rotate().resize(W, H, { fit: "cover", position: "centre" }).removeAlpha().raw().toBuffer();
if (!flags.has("--no-grade")) pixels = await grade(pixels);
const out = await sharp(pixels, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
  .toBuffer();

// Ends by falling through rather than process.exit(): exiting while sharp's threads close
// trips a libuv assertion on Windows.
async function upload() {
  if (flags.has("--dry-run")) {
    const local = join(dirname(inputFile), dest);
    writeFileSync(local, out);
    console.log(`\nDry run: wrote ${local} (not uploaded)`);
    return;
  }
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const BUCKET = "adventure-images";
  const { data: same } = await sb.storage.from(BUCKET).list("", { search: dest });
  if (same?.some((o) => o.name === dest) && !flags.has("--force")) {
    console.error(`\n${dest} is already in the bucket. Pick a new name (e.g. ${dest.replace(".jpeg", "-v2.jpeg")}) or pass --force to replace it.`);
    process.exitCode = 1;
    return;
  }
  const { error } = await sb.storage.from(BUCKET).upload(dest, out, { contentType: "image/jpeg", upsert: flags.has("--force"), cacheControl: "31536000" });
  if (error) { console.error("Upload failed:", error.message); process.exitCode = 1; return; }
  const url = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
  console.log(`\n✓ Uploaded successfully`);
  console.log(`URL: ${url}`);
}
await upload();
