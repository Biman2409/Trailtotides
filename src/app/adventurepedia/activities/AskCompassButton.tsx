"use client";

import { askCompass, COMPASS_GRADIENT } from "@/lib/compass";
import { CompassAIMark } from "@/components/ui/custom/BrandMarks";

/** Opens Compass.AI with a question already asked */
export default function AskCompassButton({ prompt, label }: { prompt: string; label: string }) {
  return (
    <button type="button" onClick={() => askCompass(prompt)}
      className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-[14px] font-semibold text-white transition-transform hover:-translate-y-0.5"
      style={{ background: COMPASS_GRADIENT, boxShadow: "0 8px 22px rgba(255,81,0,0.25)" }}>
      <CompassAIMark className="w-4 h-4" strokeWidth={2} />
      {label}
    </button>
  );
}
