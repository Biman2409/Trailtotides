/**
 * Adventure Photos API
 *
 * Uses Supabase Storage as the data layer — no separate DB table required.
 * Each adventure slug has a folder in the "adventure-photos" bucket.
 * A `_index.json` file in each folder tracks metadata for all photos.
 */

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "adventure-photos";
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];

interface PhotoMeta {
  id: string;
  slug: string;
  user_id: string;
  username: string;
  avatar_id: number | null;
  caption: string;
  url: string;
  path: string;
  created_at: string;
}

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_SIZE,
    });
  }
}

async function readIndex(slug: string): Promise<PhotoMeta[]> {
  const { data, error } = await admin.storage
    .from(BUCKET)
    .download(`${slug}/_index.json`);
  if (error || !data) return [];
  try {
    const text = await data.text();
    return JSON.parse(text) as PhotoMeta[];
  } catch {
    return [];
  }
}

async function writeIndex(slug: string, photos: PhotoMeta[]) {
  const json = JSON.stringify(photos);
  const bytes = new TextEncoder().encode(json);
  await admin.storage
    .from(BUCKET)
    .upload(`${slug}/_index.json`, bytes, {
      contentType: "application/json",
      upsert: true,
    });
}

// GET /api/photos?slug=<slug>
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
    await ensureBucket();
    const photos = await readIndex(slug);
    return NextResponse.json({ photos, tableReady: true });
  } catch (e) {
    return NextResponse.json({ photos: [], tableReady: false });
  }
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

  await ensureBucket();

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const path = `${slug}/${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    console.error("photos upload error:", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

  const username =
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Explorer";
  const avatar_id: number | null = user.user_metadata?.avatar_id ?? null;

  const photo: PhotoMeta = {
    id,
    slug,
    user_id: user.id,
    username,
    avatar_id,
    caption,
    url: publicUrl,
    path,
    created_at: new Date().toISOString(),
  };

  // Update index
  const existing = await readIndex(slug);
  await writeIndex(slug, [photo, ...existing]);

  return NextResponse.json({ photo });
}

// DELETE /api/photos?id=<id>&slug=<slug>
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  const slug = req.nextUrl.searchParams.get("slug");
  if (!id || !slug) return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });

  const existing = await readIndex(slug);
  const photo = existing.find((p) => p.id === id);

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (photo.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Delete image file
  await admin.storage.from(BUCKET).remove([photo.path]);

  // Update index
  await writeIndex(slug, existing.filter((p) => p.id !== id));

  return NextResponse.json({ success: true });
}
