"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Mountain, LogOut, Shield, User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/stories", label: "Stories" },
  { href: "/plan", label: "Plan" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch auth state
  useEffect(() => {
    const supabase = createClient();
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setUser(null); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .single();
      setUser({
        name: profile?.full_name || authUser.email?.split("@")[0] || "User",
        email: authUser.email ?? "",
        role: profile?.role ?? "user",
      });
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => fetchUser());
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const isTransparent = isHome && !scrolled && !menuOpen;

  return (
    <nav
    ref={menuRef}
    className={`fixed top-0 left-0 right-0 z-[1002] transition-all duration-200 ease-in-out ${
      isTransparent
        ? "bg-transparent"
        : "bg-[#1a1f2e]/96 backdrop-blur-lg border-b border-white/8 shadow-xl shadow-black/10"
    }`}

    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#f67345] flex items-center justify-center group-hover:bg-[#f88c64] transition-colors duration-200 shadow-md shadow-[#f67345]/30">
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
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#f67345]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#f67345]/30 flex items-center justify-center text-[#f88c64] font-semibold text-xs">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-white/80 text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-white text-sm font-medium truncate">{user.name}</p>
                      <p className="text-white/40 text-xs truncate">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-300 hover:bg-white/5 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors border-t border-white/8"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-white/65 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/8 transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#f67345] hover:bg-[#f88c64] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-[#f67345]/25 hover:shadow-lg hover:shadow-[#f67345]/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
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

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
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

            {user ? (
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-3 px-3 py-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#f67345]/30 flex items-center justify-center text-[#f88c64] font-semibold text-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-white/40 text-xs">{user.email}</p>
                  </div>
                </div>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 py-3 px-3 text-sm font-medium text-purple-300 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-3 px-3 text-sm font-medium text-white/70 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 py-3 px-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="block w-full text-center border border-white/20 text-white font-semibold py-3 rounded-xl transition-colors text-sm hover:bg-white/10"
              >
                Log In
              </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center bg-[#f67345] hover:bg-[#f88c64] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Sign Up
                </Link>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
