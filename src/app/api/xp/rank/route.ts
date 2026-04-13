import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "user-data";

// List all XP files, read totals, compute rank for requesting user
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ rank: null, total: null });

  try {
    // List all files in xp/ folder
    const { data: files } = await admin.storage.from(BUCKET).list("xp", { limit: 1000 });
    if (!files || files.length === 0) return NextResponse.json({ rank: 1, total: 1 });

    // Read all XP totals in parallel (cap at 200 files for perf)
    const slice = files.slice(0, 200);
    const totals = await Promise.all(
      slice.map(async (file) => {
        const uid = file.name.replace(".json", "");
        const { data } = await admin.storage.from(BUCKET).download(`xp/${file.name}`);
        if (!data) return { uid, xp: 0 };
        try {
          const events: { xp: number; revoked?: boolean }[] = JSON.parse(await data.text());
          const xp = Array.isArray(events) ? events.filter(e => !e.revoked).reduce((s, e) => s + (e.xp ?? 0), 0) : 0;
          return { uid, xp };
        } catch {
          return { uid, xp: 0 };
        }
      })
    );

    // Sort descending
    totals.sort((a, b) => b.xp - a.xp);

    const idx = totals.findIndex(t => t.uid === user.id);
    const rank = idx === -1 ? totals.length + 1 : idx + 1;
    const total = totals.length;

    return NextResponse.json({ rank, total });
  } catch {
    return NextResponse.json({ rank: null, total: null });
  }
}
