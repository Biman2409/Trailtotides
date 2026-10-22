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

const WAVE_A = waveTile(5, 20, 0.5, 0.7, 1.6);
const WAVE_B = waveTile(3, 13, 0.18, 1.3, 1);
export const TIDES_FILL = [
  WAVE_A,
  WAVE_B,
  "linear-gradient(180deg,#b8f6ec 0%,#4fd6cf 45%,#1797a8 100%)",
].join(",");
/** The two wave tiles as bare image URLs, for painting on a canvas */
export const TIDES_WAVE_SRCS = [WAVE_A, WAVE_B].map((u) => u.slice(5, -2));

