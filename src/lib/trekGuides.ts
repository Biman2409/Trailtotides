// Trek guides: one deep guide per trek and peak, at /adventurepedia/treks/<slug>.
// Most of a guide is built from data the site already keeps (lib/data.ts and the mapped
// trails), so it always agrees with the trek's own page. What isn't anywhere else (how to get
// there, permits) lives here. Travel times are approximate and roads change: guides say so.

import { adventures, type Adventure, type Month } from "./data";
import { getTrail } from "./trails";
import type { Trail } from "./trails/shared";
import type { SearchEntry } from "./adventurepedia";

export const TREK_TYPES = ["Trekking", "Mountaineering"] as const;
export const trekAdventures = () => adventures.filter((a) => (TREK_TYPES as readonly string[]).includes(a.type));
export const trekGuideHref = (slug: string) => `/adventurepedia/treks/${slug}`;

// ── Getting there ────────────────────────────────────────────────────────────

export interface Access {
  /** The town most groups meet in, or are picked up from */
  gateway: string;
  air: string;
  rail: string;
  /** Where the walking starts, when the trek's data doesn't already say */
  roadhead?: string;
  /** From the gateway to the roadhead */
  drive?: string;
  note?: string;
}

const DEHRADUN = { air: "Dehradun (Jolly Grant)", rail: "Dehradun" };
const RISHIKESH = { air: "Dehradun (Jolly Grant)", rail: "Rishikesh or Haridwar" };
const KATHGODAM = { air: "Pantnagar, or Delhi then train", rail: "Kathgodam" };
const MANALI = { air: "Kullu (Bhuntar)", rail: "Chandigarh, then a 9 to 10 hour bus" };
const SRINAGAR = { air: "Srinagar", rail: "Srinagar or Jammu" };
const BAGDOGRA = { air: "Bagdogra", rail: "New Jalpaiguri (NJP)" };
const LUKLA = { air: "Kathmandu, then a flight to Lukla", rail: "No railway; Indian trekkers often fly or drive to Kathmandu" };
const POKHARA = { air: "Kathmandu, then a flight or 6 to 8 hour drive to Pokhara", rail: "No railway; Gorakhpur is the nearest Indian railhead for the border" };

