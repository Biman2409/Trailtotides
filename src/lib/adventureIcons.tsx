import React from "react";

/* ─────────────────────────────────────────────────────────────
   Custom SVG icons — one per adventure type.
   All designed on a 24 × 24 viewBox, stroke-based, currentColor.
   Use fill="none" stroke="currentColor" strokeWidth="1.6"
   strokeLinecap="round" strokeLinejoin="round" throughout.
───────────────────────────────────────────────────────────── */

const svg = (content: React.ReactNode, s: number) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={s}
    height={s}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {content}
  </svg>
);

// Trekking — hiker silhouette with trekking pole & backpack
const Trekking = (s: number) => svg(<>
  <circle cx="12" cy="3.5" r="1.4" />
  {/* torso + backpack */}
  <path d="M10 6.5h4l1 5H9l1-5Z" />
  <rect x="13.2" y="6.8" width="2" height="3.5" rx="0.5" />
  {/* legs */}
  <path d="M10 11.5l-1.5 5.5h2.5l1-4 1 4h2.5l-1.5-5.5" />
  {/* trekking pole */}
  <line x1="8" y1="8" x2="6" y2="19" />
  <line x1="5.5" y1="19" x2="6.5" y2="19" />
</>, s);

// Mountaineering — climber on peak with ice-axe
const Mountaineering = (s: number) => svg(<>
  {/* mountain */}
  <path d="M3 20l7-12 4 6 2-3 5 9H3Z" />
  {/* ice axe */}
  <line x1="17" y1="4" x2="20" y2="10" />
  <path d="M16.5 3.5Q17.5 2.5 19 3" />
  <path d="M17 4l1 1" />
</>, s);

// Rock Climbing — figure on vertical wall with rope
const RockClimbing = (s: number) => svg(<>
  {/* wall */}
  <line x1="18" y1="2" x2="18" y2="22" />
  {/* handholds */}
  <path d="M18 7 Q15 6.5 14.5 8" />
  <path d="M18 13 Q15 12.5 14.5 14" />
  {/* rope */}
  <path d="M18 4 Q16 9 17 13 Q16 17 17 21" strokeDasharray="2 1.5" />
  {/* figure */}
  <circle cx="13" cy="9.5" r="1.2" />
  <path d="M13 10.7l-.5 3" />
  <path d="M13 10.7l2.5-2.2" />
  <path d="M14.5 8.5l1.5 2" />
  <path d="M12.5 13.7l-1 2.5" />
  <path d="M12.5 13.7l1 2" />
</>, s);

// Scrambling — figure on boulder field, low angle
const Scrambling = (s: number) => svg(<>
  {/* boulders */}
  <path d="M2 20l4-6 3 4 4-7 4 5 5-8" />
  <path d="M2 20h20" />
  {/* figure scrambling */}
  <circle cx="14" cy="8.5" r="1.2" />
  <path d="M14 9.7l.5 3" />
  <path d="M12 9l2 1" />
  <path d="M14 9.7l2 1" />
  <path d="M14.5 12.7l-1 2" />
  <path d="M14.5 12.7l1.5 2" />
</>, s);

// Biking — mountain bike side view
const Biking = (s: number) => svg(<>
  {/* wheels */}
  <circle cx="6.5" cy="16" r="4" />
  <circle cx="17.5" cy="16" r="4" />
  {/* frame */}
  <path d="M6.5 16L11 8l3 8" />
  <path d="M11 8l3.5 0.5L17.5 16" />
  <path d="M11 8h3.5" />
  {/* handlebar */}
  <path d="M14.5 8.5l1.5-2.5 2 0.5" />
  {/* seat */}
  <path d="M10 8.5l-2 0" />
  {/* rider head */}
  <circle cx="15.5" cy="5.5" r="1.2" />
</>, s);

// Cycling — road cyclist, aerodynamic tuck
const Cycling = (s: number) => svg(<>
  {/* wheels */}
  <circle cx="5.5" cy="16.5" r="3.8" />
  <circle cx="18.5" cy="16.5" r="3.8" />
  {/* frame — diamond */}
  <path d="M5.5 16.5L10 9l4 7.5" />
  <path d="M10 9l4.5 0.5 4 7" />
  {/* handlebar drop */}
  <path d="M14.5 9.5l1-2 1.5 1.5" />
  {/* seat post */}
  <path d="M10 9l-1-2" />
  <line x1="7.5" y1="7" x2="10.5" y2="7" />
  {/* rider aerotuck */}
  <circle cx="16.5" cy="6" r="1.1" />
  <path d="M16.5 7.1Q15 8.5 13 9Q11 9.5 10 9" />
</>, s);

