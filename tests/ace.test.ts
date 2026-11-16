// ACE™ scoring, ranks, Matchmaker answers and group matching, run against the real code.
// Run: npm test   (node --test with tests/register.mjs, no extra dependencies)
import { test } from "node:test";
import assert from "node:assert/strict";
import { adventures } from "../src/lib/data";
import { getACE, hasRealACE, computeMatchScore, computeDifficulty, difficultyOf, READY_MIN, STRETCH_MIN, type ACE } from "../src/lib/ace";
import { computeAceFromAnswers, combineDualAxis, computeDecayMultipliers, NOT_SURE, MIN_TOTAL_MULTIPLIER, QUICK_QUESTION_COUNT, FULL_QUESTION_COUNT } from "../src/lib/matchmakerScoring";
import { CAPABILITY_QUESTIONS } from "../src/lib/matchmakerQuestions";
import { AXES, bucketFor, gapsFor, groupMatches, groupFloor, decodeMembers, trainingTip, TRAINING_TIPS, weeksToReady, creditFromTrips } from "../src/lib/fitness";
import { getTierLabel, TIER_LIST } from "../src/lib/tiers";
import { XP_TIERS, MAX_XP, xpFromEvents, getTier as getXpTier, getProgressPct } from "../src/lib/xp";

const flat = (n: number): ACE => Object.fromEntries(AXES.map((a) => [a, n])) as unknown as ACE;
const withAxis = (base: number, axis: keyof ACE, v: number): ACE => ({ ...flat(base), [axis]: v });
const allAnswers = (letter: string) => Object.fromEntries(CAPABILITY_QUESTIONS.map((q) => [q.key, letter]));
const FRESH = { "decay-recency": "A", "decay-activity": "E" }; // trained this month, 5+ times a week

// ── Adventure profiles ──────────────────────────────────────────────────────

test("every adventure's ACE profile is whole numbers 0–5", () => {
  for (const a of adventures) for (const [k, v] of Object.entries(getACE(a))) {
    assert.ok(Number.isInteger(v) && v >= 0 && v <= 5, `${a.slug} ${k}=${v}`);
  }
});

test("water activities need water; nothing on land needs water above 4", () => {
  for (const a of adventures) {
    const ace = getACE(a);
    if (["River Rafting", "Diving", "Kayaking"].includes(a.type)) assert.ok(ace.water > 0, a.slug);
    else assert.ok(ace.water <= 4, `${a.slug} water ${ace.water}`);
  }
});

test("adventures above 5,000 m need altitude 5 unless they're an estimate", () => {
  for (const a of adventures) {
    const m = Number((a.altitude ?? "").replace(/[^\d.]/g, ""));
    if (m >= 5000 && hasRealACE(a)) assert.equal(getACE(a).altitude, 5, a.slug);
  }
});

test("difficultyOf is the one difficulty every page shows", () => {
  for (const a of adventures) assert.equal(difficultyOf(a), computeDifficulty(getACE(a)));
});

test("difficulty bands cover every total with no gaps", () => {
  const seen = new Set<string>();
  for (let t = 0; t <= 40; t++) seen.add(computeDifficulty({ ...flat(0), stamina: Math.min(t, 5), power: Math.min(Math.max(t - 5, 0), 5), strength: Math.min(Math.max(t - 10, 0), 5), agility: Math.min(Math.max(t - 15, 0), 5), water: Math.min(Math.max(t - 20, 0), 5), altitude: Math.min(Math.max(t - 25, 0), 5), focus: Math.min(Math.max(t - 30, 0), 5), nerve: Math.min(Math.max(t - 35, 0), 5) }));
  assert.deepEqual([...seen], ["Easy", "Moderate", "Hard", "Advanced", "Extreme"]);
});

test("every adventure has a hand-set ACE profile (no estimates left)", () => {
  assert.deepEqual(adventures.filter((a) => !hasRealACE(a)).map((a) => a.slug), []);
});

