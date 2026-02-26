"use client";

import { useState } from "react";
import { signUp } from "@/app/auth/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mountain, ArrowLeft } from "lucide-react";
import countries from "@/lib/countries.json";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    
    if (result?.error) {
      setLoading(false);
      setMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success });
        // Clear form on success
        (e.target as HTMLFormElement).reset();
        setLoading(false);
      }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel — image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599661520791-8aabee470d55?w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg">
            <Mountain className="w-6 h-6 text-orange-400" />
            Trail to Tides
          </Link>
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Your next adventure<br />starts here.
            </h2>
            <p className="text-white/70 text-lg">
              Join thousands of explorers discovering India&apos;s most breathtaking trails, peaks, and coastlines.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Mountain className="w-6 h-6 text-orange-400" />
            <span className="text-white font-semibold text-lg">Trail to Tides</span>
          </Link>

          <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-white/50 mb-8">Start exploring India&apos;s best adventures.</p>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                message.type === "error"
                  ? "bg-red-500/10 border border-red-500/30 text-red-400"
                  : "bg-green-500/10 border border-green-500/30 text-green-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
              <input
                name="full_name"
                type="text"
                required
                placeholder="Rahul Sharma"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="rahul@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all"
              />
            </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                  <div className="flex gap-2">
                    <div className="relative">
                        <select
                          name="country_code"
                          defaultValue="+91"
                          className="h-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-8 py-3 text-white focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all appearance-none cursor-pointer min-w-[100px] max-w-[150px]"
                        >
                          {/* Put India at the top */}
                          {[
                            ...countries.filter(c => c.code === "IN"),
                            ...countries.filter(c => c.code !== "IN").sort((a, b) => a.name.localeCompare(b.name))
                          ].map((country) => (
                            <option key={`${country.code}-${country.dial_code}`} value={country.dial_code} className="bg-[#0a0a0a] text-white">
                              {country.flag} {country.name} ({country.dial_code})
                            </option>
                          ))}
                        </select>

                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="98765 43210"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4 mb-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500/20 transition-all cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-white/50 leading-tight cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 transition-colors"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-white/50 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
