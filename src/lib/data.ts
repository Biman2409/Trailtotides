export type AdventureType =
  | "Trekking"
  | "Biking"
  | "Cycling"
  | "Diving"
  | "Kayaking"
  | "Skiing"
  | "Mountaineering"
  | "Rock Climbing"
  | "Jeep Safari"
  | "Camel Safari"
  | "Caving"
  | "Sandboarding"
  | "Urban Adventure";

export type Region =
  | "Himalayas"
  | "Western Ghats"
  | "Eastern Ghats"
  | "Desert"
  | "Coast"
  | "Islands"
  | "Northeast"
  | "Urban";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Extreme";

export type Duration = "Weekend" | "3–5 days" | "7+ days";

export type Month =
  | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export type GroupSize = "Solo" | "Small group (2–6)" | "Large group (6+)";

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
  altitude?: string;
  terrain: string;
  bestSeason: string;
  bestMonths: Month[];
  groupSize: GroupSize;
  heroImage: string;
  galleryImages: string[];
  lat: number;
  lng: number;
  description: string;
  whatMakesSpecial: string;
  whoFor: string;
  whoNot: string;
  safetyNotes: string;
  operators: Operator[];
  tags: string[];
  featured: boolean;
}

export interface Operator {
  name: string;
  verified: boolean;
  priceFrom: string;
  rating: number;
  website?: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  heroImage: string;
  readTime: string;
  tags: string[];
  region: Region;
  date: string;
  // views are stored in Supabase story_views table (slug is the key).
  // Use StoryViewPill component to display live counts.
  // To add a new story: insert a row into story_views with { slug, views: <seed> }.
}

