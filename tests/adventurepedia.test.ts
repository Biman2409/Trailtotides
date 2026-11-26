// Adventurepedia's content: every adventure has a full guide, and every link inside the guides
// leads to a page (and section) that exists. Runs on the real data.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GUIDES, TOPICS, type Block, type GuideSection } from "../src/lib/adventurepedia";
import { ACTIVITIES } from "../src/lib/activityGuides";
import { ACTIVITY_DETAILS } from "../src/lib/activityDetails";
import { trekAdventures } from "../src/lib/trekGuides";
import { adventures } from "../src/lib/data";

const texts = (b: Block): string[] =>
  "p" in b ? [b.p] : "list" in b ? b.list : "steps" in b ? b.steps : "callout" in b ? [b.title, b.text] : [...b.table.head, ...b.table.rows.flat()];

/** Every section id on each internal page, so links can be checked down to the anchor */
function pages() {
  const map = new Map<string, Set<string> | null>();
  for (const g of GUIDES) map.set(`/adventurepedia/${g.slug}`, g.custom ? null : new Set(["short-version", ...g.sections.map((s) => s.id)]));
  for (const a of ACTIVITIES) {
    const d = ACTIVITY_DETAILS[a.slug];
    map.set(`/adventurepedia/activities/${a.slug}`, new Set(["short-version", "when", "body", "operator", "start", "adventures", ...(d?.sections.map((s) => s.id) ?? [])]));
  }
  for (const t of trekAdventures()) map.set(`/adventurepedia/treks/${t.slug}`, null);
  for (const p of ["/adventurepedia", "/adventurepedia/treks", "/adventurepedia/ready", "/explore", "/matchmaker", "/ace", "/operators", "/map", "/contact"]) map.set(p, null);
  return map;
}

function linksIn(sections: GuideSection[], extra: string[] = []) {
  const all = [...extra, ...sections.flatMap((s) => s.blocks.flatMap(texts))].join(" ");
  return [...all.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
}

test("every adventure type has an activity page with a full guide", () => {
  const types = new Set(adventures.map((a) => a.type));
  for (const t of types) assert.ok(ACTIVITIES.some((a) => a.type === t), `${t} has listings but no activity page`);
  for (const a of ACTIVITIES) {
    const d = ACTIVITY_DETAILS[a.slug];
    assert.ok(d, `${a.type} has no full guide`);
    assert.ok(d.tldr.length >= 3, `${a.type}: short version too short`);
    assert.ok(d.sections.length >= 2, `${a.type}: fewer than 2 sections`);
  }
  for (const slug of Object.keys(ACTIVITY_DETAILS)) assert.ok(ACTIVITIES.some((a) => a.slug === slug), `full guide "${slug}" matches no activity`);
});

test("guide slugs and section ids are unique, and every guide has a known topic", () => {
  const slugs = GUIDES.map((g) => g.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate guide slug");
  for (const g of GUIDES) {
    assert.ok(TOPICS.some((t) => t.id === g.topic), `${g.slug}: unknown topic ${g.topic}`);
    const ids = g.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${g.slug}: duplicate section id`);
    for (const r of g.related) assert.ok(GUIDES.some((x) => x.slug === r), `${g.slug}: related guide "${r}" doesn't exist`);
  }
  for (const a of ACTIVITIES) {
    for (const s of a.guides) assert.ok(GUIDES.some((g) => g.slug === s), `${a.type}: guide "${s}" doesn't exist`);
    const ids = ACTIVITY_DETAILS[a.slug]?.sections.map((s) => s.id) ?? [];
    for (const fixed of ["when", "body", "operator", "start", "adventures", "short-version"]) assert.ok(!ids.includes(fixed), `${a.type}: section id "${fixed}" clashes with the page's own`);
    assert.equal(new Set(ids).size, ids.length, `${a.type}: duplicate section id`);
  }
});

test("every internal link in the guides leads to a page and section that exist", () => {
  const map = pages();
  const check = (where: string, href: string) => {
    const [path, hash] = href.split("#");
    assert.ok(map.has(path), `${where}: link to ${href} leads nowhere`);
    const ids = map.get(path);
    if (hash && ids) assert.ok(ids.has(hash), `${where}: link to ${href} has no such section`);
  };
  for (const g of GUIDES) for (const h of linksIn(g.sections, g.tldr)) check(g.slug, h);
  for (const [slug, d] of Object.entries(ACTIVITY_DETAILS)) for (const h of linksIn(d.sections, d.tldr)) check(`activity ${slug}`, h);
});

test("sources are https links with labels", () => {
  const all = [...GUIDES.flatMap((g) => g.sources ?? []), ...Object.values(ACTIVITY_DETAILS).flatMap((d) => d.sources ?? [])];
  assert.ok(all.length > 0);
  for (const s of all) {
    assert.match(s.url, /^https:\/\//, `${s.label}: not https`);
    assert.ok(s.label.length > 3);
  }
});
