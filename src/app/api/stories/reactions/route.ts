import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const STORAGE_BUCKET = "story-reactions";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.find((b) => b.name === STORAGE_BUCKET);
    if (!bucketExists) return NextResponse.json({});

    const { data } = await admin.storage.from(STORAGE_BUCKET).download(`${slug}.json`);
    if (!data) return NextResponse.json({});

    const text = await data.text();
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  const { slug, reactions } = await req.json();
  if (!slug || !reactions) {
    return NextResponse.json({ error: "Missing slug or reactions" }, { status: 400 });
  }

  try {
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.find((b) => b.name === STORAGE_BUCKET)) {
      await admin.storage.createBucket(STORAGE_BUCKET, { public: true });
    }

    const json = JSON.stringify(reactions);
    const bytes = new TextEncoder().encode(json);
    const { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(`${slug}.json`, bytes, {
        contentType: "application/json",
        upsert: true,
      });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}