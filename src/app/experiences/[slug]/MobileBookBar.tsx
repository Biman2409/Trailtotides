"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

interface Props {
  adventureName: string;
  priceFrom?: string;
  difficulty: string;
  duration: string;
  operatorWebsite?: string;
  operatorName?: string;
}

export default function MobileBookBar({ adventureName, priceFrom, difficulty, duration, operatorWebsite, operatorName }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const threshold = window.innerHeight * 0.8;
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBook = () => {
    if (operatorWebsite) {
      window.open(operatorWebsite, "_blank", "noopener noreferrer");
    } else {
      const el = document.getElementById("operators-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[999] transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      {/* Blur backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(8,10,18,0.97) 60%, rgba(8,10,18,0.0) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      />

      <div className="relative px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {/* Top row — name + price */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#ff5100]/80 mb-0.5">Book This Adventure</p>
            <p className="text-white font-semibold text-sm leading-snug truncate">{adventureName}</p>
            <p className="text-white/35 text-[11px] mt-0.5 truncate">
              {duration}
              {difficulty && <> · <span className="text-white/45">{difficulty}</span></>}
              {operatorName && <> · <span className="text-white/55">{operatorName}</span></>}
            </p>
          </div>
          {priceFrom && (
            <div className="text-right shrink-0">
              <p className="text-white/30 text-[9px] uppercase tracking-wider leading-none mb-1">From</p>
              <p className="text-white font-bold text-base leading-none">{priceFrom}</p>
            </div>
          )}
        </div>

        {/* CTA button — full width */}
        <button
          onClick={handleBook}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-bold transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)",
            boxShadow: "0 4px 20px rgba(255,81,0,0.4), 0 0 0 1px rgba(255,81,0,0.2)",
          }}
        >
          Book Now
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
