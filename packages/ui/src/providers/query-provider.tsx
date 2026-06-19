'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { QUERY_CLIENT_DEFAULTS } from '@vokcg/config'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: QUERY_CLIENT_DEFAULTS }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
