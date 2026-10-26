import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/ui/custom/Logo";

export const metadata: Metadata = { title: "Continue" };

type Props = { searchParams: Promise<{ token_hash?: string; type?: string; next?: string }> };

const COPY: Record<string, { title: string; body: string; button: string }> = {
  recovery: { title: "Reset your password", body: "Continue to choose a new password for your account.", button: "Set a new password" },
  signup: { title: "Verify your email", body: "One click and your account is ready.", button: "Verify my email" },
  magiclink: { title: "Verify your email", body: "One click and you're signed in.", button: "Continue" },
};

/**
 * Where links in our emails land. The token is only spent when the button is pressed (a POST to
 * /auth/callback), so mail scanners that open every link can't use it up first.
 */
export default async function ConfirmPage({ searchParams }: Props) {
  const { token_hash, type = "", next = "/" } = await searchParams;
  const copy = COPY[type] ?? { title: "Continue", body: "Confirm it's you to continue.", button: "Continue" };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="mb-10"><Logo size="sm" /></div>
        {token_hash ? (
          <>
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">{copy.title}</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8">{copy.body}</p>
            <form method="post" action="/auth/callback">
              <input type="hidden" name="token_hash" value={token_hash} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className="w-full bg-[#ff5100] hover:bg-[#ff7d47] text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                {copy.button}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">This link is incomplete</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8">Open the link from the email again, or ask for a new one.</p>
            <Link href="/auth/login" className="text-[#ff5100] font-semibold text-sm hover:underline">Back to log in</Link>
          </>
        )}
      </div>
    </main>
  );
}
