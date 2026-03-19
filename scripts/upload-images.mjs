/**
 * - Downloads Unsplash images for spiti-valley-cycling & zanskar-valley-bike
 * - Re-downloads old Supabase images from the legacy project
 * - Crops/scales everything to exactly 1280×960 (cover fit, centre gravity)
 * - Uploads to adventure-images bucket in the current Supabase project
 * - Prints a mapping of slug → new URL for data.ts
 * NOTE: story-submissions images are NOT touched.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = "adventure-images";
const MAX_W = 1280;
const MAX_H = 960;

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function fetchBuf(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resize(buf) {
  return sharp(buf)
    .resize(MAX_W, MAX_H, { fit: "cover", position: "centre" })
    .jpeg({ quality: 92, progressive: true, mozjpeg: true })
    .toBuffer();
}

async function upload(filename, buf) {
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(filename, buf, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed (${filename}): ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
}

// ── Image manifest ────────────────────────────────────────────────────────────
const IMAGES = [
  // ---- Unsplash (new downloads) ----
  {
    key:      "spiti-valley-cycling",
    src:      "https://images.unsplash.com/photo-1638008302541-5f5a98159df5?w=2400&q=90",
    dest:     "spiti-valley-cycling.jpeg",
  },
  {
    key:      "zanskar-valley-bike",
    src:      "https://images.unsplash.com/photo-1706021220078-2051d17b1576?w=2400&q=90",
    dest:     "zanskar-valley-bike.jpeg",
  },

  // ---- Legacy Supabase (re-host in current project) ----
  {
    key:      "stok-kangri",          // IMG_0185
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0185-resized-1772367261216.jpeg",
    dest:     "stok-kangri.jpeg",
  },
  {
    key:      "chadar-trek",          // IMG_0183
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0183-resized-1772365087456.jpeg",
    dest:     "chadar-trek.jpeg",
  },
  {
    key:      "manali-leh",           // IMG_0180
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0180-resized-1772364569585.jpeg",
    dest:     "manali-leh.jpeg",
  },
  {
    key:      "dzukou-valley",        // IMG_0184
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0184-resized-1772365699244.jpeg",
    dest:     "dzukou-valley.jpeg",
  },
  {
    key:      "dzukou-valley-2",      // IMG_0181
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0181-resized-1772364881220.jpeg",
    dest:     "dzukou-valley-2.jpeg",
  },
  {
    key:      "ladakh-circuit",       // IMG_2383
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_2383_Original-resized-1772334437445.jpeg",
    dest:     "ladakh-circuit.jpeg",
  },
  {
    key:      "spiti-valley-bike",    // IMG_0182
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0182-resized-1772365162828.jpeg",
    dest:     "spiti-valley-bike.jpeg",
  },
  {
    key:      "photi-la",             // IMG_3620
    src:      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_3620_Original-resized-1772404370295.jpeg",
    dest:     "photi-la.jpeg",
  },
];

async function run() {
  const results = {};

  for (const img of IMAGES) {
    process.stdout.write(`[${img.key}] downloading...`);
    const raw     = await fetchBuf(img.src);
    const resized = await resize(raw);
    const meta    = await sharp(resized).metadata();
    process.stdout.write(` ${meta.width}×${meta.height}  uploading...`);
    const url     = await upload(img.dest, resized);
    results[img.key] = url;
    console.log(` ✓\n  → ${url}`);
  }

  console.log("\n\n=== URL mapping (paste into data.ts) ===");
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${k.padEnd(25)} ${v}`);
  }
  console.log("\n=== JSON ===");
  console.log(JSON.stringify(results, null, 2));
}

run().catch(e => { console.error(e); process.exit(1); });