test("the Altitude axis follows the top altitude (≥4,000 m: 4+; under 3,000 m: 2 or less)", () => {
  for (const a of adventures) {
    const m = Number((a.altitude ?? "").replace(/[^\d.]/g, ""));
    if (!m || a.type === "River Rafting") continue;
    if (m >= 4000) assert.ok(getACE(a).altitude >= 4, `${a.slug} ${m} m, altitude ${getACE(a).altitude}`);
    if (m < 3000) assert.ok(getACE(a).altitude <= 2, `${a.slug} ${m} m, altitude ${getACE(a).altitude}`);
  }
});

test("difficulty labels sit where the routes do (calibration anchors)", () => {
  const d = (slug: string) => difficultyOf(adventures.find((a) => a.slug === slug)!);
  assert.equal(d("triund"), "Easy");
  for (const s of ["kedarkantha-trek", "brahmatal", "hampta-pass", "rishikesh-river-rafting"]) assert.equal(d(s), "Moderate", s);
  for (const s of ["everest-base-camp", "goechala", "kashmir-great-lakes", "manali-leh-bike-expedition"]) assert.equal(d(s), "Hard", s);
  assert.equal(d("pin-parvati-pass"), "Extreme");
  assert.equal(d("lobuche-peak"), "Extreme");
  // A 5 on any axis is never below Hard, whatever the total
  assert.equal(computeDifficulty({ ...flat(1), altitude: 5 }), "Hard");
});

test("difficulty spread: no band holds more than 60% of adventures", () => {
  const counts: Record<string, number> = {};
  for (const a of adventures) counts[difficultyOf(a)] = (counts[difficultyOf(a)] ?? 0) + 1;
  for (const [k, n] of Object.entries(counts)) assert.ok(n / adventures.length <= 0.6, `${k}: ${n}`);
});

// ── Match score ─────────────────────────────────────────────────────────────

test("meeting every requirement is 100 and Ready", () => {
  for (const a of adventures) {
    const req = getACE(a);
    assert.equal(computeMatchScore(req, req), 100, a.slug);
    assert.equal(bucketFor(computeMatchScore(flat(5), req)).key, "ready", a.slug);
  }
});

test("an adventure with no requirements matches everyone", () => {
  assert.equal(computeMatchScore(flat(1), flat(0)), 100);
});

test("axes an adventure doesn't need (0) never count against you", () => {
  const req = { ...flat(3), water: 0 };
  assert.equal(computeMatchScore({ ...flat(3), water: 1 }, req), 100);
});

test("a 2-level gap on any one axis is never Ready", () => {
  for (const a of adventures) {
    const req = getACE(a);
    for (const ax of AXES) {
      if (req[ax] < 3) continue;
      const s = computeMatchScore({ ...flat(5), [ax]: req[ax] - 2 }, req);
      assert.ok(s < READY_MIN, `${a.slug} ${ax} short by 2 scored ${s}`);
    }
  }
});

test("a 3-level gap on any one axis is Not yet, however strong the rest", () => {
  for (const a of adventures) {
    const req = getACE(a);
    for (const ax of AXES) {
      if (req[ax] < 4) continue;
      const s = computeMatchScore({ ...flat(5), [ax]: req[ax] - 3 }, req);
      assert.ok(s < STRETCH_MIN, `${a.slug} ${ax} short by 3 scored ${s}`);
    }
  }
});

test("the case that was wrong: Altitude 1 for Hampta Pass (4,298 m) is Not yet", () => {
  const hampta = adventures.find((a) => a.slug === "hampta-pass")!;
  assert.equal(bucketFor(computeMatchScore(withAxis(5, "altitude", 1), getACE(hampta))).key, "not-yet");
});

test("raising any axis never lowers the match", () => {
  for (const a of adventures.slice(0, 20)) {
    const req = getACE(a);
    for (const base of [1, 2, 3, 4]) for (const ax of AXES) {
      assert.ok(computeMatchScore(withAxis(base, ax, base + 1), req) >= computeMatchScore(flat(base), req), `${a.slug} ${ax}`);
    }
  }
});

test("bucket thresholds: 80 Ready, 55 Stretch, below Not yet", () => {
  assert.equal(bucketFor(80).key, "ready");
  assert.equal(bucketFor(79).key, "stretch");
  assert.equal(bucketFor(55).key, "stretch");
  assert.equal(bucketFor(54).key, "not-yet");
});

