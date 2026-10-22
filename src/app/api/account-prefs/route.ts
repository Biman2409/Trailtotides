import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { prefsOf, readJson, requireUser } from "@/lib/apiUser";

const patchSchema = z.object({
  wishlistAlerts: z.boolean().optional(),
  passportPublic: z.boolean().optional(),
});

// GET — the caller's alert and sharing preferences
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  return NextResponse.json(prefsOf(auth.user));
}

// PATCH — turn wishlist alerts or the public passport link on or off
export async function PATCH(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = patchSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });

  const { wishlistAlerts, passportPublic } = parsed.data;
  const meta = { ...auth.user.user_metadata };
  if (wishlistAlerts !== undefined) meta.wishlist_alerts = wishlistAlerts;
  if (passportPublic !== undefined) meta.passport_public = passportPublic;

  const admin = await createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(auth.user.id, { user_metadata: meta });
  if (error) return NextResponse.json({ error: "Couldn't save" }, { status: 500 });
  return NextResponse.json(prefsOf({ user_metadata: meta }));
}
