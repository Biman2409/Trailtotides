"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Badge {
  key: string;
  label: string;
  description: string;
  textColor: string;
  bg: string;
  border: string;
}

const BADGES: Badge[] = [
  {
    key: "altitude",
    label: "Altitude Sickness",
    description:
      "Reduced oxygen above 2,500m can cause headaches, nausea, dizziness and, in severe cases, life-threatening pulmonary or cerebral oedema. Acclimatise gradually — gain no more than 300–500m per day above 3,000m. Carry Diamox as a precaution and descend immediately if symptoms worsen.",
    textColor: "#facc15",
    bg: "rgba(234,179,8,0.08)",
    border: "rgba(234,179,8,0.18)",
  },
  {
    key: "exhaustion",
    label: "Physical Exhaustion",
    description:
      "Back-to-back long days at altitude with heavy loads push stamina to its limit. Dehydration, muscle failure, and hypoglycaemia compound quickly. Maintain a steady pace, eat every 2–3 hours, hydrate before you feel thirsty, and rest at the first sign of significant fatigue.",
    textColor: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.18)",
  },
  {
    key: "fatalfall",
    label: "Fatal Fall Risk",
    description:
      "Exposed ridgelines, sheer drop-offs, or technical pitches where a single slip can be fatal. Use a rope and harness on sections requiring it, check footing before each step, avoid wet or icy rock, and never rush past exposure. Guide presence is strongly recommended.",
    textColor: "#f87171",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.18)",
  },
  {
    key: "isolation",
    label: "Extreme Isolation",
    description:
      "You may be days from the nearest road, hospital, or rescue team. Satellite communicators (SPOT / Garmin inReach) are essential. Carry a comprehensive first-aid kit and ensure at least one team member has wilderness first-aid training. File a detailed trip plan before departure.",
    textColor: "#38bdf8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.18)",
  },
  {
    key: "technical",
    label: "Technical Terrain",
    description:
      "Steep scree, glacier travel, mixed climbing, or sustained vertical sections require specialised movement skills and equipment — crampons, ice axe, rope, and belay experience. Attempting without proper training significantly raises injury risk.",
    textColor: "#c084fc",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.18)",
  },
  {
    key: "water",
    label: "Open Water",
    description:
      "Strong currents, cold water, or rough surf create drowning risk even for confident swimmers. Always wear a certified PFD, never enter water alone, and check river levels before any crossing. Hypothermia can set in within minutes in glacial streams.",
    textColor: "#60a5fa",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.18)",
  },
];

export default function HazardBadges({
  showAltitude,
  showExhaustion,
  showFatalFall,
  showIsolation,
  showTechnical,
  showWater,
}: {
  showAltitude: boolean;
  showExhaustion: boolean;
  showFatalFall: boolean;
  showIsolation: boolean;
  showTechnical: boolean;
  showWater: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);

  const visible = BADGES.filter((b) => {
    if (b.key === "altitude")   return showAltitude;
    if (b.key === "exhaustion") return showExhaustion;
    if (b.key === "fatalfall")  return showFatalFall;
    if (b.key === "isolation")  return showIsolation;
    if (b.key === "technical")  return showTechnical;
    if (b.key === "water")      return showWater;
    return false;
  });

  const activeBadge = visible.find((b) => b.key === active) ?? null;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(245,158,11,0.08)" }}>
      <div className="flex flex-wrap gap-2">
        {visible.map((b) => {
          const isOpen = active === b.key;
          return (
            <button
              key={b.key}
              onClick={() => setActive(isOpen ? null : b.key)}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all"
              style={{
                color: b.textColor,
                background: isOpen ? b.bg.replace("0.08", "0.14") : b.bg,
                border: `1px solid ${isOpen ? b.border.replace("0.18", "0.35") : b.border}`,
                boxShadow: isOpen ? `0 0 0 1px ${b.border}` : "none",
              }}
            >
              ⚠ {b.label}
              <ChevronDown
                className="w-3 h-3 transition-transform"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
          );
        })}
      </div>

      {/* Expanded description */}
      {activeBadge && (
        <div
          className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: activeBadge.bg.replace("0.08", "0.06"),
            border: `1px solid ${activeBadge.border}`,
          }}
        >
          <span className="text-base shrink-0 mt-0.5">⚠</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: activeBadge.textColor }}>
              {activeBadge.label}
            </p>
            <p className="text-white/55 text-xs leading-relaxed">{activeBadge.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
