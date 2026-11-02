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

/**
 * "[Route] [Year]: Itinerary, Cost & Operator Comparison", shortened until it fits in a
 * search result. "Itinerary" only when the page has a day-by-day guide. The brand suffix
 * is kept only when it fits too.
 */
export function experienceTitle(a: Adventure, { hasItinerary, year = new Date().getFullYear() }: { hasItinerary: boolean; year?: number }): Metadata["title"] {
  const head = `${routeLabel(a)} ${year}`;
  const detail = hasItinerary ? "Itinerary" : "Difficulty";
  const title = [
    `${head}: ${detail}, Cost & Operator Comparison`,
    `${head}: ${detail}, Cost & Operators`,
    `${head}: ${detail} & Cost`,
  ].find((t) => t.length <= TITLE_MAX) ?? head;
  return title.length + BRAND.length <= TITLE_MAX ? title : { absolute: title };
}

/**
 * "Compare verified operators, itineraries, elevation profiles and prices for [Route]…"
 * Each claim is made only when the page backs it up: "verified" when one of the operators
 * is, itineraries and elevation profiles when there's a mapped trail.
 */
export function experienceDescription(a: Adventure, { hasItinerary, priceFrom }: { hasItinerary: boolean; priceFrom?: number }): string {
  const verified = a.operators.some((o) => o.verified);
  const what = [
    `${verified ? "verified" : "local"} operators`,
    ...(hasItinerary ? ["day-by-day itineraries", "elevation profiles"] : []),
    "pricing",
  ];
  const list = `${what.slice(0, -1).join(", ")} and ${what[what.length - 1]}`;
  const describe = (facts: boolean, close: string) => [
    `Compare ${list} for the ${routeLabel(a)}`,
    facts && priceFrom ? ` (from ${inr(priceFrom)})` : "",
    close,
  ].join("");
  return [
    describe(true, ". Discover adventure with Trail to Tides."),
    describe(false, ". Discover adventure with Trail to Tides."),
    describe(true, "."),
  ].find((d) => d.length <= DESCRIPTION_MAX) ?? describe(false, ".");
}

export interface Faq {
  question: string;
  answer: string;
}

/** Questions people search about an adventure, answered from its own facts */
export function experienceFaq(a: Adventure, { difficulty, priceFrom, operatorCount }: { difficulty: string; priceFrom?: number; operatorCount: number }): Faq[] {
  const name = routeLabel(a);
  const faqs: Faq[] = [
    {
      question: `How difficult is the ${name}?`,
      answer: `It's rated ${difficulty} on the ACE™ scale, which scores the stamina, altitude, technical skill and nerve it asks of you.`,
    },
    {
      question: `How many days does the ${name} take?`,
      answer: `${a.durationRange ?? a.durationDays}${a.distance ? `, covering ${a.distanceRange ?? a.distance}` : ""}.`,
    },
  ];
  if (a.type === "Diving" ? a.depth : a.altitude) {
    faqs.push(a.type === "Diving"
      ? { question: `How deep does the ${name} go?`, answer: `The maximum depth is ${a.depth}.` }
      : { question: `What is the maximum altitude on the ${name}?`, answer: `It reaches ${a.altitude}.` });
  }
  if (a.bestSeason) {
    faqs.push({ question: `When is the best time for the ${name}?`, answer: `The best season is ${a.bestSeason}.` });
  }
  const start = a.baseCamp ?? a.startingPoint;
  if (start) {
    faqs.push({ question: `Where does the ${name} start?`, answer: `It starts from ${start}, in ${a.state}.` });
  }
  if (priceFrom && Number.isFinite(priceFrom)) {
    faqs.push({
      question: `How much does the ${name} cost?`,
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
