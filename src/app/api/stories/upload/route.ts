import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "story-submissions";
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Use JPEG, PNG, or WebP." }, { status: 400 });
    }

    // Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.find((b) => b.name === BUCKET)) {
      await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE,
      });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const path = `${id}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      console.error("story upload storage error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("story upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}