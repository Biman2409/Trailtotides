import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { z } from "zod";

const aceAxesSchema = z.object({
  stamina: z.number().min(0).max(5),
  power: z.number().min(0).max(5),
  strength: z.number().min(0).max(5),
  agility: z.number().min(0).max(5),
  water: z.number().min(0).max(5),
  altitude: z.number().min(0).max(5),
  focus: z.number().min(0).max(5),
  nerve: z.number().min(0).max(5),
});

// Client sends/expects a StoredProfile shape: { ace: {...}, mode?, rawAxes?, answers? }.
// mode and answers let a quick result be refined on another device; answers are capability
// and calibration answers only — health answers are stored by /api/ace-medical; their effect
// on the scores is already in `ace`.
const aceProfileSchema = z.object({
  ace: aceAxesSchema,
  mode: z.enum(["quick", "full"]).optional().catch(undefined),
  rawAxes: z.record(z.string(), z.number().min(0).max(5)).optional().catch(undefined),
  answers: z.record(z.string().max(40).refine((k) => !k.startsWith("med-")), z.union([z.string().max(40), z.number()]))
    .refine((a) => Object.keys(a).length <= 40)
    .optional().catch(undefined), // a malformed extra never blocks saving the profile itself
});

function adminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — load ACE profile for the logged-in user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ profile: null });

  // Stored flat in user_metadata; wrap to match the client's { ace: {...} } contract
  const meta = user.user_metadata ?? {};
  const aceAxes = meta.ace_profile ?? null;
  const updatedAt = meta.ace_profile_updated_at ?? null;
  return NextResponse.json({
    profile: aceAxes
      ? { ace: aceAxes, updatedAt, mode: meta.ace_profile_mode ?? undefined, rawAxes: meta.ace_profile_raw ?? undefined, answers: meta.ace_profile_answers ?? undefined }
      : null,
  });
}

// POST — save ACE profile for the logged-in user
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = aceProfileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ACE profile" }, { status: 400 });
  }

  // Server-stamped, never trusts a client-supplied timestamp — otherwise a
  // user could reset their system clock and make a stale profile look fresh.
  const updatedAt = new Date().toISOString();

  const admin = adminClient();
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      ace_profile: parsed.data.ace,
      ace_profile_updated_at: updatedAt,
      ace_profile_mode: parsed.data.mode ?? null,
      ace_profile_raw: parsed.data.rawAxes ?? null,
      ace_profile_answers: parsed.data.answers ?? null,
    },
  });

  return NextResponse.json({ ok: true, updatedAt });
}

// DELETE — clear the ACE profile for the logged-in user
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Supabase's updateUserById merges user_metadata rather than replacing it
  // — omitting a key from the payload leaves it untouched server-side, so
  // clearing a field requires setting it to null explicitly, not omitting it.
  const admin = adminClient();
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      ace_profile: null, ace_profile_updated_at: null,
      ace_profile_mode: null, ace_profile_raw: null, ace_profile_answers: null,
    },
  });

  return NextResponse.json({ ok: true });
}
