"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { signUp } from "@/app/auth/actions";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle, Loader2, AtSign, ChevronDown, X } from "lucide-react";
import Logo from "@/components/ui/custom/Logo";
import countries from "@/lib/countries.json";
import TermsModal from "@/components/ui/custom/TermsModal";
import { AVATARS } from "@/lib/avatars";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [username, setUsername] = useState("");
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarDropdownOpen) return;
    function handler(e: MouseEvent) {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarDropdownOpen]);

  const checkUsername = useCallback((value: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value) { setUsernameState("idle"); return; }
    if (value.length < 3 || value.length > 20) { setUsernameState("invalid"); return; }
    setUsernameState("checking");
    debounceTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      setUsernameState(data.available ? "available" : "taken");
    }, 500);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    if (selectedAvatarId !== null) {
      formData.set("avatar_id", String(selectedAvatarId));
    }
    const result = await signUp(formData);

    if (result?.error) {
      setLoading(false);
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      if (selectedAvatarId !== null) {
        localStorage.setItem("ttt_avatar_id", String(selectedAvatarId));
      }
      setMessage({ type: "success", text: result.success });
      (e.target as HTMLFormElement).reset();
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
      {showTermsModal && (
        <TermsModal
          onAccept={() => setTermsAccepted(true)}
          onClose={() => setShowTermsModal(false)}
        />
      )}
      {/* Left panel — image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=100')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" />

          <div className="max-w-md">
            <h2 className="text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Wild is calling, <br />
              <span className="text-[#ff5100] font-black">answer it.</span>
            </h2>
            <p className="text-white/70 text-lg font-medium leading-relaxed max-w-sm">
              Join our community of explorers and get access to exclusive trails, expert advice, and verified operators.
            </p>
          </div>

          <div className="flex items-center gap-6 text-white/30 text-[11px] font-bold uppercase tracking-[0.15em]">
            <span>© 2026 TRAIL TO TIDES</span>
            <div className="w-1.5 h-px bg-white/20" />
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <div className="w-1.5 h-px bg-white/20" />
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 lg:px-16 xl:px-24 bg-[#0a0a0a] relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-md w-full mx-auto relative z-10">
          {/* Mobile logo */}
          <div className="mb-4 lg:hidden">
            <Logo size="sm" />
          </div>

          <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-4 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          <div className="mb-4">
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight leading-tight">
              Wild is calling, <span className="text-[#ff5100]">answer it.</span>
            </h1>
            <p className="text-white/40 text-xs font-medium">
              Create your explorer account. Save adventures, track wishlist &amp; book verified operators.
            </p>
          </div>

          {message && (
            <div className={`mb-3 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "error"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-green-500/10 border border-green-500/20 text-green-400"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Full Name</label>
              <input
                name="full_name"
                type="text"
                required
                placeholder="Rahul Sharma"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase();
                    setUsername(val);
                    checkUsername(val);
                  }}
                  placeholder="rahul_explorer"
                  className={`w-full bg-white/[0.03] border rounded-2xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:bg-white/[0.06] transition-all ${
                    usernameState === "available" ? "border-emerald-500/50 focus:border-emerald-500" :
                    usernameState === "taken" || usernameState === "invalid" ? "border-red-500/40 focus:border-red-500/60" :
                    "border-white/10 focus:border-[#ff5100]/50"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameState === "checking" && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
                  {usernameState === "available" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {(usernameState === "taken" || usernameState === "invalid") && <XCircle className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              {usernameState !== "idle" && (
                <p className={`mt-1.5 ml-1 text-[10px] font-medium transition-colors ${
                  usernameState === "available" ? "text-emerald-500" :
                  usernameState === "taken" ? "text-red-400" :
                  usernameState === "invalid" ? "text-amber-400" :
                  "text-white/25"
                }`}>
                  {usernameState === "checking" && "Checking availability…"}
                  {usernameState === "available" && `@${username} is available`}
                  {usernameState === "taken" && `@${username} is already taken`}
                  {usernameState === "invalid" && "Username must be between 3 and 20 characters"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="rahul@email.com"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    name="country_code"
                    defaultValue="+91"
                    className="h-full bg-white/[0.03] border border-white/10 rounded-2xl pl-5 pr-10 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer min-w-[100px]"
                  >
                    {[
                      ...countries.filter(c => c.code === "IN"),
                      ...countries.filter(c => c.code !== "IN").sort((a, b) => a.name.localeCompare(b.name))
                    ].map((country) => (
                      <option key={`${country.code}-${country.dial_code}`} value={country.dial_code} className="bg-[#0a0a0a] text-white">
                        {country.flag} {country.dial_code}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-2.5 pr-14 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* ── Avatar picker dropdown ────────────────────────────── */}
            <div ref={avatarDropdownRef} className="relative">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">
                Profile Picture <span className="normal-case tracking-normal font-normal text-white/20">(optional)</span>
              </label>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setAvatarDropdownOpen(o => !o)}
                className="w-full flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-left transition-all focus:outline-none hover:bg-white/[0.05]"
                style={{ borderColor: avatarDropdownOpen ? "rgba(255,81,0,0.4)" : selectedAvatarId ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.1)" }}
              >
                {selectedAvatarId !== null ? (
                  <>
                    <span className="w-7 h-7 rounded-lg overflow-hidden shrink-0 block" style={{ border: "1.5px solid rgba(255,81,0,0.5)" }}>
                      <img src={AVATARS.find(a => a.id === selectedAvatarId)?.src} alt="" className="w-full h-full object-cover" />
                    </span>
                    <span className="flex-1 text-white text-sm font-medium">{AVATARS.find(a => a.id === selectedAvatarId)?.label}</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setSelectedAvatarId(null); }}
                      className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "rgba(255,81,0,0.1)", border: "1.5px solid rgba(255,81,0,0.2)" }}>
                      <svg className="w-3.5 h-3.5 text-[#ff5100]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                    </span>
                    <span className="flex-1 text-white/30 text-sm">Select your avatar</span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-white/20 transition-transform duration-200" style={{ transform: avatarDropdownOpen ? "rotate(180deg)" : "none" }} />
                  </>
                )}
              </button>

              {/* Dropdown panel */}
              {avatarDropdownOpen && (
                <div
                  className="absolute left-0 right-0 z-50 mt-1.5 rounded-2xl overflow-hidden"
                  style={{ background: "#0e0e12", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 16px 48px rgba(0,0,0,0.7)" }}
                >
                  <div className="p-3 grid grid-cols-5 gap-2">
                    {AVATARS.map(av => {
                      const active = selectedAvatarId === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => { setSelectedAvatarId(av.id); setAvatarDropdownOpen(false); }}
                          className="flex flex-col items-center gap-1.5 group/av focus:outline-none"
                        >
                          <span
                            className="w-full aspect-square rounded-xl overflow-hidden block transition-all duration-150"
                            style={{
                              border: `1.5px solid ${active ? "rgba(255,81,0,0.8)" : "rgba(255,255,255,0.07)"}`,
                              boxShadow: active ? "0 0 14px rgba(255,81,0,0.4)" : "none",
                              transform: active ? "scale(1.06)" : "scale(1)",
                            }}
                          >
                            <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
                          </span>
                          <span className="text-[7.5px] font-medium leading-none tracking-wide truncate w-full text-center transition-colors"
                            style={{ color: active ? "rgba(255,81,0,0.9)" : "rgba(255,255,255,0.28)" }}>
                            {av.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[9px] text-white/18 text-center">Defaults to your ACE<sup>™</sup> rank badge if skipped</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 py-0.5">
              <div className="flex items-center h-5 mt-0.5 shrink-0">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={() => {
                    if (!termsAccepted) setShowTermsModal(true);
                    else setTermsAccepted(false);
                  }}
                  className="w-4 h-4 rounded-lg border-white/10 bg-white/5 text-[#ff5100] focus:ring-[#ff5100]/20 transition-all cursor-pointer accent-[#ff5100]"
                />
              </div>
              <label className="text-[11px] text-white/40 leading-snug font-medium">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#ff5100]/70 hover:text-[#ff5100] transition-colors underline underline-offset-2"
                >
                  Terms
                </button>
                {" "}and{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#ff5100]/70 hover:text-[#ff5100] transition-colors underline underline-offset-2"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || usernameState !== "available" || !termsAccepted}
              className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff5100]/20 text-sm mt-1"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-white/30 text-xs font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#ff5100] hover:text-[#ff7d47] font-bold transition-colors">
              Log in
            </Link>
          </p>

          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-center text-white/20 text-xs font-medium">
              Adventure operator?{" "}
              <Link href="/auth/operator-signup" className="text-white/40 hover:text-[#ff7d47] transition-colors font-semibold">
                Create your operator account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
