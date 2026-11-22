import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { readMedicalFlags } from "@/lib/aceMedicalStore";
import { adventures } from "@/lib/data";
import { deriveMedicalCautions } from "@/lib/medicalCautions";
import type { MedicalFlags } from "@/lib/matchmakerQuestions";

// The signed-in user's caution notes for one adventure. Derived here so only the finished
// advisory strings reach the browser, never the raw medical flags.
export async function GET(req: NextRequest) {
  const adventure = adventures.find((a) => a.slug === req.nextUrl.searchParams.get("slug"));
  if (!adventure) return NextResponse.json({ notes: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const flags: MedicalFlags | null = user ? await readMedicalFlags(await createAdminClient(), user) : null;
  return NextResponse.json(
    { notes: deriveMedicalCautions(flags, adventure) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
