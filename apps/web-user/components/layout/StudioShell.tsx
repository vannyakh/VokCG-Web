'use client'

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { useAuthMe } from '@/api'
import { STUDIO_PAGE, isFullBleedRoute } from '@vokcg/config'
import { useSidebarStore } from '@/store'
import { backdropFade, MOBILE_MEDIA_QUERY, sidebarShellSpring, useMediaQuery } from '@vokcg/ui'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const fullBleed = isFullBleedRoute(pathname)
  useAuthMe()

  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { toggleHidden } = useSidebarStore()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (!isMobile || !mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobile, mobileNavOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return

      if (e.key === 'Escape' && isMobile && mobileNavOpen) {
        setMobileNavOpen(false)
        return
      }

      if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        if (isMobile) {
          setMobileNavOpen((open) => !open)
        } else {
          toggleHidden()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobile, mobileNavOpen, toggleHidden])

  return (
    <LayoutGroup id="studio-shell">
      <div className="flex h-dvh overflow-hidden bg-canvas">
        <AnimatePresence>
          {isMobile && mobileNavOpen && (
            <motion.button
              key="mobile-nav-backdrop"
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropFade}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
        </AnimatePresence>

        <Sidebar
          activePath={pathname}
          isMobile={isMobile}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <motion.div
          layout
          transition={sidebarShellSpring}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          <Header
            pathname={pathname}
            isMobile={isMobile}
            mobileNavOpen={mobileNavOpen}
            onMenuClick={() => setMobileNavOpen((open) => !open)}
          />

          <main
            className={[
              'relative flex min-h-0 flex-1 flex-col overflow-hidden',
              fullBleed ? 'bg-surface' : 'bg-canvas',
            ].join(' ')}
          >
            <div className="relative flex h-full min-h-0 w-full flex-col">{children}</div>
          </main>
        </motion.div>
      </div>
    </LayoutGroup>
  )
}
