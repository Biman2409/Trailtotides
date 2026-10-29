import type { Metadata } from "next";
import SubmitClient from "./SubmitClient";
import { adventures } from "@/lib/data";

export const metadata: Metadata = {
  title: "Submit Your Story",
  description:
    "Share your adventure story with the Trail to Tides community. First-hand accounts from real adventurers across India's trails, mountains, coasts, and more.",
  openGraph: {
    title: "Submit Your Adventure Story — Trail to Tides",
    description: "Share your adventure with the Trail to Tides community.",
    url: "https://www.trailtotides.com/stories/submit",
  },
  alternates: { canonical: "https://www.trailtotides.com/stories/submit" },
  robots: { index: false },
};

export default function SubmitStoryPage() {
  // Types with trips listed today; the picker marks the rest "Soon"
  const liveTypes = [...new Set(adventures.map((a) => a.type as string))];
  return <SubmitClient liveTypes={liveTypes} />;
}
