#!/usr/bin/env node
/**
 * Usage: node scripts/add-adventure-image.mjs <input-file> <dest-name>
 *
 * Processes any image to the adventure-images standard:
 *   - 1280×960 exact (cover crop, centre gravity)
 *   - JPEG quality 100, progressive
 *   - Uploaded to Supabase adventure-images bucket
 *
 * Example:
 *   node scripts/add-adventure-image.mjs ./my-photo.jpg rupin-pass.jpeg
 *
 * Env vars required (auto-loaded from .env.local if present):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
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

const [,, inputArg, destArg] = process.argv;
if (!inputArg || !destArg) {
  console.error("Usage: node scripts/add-adventure-image.mjs <input-file> <dest-name.jpeg>");
  process.exit(1);
}

const inputFile = resolve(inputArg);
if (!existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

// Ensure dest has .jpeg extension
const dest = destArg.endsWith(".jpeg") ? destArg : destArg.replace(/\.[^.]+$/, "") + ".jpeg";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = "adventure-images";

console.log(`Input : ${inputFile}`);
console.log(`Dest  : ${dest}`);
console.log(`Processing (1280×960, cover crop, centre, JPEG q100)...`);

const raw = readFileSync(inputFile);
const resized = await sharp(raw)
  .resize(1280, 960, { fit: "cover", position: "centre" })
  .jpeg({ quality: 100, progressive: true, mozjpeg: true })
  .toBuffer();

const meta = await sharp(resized).metadata();
console.log(`Output: ${meta.width}×${meta.height} JPEG`);

const { error } = await sb.storage.from(BUCKET).upload(dest, resized, { contentType: "image/jpeg", upsert: true });
if (error) { console.error("Upload failed:", error.message); process.exit(1); }

const url = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
console.log(`\n✓ Uploaded successfully`);
console.log(`URL: ${url}`);
