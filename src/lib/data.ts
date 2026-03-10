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
  | "Urban Adventure"
  | "Paragliding"
  | "Hot Air Balloon";

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
  distance?: string;
  altitude?: string;
  depth?: string;
  bestSeason: string;
  bestMonths: Month[];
  groupSize: GroupSize;
  baseCamp?: string;
  startingPoint?: string;
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
  seedReviews?: SeedReview[];
}

export interface Operator {
  name: string;
  verified: boolean;
  priceFrom: string;
  rating: number;
  website?: string;
}

export interface SeedReview {
  id: string;
  username: string;
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
        distance: "40km",
      altitude: "6,153m",
          bestSeason: "Jul – Sep",
          bestMonths: ["Jul", "Aug", "Sep"],
          groupSize: "Small group (2–6)",
          baseCamp: "Mankorma",
      heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0185-resized-1772367261216.jpeg?width=8000&height=8000&resize=contain",
        galleryImages: [
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0185-resized-1772367261216.jpeg?width=8000&height=8000&resize=contain"
        ],
        lat: 33.9139,
        lng: 77.6285,
      description:
        "Stok Kangri is one of the most accessible 6,000m peaks in the world — and one of the best introductory mountaineering expeditions in India. The summit ridge is a narrow blade of ice and rock with a 360° view of the entire Ladakh range. On a clear summit day, you can see K2.",
      whatMakesSpecial:
        "The jump from 5,000m trekking to 6,000m climbing is immense. This mountain teaches you what your body can do when it has no other option.",
      whoFor: "5,000m+ trekking experience · Basic crampon & ice axe handling · Comfortable with 10–12hr summit day · Fit enough for 15km/day with 10kg pack",
      whoNot: "No prior high-altitude trekking · Cardiac or pulmonary conditions · Arriving without acclimatisation days in Leh · Unable to handle sub-zero bivouac conditions",
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
      seedReviews: [
        { id: "sr-stok-1", username: "ananya_m", rating: 5, body: "One of the hardest and most rewarding things I've done. Summit day is brutal — wind chill at 3am is no joke — but standing on top with all of Ladakh in sight is something I'll never forget. Go with a certified guide, acclimatise properly, and don't rush it.", created_at: "2025-09-14T07:22:00Z", user_id: "" },
        { id: "sr-stok-2", username: "vikram_outdoors", rating: 4, body: "Incredible summit views. The base camp itself is spectacular enough. Only knocked a star because the scree on the descent destroyed my knees — bring trekking poles and take it slow. Would do it again in a heartbeat though.", created_at: "2025-08-28T11:45:00Z", user_id: "" },
        { id: "sr-stok-3", username: "priya_s", rating: 5, body: "Summited in August and conditions were perfect. Our guide Tashi was phenomenal — read the weather better than any app. Highly recommend going with a local Ladakhi operator rather than a Delhi-based agency. Better food, better acclimatisation schedule.", created_at: "2025-08-02T09:10:00Z", user_id: "" },
      ],
    },
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
            distance: "105km",
            altitude: "3,450m",
            bestSeason: "Jan-Feb",
            bestMonths: ["Jan", "Feb"],
            groupSize: "Small group (2–6)",
            baseCamp: "Tilad Sumdo",
            heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0183-resized-1772365087456.jpeg?width=8000&height=8000&resize=contain",
          galleryImages: [
            "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0183-resized-1772365087456.jpeg?width=8000&height=8000&resize=contain",
          ],
        lat: 34.1526,
        lng: 76.8571,
        description:
          "The Chadar Trek is one of the most extraordinary winter treks on Earth. Named after the thick sheet of ice that forms over the Zanskar River each January, this trek takes you through a frozen gorge carved over millennia — a place few humans ever witness. You walk, slip, camp, and survive on the river itself.",
        whatMakesSpecial:
          "There is no trail — the river IS the trail. Vertical cliff walls, frozen waterfalls, and temperatures that plunge to -30°C make this an expedition, not a walk. The silence is otherworldly.",
        whoFor: "Prior cold-weather trekking above 4,000m · Sustained cold tolerance (-25°C nights) · Strong lower-body endurance for 8–12km/day on ice · Comfortable with microspike/crampon travel",
        whoNot: "No previous sub-zero camping · Respiratory or cardiac conditions · Arriving from sea level without 3+ acclimatisation days · Expecting reliable resupply or evacuation access",
        safetyNotes:
          "Carry emergency bivouac gear, layered thermals, and micro-spike crampons. River ice can crack unexpectedly. Always trek with a certified local guide.",
          operators: [
              { name: "Indiahikes", verified: true, priceFrom: "₹25,000", rating: 4.9, website: "https://indiahikes.com/chadar-trek" },
              { name: "Rimo Expeditions", verified: true, priceFrom: "₹28,000", rating: 4.9, website: "https://www.rimoexpeditions.com" },
              { name: "Dreamland Trek & Tour", verified: true, priceFrom: "₹22,000", rating: 4.8, website: "https://www.dreamladakh.com" },
              { name: "Trek The Himalayas", verified: true, priceFrom: "₹26,500", rating: 4.8, website: "https://trekthehimalayas.com/chadar-trek" },
              { name: "Altitude Adventure Ladakh", verified: false, priceFrom: "₹17,500", rating: 4.3, website: "https://www.altitudeadventureladakh.com" },
              { name: "Overland Escape", verified: false, priceFrom: "₹21,000", rating: 4.2, website: "https://www.overlandescape.com" },
            ],
      tags: ["frozen river", "winter", "Ladakh", "extreme cold", "iconic"],
      featured: true,
      seedReviews: [
        { id: "sr-chadar-1", username: "rohan_trek", rating: 5, body: "Walked on a frozen river for four days. That sentence still sounds unreal. The silence out there is unlike anything in the world. Incredibly cold (-25°C at night) but the operators had excellent sleeping gear. A life-defining experience.", created_at: "2025-02-10T06:30:00Z", user_id: "" },
        { id: "sr-chadar-2", username: "deepika_w", rating: 4, body: "Physically demanding but not technically difficult — it's the cold that gets you. Do NOT skip the acclimatisation days in Leh. I saw two people turn back on day one from altitude sickness because they flew straight from Delhi and ignored advice. Otherwise flawless trip.", created_at: "2025-01-25T14:15:00Z", user_id: "" },
        { id: "sr-chadar-3", username: "suresh_k", rating: 5, body: "Third time doing Chadar. The river changes every year — some years there are big ice caves, some years it's flat blue sheets. That unpredictability is half the beauty. Go in late January for the best ice conditions.", created_at: "2025-01-19T08:45:00Z", user_id: "" },
      ],
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
          distance: "490km",
          altitude: "5,359m (Tanglang La)",
        bestSeason: "Jun – Sep",
        bestMonths: ["Jun", "Jul", "Aug", "Sep"],
        groupSize: "Large group (6+)",
          startingPoint: "Manali",
          heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0180-resized-1772364569585.jpeg?width=8000&height=8000&resize=contain",
          galleryImages: [
            "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0180-resized-1772364569585.jpeg?width=8000&height=8000&resize=contain",
          ],
      lat: 32.2396,
    lng: 77.1887,
    description:
        "The Manali–Leh highway is the crown jewel of Indian motorcycling. At over 490km, it crosses five high-altitude passes including Rohtang, Baralacha La, and Tanglang La — each one demanding respect. The road alternates between pristine tarmac and lunar-like gravel stretches. The landscapes are alien in their scale.",
    whatMakesSpecial:
      "No other road on Earth gives you altitude, isolation, and scenery like this. Every 50km the terrain changes completely — pine forests to barren moonscapes to river valleys to glacier edges.",
    whoFor: "500cc+ motorcycle · 3,000km+ highway riding experience · Basic roadside mechanics (chain, puncture, carb) · AMS-acclimatised before departure from Manali",
    whoNot: "Under 500cc engine on steep passes · No prior mountain riding · Zero mechanical knowledge · Tight fixed itinerary with no buffer days",
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
    seedReviews: [
      { id: "sr-manali-1", username: "kartik_r", rating: 5, body: "Did it on a Royal Enfield Himalayan. Tanglang La in rain is terrifying and spectacular at the same time. The camaraderie with other riders on the road is something you can't plan — just happens naturally. Do it before the road gets too crowded.", created_at: "2025-07-18T10:00:00Z", user_id: "" },
      { id: "sr-manali-2", username: "neha_rides", rating: 5, body: "First time on a high-altitude ride and it exceeded every expectation. Baralacha La sunrise was otherworldly. Make sure your bike is serviced the day before departure and carry extra engine oil. The roads after Keylong can be rough.", created_at: "2025-06-30T15:30:00Z", user_id: "" },
      { id: "sr-manali-3", username: "aditya_b", rating: 4, body: "Iconic route, zero arguments. Lost a full day at Keylong due to landslide — factor in buffer days. The Sarchu campsite under the stars is the highlight. Avoid July 15–Aug 15 if you hate crowds.", created_at: "2025-07-05T09:00:00Z", user_id: "" },
    ],
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
      depth: "30m",
      bestSeason: "Nov – May",
      bestMonths: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
      groupSize: "Small group (2–6)",
          heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0184-resized-1772365699244.jpeg?width=8000&height=8000&resize=contain",
      galleryImages: [
        "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0184-resized-1772365699244.jpeg?width=8000&height=8000&resize=contain",
      ],
    lat: 11.7401,
    lng: 92.6586,
    description:
      "The Andaman Islands sit in the Bay of Bengal, far enough from the mainland to have kept their reefs largely intact. Visibility regularly exceeds 30m. You'll dive alongside sea turtles, reef sharks, manta rays, and clouds of barracuda. The Japanese WWII wreck at Rana Shoal is one of the most haunting dives in Asia.",
    whatMakesSpecial:
      "The sheer health of the reefs here is rare. Hard and soft corals in perfect condition, mega-fauna encounters, and remoteness that keeps crowds away.",
    whoFor: "PADI Open Water or equivalent (beginner-friendly) · Advanced divers for wreck & wall dives to 28m · EFR/Rescue Diver cert holders for deep sites · Strong swimmers comfortable in mild current",
    whoNot: "Perforated eardrum or chronic equalisation issues · Cardiac conditions without dive medical clearance · Visiting Jun–Sep (visibility drops to 5–8m during monsoon) · Non-swimmers",
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
    seedReviews: [
      { id: "sr-andaman-1", username: "meera_dives", rating: 5, body: "The WWII wreck at 28m is something else entirely. Saw a reef shark on my third dive, completely chill. Visibility was 25–30m in November. Book your advanced open water before the trip so you can do the deeper dives — totally worth it.", created_at: "2025-11-22T08:00:00Z", user_id: "" },
      { id: "sr-andaman-2", username: "karan_u", rating: 5, body: "Did my PADI open water here as a complete beginner. The instructors at Dive India were patient and incredibly safety-conscious. The coral at Nemo Reef is in perfect health — never seen colour like it. Absolute must-do.", created_at: "2025-12-05T16:20:00Z", user_id: "" },
      { id: "sr-andaman-3", username: "tara_a", rating: 4, body: "Visibility and marine life are genuinely world-class. Just be aware the ferry timings from Port Blair to Havelock are unpredictable — missed one and lost a dive day. Go with a buffer day on either side of your trip.", created_at: "2025-11-10T12:00:00Z", user_id: "" },
    ],
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
      bestSeason: "Jun – Oct",
      bestMonths: ["Jun", "Jul", "Aug", "Sep", "Oct"],
      groupSize: "Small group (2–6)",
        heroImage: "https://images.unsplash.com/photo-1638008302541-5f5a98159df5?w=1200&q=70",
    galleryImages: [],
    lat: 32.2473,
    lng: 78.0350,
    description:
      "Spiti Valley is one of the most remote inhabited regions on Earth. Cycling through it — past mud-brick monasteries perched on cliffs, turquoise rivers, and barren high-altitude desert — is an experience that recalibrates your sense of scale. The oxygen is thin, the landscapes vast.",
    whatMakesSpecial:
      "The isolation is absolute. Many stretches have zero mobile signal, zero other cyclists, and zero settlements for 40–50km. The silence is profound.",
    whoFor: "3,000km+ loaded touring experience · VO2 threshold training for 4,000m+ altitude · Capable of 60–80km/day with 15kg panniers · Self-sufficient with basic bike mechanics",
    whoNot: "No multi-day cycle touring background · Reliant on support vehicle for carry weight · No altitude exposure above 3,500m · Expecting daily resupply or medical access",
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
    seedReviews: [
      { id: "sr-spiti-cyc-1", username: "rahul_c", rating: 5, body: "Kunzum La at 4,590m on a loaded bicycle. I still can't believe I did that. The Spiti Valley is probably the most visually dramatic landscape I've cycled through anywhere in the world. Prepare for thin air and thin tyres — bring two spare tubes minimum.", created_at: "2025-08-20T07:00:00Z", user_id: "" },
      { id: "sr-spiti-cyc-2", username: "shruti_cycles", rating: 4, body: "Did this in September — perfect timing for clear roads and empty campsites. Key Monastery in the late afternoon light from a bike saddle is one of those moments you just sit and absorb. Altitude headaches on day 2 are normal; take it easy.", created_at: "2025-09-08T14:30:00Z", user_id: "" },
      { id: "sr-spiti-cyc-3", username: "mihir_g", rating: 5, body: "Chicham bridge — the highest bridge in Asia — is right on this route and most people just ride past it in five minutes. Stop. Sit on it. Look down. That moment alone justifies the entire trip. Physically the hardest thing I've ever done on a bicycle and I'd go back tomorrow.", created_at: "2025-09-20T08:15:00Z", user_id: "" },
    ],
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
          distance: "15km",
        altitude: "2,452m",
      baseCamp: "Viswema / Zakhama",
        bestSeason: "Jun – Sep, Dec – Mar",
        bestMonths: ["Jun", "Jul", "Aug", "Sep", "Dec", "Jan", "Feb", "Mar"],
          groupSize: "Small group (2–6)",
            heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0181-resized-1772364881220.jpeg?width=8000&height=8000&resize=contain",
      galleryImages: [
        "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0181-resized-1772364881220.jpeg?width=8000&height=8000&resize=contain"
      ],
    lat: 25.5330,
    lng: 94.1009,
    description:
      "Dzükou Valley sits on the border of Nagaland and Manipur at over 2,400m, largely unknown to mainstream trekkers. In summer, the valley floor is carpeted with the rare Dzükou lily — found nowhere else on Earth. In winter, a layer of snow transforms it into complete silence.",
    whatMakesSpecial:
      "The endemic Dzükou lily blooms here and nowhere else. The valley feels genuinely undiscovered, a rare quality in 2024.",
    whoFor: "2+ prior multi-day treks · Comfortable with 10–14km/day on mixed trail · Self-sufficient camping with 12kg pack · No permit bureaucracy — ILP for Nagaland required in advance",
    whoNot: "Zero trekking background · Requiring fixed lodges or daily resupply · Visiting without Inner Line Permit · Expecting maintained trail markings or signage",
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
    seedReviews: [
      { id: "sr-dzukou-1", username: "ira_northeast", rating: 5, body: "The valley in bloom (June–July) is absolutely surreal — a carpet of Dzükou lilies as far as you can see. Almost nobody from outside the region knows this place exists. The trail from Viswema side is more scenic; the Jakhama side is easier. Do both.", created_at: "2025-07-12T08:30:00Z", user_id: "" },
      { id: "sr-dzukou-2", username: "mohan_n", rating: 5, body: "Stayed two nights at the valley campsite. Woke up to fog rolling through at 5am with the lilies swaying. No phone signal, no other trekkers — pure wilderness. One of the most peaceful 48 hours of my life.", created_at: "2025-07-28T11:00:00Z", user_id: "" },
      { id: "sr-dzukou-3", username: "preethi_t", rating: 4, body: "Stunning but the trail conditions in monsoon can be slippery. Hire local Naga guides — they know every shortcut and are great company. Permit process is simple but do it in advance online. Highly recommend over the more crowded Himalayan treks.", created_at: "2025-08-05T09:45:00Z", user_id: "" },
    ],
  },
{
        id: "11",
          slug: "ladakh-circuit",
            name: "Ladakh Circuit",
            tagline: "Nubra dunes, Pangong blue, Umling La at 19,024 ft— Ladakh's full fury on two wheels",
          region: "Himalayas",
          state: "Ladakh",
          type: "Biking",
            difficulty: "Expert",
              duration: "7+ days",
              durationDays: "14 days",
              distance: "1,800km",
                altitude: "5,883m (Umling La)",
            bestSeason: "Jun – Sep",
            bestMonths: ["Jun", "Jul", "Aug", "Sep"],
              groupSize: "Large group (6+)",
              startingPoint: "Leh",
                    heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_2383_Original-resized-1772334437445.jpeg?width=8000&height=8000&resize=contain",
          galleryImages: [],
      lat: 33.7782,
    lng: 78.6753,
        description:
          "The Ladakh Circuit is the ultimate Indian biking odyssey. Covering over 1,800km, this route takes you through Leh, across the towering dunes of Nubra Valley via Khardung La, down to the hypnotic blue expanse of Pangong Lake — whose waters shift from sapphire to turquoise in minutes — then on to the remote plains of Hanle, where the air is so clear and the skies so dark that the Milky Way stretches horizon to horizon like a river of light, and finally up to Umling La at 5,883m, the world's highest motorable road. This circuit pushes both rider and machine to their absolute limits. The landscapes are raw, alien, and unforgettable.",
        whatMakesSpecial:
          "Nubra's sand dunes at 3,000m feel like another planet. Pangong Lake's colour is like nothing else on Earth — 134km of water shifting between sapphire, jade and electric blue. And Umling La at 5,883m is the world's highest motorable road — standing on it on two wheels is a moment very few humans will ever experience.",
    whoFor: "500cc+ motorcycle (RE Himalayan, KTM 390 Adventure or equivalent) · 10,000km+ riding including mountain roads · Roadside repair-capable · Acclimatised before day 1 (3 nights in Leh minimum)",
    whoNot: "Under 350cc engine · No off-road or gravel riding experience · Fixed departure dates with no buffer · Solo riders without satellite communication device",
    safetyNotes:
      "Spend minimum 3 days acclimatising in Leh before starting. Carry oxygen, full repair kit, and satellite communicator. Fuel up whenever possible — stations are 200km+ apart. File a route plan with local police.",
        operators: [
          { name: "Rimo Expeditions", verified: true, priceFrom: "₹65,000", rating: 4.9, website: "https://www.rimoexpeditions.com" },
          { name: "Royal Enfield Marquee Rides", verified: true, priceFrom: "₹1,20,000", rating: 4.9, website: "https://www.royalenfield.com/in/en/rides/marquee-rides" },
          { name: "Himalayan Rider", verified: true, priceFrom: "₹55,000", rating: 4.8, website: "https://himalayanrider.com" },
          { name: "Twisted Trails Adventures", verified: false, priceFrom: "₹48,000", rating: 4.2, website: "https://www.twistedtrailsadv.com" },
          { name: "Dream Riders Group", verified: false, priceFrom: "₹44,000", rating: 4.1, website: "https://thedreamridersgroup.com" },
        ],
            tags: ["Umling La", "world record", "Ladakh", "extreme altitude", "circuit"],
          featured: true,
          seedReviews: [
            { id: "sr-ladakh-1", username: "arjun_rides", rating: 5, body: "Umling La at 5,883m — the world's highest motorable road. My GoPro frosted over. The Bullet misfired twice. My face was numb. Worth every minute of it. The scale of Ladakh from that elevation is incomprehensible.", created_at: "2025-08-15T06:45:00Z", user_id: "" },
            { id: "sr-ladakh-2", username: "nandini_r", rating: 5, body: "22 days, 2,000+km, five of us from Bangalore. The circuit forces you to slow down — it's not a race, it's a complete disconnection from everything. Pangong sunrise on day 10 is when it all clicks. Plan 25 days minimum.", created_at: "2025-07-30T10:15:00Z", user_id: "" },
            { id: "sr-ladakh-3", username: "vivek_l", rating: 4, body: "Do not do this alone on a rental bike. Go with a group or an organised expedition. The remoteness is part of the magic but a breakdown at 5,000m with no signal is genuinely dangerous. With the right crew it's the trip of your life.", created_at: "2025-09-01T14:00:00Z", user_id: "" },
          ],
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
      distance: "600km",
        altitude: "5,091m (Shinku La)",
      bestSeason: "Jul – Sep",
      bestMonths: ["Jul", "Aug", "Sep"],
        groupSize: "Small group (2–6)",
        startingPoint: "Leh / Manali / Kargil",
          heroImage: "https://images.unsplash.com/photo-1706021220078-2051d17b1576?w=1200&q=70",

    galleryImages: [],
    lat: 33.4427,
    lng: 76.8516,
    description:
      "Zanskar is one of the most isolated inhabited valleys on Earth. The road into it — through Pensi La pass and down into the gorge — is barely a road at all. River crossings, crumbling cliff-side tracks, and zero mobile signal make this a true expedition. The reward is a valley frozen in time, with Buddhist monasteries, turquoise rivers, and total silence.",
    whatMakesSpecial:
      "Zanskar is cut off by snow for 8 months a year — this is one of the only places in India where the outside world genuinely cannot reach you. The riding is raw and technical.",
    whoFor: "500cc+ enduro or adventure motorcycle · Off-road riding proficiency (gravel, river crossings, loose scree) · Full expedition kit including recovery gear · Support vehicle strongly recommended",
    whoNot: "Road-biased tyres or low-clearance bikes · No river-crossing experience · Unwilling to walk sections during difficult passes · No prior Himalayan riding",
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
    seedReviews: [
      { id: "sr-zanskar-1", username: "sameer_offroad", rating: 5, body: "The Zanskar road is not a road — it's a suggestion. River crossings, loose scree, landslide debris. And the valley on the other side is one of the most beautiful and isolated places on the planet. Absolutely not for beginners.", created_at: "2025-08-22T07:30:00Z", user_id: "" },
      { id: "sr-zanskar-2", username: "leela_b", rating: 4, body: "Go with Mototour Ladakh — they know the river crossing timings (crucial for safety) and have a support vehicle. The monastery at Padum is worth a full rest day. Carry more cash than you think you need — no ATMs beyond Kargil.", created_at: "2025-09-03T12:00:00Z", user_id: "" },
      { id: "sr-zanskar-3", username: "keshav_z", rating: 5, body: "Three days without phone signal. Woke up to a frozen tent on day two. The Zanskar River at sunrise was a shade of blue I've never seen anywhere else. This is real remote India and it will reset your perspective completely. Non-negotiable: go with a local guide.", created_at: "2025-08-30T06:00:00Z", user_id: "" },
    ],
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
          distance: "450km",
          altitude: "4,551m (Kunzum Pass)",
        bestSeason: "Jun – Oct",
        bestMonths: ["Jun", "Jul", "Aug", "Sep", "Oct"],
          groupSize: "Small group (2–6)",
          startingPoint: "Manali / Shimla",
          heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0182-resized-1772365162828.jpeg?width=8000&height=8000&resize=contain",
      galleryImages: [
        "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_0182-resized-1772365162828.jpeg?width=8000&height=8000&resize=contain"
      ],
    lat: 32.2473,
    lng: 78.0350,
    description:
      "The Spiti loop — entering via Manali over Rohtang and Kunzum La, and exiting via Shimla through Kinnaur — is one of the most beautiful roads in Asia. Mud monasteries at 4,000m, apple orchards in ancient river valleys, and stretches of road so remote the tarmac simply stops. Spiti delivers everything.",
    whatMakesSpecial:
      "The circuit is completable without extreme technical skill, yet the scenery rivals anything in Ladakh. Key Monastery, Dhankar, and Tabo make this as culturally rich as it is visually stunning.",
    whoFor: "350cc+ motorcycle with good torque · 5,000km+ riding experience on varied terrain · Comfortable navigating without painted roads · Altitude-conscious and carrying diamox if needed",
    whoNot: "150–200cc commuter bikes (insufficient power on Kunzum La) · No prior Himalayan or high-altitude riding · Tight schedule with no contingency days · Riders without cold-weather riding gear",
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
    seedReviews: [
      { id: "sr-spiti-bike-1", username: "gaurav_spiti", rating: 5, body: "The Spiti loop is what riding in India is actually about. Dhankar Monastery perched on a cliff, Pin Valley in golden hour, locals waving from monastery rooftops. Not once did it feel like a tourist route.", created_at: "2025-07-25T09:00:00Z", user_id: "" },
      { id: "sr-spiti-bike-2", username: "divya_m", rating: 5, body: "Did the loop in 10 days but could easily have stayed 14. Kibber is the place to base yourself for a rest day — the village is tiny and perfect. Spiti Riders Group handled everything seamlessly; would book with them again without question.", created_at: "2025-08-10T15:45:00Z", user_id: "" },
      { id: "sr-spiti-bike-3", username: "tanvir_s", rating: 4, body: "The stretch from Kaza to Losar before Kunzum La is some of the most surreal riding in the country — brown desert mountains, a turquoise river, zero traffic. Book accommodation at Kaza in advance for July/August. Everything else can be figured out on the road.", created_at: "2025-07-30T13:00:00Z", user_id: "" },
    ],
  }
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
              heroImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/71778e38-df00-4ed2-869a-028f1f2862c1/IMG_3620_Original-resized-1772404370295.jpeg?width=8000&height=8000&resize=contain",
            readTime: "15 min read",

              tags: ["Featured", "TTT Original", "Ladakh"],
              region: "Himalayas",
              date: "July 2022",
        },
];

