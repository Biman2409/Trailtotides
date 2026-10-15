// Thin event hook. Forwards to whichever analytics is on the page (gtag, dataLayer or a
// custom listener) and is a no-op when none is, so call sites never need to check.
type Props = Record<string, string | number | boolean>;

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    if (typeof w.gtag === "function") w.gtag("event", event, props);
    else if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...props });
    window.dispatchEvent(new CustomEvent("ttt:track", { detail: { event, props } }));
  } catch {
    // analytics must never break the UI
  }
}
