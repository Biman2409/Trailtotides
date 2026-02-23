export type AdventureType =
  | "Trek"
  | "Bike Trip"
  | "Cycling"
  | "Scuba"
  | "Kayaking"
  | "Skiing"
  | "Mountaineering"
  | "Desert Trail";

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
    tagline: "Walk the frozen river of Ladakh",
    region: "Himalayas",
    state: "Ladakh",
    type: "Trek",
    difficulty: "Expert",
    duration: "7+ days",
    durationDays: "9 days",
    altitude: "3,450m",
    terrain: "Frozen river, ice sheets",
    bestSeason: "Jan – Feb",
      heroImage: "https://images.unsplash.com/photo-b0VqJ_DLXC4?w=1600&q=90",
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
      { name: "Zanskar Adventures", verified: true, priceFrom: "₹22,000", rating: 4.9 },
      { name: "Leh Wild", verified: true, priceFrom: "₹18,500", rating: 4.7 },
    ],
    tags: ["frozen river", "winter", "Ladakh", "extreme cold", "iconic"],
    featured: true,
  },
  {
    id: "2",
    slug: "valley-of-flowers",
    name: "Valley of Flowers",
    tagline: "Where the Himalayas bloom in colour",
    region: "Himalayas",
    state: "Uttarakhand",
    type: "Trek",
    difficulty: "Beginner",
    duration: "3–5 days",
    durationDays: "4 days",
    altitude: "3,658m",
    terrain: "Alpine meadows, glacial streams",
    bestSeason: "Jul – Sep",
      heroImage: "https://images.unsplash.com/photo-1530022821083-87f84bba0b5a?w=1600&q=90",
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
      { name: "Himalayan High", verified: true, priceFrom: "₹8,500", rating: 4.8 },
      { name: "Trek The Himalayas", verified: true, priceFrom: "₹7,200", rating: 4.6 },
    ],
    tags: ["wildflowers", "UNESCO", "monsoon", "gentle", "photography"],
    featured: true,
  },
  {
    id: "3",
    slug: "manali-leh-bike-expedition",
    name: "Manali–Leh Highway",
    tagline: "The world's most legendary high-altitude ride",
    region: "Himalayas",
    state: "Himachal Pradesh / Ladakh",
    type: "Bike Trip",
    difficulty: "Intermediate",
    duration: "7+ days",
    durationDays: "10 days",
    altitude: "5,328m (Khardung La)",
    terrain: "Mountain highways, river crossings, high passes",
    bestSeason: "Jun – Sep",
      heroImage: "https://images.unsplash.com/photo-1585016495481-91613a3b9de0?w=1600&q=90",
      galleryImages: [
        "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?w=800&q=80",
      ],
    lat: 32.2396,
    lng: 77.1887,
    description:
      "The Manali–Leh highway is the crown jewel of Indian motorcycling. At over 490km, it crosses five high-altitude passes including Rohtang, Baralacha La, and Khardung La — each one demanding respect. The road alternates between pristine tarmac and lunar-like gravel stretches. The landscapes are alien in their scale.",
    whatMakesSpecial:
      "No other road on Earth gives you altitude, isolation, and scenery like this. Every 50km the terrain changes completely — pine forests to barren moonscapes to river valleys to glacier edges.",
    whoFor: "Experienced riders with 500cc+ bikes, those with basic mechanical knowledge, altitude-fit adventurers.",
    whoNot: "First-time riders, those without altitude acclimatisation, anyone on unreliable bikes.",
    safetyNotes:
      "Carry a basic repair kit, spare clutch cable, and fuel for 150km stretches. Altitude sickness is real — acclimatise in Manali for 2 days minimum. Ride before noon to avoid afternoon weather.",
    operators: [
      { name: "Himalayan Moto", verified: true, priceFrom: "₹35,000", rating: 4.9 },
      { name: "Royal Brothers", verified: true, priceFrom: "₹28,000", rating: 4.5 },
    ],
    tags: ["motorcycle", "high passes", "Ladakh", "iconic", "long ride"],
    featured: true,
  },
  {
    id: "4",
    slug: "andaman-scuba-diving",
    name: "Andaman Islands Diving",
    tagline: "Beneath the surface of India's most pristine waters",
    region: "Islands",
    state: "Andaman & Nicobar",
    type: "Scuba",
    difficulty: "Beginner",
    duration: "3–5 days",
    durationDays: "4 days",
    altitude: "Sea level",
    terrain: "Coral reefs, drop-offs, WWII wrecks",
    bestSeason: "Nov – May",
      heroImage: "https://images.unsplash.com/photo-1587915598011-d85a5ee7b8f5?w=1600&q=90",
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
      { name: "Dive India", verified: true, priceFrom: "₹4,500/dive", rating: 4.9 },
      { name: "Barefoot Scuba", verified: true, priceFrom: "₹3,800/dive", rating: 4.7 },
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
      heroImage: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1600&q=90",
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
      { name: "Spiti Ecosphere", verified: true, priceFrom: "₹45,000", rating: 4.8 },
    ],
    tags: ["cycling", "remote", "cold desert", "monasteries", "extreme"],
    featured: false,
  },
  {
    id: "6",
    slug: "coorg-kayaking",
    name: "Coorg River Kayaking",
    tagline: "Paddle through the coffee highlands of Karnataka",
    region: "Western Ghats",
    state: "Karnataka",
    type: "Kayaking",
    difficulty: "Beginner",
    duration: "Weekend",
    durationDays: "2 days",
    altitude: "900m",
    terrain: "River rapids (Grade I–III), forest canopy",
    bestSeason: "Oct – Mar",
      heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=90",
    galleryImages: [],
    lat: 12.3375,
    lng: 75.8069,
    description:
      "The rivers of Coorg run cold and fast through one of India's most lush landscapes. Kayaking here means gliding beneath a canopy of teak, bamboo, and coffee plants, with occasional white-water surges keeping your heart rate up. Kingfishers, river otters, and crocodiles share these waters.",
    whatMakesSpecial:
      "The combination of accessibility (5 hours from Bangalore) and genuine wilderness makes this the ideal first-time kayaking experience.",
    whoFor: "Beginners, families, weekend adventurers from South Indian cities.",
    whoNot: "Those seeking extreme white-water. Coorg kayaking is scenic and gentle, not adrenaline-heavy.",
    safetyNotes:
      "Always wear a PFD (life jacket) and helmet on rapids. Don't paddle solo. Post-monsoon river levels can rise dramatically — check conditions.",
    operators: [
      { name: "Coorg Adventure", verified: true, priceFrom: "₹2,500", rating: 4.6 },
    ],
    tags: ["kayaking", "river", "weekend", "accessible", "wildlife"],
    featured: false,
  },
  {
    id: "7",
    slug: "dzukou-valley-trek",
    name: "Dzükou Valley Trek",
    tagline: "The valley that the gods kept for themselves",
    region: "Northeast",
    state: "Nagaland / Manipur",
    type: "Trek",
    difficulty: "Intermediate",
    duration: "3–5 days",
    durationDays: "3 days",
    altitude: "2,452m",
      terrain: "Dense forest, alpine meadows, seasonal rivers",
      bestSeason: "Jun – Sep, Dec – Mar",
      heroImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=90",
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
      { name: "Northeast Trails", verified: true, priceFrom: "₹5,500", rating: 4.7 },
    ],
    tags: ["offbeat", "endemic flora", "Northeast", "rare", "solitude"],
    featured: true,
  },
  {
    id: "8",
    slug: "rann-of-kutch-desert-trail",
    name: "Rann of Kutch Desert Trail",
    tagline: "The white horizon that never ends",
    region: "Desert",
    state: "Gujarat",
    type: "Desert Trail",
    difficulty: "Beginner",
    duration: "Weekend",
    durationDays: "3 days",
    altitude: "Sea level",
      terrain: "Salt flats, sand dunes, grasslands",
      bestSeason: "Nov – Feb",
      heroImage: "https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=1600&q=90",
    galleryImages: [],
    lat: 23.7337,
    lng: 70.1667,
    description:
      "The Great Rann of Kutch is the world's largest salt desert — a completely flat white plain stretching to the horizon under an infinite sky. During the Rann Utsav season, you can walk out into the salt flat at night and watch the Milky Way reflected in a thin layer of water. It's one of the most disorienting, beautiful experiences in India.",
    whatMakesSpecial:
      "The flatness and silence. You can literally see the curvature of the Earth. Night skies here are exceptional. Wild ass sanctuary nearby.",
    whoFor: "Everyone. This is one of India's most accessible and visually stunning adventures. Night walkers, stargazers, photographers.",
    whoNot: "Those expecting strenuous adventure. This is immersive, not physically demanding.",
    safetyNotes:
      "Carry water — dehydration is a serious risk even in winter. Wear full-sleeve sun protection. Don't venture deep into the flats alone.",
    operators: [
      { name: "Rann Riders", verified: true, priceFrom: "₹3,500", rating: 4.5 },
    ],
    tags: ["salt desert", "night sky", "Gujarat", "accessible", "stargazing"],
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
      heroImage: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600&q=90",
    galleryImages: [],
    lat: 30.5292,
    lng: 79.5665,
    description:
      "Auli is India's premier ski destination — 16km of slopes with a cable car and chair lift, overlooking a panorama of Nanda Devi, Mana Parbat, and the Dunagiri peaks. The powder after a fresh snowfall rivals anything in the Alps.",
    whatMakesSpecial:
      "The backdrop is world-class. Few ski resorts on Earth offer a view like Auli's — the entire Garhwal Himalaya spread behind you as you ride.",
    whoFor: "Beginner to advanced skiers. Snowboarders welcome. Great for families.",
    whoNot: "Those wanting après-ski nightlife. Auli is simple and raw — but the skiing is real.",
    safetyNotes:
      "Rent equipment from verified shops at the resort. Always check avalanche bulletins. Ski with a buddy or instructor if new to the slopes.",
    operators: [
      { name: "GMVN Auli", verified: true, priceFrom: "₹6,000", rating: 4.4 },
      { name: "Ski Himalaya", verified: true, priceFrom: "₹9,500", rating: 4.7 },
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
      heroImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&q=90",
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
      { name: "Leh Adventures", verified: true, priceFrom: "₹28,000", rating: 4.9 },
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
  { type: "Trek" as AdventureType, icon: "🥾", count: 94 },
  { type: "Bike Trip" as AdventureType, icon: "🏍️", count: 38 },
  { type: "Cycling" as AdventureType, icon: "🚴", count: 27 },
  { type: "Scuba" as AdventureType, icon: "🤿", count: 19 },
  { type: "Kayaking" as AdventureType, icon: "🛶", count: 24 },
  { type: "Skiing" as AdventureType, icon: "⛷️", count: 8 },
  { type: "Mountaineering" as AdventureType, icon: "🧗", count: 15 },
  { type: "Desert Trail" as AdventureType, icon: "🐪", count: 11 },
];