test("gaps are listed biggest first and only where the adventure needs more", () => {
  const pin = adventures.find((a) => a.slug === "pin-parvati-pass")!;
  const g = gapsFor(flat(3), pin);
  assert.ok(g.every((x) => x.need > x.have));
  for (let i = 1; i < g.length; i++) assert.ok(g[i - 1].need - g[i - 1].have >= g[i].need - g[i].have);
});

// ── Matchmaker answers → profile ────────────────────────────────────────────

test("all-E answers, freshly trained and healthy, give 5 on every axis (Apex)", () => {
  const r = computeAceFromAnswers(allAnswers("E"), FRESH, null);
  assert.deepEqual(Object.values(r.ace), Array(8).fill(5));
  assert.equal(getTierLabel(Object.values(r.ace).reduce((a, b) => a + b, 0)), "Apex");
});

test("all-A answers give 1 on every axis (Pathfinder), never 0", () => {
  const r = computeAceFromAnswers(allAnswers("A"), { "decay-recency": "E", "decay-activity": "A" }, null);
  assert.deepEqual(Object.values(r.ace), Array(8).fill(1));
});

test("'Not sure' on every question scores the cautious 1, not a guess", () => {
  const r = computeAceFromAnswers(allAnswers(NOT_SURE), FRESH, null);
  assert.deepEqual(Object.values(r.ace), Array(8).fill(1));
});

test("unanswered questions also score 1", () => {
  const r = computeAceFromAnswers({}, FRESH, null);
  assert.ok(Object.values(r.ace).every((v) => v === 1));
});

test("dual answers far apart lean to the weaker one", () => {
  assert.equal(combineDualAxis(5, 5), 5);
  assert.equal(combineDualAxis(4, 5), 5);
  assert.equal(combineDualAxis(1, 5), 2);
  assert.equal(combineDualAxis(2, 4), 3);
});

test("detraining only lowers physical axes, and never by more than half", () => {
  const worst = computeDecayMultipliers(1, 1);
  for (const v of Object.values(worst)) assert.ok(v! >= 0.5 && v! < 1);
  const r = computeAceFromAnswers(allAnswers("E"), { "decay-recency": "E", "decay-activity": "A" }, {
    cardioRespiratory: true, jointInjury: true, ongoingMedicalNeeds: true, medicationEffects: true, smokingTier: 5, alcoholTier: 5,
  } as never);
  for (const ax of AXES) assert.ok(r.totalMultiplier[ax] >= MIN_TOTAL_MULTIPLIER, ax);
  for (const ax of AXES) assert.ok(r.ace[ax] >= 1 && r.ace[ax] <= 5, ax);
});

test("question counts match the quiz", () => {
  assert.equal(CAPABILITY_QUESTIONS.length, 12);
  assert.ok(QUICK_QUESTION_COUNT < FULL_QUESTION_COUNT);
});

// ── Ranks (ACE total) ───────────────────────────────────────────────────────

test("every possible total 8–40 has exactly one rank, in order", () => {
  let last = 0;
  for (let t = 8; t <= 40; t++) {
    const label = getTierLabel(t);
    const rank = TIER_LIST.find((x) => x.label === label)!.rank;
    assert.ok(rank >= 1 && rank >= last, `total ${t}`);
    last = rank;
  }
  assert.equal(getTierLabel(39), "Vanguard");
  assert.equal(getTierLabel(40), "Apex");
});

// ── Training ────────────────────────────────────────────────────────────────

test("training tips are specific to the next level, for every axis and level", () => {
  for (const ax of AXES) {
    const tips = new Set<string>();
    for (let from = 1; from <= 4; from++) {
      const t = trainingTip(ax, from, from + 1);
      assert.ok(t.length > 20, `${ax} ${from}`);
      tips.add(t);
    }
    assert.equal(tips.size, 4, `${ax} has four distinct steps`);
    assert.ok(TRAINING_TIPS[ax]);
  }
});

test("weeks to ready leaves altitude out (it isn't trained at home)", () => {
  assert.equal(weeksToReady([{ axis: "altitude", have: 1, need: 5 }]), 0);
  assert.equal(weeksToReady([{ axis: "stamina", have: 2, need: 4 }]), 8);
});

