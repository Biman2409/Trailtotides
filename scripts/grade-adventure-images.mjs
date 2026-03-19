/**
 * Applies consistent, premium color grading to all adventure-images in Supabase:
 *   1. Normalize levels (1–99 percentile) — lifts dim images, tames blown-out ones
 *   2. +20% saturation via modulate            — uniform vibrancy
 *   3. Gamma 0.90                              — opens up midtones/shadows
 *   4. Linear contrast  ×1.08 – 8             — subtle punch
 *   5. Mild sharpen (σ 0.6)                   — crisp detail
 *   6. Re-encode JPEG q100 progressive        — lossless for Supabase
 *
 * Resolution stays 1280×960. Overwrites in-place (upsert).
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ── env ──────────────────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const [k, ...v] = line.split("=");
    if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join("=").trim();
  }
}

const sb     = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = "adventure-images";
const BASE   = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

// ── grading pipeline ─────────────────────────────────────────────────────────
async function grade(buf) {
  return sharp(buf)
    .normalize({ lower: 1, upper: 99 })   // equalise exposure across images
    .modulate({ saturation: 1.22, brightness: 1.04 }) // vibrancy +22%, slight lift
    .linear(1.07, -6)                      // contrast punch (multiply + offset)
    .sharpen({ sigma: 0.6 })              // crispness
    .jpeg({ quality: 100, progressive: true, mozjpeg: true })
    .toBuffer();
}

// ── main ─────────────────────────────────────────────────────────────────────
async function run() {
  const { data: files, error } = await sb.storage.from(BUCKET).list("", { limit: 200 });
  if (error) throw error;

  const images = files.filter(f => f.metadata && /\.(jpeg|jpg)$/i.test(f.name));
  console.log(`Grading ${images.length} images...\n`);

  let ok = 0, fail = 0;
  for (const img of images) {
    process.stdout.write(`  ${img.name.padEnd(44)}`);
    try {
      const res = await fetch(`${BASE}/${img.name}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw    = Buffer.from(await res.arrayBuffer());
      const graded = await grade(raw);
      const meta   = await sharp(graded).metadata();
      const { error: upErr } = await sb.storage.from(BUCKET)
        .upload(img.name, graded, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw new Error(upErr.message);
      process.stdout.write(`${meta.width}×${meta.height}  ✓\n`);
      ok++;
    } catch (e) {
      process.stdout.write(`FAIL – ${e.message}\n`);
      fail++;
    }
  }

  console.log(`\nDone. ${ok} graded, ${fail} failed.`);
}

run().catch(e => { console.error(e); process.exit(1); });
