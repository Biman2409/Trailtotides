// Word-by-word text matching that forgives a small typo. Kept free of the catalogue so the
// header search box can use it without loading the adventure data.

export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/** A small typo still finds the word: "kedarkanta" finds Kedarkantha. One letter off for 5–7 letter
 *  words, two for longer ones; short words must match exactly, or "ali" would find half the catalogue. */
export function nearWord(w: string, tokens: string[]): boolean {
  if (w.length < 5) return false;
  const max = w.length >= 8 ? 2 : 1;
  return tokens.some((t) => Math.abs(t.length - w.length) <= max && editDistance(w, t) <= max);
}

/** Words people search with, and what they mean in the catalogue's own words */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  trek: ["trekking"], treks: ["trekking"], hike: ["trekking"], hiking: ["trekking"],
  bike: ["motorcycling", "cycling"], biking: ["motorcycling", "cycling"], ride: ["motorcycling", "cycling"],
  motorbike: ["motorcycling"], cycle: ["cycling"], climb: ["mountaineering", "rock climbing"],
  kashmir: ["jammu & kashmir"], himachal: ["himachal pradesh"], uk: ["uttarakhand"],
  beginner: ["easy", "moderate"], easy: ["easy"], winter: ["dec", "jan", "feb"], snow: ["winter", "snow"],
  lake: ["lake", "lakes"], lakes: ["lake", "lakes"], pass: ["pass"], summit: ["summit", "peak"],
  // Abbreviations trekkers type
  ebc: ["everest base camp"], abc: ["annapurna base camp"], kgl: ["kashmir great lakes"], vof: ["valley of flowers"],
  rafting: ["river rafting"], mtb: ["cycling"], cycling: ["cycling"], bicycle: ["cycling"],
};

/** Every word of the query appears in the text (or a synonym does, or it's one small typo away). */
export function matchesWords(text: string, query: string, synonyms: Record<string, string[]> = SEARCH_SYNONYMS): boolean {
  const words = query.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 1);
  if (words.length === 0) return true;
  const hay = text.toLowerCase();
  const tokens = hay.split(/[^a-z0-9]+/);
  return words.every((w) => hay.includes(w) || (synonyms[w] ?? []).some((s) => hay.includes(s)) || nearWord(w, tokens));
}
