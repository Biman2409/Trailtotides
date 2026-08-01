// Pure question data for the Matchmaker (ACE™) assessment — no React/JSX here
// so this can be imported by both the client wizard and any future
// server-side or test code without pulling UI along with it.
//
// Icon/colour resolution for capability questions stays keyed by axis name
// in MatchmakerClient.tsx's own AXIS_ICONS/AXIS_COLORS maps.

export type AxisName = "Stamina" | "Power" | "Strength" | "Agility" | "Water" | "Altitude" | "Focus" | "Nerve";

export interface CapabilityOption {
  v: "A" | "B" | "C" | "D" | "E";
  l: string;
}

export interface CapabilityQuestion {
  key: string;
  axis: AxisName;
  question: string;
  hint?: string;
  options: CapabilityOption[];
  /** Only the altitude question — renders the evacuation safety checkbox beneath its options. */
  hasSafetyFlag?: boolean;
}

// 12 questions — 2 each for stamina/power/strength/agility, 1 each for
// water/altitude/focus/nerve. Answerable by beginners and veterans alike;
// adventure-sport examples are given as context (the "hint" line), not a
// precondition for answering.
export const CAPABILITY_QUESTIONS: CapabilityQuestion[] = [
  {
    key: "stamina-1",
    axis: "Stamina",
    question: "How long can you keep moving continuously (walking, jogging, cycling) before you need a proper rest — not just a water break?",
    hint: "e.g., a full trekking day at altitude, or a long stretch of the Manali–Leh motorcycle ride.",
    options: [
      { v: "A", l: "Under 1 hour" },
      { v: "B", l: "1–3 hours" },
      { v: "C", l: "3–5 hours" },
      { v: "D", l: "5–8 hours" },
      { v: "E", l: "8+ hours" },
    ],
  },
  {
    key: "stamina-2",
    axis: "Stamina",
    question: "How many physically demanding days in a row could you handle without needing a rest day in between?",
    hint: "e.g., a multi-day trek, a multi-day cycling tour, or consecutive days of scuba diving with early starts.",
    options: [
      { v: "A", l: "Just 1 — I'd need a full rest day after" },
      { v: "B", l: "2 days in a row" },
      { v: "C", l: "3–4 days in a row" },
      { v: "D", l: "5–6 days in a row" },
      { v: "E", l: "6+ days in a row, without losing energy" },
    ],
  },
  {
    key: "power-1",
    axis: "Power",
    question: "Can you make a sudden, forceful movement — like a quick jump, sprint, or a hard push — comfortably and without hesitation?",
    hint: "e.g., leaping across a gap while rock climbing, or a burst of pedaling to clear an obstacle on a mountain bike.",
    options: [
      { v: "A", l: "No, I'd avoid it if possible" },
      { v: "B", l: "I could, but slowly and hesitantly" },
      { v: "C", l: "Yes, with noticeable effort" },
      { v: "D", l: "Yes, quickly and confidently" },
      { v: "E", l: "Yes, easily — this comes naturally to me" },
    ],
  },
  {
    key: "power-2",
    axis: "Power",
    question: "How well can you repeat several forceful movements in a row, with only seconds to recover between each?",
    hint: "e.g., a series of hard paddle strokes through river rapids, or quick pole pushes navigating moguls while skiing.",
    options: [
      { v: "A", l: "I need minutes of rest between each one" },
      { v: "B", l: "I can do one well, then I fade fast" },
      { v: "C", l: "I can string together 2–3 before slowing down" },
      { v: "D", l: "I can sustain a longer sequence without much drop-off" },
      { v: "E", l: "Barely tires me — I recover almost instantly" },
    ],
  },
  {
    key: "strength-1",
    axis: "Strength",
    question: "What's the heaviest load you've carried comfortably (on your back or in your hands) for several hours?",
    hint: "e.g., a loaded trekking backpack, or diving gear and tanks carried to a dive site.",
    options: [
      { v: "A", l: "Never carried a real load for more than an hour" },
      { v: "B", l: "Under 5kg" },
      { v: "C", l: "5–10kg" },
      { v: "D", l: "10–15kg" },
      { v: "E", l: "15kg+" },
    ],
  },
  {
    key: "strength-2",
    axis: "Strength",
    question: "How long can you hold a firm grip or a braced position — like hanging on or holding your ground — before your strength gives out?",
    hint: "e.g., gripping a fixed rope on a via ferrata, holding a climbing hold, or bracing against current on a river crossing.",
    options: [
      { v: "A", l: "A few seconds at most" },
      { v: "B", l: "10–20 seconds" },
      { v: "C", l: "20–40 seconds" },
      { v: "D", l: "40–60 seconds" },
      { v: "E", l: "60+ seconds, comfortably" },
    ],
  },
  {
    key: "agility-1",
    axis: "Agility",
    question: "On uneven or unstable ground, how confident is your footing and balance?",
    hint: "e.g., loose scree on a mountain trail, a rocky riverbed while kayaking to shore, or a boulder field.",
    options: [
      { v: "A", l: "I need support or avoid it entirely" },
      { v: "B", l: "I go very slowly, using my hands to balance" },
      { v: "C", l: "Cautious but steady on my own" },
      { v: "D", l: "Confident, without really thinking about it" },
      { v: "E", l: "Comfortable moving quickly even on tricky ground" },
    ],
  },
  {
    key: "agility-2",
    axis: "Agility",
    question: "How's your balance carrying weight on your back while crossing something narrow?",
    hint: "e.g., a log bridge on a trek, stepping stones on a river crossing, or a narrow ridge line, with a backpack on.",
    options: [
      { v: "A", l: "I'd need to crawl or find another way around" },
      { v: "B", l: "Very slowly, stopping often to steady myself" },
      { v: "C", l: "Steady, at a careful pace" },
      { v: "D", l: "Confident, at a normal pace" },
      { v: "E", l: "Quick and easy, even loaded" },
    ],
  },
  {
    key: "water-1",
    axis: "Water",
    question: "How far and how confidently can you swim in open water (not a pool)?",
    hint: "e.g., relevant for river rafting, sea kayaking, scuba diving, or island-hopping adventures.",
    options: [
      { v: "A", l: "I can't swim" },
      { v: "B", l: "I can swim in a pool but I'm not confident in open water" },
      { v: "C", l: "Up to 100m in open water" },
      { v: "D", l: "200m+ in open water" },
      { v: "E", l: "200m+, and comfortable in currents or waves" },
    ],
  },
  {
    key: "altitude-1",
    axis: "Altitude",
    question: "What's the highest altitude you've spent a night at, and how did your body handle it?",
    hint: "e.g., relevant for Himalayan treks, high mountain passes on a motorcycle expedition, or high-altitude paragliding launch sites.",
    hasSafetyFlag: true,
    options: [
      { v: "A", l: "Never been above 2,000m" },
      { v: "B", l: "2,000–3,500m — no issues" },
      { v: "C", l: "3,500–4,500m — mild headache or breathlessness that passed" },
      { v: "D", l: "4,500–5,500m — handled it well" },
      { v: "E", l: "5,500m+ — handled it well" },
    ],
  },
  {
    key: "focus-1",
    axis: "Focus",
    question: "When you need to track several things at once — your footing, your surroundings, and instructions from someone else — how well do you manage without getting overwhelmed?",
    hint: "e.g., managing rope, hand-holds, and a partner's calls while climbing, or reading the water while paddling through a rapid.",
    options: [
      { v: "A", l: "I get overwhelmed and need to slow down or stop" },
      { v: "B", l: "I can manage two things, but a third throws me off" },
      { v: "C", l: "I can juggle a few things with some effort" },
      { v: "D", l: "I handle multiple demands comfortably" },
      { v: "E", l: "I stay sharp and calm no matter how much is happening at once" },
    ],
  },
  {
    key: "nerve-1",
    axis: "Nerve",
    question: "How do you react to heights, exposure, or situations where a mistake would matter — even if you're not actually in danger?",
    hint: "e.g., standing at a cliff edge, crossing a high ropeway, or a narrow mountain pass on a bike.",
    options: [
      { v: "A", l: "I freeze or need to turn back" },
      { v: "B", l: "I feel strong fear but can push through with support" },
      { v: "C", l: "I feel nervous but can manage on my own" },
      { v: "D", l: "I feel a rush but stay in control" },
      { v: "E", l: "It doesn't faze me — I stay calm and clear-headed" },
    ],
  },
];

