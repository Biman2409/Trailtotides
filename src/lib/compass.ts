// Shared bits for Compass.AI — the hero prompt bar and the floating chat both use these.
import type { Adventure } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";

// Compass's identity: warm brand-orange gradients, shared by the hero bar and the chat.
export const COMPASS_GRADIENT = "linear-gradient(135deg, #ff5100 0%, #ff7d47 55%, #ffb37a 100%)";
export const COMPASS_RING = "conic-gradient(from 0deg, #ff5100, #ff8a5c, #ffd0a8, #ff8a5c, #ff5100)";

// Fired on window to open the Compass chat with a question already asked.
export const COMPASS_ASK_EVENT = "compass:ask";

export function askCompass(text: string) {
  window.dispatchEvent(new CustomEvent<string>(COMPASS_ASK_EVENT, { detail: text }));
}

// Phrased the way people actually describe a trip, not as search keywords.
export const STARTER_PROMPTS = [
  "Something remote and challenging",
  "Beginner-friendly trek in Himachal",
  "A short trek for a long weekend",
];

export interface CompassMessage {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
  suggestAce?: boolean;
  chips?: string[];
  failed?: boolean;
}

// Follow-up chips derived from the last reply, so the next step is one tap away.
export function deriveChips(msg: CompassMessage, roundCount: number): string[] {
  if (msg.failed) return ["Try again"];

  const cards = msg.cards ?? [];
  const text = (msg.content ?? "").toLowerCase();
  const chips: string[] = [];

  if (cards.length > 0) {
    // Same ACE-derived difficulty the cards and detail pages show, not the raw data field
    const diff = computeDifficulty(getACE(cards[0]));
    if (diff === "Hard" || diff === "Advanced" || diff === "Extreme") chips.push("Something easier");
    else if (diff === "Easy" || diff === "Moderate") chips.push("Something harder");
    chips.push(`More in ${cards[0].state}`);
    chips.push(cards.length === 1 ? "Show more options" : "Shorter trips");
  }

  if (text.includes("mountain") || text.includes("coast") || text.includes("prefer")) {
    chips.push("Mountains", "Coastal", "Northeast");
  }
  if (text.includes("how many days") || text.includes("how long") || text.includes("duration")) {
    chips.push("A weekend", "4–6 days", "A week or more");
  }
  if (text.includes("difficulty") || text.includes("experience") || text.includes("fitness") || text.includes("level")) {
    chips.push("I'm a beginner", "Reasonably fit", "Very fit");
  }
  if (text.includes("solo") || text.includes("group") || text.includes("travel with")) {
    chips.push("Solo", "With friends", "With family");
  }

  if (chips.length < 2 && roundCount >= 2) {
    chips.push("Somewhere remote", "Best this season", "High altitude");
  }

  return [...new Set(chips)].slice(0, 4);
}