export const ACCESS: Record<string, Access> = {
  // Uttarakhand: Garhwal west (Sankri, Uttarkashi, Gangotri, Yamunotri)
  "kedarkantha-trek": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Sankri, about 200 km and 8 to 10 hours" },
  "har-ki-dun": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Sankri, about 200 km and 8 to 10 hours, then a short drive to Taluka" },
  "phulara-ridge": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Sankri, about 200 km and 8 to 10 hours" },
  "bali-pass": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Sankri, 8 to 10 hours. The trek exits at Janki Chatti near Yamunotri, about 7 hours back to Dehradun" },
  "rupin-pass": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Dhaula, 8 to 9 hours. You finish at Sangla in Kinnaur, about 8 to 9 hours from Shimla" },
  "dayara-bugyal": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Raithal via Uttarkashi, about 180 km and 7 to 8 hours" },
  "dodital-darwa-pass": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Uttarkashi, about 6 hours, then an hour to Sangam Chatti" },
  "gulabi-kantha": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Hanuman Chatti via Barkot, about 6 to 7 hours" },
  "gaumukh-tapovan": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Gangotri, about 240 km and 9 to 10 hours, usually with a night in Uttarkashi" },
  "kedartal": { gateway: "Dehradun", ...DEHRADUN, drive: "Dehradun to Gangotri, about 240 km and 9 to 10 hours, usually with a night in Uttarkashi" },
  // Garhwal east (Chamoli, Joshimath, Badrinath)
  "kuari-pass": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh to Joshimath, about 250 km and 10 to 11 hours" },
  "pangarchulla-peak": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh to Joshimath, about 250 km and 10 to 11 hours" },
  "bagini-glacier": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh to Joshimath, 10 to 11 hours, then about 2 hours to the roadhead at Jumma" },
  "valley-of-flowers": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh to Govindghat, about 270 km and 10 to 12 hours" },
  "satopanth-lake": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh to Badrinath, about 300 km and 11 to 12 hours. Mana village is 3 km beyond" },
  "deoriatal-chandrashila": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh or Haridwar to Sari village near Ukhimath, about 200 km and 8 to 9 hours" },
  "panch-kedar": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh to Guptkashi, about 7 to 8 hours" },
  "panwali-kantha": { gateway: "Rishikesh", ...RISHIKESH, drive: "Rishikesh to Ghuttu, about 180 km and 7 to 8 hours" },
  "surya-top": { gateway: "Rishikesh", ...RISHIKESH, note: "The roadhead is in Chamoli district, a full day's drive from Rishikesh. Your operator confirms the pickup point" },
  // Kumaon and Chamoli via Kathgodam
  "ali-bedni-bugyal": { gateway: "Kathgodam", ...KATHGODAM, drive: "Kathgodam to Lohajung, about 10 to 11 hours" },
  "brahmatal": { gateway: "Kathgodam", ...KATHGODAM, drive: "Kathgodam to Lohajung, about 10 to 11 hours" },
  "roopkund": { gateway: "Kathgodam", ...KATHGODAM, drive: "Kathgodam to Lohajung, about 10 to 11 hours" },
  "pindari-glacier": { gateway: "Kathgodam", ...KATHGODAM, drive: "Kathgodam to the roadhead beyond Bageshwar, about 9 to 10 hours" },
  "ranthan-kharak": { gateway: "Kathgodam", ...KATHGODAM, note: "The roadhead is a remote Kumaon village, a long day's drive from Kathgodam. Your operator confirms the pickup point" },
  // Himachal Pradesh
  "beas-kund": { gateway: "Manali", ...MANALI, drive: "Manali to Solang, about 30 minutes" },
  "bhrigu-lake": { gateway: "Manali", ...MANALI, drive: "Manali to Gulaba, about 45 minutes" },
  "hampta-pass": { gateway: "Manali", ...MANALI, drive: "Manali to Jobra, about 1 hour. The trek ends at Chatru in Lahaul, about 4 hours back to Manali" },
  "chandrakhani-pass": { gateway: "Manali", ...MANALI, drive: "Manali to Rumsu near Naggar, about 1 hour" },
  "sar-pass": { gateway: "Kasol", air: "Kullu (Bhuntar), about 1 hour away", rail: "Chandigarh, then an overnight bus to Bhuntar", drive: "Bhuntar to Kasol, about 1 hour" },
  "pin-parvati-pass": { gateway: "Kasol", air: "Kullu (Bhuntar)", rail: "Chandigarh, then an overnight bus to Bhuntar", drive: "Bhuntar to Barsheni, about 2 hours. The trek exits at Mudh in Spiti, a long drive back via Kaza" },
  "buran-ghati": { gateway: "Shimla", air: "Shimla, or Chandigarh", rail: "Shimla (toy train from Kalka) or Chandigarh", drive: "Shimla to Janglik, about 7 to 8 hours" },
  "pin-bhaba-pass": { gateway: "Shimla", air: "Shimla, or Chandigarh", rail: "Shimla or Chandigarh", drive: "Shimla to Kafnu in Kinnaur, about 8 to 9 hours. The trek exits at Mudh in Spiti" },
  "kareri-lake": { gateway: "Dharamshala", air: "Kangra (Gaggal), about 30 minutes from Dharamshala", rail: "Pathankot, about 3 hours away", drive: "Dharamshala to Ghera, about 1 hour" },
  // Jammu & Kashmir, Ladakh
  "kashmir-great-lakes": { gateway: "Srinagar", ...SRINAGAR, drive: "Srinagar to Sonamarg, about 3 hours. The trek ends at Naranag, about 2 hours from Srinagar" },
  "tarsar-marsar-trek": { gateway: "Srinagar", ...SRINAGAR, drive: "Srinagar to Aru via Pahalgam, about 3 to 4 hours" },
  "doodhpathri": { gateway: "Srinagar", ...SRINAGAR, drive: "Srinagar to Doodhpathri, about 2 to 3 hours" },
  "markha-valley": { gateway: "Leh", air: "Leh", rail: "No railway; flying in is usual", drive: "Leh to Chilling, about 2 hours", note: "Flying into Leh at 3,500 m means two full days of rest before you start" },
  // East
  "goechala": { gateway: "Yuksom", ...BAGDOGRA, drive: "Bagdogra or NJP to Yuksom, about 150 km and 6 to 7 hours" },
  "bajre-dara": { gateway: "Yuksom", ...BAGDOGRA, drive: "Bagdogra or NJP to Yuksom, about 6 to 7 hours" },
  "sandakphu-phalut-trek": { gateway: "Darjeeling", ...BAGDOGRA, drive: "Bagdogra or NJP to Manebhanjan, about 3 to 4 hours" },
  // Nepal
  "everest-base-camp": { gateway: "Kathmandu", ...LUKLA, note: "In busy seasons Lukla flights often leave from Ramechhap, a 4 to 5 hour drive from Kathmandu. Weather delays of a day or two are common: plan buffer days" },
  "gokyo-lakes": { gateway: "Kathmandu", ...LUKLA, note: "Lukla flights are weather-dependent and sometimes leave from Ramechhap. Plan buffer days" },
  "lobuche-peak": { gateway: "Kathmandu", ...LUKLA, note: "Lukla flights are weather-dependent and sometimes leave from Ramechhap. Plan buffer days" },
  "mera-peak": { gateway: "Kathmandu", ...LUKLA, note: "Lukla flights are weather-dependent and sometimes leave from Ramechhap. Plan buffer days" },
  "annapurna-base-camp": { gateway: "Pokhara", ...POKHARA, drive: "Pokhara to the trailhead near Nayapul, about 1 to 2 hours" },
  "khopra-danda": { gateway: "Pokhara", ...POKHARA, drive: "Pokhara to the trailhead, about 1 to 2 hours" },
  "annapurna-circuit": { gateway: "Kathmandu", air: "Kathmandu", rail: "No railway", drive: "Kathmandu to Besisahar, about 6 to 7 hours, then a jeep further up the valley" },
  "manaslu-circuit": { gateway: "Kathmandu", air: "Kathmandu", rail: "No railway", drive: "Kathmandu to Machha Khola or Soti Khola, about 8 to 9 hours on rough roads" },
};

