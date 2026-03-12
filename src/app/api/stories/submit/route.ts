import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      excerpt,
      body: storyBody,
      authorName,
      authorRole,
      email,
      phone,
      dateOfAdventure,
      region,
      state,
      tags,
      readTime,
      heroImageUrl,
    } = body;

    if (!title || !excerpt || !storyBody || !authorName || !email || !dateOfAdventure || !region || !state) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    const { error } = await adminClient.from("story_submissions").insert({
      title,
      excerpt,
      body: storyBody,
      author_name: authorName,
      author_role: authorRole || null,
      email,
      phone: phone || null,
      date_of_adventure: dateOfAdventure,
      region,
      state,
      tags: tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      read_time: readTime || null,
      hero_image_url: heroImageUrl || null,
      status: "pending",
    });

    if (error) {
      console.error("story_submissions insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("story submit route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
