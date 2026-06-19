'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { ADMIN_ROUTES } from '@vokcg/constants'
import { useAdminAuthStore } from '@vokcg/store'

import { LoadingScreen } from '@vokcg/ui'

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAdminAuthStore((s) => s.accessToken)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAdminAuthStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAdminAuthStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (!accessToken) {
      const from = encodeURIComponent(pathname)
      router.replace(`${ADMIN_ROUTES.login}?from=${from}`)
    }
  }, [accessToken, hydrated, pathname, router])

  if (!hydrated || !accessToken) return <LoadingScreen />

  return children
}
