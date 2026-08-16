export function parsePrice(p: string): number {
  const n = parseInt(p.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? Infinity : n;
}
