"use client";

import { useId, useState } from "react";
import { BatteryLow, ChevronDown, MountainSnow, Pickaxe, SatelliteDish, TriangleAlert, Waves, type LucideIcon } from "lucide-react";

// "danger": one mistake can kill quickly. "caution": builds up over time and is managed by preparation.
type Tone = "danger" | "caution";

interface Hazard {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: Tone;
  risk: string;
  manage: string[];
}

const HAZARDS: Hazard[] = [
  {
    key: "fatalfall",
    label: "Fall risk",
    icon: TriangleAlert,
    tone: "danger",
    risk: "Exposed ridges, drop-offs or steep pitches where a single slip can be fatal.",
    manage: [
      "Use a rope and harness wherever the route calls for it",
      "Test each foothold, and take extra care on wet, icy or loose rock",
      "Never rush an exposed section; let faster people pass",
      "Go with a qualified guide",
    ],
  },
  {
    key: "water",
    label: "Open water",
    icon: Waves,
    tone: "danger",
    risk: "Strong currents, cold water and rough surf can drown confident swimmers. In glacial water, cold shock and hypothermia set in within minutes.",
    manage: [
      "Always wear a properly fitted life jacket (PFD)",
      "Never go into the water alone",
      "Check water levels and conditions before crossing or launching",
      "Listen to the safety briefing and practise the swimmer position",
    ],
  },
  {
    key: "altitude",
    label: "Altitude sickness",
    icon: MountainSnow,
    tone: "caution",
    risk: "Above 2,500m there's less oxygen. Headache, nausea and poor sleep are common; left untreated, it can lead to fluid on the lungs or brain (HAPE/HACE), which can kill.",
    manage: [
      "Above 3,000m, sleep no more than 300–500m higher each night, with a rest day every 3–4 days",
      "Stay hydrated and skip alcohol for the first few days",
      "Ask a doctor about acetazolamide (Diamox) before you go",
      "If symptoms get worse, go down; descent is the treatment",
    ],
  },
  {
    key: "isolation",
    label: "Remote area",
    icon: SatelliteDish,
    tone: "caution",
    risk: "You may be a day or more from the nearest road, hospital or rescue team, often with no phone signal.",
    manage: [
      "Carry a satellite messenger (e.g. Garmin inReach)",
      "Carry a full first-aid kit; ideally someone in the group has wilderness first-aid training",
      "Leave your route and return date with someone at home",
      "Check your insurance covers evacuation",
    ],
  },
  {
    key: "technical",
    label: "Technical terrain",
    icon: Pickaxe,
    tone: "caution",
    risk: "Steep scree, glacier, ice or sustained climbing needs specialist skills and kit: crampons, ice axe, rope and belaying.",
    manage: [
      "Do a basic mountaineering or climbing course first",
      "Practise with the kit before the trip, not on it",
      "Follow your guide's line and instructions exactly",
    ],
  },
  {
    key: "exhaustion",
    label: "Exhaustion",
    icon: BatteryLow,
    tone: "caution",
    risk: "Long days back to back, often with a load, drain stamina faster than people expect. Dehydration and low blood sugar make it worse quickly.",
    manage: [
      "Train with long walks carrying a loaded pack in the weeks before",
      "Keep a pace you can still talk at",
      "Eat every 2–3 hours and drink before you're thirsty",
      "Tell your guide early if you're struggling; turning back is normal",
    ],
  },
];

const TONE: Record<Tone, { text: string; chip: string; chipOpen: string; panel: string }> = {
  danger: {
    text: "text-red-700 dark:text-red-300",
    chip: "bg-red-500/[0.07] border-red-600/25 dark:border-red-400/25 hover:bg-red-500/[0.12]",
    chipOpen: "bg-red-500/[0.14] border-red-600/50 dark:border-red-400/50",
    panel: "bg-red-500/[0.05] border-red-600/20 dark:border-red-400/20",
  },
  caution: {
    text: "text-amber-700 dark:text-amber-300",
    chip: "bg-amber-500/[0.07] border-amber-600/25 dark:border-amber-400/25 hover:bg-amber-500/[0.12]",
    chipOpen: "bg-amber-500/[0.14] border-amber-600/50 dark:border-amber-400/50",
    panel: "bg-amber-500/[0.05] border-amber-600/20 dark:border-amber-400/20",
  },
};

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
  const panelId = useId();

  const shown: Record<string, boolean> = {
    altitude: showAltitude,
    exhaustion: showExhaustion,
    fatalfall: showFatalFall,
    isolation: showIsolation,
    technical: showTechnical,
    water: showWater,
  };
  // Most dangerous first
  const visible = HAZARDS.filter((h) => shown[h.key]);
  const open = visible.find((h) => h.key === active) ?? null;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <p className="text-[13px] tracking-[0.1em] mb-2.5" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>
        key risks · tap one for how to manage it
      </p>

      <div className="flex flex-wrap gap-2">
        {visible.map((h) => {
          const isOpen = active === h.key;
          const tone = TONE[h.tone];
          const Icon = h.icon;
          return (
            <button
              key={h.key}
              type="button"
              onClick={() => setActive(isOpen ? null : h.key)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={`inline-flex items-center gap-2 min-h-9 pl-3 pr-2.5 rounded-full border text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${tone.text} ${isOpen ? tone.chipOpen : tone.chip}`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
              {h.label}
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
          );
        })}
      </div>

      <div id={panelId} role="region" aria-live="polite" aria-label={open ? `${open.label}: how to manage it` : undefined}>
        {open && (
          <div key={open.key} className={`hazard-panel mt-3 rounded-2xl border px-4 py-3.5 ${TONE[open.tone].panel}`}>
            <div className={`flex items-center gap-2 mb-1.5 ${TONE[open.tone].text}`}>
              <open.icon className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
              <p className="text-[13px] font-semibold">{open.label}</p>
              {open.tone === "danger" && (
                <span className="ml-auto text-[11px] font-semibold uppercase tracking-wider opacity-80">Can be fatal</span>
              )}
            </div>
            <p className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>{open.risk}</p>
            <p className="text-[13px] tracking-[0.1em] mt-3 mb-1.5" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>
              how to manage it
            </p>
            <ul className="space-y-1.5">
              {open.manage.map((m) => (
                <li key={m} className="flex gap-2.5 text-[14px] leading-[1.5]" style={{ color: "var(--text-secondary)" }}>
                  <span className={`mt-[0.55em] w-1.5 h-1.5 rounded-full shrink-0 bg-current ${TONE[open.tone].text}`} aria-hidden />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
