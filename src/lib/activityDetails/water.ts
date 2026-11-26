// Full guides for the water adventures. See ./index.ts for how they're used.
import type { ActivityDetail } from "./types";

export const WATER: Record<string, ActivityDetail> = {
  "river-rafting": {
    tldr: [
      "Rapids are graded I (gentle) to VI (unrunnable). Most commercial trips are II to IV.",
      "Wear the life jacket and helmet properly, even if you can swim.",
      "If you fall in: on your back, feet up and pointing downstream, then swim to the raft.",
      "Listen to the guide's commands; paddling together is what keeps the raft upright.",
      "Rishikesh stops for the monsoon, when dam-fed rivers like Kolad and Ladakh's rivers are running.",
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
          { p: "Grades change with water levels: the same rapid can go up a grade after rain or in the snowmelt season." },
        ],
      },
      {
        id: "rivers",
        title: "India's rafting rivers",
        blocks: [
          { table: { head: ["River", "Grade", "When"], rows: [
            ["Ganga, Rishikesh", "II to IV, depending on the stretch. Shivpuri to Rishikesh (about 16 km) is the classic first run", "Roughly September to June. Stops in the monsoon"],
            ["Kundalika, Kolad (Maharashtra)", "II to III, fed by dam releases", "Best in the monsoon, when releases are biggest"],
            ["Kali, Dandeli (Karnataka)", "II to III", "Most of the year outside heavy rains"],
            ["Barapole, Coorg (Karnataka)", "III to IV", "The monsoon months"],
            ["Indus and Zanskar, Ladakh", "II to III on the Indus; III to IV on the Zanskar, including multi-day trips", "Summer, roughly June to September"],
            ["Teesta, Sikkim", "II to IV", "Outside the monsoon"],
          ] } },
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
          { p: "Himalayan rivers are snowmelt and cold even in summer. On longer trips, operators lend wetsuits or splash jackets; ask." },
        ],
      },
    ],
  },

  kayaking: {
    tldr: [
      "Start on flat water or the sea with an instructor before any white water.",
      "Learn the wet exit (getting out upside down) on day one; a roll comes later.",
      "Always wear a life jacket, and a helmet on rivers.",
      "Never paddle alone on moving water. Fallen trees (strainers) are the deadliest hazard.",
      "Sea and backwater kayaking need no white-water skills at all.",
    ],
    sections: [
      {
        id: "kinds",
        title: "Kinds of kayaking",
        blocks: [
          { table: { head: ["Kind", "What it's like", "Where"], rows: [
            ["Flat water and backwaters", "Calm lakes, lagoons and canals. Easy and relaxing", "Kerala's backwaters, Goa's rivers, city lakes"],
            ["Sea kayaking", "Coastlines, mangroves and islands, in a longer, stable boat", "The Andamans, Goa, Karnataka's coast"],
            ["White water", "Short, nimble boats through rapids. A skill sport", "Rishikesh, the rivers of Kerala's Malabar, Ghat rivers in the rains"],
          ] } },
          { p: "Kerala's Malabar River Festival, held on Ghat rivers in the monsoon, draws white-water kayakers from around the world." },
        ],
      },
      {
        id: "learning",
        title: "Learning",
        blocks: [
          { steps: [
            "**Flat-water session:** holding the paddle, the forward stroke, turning and stopping.",
            "**Wet exit:** capsizing on purpose and getting out calmly. It's the first safety skill on any course.",
            "**River basics:** reading water, eddies (calm spots behind rocks), ferrying across current.",
            "**The roll:** righting the kayak without getting out. Takes most people several sessions in a pool or calm water.",
            "**Easy rapids with an instructor,** then gradually bigger ones.",
          ] },
          { p: "Rishikesh has schools running multi-day beginner courses in the season." },
        ],
      },
      {
        id: "safety",
        title: "Safety",
        blocks: [
          { list: [
            "**Strainers:** fallen trees and branches let water through but trap people. Stay well away.",
            "**Holes and weirs:** water recirculating below a drop can hold a swimmer. Scout or walk around anything you're unsure of.",
            "**Cold water:** Himalayan rivers are snowmelt. Wear a wetsuit or cag when it's cold.",
            "**At sea:** check the wind and tides, stay near the shore, and tell someone your route.",
            "**Kit:** life jacket, helmet on rivers, spray deck, and a whistle.",
          ] },
          { callout: "warn", title: "Never alone", text: "White-water kayakers paddle in groups and watch each other through every rapid. A safety kayaker or raft should be on the water for anyone learning." },
        ],
      },
    ],
  },

  diving: {
    tldr: [
      "Try a Discover Scuba dive first, then take a beginner course like PADI or SSI Open Water.",
      "Fill in the medical questionnaire honestly: some conditions need a doctor's sign-off.",
      "Never hold your breath underwater, and equalise your ears early and often.",
      "Wait at least 12 to 18 hours after diving before you fly.",
      "Diving season is roughly November to May; the monsoon closes most sites.",
    ],
    sections: [
      {
        id: "levels",
        title: "From first dive to certified",
        blocks: [
          { table: { head: ["Level", "What it is", "Depth limit"], rows: [
            ["Try-dive (Discover Scuba)", "A short lesson and one or two dives with an instructor at your side. No certificate", "About 12 m"],
            ["Open Water Diver", "3 to 4 days of theory, pool or shallow sessions and four open-water dives", "18 m, with a buddy"],
            ["Advanced Open Water", "Five adventure dives, including a deep and a navigation dive", "30 m"],
            ["Rescue Diver and beyond", "Rescue skills, then professional levels like Divemaster", "Depends on training"],
          ] } },
          { p: "PADI and SSI are the agencies you'll see most in India; their courses are similar and recognised worldwide. Your certification card lets you dive with any centre." },
        ],
      },
      {
        id: "where",
        title: "Where to dive in India",
        blocks: [
          { list: [
            "**The Andamans:** Swaraj Dweep (Havelock) and Shaheed Dweep (Neil) have most of the dive centres, reefs and good visibility. India's best-known diving.",
            "**Lakshadweep:** remote atolls with clear water. Every visitor needs an entry permit; see [Permits and documents](/adventurepedia/permits-and-documents).",
            "**Netrani Island, Karnataka:** a boat trip from Murudeshwar, with big fish and coral.",
            "**Goa and Puducherry:** easier to reach, with training dives and some wrecks and reefs. Visibility varies.",
          ] },
        ],
      },
      {
        id: "health",
        title: "Health and safety",
        blocks: [
          { list: [
            "**Medical form:** asthma, epilepsy, heart or lung conditions, recent surgery, pregnancy and some medicines need a doctor's approval before you dive. Be honest; it's for your safety.",
            "**Equalising:** pinch your nose and gently blow, every metre or so going down. Never force it; go up a little and try again.",
            "**Never hold your breath** on scuba. Breathe slowly and continuously, especially going up.",
            "**Ascend slowly** with a safety stop at about 5 m for 3 minutes, as your instructor shows you.",
            "**Colds and blocked ears:** don't dive. You can't equalise and risk ear injury.",
          ] },
          { callout: "warn", title: "Flying and altitude after diving", text: "Wait at least 12 hours after a single dive and 18 hours after multiple dives or days of diving before you fly, and the same before driving over high ground. Recompression chambers are few in India; ask your centre where the nearest one is." },
        ],
      },
      {
        id: "reef",
        title: "Looking after the reef",
        blocks: [
          { list: [
            "Don't touch, stand on or kick coral. Practise buoyancy so you hover.",
            "Tuck in gauges and hoses so they don't drag.",
            "Never take shells or coral, and don't feed fish.",
            "Use reef-safer sunscreen, or cover up with a rash guard.",
          ] },
        ],
      },
    ],
    sources: [{ label: "Flying after diving — Divers Alert Network", url: "https://dan.org/health-medicine/health-resources/diseases-conditions/flying-after-diving/" }, { label: "Scuba diving: decompression illness — CDC Yellow Book", url: "https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/scuba-diving-decompression-illness-and-other-dive-related-injuries.html" }],
  },

  surfing: {
    tldr: [
      "Learn at a surf school on soft-top boards, in the white water first.",
      "October to May suits learners; the monsoon brings big, messy swell and closed beaches.",
      "Learn to spot rip currents. If caught, swim parallel to the beach, not against it.",
      "Don't drop in: the surfer closest to the breaking peak has the wave.",
      "Always hold on to or stay leashed to your board, and cover up from the sun.",
    ],
    sections: [
      {
        id: "where",
        title: "Where to surf",
        blocks: [
          { table: { head: ["Spot", "What it's like"], rows: [
            ["Mulki, Karnataka", "Long-running surf schools near Mangaluru, good beginner waves"],
            ["Kovalam and Varkala, Kerala", "Surf clubs and schools, beach breaks for learners"],
            ["Goa", "Small, friendly waves in the north, schools in Arambol and around"],
            ["Puducherry and Mahabalipuram", "The east coast's surf towns, with schools and steady swell"],
            ["Gokarna, Karnataka", "Quieter beaches, a few schools"],
          ] } },
        ],
      },
      {
        id: "first-lessons",
        title: "Your first lessons",
        blocks: [
          { steps: [
            "**On the sand:** how to lie on the board, paddle and pop up to your feet.",
            "**In the white water:** catching broken waves close to shore, with an instructor pushing you in.",
            "**Standing up:** most people manage a wobbly ride in the first lesson or two.",
            "**Paddling out:** getting past the breaking waves to catch green (unbroken) waves comes after a few days.",
          ] },
          { p: "A two or three day course gives you the basics. Book in the morning, when winds are usually lighter." },
        ],
      },
      {
        id: "safety",
        title: "Ocean safety",
        blocks: [
          { list: [
            "**Rip currents:** channels of water flowing out to sea, often calmer-looking gaps between breaking waves. If one takes you, don't fight it: float, signal, and swim parallel to the shore until you're out of it.",
            "**Monsoon:** many beaches in Goa and Kerala close to swimmers in the rains. Respect the flags and lifeguards.",
            "**Your board:** never put it between you and a wave, and never let go of it near other people.",
            "**Sun:** water reflects UV. Rash guard, waterproof SPF 50, and a cap between sessions.",
          ] },
          { callout: "tip", title: "Surf etiquette", text: "The surfer nearest the peak of a breaking wave has right of way. Don't paddle into someone's path, apologise when you get it wrong, and give way to locals at their spots." },
        ],
      },
    ],
  },

  snorkelling: {
    tldr: [
      "You only need to be comfortable in water. A life jacket makes it easy for weak swimmers.",
      "Never stand on or touch coral. It's alive and cuts badly.",
      "Spit or defog your mask, fit it without hair under the seal, and breathe slowly.",
      "Snorkel with a buddy and a guide, and keep an eye on the boat.",
      "Go November to May, when the sea is calm and clear.",
    ],
    sections: [
      {
        id: "where",
        title: "Where to snorkel",
        blocks: [
          { list: [
            "**The Andamans:** Elephant Beach and other reefs off Swaraj Dweep (Havelock), Shaheed Dweep (Neil), and North Bay near Port Blair.",
            "**Lakshadweep:** shallow lagoons of clear water; a permit is needed to visit.",
            "**Netrani Island, Karnataka:** a boat ride from Murudeshwar.",
            "**Grande Island, Goa,** and **Tarkarli and Malvan, Maharashtra:** easy day trips, visibility varies.",
          ] },
        ],
      },
      {
        id: "how",
        title: "How to snorkel",
        blocks: [
          { steps: [
            "**Fit the mask:** press it to your face without the strap and breathe in through your nose. If it stays, it fits.",
            "**Stop fogging:** rub a little defog or saliva on the glass and rinse.",
            "**Practise breathing** through the snorkel in shallow water, slowly and deeply.",
            "**Float face down** and kick gently from the hips, fins below the surface.",
            "**Clear water** from the snorkel with a sharp breath out.",
          ] },
        ],
      },
      {
        id: "safety",
        title: "Safety and the reef",
        blocks: [
          { list: [
            "Stay with your guide and buddy, and look up every few minutes to check where the boat is.",
            "Currents can be strong around reefs and channels. Ask before you swim out.",
            "Wear a rash guard or T-shirt: it's easy to get badly sunburnt on your back.",
            "Don't touch, stand on or kick coral, and don't chase or feed fish or turtles.",
            "Watch for sea urchins and stonefish in the shallows; reef shoes help.",
          ] },
        ],
      },
    ],
  },
};