// Jeep Safari — 4×4 side silhouette
const JeepSafari = (s: number) => svg(<>
  {/* body */}
  <path d="M3 14V10l2.5-4h10l3.5 4v4H3Z" />
  {/* wheels */}
  <circle cx="7" cy="17" r="2.5" />
  <circle cx="17" cy="17" r="2.5" />
  {/* windshield */}
  <path d="M6 10l1.5-3h8l1.5 3" />
  <line x1="10.5" y1="7" x2="10.5" y2="10" />
  {/* roof rack */}
  <line x1="5.5" y1="6.5" x2="17.5" y2="6.5" />
  {/* ground */}
  <line x1="2" y1="19.5" x2="22" y2="19.5" />
</>, s);

// Camel Safari — camel with rider
const CamelSafari = (s: number) => svg(<>
  {/* camel body */}
  <path d="M4 17Q4 14 6 13Q6 10 8.5 10Q9 8 11 8.5Q12 7 13 8Q15 7.5 15.5 10Q17.5 10 18 12Q19.5 12.5 20 15V17H4Z" />
  {/* hump */}
  <path d="M9 10Q10 7.5 12 8Q13.5 7 14.5 9" />
  {/* neck & head */}
  <path d="M8.5 10l-1-3.5Q7 5.5 8.5 5l1 0.5" />
  {/* legs */}
  <line x1="7" y1="17" x2="6.5" y2="20" />
  <line x1="10" y1="17" x2="9.5" y2="20" />
  <line x1="14" y1="17" x2="13.5" y2="20" />
  <line x1="17" y1="17" x2="16.5" y2="20" />
  {/* rider */}
  <circle cx="13" cy="7" r="1.1" />
</>, s);

// Caving — figure in cave tunnel with headlamp beam
const Caving = (s: number) => svg(<>
  {/* cave arch */}
  <path d="M2 20Q2 8 12 6Q22 8 22 20" />
  <line x1="2" y1="20" x2="22" y2="20" />
  {/* figure crouching */}
  <circle cx="12" cy="13" r="1.2" />
  <path d="M12 14.2l.5 3" />
  <path d="M10.5 13.5l1.5 0.7" />
  <path d="M13.5 13.5l-1.5 0.7" />
  <path d="M12.5 17.2l-1 2" />
  <path d="M12.5 17.2l1 2" />
  {/* headlamp beam */}
  <path d="M12 13l4-5" strokeDasharray="1.5 1.2" />
  <path d="M12 13l5-4" strokeDasharray="1.5 1.2" />
</>, s);

// Sandboarding — boarder on dune
const Sandboarding = (s: number) => svg(<>
  {/* dune */}
  <path d="M2 20Q8 8 22 14" />
  <line x1="2" y1="20" x2="22" y2="20" />
  {/* board */}
  <path d="M8 18l6-6" strokeWidth="2" />
  {/* rider */}
  <circle cx="13.5" cy="11.5" r="1.3" />
  <path d="M13.5 12.8l-1 2.5" />
  <path d="M12.2 11.5l-2 1" />
  <path d="M14.5 11l1.5-1.5" />
  <path d="M12.5 15.3l-1 1.5" />
  <path d="M12.5 15.3l.5 1.5" />
</>, s);

// Urban Adventure — city skyline + parkour jump
const UrbanAdventure = (s: number) => svg(<>
  {/* buildings */}
  <rect x="2" y="10" width="4" height="10" />
  <rect x="8" y="7" width="5" height="13" />
  <rect x="15" y="12" width="5" height="8" />
  {/* windows */}
  <rect x="3" y="12" width="1.5" height="1.5" />
  <rect x="3" y="15" width="1.5" height="1.5" />
  <rect x="9.5" y="9" width="1.5" height="1.5" />
  <rect x="9.5" y="12" width="1.5" height="1.5" />
  {/* parkour figure jumping */}
  <circle cx="19" cy="6" r="1.2" />
  <path d="M19 7.2l-.5 3" />
  <path d="M17.5 8.5l1.8 0.5" />
  <path d="M20.5 8l-1.2 1" />
  <path d="M18.5 10.2l-1.5 2" />
  <path d="M18.5 10.2l1 2" />
</>, s);

