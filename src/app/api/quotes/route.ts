import { NextResponse } from "next/server";
import { z } from "zod";
import { adventures } from "@/lib/data";
import { readJson, requireUser } from "@/lib/apiUser";
import { getAllOperatorProfiles } from "@/app/auth/operator-actions";
import { rateLimit } from "@/lib/rateLimit";
import { CONTACT_INBOX, sendQuoteCopy, sendQuoteRequest } from "@/lib/email";
import { QUOTE_REQUESTS } from "@/lib/features";

// Quote requests need an account: operators get real people, and we can stop spam at the source.

const today = () => new Date().toISOString().slice(0, 10);
const createSchema = z.object({
  slug: z.string(),
  operators: z.array(z.string()).min(1).max(5),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => d >= today(), "Pick a date from today on"),
  flexible: z.boolean(),
  groupSize: z.number().int().min(1).max(50),
  message: z.string().max(1000).transform((s) => s.trim()),
});

// GET — the caller's quote requests, newest first
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { data } = await auth.supabase.from("quote_requests")
    .select("id, slug, operators, start_date, flexible, group_size, created_at").order("created_at", { ascending: false }).limit(50);
  return NextResponse.json({ requests: data ?? [] });
}

// POST — send a quote request to some of the adventure's verified operators
export async function POST(req: Request) {
  if (!QUOTE_REQUESTS) return NextResponse.json({ error: "Quote requests aren't available yet" }, { status: 404 });
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  if (!rateLimit(`quote:${auth.user.id}`, 5, 60 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "That's a lot of requests in an hour. Try again a bit later." }, { status: 429 });
  }

  const parsed = createSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form" }, { status: 400 });
  const q = parsed.data;
  const adventure = adventures.find((a) => a.slug === q.slug);
  if (!adventure) return NextResponse.json({ error: "Adventure not found" }, { status: 404 });
  // Only the adventure's own verified operators can be asked
  const verified = new Set(adventure.operators.filter((o) => o.verified).map((o) => o.name));
  const operators = [...new Set(q.operators)].filter((n) => verified.has(n));
  if (!operators.length) return NextResponse.json({ error: "Pick at least one verified operator" }, { status: 400 });

  const { error } = await auth.supabase.from("quote_requests").insert({
    user_id: auth.user.id, slug: q.slug, operators, start_date: q.startDate, flexible: q.flexible, group_size: q.groupSize, message: q.message,
  });
  if (error) return NextResponse.json({ error: "Couldn't send the request" }, { status: 500 });

  // Operators who run their profile on the platform get it directly; our inbox gets every
  // request and forwards it to the ones who aren't on the platform yet.
  const lower = new Set(operators.map((n) => n.toLowerCase()));
  const direct = (await getAllOperatorProfiles())
    .filter((p) => p.status === "approved" && lower.has(p.company_name.toLowerCase()) && p.email)
    .map((p) => p.email);

  const meta = auth.user.user_metadata ?? {};
  const email = {
    traveller: { name: String(meta.full_name || meta.username || "A traveller"), email: auth.user.email ?? "" },
    adventure: { name: adventure.name, slug: adventure.slug },
    operators, startDate: q.startDate, flexible: q.flexible, groupSize: q.groupSize, message: q.message,
  };
  // One email per recipient, so operators never see each other's addresses
  const results = await Promise.all([CONTACT_INBOX, ...new Set(direct)].map((to) => sendQuoteRequest([to], email)));
  if (email.traveller.email) await sendQuoteCopy(email);

  return NextResponse.json({ ok: true, emailed: results.some((r) => !("error" in r)) });
}
