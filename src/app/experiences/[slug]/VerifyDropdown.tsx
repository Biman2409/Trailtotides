"use client";

import { useState } from "react";
import { BadgeCheck, CheckCircle2, ChevronDown } from "lucide-react";

const CRITERIA = [
  "Valid government permits & licenses",
  "ATOAI / IMF / PADI certification confirmed",
  "Certified & trained local guides on staff",
  "Safety gear & evacuation protocols in place",
  "Independently reviewed by our team on-ground",
  "Consistent track record over 2+ seasons",
];

export default function VerifyDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="mb-8 rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(16,185,129,0.14)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
        style={{ background: "rgba(16,185,129,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-emerald-400/80 text-xs font-bold tracking-[0.15em] uppercase">
            How We Verify Operators
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-emerald-400/50 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
          style={{ borderTop: "1px solid rgba(16,185,129,0.10)", background: "rgba(16,185,129,0.02)" }}
        >
          {CRITERIA.map((text) => (
            <div key={text} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
              <span className="text-white/40 text-xs">{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
