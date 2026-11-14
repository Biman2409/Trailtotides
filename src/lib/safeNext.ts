// Where to send someone after signing in: only a path on this site. "//evil.example" and
// "/\evil.example" are read by browsers as another site, so those fall back too.
// Shared by server code (auth emails, callback) and the browser (login page, Google button).
export const safeNext = (next: string | null | undefined, fallback = "/") =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
