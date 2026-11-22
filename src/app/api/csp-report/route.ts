import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Browsers post here when a page breaks the Content-Security-Policy-Report-Only rules
// (next.config.ts). Nothing is blocked yet: each report goes to the server log, so the policy can
// be tightened and switched to enforcing once the logs stay quiet.
export async function POST(req: NextRequest) {
  if (!rateLimit(`csp-report:${getClientIp(req)}`, 30, 60_000).allowed) return new NextResponse(null, { status: 204 });
  try {
    const raw = await req.text();
    if (raw.length > 20_000) return new NextResponse(null, { status: 204 });
    const body = JSON.parse(raw);
    // Old format: { "csp-report": {...} }; Reporting API: [{ type, body: {...} }]
    const reports = Array.isArray(body) ? body.map((r) => r?.body ?? {}) : [body?.["csp-report"] ?? body];
    for (const r of reports.slice(0, 10)) {
      const directive = r["violated-directive"] ?? r.effectiveDirective ?? r["effective-directive"];
      const blocked = r["blocked-uri"] ?? r.blockedURL;
      const page = r["document-uri"] ?? r.documentURL;
      console.warn("CSP report:", JSON.stringify({ directive, blocked, page }).slice(0, 500));
    }
  } catch {}
  return new NextResponse(null, { status: 204 });
}
