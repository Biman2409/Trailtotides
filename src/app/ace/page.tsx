import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";
import AceContent, { type AceTrek } from "./AceContent";

export const metadata = {
  title: "How ACE rates adventures",
  description: "ACE scores every adventure on 8 things it asks of you, from stamina to nerve, so you can see what you're ready for before you book.",
  openGraph: {
    title: "How ACE rates adventures — Trail to Tides",
    description: "Every adventure scored on 8 things it asks of you, so you can see what fits.",
    url: "https://www.trailtotides.com/ace",
    images: [{ url: "https://images.unsplash.com/photo-1526139334526-f591a54b477c?w=1200&q=90", width: 1200, height: 630, alt: "How ACE rates adventures" }],
  },
  alternates: { canonical: "https://www.trailtotides.com/ace" },
};

// Scores run stamina, power, strength, agility, water, altitude, focus, nerve.
// `tone` is the difficulty level whose colour the trek wears (3 moderate … 5 advanced).
const EXAMPLE_TREKS: Omit<AceTrek, "name" | "image">[] = [
  { slug: "goechala",         grade: "Moderate", tone: 3, blurb: "Mostly stamina and altitude, on kind ground.",               values: [3, 2, 2, 2, 0, 3, 2, 1] },
  { slug: "rupin-pass",       grade: "Hard",     tone: 4, blurb: "Harder footing and more exposure: loose snow, steep descents.", values: [4, 3, 3, 4, 0, 4, 3, 3] },
  { slug: "pin-parvati-pass", grade: "Advanced", tone: 5, blurb: "17,457ft, glaciers and remote crossings.",                   values: [5, 4, 4, 4, 2, 5, 4, 5] },
];

export default function ACEPage() {
  // Look the treks up here so the full adventure list stays out of the client bundle
  const treks: AceTrek[] = EXAMPLE_TREKS.map(t => {
    const adv = adventures.find(a => a.slug === t.slug);
    return { ...t, name: adv?.name ?? t.slug, image: adv?.heroImage };
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />
      <AceContent treks={treks} />
      <Footer />
    </div>
  );
}