// ─── Decay / rustiness questions ───────────────────────────────────────────
// Exactly 2, mandatory (no skip — nothing sensitive about "when did you last
// exercise"). NOT scored as their own ACE axis: the worse of the two tiers
// becomes a multiplier applied only to stamina/power/strength/agility.

export interface DecayOption {
  v: "A" | "B" | "C" | "D" | "E";
  l: string;
  /** 1 = worst/most decayed, 5 = best/freshest. */
  tier: 1 | 2 | 3 | 4 | 5;
}

export interface DecayQuestion {
  key: string;
  title: string;
  question: string;
  options: DecayOption[];
}

export const DECAY_QUESTIONS: DecayQuestion[] = [
  {
    key: "decay-recency",
    title: "Recency of Activity",
    question: "When did you last do something physically demanding at the level you described in your answers above (a long trek, a multi-day trip, a hard workout, etc.)?",
    options: [
      { v: "A", l: "Within the last month", tier: 5 },
      { v: "B", l: "1–3 months ago", tier: 4 },
      { v: "C", l: "3–6 months ago", tier: 3 },
      { v: "D", l: "6–12 months ago", tier: 2 },
      { v: "E", l: "Over a year ago / can't recall", tier: 1 },
    ],
  },
  {
    key: "decay-activity",
    title: "Current Activity Level",
    question: "How physically active are you right now, in a typical week?",
    options: [
      { v: "A", l: "Mostly sedentary", tier: 1 },
      { v: "B", l: "Light activity (occasional walks, light chores)", tier: 2 },
      { v: "C", l: "Moderate — active 1–2 times/week", tier: 3 },
      { v: "D", l: "Regularly active — 3–4 times/week", tier: 4 },
      { v: "E", l: "Very active — daily or near-daily training/sport", tier: 5 },
    ],
  },
];