// Paragliding — canopy with harness
const Paragliding = (s: number) => svg(<>
  {/* canopy */}
  <path d="M3 10Q12 2 21 10" />
  <path d="M6 10Q7 7 12 6Q17 7 18 10" />
  {/* lines */}
  <line x1="7" y1="10" x2="12" y2="17" />
  <line x1="10" y1="9" x2="12" y2="17" />
  <line x1="14" y1="9" x2="12" y2="17" />
  <line x1="17" y1="10" x2="12" y2="17" />
  {/* harness + pilot */}
  <path d="M10 17h4l.5 3h-5L10 17Z" />
  <circle cx="12" cy="15.5" r="1.2" />
</>, s);

// Hot Air Balloon
const HotAirBalloon = (s: number) => svg(<>
  {/* balloon envelope */}
  <path d="M7 13Q5 6 12 3Q19 6 17 13Q15.5 17 12 17Q8.5 17 7 13Z" />
  {/* panel lines */}
  <path d="M12 3Q10 8 12 17" />
  <path d="M12 3Q14 8 12 17" />
  {/* basket ropes */}
  <line x1="9.5" y1="17" x2="10" y2="20" />
  <line x1="14.5" y1="17" x2="14" y2="20" />
  {/* basket */}
  <rect x="9.5" y="20" width="5" height="3" rx="0.5" />
</>, s);

// Diving — scuba diver
const Diving = (s: number) => svg(<>
  {/* water surface */}
  <path d="M2 9Q5 7 8 9Q11 11 14 9Q17 7 22 9" />
  {/* bubbles */}
  <circle cx="16" cy="12" r="0.6" />
  <circle cx="17.5" cy="10.5" r="0.4" />
  <circle cx="15" cy="10" r="0.4" />
  {/* diver body horizontal */}
  <path d="M5 15Q7 13 10 13.5Q13 14 15 13" />
  {/* head with mask */}
  <circle cx="5.5" cy="15" r="1.5" />
  <path d="M4 15h3" />
  {/* tank on back */}
  <rect x="9.5" y="12.5" width="2" height="3" rx="0.5" />
  {/* fins */}
  <path d="M14.5 13Q17 12.5 17.5 14Q17 15.5 14.5 14.5" />
  {/* arm with regulator */}
  <path d="M7 14l2-2" />
</>, s);

// Kayaking — kayaker with paddle
const Kayaking = (s: number) => svg(<>
  {/* kayak hull */}
  <path d="M3 14Q12 10 21 14Q18 18 12 18Q6 18 3 14Z" />
  {/* cockpit */}
  <ellipse cx="12" cy="14" rx="3" ry="1.5" />
  {/* paddle */}
  <line x1="4" y1="10" x2="20" y2="10" />
  <ellipse cx="4" cy="10" rx="1.5" ry="3" transform="rotate(-20 4 10)" />
  <ellipse cx="20" cy="10" rx="1.5" ry="3" transform="rotate(-20 20 10)" />
  {/* paddler */}
  <circle cx="12" cy="11" r="1.3" />
  <path d="M10 10.5l2 1" />
  <path d="M12 11.5l2-1" />
</>, s);

// Surfing — surfer on wave
const Surfing = (s: number) => svg(<>
  {/* wave */}
  <path d="M2 14Q5 9 9 11Q11 12 12 14Q15 18 20 14Q21 13 22 12" />
  <path d="M2 17Q6 14 9 15Q12 16.5 14 14Q17 11 22 14" />
  {/* board */}
  <path d="M8 18l6-8" strokeWidth="1.8" />
  {/* surfer */}
  <circle cx="12.5" cy="10.5" r="1.2" />
  <path d="M12.5 11.7Q12 13 11 14" />
  <path d="M11 13l-2 0.5" />
  <path d="M12.5 11.7l2-1" />
  <path d="M11 14l-0.5 2" />
  <path d="M11 14l1 1.5" />
</>, s);

