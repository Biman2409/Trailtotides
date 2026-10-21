import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireUser } from "@/lib/apiUser";
import { searchMatches } from "@/lib/alerts";

// Saved map searches: a name and the map's link params. The daily alerts job emails when
// adventures that weren't matching before start to (new listings, a filter's season opening).

// Only the map's own params are kept, so a saved link can't carry anything else
const KEEP = ["q", "type", "state", "difficulty", "dur", "month", "max", "ace", "editor", "near", "r"];
const cleanQuery = (raw: string) => {
  const p = new URLSearchParams(raw);
  const out = new URLSearchParams();
  for (const k of KEEP) { const v = p.get(k); if (v) out.set(k, v.slice(0, 120)); }
  return out.toString();
};

const createSchema = z.object({
  name: z.string().transform((s) => s.replace(/\s+/g, " ").trim().slice(0, 60)).pipe(z.string().min(1)),
  query: z.string().max(500).transform(cleanQuery).pipe(z.string().min(1, "Set a filter first")),
});
const patchSchema = z.object({ id: z.string().uuid(), alerts: z.boolean() });

// GET — the caller's saved searches, with how many adventures each matches today
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { data } = await auth.supabase.from("saved_searches")
    .select("id, name, query, alerts, created_at").order("created_at", { ascending: false }).limit(50);
  return NextResponse.json({ searches: (data ?? []).map((s) => ({ ...s, matches: searchMatches(s.query).length })) });
}

// POST — save a search; what it matches now counts as already seen
export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = createSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid search" }, { status: 400 });

  const { count } = await auth.supabase.from("saved_searches").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= 20) return NextResponse.json({ error: "You can keep up to 20 saved searches" }, { status: 400 });

  const { error } = await auth.supabase.from("saved_searches").insert({
    user_id: auth.user.id, name: parsed.data.name, query: parsed.data.query,
    seen_slugs: searchMatches(parsed.data.query).map((a) => a.slug),
  });
  if (error) return NextResponse.json({ error: "Couldn't save the search" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH — turn a search's email alerts on or off
export async function PATCH(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = patchSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid change" }, { status: 400 });
  await auth.supabase.from("saved_searches").update({ alerts: parsed.data.alerts }).eq("id", parsed.data.id);
  return NextResponse.json({ ok: true });
}

// DELETE ?id= — remove a saved search
export async function DELETE(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await auth.supabase.from("saved_searches").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