// ── Permits ──────────────────────────────────────────────────────────────────

const STATE_PERMITS: Record<string, string> = {
  Uttarakhand: "Forest department permits for treks inside sanctuaries and national parks. Operators normally arrange them; carry original photo ID.",
  "Himachal Pradesh": "Forest or camping fees on some routes, arranged by operators. Carry original photo ID.",
  "Jammu & Kashmir": "Trekkers register with the local police and forest department at the start, and the Army at checkposts on some routes. Carry original photo ID and several photocopies.",
  Ladakh: "Ladakh's environment and wildlife fees, and Hemis National Park fees on park routes. Carry original photo ID.",
  Sikkim: "Treks are permitted through registered Sikkim agencies, which arrange the permits. Foreign nationals need additional area permits.",
  "West Bengal": "Singalila National Park entry, arranged at the start in Manebhanjan. Carry original photo ID.",
  Nepal: "National park or conservation area permits, plus any trekker registration. Indian citizens need a passport or voter ID; no visa.",
};

const TREK_PERMITS: Record<string, string> = {
  "gaumukh-tapovan": "Gangotri National Park limits how many people can enter each day. Book the permit early in peak season.",
  "kedartal": "Inside Gangotri National Park, which limits daily entries. Book early.",
  "valley-of-flowers": "Valley of Flowers National Park charges an entry fee at Ghangaria, and the valley is day-use only: no camping inside.",
  "goechala": "Inside Khangchendzonga National Park. Permits are only issued through registered agencies.",
  "everest-base-camp": "Sagarmatha National Park permit and the Khumbu local area fee.",
  "gokyo-lakes": "Sagarmatha National Park permit and the Khumbu local area fee.",
  "lobuche-peak": "Sagarmatha National Park permit, the Khumbu local area fee, and a climbing permit for Lobuche East.",
  "mera-peak": "Makalu Barun National Park permit, the local area fee, and a climbing permit for Mera Peak.",
  "annapurna-base-camp": "Annapurna Conservation Area Permit (ACAP).",
  "annapurna-circuit": "Annapurna Conservation Area Permit (ACAP).",
  "khopra-danda": "Annapurna Conservation Area Permit (ACAP).",
  "manaslu-circuit": "Manaslu is a restricted area: a special permit, a licensed guide and at least two trekkers are required, plus the Manaslu and Annapurna conservation area permits.",
  "markha-valley": "Hemis National Park fees are collected on the trail.",
};