// River Rafting — raft on whitewater
const RiverRafting = (s: number) => svg(<>
  {/* water waves */}
  <path d="M2 18Q5 15 8 17Q11 19 14 17Q17 15 20 17Q21 18 22 18" />
  <path d="M2 21Q5 18 8 20Q11 22 14 20Q17 18 20 20" />
  {/* raft */}
  <rect x="5" y="12" width="14" height="5" rx="1.5" />
  {/* passengers */}
  <circle cx="8.5" cy="11" r="1.1" />
  <circle cx="12" cy="11" r="1.1" />
  <circle cx="15.5" cy="11" r="1.1" />
  {/* paddles */}
  <line x1="6" y1="11" x2="4" y2="16" />
  <line x1="18" y1="11" x2="20" y2="16" />
</>, s);

// Snorkelling — snorkeller face-down at surface
const Snorkelling = (s: number) => svg(<>
  {/* water line */}
  <path d="M2 10Q6 8 10 10Q14 12 18 10Q20 9 22 10" />
  {/* body horizontal */}
  <path d="M5 12Q10 11 16 12" />
  {/* head with mask */}
  <circle cx="5.5" cy="11.5" r="1.8" />
  <path d="M4 12h3" />
  {/* snorkel tube */}
  <path d="M5.5 9.7l0 -3 2 0" />
  {/* fins */}
  <path d="M15.5 12Q18 11.5 19 13Q18 15 15.5 13.5" />
  {/* fish */}
  <path d="M17 17Q18.5 16 20 17Q18.5 18 17 17Z" />
  <line x1="17" y1="17" x2="15.5" y2="17" />
</>, s);

// Skiing — downhill skier
const Skiing = (s: number) => svg(<>
  {/* slope */}
  <path d="M2 20Q10 12 22 8" strokeDasharray="2 1.5" />
  {/* skis */}
  <path d="M7 19l8-10" strokeWidth="2" />
  <path d="M9 20l8-10" strokeWidth="2" />
  {/* body */}
  <path d="M12.5 14Q13.5 12 15 12.5" />
  <path d="M11 15.5l4-3" />
  {/* head */}
  <circle cx="16" cy="11.5" r="1.3" />
  {/* pole left */}
  <line x1="9" y1="13" x2="7" y2="18" />
  {/* pole right */}
  <line x1="16" y1="13" x2="18" y2="17" />
</>, s);

// Snowboarding — boarder carving
const Snowboarding = (s: number) => svg(<>
  {/* snowboard */}
  <path d="M5 20Q12 15 19 18" strokeWidth="2.2" />
  {/* body */}
  <path d="M11 17Q12 14 14.5 14.5" />
  <path d="M10 16l4.5-2" />
  {/* head */}
  <circle cx="15.5" cy="13" r="1.3" />
  {/* trailing arm */}
  <path d="M10.5 16l-2-1" />
  {/* leading arm */}
  <path d="M14.5 14.5l2-2" />
  {/* legs */}
  <path d="M11 17l-1 2.5" />
  <path d="M12.5 17.5l0.5 2" />
  {/* snow spray */}
  <path d="M5.5 19.5l-1.5-1.5" />
  <path d="M6 20.5l-1 .5" />
  <path d="M7 21l-.5 .5" />
</>, s);

// Ice Climbing — figure on ice wall with axes
const IceClimbing = (s: number) => svg(<>
  {/* ice wall */}
  <rect x="16" y="2" width="4" height="20" rx="0.5" />
  {/* ice texture */}
  <path d="M16 6l4 3" />
  <path d="M16 12l4 3" />
  {/* figure */}
  <circle cx="12.5" cy="8" r="1.3" />
  <path d="M12.5 9.3l-.5 4" />
  <path d="M10.5 10l2 0.7" />
  <path d="M14.5 10l-2 0.7" />
  <path d="M12 13.3l-1.5 3.5" />
  <path d="M12 13.3l1 3" />
  {/* ice axes */}
  <path d="M15 10l-1.5-1" />
  <path d="M14.5 9.5Q16 8 16.5 9" />
  <path d="M9.5 10l1.5-1" />
  <path d="M9.5 9.5Q8 8 7.5 9" />
</>, s);

