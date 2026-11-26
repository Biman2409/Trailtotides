// Shared by the contact form and its server action
export const CONTACT_TOPICS = [
  "A trip question",
  "Listing my adventures",
  "Partnership",
  "Press",
  "Report a problem",
  "Suggest a guide",
  "Feedback",
] as const;

export type ContactResult = { ok: true } | { ok: false; error: string; field?: "name" | "email" | "message" };
