import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const STORAGE_BUCKET = "story-reactions";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Storage key is built directly from `slug` — restrict to safe path characters.
const SLUG_RE = /^[a-z0-9-]+$/;
// Reaction keys are emoji — cap key length generously rather than hardcoding
// exact emoji strings (avoids fragile unicode-variant mismatches with the client).
const reactionsSchema = z.record(
  z.string().min(1).max(8),
  z.number().int().min(0).max(1_000_000)
).refine((obj) => Object.keys(obj).length <= 20, "Too many reaction types");

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug || !SLUG_RE.test(slug)) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

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
  const { allowed, retryAfterMs } = rateLimit(`story-reactions:${getClientIp(req)}`, 30, 5 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  if (!slug || typeof slug !== "string" || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Missing or invalid slug" }, { status: 400 });
  }
  const parsedReactions = reactionsSchema.safeParse(body?.reactions);
  if (!parsedReactions.success) {
    return NextResponse.json({ error: "Invalid reactions payload" }, { status: 400 });
  }
  const reactions = parsedReactions.data;

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