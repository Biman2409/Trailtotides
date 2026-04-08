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
            {priceFrom && (
              <p className="text-white/50 text-[11px] mt-1 whitespace-nowrap">
                <span className="text-white/30">From </span>
                <span className="text-white font-bold">{priceFrom}</span>
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            {operatorName && (
              <p className="text-[#ff5100] text-xs font-bold leading-none truncate max-w-[130px]">{operatorName}</p>
            )}
            <p className="text-white/30 text-[11px] mt-1 truncate">
              {duration}
              {difficulty && <> · <span className="text-white/40">{difficulty}</span></>}
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              const el = document.getElementById("operators-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Browse Operators
          </button>
          <button
            onClick={handleBook}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white text-sm font-bold transition-all duration-200 active:scale-[0.98]"
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
    </div>
  );
}
