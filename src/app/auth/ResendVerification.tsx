"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, ExternalLink } from "lucide-react";
import { resendVerification } from "@/app/auth/actions";

// After sign-up, and on login for an account that isn't verified yet: one more link, then a
// short wait before another, so nobody hammers the button.

export function ResendButton({ email, next, className = "" }: { email: string; next?: string | null; className?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  async function resend() {
    setState("sending");
    await resendVerification(email, next ?? undefined);
    setState("sent");
    setTimeout(() => setState("idle"), 30_000);
  }
  return (
    <button type="button" onClick={resend} disabled={state !== "idle"}
      className={`font-bold text-[#ff5100] hover:text-[#ff7d47] disabled:text-white/40 transition-colors ${className}`}>
      {state === "sending" ? "Sending…" : state === "sent" ? "Sent. Check your inbox" : "Resend the link"}
    </button>
  );
}

// A shortcut to the inbox for the big webmail providers; anyone else just goes to their mail app
const INBOXES: { match: RegExp; label: string; href: string }[] = [
  { match: /@(gmail|googlemail)\.com$/i, label: "Open Gmail", href: "https://mail.google.com/mail/u/0/#search/from%3Atrailtotides" },
  { match: /@(outlook|hotmail|live|msn)\.[a-z.]+$/i, label: "Open Outlook", href: "https://outlook.live.com/mail/0/" },
  { match: /@yahoo\.[a-z.]+$/i, label: "Open Yahoo Mail", href: "https://mail.yahoo.com/" },
];

export function CheckInbox({ email, next, onRestart }: { email: string; next?: string | null; onRestart: () => void }) {
  const inbox = INBOXES.find((i) => i.match.test(email.trim()));
  const toGroup = !!next?.startsWith("/matchmaker/group");
  return (
    <div className="py-6">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(255,81,0,0.12)" }}>
        <MailCheck className="w-6 h-6 text-[#ff5100]" />
      </div>
      <h1 className="text-3xl font-black text-white mb-2 tracking-tight leading-tight">Check your inbox</h1>
      <p className="text-white/60 text-sm leading-relaxed mb-5">
        We sent a verification link to <span className="text-white font-semibold break-all">{email}</span>. Open it and press
        <span className="text-white font-semibold"> Verify my email</span>. You&apos;ll be signed in straight away
        {toGroup ? " and taken back to your group." : "."}
      </p>
      {inbox && (
        <a href={inbox.href} target="_blank" rel="noopener noreferrer"
          className="mb-5 flex items-center justify-center gap-2 w-full bg-[#ff5100] hover:bg-[#ff7d47] text-[#fff] font-bold rounded-2xl py-3 text-sm transition-colors">
          {inbox.label} <ExternalLink className="w-4 h-4" />
        </a>
      )}
      <div className="rounded-2xl p-4 text-xs leading-relaxed text-white/50 bg-white/[0.03] border border-white/[0.06] space-y-2">
        <p>Not there after a minute? Check spam or promotions, then <ResendButton email={email} next={next} />.</p>
        <p>Wrong email? <button type="button" onClick={onRestart} className="font-bold text-white/70 hover:text-white">Start over</button></p>
      </div>
      <p className="mt-6 text-white/30 text-xs">
        Already verified? <Link href={next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login"} className="text-[#ff5100] font-bold">Log in</Link>
      </p>
    </div>
  );
}
