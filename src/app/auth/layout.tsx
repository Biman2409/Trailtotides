import type { Metadata } from "next";

// Sign-in, sign-up and the operator dashboard: crawlable (so Google sees this) but never indexed
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
