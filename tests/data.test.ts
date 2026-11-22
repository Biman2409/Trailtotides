// The adventure catalogue, its operators and prices, and the Explore/Map filters, run on the real data.
import { test } from "node:test";
import assert from "node:assert/strict";
import { adventures, allListedOperators } from "../src/lib/data";
import { difficultyOf } from "../src/lib/ace";
import { computeLeadPrices, computeOperatorPrices } from "../src/lib/leadPricesCompute";
import operatorFullPrices from "../src/lib/operatorFullPrices.json";
import { priceRange } from "../src/lib/trekGuides";
import { sortAdventures } from "../src/lib/exploreHelpers";
import leadPrices from "../src/lib/leadPrices.json";
import { fromPrice, operatorPriceOf } from "../src/lib/leadPrices";
import { filterAdventures, filtersFromParams, writeFilterParams, NO_FILTERS } from "../src/lib/adventureFilterState";
import { days, matchesSearch } from "../src/lib/exploreHelpers";
import { lowestPrice } from "../src/lib/destinations";

test("slugs, ids and names are unique", () => {
  for (const key of ["slug", "id", "name"] as const) {
    const vals = adventures.map((a) => String(a[key]).toLowerCase());
    assert.equal(new Set(vals).size, vals.length, `duplicate ${key}`);
  }
});

test("every adventure sits inside India or Nepal", () => {
  for (const a of adventures) assert.ok(a.lat > 6 && a.lat < 37.5 && a.lng > 68 && a.lng < 98, `${a.slug} ${a.lat},${a.lng}`);
});

test("every adventure has the text, image and season its page needs", () => {
  for (const a of adventures) {
    for (const f of ["name", "tagline", "description", "whoFor", "heroImage", "bestSeason", "durationDays"] as const) {
      assert.ok(a[f] && String(a[f]).trim().length > 2, `${a.slug} missing ${f}`);
    }
    assert.ok(a.bestMonths.length > 0, `${a.slug} has no best months`);
  }
});

test("the duration bucket matches the days (Weekend ≤ 3, 3–5 days, then 6+)", () => {
  for (const a of adventures) {
    const d = days(a);
    if (a.duration === "Weekend") assert.ok(d <= 3, `${a.slug} ${d} days in Weekend`);
    if (a.duration === "3–5 days") assert.ok(d >= 3 && d <= 5, `${a.slug} ${d} days in 3–5`);
    if (a.duration === "7+ days") assert.ok(d >= 6, `${a.slug} ${d} days in 6+`);
  }
});

test("operators: hidden ones are gone, websites are https, the verified flag is the same everywhere", () => {
  const flags = new Map<string, boolean>();
  for (const a of adventures) for (const o of a.operators) {
    assert.notEqual(o.name.toLowerCase(), "treks and trails india");
    if (o.website) assert.match(o.website, /^https:\/\//, `${a.slug} ${o.name}`);
    if (flags.has(o.name)) assert.equal(flags.get(o.name), o.verified, `${o.name} verified differs`);
    flags.set(o.name, o.verified);
  }
  assert.equal(allListedOperators.length, flags.size);
});

test("leadPrices.json is up to date with the operators and their offers", () => {
  assert.deepEqual(leadPrices, computeLeadPrices(), "run: node --import ./tests/register.mjs scripts/build-lead-prices.ts");
});

test("operatorFullPrices.json is up to date with the operators and their offers", () => {
  assert.deepEqual(operatorFullPrices, computeOperatorPrices(), "run: node --import ./tests/register.mjs scripts/build-lead-prices.ts");
});

test("guides and operator lists never quote a lower 'from' than the adventure page", () => {
  const k = adventures.find((a) => a.slug === "kedarkantha-trek")!;
  assert.equal(operatorPriceOf(k.slug, k.operators.find((o) => o.name === "Bikat Adventures")!)?.price, 12475);
  for (const a of adventures) {
    const r = priceRange(a);
    if (r && fromPrice(a) !== null) assert.equal(r.lo, fromPrice(a), a.slug);
  }
});

test("Explore's price sort follows the price each card shows", () => {
  const sorted = sortAdventures(adventures, "price", { monthIdx: 0 }).map((a) => fromPrice(a) ?? Infinity);
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i - 1] <= sorted[i], `out of order at ${i}: ${sorted[i - 1]} > ${sorted[i]}`);
});

test("one 'from' price: cards, filter, map, destination pages all read the page's lead price", () => {
  const k = adventures.find((a) => a.slug === "kedarkantha-trek")!;
  assert.equal(fromPrice(k), 12475);
  for (const a of adventures) assert.equal(lowestPrice(a), fromPrice(a) ?? 0, a.slug);
});

test("price filter keeps only adventures at or under the limit, by the shown price", () => {
  const out = filterAdventures(adventures, { ...NO_FILTERS, maxPrice: 15000 });
  assert.ok(out.length > 0);
  for (const a of out) assert.ok((fromPrice(a) ?? Infinity) <= 15000, a.slug);
});

