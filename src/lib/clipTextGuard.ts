// Words filled with a background clipped to the text (TRAIL, TIDES, "adventures") are
// otherwise transparent. Dark-mode extensions such as Midnight Lizard strip background
// images, which would leave those words invisible. This watches for that and flags the
// root with data-plain, so CSS can fall back to a solid colour.

// `expect` is a fragment of the intended fill (e.g. one of its colours); some extensions don't
// strip the gradient but darken it, which also counts as tampered.
export function guardClippedText(root: HTMLElement, selector: string, expect?: string): () => void {
  let raf = 0;
  const check = () => {
    raf = 0;
    const stripped = [...root.querySelectorAll<HTMLElement>(selector)].some((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      return bg === "none" || (!!expect && !bg.includes(expect));
    });
    root.toggleAttribute("data-plain", stripped);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };
  check();
  // Extensions restyle the page after load: re-check when attributes or injected styles change
  const mo = new MutationObserver(schedule);
  mo.observe(root, { subtree: true, attributes: true, attributeFilter: ["style", "class"] });
  mo.observe(document.head, { childList: true });
  mo.observe(document.documentElement, { attributes: true });
  return () => { mo.disconnect(); cancelAnimationFrame(raf); };
}
