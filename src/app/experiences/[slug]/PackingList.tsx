"use client";

import { useState, useEffect } from "react";
import { Backpack, Check, ChevronDown, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import type { AdventureType } from "@/lib/data";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE } from "@/lib/ace";

interface Item {
  label: string;
  essential: boolean;
  /** If set, item is only added when condition is true */
  condition?: string;
}

interface Category {
  name: string;
  icon: string;
  items: Item[];
}

// ─── Base gear (every adventure) ─────────────────────────────────────────────

const BASE_GEAR: Category[] = [
  {
    name: "Documents & Money",
    icon: "🪪",
    items: [
      { label: "Government ID / Aadhaar", essential: true },
      { label: "Emergency contact card", essential: true },
      { label: "Cash (ATMs rare in mountains)", essential: true },
      { label: "Travel insurance documents", essential: false },
      { label: "Permits / entry passes", essential: false },
    ],
  },
  {
    name: "First Aid",
    icon: "🩹",
    items: [
      { label: "Personal medications", essential: true },
      { label: "Blister plasters", essential: true },
      { label: "Antiseptic wipes", essential: true },
      { label: "Paracetamol / Ibuprofen", essential: true },
      { label: "ORS sachets", essential: false },
      { label: "Elastic bandage", essential: false },
    ],
  },
];

// ─── Type-specific packs ──────────────────────────────────────────────────────

