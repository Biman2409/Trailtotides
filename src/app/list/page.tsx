import type { Metadata } from "next";
import ListClient from "./ListClient";

export const metadata: Metadata = {
  title: "List Your Adventure",
  description:
    "Partner with Trail to Tides and reach thousands of adventure seekers across India. Submit your adventure, get verified, and start getting bookings.",
  openGraph: {
    title: "List Your Adventure — Trail to Tides",
    description:
      "Partner with Trail to Tides and reach thousands of adventure seekers across India.",
    url: "https://trailtotides.com/list",
    images: [{ url: "https://trailtotides.com/opengraph-image", width: 1200, height: 630, alt: "List Your Adventure — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Adventure — Trail to Tides",
    description: "Partner with Trail to Tides and reach thousands of adventure seekers across India.",
    images: ["https://trailtotides.com/opengraph-image"],
  },
  alternates: { canonical: "https://trailtotides.com/list" },
};

export default function ListPage() {
  return <ListClient />;
}
