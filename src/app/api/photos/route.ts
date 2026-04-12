import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "adventure-photos";
const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];

// GET /api/photos?slug=<slug>
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const { data, error } = await admin
    .from("adventure_photos")
    .select("id, slug, user_id, username, avatar_id, caption, url, created_at")
    .eq("slug", slug)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("adventure_photos")) {
      return NextResponse.json({ photos: [], tableReady: false });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ photos: data ?? [], tableReady: true });
}

// POST /api/photos — upload a photo
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const slug = form.get("slug") as string | null;
  const caption = (form.get("caption") as string | null)?.trim() ?? "";

  if (!file || !slug) return NextResponse.json({ error: "Missing file or slug" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

  // Upload to storage
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${slug}/${user.id}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

  const username =
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Explorer";
  const avatar_id: number | null = user.user_metadata?.avatar_id ?? null;

  const { data, error: insertError } = await admin
    .from("adventure_photos")
    .insert({ slug, user_id: user.id, username, avatar_id, caption, url: publicUrl, path })
    .select()
    .single();

  if (insertError) {
    // Clean up uploaded file on insert failure
    await admin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: "Database not ready. Please set up the adventure_photos table." }, { status: 503 });
  }

  return NextResponse.json({ photo: { ...data } });
}

// DELETE /api/photos?id=<id>
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: photo } = await admin
    .from("adventure_photos")
    .select("path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (photo?.path) {
    await admin.storage.from(BUCKET).remove([photo.path]);
  }

  const { error } = await admin
    .from("adventure_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
