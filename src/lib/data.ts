export type AdventureType =
  | "Trekking"
  | "Biking"
  | "Cycling"
  | "Diving"
  | "Kayaking"
  | "Skiing"
  | "Mountaineering";

export type Region =
  | "Himalayas"
  | "Western Ghats"
  | "Desert"
  | "Coast"
  | "Islands"
  | "Northeast";

export type Difficulty = "Beginner" | "Intermediate" | "Expert";

export type Duration = "Weekend" | "3–5 days" | "7+ days";

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
}

export const adventures: Adventure[] = [
  {
    id: "1",
    slug: "chadar-trek",
    name: "Chadar Trek",
    tagline: "Walk the frozen river of Zanskar",
    region: "Himalayas",
    state: "Ladakh",
      type: "Trekking",
      difficulty: "Expert",
      duration: "7+ days",
      durationDays: "9 days",
    altitude: "3,450m",
    terrain: "Frozen river, ice sheets",
    bestSeason: "Jan – Feb",
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
    tagline: "Walk where the Himalayas bloom in colour",
    region: "Himalayas",
    state: "Uttarakhand",
      type: "Trekking",
      difficulty: "Beginner",
      duration: "3–5 days",
      durationDays: "4 days",
    altitude: "3,658m",
    terrain: "Alpine meadows, glacial streams",
    bestSeason: "Jul – Sep",
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
    tagline: "Ride across the highest motorable roads on earth",
    region: "Himalayas",
    state: "Himachal Pradesh / Ladakh",
      type: "Biking",
    difficulty: "Intermediate",
    duration: "7+ days",
    durationDays: "10 days",
      altitude: "5,359m (Tanglang La)",
    terrain: "Mountain highways, river crossings, high passes",
    bestSeason: "Jun – Sep",
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
    tagline: "Dive the crystal-clear waters of Havelock Island",
    region: "Islands",
    state: "Andaman & Nicobar",
      type: "Diving",
    difficulty: "Beginner",
    duration: "3–5 days",
    durationDays: "4 days",
    altitude: "Sea level",
    terrain: "Coral reefs, drop-offs, WWII wrecks",
    bestSeason: "Nov – May",
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
    tagline: "Pedalling through the cold desert above the clouds",
    region: "Himalayas",
    state: "Himachal Pradesh",
    type: "Cycling",
    difficulty: "Expert",
    duration: "7+ days",
    durationDays: "12 days",
    altitude: "4,551m (Kunzum Pass)",
    terrain: "High-altitude tarmac, gravel, river crossings",
    bestSeason: "Jun – Oct",
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
        { name: "Cycle Safari India", verified: true, priceFrom: "₹67,000", rating: 4.9, website: "https://www.cyclesafari.com" },
        { name: "GoMissing MTB Spiti", verified: true, priceFrom: "₹32,000", rating: 4.7, website: "https://gomissing.in" },
        { name: "Spiti Ecosphere", verified: true, priceFrom: "₹45,000", rating: 4.8, website: "https://www.spitiecosphere.com" },
        { name: "JustWravel Spiti Cycling", verified: false, priceFrom: "₹27,500", rating: 4.2, website: "https://justwravel.com" },
        { name: "The DP Tours", verified: false, priceFrom: "₹26,999", rating: 4.0, website: "https://www.thedptours.com" },
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
        { name: "Wild Hill Adventure", verified: true, priceFrom: "₹5,800", rating: 4.7, website: "https://www.wildadventurenagaland.com" },
        { name: "Treks and Trails India", verified: true, priceFrom: "₹5,900", rating: 4.6, website: "https://www.treksandtrailsindia.com" },
        { name: "Soma's Camps Nagaland", verified: false, priceFrom: "₹15,300", rating: 4.3, website: "https://www.somascamps.com" },
        { name: "Northeast Trails India", verified: false, priceFrom: "₹6,200", rating: 4.1, website: "https://www.northeasttrailsindia.com" },
      ],
    tags: ["offbeat", "endemic flora", "Northeast", "rare", "solitude"],
    featured: true,
  },
  {
    id: "11",
    slug: "ladakh-circuit",
      name: "Ladakh Circuit",
        tagline: "Nubra, Pangong, Hanle — Ladakh's untamed heart on two wheels",
    region: "Himalayas",
    state: "Ladakh",
    type: "Biking",
    difficulty: "Expert",
    duration: "7+ days",
    durationDays: "14 days",
      altitude: "5,913m (Mig La)",
    terrain: "High-altitude passes, remote valleys, gravel & tarmac",
    bestSeason: "Jun – Sep",
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
        { name: "Himalayan Rider", verified: true, priceFrom: "₹55,000", rating: 4.8, website: "https://himalayanrider.com" },
        { name: "Endeavour Ladakh", verified: true, priceFrom: "₹50,000", rating: 4.7, website: "https://endeavorladakh.com" },
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
      tagline: "Ride into the last great Himalayan wilderness",
    region: "Himalayas",
    state: "Ladakh",
    type: "Biking",
    difficulty: "Expert",
    duration: "7+ days",
    durationDays: "10 days",
      altitude: "5,091m (Shinku La)",
    terrain: "Unmade tracks, river crossings, cliff-edge roads",
    bestSeason: "Jul – Sep",
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
        { name: "Twisted Trails Adventures", verified: true, priceFrom: "₹52,000", rating: 4.7, website: "https://www.twistedtrailsadv.com" },
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
    tagline: "Ride the cold desert loop between Manali and Shimla",
    region: "Himalayas",
    state: "Himachal Pradesh",
    type: "Biking",
    difficulty: "Intermediate",
    duration: "7+ days",
    durationDays: "9 days",
    altitude: "4,551m (Kunzum Pass)",
    terrain: "Tarmac, gravel, river crossings, high passes",
    bestSeason: "Jun – Oct",
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
        { name: "JustWravel", verified: true, priceFrom: "₹27,500", rating: 4.7, website: "https://justwravel.com" },
        { name: "Himalayan Rider", verified: true, priceFrom: "₹32,000", rating: 4.8, website: "https://himalayanrider.com" },
        { name: "Journey Basket", verified: false, priceFrom: "₹28,499", rating: 4.2, website: "https://www.journeybasket.com" },
        { name: "The DP Tours", verified: false, priceFrom: "₹26,999", rating: 4.0, website: "https://www.thedptours.com" },
      ],
    tags: ["Spiti", "cold desert", "monasteries", "loop", "Kunzum La"],
    featured: false,
  },
  {
    id: "9",
    slug: "ski-auli",
    name: "Auli Ski & Snowboard",
    tagline: "India's best powder, backed by a Himalayan wall",
    region: "Himalayas",
    state: "Uttarakhand",
    type: "Skiing",
    difficulty: "Intermediate",
    duration: "3–5 days",
    durationDays: "4 days",
    altitude: "3,049m",
    terrain: "Groomed ski slopes, natural powder fields",
    bestSeason: "Jan – Mar",
      heroImage: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1600&q=90",
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
        { name: "GMVN Auli", verified: true, priceFrom: "₹8,900", rating: 4.6, website: "https://gmvnonline.com/skiing" },
        { name: "Ski Himalaya", verified: true, priceFrom: "₹9,500", rating: 4.7, website: "https://www.skihimalaya.com" },
        { name: "Cliff Top Club Auli", verified: false, priceFrom: "₹12,000", rating: 4.3, website: "https://www.clifftopclub.com" },
        { name: "Indiahikes Auli", verified: false, priceFrom: "₹7,500", rating: 4.1, website: "https://indiahikes.com" },
      ],
    tags: ["skiing", "snowboard", "winter", "powder", "Nanda Devi views"],
    featured: false,
  },
  {
    id: "10",
    slug: "stok-kangri",
    name: "Stok Kangri Summit",
    tagline: "The 6,000m classroom for Himalayan mountaineers",
    region: "Himalayas",
    state: "Ladakh",
    type: "Mountaineering",
    difficulty: "Expert",
    duration: "7+ days",
    durationDays: "8 days",
    altitude: "6,153m",
      terrain: "Glaciers, scree, summit ridge",
      bestSeason: "Jul – Sep",
        heroImage: "https://images.unsplash.com/photo-1549364472-0972cec89cd8?w=1600&q=90",
    galleryImages: [],
    lat: 34.0166,
    lng: 77.6088,
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
        { name: "White Magic Adventure", verified: true, priceFrom: "₹28,500", rating: 4.8, website: "https://www.whitemagicadventure.com" },
        { name: "Bikat Adventures", verified: true, priceFrom: "₹26,000", rating: 4.7, website: "https://www.bikatadventures.com" },
        { name: "Shikhar Travels", verified: false, priceFrom: "₹24,000", rating: 4.3, website: "https://www.shikhartravels.com" },
        { name: "Above 14000ft", verified: false, priceFrom: "₹29,000", rating: 4.2, website: "https://www.above14000ft.com" },
      ],
    tags: ["mountaineering", "6000m", "glaciers", "summit", "Ladakh"],
    featured: true,
  },
];

