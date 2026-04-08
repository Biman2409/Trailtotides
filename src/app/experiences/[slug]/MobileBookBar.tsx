"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

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
    // Show after user scrolls past the hero (≈ 80vh)
    const threshold = window.innerHeight * 0.8;
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBook = () => {
    if (operatorWebsite) {
      window.open(operatorWebsite, "_blank", "noopener noreferrer");
    } else {
      // Scroll to operators section
      const el = document.getElementById("operators-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[999] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}
    >
      {/* Safe area padding for notch phones */}
      <div className="px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{adventureName}</p>
          <p className="text-white/40 text-xs mt-0.5">{duration} · {difficulty}{operatorName ? <> · <span className="text-white/55">{operatorName}</span></> : null}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {priceFrom && (
            <div className="text-right">
              <p className="text-white/30 text-[9px] uppercase tracking-wider">From</p>
              <p className="text-white font-bold text-sm leading-none">{priceFrom}</p>
            </div>
          )}
          <button
            onClick={handleBook}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#ff5100] hover:bg-[#ff7d47] active:scale-95 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-[#ff5100]/30"
          >
            Book Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