test("filters combine (AND across groups, OR within one) and an impossible combination is empty", () => {
  const treksInUk = filterAdventures(adventures, { ...NO_FILTERS, types: ["Trekking"], states: ["Uttarakhand"] });
  assert.ok(treksInUk.length > 0 && treksInUk.every((a) => a.type === "Trekking" && a.state.includes("Uttarakhand")));
  const two = filterAdventures(adventures, { ...NO_FILTERS, diffs: ["Easy", "Extreme"] });
  assert.ok(two.every((a) => ["Easy", "Extreme"].includes(difficultyOf(a))));
  assert.equal(filterAdventures(adventures, { ...NO_FILTERS, types: ["River Rafting"], states: ["Ladakh"] }).length, 0);
  assert.equal(filterAdventures(adventures, NO_FILTERS).length, adventures.length);
});

test("difficulty filter uses the same difficulty the cards show", () => {
  for (const d of ["Easy", "Moderate", "Hard", "Advanced", "Extreme"] as const) {
    for (const a of filterAdventures(adventures, { ...NO_FILTERS, diffs: [d] })) assert.equal(difficultyOf(a), d);
  }
});

test("month filter only returns adventures in season that month", () => {
  for (const a of filterAdventures(adventures, { ...NO_FILTERS, months: ["Jan"] })) assert.ok(a.bestMonths.includes("Jan"), a.slug);
});

test("filters survive a round trip through a link, and old ?subRegion= links still work", () => {
  const f = { ...NO_FILTERS, search: "lake", types: ["Trekking" as const], states: ["Himachal"], diffs: ["Hard" as const], months: ["Oct" as const], maxPrice: 20000, fit: "ready" as const };
  const p = new URLSearchParams();
  writeFilterParams(p, f);
  assert.deepEqual(filtersFromParams(p), { ...f, durs: [], editorOnly: false });
  assert.deepEqual(filtersFromParams(new URLSearchParams("subRegion=Sikkim")).states, ["Sikkim"]);
  assert.deepEqual(filtersFromParams(new URLSearchParams("month=Foo,Jan")).months, ["Jan"]);
});

test("search: every word must match; synonyms work; nonsense finds nothing", () => {
  assert.ok(adventures.filter((a) => matchesSearch(a, "himachal trek")).every((a) => a.state.includes("Himachal") && a.type === "Trekking"));
  assert.ok(adventures.some((a) => matchesSearch(a, "bike ladakh")));
  assert.equal(adventures.filter((a) => matchesSearch(a, "zzqx")).length, 0);
});

test("search forgives a small typo and knows trekkers' abbreviations, but short words match exactly", () => {
  const find = (q: string) => adventures.filter((a) => matchesSearch(a, q)).map((a) => a.slug);
  assert.ok(find("kedarkanta").includes("kedarkantha-trek"));
  assert.ok(find("goechla").includes("goechala"));
  assert.ok(find("EBC").includes("everest-base-camp"));
  assert.deepEqual(find("kgl"), ["kashmir-great-lakes"]);
  assert.deepEqual(find("zzzzqq"), []);
});

test("experience titles and descriptions don't promise operators an adventure doesn't have", async () => {
  const { experienceTitle, experienceDescription } = await import("../src/lib/seo");
  for (const a of adventures) {
    const title = JSON.stringify(experienceTitle(a));
    const desc = experienceDescription(a, {});
    if (a.operators.length === 0) {
      assert.doesNotMatch(title, /operator|price/i, a.slug);
      assert.doesNotMatch(desc, /operator|book /i, a.slug);
    }
  }
});

// Team notes live in their own server-only file (kept out of the browser catalogue)
import { SEED_REVIEWS } from "../src/lib/seedReviews";
test("every team note belongs to a real adventure and has no member account", () => {
  const slugs = new Set(adventures.map((a) => a.slug));
  for (const [slug, notes] of Object.entries(SEED_REVIEWS)) {
    assert.ok(slugs.has(slug), slug);
    for (const n of notes) assert.ok(!("user_id" in n) || !(n as { user_id?: string }).user_id, `${slug} ${n.id}`);
  }
  assert.ok(Object.keys(SEED_REVIEWS).length >= 50);
});

test("nothing without operators is featured or an Editor's Choice", () => {
  for (const a of adventures) if (a.operators.length === 0) assert.ok(!a.featured && !a.editorChoice, a.slug);
});

// The long "skip it if" and safety text lives in a server-only file
import { textOf, ADVENTURE_TEXT_SLUGS } from "../src/lib/adventureText";
test("every adventure has its 'skip it if' and safety text, and no stray entries", () => {
  const slugs = new Set(adventures.map((a) => a.slug));
  for (const a of adventures) {
    const t = textOf(a.slug);
    assert.ok(t.whoNot.trim().length >= 10, `${a.slug} whoNot`);
    assert.ok(t.safetyNotes.trim().length >= 10, `${a.slug} safetyNotes`);
  }
  for (const s of ADVENTURE_TEXT_SLUGS) assert.ok(slugs.has(s), s);
});

// Departures closer than the booking lead time aren't offered
import { getNextDeparture, firstBookableDate, BOOKING_LEAD_DAYS } from "../src/lib/nextDeparture";
test("next departure skips dates too close to book", () => {
  const now = new Date("2026-11-22T06:00:00Z"); // midday in India
  assert.equal(BOOKING_LEAD_DAYS, 3);
  assert.equal(firstBookableDate(now), "2026-11-25");
  assert.equal(getNextDeparture(["2026-11-22", "2026-11-24", "2026-12-05"], now), "5 Dec");
  assert.equal(getNextDeparture(["2026-11-22", "2026-11-25"], now), "25 Nov");
  assert.equal(getNextDeparture(["2026-11-20"], now), null);
});
