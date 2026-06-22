"use client"

import { motion } from 'framer-motion'
import { ChevronLeft, LayoutDashboard } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { ADMIN_NAV_ITEMS, ADMIN_TAB_META, tabFromPath } from '@vokcg/constants'
import type { AdminTab } from '@vokcg/constants'
import { NavMenu, Tooltip } from '@vokcg/ui'
import type { NavItem } from '@vokcg/ui'
import { ADMIN_SIDEBAR } from '@vokcg/config'
import { useAdminUiStore } from '@/store'

const MINI_W = ADMIN_SIDEBAR.miniWidth

type Props = {
  activeTab: AdminTab
  collapsed: boolean
  onToggle: () => void
  onTabOpen: (tab: AdminTab) => void
}

export function AdminSidebar({ activeTab, collapsed, onToggle, onTabOpen }: Props) {
  const { sidebarWidth, setSidebarWidth, sidebarMiniMode, sidebarHoverExpand } = useAdminUiStore()

  const [hovering, setHovering]       = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const isCollapsed  = sidebarMiniMode || collapsed
  const canHoverOpen = sidebarHoverExpand && isCollapsed
  const isOpen       = !isCollapsed || hovering
  const visibleWidth = isOpen ? sidebarWidth : MINI_W

  const onEnter = useCallback(() => { if (canHoverOpen) setHovering(true)  }, [canHoverOpen])
  const onLeave = useCallback(() => setHovering(false), [])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = sidebarWidth
    const onMove = (ev: MouseEvent) =>
      setSidebarWidth(
        Math.max(ADMIN_SIDEBAR.widthMin, Math.min(ADMIN_SIDEBAR.widthMax, startW + ev.clientX - startX)),
      )
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarWidth, setSidebarWidth])

  const onNavScroll = useCallback(() => {
    setNavScrolled((navRef.current?.scrollTop ?? 0) > 4)
  }, [])

  const handleSelect = useCallback((item: NavItem) => {
    if (!item.path || item.disabled || item.comingSoon) return
    const tab = tabFromPath(item.path) as AdminTab
    onTabOpen(tab)
  }, [onTabOpen])

  const activePath = ADMIN_TAB_META[activeTab]?.path ?? ''

  return (
    <div
      className="relative h-screen shrink-0 transition-[width] duration-200"
      style={{ width: isCollapsed ? MINI_W : sidebarWidth }}
    >
      <motion.aside
        initial={false}
        animate={{ width: visibleWidth }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        aria-label="Admin navigation"
        className="absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-default bg-sidebar"
        style={{ boxShadow: hovering ? '4px 0 24px rgba(0,0,0,0.12)' : undefined }}
      >
        {/* ── Brand ──────────────────────────────────────────── */}
        <div className="flex h-14 shrink-0 items-center overflow-hidden border-b border-default px-3.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)',
            }}
          >
            <LayoutDashboard size={15} className="text-accent" />
          </div>

          <div className="ml-3 min-w-0 overflow-hidden">
            <p className="whitespace-nowrap text-[13px] font-extrabold tracking-tight text-primary">
              Control Panel
            </p>
            <p className="whitespace-nowrap text-[10px] font-medium text-muted">
              VokCG Admin
            </p>
          </div>
        </div>

        {/* ── Nav ────────────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {navScrolled && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5"
              style={{ background: 'linear-gradient(to bottom, var(--bg-sidebar), transparent)' }}
            />
          )}

          <nav
            ref={navRef}
            onScroll={onNavScroll}
            className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2"
          >
            {isOpen && (
              <p className="mb-1.5 overflow-hidden whitespace-nowrap px-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted/40">
                Navigation
              </p>
            )}

            <NavMenu
              items={ADMIN_NAV_ITEMS}
              activePath={activePath}
              collapse={!isOpen}
              accordion
              rounded
              itemHeight={38}
              onSelect={handleSelect}
            />
          </nav>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6"
            style={{ background: 'linear-gradient(to top, var(--bg-sidebar), transparent)' }}
          />
        </div>

        {/* ── Footer collapse button ──────────────────────────── */}
        {!sidebarMiniMode && (
          <div className="shrink-0 border-t border-default px-2 py-2">
            <Tooltip
              content={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              placement={isCollapsed ? 'right' : 'top'}
            >
              <button
                type="button"
                onClick={() => { setHovering(false); onToggle() }}
                className="flex w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 text-muted transition-colors hover:bg-[rgba(0,0,0,0.04)] hover:text-primary dark:hover:bg-[rgba(255,255,255,0.04)]"
                style={{ height: 36 }}
              >
                <ChevronLeft
                  size={15}
                  className={[
                    'shrink-0 transition-transform duration-300',
                    isCollapsed ? 'rotate-180' : '',
                  ].join(' ')}
                />
                {isOpen && (
                  <span className="whitespace-nowrap text-[12px] font-medium">
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>
        )}

        {/* Drag-to-resize handle */}
        {!sidebarMiniMode && isOpen && (
          <div
            onMouseDown={onDragStart}
            className="absolute inset-y-0 right-0 z-40 w-1 cursor-col-resize transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
          />
        )}
      </motion.aside>
    </div>
  )
}
