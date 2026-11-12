// Links to log in or sign up that bring the person back to where they were afterwards.
// Works on the server (pass the path) and in the browser (defaults to the current page).

function back(next?: string): string {
  const here = next ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "");
  // Home and the auth pages themselves aren't worth returning to
  return here && here !== "/" && here.startsWith("/") && !here.startsWith("//") && !here.startsWith("/auth") ? here : "";
}

export function loginHref(next?: string): string {
  const n = back(next);
  return n ? `/auth/login?next=${encodeURIComponent(n)}` : "/auth/login";
}

export function signupHref(next?: string): string {
  const n = back(next);
  return n ? `/auth/signup?next=${encodeURIComponent(n)}` : "/auth/signup";
}
