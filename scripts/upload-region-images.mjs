import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = "adventure-images";

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const REGIONS = [
  { key: "himalayas",     dest: "region-himalayas.jpeg",     src: "https://images.unsplash.com/photo-1599661520791-8aabee470d55?w=2400&q=90" },
  { key: "western-ghats", dest: "region-western-ghats.jpeg", src: "https://images.unsplash.com/photo-1695211564991-9cf8f7a1d799?w=2400&q=90" },
  { key: "eastern-ghats", dest: "region-eastern-ghats.jpeg", src: "https://images.unsplash.com/photo-1663597675745-96a3f784369e?w=2400&q=90" },
  { key: "desert",        dest: "region-desert.jpeg",        src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=2400&q=90" },
  { key: "coast",         dest: "region-coast.jpeg",         src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&q=90" },
  { key: "islands",       dest: "region-islands.jpeg",       src: "https://images.unsplash.com/photo-1745917784557-a93bf209232c?w=2400&q=90" },
  { key: "northeast",     dest: "region-northeast.jpeg",     src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=2400&q=90" },
  { key: "urban",         dest: "region-urban.jpeg",         src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=2400&q=90" },
];

async function run() {
  const map = {};
  for (const r of REGIONS) {
    process.stdout.write(`[${r.key}] downloading...`);
    const res = await fetch(r.src, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw     = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(raw)
      .resize(1280, 960, { fit: "cover", position: "centre" })
      .jpeg({ quality: 100, progressive: true, mozjpeg: true })
      .toBuffer();
    const meta = await sharp(resized).metadata();
    process.stdout.write(` ${meta.width}×${meta.height}  uploading...`);
    const { error } = await sb.storage.from(BUCKET).upload(r.dest, resized, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(error.message);
    const url = sb.storage.from(BUCKET).getPublicUrl(r.dest).data.publicUrl;
    map[r.src.split("?")[0]] = { dest: r.dest, url };
    console.log(` ✓\n  → ${url}`);
  }
  return map;
}

run().then(map => {
  console.log("\n=== JSON map (old URL prefix → new URL) ===");
  console.log(JSON.stringify(map, null, 2));
}).catch(e => { console.error(e); process.exit(1); });
