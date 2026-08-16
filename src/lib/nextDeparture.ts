export function getNextDeparture(allDates: string[], today: Date = new Date()): string | null {
  const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcoming = allDates
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()) && d.getTime() >= cutoff.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  if (upcoming.length === 0) return null;
  return upcoming[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