const TYPE_PACKS: Partial<Record<AdventureType, Category[]>> = {
  Trekking: [
    {
      name: "Trek Gear",
      icon: "🥾",
      items: [
        { label: "Trekking boots (broken in)", essential: true },
        { label: "Trekking poles", essential: true },
        { label: "45–60L backpack", essential: true },
        { label: "Sleeping bag (rated -5°C or below)", essential: true },
        { label: "Trekking headlamp + spare batteries", essential: true },
        { label: "Sunscreen SPF 50+", essential: true },
        { label: "UV-protection sunglasses", essential: true },
        { label: "Water bottles (2 × 1L)", essential: true },
        { label: "Water purification tablets / filter", essential: true },
        { label: "Trail snacks / energy bars", essential: false },
        { label: "Trekking map / downloaded offline map", essential: false },
      ],
    },
    {
      name: "Clothing",
      icon: "🧥",
      items: [
        { label: "Moisture-wicking base layers", essential: true },
        { label: "Warm mid layer / fleece", essential: true },
        { label: "Waterproof outer shell / rain jacket", essential: true },
        { label: "Quick-dry trekking pants", essential: true },
        { label: "Warm hat & gloves", essential: true },
        { label: "Merino wool socks (3+ pairs)", essential: true },
        { label: "Gaiters (for snow / stream crossings)", essential: false },
        { label: "Buff / neck gaiter", essential: false },
      ],
    },
  ],
  Mountaineering: [
    {
      name: "Climbing Gear",
      icon: "⛏️",
      items: [
        { label: "Mountaineering boots (double insulated)", essential: true },
        { label: "Crampons + ice axe", essential: true },
        { label: "Harness + belay device", essential: true },
        { label: "Helmet", essential: true },
        { label: "Fixed rope ascenders (Jumars)", essential: true },
        { label: "60m climbing rope", essential: true },
        { label: "High-altitude sleeping bag (-20°C)", essential: true },
        { label: "Oxygen cylinder (above 7,000m)", essential: false },
        { label: "Altitude tent / bivy sack", essential: false },
      ],
    },
    {
      name: "Clothing",
      icon: "🧥",
      items: [
        { label: "Down suit / high-altitude outfit", essential: true },
        { label: "Expedition-weight base layers", essential: true },
        { label: "Insulated gloves + overmitts", essential: true },
        { label: "Balaclava", essential: true },
        { label: "Goggles (UV 400, anti-fog)", essential: true },
        { label: "Thermal socks (3+ pairs)", essential: true },
      ],
    },
  ],
  Biking: [
    {
      name: "Riding Gear",
      icon: "🏍️",
      items: [
        { label: "Full-face helmet (certified)", essential: true },
        { label: "Riding gloves (armoured)", essential: true },
        { label: "Riding jacket with armour inserts", essential: true },
        { label: "Knee & elbow guards", essential: true },
        { label: "Bike toolkit + tyre repair kit", essential: true },
        { label: "Spare clutch cable & throttle cable", essential: true },
        { label: "Fuel jerry can (extra 5L)", essential: true },
        { label: "Chain lube + brake pads", essential: false },
        { label: "Tank bag / soft luggage", essential: false },
        { label: "Heated grips (high altitude)", essential: false },
      ],
    },
    {
      name: "Clothing",
      icon: "🧥",
      items: [
        { label: "Waterproof riding pants", essential: true },
        { label: "Thermal base layers", essential: true },
        { label: "Warm mid layer / fleece", essential: true },
        { label: "Buff / balaclava for neck", essential: false },
        { label: "Boot covers (waterproof)", essential: false },
      ],
    },
  ],
  Cycling: [
    {
      name: "Cycling Gear",
      icon: "🚵",
      items: [
        { label: "Cycling helmet", essential: true },
        { label: "Padded cycling shorts", essential: true },
        { label: "Cycling gloves", essential: true },
        { label: "Spare inner tubes (×3)", essential: true },
        { label: "Tyre levers + pump", essential: true },
        { label: "Multi-tool + chain breaker", essential: true },
        { label: "Panniers / bikepacking bags", essential: false },
        { label: "Dynamo light set", essential: false },
        { label: "GPS cycle computer", essential: false },
      ],
    },
    {
      name: "Clothing",
      icon: "🧥",
      items: [
        { label: "Windproof cycling jacket", essential: true },
        { label: "Thermal cycling tights", essential: true },
        { label: "Cycling socks (merino, 2+ pairs)", essential: true },
        { label: "Shoe covers (cold weather)", essential: false },
      ],
    },
  ],
  Diving: [
    {
      name: "Dive Equipment",
      icon: "🤿",
      items: [
        { label: "PADI / CMAS certification card", essential: true },
        { label: "Personal mask & fins", essential: true },
        { label: "Wetsuit (3–7mm depending on site)", essential: true },
        { label: "Dive computer", essential: true },
        { label: "BCD (buoyancy compensator)", essential: false },
        { label: "Dive torch", essential: false },
        { label: "Surface marker buoy (SMB)", essential: false },
        { label: "Underwater camera housing", essential: false },
      ],
    },
  ],
  Kayaking: [
    {
      name: "Water Gear",
      icon: "🛶",
      items: [
        { label: "PFD (life jacket, ISAF rated)", essential: true },
        { label: "Paddle", essential: true },
        { label: "Helmet (whitewater)", essential: true },
        { label: "Wetsuit / drysuit", essential: true },
        { label: "Waterproof dry bags", essential: true },
        { label: "Paddling gloves", essential: false },
        { label: "Throw bag (safety line)", essential: false },
      ],
    },
  ],
  Skiing: [
    {
      name: "Ski Gear",
      icon: "⛷️",
      items: [
        { label: "Ski boots (properly fitted)", essential: true },
        { label: "Ski poles", essential: true },
        { label: "Ski goggles (UV400)", essential: true },
        { label: "Avalanche transceiver (beacon)", essential: true },
        { label: "Avalanche probe + shovel", essential: true },
        { label: "Ski helmet", essential: true },
        { label: "Warm ski gloves", essential: true },
        { label: "Ski socks (merino, 2+ pairs)", essential: false },
        { label: "Hand warmers", essential: false },
      ],
    },
    {
      name: "Clothing",
      icon: "🧥",
      items: [
        { label: "Insulated ski jacket", essential: true },
        { label: "Ski pants (waterproof)", essential: true },
        { label: "Thermal base layers (top + bottom)", essential: true },
        { label: "Neck gaiter / balaclava", essential: false },
      ],
    },
  ],
  "Rock Climbing": [
    {
      name: "Climbing Gear",
      icon: "🧗",
      items: [
        { label: "Climbing shoes", essential: true },
        { label: "Harness + belay device", essential: true },
        { label: "Helmet", essential: true },
        { label: "Chalk bag + chalk", essential: true },
        { label: "Quickdraws (6+)", essential: true },
        { label: "Locking carabiners", essential: true },
        { label: "60m dry dynamic rope", essential: true },
        { label: "Crack gloves", essential: false },
        { label: "Crash pad (bouldering)", essential: false },
      ],
    },
  ],
  Scrambling: [
    {
      name: "Scramble Gear",
      icon: "🏔️",
      items: [
        { label: "Approach shoes with sticky rubber", essential: true },
        { label: "Helmet", essential: true },
        { label: "Lightweight harness", essential: false },
        { label: "Short prusik / tagline", essential: false },
        { label: "Fingerless approach gloves", essential: false },
      ],
    },
  ],
  Paragliding: [
    {
      name: "Flight Gear",
      icon: "🪂",
      items: [
        { label: "Paragliding wing (certified instructor provides)", essential: true },
        { label: "Harness + reserve parachute", essential: true },
        { label: "Helmet (full-face EN certified)", essential: true },
        { label: "Radio / walkie-talkie", essential: false },
        { label: "Variometer (vario)", essential: false },
        { label: "GPS / flight instrument", essential: false },
      ],
    },
  ],
};

