import type { Metadata } from "next";
import SubmitClient from "./SubmitClient";

export const metadata: Metadata = {
  title: "Submit Your Story — Trail to Tides",
  description:
    "Share your adventure story with the Trail to Tides community. First-hand accounts from real adventurers across India's trails, mountains, coasts, and more.",
  openGraph: {
    title: "Submit Your Adventure Story — Trail to Tides",
    description: "Share your adventure with the Trail to Tides community.",
    url: "https://trailtotides.com/stories/submit",
  },
  alternates: { canonical: "https://trailtotides.com/stories/submit" },
  robots: { index: false },
};

export default function SubmitStoryPage() {
  return <SubmitClient />;
}
