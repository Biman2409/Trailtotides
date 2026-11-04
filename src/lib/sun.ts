// Sunrise and sunset for a place and day, from NOAA's solar position equations (good to a
// minute or two), in India time. They assume a flat horizon: in a valley or under a ridge the
// sun leaves sooner and arrives later than this.

const RAD = Math.PI / 180;
const IST_MIN = 330;

/** Minutes after midnight, India time; null where the sun doesn't rise or set that day */
export function sunTimes(lat: number, lng: number, date: Date): { rise: number; set: number } | null {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const n = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86_400_000);
  const g = ((2 * Math.PI) / 365) * (n - 1 + 0.5); // the year's angle, at noon
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const cosH = Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decl)) - Math.tan(lat * RAD) * Math.tan(decl);
  if (cosH < -1 || cosH > 1) return null;
  const ha = Math.acos(cosH) / RAD;
  return { rise: 720 - 4 * (lng + ha) - eqTime + IST_MIN, set: 720 - 4 * (lng - ha) - eqTime + IST_MIN };
}

/** "6:42 am" from minutes after midnight */
export function clock(min: number) {
  const m = Math.round(((min % 1440) + 1440) % 1440);
  const h = Math.floor(m / 60), mm = m % 60;
  return `${h % 12 || 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
