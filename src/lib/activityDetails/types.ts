import type { GuideSection, Source } from "@/lib/adventurepedia";

/** The full guide on an activity's page: the short version, then its sections */
export interface ActivityDetail {
  tldr: string[];
  sections: GuideSection[];
  sources?: Source[];
  /** ISO date of the last real revision; defaults to GUIDES_UPDATED */
  updated?: string;
}
