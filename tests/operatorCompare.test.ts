// The operator comparison: the same fields for every operator, "Not listed" where they don't say,
// and the best value only marked where there's something to compare. Runs on the real data.
import { test } from "node:test";
import assert from "node:assert/strict";
import { adventures } from "../src/lib/data";
import operatorOffers from "../src/lib/operatorOffers.json";
import type { OperatorOffer } from "../src/lib/operatorOffer";
import type { OperatorCardData } from "../src/app/experiences/[slug]/OperatorCard";
import { compareOperators, highlights, guideRatio, shortDate, NOT_LISTED, INCLUSION_ROWS } from "../src/lib/operatorCompare";

const offers = operatorOffers as Record<string, Record<string, OperatorOffer>>;
const opsFor = (slug: string): OperatorCardData[] => {
  const a = adventures.find((x) => x.slug === slug)!;
  return a.operators.map((o) => (offers[slug]?.[o.name] ? { ...o, offer: offers[slug][o.name] } : o));
};
const TODAY = "2026-11-17";
const keysOf = (ops: OperatorCardData[]) => compareOperators(ops, ops.map(() => null), TODAY).flatMap((s) => s.fields.map((f) => f.key));

test("every comparison has the same fields in the same order, whoever is in it", () => {
  const withOps = adventures.filter((a) => a.operators.length > 0);
  const expected = keysOf(opsFor(withOps[0].slug));
  for (const a of withOps) {
    const ops = opsFor(a.slug);
    assert.deepEqual(keysOf(ops), expected, a.slug);
    assert.deepEqual(keysOf(ops.slice(0, 1)), expected, `${a.slug} single`);
  }
  for (const k of ["fee", "full", "dates", "group", "ratio", "count", "cancellation", "google", "travellers", "book"]) assert.ok(expected.includes(k), k);
});

test("each field has one cell per operator, and an empty cell says Not listed", () => {
  for (const a of adventures.filter((x) => x.operators.length > 1)) {
    const ops = opsFor(a.slug);
    for (const f of compareOperators(ops, ops.map(() => null), TODAY).flatMap((s) => s.fields)) {
      assert.equal(f.cells.length, ops.length, `${a.slug} ${f.key}`);
      assert.equal(f.best.length, ops.length);
      for (const c of f.cells) assert.ok(c.text.trim().length > 0, `${a.slug} ${f.key} empty cell`);
    }
  }
});

test("an operator with only a listing gets Not listed for inclusions, never a guess", () => {
  const bare: OperatorCardData = { name: "Bare Operator", googleRating: 0, priceFrom: "₹9,000" };
  const fields = compareOperators([bare], [null], TODAY).flatMap((s) => s.fields);
  for (const r of INCLUSION_ROWS) assert.equal(fields.find((f) => f.key === r.key)!.cells[0].text, NOT_LISTED, r.key);
  for (const k of ["full", "group", "ratio", "cancellation", "google", "dates", "book"]) assert.equal(fields.find((f) => f.key === k)!.cells[0].text, NOT_LISTED, k);
  assert.equal(fields.find((f) => f.key === "fee")!.cells[0].text, "₹9,000");
});

test("best is only marked when two or more operators have differing values", () => {
  const a: OperatorCardData = { name: "A", googleRating: 4.8, priceFrom: "₹10,000" };
  const b: OperatorCardData = { name: "B", googleRating: 4.2, priceFrom: "₹8,000" };
  const c: OperatorCardData = { name: "C", googleRating: 0, priceFrom: "" };
  const fields = new Map(compareOperators([a, b, c], [null, null, null], TODAY).flatMap((s) => s.fields).map((f) => [f.key, f]));
  assert.deepEqual(fields.get("fee")!.best, [false, true, false]);
  assert.deepEqual(fields.get("google")!.best, [true, false, false]);
  assert.deepEqual(fields.get("group")!.best, [false, false, false]);
  const solo = compareOperators([a], [null], TODAY).flatMap((s) => s.fields);
  assert.ok(solo.every((f) => !f.best.some(Boolean)));
  const wins = highlights(compareOperators([a, b], [null, null], TODAY), [a, b]);
  assert.equal(wins.find((w) => w.key === "fee")?.names[0], "B");
});

test("guide ratios read the way operators write them", () => {
  const op = (line: string): OperatorCardData => ({ name: "x", googleRating: 0, priceFrom: "", offer: { listedAs: "x", batches: [], addOns: {}, included: [line], notIncluded: [] } });
  assert.deepEqual(guideRatio(op("Participants : Guide Ratio is 6:1 for the trek duration")), { who: "guide", per: 6 });
  assert.deepEqual(guideRatio(op("Guide Ratio: 1 guide for every 10 trekkers")), { who: "guide", per: 10 });
  assert.deepEqual(guideRatio(op("Sherpa Support of 1:2 or better for the summit attempt")), { who: "sherpa", per: 2 });
  assert.equal(guideRatio(op("Porters to carry 10Kg maximum per person on the trek (Porter: Trekker = 1:3)")), undefined);
  assert.equal(guideRatio(op("Guide Ratio: Local experienced guide (depends on the group size).")), undefined);
});

test("dates read the same on the server and in the browser", () => {
  assert.equal(shortDate("2026-12-05"), "5 Dec");
  assert.equal(shortDate("2026-11-12", true), "12 Nov 2026");
});
