/**
 * Resolve the backend API origin used by axios.
 *
 * In development, Next.js rewrites proxy `/api` to the backend (see next.config.js).
 * Returning '' means all requests use the same origin.
 *
 * Override with NEXT_PUBLIC_API_BASE_URL for a remote backend.
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL
  if (configured !== undefined) {
    return configured.trim().replace(/\/$/, '')
  }
  return ''
}

export const APP_TITLE = 'VokCGStudio'
export const APP_SUBTITLE = 'AI Video Generator'

export const API_BASE_URL = resolveApiBaseUrl()