export const stories: Story[] = [
  {
    id: "1",
    slug: "what-5000m-feels-like",
    title: "What 5,000m Actually Feels Like",
    excerpt:
      "No one warns you about the way sound changes at altitude — the way your own breathing becomes the loudest thing in the world, and the sky turns a blue so dark it's almost violent.",
    author: "Rohan Mehta",
    authorRole: "Mountaineer & Expedition Leader",
    heroImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=90",
    readTime: "8 min read",
    tags: ["altitude", "Himalayas", "personal"],
    region: "Himalayas",
    date: "Feb 2026",
  },
  {
    id: "2",
    slug: "1000km-ride-what-no-one-tells-you",
    title: "1,000km Ride: What No One Tells You",
    excerpt:
      "Day three, somewhere between Sarchu and Pang, my throttle hand locked. Not from cold — from grip. I'd been white-knuckling gravel at altitude for six hours.",
    author: "Priya Nair",
    authorRole: "Long-Distance Rider & Expedition Cyclist",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90",
    readTime: "12 min read",
    tags: ["motorcycle", "Manali-Leh", "endurance"],
    region: "Himalayas",
    date: "Jan 2026",
  },
  {
    id: "3",
    slug: "andaman-below-the-surface",
    title: "Andaman: Below the Surface",
    excerpt:
      "The Japanese freighter had been sitting on the seafloor since 1945. Inside its hold, lionfish hover in perfect stillness. Outside, a reef shark circles once, decides we're uninteresting, and disappears.",
    author: "Kabir Sharma",
    authorRole: "Dive Master & Marine Photographer",
    heroImage: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1600&q=90",
    readTime: "10 min read",
    tags: ["diving", "Andaman", "underwater"],
    region: "Islands",
    date: "Dec 2025",
  },
  {
    id: "4",
    slug: "dzukou-the-valley-nobody-knows",
    title: "Dzükou: The Valley Nobody Knows",
    excerpt:
      "We arrived in Nagaland expecting infrastructure. We found a valley so untouched that the only path markers were cairns left by previous trekkers, and the only other humans we saw were a family of Naga farmers moving their cattle.",
    author: "Ananya Das",
    authorRole: "Trek Guide & Northeast Specialist",
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=90",
    readTime: "7 min read",
    tags: ["Northeast", "offbeat", "trek"],
    region: "Northeast",
    date: "Nov 2025",
  },
  {
    id: "5",
    slug: "first-timer-on-the-rann",
    title: "First-Timer on the Rann",
    excerpt:
      "I grew up in Mumbai. I had never seen complete darkness, never heard complete silence, never been somewhere where the sky felt bigger than the land. The Rann fixed all three in one night.",
    author: "Isha Kulkarni",
    authorRole: "Travel Writer & First-Time Adventurer",
    heroImage: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=90",
    readTime: "6 min read",
    tags: ["desert", "Gujarat", "first-timer"],
    region: "Desert",
    date: "Jan 2026",
  },
  {
    id: "6",
    slug: "chadar-the-frozen-river",
    title: "Chadar: On the Frozen River",
    excerpt:
      "You don't walk on Chadar. You negotiate with it. Every step is a conversation with the ice — a question asked and answered in fractions of a second, with the river 4m below.",
    author: "Arjun Thakur",
    authorRole: "Expedition Mountaineer & Wilderness Guide",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90",
    readTime: "11 min read",
    tags: ["Ladakh", "winter trek", "extreme"],
    region: "Himalayas",
    date: "Feb 2026",
  },
];

