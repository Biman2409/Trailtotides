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
  id: "16",
  slug: "kedarkantha-trek",
  name: "Kedarkantha Summit",
  tagline: "A 12,500 ft winter summit that looks impossibly close — until it isn't",
  region: "Himalayas",
  state: "Uttarakhand",
  type: "Trekking",
  difficulty: "Intermediate",
  duration: "3–5 days",
  durationDays: "6 days",
  distance: "22km",
  altitude: "3,810m",
  bestSeason: "Dec – Apr",
  bestMonths: ["Dec", "Jan", "Feb", "Mar", "Apr"],
  groupSize: "Large group (6+)",
  baseCamp: "Sankri",
  heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=70",
  galleryImages: [],
  lat: 31.0214,
  lng: 78.1831,
  description:
    "Kedarkantha is India's most popular winter summit trek — and for good reason. Starting from the village of Sankri in the Govind Wildlife Sanctuary, the trail climbs through dense pine and oak forests dusted in snow before breaking into open meadows leading to the summit cone. The 360° panorama from 3,810m includes peaks from Swargarohini and Bandarpunch to Gangotri and Kedarnath.",
  whatMakesSpecial:
    "For many trekkers, Kedarkantha is the first summit of their lives. It's also one of the most accessible winter snow experiences in India, combining a genuine high-point with stunning Garhwal Himalaya views.",
  whoFor: "First-time summit trekkers · Comfortable with 10–12km/day in snow · Basic layering system for -10°C nights · No prior crampon experience needed",
  whoNot: "Expecting a walk in the park (summit day gains 900m) · Visiting without proper winter gear · Arriving in peak summer (no snow, less scenic) · Those with acute vertigo on open ridgelines",
  safetyNotes:
    "Start summit push by 4am to reach top by 9am before clouds build. Carry microspikes in January–February. Turn back from the summit cone in high wind.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹11,000", rating: 4.9, website: "https://indiahikes.com/kedarkantha-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹10,900", rating: 4.8, website: "https://trekthehimalayas.com/kedarkantha-trek" },
    { name: "Bikat Adventures", verified: true, priceFrom: "₹10,800", rating: 4.7, website: "https://www.bikatadventures.com/Home/Itinerary/kedarkantha-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹9,500", rating: 4.3, website: "https://www.trekmunk.com/treks/kedarkantha" },
    { name: "Trekup India", verified: false, priceFrom: "₹10,000", rating: 4.2, website: "https://www.trekupindia.com/kedarkantha-trek" },
  ],
  tags: ["winter summit", "snow trek", "beginner summit", "Uttarakhand", "iconic"],
  featured: true,
  seedReviews: [
    { id: "sr-kedarkantha-1", username: "priyanka_h", rating: 5, body: "My first summit ever and I could not have picked a better one. The sunrise from the top with Bandarpunch and Swargarohini turning pink is something that I keep coming back to in my mind. The trail through the pine forest at night with headlamps was magical. Do it.", created_at: "2025-01-18T07:45:00Z", user_id: "" },
    { id: "sr-kedarkantha-2", username: "aditya_snow", rating: 5, body: "Third time on Kedarkantha and I still get emotional at the top. January is the best month — waist-deep snow in the forest, crystal clear skies at the summit. Indiahikes runs it extremely well. The food at camp in sub-zero temperatures is surprisingly good.", created_at: "2025-01-28T09:00:00Z", user_id: "" },
    { id: "sr-kedarkantha-3", username: "tanya_k", rating: 4, body: "Perfect winter trek for beginners but don't underestimate summit day. Started at 4am, reached the top at 8:30am with light cloud starting to build. The Sankri base camp has improved a lot — warm tents and decent toilets. One star deducted for the crowding in peak December.", created_at: "2025-12-27T08:30:00Z", user_id: "" },
  ],
},
{
  id: "17",
  slug: "valley-of-flowers-trek",
  name: "Valley of Flowers",
  tagline: "A UNESCO-listed valley that explodes in colour when the rest of India bakes in heat",
  region: "Himalayas",
  state: "Uttarakhand",
  type: "Trekking",
  difficulty: "Intermediate",
  duration: "3–5 days",
  durationDays: "6 days",
  distance: "37km",
  altitude: "4,298m (Hemkund Sahib)",
  bestSeason: "Jul – Sep",
  bestMonths: ["Jul", "Aug", "Sep"],
  groupSize: "Large group (6+)",
  baseCamp: "Govind Ghat",
  heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=70",
  galleryImages: [],
  lat: 30.7275,
  lng: 79.6071,
  description:
    "The Valley of Flowers National Park sits in the Zanskar range of western Garhwal at 3,658m. A UNESCO World Heritage Site, it shelters over 500 species of alpine wildflowers — including rare Brahmakamal, blue poppy, and dozens of orchid varieties — that bloom simultaneously in the monsoon months. Combined with the Sikh shrine of Hemkund Sahib at 4,298m, this is one of the most spiritually and visually complete treks in India.",
  whatMakesSpecial:
    "The valley is a botanical marvel — 87% of Himalayan flower species in one enclosed meadow. The contrast between the flower carpet and snow peaks is unlike any landscape in India.",
  whoFor: "Comfortable with 8–10km/day on well-maintained trail · Happy with moderate acclimatisation to 4,300m · No technical climbing required · Suitable for families with teenage children",
  whoNot: "Expecting solitude (heavily visited Jul–Aug) · Visiting outside the bloom window (Oct onwards flowers are gone) · Those with severe pollen allergies · Non-walkers expecting a drive-in",
  safetyNotes:
    "The trail to Hemkund Sahib is steep and can be slippery in monsoon. No camping allowed inside the national park — base at Ghangaria. Start early for Hemkund to avoid afternoon rain.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹11,000", rating: 4.9, website: "https://indiahikes.com/valley-of-flowers-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹11,800", rating: 4.8, website: "https://trekthehimalayas.com/valley-of-flowers-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹12,000", rating: 4.3, website: "https://www.trekmunk.com/treks/valley-of-flowers-trek" },
    { name: "Trekup India", verified: false, priceFrom: "₹11,000", rating: 4.2, website: "https://www.trekupindia.com/valley-of-flowers-trek" },
  ],
  tags: ["UNESCO", "wildflowers", "alpine meadows", "Uttarakhand", "Hemkund Sahib"],
  featured: true,
  seedReviews: [
    { id: "sr-vof-1", username: "sneha_wildflowers", rating: 5, body: "August 3rd. The valley after two days of rain. The flowers were at absolute peak — every patch of ground fighting for colour. Brahmakamal in the upper section, blue poppies near the stream, entire hillsides in yellow and purple. I sat in the middle of it for an hour and didn't move.", created_at: "2025-08-05T10:15:00Z", user_id: "" },
    { id: "sr-vof-2", username: "harish_g", rating: 5, body: "Did the combination with Hemkund Sahib — the Gurudwara lake at 4,300m surrounded by snow peaks is one of the most serene places I've ever been to. Go in the first or second week of August for the best flower density. The trail from Govind Ghat is well-maintained and clearly marked.", created_at: "2025-08-14T09:30:00Z", user_id: "" },
    { id: "sr-vof-3", username: "kamla_t", rating: 4, body: "Genuinely one of the most beautiful places in India. Deducted a star because July weekends get crowded at Ghangaria — book accommodation weeks in advance. The valley itself has a daily entry time window so go early. The resident blue sheep (bharal) are completely unfazed by humans.", created_at: "2025-07-22T14:00:00Z", user_id: "" },
  ],
},
{
  id: "18",
  slug: "hampta-pass-trek",
  name: "Hampta Pass Trek",
  tagline: "Cross from Kullu's lush green forests into Spiti's barren moon landscape in a single day",
  region: "Himalayas",
  state: "Himachal Pradesh",
  type: "Trekking",
  difficulty: "Intermediate",
  duration: "3–5 days",
  durationDays: "5 days",
  distance: "25km",
  altitude: "4,298m",
  bestSeason: "Jun – Sep",
  bestMonths: ["Jun", "Jul", "Aug", "Sep"],
  groupSize: "Small group (2–6)",
  baseCamp: "Manali",
  heroImage: "https://images.unsplash.com/photo-1626014303765-6b7f1e8e55a3?w=1200&q=70",
  galleryImages: [],
  lat: 32.2711,
  lng: 77.2655,
  description:
    "The Hampta Pass trek is one of India's great geographical contrasts. In a single day's crossing of the 4,298m pass, the landscape shifts from the green, forested Kullu Valley to the stark, bone-dry high-altitude desert of Lahaul. Many operators combine this with a jeep trip to Chandratal Lake — adding a sapphire-blue moon lake to an already spectacular itinerary.",
  whatMakesSpecial:
    "The contrast crossing is one of the most dramatic in the Himalayas. Green to barren in 8 hours. The Chandratal extension turns this into one of India's finest 5-day treks.",
  whoFor: "Prior 3–4 day trek experience · Comfortable at 4,000m+ overnight camping · Happy with moderate river crossings · No technical skills required",
  whoNot: "No prior overnight trekking experience · Those with severe altitude sensitivity · Visiting in early June (pass may still be snowbound) · Expecting manicured trails",
  safetyNotes:
    "River crossings before the pass can be deep in July — use trekking poles. Weather on the pass changes quickly; layer up before the crossing. Chandratal is at 4,250m — pace yourself.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹14,000", rating: 4.9, website: "https://indiahikes.com/hampta-pass-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹12,500", rating: 4.8, website: "https://trekthehimalayas.com/hampta-pass-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹12,000", rating: 4.3, website: "https://www.trekmunk.com/treks/hampta-pass-and-chandra-tal-trek" },
    { name: "Trekup India", verified: false, priceFrom: "₹12,000", rating: 4.2, website: "https://www.trekupindia.com/hampta-pass-trek" },
  ],
  tags: ["landscape contrast", "high pass", "Himachal Pradesh", "Chandratal", "camping"],
  featured: false,
  seedReviews: [
    { id: "sr-hampta-1", username: "rajan_h", rating: 5, body: "The moment you crest the pass and look down into Lahaul is one of those trekking moments you remember forever. You've spent two days in green valleys and suddenly — grey rock, barren scree, blue sky and nothing else. The Chandratal extension is non-negotiable. Do it.", created_at: "2025-07-15T08:00:00Z", user_id: "" },
    { id: "sr-hampta-2", username: "pooja_outdoors", rating: 4, body: "The July river crossings before the pass were thigh-deep and cold. Absolutely manageable but not something to rush. Our guide set a rope for the deeper ones. Chandratal at sunset was worth every step. The campsite by the lake is one of the best in the Himalayas.", created_at: "2025-07-28T10:30:00Z", user_id: "" },
    { id: "sr-hampta-3", username: "nikhil_trek", rating: 5, body: "Best 5-day trek I've done for the price. The ecological contrast — lush Kullu to barren Lahaul — in a single morning's walk is extraordinary. Indiahikes manages this route extremely well. The campsite at Balu Ka Ghera with Indrasan in the background is a view you'd pay good money for.", created_at: "2025-08-02T09:45:00Z", user_id: "" },
  ],
},
{
  id: "19",
  slug: "kashmir-great-lakes",
  name: "Kashmir Great Lakes",
  tagline: "Seven alpine lakes, six passes, and valleys so green they look painted",
  region: "Himalayas",
  state: "Jammu & Kashmir",
  type: "Trekking",
  difficulty: "Advanced",
  duration: "7+ days",
  durationDays: "8 days",
  distance: "72km",
  altitude: "4,191m (Gadsar Pass)",
  bestSeason: "Jul – Aug",
  bestMonths: ["Jul", "Aug"],
  groupSize: "Small group (2–6)",
  baseCamp: "Sonamarg",
  heroImage: "https://images.unsplash.com/photo-1614102073832-030967418971?w=1200&q=70",
  galleryImages: [],
  lat: 34.3048,
  lng: 75.2890,
  description:
    "The Kashmir Great Lakes trek takes you through seven high-altitude lakes set in some of the most lush alpine scenery on earth. Starting from Sonamarg and finishing at the Naranag valley, the route crosses multiple 4,000m+ passes through meadows thick with wildflowers, limestone peaks, and perfect reflections in still high-mountain water. This is the Himalayan trek that doesn't look like the Himalayas.",
  whatMakesSpecial:
    "The unusual combination of turquoise lakes, emerald meadows, and snow peaks makes this one of the most photographically dramatic treks in all of India.",
  whoFor: "Prior 7+ day trek experience · Comfortable crossing 4,000m+ passes on consecutive days · Self-sufficient with 12kg pack · Aware of the permit/security requirements for J&K",
  whoNot: "First-time trekkers (daily distances and altitudes are sustained) · Those unable to obtain Sonamarg entry permits · Visiting September onwards (flowers finish, weather deteriorates) · Expecting hotel-standard facilities",
  safetyNotes:
    "Register with local police before departure. Carry all cash — no ATMs on route. Be prepared for rapid weather changes and snow on Gadsar Pass even in July.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹20,000", rating: 4.9, website: "https://indiahikes.com/kashmir-great-lakes-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹21,000", rating: 4.8, website: "https://trekthehimalayas.com/kashmir-great-lakes-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹18,000", rating: 4.3, website: "https://www.trekmunk.com/treks/kashmir-great-lakes-trek" },
  ],
  tags: ["alpine lakes", "Kashmir", "wildflowers", "high passes", "photography"],
  featured: true,
  seedReviews: [
    { id: "sr-kgl-1", username: "siddharth_k", rating: 5, body: "Vishansar Lake in the morning mist, Gangabal as a mirror at 6am, Gadsar with snow still on the banks in July. This is India's most photogenic trek and it isn't even close. The meadows between lakes are so green and gentle they feel like a dream.", created_at: "2025-07-30T07:00:00Z", user_id: "" },
    { id: "sr-kgl-2", username: "anjali_hiker", rating: 5, body: "Done at least 15 Himalayan treks. Kashmir Great Lakes is top 2. The scale of the meadows (nagins) between the passes, the quality of the wildflowers, and the surprise of each new lake colour as you crest each pass — it builds brilliantly. Don't rush this one.", created_at: "2025-08-10T09:00:00Z", user_id: "" },
    { id: "sr-kgl-3", username: "zubair_k", rating: 4, body: "Truly spectacular but the permit process adds overhead. Sort your permissions before you even travel to Srinagar. The Indiahikes team handled everything seamlessly on our trip. Also — Gadsar Pass after rain is extremely slippery. Take your time on the descent.", created_at: "2025-07-20T14:30:00Z", user_id: "" },
  ],
},
{
  id: "20",
  slug: "rupin-pass-trek",
  name: "Rupin Pass Trek",
  tagline: "A waterfall campsite, a snow tunnel, and a 4,650m pass — in eight days",
  region: "Himalayas",
  state: "Uttarakhand / Himachal Pradesh",
  type: "Trekking",
  difficulty: "Advanced",
  duration: "7+ days",
  durationDays: "8 days",
  distance: "44km",
  altitude: "4,650m",
  bestSeason: "May – Jun, Sep – Oct",
  bestMonths: ["May", "Jun", "Sep", "Oct"],
  groupSize: "Small group (2–6)",
  baseCamp: "Dhaula",
  heroImage: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=70",
  galleryImages: [],
  lat: 31.2090,
  lng: 77.8100,
  description:
    "The Rupin Pass trek is widely regarded as one of the most dramatic treks in India — and with good reason. It combines a thundering multi-tiered waterfall at lower camp, a camping ground ringed by snow peaks in the middle section, and a steep climb through a literal snow tunnel to reach the 4,650m pass. The route crosses from Uttarakhand into Himachal Pradesh over terrain that tests even experienced trekkers.",
  whatMakesSpecial:
    "The Rupin waterfall campsite is unlike any other in the Himalayas. The snow bridge near the pass, and the view back from the top across the Rupin glacier bowl, make this one of the most memorable single days in Indian trekking.",
  whoFor: "Prior 6-day+ difficult trek experience · Comfortable on steep snow ascents with trekking poles · Able to handle 10-hour days on summit day · Strong lower body endurance",
  whoNot: "First-time trekkers or those who've only done easy grades · Knee-injured trekkers (steep descent from pass) · Those attempting in late July–August (heavy monsoon on this route) · Anyone scared of heights on narrow snow fields",
  safetyNotes:
    "The snow bridge above the waterfall camp can be unstable in June — check current conditions with your operator. Carry microspikes for the pass crossing in May. Summit day is 10–12hrs.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹16,000", rating: 4.9, website: "https://indiahikes.com/rupin-pass-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹16,500", rating: 4.8, website: "https://trekthehimalayas.com/rupin-pass-trek" },
    { name: "Bikat Adventures", verified: false, priceFrom: "₹16,650", rating: 4.3, website: "https://www.bikatadventures.com/Home/Itinerary/rupin-pass-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹18,550", rating: 4.2, website: "https://www.trekmunk.com/treks/rupin-pass" },
  ],
  tags: ["waterfall camp", "snow pass", "Uttarakhand", "difficult", "dramatic"],
  featured: false,
  seedReviews: [
    { id: "sr-rupin-1", username: "rohit_rupin", rating: 5, body: "The campsite by the waterfall is unlike anything I've experienced. You pitch your tent 20 metres from a thundering 200-foot fall. The next morning you climb past it. Then past the snow tunnel. Then across the pass. It keeps delivering right until the very end.", created_at: "2025-06-05T08:00:00Z", user_id: "" },
    { id: "sr-rupin-2", username: "kavya_treks", rating: 5, body: "Best hard trek I've done. The contrast between the green lower valley, the snow amphitheatre mid-route, and the barren Himachal side after the pass is extraordinary. Summit day starts at 4am and is relentless — but completely achievable if you've trained. Proper crampon practice recommended.", created_at: "2025-05-28T11:00:00Z", user_id: "" },
    { id: "sr-rupin-3", username: "vikas_pass", rating: 4, body: "The snow tunnel in early June was genuinely exciting — not dangerous but a real mountain moment. Deducted a star because the Sangla side descent is very steep and eroded in places. Take it slow, especially if your knees are tired from summit day. Overall: unforgettable.", created_at: "2025-06-12T09:30:00Z", user_id: "" },
  ],
},
{
  id: "21",
  slug: "goechala-trek",
  name: "Goechala Trek",
  tagline: "Stand at 16,200 ft with Kangchenjunga filling your entire field of vision",
  region: "Himalayas",
  state: "Sikkim",
  type: "Trekking",
  difficulty: "Advanced",
  duration: "7+ days",
  durationDays: "11 days",
  distance: "75km",
  altitude: "4,940m",
  bestSeason: "Mar – May, Sep – Nov",
  bestMonths: ["Mar", "Apr", "May", "Sep", "Oct", "Nov"],
  groupSize: "Small group (2–6)",
  baseCamp: "Yuksom",
  heroImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=70",
  galleryImages: [],
  lat: 27.3340,
  lng: 88.3080,
  description:
    "The Goechala trek in Sikkim delivers the closest ground-level view of Kangchenjunga — the world's third-highest mountain — accessible to trekkers anywhere. The route from Yuksom climbs through subtropical forest, rhododendron-covered ridges, and high alpine moraines to Goechala Pass at 4,940m, where the south face of Kangchenjunga rises in front of you like a wall of ice and rock.",
  whatMakesSpecial:
    "Kangchenjunga from Goechala is one of the great mountain views on earth. The three-viewpoint system means you see it at dawn, at mid-morning, and from the pass itself — each completely different.",
  whoFor: "Prior 7-day+ difficult trek experience · Comfortable at sustained 4,000–4,900m altitude · Organised inner line permit (mandatory for Sikkim protected zone) · Physically strong for 14km+ days with 1,000m+ ascents",
  whoNot: "Trekkers without Sikkim inner line permit (unavoidable requirement) · Those with previous AMS at 4,500m+ · Visiting June–August (heavy Sikkim monsoon, leeches on trail) · Anyone expecting good weather reliability in October',",
  safetyNotes:
    "Inner line permits required — apply 3 weeks in advance. Viewpoint 3 at the actual pass is the target; acclimatisation viewpoints 1 and 2 on day 9–10 prepare you. Rhododendron forest trail is slippery in rain.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹20,000", rating: 4.9, website: "https://indiahikes.com/goechala-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹21,000", rating: 4.8, website: "https://trekthehimalayas.com/goechala-trek" },
    { name: "Bikat Adventures", verified: false, priceFrom: "₹20,000", rating: 4.3, website: "https://www.bikatadventures.com/Home/Itinerary/goechala-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹18,000", rating: 4.2, website: "https://www.trekmunk.com/treks/goechala-trek" },
  ],
  tags: ["Kangchenjunga", "Sikkim", "high pass", "remote", "permit required"],
  featured: false,
  seedReviews: [
    { id: "sr-goechala-1", username: "sunita_sikkim", rating: 5, body: "The south face of Kangchenjunga from Goechala at sunrise. I've been looking for words for this for three months and I still don't have them. The mountain is immense in a way that photographs cannot communicate. The trek itself is long and hard and absolutely worth every single step.", created_at: "2025-10-08T07:00:00Z", user_id: "" },
    { id: "sr-goechala-2", username: "amit_g", rating: 5, body: "The rhododendron forests in April are in full bloom — blood red against the snow above. Samiti Lake the morning before the pass is flawless. The climb to Viewpoint 3 at dawn is brutal and unforgettable. This is the best trek in Sikkim by a wide margin.", created_at: "2025-04-25T09:00:00Z", user_id: "" },
    { id: "sr-goechala-3", username: "rupa_trek", rating: 4, body: "Superb trek but the permit process is genuinely complex — start early. The Indiahikes crew handled all of it for us. Samiti Lake was frozen in mid-October so we camped on ice. Cold but spectacular. Pack heavy-duty sleeping bag (rated -15°C at minimum).", created_at: "2025-10-15T11:30:00Z", user_id: "" },
  ],
},
{
  id: "22",
  slug: "everest-base-camp",
  name: "Everest Base Camp Trek",
  tagline: "Follow the footsteps of every climber who ever attempted the world's highest mountain",
  region: "Himalayas",
  state: "Nepal",
  type: "Trekking",
  difficulty: "Advanced",
  duration: "7+ days",
  durationDays: "14 days",
  distance: "121km",
  altitude: "5,364m",
  bestSeason: "Mar – May, Oct – Nov",
  bestMonths: ["Mar", "Apr", "May", "Oct", "Nov"],
  groupSize: "Large group (6+)",
  baseCamp: "Lukla",
  heroImage: "https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?w=1200&q=70",
  galleryImages: [],
  lat: 27.9881,
  lng: 86.9250,
  description:
    "The Everest Base Camp trek is one of the world's iconic journeys. Starting from the airstrip at Lukla, the route climbs through Sherpa villages, rhododendron forests, and glacial moraines to the foot of the world's highest mountain at 5,364m. Along the way you pass Namche Bazaar, the Sherpa capital, and the monastery at Tengboche — with a direct view of Ama Dablam that stops every trekker cold.",
  whatMakesSpecial:
    "Standing at EBC and looking up at the Khumbu Icefall — the same gateway every Everest climber has used since 1953 — is an experience that puts human scale in perspective. Kala Patthar viewpoint adds a 360° Himalayan panorama at 5,545m.",
  whoFor: "Prior 5-day+ trek experience · Comfortable with acclimatisation rest days · Physically capable of 14km/day with 1,200m+ climbs · Valid Nepal visa and TIMS/SAGARMATHA permit",
  whoNot: "Visiting without acclimatisation days (AMS at 5,000m+ is serious) · Trekking without a guide in peak season (trail congestion is real) · Those with respiratory conditions · Budget travellers expecting no teahouse costs above Namche',",
  safetyNotes:
    "Acclimatise strictly — two nights at Namche, one at Dingboche. Carry pulse oximeter. Descend immediately if O2 sats drop below 80%. Helicopter evacuation is available but expensive — get insurance.",
  operators: [
    { name: "Bikat Adventures", verified: true, priceFrom: "₹85,000", rating: 4.9, website: "https://www.bikatadventures.com/Home/Itinerary/Everest-Base-Camp-Trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹75,500", rating: 4.8, website: "https://trekthehimalayas.com/everest-base-camp-trek" },
    { name: "Trekup India", verified: false, priceFrom: "₹80,000", rating: 4.3, website: "https://www.trekupindia.com/everest-base-camp-trek" },
  ],
  tags: ["Everest", "Nepal", "iconic", "bucket list", "Khumbu"],
  featured: true,
  seedReviews: [
    { id: "sr-ebc-1", username: "prashant_ebc", rating: 5, body: "The Khumbu Icefall from Base Camp at dawn, with the prayer flags snapping in the wind and absolute silence apart from ice groaning somewhere far up the mountain. There are no words. Two weeks of walking and every step was worth it. Don't skip Kala Patthar — it's a better view.", created_at: "2025-10-25T07:30:00Z", user_id: "" },
    { id: "sr-ebc-2", username: "shreya_nepal", rating: 5, body: "Ama Dablam from Tengboche Monastery at sunset is the most beautiful mountain view I've ever seen — and the EBC trek has 14 days of views like that. The teahouses are warm, the dhal bhat is fantastic, and the Sherpa guides are extraordinary. Altitude respect is everything — don't rush.", created_at: "2025-04-15T10:00:00Z", user_id: "" },
    { id: "sr-ebc-3", username: "vikrant_m", rating: 4, body: "Incredible but crowded in October. The trail between Namche and Tengboche on weekends is like a highway. Go in early November or mid-March for more solitude. The Gorak Shep tea house is basic at best but you're at 5,140m — expectations adjust quickly. The EBC sunrise walk is magic.", created_at: "2025-10-18T09:00:00Z", user_id: "" },
  ],
},
{
  id: "23",
  slug: "brahmatal-trek",
  name: "Brahmatal Trek",
  tagline: "A frozen lake at 12,250 ft with Mt Trishul and Nanda Ghunti as your backdrop",
  region: "Himalayas",
  state: "Uttarakhand",
  type: "Trekking",
  difficulty: "Intermediate",
  duration: "3–5 days",
  durationDays: "6 days",
  distance: "26km",
  altitude: "3,735m",
  bestSeason: "Dec – Mar",
  bestMonths: ["Dec", "Jan", "Feb", "Mar"],
  groupSize: "Small group (2–6)",
  baseCamp: "Lohajung",
  heroImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=70",
  galleryImages: [],
  lat: 30.0763,
  lng: 79.5983,
  description:
    "The Brahmatal trek offers one of the finest winter snow experiences in the Kumaon Himalayas. Starting from Lohajung, the trail climbs through snow-covered oak and rhododendron forests to the frozen Brahmatal Lake at 3,735m. The views from the trail and summit ridge encompass Trishul (7,120m), Nanda Ghunti (6,309m), and multiple other 6,000m+ peaks — all reflections of raw Himalayan power.",
  whatMakesSpecial:
    "The combination of dense snow-blanketed forest trail, high campsite at 3,500m, and the perfectly framed winter panorama makes this Uttarakhand's best mid-difficulty winter trek.",
  whoFor: "Winter camping experience or strong desire to learn · Comfortable at -10°C nights in a proper sleeping bag · Prior 4-day+ trek background · Good physical fitness for 8–10km/day in snow",
  whoNot: "Expecting green meadows (this is a snow trek) · Visiting without proper layering and waterproof gear · Those with poor cold tolerance · Arriving at Lohajung on the same day as the trek start',",
  safetyNotes:
    "Microspikes are essential from day 2 onwards. Carry hand warmers — the campsite above 3,500m is extremely cold at night. Follow your guide's weather assessment.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹10,000", rating: 4.9, website: "https://indiahikes.com/brahmatal-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹10,900", rating: 4.8, website: "https://trekthehimalayas.com/brahmatal-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹9,600", rating: 4.3, website: "https://www.trekmunk.com/treks/brahmatal-trek" },
    { name: "Trekup India", verified: false, priceFrom: "₹10,000", rating: 4.2, website: "https://www.trekupindia.com/brahmatal-trek" },
  ],
  tags: ["winter trek", "frozen lake", "snow forest", "Uttarakhand", "Kumaon"],
  featured: false,
  seedReviews: [
    { id: "sr-brahmatal-1", username: "deepa_w", rating: 5, body: "January Brahmatal — thigh deep snow in the forest, Trishul so close you want to reach out, the lake completely frozen. It's a different planet from regular Himalayan trekking. Indiahikes manages the cold camping logistics perfectly. Non-negotiable warm sleeping bag.", created_at: "2025-01-22T08:00:00Z", user_id: "" },
    { id: "sr-brahmatal-2", username: "aarav_snow", rating: 5, body: "The forest trail on day 2 after a fresh snowfall is the most beautiful walk I've ever done. Silence, white branches, your boots crunching through untouched snow, Nanda Ghunti floating above the trees. I did Kedarkantha first and Brahmatal beats it for scenery.", created_at: "2025-02-08T10:15:00Z", user_id: "" },
    { id: "sr-brahmatal-3", username: "lalita_k", rating: 4, body: "Spectacular but genuinely cold. Night temperatures at the high camp hit -15°C in February. The summit ridge views are extraordinary. Lose one star only for the drive from Rishikesh to Lohajung — 9 hours on mountain roads. Come mentally prepared for the journey in.", created_at: "2025-02-15T09:00:00Z", user_id: "" },
  ],
},
{
  id: "24",
  slug: "kedartal-trek",
  name: "Kedartal Trek",
  tagline: "A glacial lake mirror-reflecting Thalaysagar at 15,000 ft — for serious trekkers only",
  region: "Himalayas",
  state: "Uttarakhand",
  type: "Trekking",
  difficulty: "Advanced",
  duration: "7+ days",
  durationDays: "7 days",
  distance: "32km",
  altitude: "4,720m",
  bestSeason: "May – Jun, Sep – Oct",
  bestMonths: ["May", "Jun", "Sep", "Oct"],
  groupSize: "Small group (2–6)",
  baseCamp: "Gangotri",
  heroImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=70",
  galleryImages: [],
  lat: 30.9945,
  lng: 79.0668,
  description:
    "Kedartal is one of the most challenging and rewarding high-altitude lake treks in the Garhwal Himalayas. Starting from Gangotri — itself a sacred and dramatic base — the route climbs steeply through moraines and glacial debris to a lake at 4,720m that perfectly reflects the sheer west face of Thalaysagar (6,904m). The trail is rough, the altitude is unforgiving, and the beauty is extraordinary.",
  whatMakesSpecial:
    "The reflection of Thalaysagar in Kedartal at dawn is considered one of the finest mountain photography subjects in India. The trek itself is a genuine wilderness experience with no facilities beyond Gangotri.",
  whoFor: "Prior 7-day+ difficult trek experience · Comfortable at 4,700m with minimal acclimatisation stops · Strong scrambling ability on boulder fields · Fully self-sufficient with all camping gear",
  whoNot: "Beginners or those with fewer than 5 previous treks · Anyone with AMS history above 4,000m · Expecting maintained trails (the route above Bhoj Kharak is unmarked) · Those needing network coverage or rescue confidence',",
  safetyNotes:
    "The boulder field before the lake takes 6+ hours — start from Bhoj Kharak at 3am. Altitude gain is sudden and severe. Carry supplemental oxygen as precaution. Do not attempt solo.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹15,000", rating: 4.9, website: "https://indiahikes.com/kedar-tal-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹16,000", rating: 4.8, website: "https://trekthehimalayas.com/kedar-tal-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹15,000", rating: 4.3, website: "https://www.trekmunk.com/treks/kedartal-trek" },
  ],
  tags: ["glacial lake", "Garhwal", "serious trek", "photography", "high altitude"],
  featured: false,
  seedReviews: [
    { id: "sr-kedartal-1", username: "nandita_trek", rating: 5, body: "The boulder field above Bhoj Kharak is the hardest day I've had on any Indian trek — six hours of loose rocks with altitude headache. And then the lake appears and everything resets instantly. Thalaysagar's reflection at 5am is worth every bruise. Absolute mountain experience.", created_at: "2025-09-20T07:00:00Z", user_id: "" },
    { id: "sr-kedartal-2", username: "arjun_gangotri", rating: 5, body: "Gangotri as a base is extraordinary in itself — the Bhagirathi gorge before the trek starts is one of India's great landscapes. But Kedartal takes everything to another level. Go in early October for the clearest reflections and minimal other trekkers. Brutal and beautiful.", created_at: "2025-10-03T08:30:00Z", user_id: "" },
    { id: "sr-kedartal-3", username: "monika_h", rating: 4, body: "Not for the faint-hearted — the ascent gradient is relentless and the trail is largely unmarked from Bhoj Kharak. Our guide was essential. The lake in morning light is one of those images that stays with you permanently. Allow a rest day at Bhoj Kharak before the final push.", created_at: "2025-06-10T10:00:00Z", user_id: "" },
  ],
},
{
  id: "25",
  slug: "har-ki-dun-trek",
  name: "Har Ki Dun Trek",
  tagline: "The Valley of Gods — a living cradle of Himalayan culture at 3,566m",
  region: "Himalayas",
  state: "Uttarakhand",
  type: "Trekking",
  difficulty: "Intermediate",
  duration: "7+ days",
  durationDays: "7 days",
  distance: "47km",
  altitude: "3,566m",
  bestSeason: "Mar – Jun, Sep – Dec",
  bestMonths: ["Mar", "Apr", "May", "Jun", "Sep", "Oct", "Nov", "Dec"],
  groupSize: "Small group (2–6)",
  baseCamp: "Sankri",
  heroImage: "https://images.unsplash.com/photo-1600439614353-174ad0ee3b24?w=1200&q=70",
  galleryImages: [],
  lat: 31.1380,
  lng: 78.3580,
  description:
    "Har Ki Dun is one of the most ancient and culturally rich trekking valleys in India. Nestled in the Govind Wildlife Sanctuary, the valley is inhabited by communities who claim descent from the Pandavas — with traditional stone houses, apple orchards, and temples unchanged for centuries. The valley floor is flat and wide, ringed by 6,000m peaks, with snow lingering well into spring.",
  whatMakesSpecial:
    "The living culture of Har Ki Dun is as remarkable as the landscape. The villages of Osla and Gangad are genuinely traditional Himalayan communities — welcoming but unchanged. It's a rare combination of cultural immersion and mountain wilderness.",
  whoFor: "Comfortable with 10–14km/day on moderate trails · Interested in Himalayan culture and village life · Suitable for strong trekking beginners with good fitness · No technical skills required',",
  whoNot: "Expecting high-altitude challenge (max altitude is modest) · Those only interested in technical summit trekking · Visiting without prior consultation on snow conditions in winter · Pure summit-seekers',",
  safetyNotes:
    "The Supin River crossing near Osla can be deep during peak monsoon. Carry layering for cold valley nights. Forest sections after Taluka are dark — carry a headlamp even for day use.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹15,000", rating: 4.9, website: "https://indiahikes.com/har-ki-dun-trek" },
    { name: "Bikat Adventures", verified: true, priceFrom: "₹14,000", rating: 4.8, website: "https://www.bikatadventures.com/Home/Itinerary/har-ki-dun-trek" },
    { name: "Trek The Himalayas", verified: false, priceFrom: "₹13,500", rating: 4.3, website: "https://trekthehimalayas.com/har-ki-dun-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹12,500", rating: 4.2, website: "https://www.trekmunk.com/treks/har-ki-dun-trek" },
  ],
  tags: ["cultural trek", "ancient villages", "Uttarakhand", "valley trek", "wildlife sanctuary"],
  featured: false,
  seedReviews: [
    { id: "sr-hkd-1", username: "meenakshi_t", rating: 5, body: "The village of Osla stopped me in my tracks. Traditional wooden houses decorated with carved gods, locals living exactly as they have for centuries, a temple where the Pandavas supposedly rested. And then the valley behind them with 6,000m peaks. Har Ki Dun is India's hidden cultural treasure.", created_at: "2025-05-10T09:00:00Z", user_id: "" },
    { id: "sr-hkd-2", username: "suresh_valley", rating: 5, body: "May is perfect — apple trees in blossom, valley green and lush, snow still on the high ridges. The flat valley floor at Har Ki Dun itself is enormous. Camped by the river under clear skies with Swargarohini reflected in the water. Spent a full day just sitting there.", created_at: "2025-05-18T10:30:00Z", user_id: "" },
    { id: "sr-hkd-3", username: "piyush_h", rating: 4, body: "Beautiful trek but the road from Sankri to Taluka is jarring — the jeep ride is rough. Factor in an extra day for acclimatisation at Sankri before starting. The forest on day 2 between Taluka and Seema is one of the most beautiful stretches of Himalayan trail I've walked.", created_at: "2025-10-12T08:00:00Z", user_id: "" },
  ],
},
{
  id: "26",
  slug: "sandakphu-phalut-trek",
  name: "Sandakphu–Phalut Trek",
  tagline: "The only place on Earth where you can see four of the world's five highest peaks at once",
  region: "Himalayas",
  state: "West Bengal",
  type: "Trekking",
  difficulty: "Intermediate",
  duration: "7+ days",
  durationDays: "7 days",
  distance: "68km",
  altitude: "3,636m (Sandakphu)",
  bestSeason: "Mar – May, Oct – Dec",
  bestMonths: ["Mar", "Apr", "May", "Oct", "Nov", "Dec"],
  groupSize: "Large group (6+)",
  baseCamp: "Manebhanjan",
  heroImage: "https://images.unsplash.com/photo-1583318432730-a19c89692612?w=1200&q=70",
  galleryImages: [],
  lat: 27.1069,
  lng: 88.0142,
  description:
    "Sandakphu is the highest point in West Bengal at 3,636m — and from its summit, on a clear day, you can see Everest, Kangchenjunga, Lhotse, and Makalu simultaneously. It is the only place on Earth where four of the world's five highest peaks are visible at once. The route along the Singalila ridge, lined with rhododendrons in bloom from March to May, is one of India's most scenic long-distance trails.",
  whatMakesSpecial:
    "The Sleeping Buddha — the profile of Kangchenjunga's massif at sunrise from Sandakphu, looking like a reclining figure — is one of the most iconic mountain views in Asia.",
  whoFor: "Comfortable with 12–15km/day on ridge trails · Prior 5-day+ trek experience · Happy with teahouse accommodation (no camping required) · Ridge exposure at moderate altitude (3,600m)",
  whoNot: "Expecting technical challenge (this is a ridge walk) · Visiting during heavy monsoon June–August · Those who dislike altitude nights without acclimatisation days · Non-walkers expecting a drive to the summit',",
  safetyNotes:
    "The Indian side requires a permit from the Darjeeling DFO. Nepal side checkposts require passport copies. The ridge path can be icy December–January — carry microspikes.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹13,000", rating: 4.9, website: "https://indiahikes.com/sandakphu-phalut-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹13,900", rating: 4.8, website: "https://trekthehimalayas.com/sandakphu-trek" },
    { name: "Trekup India", verified: false, priceFrom: "₹13,000", rating: 4.2, website: "https://www.trekupindia.com/sandakphu-phalut-trek" },
  ],
  tags: ["four peaks view", "West Bengal", "Singalila ridge", "rhododendrons", "iconic"],
  featured: true,
  seedReviews: [
    { id: "sr-sandakphu-1", username: "ishaan_wbengal", rating: 5, body: "4:30am on the summit of Sandakphu. Everest, Kangchenjunga, Lhotse, Makalu all rising above the clouds simultaneously as the first light hits them. Forty other trekkers stood in complete silence for ten minutes. Nobody had any words. This is why we trek.", created_at: "2025-04-12T05:00:00Z", user_id: "" },
    { id: "sr-sandakphu-2", username: "sonal_ridge", rating: 5, body: "The rhododendron forest in full April bloom is one of the most beautiful landscapes I've walked through anywhere in the world — blood red and pink canopy over the entire ridge. Combine that with the greatest mountain panorama on Earth and you have a perfect trek.", created_at: "2025-04-18T09:00:00Z", user_id: "" },
    { id: "sr-sandakphu-3", username: "binoy_trek", rating: 4, body: "The permits add overhead but it's completely manageable with a good operator. December is cold but the views are clearer than spring. The teahouses along the ridge are basic but warm — the daal bhat and Darjeeling chai make up for it. Phalut viewpoint beats Sandakphu for solitude.", created_at: "2025-12-08T10:00:00Z", user_id: "" },
  ],
},
{
  id: "27",
  slug: "gaumukh-tapovan-trek",
  name: "Gaumukh Tapovan Trek",
  tagline: "Reach the source of the Ganges and camp at the base of Shivling's sheer 2,000m north face",
  region: "Himalayas",
  state: "Uttarakhand",
  type: "Trekking",
  difficulty: "Advanced",
  duration: "7+ days",
  durationDays: "8 days",
  distance: "42km",
  altitude: "4,463m",
  bestSeason: "May – Jun, Sep – Oct",
  bestMonths: ["May", "Jun", "Sep", "Oct"],
  groupSize: "Small group (2–6)",
  baseCamp: "Gangotri",
  heroImage: "https://images.unsplash.com/photo-1624963070965-37a33a8dd747?w=1200&q=70",
  galleryImages: [],
  lat: 30.9260,
  lng: 79.0670,
  description:
    "The Gaumukh Tapovan trek combines two of the most significant destinations in the Garhwal Himalayas. Gaumukh is the glacial snout of the Gangotri Glacier — the sacred source of the Ganges River — while Tapovan at 4,463m is a high meadow that places you directly at the base of Shivling (6,543m), one of the most beautiful and technically demanding peaks in the Himalayas. The combination creates an unmatched itinerary of spiritual, cultural, and raw mountain significance.",
  whatMakesSpecial:
    "Tapovan meadow at sunrise with Shivling's north face catching the first light is considered one of the most spectacular mountain campsites in the world. Bhagirathi I, II, and III are also in full view.",
  whoFor: "Prior 6-day+ difficult trekking experience · Comfortable crossing the Gangotri Glacier moraine (no fixed path) · Altitude-aware at 4,400m+ · Good balance for boulder scrambling",
  whoNot: "Those with no glacier/moraine experience · Anyone attempting without a registered Uttarakhand guide (mandatory) · Visiting post-October when glacier crossing becomes dangerous · Solo trekkers without satellite communication',",
  safetyNotes:
    "Forest Department permit required from Gangotri. Night glacier crossings are prohibited. Camp only at designated Tapovan meadow sites. The Gangotri Glacier is receding — follow current route markers.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹17,000", rating: 4.9, website: "https://indiahikes.com/gaumukh-tapovan-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹17,000", rating: 4.8, website: "https://trekthehimalayas.com/gaumukh-tapovan-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹15,000", rating: 4.3, website: "https://www.trekmunk.com/treks/gaumukh-tapovan-trek" },
  ],
  tags: ["Gangotri glacier", "Shivling", "sacred source", "Garhwal", "glacier trek"],
  featured: false,
  seedReviews: [
    { id: "sr-tapovan-1", username: "ramesh_gangotri", rating: 5, body: "Stood at the mouth of the Gangotri Glacier and watched the Ganges emerge from a cave of grey ice. Then climbed to Tapovan and watched Shivling turn gold at sunset. Two moments on one trek that I will carry for the rest of my life.", created_at: "2025-09-28T07:30:00Z", user_id: "" },
    { id: "sr-tapovan-2", username: "nalini_t", rating: 5, body: "The moraine crossing to Tapovan is the hardest part — unmarked, unstable boulders, altitude. Our guide knew every footstep. The meadow on the other side, with Shivling directly above you, makes all of it irrelevant. Camp here two nights if you can.", created_at: "2025-06-08T09:00:00Z", user_id: "" },
    { id: "sr-tapovan-3", username: "kartik_pilgrim", rating: 4, body: "The spiritual weight of Gangotri as a base adds a dimension that other treks don't have. It starts as a pilgrimage and becomes a mountain expedition. The glacier is much smaller than photographs suggest — climate change is visible here in real time. Go soon.", created_at: "2025-05-25T10:30:00Z", user_id: "" },
  ],
},
{
  id: "28",
  slug: "tarsar-marsar-trek",
  name: "Tarsar Marsar Trek",
  tagline: "Twin alpine jewels hidden above Kashmir's Lidder Valley",
  region: "Himalayas",
  state: "Jammu & Kashmir",
  type: "Trekking",
  difficulty: "Intermediate",
  duration: "7+ days",
  durationDays: "8 days",
  distance: "48km",
  altitude: "4,023m (Marsar Pass)",
  bestSeason: "Jul – Aug",
  bestMonths: ["Jul", "Aug"],
  groupSize: "Small group (2–6)",
  baseCamp: "Aru",
  heroImage: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=1200&q=70",
  galleryImages: [],
  lat: 34.2500,
  lng: 75.3100,
  description:
    "The Tarsar Marsar trek takes you to two of Kashmir's most beautiful alpine lakes through meadows and passes above the Aru and Pahalgam valleys. The route first reaches the glacially carved bowl of Tarsar at 3,720m, then climbs to the pass above it before descending to the wild, remote Marsar lake — less visited and arguably more dramatic. The green meadows (margs) and shepherd encampments along the way provide an authentic slice of Kashmiri high-altitude life.",
  whatMakesSpecial:
    "The visual transition from the green Aru Valley through the pass to the glacial twin lakes, with the Kolahoi glacier glinting in the distance, is Kashmir trekking at its finest.",
  whoFor: "Prior 5-day+ trek experience · Comfortable at 4,000m with basic altitude management · Physically capable of pass crossings on consecutive days · Comfortable with camp-based accommodation',",
  whoNot: "Those visiting September–June (trail access unreliable) · Expecting trekking in solitude in August (Kashmir Great Lakes draws crowds but this doesn't) · No prior multi-day camping experience',",
  safetyNotes:
    "Aru requires Pahalgam-area permits for foreigners. The pass between Tarsar and Marsar is steep and can be snowy in July. Register at the Forest Department checkpost at Aru before starting.",
  operators: [
    { name: "Indiahikes", verified: true, priceFrom: "₹16,000", rating: 4.9, website: "https://indiahikes.com/tarsar-marsar-trek" },
    { name: "Trek The Himalayas", verified: true, priceFrom: "₹17,000", rating: 4.8, website: "https://trekthehimalayas.com/tarsar-marsar-trek" },
    { name: "Trekmunk", verified: false, priceFrom: "₹18,000", rating: 4.3, website: "https://www.trekmunk.com/treks/tarsar-marsar-trek" },
  ],
  tags: ["alpine lakes", "Kashmir", "shepherd country", "twin lakes", "Kolahoi"],
  featured: false,
  seedReviews: [
    { id: "sr-tarsar-1", username: "faiza_kashmir", rating: 5, body: "Tarsar at dusk with the peaks turning pink above it and a lone shepherd crossing the meadow below — I've been trekking for eight years and this is still my favourite single image. Kashmir's high valleys are in a class of their own for colour and drama.", created_at: "2025-07-25T18:00:00Z", user_id: "" },
    { id: "sr-tarsar-2", username: "ajay_j", rating: 5, body: "The Marsar side gets far fewer trekkers than Tarsar and it's the more dramatic of the two. The descent from the pass into the Marsar bowl feels like entering a secret. The shepherd community is extremely hospitable — we shared tea and stories across a language gap.", created_at: "2025-08-05T09:00:00Z", user_id: "" },
    { id: "sr-tarsar-3", username: "divya_trekker", rating: 4, body: "Indiahikes runs this extremely well. The meadow campsites are beautiful. One minor issue: the trail between Tarsar and the pass is unmarked and our team took a wrong turn in early fog. Keep close to your guide on the upper sections. Otherwise a perfect Kashmir trek.", created_at: "2025-07-18T10:30:00Z", user_id: "" },
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
      adventureCount: 20,
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
  { type: "Trekking" as AdventureType, count: 15 },
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
