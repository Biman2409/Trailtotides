import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

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

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Ignore any client-supplied id — use the authenticated session's user id when one
    // exists (logo update after signup), otherwise a server-generated opaque id (pre-auth
    // upload during signup). Never trust a client-supplied id for the storage path, or any
    // caller could target and overwrite another operator's logo file.
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const ownerId = user?.id ?? randomUUID();

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${ownerId}-logo.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("operator-logo upload failed:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("operator-logo route error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
