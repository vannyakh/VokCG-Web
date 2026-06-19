'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { ADMIN_ROUTES } from '@vokcg/constants'
import { useAuthStore } from '@vokcg/store'

import { LoadingScreen } from '@vokcg/ui'

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAuthStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (!accessToken) {
      const from = encodeURIComponent(pathname)
      router.replace(`${ADMIN_ROUTES.login}?from=${from}`)
      return
    }

    if (!isAdmin) {
      router.replace(`${ADMIN_ROUTES.login}?error=forbidden`)
    }
  }, [accessToken, hydrated, isAdmin, pathname, router])

  if (!hydrated || !accessToken || !isAdmin) return <LoadingScreen />

  return children
}
