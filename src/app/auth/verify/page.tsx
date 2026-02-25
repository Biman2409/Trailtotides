"use client";

import { useState, useRef, useEffect } from "react";
import { verifyOtp, resendOtp } from "@/app/auth/actions";
import Link from "next/link";
import { Mountain, ArrowLeft, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleOtpChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 6) {
      setMessage({ type: "error", text: "Please enter the full 6-digit code." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("token", token);
    const result = await verifyOtp(formData);
    setLoading(false);
    if (result?.error) setMessage({ type: "error", text: result.error });
  }

  async function handleResend() {
    setResending(true);
    setMessage(null);
    const result = await resendOtp(email);
    setResending(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: result.success! });
      setCooldown(60);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel */}
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
              One last step<br />to the summit.
            </h2>
            <p className="text-white/70 text-lg">
              Verify your email and unlock India&apos;s greatest adventures.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Mountain className="w-6 h-6 text-orange-400" />
            <span className="text-white font-semibold text-lg">Trail to Tides</span>
          </Link>

          <Link href="/auth/signup" className="hidden lg:inline-flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to sign up
          </Link>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
            <Mail className="w-7 h-7 text-orange-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-white/50 mb-1">
            We sent a 6-digit code to
          </p>
          <p className="text-orange-400 font-medium mb-8 truncate">{email}</p>

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

          <form onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <div className="flex gap-3 mb-8" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="flex-1 h-14 text-center text-xl font-bold text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 transition-colors"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 text-center text-white/50 text-sm">
            Didn&apos;t receive a code?{" "}
            {cooldown > 0 ? (
              <span className="text-white/30">Resend in {cooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
