import operatorPrices from "./operatorPrices.json";
import operatorListings from "./operatorListings.json";

export type AdventureType =
  | "Trekking"
  | "Motorcycling"
  | "Cycling"
  | "Diving"
  | "Kayaking"
  | "River Rafting"
  | "Skiing"
  | "Mountaineering"
  | "Rock Climbing"
  | "Scrambling"
  | "Jeep Safari"
  | "Caving"
  | "Urban Adventure"
  | "Paragliding"
  | "Hot Air Balloon"
  | "Ice Skating";

export type Region =
  | "Himalayas"
  | "Western Ghats"
  | "Eastern Ghats"
  | "Desert"
  | "Coast"
  | "Islands"
  | "Northeast"
  | "Urban";

export type Difficulty = "Easy" | "Moderate" | "Hard" | "Advanced" | "Extreme";

export type Duration = "Weekend" | "3–5 days" | "7+ days";

export type Month =
  | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export interface ERT {
  /** Exertion 1–5: physical effort based on distance, altitude, days */
  e: number;
  /** Risk 1–5: environmental hazard and rescue difficulty */
  r: number;
  /** Technicality 1–5: skill and equipment required */
  t: number;
}

/** ACE Rating (Adventure Capability Engine) — 8-axis biological capability profile */
export interface ACEAxes {
  stamina:  number;
  power:    number;
  strength: number;
  agility:  number;
  water:    number;
  altitude: number;
  focus:    number;
  nerve: number;
}

export interface Adventure {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  region: Region;
  state: string;
  type: AdventureType;
  difficulty: Difficulty;
  duration: Duration;
  durationDays: string;
  durationRange?: string;
  distance?: string;
  distanceRange?: string;
  altitude?: string;
  depth?: string;
  /** River trips: the rapids' grade range, e.g. "Grade II–IV" */
  rapidGrade?: string;
  bestSeason: string;
  bestMonths: Month[];
  baseCamp?: string;
  startingPoint?: string;
  heroImage: string;
  galleryImages: string[];
  lat: number;
  lng: number;
  description: string;
  whoFor: string;
  whoNot: string;
  safetyNotes: string;
  operators: Operator[];
  tags: string[];
  featured: boolean;
  editorChoice?: boolean;
  /** ERT difficulty scores — auto-computed if omitted */
  ert?: ERT;
  /** ACE Rating — 8-axis biological capability profile, auto-computed if omitted */
  ace?: ACEAxes;
}

export interface Operator {
  name: string;
  verified: boolean;
  priceFrom: string;
  googleRating: number;
  website?: string;
  /** ISO date the price was last checked on the operator's site — shown as a trust signal on Explore. */
  priceCheckedAt?: string;
  /** Added from the operator research sheet (operatorListings.json), not written here by hand */
  fromSheet?: boolean;
}

export interface SeedReview {
  id: string;
  username: string;
  /** One of the avatars in /public/avatars; without it the card shows the name's first letter */
  avatar_id?: number;
  rating: number;
  body: string;
  created_at: string;
  user_id: string; // empty string for seed reviews
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  authorBio?: string;
  authorAvatar?: string;
  pillTags?: string[]; // subset shown as pills near title; falls back to first 2 non-badge tags
  heroImage: string;
  tags: string[];
  region: string; // free-text place name (e.g. "Ladakh", "Nepal"), not the Adventure Region taxonomy
  adventureDate: string;
  submittedBy?: string; // user ID of the TTT member who submitted the story
  baseLikes?: number;    // starting like count (defaults to 50)
}

/** Cheapest operator price for an adventure, or null if none parse. */
export function getLowestPrice(adventure: Pick<Adventure, "operators">): number | null {
  return adventure.operators?.reduce<number | null>((min, o) => {
    const p = parseInt(o.priceFrom.replace(/[^\d]/g, ""), 10);
    if (isNaN(p)) return min;
    return min === null ? p : Math.min(min, p);
  }, null) ?? null;
}

