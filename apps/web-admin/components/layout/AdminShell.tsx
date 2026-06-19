'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { ADMIN_TAB_META, tabFromPath } from '@vokcg/constants'
import type { AdminTab } from '@vokcg/constants'
import { useAdminMe } from '@/api'
import { selectOpenTabs, useAdminUiStore } from '@/store'

import { PageTransitionProgress } from './PageTransitionProgress'
import { adminPageVariants } from '@vokcg/ui'
import { AdminHeader } from './AdminHeader'
import { AdminSettingsDrawer } from './AdminSettingsDrawer'
import { AdminSidebar } from './AdminSidebar'
import { AdminTabbar } from './AdminTabbar'

function AdminPageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-accent" strokeWidth={2} />
    </div>
  )
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  useAdminMe()

  const activeTab = tabFromPath(pathname)

  const {
    contentCompact,
    tabBarVisible,
    transitionProgressBar,
    transitionLoading,
    transitionAnimation,
    tabHistory,
    removedTabs,
    openTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    sortTabs,
  } = useAdminUiStore()

  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const openTabs = useMemo(
    () => selectOpenTabs(tabHistory, removedTabs, activeTab),
    [tabHistory, removedTabs, activeTab],
  )

  useEffect(() => {
    openTab(activeTab)
  }, [activeTab, openTab])

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMIN_TAB_META[activeTab].queryKey })
  }, [activeTab, queryClient])

  const handleTabClose = useCallback(
    (tab: AdminTab) => {
      closeTab(tab)
      if (tab === activeTab) {
        const idx = openTabs.indexOf(tab)
        const fallback = openTabs[idx - 1] ?? openTabs[idx + 1] ?? ('overview' as AdminTab)
        router.replace(ADMIN_TAB_META[fallback].path)
      }
    },
    [activeTab, closeTab, openTabs, router],
  )

  const handleTabClick = useCallback(
    (tab: AdminTab) => {
      openTab(tab)
      router.push(ADMIN_TAB_META[tab].path)
    },
    [openTab, router],
  )

  const handleCloseOthers = useCallback(
    (keep: AdminTab) => {
      closeOtherTabs(keep)
      if (activeTab !== keep) router.push(ADMIN_TAB_META[keep].path)
    },
    [activeTab, closeOtherTabs, router],
  )

  const handleCloseAll = useCallback(() => {
    closeAllTabs()
    if (activeTab !== 'overview') router.replace(ADMIN_TAB_META.overview.path)
  }, [activeTab, closeAllTabs, router])

  const handleSortTabs = useCallback(
    (oldIndex: number, newIndex: number) => {
      sortTabs(oldIndex, newIndex, activeTab)
    },
    [activeTab, sortTabs],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return

      if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setCollapsed((c) => !c)
      }
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        handleRefresh()
      }
      if (e.key === ',' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setSettingsOpen((s) => !s)
      }
      if (e.key === 'Escape') {
        setSettingsOpen(false)
      }
      if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        const tab = openTabs[idx]
        if (tab) {
          e.preventDefault()
          handleTabClick(tab)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleRefresh, handleTabClick, openTabs])

  const contentClass = [
    'relative z-10 flex h-full min-h-0 w-full flex-col',
    contentCompact ? 'mx-auto max-w-screen-2xl' : 'max-w-none',
  ].join(' ')

  const suspenseFallback = transitionLoading ? <AdminPageLoader /> : null

  const pageContent = <Suspense fallback={suspenseFallback}>{children}</Suspense>

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <AdminSidebar
        activeTab={activeTab}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onTabOpen={handleTabClick}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          activeTab={activeTab}
          collapsed={collapsed}
          onSidebarToggle={() => setCollapsed((c) => !c)}
          onRefresh={handleRefresh}
          onSettingsOpen={() => setSettingsOpen(true)}
        />

        {tabBarVisible && (
          <AdminTabbar
            tabs={openTabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            onSortTabs={handleSortTabs}
            onCloseOthers={handleCloseOthers}
            onCloseAll={handleCloseAll}
          />
        )}

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_70%)]"
          />
          <PageTransitionProgress activeKey={activeTab} enabled={transitionProgressBar} />

          {transitionAnimation ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                variants={adminPageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={contentClass}
              >
                {pageContent}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div key={activeTab} className={contentClass}>
              {pageContent}
            </div>
          )}
        </main>
      </div>

      <AdminSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
