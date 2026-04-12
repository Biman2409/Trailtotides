"use client";

import { useState } from "react";
import { Backpack, Check, ChevronDown } from "lucide-react";
import type { AdventureType } from "@/lib/data";

interface Item {
  label: string;
  essential: boolean;
}

interface Category {
  name: string;
  items: Item[];
}

const BASE_GEAR: Category[] = [
  {
    name: "Documents & Money",
    items: [
      { label: "Government ID / Aadhaar", essential: true },
      { label: "Emergency contact card", essential: true },
      { label: "Cash (ATMs rare in mountains)", essential: true },
      { label: "Travel insurance documents", essential: false },
    ],
  },
  {
    name: "Clothing",
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
  {
    name: "First Aid",
    items: [
      { label: "Diamox (altitude sickness)", essential: true },
      { label: "Personal medications", essential: true },
      { label: "Blister plasters", essential: true },
      { label: "Antiseptic wipes", essential: true },
      { label: "Paracetamol / Ibuprofen", essential: true },
      { label: "ORS sachets", essential: false },
      { label: "Pulse oximeter", essential: false },
    ],
  },
];

const TYPE_PACKS: Record<string, Category[]> = {
  Trekking: [
    {
      name: "Trek Gear",
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
        { label: "Micro-spike crampons (winter)", essential: false },
        { label: "Trekking map / downloaded offline map", essential: false },
      ],
    },
  ],
  Mountaineering: [
    {
      name: "Climbing Gear",
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
  ],
  Biking: [
    {
      name: "Riding Gear",
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
  ],
  Cycling: [
    {
      name: "Cycling Gear",
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
  ],
  Diving: [
    {
      name: "Dive Equipment",
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
  ],
  "Rock Climbing": [
    {
      name: "Climbing Gear",
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
    items: [
      { label: "Suitable footwear for activity", essential: true },
      { label: "Activity-specific protective gear", essential: true },
      { label: "Hydration (2L minimum)", essential: true },
      { label: "Navigation tool / map", essential: false },
    ],
  },
];

export default function PackingList({
  adventureType,
  difficulty,
}: {
  adventureType: AdventureType;
  difficulty: string;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const typeCats: Category[] = TYPE_PACKS[adventureType] ?? FALLBACK_PACK;
  const allCats: Category[] = [...BASE_GEAR, ...typeCats];

  // Add cold weather gear for hard+ treks
  if (
    (adventureType === "Trekking" || adventureType === "Mountaineering") &&
    ["Hard", "Advanced", "Extreme"].includes(difficulty)
  ) {
    allCats.push({
      name: "Cold & High Altitude",
      items: [
        { label: "Down jacket (600+ fill power)", essential: true },
        { label: "Balaclava", essential: true },
        { label: "High-altitude sunscreen SPF 70+", essential: true },
        { label: "Lip balm SPF 30+", essential: false },
        { label: "Hot water bottle for sleeping bag", essential: false },
      ],
    });
  }

  const allItems = allCats.flatMap((c) => c.items.map((i) => `${c.name}::${i.label}`));
  const essentialCount = allCats.flatMap((c) => c.items).filter((i) => i.essential).length;
  const checkedCount = checked.size;
  const pct = allItems.length > 0 ? Math.round((checkedCount / allItems.length) * 100) : 0;

  function toggle(key: string) {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Backpack className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              Packing List
            </p>
            <p className="text-white/30 text-[10px] mt-0.5">
              {checkedCount}/{allItems.length} packed · {essentialCount} essentials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke={pct === 100 ? "#10b981" : "#ff5100"}
                strokeWidth="3"
                strokeDasharray={`${(pct / 100) * 75.4} 75.4`}
                strokeLinecap="round"
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
              style={{ color: pct === 100 ? "#10b981" : "rgba(255,255,255,0.5)" }}
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
          style={{
            width: `${pct}%`,
            background: pct === 100 ? "#10b981" : "#ff5100",
          }}
        />
      </div>

      {/* Checklist */}
      {open && (
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {allCats.map((cat) => (
            <div key={cat.name} className="px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25 mb-2.5">
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
                          background: isDone
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(255,255,255,0.04)",
                          border: isDone
                            ? "1px solid rgba(16,185,129,0.35)"
                            : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {isDone && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                      </div>
                      <span
                        className="text-xs transition-colors"
                        style={{
                          color: isDone
                            ? "rgba(255,255,255,0.25)"
                            : item.essential
                            ? "rgba(255,255,255,0.65)"
                            : "rgba(255,255,255,0.40)",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {item.label}
                      </span>
                      {item.essential && !isDone && (
                        <span
                          className="ml-auto flex-none text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: "rgba(255,81,0,0.1)",
                            color: "#ff7d47",
                            border: "1px solid rgba(255,81,0,0.2)",
                          }}
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

      {/* Footer CTA */}
      {open && pct === 100 && (
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderTop: "1px solid rgba(16,185,129,0.1)", background: "rgba(16,185,129,0.04)" }}
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <p className="text-emerald-400 text-xs font-semibold">All packed. You&apos;re ready to go!</p>
        </div>
      )}
    </div>
  );
}
