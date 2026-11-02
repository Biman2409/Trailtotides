import type { Metadata } from "next";
import type { Adventure } from "@/lib/data";
import { inr } from "@/lib/destinations";

export const SITE_URL = "https://www.trailtotides.com";
const BRAND = " | Trail to Tides";
// Google shows about 60 characters of a title and 160 of a description
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/** Full address for a site path or a /public image; outside addresses pass through */
export const absoluteUrl = (path: string) => (path.startsWith("/") ? `${SITE_URL}${path}` : path);

// Ends a name with the activity when the name doesn't already say it
const ACTIVITY_WORDS = /\b(trek|ride|climb|expedition|cycling|rafting|tour)$/i;
const ACTIVITY_SUFFIX: Record<string, string> = {
  Trekking: "Trek",
  Motorcycling: "Motorcycle Tour",
  Cycling: "Cycling Tour",
  Mountaineering: "Expedition",
  "River Rafting": "Rafting",
};

/** "Spiti Valley Circuit" → "Spiti Valley Circuit Motorcycle Tour"; "Hampta Pass Trek" stays as it is */
export function routeLabel(a: Pick<Adventure, "name" | "type">): string {
  if (ACTIVITY_WORDS.test(a.name)) return a.name;
  const suffix = ACTIVITY_SUFFIX[a.type];
  return suffix ? `${a.name} ${suffix}` : a.name;
}

/** "the Hampta Pass Trek", but "Spiti Valley Cycling" (an activity takes no article) */
export const theRoute = (a: Pick<Adventure, "name" | "type">) => {
  const label = routeLabel(a);
  return /ing$/i.test(label) ? label : `the ${label}`;
};

// The adventure page is where people compare and book; a trek's guide in Adventurepedia
// (/adventurepedia/treks/[slug]) owns the itinerary, season and permit searches. Keeping the
// two pages on different searches stops them competing with each other.

/**
 * "[Route] [Year]: Compare Operators & Prices", shortened until it fits in a search result.
 * The brand suffix is kept only when it fits too.
 */
export function experienceTitle(a: Adventure, { year = new Date().getFullYear() }: { year?: number } = {}): Metadata["title"] {
  const head = `${routeLabel(a)} ${year}`;
  const title = [
    `${head}: Compare Operators & Prices`,
    `${head}: Operators & Prices`,
    `${head}: Compare Prices`,
  ].find((t) => t.length <= TITLE_MAX) ?? head;
  return title.length + BRAND.length <= TITLE_MAX ? title : { absolute: title };
}

/**
 * "Compare 4 verified operators and prices for [Route] (from ₹12,000)…". "Verified" only
 * when one of the operators is.
 */
export function experienceDescription(a: Adventure, { priceFrom }: { priceFrom?: number }): string {
  const verified = a.operators.some((o) => o.verified) ? "verified" : "local";
  const n = a.operators.length;
  const lead = n > 1 ? `Compare ${n} ${verified} operators and prices for ${theRoute(a)}` : `Book ${theRoute(a)} with a ${verified} operator`;
  const describe = (facts: boolean, close: string) => [
    lead,
    facts && priceFrom ? ` (from ${inr(priceFrom)})` : "",
    close,
  ].join("");
  return [
    describe(true, ", matched to your fitness. Discover adventure with Trail to Tides."),
    describe(true, ". Discover adventure with Trail to Tides."),
    describe(false, ". Discover adventure with Trail to Tides."),
    describe(true, "."),
  ].find((d) => d.length <= DESCRIPTION_MAX) ?? describe(false, ".");
}

export interface Faq {
  question: string;
  answer: string;
}

/**
 * Questions people search about an adventure, answered from its own facts. Only for adventures
 * without an Adventurepedia guide: a trek's guide answers these, and the same FAQ on both
 * pages would make them compete.
 */
export function experienceFaq(a: Adventure, { difficulty, priceFrom, operatorCount }: { difficulty: string; priceFrom?: number; operatorCount: number }): Faq[] {
  const name = theRoute(a);
  const faqs: Faq[] = [
    {
      question: `How difficult is ${name}?`,
      answer: `It's rated ${difficulty} on the ACE™ scale, which scores the stamina, altitude, technical skill and nerve it asks of you.`,
    },
    {
      question: `How many days does ${name} take?`,
      answer: `${a.durationRange ?? a.durationDays}${a.distance ? `, covering ${a.distanceRange ?? a.distance}` : ""}.`,
    },
  ];
  if (a.type === "Diving" ? a.depth : a.altitude) {
    faqs.push(a.type === "Diving"
      ? { question: `How deep does ${name} go?`, answer: `The maximum depth is ${a.depth}.` }
      : { question: `What is the maximum altitude on ${name}?`, answer: `It reaches ${a.altitude}.` });
  }
  if (a.bestSeason) {
    faqs.push({ question: `When is the best time for ${name}?`, answer: `The best season is ${a.bestSeason}.` });
  }
  const start = a.baseCamp ?? a.startingPoint;
  if (start) {
    faqs.push({ question: `Where does ${name} start?`, answer: `It starts from ${start}, in ${a.state}.` });
  }
  if (priceFrom && Number.isFinite(priceFrom)) {
    faqs.push({
      question: `How much does ${name} cost?`,
      answer: `Packages start from ${inr(priceFrom)} per person. Compare ${operatorCount} operator${operatorCount === 1 ? "" : "s"} on this page for what each price includes.`,
    });
  }
  return faqs;
}

export function faqStructuredData(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
