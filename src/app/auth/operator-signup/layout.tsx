import type { Metadata } from "next";

// The page is a client component, so its title lives here
export const metadata: Metadata = {
  title: "List your company",
  description: "Create an operator account to list your adventures on Trail to Tides.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
