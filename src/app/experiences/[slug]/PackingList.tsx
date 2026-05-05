"use client";

import React, { useState, useEffect } from "react";
import {
  Backpack, Check, ChevronDown, IdCard, HeartPulse,
  Shirt, Pickaxe, Bike, Waves, Mountain,
  Snowflake, Zap, Satellite, Smartphone, Thermometer, CloudRain,
  Anchor, Wind, LogIn, Plus, Share2, X, Copy, CheckCheck,
} from "lucide-react";
import type { AdventureType } from "@/lib/data";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE } from "@/lib/ace";

interface Item {
  label: string;
  essential: boolean;
  custom?: boolean;
}

type LucideIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

interface Category {
  name: string;
  Icon: LucideIcon;
  items: Item[];
}

// ─── Base gear (every adventure) ─────────────────────────────────────────────

const BASE_GEAR: Category[] = [
  {
    name: "Documents & Money",
    Icon: IdCard,
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
    Icon: HeartPulse,
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
      Icon: Backpack,
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
      Icon: Shirt,
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
      Icon: Pickaxe,
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
      Icon: Shirt,
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
  Motorcycling: [
    {
      name: "Riding Gear",
      Icon: Bike,
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
      Icon: Shirt,
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
      Icon: Bike,
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
      Icon: Shirt,
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
      Icon: Anchor,
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
      Icon: Waves,
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
      Icon: Snowflake,
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
      Icon: Shirt,
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
      Icon: Mountain,
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
      Icon: Mountain,
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
      Icon: Wind,
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
    Icon: Backpack,
    items: [
      { label: "Suitable footwear for activity", essential: true },
      { label: "Activity-specific protective gear", essential: true },
      { label: "Hydration (2L minimum)", essential: true },
      { label: "Navigation tool / map", essential: false },
    ],
  },
];

function buildSmartAddons(
  adventureType: AdventureType,
  difficulty: string,
  altitudeM: number,
  bestSeason: string,
  userAce: ACE | null,
  adventureAce: ACE,
): { categories: Category[] } {
  const cats: Category[] = [];

  const isHighAlt = altitudeM >= 3500;
  const isVeryHighAlt = altitudeM >= 4500;
  const isSnowSeason = /dec|jan|feb|nov/i.test(bestSeason) || bestSeason.toLowerCase().includes("winter");
  const isMonsoon = /jun|jul|aug/i.test(bestSeason);
  const isTrekkingType = adventureType === "Trekking" || adventureType === "Mountaineering" || adventureType === "Scrambling";
  const isHardPlus = ["Hard", "Advanced", "Extreme"].includes(difficulty);

  if (isHighAlt) {
    cats.push({
      name: "High Altitude Essentials",
      Icon: Mountain,
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
  }

  if ((isHighAlt && isTrekkingType) || isSnowSeason) {
    cats.push({
      name: "Cold Weather Gear",
      Icon: Thermometer,
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

  if (isMonsoon || adventureType === "Trekking") {
    cats.push({
      name: "Rain & Waterproofing",
      Icon: CloudRain,
      items: [
        { label: "Pack rain cover (fits your backpack)", essential: true },
        { label: "Dry bags for electronics & clothes", essential: true },
        { label: "Waterproof gaiters", essential: false },
        { label: "Quick-dry microfibre towel", essential: false },
        ...(isMonsoon ? [{ label: "Leech socks (for jungle / monsoon treks)", essential: true }] : []),
      ],
    });
  }

  if (userAce) {
    const gaps: string[] = [];
    (Object.keys(adventureAce) as (keyof ACE)[]).forEach((ax) => {
      const needed = adventureAce[ax];
      const has = userAce[ax];
      if (needed >= 4 && has < needed - 1) gaps.push(ax);
    });

    if (gaps.includes("stamina")) {
      cats.push({
        name: "Energy & Nutrition",
        Icon: Zap,
        items: [
          { label: "High-calorie energy bars (10+)", essential: true },
          { label: "Electrolyte powder / tabs", essential: true },
          { label: "Nuts & dried fruit mix", essential: true },
          { label: "Glucose / dextrose tablets", essential: false },
          { label: "Instant noodles / freeze-dried meals", essential: false },
        ],
      });
    }

    if (gaps.includes("nerve")) {
      cats.push({
        name: "Emergency & Navigation",
        Icon: Satellite,
        items: [
          { label: "Personal GPS satellite communicator (SPOT / inReach)", essential: true },
          { label: "Whistle + signal mirror", essential: true },
          { label: "Emergency bivy sack / space blanket", essential: true },
          { label: "Waterproof topo map", essential: false },
          { label: "Backup compass", essential: false },
        ],
      });
    }
  }

  cats.push({
    name: "Tech & Connectivity",
    Icon: Smartphone,
    items: [
      { label: "Portable power bank (20,000+ mAh)", essential: true },
      { label: "Universal charging cable (USB-C)", essential: true },
      { label: "Offline maps downloaded (Google / Maps.me)", essential: true },
      { label: "Waterproof phone case / dry bag", essential: false },
      { label: "Camera (or phone gimbal)", essential: false },
      { label: "Solar charger panel", essential: false },
    ],
  });

  return { categories: cats };
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({
  onClose,
  allCats,
  customItems,
  checked,
  adventureType,
}: {
  onClose: () => void;
  allCats: Category[];
  customItems: Record<string, string[]>;
  checked: Set<string>;
  adventureType: string;
}) {
  const [copied, setCopied] = useState(false);

  function buildText() {
    const lines: string[] = [`📦 Packing List — ${adventureType}`, ""];
    for (const cat of allCats) {
      const customs = customItems[cat.name] ?? [];
      const allItems = [...cat.items, ...customs.map(l => ({ label: l, essential: false, custom: true }))];
      lines.push(`── ${cat.name} ──`);
      for (const item of allItems) {
        const key = `${cat.name}::${item.label}`;
        const done = checked.has(key);
        lines.push(`${done ? "✅" : "☐"} ${item.label}${item.essential ? " ⚡" : ""}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#111820", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p className="text-white font-bold text-sm">Share Packing List</p>
            <p className="text-white/35 text-xs mt-0.5">Copy as text to share anywhere</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors" style={{ background: "rgba(255,255,255,0.06)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <pre
            className="text-[11px] text-white/50 leading-relaxed rounded-xl p-3 overflow-auto max-h-56 font-mono"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {buildText()}
          </pre>

          <button
            onClick={handleCopy}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: copied ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg, #ff5100, #ff7d47)", border: copied ? "1px solid rgba(16,185,129,0.3)" : "none", color: copied ? "#4ade80" : "white" }}
          >
            {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackingList({
  adventureType,
  difficulty,
  altitudeM = 0,
  bestSeason = "",
  adventureAce,
  slug,
  loggedIn = false,
}: {
  adventureType: AdventureType;
  difficulty: string;
  altitudeM?: number;
  bestSeason?: string;
  adventureAce: ACE;
  slug: string;
  loggedIn?: boolean;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [customItems, setCustomItems] = useState<Record<string, string[]>>({});
  const [newItemText, setNewItemText] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p) setUserAce(p.ace);
  }, []);

  const storageKey = `packing-${slug}`;
  const customKey = `packing-custom-${slug}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(new Set(JSON.parse(raw)));
      const rawCustom = localStorage.getItem(customKey);
      if (rawCustom) setCustomItems(JSON.parse(rawCustom));
    } catch { /* ignore */ }
  }, [storageKey, customKey]);

  function toggle(key: string) {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      try { localStorage.setItem(storageKey, JSON.stringify([...n])); } catch { /* ignore */ }
      return n;
    });
  }

  function addCustomItem(catName: string) {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    setCustomItems(prev => {
      const updated = { ...prev, [catName]: [...(prev[catName] ?? []), trimmed] };
      try { localStorage.setItem(customKey, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    setNewItemText("");
  }

  function removeCustomItem(catName: string, label: string) {
    setCustomItems(prev => {
      const updated = { ...prev, [catName]: (prev[catName] ?? []).filter(i => i !== label) };
      try { localStorage.setItem(customKey, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    const key = `${catName}::${label}`;
    setChecked(prev => {
      const n = new Set(prev);
      n.delete(key);
      try { localStorage.setItem(storageKey, JSON.stringify([...n])); } catch { /* ignore */ }
      return n;
    });
  }

  function resetAll() {
    setChecked(new Set());
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }

  const typeCats: Category[] = TYPE_PACKS[adventureType] ?? FALLBACK_PACK;
  const { categories: smartCats } = buildSmartAddons(adventureType, difficulty, altitudeM, bestSeason, userAce, adventureAce);
  const allCats: Category[] = [...BASE_GEAR, ...typeCats, ...smartCats];

  const allItems = allCats.flatMap((c) => {
    const customs = customItems[c.name] ?? [];
    return [
      ...c.items.map((i) => `${c.name}::${i.label}`),
      ...customs.map(l => `${c.name}::${l}`),
    ];
  });
  const essentialCount = allCats.flatMap((c) => c.items).filter((i) => i.essential).length;
  const checkedCount = checked.size;
  const pct = allItems.length > 0 ? Math.round((checkedCount / allItems.length) * 100) : 0;
  const isComplete = pct === 100;

  return (
    <>
      {shareOpen && (
        <ShareModal
          onClose={() => setShareOpen(false)}
          allCats={allCats}
          customItems={customItems}
          checked={checked}
          adventureType={adventureType}
        />
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* ── Header ── */}
        <button
          onClick={() => loggedIn && setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Backpack className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Smart Packing List</p>
              <p className="text-white/30 text-[10px] mt-0.5">
                {checkedCount}/{allItems.length} packed · {essentialCount} essentials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <>
                {/* Share button */}
                <button
                  onClick={e => { e.stopPropagation(); setShareOpen(true); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:text-white/60"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}
                  title="Share packing list"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
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
                <ChevronDown className={`w-4 h-4 text-white/25 transition-transform ${open ? "rotate-180" : ""}`} />
              </>
            ) : (
              <a
                href="/auth/login"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: "#ff5100" }}
              >
                <LogIn className="w-3 h-3" />
                Log in
              </a>
            )}
          </div>
        </button>

        {/* Progress bar */}
        {loggedIn && (
          <div className="h-0.5 mx-4" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{ width: `${pct}%`, background: isComplete ? "#10b981" : "#ff5100" }}
            />
          </div>
        )}

        {/* ── Body ── */}
        {open && loggedIn && (() => {
          const safeTab = Math.min(activeTab, allCats.length - 1);
          const cat = allCats[safeTab];
          const CatIcon = cat.Icon;
          const customs = customItems[cat.name] ?? [];
          const allCatItems = [...cat.items, ...customs.map(l => ({ label: l, essential: false, custom: true as const }))];
          const catChecked = allCatItems.filter(i => checked.has(`${cat.name}::${i.label}`)).length;
          const catPct = allCatItems.length > 0 ? Math.round((catChecked / allCatItems.length) * 100) : 0;

          return (
            <>
              {/* Tab bar */}
              <div
                className="flex gap-1 px-3 pt-3 pb-0 overflow-x-auto no-scrollbar"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                {allCats.map((c, i) => {
                  const TabIcon = c.Icon;
                  const tabCustoms = customItems[c.name] ?? [];
                  const tabAllItems = [...c.items, ...tabCustoms.map(l => ({ label: l, essential: false }))];
                  const tabChecked = tabAllItems.filter(it => checked.has(`${c.name}::${it.label}`)).length;
                  const tabDone = tabChecked === tabAllItems.length && tabAllItems.length > 0;
                  const isActive = i === safeTab;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setActiveTab(i)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-t-lg text-[10px] font-bold whitespace-nowrap shrink-0 transition-all"
                      style={isActive
                        ? { color: "#ff7d47", background: "rgba(255,81,0,0.08)", borderBottom: "2px solid #ff5100" }
                        : { color: "rgba(255,255,255,0.3)", background: "transparent", borderBottom: "2px solid transparent" }
                      }
                    >
                      <TabIcon className="w-3 h-3 shrink-0" />
                      <span className="hidden sm:inline">{c.name}</span>
                      {tabDone
                        ? <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#10b981" }} />
                        : tabChecked > 0
                          ? <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#ff5100" }} />
                          : null
                      }
                    </button>
                  );
                })}
                {checkedCount > 0 && (
                  <button
                    onClick={resetAll}
                    className="ml-auto text-[9px] text-white/20 hover:text-white/40 transition-colors px-2 py-2 shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Active tab header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-2">
                  <CatIcon className="w-3.5 h-3.5" style={{ color: catPct === 100 ? "#10b981" : "#ff7d47" }} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: catPct === 100 ? "#10b981" : "rgba(255,255,255,0.4)" }}>
                    {cat.name}
                  </p>
                </div>
                <span className="text-[9px] font-semibold" style={{ color: catPct === 100 ? "#10b981" : "rgba(255,255,255,0.25)" }}>
                  {catChecked}/{allCatItems.length}
                </span>
              </div>

              {/* Item list */}
              <div className="px-4 pb-2 space-y-1.5 pt-1">
                {allCatItems.map((item) => {
                  const key = `${cat.name}::${item.label}`;
                  const isDone = checked.has(key);
                  return (
                    <div key={key} className="flex items-center gap-3 group">
                      <button
                        onClick={() => toggle(key)}
                        className="flex items-center gap-3 text-left flex-1"
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
                            color: isDone ? "rgba(255,255,255,0.22)" : item.essential ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.42)",
                            textDecoration: isDone ? "line-through" : "none",
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                      {item.essential && !isDone && (
                        <span
                          className="flex-none text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                        >
                          MUST
                        </span>
                      )}
                      {item.custom && (
                        <button
                          onClick={() => removeCustomItem(cat.name, item.label)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add custom item */}
                <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <input
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(cat.name); } }}
                    placeholder="Add custom item…"
                    className="flex-1 bg-transparent text-xs text-white/60 placeholder:text-white/20 outline-none"
                  />
                  <button
                    onClick={() => addCustomItem(cat.name)}
                    disabled={!newItemText.trim()}
                    className="w-5 h-5 rounded flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: "rgba(255,81,0,0.15)", color: "#ff7d47" }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tab complete banner */}
              {catPct === 100 && !isComplete && (
                <div
                  className="mx-4 mb-3 px-3 py-2 rounded-lg flex items-center gap-2"
                  style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-emerald-400/80 text-[10px] font-semibold">{cat.name} packed!</p>
                </div>
              )}

              {/* All complete footer */}
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
          );
        })()}
      </div>
    </>
  );
}