export const regions = [
  {
    name: "Himalayas" as Region,
    tagline: "Peaks, passes & frozen rivers",
      image: "https://images.unsplash.com/photo-1599661520791-8aabee470d55?w=800&q=80",
      adventureCount: 7,
  },
  {
    name: "Western Ghats" as Region,
      tagline: "Rainforests, rivers & ancient trails",
        image: "https://images.unsplash.com/photo-1695211564991-9cf8f7a1d799?w=800&q=80",
      adventureCount: 0,
  },
  {
    name: "Eastern Ghats" as Region,
    image: "https://images.unsplash.com/photo-1663597675745-96a3f784369e?w=800&q=80",
    tagline: "Tribal trails, gorges & hidden waterfalls",
    adventureCount: 0,
  },
  {
    name: "Desert" as Region,
    tagline: "Salt flats, sand dunes & night skies",
      image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&q=80",
    adventureCount: 0,
  },
  {
    name: "Coast" as Region,
    tagline: "Surf, sea kayaking & coastal hikes",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    adventureCount: 0,
  },
  {
    name: "Islands" as Region,
    tagline: "Diving, reefs & untouched beaches",
      image: "https://images.unsplash.com/photo-1745917784557-a93bf209232c?w=800&q=80",
    adventureCount: 1,
  },
  {
    name: "Northeast" as Region,
      tagline: "Offbeat valleys & living root bridges",
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    adventureCount: 1,
  },
  {
    name: "Urban" as Region,
    tagline: "City trails, rooftops & street culture",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    adventureCount: 0,
  },
];

export const adventureTypes = [
  { type: "Trekking" as AdventureType, count: 2 },
  { type: "Biking" as AdventureType, count: 4 },
  { type: "Cycling" as AdventureType, count: 1 },
  { type: "Mountaineering" as AdventureType, count: 1 },
  { type: "Rock Climbing" as AdventureType, count: 0 },
  { type: "Jeep Safari" as AdventureType, count: 0 },
  { type: "Camel Safari" as AdventureType, count: 0 },
  { type: "Caving" as AdventureType, count: 0 },
  { type: "Sandboarding" as AdventureType, count: 0 },
  { type: "Urban Adventure" as AdventureType, count: 0 },
  { type: "Diving" as AdventureType, count: 1 },
  { type: "Kayaking" as AdventureType, count: 0 },
  { type: "Skiing" as AdventureType, count: 0 },
];
