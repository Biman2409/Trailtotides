// Audit: Compass.AI against the 10 product scenarios, on a running server (default the local dev one).
// Run: node scripts/audit-compass.mjs [baseUrl]
const BASE = process.argv[2] ?? "http://localhost:3200";
const slugs = new Set((await (await fetch(`${BASE}/sitemap.xml`)).text()).match(/experiences\/([a-z0-9-]+)/g)?.map((m) => m.split("/")[1]) ?? []);
const u = (content) => ({ role: "user", content });
const a = (content) => ({ role: "assistant", content });
const LOW_ALT = { stamina: 3, power: 3, strength: 3, agility: 3, water: 2, altitude: 2, focus: 3, nerve: 3 };
const CASES = [
  ["1 beginner Himalayan trek", [u("Recommend a beginner-friendly Himalayan trek")]],
  ["2 high altitude, experienced", [u("I'm an experienced trekker, find me a high-altitude trek above 5000m")]],
  ["3 compare ABC vs KGL", [u("Compare Annapurna Base Camp and Kashmir Great Lakes")]],
  ["4 motorcycle Ladakh", [u("Motorcycle expeditions in Ladakh")]],
  ["5 budget", [u("Adventures under 15000 rupees")]],
  ["6 ACE profile fit", [u("What can I do in October?")], LOW_ALT],
  ["7 alternative to too hard", [u("Is Pin Parvati Pass a good trek?"), a("Pin Parvati Pass is an Extreme trek in Himachal."), u("That's too difficult for me, something easier nearby?")]],
  ["8 training", [u("How do I improve my altitude capability before a trek?")]],
  ["9 group", [u("4 friends, one has never trekked, we want a weekend trek in Uttarakhand")]],
  ["10 permits/season", [u("What permits do I need for Goechala and when is the best season?")]],
];
const PAUSE = Number(process.env.PAUSE_MS ?? 0);
for (const [name, messages, ace] of CASES) {
  if (PAUSE) await new Promise((r) => setTimeout(r, PAUSE));
  const t = Date.now();
  let r, body;
  try { r = await fetch(`${BASE}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages, ace }) }); body = await r.json(); }
  catch (e) { console.log(`\n## ${name}: ERROR ${e}`); continue; }
  const recs = body.recommendations ?? [];
  const bad = recs.filter((x) => !slugs.has(x.slug)).map((x) => x.slug);
  const money = /₹\s?\d|rs\.?\s?\d|inr\s?\d|\d{1,3},\d{3}\s?(rupees|inr)/i.test(body.text ?? "");
  console.log(`\n## ${name}  [${r.status}, ${Date.now() - t} ms, cards=${(body.cards ?? []).length}]`);
  console.log(`reply: ${(body.text ?? body.error ?? "").replace(/\s+/g, " ").slice(0, 400)}`);
  console.log(`recs: ${recs.map((x) => `${x.slug}${x.reason ? ` (${x.reason.slice(0, 90)})` : ""}`).join(" | ") || "none"}`);
  console.log(`checks: unknown slugs=${bad.length ? bad.join(",") : "none"}; states a price=${money}`);
}
