// Textures clipped into the hero words: a contour map inside TRAIL and wave lines inside TIDES.

/** Seamless 240px tile of horizontal sine lines, as an SVG data URI (cheap to paint, safe on the server). */
function waveTile(amp: number, gap: number, opacity: number, phase: number, stroke: number): string {
  const W = 240;
  const H = 180;
  let paths = "";
  for (let k = 0; k * gap < H + gap; k++) {
    const y = k * gap + 8;
    let d = `M0 ${y}`;
    for (let x = 0; x <= W; x += 6) {
      d += `L${x} ${(y + amp * Math.sin((x / W) * Math.PI * 4 + k * phase)).toFixed(1)}`;
    }
    paths += `<path d="${d}" fill="none" stroke="rgba(255,255,255,${opacity})" stroke-width="${stroke}" stroke-linecap="round"/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'>${paths}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export const TIDES_FILL = [
  waveTile(5, 20, 0.5, 0.7, 1.6),
  waveTile(3, 13, 0.18, 1.3, 1),
  "linear-gradient(180deg,#b8f6ec 0%,#4fd6cf 45%,#1797a8 100%)",
].join(",");
export const TIDES_SIZE = "240px 180px,240px 180px,100% 100%";

// Contour map is pre-rendered by scripts/gen-hero-contours.mjs; it's twice the word's width
// so it can drift across the letters.
export const TRAIL_FILL = "url(/hero/trail-contours.png),linear-gradient(180deg,#ffc27a 0%,#ff8a33 45%,#f2560f 100%)";
export const TRAIL_SIZE = "200% 100%,100% 100%";
