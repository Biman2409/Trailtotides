import { NextResponse } from "next/server";
import { z } from "zod";
import { adventures } from "@/lib/data";
import { newShareCode, readJson, requireUser } from "@/lib/apiUser";

const known = new Set(adventures.map((a) => a.slug));
const createSchema = z.object({
  name: z.string().transform((s) => s.replace(/\s+/g, " ").trim().slice(0, 60)).pipe(z.string().min(1)),
  slugs: z.array(z.string()).transform((l) => [...new Set(l)].filter((s) => known.has(s))).pipe(z.array(z.string()).min(2).max(3)),
});

// GET — the caller's saved comparisons, newest first
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { data } = await auth.supabase.from("saved_comparisons")
    .select("id, name, slugs, share_code, created_at").order("created_at", { ascending: false }).limit(50);
  return NextResponse.json({ comparisons: data ?? [] });
}

// POST — save the current compare under a name; returns its share code
export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = createSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Pick 2 or 3 adventures to save" }, { status: 400 });

  const code = newShareCode();
  const { error } = await auth.supabase.from("saved_comparisons")
    .insert({ user_id: auth.user.id, name: parsed.data.name, slugs: parsed.data.slugs, share_code: code });
  if (error) return NextResponse.json({ error: "Couldn't save the comparison" }, { status: 500 });
  return NextResponse.json({ code });
}

// DELETE ?id= — remove one of the caller's comparisons (its link stops working)
export async function DELETE(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await auth.supabase.from("saved_comparisons").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
