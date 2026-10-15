"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // resolvedTheme is unknown to the server (it depends on localStorage/system
  // preference), so the first client render must match the server's guess —
  // otherwise React logs a hydration mismatch. Stay in the server's assumed
  // state until mounted, then switch to the real resolved theme.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            if (theme === "system") setTheme("light");
            else setTheme(isDark ? "light" : "dark");
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
          style={{ color: isDark ? "#818cf8" : "#ff5100" }}
          aria-label={label}
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <Sun
              className={`w-4 h-4 absolute transition-all duration-300 ${
                isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
              }`}
              style={{ color: "#ff5100" }}
            />
            <Moon
              className={`w-4 h-4 absolute transition-all duration-300 ${
                isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
              }`}
              style={{ color: "#818cf8" }}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}