import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "operator-profiles";
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_SIZE });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureBucket();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const userId = form.get("user_id") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or user_id" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}-logo.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
