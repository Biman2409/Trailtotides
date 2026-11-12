import { track } from "@/lib/analytics";

export type OutboundSource = "compare" | "sidebar" | "mobile_bar" | "map" | "operators_page" | "operators_list";

type Outbound = { url: string; operator: string; source: OutboundSource; slug?: string };

// The operator's link with our UTM tags, so their own analytics shows the visit came from us.
export function operatorHref(url: string, slug?: string): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "trailtotides");
      u.searchParams.set("utm_medium", "referral");
      if (slug) u.searchParams.set("utm_campaign", slug);
    }
    return u.toString();
  } catch {
    return url;
  }
}

// Records the click (our own table + any analytics on the page). Safe to call from an <a> onClick.
export function recordOutbound({ url, operator, source, slug }: Outbound) {
  let host: string | undefined;
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch {}
  track("book_click", { operator, source, ...(slug ? { slug } : {}) });
  try {
    const payload = JSON.stringify({ operator, source, slug, host });
    const sent = typeof navigator !== "undefined" && navigator.sendBeacon?.("/api/outbound", new Blob([payload], { type: "application/json" }));
    if (!sent) fetch("/api/outbound", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  } catch {
    // never block the visitor on tracking
  }
}

// Opens the operator's site in a new tab. "noopener" without "noreferrer", so the operator
// sees trailtotides.com as the referrer (the site's Referrer-Policy sends the origin only).
export function openOperator(o: Outbound) {
  recordOutbound(o);
  window.open(operatorHref(o.url, o.slug), "_blank", "noopener");
}
