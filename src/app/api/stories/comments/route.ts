import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const STORAGE_BUCKET = "story-comments";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function ensureBucket() {
  return admin.storage.listBuckets().then(({ data: buckets }) => {
    if (!buckets?.find((b) => b.name === STORAGE_BUCKET)) {
      return admin.storage.createBucket(STORAGE_BUCKET, { public: true });
    }
  });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
    await ensureBucket();
    const { data } = await admin.storage.from(STORAGE_BUCKET).download(`${slug}.json`);
    if (!data) return NextResponse.json({ comments: [] });

    const text = await data.text();
    const parsed = JSON.parse(text);
    const comments = Array.isArray(parsed) ? parsed : parsed.comments || [];
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  const { slug, name, body } = await req.json();
  if (!slug || !name?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Missing slug, name, or body" }, { status: 400 });
  }

  try {
    await ensureBucket();

    // Load existing comments
    let comments: any[] = [];
    try {
      const { data } = await admin.storage.from(STORAGE_BUCKET).download(`${slug}.json`);
      if (data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        comments = Array.isArray(parsed) ? parsed : parsed.comments || [];
      }
    } catch {
      // first comment
    }

    const newComment = {
      id: crypto.randomUUID(),
      name: name.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };

    comments.unshift(newComment);

    const json = JSON.stringify(comments);
    const bytes = new TextEncoder().encode(json);
    const { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(`${slug}.json`, bytes, {
        contentType: "application/json",
        upsert: true,
      });

    if (error) throw error;
    return NextResponse.json(newComment);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}