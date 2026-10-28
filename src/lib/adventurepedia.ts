// Adventurepedia: the guide library. Every guide is data here; /adventurepedia/[slug] renders it,
// and the library page searches it. Inline text understands **bold** and [label](/link).
// A guide with `custom: true` has its own hand-built page (offline maps) and only lists its
// sections here so search can reach them.
//
// Keep guides practical and India-first. Anything that changes with the rules (permits, fees,
// devices) says so and points people to their operator for the current word.

export type Block =
  | { p: string }
  | { list: string[] }
  | { steps: string[] }
  | { callout: "warn" | "tip"; title: string; text: string }
  | { table: { head: string[]; rows: string[][] } };

export interface GuideSection { id: string; title: string; blocks: Block[] }

export type Topic = "plan" | "health" | "trail" | "rides";

export const TOPICS: { id: Topic; label: string; blurb: string }[] = [
  { id: "plan", label: "Plan & prepare", blurb: "Seasons, operators, permits, fitness and gear" },
  { id: "health", label: "Health & safety", blurb: "Altitude, first aid, water and emergencies" },
  { id: "trail", label: "On the trail", blurb: "Navigation, trail craft and leaving no trace" },
  { id: "rides", label: "Rides & rivers", blurb: "High-pass motorcycling and white-water rafting" },
];

export interface Guide {
  slug: string;
  title: string;
  /** Short name for cards, menus and breadcrumbs */
  short: string;
  summary: string;
  topic: Topic;
  icon: "altitude" | "pack" | "fitness" | "season" | "operator" | "permit" | "trail" | "water" | "emergency" | "leaf" | "ride" | "raft" | "map";
  /** "The short version": what to remember if you read nothing else */
  tldr: string[];
  sections: GuideSection[];
  related: string[];
  /** Adventure types this guide matters most for, shown as a link to Explore */
  appliesTo?: string[];
  custom?: boolean;
  featured?: boolean;
}

