import type { DefaultOptions } from '@tanstack/react-query'

function isAuthError(error: unknown): boolean {
  return error instanceof Error && /authentication required|401|unauthorized/i.test(error.message)
}

export const QUERY_CLIENT_DEFAULTS: DefaultOptions = {
  queries: {
    retry: (failureCount, error) => {
      if (isAuthError(error)) return false
      return failureCount < 1
    },
    staleTime: 10_000,
  },
}