export function permitNotes(a: Adventure): string[] {
  const state = Object.keys(STATE_PERMITS).find((s) => a.state.includes(s));
  return [TREK_PERMITS[a.slug], state ? STATE_PERMITS[state] : undefined].filter((x): x is string => !!x);
}

// ── Calculated sections ──────────────────────────────────────────────────────

export const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function altitudeM(a: Adventure) {
  return a.altitude ? parseFloat(a.altitude.replace(/[^0-9.]/g, "")) || 0 : 0;
}

/** What the months a trek runs in mean for the person going */
export function seasonNotes(a: Adventure): string[] {
  const m = new Set(a.bestMonths);
  const notes: string[] = [];
  if (m.has("Dec") || m.has("Jan") || m.has("Feb")) notes.push("**Winter:** expect snow on the trail and camps well below freezing at night, often -10°C or colder near the top. Days are short and summit pushes start in the dark.");
  if (m.has("Mar") || m.has("Apr") || m.has("May")) notes.push("**Spring:** longer days and rhododendrons lower down. Snow can linger on high ground into May, and afternoons often bring cloud or a shower.");
  if (m.has("Jun")) notes.push("**June:** warm days and snowmelt streams running high in the afternoons. The monsoon can arrive in the second half of the month.");
  if (m.has("Jul") || m.has("Aug")) notes.push(/Ladakh|Kashmir|Spiti/.test(a.state) || a.slug === "markha-valley" || a.slug === "pin-parvati-pass"
    ? "**July and August:** the best time for this region, which sits largely beyond the monsoon's reach. Expect sunny days, cold nights and the odd shower."
    : "**Monsoon (July and August):** rain, cloud, leeches lower down and landslides on the drive in. Wildflowers are at their best. Pack serious rain gear and add a buffer day.");
  if (m.has("Sep") || m.has("Oct") || m.has("Nov")) notes.push("**Autumn:** the clearest skies and steadiest weather of the year. Nights get cold quickly from October, and early snow is possible in November.");
  return notes;
}

/** Nightly sleeping-height gains, checked against the 300 to 500 m rule above 3,000 m */
export function acclimatisation(trail: Trail) {
  const nights = trail.days.filter((d) => d.sleepEle != null);
  const startEle = trail.stops[0]?.ele ?? nights[0]?.sleepEle ?? 0;
  let prev = startEle;
  const jumps: { day: number; from: number; to: number; gain: number; place: string }[] = [];
  for (const d of nights) {
    const ele = d.sleepEle!;
    const gain = ele - prev;
    if (ele > 3000 && gain > 500) jumps.push({ day: d.day, from: prev, to: ele, gain, place: d.to ?? d.from });
    prev = ele;
  }
  const highestSleep = Math.max(...nights.map((d) => d.sleepEle!), startEle);
  const restDays = trail.days.filter((d) => d.kind === "rest").length;
  return { startEle, highestSleep, restDays, jumps, nights: nights.length };
}

/** Elevation along the trail, thinned to at most n points: [km from start, metres] */
export function profile(trail: Trail, n = 120): [number, number][] {
  const pts: [number, number][] = [];
  let km = 0;
  for (let i = 0; i < trail.line.length; i++) {
    if (i) {
      const [la1, lo1] = trail.line[i - 1], [la2, lo2] = trail.line[i];
      const dLa = (la2 - la1) * 111.32, dLo = (lo2 - lo1) * 111.32 * Math.cos((la1 * Math.PI) / 180);
      km += Math.sqrt(dLa * dLa + dLo * dLo);
    }
    pts.push([km, trail.line[i][2]]);
  }
  const step = Math.max(1, Math.ceil(pts.length / n));
  // Thinning must never drop the highest point: the chart labels it
  const top = pts.reduce((m, p, i) => (p[1] > pts[m][1] ? i : m), 0);
  return pts.filter((_, i) => i % step === 0 || i === pts.length - 1 || i === top);
}