export const GUIDES: Guide[] = [
  // ── Health & safety ─────────────────────────────────────────────────────────
  {
    slug: "altitude-sickness",
    title: "Altitude sickness: prevent it, spot it, act on it",
    short: "Altitude sickness",
    summary: "Why the air gets thin, how to acclimatise, the warning signs of AMS, HAPE and HACE, and the one treatment that always works.",
    topic: "health",
    icon: "altitude",
    featured: true,
    tldr: [
      "Above 3,000 m, sleep no more than 300 to 500 m higher each night, with a rest day every 3 to 4 days.",
      "A headache plus nausea, tiredness or poor sleep at altitude is altitude sickness until proven otherwise.",
      "Never go higher with symptoms. If they get worse, go down.",
      "Confusion, stumbling, or breathlessness at rest are emergencies: descend now, with someone.",
      "Fitness doesn't protect you. Pace and time do.",
    ],
    sections: [
      {
        id: "why",
        title: "What happens up high",
        blocks: [
          { p: "The air at 4,000 m holds about 40% less oxygen per breath than at sea level. Your body copes by breathing faster, raising your heart rate and, over days, making more red blood cells. That adjustment is **acclimatisation**, and it can't be rushed." },
          { p: "Altitude sickness is what happens when you climb faster than your body adjusts. It can start from about **2,500 m**, and it's common on Himalayan treks: most treks on Trail to Tides sleep above 3,000 m." },
          { table: { head: ["Band", "Height", "What to expect"], rows: [
            ["High", "1,500 to 3,500 m", "Breathless on climbs, mild headaches possible above 2,500 m"],
            ["Very high", "3,500 to 5,500 m", "Most treks' high camps and passes. AMS is common; serious illness possible"],
            ["Extreme", "Above 5,500 m", "No one fully acclimatises. Expeditions only, short stays"],
          ] } },
        ],
      },
      {
        id: "who",
        title: "Who gets it",
        blocks: [
          { p: "Anyone. Marathon runners get it; first-time trekkers often don't. The biggest risk factors are **going up too fast**, having had it before, and arriving straight at height (flying into Leh at 3,500 m, for example)." },
          { list: [
            "**Fitness doesn't prevent it.** Fit people often climb faster, which raises the risk.",
            "**Age and sex make little difference.** Young, fit men get it as often as anyone.",
            "**A past episode** is the best predictor: plan an even slower ascent and talk to a doctor.",
            "**Smoking, alcohol and sleeping pills** make things worse: they blunt breathing, especially at night.",
          ] },
        ],
      },
      {
        id: "acclimatise",
        title: "Acclimatise: the rules that work",
        blocks: [
          { steps: [
            "**Above 3,000 m, raise your sleeping height by no more than 300 to 500 m a night.** Where you walk during the day matters less than where you sleep.",
            "**Take a rest day every 3 to 4 days**, or for every 1,000 m you gain. Good itineraries build these in; check yours does.",
            "**Climb high, sleep low.** On rest days, walk a few hundred metres higher, then come back down to sleep.",
            "**Flying to Leh or another high town?** Rest completely for the first 48 hours. No sightseeing, no stairs if you can avoid them.",
            "**Drink to stay hydrated** (pale urine), eat well, and keep alcohol for the way down. Dehydration feels like altitude sickness and makes it harder to spot.",
            "**Walk slowly enough to talk.** If you can't speak a full sentence, slow down.",
          ] },
          { callout: "tip", title: "Read the itinerary before you book", text: "Look at each night's sleeping height on the trek page's Itinerary tab. Big jumps between camps above 3,000 m, or no rest day on a 6-day trek that tops out above 4,000 m, are worth asking the operator about." },
        ],
      },
      {
        id: "symptoms",
        title: "Know the signs",
        blocks: [
          { p: "There are three conditions. The first is common and manageable; the other two kill if ignored." },
          { table: { head: ["Condition", "Signs", "What it means"], rows: [
            ["AMS (acute mountain sickness)", "Headache, plus any of: nausea or vomiting, tiredness, dizziness, poor sleep, loss of appetite", "Your body is behind. Stop climbing until it catches up"],
            ["HACE (fluid on the brain)", "Confusion, unusual behaviour, drowsiness, stumbling or can't walk a straight line heel to toe", "Emergency. Descend immediately"],
            ["HAPE (fluid in the lungs)", "Breathless at rest, a cough (sometimes frothy or pink), gurgling chest, blue lips, far slower than usual", "Emergency. Descend immediately"],
          ] } },
          { callout: "warn", title: "The heel-to-toe test", text: "If someone seems off, ask them to walk a straight line heel to toe for a few metres. Sober people who can't do it at altitude may have HACE. Don't wait for morning." },
          { p: "Mild AMS often appears 6 to 12 hours after arriving at a new height, and is usually worst on the first night. Tell your trek leader about **every** headache. It's not complaining; it's information they need." },
        ],
      },
      {
        id: "act",
        title: "What to do",
        blocks: [
          { list: [
            "**Mild AMS:** stop going up. Rest at the same height, drink, eat, take paracetamol or ibuprofen for the headache. If you're fine after a day or two, you can carry on slowly.",
            "**Getting worse, or not better after 24 hours at the same height:** go down. Even 300 to 500 m makes a real difference.",
            "**Any sign of HACE or HAPE:** descend now, day or night, and never alone. Give oxygen if the team carries it. Call for evacuation if the person can't walk.",
            "**Never leave someone with symptoms alone** in a tent while the group goes higher.",
          ] },
          { callout: "warn", title: "Going down is the treatment", text: "Medicines and oxygen buy time. Descent is the only treatment that always works. A summit or pass is never worth a life: good leaders turn back, and so should you." },
        ],
      },
      {
        id: "medicines",
        title: "Medicines",
        blocks: [
          { p: "**Acetazolamide (Diamox)** speeds up acclimatisation and is widely used to prevent AMS on fast ascents (like flying to Leh) or by people who've had it before. It's prescription medicine: talk to your doctor before the trip, especially if you're allergic to sulfa drugs. Tingling fingers and needing to pee more are normal side effects." },
          { p: "Drugs like dexamethasone and nifedipine are used for HACE and HAPE emergencies by trained leaders and doctors. They are not something to self-prescribe, and they don't replace going down." },
          { p: "A **pulse oximeter** (the finger clip) is useful, but readings at altitude are naturally low and vary a lot. How someone looks and feels, and whether it's getting worse, matters more than any single number." },
          { callout: "tip", title: "Medical conditions", text: "Heart or lung conditions, pregnancy, sickle cell disease or recent surgery all need a doctor's view before you go high. The Matchmaker's health questions flag adventures that may need clearance." },
        ],
      },
    ],
    related: ["first-aid-and-water", "insurance-and-emergencies", "getting-fit"],
    appliesTo: ["Trekking", "Motorcycling", "Mountaineering"],
  },
  {
    slug: "first-aid-and-water",
    title: "Water, food and your first-aid kit",
    short: "Water, food & first aid",
    summary: "How much to drink and how to make it safe, keeping your stomach on side, and the small kit that handles most trail problems.",
    topic: "health",
    icon: "water",
    tldr: [
      "Drink 3 to 4 litres a day at altitude, more on long climbs.",
      "Treat all stream water: boil it, use chlorine dioxide tablets, or a filter plus tablets.",
      "Pack oral rehydration salts, blister kit, painkillers and your own medicines in your daypack.",
      "Wash or sanitise hands before every meal. Most trek stomach bugs come from hands, not food.",
    ],
    sections: [
      {
        id: "how-much",
        title: "How much to drink",
        blocks: [
          { p: "You lose a lot of water at altitude: dry air, fast breathing and hard work. Aim for **3 to 4 litres a day**, including tea and soup. Pale yellow urine means you're doing fine; dark means drink more." },
          { list: [
            "Start the day with half a litre before you walk.",
            "Sip every 20 to 30 minutes rather than gulping at stops.",
            "In winter, carry water in an insulated bottle or upside down in your pack so the lid doesn't freeze.",
            "Fill up with warm water at camp in the morning: you'll drink more of it in the cold.",
          ] },
        ],
      },
      {
        id: "safe-water",
        title: "Making water safe",
        blocks: [
          { p: "Mountain streams look clean but often run past villages, grazing animals and camps. Treat everything that doesn't come from your camp kitchen's boiled supply." },
          { table: { head: ["Method", "Handles", "Notes"], rows: [
            ["Boiling", "Everything", "A rolling boil for a minute is enough, even at altitude. Uses fuel; ask the kitchen team"],
            ["Chlorine dioxide tablets", "Bacteria, viruses, most parasites", "Light and cheap. Wait 30 minutes (4 hours for the toughest parasites, longer in icy water)"],
            ["Filter bottle or pump", "Bacteria and parasites", "Most don't stop viruses. Pair with tablets near villages"],
            ["UV pen", "Everything in clear water", "Needs batteries, which die in the cold. Useless in muddy water"],
          ] } },
          { callout: "tip", title: "Glacier water", text: "Grey, silty meltwater clogs filters. Let it settle in a bottle for an hour, pour off the clear water, then treat it." },
        ],
      },
      {
        id: "food",
        title: "Food and your stomach",
        blocks: [
          { p: "Appetite drops at altitude, but your body burns more. Eat at every meal even if you're not hungry, and carry snacks you actually like: nuts, dried fruit, chocolate, energy bars, chikki." },
          { list: [
            "**Hand hygiene is the big one.** Sanitiser before every meal and after the toilet.",
            "Skip raw salads and cut fruit you didn't peel yourself on the drive in.",
            "**Diarrhoea:** drink oral rehydration salts (ORS) and keep eating plain food. Tell your leader; a fever or blood means you need medical advice.",
          ] },
        ],
      },
      {
        id: "kit",
        title: "A first-aid kit that earns its weight",
        blocks: [
          { p: "Your operator carries a group kit (and should carry oxygen on high treks; ask). Your personal kit covers the things you'll need fast, in your daypack:" },
          { list: [
            "Your **own prescription medicines**, with a spare course in a different bag",
            "Paracetamol and ibuprofen",
            "Oral rehydration salts, 6 to 8 sachets",
            "**Blister kit:** hydrocolloid plasters (like Compeed), moleskin, tape, small scissors",
            "Antiseptic wipes, a few plasters and a crepe bandage",
            "Antihistamine tablets for allergies and insect bites",
            "Something for nausea and something for diarrhoea, after asking your doctor",
            "Acetazolamide (Diamox) if your doctor has prescribed it",
            "SPF 50 sunscreen and lip balm with SPF",
          ] },
          { callout: "tip", title: "Blisters: act on hot spots", text: "Stop the moment you feel rubbing and tape the spot. A two-minute stop now saves days of pain. Keep toenails short and socks dry." },
        ],
      },
    ],
    related: ["altitude-sickness", "what-to-pack", "insurance-and-emergencies"],
  },
  {
    slug: "insurance-and-emergencies",
    title: "Insurance, rescue and emergencies",
    short: "Insurance & emergencies",
    summary: "What your insurance has to cover at altitude, how rescue actually works in the Indian Himalaya, and the rules on satellite devices.",
    topic: "health",
    icon: "emergency",
    tldr: [
      "Buy insurance that names trekking and covers your maximum altitude, including helicopter evacuation.",
      "Rescue in remote valleys means hours to days of walking or a stretcher: speed depends on your team.",
      "In India, satellite phones and messengers like Garmin inReach need government permission. Don't bring one without it.",
      "Share your itinerary and your operator's emergency number with someone at home.",
    ],
    sections: [
      {
        id: "insurance",
        title: "Insurance that actually covers you",
        blocks: [
          { p: "Ordinary travel insurance often excludes trekking, or covers it only up to a set altitude (3,000 or 4,000 m is common). Read the policy wording, not the brochure." },
          { list: [
            "**Activity:** trekking, mountaineering or motorcycling is named as covered.",
            "**Altitude:** the limit is above your trek's highest point.",
            "**Evacuation:** helicopter rescue and medical evacuation are included, with a high enough limit. A helicopter in Nepal can cost several lakh rupees.",
            "**Cancellation:** covers weather, landslides and road closures, which cancel more Himalayan trips than anything else.",
          ] },
          { callout: "tip", title: "Ask your operator too", text: "Some operators include basic insurance in the price; many don't. Ask what it covers and get the policy number before you leave." },
        ],
      },
      {
        id: "rescue",
        title: "How rescue works",
        blocks: [
          { p: "In Nepal, helicopter rescue on popular routes is routine when the weather allows. In the Indian Himalaya it's rarer and slower: it may need state or armed forces help, and clouds often ground flights. Most evacuations are on foot, by mule, or on a stretcher carried by the team." },
          { p: "That's why the most important rescue gear is a good team: a leader trained in wilderness first aid, a group oxygen cylinder on high treks, and a plan for getting someone down from every camp. Ask about all three before you book." },
        ],
      },
      {
        id: "devices",
        title: "Phones, satellite devices and signal",
        blocks: [
          { p: "Expect no mobile signal for most of a trek. BSNL and Jio sometimes reach higher than other networks near villages, but don't count on it." },
          { callout: "warn", title: "Satellite devices in India", text: "Satellite phones and satellite messengers (Garmin inReach, Zoleo and similar) need permission from India's Department of Telecommunications. Carrying one without it is illegal, and tourists have been detained at airports for it. Operators with permits carry their own; ask. Nepal's rules are different." },
          { p: "Your phone's GPS works without signal. Load the trail before you go so you always know where you are: see [Take your trek offline](/adventurepedia/offline-maps)." },
        ],
      },
      {
        id: "if-it-happens",
        title: "If something goes wrong",
        blocks: [
          { steps: [
            "Keep yourself safe first, then the injured person. Get them warm and out of the wind.",
            "Tell the trek leader immediately, even if it seems minor.",
            "If someone is unwell at altitude, the answer is usually to go down: see [Altitude sickness](/adventurepedia/altitude-sickness).",
            "Where there's signal, **112** is India's emergency number. In Nepal, the tourist police are on **1144**.",
            "Write down the time, symptoms and what's been given. It helps whoever takes over.",
          ] },
          { p: "Before you leave, send your itinerary, operator's emergency number and expected return date to someone at home, and tell them when to raise the alarm." },
        ],
      },
    ],
    related: ["altitude-sickness", "choosing-an-operator", "offline-maps"],
  },
  {
    slug: "trail-craft",
    title: "Trail craft: the daily rhythm and staying safe",
    short: "Trail craft",
    summary: "Pacing, river crossings, snow, sun and weather: the habits that keep a trek safe and enjoyable from the first day to the last.",
    topic: "trail",
    icon: "trail",
    tldr: [
      "Start early: mountain weather usually turns in the afternoon.",
      "Walk at a pace where you can talk. Steady beats fast.",
      "Cross streams in the morning when they're lowest, hip belt unbuckled, facing upstream.",
      "Wear sunglasses rated UV400 on snow, even when it's cloudy.",
      "Stay with your group and keep the leader and sweep in sight.",
    ],
    sections: [
      {
        id: "rhythm",
        title: "A day on the trail",
        blocks: [
          { p: "Most trek days follow the same shape: wake around 6, breakfast, walk by 7 or 8, lunch on the trail, reach camp by early afternoon. The early start isn't for show. Clouds, wind, rain and snow usually build after midday, and snow softens in the sun." },
          { list: [
            "**Pace:** you should be able to talk in full sentences. Going too fast is the most common cause of exhaustion and makes altitude sickness more likely.",
            "**Rest step on steep climbs:** pause for a breath with your back leg straight, letting the bones take the weight, then step.",
            "**Breaks:** short and regular, 5 minutes every hour. Long stops make you cold and stiff.",
            "**Downhill:** shorter steps, knees soft, poles in front. Most twisted ankles happen descending, late in the day.",
          ] },
        ],
      },
      {
        id: "rivers",
        title: "Crossing streams",
        blocks: [
          { p: "Glacier-fed streams rise through the day as the sun melts snow, and after rain. A knee-deep stream in the morning can be waist-deep and impassable by afternoon." },
          { steps: [
            "Cross early in the day. If it looks too fast, wait or turn back; it's never worth the risk.",
            "Unbuckle your hip belt and loosen shoulder straps so you can get out of the pack if you fall.",
            "Keep your shoes on (or change into sandals with straps). Bare feet on icy rocks is how people fall.",
            "Face upstream, use poles for three points of contact, shuffle sideways and don't lift a foot until the other is planted.",
            "In a group, cross in a line holding each other's packs, strongest person upstream.",
          ] },
        ],
      },
      {
        id: "snow",
        title: "Snow and ice",
        blocks: [
          { list: [
            "**Microspikes** (operators usually provide them) turn icy trails from scary to easy. Put them on early, not after you've slipped.",
            "**Gaiters** keep snow out of boots and socks dry.",
            "**Follow the leader's footsteps exactly** on snow slopes and cornices; they're testing the ground.",
            "**Snow blindness** is sunburn of the eyes and can happen on cloudy days. Wear wraparound UV400 sunglasses or glacier glasses whenever there's snow.",
          ] },
        ],
      },
      {
        id: "weather-sun",
        title: "Weather, sun and cold",
        blocks: [
          { p: "UV gets stronger as you climb (roughly 10% more for every 1,000 m), and snow reflects it back up. Use SPF 50 on your face, ears, neck and the backs of your hands, and reapply after lunch." },
          { list: [
            "**Layer up before you're cold** and strip a layer before you sweat. Wet clothes chill fast when you stop.",
            "**Lightning:** get off ridges and summits, away from lone trees and metal poles. Crouch on your pack if a storm is overhead.",
            "**Night cold:** sleep in a dry base layer, wear a beanie and dry socks, and eat something before bed. A hot water bottle in your sleeping bag is the best trick there is.",
          ] },
        ],
      },
      {
        id: "group",
        title: "Staying together",
        blocks: [
          { p: "Groups have a leader at the front and a sweep at the back. Stay between them. If you need to stop, tell someone. On junctions, wait for the person behind you so they see which way you went." },
          { p: "Your guide will set a **turnaround time** on summit and pass days. If you haven't reached the top by then, you turn back. It's what keeps summit days safe." },
          { callout: "tip", title: "Know where you are", text: "Load the trek's GPX trail on your phone before you go. If you're ever separated, you'll see the path and the nearest camp: [Take your trek offline](/adventurepedia/offline-maps)." },
        ],
      },
    ],
    related: ["offline-maps", "what-to-pack", "leave-no-trace"],
    appliesTo: ["Trekking", "Mountaineering"],
  },

  // ── Plan & prepare ──────────────────────────────────────────────────────────
  {
    slug: "what-to-pack",
    title: "What to pack for a Himalayan trek",
    short: "What to pack",
    summary: "The layering system that keeps you warm at -10°C, the right shoes, season-by-season extras, and what your operator usually provides.",
    topic: "plan",
    icon: "pack",
    featured: true,
    tldr: [
      "Dress in layers: a quick-dry base, a fleece, a down jacket and a waterproof shell. No cotton.",
      "Broken-in trekking shoes with ankle support matter more than anything else you buy.",
      "Your daypack carries water, snacks, a warm layer, rain gear, sunscreen and your medicines.",
      "Operators usually provide tents, sleeping bags and mats. Confirm before you buy.",
      "Keep your offloaded bag under 10 kg; most operators cap it there.",
    ],
    sections: [
      {
        id: "layers",
        title: "The layering system",
        blocks: [
          { p: "Mountain temperatures swing 20°C between a sunny afternoon and a pre-dawn summit push. Instead of one big jacket, wear layers you can add and remove." },
          { table: { head: ["Layer", "What", "Why"], rows: [
            ["Base", "Synthetic or merino T-shirts and thermals", "Moves sweat off your skin. Cotton stays wet and chills you"],
            ["Mid", "Fleece jacket", "Warm while you walk, breathes well"],
            ["Insulation", "Down or synthetic puffer jacket", "For camp, breaks and summit mornings. Rated to the trek's coldest night"],
            ["Shell", "Waterproof, windproof jacket and trousers", "Keeps the other layers dry and blocks wind"],
          ] } },
          { p: "Add a warm beanie, a sun cap, a buff or neck gaiter, liner gloves plus waterproof outer gloves, and two or three pairs of trekking socks (plus one warm pair kept only for sleeping)." },
        ],
      },
      {
        id: "shoes",
        title: "Shoes: the most important thing you'll buy",
        blocks: [
          { list: [
            "**Trekking shoes with ankle support** and a deep-lugged sole. Waterproof for snow treks and monsoon.",
            "**Break them in:** walk at least 20 to 30 km in them before the trek, ideally with a loaded pack on stairs and slopes.",
            "**Size half a number up** for socks and swelling feet on descents. Your toes shouldn't touch the front going downhill.",
            "**Camp shoes:** light sandals or slip-ons for evenings, and to keep socks dry on stream crossings.",
          ] },
          { callout: "warn", title: "Don't trek in sports or running shoes", text: "Flat soles slip on wet rock, scree and snow, and give no ankle support. It's the most common kit mistake on Indian treks." },
        ],
      },
      {
        id: "daypack",
        title: "Your daypack",
        blocks: [
          { p: "Even if a mule or porter carries your main bag, you carry a 25 to 35 litre daypack with a rain cover. It holds everything you might need before you reach camp:" },
          { list: [
            "Two 1-litre bottles (or a bottle and a hydration bladder)",
            "Snacks for the day",
            "Fleece or down jacket, rain jacket, gloves and beanie",
            "Sunscreen, lip balm, sunglasses",
            "Personal medicines and blister kit",
            "Headtorch with spare batteries",
            "Phone, power bank, a little cash, ID copies",
            "Toilet kit: tissue, sanitiser, a small bag to carry used paper out",
          ] },
        ],
      },
      {
        id: "seasons",
        title: "Season by season",
        blocks: [
          { table: { head: ["Season", "Add"], rows: [
            ["Winter snow treks (Dec to Mar)", "Down jacket rated to -10°C or lower, thermal bottoms, waterproof gloves, gaiters, two warm beanies, insulated bottle"],
            ["Spring (Apr to Jun)", "Sun protection, a light fleece, rain jacket for afternoon showers"],
            ["Monsoon (Jul to Sep)", "Poncho or good rain jacket, pack liner (bin bags work), quick-dry trousers, leech socks for lower forests"],
            ["Autumn (Sep to Nov)", "Warm layers for cold nights, mornings near freezing even when days are sunny"],
          ] } },
        ],
      },
      {
        id: "provided",
        title: "What operators usually provide",
        blocks: [
          { p: "Most trek packages include tents, sleeping bags, sleeping mats, the kitchen and meals, and often microspikes and gaiters on snow treks. Many hire out trekking poles and rain ponchos too. Check the inclusions on the operator's listing, and ask about sleeping bag ratings: you want one rated to at least the coldest night." },
          { p: "**Offloading** (paying a mule or porter to carry your main bag) usually has a weight cap around 10 to 12 kg. Pack to it, and pack in a soft duffel or rucksack, not a suitcase." },
          { callout: "tip", title: "Trek-specific lists", text: "Every trek page has its own packing checklist, tuned to the season and height. Open it from the trek's \"What to know before you go\" section." },
        ],
      },
    ],
    related: ["choosing-a-season", "trail-craft", "first-aid-and-water"],
    appliesTo: ["Trekking"],
  },
  {
    slug: "getting-fit",
    title: "Getting fit for a trek: an 8-week plan",
    short: "Getting fit",
    summary: "How fit you need to be, the training that actually transfers to mountain days, and a week-by-week plan you can start today.",
    topic: "plan",
    icon: "fitness",
    tldr: [
      "Start 8 weeks out. Even 4 helps; turning up untrained ruins treks.",
      "Cardio 3 to 4 times a week, building to an hour.",
      "Climb stairs or hills with a loaded pack: it's the closest thing to a trek day.",
      "Strengthen legs and core twice a week: squats, lunges, step-ups, planks.",
      "Ease off in the last week so you arrive fresh.",
    ],
    sections: [
      {
        id: "how-fit",
        title: "How fit do you need to be?",
        blocks: [
          { p: "A typical trek day is 5 to 7 hours of walking with a daypack, gaining 500 to 1,000 m, often on uneven ground, for several days in a row, with less oxygen than you're used to. You don't need to be an athlete, but you do need to be able to keep going." },
          { table: { head: ["Trek grade", "A fair benchmark before you go"], rows: [
            ["Easy", "Walk 10 km comfortably, climb 20 floors of stairs without stopping"],
            ["Moderate", "Jog 5 km in about 40 minutes, or climb 40 floors with a 5 kg pack"],
            ["Hard", "Jog 5 km in about 35 minutes, and a 4 to 5 hour hill walk with a pack"],
            ["Extreme", "Regular long training days with a heavy pack, and prior high-altitude experience"],
          ] } },
          { callout: "tip", title: "Know what a trek asks of you", text: "Every adventure on Trail to Tides has an ACE score for stamina, strength, altitude and more. Take the Matchmaker and it compares them with you: [How ACE works](/ace)." },
        ],
      },
      {
        id: "plan",
        title: "The 8-week plan",
        blocks: [
          { table: { head: ["Weeks", "Cardio", "Strength", "Weekend"], rows: [
            ["1 to 2", "3 × 30 min brisk walk, jog or cycle", "2 × legs and core, bodyweight", "1 to 2 hour walk"],
            ["3 to 4", "3 × 40 min, one with hills or stairs", "2 × legs and core, add a 5 kg pack", "2 to 3 hour walk with a 5 kg pack"],
            ["5 to 6", "4 × 45 to 60 min, two with stairs", "2 × legs and core, add step-ups", "3 to 4 hour hill walk, 7 to 8 kg pack"],
            ["7", "4 × 60 min, one long stair session", "2 × legs and core", "Back-to-back days: 3 hours each with a pack"],
            ["8", "3 × 30 min easy", "1 light session", "Rest. Pack and sleep well"],
          ] } },
        ],
      },
      {
        id: "exercises",
        title: "Exercises that transfer",
        blocks: [
          { list: [
            "**Stair climbing with a pack:** the single best trek training. Up and down; descending trains your knees for the way back.",
            "**Step-ups:** onto a sturdy bench or step, 3 sets of 12 each leg.",
            "**Squats and lunges:** 3 sets of 15. Add walking lunges for balance.",
            "**Calf raises:** 3 sets of 20, for steep climbs and tired ankles.",
            "**Planks and side planks:** 3 × 45 seconds; a strong core carries the pack.",
            "**Long walks in your trek shoes:** breaks the shoes in and toughens your feet.",
          ] },
          { p: "Living in a flat city? Office and apartment stairs work fine. So does a treadmill on the steepest incline, walking, with a pack." },
        ],
      },
      {
        id: "breathing",
        title: "Breathing and altitude",
        blocks: [
          { p: "No training at sea level prepares your body for thin air; only time at altitude does. But good cardio fitness means you work at a lower share of your capacity, so you have more in reserve when the oxygen drops. Slow, deep breathing on climbs helps too." },
          { p: "If you smoke, the best training you can do is stop, even just for the weeks before the trek." },
        ],
      },
    ],
    related: ["altitude-sickness", "what-to-pack", "choosing-a-season"],
    appliesTo: ["Trekking", "Mountaineering", "Cycling"],
  },
  {
    slug: "choosing-a-season",
    title: "When to go: the Himalayan seasons",
    short: "When to go",
    summary: "Spring flowers, monsoon rain-shadow valleys, autumn's clear skies and winter snow treks: which season suits which adventure.",
    topic: "plan",
    icon: "season",
    tldr: [
      "Autumn (late September to November) brings the clearest skies and the most stable weather.",
      "Spring (March to June) has rhododendrons and long days, with snow lingering on high passes until May.",
      "Monsoon (July to mid-September) is for the rain-shadow regions: Ladakh, Spiti, Lahaul and Zanskar.",
      "Winter (December to March) means snow treks below about 4,000 m. High passes are closed.",
      "Each trek page shows its best months and whether it's in season now.",
    ],
    sections: [
      {
        id: "overview",
        title: "The year at a glance",
        blocks: [
          { table: { head: ["Season", "Months", "Good for", "Watch out for"], rows: [
            ["Spring", "Mar to Jun", "Rhododendron forests, Nepal's big treks, summer treks in Himachal and Uttarakhand", "Snow on passes until May, haze, pre-monsoon afternoon storms"],
            ["Monsoon", "Jul to mid-Sep", "Ladakh, Spiti, Lahaul, Zanskar; Valley of Flowers in bloom; the Manali to Leh ride", "Landslides and road blocks on the southern slopes, leeches, cloud"],
            ["Autumn", "Late Sep to Nov", "Almost everything: high passes, Sikkim, Nepal, clear mountain views", "Cold nights, early snow in November, busy trails"],
            ["Winter", "Dec to Mar", "Snow treks like Kedarkantha, Brahmatal and Dayara Bugyal", "Nights of -10°C or colder, short days, closed passes and roads"],
          ] } },
        ],
      },
      {
        id: "monsoon",
        title: "The monsoon question",
        blocks: [
          { p: "From July to mid-September, the monsoon soaks the Himalaya's southern side. Trails in Uttarakhand, lower Himachal and Sikkim get slippery, views close in, and landslides block roads to the trailhead for days." },
          { p: "But the high ranges behind them are in a **rain shadow**. Ladakh, Spiti, Lahaul, Kinnaur's upper valleys and Zanskar stay mostly dry, and that's their best season. Monsoon is also when the Valley of Flowers and many high meadows bloom." },
          { callout: "warn", title: "Build in buffer days", text: "In monsoon, add a spare day or two at the end of your trip. A single landslide can hold up the drive back for a day." },
        ],
      },
      {
        id: "winter",
        title: "Winter snow treks",
        blocks: [
          { p: "Winter treks stay below about 4,000 m on forest trails with summits you can reach in a day. You get deep snow, clear skies and empty trails. The cost is cold: camps sit well below freezing at night." },
          { list: [
            "Pack for -10 to -15°C at night: see [What to pack](/adventurepedia/what-to-pack).",
            "Days are short; summit pushes start in the dark around 3 or 4 am.",
            "Fresh snowfall can close a trail for a day or two. Good operators reroute or wait.",
          ] },
        ],
      },
      {
        id: "rides",
        title: "Rides and rivers",
        blocks: [
          { list: [
            "**Manali to Leh and the Ladakh circuits:** the high passes usually open from late May or June and close with the snow in October. Exact dates change every year.",
            "**Spiti:** reachable via Kinnaur most of the year; the Kunzum Pass side opens around June.",
            "**Rafting in Rishikesh:** runs roughly September to June. It's suspended in the monsoon when the Ganga runs high.",
          ] },
          { p: "On [Explore](/explore) you can filter adventures by the month you want to go." },
        ],
      },
    ],
    related: ["what-to-pack", "riding-the-high-passes", "river-rafting"],
  },
  {
    slug: "choosing-an-operator",
    title: "How to choose a trek operator",
    short: "Choosing an operator",
    summary: "The questions that separate a safe operator from a cheap one: guides, ratios, oxygen, acclimatisation, turnaround rules and refunds.",
    topic: "plan",
    icon: "operator",
    tldr: [
      "Ask who leads: their mountaineering course, first-aid training and years on this trek.",
      "Look for a guide-to-trekker ratio around 1:8, with a sweep at the back.",
      "High treks should carry oxygen, a pulse oximeter and a first-aid kit, with an evacuation plan.",
      "Check the itinerary has proper acclimatisation, not the fastest possible ascent.",
      "Get inclusions, cancellation and refund terms in writing.",
    ],
    sections: [
      {
        id: "why",
        title: "Why it matters",
        blocks: [
          { p: "On a Himalayan trek your operator controls the things that keep you safe: the pace of the ascent, the quality of the leader, what happens if someone gets sick at 4,000 m. Price differences often come down to exactly these things." },
          { p: "Trail to Tides lists operators side by side on every adventure, with prices, inclusions and ratings, and marks the ones we've checked with a Verified badge. Use the questions below to go further. See [all operators](/operators)." },
        ],
      },
      {
        id: "questions",
        title: "Questions to ask before you book",
        blocks: [
          { list: [
            "**Who will lead my group?** Look for a basic or advanced mountaineering course (NIM, HMI, ABVIMAS, JIM&WS and similar) and wilderness first-aid training, plus experience on this route.",
            "**What's the ratio?** Around one trained leader or guide per 8 trekkers, with an assistant at the back.",
            "**What safety kit comes along?** On high treks: oxygen cylinder, pulse oximeter, a stretcher or way to carry someone, and a proper first-aid kit.",
            "**What's the plan if someone gets sick?** Who goes down with them, how, and who pays?",
            "**Is there a turnaround time on summit day?** Good operators have one and stick to it.",
            "**What's included?** Transport, permits, meals, tents, sleeping bags, microspikes, offloading.",
            "**What happens if the trek is cut short** by weather, landslides or illness? Credit, refund or nothing?",
            "**How do you handle waste?** Carrying everything out is the minimum.",
          ] },
        ],
      },
      {
        id: "red-flags",
        title: "Red flags",
        blocks: [
          { list: [
            "A price far below everyone else's for the same trek",
            "No written day-by-day itinerary, or one that gains height much faster than others",
            "No rest or buffer day on a long high trek",
            "Vague answers about who leads the group",
            "Pressure to reach the summit \"because you paid for it\"",
            "Group sizes of 25 or more with one guide",
          ] },
          { callout: "tip", title: "Compare on the trek page", text: "Each adventure's \"Where to book\" section compares its operators' prices, ratings and inclusions in one place." },
        ],
      },
    ],
    related: ["permits-and-documents", "insurance-and-emergencies", "altitude-sickness"],
  },
  {
    slug: "permits-and-documents",
    title: "Permits and documents",
    short: "Permits & documents",
    summary: "The ID to carry, how forest and area permits work in the Indian Himalaya, inner-line rules near the borders, and trekking in Nepal.",
    topic: "plan",
    icon: "permit",
    tldr: [
      "Carry original government photo ID and a few photocopies on every trek.",
      "Forest and sanctuary permits are usually arranged by your operator. Check it's included.",
      "Areas near the borders need extra permits, and different ones for Indian and foreign citizens.",
      "Indian citizens can enter Nepal with a passport or voter ID. No visa needed.",
      "Rules change. Confirm the current requirements with your operator two weeks before you go.",
    ],
    sections: [
      {
        id: "id",
        title: "What to carry",
        blocks: [
          { list: [
            "**Original government photo ID:** Aadhaar, passport, voter ID or driving licence. Foreign nationals need their passport and visa.",
            "**Photocopies** of your ID and a few passport photos; some permit offices still want paper.",
            "**Medical certificate** if your operator asks for one. Many do for high treks.",
            "**For riders:** driving licence, the vehicle's registration, insurance and pollution certificate, and a rental agreement if it isn't your bike.",
          ] },
        ],
      },
      {
        id: "india",
        title: "Permits in the Indian Himalaya",
        blocks: [
          { p: "Most treks pass through reserved forests, national parks or wildlife sanctuaries that charge an entry or camping fee and issue a permit. Operators normally arrange these and include them in the price; ask if you're not sure." },
          { list: [
            "**Uttarakhand:** forest department permits for treks inside sanctuaries and national parks, such as Govind Wildlife Sanctuary for Har Ki Dun and Kedarkantha.",
            "**Sikkim:** treks such as Goechala need permits arranged through a registered local agency.",
            "**Ladakh:** visitors pay environment and wildlife fees. Some areas near the borders need a protected-area permit, especially for foreign nationals.",
            "**Himachal:** vehicles crossing the Rohtang Pass need an online permit. The Atal Tunnel route doesn't.",
          ] },
          { callout: "warn", title: "Foreign nationals", text: "Parts of Sikkim, Ladakh, Spiti, Kinnaur and other border areas need a Protected or Restricted Area Permit for non-Indian citizens, often only issued to groups through registered agencies. Check before you plan the route." },
        ],
      },
      {
        id: "nepal",
        title: "Trekking in Nepal",
        blocks: [
          { list: [
            "**Indian citizens** need a valid passport or voter ID card. No visa is required.",
            "**National park and conservation area permits** apply on the main routes: for example Sagarmatha National Park for Everest, and the Annapurna Conservation Area (ACAP) for Annapurna.",
            "**Guides:** Nepal now requires most foreign trekkers to walk with a licensed guide in its main trekking areas. Your operator will arrange this; check how it applies to you.",
          ] },
        ],
      },
      {
        id: "other",
        title: "Drones, photography and courtesy",
        blocks: [
          { p: "Flying a drone in India needs registration and, near borders, military areas and airports, permission. Most high Himalayan border zones are no-fly. Ask before photographing military installations, bridges and checkposts, and ask people before taking their photo." },
        ],
      },
    ],
    related: ["choosing-an-operator", "riding-the-high-passes", "insurance-and-emergencies"],
  },

  // ── On the trail ────────────────────────────────────────────────────────────
  {
    slug: "offline-maps",
    title: "Take your trek offline",
    short: "Offline maps",
    summary: "Load a trek's GPX trail and an offline map onto your phone or GPS watch, and follow it with no signal. Android, iPhone, computer and watches.",
    topic: "trail",
    icon: "map",
    custom: true,
    featured: true,
    tldr: [
      "Install Organic Maps and download the state's map at home on Wi-Fi.",
      "Download the trek's GPX trail from its page and open it in the app.",
      "Test in airplane mode: the map shows and the blue dot appears.",
    ],
    sections: [
      { id: "quick-start", title: "The short version", blocks: [{ p: "Install Organic Maps, download the region's map, load the trail file, test in airplane mode." }] },
      { id: "how-it-works", title: "How it works", blocks: [{ p: "An offline map of the area plus the GPX trail file. Your phone's GPS works with no signal, SIM or data, in airplane mode." }] },
      { id: "before-you-go", title: "Before you leave home", blocks: [{ p: "Checklist: install the app, download the offline map, load the GPX, test it, put it on a second phone, pack a power bank." }] },
      { id: "android", title: "Android", blocks: [{ p: "Organic Maps on Android: download maps, open the GPX from Downloads, bookmarks and tracks. Backups: OsmAnd, Gaia GPS." }] },
      { id: "iphone", title: "iPhone and iPad", blocks: [{ p: "Organic Maps on iPhone: download the GPX in Safari, share from Files to Organic Maps." }] },
      { id: "computer", title: "Computer", blocks: [{ p: "View, print or send the trail to your phone from Windows, Mac or Linux." }] },
      { id: "watch", title: "GPS watches", blocks: [{ p: "Garmin, Suunto and Coros watches: import the GPX as a course or route and follow it." }] },
      { id: "on-the-trail", title: "On the trail", blocks: [{ p: "Follow the blue dot on the line. A backup, not your guide." }] },
      { id: "battery", title: "Battery in the cold", blocks: [{ p: "Cold drains batteries. Airplane mode, low brightness, keep the phone warm, carry a power bank." }] },
      { id: "troubleshooting", title: "If something goes wrong", blocks: [{ p: "The file won't open, the blue dot doesn't appear, the map is blank: fixes for each." }] },
    ],
    related: ["trail-craft", "insurance-and-emergencies", "what-to-pack"],
    appliesTo: ["Trekking"],
  },
  {
    slug: "leave-no-trace",
    title: "Leave no trace in the mountains",
    short: "Leave no trace",
    summary: "Carrying waste out, going to the toilet where there isn't one, water, wildlife and villages: how to leave the Himalaya as you found it.",
    topic: "trail",
    icon: "leaf",
    tldr: [
      "Carry out everything you carry in, including wrappers and used toilet paper.",
      "Toilet at least 60 m from water and trails; dig a hole 15 to 20 cm deep.",
      "No soap or toothpaste in streams, even the biodegradable kind.",
      "Stay on the trail, don't feed animals, and ask before photographing people.",
    ],
    sections: [
      {
        id: "waste",
        title: "Waste",
        blocks: [
          { p: "The Himalaya's popular trails have a plastic problem, and there's no collection at 3,500 m. Whatever you leave stays." },
          { list: [
            "Carry a small bag for your own rubbish, and empty it only in proper bins at the road head.",
            "Choose refillable bottles over packaged water.",
            "Pick up a few pieces of litter every day. Many operators run clean-up drives; join in.",
            "Don't burn plastic at camp. The smoke is toxic and the residue stays.",
          ] },
        ],
      },
      {
        id: "toilet",
        title: "Toilets",
        blocks: [
          { p: "Most camps have toilet tents. Where there isn't one:" },
          { steps: [
            "Walk at least 60 m (about 70 steps) from water, camps and the trail.",
            "Dig a hole 15 to 20 cm deep with a trowel or your heel.",
            "Afterwards, fill it in and cover it.",
            "Pack used toilet paper and sanitary products out in a sealed bag. They don't break down in the cold.",
          ] },
        ],
      },
      {
        id: "water-wildlife",
        title: "Water and wildlife",
        blocks: [
          { list: [
            "Wash yourself and dishes away from streams, and scatter the water. Soap harms the life in mountain streams, even biodegradable soap.",
            "Don't feed animals, including dogs that follow groups up from villages. It changes their behaviour and spreads disease.",
            "Watch wildlife from a distance. Bharal, ibex and pheasants are easily disturbed in winter, when every bit of energy counts.",
            "Stick to the trail. Short-cutting switchbacks starts erosion that scars slopes for years.",
          ] },
        ],
      },
      {
        id: "people",
        title: "Villages and culture",
        blocks: [
          { list: [
            "Ask before photographing people, especially at temples, monasteries and ceremonies.",
            "Walk clockwise around stupas, mani walls and chortens.",
            "Dress modestly in villages, and remove shoes where it's asked.",
            "Buy local: homestays, tea shops, produce. It keeps money in the valley.",
          ] },
        ],
      },
    ],
    related: ["trail-craft", "choosing-an-operator", "first-aid-and-water"],
  },

  // ── Rides & rivers ──────────────────────────────────────────────────────────
  {
    slug: "riding-the-high-passes",
    title: "Riding the high passes: Ladakh and Spiti",
    short: "Riding the high passes",
    summary: "Acclimatising on two wheels, fuel gaps, water crossings, bike prep and permits for the Manali to Leh highway, Ladakh and Spiti.",
    topic: "rides",
    icon: "ride",
    tldr: [
      "Altitude hits riders hard: you climb fast without the exercise that helps acclimatise.",
      "Plan fuel: from Tandi to Leh on the Manali route there's no fuel station for about 365 km.",
      "Cross water streams early in the morning, standing, in first gear, without stopping.",
      "Carry spares: tubes, cables, a puncture kit and the tools to use them.",
      "Pass and road status change daily. Check before every big day.",
    ],
    sections: [
      {
        id: "altitude",
        title: "Altitude on a motorcycle",
        blocks: [
          { p: "Riders can climb 2,000 m in a day, much faster than any trekker. You'll cross passes above 5,000 m and sleep above 3,500 m. Altitude sickness is the most common reason ride plans fall apart." },
          { list: [
            "Follow the sleeping-height rules: no more than 300 to 500 m higher each night above 3,000 m where the route allows, and rest days in Leh or Kaza.",
            "Flying into Leh and riding out? Rest 48 hours first.",
            "Don't linger on the high passes. Take the photo and drop down.",
            "Headache, nausea or confusion on the bike are reasons to stop and descend, not push on. See [Altitude sickness](/adventurepedia/altitude-sickness).",
          ] },
        ],
      },
      {
        id: "fuel-route",
        title: "Fuel and the route",
        blocks: [
          { p: "On the Manali to Leh highway, **Tandi** has the last fuel station before Leh, roughly 365 km away. Carry jerry cans for the extra range, or fill them up where your support vehicle does." },
          { list: [
            "Ride in daylight only. Start early to beat afternoon water levels and wind.",
            "Expect slush, gravel and broken stretches near the passes even on \"good\" years.",
            "Mobile signal is rare between towns. Carry a paper map and offline maps on your phone.",
          ] },
        ],
      },
      {
        id: "water-crossings",
        title: "Water crossings",
        blocks: [
          { p: "Snowmelt streams cross the road in many places and rise through the day. Some, like the stretches near Pagal Nala on the Leh route, are notorious." },
          { steps: [
            "Cross early in the day when the water is lowest.",
            "Walk it first if you can't see the bottom, or watch someone else cross.",
            "Stand on the pegs, first gear, steady throttle. Look at where you want to go, not at the water.",
            "Don't stop or change gear mid-stream.",
            "Ride with others and cross one at a time.",
          ] },
        ],
      },
      {
        id: "bike",
        title: "Bike prep and spares",
        blocks: [
          { list: [
            "Full service before you leave: brakes, chain, tyres, air filter and clutch.",
            "Spares: front and rear tubes, clutch and accelerator cables, spark plug, fuses, chain link, puncture kit with a pump.",
            "Tools for the above, and know how to use them.",
            "Bungees and waterproof bags; everything gets wet at some point.",
            "Riding gear: full-face helmet, armoured jacket, gloves, boots and rain gear. It's cold above 4,000 m even in July.",
          ] },
          { callout: "tip", title: "Riding with an operator", text: "Guided rides usually include a mechanic, a backup vehicle carrying luggage and fuel, and oxygen. On your first trip to the high passes, it's worth it." },
        ],
      },
      {
        id: "permits",
        title: "Permits and papers",
        blocks: [
          { p: "Carry your licence, the bike's registration, insurance and pollution certificate, plus the rental agreement for a hired bike. Rohtang Pass needs an online vehicle permit (the Atal Tunnel route avoids it). Some areas in Ladakh near the borders need permits; see [Permits and documents](/adventurepedia/permits-and-documents)." },
        ],
      },
      {
        id: "cycling",
        title: "Cycling the same roads",
        blocks: [
          { p: "Everything above applies, slower. Cyclists acclimatise better because the climbs are gradual, but face long days, cold descents and strong afternoon headwinds. Carry more water than you think, a windproof for every descent, and plan on a support vehicle for the longest stretches." },
        ],
      },
    ],
    related: ["altitude-sickness", "permits-and-documents", "choosing-a-season"],
    appliesTo: ["Motorcycling", "Cycling"],
  },
  {
    slug: "river-rafting",
    title: "River rafting: grades, safety and what to expect",
    short: "River rafting",
    summary: "What rapid grades mean, the safety briefing that matters, how to swim a rapid if you fall in, and what to wear.",
    topic: "rides",
    icon: "raft",
    tldr: [
      "Rapids are graded I (gentle) to VI (unrunnable). Most commercial trips are II to IV.",
      "Wear the life jacket and helmet properly, even if you can swim.",
      "If you fall in: on your back, feet up and pointing downstream, then swim to the raft.",
      "Listen to the guide's commands; paddling together is what keeps the raft upright.",
    ],
    sections: [
      {
        id: "grades",
        title: "What the grades mean",
        blocks: [
          { table: { head: ["Grade", "What it's like"], rows: [
            ["I", "Moving water with small waves. Beginners"],
            ["II", "Clear channels, some waves and rocks. Fun for first-timers"],
            ["III", "Bigger waves, more manoeuvring. Swims are possible"],
            ["IV", "Powerful, fast rapids that need precise moves. Swims are harder"],
            ["V", "Long, violent rapids. Experts with specialist safety only"],
            ["VI", "Rarely or never run"],
          ] } },
          { p: "Grades change with water levels: the same rapid can go up a grade after rain or in the snowmelt season. Rishikesh's popular stretches on the Ganga are grade II to IV." },
        ],
      },
      {
        id: "briefing",
        title: "The safety briefing",
        blocks: [
          { p: "Every trip starts on the bank with a briefing. Pay attention, even if you've rafted before:" },
          { list: [
            "**Life jacket (PFD):** snug, all buckles done. The guide should be able to pull it up by the shoulders without it reaching your ears.",
            "**Helmet:** strap fastened, sits low on your forehead.",
            "**Seating:** sit on the side tube, feet wedged under the tube in front or in foot cups.",
            "**Paddle:** one hand always on the T-grip at the top. That's what stops it hitting someone's face.",
            "**Commands:** forward, back, stop, left back, right back, and \"get down\" (sit in the raft holding the line).",
          ] },
        ],
      },
      {
        id: "swimming",
        title: "If you fall in",
        blocks: [
          { steps: [
            "Don't panic. Your life jacket will bring you up.",
            "Get on your back with your feet up and pointing downstream, to bounce off rocks with your feet, not your head.",
            "Never try to stand up in fast water: your foot can get trapped between rocks.",
            "Look for the raft or a safety kayak and swim towards it when it's calm enough. Grab the rope or paddle offered to you.",
            "When someone pulls you in, help by kicking.",
          ] },
          { callout: "warn", title: "Who shouldn't raft", text: "Skip white water if you're pregnant, have a heart condition, epilepsy, or a back or neck injury. Most operators set a minimum age around 14 for grade III and above." },
        ],
      },
      {
        id: "wear",
        title: "What to wear and bring",
        blocks: [
          { list: [
            "Quick-dry shorts and a T-shirt or rash guard. No cotton or jeans.",
            "Shoes or sandals that strap on firmly; flip-flops come off.",
            "Sunscreen and a strap for your glasses.",
            "A full change of clothes and a towel left in the vehicle.",
            "Leave phones and valuables behind, or use the operator's dry bag.",
          ] },
          { p: "Season: rafting in Rishikesh runs roughly September to June, and stops in the monsoon when the river runs high." },
        ],
      },
    ],
    related: ["choosing-a-season", "choosing-an-operator", "insurance-and-emergencies"],
    appliesTo: ["River Rafting"],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);

/** The few guides worth reading before a particular adventure, most relevant first */
export function guidesForAdventure(type: string, altitudeM: number, hasTrail: boolean): Guide[] {
  const high = altitudeM >= 2500;
  const picks =
    type === "River Rafting" ? ["river-rafting", "choosing-an-operator", "insurance-and-emergencies"]
    : type === "Motorcycling" || type === "Cycling" ? ["riding-the-high-passes", "altitude-sickness", "permits-and-documents"]
    : [high ? "altitude-sickness" : "trail-craft", "what-to-pack", hasTrail ? "offline-maps" : "getting-fit", type === "Mountaineering" ? "insurance-and-emergencies" : "choosing-a-season"];
  return picks.map(guideBySlug).filter((g): g is Guide => !!g);
}
export const guideHref = (g: Pick<Guide, "slug">) => `/adventurepedia/${g.slug}`;

/** Plain text of inline markup: strips **bold** and turns [label](href) into label */
export function plain(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function blockText(b: Block): string {
  if ("p" in b) return plain(b.p);
  if ("list" in b) return b.list.map(plain).join(" · ");
  if ("steps" in b) return b.steps.map(plain).join(" · ");
  if ("callout" in b) return `${b.title}. ${plain(b.text)}`;
  return [b.table.head.join(" "), ...b.table.rows.map((r) => r.join(" "))].join(" ");
}

/** Reading time from the words in a guide, at a relaxed 200 words a minute */
export function readMinutes(g: Guide) {
  const words = [g.summary, ...g.tldr, ...g.sections.flatMap((s) => s.blocks.map(blockText))].join(" ").split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

/** One searchable entry per guide section, plus one for the guide itself */
export interface SearchEntry { slug: string; guide: string; topic: Topic; section?: string; sectionId?: string; text: string }

export function searchIndex(): SearchEntry[] {
  return GUIDES.flatMap((g) => [
    { slug: g.slug, guide: g.title, topic: g.topic, text: `${g.short}. ${g.summary} ${g.tldr.map(plain).join(" ")}` },
    ...g.sections.map((s) => ({ slug: g.slug, guide: g.title, topic: g.topic, section: s.title, sectionId: s.id, text: s.blocks.map(blockText).join(" ") })),
  ]);
}
