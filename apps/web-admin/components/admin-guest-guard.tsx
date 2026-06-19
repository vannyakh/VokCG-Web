'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { ADMIN_ROUTES } from '@vokcg/constants'
import { useAdminAuthStore } from '@vokcg/store'

import { LoadingScreen } from '@vokcg/ui'

export function AdminGuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = useAdminAuthStore((s) => s.accessToken)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAdminAuthStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAdminAuthStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated || !accessToken) return

    const from = searchParams.get('from')
    const destination =
      from && from.startsWith('/') && !from.startsWith('//') ? from : ADMIN_ROUTES.overview
    router.replace(destination)
  }, [accessToken, hydrated, router, searchParams])

  if (!hydrated || accessToken) return <LoadingScreen />

  return children
}
