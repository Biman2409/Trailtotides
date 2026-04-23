"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, MapPin, Clock, Mountain, Sunrise } from "lucide-react";
import type { AdventureType } from "@/lib/data";

interface DayPlan {
  day: number;
  title: string;
  from?: string;
  to?: string;
  distance?: string;
  altGain?: string;
  highlights: string[];
  accommodation?: string;
  duration?: string;
}

// Generate a plausible itinerary from adventure data
function generateItinerary(
  adventureName: string,
  adventureType: AdventureType,
  durationDays: string,
  baseCamp?: string,
  startingPoint?: string,
  altitude?: string
): DayPlan[] {
  const days = parseInt(durationDays, 10);
  if (!days || days < 1) return [];

  // Trek/Mountaineering itineraries
  if (adventureType === "Trekking" || adventureType === "Mountaineering" || adventureType === "Scrambling") {
    const arrivalCity = startingPoint ?? baseCamp ?? "nearest town";
    const plans: DayPlan[] = [];

    if (days <= 3) {
      return [
        { day: 1, title: `Arrive & Acclimatise`, from: arrivalCity, to: baseCamp ?? "Base Camp", distance: "4–8 km", altGain: "300–600m", highlights: ["Check in with guide team", "Gear check and briefing", "Short acclimatisation walk"], accommodation: "Guesthouse / campsite", duration: "4–6 hrs" },
        ...Array.from({ length: days - 2 }, (_, i) => ({
          day: i + 2, title: `Trail Day ${i + 1}`, distance: "8–14 km", altGain: "500–900m", highlights: ["Full day on trail", "Ridge and valley sections", "Alpine flora and wildlife"], accommodation: "Campsite", duration: "6–8 hrs",
        })),
        { day: days, title: `Descent & Departure`, distance: "8–12 km", highlights: ["Early morning descent", "Return to roadhead", "Certificate / debrief"], accommodation: "Own arrangement", duration: "5–7 hrs" },
      ].filter((_, i) => i < days);
    }

    plans.push({ day: 1, title: `Travel & Arrival`, from: "Origin city", to: arrivalCity, highlights: ["Arrive and check in", "Meet guide team and fellow trekkers", "Gear check and equipment issue", "Trek briefing"], accommodation: "Guesthouse", duration: "Drive / transit" });
    plans.push({ day: 2, title: `Acclimatisation Day`, from: arrivalCity, to: baseCamp ?? "Trail head", distance: "6–10 km", altGain: "400–700m", highlights: ["Gentle warm-up hike", "Adjust to altitude", "Village exploration"], accommodation: "Guesthouse / campsite", duration: "4–5 hrs" });

    const midDays = days - 4;
    const altNum = altitude ? parseInt(altitude.replace(/[^0-9]/g, ""), 10) : 3500;
    const gainPerDay = midDays > 0 ? Math.round((altNum - 1800) / midDays) : 600;

    for (let i = 0; i < midDays; i++) {
      const isHighPoint = i === Math.floor(midDays * 0.7);
      const isSummit = altNum > 5000 && i === midDays - 1;
      plans.push({
        day: i + 3,
        title: isSummit ? `Summit Push` : isHighPoint ? `High Camp` : `Trail Day ${i + 1}`,
        distance: isSummit ? "6–10 km" : "10–16 km",
        altGain: isSummit ? `${Math.round(gainPerDay * 1.5)}m` : `${gainPerDay}m`,
        highlights: isSummit
          ? ["Pre-dawn summit attempt", "360° panoramic views", "Careful descent to camp"]
          : isHighPoint
          ? ["Sustained ascent to high camp", "Panoramic views open up", "Acclimatisation walk from camp"]
          : ["Sustained trekking on ridge trail", "Alpine meadows and stream crossings", "Wildlife and bird watching"],
        accommodation: isSummit ? "High camp / tent" : "Campsite",
        duration: isSummit ? "8–12 hrs" : "6–8 hrs",
      });
    }

    plans.push({ day: days - 1, title: `Final Descent`, distance: "10–15 km", highlights: ["Long descent on good trail", "Celebration dinner with team", "Debrief with guide"], accommodation: "Guesthouse", duration: "6–7 hrs" });
    plans.push({ day: days, title: `Return Journey`, highlights: ["Early morning checkout", "Transport to origin city", "Certificate handover"], accommodation: "Own arrangement", duration: "Drive / transit" });

    return plans.slice(0, days);
  }

  // Motorcycling itineraries
  if (adventureType === "Motorcycling" || adventureType === "Cycling") {
    const start = startingPoint ?? "Start city";
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: i === 0
        ? `Departure from ${start}`
        : i === days - 1
        ? `Final Stretch & Arrival`
        : `Day ${i + 1} — Road & Pass`,
      from: i === 0 ? start : undefined,
      distance: i === 0 ? "80–120 km" : i === days - 1 ? "60–100 km" : "120–180 km",
      highlights: i === 0
        ? ["Morning assembly and bike check", "First pass crossing", "Overnight at dhaba / homestay"]
        : i === days - 1
        ? ["Final high pass", "Descent into destination", "Celebration stop"]
        : ["High-altitude pass crossing", "River valley riding", "Fuel at remote stations"],
      accommodation: i === days - 1 ? "Hotel" : "Guesthouse / homestay",
      duration: `${Math.round(4 + i * 0.3)}–${Math.round(6 + i * 0.3)} hrs riding`,
    }));
  }

  // Generic fallback
  return Array.from({ length: Math.min(days, 7) }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? "Arrival & Briefing" : i === days - 1 ? "Departure" : `Day ${i + 1}`,
    highlights: i === 0
      ? ["Arrive and settle in", "Meet your guide team", "Equipment check"]
      : i === days - 1
      ? ["Last activity session", "Pack up and checkout", "Transfers out"]
      : ["Main activity of the day", "Guided session with instructor", "Rest and recovery"],
    accommodation: i === days - 1 ? "Own arrangement" : "Included accommodation",
    duration: "Full day",
  }));
}

