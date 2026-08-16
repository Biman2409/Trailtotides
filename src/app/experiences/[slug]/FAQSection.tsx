import type { Adventure } from "@/lib/data";
import { ChevronDown } from "lucide-react";

interface Props {
  adventure: Adventure;
  difficulty: string;
  operatorCount: number;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
      <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none select-none">
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{q}</span>
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180" style={{ color: "var(--text-tertiary)" }} />
      </summary>
      <p className="px-4 pb-3.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{a}</p>
    </details>
  );
}

export default function FAQSection({ adventure, difficulty, operatorCount }: Props) {
  const startPoint = adventure.baseCamp ?? adventure.startingPoint ?? adventure.state;

  const items: { q: string; a: string }[] = [
    {
      q: "When's the best time to go?",
      a: `The best window for ${adventure.name} is ${adventure.bestSeason}. Conditions outside this range can mean less visibility, closed trails, or a rougher experience.`,
    },
    {
      q: "How fit do I need to be?",
      a: `This adventure is rated ${difficulty}. See the Capability Profile section above for a detailed breakdown of the stamina, strength, and altitude demands compared to your own profile.`,
    },
    {
      q: "Where does it start from?",
      a: `${startPoint} is the usual starting point. Exact meeting details are confirmed by your chosen operator after booking.`,
    },
    {
      q: "What's included in the price?",
      a: operatorCount > 1
        ? "Inclusions vary by operator — compare guide, porter, and cloakroom services in the operator table above, and confirm exact inclusions with your chosen operator before booking."
        : "Confirm exact inclusions — guide, permits, meals, gear — directly with the operator before booking.",
    },
    {
      q: "What's the cancellation policy?",
      a: "Cancellation and refund terms are set by each operator, not by Trail to Tides — check their terms during checkout or ask before you pay.",
    },
    {
      q: "How do I actually book?",
      a: operatorCount > 1
        ? `Trail to Tides doesn't process payments directly. Compare the ${operatorCount} operators above by price, rating, and departure dates, then book with whichever one fits — you'll complete payment on their site.`
        : "Trail to Tides doesn't process payments directly. Use the Book button above to continue on the operator's own site.",
    },
  ];

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <FAQItem key={item.q} q={item.q} a={item.a} />
      ))}
    </div>
  );
}