const FALLBACK_PACK: Category[] = [
  {
    name: "Adventure Essentials",
    icon: "🎒",
    items: [
      { label: "Suitable footwear for activity", essential: true },
      { label: "Activity-specific protective gear", essential: true },
      { label: "Hydration (2L minimum)", essential: true },
      { label: "Navigation tool / map", essential: false },
    ],
  },
];

// ─── Smart add-ons based on conditions ───────────────────────────────────────

function buildSmartAddons(
  adventureType: AdventureType,
  difficulty: string,
  altitudeM: number,
  bestSeason: string,
  userAce: ACE | null,
  adventureAce: ACE,
): { categories: Category[]; tips: { text: string; color: string; icon: "warn" | "tip" }[] } {
  const cats: Category[] = [];
  const tips: { text: string; color: string; icon: "warn" | "tip" }[] = [];

  const isHighAlt = altitudeM >= 3500;
  const isVeryHighAlt = altitudeM >= 4500;
  const isSnowSeason =
    /dec|jan|feb|nov/i.test(bestSeason) ||
    bestSeason.toLowerCase().includes("winter");
  const isMonsoon = /jun|jul|aug/i.test(bestSeason);
  const isTrekkingType =
    adventureType === "Trekking" || adventureType === "Mountaineering" || adventureType === "Scrambling";
  const isHardPlus = ["Hard", "Advanced", "Extreme"].includes(difficulty);

  // Altitude pack
  if (isHighAlt) {
    cats.push({
      name: "High Altitude Essentials",
      icon: "🏔️",
      items: [
        { label: "Diamox (altitude sickness tablets)", essential: true },
        { label: "Pulse oximeter", essential: true },
        { label: "Portable altitude sickness test kit", essential: false },
        ...(isVeryHighAlt ? [{ label: "Supplemental oxygen cylinder", essential: false }] : []),
        { label: "Hydration salts / electrolytes", essential: true },
        { label: "High-SPF lip balm (SPF 50+)", essential: true },
        { label: "High-altitude sunscreen SPF 70+", essential: true },
      ],
    });
    tips.push({
      text: `Max altitude is ${altitudeM.toLocaleString()}m — acclimatise for at least 1 day before summit push.`,
      color: "#a78bfa",
      icon: "warn",
    });
  }

  // Cold weather / snow
  if ((isHighAlt && isTrekkingType) || isSnowSeason) {
    cats.push({
      name: "Cold Weather Gear",
      icon: "🧊",
      items: [
        { label: "Down jacket (600+ fill power)", essential: true },
        { label: "Balaclava", essential: true },
        { label: "Thermal inner gloves + outer shell gloves", essential: true },
        { label: "Insulated water bottle (keeps liquids from freezing)", essential: true },
        { label: "Hot water bottle for sleeping bag", essential: false },
        { label: "Hand & toe warmers", essential: false },
        ...(isHardPlus ? [{ label: "Micro-spike crampons (for icy trails)", essential: true }] : []),
      ],
    });
  }

  // Monsoon / rain
  if (isMonsoon || adventureType === "Trekking") {
    cats.push({
      name: "Rain & Waterproofing",
      icon: "🌧️",
      items: [
        { label: "Pack rain cover (fits your backpack)", essential: true },
        { label: "Dry bags for electronics & clothes", essential: true },
        { label: "Waterproof gaiters", essential: false },
        { label: "Quick-dry microfibre towel", essential: false },
        ...(isMonsoon ? [{ label: "Leech socks (for jungle / monsoon treks)", essential: true }] : []),
      ],
    });
    if (isMonsoon) {
      tips.push({
        text: "Monsoon season — trails can be slippery and leeches are common. Pack leech socks and an extra set of dry clothes in a sealed bag.",
        color: "#38bdf8",
        icon: "warn",
      });
    }
  }

  // ACE-gap tips (personalised)
  if (userAce) {
    const gaps: string[] = [];
    (Object.keys(adventureAce) as (keyof ACE)[]).forEach((ax) => {
      const needed = adventureAce[ax];
      const has = userAce[ax];
      if (needed >= 4 && has < needed - 1) gaps.push(ax);
    });

    if (gaps.includes("stamina")) {
      tips.push({
        text: "Your stamina score is below the adventure's requirement. Pack extra high-energy snacks and electrolytes to compensate.",
        color: "#f97316",
        icon: "tip",
      });
      cats.push({
        name: "Energy & Nutrition",
        icon: "⚡",
        items: [
          { label: "High-calorie energy bars (10+)", essential: true },
          { label: "Electrolyte powder / tabs", essential: true },
          { label: "Nuts & dried fruit mix", essential: true },
          { label: "Glucose / dextrose tablets", essential: false },
          { label: "Instant noodles / freeze-dried meals", essential: false },
        ],
      });
    }

    if (gaps.includes("altitude")) {
      tips.push({
        text: "Low altitude acclimatisation score — spend an extra day at base camp and take Diamox as a precaution.",
        color: "#a78bfa",
        icon: "warn",
      });
    }

    if (gaps.includes("water")) {
      tips.push({
        text: "Limited water experience — stay close to your guide near water crossings. Pack a throw bag if the type allows it.",
        color: "#3b82f6",
        icon: "warn",
      });
    }

    if (gaps.includes("nerve")) {
      tips.push({
        text: "Isolated terrain expected. Pack a personal GPS beacon (SPOT / Garmin inReach) for emergency signalling.",
        color: "#10b981",
        icon: "tip",
      });
      cats.push({
        name: "Emergency & Navigation",
        icon: "🛰️",
        items: [
          { label: "Personal GPS satellite communicator (SPOT / inReach)", essential: true },
          { label: "Whistle + signal mirror", essential: true },
          { label: "Emergency bivy sack / space blanket", essential: true },
          { label: "Waterproof topo map", essential: false },
          { label: "Backup compass", essential: false },
        ],
      });
    }

    if (gaps.includes("focus") || gaps.includes("agility")) {
      tips.push({
        text: "Technical terrain ahead. Take your time on exposed sections — trekking poles add stability.",
        color: "#22d3ee",
        icon: "tip",
      });
    }
  } else {
    // No profile — general tip
    tips.push({
      text: "Take the ACE assessment to get personalised packing tips based on your fitness profile.",
      color: "#ff5100",
      icon: "tip",
    });
  }

  // Tech & connectivity always useful
  cats.push({
    name: "Tech & Connectivity",
    icon: "📱",
    items: [
      { label: "Portable power bank (20,000+ mAh)", essential: true },
      { label: "Universal charging cable (USB-C)", essential: true },
      { label: "Offline maps downloaded (Google / Maps.me)", essential: true },
      { label: "Waterproof phone case / dry bag", essential: false },
      { label: "Camera (or phone gimbal)", essential: false },
      { label: "Solar charger panel", essential: false },
    ],
  });

  return { categories: cats, tips };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackingList({
  adventureType,
  difficulty,
  altitudeM = 0,
  bestSeason = "",
  adventureAce,
  slug,
}: {
  adventureType: AdventureType;
  difficulty: string;
  altitudeM?: number;
  bestSeason?: string;
  adventureAce: ACE;
  slug: string;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [activeTab, setActiveTab] = useState<"gear" | "tips">("gear");

  // Load user ACE profile
  useEffect(() => {
    const p = loadProfile();
    if (p) setUserAce(p.ace);
  }, []);

  // Persist checked state per adventure
  const storageKey = `packing-${slug}`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, [storageKey]);

  function toggle(key: string) {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      try { localStorage.setItem(storageKey, JSON.stringify([...n])); } catch { /* ignore */ }
      return n;
    });
  }

  function resetAll() {
    setChecked(new Set());
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }

  const typeCats: Category[] = TYPE_PACKS[adventureType] ?? FALLBACK_PACK;
  const { categories: smartCats, tips } = buildSmartAddons(
    adventureType, difficulty, altitudeM, bestSeason, userAce, adventureAce
  );

  const allCats: Category[] = [...BASE_GEAR, ...typeCats, ...smartCats];
  const allItems = allCats.flatMap((c) => c.items.map((i) => `${c.name}::${i.label}`));
  const essentialCount = allCats.flatMap((c) => c.items).filter((i) => i.essential).length;
  const checkedCount = checked.size;
  const pct = allItems.length > 0 ? Math.round((checkedCount / allItems.length) * 100) : 0;
  const isComplete = pct === 100;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Backpack className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Smart Packing List
              </p>
              {userAce && (
                <span
                  className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,81,0,0.12)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                >
                  <Sparkles className="w-2 h-2" />
                  ACE-personalised
                </span>
              )}
            </div>
            <p className="text-white/30 text-[10px] mt-0.5">
              {checkedCount}/{allItems.length} packed · {essentialCount} essentials · {tips.length} tip{tips.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12" fill="none"
                stroke={isComplete ? "#10b981" : "#ff5100"}
                strokeWidth="3"
                strokeDasharray={`${(pct / 100) * 75.4} 75.4`}
                strokeLinecap="round"
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
              style={{ color: isComplete ? "#10b981" : "rgba(255,255,255,0.5)" }}
            >
              {pct}%
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-white/25 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-0.5 mx-4" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${pct}%`, background: isComplete ? "#10b981" : "#ff5100" }}
        />
      </div>

      {/* ── Body ── */}
      {open && (
        <>
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-0">
            <button
              onClick={() => setActiveTab("gear")}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
              style={
                activeTab === "gear"
                  ? { background: "rgba(255,81,0,0.12)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }
                  : { background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }
              }
            >
              Gear List
            </button>
            <button
              onClick={() => setActiveTab("tips")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
              style={
                activeTab === "tips"
                  ? { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }
                  : { background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }
              }
            >
              <Lightbulb className="w-2.5 h-2.5" />
              Smart Tips {tips.length > 0 && <span className="ml-0.5 bg-amber-400/20 text-amber-300 rounded-full px-1 text-[8px]">{tips.length}</span>}
            </button>
            {checkedCount > 0 && (
              <button
                onClick={resetAll}
                className="ml-auto text-[9px] text-white/20 hover:text-white/40 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* ── Gear tab ── */}
          {activeTab === "gear" && (
            <div className="divide-y mt-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {allCats.map((cat) => (
                <div key={cat.name} className="px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25 mb-2.5 flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </p>
                  <div className="space-y-1.5">
                    {cat.items.map((item) => {
                      const key = `${cat.name}::${item.label}`;
                      const isDone = checked.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggle(key)}
                          className="w-full flex items-center gap-3 group text-left"
                        >
                          <div
                            className="flex-none w-4 h-4 rounded flex items-center justify-center transition-all"
                            style={{
                              background: isDone ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                              border: isDone ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {isDone && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                          </div>
                          <span
                            className="text-xs transition-colors flex-1"
                            style={{
                              color: isDone ? "rgba(255,255,255,0.25)" : item.essential ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.40)",
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {item.label}
                          </span>
                          {item.essential && !isDone && (
                            <span
                              className="flex-none text-[8px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                            >
                              MUST
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tips tab ── */}
          {activeTab === "tips" && (
            <div className="px-4 py-3 space-y-2.5 mt-1">
              {tips.length === 0 ? (
                <p className="text-white/25 text-xs text-center py-4">No tips for this adventure.</p>
              ) : tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                  style={{ background: `${tip.color}09`, border: `1px solid ${tip.color}20` }}
                >
                  {tip.icon === "warn"
                    ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: tip.color }} />
                    : <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: tip.color }} />
                  }
                  <p className="text-xs leading-relaxed" style={{ color: `${tip.color}cc` }}>{tip.text}</p>
                </div>
              ))}

              {!userAce && (
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 mt-1"
                  style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.15)" }}
                >
                  <p className="text-white/40 text-xs">Unlock personalised tips</p>
                  <a
                    href="/ace"
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:brightness-110"
                    style={{ background: "#ff5100", color: "#fff" }}
                  >
                    Take ACE →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Footer — complete */}
          {isComplete && (
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderTop: "1px solid rgba(16,185,129,0.1)", background: "rgba(16,185,129,0.04)" }}
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs font-semibold">All packed. You&apos;re ready to go!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
