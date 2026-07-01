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
    // Check initial state
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1002] lg:hidden safe-area-bottom transition-transform duration-300 ease-out"
      style={{
        background: "var(--nav-bg)",
        borderTop: "1px solid var(--nav-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-0.5">
        {links.map(({ href, label, icon: Icon, isHome }) => {
          const isActive = isHome
            ? pathname === "/"
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0 px-2 py-1 rounded-xl transition-all min-w-0"
              style={{
                color: isActive ? "#ff5100" : "var(--nav-text)",
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium leading-tight whitespace-nowrap">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}