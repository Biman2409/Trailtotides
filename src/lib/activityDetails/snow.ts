// Full guides for the snow adventures. See ./index.ts for how they're used.
import type { Block, GuideSection } from "@/lib/adventurepedia";
import type { ActivityDetail } from "./types";

/** Shared by skiing, snowboarding and ice climbing: the cold is the real hazard */
const COLD: GuideSection = {
  id: "cold",
  title: "Cold, sun and altitude",
  blocks: [
    { list: [
      "**Frostbite** starts as numb, white or waxy skin on fingers, toes, nose and ears. Warm the area gently against skin (an armpit or a partner's stomach); never rub it or hold it to a fire. Get it checked.",
      "**Hypothermia** shows as uncontrollable shivering, clumsiness and confusion. Get the person out of the wind, into dry layers, and give warm, sweet drinks. It's an emergency if the shivering stops but they're still cold.",
      "**Sun:** snow reflects most of the UV back up. Category 3 or 4 goggles or sunglasses, and SPF 50 on every bit of exposed skin.",
      "**Altitude:** Gulmarg's gondola tops out near 4,000 m. Take it easy on your first day up there. See [Altitude sickness](/adventurepedia/altitude-sickness).",
    ] },
  ],
};

const AVALANCHE: Block = {
  callout: "warn",
  title: "Avalanches",
  text: "Off the patrolled slopes, avalanches kill skiers and snowboarders in Kashmir and Himachal most winters. Go off-piste only with a qualified guide, an avalanche beacon, probe and shovel, and training in using them. Check the local avalanche warnings and listen to the ski patrol.",
};

