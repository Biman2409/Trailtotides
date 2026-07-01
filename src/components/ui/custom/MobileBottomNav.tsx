"use client";

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

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1002] lg:hidden safe-area-bottom"
      style={{
        background: "var(--nav-bg)",
        borderTop: "1px solid var(--nav-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {links.map(({ href, label, icon: Icon, isHome }) => {
          const isActive = isHome
            ? pathname === "/"
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-0"
              style={{
                color: isActive ? "#ff5100" : "var(--nav-text)",
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none whitespace-nowrap">
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 w-4 h-0.5 rounded-full"
                  style={{ background: "#ff5100" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}