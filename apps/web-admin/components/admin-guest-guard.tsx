'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { ADMIN_ROUTES } from '@vokcg/constants'
import { useAuthStore } from '@vokcg/store'

import { LoadingScreen } from '@vokcg/ui'

export function AdminGuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const clearSession = useAuthStore((s) => s.clearSession)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAuthStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated || !accessToken) return

    if (isAdmin) {
      const from = searchParams.get('from')
      const destination =
        from && from.startsWith('/') && !from.startsWith('//') ? from : ADMIN_ROUTES.overview
      router.replace(destination)
      return
    }

    clearSession()
  }, [accessToken, clearSession, hydrated, isAdmin, router, searchParams])

  if (!hydrated || (accessToken && isAdmin)) return <LoadingScreen />

  return children
}
