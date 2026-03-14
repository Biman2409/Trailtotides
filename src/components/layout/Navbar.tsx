"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Mountain, LogOut, Shield, User, ChevronDown, GitCompareArrows, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCompare } from "@/contexts/CompareContext";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/matchmaker", label: "Matchmaker" },
  { href: "/stories", label: "Stories" },
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
  const { selected, remove } = useCompare();
  const [compareOpen, setCompareOpen] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);

  // Fetch auth state
  useEffect(() => {
    const supabase = createClient();
    async function fetchUser() {
      // Use getSession() for immediate local read, then verify with getUser()
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUser(null); return; }
      const authUser = session.user;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .single();
      setUser({
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        email: authUser.email ?? "",
        role: profile?.role ?? "user",
      });
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const authUser = session.user;
        supabase.from("profiles").select("full_name, role").eq("id", authUser.id).single()
          .then(({ data: profile }) => {
            setUser({
              name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
              email: authUser.email ?? "",
              role: profile?.role ?? "user",
            });
          });
      } else {
        setUser(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Immediate response as soon as scroll starts
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };
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

  useEffect(() => {
    if (!compareOpen) return;
    function handler(e: MouseEvent) {
      if (compareRef.current && !compareRef.current.contains(e.target as Node)) setCompareOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [compareOpen]);

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
      className="fixed top-0 left-0 right-0 z-[1002] transition-all duration-200"
      style={
        isTransparent
          ? { background: "transparent", borderBottom: "none" }
          : { background: "var(--nav-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--nav-border)", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }
      }
      >
      

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16 lg:h-20">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-300 shadow-md shadow-[#ff5100]/30">
                      <Mountain className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                        <span className="text-base leading-none tracking-tight" style={{ color: "var(--text-primary)" }}>
                          <span className="font-black uppercase">TRAIL</span>
                          <span style={{fontFamily: "var(--font-cursive)", color: "var(--text-tertiary)"}} className="text-[15px] normal-case tracking-normal font-normal mx-1">to</span>
                          <span className="font-black uppercase">TIDES</span>
                        </span>
                </Link>


          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              if ((link as { highlight?: boolean }).highlight) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ml-1"
                    style={{
                      background: isActive ? "#ff5100" : "rgba(255,81,0,0.15)",
                      color: isActive ? "white" : "#ff5100",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: isActive ? "var(--text-primary)" : "var(--nav-text)",
                    background: isActive ? "var(--nav-active-bg)" : "transparent",
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ff5100]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Compare tray */}
            {selected.length > 0 && (
              <div className="relative" ref={compareRef}>
                <button
                  onClick={() => setCompareOpen(!compareOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                  style={{ background: "rgba(255,81,0,0.12)", border: "1px solid rgba(255,81,0,0.25)" }}
                >
                  <GitCompareArrows className="w-4 h-4 text-[#ff5100]" />
                  <span className="text-[#ff5100] text-sm font-semibold">Compare</span>
                  <span className="w-5 h-5 rounded-full bg-[#ff5100] text-white text-[11px] font-bold flex items-center justify-center leading-none">
                    {selected.length}
                  </span>
                </button>
                {compareOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl overflow-hidden z-50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Comparing {selected.length}/6</span>
                      <button
                        onClick={() => {
                          setCompareOpen(false);
                          document.getElementById("compare-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-[#ff5100] text-xs font-semibold hover:underline"
                      >
                        View comparison
                      </button>
                    </div>
                    <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                      {selected.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.heroImage} alt={a.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{a.name}</span>
                          <button
                            onClick={() => remove(a.id)}
                            className="transition-colors flex-shrink-0"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs" style={{ background: "rgba(255,81,0,0.2)", color: "#ff7d47" }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate" style={{ color: "var(--text-secondary)" }}>{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl overflow-hidden z-50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-400 hover:bg-white/5 transition-colors">
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link href="/matchmaker" className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                      <Compass className="w-4 h-4" />
                      Adventure Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "var(--text-tertiary)", borderTop: "1px solid var(--border-subtle)" }}
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
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  style={{ color: "var(--nav-text)" }}
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#ff5100] hover:bg-[#ff7d47] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:-translate-y-0.5 transition-all duration-200"
                  style={{ boxShadow: "0 4px 14px rgba(255,81,0,0.3)" }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-primary)" }}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="block transition-all duration-300" style={{ transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
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
        <div className="px-6 py-4 space-y-1" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center py-3 px-3 text-base font-medium rounded-xl transition-colors"
              style={{
                color: pathname === link.href ? "var(--text-primary)" : "var(--nav-text)",
                background: pathname === link.href ? "var(--nav-active-bg)" : "transparent",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-2 space-y-1">
              <div className="flex items-center gap-3 px-3 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm" style={{ background: "rgba(255,81,0,0.2)", color: "#ff7d47" }}>
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{user.email}</p>
                </div>
              </div>
              {user.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-2 py-3 px-3 text-sm font-medium text-purple-400 hover:bg-white/5 rounded-xl transition-colors">
                  <Shield className="w-4 h-4" />Admin Dashboard
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 py-3 px-3 text-sm font-medium rounded-xl transition-colors" style={{ color: "var(--text-secondary)" }}>
                <User className="w-4 h-4" />Profile
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 py-3 px-3 text-sm font-medium rounded-xl transition-colors" style={{ color: "var(--text-tertiary)" }}>
                <LogOut className="w-4 h-4" />Log out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/auth/login" className="block w-full text-center font-semibold py-3 rounded-xl transition-colors text-sm" style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
                Log In
              </Link>
              <Link href="/auth/signup" className="block w-full text-center bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