interface Props {
  adventureName: string;
  adventureType: AdventureType;
  durationDays: string;
  baseCamp?: string;
  startingPoint?: string;
  altitude?: string;
}

export default function ItinerarySection({
  adventureName,
  adventureType,
  durationDays,
  baseCamp,
  startingPoint,
  altitude,
}: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const plans = generateItinerary(adventureName, adventureType, durationDays, baseCamp, startingPoint, altitude);
  if (plans.length === 0) return null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <CalendarDays className="w-4 h-4 text-violet-400" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
          Sample Itinerary
        </p>
        <span
          className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          {plans.length} days
        </span>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3 space-y-1">
        {plans.map((day, i) => {
          const isExpanded = expandedDay === day.day;
          const isLast = i === plans.length - 1;
          return (
            <div key={day.day} className="relative flex gap-3">
              {/* Timeline connector */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-none z-10"
                  style={{
                    background:
                      day.title.includes("Summit") || day.title.includes("Pass")
                        ? "rgba(255,81,0,0.18)"
                        : "rgba(139,92,246,0.15)",
                    border:
                      day.title.includes("Summit") || day.title.includes("Pass")
                        ? "1px solid rgba(255,81,0,0.35)"
                        : "1px solid rgba(139,92,246,0.25)",
                    color:
                      day.title.includes("Summit") || day.title.includes("Pass")
                        ? "#ff7d47"
                        : "#a78bfa",
                  }}
                >
                  {day.day}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 mt-1" style={{ background: "rgba(255,255,255,0.06)", minHeight: "16px" }} />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 pb-3">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white/70 text-xs font-semibold leading-snug">{day.title}</p>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/20 transition-transform flex-none ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {day.distance && (
                      <span className="flex items-center gap-1 text-[9px] text-white/25">
                        <MapPin className="w-2.5 h-2.5" />
                        {day.distance}
                      </span>
                    )}
                    {day.altGain && (
                      <span className="flex items-center gap-1 text-[9px] text-white/25">
                        <Mountain className="w-2.5 h-2.5" />
                        +{day.altGain}
                      </span>
                    )}
                    {day.duration && (
                      <span className="flex items-center gap-1 text-[9px] text-white/25">
                        <Clock className="w-2.5 h-2.5" />
                        {day.duration}
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2.5 space-y-2">
                    {/* Highlights */}
                    <ul className="space-y-1">
                      {day.highlights.map((h, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-violet-400/60 text-[10px] mt-0.5 flex-none">▸</span>
                          <span className="text-white/45 text-xs leading-snug">{h}</span>
                        </li>
                      ))}
                    </ul>
                    {/* Route */}
                    {(day.from || day.to) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/25 pt-1">
                        <Sunrise className="w-3 h-3" />
                        {day.from && <span>{day.from}</span>}
                        {day.from && day.to && <span>→</span>}
                        {day.to && <span>{day.to}</span>}
                      </div>
                    )}
                    {/* Accommodation */}
                    {day.accommodation && (
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px]"
                        style={{ background: "rgba(139,92,246,0.08)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.15)" }}
                      >
                        🏕 {day.accommodation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="px-4 py-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}
      >
        <p className="text-[9px] text-white/20">
          Sample itinerary. Actual schedule may vary by operator and conditions.
        </p>
      </div>
    </div>
  );
}
