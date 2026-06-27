
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured !== undefined) {
    return configured.trim().replace(/\/$/, "");
  }
  return "";
}

// ── App identity ─────────────────────────────────────────────────────────────

/** Shared brand name across all apps (e.g. "VokCGStudio") */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "VokCGStudio";

/** Marketing subtitle shown on auth pages and meta tags */
export const APP_SUBTITLE =
  process.env.NEXT_PUBLIC_APP_SUBTITLE ?? "AI Video Generator";

/**
 * Per-app page title (e.g. "VokCGStudio Admin" or "VokCGStudio").
 * Falls back to APP_NAME if not set.
 */
export const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE ?? APP_NAME;

/** Role discriminator — "admin" | "user" */
export const APP_ROLE = (process.env.NEXT_PUBLIC_APP_ROLE ?? "user") as
  | "admin"
  | "user";

// ── Storage namespace ─────────────────────────────────────────────────────────

/**
 * Prefix used for localStorage keys, ensuring isolation between apps and
 * between different deployments of the same app.
 * Mirrors the vben-admin VITE_APP_NAMESPACE pattern.
 */
export const STORAGE_NAMESPACE =
  process.env.NEXT_PUBLIC_STORAGE_NAMESPACE ?? "vokcg";

// ── API ───────────────────────────────────────────────────────────────────────

export const API_BASE_URL = resolveApiBaseUrl();
