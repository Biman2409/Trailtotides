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
    url: "https://trailtotides.com/ace",
    images: [{ url: "https://images.unsplash.com/photo-1526139334526-f591a54b477c?w=1200&q=90", width: 1200, height: 630, alt: "How ACE rates adventures" }],
  },
  alternates: { canonical: "https://trailtotides.com/ace" },
};

const PROGRESSION_TREKS: AceTrek[] = [
  {
    slug: "goechala",
    label: "Starting point",
    sublabel: "Moderate",
    diffColor: "#f59e0b",
    desc: "Mostly stamina and altitude. Kind underfoot.",
    ace: { stamina: 3, power: 2, strength: 2, agility: 2, water: 0, altitude: 3, focus: 2, nerve: 1 },
  },
  {
    slug: "rupin-pass",
    label: "Step up",
    sublabel: "Hard",
    diffColor: "#f97316",
    desc: "Harder footing and more exposure: loose snow, steep descents.",
    ace: { stamina: 4, power: 3, strength: 3, agility: 4, water: 0, altitude: 4, focus: 3, nerve: 3 },
  },
  {
    slug: "pin-parvati-pass",
    label: "The big one",
    sublabel: "Advanced",
    diffColor: "#ef4444",
    desc: "17,457ft, glaciers and remote crossings. Demanding on almost everything.",
    ace: { stamina: 5, power: 4, strength: 4, agility: 4, water: 2, altitude: 5, focus: 4, nerve: 5 },
  },
];

export default function ACEPage() {
  // Look the treks up here so the full adventure list stays out of the client bundle
  const treks = PROGRESSION_TREKS.map(t => {
    const adv = adventures.find(a => a.slug === t.slug);
    return { ...t, name: adv?.name, heroImage: adv?.heroImage };
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />
      <AceContent treks={treks} />
      <Footer />
    </div>
  );
}
