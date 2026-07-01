"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Compass, Map, BookOpen, User, Search } from "lucide-react";

const links = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/map", label: "Map", icon: Map },
  { href: "/", label: "Home", icon: Search, isHome: true },
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ease-out"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      <div
        className="mx-3 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid var(--nav-border)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-1">
          {links.map(({ href, label, icon: Icon, isHome }) => {
            const isActive = isHome
              ? pathname === "/"
              : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 group"
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive ? "rgba(255,81,0,0.12)" : "transparent",
                  }}
                >
                  <Icon
                    className="w-4 h-4 transition-all duration-200"
                    style={{
                      color: isActive ? "#ff5100" : "var(--nav-text)",
                    }}
                  />
                </div>
                <span
                  className="text-[9px] font-medium leading-tight whitespace-nowrap transition-colors duration-200"
                  style={{
                    color: isActive ? "#ff5100" : "var(--nav-text)",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}