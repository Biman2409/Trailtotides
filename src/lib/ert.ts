import type { Adventure, Difficulty, ERT } from "./data";

// ─── Labels & descriptions ────────────────────────────────────────────────────

export const EXERTION_LABELS: Record<number, string> = {
  1: "Very Easy",
  2: "Easy",
  3: "Moderate",
  4: "Hard",
  5: "Extreme",
};

export const RISK_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Extreme",
};

export const TECHNICALITY_LABELS: Record<number, string> = {
  1: "Walk-in",
  2: "Uneven Terrain",
  3: "Scrambling",
  4: "Crampons / Ice",
  5: "Mountaineering",
};

export const EXERTION_DESCRIPTIONS: Record<number, string> = {
  1: "Very easy walking. Short hikes under 4 hours with minimal elevation.",
  2: "Easy trekking on moderate trails. Good for beginners with basic fitness.",
  3: "Typical multi-day trek with 5–6 hour walking days and meaningful elevation.",
  4: "Long days, steep climbs, and significant altitude exposure. High fitness required.",
  5: "High altitude, extended duration, or physically exhausting expedition-style effort.",
};

export const RISK_DESCRIPTIONS: Record<number, string> = {
  1: "Very accessible route. Immediate rescue possible. Popular and well-marked.",
  2: "Popular trekking route with infrastructure and frequent trekkers.",
  3: "Remote trail with limited support. Weather can be unpredictable.",
  4: "High environmental risk. Unpredictable weather, exposed terrain, or sparse rescue.",
  5: "Extreme isolation or dangerous terrain. Rescue may take days or be impossible during storms.",
};

export const TECHNICALITY_DESCRIPTIONS: Record<number, string> = {
  1: "Standard walking. Trekking boots and poles sufficient.",
  2: "Uneven or steep terrain. Basic trekking skills and fitness needed.",
  3: "Scrambling sections where hands are used for balance or climbing.",
  4: "Ice or snow traction required. Microspikes or crampons needed at some points.",
  5: "Mountaineering terrain. Ice axe, ropes, crampons, or glacier travel required.",
};

// ─── Auto-computation from Adventure fields ───────────────────────────────────

export function parseAltitudeM(alt?: string): number {
  if (!alt) return 0;
  const clean = alt.replace(/,/g, "").replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

function parseDays(durationDays: string): number {
  const m = durationDays.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 5;
}

const DIFF_RISK: Record<Difficulty, number> = {
  Easy: 1,
  Moderate: 2,
  Intermediate: 3,
  Hard: 4,
  Extreme: 5,
};

export function computeERT(a: Adventure): ERT {
  const altM = parseAltitudeM(a.altitude ?? a.depth);
  const days = parseDays(a.durationDays);

  // Exertion: driven by altitude + duration
  let e: number;
  if (days <= 2 && altM < 3000) e = 1;
  else if (days <= 4 && altM < 3500) e = 2;
  else if (days <= 7 && altM < 4500) e = 3;
  else if (altM < 5500 || days <= 14) e = 4;
  else e = 5;
  // Floor by difficulty
  if (a.difficulty === "Extreme") e = Math.max(e, 5);
  if (a.difficulty === "Hard") e = Math.max(e, 4);

  // Risk: maps from difficulty tier
  const r = DIFF_RISK[a.difficulty] ?? 3;

  // Technicality: difficulty + altitude
  let t: number;
  if (a.difficulty === "Easy") {
    t = 1;
  } else if (a.difficulty === "Moderate") {
    t = altM > 4000 ? 2 : 1;
  } else if (a.difficulty === "Intermediate") {
    t = altM > 4800 ? 3 : 2;
  } else if (a.difficulty === "Hard") {
    t = a.type === "Mountaineering" ? 5 : 4;
  } else {
    // Extreme
    t = 5;
  }

  return { e, r, t };
}

/** Returns the ERT for an adventure, using explicit values if set, computed otherwise. */
export function getERT(a: Adventure): ERT {
  if (a.ert) return a.ert;
  return computeERT(a);
}

/** Returns a plain-English summary sentence for the ERT scores */
export function ertSummary(ert: ERT, adventureName: string): string {
  const exertion = EXERTION_LABELS[ert.e] ?? "Moderate";
  const risk = RISK_LABELS[ert.r] ?? "Moderate";
  const tech = TECHNICALITY_LABELS[ert.t] ?? "Walk-in";

  const sentences: string[] = [];

  if (ert.e >= 4)
    sentences.push(`${adventureName} demands high physical output with long days and significant elevation gain.`);
  else if (ert.e === 3)
    sentences.push(`${adventureName} involves a typical multi-day trekking effort with 5–6 hour walking days.`);
  else
    sentences.push(`${adventureName} is a relatively gentle route suitable for trekkers with basic fitness.`);

  if (ert.r >= 4)
    sentences.push(`The environment carries serious risk — remote terrain, unpredictable weather, and limited rescue access.`);
  else if (ert.r === 3)
    sentences.push(`The trail is moderately remote with limited infrastructure beyond the basecamp.`);
  else
    sentences.push(`The route is well-supported with regular trekkers and accessible rescue options.`);

  if (ert.t >= 5)
    sentences.push(`Technical mountaineering skills are required — ice axe, crampons, and glacier travel experience are essential.`);
  else if (ert.t === 4)
    sentences.push(`Ice or snow traction (crampons or microspikes) is required on parts of the route.`);
  else if (ert.t === 3)
    sentences.push(`Some scrambling sections require hands for balance — no technical gear needed.`);
  else
    sentences.push(`No technical skills required — standard trekking gear is sufficient.`);

  return sentences.join(" ");
}
