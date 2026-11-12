import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Records a Book click on its way out to an operator's website.
// Sent with navigator.sendBeacon, so the response is never read; it always answers 204.

const schema = z.object({
  operator: z.string().trim().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(120).optional(),
  host: z.string().max(200).optional(),
  source: z.enum(["compare", "sidebar", "mobile_bar", "map", "operators_page", "operators_list", "calendar"]),
});

export async function POST(req: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  if (!rateLimit(`outbound:${getClientIp(req)}`, 30, 60_000).allowed) return done;

  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return done;
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return done;
  const { operator, slug, host, source } = parsed.data;

  try {
    const { data: { user } } = await (await createClient()).auth.getUser();
    const admin = await createAdminClient();
    await admin.from("outbound_clicks").insert({
      operator,
      adventure_slug: slug ?? null,
      destination_host: host ?? null,
      source,
      user_id: user?.id ?? null,
    });
  } catch {
    // a lost click must never show the visitor an error
  }
  return done;
}