// Snow Trekking — figure with snowshoes in snow
const SnowTrekking = (s: number) => svg(<>
  {/* snowflakes bg */}
  <circle cx="4" cy="4" r="0.5" />
  <circle cx="8" cy="2.5" r="0.5" />
  <circle cx="16" cy="3" r="0.5" />
  <circle cx="20" cy="5" r="0.5" />
  {/* snowy ground */}
  <path d="M2 21Q8 18 12 20Q16 22 22 19" />
  {/* figure */}
  <circle cx="12" cy="8" r="1.4" />
  <path d="M12 9.4l-.5 4.5" />
  {/* trekking poles */}
  <line x1="10" y1="11" x2="8" y2="19" />
  <line x1="14" y1="11" x2="16" y2="19" />
  {/* snowshoes */}
  <ellipse cx="9.5" cy="19.5" rx="2" ry="0.8" />
  <ellipse cx="14.5" cy="19.5" rx="2" ry="0.8" />
  {/* jacket arm */}
  <path d="M11.5 11l-2.5 2" />
  <path d="M12.5 11l2.5 2" />
</>, s);

// Skydiving — freefall spread eagle
const Skydiving = (s: number) => svg(<>
  {/* clouds */}
  <path d="M2 8Q2 5 5 5Q5.5 3 8 4Q10 3 10 5.5Q12 5 12 7Q12 8.5 10 9H4Q2 9 2 8Z" />
  <path d="M16 6Q16 4 18.5 4Q19 2.5 21 3.5Q23 3 22.5 5.5H16Z" />
  {/* figure spread eagle */}
  <circle cx="12" cy="14" r="1.4" />
  {/* horizontal arms */}
  <path d="M7 13l5 1.5" />
  <path d="M17 13l-5 1.5" />
  {/* legs spread */}
  <path d="M11 15.5l-2 3.5" />
  <path d="M13 15.5l2 3.5" />
  {/* parachute pack */}
  <rect x="10.5" y="15" width="3" height="2" rx="0.5" />
  {/* altitude wind lines */}
  <path d="M4 19l3-1" />
  <path d="M4 21l4-1" />
</>, s);

// Hang Gliding — delta wing with pilot
const HangGliding = (s: number) => svg(<>
  {/* delta wing */}
  <path d="M12 5L3 19h18L12 5Z" />
  {/* control bar trapeze */}
  <line x1="8" y1="15" x2="16" y2="15" />
  <line x1="12" y1="5" x2="8" y2="15" />
  <line x1="12" y1="5" x2="16" y2="15" />
  {/* pilot hanging */}
  <circle cx="12" cy="17.5" r="1.2" />
  <path d="M11 15l1 2.5" />
  <path d="M13 15l-1 2.5" />
  {/* legs */}
  <path d="M11.5 18.7l-1 2.5" />
  <path d="M12.5 18.7l1 2.5" />
</>, s);

/* ────────────────────────────────────────────────────────── */

export const ADVENTURE_TYPE_ICONS: Record<string, (size?: number) => React.ReactNode> = {
  Trekking:          (s = 14) => Trekking(s),
  Mountaineering:    (s = 14) => Mountaineering(s),
  "Rock Climbing":   (s = 14) => RockClimbing(s),
  Scrambling:        (s = 14) => Scrambling(s),
  Biking:            (s = 14) => Biking(s),
  Cycling:           (s = 14) => Cycling(s),
  "Jeep Safari":     (s = 14) => JeepSafari(s),
  "Camel Safari":    (s = 14) => CamelSafari(s),
  Caving:            (s = 14) => Caving(s),
  Sandboarding:      (s = 14) => Sandboarding(s),
  "Urban Adventure": (s = 14) => UrbanAdventure(s),
  Paragliding:       (s = 14) => Paragliding(s),
  "Hot Air Balloon": (s = 14) => HotAirBalloon(s),
  Diving:            (s = 14) => Diving(s),
  Kayaking:          (s = 14) => Kayaking(s),
  Surfing:           (s = 14) => Surfing(s),
  "River Rafting":   (s = 14) => RiverRafting(s),
  Snorkelling:       (s = 14) => Snorkelling(s),
  Skiing:            (s = 14) => Skiing(s),
  Snowboarding:      (s = 14) => Snowboarding(s),
  "Ice Climbing":    (s = 14) => IceClimbing(s),
  "Snow Trekking":   (s = 14) => SnowTrekking(s),
  Skydiving:         (s = 14) => Skydiving(s),
  "Hang Gliding":    (s = 14) => HangGliding(s),
};
