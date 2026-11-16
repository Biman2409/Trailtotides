import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

type Comment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  userId?: string;
};

// Storage keys are built from `slug`, so it's held to safe path characters. The name is no longer
// taken from the request: it comes from the signed-in account, so no one can post as someone else.
const commentSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  body: z.string().trim().min(1).max(1000),
});

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

async function readJson(path: string): Promise<unknown> {
  const { data } = await admin.storage.from(STORAGE_BUCKET).download(path);
  if (!data) return null;
  try { return JSON.parse(await data.text()); } catch { return null; }
}

/** What anyone can see of a comment: never the account id behind it */
const shown = (c: Comment) => ({ id: c.id, name: c.name, body: c.body, createdAt: c.createdAt });

const isComment = (c: unknown): c is Comment =>
  !!c && typeof c === "object" && typeof (c as Comment).id === "string" && typeof (c as Comment).body === "string";

/**
 * A story's comments, newest first: the older single file (`<slug>.json`, from before comments were
 * saved one per file) plus one file per comment in the `<slug>/` folder. One file per comment means
 * two people posting at once can't overwrite each other, which a shared file allowed.
 */
async function readComments(slug: string): Promise<Comment[]> {
  const legacy = await readJson(`${slug}.json`);
  const old = Array.isArray(legacy) ? legacy : (legacy as { comments?: unknown[] } | null)?.comments ?? [];
  const { data: files } = await admin.storage.from(STORAGE_BUCKET).list(slug, { limit: 500, sortBy: { column: "name", order: "desc" } });
  const fresh = await Promise.all((files ?? []).filter((f) => f.name.endsWith(".json")).map((f) => readJson(`${slug}/${f.name}`)));
  const all = [...fresh, ...old].filter(isComment).map(shown);
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug || !/^[a-z0-9-]{1,100}$/.test(slug)) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
    await ensureBucket();
    return NextResponse.json({ comments: await readComments(slug) });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });

  const { allowed, retryAfterMs } = rateLimit(`story-comment:${user.id}:${getClientIp(req)}`, 10, 5 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many comments. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const parsed = commentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slug or comment" }, { status: 400 });
  }
  const { slug, body } = parsed.data;
  const name = String(user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split("@")[0] || "Traveller").slice(0, 60);

  try {
    await ensureBucket();
    const createdAt = new Date().toISOString();
    const newComment: Comment = { id: crypto.randomUUID(), name, body, createdAt, userId: user.id };
    // Sortable file name (time first), unique per comment
    const path = `${slug}/${createdAt.replace(/[:.]/g, "-")}-${newComment.id.slice(0, 8)}.json`;
    const { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(path, new TextEncoder().encode(JSON.stringify(newComment)), { contentType: "application/json", upsert: false });

    if (error) throw error;
    return NextResponse.json(shown(newComment));
  } catch (e) {
    console.error("story comment post error:", e);
    return NextResponse.json({ error: "Could not post comment" }, { status: 500 });
  }
}