export const adventures: Adventure[] = [
{
      id: "3",
      slug: "manali-leh-bike-expedition",
        name: "Manali–Leh Highway Ride",
        tagline: "490km, five high passes, zero guardrails — the crown jewel of Indian riding",
        region: "Himalayas",
        state: "Himachal Pradesh / Ladakh",
        type: "Motorcycling",
        difficulty: "Moderate",
          duration: "7+ days",
          durationDays: "10 days",
          distance: "490km",
          altitude: "5,359m (Tanglang La)",
          // Hand-set ACE (was estimated from the grade): 5,359 m passes on a heavy bike; gravel, water crossings, no guardrails
          ace: { stamina:3, power:2, strength:3, agility:3, water:0, altitude:5, focus:4, nerve:3 },
        bestSeason: "Jun – Sep",
        bestMonths: ["Jun", "Jul", "Aug", "Sep"],
          startingPoint: "Manali",
          heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/manali-leh.jpeg",
          galleryImages: [
            "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/manali-leh.jpeg",
          ],
      lat: 32.2396,
    lng: 77.1887,
    description:
        "The Manali–Leh highway is the crown jewel of Indian motorcycling. At over 490km, it crosses **five high-altitude passes including Rohtang, Baralacha La and Tanglang La** — each one demanding respect — on a road that alternates between pristine tarmac and lunar-like gravel. **No other road on Earth gives you altitude, isolation and scenery like this**: every 50km the terrain changes completely, from **pine forests to barren moonscapes to river valleys to glacier edges**.",
    whoFor: "You've done multi-day rides and are steady on broken roads and water crossings · A 350–450cc bike suits you: the Himalayan or Classic 350 does this route fine · You can ride 6–8 hours a day over passes above 5,000m · You can take 10–12 days off, with spare days for landslides",
    whoNot: "You'd sleep at Sarchu (4,300m) without acclimatising first: spend 2 nights in Manali · You've never ridden on gravel or through streams · You need phone signal: prepaid SIMs from outside Ladakh and J&K don't work there (postpaid does) · Your dates can't move: landslides close the road for hours or days",
    safetyNotes:
      "Carry a basic repair kit, spare clutch cable, and fuel for 150km stretches. Altitude sickness is real — acclimatise in Manali for 2 days minimum. Ride before noon to avoid afternoon weather.",
        operators: [],
    tags: ["motorcycle", "high passes", "Ladakh", "iconic", "long ride"],
    featured: true, editorChoice: true,
  },
{
    id: "5",
    slug: "spiti-valley-cycling",
    name: "Spiti Valley Cycling",
      tagline: "Pedal to the edge of the world — where ancient monasteries meet roads few dare to ride",
    region: "Himalayas",
    state: "Himachal Pradesh",
    type: "Cycling",
    difficulty: "Extreme",
      duration: "7+ days",
      durationDays: "12 days",
      distance: "550km",
      altitude: "4,551m (Kunzum Pass)",
      // Hand-set ACE (was estimated from the grade): 550 km pedalled over 4,551 m passes; endurance above all
      ace: { stamina:5, power:5, strength:3, agility:3, water:0, altitude:4, focus:3, nerve:4 },
      bestSeason: "Jun – Oct",
      bestMonths: ["Jun", "Jul", "Aug", "Sep", "Oct"],
        heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/spiti-valley-cycling.jpeg",
    galleryImages: [],
    lat: 32.2473,
    lng: 78.0350,
    description:
      "Spiti Valley is one of the most remote inhabited regions on Earth. Cycling through it — past **mud-brick monasteries perched on cliffs, turquoise rivers and barren high-altitude desert** — recalibrates your sense of scale. The oxygen is thin and **the isolation is absolute**: many stretches have **zero mobile signal, zero other cyclists and zero settlements for 40–50km**, and the silence is profound.",
    whoFor: "You've done multi-day touring with loaded panniers before · You can ride 60–80 km a day with long climbs above 3,500m · You can fix a puncture, adjust brakes and replace a cable yourself · You've slept above 3,500m without getting properly sick",
    whoNot: "You've never toured loaded: this is not the place to learn · You'd rely on shops along the way: food and spares are far apart · You'd count on Google Maps: download offline maps, it fails here",
    safetyNotes:
      "Carry CO2 cartridges, a multi-tool, and spare brake cables. First aid kit essential. Download offline maps — Google Maps fails here.",
        operators: [],
    tags: ["cycling", "remote", "cold desert", "monasteries", "extreme"],
    featured: false,
  },
{
        id: "11",
          slug: "ladakh-circuit",
            name: "Ladakh Circuit Ride",
            tagline: "Nubra dunes, Pangong blue, Umling La at 19,024 ft— Ladakh's full fury on two wheels",
          region: "Himalayas",
          state: "Ladakh",
          type: "Motorcycling",
            difficulty: "Advanced",
              duration: "7+ days",
              durationDays: "14 days",
              distance: "1,800km",
                altitude: "5,883m (Umling La)",
                // Hand-set ACE (was estimated from the grade): 14 days, 1,800 km, up to 5,883 m (Umling La); very remote
                ace: { stamina:4, power:2, strength:3, agility:3, water:0, altitude:5, focus:4, nerve:4 },
            bestSeason: "Jun – Sep",
            bestMonths: ["Jun", "Jul", "Aug", "Sep"],
              startingPoint: "Leh",
                    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/ladakh-circuit.jpeg",
          galleryImages: [],
      lat: 33.7782,
    lng: 78.6753,
        description:
          "The Ladakh Circuit is the ultimate Indian biking odyssey. Covering over 1,800km, it takes you through Leh, over Khardung La to **Nubra's sand dunes, which feel like another planet at 3,000m**, down to **Pangong Lake — 134km of water shifting between sapphire, jade and electric blue** — then on to the remote plains of Hanle, where the skies are so dark the Milky Way stretches horizon to horizon. It finishes up at **Umling La (5,883m), the world's highest motorable road** — standing on it on two wheels is a moment very few humans will ever experience. The circuit pushes rider and machine to their absolute limits; the landscapes are raw, alien and unforgettable.",
    whoFor: "You can ride long days on high, broken roads, up to Umling La · You'll spend 3 nights in Leh acclimatising before day 1 · You can take 14–16 days off, with spare days · You'll carry extra fuel: pumps can be 200 km or more apart",
    whoNot: "You'd skip acclimatisation: riding to 5,000m+ passes straight from the plane is dangerous · You won't get an Inner Line Permit: Nubra, Pangong and Hanle need one (operators arrange it online) · You need phone signal: prepaid SIMs from outside Ladakh and J&K don't work there (postpaid does) · You have a heart, lung or blood-pressure condition without a doctor's OK for very high altitude",
    safetyNotes:
      "Spend minimum 3 days acclimatising in Leh before starting. Carry oxygen, full repair kit, and satellite communicator. Fuel up whenever possible — stations are 200km+ apart. File a route plan with local police.",
        operators: [],
            tags: ["Umling La", "world record", "Ladakh", "extreme altitude", "circuit"],
          featured: true,
        },
{
    id: "12",
    slug: "zanskar-valley-bike",
    name: "Zanskar Valley Ride",
      tagline: "Cut off from the world 8 months a year — ride in before it closes",
    region: "Himalayas",
    state: "Ladakh",
    type: "Motorcycling",
    difficulty: "Extreme",
      duration: "7+ days",
      durationDays: "10 days",
      distance: "600km",
        altitude: "5,091m (Shinku La)",
        // Hand-set ACE (was estimated from the grade): broken roads over Shinku La (5,091 m), river crossings, days from help
        ace: { stamina:4, power:3, strength:4, agility:4, water:0, altitude:5, focus:4, nerve:5 },
      bestSeason: "Jul – Sep",
      bestMonths: ["Jul", "Aug", "Sep"],
        startingPoint: "Leh / Manali / Kargil",
          heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/zanskar-valley-bike.jpeg",

    galleryImages: [],
    lat: 33.4427,
    lng: 76.8516,
    description:
      "Zanskar is one of the most isolated inhabited valleys on Earth, **cut off by snow for 8 months a year** — one of the only places in India the outside world genuinely cannot reach. The road in, over Pensi La and down into the gorge, is barely a road at all: **river crossings, crumbling cliff-side tracks and zero mobile signal** make the riding raw, technical and a true expedition. The reward is **a valley frozen in time**, with Buddhist monasteries, turquoise rivers and total silence.",
    whoFor: "You're confident off-road: gravel, loose scree and river crossings · You'll ride in a pair or group, ideally with a support vehicle · Days without any phone signal are fine (carry a satellite messenger) · You can take 10–12 days off, with spare days",
    whoNot: "Your bike has road tyres or low clearance · You've never crossed a river on a bike: cross in the morning, before glacier melt raises them · You'd ride alone",
    safetyNotes:
      "Carry a satellite phone — there is no mobile signal in Zanskar. River crossings should only be attempted in the morning before glacial melt raises water levels. Always ride in pairs minimum.",
        operators: [],
    tags: ["Zanskar", "remote", "off-road", "river crossings", "expedition"],
    featured: false,
  },
{
  id: "16",
  slug: "kedarkantha-trek",
  ert: { e: 2, r: 2, t: 1 },
  name: "Kedarkantha Summit Trek",
  tagline: "A 12,500 ft winter summit that looks impossibly close — until it isn't",
  region: "Himalayas",
  state: "Uttarakhand",
  type: "Trekking",
  difficulty: "Hard",
  duration: "3–5 days",
  durationDays: "4 days", durationRange: "4 Days",
  distance: "19km", distanceRange: "19 km",
  altitude: "3,800m",
  bestSeason: "Dec – Apr",
  bestMonths: ["Dec", "Jan", "Feb", "Mar", "Apr"],
  baseCamp: "Sankri",
  heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kedarkantha.jpeg",
  galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kedarkantha.jpeg"],
  lat: 31.02160,
  lng: 78.17253,
  description:
    "Kedarkantha is India's most popular winter summit trek — and **for many trekkers, the first summit of their lives**. From the village of Sankri in the Govind Wildlife Sanctuary, the trail climbs through **pine and oak forests dusted in snow** before breaking into open meadows below the summit cone. It's **one of the most accessible winter snow experiences in India**, and the **360° panorama from 3,800m** takes in Swargarohini and Bandarpunch to Gangotri and Kedarnath.",
  whoFor: "A fit first-timer's Himalayan trek: no technical skill or previous altitude needed · You can climb steadily for 4–5 hours with a daypack, and start summit day around 3am · Tent camping in snow is fine: nights around −10°C in Jan–Feb · You can take 6 days off: 4 on the trail and a day's drive each way between Dehradun and Sankri",
  whoNot: "Long mountain drives make you sick: Dehradun to Sankri is 8–10 hours each way · You hate being cold: winter nights in tents are well below freezing · You're going after mid-April and want snow: by then most of it has melted",
  safetyNotes:
    "Start the summit push around 3am to top out at sunrise, before clouds build. Carry microspikes in January–February. Turn back from the summit cone in high wind.",
  ace: { stamina:3, power:2, strength:3, agility:3, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹11,000", googleRating: 4.9, website: "https://indiahikes.com/kedarkantha-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹10,900", googleRating: 4.8, website: "https://trekthehimalayas.com/kedarkantha-trek" },
    { name: "Bikat Adventures", verified: true, priceFrom: "₹10,800", googleRating: 4.7, website: "https://www.bikatadventures.com/Home/Itinerary/kedarkantha-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹9,500", googleRating: 4.3, website: "https://www.trekmunk.com/treks/kedarkantha" },
    { name: "Trekup India", verified: false, priceFrom: "₹10,000", googleRating: 4.2, website: "https://www.trekupindia.com/kedarkantha-trek" },
  ],
  tags: ["winter summit", "snow trek", "beginner summit", "Uttarakhand", "iconic"],
  featured: true,
},
{
  id: "26",
  slug: "sandakphu-phalut-trek",
  ert: { e: 2, r: 2, t: 1 },
  name: "Sandakphu–Phalut Trek",
  tagline: "The only place on Earth where you can see four of the world's five highest peaks at once",
  region: "Himalayas",
  state: "West Bengal",
  type: "Trekking",
  difficulty: "Hard",
  duration: "3–5 days",
  durationDays: "5 days", durationRange: "5 Days",
  distance: "55km", distanceRange: "55 km",
  altitude: "3,636m (Sandakphu)",
  bestSeason: "Mar – May, Oct – Dec",
  bestMonths: ["Mar", "Apr", "May", "Oct", "Nov", "Dec"],
  baseCamp: "Manebhanjan",
  heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/sandakphu.jpeg",
  galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/sandakphu.jpeg"],
  lat: 27.10496,
  lng: 88.00135,
  description:
    "Sandakphu is the highest point in West Bengal at 3,636m — and on a clear day its summit shows **Everest, Kangchenjunga, Lhotse and Makalu at once**: the only place on Earth where four of the world's five highest peaks are visible together. At sunrise the Kangchenjunga massif forms **the Sleeping Buddha**, one of the most iconic mountain views in Asia. The route along **the Singalila ridge, lined with rhododendrons in bloom from March to May**, is one of India's most scenic long-distance trails.",
  whoFor: "You want a lodge trek: beds and meals every night, no camping · You can walk up to 17 km a day along a ridge, for 5 days · You want Everest, Kangchenjunga, Lhotse and Makalu in view from one ridge · You'll carry ID: the trail weaves in and out of Nepal",
  whoNot: "You want a roadless trail: old Land Rovers drive up to Sandakphu · You're going in Jun–Aug: monsoon cloud hides the mountains · Ice worries you: the ridge path can be icy in Dec–Jan (microspikes help)",
  safetyNotes:
    "The Indian side requires a permit from the Darjeeling DFO. Nepal side checkposts require passport copies. The ridge path can be icy December–January — carry microspikes.",
  ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹13,000", googleRating: 4.9, website: "https://indiahikes.com/sandakphu-phalut" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹13,900", googleRating: 4.8, website: "https://trekthehimalayas.com/sandakphu-trek" },
    { name: "Trekup India", verified: false, priceFrom: "₹13,000", googleRating: 4.2, website: "https://trekupindia.com/trek/sandakphu-phalut" },
  ],
  tags: ["four peaks view", "West Bengal", "Singalila ridge", "rhododendrons", "iconic"],
  featured: true,
},
{
  id: "28",
  slug: "tarsar-marsar-trek",
  ert: { e: 3, r: 3, t: 1 },
  name: "Tarsar Marsar Trek",
  tagline: "Twin alpine jewels hidden above Kashmir's Lidder Valley",
  region: "Himalayas",
  state: "Jammu & Kashmir",
  type: "Trekking",
  difficulty: "Hard",
  duration: "7+ days",
  durationDays: "7 days", durationRange: "7 Days",
  distance: "75km", distanceRange: "75 km",
  altitude: "4,019m (Tarsar Pass)",
  bestSeason: "Jul – Aug",
  bestMonths: ["Jul", "Aug"],
  baseCamp: "Aru",
  heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/tarsar-marsar.jpeg",
  galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/tarsar-marsar.jpeg"],
  lat: 34.14426,
  lng: 75.10983,
  description:
    "The Tarsar Marsar trek takes you to **two of Kashmir's most beautiful alpine lakes**, through meadows and passes above the Aru and Pahalgam valleys. From the green Aru Valley it reaches **the glacially carved bowl of Tarsar at 3,978m**, crosses Tarsar Pass (4,019m) above it and descends to **the wild, remote Marsar lake** — less visited and arguably more dramatic — with **the Kolahoi glacier glinting in the distance**. The margs and shepherd encampments along the way give an authentic slice of Kashmiri high-altitude life: Kashmir trekking at its finest.",
  whoFor: "You've done a multi-day trek before · You can manage two pass days around 4,000m back to back · 6 nights of tent camping beside alpine lakes is what you want · You can go in Jul–Aug, the only reliable window",
  whoNot: "You need phone signal: prepaid SIMs from outside J&K don't work there (postpaid does) · You can only go outside Jul–Aug: snow or closures make the route unreliable · You'd skip registering: the forest checkpost at Aru needs your details and ID",
  safetyNotes:
    "Aru requires Pahalgam-area permits for foreigners. The pass between Tarsar and Marsar is steep and can be snowy in July. Register at the Forest Department checkpost at Aru before starting.",
  ace: { stamina:3, power:2, strength:3, agility:2, water:2, altitude:4, focus:2, nerve:2 },
    operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹16,000", googleRating: 4.9, website: "https://indiahikes.com/tarsar-marsar" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹17,000", googleRating: 4.8, website: "https://trekthehimalayas.com/tarsar-marsar-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹18,000", googleRating: 4.3, website: "https://www.trekmunk.com/treks/tarsar-marsar-trek" },
  ],
  tags: ["alpine lakes", "Kashmir", "shepherd country", "twin lakes", "Kolahoi"],
  featured: false,
},
{
  id: "13",
  slug: "spiti-valley-bike",
        name: "Spiti Valley Circuit",
          tagline: "Ride the old Tibet highway — where the tarmac ends and the adventure begins",
      region: "Himalayas",
      state: "Himachal Pradesh",
      type: "Motorcycling",
        difficulty: "Advanced",
          duration: "7+ days",
          durationDays: "9 days",
          distance: "450km",
          altitude: "4,551m (Kunzum Pass)",
          // Hand-set ACE (was estimated from the grade): Kinnaur–Spiti roads, landslide zones, Kunzum at 4,551 m
          ace: { stamina:3, power:2, strength:3, agility:4, water:0, altitude:4, focus:4, nerve:4 },
        bestSeason: "Jun – Oct",
        bestMonths: ["Jun", "Jul", "Aug", "Sep", "Oct"],
          startingPoint: "Manali / Shimla",
          heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/spiti-valley-bike.jpeg",
      galleryImages: [
        "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/spiti-valley-bike.jpeg"
      ],
    lat: 32.2473,
    lng: 78.0350,
    description:
      "The Spiti loop — in from Manali over Rohtang and Kunzum La, out via Shimla through Kinnaur — is one of the most beautiful roads in Asia: **mud monasteries at 4,000m**, apple orchards in ancient river valleys, and stretches so remote the tarmac simply stops. It's **completable without extreme technical skill, yet the scenery rivals anything in Ladakh**, and **Key Monastery, Dhankar and Tabo** make it as culturally rich as it is visually stunning.",
    whoFor: "You've done multi-day rides, including rough stretches · You can ride the Gramphu–Batal stretch: boulders, loose gravel and stream crossings · A 350cc or bigger bike suits you; small commuter bikes struggle on Kunzum La · Village homestays in Spiti suit you: simple rooms and home food",
    whoNot: "You're going before late June: Kunzum La can still be snowbound · You don't have proper cold-weather riding gear: passes are near freezing even in summer · Your dates can't move: landslides and snow close roads without warning",
    safetyNotes:
      "Kunzum La can be snowbound until late June — check pass status before departure. Carry chain lube, tyre plugs, and a basic toolkit. Fuel up at Kaza — it's the last pump for 130km.",
        operators: [],
    tags: ["Spiti", "cold desert", "monasteries", "loop", "Kunzum La"],
    featured: false,
  },

  // ── CSV TREKS BATCH 1 ─────────────────────────────────────────────────────
  {
    id: "csv-01", slug: "ali-bedni-bugyal",
    ert: { e: 1, r: 2, t: 1 },
    name: "Ali Bedni Bugyal Trek", tagline: "Twin high-altitude meadows floating above the Himalayan treeline",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "30km", distanceRange: "30 km", altitude: "3,824m",
    baseCamp: "Lohajung",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/ali-bedni-bugyal.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/ali-bedni-bugyal.jpeg"],
    lat: 30.20635, lng: 79.66694,
    description: "Ali and Bedni Bugyal are **two of the most expansive alpine meadows in the Himalayas**, above Lohajung in Uttarakhand. The trail winds through dense oak and rhododendron forest before **opening suddenly onto vast grasslands** — one of the most dramatic moments in Himalayan trekking — with panoramic views of **Trishul and Nanda Ghunti**. In spring the meadows **blaze with rhododendron; in autumn they turn gold**.",
    whoFor: "You can walk 5–6 hours on steady climbs with a daypack · Tent camping is fine: there are no lodges, and nights are near freezing even in summer · You want huge meadows facing Trishul and Nanda Ghunti, without crowds · First Himalayan trek: no technical terrain",
    whoNot: "Leeches put you off: the forest sections have them in May–Jun · Long drives wreck you: Kathgodam to Lohajung is 10–11 hours each way · Your knees hate long descents: the way down through the forest is steep",
    safetyNotes: "Carry warm layers — nights drop sharply even in summer. Leeches on trail May–Jun; wear gaiters.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹11,950", googleRating: 4.8, website: "https://indiahikes.com/ali-bedni-bugyal-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹9,800", googleRating: 4.7, website: "https://trekthehimalayas.com/ali-bedni-bugyal-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹8,950", googleRating: 4.3, website: "https://www.trekupindia.com/ali-bedni-bugyal-trek" },
    ],
    tags: ["bugyal", "meadows", "Uttarakhand", "moderate", "rhododendron"], featured: false,
  },
  {
    id: "csv-02", slug: "annapurna-base-camp",
    ert: { e: 3, r: 2, t: 1 },
    name: "Annapurna Base Camp Trek", tagline: "A 360° amphitheatre of 7,000m+ giants deep in the Nepal Himalaya",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "9 days", durationRange: "9 Days",
    distance: "89km", distanceRange: "89 km", altitude: "4,110m",
    baseCamp: "Nayapul",
    bestSeason: "Mar–May, Sep–Nov", bestMonths: ["Mar","Apr","May","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/annapurna-base-camp.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/annapurna-base-camp.jpeg"],
    lat: 28.53075, lng: 83.87784,
    description: "The Annapurna Base Camp trek takes you into the heart of the Annapurna Sanctuary — **a glacial amphitheatre ringed by eight peaks above 7,000m**. The route climbs through terraced farmland, subtropical forest and rhododendron woodland into the high alpine zone, and ends in a morning few treks on Earth can match: **waking up at ABC surrounded by Annapurna I (8,091m), Machhapuchhre and Hiunchuli** on all sides.",
    whoFor: "You can climb stone stairs for hours: Chhomrong alone is thousands of steps · You've slept above 3,000m without getting properly sick · You can take 11–12 days off: 9 on the trail, the drive from Pokhara to Nayapul and back, and a spare day · Teahouse lodges are fine: shared toilets, cold rooms near base camp · You're Indian: no visa needed, just a passport or voter ID",
    whoNot: "Your knees hate long descents: much of the way down is steep stone stairs · You have a heart, lung or blood-pressure condition without a doctor's OK for 4,000m · You're going after heavy snow: the Deurali to Machhapuchhre stretch has avalanche risk · You're going in the monsoon (Jun–Aug): leeches, landslides on the road, clouded views",
    safetyNotes: "Altitude sickness risk above 3,500m. Acclimatise at Chhomrong. Avalanche risk on upper section in heavy snowfall.",
    ace: { stamina:4, power:2, strength:3, agility:3, water:1, altitude:4, focus:2, nerve:2 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹35,000", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/Annapurna-Base-Camp-Trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹37,500", googleRating: 4.7, website: "https://trekthehimalayas.com/annapurna-base-camp-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹35,000", googleRating: 4.3, website: "https://www.trekupindia.com/annapurna-base-camp-trek" },
    ],
    tags: ["Nepal", "Annapurna", "sanctuary", "high altitude", "panoramic"], featured: false,
  },
  {
    id: "csv-03", slug: "annapurna-circuit",
    ert: { e: 4, r: 2, t: 1 },
    name: "Annapurna Circuit Trek", tagline: "Cross the world's highest trekking pass through three climate zones",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "7 days", durationRange: "7 Days",
    distance: "76km", distanceRange: "76 km", altitude: "5,399m",
    baseCamp: "Dharapani",
    bestSeason: "Mar–May, Oct", bestMonths: ["Mar","Apr","May","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/annapurna-circuit.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/annapurna-circuit.jpeg"],
    lat: 28.79354, lng: 83.93865,
    description: "The Annapurna Circuit walks around the north of the Annapurna massif, about 76km on foot from Dharapani, where the jeep road ends, to Muktinath. Its diversity is unmatched — **pine forest to arid Tibetan plateau in a week** — and it crosses **the legendary Thorong La at 5,399m**, where a clear October morning with **the whole Annapurna range below** is a life milestone.",
    whoFor: "You can walk 8–10 hours on pass day: about 1,000m up and 1,600m down from 5,399m · You've slept above 4,000m, or will take the 2 acclimatisation nights at Manang · You can take 12–13 days off: 7 on the trail, 2 days' drive in from Kathmandu to Dharapani, 2 back via Jomsom and Pokhara, and a spare day for weather · You don't mind jeeps: roads now run along much of the lower circuit · You're Indian: no visa needed, just a passport or voter ID",
    whoNot: "You have a heart, lung or blood-pressure condition without a doctor's OK for 5,400m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: snow can close Thorong La for days, most often Dec–Feb · You want roadless wilderness: road dust and traffic reach Manang and Muktinath",
    safetyNotes: "Thorong La (5,399m) crossing should begin by 4am. Acclimatise 2 nights at Manang. Descend immediately at first AMS symptoms.",
    ace: { stamina:5, power:2, strength:4, agility:3, water:1, altitude:5, focus:3, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹75,000", googleRating: 4.8, website: "https://trekthehimalayas.com/annapurna-circuit-trek" },
    ],
    tags: ["Nepal", "Thorong La", "circumnavigation", "classic", "Tibetan culture"], featured: false, editorChoice: true,
  },
  {
    id: "csv-04", slug: "bagini-glacier",
    ert: { e: 2, r: 3, t: 2 },
    name: "Bagini Glacier Trek", tagline: "Reach the icefall base of Changbang's north face through remote Garhwal",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "9 days", durationRange: "9 Days",
    distance: "43km", distanceRange: "43 km", altitude: "4,516m",
    baseCamp: "Pipalkoti",
    bestSeason: "May–Jun, Sep", bestMonths: ["May","Jun","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bagini-glacier.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bagini-glacier.jpeg"],
    lat: 30.4827, lng: 79.7119,
    description: "The Bagini Glacier trek leads through the remote Dronagiri valley, across glacial moraines and boulder fields, to a hanging glacier at 4,516m at the base of **Changbang's north face**. That **granite wall rising above a fractured icefall** is one of the most dramatic glacial views accessible to non-climbers in India — and there are **virtually no crowds, just wilderness**.",
    whoFor: "You've slept above 4,000m without getting properly sick · You're steady on loose boulders and moraine for hours at a time · A week of tent camping with no lodges is fine · You want Changabang's north face up close, on a trail few people walk",
    whoNot: "Your ankles are weak: the last stretch to base camp is loose moraine with no trail · You're going in Jul–Aug: monsoon landslides close the route · You plan to go without a local guide: the upper trail is unmarked",
    safetyNotes: "No teahouses — full camping gear required. Glacier moraines are loose near the snout. Go with an experienced local guide from Pipalkoti.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:2, altitude:4, focus:4, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹14,800", googleRating: 4.7, website: "https://trekthehimalayas.com/bagini-glacier-and-changbang-base-camp" },
    ],
    tags: ["glacier", "Changbang", "remote", "Uttarakhand", "wilderness"], featured: false,
  },
  {
    id: "csv-05", slug: "bali-pass",
    ert: { e: 3, r: 4, t: 2 },
    name: "Bali Pass Trek", tagline: "A high-altitude crossing linking Har Ki Dun with Yamunotri at 16,207ft",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "6 days", durationRange: "6 Days",
    distance: "43km", distanceRange: "43 km", altitude: "4,940m",
    baseCamp: "Taluka",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bali-pass.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bali-pass.jpeg"],
    lat: 31.03299, lng: 78.43803,
    description: "Bali Pass links the Har Ki Dun valley to Yamunotri across **a 4,940m crossing — one of the highest trekking passes in Uttarakhand** — over glaciated terrain with Swargarohini, Bandarpunch and Black Peak in view. From the top, **Swargarohini I, II and III line up like ramparts with Bandarpunch beyond**: one of the most iconic summit panoramas in Garhwal.",
    whoFor: "You've crossed a high pass before (Rupin, Buran Ghati) and slept above 4,000m · You can do a 10–12 hour pass day on snow slopes up to 40° · You can walk in microspikes or crampons and follow a guide's rope on steep snow · You can take 8 days off: 6 on the trail, and a long drive each way, in to Taluka via Sankri and out from Janki Chatti",
    whoNot: "It's your first Himalayan trek · Steep, exposed snow scares you: the descent towards Yamunotri is steep · You haven't acclimatised: pass day climbs to 4,940m",
    safetyNotes: "Bali Pass crossing involves snow slopes up to 40°. Crampons and rope may be needed early season. Leave pass camp by 4am on crossing day.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:2, altitude:5, focus:4, nerve:4 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹21,500", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/bali-pass-trek" },
      { name: "Indiahikes", verified: true, priceFrom: "₹22,000", googleRating: 4.8, website: "https://indiahikes.com/bali-pass-ruinsara-tal" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹22,000", googleRating: 4.7, website: "https://trekthehimalayas.com/bali-pass-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹20,000", googleRating: 4.3, website: "https://www.trekupindia.com/bali-pass-trek" },
    ],
    tags: ["pass trek", "Har Ki Dun", "snow", "Uttarakhand", "Swargarohini"], featured: false,
  },
  {
    id: "csv-06", slug: "buran-ghati",
    ert: { e: 2, r: 3, t: 2 },
    name: "Buran Ghati Trek", tagline: "Rappel down a snow wall at 15,000ft on this technical Himachal crossing",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "6 days", durationRange: "6 Days",
    distance: "37km", distanceRange: "37 km", altitude: "4,557m",
    baseCamp: "Janglik",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/buran-ghati.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/buran-ghati.jpeg"],
    lat: 31.38753, lng: 78.14575,
    description: "Buran Ghati is one of the few Himalayan treks with **a rope rappel on the descent** — down **a near-vertical snow wall on the Sangla side**. It isn't technical climbing, but it is genuine exposure on a steep snow face, and unique for a trekking route. The approach through **the Rupin valley** is lush and dramatic.",
    whoFor: "You've slept above 4,000m on a trek before · You're OK going down a steep snow wall on a fixed rope, with the guide's help · You can do a 10–11 hour pass day · You want big meadows and the Pabbar valley without the Manali crowds",
    whoNot: "It's your first Himalayan trek · Steep snow and heights scare you: the rope descent is the only way down · Long drives make you sick: Shimla to Janglik is 6–7 hours",
    safetyNotes: "Rappel section requires fixed ropes — only cross with guides and certified ropes. Snow depth varies by season.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:2, altitude:4, focus:4, nerve:4 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹16,000", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/buran-ghati-trek" },
      { name: "Indiahikes", verified: true, priceFrom: "₹16,000", googleRating: 4.8, website: "https://indiahikes.com/buran-ghati-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹16,500", googleRating: 4.7, website: "https://trekthehimalayas.com/buran-ghati-pass-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹15,000", googleRating: 4.3, website: "https://www.trekupindia.com/buran-ghati-trek" },
    ],
    tags: ["rappel", "snow wall", "Himachal Pradesh", "technical", "Sangla"], featured: false,
  },

  // ── CSV TREKS BATCH 2 ─────────────────────────────────────────────────────
  {
    id: "csv-07", slug: "beas-kund",
    ert: { e: 1, r: 1, t: 2 },
    name: "Beas Kund Trek", tagline: "Trek to the glacial source of the Beas River above Manali",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "3 days", durationRange: "3 Days",
    distance: "14km", distanceRange: "14 km", altitude: "3,615m",
    baseCamp: "Dhundi",
    bestSeason: "Jul–Sep", bestMonths: ["Jul","Aug","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/beas-kund.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/beas-kund.jpeg"],
    lat: 32.36058, lng: 77.08136,
    description: "Beas Kund is **the glacial lake that gives birth to the Beas River**, in a high bowl above the Solang Valley. The kund itself — **a perfectly still tarn reflecting Shitidhar peak, framed by the Dhauladhar and Pir Panjal ranges** — is one of the most serene spots in Himachal, and **the short trail through alpine meadows makes it ideal for beginners** stepping into the Himalaya for the first time.",
    whoFor: "A fit first-timer's Himalayan trek: 3 days on the trail, starting from Manali · You can walk 5–6 hours a day with a daypack · You want Hanuman Tibba and Friendship Peak right above camp · A good warm-up before a harder trek in the area",
    whoNot: "Rain gets you down: Jul–Aug is wet and the Solang road can close · You want solitude: it's one of Manali's most popular short treks · Loose ground worries you: the last stretch to the lake is moraine",
    safetyNotes: "Solang Valley to Dhundi road sometimes closed in heavy rain. Stay on trail near the kund — loose moraine underfoot.",
    ace: { stamina:2, power:2, strength:2, agility:3, water:2, altitude:3, focus:3, nerve:2 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹8,000", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/beas-kund-trek" },
      { name: "Indiahikes", verified: true, priceFrom: "₹8,000", googleRating: 4.8, website: "https://indiahikes.com/beas-kund-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹7,950", googleRating: 4.7, website: "https://trekthehimalayas.com/beas-kund-trek" },
    ],
    tags: ["glacial lake", "Manali", "beginner", "Himachal Pradesh", "short trek"], featured: false,
  },
  {
    id: "csv-08", slug: "bhrigu-lake",
    ert: { e: 1, r: 2, t: 1 },
    name: "Bhrigu Lake Trek", tagline: "A glacial lake at 14,000ft that never fully freezes — even in winter",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "3 days", durationRange: "3 Days",
    distance: "21km", distanceRange: "21 km", altitude: "4,156m",
    baseCamp: "Gulaba",
    bestSeason: "Jul–Sep", bestMonths: ["Jul","Aug","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bhrigu-lake.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bhrigu-lake.jpeg"],
    lat: 32.29326, lng: 77.24250,
    description: "Bhrigu Lake sits at about 4,156m above Manali, believed in Hindu mythology to be where **sage Bhrigu meditated**. Its **deep blue waters, ringed by snowfields in a high meadow bowl**, look unlike any landscape near Manali, and the surrounding **'garden of gods' meadows are carpeted with alpine flowers** in summer, with sweeping views of the Pir Panjal range. It's **accessible enough for beginners but high enough for genuine Himalayan atmosphere**.",
    whoFor: "You want a short high trek from Manali: 3 days from Gulaba to a 4,156m lake · You can walk 5–6 hours a day with a daypack · Tent camping is fine: cold nights near the lake · You like wide alpine meadows with big peaks behind",
    whoNot: "You've never been to altitude and can't take it slowly: it climbs fast, over 1,000m in two days · Thunderstorms worry you: afternoon storms are common in Jul–Aug",
    safetyNotes: "Altitude gain from Manali (2,050m) to lake (about 4,156m) is steep — take the ascent slowly. Afternoon thunderstorms common in July–August.",
    ace: { stamina:3, power:2, strength:3, agility:3, water:1, altitude:4, focus:2, nerve:2 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹7,000", googleRating: 4.8, website: "https://indiahikes.com/bhrigu-lake-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹7,500", googleRating: 4.7, website: "https://trekthehimalayas.com/bhrigu-lake-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹7,000", googleRating: 4.3, website: "https://www.trekupindia.com/bhrigu-lake-trek" },
    ],
    tags: ["glacial lake", "Manali", "alpine meadows", "Himachal Pradesh", "moderate"], featured: false,
  },
  {
    id: "csv-09", slug: "brahmatal",
    ert: { e: 2, r: 2, t: 1 },
    name: "Brahmatal Trek", tagline: "A pristine frozen lake surrounded by oak forests and winter silence",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "26km", distanceRange: "26 km", altitude: "3,728m (Brahmatal Top)",
    baseCamp: "Lohajung",
    bestSeason: "Dec–Mar", bestMonths: ["Dec","Jan","Feb","Mar"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/brahmatal.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/brahmatal.jpeg"],
    lat: 30.17779, lng: 79.58802,
    description: "Brahmatal is Uttarakhand's finest winter trek, and **one of the best in India for first-timers on snow**. In a single 4-day route it combines **snow-laden oak and rhododendron forest, a frozen alpine lake**, and a summit ridge with **a 270° panorama of Mt Trishul, Nanda Ghunti and the Kumaon Himalaya**.",
    whoFor: "First winter trek: snow walking with microspikes, no technical skill · You can walk 5–6 hours in snow with a daypack · Winter camping is fine: nights of −10 to −15°C in a sleeping bag rated −15°C · You want Trishul and Nanda Ghunti right in front of a frozen lake",
    whoNot: "You hate being cold: this trek only runs Dec–Mar · Long drives wreck you: Kathgodam to Lohajung is 10–11 hours each way",
    safetyNotes: "Carry good-quality sleeping bag rated to -15°C. Summit ridge can be icy — microspikes provided by operators. Leeches absent (winter), but frostbite risk on exposed skin.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹10,000", googleRating: 4.8, website: "https://indiahikes.com/brahmatal-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹10,900", googleRating: 4.7, website: "https://trekthehimalayas.com/brahmatal-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹10,000", googleRating: 4.3, website: "https://www.trekupindia.com/brahmatal-trek" },
    ],
    tags: ["winter trek", "frozen lake", "Uttarakhand", "snow forest", "Trishul view"], featured: false,
  },
  {
    id: "csv-10", slug: "dayara-bugyal",
    ert: { e: 1, r: 1, t: 1 },
    name: "Dayara Bugyal Trek", tagline: "Uttarakhand's widest alpine meadow, stunning year-round",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "24km", distanceRange: "24 km", altitude: "3,648m",
    baseCamp: "Raithal",
    bestSeason: "May–Jun, Sep–Nov", bestMonths: ["May","Jun","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/dayara-bugyal.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/dayara-bugyal.jpeg"],
    lat: 30.82994, lng: 78.54964,
    description: "Dayara Bugyal is one of **the widest high-altitude meadows in the Garhwal Himalaya** — a grassland plateau so vast **you can see the horizon curve**, with unobstructed 360° views of Bandarpunch, Srikanth and the Gangotri group. The approach from Raithal through forest is equally beautiful, and **every season is a different world**: amber and rust in October, under snow by December.",
    whoFor: "A fit first-time trekker: wide meadows, a well-marked trail, nothing technical, but steady climbing to 3,600m · You can walk 4–5 hours a day with a daypack · Tent camping is fine: nights near or below freezing · You can take 6 days off: 4 on the trail and a day's drive each way between Dehradun and Raithal",
    whoNot: "You want solitude: it's one of Uttarakhand's busiest beginner treks · Long drives make you sick: Dehradun to Raithal is 6–7 hours each way",
    safetyNotes: "Trail is well-marked from Raithal. Afternoon clouds build quickly — reach bugyal campsite by 2pm. Stick to designated camping zones.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹7,000", googleRating: 4.8, website: "https://indiahikes.com/dayara-bugyal-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹10,500", googleRating: 4.7, website: "https://trekthehimalayas.com/dayara-bugyal-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹7,000", googleRating: 4.3, website: "https://www.trekupindia.com/dayara-bugyal-trek" },
    ],
    tags: ["bugyal", "meadow", "Uttarakhand", "beginner-friendly", "Bandarpunch view"], featured: false,
  },
  {
    id: "csv-11", slug: "deoriatal-chandrashila",
    ert: { e: 2, r: 1, t: 1 },
    name: "Deoriatal–Chandrashila Trek", tagline: "A sacred lake and a Himalayan summit in one short, perfect trek",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "31km", distanceRange: "31 km", altitude: "3,690m (Chandrashila)",
    baseCamp: "Sari",
    bestSeason: "Mar–May, Sep–Nov", bestMonths: ["Mar","Apr","May","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/deoriatal-chandrashila-hero.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/deoriatal-chandrashila-hero.jpeg"],
    lat: 30.48642, lng: 79.22123,
    description: "This compact 4-day route combines **Deoria Tal, famous for its mirror reflections of Chaukhamba**, with the Chandrashila summit and extraordinary altitude gain. **At dawn on Chandrashila, Kedarnath, Chaukhamba, Nanda Devi, Trishul and Bandarpunch are all visible at once** — one of the finest summit panoramas on **a moderate Himalayan trek**.",
    whoFor: "A fit first-timer's Himalayan summit: no technical terrain · You can walk 5–6 hours with a daypack, and start the summit climb at 4–5am · You'd like Tungnath, the world's highest Shiva temple, on the way up · You want a 270° view of Chaukhamba, Nanda Devi and Kedarnath peaks",
    whoNot: "You want solitude: Tungnath is crowded with pilgrims in May–Jun and on weekends · Long drives make you sick: Rishikesh to Sari is about 8 hours · You're going in Jul–Aug: monsoon landslides block the roads",
    safetyNotes: "Chandrashila summit (3,690m) can be windy and cold even in April. Start summit attempt by 5am for clear views before cloud builds.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹10,000", googleRating: 4.8, website: "https://indiahikes.com/deoriatal-chandrashila-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹9,500", googleRating: 4.7, website: "https://trekthehimalayas.com/chopta-chandrashila-deoria-tal-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹9,000", googleRating: 4.3, website: "https://trekupindia.com/trek/chopta-chandrashila-tungnath" },
    ],
    tags: ["Chandrashila", "Deoria Tal", "Uttarakhand", "summit", "Kedarnath view"], featured: false,
  },
  {
    id: "csv-12", slug: "everest-base-camp",
    ert: { e: 4, r: 2, t: 1 },
    name: "Everest Base Camp Trek", tagline: "Walk to the foot of the world's highest mountain at 17,598ft",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "11 days", durationRange: "11 Days",
    distance: "111km", distanceRange: "111 km", altitude: "5,645m (Kala Patthar)",
    baseCamp: "Lukla",
    bestSeason: "Mar–May, Oct–Nov", bestMonths: ["Mar","Apr","May","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/everest-base-camp.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/everest-base-camp.jpeg"],
    lat: 27.99966, lng: 86.84879,
    description: "The Everest Base Camp trek is one of the most iconic journeys on Earth — 11 days from Lukla through the Khumbu valley, past **Sherpa villages and the monasteries of Namche and Tengboche**, beneath a parade of 8,000m peaks to **the base of Everest at 5,364m**. Standing at EBC with **the Khumbu Icefall crashing above you and Nuptse, Lhotse and Everest filling the sky** is a genuinely overwhelming experience, and the journey there is as memorable as the destination.",
    whoFor: "You can hike 6 hours with 1,000m of climbing and feel fine the next morning · You've slept above 3,500m (Leh, Spiti) without getting properly sick · You can take 14–15 days off: 11 on the trail, a day in Kathmandu each side, and 1–2 spare days for Lukla flights · Basic lodges are fine: shared toilets, unheated rooms, nights of −10°C up high · You're Indian: no visa needed, just a passport or voter ID",
    whoNot: "You have a heart or lung condition, or high blood pressure, without a doctor's OK for 5,000m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: weather cancels Lukla flights often, sometimes for days · Small planes scare you: the only quick way in is a flight to Lukla's mountain airstrip · You want quiet trails in Oct–Nov or Apr–May: Gokyo Lakes is calmer",
    safetyNotes: "Acclimatise at Namche (2 nights) and Dingboche (2 nights). Descend immediately at any AMS symptoms. Khumbu Icefall debris occasionally affects BC area — stay aware.",
    ace: { stamina:5, power:3, strength:4, agility:3, water:1, altitude:5, focus:4, nerve:3 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹85,000", googleRating: 4.9, website: "https://www.bikatadventures.com/Home/Itinerary/Everest-Base-Camp-Trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹75,500", googleRating: 4.8, website: "https://trekthehimalayas.com/everest-base-camp-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹80,000", googleRating: 4.4, website: "https://trekupindia.com/trek/everest-base-camp" },
    ],
    tags: ["Nepal", "Everest", "iconic", "Khumbu", "high altitude"], featured: true, editorChoice: true,
  },

  // ── CSV TREKS BATCH 3 ─────────────────────────────────────────────────────
  {
    id: "csv-13", slug: "gaumukh-tapovan",
    ert: { e: 3, r: 3, t: 2 },
    name: "Gaumukh Tapovan Trek", tagline: "The glacier source of the Ganges and the meadow where sadhus meditate at 14,100ft",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5 Days",
    distance: "41km", distanceRange: "41 km", altitude: "4,311m",
    baseCamp: "Gangotri",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gaumukh-tapovan.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gaumukh-tapovan.jpeg"],
    lat: 30.91455, lng: 79.07659,
    description: "Gaumukh is the snout of the Gangotri Glacier — **the source of the holy Ganga**. From there the trail climbs a boulder-strewn glacier tongue to **Tapovan, a green oasis at about 4,311m** at the base of Shivling's south face, with **Shivling, Bhagirathi I/II/III and Meru all within touching distance**. That meeting of **spiritual significance and raw mountain beauty** is found nowhere else in India.",
    whoFor: "You've slept above 4,000m without getting properly sick · You're steady on loose moraine, including crossing the glacier to Tapovan · The source of the Ganga matters to you · Tent camping above Bhojbasa is fine: few beds, sub-zero nights",
    whoNot: "Your ankles are weak: the glacier section has no trail, only boulders · Rockfall makes you nervous: the stretch near Gaumukh's snout has loose rock above · You're going in Jul–Aug: monsoon washouts and rockfall · You'd go last-minute: national park permits are limited each day",
    safetyNotes: "Gangotri Glacier moraine is loose and slippery. Gaumukh section requires careful footing — no fixed trail on the glacier. Trek with an experienced guide.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:2, altitude:4, focus:4, nerve:3 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹17,000", googleRating: 4.8, website: "https://indiahikes.com/gaumukh-tapovan" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹17,000", googleRating: 4.7, website: "https://trekthehimalayas.com/gaumukh-tapovan-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹17,000", googleRating: 4.3, website: "https://www.trekupindia.com/gaumukh-tapovan-trek" },
    ],
    tags: ["Gangotri Glacier", "Tapovan", "Shivling", "Uttarakhand", "sacred"], featured: false,
  },
  {
    id: "csv-14", slug: "goechala",
    ert: { e: 4, r: 3, t: 1 },
    name: "Goechala Trek", tagline: "The closest viewpoint to Kangchenjunga's south face accessible on foot",
    region: "Himalayas", state: "Sikkim", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "9 days", durationRange: "9 Days",
    distance: "65km", distanceRange: "65 km", altitude: "4,607m (Viewpoint 1)",
    baseCamp: "Yuksom",
    bestSeason: "Mar–May, Sep–Nov", bestMonths: ["Mar","Apr","May","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/goechala.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/goechala.jpeg"],
    lat: 27.58704, lng: 88.18714,
    description: "Goechala is Sikkim's premier trek — 9 days through the Kanchendzonga National Park to **Viewpoint 1 at about 4,600m, facing the south wall of Kangchenjunga** (Goecha La itself, at 4,940m, is closed to trekkers), the world's third highest mountain, which **fills the entire horizon at arm's reach**. On the way, **the rhododendron forest between Yuksom and Dzongri** is among the most biodiverse — and globally rare — on Earth.",
    whoFor: "You've slept above 4,000m without getting properly sick · You can take 9 days on the trail, plus a 7–8 hour drive each way from Bagdogra to Yuksom · You'll start at 2–3am for Kangchenjunga at sunrise from View Point 1 · Trekkers' huts and tents are fine: cold nights near 4,000m",
    whoNot: "You'd go without a licensed Sikkim guide: it's mandatory, and permits depend on it · You're going in Jun–Aug: the monsoon closes the route · You have a heart, lung or blood-pressure condition without a doctor's OK for 5,000m",
    safetyNotes: "All trekkers must have inner-line permits for Kanchendzonga NP (arrange in Gangtok or Yuksom). Go with a licensed Sikkim guide — mandatory. No solo trekking permitted.",
    ace: { stamina:5, power:3, strength:4, agility:3, water:1, altitude:5, focus:4, nerve:3 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹20,000", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/goechala-trek" },
      { name: "Indiahikes", verified: true, priceFrom: "₹20,000", googleRating: 4.8, website: "https://indiahikes.com/goechala" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹21,000", googleRating: 4.7, website: "https://trekthehimalayas.com/goechala-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹20,000", googleRating: 4.3, website: "https://www.trekupindia.com/goechala-trek" },
    ],
    tags: ["Sikkim", "Kangchenjunga", "Goechala", "rhododendron", "national park"], featured: false, editorChoice: true,
  },
  {
    id: "csv-15", slug: "hampta-pass",
    ert: { e: 3, r: 3, t: 2 },
    name: "Hampta Pass Trek", tagline: "Cross from Kullu's green valleys to the moonscape of Spiti in 5 days",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5–6 Days",
    distance: "25km", distanceRange: "24–26 km", altitude: "4,298m",
    baseCamp: "Manali / Jobra",
    bestSeason: "Jun–Sep", bestMonths: ["Jun","Jul","Aug","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/hampta-pass.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/hampta-pass.jpeg"],
    lat: 32.2615, lng: 77.3492,
    description: "Hampta Pass is one of India's great trek contrasts: **the Kullu side lush, green and flowery, the Spiti side barren, stark and Mars-like**. The crossing at 4,298m joins the two worlds in a single dramatic day, and **the landscape flips from green to bare brown in one step** as you crest it — one of the sharpest ecological transitions in Himalayan trekking. **Adding Chandratal** makes it a complete experience.",
    whoFor: "You want your first pass crossing, starting from Manali · You can walk 5–7 hours a day, including one long snowy pass day · Wading knee-deep through cold streams is fine (poles help) · You want green Kullu turning into desert Lahaul in a day, often with Chandratal added",
    whoNot: "Cold-water stream crossings put you off: they're unavoidable on the Kullu side · You want solitude: it's Himachal's busiest pass trek in Jul–Aug",
    safetyNotes: "Stream crossings on Jobra side are knee-deep in monsoon — use trekking poles. Snow on pass even in August — carry extra layers. Check pass conditions with local operators before departure.",
    ace: { stamina:3, power:3, strength:3, agility:3, water:3, altitude:4, focus:3, nerve:2 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹14,000", googleRating: 4.8, website: "https://indiahikes.com/hampta-pass" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹12,500", googleRating: 4.7, website: "https://trekthehimalayas.com/hampta-pass-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹12,000", googleRating: 4.3, website: "https://www.trekupindia.com/hampta-pass-trek" },
    ],
    tags: ["Hampta Pass", "Spiti", "Kullu", "Himachal Pradesh", "contrast"], featured: false,
  },
  {
    id: "csv-16", slug: "har-ki-dun",
    ert: { e: 2, r: 2, t: 1 },
    name: "Har Ki Dun Trek", tagline: "The valley of the gods in ancient Garhwal — where the Pandavas ascended to heaven",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5 Days",
    distance: "46km", distanceRange: "46 km", altitude: "3,500m",
    baseCamp: "Taluka",
    bestSeason: "Mar–Jun, Sep–Dec", bestMonths: ["Mar","Apr","May","Jun","Sep","Oct","Nov","Dec"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/har-ki-dun.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/har-ki-dun.jpeg"],
    lat: 31.14813, lng: 78.43242,
    description: "Har Ki Dun — 'valley of gods' — is one of Garhwal's most beautiful cradle valleys, ringed by Swargarohini, Black Peak and the Fateh Parvat massif. **The valley floor with Swargarohini I towering above** is one of the finest campsite views in the Himalaya, and **ancient wooden temples and the sun-worshipping Har Ki Dun village** are a rare window into traditional mountain life, amid pristine forest.",
    whoFor: "You can walk 11–12 km a day on a gradual valley trail · You like old villages and wooden temples: Osla and Seema are on the way · You want a long-season trek without a high pass: it runs Mar–Jun and Sep–Dec · Good walking fitness is enough: nothing technical",
    whoNot: "You want a summit or a pass: it's a valley walk to a meadow · Long drives make you sick: Dehradun to Sankri is 8–10 hours each way",
    safetyNotes: "Trail is well-defined. River crossings on log bridges — check stability. Forest sections can be confusing — stay on main trail.",
    ace: { stamina:4, power:2, strength:4, agility:3, water:1, altitude:3, focus:3, nerve:2 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹14,000", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/har-ki-dun-trek" },
      { name: "Indiahikes", verified: true, priceFrom: "₹15,000", googleRating: 4.8, website: "https://indiahikes.com/har-ki-dun-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹13,500", googleRating: 4.7, website: "https://trekthehimalayas.com/har-ki-dun-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹13,000", googleRating: 4.3, website: "https://www.trekupindia.com/har-ki-dun-trek" },
    ],
    tags: ["Har Ki Dun", "valley", "Uttarakhand", "cultural", "Swargarohini"], featured: false,
  },
  {
    id: "csv-17", slug: "kashmir-great-lakes",
    ert: { e: 3, r: 3, t: 1 },
    name: "Kashmir Great Lakes Trek", tagline: "Seven high-altitude lakes in one of India's most beautiful alpine circuits",
    region: "Himalayas", state: "Jammu & Kashmir", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "7 days", durationRange: "7 Days",
    distance: "66km", distanceRange: "66 km", altitude: "4,191m",
    baseCamp: "Sonamarg",
    bestSeason: "Jul–Aug", bestMonths: ["Jul","Aug"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kashmir-great-lakes.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kashmir-great-lakes.jpeg"],
    lat: 34.40452, lng: 75.09619,
    description: "The Kashmir Great Lakes trek circuits **seven alpine lakes — Vishansar, Krishansar, Gangabal, Nundkol and more** — through remote valleys, high passes and wildflower meadows. Each lake is **a different shade of turquoise, emerald and cobalt**, set among glacier-polished peaks, and **the 6–8 week season (July–August)** keeps crowds manageable and snow on the passes dramatic.",
    whoFor: "You can walk 9–13 km a day for 6 days, with three passes · You've slept above 3,500m without getting properly sick · A week of tent camping is fine · You can go in Jul–Aug, the only window",
    whoNot: "You won't carry original ID: army checkposts on the route check it several times · You need phone signal: prepaid SIMs from outside J&K don't work there (postpaid does) · You can only go in June or September: the route is usually closed",
    safetyNotes: "Gadsar Pass (4,191m) involves snow even in August — carry microspikes. The route requires permits from authorities in Srinagar/Sonamarg. Go with a registered Kashmiri guide.",
    ace: { stamina:4, power:3, strength:4, agility:3, water:2, altitude:4, focus:3, nerve:3 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹20,000", googleRating: 4.9, website: "https://indiahikes.com/kashmir-great-lakes-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹21,000", googleRating: 4.8, website: "https://trekthehimalayas.com/kashmir-great-lakes-trek" },
    ],
    tags: ["Kashmir", "alpine lakes", "Gadsar Pass", "short season", "high altitude"], featured: true, editorChoice: true,
  },
  {
    id: "csv-18", slug: "kedartal",
    name: "Kedartal Trek", tagline: "A glacial lake at 15,000ft reflecting Thalaysagar's perfect pyramid",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "7 days", durationRange: "7 Days",
    distance: "32km", distanceRange: "32 km", altitude: "4,720m",
    baseCamp: "Gangotri",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kedar-tal.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kedar-tal.jpeg"],
    lat: 30.9500, lng: 79.1167,
    description: "Kedartal (Shiva's Lake) sits at 4,720m in the Gangotri region — **a dark glacial tarn reflecting the perfect pyramid of Thalaysagar**, at its most stunning in the still water at dawn. The trail from Gangotri is **among the most demanding non-technical routes in Garhwal, climbing 2,500m over boulder-strewn terrain**, so reaching it is genuinely earned.",
    whoFor: "You've slept above 4,000m without getting properly sick · Scrambling over boulders, using your hands, doesn't faze you · Heights are fine: the Spider Wall traverse is a narrow path above a big drop · Camping only: sub-zero nights at the lake",
    whoNot: "It's your first Himalayan trek · You're afraid of heights · You want a gentle start: it climbs about 1,300m of steep trail in 2–3 days from Gangotri",
    safetyNotes: "Trail involves Class 2 scrambling on loose boulders above Kedarkharak. No rescue access. Go with experienced local guide from Gangotri.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:2, altitude:4, focus:4, nerve:4 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹15,000", googleRating: 4.8, website: "https://indiahikes.com/kedartal" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹16,000", googleRating: 4.7, website: "https://trekthehimalayas.com/kedar-tal-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹15,000", googleRating: 4.3, website: "https://www.trekupindia.com/kedartal-trek" },
    ],
    tags: ["glacial lake", "Gangotri", "Thalaysagar", "Uttarakhand", "difficult"], featured: false,
  },
  {
    id: "csv-19", slug: "kuari-pass",
    ert: { e: 2, r: 2, t: 1 },
    name: "Kuari Pass Trek", tagline: "Lord Curzon's Trail — a classic winter traverse with unbroken Himalayan panoramas",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "21km", distanceRange: "21 km", altitude: "3,812m",
    baseCamp: "Dhak",
    bestSeason: "Dec–Mar", bestMonths: ["Dec","Jan","Feb","Mar"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kuari-pass.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kuari-pass.jpeg"],
    lat: 30.44526, lng: 79.57533,
    description: "Kuari Pass — **formerly Lord Curzon's Trail** — offers arguably **the finest single view on a moderate Himalayan trek**: from the 3,815m pass, **Nanda Devi, Dronagiri, Kamet, Hathi Parbat and Dunagiri** — the whole Garhwal Himalaya — line one horizon. It's also **a superb winter trek with reliable snow**.",
    whoFor: "First winter trek: snow walking, no technical skill · You can walk 5–6 hours in snow with a daypack · Winter camping is fine: nights down to −15°C · You want Nanda Devi, Dronagiri and Kamet in one view",
    whoNot: "You hate being cold: it's a winter trek, Dec–Mar · Long drives make you sick: Rishikesh to Joshimath is 9–10 hours · You're picturing green meadows: in season, it's all snow",
    safetyNotes: "Winter nights drop to -15°C. Carry proper sleeping gear. Trail is well-managed but snow can be deep — go with an operator who carries avalanche safety basics.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹10,500", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/Kuari-pass-trek" },
      { name: "Indiahikes", verified: true, priceFrom: "₹12,000", googleRating: 4.8, website: "https://indiahikes.com/kuari-pass" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹11,900", googleRating: 4.7, website: "https://trekthehimalayas.com/kuari-pass-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹10,000", googleRating: 4.3, website: "https://www.trekupindia.com/kuari-pass-trek" },
    ],
    tags: ["Kuari Pass", "winter trek", "Nanda Devi view", "Uttarakhand", "panorama"], featured: false,
  },
  {
    id: "csv-20", slug: "markha-valley",
    ert: { e: 3, r: 3, t: 1 },
    name: "Markha Valley Trek", tagline: "Remote Ladakhi villages, river crossings, and a 5,260m pass in one circuit",
    region: "Himalayas", state: "Ladakh", type: "Trekking", difficulty: "Moderate",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5 Days",
    distance: "66km", distanceRange: "66 km", altitude: "5,260m (Kongmaru La)",
    baseCamp: "Chilling",
    bestSeason: "May–Sep", bestMonths: ["May","Jun","Jul","Aug","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/markha-valley.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/markha-valley.jpeg"],
    lat: 33.79046, lng: 77.61753,
    description: "The Markha Valley trek crosses the heart of Ladakh on foot, past **poplars, monasteries, chortens and nomadic herder camps** — like walking through a living thangka painting — with river crossings and isolation found nowhere else in India. It tops out at **Kongmaru La (5,260m), with Stok Kangri and the Karakoram behind you** — one of the great Ladakhi summit moments.",
    whoFor: "You can spend 3 nights in Leh acclimatising before you start · You can cross Kongmaru La at 5,260m: a long day starting before dawn · Village homestays suit you: beds, home cooking, very basic toilets · Wading cold rivers, sometimes thigh-deep in July, is fine (poles help)",
    whoNot: "You'd fly into Leh and start straight away: skipping acclimatisation is how people get sick here · You have a heart, lung or blood-pressure condition without a doctor's OK for 5,200m · You need phone signal: prepaid SIMs from outside Ladakh and J&K don't work (postpaid does)",
    safetyNotes: "River crossings at Chilling and Skiu can be thigh-deep in July — use poles. Acclimatise minimum 3 nights in Leh before starting. Kongmaru La (5,260m) is serious altitude.",
    ace: { stamina:4, power:2, strength:4, agility:3, water:3, altitude:5, focus:3, nerve:2 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹22,500", googleRating: 4.8, website: "https://trekthehimalayas.com/markha-valley-trek" },
    ],
    tags: ["Ladakh", "Markha Valley", "river crossings", "Kongmaru La", "remote"], featured: false, editorChoice: true,
  },
  {
    id: "csv-21", slug: "pin-parvati-pass",
    ert: { e: 5, r: 4, t: 3 },
    name: "Pin Parvati Pass Trek", tagline: "Cross the most demanding Himalayan pass connecting Kullu to Spiti at 17,457ft",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Advanced",
    duration: "7+ days", durationDays: "9 days", durationRange: "9 Days",
    distance: "81km", distanceRange: "81 km", altitude: "5,319m",
    baseCamp: "Barshaini",
    bestSeason: "Jul–Aug", bestMonths: ["Jul","Aug"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pin-parvati.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pin-parvati.jpeg"],
    lat: 31.83640, lng: 77.84517,
    description: "Pin Parvati is **India's most technically demanding high-altitude trek** — 9 days over **a 5,319m glaciated pass dividing the green Parvati Valley from the arid, lunar Pin Valley** in Spiti. The route involves glacier traversal, crevasse navigation and near-vertical snow ascents, and **the glacier crossing itself** is one of the most dramatic non-mountaineering experiences in the Indian Himalaya.",
    whoFor: "You've crossed a snow pass above 5,000m before · You can use crampons and an ice axe, and walk roped on a crevassed glacier · You can do a 10–14 hour pass day after a week of walking · You can take 11–12 days off: 9 on the trail, the drive in to Barshaini and out from Mud, and a spare day for weather",
    whoNot: "It would be your first hard trek · You'd go with an operator without certified mountain guides and rope teams · Your dates can't move: weather on the pass decides the crossing day",
    safetyNotes: "Glacier crossing requires crampons, ropes, and ice axes. Crevasse risk is real — never cross without a rope team. Book with an operator who employs certified mountain guides.",
    ace: { stamina:5, power:4, strength:5, agility:5, water:4, altitude:5, focus:5, nerve:5 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹40,000", googleRating: 4.8, website: "" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹45,000", googleRating: 4.7, website: "https://trekthehimalayas.com/pin-parvati-pass-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹35,000", googleRating: 4.3, website: "https://www.trekupindia.com/pin-parvati-pass-trek" },
    ],
    tags: ["Pin Parvati", "glacier", "Spiti", "Himachal Pradesh", "expert"], featured: false, editorChoice: true,
  },
  {
    id: "csv-22", slug: "rupin-pass",
    ert: { e: 4, r: 3, t: 2 },
    name: "Rupin Pass Trek", tagline: "Waterfall campsites, snow tunnels, and a 15,250ft pass above the Rupin gorge",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "8 days", durationRange: "7–8 Days",
    distance: "44km", distanceRange: "37–52 km", altitude: "4,651m",
    baseCamp: "Dhaula",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/rupin-pass.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/rupin-pass.jpeg"],
    lat: 31.2500, lng: 78.1500,
    description: "Rupin Pass is one of India's most visually spectacular routes — through hanging meadows, natural snow bridges and a steep gully climb to a 4,651m pass facing **the Kinnaur Kailash range**. **The Upper Waterfall campsite, with a 1,500ft cascade beside your tent**, is one of the most dramatic camps in India, and **the snow tunnel crossing below the pass (May–June)** is unique and exhilarating.",
    whoFor: "You've done a multi-day trek before and slept above 4,000m · You can manage a 10–12 hour pass day up a steep snow gully · You can walk on snow slopes in microspikes, following the guide's line · You want variety: a village built on a cliff, waterfall camps, snowfields",
    whoNot: "It's your first Himalayan trek · Your knees hate long descents: the way down to Sangla is long and steep · Being cold and wet gets to you: the waterfall campsite is both",
    safetyNotes: "Pass gully is 45°+ in early season — crampons may be needed. Waterfall campsite is cold and wet — waterproof gear essential.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:2, altitude:4, focus:4, nerve:4 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹16,650", googleRating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/rupin-pass-trek" },
      { name: "Indiahikes", verified: true, priceFrom: "₹16,000", googleRating: 4.8, website: "https://indiahikes.com/rupin-pass" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹16,500", googleRating: 4.7, website: "https://trekthehimalayas.com/rupin-pass-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹16,000", googleRating: 4.3, website: "https://www.trekupindia.com/rupin-pass-trek" },
    ],
    tags: ["Rupin Pass", "waterfall", "snow tunnel", "Uttarakhand", "gully climb"], featured: false,
  },
  {
    id: "csv-23", slug: "valley-of-flowers",
    ert: { e: 1, r: 2, t: 1 },
    name: "Valley of Flowers & Hemkund Trek", tagline: "UNESCO meadow of 500 wildflower species and a Sikh shrine at 14,100ft",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "41km", distanceRange: "41 km", altitude: "4,329m (Hemkund Sahib)",
    baseCamp: "Pulna",
    bestSeason: "Jul–Sep", bestMonths: ["Jul","Aug","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/valley-of-flowers.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/valley-of-flowers.jpeg"],
    lat: 30.70568, lng: 79.59586,
    description: "The Valley of Flowers is **a UNESCO World Heritage Site** — an 87.5 sq km alpine meadow in the Zanskar range where **over 500 species of wildflowers** bloom in the monsoon. In July–August it's **a wall-to-wall carpet of Himalayan blue poppy, Brahmakamal, cobra lily** and hundreds more, with nowhere else on Earth like it. Combined with **the sacred Hemkund Sahib Gurudwara at 4,329m**, it is one of India's most spiritually and botanically extraordinary treks.",
    whoFor: "Walking in rain is fine: the valley is only open in the monsoon, Jul–Sep · You can walk about 10 km uphill from Pulna to Ghangaria, then do day hikes from there · Lodge beds suit you: you stay in Ghangaria village, not in tents · You want the flowers at their peak: late July to mid-August · Hemkund Sahib is an optional hard day: about 1,200m of steep climbing to 4,329m",
    whoNot: "Your dates can't move: monsoon landslides often block the road to Govindghat · You want to camp in the valley: overnight stays inside the park aren't allowed · Your knees hate long descents and you plan to do Hemkund: the way down is steep",
    safetyNotes: "Hemkund staircase is steep and relentless. Take it slow — the thin air at 4,329m compounds the effort. Valley of Flowers closed November–April.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:4, focus:2, nerve:2 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹11,000", googleRating: 4.8, website: "https://indiahikes.com/valley-of-flowers-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹11,800", googleRating: 4.7, website: "https://trekthehimalayas.com/valley-of-flowers-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹11,000", googleRating: 4.3, website: "https://www.trekupindia.com/valley-of-flowers-trek" },
    ],
    tags: ["Valley of Flowers", "UNESCO", "wildflowers", "Hemkund", "Uttarakhand"], featured: false, editorChoice: true,
  },
  {
    id: "csv-24", slug: "bajre-dara",
    ert: { e: 1, r: 3, t: 1 },
    name: "Bajre Dara Trek", tagline: "A hidden Sikkim gem through rhododendron forests to a windswept high-altitude meadow",
    region: "Himalayas", state: "Sikkim", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5 Days",
    distance: "22km", distanceRange: "22 km", altitude: "3,353m",
    baseCamp: "Yuksom",
    bestSeason: "Nov–Mar", bestMonths: ["Nov","Dec","Jan","Feb","Mar"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bajre-dara.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/bajre-dara.jpeg"],
    lat: 27.25, lng: 88.25,
    description: "Bajre Dara is one of Sikkim's lesser-known winter treks, through dense rhododendron and oak forest, ancient monasteries and traditional Sikkimese villages to a high meadow ridgeline. Its **winter views of the Kangchenjunga massif, framed by frost-silvered rhododendrons**, are among the finest in Sikkim, and **the near-total absence of other trekkers** makes it feel entirely your own.",
    whoFor: "You want a quiet Sikkim trek in winter, away from the Goechala crowds · You can walk 5–6 hours a day with a daypack · Winter camping is fine: nights below freezing, icy trail in Jan–Feb · You'd like Yuksom's monasteries and villages along with Kangchenjunga views",
    whoNot: "You hate being cold: it's a winter trek · You want rhododendrons in bloom: that's spring, outside this trek's season · Long drives make you sick: Bagdogra to Yuksom is 7–8 hours",
    safetyNotes: "Winter temperatures can drop sharply at night — quality sleeping bag essential. Trail can be icy in January and February. Carry a local guide from Yuksom.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹12,600", googleRating: 4.7, website: "https://trekthehimalayas.com/Bajre-Dara-trek" },
    ],
    tags: ["Sikkim", "winter trek", "rhododendron", "Kangchenjunga", "meadow"], featured: false,
  },
  {
    id: "csv-25", slug: "chandrakhani-pass",
    ert: { e: 2, r: 2, t: 1 },
    name: "Chandrakhani Pass Trek", tagline: "Cross a dramatic Kullu pass with views across Malana and the Parvati Valley",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Hard",
    duration: "Weekend", durationDays: "2 days", durationRange: "2 Days",
    distance: "13km", distanceRange: "13 km", altitude: "3,650m",
    baseCamp: "Rumsu",
    bestSeason: "May–Sep", bestMonths: ["May","Jun","Jul","Aug","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/chandrakhani-pass.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/chandrakhani-pass.jpeg"],
    lat: 32.06970, lng: 77.24295,
    description: "Chandrakhani Pass climbs steeply through deodar forest and alpine pasture from the Kullu Valley, with **panoramic views of Deo Tibba, Indrasan and the Parvati Valley peaks** and across the whole Kullu Valley from the top. It then descends into **Malana, a village with its own distinct language, customs and self-governance** — one of India's most isolated and culturally unique settlements, unlike anywhere else in the Himalaya.",
    whoFor: "A fit first-timer's Himalayan trek, with one steep climb to 3,648m · You can walk 5–6 hours a day with a daypack · You're curious about Malana, a village with its own laws and customs · You want Deo Tibba and the Pir Panjal from the pass",
    whoNot: "You can't follow strict local rules: in Malana you must not touch walls, temples or people, and fines apply · You're going in Jul–Aug: monsoon fog often hides the views · You want high altitude or snow",
    safetyNotes: "Malana has strict cultural customs — follow all local rules about touching village structures or entering certain areas. Pass can be foggy in July–August monsoon. Carry extra rain gear.",
    ace: { stamina:3, power:2, strength:3, agility:3, water:1, altitude:3, focus:3, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹11,200", googleRating: 4.7, website: "https://trekthehimalayas.com/chandrakhani-pass-trek" },
    ],
    tags: ["Kullu", "Malana", "Himachal Pradesh", "pass", "culture"], featured: false,
  },
  {
    id: "csv-26", slug: "dodital-darwa-pass",
    ert: { e: 2, r: 2, t: 1 },
    name: "Dodital – Darwa Pass Trek", tagline: "A sacred Himalayan lake, ancient oak forests, and a high pass in Uttarakhand's Uttarkashi",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "6 days", durationRange: "6 Days",
    distance: "44km", distanceRange: "44 km", altitude: "4,150m",
    baseCamp: "Sangam Chatti",
    bestSeason: "May–Jun, Sep–Nov", bestMonths: ["May","Jun","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/dodital.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/dodital.jpeg"],
    lat: 30.89822, lng: 78.49873,
    description: "Dodital is one of Uttarakhand's most sacred freshwater lakes, **said to be the birthplace of Lord Ganesha** — **clear, serene water framed by dense forest and snow peaks**. The trek weaves through magnificent oak, rhododendron and walnut forest to the lake, then adds real mountain drama over **Darwa Pass (4,150m)**, whose **views of Bandarpunch and Black Peak** are among the finest in the Uttarkashi region.",
    whoFor: "You like forest walking that opens out to a 4,150m pass with Bandarpunch views · You can walk 5–6 hours a day with a daypack · Tent camping is fine: cold nights near the pass · A shorter drive suits you: Uttarkashi is about 6 hours from Rishikesh",
    whoNot: "You want the lake to yourself in May–Jun: pilgrims crowd Dodital · You're going before late May without snow gear: Darwa Pass can still hold deep snow · Wobbly log bridges over streams bother you",
    safetyNotes: "Darwa Pass can hold snow until late May. Dodital gets crowded during pilgrim season — camp early to secure a good spot. Trail well-marked but forest sections can be confusing.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:2, altitude:4, focus:2, nerve:2 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹11,500", googleRating: 4.7, website: "https://trekthehimalayas.com/dodital-darwa-pass-trek" },
    ],
    tags: ["Dodital", "Darwa Pass", "Uttarkashi", "sacred lake", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-27", slug: "doodhpathri",
    ert: { e: 2, r: 3, t: 1 },
    name: "Doodhpathri Trek", tagline: "Kashmir's meadow of milk — rolling grasslands and rivers in a pristine alpine valley",
    region: "Himalayas", state: "Jammu & Kashmir", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "7 days", durationRange: "7 Days",
    distance: "49km", distanceRange: "49 km", altitude: "2,730m",
    // Hand-set ACE (was estimated from the grade): meadow walking under 2,800 m
    ace: { stamina:2, power:1, strength:1, agility:1, water:1, altitude:2, focus:1, nerve:1 },
    baseCamp: "Doodhpathri",
    bestSeason: "Jul–Aug", bestMonths: ["Jul","Aug"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/doodhpathri.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/doodhpathri.jpeg"],
    lat: 33.72, lng: 74.52,
    description: "Doodhpathri — 'valley of milk' — is one of Kashmir's most spectacular yet least-visited high meadow destinations. Over 7 days you cross **vast, unbroken meadows rolling green for miles beneath the Pir Panjal**, shepherd-grazed grasslands, pine forest and **milky glacial streams that give the valley its name**. It's Kashmir at its most pastoral and peaceful, and **the absence of tourist infrastructure keeps it wild**.",
    whoFor: "You want Kashmir's meadows without any altitude: it stays under 2,800m · You can walk 6–7 hours a day on easy to moderate trails · You'd like to see how Gujjar and Bakarwal shepherds live in summer · Basic camping in remote valleys is fine",
    whoNot: "You want snow peaks, glaciers or high passes · You need phone signal: prepaid SIMs from outside J&K don't work there (postpaid does) · You want any comforts: it's tents and shepherd huts",
    safetyNotes: "Permits required for foreign nationals. Trail is remote — carry extra food and a guide from Srinagar/Doodhpathri. Weather can change rapidly in August.",
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹16,800", googleRating: 4.7, website: "https://trekthehimalayas.com/doodhpathri-Trek" },
    ],
    tags: ["Doodhpathri", "Kashmir", "meadow", "Pir Panjal", "remote"], featured: false,
  },
  {
    id: "csv-28", slug: "gokyo-lakes",
    ert: { e: 4, r: 2, t: 1 },
    name: "Gokyo Lakes Trek", tagline: "Turquoise high-altitude lakes and Gokyo Ri's panorama of four 8,000m peaks",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "10 days", durationRange: "10 Days",
    distance: "86km", distanceRange: "86 km", altitude: "5,357m",
    baseCamp: "Lukla",
    bestSeason: "Mar–May, Oct", bestMonths: ["Mar","Apr","May","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gokyo-lakes.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gokyo-lakes.jpeg"],
    lat: 27.95409, lng: 86.69459,
    description: "The Gokyo Lakes trek crosses the Khumbu to **a string of turquoise glacial lakes above 4,700m below the Ngozumpa Glacier** — one of Nepal's most photographed high-altitude scenes. It culminates on **Gokyo Ri (5,357m)**, where sunrise puts **four 8,000m peaks — Everest, Lhotse, Makalu and Cho Oyu — in one panorama**.",
    whoFor: "You can hike 6 hours with 1,000m of climbing, two days running · You've slept above 3,500m (Leh, Spiti) without getting properly sick · You can take 13–14 days off: 10 on the trail, a day in Kathmandu each side, and 1–2 spare days for Lukla flights · You want Everest views with fewer people than the Base Camp trail · Basic lodges are fine: shared toilets, unheated rooms, nights of −10°C at Gokyo",
    whoNot: "You have a heart, lung or blood-pressure condition without a doctor's OK for 5,300m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: weather cancels Lukla flights often, sometimes for days · Small planes scare you: the only quick way in is a flight to Lukla's mountain airstrip",
    safetyNotes: "Altitude sickness risk above 4,000m — strict acclimatization schedule essential. Ngozumpa Glacier crossing to reach higher lakes is crevassed — do not attempt solo. Nepal trekking permits required.",
    ace: { stamina:4, power:3, strength:4, agility:3, water:1, altitude:5, focus:4, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹97,000", googleRating: 4.8, website: "https://trekthehimalayas.com/everest-base-camp-via-gokyo-ri" },
    ],
    tags: ["Gokyo", "Nepal", "Khumbu", "Gokyo Ri", "glacial lakes"], featured: false, editorChoice: true,
  },
  {
    id: "csv-29", slug: "gulabi-kantha",
    name: "Gulabi Kantha Trek", tagline: "A pink-flowered ridge above Uttarkashi with views of the Gangotri group",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5 Days",
    distance: "24km", distanceRange: "24 km", altitude: "4,023m",
    baseCamp: "Hanuman Chatti",
    bestSeason: "Mar–Jun, Sep–Nov", bestMonths: ["Mar","Apr","May","Jun","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gulabi-kantha.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gulabi-kantha.jpeg"],
    lat: 30.81, lng: 78.52,
    description: "Gulabi Kantha — 'pink ridge' — is named for **the spring rhododendron bloom that turns entire hillsides deep pink** against the white Gangotri peaks. From its 4,023m ridgeline the views sweep across **Kedarnath, Kedardome and Meru**, and as **a relatively short, accessible route for its altitude**, it's one of Uttarkashi's most rewarding moderate treks.",
    whoFor: "You have only 5 days and want one big climb to 4,000m · You can climb steeply for 5–6 hours with a daypack · You want close views of Bandarpunch and Swargarohini · Tent camping is fine: nights near freezing at the top, even in summer",
    whoNot: "Long drives make you sick: Dehradun to Hanuman Chatti is 6–7 hours · You're going in the monsoon: the steep trail gets slippery",
    safetyNotes: "Trail can be slippery after rain in monsoon shoulder months. Night temperatures drop sharply at 4,000m even in summer — sleeping bag essential.",
    ace: { stamina:2, power:2, strength:2, agility:2, water:1, altitude:4, focus:2, nerve:2 }, // 4,023 m top: altitude 4, like other treks above 4,000 m
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹10,900", googleRating: 4.7, website: "https://trekthehimalayas.com/gulabi-kantha-trek" },
    ],
    tags: ["Gulabi Kantha", "rhododendron", "Gangotri", "Uttarkashi", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-30", slug: "kareri-lake",
    name: "Kareri Lake Trek", tagline: "A glacial lake below the Dhauladhar — Dharamshala's dramatic high-altitude backyard",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "3 days", durationRange: "3 Days",
    distance: "13km", distanceRange: "13 km", altitude: "2,936m",
    baseCamp: "Kareri",
    bestSeason: "May–Jun, Sep–Nov", bestMonths: ["May","Jun","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kareri-lake.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/kareri-lake.jpeg"],
    lat: 32.32565, lng: 76.27389,
    description: "Kareri Lake sits in a glacial cirque at 2,936m **directly below the snow-clad Dhauladhar**, just 3 days from Dharamshala. The trail passes oak and rhododendron forest, open meadows and **a traditional Gaddi shepherd village** before reaching the **blue-green lake**, and **the contrast of green hills below and the stark snowline above** makes it one of Himachal's most dramatic short treks — and **a perfect first Himalayan trek**.",
    whoFor: "You're in Dharamshala or McLeod Ganj and have 3 days · You can walk 5–6 hours a day with a daypack · First trek: a lake under the Dhauladhar range, no altitude worries · Tent camping is fine: cold nights at the lake, even in September",
    whoNot: "You want big Himalayan views or altitude: it tops out under 3,000m · You're going in June without care: snowmelt makes the river crossings strong",
    safetyNotes: "River crossings above Kareri village can be challenging in June snowmelt — check conditions. Campsite at the lake is exposed — cold nights even in September.",
    ace: { stamina:3, power:2, strength:3, agility:3, water:2, altitude:2, focus:2, nerve:2 }, // tops out at 2,936 m: altitude 2
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹8,000", googleRating: 4.7, website: "https://www.bikatadventures.com/Home/Itinerary/kareri-lake-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹5,500", googleRating: 4.7, website: "https://trekthehimalayas.com/kareri-lake-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹8,000", googleRating: 4.3, website: "https://trekupindia.com/trek/kareri-lake" },
    ],
    tags: ["Kareri Lake", "Dhauladhar", "Dharamshala", "Himachal Pradesh", "beginner"], featured: false,
  },
  {
    id: "csv-31", slug: "khopra-danda",
    name: "Khopra Danda Trek", tagline: "A quiet Annapurna ridge with front-row views of Dhaulagiri and Annapurna South",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "8 days", durationRange: "8 Days",
    distance: "81km", distanceRange: "81 km", altitude: "3,636m",
    baseCamp: "Nayapul",
    bestSeason: "Mar–May, Sep–Nov", bestMonths: ["Mar","Apr","May","Sep","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/khopra-danda.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/khopra-danda.jpeg"],
    lat: 28.47208, lng: 83.70860,
    description: "Khopra Danda is a hidden gem of the Annapurna Conservation Area — **a quieter alternative to ABC and the Annapurna Circuit, with far fewer trekkers**. Its ridge teahouse at 3,636m has a 360° panorama, and **at dawn, Dhaulagiri to the west and the entire Annapurna South face to the east** make it one of Nepal's great unsung viewpoints.",
    whoFor: "You want Annapurna and Dhaulagiri views without the crowds of the big trails · You can climb steep forest trail for 5–6 hours with a daypack · Simple community lodges are fine: dorm rooms, dal bhat, few hot showers · You can take 9–10 days off: 8 on the trail, plus the drive from Pokhara and a spare day · You're Indian: no visa needed, just a passport or voter ID",
    whoNot: "You plan to walk without a guide: the trail above Swanta is poorly marked · You want plenty of lodge choice and comforts: the villages here are small · You're going in the monsoon (Jun–Aug): leeches, and cloud hides the views",
    safetyNotes: "ACAP permit required. Some sections above Swanta are poorly marked — guide recommended. Cold nights at ridge camp even in April.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹40,000", googleRating: 4.7, website: "https://trekthehimalayas.com/KhopraRidge" },
    ],
    tags: ["Khopra Danda", "Annapurna", "Dhaulagiri", "Nepal", "ridge"], featured: false,
  },
  {
    id: "csv-32", slug: "lobuche-peak",
    name: "Lobuche Peak Climb", tagline: "A classic Khumbu mountaineering peak with Everest views from 6,119m",
    region: "Himalayas", state: "Nepal", type: "Mountaineering", difficulty: "Advanced",
    duration: "7+ days", durationDays: "18 days", durationRange: "18 Days",
    distance: "124km", distanceRange: "124 km", altitude: "6,119m",
    // Hand-set ACE (was estimated from the grade): 6,119 m climb: fixed ropes, crampons, ice axe
    ace: { stamina:5, power:5, strength:5, agility:5, water:0, altitude:5, focus:5, nerve:5 },
    bestSeason: "Apr–May, Oct", bestMonths: ["Apr","May","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/lobuche-peak.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/lobuche-peak.jpeg"],
    lat: 27.93, lng: 86.79,
    description: "Lobuche East (6,119m) is one of Nepal's most sought-after trekking peaks — **a genuine mountaineering objective with fixed ropes, crampons and ice axe, yet achievable by fit, acclimatised non-climbers**. From the summit **the whole upper Khumbu spreads below — Everest's pyramid, the Khumbu Icefall and the Western Cwm**, with Nuptse, Lhotse, Makalu, Cho Oyu and Ama Dablam around: the summit of a lifetime for non-technical climbers.",
    whoFor: "You've been above 5,000m before and felt fine · You can use crampons, an ice axe and a jumar on fixed rope, or will train for it first · You can keep going 10–12 hours on summit day, starting before 3am · You can take 18–20 days off, with spare days for Lukla flights and summit weather",
    whoNot: "You've never been above 5,000m: do Everest Base Camp or Gokyo first · Steep exposure scares you: the summit ridge is steep with big drops · You have a heart, lung or blood-pressure condition without a doctor's OK for 6,000m · Your dates can't move: Lukla flights and summit weather both cause delays",
    safetyNotes: "Technical climb requiring professional mountain guide and full climbing equipment. Pre-climb acclimatization on Kala Patthar or Island Peak strongly recommended. NMA climbing permit required.",
    operators: [],
    tags: ["Lobuche", "Nepal", "Khumbu", "mountaineering", "6000m peak"], featured: false,
  },
  {
    id: "csv-33", slug: "manaslu-circuit",
    name: "Manaslu Circuit Trek", tagline: "A complete circuit of the world's eighth-highest mountain through remote Nepali villages",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "11 days", durationRange: "11 Days",
    distance: "134km", distanceRange: "134 km", altitude: "5,160m (Larkya La)",
    baseCamp: "Soti Khola",
    bestSeason: "Apr–May, Oct", bestMonths: ["Apr","May","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/manaslu-circuit.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/manaslu-circuit.jpeg"],
    lat: 28.66393, lng: 84.52040,
    description: "The Manaslu Circuit is Nepal's most compelling alternative to the Annapurna Circuit — 11 days around **the 8,163m Manaslu massif**, through **remote Gurung and Tibetan-influenced villages largely untouched by mass tourism**. Camp puts **Manaslu's ice-and-rock face across your entire field of vision**, and **the Larkya La (5,160m) rivals Thorong La for views and surpasses it for solitude**.",
    whoFor: "You've done a high trek before (EBC, Annapurna) and slept above 4,000m fine · You can walk 8–10 hours on pass day over Larkya La (5,160m), starting before dawn · You're going with at least one other trekker: the permit needs two people and a licensed guide · You can take 14–15 days off: 11 on the trail, a day in Kathmandu for the permit, a long jeep day in to Machha Khola and one out from Dharapani, and a spare day · You want quiet trails and simple village lodges",
    whoNot: "You're going solo or without a guide: permits for this restricted area won't be issued · You have a heart, lung or blood-pressure condition without a doctor's OK for 5,100m · Rough roads wreck you: it's 8–9 hours by jeep on mountain roads to the trailhead · Your dates can't move: snow can close Larke La for days",
    safetyNotes: "Restricted area permit required (MCAP + MRAP). Must trek with registered guide — no independent trekking permitted. Larke Pass crossing requires early morning start. Altitude illness risk above 4,500m.",
    ace: { stamina:5, power:3, strength:4, agility:3, water:1, altitude:5, focus:4, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹88,000", googleRating: 4.8, website: "https://trekthehimalayas.com/manaslu-circuit-trek" },
    ],
    tags: ["Manaslu", "Nepal", "Larke Pass", "remote", "circuit"], featured: false, editorChoice: true,
  },
  {
    id: "csv-34", slug: "mera-peak",
    name: "Mera Peak Expedition", tagline: "Nepal's highest trekking peak — five 8,000m giants from a 6,476m summit",
    region: "Himalayas", state: "Nepal", type: "Mountaineering", difficulty: "Advanced",
    duration: "7+ days", durationDays: "15 days", durationRange: "15 Days",
    distance: "100km", distanceRange: "100 km", altitude: "6,476m",
    // Hand-set ACE (was estimated from the grade): 6,476 m glaciated trekking peak, less technical than Lobuche
    ace: { stamina:5, power:5, strength:4, agility:4, water:0, altitude:5, focus:4, nerve:5 },
    bestSeason: "Apr–May, Oct", bestMonths: ["Apr","May","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/mera-peak.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/mera-peak.jpeg"],
    lat: 27.70, lng: 86.90,
    description: "Mera Peak (6,476m) is **the highest permitted trekking peak in Nepal** and the highest point open to non-technical climbers — mainly a glacier walk with crampons and ice axe, but its altitude demands exceptional acclimatisation and fitness. The reward is unrivalled: **five of the world's six highest mountains — Everest, Lhotse, Makalu, Cho Oyu and Kangchenjunga — visible at once** from a genuinely life-changing summit.",
    whoFor: "You've been above 5,000m before and felt fine · You can walk 8–10 hours in crampons, roped to others on a glacier (training given at base camp) · Tent nights well below −15°C at high camp are fine · You can take 16–18 days off, with spare days for Lukla flights and summit weather",
    whoNot: "You've never been above 5,000m: the summit is 6,476m · You've had altitude sickness above 4,500m · You have a heart, lung or blood-pressure condition without a doctor's OK for 6,500m · Your dates can't move: Lukla flights and summit weather both cause delays",
    safetyNotes: "NMA permit required. Must be accompanied by certified mountain guide at all times above base camp. Summit push is 8–10 hours on glacier — early start essential. Weather window narrow in Nepal.",
    operators: [],
    tags: ["Mera Peak", "Nepal", "mountaineering", "6000m", "highest trekking peak"], featured: false,
  },
  {
    id: "csv-35", slug: "panch-kedar",
    name: "Panch Kedar Trek", tagline: "A sacred 12-day pilgrimage circuit linking five Shiva shrines across Uttarakhand's high Himalayas",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "12 days", durationRange: "12 Days",
    distance: "107km", distanceRange: "107 km", altitude: "3,680m",
    baseCamp: "Rishikesh / Guptkashi",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/panch-kedar.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/panch-kedar.jpeg"],
    lat: 30.49, lng: 79.08,
    description: "The Panch Kedar pilgrimage links **five ancient Shiva temples** across the Garhwal Himalaya — Kedarnath, Madmaheshwar, Tungnath, Rudranath and Kalpeshwar — over 12 days of remote villages, alpine meadows and sacred mountain landscape. **Tungnath (3,680m), the world's highest Shiva temple, with Kedarnath and Chaukhamba behind it**, is among the most powerful moments in Indian trekking, and the circuit **connects Hindu mythology to Himalayan wilderness seamlessly**.",
    whoFor: "The five Shiva temples are the point: Kedarnath, Madhyamaheshwar, Tungnath, Rudranath, Kalpeshwar · You can take 12 days off and walk 10 km or more on most of them · Simple dharamshalas and village homestays are fine · You can handle one hard day to Rudranath: close to 2,000m of climbing",
    whoNot: "Crowds bother you: Kedarnath has huge pilgrim crowds in May–Jun · You're going from late October: the temples close for winter · You want a quiet wilderness trek: much of the way is a pilgrim route",
    safetyNotes: "Temples close by late October — verify opening dates before booking. Some sections between Rudranath and Kalpeshwar are poorly marked. Local guide strongly recommended for the full circuit.",
    ace: { stamina:5, power:3, strength:4, agility:3, water:1, altitude:4, focus:4, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹64,500", googleRating: 4.7, website: "https://trekthehimalayas.com/panchkedar-trek" },
    ],
    tags: ["Panch Kedar", "pilgrimage", "Tungnath", "Kedarnath", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-36", slug: "pangarchulla-peak",
    ert: { e: 3, r: 3, t: 3 },
    name: "Pangarchulla Peak Trek", tagline: "A summit climb above Auli with front-row views of Nanda Devi and the Kumaon giants",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "25km", distanceRange: "25 km", altitude: "4,590m",
    baseCamp: "Dhak",
    bestSeason: "Mar–Apr", bestMonths: ["Mar","Apr"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pangarchulla-peak.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pangarchulla-peak.jpeg"],
    lat: 30.42367, lng: 79.59214,
    description: "Pangarchulla (4,590m) is a winter and spring trekking peak above Auli, climbed with crampons and ice axe in snow — **a true summit without the commitment of a mountaineering expedition**. Its 360° panorama, best in **March–April snow with white Garhwal peaks in every direction**, takes in **Nanda Devi's double pyramid**, Dronagiri, Kamet, Mana and Hathi Ghoda: an elite viewpoint without the technical barriers of higher peaks.",
    whoFor: "You've slept above 3,500m (Kuari Pass, Kedarkantha) and want your first real snow summit · You can do a 10–12 hour summit day on snow, starting around 2am · You'll walk in microspikes or crampons (operators train you on the approach) · You can take 6–7 days off, Rishikesh to Rishikesh: 4 on the trail, a day's drive each way, and a spare summit day in Mar–Apr snow",
    whoNot: "You've never done a Himalayan trek · You're going after April: the snow melts and the summit block turns to loose rock · Long drives make you sick: Rishikesh to Joshimath is 9–10 hours",
    safetyNotes: "Snow conditions vary year to year — check with operators for March snowpack. Summit push in pre-dawn conditions requires headlamp and warm layers. Crampon training provided by operators on approach days.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:1, altitude:4, focus:4, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹13,250", googleRating: 4.7, website: "https://trekthehimalayas.com/pangarchulla-peak-trek" },
    ],
    tags: ["Pangarchulla", "Auli", "Nanda Devi", "snow trek", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-37", slug: "panwali-kantha",
    name: "Panwali Kantha Trek", tagline: "A high open ridge above Gangotri with sweeping views of Kedarnath dome and Thalaysagar",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "25km", distanceRange: "25 km", altitude: "3,394m",
    baseCamp: "Ghuttu",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/panwali-kantha.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/panwali-kantha.jpeg"],
    lat: 30.56968, lng: 78.86745,
    description: "Panwali Kantha is a sweeping high meadow ridge in Uttarkashi with **an open camp at 3,258m** facing the Gangotri group — **Kedarnath Dome, Thalaysagar and Jogin**. The wide ridge is **a rolling carpet of wildflowers in spring and golden grass in autumn**, the kind of view that makes you want to camp for a week, and it sees **very few other trekkers** — a meadow trekker's dream.",
    whoFor: "You want huge meadows and Kedarnath peak views with almost nobody else there · You can walk 5–6 hours a day with a daypack · Camping on an exposed meadow is fine: wind and cold at night",
    whoNot: "You'd go without a local guide: the trail beyond Ghuttu isn't marked · You want lodges or a busy trail: it's tents and very few people · You're going in autumn without spare water: sources up top are few",
    safetyNotes: "Trail is not well marked beyond Ghuttu — local guide essential. Meadow camp is completely exposed — carry quality tent and sleeping bag. Water sources limited in autumn.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹14,000", googleRating: 4.7, website: "https://www.bikatadventures.com/Home/Itinerary/panwali-kantha-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹14,500", googleRating: 4.7, website: "https://trekthehimalayas.com/panwali-kantha" },
    ],
    tags: ["Panwali Kantha", "meadow", "Gangotri group", "Uttarkashi", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-38", slug: "phulara-ridge",
    name: "Phulara Ridge Trek", tagline: "Trek along a high open ridge above Sankri with views of Swargarohini and Bandarpunch",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "6 days", durationRange: "6 Days",
    distance: "29km", distanceRange: "29 km", altitude: "3,696m",
    baseCamp: "Sankri",
    bestSeason: "May–Jun, Oct–Nov", bestMonths: ["May","Jun","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/phulara-ridge.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/phulara-ridge.jpeg"],
    lat: 31.12, lng: 78.14,
    description: "Phulara Ridge is one of Uttarakhand's finest ridgeline treks: from Sankri, you spend **two full days walking an open ridge at 3,500–3,700m with a 270° mountain panorama**, Swargarohini, Bandarpunch and the Har Ki Dun peaks as constant companions. Most treks briefly visit ridges — **Phulara Ridge is the ridge**, and that's genuinely unique in Indian trekking.",
    whoFor: "You want a long walk along an open ridge with Swargarohini in view · You can walk 5–6 hours a day with a daypack · You'd like to pair it with Kedarkantha: both start from Sankri",
    whoNot: "Wind and fast-moving cloud on an open ridge make you nervous · Long drives make you sick: Dehradun to Sankri is 8–10 hours each way · You want dense forest and rivers: most of it is above the trees",
    safetyNotes: "Ridgeline fully exposed to weather — strong wind and sudden cloud common. Carry waterproofs at all times. Snow possible in late October-November. Forest sections below ridge can be confusing.",
    ace: { stamina:3, power:2, strength:3, agility:3, water:1, altitude:3, focus:2, nerve:3 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹9,000", googleRating: 4.8, website: "https://indiahikes.com/phulara-ridge-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹9,500", googleRating: 4.7, website: "https://trekthehimalayas.com/phulara-ridge-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹9,000", googleRating: 4.3, website: "https://www.trekupindia.com/phulara-ridge-trek" },
    ],
    tags: ["Phulara Ridge", "Sankri", "Swargarohini", "Bandarpunch", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-39", slug: "pin-bhaba-pass",
    name: "Pin Bhaba Pass Trek", tagline: "Cross between Himachal's green Bhaba Valley and the lunar landscape of Spiti in one dramatic week",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "8 days", durationRange: "8 Days",
    distance: "51km", distanceRange: "51 km", altitude: "4,909m",
    baseCamp: "Kafnu",
    bestSeason: "Jul–Sep", bestMonths: ["Jul","Aug","Sep"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pin-bhaba.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pin-bhaba.jpeg"],
    lat: 31.81, lng: 78.30,
    description: "Pin Bhaba Pass (4,909m) connects **the lush, forested Bhaba Valley in Kinnaur to the barren high-altitude Spiti Valley**. The moment you crest it, **the whole Spiti Valley unfolds below — a vast brown moonscape replacing the green forest behind** — one of the most dramatic transformations and greatest reveals in Indian trekking.",
    whoFor: "You've slept above 4,000m on a trek before · You can cross snowfields in microspikes and come down a long, steep scree slope · You want green Kinnaur forest on one side and Spiti's desert on the other · You can take 8 days off, plus a long drive to Kafnu",
    whoNot: "Your knees hate long descents: the Spiti side is steep scree · It's your first Himalayan trek · Cold river crossings scare you: the Bhaba streams run high in July",
    safetyNotes: "Pass can hold snowfields even in August — crampons or micro-spikes recommended. Spiti side descent is steep scree. River crossings in Bhaba Valley can be challenging in July snowmelt.",
    ace: { stamina:5, power:3, strength:4, agility:4, water:2, altitude:5, focus:4, nerve:3 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹18,000", googleRating: 4.8, website: "https://indiahikes.com/pin-bhaba-pass-trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹17,900", googleRating: 4.7, website: "https://trekthehimalayas.com/pin-bhaba-pass-trek" },
      { name: "Trekmunk", verified: false, priceFrom: "₹15,000", googleRating: 4.3, website: "https://www.trekmunk.com/treks/pin-bhaba-pass-trek" },
    ],
    tags: ["Pin Bhaba", "Spiti", "Kinnaur", "Himachal Pradesh", "pass"], featured: false,
  },
  {
    id: "csv-40", slug: "pindari-glacier",
    name: "Pindari Glacier Trek", tagline: "Walk to a pristine Kumaon glacier beneath the walls of Nanda Devi and Nanda Kot",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "4 days", durationRange: "4 Days",
    distance: "42km", distanceRange: "42 km", altitude: "3,658m (Zero Point)",
    baseCamp: "Khati",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pindari-glacier.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/pindari-glacier.jpeg"],
    lat: 30.25968, lng: 79.99849,
    description: "The Pindari Glacier trek follows the Pindari river through **ancient oak and rhododendron forests** to the snout of the Pindari Glacier at **Zero Point (3,658m)**, where **Nanda Devi, Nanda Khat and Nanda Kot** tower overhead in a spectacular high-mountain cirque. The **gradual reveal of the high peaks** makes the journey as memorable as the destination — one of Uttarakhand's classic, most accessible glacier treks.",
    whoFor: "You want to walk right up to a glacier without any technical terrain · You can walk 5–7 hours a day, about 42 km over the trek · Simple rest houses and dhabas suit you: little or no camping · You like old Kumaon forests and villages",
    whoNot: "You want to walk on the glacier itself: the trail ends at Zero Point, facing it · You won't carry cash: there are no ATMs past Song · Bears worry you: the forests are black-bear country (make noise as you walk)",
    safetyNotes: "Trail is well-maintained and marked. River crossings near Dwali can be strong in June. Black bear habitat — make noise on trail in forest sections. Carry sufficient cash as no ATMs beyond Song.",
    ace: { stamina:3, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹14,500", googleRating: 4.7, website: "https://trekthehimalayas.com/pindari-glacier-trek" },
      { name: "Trekup India", verified: false, priceFrom: "₹14,000", googleRating: 4.3, website: "https://www.trekupindia.com/pindari-glacier-trek" },
    ],
    tags: ["Pindari", "glacier", "Nanda Devi", "Kumaon", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-41", slug: "ranthan-kharak",
    name: "Ranthan Kharak Trek", tagline: "An off-the-radar Kumaon meadow trek with views of Nanda Devi beneath summer skies",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "7 days", durationRange: "7 Days",
    distance: "37km", distanceRange: "37 km", altitude: "4,115m",
    // Hand-set ACE (was estimated from the grade): 4,115 m high point, remote Garhwal villages
    ace: { stamina:3, power:2, strength:2, agility:2, water:1, altitude:4, focus:2, nerve:3 },
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/ranthan-kharak.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/ranthan-kharak.jpeg"],
    lat: 29.82, lng: 79.62,
    description: "Ranthan Kharak is one of Kumaon's most secret high meadows — **a vast open grassland at 4,115m** reached through dense forest and remote herder villages, with **almost no other trekkers**. **Emerging from the forest onto the meadow, with the whole Kumaon skyline from Nanda Devi and Trishul to Panchachuli** in front of you, is one of Indian trekking's great surprise moments.",
    whoFor: "You want real solitude: you may not meet another group · You want Nanda Devi and Panchachuli views from a high meadow · Tent camping, and no phone signal for days, are fine",
    whoNot: "You'd go without a local guide: there's no marked trail beyond the upper forest · You need to stay reachable: there's almost no phone signal · You want lodges or any comforts",
    safetyNotes: "No marked trail beyond upper forest — local guide from Kathgodam area essential. Meadow is completely exposed — carry quality camping gear. Very limited phone coverage.",
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹9,500", googleRating: 4.7, website: "https://trekthehimalayas.com/ranthan-kharak-trek" },
    ],
    tags: ["Ranthan Kharak", "Kumaon", "Nanda Devi", "meadow", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-42", slug: "roopkund",
    name: "Roopkund Trek", tagline: "The mystery lake of skeletons at 4,800m — Uttarakhand's most legendary and haunting high trek",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "7+ days", durationDays: "6 days", durationRange: "6 Days",
    distance: "59km", distanceRange: "59 km", altitude: "4,778m",
    baseCamp: "Lohajung",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/roopkund.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/roopkund.jpeg"],
    lat: 30.26210, lng: 79.73172,
    description: "Roopkund is India's most mythologised trek — **a glacial lake at 4,778m holding ancient human skeletons**, visible through the clear water when the snow melts: a genuinely unique and unsettling natural mystery. The 6-day route from Lohajung passes oak forest, **the stunning Ali Bedni Bugyal meadow** and a high ridge, and **the Trishul North face towers directly above** the haunting lake.",
    whoFor: "You've slept above 4,000m without getting properly sick · You can climb steep snow to 4,778m, often in crampons, starting at 3am · 6 days of tent camping is fine: nights well below freezing at Bhagwabasa · You'd love Ali Bedni Bugyal's meadows, which are on the way",
    whoNot: "It's your first Himalayan trek · You'd book without checking: access past Bhagwabasa has been restricted at times, so confirm with the operator · Fast-changing weather worries you: the upper section turns dangerous quickly",
    safetyNotes: "Roopkund has had a controversial trekking ban — verify current permit status before booking. Ali Bedni route is fine regardless. Weather above Bhagwabasa can deteriorate extremely rapidly. Crampons essential on final approach.",
    ace: { stamina:4, power:3, strength:4, agility:3, water:1, altitude:5, focus:4, nerve:3 },
    operators: [
      { name: "Indiahikes", verified: true, priceFrom: "₹18,000", googleRating: 4.8, website: "https://indiahikes.com/roopkund" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹18,000", googleRating: 4.7, website: "https://trekthehimalayas.com/roopkund-trek" },
    ],
    tags: ["Roopkund", "skeleton lake", "Trishul", "Ali Bedni", "Uttarakhand"], featured: false, editorChoice: true,
  },
  {
    id: "csv-43", slug: "sar-pass",
    ert: { e: 3, r: 3, t: 2 },
    name: "Sar Pass Trek", tagline: "A classic Parvati Valley snow pass — Kasol's gateway to proper Himalayan trekking",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Hard",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5 Days",
    distance: "34km", distanceRange: "34 km", altitude: "4,200m",
    baseCamp: "Kasol",
    bestSeason: "May–Jun", bestMonths: ["May","Jun"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/sar-pass.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/sar-pass.jpeg"],
    lat: 31.96247, lng: 77.38869,
    description: "Sar Pass (4,200m) is one of India's most popular **first Himalayan pass treks** — 5 days from Kasol through the Parvati Valley to a snow pass with **excellent Kullu mountain panoramas**. The far side is famous for **its snow descent — a glissade down a steep snowfield** on your back or sitting — one of the most purely joyful moments in Himalayan trekking.",
    whoFor: "You're new to trekking and want one snowy pass, starting from Kasol · You'd enjoy sliding down the snow on the descent · You can walk 5–6 hours a day, with one long pass day · You're happy in a big organised group: most people cross it with one",
    whoNot: "You want solitude: it's a popular, busy trail · You're going after June: the snow, and the slide, are gone",
    safetyNotes: "Most trekkers cross Sar Pass in an organised group. Snow conditions vary year to year — call ahead for May snowpack. High pass crossing requires warm layers even in June.",
    ace: { stamina:4, power:2, strength:3, agility:3, water:2, altitude:4, focus:3, nerve:2 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹12,000", googleRating: 4.7, website: "https://www.bikatadventures.com/Home/Itinerary/Sar-Pass-Trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹11,300", googleRating: 4.7, website: "https://trekthehimalayas.com/sar-pass-trek" },
    ],
    tags: ["Sar Pass", "Kasol", "Parvati Valley", "snow pass", "Himachal Pradesh"], featured: false,
  },
  {
    id: "csv-44", slug: "satopanth-lake",
    name: "Satopanth Lake Trek", tagline: "A sacred triangular lake at 4,350m at the foot of the Satopanth and Swargarohini glaciers",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Moderate",
    duration: "3–5 days", durationDays: "5 days", durationRange: "5 Days",
    distance: "35km", distanceRange: "35 km", altitude: "4,346m",
    baseCamp: "Mana",
    bestSeason: "May–Jun, Oct", bestMonths: ["May","Jun","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/satopanth-lake.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/satopanth-lake.jpeg"],
    lat: 30.74352, lng: 79.35700,
    description: "Satopanth is one of Uttarakhand's most sacred and isolated high lakes — **a perfectly triangular glacial lake at about 4,350m**, said to be where **Brahma, Vishnu and Shiva meditate at its three corners**. It's reached along the Badrinath Valley and the spectacular Alaknanda gorge, and **Swargarohini, Chaukhamba and Neelkanth reflected in its clear water** make it one of the most striking high-altitude lakes in the Himalaya.",
    whoFor: "You've slept above 4,000m without getting properly sick · You're steady on boulders and glacier moraine for whole days · The sacred lake below Chaukhamba and Neelkanth matters to you · Tent camping is fine: sub-zero nights at the lake",
    whoNot: "Your ankles are weak: much of the way is boulders, with no proper trail · Fast snowmelt streams scare you: there are river crossings · You'd go without a local guide: the route isn't marked · Long drives make you sick: Rishikesh to Badrinath is 10–11 hours",
    safetyNotes: "Trail involves boulder scrambling above Vasundhara Falls and glacier moraine navigation. River crossings can be dangerous in snowmelt. No rescue access beyond Badrinath. Go with an experienced local guide.",
    ace: { stamina:4, power:3, strength:4, agility:4, water:2, altitude:5, focus:4, nerve:3 },
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹22,500", googleRating: 4.7, website: "https://trekthehimalayas.com/Satopanth-Lake-Trek" },
    ],
    tags: ["Satopanth", "glacial lake", "Badrinath", "sacred", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-45", slug: "surya-top",
    name: "Surya Top Trek", tagline: "A sun-drenched Uttarakhand ridgeline with panoramic Himalayan views at 3,901m",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "7 days", durationRange: "7 Days",
    distance: "32km", distanceRange: "32 km", altitude: "3,901m",
    // Hand-set ACE (was estimated from the grade): 3,901 m summit, a week in remote Garhwal
    ace: { stamina:3, power:2, strength:2, agility:2, water:1, altitude:3, focus:2, nerve:3 },
    bestSeason: "May–Jun, Oct–Nov", bestMonths: ["May","Jun","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/surya-top.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/surya-top.jpeg"],
    lat: 30.32, lng: 78.82,
    description: "Surya Top is a high ridgeline summit at 3,901m in Chamoli, reached over 7 days through mixed forest and alpine meadow to **a rarely visited summit plateau** — **very few trekkers know it exists**. At sunrise, **first light hits Nanda Devi and the full Garhwal arc from Kedarnath to Kamet**, with Trishul too: one of the most complete Himalayan panoramas on **a moderate trek**.",
    whoFor: "You want big Garhwal views without any crowds · You can walk 5–6 hours a day with a daypack · Tent camping, and little phone signal, are fine",
    whoNot: "You'd go without a local guide: the trail isn't marked · You want lodges or a well-trodden trail",
    safetyNotes: "Trail is not well-publicised — local guide essential from Natin Village. Summit plateau exposed to wind and weather. Very limited phone coverage throughout. Carry sufficient food and warm layers.",
    operators: [
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹11,500", googleRating: 4.7, website: "https://trekthehimalayas.com/surya-top-trek" },
    ],
    tags: ["Surya Top", "Nanda Devi", "Chamoli", "panorama", "Uttarakhand"], featured: false,
  },
  // Operators to be added once their prices are checked on their own sites
  {
    id: "csv-46", slug: "triund",
    name: "Triund Trek", tagline: "An overnight ridge above McLeod Ganj, face to face with the Dhauladhar",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Easy",
    duration: "Weekend", durationDays: "2 days", durationRange: "2 Days",
    distance: "10km", distanceRange: "10 km", altitude: "2,821m",
    baseCamp: "Galu Devi", startingPoint: "Galu Devi temple above Dharamkot, a short ride from McLeod Ganj",
    bestSeason: "Mar–Jun, Sep–Dec", bestMonths: ["Mar","Apr","May","Jun","Sep","Oct","Nov","Dec"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/triund.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/triund.jpeg"],
    lat: 32.26144, lng: 76.35455,
    description: "Triund is a grassy ridge at 2,821m, **a half-day climb from McLeod Ganj** through oak and rhododendron forest. From the top **the Dhauladhar rises straight up in front of you** while the Kangra valley falls away behind, and most people camp on the ridge for **sunset over the plains and sunrise on the snow**. It's the classic **first Himalayan overnight trek**.",
    whoFor: "First trek, or a weekend away from Dharamshala or McLeod Ganj · You can climb steadily for 3–5 hours with a daypack · You'd like a night in a tent with a big mountain view, without altitude worries",
    whoNot: "You want solitude: weekends and holidays bring big crowds to the ridge · You're going in July or August: heavy monsoon rain makes the path slippery and the views vanish",
    safetyNotes: "The last stretch is steep, rocky switchbacks — slow down on the way down. Snow can cover the ridge in winter (Jan–Feb). Nights are cold even in summer; carry warm layers. Carry your rubbish back down.",
    ace: { stamina:2, power:1, strength:1, agility:1, water:0, altitude:1, focus:1, nerve:1 },
    operators: [],
    tags: ["Triund", "Dhauladhar", "McLeod Ganj", "Dharamshala", "Himachal Pradesh", "beginner", "weekend"], featured: false,
  },
  {
    id: "csv-47", slug: "rudranath-kalpeshwar",
    name: "Rudranath Kalpeshwar Trek", tagline: "Two Panch Kedar temples joined by a week of forest, high meadows and open ridges",
    region: "Himalayas", state: "Uttarakhand", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "7 days", durationRange: "7 Days",
    distance: "60km", distanceRange: "55–65 km", altitude: "3,600m",
    baseCamp: "Devgram (Urgam valley)", startingPoint: "Helang, near Joshimath, ending at Sagar near Gopeshwar",
    bestSeason: "May–Jun, Sep–Oct", bestMonths: ["May","Jun","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/rudranath-kalpeshwar.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/rudranath-kalpeshwar.jpeg"],
    lat: 30.5186, lng: 79.3182,
    description: "This trek links **two of the five Panch Kedar temples**. It starts in the Urgam valley at **Kalpeshwar, the one Panch Kedar shrine open all year**, then climbs through oak forest to **the old Vishnu temple at Bansi Narayan**, down to Dumak and up again to **the wide meadows of Panar bugyal**. The last climb reaches **Rudranath at about 3,600m, a rock shrine where Shiva is worshipped as a face**, with Nanda Devi, Trishul and Hathi Parvat along the horizon. It's **long, quiet and little-trekked** — village trails one day, empty ridges the next.",
    whoFor: "You want a week-long pilgrimage trek, with two Panch Kedar temples and big Garhwal views · You can climb steeply for 6–9 hours a day, several days in a row · Simple village homestays, dhabas and tents are fine",
    whoNot: "You'd go in winter: Rudranath is closed from about mid-October to May · You'd go without a local guide: the trails between the temples are poorly marked · You want a short or gentle trek",
    safetyNotes: "Rudranath is open roughly mid-May to mid-October — check the year's opening and closing dates before you go. Hire a local guide: paths between Kalpeshwar, Bansi Narayan and Dumak are faint and branch often. Water is scarce on the ridges above Panar; carry enough. Fog rolls in fast on the bugyals — stay on the trail. Monsoon (Jul–Aug) brings slippery paths and landslides on the roads to Helang and Gopeshwar.",
    ace: { stamina:4, power:2, strength:3, agility:2, water:1, altitude:3, focus:2, nerve:2 },
    operators: [],
    tags: ["Rudranath", "Kalpeshwar", "Panch Kedar", "Bansi Narayan", "Urgam valley", "Chamoli", "Garhwal", "pilgrimage", "Uttarakhand"], featured: false,
  },
  {
    id: "csv-48", slug: "yulla-kanda",
    name: "Yulla Kanda Trek", tagline: "A Kinnaur lake at 3,895m with a Krishna temple on its shore",
    region: "Himalayas", state: "Himachal Pradesh", type: "Trekking", difficulty: "Moderate",
    duration: "3–5 days", durationDays: "3 days", durationRange: "3 Days",
    distance: "12km", distanceRange: "12–18 km", altitude: "3,895m",
    baseCamp: "Yulla Khas", startingPoint: "Yulla Khas village, Kinnaur (via Tapri)",
    bestSeason: "May–Oct", bestMonths: ["May","Jun","Jul","Aug","Sep","Oct"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/yulla-kanda.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/yulla-kanda.jpeg"],
    lat: 31.5906, lng: 78.1408,
    description: "Yulla Kanda is a high lake at about 3,895m above the village of Yulla Khas in Kinnaur, with **a small Krishna temple on a stone platform at the water's edge** that's often called **the highest Krishna temple in the world**. The trail climbs through pine and birch to **open meadows below the Kinnaur peaks**. On Janmashtami, **villagers gather at the lake for a festival**, and turning a Kinnauri cap upside down on the water is said to tell your fortune.",
    whoFor: "You want a short, quiet trek in Kinnaur · You can climb for 5–6 hours a day with a daypack · You'd like a lake and a temple at nearly 3,900m without a long expedition",
    whoNot: "You don't want a long drive: Yulla Khas is a day's drive from Shimla · You'd go at Janmashtami for solitude: the festival brings large crowds",
    safetyNotes: "At nearly 3,900m, altitude sickness is possible — spend a night at Yulla Khas before going up. The road along the Sutlej through Kinnaur is prone to landslides, especially in the monsoon. Weather changes quickly near the lake; carry warm, waterproof layers.",
    ace: { stamina:2, power:2, strength:2, agility:2, water:1, altitude:3, focus:1, nerve:1 },
    operators: [],
    tags: ["Yulla Kanda", "Kinnaur", "Krishna temple", "Janmashtami", "high-altitude lake", "Himachal Pradesh"], featured: false,
  },
  // ── WATER ────────────────────────────────────────────────────────────────
  {
    id: "water-1", slug: "rishikesh-river-rafting",
    ert: { e: 2, r: 3, t: 2 },
    name: "Rishikesh River Rafting", tagline: "White water on the Ganga, from a first splash at Shivpuri to the big rapids of Kaudiyala",
    region: "Himalayas", state: "Uttarakhand", type: "River Rafting", difficulty: "Moderate",
    duration: "Weekend", durationDays: "1 day", durationRange: "3–6 Hours",
    distance: "16km", distanceRange: "16–36 km", altitude: "380m", rapidGrade: "Grade II–IV",
    baseCamp: "Rishikesh", startingPoint: "Shivpuri (16 km) or Kaudiyala (36 km), with pickup from Rishikesh",
    bestSeason: "Sep–Jun", bestMonths: ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"],
    // Hero: Chandan Chaurasia on Unsplash (Trishuli River, Nepal), graded to match the other heroes.
    // Gallery adds two Unsplash shots on the Ganga at Rishikesh.
    heroImage: "/adventures/rishikesh-rafting-hero.jpg",
    galleryImages: [
      "/adventures/rishikesh-rafting-hero.jpg",
      "https://images.unsplash.com/photo-1718431108073-7f61fb5dfefb?w=1600&q=80",
      "https://images.unsplash.com/photo-1711992437606-bd676fb6fdf2?w=1600&q=80",
    ],
    lat: 30.134, lng: 78.39,
    // Kaudiyala → Marine Drive → Shivpuri → Brahmpuri → NIM Beach, Rishikesh (schematic)
    description: "The Ganga leaves the mountains at Rishikesh through **a string of named rapids**, and rafting them is the town's great day out. **Two runs, one river**: the classic **Shivpuri run (16 km, about 3 hours)** takes you through **Grade II–III rapids like Roller Coaster and Golf Course**, with calm stretches for a swim and cliff jumping in between, and is the perfect first rafting trip. For more, start upstream at **Kaudiyala (36 km, a full day)**: the river is wilder, the rapids **reach Grade IV at The Wall**, and you share the gorge with forest and sandy beaches before paddling into Rishikesh past the temples and Ram Jhula. Shorter Brahmpuri (9 km) and Marine Drive (26 km) runs fill in between.",
    whoFor: "First-timers on the Shivpuri run: no rafting experience or swimming needed, the guide teaches you on the bank · Groups, friends and families with teenagers (14+) · Fit, confident swimmers wanting bigger water on the Kaudiyala run · A one-day trip from Delhi or a break between Uttarakhand treks",
    whoNot: "Children under 14 · Pregnancy, heart conditions, recent surgery or seizures · Anyone who panics in water and can't follow the guide's commands · Non-swimmers on the full Kaudiyala run · Travel in July–August, when rafting is closed for the monsoon",
    safetyNotes: "Raft only with a government-licensed operator: helmets, life jackets and a trained guide on every raft, ideally with a safety kayaker. Keep your life jacket fastened at all times, including the calm swims. If you fall in, float on your back, feet first and downstream, and wait for the rope or the kayak. Rafting closes from July to mid-September when the river floods; spring water is cold and autumn flows are higher, so ask for a wetsuit top early in the season. The Kaudiyala run's Grade IV rapids flip rafts more often; most operators set 18 as the minimum age there.",
    // Matches the Rishikesh rafting profile on the ACE page. Totals 14, so it reads Moderate:
    // water is the real ask; steady paddling, nothing to carry, town and road always close.
    ace: { stamina:2, power:2, strength:1, agility:2, water:4, altitude:0, focus:2, nerve:1 },
    operators: [],
    tags: ["Ganga", "white water", "Rishikesh", "beginner-friendly", "Kaudiyala"], featured: false,
  },
  // Hero images to come; until then each borrows the closest existing photo
  {
    id: "csv-49", slug: "everest-base-camp-gokyo-lakes",
    ert: { e: 5, r: 3, t: 2 },
    name: "Everest Base Camp & Gokyo Lakes Trek", tagline: "The Gokyo lakes and Gokyo Ri, then over the Cho La to Everest Base Camp",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "14 days", durationRange: "14 Days",
    distance: "133km", distanceRange: "133 km", altitude: "5,645m (Kala Patthar)",
    baseCamp: "Lukla", startingPoint: "Lukla airstrip, a 35-minute flight from Kathmandu (or from Ramechhap in busy seasons)",
    bestSeason: "Mar–May, Oct–Nov", bestMonths: ["Mar","Apr","May","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gokyo-lakes.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/gokyo-lakes.jpeg"],
    lat: 27.99966, lng: 86.84879,
    description: "This trek joins **the two great viewpoints of the Khumbu**. It goes up the quieter Gokyo valley to **the turquoise Gokyo lakes beside the Ngozumpa glacier**, where **Gokyo Ri (5,357m) at dawn puts Everest, Lhotse, Makalu and Cho Oyu in one view**. Then it crosses **the Cho La pass at 5,420m**, a steep scramble with a short glacier walk at the top, into the Khumbu valley for **Everest Base Camp and Kala Patthar (5,645m)**, and comes down past Pheriche and Tengboche. About **two weeks on foot**, with half of it away from the busy Base Camp trail.",
    whoFor: "You can hike 6–8 hours with up to 900m of climbing, several days running · You've slept above 3,500m (Leh, Spiti) without getting properly sick · You can take 17–18 days off: 14 on the trail, a day in Kathmandu each side, and 1–2 spare days for Lukla flights · You're steady on steep, loose rock: the Cho La has a short scramble and a glacier crossing · Basic lodges are fine: shared toilets, unheated rooms, nights of −10°C up high · You're Indian: no visa needed, just a passport or voter ID",
    whoNot: "You have a heart or lung condition, or high blood pressure, without a doctor's OK for 5,600m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: weather cancels Lukla flights often, sometimes for days · You'd go in winter (Dec–Feb): snow and ice on the Cho La often make it unsafe to cross · Small planes scare you: the only quick way in is a flight to Lukla's mountain airstrip",
    safetyNotes: "Acclimatise properly: two nights at Namche and two at Gokyo before the Cho La. Start the pass before dawn and carry microspikes: the glacier at the top is often icy, and the far side is loose rock. Don't cross in fresh snow or cloud; wait a day at Dragnag. Descend at once at any sign of altitude sickness.",
    ace: { stamina:5, power:3, strength:4, agility:4, water:1, altitude:5, focus:4, nerve:4 },
    operators: [
      { name: "Bikat Adventures", verified: true, priceFrom: "₹1,10,000", googleRating: 0, website: "https://www.bikatadventures.com/Home/Itinerary/Everest-Base-Camp-Gokyo-Ri-Trek" },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹1,01,000", googleRating: 0, website: "https://trekthehimalayas.com/everest-base-camp-via-gokyo-ri" },
      { name: "Treks and Trails India", verified: false, priceFrom: "₹69,000", googleRating: 0, website: "https://www.treksandtrails.org/tours/everet-base-camp-with-gokyo-ri-trek" },
      { name: "WhiteMagic Adventure", verified: false, priceFrom: "₹1,26,900", googleRating: 0, website: "https://whitemagicadventure.com/trek-walking-holidays/everest-base-camp-and-gokyo-ri-trek" },
    ],
    tags: ["Nepal", "Everest", "Gokyo", "Gokyo Ri", "Cho La", "Khumbu", "high altitude", "glacial lakes"], featured: false,
  },
  {
    id: "csv-50", slug: "everest-three-passes",
    ert: { e: 5, r: 3, t: 3 },
    name: "Everest Three Passes Trek", tagline: "Renjo La, Cho La and Kongma La: every valley of the Khumbu in one loop",
    region: "Himalayas", state: "Nepal", type: "Trekking", difficulty: "Hard",
    duration: "7+ days", durationDays: "17 days", durationRange: "17 Days",
    distance: "147km", distanceRange: "147 km", altitude: "5,645m (Kala Patthar)",
    baseCamp: "Lukla", startingPoint: "Lukla airstrip, a 35-minute flight from Kathmandu (or from Ramechhap in busy seasons)",
    bestSeason: "Apr–May, Oct–Nov", bestMonths: ["Apr","May","Oct","Nov"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/everest-base-camp.jpeg",
    galleryImages: ["https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/everest-base-camp.jpeg"],
    lat: 27.99580, lng: 86.82844,
    description: "The **hardest of the classic Everest treks**: a loop over **three passes above 5,300m**. **Renjo La (5,360m)** climbs out of the quiet Thame valley with **Everest and the Gokyo lakes laid out below**, **Cho La (5,420m)** crosses from Gokyo to the Khumbu with a short glacier walk, and **Kongma La (5,535m), the highest**, goes from Lobuche across the Khumbu glacier to Chhukung. Between them it takes in **the Gokyo lakes and Gokyo Ri, Everest Base Camp and Kala Patthar (5,645m)**, so it sees **every big valley of the Khumbu**. About **17 days on foot**, many of them long and high.",
    whoFor: "You've done a trek above 5,000m before and want the hardest classic trek in the Khumbu · You can walk 7–9 hours over a high pass, several times in two weeks · You can take 20–21 days off: 17 on the trail, a day in Kathmandu each side, and spare days for Lukla flights · You're steady on scree, loose rock and some ice: all three passes have steep sections · Basic lodges are fine: shared toilets, unheated rooms, nights of −10°C or colder up high",
    whoNot: "It would be your first high-altitude trek: start with Everest Base Camp or Gokyo · You have a heart or lung condition, or high blood pressure, without a doctor's OK for 5,600m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · You'd go in winter (Dec–Feb): snow often closes the passes · Your dates can't move: weather cancels Lukla flights often, sometimes for days",
    safetyNotes: "Gain height slowly: rest at Namche and at Lungden before the Renjo La, and only cross a pass when you feel well. Start each pass before dawn and carry microspikes: the Cho La top is a glacier, and the Kongma La route crosses the Khumbu glacier on unmarked moraine, so go with a guide who knows it. Don't cross in fresh snow or cloud. Descend at once at any sign of altitude sickness.",
    ace: { stamina:5, power:4, strength:4, agility:4, water:1, altitude:5, focus:5, nerve:4 },
    operators: [
      { name: "WhiteMagic Adventure", verified: false, priceFrom: "On request", googleRating: 0, website: "https://whitemagicadventure.com/trek-trekking-expeditions/everest-three-passes-trek-0" },
    ],
    tags: ["Nepal", "Everest", "Three Passes", "Renjo La", "Cho La", "Kongma La", "Gokyo", "Khumbu", "high altitude"], featured: false,
  },
];

/** Operators hidden from every page for now (lower-case names): no rating, not verified */
const HIDDEN_OPERATORS = new Set(["treks and trails india"]);
/** For now only these operators are shown (lower-case names). Everyone else stays in the data
 *  files, so adding a name back here brings them back */
const SHOWN_OPERATORS = new Set(["bikat adventures", "trek the himalayas"]);

// ── Operator facts that must read the same on every page ─────────────────────────────────────
// Runs once when this module loads, so every page (cards, comparison, directory, map) sees the
// same price and rating for an operator.
(function syncOperators() {
  // Operators added from the research sheet where they run the trek (scripts/import-operator-offers.ts)
  // An operator listed by hand elsewhere keeps its verified badge on the treks it's added to
  const extra = operatorListings as Record<string, Operator[]>;
  const handListed = new Map<string, Operator>();
  for (const a of adventures) for (const o of a.operators) if (!handListed.has(o.name.toLowerCase())) handListed.set(o.name.toLowerCase(), o);
  for (const a of adventures) {
    const add = extra[a.slug];
    if (!add) continue;
    const have = new Set(a.operators.map((o) => o.name.toLowerCase()));
    a.operators.push(...add.filter((o) => !have.has(o.name.toLowerCase()))
      .map((o) => ({ ...o, verified: handListed.get(o.name.toLowerCase())?.verified ?? false })));
  }
  // Operators kept off the site for now, wherever they're listed (by hand or from the sheet).
  // Their rows stay in the data files, so taking a name out of this list brings them back.
  for (const a of adventures) a.operators = a.operators.filter((o) => !HIDDEN_OPERATORS.has(o.name.toLowerCase()) && SHOWN_OPERATORS.has(o.name.toLowerCase()));
  // Only treks have researched operators so far. Every other adventure (rides, cycling, rafting,
  // climbs) gets none until its real operator data arrives, so nothing auto-generated is shown
  for (const a of adventures) if (a.type !== "Trekking") a.operators = [];
  // The latest fee read from the operator's own page (scripts/import-operator-offers.ts)
  // replaces the hand-entered one
  const latest = operatorPrices as Record<string, Record<string, { priceFrom: string; checkedAt?: string }>>;
  for (const a of adventures) {
    const byOp = latest[a.slug];
    if (!byOp) continue;
    for (const o of a.operators) {
      const hit = byOp[o.name];
      if (!hit) continue;
      o.priceFrom = hit.priceFrom;
      if (hit.checkedAt) o.priceCheckedAt = hit.checkedAt;
    }
  }
  // One Google rating per operator: the value most listings carry (ties go to the higher one)
  const seen = new Map<string, Map<number, number>>();
  for (const a of adventures) for (const o of a.operators) {
    if (!o.googleRating) continue;
    const m = seen.get(o.name) ?? new Map<number, number>();
    m.set(o.googleRating, (m.get(o.googleRating) ?? 0) + 1);
    seen.set(o.name, m);
  }
  const rating = new Map<string, number>();
  for (const [name, m] of seen) rating.set(name, [...m.entries()].sort((x, y) => y[1] - x[1] || y[0] - x[0])[0][0]);
  for (const a of adventures) for (const o of a.operators) if (rating.has(o.name)) o.googleRating = rating.get(o.name)!;
  // Nothing we can't book is featured or picked as Editor's Choice. The flags stay in the data
  // above, so they come back on their own once the adventure has operators.
  for (const a of adventures) if (a.operators.length === 0) { a.featured = false; a.editorChoice = false; }
})();

/** One entry per operator listed anywhere on the site. The homepage count and the directory both read this. */
export const allListedOperators = (() => {
  const byName = new Map<string, { name: string; verified: boolean; website?: string; googleRating: number }>();
  for (const a of adventures) for (const o of a.operators) {
    const prev = byName.get(o.name);
    byName.set(o.name, {
      name: o.name,
      verified: (prev?.verified ?? false) || o.verified,
      website: prev?.website ?? o.website,
      googleRating: o.googleRating,
    });
  }
  return [...byName.values()];
})();

export const stories: Story[] = [
  {
    id: "7",
    slug: "the-night-photi-la-tested-us",
    title: "The Night Photi La Tested Us",
    excerpt: "A ride to Umling La, a detour to Demchok, and the mountain that watched over us. Some trips are planned. Some trips are reckless. And some trips stay with you forever.",
    author: "Nishant Ingle",
    authorRole: "Rider n Provider",
    authorBio: "Spends most of the year running a business. Once a year, the suit comes off, the saddle goes on, and he goes all in — no guided tours, no safety nets. Just one raw, unscripted adventure that most people only ever dream about.",
    authorAvatar: "/avatars/avatar-5.png",
    pillTags: ["Motorcycling"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/story-submissions/photi-la.jpeg",
    tags: ["Featured", "TTT Original"],
    baseLikes: 68,
    region: "Ladakh",
    adventureDate: "July 2023",
    submittedBy: "95cc4754-9271-4337-a79f-25a4a34536d0",
  },
  {
    id: "8",
    slug: "riding-through-a-revolution",
    title: "Riding through a revolution",
    excerpt: "Riding to Nepal and landing in the middle of the Gen Z revolution. We made the best of it however we could.",
    author: "Aditya Yadav",
    authorRole: "A jack of all trades",
    authorBio: "I read relentlessly and write poetry to ground myself. A mountaineer and skier at heart, I find joy navigating riverbeds on my Himalayan. Anchored by amazing friends, I keep chasing new extremes. Ultimately, my chief occupation is living a life of love. Everything else is fluff.",
    authorAvatar: "/avatars/avatar-10.png",
    pillTags: ["Motorcycling"],
    heroImage: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/story-submissions/riding-through-revolution-hero.jpeg",
    tags: ["Featured", "TTT Original"],
    region: "Nepal",
    adventureDate: "Sep 2024",
    submittedBy: "aditya-yadav",
  },
];

export const regions = [
  {
    name: "Himalayas" as Region,
    tagline: "Peaks, passes & frozen rivers",
      image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-himalayas.jpeg",
      adventureCount: 20,
  },
  {
    name: "Western Ghats" as Region,
      tagline: "Rainforests, rivers & ancient trails",
        image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-western-ghats.jpeg",
      adventureCount: 0,
  },
  {
    name: "Eastern Ghats" as Region,
    image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-eastern-ghats.jpeg",
    tagline: "Tribal trails, gorges & hidden waterfalls",
    adventureCount: 0,
  },
  {
    name: "Desert" as Region,
    tagline: "Salt flats, sand dunes & night skies",
      image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-desert.jpeg",
    adventureCount: 0,
  },
  {
    name: "Coast" as Region,
    tagline: "Surf, sea kayaking & coastal hikes",
    image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-coast.jpeg",
    adventureCount: 0,
  },
  {
    name: "Islands" as Region,
    tagline: "Diving, reefs & untouched beaches",
      image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-islands.jpeg",
    adventureCount: 1,
  },
  {
    name: "Northeast" as Region,
      tagline: "Offbeat valleys & living root bridges",
        image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-northeast.jpeg",
    adventureCount: 1,
  },
  {
    name: "Urban" as Region,
    tagline: "City trails, rooftops & street culture",
    image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/region-urban.jpeg",
    adventureCount: 0,
  },
];