export const regions = [
  {
    name: "Himalayas" as Region,
    tagline: "Peaks, passes & frozen rivers",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    adventureCount: 127,
  },
  {
    name: "Western Ghats" as Region,
    tagline: "Rainforests, rivers & ancient trails",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    adventureCount: 43,
  },
  {
    name: "Desert" as Region,
    tagline: "Salt flats, sand dunes & night skies",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    adventureCount: 28,
  },
  {
    name: "Coast" as Region,
    tagline: "Surf, sea kayaking & coastal hikes",
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80",
    adventureCount: 36,
  },
  {
    name: "Islands" as Region,
    tagline: "Diving, reefs & untouched beaches",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80",
    adventureCount: 22,
  },
  {
    name: "Northeast" as Region,
    tagline: "Offbeat valleys & living root bridges",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80",
    adventureCount: 31,
  },
];

export const adventureTypes = [
  { type: "Trekking" as AdventureType, icon: "🥾", count: 94 },
  { type: "Biking" as AdventureType, icon: "🏍️", count: 38 },
  { type: "Cycling" as AdventureType, icon: "🚴", count: 27 },
  { type: "Diving" as AdventureType, icon: "🤿", count: 19 },
  { type: "Kayaking" as AdventureType, icon: "🛶", count: 24 },
  { type: "Skiing" as AdventureType, icon: "⛷️", count: 8 },
  { type: "Mountaineering" as AdventureType, icon: "🧗", count: 15 },
];
