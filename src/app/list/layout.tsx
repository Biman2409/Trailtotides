import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Adventure",
  description: "Submit your adventure to Trail to Tides — reach serious adventurers across India. Verified operators get a trust badge, map presence, and AI-powered recommendations.",
  openGraph: {
    title: "List Your Adventure — Trail to Tides",
    description: "Reach thousands of adventure seekers across India. Submit your trek, dive, ride, or climb for review and get listed on India's top adventure discovery platform.",
    url: "https://trailtotides.com/list",
    images: [{ url: "https://trailtotides.com/opengraph-image", width: 1200, height: 630, alt: "List Your Adventure — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Adventure — Trail to Tides",
    description: "Submit your adventure for review and get discovered by serious adventurers across India.",
  },
  alternates: { canonical: "https://trailtotides.com/list" },
};

export default function ListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
