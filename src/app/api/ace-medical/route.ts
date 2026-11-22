import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { z } from "zod";
import { readMedicalFlags, saveMedicalFlags, deleteMedicalFlags } from "@/lib/aceMedicalStore";

// Kept apart from the scored ACE profile, in a private table rather than user_metadata. The client scores from the answers before saving;
// this route only stores the flags for cautions and later refinement.
const medicalFlagsSchema = z.object({
  version: z.literal(1),
  answeredAt: z.string(),
  cardioRespiratory: z.boolean().optional(),
  jointInjury: z.boolean().optional(),
  jointInjuryNote: z.string().max(1000).optional(),
  ongoingMedicalNeeds: z.boolean().optional(),
  medicationEffects: z.boolean().optional(),
  smokingTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  alcoholTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  skippedAll: z.boolean().optional(),
});

function adminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Answers live in the private ace_medical table (see src/lib/aceMedicalStore.ts), never in the
// login token. The browser only reads them back to prefill the questions on a retake.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ flags: null });
  const flags = await readMedicalFlags(adminClient(), user);
  return NextResponse.json({ flags }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = medicalFlagsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid medical flags" }, { status: 400 });
  }

  const ok = await saveMedicalFlags(adminClient(), user, parsed.data);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Could not save" }, { status: 500 });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await deleteMedicalFlags(adminClient(), user);
  return NextResponse.json({ ok: true });
}
