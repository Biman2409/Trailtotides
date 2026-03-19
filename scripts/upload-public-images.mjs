/**
 * Resizes every local /public adventure image to exactly 1280×960 (cover crop)
 * and uploads to the adventure-images Supabase bucket.
 * Then prints sed commands / mapping for data.ts updates.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readdirSync, readFileSync } from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = "adventure-images";
const PUBLIC_DIR   = new URL("../public", import.meta.url).pathname;

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function resizeAndUpload(filename) {
  const src  = path.join(PUBLIC_DIR, filename);
  const buf  = readFileSync(src);
  const dest = filename.replace(/\.(webp|png)$/i, ".jpeg");

  const resized = await sharp(buf)
    .resize(1280, 960, { fit: "cover", position: "centre" })
    .jpeg({ quality: 100, progressive: true, mozjpeg: true })
    .toBuffer();

  const meta = await sharp(resized).metadata();

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(dest, resized, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed (${dest}): ${error.message}`);

  const url = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
  return { filename, dest, width: meta.width, height: meta.height, url };
}

async function run() {
  const files = readdirSync(PUBLIC_DIR)
    .filter(f => /\.(jpeg|jpg|webp|png)$/i.test(f));

  console.log(`Processing ${files.length} images...\n`);

  const mapping = {}; // "/original.jpeg" -> new URL

  for (const f of files) {
    process.stdout.write(`  ${f.padEnd(42)}`);
    const r = await resizeAndUpload(f);
    // key = the path as used in data.ts (e.g. "/kedarkantha.jpeg")
    mapping["/" + f] = r.url;
    // Also map the .webp/.png version to same URL
    if (r.dest !== f) mapping["/" + r.dest] = r.url;
    console.log(`${r.width}×${r.height}  ✓`);
  }

  console.log("\n=== Mapping (original path → Supabase URL) ===");
  for (const [k, v] of Object.entries(mapping)) {
    console.log(`  ${k.padEnd(44)} ${v}`);
  }

  // Emit JSON for the update script
  const jsonPath = new URL("../scripts/public-image-map.json", import.meta.url).pathname;
  const { writeFileSync } = await import("fs");
  writeFileSync(jsonPath, JSON.stringify(mapping, null, 2));
  console.log(`\nMapping saved to scripts/public-image-map.json`);
}

run().catch(e => { console.error(e); process.exit(1); });
