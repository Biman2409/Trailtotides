import { readFileSync, writeFileSync } from "fs";

const map = JSON.parse(readFileSync("./scripts/public-image-map.json", "utf8"));
let data = readFileSync("./src/lib/data.ts", "utf8");
let count = 0;

for (const [localPath, supabaseUrl] of Object.entries(map)) {
  // Replace any occurrence of the quoted local path
  const before = data;
  // simple string replacement – no regex needed since paths are literal
  while (data.includes(`"${localPath}"`)) {
    data = data.replace(`"${localPath}"`, `"${supabaseUrl}"`);
  }
  if (data !== before) count++;
}

writeFileSync("./src/lib/data.ts", data);
console.log(`Replaced ${count} unique local paths with Supabase URLs.`);

// Verify
const remaining = [...data.matchAll(/"\/[a-z][a-z0-9-]+\.(jpeg|jpg|webp|png)"/g)];
if (remaining.length) {
  console.log("Still local:", remaining.map(m => m[0]).join(", "));
} else {
  console.log("All local image paths replaced.");
}
