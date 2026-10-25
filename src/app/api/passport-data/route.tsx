import { NextResponse } from "next/server";
import { computePassportData, publicPassportUserId } from "@/lib/passportData";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // ?u=<username> is someone else's passport, only when they've made it public
  const u = url.searchParams.get("u");
  const publicId = u ? await publicPassportUserId(u) : undefined;
  if (u && !publicId) return NextResponse.json({ error: "This passport isn't public." }, { status: 404 });

  const data = await computePassportData(url.origin, url.searchParams.get("demo"), publicId);
  if (!data) {
    return NextResponse.json({ error: "Log in to view your Adventure Passport." }, { status: 401 });
  }
  return NextResponse.json(data);
}