export const adventures: Adventure[] = [
  {
    id: "1",
    slug: "chadar-trek",
    name: "Chadar Trek",
      tagline: "Walk a frozen river at -30°C — if it cracks, there's no trail back",
    region: "Himalayas",
    state: "Ladakh",
      type: "Trekking",
      difficulty: "Extreme",
      duration: "7+ days",
      durationDays: "9 days",
    altitude: "3,450m",
    terrain: "Frozen river, ice sheets",
      bestSeason: "Jan – Feb",
      bestMonths: ["Jan", "Feb"],
      groupSize: "Small group (2–6)",
        heroImage: "https://images.unsplash.com/photo-1702704944450-0f3a575491a2?w=1600&q=90",
      galleryImages: [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
        "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80",
      ],
    lat: 34.1526,
    lng: 76.8571,
    description:
      "The Chadar Trek is one of the most extraordinary winter treks on Earth. Named after the thick sheet of ice that forms over the Zanskar River each January, this trek takes you through a frozen gorge carved over millennia — a place few humans ever witness. You walk, slip, camp, and survive on the river itself.",
    whatMakesSpecial:
      "There is no trail — the river IS the trail. Vertical cliff walls, frozen waterfalls, and temperatures that plunge to -30°C make this an expedition, not a walk. The silence is otherworldly.",
    whoFor: "Trekkers with prior high-altitude cold-weather experience. Those who want the edge of what's possible.",
    whoNot: "First-time trekkers, those with heart or respiratory conditions, or anyone who hasn't trained in cold.",
    safetyNotes:
      "Carry emergency bivouac gear, layered thermals, and micro-spike crampons. River ice can crack unexpectedly. Always trek with a certified local guide.",
      operators: [
          { name: "Rimo Expeditions", verified: true, priceFrom: "₹28,000", rating: 4.9, website: "https://www.rimoexpeditions.com" },
          { name: "Dreamland Trek & Tour", verified: true, priceFrom: "₹22,000", rating: 4.8, website: "https://www.dreamladakh.com" },
          { name: "Trek The Himalayas", verified: true, priceFrom: "₹19,500", rating: 4.7, website: "https://trekthehimalayas.com" },
          { name: "Altitude Adventure Ladakh", verified: false, priceFrom: "₹17,500", rating: 4.3, website: "https://www.altitudeadventureladakh.com" },
          { name: "Overland Escape", verified: false, priceFrom: "₹21,000", rating: 4.2, website: "https://www.overlandescape.com" },
        ],
    tags: ["frozen river", "winter", "Ladakh", "extreme cold", "iconic"],
    featured: true,
  },
  {
    id: "2",
    slug: "valley-of-flowers",
    name: "Valley of Flowers",
      tagline: "300 species of wildflowers carpet a Himalayan valley that hides all summer",
    region: "Himalayas",
    state: "Uttarakhand",
      type: "Trekking",
      difficulty: "Beginner",
      duration: "3–5 days",
      durationDays: "4 days",
      altitude: "3,658m",
    terrain: "Alpine meadows, glacial streams",
    bestSeason: "Jul – Sep",
    bestMonths: ["Jul", "Aug", "Sep"],
    groupSize: "Small group (2–6)",
        heroImage: "https://images.unsplash.com/photo-1740116887029-511f9113a782?w=1600&q=90",
    galleryImages: [
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    ],
    lat: 30.7283,
    lng: 79.6057,
    description:
      "A UNESCO World Heritage site, the Valley of Flowers blooms with over 300 species of wildflowers during the monsoon. Snow-fed rivers cut through meadows of blue poppies, brahma kamal, and countless endemic species. It's a trek that makes you slow down.",
    whatMakesSpecial:
      "The contrast of glacial peaks and a valley carpeted in wildflowers is impossibly beautiful. The density and variety of blooms changes week by week through the season.",
    whoFor: "Nature lovers, photographers, first-time Himalayan trekkers, families with fit teenagers.",
    whoNot: "Those wanting adrenaline or summit glory. This trek rewards patience.",
    safetyNotes:
      "The trail can be slippery during monsoon. Carry rain gear, watch for leeches on lower sections. Camp only at designated sites — it's a protected area.",
        operators: [
          { name: "Indiahikes", verified: true, priceFrom: "₹8,750", rating: 4.9, website: "https://indiahikes.com/valley-of-flowers-trek" },
          { name: "Trek The Himalayas", verified: true, priceFrom: "₹7,500", rating: 4.7, website: "https://trekthehimalayas.com" },
          { name: "Bikat Adventures", verified: true, priceFrom: "₹9,200", rating: 4.8, website: "https://bikatadventures.com" },
          { name: "Thrillophilia", verified: false, priceFrom: "₹6,200", rating: 4.2, website: "https://www.thrillophilia.com/valley-of-flowers-trek" },
          { name: "Himalayan Hikers", verified: false, priceFrom: "₹7,000", rating: 4.1, website: "https://himalayanhikers.in" },
        ],
    tags: ["wildflowers", "UNESCO", "monsoon", "gentle", "photography"],
    featured: true,
  },
  {
    id: "3",
    slug: "manali-leh-bike-expedition",
      name: "Manali–Leh Highway Ride",
      tagline: "490km, five high passes, zero guardrails — the crown jewel of Indian riding",
    region: "Himalayas",
    state: "Himachal Pradesh / Ladakh",
      type: "Biking",
      difficulty: "Advanced",
    duration: "7+ days",
    durationDays: "10 days",
      altitude: "5,359m (Tanglang La)",
    terrain: "Mountain highways, river crossings, high passes",
      bestSeason: "Jun – Sep",
      bestMonths: ["Jun", "Jul", "Aug", "Sep"],
      groupSize: "Large group (6+)",
          heroImage: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1600&q=90",
      galleryImages: [
        "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?w=800&q=80",
      ],
    lat: 32.2396,
    lng: 77.1887,
    description:
        "The Manali–Leh highway is the crown jewel of Indian motorcycling. At over 490km, it crosses five high-altitude passes including Rohtang, Baralacha La, and Tanglang La — each one demanding respect. The road alternates between pristine tarmac and lunar-like gravel stretches. The landscapes are alien in their scale.",
    whatMakesSpecial:
      "No other road on Earth gives you altitude, isolation, and scenery like this. Every 50km the terrain changes completely — pine forests to barren moonscapes to river valleys to glacier edges.",
    whoFor: "Experienced riders with 500cc+ bikes, those with basic mechanical knowledge, altitude-fit adventurers.",
    whoNot: "First-time riders, those without altitude acclimatisation, anyone on unreliable bikes.",
    safetyNotes:
      "Carry a basic repair kit, spare clutch cable, and fuel for 150km stretches. Altitude sickness is real — acclimatise in Manali for 2 days minimum. Ride before noon to avoid afternoon weather.",
        operators: [
          { name: "Royal Enfield Marquee Rides", verified: true, priceFrom: "₹80,000", rating: 4.9, website: "https://www.royalenfield.com/in/en/rides/marquee-rides" },
          { name: "Himalayan Rider", verified: true, priceFrom: "₹29,999", rating: 4.8, website: "https://himalayanrider.com" },
          { name: "Lalli Singh Adventures", verified: true, priceFrom: "₹35,000", rating: 4.7, website: "https://lallisinghadventures.com" },
          { name: "StoneHead Bikes", verified: false, priceFrom: "₹28,000", rating: 4.3, website: "https://www.stoneheadbikes.com" },
          { name: "Extreme Tours India", verified: false, priceFrom: "₹32,000", rating: 4.1, website: "https://extremetoursindia.com" },
        ],
    tags: ["motorcycle", "high passes", "Ladakh", "iconic", "long ride"],
    featured: true,
  },
  {
    id: "4",
      slug: "andaman-scuba-diving",
    name: "Havelock Island Diving",
      tagline: "30m visibility, intact WWII wrecks, reef sharks — India's finest dive waters",
    region: "Islands",
    state: "Andaman & Nicobar",
      type: "Diving",
      difficulty: "Beginner",
      duration: "3–5 days",
      durationDays: "4 days",
      altitude: "Sea level",
    terrain: "Coral reefs, drop-offs, WWII wrecks",
      bestSeason: "Nov – May",
      bestMonths: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
      groupSize: "Small group (2–6)",
          heroImage: "https://images.unsplash.com/photo-1682687982360-3fbab65f9d50?w=1600&q=90",
      galleryImages: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      ],
    lat: 11.7401,
    lng: 92.6586,
    description:
      "The Andaman Islands sit in the Bay of Bengal, far enough from the mainland to have kept their reefs largely intact. Visibility regularly exceeds 30m. You'll dive alongside sea turtles, reef sharks, manta rays, and clouds of barracuda. The Japanese WWII wreck at Rana Shoal is one of the most haunting dives in Asia.",
    whatMakesSpecial:
      "The sheer health of the reefs here is rare. Hard and soft corals in perfect condition, mega-fauna encounters, and remoteness that keeps crowds away.",
    whoFor: "Both beginners (PADI Open Water can be done here) and advanced divers seeking macro or wall diving.",
    whoNot: "Those with severe ear issues or heart conditions without clearance. Not ideal mid-monsoon (Jun–Sep).",
    safetyNotes:
      "Always dive with a certified dive centre. Currents can be strong at certain sites. Never touch coral. Keep buoyancy neutral at all times.",
        operators: [
          { name: "Dive Andaman", verified: true, priceFrom: "₹4,800/dive", rating: 4.9, website: "https://www.diveandaman.com" },
          { name: "Lacadives", verified: true, priceFrom: "₹4,500/dive", rating: 4.8, website: "https://www.lacadives.com" },
          { name: "ScubaLov Andaman", verified: true, priceFrom: "₹5,200/dive", rating: 4.8, website: "https://www.scubalov.in" },
          { name: "Planet Scuba India", verified: false, priceFrom: "₹5,000/dive", rating: 4.3, website: "https://planetscubaindia.com" },
          { name: "Dive Oceano", verified: false, priceFrom: "₹3,500/dive", rating: 4.1, website: "https://diveoceano.com" },
        ],
    tags: ["diving", "coral reefs", "islands", "marine life", "WWII wreck"],
    featured: true,
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
    altitude: "4,551m (Kunzum Pass)",
    terrain: "High-altitude tarmac, gravel, river crossings",
      bestSeason: "Jun – Oct",
      bestMonths: ["Jun", "Jul", "Aug", "Sep", "Oct"],
      groupSize: "Small group (2–6)",
        heroImage: "https://images.unsplash.com/photo-1638008302541-5f5a98159df5?w=1600&q=90",
    galleryImages: [],
    lat: 32.2473,
    lng: 78.0350,
    description:
      "Spiti Valley is one of the most remote inhabited regions on Earth. Cycling through it — past mud-brick monasteries perched on cliffs, turquoise rivers, and barren high-altitude desert — is an experience that recalibrates your sense of scale. The oxygen is thin, the landscapes vast.",
    whatMakesSpecial:
      "The isolation is absolute. Many stretches have zero mobile signal, zero other cyclists, and zero settlements for 40–50km. The silence is profound.",
    whoFor: "Strong, experienced cyclists with high-altitude endurance training. Those who value solitude over comfort.",
    whoNot: "Casual cyclists. Those who need reliable resupply or hospitalisation access nearby.",
    safetyNotes:
      "Carry CO2 cartridges, a multi-tool, and spare brake cables. First aid kit essential. Download offline maps — Google Maps fails here.",
        operators: [
          { name: "Cycle Safari India", verified: true, priceFrom: "₹67,000", rating: 4.9, website: "https://cyclesafari.in/spiti" },
          { name: "Spiti Ecosphere", verified: true, priceFrom: "₹45,000", rating: 4.8, website: "https://www.spitiecosphere.com" },
          { name: "GoMissing Adventures", verified: true, priceFrom: "₹32,000", rating: 4.7, website: "https://gomissing.in" },
          { name: "JustWravel Spiti Cycling", verified: false, priceFrom: "₹27,500", rating: 4.2, website: "https://justwravel.com" },
          { name: "Spiti Holiday Adventure", verified: false, priceFrom: "₹26,999", rating: 4.0, website: "https://spitiholidayadventure.com" },
        ],
    tags: ["cycling", "remote", "cold desert", "monasteries", "extreme"],
    featured: false,
  },

  {
    id: "7",
    slug: "dzukou-valley-trek",

    name: "Dzükou Valley Trek",
    tagline: "The valley that the gods kept for themselves",
    region: "Northeast",
    state: "Nagaland / Manipur",
      type: "Trekking",
      difficulty: "Intermediate",
      duration: "3–5 days",
      durationDays: "3 days",
    altitude: "2,452m",
      terrain: "Dense forest, alpine meadows, seasonal rivers",
        bestSeason: "Jun – Sep, Dec – Mar",
        bestMonths: ["Jun", "Jul", "Aug", "Sep", "Dec", "Jan", "Feb", "Mar"],
        groupSize: "Small group (2–6)",
          heroImage: "https://images.unsplash.com/photo-1542709111240-e9df0dd813b4?w=1600&q=90",
    galleryImages: [],
    lat: 25.5330,
    lng: 94.1009,
    description:
      "Dzükou Valley sits on the border of Nagaland and Manipur at over 2,400m, largely unknown to mainstream trekkers. In summer, the valley floor is carpeted with the rare Dzükou lily — found nowhere else on Earth. In winter, a layer of snow transforms it into complete silence.",
    whatMakesSpecial:
      "The endemic Dzükou lily blooms here and nowhere else. The valley feels genuinely undiscovered, a rare quality in 2024.",
    whoFor: "Intermediate trekkers, those seeking offbeat Northeast India, nature photographers, solitude seekers.",
    whoNot: "Those expecting tourist infrastructure. Amenities are minimal. You carry your world.",
    safetyNotes:
      "Register at the Viswema check-post. Carry all your food and water. The trail can be slippery after rain. Download offline maps.",
        operators: [
          { name: "Wild Hill Adventure", verified: true, priceFrom: "₹5,800", rating: 4.7, website: "https://wildhilladventure.com/dzukou-valley-tour-package" },
          { name: "Wander Nagaland", verified: true, priceFrom: "₹6,500", rating: 4.6, website: "https://wandernagaland.com" },
          { name: "Treks and Trails India", verified: true, priceFrom: "₹5,900", rating: 4.6, website: "https://www.treksandtrailsindia.com" },
          { name: "Northeast Trails India", verified: false, priceFrom: "₹6,200", rating: 4.2, website: "https://www.northeasttrailsindia.com" },
          { name: "Soma's Camps Nagaland", verified: false, priceFrom: "₹7,500", rating: 4.1, website: "https://www.somascamps.com" },
        ],
    tags: ["offbeat", "endemic flora", "Northeast", "rare", "solitude"],
    featured: true,
  },
  {
    id: "11",
    slug: "ladakh-circuit",
      name: "Ladakh Circuit",
      tagline: "Nubra dunes, Pangong blue, Mig La at 5,913m — Ladakh's full fury on two wheels",
    region: "Himalayas",
    state: "Ladakh",
    type: "Biking",
      difficulty: "Expert",
      duration: "7+ days",
      durationDays: "14 days",
        altitude: "5,913m (Mig La)",
    terrain: "High-altitude passes, remote valleys, gravel & tarmac",
      bestSeason: "Jun – Sep",
      bestMonths: ["Jun", "Jul", "Aug", "Sep"],
      groupSize: "Large group (6+)",
        heroImage: "https://images.unsplash.com/photo-1619103801164-1166263cb3b6?w=1600&q=90",
    galleryImages: [],
    lat: 33.7782,
    lng: 78.6753,
        description:
          "The Ladakh Circuit is the ultimate Indian biking odyssey. Covering over 1,800km, this route takes you through Leh, across the towering dunes of Nubra Valley via Khardung La, down to the hypnotic blue expanse of Pangong Lake — whose waters shift from sapphire to turquoise in minutes — then on to the remote plains of Hanle, where the air is so clear and the skies so dark that the Milky Way stretches horizon to horizon like a river of light, and finally up to Mig La at 5,913m, the world's highest motorable road. This circuit pushes both rider and machine to their absolute limits. The landscapes are raw, alien, and unforgettable.",
        whatMakesSpecial:
          "Nubra's sand dunes at 3,000m feel like another planet. Pangong Lake's colour is like nothing else on Earth — 134km of water shifting between sapphire, jade and electric blue. And Mig La at 5,913m is the world's highest motorable road — standing on it on two wheels is a moment very few humans will ever experience.",
    whoFor: "Expert riders with Himalayan experience, those with 500cc+ bikes, altitude-acclimatised adventurers seeking the ultimate India ride.",
    whoNot: "Inexperienced riders, those without prior high-altitude riding, anyone without solid bike mechanics knowledge.",
    safetyNotes:
      "Spend minimum 3 days acclimatising in Leh before starting. Carry oxygen, full repair kit, and satellite communicator. Fuel up whenever possible — stations are 200km+ apart. File a route plan with local police.",
        operators: [
          { name: "Rimo Expeditions", verified: true, priceFrom: "₹65,000", rating: 4.9, website: "https://www.rimoexpeditions.com" },
          { name: "Royal Enfield Marquee Rides", verified: true, priceFrom: "₹1,20,000", rating: 4.9, website: "https://www.royalenfield.com/in/en/rides/marquee-rides" },
          { name: "Himalayan Rider", verified: true, priceFrom: "₹55,000", rating: 4.8, website: "https://himalayanrider.com" },
          { name: "Twisted Trails Adventures", verified: false, priceFrom: "₹48,000", rating: 4.2, website: "https://www.twistedtrailsadv.com" },
          { name: "Dream Riders Group", verified: false, priceFrom: "₹44,000", rating: 4.1, website: "https://thedreamridersgroup.com" },
        ],
      tags: ["Mig La", "world record", "Ladakh", "extreme altitude", "circuit"],
    featured: false,
  },
  {
    id: "12",
    slug: "zanskar-valley-bike",
    name: "Zanskar Valley Ride",
      tagline: "Cut off from the world 8 months a year — ride in before it closes",
    region: "Himalayas",
    state: "Ladakh",
    type: "Biking",
    difficulty: "Extreme",
    duration: "7+ days",
    durationDays: "10 days",
      altitude: "5,091m (Shinku La)",
    terrain: "Unmade tracks, river crossings, cliff-edge roads",
      bestSeason: "Jul – Sep",
      bestMonths: ["Jul", "Aug", "Sep"],
      groupSize: "Small group (2–6)",
        heroImage: "https://images.unsplash.com/photo-1706021220078-2051d17b1576?w=1600&q=90",

    galleryImages: [],
    lat: 33.4427,
    lng: 76.8516,
    description:
      "Zanskar is one of the most isolated inhabited valleys on Earth. The road into it — through Pensi La pass and down into the gorge — is barely a road at all. River crossings, crumbling cliff-side tracks, and zero mobile signal make this a true expedition. The reward is a valley frozen in time, with Buddhist monasteries, turquoise rivers, and total silence.",
    whatMakesSpecial:
      "Zanskar is cut off by snow for 8 months a year — this is one of the only places in India where the outside world genuinely cannot reach you. The riding is raw and technical.",
    whoFor: "Expert off-road riders, those seeking complete remoteness, adventure motorcyclists with expedition experience.",
    whoNot: "Riders on road bikes, those without off-road experience or without Himalayan riding background.",
    safetyNotes:
      "Carry a satellite phone — there is no mobile signal in Zanskar. River crossings should only be attempted in the morning before glacial melt raises water levels. Always ride in pairs minimum.",
        operators: [
          { name: "Motorcycle Tour India", verified: true, priceFrom: "₹48,000", rating: 4.9, website: "https://www.motorcycletourindia.com" },
          { name: "Rimo Expeditions", verified: true, priceFrom: "₹55,000", rating: 4.8, website: "https://www.rimoexpeditions.com" },
          { name: "Mototour Ladakh", verified: true, priceFrom: "₹52,000", rating: 4.7, website: "https://mototourladakh.com" },
          { name: "Ride On Bike Trips", verified: false, priceFrom: "₹38,000", rating: 4.2, website: "https://www.rideonbiketrips.com" },
          { name: "Dream Riders Group", verified: false, priceFrom: "₹42,000", rating: 4.0, website: "https://thedreamridersgroup.com" },
        ],
    tags: ["Zanskar", "remote", "off-road", "river crossings", "expedition"],
    featured: false,
  },
  {
    id: "13",
    slug: "spiti-valley-bike",
      name: "Spiti Valley Circuit",
        tagline: "Ride the old Tibet highway — where the tarmac ends and the adventure begins",
    region: "Himalayas",
    state: "Himachal Pradesh",
    type: "Biking",
      difficulty: "Expert",
      duration: "7+ days",
      durationDays: "9 days",
      altitude: "4,551m (Kunzum Pass)",
    terrain: "Tarmac, gravel, river crossings, high passes",
      bestSeason: "Jun – Oct",
      bestMonths: ["Jun", "Jul", "Aug", "Sep", "Oct"],
      groupSize: "Small group (2–6)",
      heroImage: "https://images.unsplash.com/photo-1628782379401-4fff9cdcbbfe?w=1600&q=90",
    galleryImages: [],
    lat: 32.2473,
    lng: 78.0350,
    description:
      "The Spiti loop — entering via Manali over Rohtang and Kunzum La, and exiting via Shimla through Kinnaur — is one of the most beautiful roads in Asia. Mud monasteries at 4,000m, apple orchards in ancient river valleys, and stretches of road so remote the tarmac simply stops. Spiti delivers everything.",
    whatMakesSpecial:
      "The circuit is completable without extreme technical skill, yet the scenery rivals anything in Ladakh. Key Monastery, Dhankar, and Tabo make this as culturally rich as it is visually stunning.",
    whoFor: "Intermediate to expert riders, those on first Himalayan trips who want a slightly more forgiving circuit than Leh-Ladakh.",
    whoNot: "Beginners on 150cc bikes. The passes require engine power and rider confidence.",
    safetyNotes:
      "Kunzum La can be snowbound until late June — check pass status before departure. Carry chain lube, tyre plugs, and a basic toolkit. Fuel up at Kaza — it's the last pump for 130km.",
        operators: [
          { name: "Royal Enfield Marquee Rides", verified: true, priceFrom: "₹80,000", rating: 4.9, website: "https://www.royalenfield.com/in/en/rides/marquee-rides" },
          { name: "Himalayan Rider", verified: true, priceFrom: "₹32,000", rating: 4.8, website: "https://himalayanrider.com" },
          { name: "Spiti Riders Group", verified: true, priceFrom: "₹35,000", rating: 4.7, website: "https://spitiriders.com" },
          { name: "JustWravel", verified: false, priceFrom: "₹27,500", rating: 4.2, website: "https://justwravel.com" },
          { name: "Spiti Holiday Adventure", verified: false, priceFrom: "₹26,999", rating: 4.0, website: "https://spitiholidayadventure.com" },
        ],
    tags: ["Spiti", "cold desert", "monasteries", "loop", "Kunzum La"],
    featured: false,
  },
  {
    id: "9",
    slug: "ski-auli",
    name: "Auli Ski & Snowboard",
      tagline: "India's best powder with the entire Garhwal Himalaya as your backdrop",
    region: "Himalayas",
    state: "Uttarakhand",
    type: "Skiing",
      difficulty: "Intermediate",
      duration: "3–5 days",
      durationDays: "4 days",
      altitude: "3,049m",
    terrain: "Groomed ski slopes, natural powder fields",
      bestSeason: "Jan – Mar",
      bestMonths: ["Jan", "Feb", "Mar"],
      groupSize: "Large group (6+)",
        heroImage: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=1600&q=90",
    galleryImages: [],
    lat: 30.5292,
    lng: 79.5665,
    description:
      "Auli is India's premier ski destination — 16km of slopes with a cable car and chair lift, overlooking a panorama of Nanda Devi, Mana Parbat, Kamet, and the Dunagiri peaks. The powder after a fresh snowfall rivals anything in the Alps.",
    whatMakesSpecial:
      "The backdrop is world-class. Few ski resorts on Earth offer a view like Auli's — the entire Garhwal Himalaya spread behind you as you ride.",
    whoFor: "Beginner to advanced skiers. Snowboarders welcome. Great for families.",
    whoNot: "Those wanting après-ski nightlife. Auli is simple and raw — but the skiing is real.",
    safetyNotes:
      "Rent equipment from verified shops at the resort. Always check avalanche bulletins. Ski with a buddy or instructor if new to the slopes.",
        operators: [
          { name: "GMVN Auli", verified: true, priceFrom: "₹8,900", rating: 4.7, website: "https://gmvnonline.com" },
          { name: "Ski Himalaya", verified: true, priceFrom: "₹9,500", rating: 4.7, website: "https://www.skihimalaya.com" },
          { name: "Bikat Adventures Skiing", verified: true, priceFrom: "₹12,500", rating: 4.6, website: "https://bikatadventures.com" },
          { name: "Cliff Top Club Auli", verified: false, priceFrom: "₹12,000", rating: 4.3, website: "https://www.clifftopclub.com" },
          { name: "Thrillophilia Auli", verified: false, priceFrom: "₹7,500", rating: 4.1, website: "https://www.thrillophilia.com/auli-ski-package" },
        ],
    tags: ["skiing", "snowboard", "winter", "powder", "Nanda Devi views"],
    featured: false,
  },
  {
    id: "10",
    slug: "stok-kangri",
    name: "Stok Kangri Summit",
      tagline: "Stand on a 6,153m summit with all of Ladakh spread below you",
    region: "Himalayas",
    state: "Ladakh",
    type: "Mountaineering",
      difficulty: "Expert",
      duration: "7+ days",
      durationDays: "8 days",
    altitude: "6,153m",
      terrain: "Glaciers, scree, summit ridge",
        bestSeason: "Jul – Sep",
        bestMonths: ["Jul", "Aug", "Sep"],
        groupSize: "Small group (2–6)",
          heroImage: "https://images.unsplash.com/photo-1549364472-0972cec89cd8?w=1600&q=90",
    galleryImages: [],
      lat: 33.9139,
      lng: 77.6285,
    description:
      "Stok Kangri is one of the most accessible 6,000m peaks in the world — and one of the best introductory mountaineering expeditions in India. The summit ridge is a narrow blade of ice and rock with a 360° view of the entire Ladakh range. On a clear summit day, you can see K2.",
    whatMakesSpecial:
      "The jump from 5,000m trekking to 6,000m climbing is immense. This mountain teaches you what your body can do when it has no other option.",
    whoFor: "Trekkers who want their first high-altitude climb. Basic mountaineering course recommended but not mandatory.",
    whoNot: "Those without altitude exposure, weak lungs, or heart conditions. This is serious mountaineering.",
    safetyNotes:
      "Acclimatise in Leh for minimum 3 days. Carry crampons, ice axe, helmet. Go with a certified mountaineering guide — the summit ridge crevasses are real.",
        operators: [
          { name: "Rimo Expeditions", verified: true, priceFrom: "₹32,000", rating: 4.9, website: "https://www.rimoexpeditions.com" },
          { name: "Bikat Adventures", verified: true, priceFrom: "₹26,000", rating: 4.8, website: "https://www.bikatadventures.com" },
          { name: "White Magic Adventure", verified: true, priceFrom: "₹28,500", rating: 4.7, website: "https://whitemagicadventures.com" },
          { name: "Shikhar Travels", verified: false, priceFrom: "₹24,000", rating: 4.3, website: "https://www.shikhartravels.com" },
          { name: "Trek The Himalayas Mountaineering", verified: false, priceFrom: "₹29,000", rating: 4.2, website: "https://trekthehimalayas.com" },
        ],
    tags: ["mountaineering", "6000m", "glaciers", "summit", "Ladakh"],
    featured: true,
  },
  {
    id: "14",
    slug: "munnar-trekking",
    name: "Munnar Tea Garden Trek",
    tagline: "Hike through rolling emerald hills and high-altitude tea estates",
    region: "Western Ghats",
    state: "Kerala",
    type: "Trekking",
    difficulty: "Beginner",
    duration: "Weekend",
    durationDays: "2 days",
    altitude: "1,600m",
    terrain: "Tea estates, shola forests",
    bestSeason: "Sep – Mar",
    bestMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    groupSize: "Small group (2–6)",
    heroImage: "https://images.unsplash.com/photo-1590513908866-e838965f7956?w=1600&q=90",
    galleryImages: [],
    lat: 10.0889,
    lng: 77.0595,
    description: "Munnar is the heart of India's tea country. This trek takes you through private estates, up to Meesapulimala — the second highest peak in the Western Ghats — and through clouds that sit heavy on the hills.",
    whatMakesSpecial: "The sheer scale of the green. You walk for miles through manicured tea gardens before entering wild shola forests.",
    whoFor: "Beginners, families, and those who love lush green landscapes.",
    whoNot: "Those looking for rocky, rugged terrain. Munnar is soft and rolling.",
    safetyNotes: "Leeches are common during monsoon. Wear gaiters.",
    operators: [
      { name: "Munnar Info", verified: true, priceFrom: "₹2,500", rating: 4.6 },
    ],
    tags: ["Tea gardens", "Western Ghats", "Lush", "Beginner"],
    featured: false,
  },
  {
    id: "15",
    slug: "hampi-bouldering",
    name: "Hampi Bouldering",
    tagline: "Climb the ruins of an empire — world-class boulders in a surreal landscape",
    region: "Western Ghats",
    state: "Karnataka",
    type: "Rock Climbing",
    difficulty: "Advanced",
    duration: "3–5 days",
    durationDays: "5 days",
    altitude: "467m",
    terrain: "Granite boulders, historical ruins",
    bestSeason: "Nov – Feb",
    bestMonths: ["Nov", "Dec", "Jan", "Feb"],
    groupSize: "Solo",
    heroImage: "https://images.unsplash.com/photo-1581335804362-7e04f0579e27?w=1600&q=90",
    galleryImages: [],
    lat: 15.3350,
    lng: 76.4600,
    description: "Hampi is a pilgrimage for bouldering enthusiasts worldwide. The landscape is littered with millions of granite boulders of all shapes and sizes, set against the backdrop of 14th-century Vijayanagara ruins.",
    whatMakesSpecial: "Climbing in a UNESCO world heritage site. The rock quality is superb and the sheer number of problems is infinite.",
    whoFor: "Rock climbers, bouldering enthusiasts, those who don't mind the heat.",
    whoNot: "Those looking for height (it's bouldering, not big wall) or luxury.",
    safetyNotes: "Bouldering mats are essential. Watch out for scorpions under rocks.",
    operators: [
      { name: "Tom & Jerry Climbing", verified: true, priceFrom: "₹1,500/day", rating: 4.8 },
    ],
    tags: ["Bouldering", "Granite", "Heritage", "UNESCO"],
    featured: false,
  },
  {
    id: "16",
    slug: "jaisalmer-camel-safari",
    name: "Thar Desert Expedition",
    tagline: "Sleep under the clearest skies in India — deep into the dunes of the Thar",
    region: "Desert",
    state: "Rajasthan",
    type: "Camel Safari",
    difficulty: "Beginner",
    duration: "Weekend",
    durationDays: "2 days",
    altitude: "225m",
    terrain: "Sand dunes, arid scrub",
    bestSeason: "Oct – Mar",
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    groupSize: "Small group (2–6)",
    heroImage: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=90",
    galleryImages: [],
    lat: 26.9157,
    lng: 70.9160,
    description: "Venture deep into the Thar Desert on a camel. This isn't a touristy ride — it's an expedition to remote dunes where the only sound is the wind. You'll camp in the open, cook over a fire, and witness stars like never before.",
    whatMakesSpecial: "The silence of the dunes at night. The lack of light pollution makes it one of the best stargazing spots in India.",
    whoFor: "Minimalists, photographers, those seeking a slow-paced adventure.",
    whoNot: "Those who need daily showers or air conditioning.",
    safetyNotes: "Carry plenty of water. Temperatures drop sharply at night.",
    operators: [
      { name: "Desert Boy's Guest House", verified: true, priceFrom: "₹3,500", rating: 4.7 },
    ],
    tags: ["Thar Desert", "Stargazing", "Camel Safari", "Dunes"],
    featured: false,
  },
  {
    id: "17",
    slug: "goa-sea-kayaking",
    name: "Goa Coastal Kayaking",
    tagline: "Paddle through mangroves and discover secret coves along the Arabian Sea",
    region: "Coast",
    state: "Goa",
    type: "Kayaking",
    difficulty: "Beginner",
    duration: "Weekend",
    durationDays: "1 day",
    altitude: "Sea level",
    terrain: "Mangroves, open ocean",
    bestSeason: "Nov – May",
    bestMonths: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    groupSize: "Small group (2–6)",
    heroImage: "https://images.unsplash.com/photo-1544551763-8dd44758c2dd?w=1600&q=90",
    galleryImages: [],
    lat: 15.2993,
    lng: 74.1240,
    description: "Away from the parties, Goa has an incredible network of mangroves and rivers. Paddle silently through the backwaters to see kingfishers and otters, or head to the south for cliffside sea kayaking.",
    whatMakesSpecial: "Seeing a side of Goa most tourists miss. The bioluminescence in some seasons is magical.",
    whoFor: "Beginners, bird watchers, couples.",
    whoNot: "Those looking for heavy surf or extreme rapids.",
    safetyNotes: "Life jackets mandatory. Watch out for tides.",
    operators: [
      { name: "Konkan Explorers", verified: true, priceFrom: "₹2,500", rating: 4.9 },
    ],
    tags: ["Mangroves", "Goa", "Slow Travel", "Birding"],
    featured: false,
  },
  {
    id: "18",
    slug: "arunachal-kayaking",
    name: "Siang River Expedition",
    tagline: "Grade IV+ rapids on the mighty Brahmaputra's largest tributary",
    region: "Northeast",
    state: "Arunachal Pradesh",
    type: "Kayaking",
    difficulty: "Extreme",
    duration: "7+ days",
    durationDays: "10 days",
    altitude: "600m",
    terrain: "Whitewater rapids, rainforest gorge",
    bestSeason: "Nov – Dec",
    bestMonths: ["Nov", "Dec"],
    groupSize: "Small group (2–6)",
    heroImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=90",
    galleryImages: [],
    lat: 28.1472,
    lng: 94.8318,
    description: "The Siang is the primary tributary of the Brahmaputra and one of the world's great whitewater rivers. This is a self-contained expedition through one of the most remote rainforest gorges on the planet.",
    whatMakesSpecial: "The scale of the river. These are massive, big-volume rapids that require skill and respect. The scenery is pure jungle.",
    whoFor: "Expert kayakers and rafters only. Expedition-grade adventurers.",
    whoNot: "Beginners or those uncomfortable with big water and remote camping.",
    safetyNotes: "Requires Inner Line Permits. High-risk rapids.",
    operators: [
      { name: "Aquaterra Adventures", verified: true, priceFrom: "₹95,000", rating: 4.9 },
    ],
    tags: ["Whitewater", "Expedition", "Rainforest", "Brahmaputra"],
    featured: false,
  },
  {
    id: "19",
    slug: "mumbai-roof-climbing",
    name: "Mumbai Urban Exploration",
    tagline: "See the Maximum City from above — rooftop trails and hidden city gems",
    region: "Urban",
    state: "Mumbai",
    type: "Urban Adventure",
    difficulty: "Intermediate",
    duration: "Weekend",
    durationDays: "1 day",
    altitude: "100m",
    terrain: "City rooftops, old buildings",
    bestSeason: "Nov – Mar",
    bestMonths: ["Nov", "Dec", "Jan", "Feb", "Mar"],
    groupSize: "Small group (2–6)",
    heroImage: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1600&q=90",
    galleryImages: [],
    lat: 19.0760,
    lng: 72.8777,
    description: "Mumbai is a vertical maze. This urban adventure takes you to the rooftops of old mills and high-rises to see the city's chaotic beauty from a different perspective.",
    whatMakesSpecial: "The contrast between the old world and the new. Seeing the sunset over the Arabian Sea from a 40th-floor ledge.",
    whoFor: "Urbanites, photographers, parkour enthusiasts.",
    whoNot: "Those with vertigo or who prefer nature to concrete.",
    safetyNotes: "Legal permissions required for some areas. Use safety harnesses.",
    operators: [
      { name: "Urban Explorers Mumbai", verified: false, priceFrom: "₹3,500", rating: 4.5 },
    ],
    tags: ["Urban", "Cityscape", "Rooftop", "Mumbai"],
    featured: false,
  },
  {
    id: "20",
    slug: "gandikota-kayaking",
    name: "Gandikota Gorge Kayaking",
    tagline: "Paddle through the Grand Canyon of India — ancient red rock walls",
    region: "Eastern Ghats",
    state: "Andhra Pradesh",
    type: "Kayaking",
    difficulty: "Beginner",
    duration: "Weekend",
    durationDays: "2 days",
    altitude: "300m",
    terrain: "River gorge, red sandstone cliffs",
    bestSeason: "Oct – Feb",
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb"],
    groupSize: "Small group (2–6)",
    heroImage: "https://images.unsplash.com/photo-1663597675745-96a3f784369e?w=1600&q=90",
    galleryImages: [],
    lat: 14.8157,
    lng: 78.2861,
    description: "The Pennar river has carved a massive gorge through red sandstone at Gandikota. Kayaking here feels like being in Arizona. The quiet water reflects the massive fort and temple ruins above.",
    whatMakesSpecial: "The red sandstone walls. It's the only place in India with this specific geology and scale.",
    whoFor: "History buffs, beginners, landscape photographers.",
    whoNot: "Those looking for whitewater rapids.",
    safetyNotes: "Currents can be deceptive near the gorge entrance.",
    operators: [
      { name: "Gandikota Adventure Club", verified: true, priceFrom: "₹1,800", rating: 4.4 },
    ],
    tags: ["Gorge", "Grand Canyon", "Red Rock", "Kayaking"],
    featured: false,
  },
];

