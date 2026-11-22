/** A departure closer than this can't realistically be booked (travel to the start, permits),
 *  so "next departure" and departure lists start from here */
export const BOOKING_LEAD_DAYS = 3;

/** The first date that can still be booked, as YYYY-MM-DD in India, where the trips run */
export function firstBookableDate(now: Date = new Date()): string {
  return new Date(now.getTime() + BOOKING_LEAD_DAYS * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** The soonest bookable departure, as "5 Dec"; null when none is left */
export function getNextDeparture(allDates: string[], today: Date = new Date()): string | null {
  const cutoff = firstBookableDate(today);
  const upcoming = allDates
    .map((d) => d.slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= cutoff)
    .sort();
  if (upcoming.length === 0) return null;
  return new Date(`${upcoming[0]}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
