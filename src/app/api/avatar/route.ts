/**
 * Custom profile-photo upload — separate from the preset character avatars
 * (avatar_id) and the numbered /public/avatars/avatar-N.png files. Stored in
 * its own Supabase Storage bucket, one file per user (upsert), and the
 * resulting public URL is saved as avatar_url on user_metadata alongside
 * the existing avatar_id field. avatar_url takes display priority over
 * avatar_id when both are present — see useAvatarState in AvatarPicker.tsx.
 */

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "profile-avatars";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB — a profile photo is displayed small, no need for anything larger
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_SIZE });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`avatar-upload:${user.id}`, 10, 30 * 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Unsupported file type — use JPG, PNG, or WebP" }, { status: 400 });

  await ensureBucket();

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${user.id}.${ext}`;
  const bytes = await file.arrayBuffer();

  // Clear any previous upload under a different extension so switching
  // JPG → PNG (etc.) doesn't leave an orphaned file behind.
  const staleExts = ["jpg", "png", "webp"].filter((e) => e !== ext);
  if (staleExts.length) await admin.storage.from(BUCKET).remove(staleExts.map((e) => `${user.id}.${e}`));

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) {
    console.error("avatar upload error:", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);
  // Cache-bust so the new photo shows immediately even though the path is stable
  const avatar_url = `${publicUrl}?v=${Date.now()}`;

  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, avatar_url, avatar_id: null },
  });

  return NextResponse.json({ avatar_url });
}

export async function DELETE() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Extension is unknown at this point (not stored separately from the
  // metadata URL), so just try removing all three we ever upload as —
  // Storage silently no-ops on paths that don't exist.
  await admin.storage.from(BUCKET).remove(["jpg", "png", "webp"].map((ext) => `${user.id}.${ext}`));

  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, avatar_url: null },
  });

  return NextResponse.json({ success: true });
}
