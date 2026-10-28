import type { Metadata } from "next";

// The page is a client component, so its title lives here
export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Trail to Tides to see your saved adventures, passport and Matchmaker results.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
