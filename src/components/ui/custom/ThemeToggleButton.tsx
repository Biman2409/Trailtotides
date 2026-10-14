"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sunset } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Mode = "light" | "dark" | "dusk";

// Dusk is a palette on top of the dark theme (html.dark.dusk), so every
// component that checks resolvedTheme === "dark" keeps working unchanged.
const PALETTE_KEY = "ttt-palette";

export default function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // resolvedTheme is unknown to the server (it depends on localStorage/system
  // preference), so the first client render must match the server's guess —
  // otherwise React logs a hydration mismatch. Stay in the server's assumed
  // state until mounted, then switch to the real resolved theme.
  const [mounted, setMounted] = useState(false);
  const [dusk, setDusk] = useState(false);
  useEffect(() => {
    setMounted(true);
    try { setDusk(localStorage.getItem(PALETTE_KEY) === "dusk"); } catch {}
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const mode: Mode = !isDark ? "light" : dusk ? "dusk" : "dark";
  const next: Mode = mode === "light" ? "dark" : mode === "dark" ? "dusk" : "light";
  const label = `Switch to ${next} mode`;

  function applyDusk(on: boolean) {
    setDusk(on);
    document.documentElement.classList.toggle("dusk", on);
    try { on ? localStorage.setItem(PALETTE_KEY, "dusk") : localStorage.removeItem(PALETTE_KEY); } catch {}
  }

  function cycle() {
    if (next === "dusk") { setTheme("dark"); applyDusk(true); }
    else if (next === "dark") { setTheme("dark"); applyDusk(false); }
    else { setTheme("light"); applyDusk(false); }
  }

  const color = mode === "light" ? "#ff5100" : mode === "dark" ? "#818cf8" : "#f0c070";
  const iconClass = (active: boolean, hiddenRotate: string) =>
    `w-4 h-4 absolute transition-all duration-300 ${active ? "opacity-100 rotate-0 scale-100" : `opacity-0 ${hiddenRotate} scale-0`}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={cycle}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
          style={{ color }}
          aria-label={label}
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <Sun className={iconClass(mode === "light", "rotate-90")} style={{ color: "#ff5100" }} />
            <Moon className={iconClass(mode === "dark", "-rotate-90")} style={{ color: "#818cf8" }} />
            <Sunset className={iconClass(mode === "dusk", "rotate-90")} style={{ color: "#f0c070" }} />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
