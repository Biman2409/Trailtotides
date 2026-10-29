// Downloads the ultrajourneys.org maps category for reference: every post's text and links, and
// any GPX, KML or KMZ track it links to (Google My Maps are saved as their KML export), into
// research/ultrajourneys/. Research only: the site's maps are its own, so nothing here is shown on
// Trail to Tides without the owner's permission; see each post's licence notes in index.json.
// Honours robots.txt and waits between requests. Run: node scripts/research/fetch-ultrajourneys.mjs

import { mkdir, writeFile } from "node:fs/promises";

const SITE = "https://ultrajourneys.org";
const START = `${SITE}/category/maps/`;
const OUT = "research/ultrajourneys";
const UA = { "User-Agent": "TrailToTides research fetch (hello@trailtotides.com)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// robots.txt: the Disallow lines for any user agent
const disallow = [];
try {
  const robots = await (await fetch(`${SITE}/robots.txt`, { headers: UA })).text();
  let applies = false;
  for (const line of robots.split(/\r?\n/)) {
    const [k, ...v] = line.split(":");
    const val = v.join(":").trim();
    if (/^user-agent$/i.test(k.trim())) applies = val === "*";
    else if (applies && /^disallow$/i.test(k.trim()) && val) disallow.push(val);
  }
} catch { /* no robots.txt */ }
const allowed = (url) => { const u = new URL(url); return u.host !== new URL(SITE).host || !disallow.some((d) => u.pathname.startsWith(d)); };

async function get(url, binary = false) {
  if (!allowed(url)) { console.log(`  robots.txt disallows ${url}`); return null; }
  await sleep(1500);
  const res = await fetch(url, { headers: UA, redirect: "follow" });
  if (!res.ok) { console.log(`  ${res.status} ${url}`); return null; }
  return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#0?38;/g, "&").replace(/&quot;/g, '"').replace(/&#8217;|&rsquo;/g, "’").replace(/&#8211;|&ndash;/g, "–").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>|<\/(p|li|h\d|tr|div)>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
const links = (html, base) => [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map((m) => { try { return new URL(decode(m[1]), base).href; } catch { return null; } }).filter(Boolean);
const slugOf = (url) => new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/[^a-z0-9-]+/gi, "_").slice(0, 80) || "index";

// The category's pages, then each post linked from them
const posts = new Set();
for (let page = 1, url = START; url && page <= 30; page++) {
  const html = await get(url);
  if (!html) break;
  for (const l of links(html, url)) {
    const u = new URL(l);
    if (u.host === new URL(SITE).host && /^\/\d{4}\/\d{2}\/|^\/[a-z0-9-]+\/$/i.test(u.pathname) && !/\/(category|tag|author|page|wp-|feed)/.test(u.pathname) && u.pathname !== "/") posts.add(u.origin + u.pathname);
  }
  const next = html.match(/<link[^>]+rel=["']next["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? html.match(/class=["'][^"']*next[^"']*["'][^>]*href=["']([^"']+)["']/i)?.[1];
  url = next ? new URL(decode(next), url).href : null;
}
console.log(`${posts.size} posts in ${START}`);

await mkdir(`${OUT}/posts`, { recursive: true });
await mkdir(`${OUT}/tracks`, { recursive: true });
const index = [];
for (const url of posts) {
  const html = await get(url);
  if (!html) continue;
  const title = decode(html.match(/<meta property=["']og:title["'] content=["']([^"']+)/i)?.[1] ?? html.match(/<title>([^<]+)/i)?.[1] ?? url).trim();
  const body = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html;
  const all = [...new Set(links(body, url))];
  const tracks = all.filter((l) => /\.(gpx|kml|kmz)(\?|$)/i.test(l));
  const myMaps = [...new Set(all.map((l) => l.match(/google\.[a-z.]+\/maps\/d\/(?:u\/\d+\/)?(?:viewer|edit|embed)\?(?:[^"']*&)?mid=([\w-]+)/)?.[1]).filter(Boolean))];
  const other = all.filter((l) => /wikiloc|alltrails|komoot|strava|gaiagps|caltopo|outdooractive|relive|drive\.google/i.test(l));
  const plain = text(body);
  // Anything the post says about copyright, licences or reuse
  const licence = plain.split(/\n+/).filter((l) => /copyright|©|licen[cs]e|creative commons|all rights reserved|permission|reproduce|do not copy|attribution/i.test(l)).slice(0, 10);
  const slug = slugOf(url);
  await writeFile(`${OUT}/posts/${slug}.md`, `# ${title}\n\n${url}\n\n${plain}\n\n## Links\n\n${all.map((l) => `- ${l}`).join("\n")}\n`);
  const saved = [];
  for (const t of tracks) {
    const buf = await get(t, true);
    if (!buf) continue;
    const name = `${slug}__${decodeURIComponent(new URL(t).pathname.split("/").pop())}`.replace(/[^\w.-]+/g, "_");
    await writeFile(`${OUT}/tracks/${name}`, buf);
    saved.push(name);
  }
  for (const mid of myMaps) {
    const kml = await get(`https://www.google.com/maps/d/kml?mid=${mid}&forcekml=1`);
    if (!kml || !kml.includes("<kml")) continue;
    const name = `${slug}__mymaps_${mid}.kml`;
    await writeFile(`${OUT}/tracks/${name}`, kml);
    saved.push(name);
  }
  index.push({ title, url, tracks, myMaps, other, saved, licence });
  console.log(`${title}: ${saved.length} track files, ${myMaps.length} My Maps, ${other.length} other map links`);
}

// The site-wide terms, if there's a page for them
const terms = [];
for (const path of ["/terms", "/terms-of-use", "/terms-and-conditions", "/copyright", "/disclaimer", "/about"]) {
  const html = await get(SITE + path);
  if (!html) continue;
  const lines = text(html).split(/\n+/).filter((l) => /copyright|©|licen[cs]e|creative commons|all rights reserved|permission|reproduce|attribution/i.test(l));
  if (lines.length) terms.push({ url: SITE + path, lines: lines.slice(0, 20) });
}

await writeFile(`${OUT}/index.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), source: START, robotsDisallow: disallow, terms, posts: index }, null, 2));
console.log(`Saved ${index.length} posts, ${index.reduce((s, p) => s + p.saved.length, 0)} track files to ${OUT}`);