export const SNOW: Record<string, ActivityDetail> = {
  skiing: {
    tldr: [
      "Gulmarg is India's big ski area; Auli, Solang and Narkanda suit beginners.",
      "Take a week of lessons with a certified instructor: courses run at Gulmarg and Auli.",
      "The season is roughly January to March, and it depends entirely on the snow.",
      "Rent skis, boots and a helmet that fit. Boots that hurt ruin the week.",
      "Off-piste needs a guide and avalanche gear. Gulmarg's backcountry is serious terrain.",
    ],
    sections: [
      {
        id: "where",
        title: "Where to ski",
        blocks: [
          { table: { head: ["Resort", "What it's like"], rows: [
            ["Gulmarg, Kashmir", "India's main ski area. A two-stage gondola rises to about 4,000 m on Apharwat, with famous off-piste. Beginner slopes and chairlifts near the village"],
            ["Auli, Uttarakhand", "Wide, gentle slopes above Joshimath with views of Nanda Devi, a chairlift and a ropeway from Joshimath when it's running"],
            ["Solang, Himachal Pradesh", "Near Manali, small slopes and lessons, busy with day visitors"],
            ["Narkanda, Himachal Pradesh", "Small slopes near Shimla, beginner lessons when the snow is good"],
          ] } },
          { p: "Snow varies a lot from year to year. Check recent conditions before you book, and keep your dates flexible if you can." },
        ],
      },
      {
        id: "learning",
        title: "Learning to ski",
        blocks: [
          { steps: [
            "**Gear and balance:** walking in boots, clicking into skis, sliding on the flat.",
            "**The snowplough (wedge):** tips together to slow down and stop. Your first real skill.",
            "**Turning** in a snowplough, then linking turns down a gentle slope.",
            "**Parallel turns** with skis together, usually after a week or more of lessons.",
          ] },
          { p: "Courses run by the Indian Institute of Skiing and Mountaineering (Gulmarg), the Jawahar Institute (Pahalgam, with skiing at Gulmarg), the mountaineering institute in Manali and Uttarakhand's tourism agency at Auli are good value and fill early. Private instructors are easy to find at Gulmarg; ask to see their certification." },
        ],
      },
      {
        id: "safety",
        title: "On the slopes",
        blocks: [
          { list: [
            "**The skier below you has right of way.** Look uphill before you set off or join a slope.",
            "**Stop at the side** of the slope where people above can see you.",
            "**Wear a helmet.** Rent one with your skis.",
            "**Ski within your level,** especially late in the day when legs are tired and light goes flat.",
          ] },
          AVALANCHE,
        ],
      },
      COLD,
    ],
  },

  snowboarding: {
    tldr: [
      "Learn from an instructor who teaches snowboarding, not just skiing.",
      "The first two days are mostly falling: wear wrist guards and padded shorts.",
      "Gulmarg, Solang and Auli have lessons and rental boards, January to March.",
      "Find out if you ride regular (left foot forward) or goofy before you rent.",
      "Off-piste needs a guide and avalanche gear, the same as skiing.",
    ],
    sections: [
      {
        id: "learning",
        title: "Learning to snowboard",
        blocks: [
          { steps: [
            "**Stance:** regular (left foot forward) or goofy (right foot forward). Your instructor will help you find it.",
            "**Skating and gliding** with one foot strapped in, on the flat.",
            "**The falling leaf:** sliding down a gentle slope on one edge, side to side.",
            "**Linking turns** from heel edge to toe edge. The breakthrough usually comes on day three or four.",
          ] },
          { p: "Snowboarding is harder than skiing for the first few days and often easier after that. Book at least three days of lessons." },
        ],
      },
      {
        id: "falls",
        title: "Falling well",
        blocks: [
          { list: [
            "**Wrist injuries are the most common.** Wear wrist guards, and try to fall on your forearms with fists closed, not on outstretched hands.",
            "**Falling backwards:** tuck your chin and sit down on your bum, then roll onto your back.",
            "**Falling forwards:** drop to your knees, then forearms.",
            "**Helmet and padded shorts** make the first days much less painful.",
          ] },
        ],
      },
      {
        id: "where",
        title: "Where to ride",
        blocks: [
          { p: "Gulmarg has the best terrain and the most instructors, with real off-piste for experienced riders. Solang and Auli have gentler slopes for learning. Rent a board and soft boots locally; check the bindings are set for your stance." },
          AVALANCHE,
        ],
      },
      COLD,
    ],
  },

  "ice-climbing": {
    tldr: [
      "Start on a course or camp with experienced instructors, always on top-rope at first.",
      "The ice is only good in mid-winter, roughly January and February.",
      "Falling ice is the main hazard: helmets on, and belayers stand out of the fall line.",
      "Crampons and axes are sharp: most injuries are self-inflicted cuts and twisted ankles.",
      "Pack for -20°C: insulated boots, several pairs of gloves, and a down jacket for belaying.",
    ],
    sections: [
      {
        id: "where",
        title: "Where to climb",
        blocks: [
          { p: "Frozen waterfalls in **Spiti**, **Ladakh** and **Kashmir** form in the coldest weeks of winter. Spiti has run winter ice-climbing festivals and courses for local and visiting climbers in recent years, and the mountaineering institutes run winter courses. Expect simple homestays, short days and nights far below freezing." },
        ],
      },
      {
        id: "technique",
        title: "Technique",
        blocks: [
          { list: [
            "**Front-pointing:** kick the front points of your crampons into the ice, heels low, and stand on them.",
            "**Axe placement:** a relaxed swing from the elbow. One good placement beats three bad ones.",
            "**Climb with your legs:** keep your arms straight and push up with your feet to save your grip.",
            "**Read the ice:** blue, plastic ice takes placements well; white, brittle or hollow-sounding ice breaks.",
          ] },
        ],
      },
      {
        id: "safety",
        title: "Safety",
        blocks: [
          { list: [
            "**Helmets** for everyone at the base as well as on the climb. Ice falls constantly.",
            "**Belayers stand to the side,** never directly under the climber.",
            "**Check the ice** with your instructor: warm days, sun on the fall and running water behind it mean it may not be safe.",
            "**Keep crampons off ropes and legs:** a wide stance stops you snagging your own trousers.",
          ] },
          { callout: "warn", title: "Avalanche terrain", text: "Many frozen falls sit in gullies that collect avalanches from slopes above. Instructors should check the snowpack above the climb, not just the ice." },
        ],
      },
      COLD,
    ],
  },

  "ice-skating": {
    tldr: [
      "Shimla's open-air rink has been running since the 1920s; it freezes roughly December to February.",
      "In Ladakh and Kashmir, people skate and play ice hockey on frozen ponds in mid-winter.",
      "Never go onto natural ice unless locals say it's safe: it should be at least 10 to 15 cm of clear ice.",
      "Rent skates that fit snugly, with ankle support, and tie them tight.",
      "Wear gloves even if it isn't that cold: hands hit the ice when you fall.",
    ],
    sections: [
      {
        id: "where",
        title: "Where to skate",
        blocks: [
          { list: [
            "**Shimla Ice Skating Rink:** a natural rink below the Mall, run by a local club. Sessions are early morning and evening, when the ice holds, and depend on cold, clear nights.",
            "**Ladakh:** frozen ponds around Leh become rinks in January and February. Ice hockey is a huge local winter sport, and you can watch matches or join a beginner session.",
            "**Kashmir:** skating on frozen ponds in Gulmarg and around Srinagar in the coldest weeks.",
            "**Indoor rinks** in a few big cities, for practice any time of year.",
          ] },
        ],
      },
      {
        id: "first-time",
        title: "Your first time",
        blocks: [
          { steps: [
            "**Lace skates tight** around the ankle. Loose skates make it much harder.",
            "**Knees bent, weight forward,** arms out for balance. Leaning back is how you fall.",
            "**Small steps,** like a penguin, then push out to the side and glide.",
            "**To stop,** push your heels out and toes together (a snowplough) and scrape.",
            "**Falling:** bend your knees and drop to the side. Get up via your knees, one foot at a time.",
          ] },
        ],
      },
      {
        id: "natural-ice",
        title: "Natural ice safety",
        blocks: [
          { callout: "warn", title: "Thin ice", text: "Ice on lakes and ponds varies in thickness, especially near inlets, outlets, reeds and anywhere with moving water. Skate only where locals skate, after they say it's safe, and never alone. Clear, blue ice is strongest; white, grey or slushy ice is weak." },
          { p: "If someone falls through, don't run to them. Lie flat to spread your weight, reach with a stick, rope or scarf, and pull them out flat, then get them warm and dry fast." },
        ],
      },
    ],
  },
};
