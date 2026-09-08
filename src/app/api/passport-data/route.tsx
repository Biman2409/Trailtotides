import { NextResponse } from "next/server";
import { computePassportData } from "@/lib/passportData";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const data = await computePassportData(url.origin, url.searchParams.get("demo"));
  if (!data) {
    return NextResponse.json({ error: "Log in to view your Adventure Passport." }, { status: 401 });
  }
  return NextResponse.json(data);
}
