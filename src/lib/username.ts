// Shared username rules + the client-side availability check, so signup and the profile
// page can't drift apart (they used to, and showed "already taken" for things that weren't).

/** 3-20 characters: lowercase letters, numbers, underscore. Same rule the server enforces. */
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export const USERNAME_RULE_TEXT = "Use 3–20 lowercase letters, numbers or underscores";

export type UsernameCheck = "available" | "taken" | "invalid" | "error";

/**
 * Ask the server whether a username is free. Only a real "taken" answer is reported as taken:
 * a rate limit, a failed lookup or a network error is "error" (retry), and a name the server
 * rejects for its characters is "invalid".
 */
export async function checkUsernameAvailability(value: string): Promise<UsernameCheck> {
  if (!USERNAME_RE.test(value)) return "invalid";
  try {
    const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
    if (!res.ok) return "error";
    const data = await res.json();
    if (data.reason === "invalid") return "invalid";
    if (data.reason === "taken") return "taken";
    return data.available === true ? "available" : "error";
  } catch {
    return "error";
  }
}
