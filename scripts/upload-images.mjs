/**
 * Script to:
 * 1. Download Unsplash images for Spiti Valley cycling and Zanskar Valley ride
 * 2. Resize all images to max 1280×960 (4:3, cover fit)
 * 3. Upload to Supabase project-uploads bucket
 * 4. Print new URLs
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "project-uploads";
const FOLDER = "71778e38-df00-4ed2-869a-028f1f2862c1";
const MAX_W = 1280;
const MAX_H = 960;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function resizeBuffer(buf) {
  return sharp(buf)
    .resize(MAX_W, MAX_H, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, progressive: true })
    .toBuffer();
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function upload(filename, buf) {
  const path = `${FOLDER}/${filename}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── New Unsplash images ──────────────────────────────────────────────────────
const newImages = [
  {
    name: "spiti-valley-cycling",
    // Spiti Valley high road landscape
    url: "https://images.unsplash.com/photo-1638008302541-5f5a98159df5?w=2400&q=90",
    filename: `spiti-valley-cycling-${Date.now()}.jpeg`,
  },
  {
    name: "zanskar-valley-ride",
    // Zanskar valley / Ladakh road
    url: "https://images.unsplash.com/photo-1706021220078-2051d17b1576?w=2400&q=90",
    filename: `zanskar-valley-ride-${Date.now()}.jpeg`,
  },
];

// ── Existing Supabase images (re-upload at correct resolution) ───────────────
const existingImages = [
  {
    name: "stok-kangri",
    url: `https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0185-resized-1772367261216.jpeg?width=4000&height=4000&resize=contain`,
    filename: "IMG_0185-resized-1772367261216.jpeg",
  },
  {
    name: "chadar-trek",
    url: `https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0183-resized-1772365087456.jpeg?width=4000&height=4000&resize=contain`,
    filename: "IMG_0183-resized-1772365087456.jpeg",
  },
  {
    name: "manali-leh",
    url: `https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0180-resized-1772364569585.jpeg?width=4000&height=4000&resize=contain`,
    filename: "IMG_0180-resized-1772364569585.jpeg",
  },
  {
    name: "dzukou-valley",
    url: `https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0184-resized-1772365699244.jpeg?width=4000&height=4000&resize=contain`,
    filename: "IMG_0184-resized-1772365699244.jpeg",
  },
  {
    name: "dzukou-valley-2",
    url: `https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0181-resized-1772364881220.jpeg?width=4000&height=4000&resize=contain`,
    filename: "IMG_0181-resized-1772364881220.jpeg",
  },
  {
    name: "ladakh-circuit",
    url: `https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_2383_Original-resized-1772334437445.jpeg?width=4000&height=4000&resize=contain`,
    filename: "IMG_2383_Original-resized-1772334437445.jpeg",
  },
  {
    name: "spiti-valley-bike",
    url: `https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0182-resized-1772365162828.jpeg?width=4000&height=4000&resize=contain`,
    filename: "IMG_0182-resized-1772365162828.jpeg",
  },
];

async function run() {
  console.log("=== Processing new Unsplash images ===");
  const newUrls = {};
  for (const img of newImages) {
    process.stdout.write(`  ${img.name}: downloading...`);
    const raw = await fetchBuffer(img.url);
    const resized = await resizeBuffer(raw);
    const meta = await sharp(resized).metadata();
    process.stdout.write(` ${meta.width}x${meta.height}, uploading...`);
    const url = await upload(img.filename, resized);
    newUrls[img.name] = url;
    console.log(` done\n    → ${url}`);
  }

  console.log("\n=== Re-uploading existing Supabase images at 1280×960 ===");
  for (const img of existingImages) {
    process.stdout.write(`  ${img.name}: downloading...`);
    const raw = await fetchBuffer(img.url);
    const resized = await resizeBuffer(raw);
    const meta = await sharp(resized).metadata();
    process.stdout.write(` ${meta.width}x${meta.height}, uploading...`);
    await upload(img.filename, resized);
    console.log(" done (upserted in-place)");
  }

  console.log("\n=== New image URLs for data.ts ===");
  console.log(JSON.stringify(newUrls, null, 2));
}

run().catch((e) => { console.error(e); process.exit(1); });
