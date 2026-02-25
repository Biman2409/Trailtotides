"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mountain } from "lucide-react";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/stories", label: "Stories" },
  { href: "/plan", label: "Plan" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isTransparent = isHome && !scrolled && !menuOpen;

  return (
    <nav
      ref={menuRef}
        className={`fixed top-0 left-0 right-0 z-[1002] transition-all duration-500 ease-in-out ${
        isTransparent
          ? "bg-transparent"
          : "bg-[#1a1f2e]/96 backdrop-blur-lg border-b border-white/8 shadow-xl shadow-black/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#c4622d] flex items-center justify-center group-hover:bg-[#d97040] transition-colors duration-200 shadow-md shadow-[#c4622d]/30">
              <Mountain className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-white font-semibold text-base tracking-tight leading-none">
              Trail to Tides
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-white/65 hover:text-white hover:bg-white/8"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c4622d]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/list"
              className="text-sm text-white/55 hover:text-white/90 transition-colors duration-200 px-2"
            >
              List Your Adventure
            </Link>
            <Link
              href="/explore"
              className="bg-[#c4622d] hover:bg-[#d97040] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-[#c4622d]/25 hover:shadow-lg hover:shadow-[#c4622d]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              Explore
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className="block transition-all duration-300"
              style={{ transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu — slide down */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#1a1f2e] border-t border-white/8 px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center py-3 px-3 text-base font-medium rounded-xl transition-colors border-b border-white/5 ${
                pathname === link.href
                  ? "text-white bg-white/8"
                  : "text-white/65 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="block w-full text-center border border-white/20 text-white font-semibold py-3 rounded-xl transition-colors text-sm hover:bg-white/10"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center bg-[#c4622d] hover:bg-[#d97040] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Sign Up
              </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}
