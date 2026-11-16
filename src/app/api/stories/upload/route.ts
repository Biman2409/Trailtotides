import { NextRequest, NextResponse } from "next/server";
import { bytesMatchType } from "@/lib/imageSniff";
import { createClient } from "@supabase/supabase-js";
import { rateLimitShared, getClientIp } from "@/lib/rateLimit";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "story-submissions";
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = await rateLimitShared(`story-upload:${getClientIp(req)}`, 15, 30 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

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

    // Extension from the checked file type, never from the uploaded file's name
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const path = `${id}.${ext}`;
    const bytes = await file.arrayBuffer();
    // The declared type is the sender's claim; the first bytes say what the file really is
    if (!bytesMatchType(bytes, file.type)) return NextResponse.json({ error: "That file isn't a JPG, PNG or WebP image" }, { status: 400 });

    let { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

    // Bucket doesn't exist yet on this project — create it and retry once,
    // instead of checking/creating it on every single upload.
    if (uploadError?.message?.includes("Bucket not found")) {
      await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_SIZE });
      ({ error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      }));
    }

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