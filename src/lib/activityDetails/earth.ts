// Full guides for the earth adventures. See ./index.ts for how they're used.
import type { ActivityDetail } from "./types";

export const EARTH: Record<string, ActivityDetail> = {
  trekking: {
    tldr: [
      "Pick a first trek of 4 to 6 days that tops out below 4,000 m, in spring or autumn.",
      "Camping treks carry tents and a kitchen; homestay and teahouse treks sleep in villages and lodges.",
      "The itinerary matters more than the price: look for slow height gain and a spare day.",
      "Train for 6 to 8 weeks before you go, and break your shoes in.",
      "Our 58 trek guides cover each route day by day, with permits, travel and costs.",
    ],
    sections: [
      {
        id: "kinds",
        title: "Kinds of treks in India",
        blocks: [
          { table: { head: ["Kind", "What it's like", "Examples"], rows: [
            ["Camping trek", "Tents, a cook team and mules or porters. The usual style in Uttarakhand, Himachal and Kashmir", "[Kedarkantha](/adventurepedia/treks/kedarkantha-trek), [Kashmir Great Lakes](/adventurepedia/treks/kashmir-great-lakes)"],
            ["Homestay or village trek", "Nights in village homes or guesthouses, local food, lighter packs", "Sikkim, Darjeeling, parts of Uttarakhand and Spiti"],
            ["Teahouse trek", "Lodges every few hours along the trail. The Nepal norm", "[Everest Base Camp](/adventurepedia/treks/everest-base-camp)"],
            ["Day hike", "Up and back in a day, no altitude worries", "[Triund](/adventurepedia/treks/triund), the Sahyadri forts"],
            ["Pilgrim trek", "Busy, well-made paths to temples, often with ponies and shops", "[Kedarnath](/adventurepedia/treks/kedarnath), [Tungnath](/adventurepedia/treks/tungnath-chandrashila)"],
          ] } },
        ],
      },
      {
        id: "first-trek",
        title: "Choosing your first trek",
        blocks: [
          { steps: [
            "**Go in season.** Spring or autumn for most of the Himalaya, winter for snow treks below 4,000 m. See [When to go](/adventurepedia/choosing-a-season).",
            "**Keep the high point modest.** Below 4,000 m for a first trek, so altitude stays manageable.",
            "**Keep it short.** 4 to 6 days lets you find out how you like it without a big commitment.",
            "**Check the grade against your fitness.** Each trek's ACE™ score shows what it asks; the [Matchmaker](/matchmaker) rates every trek for you.",
            "**Go with a group and an operator** the first time. You learn camp life without having to plan it.",
          ] },
          { callout: "tip", title: "Good first treks", text: "Kedarkantha and Brahmatal in winter, Dayara Bugyal and Kuari Pass in spring or autumn, and Triund as a single night out. The [trek guides](/adventurepedia/treks) list each one's grade and best months." },
        ],
      },
      {
        id: "cost",
        title: "What a trek costs",
        blocks: [
          { p: "The trek price is only part of it. Budget for all of these:" },
          { list: [
            "**The trek package:** usually covers meals, tents, guides and permits from the roadhead. Each listing shows what's included.",
            "**Getting to the gateway town:** train, flight or bus to Dehradun, Kathgodam, Manali, Srinagar or Bagdogra.",
            "**The drive to the roadhead:** sometimes in the package, often a shared taxi you pay for separately.",
            "**Offloading:** a mule or porter for your main bag, usually an extra charge per day.",
            "**Gear:** buy or rent shoes, a down jacket and rain gear. Renting saves money on a first trek.",
            "**Insurance and buffer days:** a spare night at the end in case a landslide holds up the drive.",
          ] },
          { p: "Each trek guide has a cost section built from the operators' current prices." },
        ],
      },
      {
        id: "styles",
        title: "Fixed groups, private treks and going alone",
        blocks: [
          { list: [
            "**Fixed-departure groups:** you join others on set dates. Cheapest, sociable, and the easiest way to go solo.",
            "**Private treks:** your own group, your own dates and pace. Costs more per person, worth it for families and slower walkers.",
            "**Independent:** possible on well-trodden routes with villages and lodges. Not wise on remote camping treks or high passes without experience; many forest permits also need a registered guide.",
          ] },
        ],
      },
    ],
  },

  mountaineering: {
    tldr: [
      "Start with a basic mountaineering course at a national institute before your first peak.",
      "Every peak in the Indian Himalaya needs a permit from the Indian Mountaineering Foundation, arranged by your operator.",
      "Summit days start in the dark and run 10 to 14 hours: fitness and acclimatisation decide success.",
      "Respect the turnaround time. Most accidents happen on the way down.",
      "Insurance must name mountaineering and cover your peak's height and rescue.",
    ],
    sections: [
      {
        id: "path",
        title: "From trekker to climber",
        blocks: [
          { p: "Mountaineering adds ropes, crampons and an ice axe to trekking, and usually much more height. Most people follow the same path:" },
          { steps: [
            "**A few high treks first,** including passes above 4,500 m, so you know how your body handles altitude.",
            "**A Basic Mountaineering Course (BMC):** about four weeks of rock craft, snow and ice skills, rope work and a training climb at a national institute.",
            "**A guided trekking peak:** a 5,000 to 6,000 m summit such as Stok Kangri (when open), Friendship Peak, Yunam or Kang Yatse II.",
            "**An Advanced Mountaineering Course (AMC),** then bigger expeditions as part of a team.",
          ] },
          { table: { head: ["Institute", "Where"], rows: [
            ["Nehru Institute of Mountaineering (NIM)", "Uttarkashi, Uttarakhand"],
            ["Himalayan Mountaineering Institute (HMI)", "Darjeeling, West Bengal"],
            ["Atal Bihari Vajpayee Institute of Mountaineering and Allied Sports (ABVIMAS)", "Manali, Himachal Pradesh"],
            ["Jawahar Institute of Mountaineering and Winter Sports (JIM&WS)", "Pahalgam, Kashmir"],
          ] } },
          { callout: "tip", title: "Book courses early", text: "Course seats fill months ahead, and they need a medical certificate. Check each institute's website for dates, fees and age limits." },
        ],
      },
      {
        id: "permits",
        title: "Peak permits and rules",
        blocks: [
          { p: "Climbing a peak in the Indian Himalaya needs permission from the **Indian Mountaineering Foundation (IMF)**, with a peak fee that depends on the height and on whether you're Indian or a foreign national. Some peaks also need state, forest or inner-line permits, and peaks near the borders may be closed. Your operator arranges this; ask to see the IMF permission." },
          { p: "Many smaller peaks in Ladakh and Himachal are listed as open for Indian climbers with a simpler process. Rules change, and some popular peaks (Stok Kangri, for one) have been closed for years to let them recover." },
        ],
      },
      {
        id: "summit-day",
        title: "How a summit day works",
        blocks: [
          { list: [
            "**Alpine start:** up at midnight or 1 am, moving by 2. Snow is firm in the cold and the weather is calmest before noon.",
            "**Roped teams:** on glaciers and steep snow you move tied together, so one person's slip doesn't become a fall.",
            "**Fixed ropes:** on the steepest bits the team fixes a rope and you clip in with an ascender (jumar).",
            "**Turnaround time:** set the night before. If you're not on top by then, everyone goes down, summit or not.",
            "**The descent:** tired legs, soft snow and failing light. Most accidents happen here, not on the way up.",
          ] },
          { callout: "warn", title: "Altitude at 6,000 m", text: "Trekking peaks reach heights where serious altitude illness is a real risk. A good plan sleeps at gradually higher camps and has a rest day before the summit push. Read [Altitude sickness](/adventurepedia/altitude-sickness) before you go." },
        ],
      },
      {
        id: "kit",
        title: "Technical kit",
        blocks: [
          { p: "Operators usually provide the group gear (ropes, tents, stoves) and often rent the personal technical kit. What you need on a trekking peak:" },
          { list: [
            "Mountaineering boots that take crampons (double boots above about 6,000 m or in cold seasons)",
            "Crampons, an ice axe, a harness, a helmet, carabiners and a belay device",
            "A down suit or heavy down jacket and trousers, rated well below freezing",
            "Glacier glasses (category 4), mitts plus liner gloves, a headtorch with spare batteries",
          ] },
          { p: "Rented boots are the usual cause of misery. Try them on with your summit socks and walk in them before the climb." },
        ],
      },
    ],
    sources: [{ label: "Indian Mountaineering Foundation", url: "https://www.indmount.org/" }, { label: "Nehru Institute of Mountaineering", url: "https://www.nimindia.net/" }, { label: "Himalayan Mountaineering Institute", url: "https://www.hmidarjeeling.com/" }],
  },

  "rock-climbing": {
    tldr: [
      "Start indoors or on a guided top-rope day: the rope is anchored above you.",
      "Everyone wears a helmet outdoors, and every knot gets a partner check.",
      "Hampi is India's bouldering capital; Badami and Bengaluru's crags suit roped climbing.",
      "Climb in the cool, dry months: October to February in the south and west.",
      "Learn to belay from an instructor before you belay a friend.",
    ],
    sections: [
      {
        id: "styles",
        title: "Styles of climbing",
        blocks: [
          { table: { head: ["Style", "What it is", "Good for"], rows: [
            ["Top-rope", "The rope runs through an anchor above you; a fall means a short drop onto the rope", "Beginners. Almost every first outdoor day"],
            ["Bouldering", "Short problems a few metres high, no rope, with crash pads and spotters", "Hampi, Bengaluru, indoor walls"],
            ["Sport climbing", "The leader clips the rope into bolts fixed in the rock", "Badami, parts of the Sahyadris, Manali"],
            ["Trad climbing", "The leader places removable gear in cracks", "Experienced climbers only"],
          ] } },
        ],
      },
      {
        id: "safety",
        title: "Safety basics",
        blocks: [
          { list: [
            "**Partner checks before every climb:** harness buckles, the figure-of-eight knot finished and tied in correctly, the belay device and carabiner locked.",
            "**Helmets outdoors,** for the climber and the belayer. Rock and dropped gear fall.",
            "**Belaying is a skill.** Learn it from an instructor and practise catching falls before you belay anyone.",
            "**Spot and pad when bouldering.** Land on your feet, roll back, and keep wrists out of it.",
            "**Check the gear:** frayed ropes, old slings and worn harnesses get retired.",
          ] },
          { callout: "warn", title: "Heat and rock", text: "Granite in Hampi and the Deccan gets dangerously hot by late morning. Climb early and late, carry plenty of water, and watch for snakes and wasps in cracks." },
        ],
      },
      {
        id: "where",
        title: "Where to climb",
        blocks: [
          { list: [
            "**Hampi, Karnataka:** thousands of granite boulders among the temples. Pads for hire in the village.",
            "**Badami, Karnataka:** red sandstone with bolted sport routes.",
            "**Around Bengaluru:** Ramanagara, Savandurga and Turahalli, with active local climbing clubs.",
            "**The Sahyadris:** pinnacles near Pune and Mumbai, climbed by a strong local scene.",
            "**Manali and the Himalaya:** summer granite when the south is too hot.",
          ] },
        ],
      },
      {
        id: "progress",
        title: "Getting better",
        blocks: [
          { p: "Climbing at a gym two or three times a week builds finger strength and technique faster than anything else. Many cities now have walls. When you're ready to lead outdoors, take a course from a certified instructor or a national institute (several run rock-climbing courses) rather than learning from videos." },
        ],
      },
    ],
  },

  scrambling: {
    tldr: [
      "Scrambling is hands-on climbing without ropes for most of the way. A slip can be serious.",
      "Go in dry weather only: wet rock and monsoon moss are lethal.",
      "Wear grippy shoes and a helmet on loose ground.",
      "A good leader carries a rope for the hard or exposed steps, and uses it.",
      "Plan your descent before you go up: it's usually harder.",
    ],
    sections: [
      {
        id: "grades",
        title: "How hard is it?",
        blocks: [
          { table: { head: ["Level", "What it's like"], rows: [
            ["Easy", "Using your hands for balance on steep, rocky ground. Little exposure"],
            ["Moderate", "Proper handholds, a few awkward steps with a drop below"],
            ["Hard", "Short climbing moves over big drops. A rope for the crux is wise"],
          ] } },
          { p: "In the Sahyadris, fort routes range from steps cut into rock to near-vertical pinnacle climbs. Ask the leader which bits need a rope, and how they protect them." },
        ],
      },
      {
        id: "technique",
        title: "Technique",
        blocks: [
          { list: [
            "**Three points of contact:** move one hand or foot at a time.",
            "**Trust your feet:** keep your weight over them and your body away from the rock.",
            "**Test holds** before you pull, especially on loose basalt and old fort walls.",
            "**Face in on the way down** when it's steep. Going down facing out is how people slip.",
            "**Spread out on loose ground** so a dislodged rock doesn't hit the person below. Shout \"rock!\" if one falls.",
          ] },
        ],
      },
      {
        id: "when-not",
        title: "When not to go",
        blocks: [
          { p: "The monsoon turns the Sahyadris green and beautiful, and the rock slick and mossy. Most scrambling accidents happen on wet rock or when people get caught out by mist and dark. Go after the rains, start early, carry a headtorch, and turn back if the rock is wet." },
          { callout: "warn", title: "Exposure", text: "If a slip on a section would mean a fall you couldn't stop, it needs a rope or you need to turn back. Pressure from a group is never a reason to go on." },
        ],
      },
    ],
  },

  caving: {
    tldr: [
      "Never cave without a guide who knows the cave. Getting lost underground is easy.",
      "Carry three light sources: a headlamp, a spare and a backup.",
      "Caves can flood quickly after rain. Go in the dry season and check the forecast.",
      "Expect to get wet, muddy and cold: wear clothes you don't mind ruining.",
      "Don't touch formations; they take thousands of years to grow.",
    ],
    sections: [
      {
        id: "where",
        title: "India's caves",
        blocks: [
          { list: [
            "**Meghalaya:** limestone hills with India's longest known caves, including Krem Liat Prah and Krem Puri, explored by local and international caving teams. Some short caves near Cherrapunji (Mawsmai, Arwah) are easy show caves.",
            "**Belum Caves, Andhra Pradesh:** a long, lit show cave with walkways, good for a first visit.",
            "**Borra Caves, Andhra Pradesh:** large chambers in the Araku valley, also lit.",
          ] },
          { p: "Show caves have paths and lights. Wild caves have neither: they need a guide, a helmet and proper lights." },
        ],
      },
      {
        id: "safety",
        title: "Staying safe underground",
        blocks: [
          { list: [
            "**Lights:** a bright headlamp, a spare headlamp and fresh batteries for both, per person.",
            "**Helmet:** low ceilings come at you in the dark.",
            "**Tell someone outside** where you've gone and when you'll be out.",
            "**Water:** many caves have streams that rise fast after rain, even rain far away. Ask your guide about the cave's flood risk.",
            "**Squeezes:** never force a tight gap. Feet first going down; go back the way you came if unsure.",
            "**Cold:** caves stay cool and wet. Hypothermia can creep up on long trips.",
          ] },
          { callout: "warn", title: "Monsoon", text: "Meghalaya is one of the wettest places on earth. Its caves flood in the monsoon; caving trips run in the dry season, roughly November to March." },
        ],
      },
      {
        id: "wear",
        title: "What to wear and bring",
        blocks: [
          { list: [
            "Synthetic clothes, or a caving oversuit if the operator lends one. No cotton",
            "Boots or shoes with good grip that can get wet",
            "Gloves and knee pads for crawling",
            "Water, snacks and a small first-aid kit in a tough bag",
            "A dry change of clothes left outside",
          ] },
        ],
      },
      {
        id: "care",
        title: "Caring for caves",
        blocks: [
          { p: "Formations like stalactites grow a few millimetres a century, and skin oils stop them growing. Don't touch them, break them or take anything. Caves are home to bats and other life; keep noise down and lights off them." },
        ],
      },
    ],
  },

  motorcycling: {
    tldr: [
      "Go guided, with a support vehicle and mechanic, on your first trip to the high passes.",
      "Rent a bike suited to mountain roads, and check the brakes, tyres and chain yourself.",
      "Ride in daylight only, give way to traffic coming uphill, and horn on blind bends.",
      "Altitude sickness ends more rides than breakdowns: climb gradually.",
      "Full riding gear, every day: helmet, jacket, gloves, boots and rain gear.",
    ],
    sections: [
      {
        id: "routes",
        title: "The classic routes",
        blocks: [
          { table: { head: ["Route", "What it's like", "When"], rows: [
            ["Manali to Leh", "Four high passes, long empty stretches, river crossings. The big one", "June to September"],
            ["Srinagar to Leh", "Zoji La, Kargil and gentler acclimatisation", "June to October"],
            ["Spiti circuit", "Shimla, Kinnaur, Kaza and Kunzum La, with rough Lahaul stretches", "June to September (Kinnaur side much longer)"],
            ["Sikkim and Arunachal", "Green hills, monasteries, inner-line permits needed", "October to April"],
          ] } },
          { p: "For the high passes in detail (fuel, water crossings, spares and permits), read [Riding the high passes](/adventurepedia/riding-the-high-passes)." },
        ],
      },
      {
        id: "bike",
        title: "Choosing and renting a bike",
        blocks: [
          { list: [
            "**A 350 to 450 cc bike** with good ground clearance suits Himalayan roads. Small commuter bikes struggle on the high passes.",
            "**Rentals:** Manali, Leh and Delhi have many. Check the brakes, tyres, chain and lights, photograph existing damage, and get a written agreement.",
            "**Local rules:** some places restrict outside rental bikes, and rules change. Ask your rental shop or operator before you plan the route.",
            "**Papers:** your licence, the registration, insurance, pollution certificate and the rental agreement, in a waterproof pouch.",
          ] },
        ],
      },
      {
        id: "riding",
        title: "Riding mountain roads",
        blocks: [
          { list: [
            "**Uphill traffic has right of way** on narrow roads. Pull over to the safe side when you can.",
            "**Horn on blind bends,** and keep left. Trucks and army convoys take the full width; wait for them.",
            "**Daylight only.** Rockfall, livestock and potholes are invisible at night.",
            "**Slow down on gravel and slush** near the passes; brake gently and in a straight line.",
            "**Stop every hour or two.** Fatigue and cold cause more falls than bad roads.",
          ] },
          { callout: "warn", title: "Altitude", text: "You can climb 2,000 m in a morning on a bike. Spend nights at moderate height before the passes, rest in Leh or Kaza, and turn back at the first signs of altitude sickness. See [Altitude sickness](/adventurepedia/altitude-sickness)." },
        ],
      },
      {
        id: "guided-or-not",
        title: "Guided or on your own?",
        blocks: [
          { p: "A guided ride usually includes a road captain, a mechanic, a backup vehicle with luggage, fuel and oxygen, and booked stays. Riding on your own gives freedom but means planning fuel, stays, permits and breakdowns yourself, often with no signal. For a first trip to Ladakh or Spiti, guided is worth it." },
        ],
      },
    ],
  },

  cycling: {
    tldr: [
      "Train with long rides back to back, including climbs, for at least two months.",
      "A supported tour carries your luggage, water and spares, and can pick you up.",
      "In the high Himalaya, climb gradually and rest in Leh or Kaza before the big passes.",
      "Descents are cold: carry a windproof and full-finger gloves even in summer.",
      "Get a bike fit and service before you go, and know how to fix a puncture.",
    ],
    sections: [
      {
        id: "kinds",
        title: "Kinds of cycling trips",
        blocks: [
          { table: { head: ["Trip", "What it's like", "Where"], rows: [
            ["High-altitude road tour", "Long climbs over passes above 4,000 m, cold descents", "Manali to Leh, Spiti, Ladakh"],
            ["Ghat and hill tours", "Steep green climbs, tea and coffee country", "The Nilgiris, Coorg, the Western Ghats"],
            ["Coastal rides", "Flatter, hot and humid, beaches and fishing villages", "The Konkan, Goa, Kerala"],
            ["Mountain biking", "Trails and forest roads, more technical", "Around Manali, Shimla and the Ghats"],
          ] } },
        ],
      },
      {
        id: "training",
        title: "Training",
        blocks: [
          { list: [
            "Build up to riding 60 to 80 km on consecutive days, with real climbs.",
            "Ride the bike, saddle and shoes you'll tour with. Comfort matters more over a week than speed.",
            "Hill repeats or long climbs once a week, if you can find them. A turbo trainer helps in flat cities.",
            "Leg and core strength twice a week: squats, lunges and planks.",
          ] },
          { p: "See [Getting fit](/adventurepedia/getting-fit) for a weekly plan; swap the walking days for rides." },
        ],
      },
      {
        id: "high-roads",
        title: "Riding the high roads",
        blocks: [
          { list: [
            "**Acclimatise:** cycling climbs are slow, which helps, but sleeping height still matters. Follow the same rules as trekkers.",
            "**Wind:** afternoon headwinds in Ladakh and Spiti can halve your speed. Start early.",
            "**Water and food:** long gaps between dhabas. Carry more than you think.",
            "**Descents:** stop and add layers before a big descent. Hands and feet go numb fast.",
            "**Traffic:** trucks and taxis on narrow roads. Wear bright colours and a rear light.",
          ] },
          { p: "Read [Riding the high passes](/adventurepedia/riding-the-high-passes) for the route, permits and water crossings." },
        ],
      },
      {
        id: "kit",
        title: "Bike and kit",
        blocks: [
          { list: [
            "A full service before the trip: brakes, gears, chain, tyres",
            "Spare tubes, a patch kit, tyre levers, a pump, a multi-tool, chain links and brake pads",
            "Helmet, padded shorts, full-finger gloves, a windproof and a warm layer",
            "Sunglasses and SPF 50: the sun is fierce at height",
            "Lights front and back, for tunnels and early starts",
          ] },
        ],
      },
    ],
  },

  "jeep-safari": {
    tldr: [
      "Book park safaris through the official park booking, as early as you can.",
      "Morning drives are best for wildlife; dress warm in winter, the open jeep is cold.",
      "Sightings are never guaranteed, and a good guide never chases animals.",
      "Stay seated, keep quiet and don't litter or feed animals.",
      "Most core zones close in the monsoon, roughly July to September or October.",
    ],
    sections: [
      {
        id: "parks",
        title: "Where to go",
        blocks: [
          { table: { head: ["Park", "Known for", "Notes"], rows: [
            ["Jim Corbett, Uttarakhand", "Tigers, elephants, the Ramganga river", "Several zones; Dhikala needs an overnight booking"],
            ["Ranthambore, Rajasthan", "Tigers around old fort ruins", "Jeeps and larger canters"],
            ["Kanha and Bandhavgarh, Madhya Pradesh", "Tigers, barasingha, sal forests", "Among India's best for tigers"],
            ["Kaziranga, Assam", "One-horned rhinos, elephants, water birds", "Jeep and elephant zones"],
            ["Gir, Gujarat", "Asiatic lions, found nowhere else wild", "Permits for set routes"],
          ] } },
          { p: "Beyond the parks, jeep safaris also run in the Thar desert around Jaisalmer and through Spiti and Ladakh, where it's the landscape you've come for." },
        ],
      },
      {
        id: "booking",
        title: "Booking",
        blocks: [
          { list: [
            "**Book through the official park booking** or an operator who does it for you. Entry is by zone and slot, and popular parks sell out months ahead.",
            "**Carry the ID you booked with:** it's checked at the gate.",
            "**Morning or afternoon:** mornings are cooler and often better for sightings. Do more than one drive if you can.",
            "**Zones:** each park splits into zones with different chances and scenery. Ask locals which suit the season.",
          ] },
        ],
      },
      {
        id: "etiquette",
        title: "On the drive",
        blocks: [
          { list: [
            "Stay seated and inside the vehicle. Never get out unless the guide says it's a permitted stop.",
            "Keep your voice down and phone ringers off. Animals hear far better than you.",
            "Wear earthy colours, not bright ones, and skip the perfume.",
            "No feeding, no litter, no flash photography.",
            "Don't push your guide to drive closer or off-road. It's against the rules and stresses the animals.",
          ] },
          { callout: "tip", title: "What to bring", text: "A warm jacket, cap and scarf for winter mornings (open jeeps are freezing at 6 am), sunscreen and water for afternoons, binoculars, and a dust cover for your camera." },
        ],
      },
    ],
  },

  "urban-adventure": {
    tldr: [
      "Heritage walks, food trails, night cycle rides, climbing walls and city kayaking all count.",
      "Go early in the morning in summer, and in winter in the north.",
      "Small groups with a local guide get you into lanes and stories you'd miss alone.",
      "Wear comfortable shoes and carry water; Indian cities are hot most of the year.",
      "It's a good way to train for bigger adventures without leaving home.",
    ],
    sections: [
      {
        id: "ideas",
        title: "What you can do in a city",
        blocks: [
          { list: [
            "**Heritage walks:** Old Delhi, Mumbai's Fort and Bandra, Kolkata's north, Jaipur's walled city, Ahmedabad's pols.",
            "**Food trails:** guided tastings through markets and street-food lanes.",
            "**Night and dawn cycle rides:** empty roads, monuments lit up, a chai stop.",
            "**Climbing walls and bouldering gyms:** the best way into [rock climbing](/adventurepedia/activities/rock-climbing).",
            "**Water:** kayaking and stand-up paddling on lakes and creeks in some cities.",
            "**Day hikes nearby:** the forts outside Mumbai and Pune, the hills around Bengaluru.",
          ] },
        ],
      },
      {
        id: "tips",
        title: "Tips",
        blocks: [
          { list: [
            "Start early: the light is better and the heat is lower.",
            "Dress modestly for temples, mosques and gurudwaras, and carry a scarf.",
            "Carry water, a little cash and a charged phone.",
            "On night rides, wear a helmet and lights front and back.",
          ] },
          { p: "City adventures also make good training: a weekly walk or ride with a group keeps you fit for the next big trip." },
        ],
      },
    ],
  },
};