export const stories: Story[] = [
  {
    id: "7",
    slug: "the-night-photi-la-tested-us",
    title: "The Night Photi La Tested Us",
    excerpt:
      "A ride to Umling La, a detour to Demchok, and the mountain that watched over us. Some trips are planned. Some trips are reckless. And some trips stay with you forever.",
      author: "Nishant Ingle",
      authorRole: "Rider",
    heroImage: "https://images.unsplash.com/photo-1619103801164-1166263cb3b6?w=1600&q=90",
    readTime: "15 min read",
          tags: ["Featured", "TTT Original", "Ladakh", "Himalayas"],
        region: "Himalayas",
        date: "July 2022",
    },
];

export const regions = [
  {
    name: "Himalayas" as Region,
    tagline: "Peaks, passes & frozen rivers",
      image: "https://images.unsplash.com/photo-1599661520791-8aabee470d55?w=800&q=80",
      adventureCount: 127,
  },
  {
    name: "Western Ghats" as Region,
      tagline: "Rainforests, rivers & ancient trails",
        image: "https://images.unsplash.com/photo-1695211564991-9cf8f7a1d799?w=800&q=80",
      adventureCount: 43,
  },
  {
    name: "Eastern Ghats" as Region,
    image: "https://images.unsplash.com/photo-1663597675745-96a3f784369e?w=800&q=80",
    tagline: "Tribal trails, gorges & hidden waterfalls",
    adventureCount: 19,
  },
  {
    name: "Desert" as Region,
    tagline: "Salt flats, sand dunes & night skies",
      image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&q=80",
    adventureCount: 28,
  },
  {
    name: "Coast" as Region,
    tagline: "Surf, sea kayaking & coastal hikes",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    adventureCount: 36,
  },
  {
    name: "Islands" as Region,
    tagline: "Diving, reefs & untouched beaches",
      image: "https://images.unsplash.com/photo-1745917784557-a93bf209232c?w=800&q=80",
    adventureCount: 22,
  },
  {
    name: "Northeast" as Region,
      tagline: "Offbeat valleys & living root bridges",
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    adventureCount: 31,
  },
  {
    name: "Urban" as Region,
    tagline: "City trails, rooftops & street culture",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    adventureCount: 14,
  },
];

export const adventureTypes = [
  { type: "Trekking" as AdventureType, icon: "🥾", count: 94 },
  { type: "Biking" as AdventureType, icon: "🏍️", count: 38 },
  { type: "Cycling" as AdventureType, icon: "🚴", count: 27 },
  { type: "Mountaineering" as AdventureType, icon: "🏔️", count: 15 },
  { type: "Rock Climbing" as AdventureType, icon: "🧗", count: 18 },
  { type: "Jeep Safari" as AdventureType, icon: "🚙", count: 22 },
  { type: "Camel Safari" as AdventureType, icon: "🐪", count: 9 },
  { type: "Caving" as AdventureType, icon: "🪨", count: 7 },
  { type: "Sandboarding" as AdventureType, icon: "🏄", count: 5 },
  { type: "Urban Adventure" as AdventureType, icon: "🏙️", count: 11 },
  { type: "Diving" as AdventureType, icon: "🤿", count: 19 },
  { type: "Kayaking" as AdventureType, icon: "🛶", count: 24 },
  { type: "Skiing" as AdventureType, icon: "⛷️", count: 8 },
];