/** Season- and height-specific kit on top of the standard list */
export function packingNotes(a: Adventure): string[] {
  const alt = altitudeM(a);
  const m = new Set(a.bestMonths);
  const out: string[] = [];
  if (m.has("Dec") || m.has("Jan") || m.has("Feb")) out.push("A down jacket rated to -10°C or lower, thermal bottoms, waterproof gloves, gaiters and microspikes (often provided)");
  if (m.has("Jul") || m.has("Aug")) out.push("A proper rain jacket and trousers or a poncho, a pack cover and liner, and quick-dry layers");
  if (alt >= 4500) out.push("Warm layers for a high camp well below freezing, even in summer, and glacier glasses for snow");
  else if (alt >= 3500) out.push("A warm down or synthetic jacket for nights near or below freezing");
  if (a.type === "Mountaineering") out.push("Technical kit: mountaineering boots, crampons, harness, ice axe and helmet. Check what the operator rents");
  if (/glacier|pass|ghati|top|peak|kantha|tal/i.test(a.name) && alt >= 4000) out.push("Sunglasses rated UV400, worn all day on snow, and SPF 50 for your face and lips");
  out.push("Broken-in trekking shoes with ankle support, trekking poles, and a 25 to 35 litre daypack with a rain cover");
  return out;
}

export function priceRange(a: Adventure) {
  const nums = a.operators.map((o) => parseInt(o.priceFrom.replace(/[^0-9]/g, ""), 10)).filter((n) => n > 0);
  if (!nums.length) return null;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const lo = Math.min(...nums), hi = Math.max(...nums);
  return { lo, hi, text: lo === hi ? fmt(lo) : `${fmt(lo)} to ${fmt(hi)}`, operators: a.operators.length, verified: a.operators.filter((o) => o.verified).length };
}

export const splitList = (s: string) => s.split(/\s*·\s*/).map((x) => x.trim()).filter(Boolean);

/** Search entries for every trek guide: the trek, travel, days, paperwork, cost and season */
export function trekSearchIndex(): SearchEntry[] {
  return trekAdventures().flatMap((a) => {
    const trail = getTrail(a.slug);
    const access = ACCESS[a.slug];
    const base = { href: trekGuideHref(a.slug), guide: `${a.name} guide`, summary: a.tagline, icon: "trail" as const, topic: "treks" as const };
    const plainDesc = a.description.replace(/\*\*/g, "");
    const price = priceRange(a);
    return [
      { ...base, text: `${a.name}. ${a.state}. ${a.type}. ${a.difficulty}. ${a.altitude ?? ""}. Best ${a.bestSeason}. ${a.tags.join(" ")}. ${plainDesc}` },
      ...(access ? [{ ...base, section: "Getting there", sectionId: "getting-there", text: [a.baseCamp, a.startingPoint, access.gateway, access.air, access.rail, access.drive, access.note].filter(Boolean).join(". ") }] : []),
      ...(trail ? [{ ...base, section: "Day by day", sectionId: "itinerary", text: "Itinerary, day by day. " + trail.days.map((d) => `Day ${d.day}: ${d.from}${d.to ? ` to ${d.to}` : ""}. ${d.note}`).join(" · ") }] : []),
      { ...base, section: "Permits and paperwork", sectionId: "permits", text: permitNotes(a).join(" ") },
      ...(price ? [{ ...base, section: "Booking and cost", sectionId: "booking", text: `Cost and price: ${price.text} per person from ${price.operators} operators: ${a.operators.map((o) => o.name).join(", ")}.` }] : []),
      { ...base, section: "When to go", sectionId: "when", text: `Best season and months: ${a.bestSeason}. Best time to go. ${seasonNotes(a).join(" ").replace(/\*\*/g, "")}` },
    ];
  });
}

/** Everything a trek guide shows, gathered in one place */
export function trekGuide(slug: string) {
  const a = trekAdventures().find((x) => x.slug === slug);
  if (!a) return null;
  const trail = getTrail(slug);
  return { a, trail, access: ACCESS[slug] ?? null, alt: altitudeM(a) };
}