test("completing an adventure can only raise a profile", () => {
  const { ace } = creditFromTrips(flat(1), ["kedarkantha-trek"], adventures);
  for (const ax of AXES) assert.ok(ace[ax] >= 1);
  const { ace: high } = creditFromTrips(flat(5), ["kedarkantha-trek"], adventures);
  assert.deepEqual(high, flat(5));
});

// ── Groups ──────────────────────────────────────────────────────────────────

test("group: one member with a critical altitude gap keeps the group off high treks", () => {
  const members = [{ name: "A", ace: flat(5) }, { name: "B", ace: flat(5) }, { name: "C", ace: withAxis(5, "altitude", 1) }];
  const { everyone } = groupMatches(members, adventures);
  for (const r of everyone) assert.ok(getACE(r.adventure).altitude <= 3, `${r.adventure.slug} listed for everyone`);
  const ebc = groupMatches(members, adventures.filter((a) => a.slug === "everest-base-camp"));
  assert.equal(ebc.everyone.length, 0);
});

test("group: the weakest member is the one named, and their gaps are given", () => {
  const members = [{ name: "Strong", ace: flat(5) }, { name: "Weak", ace: flat(2) }];
  const { everyone, someStretch } = groupMatches(members, adventures);
  for (const r of [...everyone, ...someStretch]) {
    assert.equal(r.min, Math.min(...r.scores));
    if (r.scores[0] !== r.scores[1]) assert.equal(r.weakest, 1);
  }
});

test("group: high average can't hide a low member (floor is the minimum)", () => {
  const { floor, average } = groupFloor([{ name: "A", ace: flat(5) }, { name: "B", ace: flat(5) }, { name: "C", ace: withAxis(5, "water", 1) }]);
  assert.equal(floor.water, 1);
  assert.ok(average.water > 3);
});

test("group: identical members match exactly like one person", () => {
  const solo = groupMatches([{ name: "A", ace: flat(3) }], adventures);
  const trio = groupMatches([{ name: "A", ace: flat(3) }, { name: "B", ace: flat(3) }, { name: "C", ace: flat(3) }], adventures);
  assert.deepEqual(trio.everyone.map((r) => r.adventure.slug), solo.everyone.map((r) => r.adventure.slug));
});

test("group links: bad entries are dropped, the cap holds, names are kept short", () => {
  const ok = "Asha~34232323~k3x9ab";
  assert.equal(decodeMembers(`${ok},Bad~123,Zero~00000000`).length, 1);
  assert.equal(decodeMembers(Array(12).fill(ok).join(",")).length, 8);
  assert.ok(decodeMembers(`${"x".repeat(60)}~11111111`)[0].name.length <= 24);
  assert.deepEqual(decodeMembers(null), []);
});

// ── XP tiers ────────────────────────────────────────────────────────────────

test("XP: tiers ascend, every cap filled is exactly the maximum, and revoked events don't count", () => {
  for (let i = 1; i < XP_TIERS.length; i++) assert.ok(XP_TIERS[i].minXP > XP_TIERS[i - 1].minXP);
  assert.equal(MAX_XP, 9000);
  assert.equal(xpFromEvents(Array(50).fill({ action: "review" })), 2000);
  assert.equal(xpFromEvents([{ action: "review", revoked: true }]), 0);
  assert.equal(getXpTier(0).name, XP_TIERS[0].name);
  assert.equal(getProgressPct(MAX_XP), 100);
});

test("XP levels are the eight from the brief, Drifter to Immortal, and Immortal is the maximum", () => {
  assert.deepEqual(XP_TIERS.map((t) => t.name), ["Drifter", "Wanderer", "Rover", "Rambler", "Expeditioner", "Summiteer", "Legend", "Immortal"]);
  assert.equal(XP_TIERS[0].minXP, 0);
  assert.equal(XP_TIERS[XP_TIERS.length - 1].minXP, MAX_XP);
  assert.equal(getXpTier(MAX_XP).name, "Immortal");
  assert.equal(getXpTier(MAX_XP - 1).name, "Legend");
});
