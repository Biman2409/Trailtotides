// Adventurepedia's activity primers: one entry for every kind of adventure on Trail to Tides,
// live or coming soon, grouped by element as the home page groups them. /adventurepedia/activities/
// [slug] renders each; the library lists them; the general guides (operators, seasons, fitness)
// build their per-activity tables from here, so each fact lives in one place.
//
// Keep it practical and India-first. Where rules or operators change (permits, closures, who runs
// what), say so and point people to their operator for the current word.

import type { AceAxis } from "@/lib/ace";
import type { SearchEntry } from "@/lib/adventurepedia";

export type Element = "earth" | "water" | "snow" | "air";

export const ELEMENTS: { id: Element; label: string; blurb: string }[] = [
  { id: "earth", label: "Earth", blurb: "On foot, on wheels and on rock" },
  { id: "water", label: "Water", blurb: "Rivers, reefs and surf" },
  { id: "snow", label: "Snow", blurb: "Slopes, ice and frozen falls" },
  { id: "air", label: "Air", blurb: "Off the ground and over it" },
];

export interface Activity {
  /** The adventure type as the catalogue names it */
  type: string;
  slug: string;
  element: Element;
  /** One or two sentences: what it is */
  what: string;
  /** Where in India, best-known first */
  where: string[];
  /** When to go, in a line or two */
  season: string;
  /** Best months, for the season table (short month names) */
  months: string[];
  /** What it asks of your body, as ACE™ capabilities, most important first */
  body: AceAxis[];
  bodyNote: string;
  /** What to check before booking */
  operator: string[];
  /** How to start, for a first-timer */
  start: string;
  /** Adventurepedia guides that apply, most useful first */
  guides: string[];
}

const ALL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const months = (...m: string[]) => ALL.filter((x) => m.includes(x));

