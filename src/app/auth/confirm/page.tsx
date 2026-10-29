import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck, KeyRound } from "lucide-react";
import Logo from "@/components/ui/custom/Logo";

export const metadata: Metadata = { title: "Continue" };

type Props = { searchParams: Promise<{ token_hash?: string; type?: string; next?: string }> };

const COPY: Record<string, { title: string; body: string; button: string }> = {
  recovery: { title: "Reset your password", body: "Continue to choose a new password for your account.", button: "Set a new password" },
  signup: { title: "Verify your email", body: "One click and your account is ready. You'll be signed in straight away.", button: "Verify my email" },
  magiclink: { title: "Verify your email", body: "One click and you're signed in.", button: "Verify my email" },
};

/**
 * Where links in our emails land. The token is only spent when the button is pressed (a POST to
 * /auth/callback), so mail scanners that open every link can't use it up first.
 * Styled like the sign-in pages (auth-themed), so it follows light and dark mode.
 */
export default async function ConfirmPage({ searchParams }: Props) {
  const { token_hash, type = "", next = "/" } = await searchParams;
  const copy = COPY[type] ?? { title: "Continue", body: "Confirm it's you to continue.", button: "Continue" };
  // Where the button leads, said up front when it's somewhere specific
  const after = next.startsWith("/matchmaker/group") ? "Next, you'll go straight back to your group."
    : next.startsWith("/matchmaker") ? "Next, you'll see your fitness match."
    : null;
  const Icon = type === "recovery" ? KeyRound : MailCheck;

  return (
    <main className="min-h-screen auth-themed bg-[var(--bg-page)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="max-w-sm w-full relative">
        <div className="mb-10"><Logo size="sm" /></div>
        {token_hash ? (
          <>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(255,81,0,0.12)" }}>
              <Icon className="w-6 h-6 text-[#ff5100]" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">{copy.title}</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              {copy.body}{after && type !== "recovery" ? <> {after}</> : null}
            </p>
            <form method="post" action="/auth/callback">
              <input type="hidden" name="token_hash" value={token_hash} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className="w-full bg-[#ff5100] hover:bg-[#ff7d47] text-[#fff] font-bold py-3.5 rounded-2xl transition-colors shadow-lg shadow-[#ff5100]/20"
              >
                {copy.button}
              </button>
            </form>
            <p className="text-white/40 text-xs mt-4 leading-relaxed">The link works once. If it has expired, log in and we&apos;ll send a new one.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">This link is incomplete</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8">Open the link from the email again, or log in and we&apos;ll send a new one.</p>
            <Link href="/auth/login" className="text-[#ff5100] font-semibold text-sm hover:underline">Back to log in</Link>
          </>
        )}
      </div>
    </main>
  );
}
