// More Adventurepedia guides, written from what people search for and couldn't find: cold
// injuries, women's health and safety, families, wildlife, budgets and camp life. Same shape and
// rules as the guides in ./adventurepedia.ts, which spreads these into GUIDES.
import type { Guide } from "./adventurepedia";

export const EXTRA_GUIDES: Guide[] = [
  // ── Health & safety ─────────────────────────────────────────────────────────
  {
    slug: "cold-injuries",
    title: "Cold, hypothermia and frostbite",
    short: "Cold & frostbite",
    summary: "How the cold catches people out in the mountains, the signs of hypothermia and frostbite, and what to do before help arrives.",
    topic: "health",
    icon: "emergency",
    tldr: [
      "Wet and wind chill you far faster than cold air alone. Stay dry and block the wind.",
      "Hypothermia starts with shivering and clumsiness, then confusion. Warm the person gently and get help.",
      "Frostbite shows as numb, white or waxy skin. Never rub it, and don't rewarm it if it might freeze again.",
      "Eat, drink and keep moving: your body makes heat from food.",
      "Winter treks and summit nights need layers rated for -10 to -15°C.",
    ],
    sections: [
      {
        id: "how",
        title: "How the cold gets you",
        blocks: [
          { p: "You lose heat fastest when you're **wet** (sweat, rain, a stream), in **wind**, sitting on **snow or rock**, or when you're **tired, hungry or dehydrated** and your body stops making enough heat. Most cold injuries in the Indian Himalaya happen on winter snow treks, summit pushes before dawn and long waits in the wind." },
          { list: [
            "Change out of sweaty base layers when you reach camp.",
            "Put on a warm layer the moment you stop, before you feel cold.",
            "Sit on your pack or a foam pad, not on snow.",
            "Keep gloves, socks and a beanie dry in a waterproof bag, with a spare pair.",
            "Eat something every hour or two on cold days, and drink warm water.",
          ] },
        ],
      },
      {
        id: "hypothermia",
        title: "Hypothermia",
        blocks: [
          { table: { head: ["Stage", "Signs", "What to do"], rows: [
            ["Mild", "Shivering, cold hands, fumbling with zips, quiet or grumpy", "Shelter from wind, dry layers, a hat, warm sweet drinks and food, gentle exercise"],
            ["Moderate", "Violent shivering or shivering that stops, stumbling, slurred speech, confusion", "All of the above, lying insulated from the ground, wrapped in a sleeping bag, warm bottles at the chest and armpits. Get help"],
            ["Severe", "Not shivering, very drowsy or unconscious", "Emergency. Handle very gently, keep lying flat, insulate and wrap, and evacuate"],
          ] } },
          { callout: "warn", title: "The \"umbles\"", text: "Stumbles, mumbles, fumbles and grumbles: someone who goes quiet, clumsy and irritable in the cold may be hypothermic, not just tired. Tell the leader early." },
        ],
      },
      {
        id: "frostbite",
        title: "Frostbite",
        blocks: [
          { p: "Frostbite is frozen skin and tissue, usually fingers, toes, nose, ears and cheeks. It starts as **frostnip**: cold, numb, pale skin that recovers fully once warmed. Real frostbite stays hard, white, grey or waxy, and can blister or blacken over the following days." },
          { steps: [
            "**Frostnip:** warm the skin against warm skin (a hand, an armpit, a partner's stomach) until feeling returns.",
            "**Frostbite:** get out of the cold. Don't walk on frostbitten feet if you can avoid it, and don't rewarm them if there's any chance they'll freeze again on the way down.",
            "**Rewarming,** once it's safe: soak in water that's warm to a healthy hand (around 37 to 39°C) for 15 to 30 minutes. It will hurt; ibuprofen helps.",
            "**Never rub it,** with snow or anything else, and never hold it to a stove or fire: numb skin burns easily.",
            "**Leave blisters alone,** cover loosely with dry dressings, and get medical care.",
          ] },
        ],
      },
      {
        id: "prevent",
        title: "Staying warm on summit nights",
        blocks: [
          { list: [
            "**Layers rated for the coldest hour,** usually just before dawn. See [What to pack](/adventurepedia/what-to-pack).",
            "**Mitts over liner gloves** for summit pushes; fingers stay warmer together.",
            "**Loose boots:** tight laces cut circulation. Wear one good pair of socks, not three.",
            "**Hand and toe warmers** are worth carrying on winter treks.",
            "**Wiggle your toes and fingers,** and check each other's faces for white patches.",
          ] },
        ],
      },
    ],
    related: ["what-to-pack", "altitude-sickness", "insurance-and-emergencies"],
    appliesTo: ["Trekking", "Mountaineering"],
    sources: [{ label: "High-altitude travel and altitude illness — CDC Yellow Book", url: "https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html" }],
  },
  {
    slug: "women-on-treks",
    title: "Women on treks: health, periods and safety",
    short: "Women on treks",
    summary: "Periods and toilets on the trail, contraception and altitude, UTIs, going solo or in a women's group, and choosing an operator you feel safe with.",
    topic: "health",
    icon: "trail",
    tldr: [
      "Periods may come early, late or heavier at altitude. Pack more supplies than you expect.",
      "Carry used pads and tampons out in a sealed, opaque bag. A menstrual cup means less to carry.",
      "Drink well and don't hold it in: UTIs are common on treks.",
      "Talk to a doctor about hormonal contraception before a high trek; some types raise clot risk.",
      "Many operators run women-only groups and have women leaders. Ask about tent sharing too.",
    ],
    sections: [
      {
        id: "periods",
        title: "Periods on the trail",
        blocks: [
          { p: "Travel, cold, effort and altitude can all shift your cycle, so a trek is a good time to be over-prepared. Pack a few days' more supplies than usual, pain relief you know works for you, and wipes." },
          { table: { head: ["Option", "On the trail"], rows: [
            ["Menstrual cup", "Lasts up to 12 hours, nothing to carry out. Clean hands are the challenge: use sanitiser and treated water, and boil it at camp if you can"],
            ["Tampons", "Light and compact. Pack them out; they don't break down in the cold"],
            ["Pads and period underwear", "Familiar and easy. Bulkier to carry out"],
          ] } },
          { callout: "tip", title: "A discreet kit", text: "Keep a small pouch with supplies, wipes, sanitiser and an opaque zip bag in your daypack. Toilet tents at camp help; on the trail, step well away from the path and water, as in [Leave no trace](/adventurepedia/leave-no-trace)." },
        ],
      },
      {
        id: "health",
        title: "Health at altitude",
        blocks: [
          { list: [
            "**Hormonal contraception:** combined pills slightly raise the risk of blood clots, and long stays very high, dehydration and immobility add to it. Talk to your doctor before a high trek; some people switch method or carry on with care.",
            "**Skipping a period:** some people use their pill to skip a bleed during a trek. Ask your doctor whether that suits you.",
            "**Urinary infections:** drink 3 to 4 litres a day, pee when you need to, and wipe front to back. Ask your doctor about carrying a course of treatment for remote treks.",
            "**Pregnancy:** most doctors advise against sleeping above about 3,000 m while pregnant, and against remote treks far from care. Talk to yours.",
            "**Iron:** low iron makes altitude harder. If you're often anaemic, get it checked weeks before you go.",
          ] },
        ],
      },
      {
        id: "toilets",
        title: "Toilets",
        blocks: [
          { p: "Camps usually have a toilet tent over a dug pit. On the trail there's rarely anything. A pee funnel (a reusable silicone one) means you can go without undressing in the cold or wind. A long jacket or a wrap helps for privacy above the tree line, and so does going with a friend who keeps watch." },
        ],
      },
      {
        id: "safety",
        title: "Safety, going solo and choosing a group",
        blocks: [
          { list: [
            "**Women-only departures** and women trek leaders are offered by a growing number of operators. Ask.",
            "**Tent sharing:** check whether you'll share with another woman, or can pay for a tent of your own.",
            "**Solo:** joining a fixed-departure group is the easiest and safest way to trek on your own. Share your itinerary and the operator's number with someone at home.",
            "**Reviews:** read what women have said about an operator, and ask the operator how they handle complaints.",
            "**Trust your instincts.** You're entitled to raise anything that makes you uncomfortable with the leader or operator, at any time.",
          ] },
        ],
      },
    ],
    related: ["first-aid-and-water", "choosing-an-operator", "camp-life"],
    appliesTo: ["Trekking"],
  },

  // ── Plan & prepare ──────────────────────────────────────────────────────────
  {
    slug: "families-and-older-trekkers",
    title: "Treks with children and older trekkers",
    short: "Children & older trekkers",
    summary: "Choosing a trek for children, spotting altitude sickness in kids who can't describe it, and trekking well in your sixties and beyond.",
    topic: "plan",
    icon: "fitness",
    tldr: [
      "Pick short treks with modest sleeping heights for children: below about 3,000 m for young kids.",
      "Children can't always say they feel unwell. Fussiness, poor sleep, vomiting or not eating at altitude mean stop climbing.",
      "Many operators set minimum ages for camping treks; ask before you book.",
      "Older trekkers do well with a slower pace, poles, a health check and a private or slower group.",
      "Insurance often has age limits. Check yours covers you at your age and height.",
    ],
    sections: [
      {
        id: "children",
        title: "Choosing a trek for children",
        blocks: [
          { list: [
            "**Short days:** 3 to 5 hours of walking, with plenty of stops and something interesting along the way.",
            "**Modest height:** for young children, keep sleeping heights low, below about 3,000 m, and climb slowly.",
            "**Easy exits:** a trail with villages or a road nearby makes it easy to turn back.",
            "**Season:** spring and autumn. Avoid winter snow treks with small children.",
            "**Operator:** ask about minimum ages, private departures and whether they've led family groups before.",
          ] },
          { p: "Good first family treks include day hikes and one or two-night treks such as [Triund](/adventurepedia/treks/triund), [Deoriatal and Chandrashila](/adventurepedia/treks/deoriatal-chandrashila) for older children, and village walks in Uttarakhand and Sikkim." },
        ],
      },
      {
        id: "kids-altitude",
        title: "Altitude sickness in children",
        blocks: [
          { p: "Children get altitude sickness about as often as adults, but young ones can't explain it. Watch for:" },
          { list: [
            "Unusual fussiness, crying or clinginess",
            "Not eating, not playing, or not sleeping",
            "Vomiting or unusual tiredness",
          ] },
          { callout: "warn", title: "Assume it's the altitude", text: "If a child seems unwell at altitude, don't go higher. If they get worse, go down. The rules in [Altitude sickness](/adventurepedia/altitude-sickness) apply to children too, and they need you to make the call." },
        ],
      },
      {
        id: "packing-kids",
        title: "Keeping children happy and warm",
        blocks: [
          { list: [
            "Layers like an adult's, plus spares: children get wet and cold faster.",
            "A sun hat, sunglasses and SPF 50: their skin burns quickly at altitude.",
            "Favourite snacks, and lots of them.",
            "A small pack of their own with a water bottle, to feel part of it.",
            "Games for camp, a headtorch of their own, and a cosy sleeping bag liner.",
          ] },
        ],
      },
      {
        id: "older",
        title: "Trekking in your sixties and beyond",
        blocks: [
          { list: [
            "**See a doctor** before a high trek, especially with heart, lung or blood pressure conditions, and take enough of your medicines for the trip plus spares.",
            "**Trekking poles** take a lot of strain off knees on descents.",
            "**Train for longer** (10 to 12 weeks) and focus on stairs, balance and leg strength. See [Getting fit](/adventurepedia/getting-fit).",
            "**Choose the pace:** a private trek or an operator's slower group lets you walk at your speed, with extra rest days.",
            "**Offload your bag** to a mule or porter, and carry only a light daypack.",
            "**Check insurance age limits,** which often start at 60 or 65.",
          ] },
        ],
      },
    ],
    related: ["altitude-sickness", "getting-fit", "choosing-an-operator"],
    appliesTo: ["Trekking"],
  },
  {
    slug: "budgeting",
    title: "What an adventure costs, and how to budget",
    short: "Budgeting",
    summary: "Everything a trek or adventure really costs beyond the package price, the hidden extras, and honest ways to spend less without cutting safety.",
    topic: "plan",
    icon: "permit",
    tldr: [
      "The package price is only part of it: travel, offloading, gear, insurance and spare days add up.",
      "Read the inclusions line by line. The cheapest listing often leaves the most out.",
      "Save on travel, gear rental and timing, never on the leader, safety kit or itinerary.",
      "Check the cancellation and refund terms before you pay.",
      "Trek guides on Trail to Tides show the operators' current price range for each trek.",
    ],
    sections: [
      {
        id: "breakdown",
        title: "Where the money goes",
        blocks: [
          { table: { head: ["Cost", "Notes"], rows: [
            ["The package", "Guides, meals, tents and permits on the trek itself. See what's included on each listing"],
            ["Travel to the gateway", "Trains and buses are cheapest; flights save a day each way"],
            ["Roadhead transport", "Sometimes included, often a shared taxi from the gateway town"],
            ["Stays before and after", "A night at the gateway town on each side, and a buffer night for delays"],
            ["Offloading", "A mule or porter for your main bag, usually charged per day"],
            ["Gear", "Buy, borrow or rent. Shoes are worth buying; down jackets and poles can be rented"],
            ["Insurance", "Adventure cover that names your activity and height"],
            ["Tips and extras", "Tips for the trek team, snacks, charging and hot water at lodges"],
          ] } },
        ],
      },
      {
        id: "compare",
        title: "Comparing prices fairly",
        blocks: [
          { list: [
            "**Same trek, same days?** A shorter itinerary looks cheaper but may skip acclimatisation.",
            "**From where to where?** Some prices start at the roadhead, others at the gateway town.",
            "**Tax:** check whether GST is included or added at checkout.",
            "**Group size and ratio:** a big group with one guide is cheaper for a reason.",
            "**What happens if it's cut short:** refund, credit or nothing.",
          ] },
          { p: "Every trek's \"Where to book\" section compares operators side by side, and [How to choose an operator](/adventurepedia/choosing-an-operator) lists the questions that matter more than price." },
        ],
      },
      {
        id: "save",
        title: "Spending less, safely",
        blocks: [
          { list: [
            "**Travel overnight** by train or bus to save a hotel night.",
            "**Go just outside peak weeks:** early in the season or after the holiday rush.",
            "**Join a fixed-departure group** rather than a private trek.",
            "**Rent the expensive gear** for a first trek, and buy only shoes and base layers.",
            "**Book early** for popular treks and festivals, when seats and prices are easier.",
          ] },
          { callout: "warn", title: "Never save on these", text: "A trained leader, a sensible itinerary with time to acclimatise, safety kit (oxygen and first aid on high treks), warm enough gear, and insurance. They're what you're paying for." },
        ],
      },
    ],
    related: ["choosing-an-operator", "what-to-pack", "insurance-and-emergencies"],
  },

  // ── On the trail ────────────────────────────────────────────────────────────
  {
    slug: "wildlife-on-the-trail",
    title: "Wildlife on the trail: dogs, leeches, snakes and bears",
    short: "Wildlife on the trail",
    summary: "Village dogs and rabies, monsoon leeches, snakes in the lower forests, bears, monkeys and pack animals: how to avoid trouble and what to do if it finds you.",
    topic: "trail",
    icon: "leaf",
    tldr: [
      "Any bite or scratch from a dog or other mammal: wash it with soap and water for 15 minutes and get rabies shots urgently.",
      "Leeches are harmless but bleed. Flick them off sideways; don't pull or burn them.",
      "Snakebite: keep calm and still, remove rings, and get to a hospital. No tourniquets, cutting or sucking.",
      "Make noise in bear country and never leave food out.",
      "When mules or yaks pass, stand on the uphill side of the trail.",
    ],
    sections: [
      {
        id: "dogs",
        title: "Dogs and rabies",
        blocks: [
          { p: "Village dogs often follow trekking groups for days, and most are friendly. But India has a high rate of rabies, which is almost always fatal once symptoms start, and entirely preventable with prompt treatment." },
          { steps: [
            "**Don't feed, pet or provoke** dogs, monkeys or other animals.",
            "**If you're bitten, scratched or licked on broken skin,** wash the wound with soap and running water for 15 minutes.",
            "**Get post-exposure rabies treatment** at a hospital as soon as possible, even if you were vaccinated before.",
            "**Consider pre-exposure vaccination** before long or remote trips, where the nearest hospital is days away. Ask your doctor.",
          ] },
        ],
      },
      {
        id: "leeches",
        title: "Leeches and ticks",
        blocks: [
          { p: "In the monsoon and just after it, leeches live in the wet forests of Sikkim, the Western Ghats, Uttarakhand's lower valleys and the Northeast. They're harmless but unpleasant, and the bite bleeds for a while." },
          { list: [
            "Wear leech socks or tuck trousers into socks, and check your feet and legs at every stop.",
            "To remove one, slide a fingernail under the sucker at the thin end and flick it off. Don't pull, burn or salt it while it's attached.",
            "Clean the bite and cover it; the bleeding stops on its own.",
            "**Ticks** in grassy meadows: check your skin each evening, and remove any by gripping close to the skin with tweezers and pulling steadily.",
          ] },
        ],
      },
      {
        id: "snakes",
        title: "Snakes",
        blocks: [
          { p: "Snakes are rare above about 3,000 m but common in the lower forests, the Western Ghats and the plains in warm months. Most bites in India are from four species: the common krait, Russell's viper, the saw-scaled viper and the spectacled cobra." },
          { list: [
            "Watch where you step and put your hands, especially on rocky paths and in long grass.",
            "Use a torch at night, and shake out boots and sleeping bags.",
            "Never try to catch or kill a snake.",
          ] },
          { callout: "warn", title: "If someone is bitten", text: "Keep them calm and still, lying down, with the bitten limb at rest. Remove rings, watches and tight clothing. Get them to a hospital with antivenom as fast as possible. Don't use a tourniquet, cut the wound, suck it, or apply ice or herbs." },
        ],
      },
      {
        id: "bigger",
        title: "Bears, monkeys and pack animals",
        blocks: [
          { list: [
            "**Himalayan black bears** live in the forests of Kashmir, Himachal, Uttarakhand and the Northeast. Talk and make noise on forest trails, keep food sealed and away from tents, and never approach cubs. If you meet one, back away slowly; don't run.",
            "**Monkeys** near temples and roads snatch food and bags. Keep snacks out of sight and don't feed them.",
            "**Mules, horses and yaks** have right of way. Step to the uphill side of the trail and wait; on the outer edge, a passing load can knock you off.",
            "**Wild animals in parks and sanctuaries:** watch from a distance and follow your guide.",
          ] },
        ],
      },
    ],
    related: ["first-aid-and-water", "trail-craft", "insurance-and-emergencies"],
    appliesTo: ["Trekking"],
    sources: [
      { label: "Rabies — World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/rabies" },
      { label: "Rabies — CDC Yellow Book", url: "https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/rabies.html" },
      { label: "Snakebite envenoming — World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/snakebite-envenoming" },
    ],
  },
  {
    slug: "camp-life",
    title: "Camp life: tents, food, toilets and sleeping warm",
    short: "Camp life",
    summary: "What a night in a trekking camp is really like: tents and toilets, the food (vegetarian and otherwise), staying clean, charging your phone, sleeping warm and tipping the team.",
    topic: "trail",
    icon: "pack",
    tldr: [
      "Expect 2 or 3 people to a tent, a dining tent for meals and a toilet tent over a pit.",
      "Food on most Himalayan treks is hearty, home-style and vegetarian. Tell the operator about any diet in advance.",
      "Sleep warm: dry base layer, beanie, warm socks, a snack before bed, and a hot water bottle.",
      "There's usually no charging at camp. Bring a power bank and keep it warm.",
      "Tipping the kitchen and support team is customary; give it to the leader to share.",
    ],
    sections: [
      {
        id: "camp",
        title: "A day in camp",
        blocks: [
          { p: "You reach camp in the early afternoon, usually to tea and a snack. There's time to rest, change into dry clothes and explore. Dinner is early, around 7, followed by a briefing for tomorrow and an early night. Mornings start with bed tea at your tent around 6." },
          { list: [
            "**Tents:** two or three to a tent, with mats. Ask if you'd like to share with friends or pay for a tent of your own.",
            "**Dining tent:** where meals and briefings happen, often with a table and stools.",
            "**Toilet tent:** a small tent over a dug pit. Add soil or ash after use if asked, and pack used paper into the bin provided.",
          ] },
        ],
      },
      {
        id: "food",
        title: "Food",
        blocks: [
          { p: "Most trekking kitchens in the Indian Himalaya serve vegetarian food: dal, rice, rotis, sabzi, pasta, khichdi, porridge, and soup on arrival. Many add eggs at breakfast. It's fresh, hot and filling." },
          { list: [
            "**Jain, vegan, gluten-free or allergies:** tell the operator when you book, and remind the leader on day one.",
            "**Eat even when you're not hungry.** Appetite drops at altitude, but your body needs the fuel.",
            "**Bring snacks you love** for the trail: nuts, dried fruit, chikki, chocolate, bars.",
            "**Wash or sanitise your hands** before every meal. See [Water, food and first aid](/adventurepedia/first-aid-and-water).",
          ] },
        ],
      },
      {
        id: "clean",
        title: "Staying clean",
        blocks: [
          { p: "There are no showers on most camping treks. Wet wipes, a small towel and a bowl of warm water from the kitchen go a long way. Brush your teeth away from streams and spit into a hole or the toilet tent. Pack used wipes out; they don't break down." },
        ],
      },
      {
        id: "sleep",
        title: "Sleeping warm",
        blocks: [
          { list: [
            "**Change into a dry base layer** before bed. Never sleep in the clothes you walked in.",
            "**Beanie and dry socks** kept only for sleeping.",
            "**A hot water bottle** (a sealed bottle of hot water from the kitchen) in your sleeping bag.",
            "**Eat a snack and empty your bladder** before you zip up.",
            "**Sleeping bag rating:** check it's rated to at least the trek's coldest night. A liner adds warmth.",
            "**Earplugs** help with wind, rivers and tent mates.",
          ] },
        ],
      },
      {
        id: "phones-tips",
        title: "Phones, power and tipping",
        blocks: [
          { list: [
            "Expect no signal and no charging at most camps. Carry a 10,000 to 20,000 mAh power bank and keep it in your sleeping bag at night.",
            "Airplane mode saves battery, and your GPS still works: see [Take your trek offline](/adventurepedia/offline-maps).",
            "**Tipping:** the cooks, helpers and mule handlers work hard. It's customary to tip at the end; pool it as a group and hand it to the leader to share fairly.",
          ] },
        ],
      },
    ],
    related: ["what-to-pack", "leave-no-trace", "first-aid-and-water"],
    appliesTo: ["Trekking"],
  },
];
