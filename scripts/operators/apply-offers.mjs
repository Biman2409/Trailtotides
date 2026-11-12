/**
 * Usage: node scripts/operators/apply-offers.mjs research/offers/bikat.json [more.json …]
 *
 * Puts one operator's freshly read offers (written by scripts/operators/<operator>.mjs) on the
 * site. For that operator it replaces, in full:
 *   src/lib/operatorOffers.json    the offer per adventure (comparison table)
 *   src/lib/operatorPrices.json    the headline fee per adventure (cards, "from" prices)
 *   src/lib/operatorListings.json  a listing on adventures where data.ts doesn't name them
 * Adventures the operator no longer runs lose that operator's offer and added listing. A listing
 * written into data.ts by hand stays; the script reports it so it can be checked.
 */
import { readFileSync, writeFileSync } from "fs";

const files = process.argv.slice(2);
if (!files.length) { console.error("Give one or more research/offers/*.json files"); process.exit(1); }

const read = (f) => JSON.parse(readFileSync(f, "utf8"));
const offersAll = read("src/lib/operatorOffers.json");
const pricesAll = read("src/lib/operatorPrices.json");
const listingsAll = read("src/lib/operatorListings.json");

// Operators written into data.ts by hand, per adventure
const data = readFileSync("src/lib/data.ts", "utf8");
const handListed = new Map();
// An empty list is "operators: []" on one line; anything else closes on a line of its own
for (const m of data.matchAll(/slug: "([^"]+)"[\s\S]*?operators: \[(\]|[\s\S]*?\n\s*\]),/g)) {
  handListed.set(m[1], new Set([...m[2].matchAll(/name: "([^"]+)"/g)].map((x) => x[1])));
}

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

for (const f of files) {
  const { operator, offers } = read(f);
  // Clear this operator everywhere first, so dropped treks don't linger
  for (const slug of Object.keys(offersAll)) { delete offersAll[slug][operator]; if (!Object.keys(offersAll[slug]).length) delete offersAll[slug]; }
  for (const slug of Object.keys(pricesAll)) { delete pricesAll[slug][operator]; if (!Object.keys(pricesAll[slug]).length) delete pricesAll[slug]; }
  for (const slug of Object.keys(listingsAll)) { listingsAll[slug] = listingsAll[slug].filter((o) => o.name !== operator); if (!listingsAll[slug].length) delete listingsAll[slug]; }

  let added = 0, updated = 0;
  for (const [slug, offer] of Object.entries(offers)) {
    if (!handListed.has(slug)) { console.warn(`  ${slug}: not an adventure on the site, skipped`); continue; }
    if (!offer.feeBase) {
      // Listed by hand but the page gives no price: say so rather than keep an old figure
      if (handListed.get(slug).has(operator)) {
        (pricesAll[slug] ??= {})[operator] = { priceFrom: "On request", checkedAt: offer.checkedAt };
        console.warn(`  ${slug}: no price on the page, shown as "On request"`);
      } else console.warn(`  ${slug}: no price on the page, skipped`);
      continue;
    }
    (offersAll[slug] ??= {})[operator] = offer;
    (pricesAll[slug] ??= {})[operator] = { priceFrom: inr(offer.feeBase), checkedAt: offer.checkedAt };
    if (handListed.get(slug).has(operator)) { updated++; continue; }
    (listingsAll[slug] ??= []).push({ name: operator, verified: false, priceFrom: inr(offer.feeBase), googleRating: 0, website: offer.url, priceCheckedAt: offer.checkedAt, fromSheet: true });
    added++;
  }
  const notRun = [...handListed].filter(([slug, ops]) => ops.has(operator) && !offers[slug]).map(([slug]) => slug);
  console.log(`${operator}: ${updated} hand-listed adventures updated, ${added} listings added`);
  if (notRun.length) console.log(`  listed by hand in data.ts but no page found: ${notRun.join(", ")}`);
}

writeFileSync("src/lib/operatorOffers.json", JSON.stringify(offersAll) + "\n");
writeFileSync("src/lib/operatorPrices.json", JSON.stringify(pricesAll, null, 1) + "\n");
writeFileSync("src/lib/operatorListings.json", JSON.stringify(listingsAll, null, 1) + "\n");
