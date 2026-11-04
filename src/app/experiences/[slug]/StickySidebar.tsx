"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The desktop sidebar, sticky both ways. When it's shorter than the window it simply pins under
// the navbar. When it's taller (the booking card plus the map), a plain sticky pins it with its
// bottom cut off and then lurches when the column ends; instead it scrolls with the page until
// its end is in view and pins there, and on the way back up it scrolls until its top is in view
// and pins there. Its top offset just follows the scroll, clamped, so it never jumps.

const TOP = 112; // under the navbar (lg:top-28)
const GAP = 16;

export default function StickySidebar({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let top = TOP, lastY = window.scrollY;
    const apply = () => {
      const y = window.scrollY, dy = y - lastY;
      lastY = y;
      const min = Math.min(TOP, window.innerHeight - el.offsetHeight - GAP);
      top = Math.max(min, Math.min(TOP, top - dy));
      el.style.top = `${Math.round(top)}px`;
    };
    // Scroll events land once per frame, before paint: adjusting there keeps it in step. The map
    // and its list change the sidebar's height; re-clamp when they do
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    apply();
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  return <div ref={ref} className={className} style={{ top: TOP }}>{children}</div>;
}