// ─── Medical questions ──────────────────────────────────────────────────────
// 7 questions, each individually skippable. These NEVER feed into ACE
// scoring (see src/lib/matchmakerScoring.ts, which has no parameter through
// which these answers could reach it) — they only ever produce advisory
// flags, interpreted per-adventure by src/lib/medicalCautions.ts.

export interface MedicalOption {
  v: string;
  l: string;
}

export interface MedicalQuestion {
  key: string;
  title: string;
  question: string;
  options: MedicalOption[];
  /** Only the joint/injury question — shows an optional free-text field when answered "yes". */
  hasFreeText?: boolean;
  freeTextPrompt?: string;
}

export const MEDICAL_QUESTIONS: MedicalQuestion[] = [
  {
    key: "med-cardio",
    title: "Cardiovascular & Respiratory",
    question: "Do you have any heart condition, high blood pressure, or respiratory condition (e.g., asthma) that a doctor has told you to manage during physical exertion?",
    options: [{ v: "no", l: "No" }, { v: "yes", l: "Yes" }],
  },
  {
    key: "med-joint",
    title: "Joint, Bone & Recent Injury",
    question: "Do you have any joint, back, or bone condition, or a recent (within 12 months) injury or surgery, that could be aggravated by sustained physical activity or carrying weight?",
    options: [{ v: "no", l: "No" }, { v: "yes", l: "Yes" }],
    hasFreeText: true,
    freeTextPrompt: "Tell us more (optional) — helps us flag unsuitable terrain.",
  },
  {
    key: "med-ongoing",
    title: "Ongoing Medical Needs",
    question: "Do you have a condition that requires you to carry supplies, monitor yourself regularly, or have access to medical care during a trip (e.g., insulin, an EpiPen, seizure risk)? This matters most for multi-day trips in remote areas, away from hospitals or pharmacies.",
    options: [{ v: "no", l: "No" }, { v: "yes", l: "Yes" }],
  },
  {
    key: "med-medication",
    title: "Medication Side Effects",
    question: "Are you currently taking any medication with side effects like dizziness, drowsiness, or a lowered heart rate response — things that could affect your balance or reaction time during physical activity?",
    options: [{ v: "no", l: "No" }, { v: "yes", l: "Yes" }],
  },
  {
    key: "med-pregnancy",
    title: "Pregnancy",
    question: "Are you currently pregnant?",
    options: [
      { v: "no", l: "No" },
      { v: "yes", l: "Yes" },
      { v: "prefer_not_to_say", l: "Prefer not to say" },
    ],
  },
  {
    key: "med-smoking",
    title: "Smoking",
    question: "Do you currently smoke (cigarettes, vapes, or similar)?",
    options: [
      { v: "1", l: "No, never smoked" },
      { v: "2", l: "No, but I used to" },
      { v: "3", l: "Occasionally" },
      { v: "4", l: "Regularly, less than a pack a week" },
      { v: "5", l: "Regularly, a pack a week or more" },
    ],
  },
  {
    key: "med-alcohol",
    title: "Alcohol",
    question: "How often do you consume alcohol?",
    options: [
      { v: "1", l: "Never" },
      { v: "2", l: "Rarely (special occasions only)" },
      { v: "3", l: "Occasionally (a few times a month)" },
      { v: "4", l: "Regularly (weekly)" },
      { v: "5", l: "Frequently (several times a week or more)" },
    ],
  },
];

