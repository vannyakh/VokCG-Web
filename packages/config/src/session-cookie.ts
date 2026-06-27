/**
 * Lightweight session-presence cookies used by the Next.js 16 Proxy for
 * optimistic auth routing. These cookies are NOT httpOnly — they are managed
 * by client-side auth stores so the Proxy can redirect unauthenticated
 * requests server-side without reading localStorage.
 *
 * Real token validation is always done server-side via the API; these cookies
 * are only a fast-path indicator of "is a session likely present?"
 */

export const SESSION_COOKIES = {
  /** Set by web-admin auth store when an admin access token is present */
  admin: "__admin_s",
  /** Set by web-user auth store when a user access token is present */
  user: "__user_s",
} as const;

/** Lifetime of the session cookie — matches a typical JWT access-token window */
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Write the session-presence cookie (browser-only, no-op on server). */
export function setSessionCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=1;path=/;max-age=${MAX_AGE_SECONDS};SameSite=Lax`;
}

/** Clear the session-presence cookie (browser-only, no-op on server). */
export function clearSessionCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
}
