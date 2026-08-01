import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { z } from "zod";

// Mirrors api/ace-profile/route.ts exactly, but writes to a separate
// user_metadata key (ace_medical) — architecturally isolated from the
// scored ACE profile, never read by anything that computes a score.
const medicalFlagsSchema = z.object({
  version: z.literal(1),
  answeredAt: z.string(),
  cardioRespiratory: z.boolean().optional(),
  jointInjury: z.boolean().optional(),
  jointInjuryNote: z.string().max(1000).optional(),
  ongoingMedicalNeeds: z.boolean().optional(),
  medicationEffects: z.boolean().optional(),
  pregnancy: z.enum(["no", "yes", "prefer_not_to_say"]).optional(),
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

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ flags: null });

  const flags = user.user_metadata?.ace_medical ?? null;
  return NextResponse.json({ flags });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = medicalFlagsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid medical flags" }, { status: 400 });
  }

  const admin = adminClient();
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      ace_medical: parsed.data,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // See api/ace-profile/route.ts DELETE — updateUserById merges
  // user_metadata, so clearing a field needs an explicit null, not omission.
  const admin = adminClient();
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, ace_medical: null },
  });

  return NextResponse.json({ ok: true });
}