export interface MedicalFlags {
  version: 1;
  /** ISO timestamp — when this block was completed or skipped. */
  answeredAt: string;
  cardioRespiratory?: boolean;
  jointInjury?: boolean;
  /** Free text, stored verbatim — never parsed or scored. */
  jointInjuryNote?: string;
  ongoingMedicalNeeds?: boolean;
  medicationEffects?: boolean;
  pregnancy?: "no" | "yes" | "prefer_not_to_say";
  /** 1 = never smoked, 5 = heaviest — question-option position only, never an ACE input. */
  smokingTier?: 1 | 2 | 3 | 4 | 5;
  /** 1 = never drinks, 5 = most frequent — same caveat as smokingTier. */
  alcoholTier?: 1 | 2 | 3 | 4 | 5;
  /** True if the user used "skip remaining health questions" before answering any of them. */
  skippedAll?: boolean;
}

/** Interprets raw medical-question answers into MedicalFlags. Never touches ACE. */
export function buildMedicalFlags(answers: Partial<Record<string, string>>, jointNote?: string): MedicalFlags {
  const yesNo = (key: string): boolean | undefined =>
    answers[key] === "yes" ? true : answers[key] === "no" ? false : undefined;
  const tier = (key: string): 1 | 2 | 3 | 4 | 5 | undefined => {
    const raw = answers[key];
    return raw ? (Number(raw) as 1 | 2 | 3 | 4 | 5) : undefined;
  };
  const anyAnswered = MEDICAL_QUESTIONS.some((q) => answers[q.key] !== undefined);

  return {
    version: 1,
    answeredAt: new Date().toISOString(),
    cardioRespiratory: yesNo("med-cardio"),
    jointInjury: yesNo("med-joint"),
    jointInjuryNote: jointNote?.trim() || undefined,
    ongoingMedicalNeeds: yesNo("med-ongoing"),
    medicationEffects: yesNo("med-medication"),
    pregnancy: (answers["med-pregnancy"] as MedicalFlags["pregnancy"]) ?? undefined,
    smokingTier: tier("med-smoking"),
    alcoholTier: tier("med-alcohol"),
    skippedAll: !anyAnswered,
  };
}
