"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar({ targetId }: { targetId?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = targetId ? document.getElementById(targetId) : null;

    function handleScroll() {
      if (target) {
        // Track progress across the target element only — 0% when its top
        // reaches the viewport top, 100% when its bottom reaches the viewport bottom.
        const articleTop = target.getBoundingClientRect().top + window.scrollY;
        const total = target.offsetHeight - window.innerHeight;
        if (total <= 0) { setProgress(100); return; }
        const current = window.scrollY - articleTop;
        setProgress(Math.min(Math.max((current / total) * 100, 0), 100));
        return;
      }
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [targetId]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[1003] h-[3px] pointer-events-none">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #ff5100, #ff7d47, #ff5100)",
          boxShadow: "0 0 8px rgba(255,81,0,0.5)",
        }}
      />
    </div>
  );
}