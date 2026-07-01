"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => {
        if (theme === "system") setTheme("light");
        else setTheme(isDark ? "light" : "dark");
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
      style={{ color: "var(--text-muted)" }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={`w-4 h-4 absolute transition-all duration-300 ${
            isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute transition-all duration-300 ${
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          }`}
        />
      </div>
    </button>
  );
}