export const ACTIVITIES: Activity[] = [
  // ── Earth ──────────────────────────────────────────────────────────────────
  {
    type: "Trekking", slug: "trekking", element: "earth",
    what: "Walking for days through mountains, forests and meadows, camping or staying in villages and huts along the way.",
    where: ["Uttarakhand", "Himachal Pradesh", "Ladakh", "Kashmir", "Sikkim and Darjeeling", "the Western Ghats"],
    season: "Spring (March to June) and autumn (September to November) in most of the Himalaya; Ladakh and Spiti in summer; snow treks in winter; the Western Ghats after the monsoon.",
    months: months("Mar", "Apr", "May", "Jun", "Sep", "Oct", "Nov"),
    body: ["stamina", "altitude", "strength"],
    bodyNote: "Long days on your feet, often with a pack, and nights high enough for altitude to matter.",
    operator: [
      "Leaders trained in wilderness first aid, and a guide for every 6 to 8 trekkers",
      "An itinerary that gains height slowly, with a spare day for weather",
      "Oxygen, a first-aid kit and a plan for getting someone down fast",
      "Clean kitchens and safe drinking water",
    ],
    start: "Pick a 4 to 6 day trek that tops out below 4,000 m, in spring or autumn, with a group.",
    guides: ["altitude-sickness", "what-to-pack", "getting-fit", "choosing-a-season", "choosing-an-operator", "trail-craft", "offline-maps", "leave-no-trace"],
  },
  {
    type: "Mountaineering", slug: "mountaineering", element: "earth",
    what: "Climbing a summit on snow and ice with ropes, crampons and an ice axe, from trekking peaks to full expeditions.",
    where: ["Ladakh", "Himachal Pradesh", "Uttarakhand", "Sikkim"],
    season: "Before the monsoon (May and June) and after it (September and October).",
    months: months("May", "Jun", "Sep", "Oct"),
    body: ["altitude", "stamina", "strength", "nerve"],
    bodyNote: "Summit days start before dawn, run 10 hours or more, and go well above 5,000 m.",
    operator: [
      "A permit from the Indian Mountaineering Foundation for the peak",
      "Instructors who have done a mountaineering course, and a rope-team ratio for the summit",
      "Time to acclimatise and a fixed turnaround time on summit day",
      "Ropes, crampons and helmets checked before the climb",
    ],
    start: "Do a basic mountaineering course at a national institute (Uttarkashi, Darjeeling or Manali) before a guided trekking peak.",
    guides: ["altitude-sickness", "getting-fit", "what-to-pack", "insurance-and-emergencies", "choosing-an-operator", "permits-and-documents"],
  },
  {
    type: "Rock Climbing", slug: "rock-climbing", element: "earth",
    what: "Climbing rock faces on a rope, or short boulders with a crash pad and no rope at all.",
    where: ["Hampi (bouldering)", "Badami", "the crags around Bengaluru", "Manali", "the Sahyadris around Pune and Mumbai"],
    season: "October to February in the south and west; summer in the Himalaya.",
    months: months("Jan", "Feb", "Oct", "Nov", "Dec"),
    body: ["strength", "power", "agility", "focus"],
    bodyNote: "Grip and pulling strength, balance, and staying calm a long way off the ground.",
    operator: [
      "An instructor who can show their climbing certification",
      "Ropes, harnesses and helmets in good condition, and a helmet for everyone",
      "Top-rope climbing for beginners, with the instructor checking every knot",
    ],
    start: "Start at an indoor wall, then do a guided top-rope day outdoors.",
    guides: ["choosing-an-operator", "insurance-and-emergencies", "getting-fit"],
  },
  {
    type: "Scrambling", slug: "scrambling", element: "earth",
    what: "Climbing steep, rocky ground with your hands as well as your feet, but without ropes for most of it.",
    where: ["the Sahyadri forts and pinnacles", "Himalayan ridges and passes"],
    season: "After the monsoon and through winter in the Sahyadris; spring and autumn in the Himalaya.",
    months: months("Jan", "Feb", "Oct", "Nov", "Dec"),
    body: ["agility", "nerve", "focus"],
    bodyNote: "Sure feet and a steady head on exposed rock, where a slip would matter.",
    operator: [
      "A leader who knows the route and carries a rope for the hard steps",
      "Helmets on loose ground",
      "No scrambles on wet rock in the rain",
    ],
    start: "Begin on a guided fort scramble in the dry season, with a rope for the exposed bits.",
    guides: ["trail-craft", "choosing-an-operator", "insurance-and-emergencies"],
  },
  {
    type: "Caving", slug: "caving", element: "earth",
    what: "Exploring caves on foot, crawling and sometimes wading, by headlamp.",
    where: ["Meghalaya (home of India's longest known caves)", "Belum Caves, Andhra Pradesh", "Borra Caves, Andhra Pradesh"],
    season: "The dry months, November to March. Caves can flood fast in the monsoon.",
    months: months("Jan", "Feb", "Mar", "Nov", "Dec"),
    body: ["agility", "nerve", "focus"],
    bodyNote: "Tight squeezes, darkness and wet rock: it's more about calm than strength.",
    operator: [
      "A guide who knows the cave, and a turnaround time",
      "A helmet, a headlamp and a spare light for everyone",
      "A check on the weather before going in",
    ],
    start: "Start with a show cave or a short guided trip, before any squeezes or water.",
    guides: ["choosing-an-operator", "first-aid-and-water", "insurance-and-emergencies"],
  },
  {
    type: "Motorcycling", slug: "motorcycling", element: "earth",
    what: "Riding long mountain highways and high passes, usually in a group with a support vehicle and a mechanic.",
    where: ["Ladakh (Manali to Leh, Srinagar to Leh)", "Spiti", "Sikkim", "Arunachal Pradesh"],
    season: "June to September for Ladakh's high passes; Spiti through Kinnaur for longer; Arunachal from October to April.",
    months: months("Jun", "Jul", "Aug", "Sep"),
    body: ["stamina", "strength", "focus", "altitude"],
    bodyNote: "Long days in the saddle on rough roads, at heights where altitude sickness is real.",
    operator: [
      "Bikes serviced before the trip, and a mechanic and spares in the support vehicle",
      "A route that climbs slowly, with nights at moderate height before the high passes",
      "Inner Line Permits arranged where they're needed",
      "Riding gear: a full-face helmet, gloves, jacket and boots",
    ],
    start: "Ride a few long days at home first, then join a group trip with a support vehicle.",
    guides: ["riding-the-high-passes", "altitude-sickness", "permits-and-documents", "insurance-and-emergencies"],
  },
  {
    type: "Cycling", slug: "cycling", element: "earth",
    what: "Touring and mountain biking, from high Himalayan roads to green Ghat climbs and coastal runs.",
    where: ["Ladakh and Spiti", "the Western Ghats", "the Nilgiris", "the Konkan coast"],
    season: "Summer for the high Himalaya; October to February in the south and on the coast.",
    months: months("Jan", "Feb", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"),
    body: ["stamina", "power", "altitude"],
    bodyNote: "Hours of climbing, day after day, and thin air on the high passes.",
    operator: [
      "Well-maintained bikes in your size, with spares and a support vehicle",
      "Daily distances you can manage, and a slow climb to height",
      "Helmets for everyone",
    ],
    start: "Build up to three long rides in a row at home, then join a supported tour.",
    guides: ["riding-the-high-passes", "getting-fit", "altitude-sickness", "choosing-a-season"],
  },
  {
    type: "Jeep Safari", slug: "jeep-safari", element: "earth",
    what: "Open-jeep drives through wildlife parks, deserts and high-altitude valleys.",
    where: ["Jim Corbett", "Ranthambore", "Kanha and Bandhavgarh", "Kaziranga", "Gir", "the Thar around Jaisalmer", "Spiti and Ladakh"],
    season: "Wildlife parks from October or November to June (most core zones close in the monsoon); the desert in winter.",
    months: months("Jan", "Feb", "Mar", "Apr", "Nov", "Dec"),
    body: ["focus"],
    bodyNote: "Not much physically: early starts, dust and long hours sitting.",
    operator: [
      "Park safaris booked through the official park booking, in registered vehicles",
      "A naturalist or guide who follows the park's rules on distance from animals",
    ],
    start: "Book a morning drive in a park's tourism zone early: the popular ones sell out months ahead.",
    guides: ["choosing-a-season", "choosing-an-operator", "leave-no-trace"],
  },
  {
    type: "Urban Adventure", slug: "urban-adventure", element: "earth",
    what: "Adventure without leaving the city: heritage walks, night cycle rides, climbing walls and food trails.",
    where: ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Jaipur"],
    season: "Winter in the north; most of the year elsewhere, around the rains.",
    months: months("Jan", "Feb", "Mar", "Oct", "Nov", "Dec"),
    body: ["stamina"],
    bodyNote: "Gentle: mostly walking or easy riding.",
    operator: [
      "A local guide who knows the area well",
      "A small group",
    ],
    start: "Pick an early-morning heritage walk or night ride in your own city.",
    guides: ["choosing-an-operator"],
  },

  // ── Water ──────────────────────────────────────────────────────────────────
  {
    type: "River Rafting", slug: "river-rafting", element: "water",
    what: "Paddling an inflatable raft through rapids with a guide steering, from gentle floats to big white water.",
    where: ["Rishikesh (Ganga)", "Kolad (Kundalika)", "Dandeli (Kali)", "Coorg (Barapole)", "Ladakh (Zanskar and Indus)", "Sikkim (Teesta)"],
    season: "Rishikesh from autumn to early summer (rafting stops in the monsoon); dam-fed rivers like Kolad in the rains; Ladakh in summer.",
    months: months("Mar", "Apr", "May", "Jun", "Sep", "Oct", "Nov"),
    body: ["power", "water", "nerve"],
    bodyNote: "Hard paddling in short bursts, and staying calm if you end up in the water.",
    operator: [
      "Licensed river guides, and a safety kayaker on bigger rapids",
      "Life jackets and helmets that fit, and a proper safety briefing",
      "A rapid grade that matches your group",
    ],
    start: "Start with a grade II to III stretch, like a short Rishikesh run, before the bigger rapids.",
    guides: ["river-rafting", "choosing-an-operator", "insurance-and-emergencies", "choosing-a-season"],
  },
  {
    type: "Kayaking", slug: "kayaking", element: "water",
    what: "Paddling your own kayak, on white-water rivers or calm sea, lakes and backwaters.",
    where: ["Rishikesh", "the rivers of Kerala's Malabar", "Goa", "the Andamans (sea kayaking)", "Kerala's backwaters"],
    season: "October to May on most rivers and coasts; some Ghat rivers run best in the rains.",
    months: months("Jan", "Feb", "Mar", "Apr", "May", "Oct", "Nov", "Dec"),
    body: ["power", "water", "focus"],
    bodyNote: "Steady paddling, balance, and being comfortable upside down in white water.",
    operator: [
      "Certified instructors, and a roll or wet-exit lesson before moving water",
      "Spray decks, life jackets and helmets for rivers",
      "A safety boat or second kayaker on the water",
    ],
    start: "Begin on flat water or the sea with an instructor before any white water.",
    guides: ["river-rafting", "choosing-an-operator", "insurance-and-emergencies"],
  },
  {
    type: "Diving", slug: "diving", element: "water",
    what: "Scuba diving on reefs and wrecks, from a first try-dive to certification courses.",
    where: ["the Andamans (Swaraj Dweep and Shaheed Dweep)", "Lakshadweep", "Netrani Island, Karnataka", "Goa", "Puducherry"],
    season: "Roughly November to May; the monsoon closes most sites.",
    months: months("Jan", "Feb", "Mar", "Apr", "May", "Nov", "Dec"),
    body: ["water", "focus", "nerve"],
    bodyNote: "Calm in the water more than fitness, and a medical form to fill in first.",
    operator: [
      "A centre affiliated with an agency like PADI or SSI, with certified instructors",
      "Small groups underwater, and kit that's serviced",
      "A medical questionnaire before you dive",
    ],
    start: "Do a try-dive (Discover Scuba) first, then a beginner course like Open Water. Don't fly for about a day after diving.",
    guides: ["choosing-an-operator", "insurance-and-emergencies", "permits-and-documents"],
  },
  {
    type: "Surfing", slug: "surfing", element: "water",
    what: "Riding waves on a board, learning on soft-tops in the white water at a surf school.",
    where: ["Kovalam and Varkala, Kerala", "Mulki, Karnataka", "Goa", "Puducherry and Mahabalipuram"],
    season: "October to May for learners; the monsoon brings bigger, messier swell.",
    months: months("Jan", "Feb", "Mar", "Apr", "May", "Oct", "Nov", "Dec"),
    body: ["power", "water", "agility"],
    bodyNote: "Paddling, popping up and balance, and being happy in the waves.",
    operator: [
      "A surf school with a small ratio of learners to instructors",
      "Soft-top boards and a leash for beginners",
      "Lessons on a beach suited to learners",
    ],
    start: "Take a two or three day beginner course at a surf school.",
    guides: ["choosing-an-operator", "insurance-and-emergencies"],
  },
  {
    type: "Snorkelling", slug: "snorkelling", element: "water",
    what: "Floating on the surface with a mask and snorkel over coral reefs.",
    where: ["the Andamans", "Lakshadweep", "Netrani Island", "Grande Island, Goa", "Tarkarli and Malvan, Maharashtra"],
    season: "Roughly November to May, when the sea is calm and clear.",
    months: months("Jan", "Feb", "Mar", "Apr", "May", "Nov", "Dec"),
    body: ["water"],
    bodyNote: "Easy for anyone comfortable in water; a life jacket helps weak swimmers.",
    operator: [
      "Life jackets offered, and a guide in the water",
      "Briefing on not touching or standing on coral",
    ],
    start: "Go on a guided reef trip with a life jacket.",
    guides: ["choosing-an-operator", "leave-no-trace"],
  },

  // ── Snow ───────────────────────────────────────────────────────────────────
  {
    type: "Skiing", slug: "skiing", element: "snow",
    what: "Downhill skiing on India's few lifts and slopes, with lessons for beginners and off-piste for experts.",
    where: ["Gulmarg, Kashmir", "Auli, Uttarakhand", "Solang, Himachal Pradesh", "Narkanda, Himachal Pradesh"],
    season: "January to March, depending on the snow.",
    months: months("Jan", "Feb", "Mar"),
    body: ["agility", "strength", "nerve"],
    bodyNote: "Leg strength and balance, and nerve on steeper slopes.",
    operator: [
      "Certified ski instructors",
      "Skis, boots and helmets that fit",
      "Avalanche training and gear (beacon, probe, shovel) for anything off-piste",
    ],
    start: "Take a week of lessons at Gulmarg or Auli.",
    guides: ["what-to-pack", "insurance-and-emergencies", "choosing-an-operator"],
  },
  {
    type: "Snowboarding", slug: "snowboarding", element: "snow",
    what: "Riding a board down the snow, learned on the same slopes as skiing.",
    where: ["Gulmarg, Kashmir", "Solang, Himachal Pradesh", "Auli, Uttarakhand"],
    season: "January to March, depending on the snow.",
    months: months("Jan", "Feb", "Mar"),
    body: ["agility", "strength", "nerve"],
    bodyNote: "Balance and a lot of falling at first: wrist guards help.",
    operator: [
      "Instructors who teach snowboarding, not only skiing",
      "Boards, boots and helmets that fit",
      "Avalanche gear and training for off-piste",
    ],
    start: "Take a few days of lessons before riding on your own.",
    guides: ["what-to-pack", "insurance-and-emergencies", "choosing-an-operator"],
  },
  {
    type: "Ice Climbing", slug: "ice-climbing", element: "snow",
    what: "Climbing frozen waterfalls with ice axes and crampons, on a rope.",
    where: ["Spiti", "Ladakh", "Kashmir"],
    season: "Mid-winter, January and February, when the falls freeze solid.",
    months: months("Jan", "Feb"),
    body: ["strength", "power", "nerve", "focus"],
    bodyNote: "Arm and calf strength, and a cool head in hard cold.",
    operator: [
      "Instructors with ice-climbing experience, on top-rope for beginners",
      "Ice axes, crampons, helmets and ropes in good condition",
      "Warm kit and a plan for the cold",
    ],
    start: "Join a winter ice-climbing course or camp.",
    guides: ["what-to-pack", "insurance-and-emergencies", "choosing-an-operator"],
  },
  {
    type: "Ice Skating", slug: "ice-skating", element: "snow",
    what: "Skating on natural outdoor rinks and frozen lakes in the hills.",
    where: ["Shimla's open-air rink", "frozen lakes in Ladakh and Kashmir"],
    season: "December to February, when it's cold enough to freeze.",
    months: months("Jan", "Feb", "Dec"),
    body: ["agility"],
    bodyNote: "Balance more than fitness.",
    operator: [
      "Skates in your size, and a rink or ice that's checked as safe",
      "A coach if you're new",
    ],
    start: "Hire skates at an outdoor rink and take a short lesson.",
    guides: ["what-to-pack"],
  },

  // ── Air ────────────────────────────────────────────────────────────────────
  {
    type: "Paragliding", slug: "paragliding", element: "air",
    what: "Flying a paraglider from a hillside, usually in tandem with a pilot, or learning to fly solo on a course.",
    where: ["Bir Billing, Himachal Pradesh", "Kamshet, Maharashtra", "Solang, Himachal Pradesh", "Vagamon, Kerala", "Gangtok, Sikkim"],
    season: "Autumn and spring in the Himalaya (Bir is best around October and November); flying stops through the monsoon.",
    months: months("Mar", "Apr", "May", "Oct", "Nov"),
    body: ["nerve", "focus"],
    bodyNote: "A tandem flight asks little of your body: running a few steps at take-off and staying calm.",
    operator: [
      "A pilot registered to fly tandem, with a reserve parachute and helmet",
      "An operator that cancels when the wind is wrong",
      "Insurance that names paragliding",
    ],
    start: "Fly a tandem first; take a course if you want to fly solo.",
    guides: ["choosing-an-operator", "insurance-and-emergencies", "choosing-a-season"],
  },
  {
    type: "Skydiving", slug: "skydiving", element: "air",
    what: "Jumping from a plane and freefalling before the parachute opens, strapped to an instructor on a tandem.",
    where: ["a few drop zones in India, often running as scheduled events rather than daily"],
    season: "Winter and spring, in clear, calm weather.",
    months: months("Jan", "Feb", "Mar", "Nov", "Dec"),
    body: ["nerve"],
    bodyNote: "Physically easy on a tandem; there are weight and health limits.",
    operator: [
      "Instructors certified for tandem jumps, and a well-kept aircraft",
      "A clear briefing and the weight and medical limits checked",
      "Insurance that names skydiving",
    ],
    start: "Book a tandem jump at an established drop zone.",
    guides: ["choosing-an-operator", "insurance-and-emergencies"],
  },
  {
    type: "Hot Air Balloon", slug: "hot-air-balloon", element: "air",
    what: "A slow, quiet flight in a basket at sunrise, drifting over forts, desert or villages.",
    where: ["Jaipur", "Pushkar", "Lonavala"],
    season: "September to March, on calm winter mornings.",
    months: months("Jan", "Feb", "Mar", "Sep", "Oct", "Nov", "Dec"),
    body: [],
    bodyNote: "No fitness needed: you stand in the basket and climb out at the end.",
    operator: [
      "An operator flying with the aviation regulator's approval, and a licensed pilot",
      "Flights cancelled when the wind is too strong",
    ],
    start: "Book a sunrise flight in the winter season.",
    guides: ["choosing-an-operator"],
  },
  {
    type: "Hang Gliding", slug: "hang-gliding", element: "air",
    what: "Flying a rigid-wing glider from a hill, lying prone under the wing.",
    where: ["a few clubs at paragliding sites; rare in India"],
    season: "Autumn and spring, in steady winds.",
    months: months("Mar", "Apr", "Oct", "Nov"),
    body: ["strength", "focus", "nerve"],
    bodyNote: "Some upper-body strength to steer, and calm in the air.",
    operator: [
      "A qualified instructor and a tandem glider for first flights",
      "Insurance that names hang gliding",
    ],
    start: "Fly a tandem with a club before any course.",
    guides: ["choosing-an-operator", "insurance-and-emergencies"],
  },
];

export const activityBySlug = (slug: string) => ACTIVITIES.find((a) => a.slug === slug);
export const activityHref = (a: Activity) => `/adventurepedia/activities/${a.slug}`;

const ICON_OF: Record<Element, SearchEntry["icon"]> = { earth: "trail", water: "raft", snow: "altitude", air: "map" };

/** Each activity primer, for the library's search: the page, then its sections */
export function activitySearchIndex(): SearchEntry[] {
  return ACTIVITIES.flatMap((a) => {
    const base = { href: activityHref(a), guide: `${a.type} in India`, summary: a.what, icon: ICON_OF[a.element], topic: "activities" as const };
    return [
      { ...base, text: `${a.type}. ${a.what} ${a.where.join(", ")}.` },
      { ...base, section: "When to go", sectionId: "when", text: `Best season and months for ${a.type.toLowerCase()}: ${a.season}` },
      { ...base, section: "What to check before you book", sectionId: "operator", text: `Choosing a ${a.type.toLowerCase()} operator: ${a.operator.join(". ")}.` },
      { ...base, section: "Your first time", sectionId: "start", text: `${a.type} for beginners: ${a.start}` },
    ];
  });
}
