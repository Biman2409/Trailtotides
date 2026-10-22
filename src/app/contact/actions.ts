"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { sendContactEmail, CONTACT_INBOX } from "@/lib/email";
import { CONTACT_TOPICS, type ContactResult } from "./topics";

// Every message is saved (the admin page lists them) and emailed to the team inbox.
// Either one landing counts as delivered, so a mail outage never loses a message.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort flood guard. Per server instance, so it slows a script down rather than
// stopping a determined one; the honeypot and timing check catch most bots first.
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

async function deliver(msg: { name: string; email: string; topic?: string; message: string; page?: string }): Promise<ContactResult> {
  // A missing service key makes the client throw; still try the email if so
  let stored: { error: { message: string } | null };
  try {
    const admin = await createAdminClient();
    stored = await admin
      .from("contact_messages")
      .insert({ name: msg.name, email: msg.email, message: msg.topic ? `[${msg.topic}] ${msg.message}` : msg.message });
  } catch (e) {
    stored = { error: { message: e instanceof Error ? e.message : "could not reach the database" } };
  }
  if (stored.error) console.error("contact: could not save message", stored.error.message);

  const mailed = await sendContactEmail(msg);
  if (mailed.error) console.error("contact: could not email message", mailed.error);

  if (stored.error && mailed.error) {
    return { ok: false, error: `We couldn't send that just now. Please try again, or email ${CONTACT_INBOX}.` };
  }
  return { ok: true };
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  topic?: string;
  message: string;
  /** Hidden field real people never fill in */
  company?: string;
  /** When the form was first shown, in ms */
  startedAt?: number;
}): Promise<ContactResult> {
  const name = (input.name ?? "").trim().slice(0, 100);
  const email = (input.email ?? "").trim().toLowerCase().slice(0, 200);
  const message = (input.message ?? "").trim().slice(0, 5000);
  const topic = CONTACT_TOPICS.find((t) => t === input.topic);

  if (!name) return { ok: false, error: "Please add your name.", field: "name" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "That email doesn't look right.", field: "email" };
  if (message.length < 10) return { ok: false, error: "Please write a little more so we can help.", field: "message" };

  // Bots fill the hidden field or submit instantly: pretend it worked and drop it
  if (input.company || (input.startedAt && Date.now() - input.startedAt < 2500)) return { ok: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return { ok: false, error: `That's a lot of messages in a row. Please wait a few minutes, or email ${CONTACT_INBOX}.` };

  return deliver({ name, email, topic, message, page: "Contact page" });
}
