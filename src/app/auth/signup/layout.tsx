import type { Metadata } from "next";

// The page is a client component, so its title lives here
export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a free Trail to Tides account to save adventures and track your passport.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
